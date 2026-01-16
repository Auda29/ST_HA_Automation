/**
 * Entity Browser Component Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { EntityInfo, EntityFilter } from "./types";
import type { EntityState } from "../online/types";
import { STEntityBrowser, inferDataType } from "./entity-browser";
import "./entity-browser";

// Mock the entity-list component to avoid full rendering
vi.mock("./entity-list", () => ({
  STEntityList: class {
    entities: EntityInfo[] = [];
    filter: EntityFilter = {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: false,
      showOutputsOnly: false,
    };
  },
}));

describe("STEntityBrowser", () => {
  let component: STEntityBrowser;
  let mockUnsubscribe: () => void;
  let mockSubscribeEntities: (
    callback: (entities: Record<string, EntityState>) => void,
  ) => Promise<() => void>;
  let mockHass: any;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    mockSubscribeEntities = vi.fn().mockResolvedValue(mockUnsubscribe);

    mockHass = {
      connection: {
        subscribeEntities: mockSubscribeEntities,
      },
    };
  });

  afterEach(() => {
    if (component && component.parentNode) {
      component.parentNode.removeChild(component);
    }
  });

  describe("WebSocket Subscription", () => {
    it("subscribes to entity updates when hass connection is available", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      expect(mockSubscribeEntities).toHaveBeenCalledTimes(1);
      expect(component["_isConnected"]).toBe(true);
    });

    it("handles connection errors gracefully", async () => {
      const errorMessage = "Connection failed";
      mockSubscribeEntities = vi
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      mockHass.connection.subscribeEntities = mockSubscribeEntities;

      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      expect(component["_error"]).toBe(errorMessage);
      expect(component["_isConnected"]).toBe(false);
    });

    it("unsubscribes when component is disconnected", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      component.disconnectedCallback();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
      expect(component["_isConnected"]).toBe(false);
    });

    it("reconnects when hass connection changes", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      const newMockHass = {
        connection: {
          subscribeEntities: vi.fn().mockResolvedValue(mockUnsubscribe),
        },
      };

      component.hass = newMockHass;
      component.updated(new Map([["hass", mockHass]]));

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1); // Disconnect from old
      expect(newMockHass.connection.subscribeEntities).toHaveBeenCalledTimes(1); // Connect to new
    });
  });

  describe("Entity Updates", () => {
    it("processes entity state updates and groups by domain", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      const entities: Record<string, EntityState> = {
        "light.kitchen": {
          entityId: "light.kitchen",
          state: "on",
          attributes: { friendly_name: "Kitchen Light" },
          lastChanged: "2026-01-14T10:00:00Z",
        },
        "sensor.temperature": {
          entityId: "sensor.temperature",
          state: "22.5",
          attributes: {
            friendly_name: "Temperature",
            unit_of_measurement: "°C",
          },
          lastChanged: "2026-01-14T10:00:00Z",
        },
        "binary_sensor.motion": {
          entityId: "binary_sensor.motion",
          state: "off",
          attributes: { friendly_name: "Motion Sensor" },
          lastChanged: "2026-01-14T10:00:00Z",
        },
      };

      // Get the callback passed to subscribeEntities
      const subscribeCallback = vi.mocked(mockSubscribeEntities).mock
        .calls[0][0];
      subscribeCallback(entities);

      await component.updateComplete;

      expect(component["_entities"].size).toBe(3);
      expect(component["_domains"]).toEqual(
        expect.arrayContaining(["binary_sensor", "light", "sensor"]),
      );
      expect(component["_domains"].length).toBe(3);

      const kitchenLight = component["_entities"].get("light.kitchen");
      expect(kitchenLight).toBeDefined();
      expect(kitchenLight?.domain).toBe("light");
      expect(kitchenLight?.friendlyName).toBe("Kitchen Light");
      expect(kitchenLight?.state).toBe("on");
    });

    it("extracts entity icons from attributes", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      const entities: Record<string, EntityState> = {
        "light.kitchen": {
          entityId: "light.kitchen",
          state: "on",
          attributes: {
            friendly_name: "Kitchen Light",
            icon: "mdi:lightbulb",
          },
          lastChanged: "2026-01-14T10:00:00Z",
        },
      };

      const subscribeCallback = vi.mocked(mockSubscribeEntities).mock
        .calls[0][0];
      subscribeCallback(entities);

      await component.updateComplete;

      const entity = component["_entities"].get("light.kitchen");
      expect(entity?.icon).toBe("mdi:lightbulb");
    });
  });

  describe("Data Type Inference", () => {
    it("infers BOOL for binary_sensor entities", () => {
      const entity: EntityInfo = {
        entityId: "binary_sensor.motion",
        state: "on",
        attributes: {},
        domain: "binary_sensor",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("BOOL");
      expect(inference.confidence).toBe("high");
    });

    it("infers BOOL for input_boolean entities", () => {
      const entity: EntityInfo = {
        entityId: "input_boolean.flag",
        state: "on",
        attributes: {},
        domain: "input_boolean",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("BOOL");
      expect(inference.confidence).toBe("high");
    });

    it("infers BOOL for switch entities", () => {
      const entity: EntityInfo = {
        entityId: "switch.relay",
        state: "on",
        attributes: {},
        domain: "switch",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("BOOL");
      expect(inference.confidence).toBe("high");
    });

    it("infers BOOL for light entities", () => {
      const entity: EntityInfo = {
        entityId: "light.kitchen",
        state: "on",
        attributes: {},
        domain: "light",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("BOOL");
      expect(inference.confidence).toBe("high");
    });

    it("infers REAL for input_number entities", () => {
      const entity: EntityInfo = {
        entityId: "input_number.temperature",
        state: "22.5",
        attributes: {},
        domain: "input_number",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("REAL");
      expect(inference.confidence).toBe("high");
    });

    it("infers INT for numeric sensor with integer value", () => {
      const entity: EntityInfo = {
        entityId: "sensor.counter",
        state: "42",
        attributes: {},
        domain: "sensor",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("INT");
      expect(inference.confidence).toBe("medium");
    });

    it("infers REAL for numeric sensor with decimal value", () => {
      const entity: EntityInfo = {
        entityId: "sensor.temperature",
        state: "22.5",
        attributes: {},
        domain: "sensor",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("REAL");
      expect(inference.confidence).toBe("medium");
    });

    it("infers STRING for non-numeric sensor", () => {
      const entity: EntityInfo = {
        entityId: "sensor.status",
        state: "active",
        attributes: {},
        domain: "sensor",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("STRING");
      expect(inference.confidence).toBe("medium");
    });

    it("defaults to STRING for unknown domains", () => {
      const entity: EntityInfo = {
        entityId: "unknown.entity",
        state: "value",
        attributes: {},
        domain: "unknown",
      };

      const inference = inferDataType(entity);
      expect(inference.dataType).toBe("STRING");
      expect(inference.confidence).toBe("low");
    });
  });

  describe("Filtering", () => {
    beforeEach(async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      // Set up initial entities
      const entities: Record<string, EntityState> = {
        "light.kitchen": {
          entityId: "light.kitchen",
          state: "on",
          attributes: { friendly_name: "Kitchen Light" },
          lastChanged: "2026-01-14T10:00:00Z",
        },
        "sensor.temperature": {
          entityId: "sensor.temperature",
          state: "22.5",
          attributes: { friendly_name: "Temperature" },
          lastChanged: "2026-01-14T10:00:00Z",
        },
        "binary_sensor.motion": {
          entityId: "binary_sensor.motion",
          state: "off",
          attributes: { friendly_name: "Motion Sensor" },
          lastChanged: "2026-01-14T10:00:00Z",
        },
      };

      const subscribeCallback = vi.mocked(mockSubscribeEntities).mock
        .calls[0][0];
      subscribeCallback(entities);
      await component.updateComplete;
    });

    it("filters entities by search query", async () => {
      const searchInput = component.shadowRoot?.querySelector(
        ".search-box",
      ) as HTMLInputElement;
      expect(searchInput).toBeDefined();

      searchInput.value = "kitchen";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));

      await component.updateComplete;

      expect(component["_filter"].searchQuery).toBe("kitchen");
    });

    it("filters entities by selected domain", async () => {
      const domainSelect = component.shadowRoot?.querySelector(
        ".filter-select",
      ) as HTMLSelectElement;
      expect(domainSelect).toBeDefined();

      domainSelect.value = "light";
      domainSelect.dispatchEvent(new Event("change", { bubbles: true }));

      await component.updateComplete;

      expect(component["_filter"].selectedDomain).toBe("light");
    });

    it("toggles inputs only filter", async () => {
      const inputsCheckbox = component.shadowRoot?.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      expect(inputsCheckbox).toBeDefined();

      inputsCheckbox.checked = true;
      inputsCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

      await component.updateComplete;

      expect(component["_filter"].showInputsOnly).toBe(true);
      expect(component["_filter"].showOutputsOnly).toBe(false);
    });

    it("toggles outputs only filter", async () => {
      const checkboxes = component.shadowRoot?.querySelectorAll(
        'input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>;
      expect(checkboxes.length).toBeGreaterThanOrEqual(2);

      const outputsCheckbox = checkboxes[1];
      outputsCheckbox.checked = true;
      outputsCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

      await component.updateComplete;

      expect(component["_filter"].showOutputsOnly).toBe(true);
      expect(component["_filter"].showInputsOnly).toBe(false);
    });
  });

  describe("Performance with 500+ entities", () => {
    it("handles 500+ entities efficiently", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      // Generate 500+ entities
      const entities: Record<string, EntityState> = {};
      const domains = ["light", "sensor", "binary_sensor", "switch", "cover"];

      for (let i = 0; i < 500; i++) {
        const domain = domains[i % domains.length];
        const entityId = `${domain}.entity_${i}`;
        entities[entityId] = {
          entityId,
          state: i % 2 === 0 ? "on" : "off",
          attributes: {
            friendly_name: `Entity ${i}`,
          },
          lastChanged: "2026-01-14T10:00:00Z",
        };
      }

      const startTime = performance.now();
      const subscribeCallback = vi.mocked(mockSubscribeEntities).mock
        .calls[0][0];
      subscribeCallback(entities);

      await component.updateComplete;
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process 500 entities in reasonable time (< 100ms)
      expect(processingTime).toBeLessThan(100);
      expect(component["_entities"].size).toBe(500);
      expect(component["_domains"].length).toBe(domains.length);

      // Test filtering performance
      const filterStartTime = performance.now();
      component["_filter"] = {
        searchQuery: "entity_100",
        selectedDomain: null,
        showInputsOnly: false,
        showOutputsOnly: false,
      };
      await component.updateComplete;
      const filterEndTime = performance.now();
      const filterTime = filterEndTime - filterStartTime;

      // Filtering should be fast (< 50ms)
      expect(filterTime).toBeLessThan(50);
    });

    it("maintains smooth UI updates with large entity sets", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      // Generate 1000 entities
      const entities: Record<string, EntityState> = {};
      for (let i = 0; i < 1000; i++) {
        const entityId = `sensor.entity_${i}`;
        entities[entityId] = {
          entityId,
          state: `${i}`,
          attributes: { friendly_name: `Entity ${i}` },
          lastChanged: "2026-01-14T10:00:00Z",
        };
      }

      const subscribeCallback = vi.mocked(mockSubscribeEntities).mock
        .calls[0][0];
      subscribeCallback(entities);

      await component.updateComplete;

      // Component should still be responsive
      expect(component["_entities"].size).toBe(1000);
      expect(component["_isConnected"]).toBe(true);

      // Test that rendering doesn't block
      const renderStart = performance.now();
      await component.updateComplete;
      const renderEnd = performance.now();

      // Rendering should complete quickly
      expect(renderEnd - renderStart).toBeLessThan(200);
    });
  });

  describe("Status Display", () => {
    it("shows connection status when connected", async () => {
      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      const statusBar = component.shadowRoot?.querySelector(".status-bar");
      expect(statusBar).toBeDefined();
      expect(statusBar?.textContent).toContain("entities");
    });

    it("shows error message when connection fails", async () => {
      mockSubscribeEntities = vi
        .fn()
        .mockRejectedValue(new Error("Connection failed"));
      mockHass.connection.subscribeEntities = mockSubscribeEntities;

      component = document.createElement(
        "st-entity-browser",
      ) as STEntityBrowser;
      component.hass = mockHass;
      document.body.appendChild(component);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await component.updateComplete;

      const statusBar = component.shadowRoot?.querySelector(".status-bar");
      expect(statusBar?.textContent).toContain("Connection failed");
    });
  });
});
