/**
 * E2E Test Fixtures
 *
 * Provides utilities and test data using pre-configured HA entities
 */

import { expect, Page } from "@playwright/test";

export const HA_URL = process.env.HA_URL || "http://127.0.0.1:8123";
export const HA_USERNAME = process.env.HA_USERNAME || "testadmin";
export const HA_PASSWORD = process.env.HA_PASSWORD || "TestHA2024!";
export const ST_PANEL_URL = "/st-hass";

/**
 * Pre-configured test entities from docs/test_environment.md
 */
export const TEST_ENTITIES = {
  // Helpers
  inputBoolean: {
    testSchalter1: "input_boolean.test_switch_1",
    testSchalter2: "input_boolean.test_switch_2",
    gastmodus: "input_boolean.guest_mode",
    nachtmodus: "input_boolean.night_mode",
    urlaubsmodus: "input_boolean.vacation_mode",
  },
  inputNumber: {
    helligkeitsstufe: "input_number.brightness_level",
    lautstaerke: "input_number.volume_level",
    zielTemperatur: "input_number.target_temperature",
  },
  inputText: {
    benachrichtigung: "input_text.notification_message",
    benutzerNotiz: "input_text.user_note",
  },
  inputSelect: {
    hausmodus: "input_select.house_mode",
    klimamodus: "input_select.hvac_mode",
    lichtszene: "input_select.light_scene",
  },
  // Lights
  light: {
    wohnzimmerDeckenlampe: "light.wohnzimmer_deckenlampe",
  },
  // Switches
  switch: {
    steckdoseKueche: "switch.steckdose_kueche",
    steckdoseWohnzimmer: "switch.steckdose_wohnzimmer",
  },
  // Scenes
  scene: {
    allesAus: "scene.alles_aus",
    gemuetlich: "scene.gemuetlich",
    kino: "scene.kino",
    party: "scene.party",
  },
} as const;

/**
 * Authenticate with Home Assistant and return auth token
 *
 * Uses Home Assistant's auth flow API to obtain a long-lived access token.
 * The flow is:
 * 1. Start login flow at /auth/login_flow
 * 2. Submit credentials to complete the flow
 * 3. Exchange the auth code for an access token
 */
