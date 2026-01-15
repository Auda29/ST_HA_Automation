/**
 * File Tree Component
 * 
 * Displays project files in a tree structure with support for folders and file operations.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { ProjectFile } from "./types";

interface FileTreeNode {
  name: string;
  path: string;
  file?: ProjectFile;
  children: Map<string, FileTreeNode>;
  isFolder: boolean;
}

@customElement("st-file-tree")
export class STFileTree extends LitElement {
  @property({ type: Array }) declare files: ProjectFile[];
  @property({ type: String }) declare activeFileId: string | null;
  @property({ type: String }) declare selectedFileId: string | null;

  @state() private _expandedPaths: Set<string>;
  @state() private _editingFileId: string | null;
  @state() private _editingName: string;

  constructor() {
    super();
    this.files = [];
    this.activeFileId = null;
    this.selectedFileId = null;
    this._expandedPaths = new Set();
    this._editingFileId = null;
    this._editingName = "";
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-size: 14px;
    }
    .file-tree {
      padding: 8px;
    }
    .tree-node {
      user-select: none;
    }
    .tree-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .tree-item:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .tree-item.active {
      background-color: var(--primary-color);
      color: var(--text-primary-color);
    }
    .tree-item.selected {
      background-color: var(--secondary-background-color);
    }
    .tree-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tree-toggle.expanded {
      transform: rotate(90deg);
    }
    .tree-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tree-icon ha-icon {
      width: 16px;
      height: 16px;
    }
    .tree-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tree-label.editing {
      padding: 2px 4px;
      border: 1px solid var(--primary-color);
      border-radius: 2px;
      background: var(--card-background-color);
    }
    .tree-label input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 14px;
    }
    .tree-children {
      margin-left: 16px;
    }
    .unsaved-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--warning-color, #ff9800);
      flex-shrink: 0;
    }
    .context-menu {
      position: fixed;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      min-width: 150px;
    }
    .context-menu-item {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
    }
    .context-menu-item:hover {
      background-color: var(--divider-color);
    }
  `;

  private _buildTree(): FileTreeNode {
    const root: FileTreeNode = {
      name: "",
      path: "",
      children: new Map(),
      isFolder: true,
    };

    for (const file of this.files) {
      const parts = file.path.split("/");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            path: parts.slice(0, i + 1).join("/"),
            children: new Map(),
            isFolder: !isLast,
          });
        }

        const node = current.children.get(part)!;
        if (isLast) {
          node.file = file;
        }
        current = node;
      }
    }

    return root;
  }

  private _toggleExpand(path: string): void {
    if (this._expandedPaths.has(path)) {
      this._expandedPaths.delete(path);
    } else {
      this._expandedPaths.add(path);
    }
    this._expandedPaths = new Set(this._expandedPaths);
    this.requestUpdate();
  }

  private _handleFileClick(file: ProjectFile, e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: file.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleFileDoubleClick(file: ProjectFile, e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: file.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleContextMenu(file: ProjectFile, e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    // Context menu implementation would go here
    // For now, just emit event
    this.dispatchEvent(
      new CustomEvent("file-context-menu", {
        detail: { fileId: file.id, x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderNode(node: FileTreeNode, depth: number = 0): unknown {
    const isExpanded = this._expandedPaths.has(node.path);
    const hasChildren = node.children.size > 0;

    if (node.isFolder && node.path === "") {
      // Root node - render children directly
      const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
        if (a.isFolder !== b.isFolder) {
          return a.isFolder ? -1 : 1; // Folders first
        }
        return a.name.localeCompare(b.name);
      });

      return html`
        ${sortedChildren.map((child) => this._renderNode(child, depth))}
      `;
    }

    if (node.isFolder) {
      return html`
        <div class="tree-node">
          <div
            class="tree-item"
            @click=${() => this._toggleExpand(node.path)}
          >
            <div class="tree-toggle ${isExpanded ? "expanded" : ""}">
              ${hasChildren
                ? html`<ha-icon icon="mdi:chevron-right"></ha-icon>`
                : html`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder"></ha-icon>
            </div>
            <div class="tree-label">${node.name}</div>
          </div>
          ${isExpanded && hasChildren
            ? html`
                <div class="tree-children">
                  ${Array.from(node.children.values())
                    .sort((a, b) => {
                      if (a.isFolder !== b.isFolder) {
                        return a.isFolder ? -1 : 1;
                      }
                      return a.name.localeCompare(b.name);
                    })
                    .map((child) => this._renderNode(child, depth + 1))}
                </div>
              `
            : ""}
        </div>
      `;
    }

    // File node
    if (!node.file) return html``;

    const isActive = node.file.id === this.activeFileId;
    const isSelected = node.file.id === this.selectedFileId;
    const isEditing = this._editingFileId === node.file.id;

    return html`
      <div class="tree-node">
        <div
          class="tree-item ${isActive ? "active" : ""} ${isSelected
            ? "selected"
            : ""}"
          @click=${(e: Event) => this._handleFileClick(node.file!, e)}
          @dblclick=${(e: Event) => this._handleFileDoubleClick(node.file!, e)}
          @contextmenu=${(e: Event) => this._handleContextMenu(node.file!, e)}
        >
          <div class="tree-toggle">
            <span style="width: 16px;"></span>
          </div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-code"></ha-icon>
          </div>
          ${isEditing
            ? html`
                <div class="tree-label editing">
                  <input
                    type="text"
                    .value=${this._editingName}
                    @blur=${() => this._finishEditing(node.file!)}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === "Enter") {
                        this._finishEditing(node.file!);
                      } else if (e.key === "Escape") {
                        this._cancelEditing();
                      }
                    }}
                    @click=${(e: Event) => e.stopPropagation()}
                  />
                </div>
              `
            : html`<div class="tree-label">${node.name}</div>`}
          ${node.file.hasUnsavedChanges
            ? html`<div class="unsaved-indicator" title="Unsaved changes"></div>`
            : ""}
        </div>
      </div>
    `;
  }

  private _finishEditing(file: ProjectFile): void {
    if (this._editingName && this._editingName !== file.name) {
      this.dispatchEvent(
        new CustomEvent("file-rename", {
          detail: { fileId: file.id, newName: this._editingName },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this._editingFileId = null;
    this._editingName = "";
  }

  private _cancelEditing(): void {
    this._editingFileId = null;
    this._editingName = "";
  }

  startRename(fileId: string): void {
    const file = this.files.find((f) => f.id === fileId);
    if (file) {
      this._editingFileId = fileId;
      this._editingName = file.name;
    }
  }

  render() {
    const tree = this._buildTree();

    return html`
      <div class="file-tree">
        ${this._renderNode(tree)}
      </div>
    `;
  }
}
