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
  private _handleDocumentClick: ((e: MouseEvent) => void) | null = null;
  private _handleKeyDown: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super();
    this._showSettings = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._handleDocumentClick = (e: MouseEvent) => {
      if (!this._showSettings) return;
      const path = e.composedPath();
      if (!path.includes(this)) {
        this._showSettings = false;
      }
    };
    this._handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this._showSettings) {
        this._showSettings = false;
      }
    };
    document.addEventListener("click", this._handleDocumentClick, true);
    document.addEventListener("keydown", this._handleKeyDown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._handleDocumentClick) {
      document.removeEventListener("click", this._handleDocumentClick, true);
      this._handleDocumentClick = null;
    }
    if (this._handleKeyDown) {
      document.removeEventListener("keydown", this._handleKeyDown);
      this._handleKeyDown = null;
    }
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 12px;
      padding: 6px 16px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border-bottom: 1px solid var(--divider-color, #ddd);
      position: relative;
      font-size: 13px;
    }

    .status,
    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      flex: none;
      border-radius: 50%;
      background: var(--secondary-text-color, #666);
    }

    .status-dot--online { background: var(--success-color, #2e7d32); }
    .status-dot--paused { background: var(--warning-color, #b26a00); }
    .status-dot--connecting { background: var(--primary-color, #03a9f4); }
    .status-dot--error { background: var(--error-color, #b00020); }

    button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      padding: 0 7px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    button:hover,
    button.active,
    button.settings-toggle.open {
      background: var(--secondary-background-color, #eee);
    }

    button:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }

    button.settings-toggle {
      min-width: 32px;
      justify-content: center;
    }

    ha-icon {
      --mdc-icon-size: 16px;
    }

    .spacer {
      flex: 1;
    }

    .settings-shell {
      position: relative;
      margin-left: auto;
    }

    .settings-panel {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 235px;
      padding: 12px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
      z-index: 4;
    }

    .settings-title {
      margin: 0 0 8px;
      font-weight: 600;
    }

    .setting {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
    }

    .setting select {
      background: var(--card-background-color, #fff);
      color: inherit;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      padding: 4px;
    }

    @media (max-width: 480px) {
      .stats {
        display: none;
      }
    }
  `;

  private get statusText(): string {
    const texts: Record<OnlineStatus, string> = {
      disconnected: "Live values off",
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

      ${this.state?.liveValues.size
        ? html`<span class="stats">${this.state.liveValues.size} live values</span>`
        : ""}

      <div class="settings-shell">
        <button
          class="settings-toggle ${this._showSettings ? "open" : ""}"
          @click=${() => (this._showSettings = !this._showSettings)}
          title="Online settings"
          aria-label="Online settings"
          aria-haspopup="true"
          aria-expanded=${this._showSettings}
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
