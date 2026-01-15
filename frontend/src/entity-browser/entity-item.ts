/**
 * Entity Item Component
 * 
 * Displays a single entity with drag-and-drop support for binding to ST variables.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntityInfo, DragEntityData, InferredDataType } from "./types";

@customElement("st-entity-item")
export class STEntityItem extends LitElement {
  @property({ type: Object }) declare entity: EntityInfo;
  @property({ type: String }) declare inferredType: InferredDataType;
  @property({ type: Boolean }) declare isInput: boolean;
  @property({ type: Boolean }) declare isOutput: boolean;

  static styles = css`
    :host {
      display: block;
    }
    .entity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: grab;
      border-radius: 4px;
      transition: background-color 0.2s;
      user-select: none;
    }
    .entity-item:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .entity-item:active {
      cursor: grabbing;
    }
    .entity-item.dragging {
      opacity: 0.5;
    }
    .entity-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-text-color);
    }
    .entity-icon ha-icon {
      width: 20px;
      height: 20px;
    }
    .entity-info {
      flex: 1;
      min-width: 0;
    }
    .entity-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entity-id {
      font-size: 11px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entity-state {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      background-color: var(--secondary-background-color);
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .entity-state.on {
      background-color: var(--success-color, #4caf50);
      color: white;
    }
    .entity-state.off {
      background-color: var(--disabled-color, #9e9e9e);
      color: white;
    }
    .entity-state.unavailable {
      background-color: var(--error-color, #f44336);
      color: white;
    }
    .direction-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .direction-indicator.input {
      background-color: var(--info-color, #2196f3);
    }
    .direction-indicator.output {
      background-color: var(--warning-color, #ff9800);
    }
  `;

  private _handleDragStart(e: DragEvent): void {
    if (!e.dataTransfer || !this.entity) return;

    const direction = e.shiftKey ? "output" : "input";
    const binding = direction === "input" ? "%I*" : "%Q*";
    const varName = this._entityIdToVarName(this.entity.entityId);
    const bindingSyntax = `${varName} AT ${binding} : ${this.inferredType} := '${this.entity.entityId}';`;

    const dragData: DragEntityData = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction,
      bindingSyntax,
    };

    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", bindingSyntax);
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));

    this.classList.add("dragging");
  }

  private _handleDragEnd(): void {
    this.classList.remove("dragging");
  }

  private _entityIdToVarName(entityId: string): string {
    // Convert entity ID to valid ST variable name
    // e.g., "sensor.kitchen_temperature" -> "kitchenTemperature"
    const parts = entityId.split(".");
    if (parts.length < 2) return entityId;

    const name = parts[1];
    // Convert snake_case to camelCase
    return name
      .split("_")
      .map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join("");
  }

  private _getStateClass(state: string): string {
    const normalized = state.toLowerCase();
    if (normalized === "on" || normalized === "open" || normalized === "active") {
      return "on";
    }
    if (normalized === "off" || normalized === "closed" || normalized === "inactive") {
      return "off";
    }
    if (normalized === "unavailable" || normalized === "unknown") {
      return "unavailable";
    }
    return "";
  }

  private _getEntityIcon(): string {
    if (this.entity.icon) {
      return this.entity.icon;
    }
    // Default icons by domain
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
    };
    return domainIcons[this.entity.domain] || "mdi:circle";
  }

  render() {
    if (!this.entity) return html``;

    const stateClass = this._getStateClass(this.entity.state);
    const icon = this._getEntityIcon();
    const displayName = this.entity.friendlyName || this.entity.entityId;

    return html`
      <div
        class="entity-item"
        draggable="true"
        @dragstart=${this._handleDragStart}
        @dragend=${this._handleDragEnd}
        title="Drag to editor (Shift+drag for output binding)"
      >
        ${this.isInput || this.isOutput
          ? html`<div
              class="direction-indicator ${this.isInput ? "input" : "output"}"
              title="${this.isInput ? "Input" : "Output"}"
            ></div>`
          : ""}
        <div class="entity-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="entity-info">
          <div class="entity-name">${displayName}</div>
          <div class="entity-id">${this.entity.entityId}</div>
        </div>
        <div class="entity-state ${stateClass}">${this.entity.state}</div>
      </div>
    `;
  }
}
