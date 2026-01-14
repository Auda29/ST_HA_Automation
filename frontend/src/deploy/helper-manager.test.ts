import { describe, it, expect } from "vitest";
import type { HAConnection, HAWSMessage, HAState } from "./types";
import { HAApiClient } from "./ha-api";
import { HelperManager } from "./helper-manager";
import type { HelperConfig } from "../analyzer/types";

class FakeConnection implements HAConnection {
  public wsMessages: HAWSMessage[] = [];
  public services: { domain: string; service: string; data?: Record<string, unknown> }[] = [];
  public states: HAState[] = [];

  async callWS<T>(message: HAWSMessage): Promise<T> {
    this.wsMessages.push(message);
    // For helper tests we only care about delete helpers; no response needed.
    return undefined as unknown as T;
  }

  async callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void> {
    this.services.push({ domain, service, data });
  }

  async getStates(): Promise<HAState[]> {
    return this.states;
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

    const sync = await manager.calculateSync(requiredHelpers);

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

    const sync = await manager.calculateSync([]);

    expect(sync.toCreate).toEqual([]);
    expect(sync.toUpdate).toEqual([]);
    expect(sync.toDelete).toEqual(["input_number.st_old_helper"]);
  });
});

