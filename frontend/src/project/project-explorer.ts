/**
 * Project Explorer Component
 *
 * Main component for managing project structure, files, and operations.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ProjectStructure, ProjectFile } from "./types";
import "./file-tree";

@customElement("st-project-explorer")
export class STProjectExplorer extends LitElement {
  @property({ attribute: false }) declare hass?: any;
  @property({ type: Object }) declare project: ProjectStructure | null;

  constructor() {
    super();
    this.project = null;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      color: var(--primary-text-color, #212121);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }

    h3 {
      margin: 0;
      min-width: 0;
      font-size: 13px;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .header-button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 34px;
      padding: 0 7px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: inherit;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }

    .header-button:hover {
      background: var(--secondary-background-color, #eee);
    }

    .header-button:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }

    .header-button ha-icon {
      --mdc-icon-size: 16px;
    }

    .file-tree-container {
      flex: 1;
      min-height: 0;
    }

    .empty-state {
      padding: 12px;
      color: var(--secondary-text-color, #666);
      font-size: 13px;
    }
  `;

  private _handleNewFile(): void {
    if (!this.project) return;

    const paths = new Set(this.project.files.map((file) => file.path.toLowerCase()));
    let programName = "NewFile";
    for (let suffix = 2; paths.has(`${programName.toLowerCase()}.st`); suffix++) {
      programName = `NewFile${suffix}`;
    }
    const name = `${programName}.st`;
    const newFile: ProjectFile = {
      id: this._generateFileId(),
      name,
      path: name,
      content: `{mode: restart}
PROGRAM ${programName}
VAR
END_VAR

(* Your ST code here *)

END_PROGRAM`,
      lastModified: Date.now(),
      isOpen: true,
      hasUnsavedChanges: false,
    };

    this.dispatchEvent(
      new CustomEvent("file-created", {
        detail: { file: newFile },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  render() {
    if (!this.project) {
      return html`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
    }

    return html`
      <div class="header">
        <h3>${this.project.name}</h3>
        <button
          class="header-button"
          @click=${this._handleNewFile}
          title="New File"
        >
          <ha-icon icon="mdi:file-plus"></ha-icon>
          New File
        </button>
      </div>
      <div class="file-tree-container">
        <st-file-tree
          .files=${this.project.files}
          .activeFileId=${this.project.activeFileId}
        ></st-file-tree>
      </div>
    `;
  }
}
