import { test, expect } from "@playwright/test";
import { navigateToSTPanel, replaceEditorCode } from "./fixtures";

test("keeps edited files separate when switching tabs and reloading", async ({ page }) => {
  await navigateToSTPanel(page);
  const tabs = page.getByRole("tab");
  const firstProgram = "PROGRAM FirstWorkspaceFile\nVAR\nEND_VAR\nEND_PROGRAM";
  const secondProgram = "PROGRAM SecondWorkspaceFile\nVAR\nEND_VAR\nEND_PROGRAM";
  const editor = page.locator(".cm-content");

  await expect(tabs).toHaveCount(1);
  await replaceEditorCode(page, firstProgram);
  await page.getByRole("button", { name: "New File", exact: true }).click();
  await expect(tabs).toHaveCount(2);
  await replaceEditorCode(page, secondProgram);
  await tabs.first().click();
  await expect(editor).toContainText("FirstWorkspaceFile");
  await tabs.last().click();
  await expect(editor).toContainText("SecondWorkspaceFile");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(editor).toContainText("SecondWorkspaceFile");
});

test("keeps editor actions reachable on a phone-sized viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigateToSTPanel(page);
  await expect(page.locator(".cm-editor")).toBeInViewport({ ratio: 0.8 });
  await expect(page.getByRole("button", { name: "New File", exact: true })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Online settings", exact: true })).toBeInViewport();

  await page.getByRole("button", { name: "Open Home Assistant menu", exact: true }).click();
  await expect(page.locator("ha-sidebar").getByText("Overview", { exact: true })).toBeInViewport();
});
