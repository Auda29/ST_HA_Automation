/**
 * Home Assistant API Wrapper
 *
 * Automation and script configs go over REST (`hass.callApi`), everything else
 * over the WebSocket connection. See `HAClient` in ./types for why.
 */

import type {
  HAClient,
  HAConnection,
  HAState,
  HAAutomationConfig,
  HAScriptConfig,
} from "./types";

// ============================================================================
// API Wrapper Class
// ============================================================================

export class HAApiClient {
  private readonly client: HAClient;
  private readonly connection: HAConnection;
  private static readonly HELPER_DOMAINS = new Set([
    "input_boolean",
    "input_number",
    "input_text",
    "input_datetime",
    "input_select",
    "counter",
    "timer",
  ]);

  constructor(client: HAClient) {
    this.client = client;
    this.connection = client.connection;
  }

  // ==========================================================================
  // Automation API (REST)
  // ==========================================================================

  private static automationPath(automationId: string): string {
    return `config/automation/config/${encodeURIComponent(automationId)}`;
  }

  async getAutomation(
    automationId: string,
  ): Promise<HAAutomationConfig | null> {
    try {
      return await this.client.callApi<HAAutomationConfig>(
        "GET",
        HAApiClient.automationPath(automationId),
      );
    } catch {
      return null;
    }
  }

  async saveAutomation(
    automationId: string,
    config: HAAutomationConfig,
  ): Promise<void> {
    await this.client.callApi<void>(
      "POST",
      HAApiClient.automationPath(automationId),
      config,
    );
  }

  async deleteAutomation(automationId: string): Promise<void> {
    await this.client.callApi<void>(
      "DELETE",
      HAApiClient.automationPath(automationId),
    );
  }

  async reloadAutomations(): Promise<void> {
    await this.connection.sendMessagePromise({
      type: "call_service",
      domain: "automation",
      service: "reload",
    });
  }

  // ==========================================================================
  // Script API (REST)
  // ==========================================================================

  private static scriptPath(scriptId: string): string {
    return `config/script/config/${encodeURIComponent(scriptId)}`;
  }

  async getScript(scriptId: string): Promise<HAScriptConfig | null> {
    try {
      return await this.client.callApi<HAScriptConfig>(
        "GET",
        HAApiClient.scriptPath(scriptId),
      );
    } catch {
      return null;
    }
  }

  async saveScript(scriptId: string, config: HAScriptConfig): Promise<void> {
    await this.client.callApi<void>(
      "POST",
      HAApiClient.scriptPath(scriptId),
      config,
    );
  }

  async deleteScript(scriptId: string): Promise<void> {
    await this.client.callApi<void>("DELETE", HAApiClient.scriptPath(scriptId));
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
      const [domain, name] = s.entity_id.split(".");
      return (
        !!name &&
        HAApiClient.HELPER_DOMAINS.has(domain) &&
        name.startsWith(prefix)
      );
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

  /**
   * HA derives a storage helper's immutable id from its name on create. Create
   * with the requested object id first, verify what HA allocated, then restore
   * the human-readable name through the update command (which keeps the id).
   */
  private async createHelperWithExactId(
    domain: string,
    entityId: string | undefined,
    config: Record<string, unknown> & { name: string },
  ): Promise<void> {
    if (!entityId) {
      await this.connection.sendMessagePromise({
        type: `${domain}/create`,
        ...config,
      });
      return;
    }

    const [entityDomain, objectId, ...extraParts] = entityId.split(".");
    if (entityDomain !== domain || !objectId || extraParts.length > 0) {
      throw new Error(
        `Invalid ${domain} entity id '${entityId}' for helper creation`,
      );
    }

    const { name: friendlyName, ...settings } = config;
    const created = await this.connection.sendMessagePromise<{ id?: unknown }>({
      type: `${domain}/create`,
      name: objectId,
      ...settings,
    });
    const createdObjectId = created?.id;

    if (typeof createdObjectId !== "string") {
      throw new Error(
        `Home Assistant did not return an id while creating ${entityId}`,
      );
    }

    if (createdObjectId !== objectId) {
      await this.deleteHelper(`${domain}.${createdObjectId}`);
      throw new Error(
        `Home Assistant created ${domain}.${createdObjectId} instead of ${entityId}`,
      );
    }

    if (friendlyName === objectId) {
      return;
    }

    try {
      await this.connection.sendMessagePromise({
        type: `${domain}/update`,
        [`${domain}_id`]: objectId,
        name: friendlyName,
        ...settings,
      });
    } catch (error) {
      try {
        await this.deleteHelper(entityId);
      } catch {
        // Preserve the original update error if cleanup also fails.
      }
      throw error;
    }
  }

  async createInputBoolean(config: {
    id?: string;
    name: string;
    initial?: boolean;
  }): Promise<void> {
    await this.createHelperWithExactId("input_boolean", config.id, {
      name: config.name,
      initial: config.initial ?? false,
    });
  }

  async createInputNumber(config: {
    id?: string;
    name: string;
    initial?: number;
    min?: number;
    max?: number;
    step?: number;
    mode?: "box" | "slider";
  }): Promise<void> {
    await this.createHelperWithExactId("input_number", config.id, {
      name: config.name,
      initial: config.initial ?? 0,
      min: config.min ?? 0,
      max: config.max ?? 100,
      step: config.step ?? 1,
      mode: config.mode ?? "box",
    });
  }

  async createInputText(config: {
    id?: string;
    name: string;
    initial?: string;
    pattern?: string;
  }): Promise<void> {
    await this.createHelperWithExactId("input_text", config.id, {
      name: config.name,
      initial: config.initial ?? "",
      pattern: config.pattern,
    });
  }

  async createInputDateTime(config: {
    id?: string;
    name: string;
    initial?: string;
  }): Promise<void> {
    await this.createHelperWithExactId("input_datetime", config.id, {
      name: config.name,
      has_date: true,
      has_time: true,
      initial: config.initial ?? "",
    });
  }

  async createTimer(config: {
    id?: string;
    name: string;
    duration?: string;
  }): Promise<void> {
    await this.createHelperWithExactId("timer", config.id, {
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
