/**
 * Online Mode Toolbar Component
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { OnlineModeState, OnlineStatus } from "./types";

@customElement("st-online-toolbar")
export class OnlineToolbar extends LitElement {
  @property({ type: Object }) declare state: OnlineModeState;
  @state() declare private _showSettings: boolean;

  constructor() {
    super();
    this._showSettings = false;
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-3, 12px);
      padding: var(--space-3, 12px) var(--space-5, 20px);
      background:
        linear-gradient(180deg, rgba(14, 28, 35, 0.96), rgba(11, 17, 21, 0.96));
      border-bottom: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.3));
      font-family: var(--font-ui, inherit);
      position: relative;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 8px);
      padding: var(--space-2, 8px) var(--space-3, 12px);
      border: 1px solid var(--ui-divider, rgba(88, 127, 146, 0.2));
      border-radius: var(--radius-pill, 999px);
      background: rgba(19, 26, 32, 0.9);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.04);
    }

    .status-dot--online {
      background: var(--status-online, #42d6a4);
      box-shadow: 0 0 12px rgba(66, 214, 164, 0.45);
    }

    .status-dot--paused {
      background: var(--status-paused, #ffce73);
    }

    .status-dot--connecting {
      background: var(--status-connecting, #3aa0ff);
      animation: pulse 1.1s infinite;
    }

    .status-dot--disconnected {
      background: var(--status-disconnected, #6f7c87);
    }

    .status-dot--error {
      background: var(--status-error, #ff6b6b);
      box-shadow: 0 0 12px rgba(255, 107, 107, 0.35);
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.52;
        transform: scale(0.92);
      }
    }

    .status-text {
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-semibold, 600);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .controls {
      display: flex;
      gap: var(--space-2, 8px);
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 8px);
      min-height: 36px;
      padding: 0 var(--space-4, 16px);
      border: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.3));
      border-radius: var(--radius-md, 12px);
      background: rgba(25, 34, 42, 0.92);
      color: var(--ui-text-primary, #f3f7fb);
      cursor: pointer;
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-semibold, 600);
      letter-spacing: 0.02em;
      transition:
        transform var(--transition-fast, 160ms ease),
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease);
    }

    button:hover {
      background: rgba(34, 48, 58, 0.96);
      border-color: rgba(120, 173, 199, 0.44);
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }

    button.active {
      background: rgba(255, 206, 115, 0.18);
      border-color: rgba(255, 206, 115, 0.45);
      color: #ffdb97;
    }

    button.settings-toggle {
      min-width: 36px;
      justify-content: center;
      padding: 0;
    }

    ha-icon {
      --mdc-icon-size: 16px;
    }

    .spacer {
      flex: 1;
    }

    .stats {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      flex-wrap: wrap;
    }

    .stat {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 34px;
      padding: 0 var(--space-3, 12px);
      border-radius: var(--radius-pill, 999px);
      background: rgba(15, 23, 29, 0.88);
      border: 1px solid rgba(88, 127, 146, 0.18);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .settings-shell {
      position: relative;
    }

    .settings-panel {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 220px;
      padding: var(--space-4, 16px);
      border: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.3));
      border-radius: var(--radius-xl, 18px);
      background:
        linear-gradient(180deg, rgba(22, 31, 38, 0.98), rgba(14, 20, 26, 0.98));
      box-shadow: var(--shadow-popover, 0 18px 42px rgba(0, 0, 0, 0.35));
      z-index: 100;
    }

    .settings-title {
      margin: 0 0 var(--space-3, 12px);
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .setting {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 12px);
      margin-bottom: var(--space-3, 12px);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .setting:last-child {
      margin-bottom: 0;
    }

    .setting input,
    .setting select {
      accent-color: var(--ui-primary, #0ea5d7);
      background: rgba(9, 14, 18, 0.92);
      color: var(--ui-text-primary, #f3f7fb);
      border: 1px solid rgba(88, 127, 146, 0.3);
      border-radius: var(--radius-sm, 8px);
      padding: 6px 8px;
    }
  `;

  private get statusText(): string {
    const texts: Record<OnlineStatus, string> = {
      disconnected: "Offline",
      connecting: "Connecting",
      online: "Online",
      paused: "Paused",
      error: "Fault",
    };
    return texts[this.state?.status || "disconnected"];
  }

  private get isPaused(): boolean {
    return this.state?.status === "paused";
  }

  private get canConnect(): boolean {
    return ["disconnected", "error"].includes(
      this.state?.status || "disconnected",
    );
  }

  render() {
    return html`
      <div class="status">
        <span
          class="status-dot status-dot--${this.state?.status || "disconnected"}"
        ></span>
        <span class="status-text">${this.statusText}</span>
      </div>

      <div class="controls">
        ${this.canConnect
          ? html`
              <button @click=${this._handleConnect}>
                <ha-icon icon="mdi:play"></ha-icon>
                Connect
              </button>
            `
          : html`
              <button
                @click=${this._handleTogglePause}
                class="${this.isPaused ? "active" : ""}"
              >
                <ha-icon
                  icon=${this.isPaused ? "mdi:play-pause" : "mdi:pause"}
                ></ha-icon>
                ${this.isPaused ? "Resume" : "Pause"}
              </button>
              <button @click=${this._handleDisconnect}>
                <ha-icon icon="mdi:stop"></ha-icon>
                Stop
              </button>
            `}
      </div>

      <div class="spacer"></div>

      <div class="stats">
        <div class="stat">
          <ha-icon icon="mdi:variable"></ha-icon>
          ${this.state?.liveValues?.size || 0} Variables
        </div>
        <div class="stat">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>
          ${this.state?.updateRate || 100}ms
        </div>
      </div>

      <div class="settings-shell">
        <button
          class="settings-toggle"
          @click=${() => (this._showSettings = !this._showSettings)}
          title="Online settings"
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>
        ${this._showSettings ? this._renderSettings() : ""}
      </div>
    `;
  }

  private _renderSettings() {
    return html`
      <div class="settings-panel">
        <div class="settings-title">Online Settings</div>
        <div class="setting">
          <label for="highlight">Highlight changes</label>
          <input
            type="checkbox"
            id="highlight"
            .checked=${this.state?.highlightChanges}
            @change=${this._handleHighlightChange}
          />
        </div>
        <div class="setting">
          <label for="conditions">Show conditions</label>
          <input
            type="checkbox"
            id="conditions"
            .checked=${this.state?.showConditions}
            @change=${this._handleConditionsChange}
          />
        </div>
        <div class="setting">
          <label for="rate">Update rate</label>
          <select id="rate" @change=${this._handleRateChange}>
            <option value="50" ?selected=${this.state?.updateRate === 50}>
              50ms
            </option>
            <option value="100" ?selected=${this.state?.updateRate === 100}>
              100ms
            </option>
            <option value="250" ?selected=${this.state?.updateRate === 250}>
              250ms
            </option>
            <option value="500" ?selected=${this.state?.updateRate === 500}>
              500ms
            </option>
          </select>
        </div>
      </div>
    `;
  }

  private _handleConnect(): void {
    this.dispatchEvent(
      new CustomEvent("connect", { bubbles: true, composed: true }),
    );
  }

  private _handleDisconnect(): void {
    this.dispatchEvent(
      new CustomEvent("disconnect", { bubbles: true, composed: true }),
    );
  }

  private _handleTogglePause(): void {
    this.dispatchEvent(
      new CustomEvent("toggle-pause", { bubbles: true, composed: true }),
    );
  }

  private _handleHighlightChange(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "highlightChanges", value: checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleConditionsChange(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "showConditions", value: checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleRateChange(e: Event): void {
    const value = Number.parseInt((e.target as HTMLSelectElement).value, 10);
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "updateRate", value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "st-online-toolbar": OnlineToolbar;
  }
}
