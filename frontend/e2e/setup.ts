/**
 * Global setup for E2E tests
 *
 * Ensures Home Assistant Docker container is running and the ST panel assets
 * are actually registered before browser tests start.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HA_URL = process.env.HA_URL || "http://localhost:8123";
const PANEL_BUNDLE_URL = `${HA_URL}/st_hass/frontend/st-panel.js`;

async function checkHAHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${HA_URL}/api/`);
    // 401 Unauthorized means HA is running but requires auth - that's OK
    return response.ok || response.status === 401;
  } catch {
    return false;
  }
}

async function checkSTPanelReady(): Promise<boolean> {
  try {
    const response = await fetch(PANEL_BUNDLE_URL, {
      redirect: "follow",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHA(maxAttempts = 60, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const [haReady, panelReady] = await Promise.all([
      checkHAHealth(),
      checkSTPanelReady(),
    ]);

    if (haReady && panelReady) {
      console.log("Home Assistant and ST panel are ready");
      return;
    }

    console.log(
      `Waiting for Home Assistant/ST panel... (${i + 1}/${maxAttempts})`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Home Assistant or ST panel did not become ready in time");
}

async function startHAContainer(): Promise<void> {
  const composeFile = join(__dirname, "../../docker-compose.test.yml");
  if (!existsSync(composeFile)) {
    console.warn(
      "docker-compose.test.yml not found, assuming HA is already running",
    );
    return;
  }

  try {
    const isRunning = execSync(
      'docker ps --filter name=ha-test --format "{{.Names}}"',
      { encoding: "utf-8" },
    )
      .trim()
      .includes("ha-test");

    if (isRunning) {
      console.log("HA container is already running");
      return;
    }

    console.log("Starting HA container...");
    execSync(`docker-compose -f ${composeFile} up -d`, { stdio: "inherit" });

    await waitForHA();
  } catch (error) {
    console.warn(
      "Could not start HA container, assuming it is already running:",
      error,
    );
  }
}

export default async function globalSetup(): Promise<void> {
  console.log("Setting up E2E test environment...");

  if (process.env.SKIP_HA_START !== "true") {
    await startHAContainer();
  }

  await waitForHA();

  console.log("E2E test environment ready");
}
