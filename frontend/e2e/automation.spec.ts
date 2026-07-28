/**
 * E2E Test: Automation Execution
 *
 * Tests that deployed automations trigger correctly, persistent variables
 * survive automation reruns, and timer FBs fire after specified duration.
 */

import { test, expect } from "@playwright/test";
import {
  authenticateHA,
  callService,
  getEntityState,
  navigateToSTPanel,
  replaceEditorCode,
  TEST_ENTITIES,
  waitForEntityState,
} from "./fixtures";

async function deployCurrentProgram(page: import("@playwright/test").Page): Promise<void> {
  await page.locator('button:has-text("Deploy")').first().click();
  await expect(page.locator("text=/Deploy successful/i").first()).toBeVisible({
    timeout: 30000,
  });
}

test.describe("Automation Execution", () => {
  test("should trigger automation on entity state change", async ({ page }) => {
    const authToken = await authenticateHA(page);
    await navigateToSTPanel(page);

    // Keep trigger and output independent: the template switch is backed by
    // test_switch_1, so test_switch_2 drives the generated automation.
    const inputEntity = TEST_ENTITIES.inputBoolean.testSchalter2;
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

    await replaceEditorCode(page, stCode);
    await deployCurrentProgram(page);

    await callService(
      page,
      "input_boolean",
      "turn_off",
      { entity_id: inputEntity },
      authToken,
    );
    await callService(
      page,
      "switch",
      "turn_off",
      { entity_id: outputEntity },
      authToken,
    );
    await waitForEntityState(page, outputEntity, "off", authToken);

    await callService(
      page,
      "input_boolean",
      "turn_on",
      { entity_id: inputEntity },
      authToken,
    );
    await waitForEntityState(page, outputEntity, "on", authToken);

    await callService(
      page,
      "input_boolean",
      "turn_off",
      { entity_id: inputEntity },
      authToken,
    );
    await waitForEntityState(page, outputEntity, "off", authToken);
  });

  test("should maintain persistent variable across automation reruns", async ({
    page,
  }) => {
    const authToken = await authenticateHA(page);
    await navigateToSTPanel(page);

    const triggerEntity = TEST_ENTITIES.inputBoolean.testSchalter2;
    const helperEntity = "input_number.st_home_counter_count";

    const stCode = `
PROGRAM Counter
VAR
    {trigger}
    trigger_var AT %I* : BOOL := '${triggerEntity}';
    {persistent}
    count : INT := 0;
END_VAR

IF trigger_var THEN
    count := count + 1;
END_IF
END_PROGRAM
    `.trim();

    await replaceEditorCode(page, stCode);
    await deployCurrentProgram(page);

    await callService(
      page,
      "input_number",
      "set_value",
      { entity_id: helperEntity, value: 0 },
      authToken,
    );
    await callService(
      page,
      "input_boolean",
      "turn_off",
      { entity_id: triggerEntity },
      authToken,
    );

    for (const expectedValue of [1, 2]) {
      await callService(
        page,
        "input_boolean",
        "turn_on",
        { entity_id: triggerEntity },
        authToken,
      );
      await expect
        .poll(
          async () =>
            Number((await getEntityState(page, helperEntity, authToken)).state),
          { timeout: 15000 },
        )
        .toBe(expectedValue);
      await callService(
        page,
        "input_boolean",
        "turn_off",
        { entity_id: triggerEntity },
        authToken,
      );
    }
  });

  test("should generate timer FB with correct duration", async ({ page }) => {
    const authToken = await authenticateHA(page);
    await navigateToSTPanel(page);

    const triggerEntity = TEST_ENTITIES.inputBoolean.testSchalter2;
    const timerEntity = "timer.st_home_timertest_timer1";
    const outputHelperEntity = "input_boolean.st_home_timertest_timer1_q";

    const stCode = `
PROGRAM TimerTest
VAR
    {trigger}
    start AT %I* : BOOL := '${triggerEntity}';
    output AT %Q* : BOOL := 'switch.steckdose_wohnzimmer';
    timer1 : TON;
END_VAR

timer1(IN := start, PT := T#2s);
output := timer1.Q;
END_PROGRAM
    `.trim();

    await replaceEditorCode(page, stCode);
    await deployCurrentProgram(page);

    await callService(
      page,
      "input_boolean",
      "turn_off",
      { entity_id: triggerEntity },
      authToken,
    );
    await callService(
      page,
      "input_boolean",
      "turn_off",
      { entity_id: outputHelperEntity },
      authToken,
    );
    await callService(
      page,
      "timer",
      "cancel",
      { entity_id: timerEntity },
      authToken,
    );

    await callService(
      page,
      "input_boolean",
      "turn_on",
      { entity_id: triggerEntity },
      authToken,
    );

    await waitForEntityState(page, timerEntity, "active", authToken);
    expect((await getEntityState(page, outputHelperEntity, authToken)).state).toBe(
      "off",
    );
    await waitForEntityState(
      page,
      outputHelperEntity,
      "on",
      authToken,
      15000,
    );
  });
});
