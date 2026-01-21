import { describe, it, expect, beforeEach } from "vitest";
import type {
  HAConnection,
  HAWSMessage,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from "./types";
import { HAApiClient } from "./ha-api";
import { BackupManager } from "./backup-manager";

class FakeConnection implements HAConnection {
  public wsMessages: HAWSMessage[] = [];
  public states: HAState[] = [];
  public automations = new Map<string, HAAutomationConfig>();
  public scripts = new Map<string, HAScriptConfig>();

  async sendMessagePromise<T>(message: HAWSMessage): Promise<T> {
    this.wsMessages.push(message);
    switch (message.type) {
      case "get_states":
        return this.states as unknown as T;
      case "config/automation/config": {
        if ("config" in message) {
          const cfg = message.config as HAAutomationConfig;
          this.automations.set(message.automation_id as string, cfg);
          return cfg as unknown as T;
        }
        const existing = this.automations.get(message.automation_id as string);
        if (!existing) throw new Error("automation not found");
        return existing as unknown as T;
      }
      case "config/script/config": {
        if ("config" in message) {
          const cfg = message.config as HAScriptConfig;
          this.scripts.set(message.script_id as string, cfg);
          return cfg as unknown as T;
        }
        const existing = this.scripts.get(message.script_id as string);
        if (!existing) throw new Error("script not found");
        return existing as unknown as T;
      }
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
    conn.scripts.set("st_st_default_prog_logic", {
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

    const backups = await manager.listBackups();
    expect(backups.length).toBeGreaterThan(0);
    expect(backups[0].programName).toBe("Prog");
  });
});
