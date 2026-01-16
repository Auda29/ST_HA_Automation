/**
 * Entity Browser Component
 *
 * Main component that manages WebSocket subscription to HA entities and provides
 * filtering/searching capabilities. Integrates with the entity list for display.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { subscribeEntities } from "home-assistant-js-websocket";
import type { EntityInfo, EntityFilter, DataTypeInference } from "./types";
import "./entity-list";
import type { EntityState } from "../online/types";

@customElement("st-entity-browser")
export class STEntityBrowser extends LitElement {
  @property({ attribute: false }) declare hass?: any; // Home Assistant object with connection

  @state() private _entities: Map<string, EntityInfo> = new Map();
  @state() private _filter: EntityFilter = {
    searchQuery: "",
    selectedDomain: null,
    showInputsOnly: false,
    showOutputsOnly: false,
  };
  @state() private _domains: string[] = [];
  @state() private _isConnected: boolean = false;
  @state() private _error: string | null = null;

  private _unsubscribe: (() => void) | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
    }
    .header {
      padding: 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    .header h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .search-box {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 14px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    .search-box:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .filters {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .filter-select {
      flex: 1;
      min-width: 120px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--primary-text-color);
    }
    .filter-checkbox input {
      margin: 0;
    }
    .status-bar {
      padding: 8px 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      display: flex;
      justify-content: space-between;
    }
    .status-connected {
      color: var(--success-color, #4caf50);
    }
    .status-error {
      color: var(--error-color, #f44336);
    }
    .entity-list-container {
      flex: 1;
      overflow: hidden;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.hass?.connection) {
      this._connect();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disconnect();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has("hass")) {
      // Reconnect if hass connection changes
      this._disconnect();
      if (this.hass?.connection) {
        this._connect();
      }
    }
  }

  /**
   * Connect to HA WebSocket and subscribe to entity updates
   */
  private async _connect(): Promise<void> {
    if (!this.hass?.connection) {
      this._error = "Home Assistant connection not available";
      return;
    }

    try {
      this._error = null;
      this._isConnected = false;

      // Subscribe to all entity state changes
      this._unsubscribe = subscribeEntities(
        this.hass.connection,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entities: any) => {
          this._handleEntityUpdate(entities);
        },
      );

      this._isConnected = true;
    } catch (error) {
      this._error =
        error instanceof Error ? error.message : "Connection failed";
      this._isConnected = false;
      console.error("Failed to subscribe to entities", error);
    }
  }

  /**
   * Disconnect from WebSocket subscription
   */
  private _disconnect(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._isConnected = false;
  }

  /**
   * Handle entity state updates from WebSocket
   */
  private _handleEntityUpdate(entities: Record<string, EntityState>): void {
    const entityMap = new Map<string, EntityInfo>();
    const domainSet = new Set<string>();

    for (const [entityId, entityState] of Object.entries(entities)) {
      const domain = entityId.split(".")[0];
      domainSet.add(domain);

      const entityInfo: EntityInfo = {
        entityId,
        state: entityState.state,
        attributes: entityState.attributes || {},
        domain,
        friendlyName: this._getFriendlyName(entityState),
        deviceClass: entityState.attributes?.device_class as string | undefined,
        icon: this._getEntityIcon(entityState),
        lastChanged: entityState.lastChanged,
      };

      entityMap.set(entityId, entityInfo);
    }

    this._entities = entityMap;
    this._domains = Array.from(domainSet).sort();
  }

  /**
   * Extract friendly name from entity state
   */
  private _getFriendlyName(entity: EntityState): string | undefined {
    if (entity.attributes?.friendly_name) {
      return entity.attributes.friendly_name as string;
    }
    return undefined;
  }

  /**
   * Extract icon from entity state
   */
  private _getEntityIcon(entity: EntityState): string | undefined {
    if (entity.attributes?.icon) {
      return entity.attributes.icon as string;
    }
    return undefined;
  }

  /**
   * Infer data type from entity
   */
  public static inferDataType(entity: EntityInfo): DataTypeInference {
    const domain = entity.domain;

    // Binary entities -> BOOL
    if (
      ["binary_sensor", "input_boolean", "switch", "light"].includes(domain)
    ) {
      return {
        dataType: "BOOL",
        confidence: "high",
        reason: `Domain ${domain} typically uses boolean values`,
      };
    }

    // Numeric input entities -> REAL
    if (domain === "input_number" || domain === "number") {
      return {
        dataType: "REAL",
        confidence: "high",
        reason: `Domain ${domain} uses numeric values`,
      };
    }

    // Sensor entities - try to parse state
    if (domain === "sensor") {
      const numValue = parseFloat(entity.state);
      if (!isNaN(numValue)) {
        // Check if it's an integer
        if (Number.isInteger(numValue)) {
          return {
            dataType: "INT",
            confidence: "medium",
            reason: "Sensor state is a numeric integer",
          };
        }
        return {
          dataType: "REAL",
          confidence: "medium",
          reason: "Sensor state is a numeric value",
        };
      }
      return {
        dataType: "STRING",
        confidence: "medium",
        reason: "Sensor state is non-numeric",
      };
    }

    // Default to STRING
    return {
      dataType: "STRING",
      confidence: "low",
      reason: "Unknown domain, defaulting to STRING",
    };
  }

  private _handleSearchChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._filter = {
      ...this._filter,
      searchQuery: input.value,
    };
  }

  private _handleDomainChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._filter = {
      ...this._filter,
      selectedDomain: select.value || null,
    };
  }

  private _handleInputsOnlyChange(e: Event): void {
    const checkbox = e.target as HTMLInputElement;
    this._filter = {
      ...this._filter,
      showInputsOnly: checkbox.checked,
      showOutputsOnly: false, // Mutually exclusive
    };
  }

  private _handleOutputsOnlyChange(e: Event): void {
    const checkbox = e.target as HTMLInputElement;
    this._filter = {
      ...this._filter,
      showInputsOnly: false, // Mutually exclusive
      showOutputsOnly: checkbox.checked,
    };
  }

  render() {
    const entityArray = Array.from(this._entities.values());

    return html`
      <div class="header">
        <h2>Entity Browser</h2>
        <input
          type="text"
          class="search-box"
          placeholder="🔍 Filter entities..."
          .value=${this._filter.searchQuery}
          @input=${this._handleSearchChange}
        />
        <div class="filters">
          <select
            class="filter-select"
            @change=${this._handleDomainChange}
            .value=${this._filter.selectedDomain || ""}
          >
            <option value="">All Domains</option>
            ${this._domains.map(
              (domain) => html` <option value=${domain}>${domain}</option> `,
            )}
          </select>
          <label class="filter-checkbox">
            <input
              type="checkbox"
              .checked=${this._filter.showInputsOnly}
              @change=${this._handleInputsOnlyChange}
            />
            Inputs Only
          </label>
          <label class="filter-checkbox">
            <input
              type="checkbox"
              .checked=${this._filter.showOutputsOnly}
              @change=${this._handleOutputsOnlyChange}
            />
            Outputs Only
          </label>
        </div>
      </div>
      <div class="status-bar">
        <span class=${this._isConnected ? "status-connected" : ""}>
          ${this._isConnected
            ? `✓ ${entityArray.length} entities`
            : "Connecting..."}
        </span>
        ${this._error
          ? html`<span class="status-error">${this._error}</span>`
          : ""}
      </div>
      <div class="entity-list-container">
        ${this._isConnected
          ? html`
              <st-entity-list
                .entities=${entityArray}
                .filter=${this._filter}
              ></st-entity-list>
            `
          : html`
              <div class="empty-state">
                ${this._error || "Connecting to Home Assistant..."}
              </div>
            `}
      </div>
    `;
  }
}

// Export the inferDataType function for use in other components
export function inferDataType(entity: EntityInfo): DataTypeInference {
  return STEntityBrowser.inferDataType(entity);
}
