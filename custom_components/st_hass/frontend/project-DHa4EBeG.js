import { i as _, n as u, r as v, a as y, b as o, t as w } from "./lit-C178dhqO.js";
const b = "st_hass_project";
class x {
  constructor(t, i) {
  }
  /**
   * Load project structure from localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async loadProject() {
    const t = localStorage.getItem(b);
    if (t)
      try {
        const i = JSON.parse(t);
        return this._deserializeProject(i);
      } catch (i) {
        console.error("Failed to parse localStorage project data", i);
      }
    return null;
  }
  /**
   * Save project structure to localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async saveProject(t) {
    const i = this._serializeProject(t);
    localStorage.setItem(b, JSON.stringify(i));
  }
  /**
   * Create a new project with default structure
   */
  createDefaultProject() {
    const t = Date.now(), i = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: `{mode: restart}
PROGRAM Main
VAR
END_VAR

(* Your ST code here *)

END_PROGRAM`,
      lastModified: t,
      isOpen: !0,
      hasUnsavedChanges: !1
    };
    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [i],
      activeFileId: i.id,
      createdAt: t,
      lastModified: t
    };
  }
  /**
   * Migrate from single-file mode to project mode
   */
  migrateFromSingleFile(t) {
    const i = Date.now(), a = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: t,
      lastModified: i,
      isOpen: !0,
      hasUnsavedChanges: !1
    };
    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [a],
      activeFileId: a.id,
      createdAt: i,
      lastModified: i
    };
  }
  /**
   * Serialize project for storage (exclude transient state)
   */
  _serializeProject(t) {
    return {
      id: t.id,
      name: t.name,
      files: t.files.map((i) => ({
        id: i.id,
        name: i.name,
        path: i.path,
        content: i.content,
        lastModified: i.lastModified
        // Don't serialize isOpen and hasUnsavedChanges (transient state)
      })),
      activeFileId: t.activeFileId,
      createdAt: t.createdAt,
      lastModified: t.lastModified
    };
  }
  /**
   * Deserialize project from storage
   */
  _deserializeProject(t) {
    const i = t;
    return {
      id: i.id,
      name: i.name,
      files: i.files.map((a) => ({
        ...a,
        isOpen: !1,
        // Reset on load
        hasUnsavedChanges: !1
        // Reset on load
      })),
      activeFileId: i.activeFileId,
      createdAt: i.createdAt,
      lastModified: i.lastModified
    };
  }
  /**
   * Generate unique file ID
   */
  _generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Generate unique project ID
   */
  _generateProjectId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
