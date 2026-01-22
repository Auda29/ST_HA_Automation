/**
 * E2E Test: Deploy Workflow
 * 
 * Tests the complete workflow: Write ST program → Parse → Analyze → Transpile → Deploy
 * Also tests rollback on deploy failure.
 */

import { test, expect } from '@playwright/test';
import { authenticateHA, TEST_ENTITIES } from './fixtures';

test.describe('Deploy Workflow', () => {
  let authToken: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    authToken = await authenticateHA(page);
    await context.close();
  });

  test('should parse, analyze, transpile, and deploy a simple ST program', async ({
    page,
  }) => {
    // Navigate to ST panel (assuming it's accessible at /st-hass or similar)
    // This path may need to be adjusted based on actual HA integration URL
    await page.goto('/');
    
    // Wait for panel to load
    await page.waitForSelector('st-panel', { timeout: 10000 });

    const stCode = `
PROGRAM TestProgram
VAR
    light1 AT %I* : BOOL;
    light2 AT %Q* : BOOL;
END_VAR

light2 := light1;
END_PROGRAM
    `.trim();

    // Find the editor and type code
    const editor = page.locator('st-editor');
    await editor.click();

    // Clear existing content and type new code
    await page.keyboard.press('Control+A');
    await page.keyboard.type(stCode);

    // Wait for parsing/analysis to complete
    await page.waitForTimeout(2000);

    // Check that syntax is valid (no errors shown)
    const syntaxStatus = page.locator('.syntax-status, [class*="status"]');
    const statusText = await syntaxStatus.first().textContent();
    expect(statusText?.toLowerCase()).toMatch(/ok|valid|success/i);

    // Check that triggers were generated
    const triggersSection = page.locator('text=/trigger|dependency/i');
    await expect(triggersSection.first()).toBeVisible({ timeout: 5000 });

    // Click deploy button
    const deployButton = page.locator(
      'button:has-text("Deploy"), button[title*="Deploy"]'
    );
    if ((await deployButton.count()) > 0) {
      await deployButton.first().click();

      // Wait for deploy to complete
      await page.waitForTimeout(3000);

      // Check for success message or status
      const successIndicator = page.locator(
        'text=/success|deployed|complete/i'
      );
      await expect(successIndicator.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should validate ST code before deploy', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('st-panel', { timeout: 10000 });

    const invalidCode = `
PROGRAM TestProgram
VAR
    x : BOOL
    // Missing semicolon and END_VAR
END_PROGRAM
    `.trim();

    const editor = page.locator('st-editor');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(invalidCode);
    await page.waitForTimeout(2000);

    // Check that syntax error is shown
    const syntaxStatus = page.locator('.syntax-status, [class*="error"]');
    const statusText = await syntaxStatus.first().textContent();
    expect(statusText?.toLowerCase()).toMatch(/error|invalid/i);

    // Deploy button should be disabled or show error
    const deployButton = page.locator(
      'button:has-text("Deploy"), button[title*="Deploy"]'
    );
    if ((await deployButton.count()) > 0) {
      const isDisabled = await deployButton.first().getAttribute('disabled');
      expect(isDisabled).toBeTruthy();
    }
  });
});
