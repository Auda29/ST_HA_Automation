/**
 * Entity Browser Component
 *
 * Main component that manages WebSocket subscription to HA entities and provides
 * filtering/searching capabilities. Integrates with the entity list for display.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { subscribeEntities } from "home-assistant-js-websocket";
import type { EntityInfo, EntityFilter, DataTypeInference } from "./types";
import "./entity-list";
import type { EntityState } from "../online/types";

@customElement("st-entity-browser")
export class STEntityBrowser extends LitElement {
  @property({ attribute: false }) declare hass?: any;

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
      background:
        linear-gradient(180deg, rgba(15, 21, 27, 0.98), rgba(10, 14, 18, 0.98));
      color: var(--ui-text-primary, #f3f7fb);
      font-family: var(--font-ui, inherit);
    }

    .header {
      padding: var(--space-5, 20px) var(--space-4, 16px) var(--space-4, 16px);
      border-bottom: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.28));
    }

    .eyebrow {
      margin-bottom: 6px;
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }

    .header h2 {
      margin: 0 0 var(--space-3, 12px);
      font-size: var(--font-size-xl, 22px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .search-shell {
      position: relative;
      margin-bottom: var(--space-3, 12px);
    }

    .search-shell ha-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ui-text-muted, #8ea1af);
      --mdc-icon-size: 16px;
    }

    .search-box,
    .filter-select {
      width: 100%;
      box-sizing: border-box;
      min-height: 40px;
      border: 1px solid rgba(88, 127, 146, 0.22);
      border-radius: var(--radius-md, 12px);
      background: rgba(25, 34, 42, 0.94);
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-md, 14px);
      font-family: inherit;
      transition: var(--transition-fast, all 160ms ease);
    }

    .search-box {
      padding: 0 36px 0 38px;
    }

    .search-box:focus,
    .filter-select:focus {
      outline: none;
      border-color: rgba(71, 187, 226, 0.48);
      box-shadow: 0 0 0 3px rgba(14, 165, 215, 0.12);
    }

    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--ui-text-muted, #8ea1af);
      cursor: pointer;
      border-radius: var(--radius-sm, 6px);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast, all 160ms ease);
    }

    .search-clear:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .search-clear ha-icon {
      --mdc-icon-size: 14px;
    }

    .drag-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: var(--space-3, 12px);
      padding: 8px 12px;
      border-radius: var(--radius-md, 10px);
      background: rgba(14, 165, 215, 0.08);
      border: 1px dashed rgba(91, 212, 255, 0.3);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-xs, 11px);
      line-height: 1.4;
    }

    .drag-hint ha-icon {
      --mdc-icon-size: 14px;
      color: var(--ui-info, #6bc9ff);
      flex-shrink: 0;
    }

    .drag-hint kbd {
      padding: 1px 5px;
      border: 1px solid rgba(140, 169, 193, 0.26);
      border-radius: 4px;
      background: rgba(9, 17, 25, 0.9);
      color: var(--ui-text-primary, #f3f7fb);
      font-family: var(--font-mono, monospace);
      font-size: 10px;
    }

    .filters {
      display: grid;
      gap: var(--space-2, 8px);
      grid-template-columns: minmax(0, 1fr);
    }

    .checkbox-row {
      display: grid;
      gap: var(--space-2, 8px);
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 38px;
      padding: 0 12px;
      border-radius: var(--radius-md, 12px);
      background: rgba(17, 24, 30, 0.94);
      border: 1px solid rgba(88, 127, 146, 0.18);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .filter-checkbox input {
      accent-color: var(--ui-primary, #0ea5d7);
      margin: 0;
    }

    .status-bar {
      padding: var(--space-3, 12px) var(--space-4, 16px);
      font-size: var(--font-size-sm, 12px);
      color: var(--ui-text-secondary, #b6c4cf);
      border-bottom: 1px solid rgba(88, 127, 146, 0.18);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3, 12px);
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }

    .status-connected {
      color: var(--status-online, #42d6a4);
    }

    .status-error {
      color: var(--status-error, #ff6b6b);
    }

    .status-connecting {
      color: var(--status-connecting, #6bc9ff);
    }

    .status-connecting .status-dot {
      animation: entity-pulse 1.1s infinite;
    }

    @keyframes entity-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @media (prefers-reduced-motion: reduce) {
      .status-connecting .status-dot {
        animation: none;
      }
    }

    .entity-list-container {
      flex: 1;
      overflow: hidden;
    }

    .empty-state {
      padding: var(--space-8, 32px) var(--space-5, 20px);
      text-align: center;
      color: var(--ui-text-secondary, #b6c4cf);
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
      const previous = changedProperties.get("hass");
      const previousConnection = (previous as any)?.connection;
      const nextConnection = this.hass?.connection;

      if (previousConnection && previousConnection !== nextConnection) {
        this._disconnect();
      }

      if (nextConnection && !this._unsubscribe) {
        this._connect();
      }
    }
  }

  private async _connect(): Promise<void> {
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

      this._unsubscribe = subscribeEntities(this.hass.connection, (entities: any) => {
        this._handleEntityUpdate(entities);
      });
      this._isConnected = true;
    } catch (error) {
      this._error =
        error instanceof Error ? error.message : "Connection failed";
      this._isConnected = false;
      console.error("Failed to subscribe to entities", error);
    }
  }

  private _disconnect(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._isConnected = false;
  }

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
    this.requestUpdate();
  }

  private _getFriendlyName(entity: EntityState): string | undefined {
    if (entity.attributes?.friendly_name) {
      return entity.attributes.friendly_name as string;
    }
    return undefined;
  }

  private _getEntityIcon(entity: EntityState): string | undefined {
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
        : "Connecting to Home Assistant";

    return html`
      <div class="header">
        <div class="eyebrow">Entity Linker</div>
        <h2>Entity Browser</h2>
        <div class="search-shell">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            class="search-box"
            type="text"
            .value=${this._filter.searchQuery}
            @input=${this._handleSearchInput}
            placeholder="Filter entities, devices, or states"
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
        <div class="drag-hint">
          <ha-icon icon="mdi:drag-variant"></ha-icon>
          <span>
            Drag an entity onto the editor. Hold <kbd>Shift</kbd> for an output
            binding.
          </span>
        </div>
      </div>

      <div class="status-bar">
        <span class="status-indicator ${statusClass}">
          <span class="status-dot"></span>
          ${statusText}
        </span>
        <span>${entities.length} entities</span>
      </div>

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
              ></st-entity-list>
            `}
      </div>
    `;
  }

  private _clearSearch(): void {
    this._filter = { ...this._filter, searchQuery: "" };
    this.requestUpdate();
  }
}

export const inferDataType = STEntityBrowser.inferDataType;