var F = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, j = (e, t, i) => t in e ? F(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i, p = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? $(t, i) : t, s = e.length - 1, d; s >= 0; s--)
    (d = e[s]) && (r = (a ? d(t, i, r) : d(r)) || r);
  return a && r && F(t, i, r), r;
}, I = (e, t, i) => j(e, t + "", i);
let l = class extends y {
  constructor() {
    super(), this.files = [], this.activeFileId = null, this.selectedFileId = null, this._expandedPaths = /* @__PURE__ */ new Set(), this._editingFileId = null, this._editingName = "";
  }
  _buildTree() {
    const e = {
      name: "",
      path: "",
      children: /* @__PURE__ */ new Map(),
      isFolder: !0
    };
    for (const t of this.files) {
      const i = t.path.split("/");
      let a = e;
      for (let r = 0; r < i.length; r++) {
        const s = i[r], d = r === i.length - 1;
        a.children.has(s) || a.children.set(s, {
          name: s,
          path: i.slice(0, r + 1).join("/"),
          children: /* @__PURE__ */ new Map(),
          isFolder: !d
        });
        const h = a.children.get(s);
        d && (h.file = t), a = h;
      }
    }
    return e;
  }
  _toggleExpand(e) {
    this._expandedPaths.has(e) ? this._expandedPaths.delete(e) : this._expandedPaths.add(e), this._expandedPaths = new Set(this._expandedPaths), this.requestUpdate();
  }
  _handleFileClick(e, t) {
    t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileDoubleClick(e, t) {
    t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _startRename(e, t) {
    t.preventDefault(), t.stopPropagation(), this._editingFileId = e.id, this._editingName = e.name;
  }
  _finishRename(e) {
    const t = this._editingName.trim();
    t && this.dispatchEvent(
      new CustomEvent("file-rename", {
        detail: { fileId: e, newName: t },
        bubbles: !0,
        composed: !0
      })
    ), this._editingFileId = null, this._editingName = "";
  }
  _renderNode(e, t = 0) {
    const i = this._expandedPaths.has(e.path), a = e.children.size > 0;
    if (e.isFolder && e.path === "") {
      const n = Array.from(e.children.values()).sort((c, g) => c.isFolder !== g.isFolder ? c.isFolder ? -1 : 1 : c.name.localeCompare(g.name));
      return o`${n.map((c) => this._renderNode(c, t))}`;
    }
    if (e.isFolder)
      return o`
        <div class="tree-node">
          <div class="tree-item" @click=${() => this._toggleExpand(e.path)}>
            <div class="tree-toggle ${i ? "expanded" : ""}">
              ${a ? o`<ha-icon icon="mdi:chevron-right"></ha-icon>` : o`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder-open-outline"></ha-icon>
            </div>
            <div class="tree-label">${e.name}</div>
          </div>
          ${i ? o`
                <div class="tree-children">
                  ${Array.from(e.children.values()).sort((n, c) => n.isFolder !== c.isFolder ? n.isFolder ? -1 : 1 : n.name.localeCompare(c.name)).map((n) => this._renderNode(n, t + 1))}
                </div>
              ` : ""}
        </div>
      `;
    const r = e.file, s = r.id === this.activeFileId, d = r.id === this.selectedFileId, h = r.id === this._editingFileId;
    return o`
      <div class="tree-node">
        <div
          class="tree-item ${s ? "active" : ""} ${d ? "selected" : ""}"
          @click=${(n) => this._handleFileClick(r, n)}
          @dblclick=${(n) => this._handleFileDoubleClick(r, n)}
          @contextmenu=${(n) => this._startRename(r, n)}
          @keydown=${(n) => this._handleItemKey(n, r)}
          tabindex="0"
          role="treeitem"
          aria-selected=${s}
          title="${r.path} — double-click to open, F2 to rename, Delete to remove"
        >
          <div class="tree-toggle"></div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-document-outline"></ha-icon>
          </div>
          <div class="tree-label ${h ? "editing" : ""}">
            ${h ? o`
                  <input
                    .value=${this._editingName}
                    @input=${(n) => this._editingName = n.target.value}
                    @blur=${() => this._finishRename(r.id)}
                    @keydown=${(n) => {
      n.key === "Enter" && this._finishRename(r.id), n.key === "Escape" && (this._editingFileId = null, this._editingName = "");
    }}
                    autofocus
                  />
                ` : r.name}
          </div>
          ${r.hasUnsavedChanges ? o`<div class="unsaved-indicator" title="Unsaved changes"></div>` : ""}
          ${h ? "" : o`
                <div class="tree-actions">
                  <button
                    class="tree-action-btn"
                    title="Rename (F2)"
                    aria-label="Rename ${r.name}"
                    @click=${(n) => this._startRename(r, n)}
                  >
                    <ha-icon icon="mdi:pencil-outline"></ha-icon>
                  </button>
                  <button
                    class="tree-action-btn danger"
                    title="Delete"
                    aria-label="Delete ${r.name}"
                    @click=${(n) => this._handleDelete(r, n)}
                  >
                    <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }
  _handleItemKey(e, t) {
    e.key === "Enter" ? (e.preventDefault(), this._handleFileDoubleClick(t, e)) : e.key === "F2" ? (e.preventDefault(), this._startRename(t, e)) : e.key === "Delete" && (e.preventDefault(), this._handleDelete(t, e));
  }
  _handleDelete(e, t) {
    t.preventDefault(), t.stopPropagation(), confirm(
      `Delete "${e.name}"? This cannot be undone.`
    ) && this.dispatchEvent(
      new CustomEvent("file-deleted", {
        detail: { fileId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    const e = this._buildTree();
    return this.files.length === 0 ? o`
        <div class="empty-hint">
          <ha-icon icon="mdi:file-plus-outline"></ha-icon>
          No files yet. Use <strong>New File</strong> to create your first ST
          program.
        </div>
      ` : o`
      <div class="file-tree" role="tree">${this._renderNode(e)}</div>
    `;
  }
};
I(l, "styles", _`
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
  `);
p([
  u({ type: Array })
], l.prototype, "files", 2);
p([
  u({ type: String })
], l.prototype, "activeFileId", 2);
p([
  u({ type: String })
], l.prototype, "selectedFileId", 2);
p([
  v()
], l.prototype, "_expandedPaths", 2);
p([
  v()
], l.prototype, "_editingFileId", 2);
p([
  v()
], l.prototype, "_editingName", 2);
l = p([
  w("st-file-tree")
], l);
var P = Object.defineProperty, k = Object.getOwnPropertyDescriptor, D = (e, t, i) => t in e ? P(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i, m = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? k(t, i) : t, s = e.length - 1, d; s >= 0; s--)
    (d = e[s]) && (r = (a ? d(t, i, r) : d(r)) || r);
  return a && r && P(t, i, r), r;
}, z = (e, t, i) => D(e, t + "", i);
let f = class extends y {
  constructor() {
    super(), this.project = null, this._storage = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._initializeStorage();
  }
  updated(e) {
    super.updated(e), e.has("hass") && this._initializeStorage();
  }
  _initializeStorage() {
    var e, t;
    if ((e = this.hass) != null && e.connection) {
      const i = ((t = this.hass.config) == null ? void 0 : t.entry_id) || "default";
      this._storage = new x(this.hass.connection, i);
    } else
      this._storage = new x(null, "default");
  }
  _handleNewFile() {
    if (!this.project) return;
    const e = {
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
      isOpen: !0,
      hasUnsavedChanges: !1
    };
    this.dispatchEvent(
      new CustomEvent("file-created", {
        detail: { file: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileSelected(e) {
    const { fileId: t } = e.detail;
    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileOpen(e) {
    const { fileId: t } = e.detail;
    if (!this.project) return;
    const i = this.project.files.map((r) => ({
      ...r,
      isOpen: r.id === t || r.isOpen
    })), a = {
      ...this.project,
      files: i,
      activeFileId: t,
      lastModified: Date.now()
    };
    this._updateProject(a), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileRename(e) {
    const { fileId: t, newName: i } = e.detail;
    if (!this.project) return;
    const a = this.project.files.map((s) => s.id === t ? {
      ...s,
      name: i,
      path: i,
      lastModified: Date.now()
    } : s), r = {
      ...this.project,
      files: a,
      lastModified: Date.now()
    };
    this._updateProject(r);
  }
  _updateProject(e) {
    this.project = e, this._saveProject(), this.requestUpdate();
  }
  async _saveProject() {
    if (!(!this._storage || !this.project))
      try {
        await this._storage.saveProject(this.project);
      } catch (e) {
        console.error("Failed to save project", e);
      }
  }
  _generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  render() {
    return this.project ? o`
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
      <div class="tip-footer">
        <kbd>Enter</kbd> opens · <kbd>F2</kbd> rename · <kbd>Del</kbd> delete
      </div>
    ` : o`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
  }
};
z(f, "styles", _`
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

    .header-button:active {
      transform: translateY(0);
    }

    .header-button:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .header-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .tip-footer {
      padding: var(--space-3, 12px) var(--space-4, 16px);
      border-top: 1px solid rgba(140, 169, 193, 0.1);
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-xs, 11px);
      line-height: 1.55;
    }

    .tip-footer kbd {
      padding: 1px 5px;
      border: 1px solid rgba(140, 169, 193, 0.26);
      border-radius: 4px;
      background: rgba(9, 17, 25, 0.9);
      color: var(--ui-text-primary, #f3f7fb);
      font-family: var(--font-mono, monospace);
      font-size: 10px;
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
  `);
m([
  u({ attribute: !1 })
], f.prototype, "hass", 2);
m([
  u({ type: Object })
], f.prototype, "project", 2);
m([
  v()
], f.prototype, "_storage", 2);
f = m([
  w("st-project-explorer")
], f);
export {
  x as ProjectStorage,
  l as STFileTree,
  f as STProjectExplorer
};
//# sourceMappingURL=project-DHa4EBeG.js.map
