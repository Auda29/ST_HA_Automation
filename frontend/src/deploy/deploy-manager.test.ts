import { describe, it, expect } from "vitest";
import type {
  HAConnection,
  HAWSMessage,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from "./types";
import { HAApiClient } from "./ha-api";
import { DeployManager } from "./deploy-manager";
import type { TranspilerResult } from "../transpiler/types";

class FakeConnection implements HAConnection {
  public wsMessages: HAWSMessage[] = [];
  public services: { domain: string; service: string; data?: Record<string, unknown> }[] = [];
  public states: HAState[] = [];
  public automations = new Map<string, HAAutomationConfig>();
  public scripts = new Map<string, HAScriptConfig>();
  public failScriptSave = false;

  async callWS<T>(message: HAWSMessage): Promise<T> {
    this.wsMessages.push(message);
    switch (message.type) {
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
      case "config/automation/delete": {
        this.automations.delete(message.automation_id as string);
        return undefined as unknown as T;
      }
      case "config/script/config": {
        if ("config" in message) {
          if (this.failScriptSave) {
            throw new Error("script save failed");
          }
          const cfg = message.config as HAScriptConfig;
          this.scripts.set(message.script_id as string, cfg);
          return cfg as unknown as T;
        }
        const existing = this.scripts.get(message.script_id as string);
        if (!existing) throw new Error("script not found");
        return existing as unknown as T;
      }
      case "config/script/delete": {
        this.scripts.delete(message.script_id as string);
        return undefined as unknown as T;
      }
      default:
        return undefined as unknown as T;
    }
  }

  async callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void> {
    this.services.push({ domain, service, data });
  }

  async getStates(): Promise<HAState[]> {
    return this.states;
  }
}

function makeTranspilerResult(): TranspilerResult {
  return {
    automation: {
      id: "st_default_prog",
      alias: "[ST] prog",
      description: "desc",
      mode: "single",
      trigger: [
        {
          platform: "state",
          entity_id: "binary_sensor.test",
        },
      ],
      action: [],
    },
    script: {
      alias: "[ST] prog Logic",
      mode: "restart",
      sequence: [],
    },
    helpers: [],
    sourceMap: {
      version: 1,
      project: 'test',
      program: 'prog',
      automationId: 'st_test_prog',
      generatedAt: new Date().toISOString(),
      mappings: {},
    },
    diagnostics: [],
  };
}

describe("DeployManager", () => {
  it("deploys automation and script successfully on happy path", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);
    const result = makeTranspilerResult();

    const deployResult = await manager.deploy(result, { dryRun: false });

    expect(deployResult.success).toBe(true);
    expect(conn.automations.has("st_default_prog")).toBe(true);
    const scriptId = "st_st_default_prog_logic";
    expect(conn.scripts.has(scriptId)).toBe(true);
  });

  it("rolls back automation when script save fails", async () => {
    const conn = new FakeConnection();
    conn.failScriptSave = true;
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);
    const result = makeTranspilerResult();

    const deployResult = await manager.deploy(result);

    expect(deployResult.success).toBe(false);
    // Automation should not remain after rollback
    expect(conn.automations.has("st_default_prog")).toBe(false);
  });
});

