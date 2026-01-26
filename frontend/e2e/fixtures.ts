/**
 * E2E Test Fixtures
 *
 * Provides utilities and test data using pre-configured HA entities
 */

import { Page } from "@playwright/test";

export const HA_URL = process.env.HA_URL || "http://localhost:8123";
export const HA_USERNAME = process.env.HA_USERNAME || "testadmin";
export const HA_PASSWORD = process.env.HA_PASSWORD || "TestHA2024!";
export const ST_PANEL_URL = "/st-hass";

/**
 * Pre-configured test entities from docs/test_environment.md
 */
export const TEST_ENTITIES = {
  // Helpers
  inputBoolean: {
    testSchalter1: "input_boolean.test_schalter_1",
    testSchalter2: "input_boolean.test_schalter_2",
    gastmodus: "input_boolean.gastmodus",
    nachtmodus: "input_boolean.nachtmodus",
    urlaubsmodus: "input_boolean.urlaubsmodus",
  },
  inputNumber: {
    helligkeitsstufe: "input_number.helligkeitsstufe",
    lautstaerke: "input_number.lautstaerke",
    zielTemperatur: "input_number.ziel_temperatur",
  },
  inputText: {
    benachrichtigung: "input_text.benachrichtigung",
    benutzerNotiz: "input_text.benutzer_notiz",
  },
  inputSelect: {
    hausmodus: "input_select.hausmodus",
    klimamodus: "input_select.klimamodus",
    lichtszene: "input_select.lichtszene",
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
  await page.goto(HA_URL);

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

  // Wait for login to complete (dashboard or any authenticated page)
  await page.waitForURL(/.*(?<!auth\/authorize).*$/, { timeout: 15000 });

  // Wait a bit for the page to fully load
  await page.waitForTimeout(2000);
}

/**
 * Navigate to the ST Editor panel and ensure it's loaded
 */
export async function navigateToSTPanel(page: Page): Promise<void> {
  // First ensure we're logged in
  await loginViaBrowser(page);

  // Navigate to ST panel
  await page.goto(`${HA_URL}${ST_PANEL_URL}`);

  // Wait for the st-panel custom element to be present and loaded
  await page.waitForSelector("st-panel", { timeout: 15000 });

  // Additional wait for the editor to initialize
  await page.waitForTimeout(1000);
}
