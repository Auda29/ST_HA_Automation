/**
 * Entity List Component
 * 
 * Displays entities grouped by domain with filtering and search capabilities.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { EntityInfo, DomainGroup, EntityFilter } from "./types";
import "./entity-item";
import { inferDataType } from "./entity-browser";

@customElement("st-entity-list")
export class STEntityList extends LitElement {
  @property({ type: Array }) declare entities: EntityInfo[];
  @property({ type: Object }) declare filter: EntityFilter;

  constructor() {
    super();
    this.entities = [];
    this.filter = {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: false,
      showOutputsOnly: false,
    };
  }

  @state() private _expandedDomains: Set<string> = new Set();

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }
    .domain-group {
      margin-bottom: 8px;
    }
    .domain-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      color: var(--primary-text-color);
      background-color: var(--secondary-background-color);
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .domain-header:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .domain-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .domain-icon ha-icon {
      width: 20px;
      height: 20px;
    }
    .domain-name {
      flex: 1;
      font-size: 14px;
    }
    .domain-count {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .domain-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .domain-toggle.expanded {
      transform: rotate(90deg);
    }
    .domain-entities {
      margin-top: 4px;
      padding-left: 8px;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 14px;
    }
  `;

  private _getDomainIcon(domain: string): string {
    const domainIcons: Record<string, string> = {
      light: "mdi:lightbulb",
      switch: "mdi:toggle-switch",
      sensor: "mdi:gauge",
      binary_sensor: "mdi:radiobox-marked",
      input_boolean: "mdi:toggle-switch-outline",
      input_number: "mdi:counter",
      number: "mdi:counter",
      climate: "mdi:thermostat",
      cover: "mdi:window-shutter",
      fan: "mdi:fan",
      lock: "mdi:lock",
      media_player: "mdi:cast",
      person: "mdi:account",
      device_tracker: "mdi:account-multiple",
      sun: "mdi:weather-sunny",
      weather: "mdi:weather-cloudy",
    };
    return domainIcons[domain] || "mdi:circle";
  }

  private _isInputEntity(entity: EntityInfo): boolean {
    // Entities that are typically read-only (inputs)
    const inputDomains = [
      "sensor",
      "binary_sensor",
      "input_number",
      "input_text",
      "input_select",
      "sun",
      "weather",
    ];
    return inputDomains.includes(entity.domain);
  }

  private _isOutputEntity(entity: EntityInfo): boolean {
    // Entities that can be controlled (outputs)
    const outputDomains = [
      "light",
      "switch",
      "input_boolean",
      "cover",
      "fan",
      "climate",
      "lock",
      "media_player",
    ];
    return outputDomains.includes(entity.domain);
  }

  private _filterEntities(entities: EntityInfo[]): EntityInfo[] {
    return entities.filter((entity) => {
      // Search filter
      if (this.filter.searchQuery) {
        const query = this.filter.searchQuery.toLowerCase();
        const matchesName =
          entity.entityId.toLowerCase().includes(query) ||
          (entity.friendlyName &&
            entity.friendlyName.toLowerCase().includes(query));
        if (!matchesName) return false;
      }

      // Domain filter
      if (
        this.filter.selectedDomain &&
        entity.domain !== this.filter.selectedDomain
      ) {
        return false;
      }

      // Input/Output filter
      if (this.filter.showInputsOnly && !this._isInputEntity(entity)) {
        return false;
      }
      if (this.filter.showOutputsOnly && !this._isOutputEntity(entity)) {
        return false;
      }

      return true;
    });
  }

  private _groupByDomain(entities: EntityInfo[]): DomainGroup[] {
    const groups = new Map<string, EntityInfo[]>();

    for (const entity of entities) {
      if (!groups.has(entity.domain)) {
        groups.set(entity.domain, []);
      }
      groups.get(entity.domain)!.push(entity);
    }

    const domainGroups: DomainGroup[] = [];
    for (const [domain, domainEntities] of groups.entries()) {
      domainGroups.push({
        domain,
        entities: domainEntities.sort((a, b) =>
          (a.friendlyName || a.entityId).localeCompare(
            b.friendlyName || b.entityId,
          ),
        ),
        icon: this._getDomainIcon(domain),
        expanded: this._expandedDomains.has(domain),
      });
    }

    // Sort by domain name
    return domainGroups.sort((a, b) => a.domain.localeCompare(b.domain));
  }

  private _toggleDomain(domain: string): void {
    if (this._expandedDomains.has(domain)) {
      this._expandedDomains.delete(domain);
    } else {
      this._expandedDomains.add(domain);
    }
    this._expandedDomains = new Set(this._expandedDomains);
    this.requestUpdate();
  }

  render() {
    const filtered = this._filterEntities(this.entities);
    const groups = this._groupByDomain(filtered);

    if (groups.length === 0) {
      return html`
        <div class="empty-state">
          ${this.filter.searchQuery
            ? "No entities match your search"
            : "No entities available"}
        </div>
      `;
    }

    return html`
      ${groups.map(
        (group) => html`
          <div class="domain-group">
            <div
              class="domain-header"
              @click=${() => this._toggleDomain(group.domain)}
            >
              <div class="domain-icon">
                <ha-icon .icon=${group.icon}></ha-icon>
              </div>
              <div class="domain-name">${group.domain}</div>
              <div class="domain-count">${group.entities.length}</div>
              <div class="domain-toggle ${group.expanded ? "expanded" : ""}">
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </div>
            </div>
            ${group.expanded
              ? html`
                  <div class="domain-entities">
                    ${group.entities.map(
                      (entity) => html`
                        <st-entity-item
                          .entity=${entity}
                          .inferredType=${inferDataType(entity).dataType}
                          .isInput=${this._isInputEntity(entity)}
                          .isOutput=${this._isOutputEntity(entity)}
                        ></st-entity-item>
                      `,
                    )}
                  </div>
                `
              : ""}
          </div>
        `,
      )}
    `;
  }
}
