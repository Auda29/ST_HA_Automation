/**
 * Global setup for E2E tests
 *
 * Ensures Home Assistant Docker container is running before browser tests start.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HA_URL = process.env.HA_URL || "http://127.0.0.1:8123";
async function checkHAHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${HA_URL}/api/`);
    // 401 Unauthorized means HA is running but requires auth - that's OK
    return response.ok || response.status === 401;
  } catch {
    return false;
  }
}

async function waitForHA(maxAttempts = 60, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkHAHealth()) {
      console.log("Home Assistant is ready");
      return;
    }

    console.log(`Waiting for Home Assistant... (${i + 1}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Home Assistant did not become ready in time");
}

async function startHAContainer(): Promise<void> {
  const composeFile = join(__dirname, "../../docker-compose.test.yml");
  const expectedConfigPath = resolve(
    __dirname,
    "../../tests/ha-fixture-config",
  ).toLowerCase();
  if (!existsSync(composeFile)) {
    console.warn(
      "docker-compose.test.yml not found, assuming HA is already running",
    );
    return;
  }

  try {
    const hasContainer =
      execSync(
        'docker ps -a --filter name=^/ha-test$ --format "{{.Names}}"',
        { encoding: "utf-8" },
      ).trim() === "ha-test";

    if (hasContainer) {
      const isRunning =
        execSync(
          'docker ps --filter name=^/ha-test$ --format "{{.Names}}"',
          { encoding: "utf-8" },
        ).trim() === "ha-test";
      const inspected = JSON.parse(
        execSync("docker inspect ha-test", { encoding: "utf-8" }),
      ) as Array<{
        Mounts?: Array<{ Source?: string; Destination?: string }>;
      }>;
      const mountedConfigPath = inspected[0]?.Mounts?.find(
        (mount) => mount.Destination === "/config",
      )?.Source;

      if (
        mountedConfigPath &&
        resolve(mountedConfigPath).toLowerCase() === expectedConfigPath
      ) {
        if (isRunning) {
          console.log(
            "HA test container is already running with current fixtures",
          );
          return;
        }
      } else {
        console.log(
          `Replacing incompatible ha-test container (mounted /config from ${mountedConfigPath ?? "unknown"})`,
        );
        execSync("docker rm -f ha-test", { stdio: "inherit" });
      }
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
