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

  constructor() {
    super();
    this.project = null;
  }

  @state() private _storage: ProjectStorage | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
    }
    .header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .header-actions {
      display: flex;
      gap: 4px;
    }
    .header-button {
      padding: 4px 8px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }
    .header-button:hover {
      background-color: var(--divider-color);
    }
    .file-tree-container {
      flex: 1;
      overflow: hidden;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 14px;
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
      // Get config entry ID from hass (if available)
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
      isOpen: false,
      hasUnsavedChanges: false,
    };

    const updatedProject: ProjectStructure = {
      ...this.project,
      files: [...this.project.files, newFile],
      lastModified: Date.now(),
    };

    this._updateProject(updatedProject);

    // Open the new file
    this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: newFile.id },
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
          path: newName, // Simple: path = name for now
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
        <h3>${this.project.name}</h3>
        <div class="header-actions">
          <button
            class="header-button"
            @click=${this._handleNewFile}
            title="New File"
          >
            <ha-icon icon="mdi:file-plus"></ha-icon>
            New
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
