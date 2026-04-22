/**
 * Project Explorer Component
 *
 * Main component for managing project structure, files, and operations.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { ProjectStructure, ProjectFile } from "./types";
import { ProjectStorage } from "./project-storage";
import "./file-tree";

@customElement("st-project-explorer")
export class STProjectExplorer extends LitElement {
  @property({ attribute: false }) declare hass?: any;
  @property({ type: Object }) declare project: ProjectStructure | null;
  @state() declare private _storage: ProjectStorage | null;

  constructor() {
    super();
    this.project = null;
    this._storage = null;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background:
        linear-gradient(180deg, rgba(17, 24, 30, 0.98), rgba(10, 15, 19, 0.98));
      color: var(--ui-text-primary, #f3f7fb);
      font-family: var(--font-ui, inherit);
    }

    .header {
      padding: var(--space-5, 20px) var(--space-4, 16px) var(--space-4, 16px);
      border-bottom: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.28));
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3, 12px);
    }

    .header-copy {
      min-width: 0;
    }

    .eyebrow {
      margin-bottom: 6px;
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }

    .header h3 {
      margin: 0;
      font-size: var(--font-size-lg, 18px);
      font-weight: var(--font-weight-bold, 700);
      color: var(--ui-text-primary, #f3f7fb);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-meta {
      margin-top: 6px;
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .header-actions {
      display: flex;
      gap: var(--space-2, 8px);
    }

    .header-button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 8px);
      min-height: 40px;
      padding: 0 var(--space-4, 16px);
      border: 1px solid rgba(120, 173, 199, 0.26);
      border-radius: var(--radius-md, 12px);
      background: rgba(24, 37, 46, 0.94);
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

    .header-button:hover {
      background: rgba(13, 165, 215, 0.18);
      border-color: rgba(120, 173, 199, 0.42);
      transform: translateY(-1px);
    }

    .header-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .file-tree-container {
      flex: 1;
      overflow: hidden;
    }

    .empty-state {
      padding: var(--space-8, 32px) var(--space-5, 20px);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-md, 14px);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._initializeStorage();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has("hass")) {
      this._initializeStorage();
    }
  }

  private _initializeStorage(): void {
    if (this.hass?.connection) {
      const configEntryId = this.hass.config?.entry_id || "default";
      this._storage = new ProjectStorage(this.hass.connection, configEntryId);
    } else {
      this._storage = new ProjectStorage(null, "default");
    }
  }

  private _handleNewFile(): void {
    if (!this.project) return;

    const newFile: ProjectFile = {
      id: this._generateFileId(),
      name: "NewFile.st",
      path: "NewFile.st",
      content: `{mode: restart}
PROGRAM NewFile
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

  private _handleFileSelected(e: CustomEvent): void {
    const { fileId } = e.detail;
    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleFileOpen(e: CustomEvent): void {
    const { fileId } = e.detail;
    if (!this.project) return;

    const updatedFiles = this.project.files.map((file) => ({
      ...file,
      isOpen: file.id === fileId || file.isOpen,
    }));

    const updatedProject: ProjectStructure = {
      ...this.project,
      files: updatedFiles,
      activeFileId: fileId,
      lastModified: Date.now(),
    };

    this._updateProject(updatedProject);

    this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleFileRename(e: CustomEvent): void {
    const { fileId, newName } = e.detail;
    if (!this.project) return;

    const updatedFiles = this.project.files.map((file) => {
      if (file.id === fileId) {
        return {
          ...file,
          name: newName,
          path: newName,
          lastModified: Date.now(),
        };
      }
      return file;
    });

    const updatedProject: ProjectStructure = {
      ...this.project,
      files: updatedFiles,
      lastModified: Date.now(),
    };

    this._updateProject(updatedProject);
  }

  private _updateProject(project: ProjectStructure): void {
    this.project = project;
    this._saveProject();
    this.requestUpdate();
  }

  private async _saveProject(): Promise<void> {
    if (!this._storage || !this.project) return;

    try {
      await this._storage.saveProject(this.project);
    } catch (error) {
      console.error("Failed to save project", error);
    }
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
        <div class="header-copy">
          <div class="eyebrow">Project Workspace</div>
          <h3>${this.project.name}</h3>
          <div class="header-meta">${this.project.files.length} file(s)</div>
        </div>
        <div class="header-actions">
          <button
            class="header-button"
            @click=${this._handleNewFile}
            title="New File"
          >
            <ha-icon icon="mdi:file-plus"></ha-icon>
            New File
          </button>
        </div>
      </div>
      <div class="file-tree-container">
        <st-file-tree
          .files=${this.project.files}
          .activeFileId=${this.project.activeFileId}
          @file-selected=${this._handleFileSelected}
          @file-open=${this._handleFileOpen}
          @file-rename=${this._handleFileRename}
        ></st-file-tree>
      </div>
    `;
  }
}
