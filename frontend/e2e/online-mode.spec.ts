import { test, expect } from "@playwright/test";
import {
  authenticateHA,
  callService,
  navigateToSTPanel,
  replaceEditorCode,
  TEST_ENTITIES,
} from "./fixtures";

test("shows an updated live value when a bound entity changes", async ({ page }) => {
  const authToken = await authenticateHA(page);
  await navigateToSTPanel(page);
  const entityId = TEST_ENTITIES.inputBoolean.testSchalter2;

  await replaceEditorCode(page, `
PROGRAM OnlineTest
VAR
    signal AT %I* : BOOL := '${entityId}';
END_VAR
END_PROGRAM
  `.trim());

  await callService(page, "input_boolean", "turn_off", { entity_id: entityId }, authToken);
  const toolbar = page.locator("st-online-toolbar");
  await toolbar.getByRole("button", { name: "Connect", exact: true }).click();

  const value = page.locator(`.st-live-value[title^="${entityId}"]`);
  await expect(value).toHaveClass(/st-live-value--bool-false/);
  await callService(page, "input_boolean", "turn_on", { entity_id: entityId }, authToken);
  await expect(value).toHaveClass(/st-live-value--bool-true/);

  await toolbar.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(value).toHaveCount(0);
  await callService(page, "input_boolean", "turn_off", { entity_id: entityId }, authToken);
});

test("filters real entities and inserts a binding into the active file", async ({ page }) => {
  await navigateToSTPanel(page);
  await replaceEditorCode(page, "PROGRAM BindingTest\nVAR\nEND_VAR\nEND_PROGRAM");
  const entityId = TEST_ENTITIES.inputBoolean.testSchalter2;
  const toggle = page.getByRole("button", { name: "Toggle entity browser", exact: true });
  await toggle.click();

  const browser = page.locator("st-entity-browser");
  const search = browser.getByRole("textbox", { name: "Search entities" });
  await expect(search).toBeFocused();
  await search.fill(entityId);
  const row = browser.locator("st-entity-item").filter({ hasText: entityId });
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: /insert input binding/i }).click();

  const editor = page.locator(".cm-content");
  await expect(editor).toContainText(`AT %I* : BOOL := '${entityId}';`);
  await expect(page.getByText("Syntax OK", { exact: true })).toBeVisible();
  await search.press("Escape");
  await expect(browser).toHaveCount(0);
  await expect(toggle).toBeFocused();
});
