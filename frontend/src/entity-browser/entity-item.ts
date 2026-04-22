/**
 * Entity Item Component
 *
 * Displays a single entity with drag-and-drop support for binding to ST
 * variables.
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
  @property({ type: String }) declare currentCode: string;

  static styles = css`
    :host {
      display: block;
    }

    .entity-item {
      display: flex;
      align-items: center;
      gap: var(--space-3, 12px);
      padding: var(--space-3, 12px);
      cursor: grab;
      border-radius: var(--radius-md, 12px);
      transition:
        transform var(--transition-fast, 160ms ease),
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease);
      user-select: none;
      border: 1px solid transparent;
      margin-bottom: 6px;
    }

    .entity-item:hover {
      background: rgba(21, 31, 39, 0.96);
      border-color: rgba(88, 127, 146, 0.22);
      transform: translateX(1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
    }

    .entity-item:active {
      cursor: grabbing;
    }

    .entity-item:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .entity-item.dragging {
      opacity: 0.5;
      border-style: dashed;
      border-color: rgba(91, 212, 255, 0.5);
    }

    .direction-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .direction-indicator.input {
      background: var(--status-connecting, #3aa0ff);
      box-shadow: 0 0 8px rgba(58, 160, 255, 0.35);
    }

    .direction-indicator.output {
      background: var(--status-paused, #ffce73);
      box-shadow: 0 0 8px rgba(255, 206, 115, 0.35);
    }

    .entity-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(132, 212, 238, 0.95);
      background: rgba(14, 165, 215, 0.12);
      flex-shrink: 0;
    }

    .entity-icon ha-icon {
      width: 18px;
      height: 18px;
    }

    .entity-info {
      flex: 1;
      min-width: 0;
    }

    .entity-name {
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--ui-text-primary, #f3f7fb);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-id {
      margin-top: 2px;
      font-size: var(--font-size-xs, 11px);
      color: var(--ui-text-muted, #8ea1af);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-state {
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-semibold, 600);
      padding: 6px 10px;
      border-radius: var(--radius-pill, 999px);
      background: rgba(28, 39, 48, 0.92);
      color: var(--ui-text-primary, #f3f7fb);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .entity-state.on {
      background: rgba(66, 214, 164, 0.16);
      color: #8ff0c9;
    }

    .entity-state.off {
      background: rgba(111, 124, 135, 0.22);
      color: #c5d0d8;
    }

    .entity-state.unavailable {
      background: rgba(255, 107, 107, 0.16);
      color: #ffb2b2;
    }

    .entity-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .entity-action {
      min-height: 30px;
      padding: 0 10px;
      border-radius: var(--radius-pill, 999px);
      border: 1px solid rgba(88, 127, 146, 0.24);
      background: rgba(24, 35, 43, 0.94);
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-semibold, 600);
      cursor: pointer;
      transition:
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease),
        transform var(--transition-fast, 160ms ease);
    }

    .entity-action:hover {
      background: rgba(34, 48, 58, 0.96);
      border-color: rgba(120, 173, 199, 0.44);
      transform: translateY(-1px);
    }

    .entity-action.output {
      color: #ffdb97;
      border-color: rgba(255, 206, 115, 0.28);
    }

    .entity-action.remove {
      color: #ffb2b2;
      border-color: rgba(255, 107, 107, 0.24);
    }
  `;

  constructor() {
    super();
    this.currentCode = "";
  }

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

  private _hasBinding(): boolean {
    return !!this.currentCode && this.currentCode.includes(`'${this.entity.entityId}'`);
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
    const hasBinding = this._hasBinding();

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
