import { describe, it, expect, beforeEach, vi } from "vitest";
import { OnlineStateManager, ValueFormatter } from "../state-manager";
import type { VariableBinding } from "../types";

// Mock the home-assistant-js-websocket module
vi.mock("home-assistant-js-websocket", () => ({
  subscribeEntities: vi.fn().mockReturnValue(() => {}),
}));

describe("OnlineStateManager", () => {
  let manager: OnlineStateManager;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {};
    manager = new OnlineStateManager(mockConnection);
  });

  it("starts in disconnected state", () => {
    expect(manager.getState().status).toBe("disconnected");
  });

  it("transitions to online on start", async () => {
    const bindings: VariableBinding[] = [
      {
        variableName: "motion",
        entityId: "binary_sensor.motion",
        dataType: "BOOL",
        line: 6,
        column: 5,
        endColumn: 40,
        isInput: true,
        isOutput: false,
        isPersistent: false,
      },
    ];

    await manager.start(bindings);
    expect(manager.getState().status).toBe("online");
  });

  it("notifies subscribers on state change", async () => {
    const callback = vi.fn();
    manager.subscribe(callback);

    await manager.start([]);
    expect(callback).toHaveBeenCalled();
  });

  it("stops and clears values", async () => {
    await manager.start([]);
    manager.stop();

    expect(manager.getState().status).toBe("disconnected");
    expect(manager.getState().liveValues.size).toBe(0);
  });

  it("pauses updates", async () => {
    await manager.start([]);
    manager.setPaused(true);

    expect(manager.getState().status).toBe("paused");
  });
});

describe("ValueFormatter", () => {
  it("formats BOOL true", () => {
    const result = ValueFormatter.format({
      raw: "on",
      formatted: "TRUE",
      isValid: true,
      dataType: "BOOL",
    });

    expect(result.text).toBe("TRUE");
    expect(result.className).toContain("bool-true");
  });

  it("formats BOOL false", () => {
    const result = ValueFormatter.format({
      raw: "off",
      formatted: "FALSE",
      isValid: true,
      dataType: "BOOL",
    });

    expect(result.text).toBe("FALSE");
    expect(result.className).toContain("bool-false");
  });

  it("formats invalid value", () => {
    const result = ValueFormatter.format({
      raw: "unavailable",
      formatted: "—",
      isValid: false,
      dataType: "UNKNOWN",
    });

    expect(result.text).toBe("—");
    expect(result.className).toContain("invalid");
  });

  it("formats REAL", () => {
    const result = ValueFormatter.format({
      raw: "21.5",
      formatted: "21.50",
      isValid: true,
      dataType: "REAL",
    });

    expect(result.text).toBe("21.50");
    expect(result.className).toContain("real");
  });

  it("adds changed class when hasChanged", () => {
    const result = ValueFormatter.formatWithChange({
      binding: {
        variableName: "test",
        entityId: "sensor.test",
        dataType: "INT",
        line: 1,
        column: 1,
        endColumn: 10,
        isInput: true,
        isOutput: false,
        isPersistent: false,
      },
      currentValue: {
        raw: "10",
        formatted: "10",
        isValid: true,
        dataType: "INT",
      },
      previousValue: {
        raw: "5",
        formatted: "5",
        isValid: true,
        dataType: "INT",
      },
      hasChanged: true,
      lastUpdate: Date.now(),
    });

    expect(result.className).toContain("changed");
  });
});
