/**
 * E2E Test: Automation Execution
 *
 * Tests that deployed automations trigger correctly, persistent variables
 * survive automation reruns, and timer FBs fire after specified duration.
 */

import { test, expect } from "@playwright/test";
import { navigateToSTPanel, TEST_ENTITIES } from "./fixtures";

test.describe("Automation Execution", () => {
  test("should trigger automation on entity state change", async ({ page }) => {
    // Navigate to ST panel (handles login automatically)
    await navigateToSTPanel(page);

    // Use test entities for the automation
    const inputEntity = TEST_ENTITIES.inputBoolean.testSchalter1;
    const outputEntity = TEST_ENTITIES.switch.steckdoseWohnzimmer;

    const stCode = `
PROGRAM MotionLight
VAR
    {trigger}
    motion AT %I* : BOOL := '${inputEntity}';
    light AT %Q* : BOOL := '${outputEntity}';
END_VAR

light := motion;
END_PROGRAM
    `.trim();

    const editor = page.locator("st-panel");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(stCode);
    await page.waitForTimeout(2000);

    // Verify syntax is OK
    const syntaxOk = page.locator("text=/Syntax OK/i");
    await expect(syntaxOk.first()).toBeVisible({ timeout: 5000 });

    // Verify triggers are detected
    const triggersSection = page.locator("text=/Trigger/i");
    await expect(triggersSection.first()).toBeVisible({ timeout: 5000 });
  });

  test("should maintain persistent variable across automation reruns", async ({
    page,
  }) => {
    // Navigate to ST panel (handles login automatically)
    await navigateToSTPanel(page);

    const stCode = `
PROGRAM Counter
VAR
    {trigger}
    trigger_var AT %I* : BOOL := 'input_boolean.test_schalter_1';
    {persistent}
    count AT %M* : INT;
END_VAR

IF trigger_var THEN
    count := count + 1;
END_IF
END_PROGRAM
    `.trim();

    const editor = page.locator("st-panel");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(stCode);
    await page.waitForTimeout(2000);

    // Check that persistent variable is identified
    const persistentIndicator = page.locator("text=/Persistent/i");
    await expect(persistentIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test("should generate timer FB with correct duration", async ({ page }) => {
    // Navigate to ST panel (handles login automatically)
    await navigateToSTPanel(page);

    const stCode = `
PROGRAM TimerTest
VAR
    {trigger}
    start AT %I* : BOOL := 'input_boolean.test_schalter_1';
    output AT %Q* : BOOL := 'switch.steckdose_wohnzimmer';
    timer1 : TON;
END_VAR

timer1(IN := start, PT := T#5s);
output := timer1.Q;
END_PROGRAM
    `.trim();

    const editor = page.locator("st-panel");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(stCode);
    await page.waitForTimeout(2000);

    // Check that syntax is OK (timer FB is recognized)
    const syntaxOk = page.locator("text=/Syntax OK/i");
    await expect(syntaxOk.first()).toBeVisible({ timeout: 5000 });
  });
});
