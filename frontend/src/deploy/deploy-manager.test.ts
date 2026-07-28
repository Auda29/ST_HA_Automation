import { describe, it, expect } from "vitest";
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
import { DeployManager } from "./deploy-manager";
import type { TranspilerResult } from "../transpiler/types";

const AUTOMATION_PATH = /^config\/automation\/config\/(.+)$/;
const SCRIPT_PATH = /^config\/script\/config\/(.+)$/;

class FakeConnection implements HAClient, HAConnection {
  public wsMessages: HAWSMessage[] = [];
  public restCalls: { method: HAApiMethod; path: string }[] = [];
  public states: HAState[] = [];
  public automations = new Map<string, HAAutomationConfig>();
  public scripts = new Map<string, HAScriptConfig>();
  public failScriptSave = false;
  public failScriptSaveWithObject = false;
  public failNextHelperCreate = false;
  public failNextAutomationReload = false;

  get connection(): HAConnection {
    return this;
  }

  /**
   * Automation and script configs are REST-only in Home Assistant. Routing them
   * through the WebSocket connection is what this fake used to allow, which hid
   * the fact that the real API rejects those messages with `unknown_command`.
   */
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
      if (method === "DELETE") {
        this.automations.delete(id);
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
        if (this.failScriptSaveWithObject) {
          throw {
            body: {
              message: "Script save rejected by Home Assistant",
            },
          };
        }
        if (this.failScriptSave) {
          throw new Error("script save failed");
        }
        this.scripts.set(id, parameters as HAScriptConfig);
        return undefined as unknown as T;
      }
      if (method === "DELETE") {
        this.scripts.delete(id);
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
      case "input_number/create":
        if (this.failNextHelperCreate) {
          this.failNextHelperCreate = false;
          throw new Error("helper create failed");
        }
        return { id: message.name } as T;
      case "call_service":
        if (
          message.domain === "automation" &&
          message.service === "reload" &&
          this.failNextAutomationReload
        ) {
          this.failNextAutomationReload = false;
          throw new Error("automation reload failed");
        }
        return undefined as unknown as T;
      default:
        return undefined as unknown as T;
    }
  }

  sendMessage(message: HAWSMessage): void {
    this.wsMessages.push(message);
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
    additionalAutomations: [],
    sourceMap: {
      version: 1,
      project: "test",
      program: "prog",
      automationId: "st_test_prog",
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
    const scriptId = "st_default_prog_logic";
    expect(conn.scripts.has(scriptId)).toBe(true);
  });

  it("writes automation and script configs over REST, never over WebSocket", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);

    const deployResult = await manager.deploy(makeTranspilerResult(), {
      dryRun: false,
    });

    expect(deployResult.success).toBe(true);
    expect(conn.restCalls).toContainEqual({
      method: "POST",
      path: "config/automation/config/st_default_prog",
    });
    expect(conn.restCalls).toContainEqual({
      method: "POST",
      path: "config/script/config/st_default_prog_logic",
    });

    // Home Assistant has no `config/*` WebSocket commands; sending one there
    // fails with `unknown_command`, which is the bug this guards against.
    const configOverWs = conn.wsMessages.filter((m) =>
      m.type.startsWith("config/"),
    );
    expect(configOverWs).toEqual([]);
  });

  it("deploys additional automations generated by the transpiler", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);
    const result = makeTranspilerResult();
    result.additionalAutomations = [
      {
        id: "st_default_prog_timer_finished",
        alias: "[ST] prog - timer finished",
        description: "desc",
        mode: "single",
        trigger: [
          {
            platform: "event",
            event_type: "timer.finished",
          },
        ],
        action: [],
      },
    ];

    const deployResult = await manager.deploy(result, { dryRun: false });

    expect(deployResult.success).toBe(true);
    expect(conn.automations.has("st_default_prog")).toBe(true);
    expect(conn.automations.has("st_default_prog_timer_finished")).toBe(true);
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

  it("rolls back all applied operations when Home Assistant reload fails", async () => {
    const conn = new FakeConnection();
    conn.failNextAutomationReload = true;
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);

    const deployResult = await manager.deploy(makeTranspilerResult());

    expect(deployResult.success).toBe(false);
    expect(deployResult.errors[0]?.message).toContain("automation reload failed");
    expect(conn.automations.has("st_default_prog")).toBe(false);
    expect(conn.scripts.has("st_default_prog_logic")).toBe(false);
    expect(
      deployResult.operations.every((op) => op.status === "reverted"),
    ).toBe(true);
  });

  it("formats object-shaped deploy errors into readable messages", async () => {
    const conn = new FakeConnection();
    conn.failScriptSaveWithObject = true;
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);
    const result = makeTranspilerResult();

    const deployResult = await manager.deploy(result);

    expect(deployResult.success).toBe(false);
    expect(deployResult.errors[0]?.message).toContain(
      "Script save rejected by Home Assistant",
    );
  });

  it("deletes obsolete helpers only for the program being deployed", async () => {
    const conn = new FakeConnection();
    conn.states = [
      {
        entity_id: "input_number.st_default_prog_obsolete",
        state: "0",
        attributes: { min: 0, max: 100 },
        last_changed: "",
        last_updated: "",
      },
      {
        entity_id: "input_number.st_default_other_counter",
        state: "42",
        attributes: { min: 0, max: 100 },
        last_changed: "",
        last_updated: "",
      },
    ];

    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);
    const deployResult = await manager.deploy(makeTranspilerResult());

    expect(deployResult.success).toBe(true);
    expect(conn.wsMessages).toContainEqual({
      type: "input_number/delete",
      input_number_id: "st_default_prog_obsolete",
    });
    expect(conn.wsMessages).not.toContainEqual({
      type: "input_number/delete",
      input_number_id: "st_default_other_counter",
    });
  });

  it("captures previous helper config for helper update and delete rollback", async () => {
    const conn = new FakeConnection();
    conn.states = [
      {
        entity_id: "input_number.st_default_prog_existing",
        state: "7",
        attributes: {
          friendly_name: "Existing Helper",
          min: 0,
          max: 10,
          step: 1,
          mode: "box",
        },
        last_changed: "",
        last_updated: "",
      },
      {
        entity_id: "input_boolean.st_default_prog_removed",
        state: "on",
        attributes: {
          friendly_name: "Removed Helper",
        },
        last_changed: "",
        last_updated: "",
      },
    ];

    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);
    const result = makeTranspilerResult();
    result.helpers = [
      {
        id: "input_number.st_default_prog_existing",
        type: "input_number",
        name: "Existing Helper",
        initial: 7,
        min: 0,
        max: 20,
        step: 1,
        mode: "box",
      },
    ];

    const deployResult = await manager.deploy(result, { dryRun: true });

    const helperUpdate = deployResult.operations.find(
      (op) => op.entityType === "helper" && op.type === "update",
    );
    const helperDelete = deployResult.operations.find(
      (op) =>
        op.entityType === "helper" &&
        op.type === "delete" &&
        op.entityId === "input_boolean.st_default_prog_removed",
    );

    expect(helperUpdate?.previousState).toEqual({
      id: "input_number.st_default_prog_existing",
      type: "input_number",
      name: "Existing Helper",
      initial: 7,
      min: 0,
      max: 10,
      step: 1,
      mode: "box",
    });
    expect(helperDelete?.previousState).toEqual({
      id: "input_boolean.st_default_prog_removed",
      type: "input_boolean",
      name: "Removed Helper",
      initial: true,
    });
  });

  it("recreates helper updates only after deleting the existing helper", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);

    await (manager as unknown as {
      applyOperation: (op: {
        type: "update";
        entityType: "helper";
        entityId: string;
        newState: {
          id: string;
          type: "input_number";
          name: string;
          initial: number;
          min: number;
          max: number;
          step: number;
        };
      }) => Promise<void>;
    }).applyOperation({
      type: "update",
      entityType: "helper",
      entityId: "input_number.st_existing_helper",
      newState: {
        id: "input_number.st_existing_helper",
        type: "input_number",
        name: "Existing Helper",
        initial: 7,
        min: 0,
        max: 20,
        step: 1,
      },
    });

    expect(conn.wsMessages).toEqual([
      {
        type: "input_number/delete",
        input_number_id: "st_existing_helper",
      },
      {
        type: "input_number/create",
        name: "st_existing_helper",
        initial: 7,
        min: 0,
        max: 20,
        step: 1,
        mode: "box",
      },
      {
        type: "input_number/update",
        input_number_id: "st_existing_helper",
        name: "Existing Helper",
        initial: 7,
        min: 0,
        max: 20,
        step: 1,
        mode: "box",
      },
    ]);
  });

  it("restores the previous helper when an update fails after deletion", async () => {
    const conn = new FakeConnection();
    conn.failNextHelperCreate = true;
    const api = new HAApiClient(conn);
    const manager = new DeployManager(api);

    const operation = {
      id: "op_helper_update",
      type: "update" as const,
      entityType: "helper" as const,
      entityId: "input_number.st_default_prog_counter",
      previousState: {
        id: "input_number.st_default_prog_counter",
        type: "input_number" as const,
        name: "Counter",
        initial: 7,
        min: 0,
        max: 10,
        step: 1,
        mode: "box" as const,
      },
      newState: {
        id: "input_number.st_default_prog_counter",
        type: "input_number" as const,
        name: "Counter",
        initial: 7,
        min: 0,
        max: 20,
        step: 1,
        mode: "box" as const,
      },
      status: "pending" as const,
    };

    await expect(
      (manager as unknown as {
        applyOperation: (op: typeof operation) => Promise<void>;
      }).applyOperation(operation),
    ).rejects.toThrow("helper create failed");

    expect(conn.wsMessages).toEqual([
      {
        type: "input_number/delete",
        input_number_id: "st_default_prog_counter",
      },
      {
        type: "input_number/create",
        name: "st_default_prog_counter",
        initial: 7,
        min: 0,
        max: 20,
        step: 1,
        mode: "box",
      },
      {
        type: "input_number/create",
        name: "st_default_prog_counter",
        initial: 7,
        min: 0,
        max: 10,
        step: 1,
        mode: "box",
      },
      {
        type: "input_number/update",
        input_number_id: "st_default_prog_counter",
        name: "Counter",
        initial: 7,
        min: 0,
        max: 10,
        step: 1,
        mode: "box",
      },
    ]);
  });
});
