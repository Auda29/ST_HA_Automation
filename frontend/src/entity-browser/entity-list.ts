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
      padding: var(--space-3, 12px);
      box-sizing: border-box;
    }

    .domain-group {
      margin-bottom: var(--space-3, 12px);
      border: 1px solid rgba(88, 127, 146, 0.16);
      border-radius: var(--radius-lg, 16px);
      background: rgba(14, 20, 26, 0.92);
      overflow: hidden;
    }

    .domain-header {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      padding: var(--space-3, 12px) var(--space-4, 16px);
      cursor: pointer;
      user-select: none;
      color: var(--ui-text-primary, #f3f7fb);
      transition: background var(--transition-fast, 160ms ease);
    }

    .domain-header:hover {
      background: rgba(24, 35, 43, 0.96);
    }

    .domain-icon {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(14, 165, 215, 0.14);
      color: rgba(132, 212, 238, 0.95);
    }

    .domain-icon ha-icon {
      width: 18px;
      height: 18px;
    }

    .domain-name {
      flex: 1;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-semibold, 600);
      text-transform: capitalize;
    }

    .domain-count {
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-pill, 999px);
      background: rgba(24, 37, 46, 0.92);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .domain-toggle {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ui-text-muted, #8ea1af);
      transition: transform var(--transition-fast, 160ms ease);
    }

    .domain-toggle.expanded {
      transform: rotate(90deg);
    }

    .domain-entities {
      padding: 0 var(--space-2, 8px) var(--space-2, 8px);
    }

    .empty-state {
      padding: var(--space-8, 32px) var(--space-5, 20px);
      text-align: center;
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-md, 14px);
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
      if (this.filter.searchQuery) {
        const query = this.filter.searchQuery.toLowerCase();
        const matchesName =
          entity.entityId.toLowerCase().includes(query) ||
          (entity.friendlyName &&
            entity.friendlyName.toLowerCase().includes(query));
        if (!matchesName) return false;
      }

      if (
        this.filter.selectedDomain &&
        entity.domain !== this.filter.selectedDomain
      ) {
        return false;
      }

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
