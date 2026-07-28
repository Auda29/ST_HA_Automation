import { describe, it, expect, beforeEach } from "vitest";
import type {
  HAApiMethod,
  HAClient,
  HAConnection,
  HAWSMessage,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from "./types";
import { HAApiClient } from "./ha-api";
import { BackupManager } from "./backup-manager";

const AUTOMATION_PATH = /^config\/automation\/config\/(.+)$/;
const SCRIPT_PATH = /^config\/script\/config\/(.+)$/;

class FakeConnection implements HAClient, HAConnection {
  public wsMessages: HAWSMessage[] = [];
  public restCalls: { method: HAApiMethod; path: string }[] = [];
  public states: HAState[] = [];
  public automations = new Map<string, HAAutomationConfig>();
  public scripts = new Map<string, HAScriptConfig>();

  get connection(): HAConnection {
    return this;
  }

  async callApi<T>(
    method: HAApiMethod,
    path: string,
    parameters?: unknown,
  ): Promise<T> {
    this.restCalls.push({ method, path });

    const automationId = AUTOMATION_PATH.exec(path)?.[1];
    if (automationId) {
      const id = decodeURIComponent(automationId);
      if (method === "POST") {
        this.automations.set(id, parameters as HAAutomationConfig);
        return undefined as unknown as T;
      }
      const existing = this.automations.get(id);
      if (!existing) throw new Error("automation not found");
      return existing as unknown as T;
    }

    const scriptId = SCRIPT_PATH.exec(path)?.[1];
    if (scriptId) {
      const id = decodeURIComponent(scriptId);
      if (method === "POST") {
        this.scripts.set(id, parameters as HAScriptConfig);
        return undefined as unknown as T;
      }
      const existing = this.scripts.get(id);
      if (!existing) throw new Error("script not found");
      return existing as unknown as T;
    }

    throw new Error(`Unexpected REST call: ${method} ${path}`);
  }

  async sendMessagePromise<T>(message: HAWSMessage): Promise<T> {
    this.wsMessages.push(message);
    switch (message.type) {
      case "get_states":
        return this.states as unknown as T;
      default:
        return undefined as unknown as T;
    }
  }

  sendMessage(message: HAWSMessage): void {
    this.wsMessages.push(message);
  }
}

describe("BackupManager", () => {
  let conn: FakeConnection;

  beforeEach(() => {
    conn = new FakeConnection();
    conn.automations.set("st_default_prog", {
      id: "st_default_prog",
      alias: "Prog",
      mode: "single",
      trigger: [],
      action: [],
    });
    conn.scripts.set("st_default_prog_logic", {
      alias: "Prog Logic",
      mode: "restart",
      sequence: [],
    });
    conn.states = [
      {
        entity_id: "input_number.st_default_prog_counter",
        state: "1",
        attributes: { friendly_name: "Counter", min: 0, max: 100 },
        last_changed: "",
        last_updated: "",
      },
    ];
    window.localStorage.clear();
  });

  it("creates and lists backups", async () => {
    const api = new HAApiClient(conn);
    const manager = new BackupManager(api);

    const backup = await manager.createBackup("st_default_prog", "Prog");
    expect(backup.projectName).toBe("default");
    expect(backup.data.script?.alias).toBe("Prog Logic");

    const backups = await manager.listBackups();
    expect(backups.length).toBeGreaterThan(0);
    expect(backups[0].programName).toBe("Prog");
  });

  it("restores scripts using the same script id format as deploy", async () => {
    const api = new HAApiClient(conn);
    const manager = new BackupManager(api);

    const backup = await manager.createBackup("st_default_prog", "Prog");
    conn.scripts.clear();

    await manager.restoreBackup(backup.id);

    expect(conn.scripts.has("st_default_prog_logic")).toBe(true);
    expect(conn.scripts.get("st_default_prog_logic")?.alias).toBe("Prog Logic");
  });

  it("restores helper configuration instead of recreating helpers with defaults", async () => {
    const api = new HAApiClient(conn);
    const manager = new BackupManager(api);

    const backup = await manager.createBackup("st_default_prog", "Prog");
    conn.wsMessages = [];

    await manager.restoreBackup(backup.id);

    expect(conn.wsMessages).toContainEqual({
      type: "input_number/create",
      name: "Counter",
      initial: 1,
      min: 0,
      max: 100,
      step: 1,
      mode: "box",
    });
  });
});
