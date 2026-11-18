/**
 * Entity Item Component
 *
 * Displays a single entity with drag-and-drop support for binding to ST
 * variables.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntityInfo, DragEntityData, InferredDataType } from "./types";
import { ENTITY_BINDING_MIME_TYPE } from "../entity-binding";

@customElement("st-entity-item")
export class STEntityItem extends LitElement {
  @property({ type: Object }) declare entity: EntityInfo;
  @property({ type: String }) declare inferredType: InferredDataType;
  @property({ type: Boolean }) declare isInput: boolean;
  @property({ type: Boolean }) declare isOutput: boolean;
  @property({ type: Boolean }) declare hasBinding: boolean;

  static styles = css`
    :host {
      display: block;
    }

    .entity-item {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 6px 4px;
      border-top: 1px solid var(--divider-color, #ddd);
      cursor: grab;
    }

    .entity-item.dragging {
      opacity: .5;
    }

    .entity-icon,
    .direction-indicator {
      display: inline-flex;
      color: var(--secondary-text-color, #666);
      --mdc-icon-size: 16px;
    }

    .direction-indicator::before {
      content: "";
      width: 5px;
      height: 5px;
      background: var(--primary-color, #03a9f4);
      border-radius: 50%;
    }

    .entity-info {
      flex: 1 1 140px;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .entity-name {
      font-size: 13px;
      font-weight: 600;
    }

    .entity-id,
    .entity-state {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
    }

    .entity-state.on {
      color: var(--success-color, #2e7d32);
    }

    .entity-state.unavailable {
      color: var(--error-color, #b00020);
    }

    .entity-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .entity-action {
      min-height: 30px;
      padding: 0 6px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font: inherit;
      cursor: pointer;
    }

    .entity-action:hover {
      background: var(--secondary-background-color, #eee);
    }

    .entity-action:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }

    .entity-action.remove {
      color: var(--error-color, #b00020);
    }
  `;

  private _handleDragStart(e: DragEvent): void {
    if (!e.dataTransfer || !this.entity) return;

    const direction = e.shiftKey ? "output" : "input";
    const bindingSyntax = this._buildBindingSyntax(direction);

    const dragData: DragEntityData = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction,
      bindingSyntax,
    };

    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(ENTITY_BINDING_MIME_TYPE, bindingSyntax);
    e.dataTransfer.setData("text/plain", bindingSyntax);
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));

    this.classList.add("dragging");
  }

  private _handleDragEnd(): void {
    this.classList.remove("dragging");
  }

  private _buildBindingSyntax(direction: "input" | "output"): string {
    const binding = direction === "input" ? "%I*" : "%Q*";
    const varName = this._entityIdToVarName(this.entity.entityId);
    return `${varName} AT ${binding} : ${this.inferredType} := '${this.entity.entityId}';`;
  }

  private _dispatchInsertBinding(
    direction: "input" | "output",
    event: Event,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("insert-binding", {
        detail: {
          entityId: this.entity.entityId,
          direction,
          bindingSyntax: this._buildBindingSyntax(direction),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _dispatchRemoveBinding(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("remove-binding", {
        detail: { entityId: this.entity.entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _entityIdToVarName(entityId: string): string {
    const parts = entityId.split(".");
    if (parts.length < 2) return entityId;

    const name = parts[1];
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
    if (
      normalized === "off" ||
      normalized === "closed" ||
      normalized === "inactive"
    ) {
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
    const hasBinding = this.hasBinding;

    return html`
      <div
        class="entity-item"
        draggable="true"
        tabindex="0"
        role="button"
        aria-label="${displayName} - ${this.entity.entityId} - drag to editor to bind"
        @dragstart=${this._handleDragStart}
        @dragend=${this._handleDragEnd}
        title="Drag to editor. Hold Shift while dragging for an output binding."
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
        <div class="entity-actions">
          <button
            class="entity-action"
            @click=${(e: Event) => this._dispatchInsertBinding("input", e)}
            title="Insert input binding"
            aria-label="Insert input binding for ${displayName}"
          >
            + Input
          </button>
          <button
            class="entity-action output"
            @click=${(e: Event) => this._dispatchInsertBinding("output", e)}
            title="Insert output binding"
            aria-label="Insert output binding for ${displayName}"
          >
            + Output
          </button>
          ${hasBinding
            ? html`
                <button
                  class="entity-action remove"
                  @click=${(e: Event) => this._dispatchRemoveBinding(e)}
                  title="Remove binding from code"
                  aria-label="Remove binding for ${displayName}"
                >
                  Remove
                </button>
              `
            : ""}
        </div>
      </div>
    `;
  }
}
