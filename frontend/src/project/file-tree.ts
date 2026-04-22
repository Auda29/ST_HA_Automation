/**
 * File Tree Component
 *
 * Displays project files in a tree structure with support for folders and file
 * operations.
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
  @state() declare private _expandedPaths: Set<string>;
  @state() declare private _editingFileId: string | null;
  @state() declare private _editingName: string;

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
      font-size: var(--font-size-md, 14px);
      font-family: var(--font-ui, inherit);
      background: transparent;
      color: var(--ui-text-primary, #f3f7fb);
    }

    .file-tree {
      padding: var(--space-3, 12px);
    }

    .tree-node {
      user-select: none;
    }

    .tree-item {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      min-height: 38px;
      padding: 0 var(--space-3, 12px);
      cursor: pointer;
      border-radius: var(--radius-md, 12px);
      transition:
        transform var(--transition-fast, 160ms ease),
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease);
      border: 1px solid transparent;
      color: var(--ui-text-secondary, #b6c4cf);
    }

    .tree-item:hover {
      background: rgba(23, 34, 43, 0.94);
      border-color: rgba(88, 127, 146, 0.18);
      transform: translateX(1px);
    }

    .tree-item:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .tree-item.active {
      background:
        linear-gradient(180deg, rgba(14, 165, 215, 0.2), rgba(10, 131, 173, 0.2));
      border-color: rgba(71, 187, 226, 0.42);
      color: var(--ui-text-primary, #f3f7fb);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
    }

    .tree-item.selected {
      background: rgba(19, 28, 35, 0.92);
    }

    .tree-actions {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      opacity: 0;
      transition: opacity var(--transition-fast, 160ms ease);
    }

    .tree-item:hover .tree-actions,
    .tree-item:focus-within .tree-actions {
      opacity: 1;
    }

    .tree-action-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm, 6px);
      background: transparent;
      color: var(--ui-text-muted, #8ea1af);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast, all 160ms ease);
    }

    .tree-action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .tree-action-btn.danger:hover {
      background: rgba(255, 114, 114, 0.16);
      color: var(--ui-error, #ff7272);
    }

    .tree-action-btn ha-icon {
      --mdc-icon-size: 14px;
    }

    .tree-toggle,
    .tree-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tree-toggle {
      color: var(--ui-text-muted, #8ea1af);
      transition: transform var(--transition-fast, 160ms ease);
    }

    .tree-toggle.expanded {
      transform: rotate(90deg);
    }

    .tree-icon {
      color: rgba(132, 212, 238, 0.95);
    }

    .tree-icon ha-icon,
    .tree-toggle ha-icon {
      width: 16px;
      height: 16px;
    }

    .tree-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-medium, 500);
    }

    .tree-label.editing {
      padding: 6px 8px;
      border: 1px solid rgba(71, 187, 226, 0.48);
      border-radius: var(--radius-sm, 8px);
      background: rgba(7, 11, 15, 0.95);
    }

    .tree-label input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-md, 14px);
      font-family: inherit;
    }

    .tree-children {
      margin-left: var(--space-4, 16px);
      padding-left: var(--space-2, 8px);
      border-left: 1px solid rgba(88, 127, 146, 0.14);
    }

    .unsaved-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--status-paused, #ffce73);
      box-shadow: 0 0 8px rgba(255, 206, 115, 0.4);
      flex-shrink: 0;
    }

    .empty-hint {
      padding: var(--space-5, 20px) var(--space-4, 16px);
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-sm, 12px);
      text-align: center;
      line-height: 1.5;
    }

    .empty-hint ha-icon {
      display: block;
      margin: 0 auto 8px;
      color: rgba(132, 212, 238, 0.7);
      --mdc-icon-size: 28px;
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

  private _startRename(file: ProjectFile, e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this._editingFileId = file.id;
    this._editingName = file.name;
  }

  private _finishRename(fileId: string): void {
    const nextName = this._editingName.trim();
    if (nextName) {
      this.dispatchEvent(
        new CustomEvent("file-rename", {
          detail: { fileId, newName: nextName },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this._editingFileId = null;
    this._editingName = "";
  }

  private _renderNode(node: FileTreeNode, depth: number = 0): unknown {
    const isExpanded = this._expandedPaths.has(node.path);
    const hasChildren = node.children.size > 0;

    if (node.isFolder && node.path === "") {
      const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
        if (a.isFolder !== b.isFolder) {
          return a.isFolder ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return html`${sortedChildren.map((child) => this._renderNode(child, depth))}`;
    }

    if (node.isFolder) {
      return html`
        <div class="tree-node">
          <div class="tree-item" @click=${() => this._toggleExpand(node.path)}>
            <div class="tree-toggle ${isExpanded ? "expanded" : ""}">
              ${hasChildren
                ? html`<ha-icon icon="mdi:chevron-right"></ha-icon>`
                : html`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder-open-outline"></ha-icon>
            </div>
            <div class="tree-label">${node.name}</div>
          </div>
          ${isExpanded
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

    const file = node.file!;
    const isActive = file.id === this.activeFileId;
    const isSelected = file.id === this.selectedFileId;
    const isEditing = file.id === this._editingFileId;

    return html`
      <div class="tree-node">
        <div
          class="tree-item ${isActive ? "active" : ""} ${isSelected
            ? "selected"
            : ""}"
          @click=${(e: Event) => this._handleFileClick(file, e)}
          @dblclick=${(e: Event) => this._handleFileDoubleClick(file, e)}
          @contextmenu=${(e: Event) => this._startRename(file, e)}
          @keydown=${(e: KeyboardEvent) => this._handleItemKey(e, file)}
          tabindex="0"
          role="treeitem"
          aria-selected=${isActive}
          title="${file.path} — double-click to open, F2 to rename, Delete to remove"
        >
          <div class="tree-toggle"></div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-document-outline"></ha-icon>
          </div>
          <div class="tree-label ${isEditing ? "editing" : ""}">
            ${isEditing
              ? html`
                  <input
                    .value=${this._editingName}
                    @input=${(e: Event) =>
                      (this._editingName = (
                        e.target as HTMLInputElement
                      ).value)}
                    @blur=${() => this._finishRename(file.id)}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === "Enter") this._finishRename(file.id);
                      if (e.key === "Escape") {
                        this._editingFileId = null;
                        this._editingName = "";
                      }
                    }}
                    autofocus
                  />
                `
              : file.name}
          </div>
          ${file.hasUnsavedChanges
            ? html`<div class="unsaved-indicator" title="Unsaved changes"></div>`
            : ""}
          ${isEditing
            ? ""
            : html`
                <div class="tree-actions">
                  <button
                    class="tree-action-btn"
                    title="Rename (F2)"
                    aria-label="Rename ${file.name}"
                    @click=${(e: Event) => this._startRename(file, e)}
                  >
                    <ha-icon icon="mdi:pencil-outline"></ha-icon>
                  </button>
                  <button
                    class="tree-action-btn danger"
                    title="Delete"
                    aria-label="Delete ${file.name}"
                    @click=${(e: Event) => this._handleDelete(file, e)}
                  >
                    <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _handleItemKey(e: KeyboardEvent, file: ProjectFile): void {
    if (e.key === "Enter") {
      e.preventDefault();
      this._handleFileDoubleClick(file, e);
    } else if (e.key === "F2") {
      e.preventDefault();
      this._startRename(file, e);
    } else if (e.key === "Delete") {
      e.preventDefault();
      this._handleDelete(file, e);
    }
  }

  private _handleDelete(file: ProjectFile, e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const ok = confirm(
      `Delete "${file.name}"? This cannot be undone.`,
    );
    if (!ok) return;
    this.dispatchEvent(
      new CustomEvent("file-deleted", {
        detail: { fileId: file.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const tree = this._buildTree();

    if (this.files.length === 0) {
      return html`
        <div class="empty-hint">
          <ha-icon icon="mdi:file-plus-outline"></ha-icon>
          No files yet. Use <strong>New File</strong> to create your first ST
          program.
        </div>
      `;
    }

    return html`
      <div class="file-tree" role="tree">${this._renderNode(tree)}</div>
    `;
  }
}
