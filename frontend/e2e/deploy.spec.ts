/**
 * E2E Test: Deploy Workflow
 *
 * Tests the complete workflow: Write ST program → Parse → Analyze → Transpile → Deploy
 * Also tests rollback on deploy failure.
 */

import { test, expect } from "@playwright/test";
import {
  authenticateHA,
  deleteAutomationConfig,
  deleteScriptConfig,
  getAutomationConfig,
  getEntityState,
  getScriptConfig,
  navigateToSTPanel,
  replaceEditorCode,
} from "./fixtures";

// The panel transpiles with project name "home", so the generated ids are
// st_home_<program> and st_home_<program>_logic.
const AUTOMATION_ID = "st_home_testprogram";
const SCRIPT_ID = "st_home_testprogram_logic";
const PERSISTENT_HELPER_ID =
  "input_number.st_home_persistentprogram_counter";
const FOREIGN_HELPER_ID =
  "input_number.st_home_foreignprogram_counter";

test.describe("Deploy Workflow", () => {
  test("should parse, analyze, transpile, and deploy a simple ST program", async ({
    page,
  }) => {
    const authToken = await authenticateHA(page);

    // Navigate to ST panel (handles login automatically)
    await navigateToSTPanel(page);

    const stCode = `
PROGRAM TestProgram
VAR
    light1 AT %I* : BOOL := 'input_boolean.test_schalter_1';
    light2 AT %Q* : BOOL := 'switch.steckdose_wohnzimmer';
END_VAR

light2 := light1;
END_PROGRAM
    `.trim();

    await replaceEditorCode(page, stCode);

    // Check that syntax is valid (no errors shown)
    const syntaxStatus = page.locator("text=/Syntax OK/i");
    await expect(syntaxStatus.first()).toBeVisible({ timeout: 5000 });

    // Check that triggers were generated
    const triggersSection = page.locator("text=/Trigger/i");
    await expect(triggersSection.first()).toBeVisible({ timeout: 5000 });

    await page.locator('button:has-text("Deploy")').first().click();

    // The panel must report success - not merely "not crash".
    await expect(page.locator("text=/Deploy successful/i").first()).toBeVisible({
      timeout: 30000,
    });

    // And Home Assistant must actually hold the generated config afterwards.
    // Asserting this via REST is the point of the test: a deploy that silently
    // rolls back still leaves a rendered panel behind, but leaves HA empty.
    const automation = await getAutomationConfig(page, AUTOMATION_ID, authToken);
    expect(automation, `automation ${AUTOMATION_ID} was not created`).not.toBeNull();
    expect(automation.alias).toBe("[ST] TestProgram");

    // Home Assistant modernises the schema on save: the `trigger` / `action`
    // keys we post come back as `triggers` / `actions` (and `service:` inside an
    // action as `action:`). Both spellings are accepted on write, so the test
    // tolerates either rather than pinning one HA version.
    const triggers = automation.triggers ?? automation.trigger;
    expect(triggers?.length ?? 0).toBeGreaterThan(0);

    const script = await getScriptConfig(page, SCRIPT_ID, authToken);
    expect(script, `script ${SCRIPT_ID} was not created`).not.toBeNull();
    expect(script.sequence.length).toBeGreaterThan(0);
  });

  test("should deploy a persistent helper without touching another program", async ({
    page,
  }) => {
    const authToken = await authenticateHA(page);
    await navigateToSTPanel(page);

    const stCode = `
PROGRAM PersistentProgram
VAR
    trigger_var AT %I* : BOOL := 'input_boolean.test_switch_2';
    {persistent}
    counter : INT := 0;
END_VAR

IF trigger_var THEN
    counter := counter + 1;
END_IF
END_PROGRAM
    `.trim();

    await replaceEditorCode(page, stCode);
    await page.locator('button:has-text("Deploy")').first().click();

    await expect(page.locator("text=/Deploy successful/i").first()).toBeVisible({
      timeout: 30000,
    });

    const helper = await getEntityState(page, PERSISTENT_HELPER_ID, authToken);
    expect(helper.entity_id).toBe(PERSISTENT_HELPER_ID);
    expect(helper.attributes.friendly_name).toBe(
      "ST PersistentProgram - counter",
    );

    const foreignHelper = await getEntityState(
      page,
      FOREIGN_HELPER_ID,
      authToken,
    );
    expect(foreignHelper.entity_id).toBe(FOREIGN_HELPER_ID);
    expect(foreignHelper.state).toBe("42.0");
  });

  test("should show syntax status in editor", async ({ page }) => {
    // Navigate to ST panel (handles login automatically)
    await navigateToSTPanel(page);

    // This test verifies the editor shows syntax validation status
    // The status bar should always be visible with some indication

    // Check that the status bar area exists and shows syntax information
    const syntaxIndicator = page.locator("text=/Syntax/i");
    await expect(syntaxIndicator.first()).toBeVisible({ timeout: 5000 });

    // Verify the editor shows some code analysis info (triggers, entities, etc.)
    const analysisInfo = page.locator("text=/Trigger|Entit|Mode/i");
    await expect(analysisInfo.first()).toBeVisible({ timeout: 5000 });
  });

  test("should roll back an automation when a later deploy step fails", async ({
    page,
  }) => {
    const authToken = await authenticateHA(page);
    const automationId = "st_home_rollbackprobe";
    const scriptId = `${automationId}_logic`;

    await deleteAutomationConfig(page, automationId, authToken);
    await deleteScriptConfig(page, scriptId, authToken);
    await navigateToSTPanel(page);

    const stCode = `
PROGRAM RollbackProbe
VAR
    trigger_var AT %I* : BOOL := 'input_boolean.test_switch_2';
    output_var AT %Q* : BOOL := 'switch.steckdose_wohnzimmer';
END_VAR

output_var := trigger_var;
END_PROGRAM
    `.trim();

    await replaceEditorCode(page, stCode);

    await page.route(`**/api/config/script/config/${scriptId}`, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "forced script failure" }),
        });
        return;
      }
      await route.continue();
    });

    await page.locator('button:has-text("Deploy")').first().click();
    await expect(page.locator("text=/forced script failure/i").first()).toBeVisible({
      timeout: 30000,
    });

    expect(
      await getAutomationConfig(page, automationId, authToken),
      "automation created before the forced script failure must be removed",
    ).toBeNull();
  });
});