export async function authenticateHA(page: Page): Promise<string> {
  // Step 1: Start the login flow
  const flowResponse = await page.request.post(`${HA_URL}/auth/login_flow`, {
    data: {
      client_id: `${HA_URL}/`,
      handler: ["homeassistant", null],
      redirect_uri: `${HA_URL}/`,
    },
  });

  if (!flowResponse.ok()) {
    throw new Error(`Failed to start login flow: ${flowResponse.status()}`);
  }

  const flow = await flowResponse.json();
  const flowId = flow.flow_id;

  // Step 2: Complete the login flow with credentials
  const authResponse = await page.request.post(
    `${HA_URL}/auth/login_flow/${flowId}`,
    {
      data: {
        client_id: `${HA_URL}/`,
        username: HA_USERNAME,
        password: HA_PASSWORD,
      },
    },
  );

  if (!authResponse.ok()) {
    throw new Error(`Failed to authenticate: ${authResponse.status()}`);
  }

  const authResult = await authResponse.json();

  // The result contains a code that needs to be exchanged for a token
  if (authResult.type === "create_entry" && authResult.result) {
    const code = authResult.result;

    // Step 3: Exchange code for access token
    const tokenResponse = await page.request.post(`${HA_URL}/auth/token`, {
      form: {
        grant_type: "authorization_code",
        code: code,
        client_id: `${HA_URL}/`,
      },
    });

    if (!tokenResponse.ok()) {
      throw new Error(`Failed to get token: ${tokenResponse.status()}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  }

  throw new Error(`Unexpected auth result: ${JSON.stringify(authResult)}`);
}

/**
 * Get entity state from HA
 */
export async function getEntityState(
  page: Page,
  entityId: string,
  authToken: string,
): Promise<any> {
  const response = await page.request.get(`${HA_URL}/api/states/${entityId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.json();
}

/**
 * Set entity state in HA
 */
export async function setEntityState(
  page: Page,
  entityId: string,
  state: string,
  attributes: Record<string, any> = {},
  authToken: string,
): Promise<void> {
  await page.request.post(`${HA_URL}/api/states/${entityId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    data: {
      state,
      attributes,
    },
  });
}

/**
 * Call a Home Assistant service through its REST API.
 */
export async function callService(
  page: Page,
  domain: string,
  service: string,
  data: Record<string, unknown>,
  authToken: string,
): Promise<void> {
  const response = await page.request.post(
    `${HA_URL}/api/services/${domain}/${service}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data,
    },
  );

  if (!response.ok()) {
    throw new Error(
      `Service ${domain}.${service} failed: ${response.status()} ${await response.text()}`,
    );
  }
}

export async function deleteAutomationConfig(
  page: Page,
  automationId: string,
  authToken: string,
): Promise<void> {
  await page.request.delete(
    `${HA_URL}/api/config/automation/config/${automationId}`,
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
}

export async function deleteScriptConfig(
  page: Page,
  scriptId: string,
  authToken: string,
): Promise<void> {
  await page.request.delete(`${HA_URL}/api/config/script/config/${scriptId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
}

/**
 * Read an automation config back from Home Assistant.
 *
 * This is the REST endpoint the deploy system writes to. Reading it is the only
 * way to prove a deploy actually landed - a green panel message is not enough.
 * Returns null when HA has no config stored under that id.
 */
export async function getAutomationConfig(
  page: Page,
  automationId: string,
  authToken: string,
): Promise<any | null> {
  const response = await page.request.get(
    `${HA_URL}/api/config/automation/config/${automationId}`,
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
  if (!response.ok()) {
    return null;
  }
  return response.json();
}

/**
 * Read a script config back from Home Assistant.
 */
export async function getScriptConfig(
  page: Page,
  scriptId: string,
  authToken: string,
): Promise<any | null> {
  const response = await page.request.get(
    `${HA_URL}/api/config/script/config/${scriptId}`,
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
  if (!response.ok()) {
    return null;
  }
  return response.json();
}

/**
 * Wait for entity state to change
 */
export async function waitForEntityState(
  page: Page,
  entityId: string,
  expectedState: string,
  authToken: string,
  timeout = 10000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const state = await getEntityState(page, entityId, authToken);
    if (state.state === expectedState) {
      return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(
    `Entity ${entityId} did not reach state ${expectedState} within ${timeout}ms`,
  );
}

/**
 * Login to Home Assistant via browser UI
 *
 * This is needed for E2E tests that interact with the UI,
 * as the API token authentication doesn't create a browser session.
 */
export async function loginViaBrowser(page: Page): Promise<void> {
  // Navigate to HA root (will redirect to login if not authenticated)
  await page.goto(HA_URL, { waitUntil: "domcontentloaded" });

  // Wait for the login form to appear
  const usernameInput = page.getByRole("textbox", { name: /username/i });

  // Check if we're already logged in (no login form)
  try {
    await usernameInput.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    // Already logged in, no action needed
    return;
  }

  // Fill in credentials and submit
  await usernameInput.fill(HA_USERNAME);
  await page.getByRole("textbox", { name: /password/i }).fill(HA_PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();

  // Wait for login to complete and the app shell to become interactive.
  await page.waitForFunction(
    () => !window.location.pathname.includes("/auth/"),
    undefined,
    { timeout: 20000 },
  );
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("home-assistant")).toHaveCount(1, {
    timeout: 20000,
  });
}

/**
 * Navigate to the ST Editor panel and ensure it's loaded
 */
export async function navigateToSTPanel(page: Page): Promise<void> {
  // First ensure we're logged in
  await loginViaBrowser(page);

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${HA_URL}${ST_PANEL_URL}`, {
        waitUntil: "domcontentloaded",
      });

      await page.waitForFunction(
        () =>
          !!customElements.get("st-panel") ||
          !!document.querySelector("st-panel"),
        undefined,
        { timeout: 10000 },
      );

      await expect(page.locator("st-panel")).toHaveCount(1, { timeout: 20000 });
      await expect(page.locator('button:has-text("Deploy")').first()).toBeVisible({
        timeout: 20000,
      });
      await expect(page.locator("text=/Syntax/i").first()).toBeVisible({
        timeout: 20000,
      });
      return;
    } catch (error) {
      lastError = error;
      await page.goto(HA_URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000 * attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to load ST panel");
}

/**
 * Replace the current editor content with a new ST program and wait for analysis.
 */
export async function replaceEditorCode(page: Page, code: string): Promise<void> {
  // Target the CodeMirror surface directly. The previous version clicked the
  // panel at a fixed offset (160/160), which lands on the project sidebar rather
  // than the editor - the keystrokes went nowhere, the editor kept the built-in
  // Kitchen_Light example, and the "Syntax OK" check below still passed because
  // that default program is valid. Every test that "writes an ST program" was in
  // fact exercising the default one.
  const editor = page.locator(".cm-content").first();
  await editor.waitFor({ state: "visible", timeout: 20000 });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(code);

  // Prove the replacement actually landed before anything relies on it.
  const programName = /PROGRAM\s+([A-Za-z_]\w*)/.exec(code)?.[1];
  if (programName) {
    await expect(editor).toContainText(programName, { timeout: 15000 });
  }

  // Wait for the panel to show that parsing/analysis settled on the new code.
  await expect(page.locator("text=/Syntax OK/i").first()).toBeVisible({
    timeout: 15000,
  });
}
