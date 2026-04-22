/**
 * Home Assistant WebSocket API Wrapper
 */

import type {
  HAConnection,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from "./types";

// ============================================================================
// API Wrapper Class
// ============================================================================

export class HAApiClient {
  private readonly connection: HAConnection;

  constructor(connection: HAConnection) {
    this.connection = connection;
  }

  // ==========================================================================
  // Automation API
  // ==========================================================================

  async getAutomations(): Promise<HAAutomationConfig[]> {
    return this.connection.sendMessagePromise({
      type: "config/automation/list",
    });
  }

  async getAutomation(
    automationId: string,
  ): Promise<HAAutomationConfig | null> {
    try {
      return await this.connection.sendMessagePromise({
        type: "config/automation/config",
        automation_id: automationId,
      });
    } catch {
      return null;
    }
  }

  async saveAutomation(
    automationId: string,
    config: HAAutomationConfig,
  ): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "config/automation/config",
      automation_id: automationId,
      config,
    });
  }

  async deleteAutomation(automationId: string): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "config/automation/delete",
      automation_id: automationId,
    });
  }

  async reloadAutomations(): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "call_service",
      domain: "automation",
      service: "reload",
    });
  }

  // ==========================================================================
  // Script API
  // ==========================================================================

  async getScripts(): Promise<Record<string, HAScriptConfig>> {
    return this.connection.sendMessagePromise({
      type: "config/script/list",
    });
  }

  async getScript(scriptId: string): Promise<HAScriptConfig | null> {
    try {
      return await this.connection.sendMessagePromise({
        type: "config/script/config",
        script_id: scriptId,
      });
    } catch {
      return null;
    }
  }

  async saveScript(scriptId: string, config: HAScriptConfig): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "config/script/config",
      script_id: scriptId,
      config,
    });
  }

  async deleteScript(scriptId: string): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "config/script/delete",
      script_id: scriptId,
    });
  }

  async reloadScripts(): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "call_service",
      domain: "script",
      service: "reload",
    });
  }

  // ==========================================================================
  // Helper API
  // ==========================================================================

  async getStates(): Promise<HAState[]> {
    // Use WebSocket call to get all states
    return this.connection.sendMessagePromise({
      type: "get_states",
    });
  }

  async getSTHelpers(prefix: string = "st_"): Promise<HAState[]> {
    const states = await this.getStates();
    return states.filter((s) => {
      const name = s.entity_id.split(".")[1];
      return name?.startsWith(prefix);
    });
  }

  async deleteHelper(entityId: string): Promise<void> {
    const [domain, name] = entityId.split(".");
    await this.connection.sendMessagePromise({
      type: `${domain}/delete`,
      // e.g. input_number_id, input_boolean_id, ...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [`${domain}_id`]: name as any,
    });
  }

  async createInputBoolean(config: {
    name: string;
    initial?: boolean;
  }): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "input_boolean/create",
      name: config.name,
      initial: config.initial ?? false,
    });
  }

  async createInputNumber(config: {
    name: string;
    initial?: number;
    min?: number;
    max?: number;
    step?: number;
    mode?: "box" | "slider";
  }): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "input_number/create",
      name: config.name,
      initial: config.initial ?? 0,
      min: config.min ?? 0,
      max: config.max ?? 100,
      step: config.step ?? 1,
      mode: config.mode ?? "box",
    });
  }

  async createInputText(config: {
    name: string;
    initial?: string;
    pattern?: string;
  }): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "input_text/create",
      name: config.name,
      initial: config.initial ?? "",
      pattern: config.pattern,
    });
  }

  async createInputDateTime(config: {
    name: string;
    initial?: string;
  }): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "input_datetime/create",
      name: config.name,
      has_date: true,
      has_time: true,
      initial: config.initial ?? "",
    });
  }

  async createTimer(config: {
    name: string;
    duration?: string;
  }): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "timer/create",
      name: config.name,
      duration: config.duration ?? "00:00:00",
    });
  }

  async setHelperValue(entityId: string, value: unknown): Promise<void> {
    const [domain] = entityId.split(".");

    switch (domain) {
      case "input_boolean":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_boolean",
          service: value ? "turn_on" : "turn_off",
          service_data: { entity_id: entityId },
        });
        break;

      case "input_number":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_number",
          service: "set_value",
          service_data: { entity_id: entityId, value: value as number },
        });
        break;

      case "input_text":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_text",
          service: "set_value",
          service_data: { entity_id: entityId, value: value as string },
        });
        break;

      case "input_datetime":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_datetime",
          service: "set_datetime",
          service_data: { entity_id: entityId, datetime: value as string },
        });
        break;

      case "counter":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "counter",
          service: "set_value",
          service_data: { entity_id: entityId, value: value as number },
        });
        break;

      default:
        break;
    }
  }
}
