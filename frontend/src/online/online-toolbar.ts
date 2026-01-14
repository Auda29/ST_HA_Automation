/**
 * Online Mode Toolbar Component
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { OnlineModeState, OnlineStatus } from "./types";

@customElement("st-online-toolbar")
export class OnlineToolbar extends LitElement {
  @property({ type: Object }) declare state: OnlineModeState;

  @state() private _showSettings: boolean = false;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot--online {
      background: #4ec9b0;
      box-shadow: 0 0 4px #4ec9b0;
    }

    .status-dot--paused {
      background: #dcdcaa;
    }

    .status-dot--connecting {
      background: #569cd6;
      animation: pulse 1s infinite;
    }

    .status-dot--disconnected {
      background: #808080;
    }

    .status-dot--error {
      background: #f44747;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .status-text {
      font-size: 13px;
      font-weight: 500;
    }

    .controls {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    button:hover {
      background: var(--secondary-background-color);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .spacer {
      flex: 1;
    }

    .stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .settings-panel {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 100;
    }

    .setting {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .setting:last-child {
      margin-bottom: 0;
    }

    .setting label {
      font-size: 13px;
    }
  `;

  private get statusText(): string {
    const texts: Record<OnlineStatus, string> = {
      disconnected: "Offline",
      connecting: "Connecting...",
      online: "Online",
      paused: "Paused",
      error: "Error",
    };
    return texts[this.state?.status || "disconnected"];
  }

  private get isPaused(): boolean {
    return this.state?.status === "paused";
  }

  private get canConnect(): boolean {
    return ["disconnected", "error"].includes(this.state?.status || "disconnected");
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
          ? html` <button @click=${this._handleConnect}>▶ Connect</button> `
          : html`
              <button
                @click=${this._handleTogglePause}
                class="${this.isPaused ? "active" : ""}"
              >
                ${this.isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button @click=${this._handleDisconnect}>⏹ Stop</button>
            `}
      </div>

      <div class="spacer"></div>

      <div class="stats">
        <div class="stat">📊 ${this.state?.liveValues?.size || 0} Variables</div>
        <div class="stat">⚡ ${this.state?.updateRate || 100}ms</div>
      </div>

      <div style="position: relative;">
        <button @click=${() => (this._showSettings = !this._showSettings)}>
          ⚙️
        </button>
        ${this._showSettings ? this._renderSettings() : ""}
      </div>
    `;
  }

  private _renderSettings() {
    return html`
      <div class="settings-panel">
        <div class="setting">
          <input
            type="checkbox"
            id="highlight"
            .checked=${this.state?.highlightChanges}
            @change=${this._handleHighlightChange}
          />
          <label for="highlight">Highlight changes</label>
        </div>
        <div class="setting">
          <input
            type="checkbox"
            id="conditions"
            .checked=${this.state?.showConditions}
            @change=${this._handleConditionsChange}
          />
          <label for="conditions">Show conditions</label>
        </div>
        <div class="setting">
          <label>Update rate:</label>
          <select @change=${this._handleRateChange}>
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
