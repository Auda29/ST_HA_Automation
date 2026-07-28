import { describe, it, expect } from "vitest";
import type {
  HAApiMethod,
  HAClient,
  HAConnection,
  HAWSMessage,
  HAState,
} from "./types";
import { HAApiClient } from "./ha-api";
import { HelperManager } from "./helper-manager";
import type { HelperConfig } from "../analyzer/types";

class FakeConnection implements HAClient, HAConnection {
  public wsMessages: HAWSMessage[] = [];
  public restCalls: { method: HAApiMethod; path: string }[] = [];
  public states: HAState[] = [];

  get connection(): HAConnection {
    return this;
  }

  // Helper sync must never touch the REST API - only automation and script
  // configs live there.
  async callApi<T>(method: HAApiMethod, path: string): Promise<T> {
    this.restCalls.push({ method, path });
    throw new Error(`Unexpected REST call in helper tests: ${method} ${path}`);
  }

  async sendMessagePromise<T>(message: HAWSMessage): Promise<T> {
    this.wsMessages.push(message);
    if (message.type === "get_states") {
      return this.states as unknown as T;
    }
    if (message.type.endsWith("/create")) {
      return { id: message.name } as T;
    }
    return undefined as unknown as T;
  }

  sendMessage(message: HAWSMessage): void {
    this.wsMessages.push(message);
  }
}

describe("HelperManager", () => {
  const requiredHelpers: HelperConfig[] = [
    {
      id: "input_number.st_project_prog_threshold",
      type: "input_number",
      name: "Threshold",
      min: 0,
      max: 100,
      step: 1,
      initial: 10,
    },
  ];

  it("calculates toCreate/toDelete correctly when no existing helpers", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new HelperManager(api, "st_");

    const sync = await manager.calculateSync(requiredHelpers, "st_project_prog_");

    expect(sync.toCreate.map((h) => h.id)).toEqual([requiredHelpers[0].id]);
    expect(sync.toDelete).toEqual([]);
    expect(sync.toUpdate).toEqual([]);
  });

  it("marks existing ST helpers for deletion when no longer required", async () => {
    const conn = new FakeConnection();
    conn.states = [
      {
        entity_id: "input_number.st_old_helper",
        state: "0",
        attributes: { min: 0, max: 100 },
        last_changed: "",
        last_updated: "",
      },
    ];
    const api = new HAApiClient(conn);
    const manager = new HelperManager(api, "st_");

    const sync = await manager.calculateSync([], "st_");

    expect(sync.toCreate).toEqual([]);
    expect(sync.toUpdate).toEqual([]);
    expect(sync.toDelete).toEqual(["input_number.st_old_helper"]);
  });

  it("ignores automation and script entities that only share the st_ prefix", async () => {
    const conn = new FakeConnection();
    conn.states = [
      {
        entity_id: "automation.st_program",
        state: "on",
        attributes: {},
        last_changed: "",
        last_updated: "",
      },
      {
        entity_id: "script.st_program_logic",
        state: "off",
        attributes: {},
        last_changed: "",
        last_updated: "",
      },
      {
        entity_id: "input_boolean.st_real_helper",
        state: "off",
        attributes: {},
        last_changed: "",
        last_updated: "",
      },
    ];
    const api = new HAApiClient(conn);
    const manager = new HelperManager(api, "st_");

    const sync = await manager.calculateSync([], "st_");

    expect(sync.toDelete).toEqual(["input_boolean.st_real_helper"]);
  });

  it("creates input_number helpers with the requested entity id and friendly name", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new HelperManager(api, "st_");

    await manager.createHelper(requiredHelpers[0]);

    expect(conn.wsMessages).toEqual([
      {
        type: "input_number/create",
        name: "st_project_prog_threshold",
        initial: 10,
        min: 0,
        max: 100,
        step: 1,
        mode: "box",
      },
      {
        type: "input_number/update",
        input_number_id: "st_project_prog_threshold",
        name: "Threshold",
        initial: 10,
        min: 0,
        max: 100,
        step: 1,
        mode: "box",
      },
    ]);
    expect(
      conn.wsMessages.some(
        (message) =>
          message.type === "call_service" &&
          message.domain === "input_number" &&
          message.service === "set_value",
      ),
    ).toBe(false);
  });

  it("creates timer helpers via the timer create API", async () => {
    const conn = new FakeConnection();
    const api = new HAApiClient(conn);
    const manager = new HelperManager(api, "st_");

    await manager.createHelper({
      id: "timer.st_project_prog_delay",
      type: "timer",
      name: "Delay Timer",
    });

    expect(conn.wsMessages).toEqual([
      {
        type: "timer/create",
        name: "st_project_prog_delay",
        duration: "00:00:00",
      },
      {
        type: "timer/update",
        timer_id: "st_project_prog_delay",
        name: "Delay Timer",
        duration: "00:00:00",
      },
    ]);
  });
});
