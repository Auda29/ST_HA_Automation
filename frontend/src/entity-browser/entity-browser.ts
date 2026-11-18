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
  @property({ attribute: false }) declare hass?: any;
  @property({ type: String }) declare currentCode: string;
  @state() declare private _bindingFeedback: string;

  private _entities: Map<string, EntityInfo> = new Map();
  private _filter: EntityFilter = {
    searchQuery: "",
    selectedDomain: null,
    showInputsOnly: false,
    showOutputsOnly: false,
  };
  private _domains: string[] = [];
  private _isConnected = false;
  private _error: string | null = null;

  private _unsubscribe: (() => void) | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-size: 13px;
    }

    .header {
      flex: none;
      display: grid;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }

    h2 {
      margin: 0;
      padding-right: 36px;
      font-size: 16px;
      line-height: 28px;
    }

    .search-shell {
      position: relative;
    }

    .search-shell > ha-icon {
      position: absolute;
      inset: 8px auto auto 8px;
      --mdc-icon-size: 16px;
      pointer-events: none;
    }

    .search-box,
    .filter-select {
      box-sizing: border-box;
      width: 100%;
      min-height: 32px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      padding: 0 6px;
      color: inherit;
      background: var(--card-background-color, #fff);
      font: inherit;
    }

    .search-box {
      padding-inline: 30px;
    }

    .search-clear {
      position: absolute;
      inset: 2px 2px 2px auto;
      padding: 0 4px;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      --mdc-icon-size: 16px;
    }

    .filters,
    .checkbox-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 10px;
    }

    .filter-select {
      flex: 1 1 9em;
      width: auto;
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
    }

    .status-bar,
    .binding-feedback {
      flex: none;
      padding: 5px 12px;
      color: var(--secondary-text-color, #666);
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      gap: 6px;
    }

    .status-error {
      color: var(--error-color, #b00020);
    }

    .binding-feedback:empty {
      padding: 0;
    }

    .entity-list-container {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .empty-state {
      padding: 16px;
      color: var(--secondary-text-color, #666);
    }
  `;

  constructor() {
    super();
    this.currentCode = "";
    this._bindingFeedback = "";
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated && this.hass?.connection) {
      this._connect();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disconnect();
  }

  protected willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has("hass")) {
      const previous = changedProperties.get("hass");
      const previousConnection = (previous as any)?.connection;
      const nextConnection = this.hass?.connection;

      if (previousConnection && previousConnection !== nextConnection) {
        this._disconnect();
      }

      if (nextConnection && !this._unsubscribe && this.isConnected) {
        this._connect();
      }
    }
  }

  private _connect(): void {
    if (!this.hass?.connection) {
      this._error = "Home Assistant connection not available";
      return;
    }

    try {
      this._error = null;
      this._isConnected = false;

      if (!this.hass.connection.haVersion && this.hass.config?.version) {
        this.hass.connection.haVersion = this.hass.config.version;
      }

      if (this.hass.states) {
        this._handleEntityUpdate(this.hass.states);
      }

      const connection = this.hass.connection;
      this._unsubscribe = subscribeEntities(connection, (entities) => {
        if (this.isConnected && this.hass?.connection === connection) {
          this._handleEntityUpdate(entities);
        }
      });
      this._isConnected = true;
    } catch (error) {
      this._error =
        error instanceof Error ? error.message : "Connection failed";
      this._isConnected = false;
      console.error("Failed to subscribe to entities", error);
    }
    this.requestUpdate();
  }

  private _disconnect(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._isConnected = false;
    this._entities.clear();
    this._domains = [];
    this._error = null;
    this.requestUpdate();
  }

  showBindingFeedback(message: string): void {
    this._bindingFeedback = message;
  }

  private _handleEntityUpdate(
    entities: Record<string, Pick<EntityState, "state" | "attributes"> & {
      lastChanged?: string;
      last_changed?: string;
    }>,
  ): void {
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
        lastChanged: entityState.last_changed ?? entityState.lastChanged,
      };

      entityMap.set(entityId, entityInfo);
    }

    this._entities = entityMap;
    this._domains = Array.from(domainSet).sort();
    this.requestUpdate();
  }

  private _getFriendlyName(entity: Pick<EntityState, "attributes">): string | undefined {
    if (entity.attributes?.friendly_name) {
      return entity.attributes.friendly_name as string;
    }
    return undefined;
  }

  private _getEntityIcon(entity: Pick<EntityState, "attributes">): string | undefined {
    if (entity.attributes?.icon) {
      return entity.attributes.icon as string;
    }
    return undefined;
  }

  public static inferDataType(entity: EntityInfo): DataTypeInference {
    const domain = entity.domain;

    if (
      ["binary_sensor", "input_boolean", "switch", "light"].includes(domain)
    ) {
      return {
        dataType: "BOOL",
        confidence: "high",
        reason: `Domain ${domain} typically uses boolean values`,
      };
    }

    if (domain === "input_number" || domain === "number") {
      return {
        dataType: "REAL",
        confidence: "high",
        reason: `Domain ${domain} typically uses numeric values`,
      };
    }

    if (domain === "climate") {
      return {
        dataType: "REAL",
        confidence: "medium",
        reason: "Climate entities often expose temperature setpoints",
      };
    }

    if (domain === "sensor") {
      const numericState = Number(entity.state);
      if (!Number.isNaN(numericState)) {
        const isInteger =
          Number.isInteger(numericState) && !entity.state.includes(".");
        return {
          dataType: isInteger ? "INT" : "REAL",
          confidence: "medium",
          reason: isInteger
            ? "Sensor state is a whole number"
            : "Sensor state is a decimal number",
        };
      }

      return {
        dataType: "STRING",
        confidence: "medium",
        reason: "Sensor state is non-numeric text",
      };
    }

    return {
      dataType: "STRING",
      confidence: "low",
      reason: "Fallback type for unclassified entity domains",
    };
  }

  private _getFilteredEntities(): EntityInfo[] {
    return Array.from(this._entities.values());
  }

  private _handleSearchInput(e: Event): void {
    this._filter = {
      ...this._filter,
      searchQuery: (e.target as HTMLInputElement).value,
    };
    this.requestUpdate();
  }

  private _handleDomainChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this._filter = {
      ...this._filter,
      selectedDomain: value || null,
    };
    this.requestUpdate();
  }

  private _handleInputsToggle(e: Event): void {
    this._filter = {
      ...this._filter,
      showInputsOnly: (e.target as HTMLInputElement).checked,
    };
    this.requestUpdate();
  }

  private _handleOutputsToggle(e: Event): void {
    this._filter = {
      ...this._filter,
      showOutputsOnly: (e.target as HTMLInputElement).checked,
    };
    this.requestUpdate();
  }

  render() {
    const entities = this._getFilteredEntities();

    const statusClass = this._error
      ? "status-error"
      : this._isConnected
        ? "status-connected"
        : "status-connecting";
    const statusText = this._error
      ? this._error
      : this._isConnected
        ? "Connected to Home Assistant"
        : this.hass?.connection
          ? "Connecting to Home Assistant"
          : "Home Assistant connection unavailable";

    return html`
      <div class="header">
        <h2>Entity Browser</h2>
        <div class="search-shell">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            class="search-box"
            type="text"
            .value=${this._filter.searchQuery}
            @input=${this._handleSearchInput}
            placeholder="Filter entities by name or ID"
            aria-label="Search entities"
          />
          ${this._filter.searchQuery
            ? html`
                <button
                  class="search-clear"
                  @click=${this._clearSearch}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `
            : ""}
        </div>
        <div class="filters">
          <select
            class="filter-select"
            @change=${this._handleDomainChange}
            aria-label="Filter by domain"
          >
            <option value="">All Domains</option>
            ${this._domains.map(
              (domain) => html`
                <option
                  value=${domain}
                  ?selected=${this._filter.selectedDomain === domain}
                >
                  ${domain}
                </option>
              `,
            )}
          </select>
          <div class="checkbox-row">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                .checked=${this._filter.showInputsOnly}
                @change=${this._handleInputsToggle}
              />
              Inputs only
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                .checked=${this._filter.showOutputsOnly}
                @change=${this._handleOutputsToggle}
              />
              Outputs only
            </label>
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span class="status-indicator ${statusClass}">
          ${statusText}
        </span>
        <span class="status-count">${entities.length} entities</span>
      </div>
      <div class="binding-feedback" role="status" aria-live="polite">${this._bindingFeedback || ""}</div>

      <div class="entity-list-container">
        ${entities.length === 0
          ? html`
              <div class="empty-state">
                ${this._error
                  ? "Entity stream unavailable"
                  : "Waiting for entities from Home Assistant"}
              </div>
            `
          : html`
              <st-entity-list
                .entities=${entities}
                .filter=${this._filter}
                .currentCode=${this.currentCode}
              ></st-entity-list>
            `}
      </div>
    `;
  }

  async focusSearch(): Promise<void> {
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLInputElement>(".search-box")?.focus();
  }

  private _clearSearch(): void {
    this._filter = { ...this._filter, searchQuery: "" };
    this.requestUpdate();
  }
}

export const inferDataType = STEntityBrowser.inferDataType;
