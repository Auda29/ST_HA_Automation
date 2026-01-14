/**
 * Migration Dialog Component
 *
 * Shows migration issues and collects user resolutions.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  MigrationPlan,
  MigrationIssue,
  MigrationResolution,
} from "./migration-types";

@customElement("st-migration-dialog")
export class MigrationDialog extends LitElement {
  @property({ type: Object }) plan!: MigrationPlan;

  @state() private _resolutions: Map<string, string> = new Map();
  @state() private _isOpen = false;

  static styles = css`
    :host {
      display: block;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .header {
      padding: 16px 24px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .header h2 {
      margin: 0;
      font-size: 18px;
    }

    .content {
      padding: 16px 24px;
      overflow-y: auto;
      flex: 1;
    }

    .issue {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--divider-color, #eee);
    }

    .issue:last-child {
      border-bottom: none;
    }

    .issue-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .issue-type {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .issue-type--added {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .issue-type--removed {
      background: #ffebee;
      color: #c62828;
    }

    .issue-type--type_changed {
      background: #fff3e0;
      color: #ef6c00;
    }

    .issue-type--range_changed {
      background: #e3f2fd;
      color: #1565c0;
    }

    .issue-name {
      font-weight: 500;
      font-family: monospace;
    }

    .issue-details {
      color: var(--secondary-text-color);
      font-size: 14px;
      margin-bottom: 12px;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px;
      border: 1px solid var(--divider-color, #eee);
      border-radius: 4px;
      cursor: pointer;
    }

    .option:hover {
      background: var(--secondary-background-color);
    }

    .option.selected {
      border-color: var(--primary-color);
      background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
    }

    .option.destructive {
      border-color: #ffcdd2;
    }

    .option.destructive.selected {
      border-color: #c62828;
      background: rgba(198, 40, 40, 0.1);
    }

    .option-label {
      font-weight: 500;
    }

    .option-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .footer {
      padding: 16px 24px;
      border-top: 1px solid var(--divider-color, #eee);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-cancel {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .btn-apply {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .btn-apply:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 4px;
      margin-bottom: 16px;
      color: #e65100;
    }
  `;

  open(): void {
    this._isOpen = true;
    // Initialize with default options
    if (this.plan) {
      for (const issue of this.plan.issues) {
        if (!this._resolutions.has(issue.variable)) {
          this._resolutions.set(issue.variable, issue.defaultOption);
        }
      }
      this._resolutions = new Map(this._resolutions);
    }
  }

  close(): void {
    this._isOpen = false;
  }

  getResolutions(): MigrationResolution[] {
    return Array.from(this._resolutions.entries()).map(
      ([issueId, option]) => ({
        issueId,
        selectedOption: option,
      }),
    );
  }

  protected render() {
    if (!this._isOpen || !this.plan) {
      return html``;
    }

    return html`
      <div class="overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="header">
            <h2>🔄 Schema-Migration erforderlich</h2>
          </div>

          <div class="content">
            ${this.plan.hasDestructiveChanges
              ? html`
                  <div class="warning">
                    ⚠️ Einige Änderungen können zu Datenverlust führen. Bitte
                    überprüfe die Optionen sorgfältig.
                  </div>
                `
              : ""}

            ${this.plan.issues.map((issue) => this._renderIssue(issue))}
          </div>

          <div class="footer">
            <button class="btn-cancel" @click=${this._handleCancel}>
              Abbrechen
            </button>
            <button class="btn-apply" @click=${this._handleApply}>
              Migration ausführen
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderIssue(issue: MigrationIssue) {
    const typeLabels: Record<string, string> = {
      added: "Neu",
      removed: "Entfernt",
      type_changed: "Typ geändert",
      range_changed: "Bereich geändert",
      initial_changed: "Initialwert geändert",
    };

    return html`
      <div class="issue">
        <div class="issue-header">
          <span class="issue-type issue-type--${issue.type}">
            ${typeLabels[issue.type]}
          </span>
          <span class="issue-name">${issue.variable}</span>
        </div>

        <div class="issue-details">${issue.details}</div>

        <div class="options">
          ${issue.options.map((option) => this._renderOption(issue, option))}
        </div>
      </div>
    `;
  }

  private _renderOption(
    issue: MigrationIssue,
    option: { id: string; label: string; description?: string; isDestructive?: boolean },
  ) {
    const isSelected = this._resolutions.get(issue.variable) === option.id;

    return html`
      <div
        class="option ${isSelected ? "selected" : ""} ${option.isDestructive
          ? "destructive"
          : ""}"
        @click=${() => this._selectOption(issue.variable, option.id)}
      >
        <input
          type="radio"
          name="option-${issue.variable}"
          .checked=${isSelected}
        />
        <div>
          <div class="option-label">
            ${option.label}
            ${option.isDestructive
              ? html`<span style="color: #c62828;">⚠️</span>`
              : ""}
          </div>
          ${option.description
            ? html`<div class="option-description">
                ${option.description}
              </div>`
            : ""}
        </div>
      </div>
    `;
  }

  private _selectOption(variable: string, optionId: string): void {
    this._resolutions.set(variable, optionId);
    this._resolutions = new Map(this._resolutions);
  }

  private _handleOverlayClick(): void {
    // Don't close on overlay click for important dialogs
  }

  private _handleCancel(): void {
    this.dispatchEvent(new CustomEvent("cancel"));
    this.close();
  }

  private _handleApply(): void {
    this.dispatchEvent(
      new CustomEvent("apply", {
        detail: { resolutions: this.getResolutions() },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "st-migration-dialog": MigrationDialog;
  }
}

