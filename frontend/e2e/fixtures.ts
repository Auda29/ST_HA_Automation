/**
 * E2E Test Fixtures
 * 
 * Provides utilities and test data using pre-configured HA entities
 */

import { Page } from '@playwright/test';

export const HA_URL = process.env.HA_URL || 'http://localhost:8123';
export const HA_USERNAME = process.env.HA_USERNAME || 'testadmin';
export const HA_PASSWORD = process.env.HA_PASSWORD || 'TestHA2024!';

/**
 * Pre-configured test entities from docs/test_environment.md
 */
export const TEST_ENTITIES = {
  // Helpers
  inputBoolean: {
    testSchalter1: 'input_boolean.test_schalter_1',
    testSchalter2: 'input_boolean.test_schalter_2',
    gastmodus: 'input_boolean.gastmodus',
    nachtmodus: 'input_boolean.nachtmodus',
    urlaubsmodus: 'input_boolean.urlaubsmodus',
  },
  inputNumber: {
    helligkeitsstufe: 'input_number.helligkeitsstufe',
    lautstaerke: 'input_number.lautstaerke',
    zielTemperatur: 'input_number.ziel_temperatur',
  },
  inputText: {
    benachrichtigung: 'input_text.benachrichtigung',
    benutzerNotiz: 'input_text.benutzer_notiz',
  },
  inputSelect: {
    hausmodus: 'input_select.hausmodus',
    klimamodus: 'input_select.klimamodus',
    lichtszene: 'input_select.lichtszene',
  },
  // Lights
  light: {
    wohnzimmerDeckenlampe: 'light.wohnzimmer_deckenlampe',
  },
  // Switches
  switch: {
    steckdoseKueche: 'switch.steckdose_kueche',
    steckdoseWohnzimmer: 'switch.steckdose_wohnzimmer',
  },
  // Scenes
  scene: {
    allesAus: 'scene.alles_aus',
    gemuetlich: 'scene.gemuetlich',
    kino: 'scene.kino',
    party: 'scene.party',
  },
} as const;

/**
 * Authenticate with Home Assistant and return auth token
 */
export async function authenticateHA(page: Page): Promise<string> {
  const response = await page.request.post(`${HA_URL}/api/auth/login_flow`, {
    data: {
      client_id: 'http://localhost:8123/',
      handler: ['homeassistant', null],
      redirect_uri: 'http://localhost:8123/',
    },
  });

  const flow = await response.json();
  const flowId = flow.flow_id;

  // Complete the login flow
  const authResponse = await page.request.post(
    `${HA_URL}/api/auth/login_flow/${flowId}`,
    {
      data: {
        username: HA_USERNAME,
        password: HA_PASSWORD,
      },
    }
  );

  const auth = await authResponse.json();
  return auth.access_token;
}

/**
 * Get entity state from HA
 */
export async function getEntityState(
  page: Page,
  entityId: string,
  authToken: string
): Promise<any> {
  const response = await page.request.get(
    `${HA_URL}/api/states/${entityId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
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
  authToken: string
): Promise<void> {
  await page.request.post(
    `${HA_URL}/api/states/${entityId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        state,
        attributes,
      },
    }
  );
}

/**
 * Wait for entity state to change
 */
export async function waitForEntityState(
  page: Page,
  entityId: string,
  expectedState: string,
  authToken: string,
  timeout = 10000
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
    `Entity ${entityId} did not reach state ${expectedState} within ${timeout}ms`
  );
}
