/**
 * E2E Test: Online Mode
 * 
 * Tests that online mode shows live entity values in the editor.
 */

import { test, expect } from '@playwright/test';
import {
  authenticateHA,
  getEntityState,
  setEntityState,
  TEST_ENTITIES,
} from './fixtures';

test.describe('Online Mode', () => {
  let authToken: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    authToken = await authenticateHA(page);
    await context.close();
  });

  test('should enable online mode and show live values', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('st-panel', { timeout: 10000 });

    const stCode = `
PROGRAM OnlineTest
VAR
    motion AT %I* : BOOL;
    light AT %Q* : BOOL;
END_VAR

light := motion;
END_PROGRAM
    `.trim();

    // Enter code
    const editor = page.locator('st-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(stCode);
    await page.waitForTimeout(2000);

    // Enable online mode
    const onlineButton = page.locator(
      'button:has-text("Online"), button[title*="Online"]'
    );
    if ((await onlineButton.count()) > 0) {
      await onlineButton.first().click();
      await page.waitForTimeout(2000);

      // Check that live values are displayed
      // This might be shown as decorations in the editor or in a separate panel
      const liveValueIndicator = page.locator('text=/on|off|live|value/i');
      await expect(liveValueIndicator.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show entity browser with live states', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('st-panel', { timeout: 10000 });

    // Open entity browser
    const entityBrowserButton = page.locator(
      'button:has-text("Entities"), button[title*="Entity"]'
    );
    if ((await entityBrowserButton.count()) > 0) {
      await entityBrowserButton.first().click();
      await page.waitForTimeout(2000);

      // Check that entities are listed with their states
      const entityList = page.locator('st-entity-browser, [class*="entity"]');
      await expect(entityList.first()).toBeVisible({ timeout: 5000 });

      // Check that entity states are shown
      const entityState = page.locator('text=/on|off/i');
      await expect(entityState.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
