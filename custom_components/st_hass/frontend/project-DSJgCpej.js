import { i as x, n as u, r as v, a as b, b as o, t as y } from "./lit-C178dhqO.js";
const m = "st_hass_project";
class _ {
  constructor(t, i) {
  }
  /**
   * Load project structure from localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async loadProject() {
    const t = localStorage.getItem(m);
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
    localStorage.setItem(m, JSON.stringify(i));
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
var w = Object.defineProperty, P = Object.getOwnPropertyDescriptor, j = (e, t, i) => t in e ? w(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i, p = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? P(t, i) : t, n = e.length - 1, d; n >= 0; n--)
    (d = e[n]) && (r = (a ? d(t, i, r) : d(r)) || r);
  return a && r && w(t, i, r), r;
}, I = (e, t, i) => j(e, t + "", i);
let l = class extends b {
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
        const n = i[r], d = r === i.length - 1;
        a.children.has(n) || a.children.set(n, {
          name: n,
          path: i.slice(0, r + 1).join("/"),
          children: /* @__PURE__ */ new Map(),
          isFolder: !d
        });
        const s = a.children.get(n);
        d && (s.file = t), a = s;
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
  _handleContextMenu(e, t) {
    t.preventDefault(), t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-context-menu", {
        detail: { fileId: e.id, x: t.clientX, y: t.clientY },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _renderNode(e, t = 0) {
    const i = this._expandedPaths.has(e.path), a = e.children.size > 0;
    if (e.isFolder && e.path === "") {
      const s = Array.from(e.children.values()).sort((c, g) => c.isFolder !== g.isFolder ? c.isFolder ? -1 : 1 : c.name.localeCompare(g.name));
      return o`
        ${s.map((c) => this._renderNode(c, t))}
      `;
    }
    if (e.isFolder)
      return o`
        <div class="tree-node">
          <div
            class="tree-item"
            @click=${() => this._toggleExpand(e.path)}
          >
            <div class="tree-toggle ${i ? "expanded" : ""}">
              ${a ? o`<ha-icon icon="mdi:chevron-right"></ha-icon>` : o`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder"></ha-icon>
            </div>
            <div class="tree-label">${e.name}</div>
          </div>
          ${i && a ? o`
                <div class="tree-children">
                  ${Array.from(e.children.values()).sort((s, c) => s.isFolder !== c.isFolder ? s.isFolder ? -1 : 1 : s.name.localeCompare(c.name)).map((s) => this._renderNode(s, t + 1))}
                </div>
              ` : ""}
        </div>
      `;
    if (!e.file) return o``;
    const r = e.file.id === this.activeFileId, n = e.file.id === this.selectedFileId, d = this._editingFileId === e.file.id;
    return o`
      <div class="tree-node">
        <div
          class="tree-item ${r ? "active" : ""} ${n ? "selected" : ""}"
          @click=${(s) => this._handleFileClick(e.file, s)}
          @dblclick=${(s) => this._handleFileDoubleClick(e.file, s)}
          @contextmenu=${(s) => this._handleContextMenu(e.file, s)}
        >
          <div class="tree-toggle">
            <span style="width: 16px;"></span>
          </div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-code"></ha-icon>
          </div>
          ${d ? o`
                <div class="tree-label editing">
                  <input
                    type="text"
                    .value=${this._editingName}
                    @blur=${() => this._finishEditing(e.file)}
                    @keydown=${(s) => {
      s.key === "Enter" ? this._finishEditing(e.file) : s.key === "Escape" && this._cancelEditing();
    }}
                    @click=${(s) => s.stopPropagation()}
                  />
                </div>
              ` : o`<div class="tree-label">${e.name}</div>`}
          ${e.file.hasUnsavedChanges ? o`<div class="unsaved-indicator" title="Unsaved changes"></div>` : ""}
        </div>
      </div>
    `;
  }
  _finishEditing(e) {
    this._editingName && this._editingName !== e.name && this.dispatchEvent(
      new CustomEvent("file-rename", {
        detail: { fileId: e.id, newName: this._editingName },
        bubbles: !0,
        composed: !0
      })
    ), this._editingFileId = null, this._editingName = "";
  }
  _cancelEditing() {
    this._editingFileId = null, this._editingName = "";
  }
  startRename(e) {
    const t = this.files.find((i) => i.id === e);
    t && (this._editingFileId = e, this._editingName = t.name);
  }
  render() {
    const e = this._buildTree();
    return o`
      <div class="file-tree">
        ${this._renderNode(e)}
      </div>
    `;
  }
};
I(l, "styles", x`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-size: var(--font-size-md, 14px);
      font-family: var(--font-ui, inherit);
      background: var(--ui-bg-card, var(--card-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
    }
    .file-tree {
      padding: var(--space-2, 8px);
    }
    .tree-node {
      user-select: none;
    }
    .tree-item {
      display: flex;
      align-items: center;
      gap: var(--space-1, 4px);
      padding: var(--space-1, 4px) var(--space-2, 8px);
      cursor: pointer;
      border-radius: var(--radius-md, 4px);
      transition: var(--transition-fast, background-color 0.2s);
    }
    .tree-item:hover {
      background-color: var(--ui-divider, rgba(0, 0, 0, 0.1));
    }
    .tree-item.active {
      background-color: var(--ui-primary, var(--primary-color));
      color: var(--ui-text-on-primary, var(--text-primary-color));
    }
    .tree-item.selected {
      background-color: var(--ui-bg-secondary, var(--secondary-background-color));
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
      border: 1px solid var(--ui-primary, var(--primary-color));
      border-radius: var(--radius-sm, 2px);
      background: var(--ui-bg-card, var(--card-background-color));
    }
    .tree-label input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--ui-text-primary, var(--primary-text-color));
      font-size: var(--font-size-md, 14px);
    }
    .tree-children {
      margin-left: 16px;
    }
    .unsaved-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--ui-warning, var(--warning-color, #ff9800));
      flex-shrink: 0;
    }
    .context-menu {
      position: fixed;
      background: var(--ui-bg-card, var(--card-background-color));
      border: 1px solid var(--ui-divider, var(--divider-color));
      border-radius: var(--radius-md, 4px);
      box-shadow: var(--shadow-popover, 0 4px 12px rgba(0, 0, 0, 0.2));
      z-index: 1000;
      min-width: 150px;
    }
    .context-menu-item {
      padding: var(--space-2, 8px) var(--space-3, 12px);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
    }
    .context-menu-item:hover {
      background-color: var(--ui-divider, var(--divider-color));
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
  y("st-file-tree")
], l);
var F = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, E = (e, t, i) => t in e ? F(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i, f = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? $(t, i) : t, n = e.length - 1, d; n >= 0; n--)
    (d = e[n]) && (r = (a ? d(t, i, r) : d(r)) || r);
  return a && r && F(t, i, r), r;
}, M = (e, t, i) => E(e, t + "", i);
let h = class extends b {
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
      this._storage = new _(this.hass.connection, i);
    } else
      this._storage = new _(null, "default");
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
    const a = this.project.files.map((n) => n.id === t ? {
      ...n,
      name: i,
      path: i,
      // Simple: path = name for now
      lastModified: Date.now()
    } : n), r = {
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
    ` : o`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
  }
};
M(h, "styles", x`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--ui-bg-card, var(--card-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      font-family: var(--font-ui, inherit);
    }
    .header {
      padding: var(--space-3, 12px) var(--space-4, 16px);
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header h3 {
      margin: 0;
      font-size: var(--font-size-base, 13px);
      font-weight: var(--font-weight-bold, 700);
      color: var(--ui-text-primary, var(--primary-text-color));
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .header-actions {
      display: flex;
      gap: var(--space-1, 4px);
    }
    .header-button {
      padding: var(--space-1, 4px) var(--space-2, 8px);
      border: 1px solid var(--ui-divider, var(--divider-color));
      background: var(--ui-bg-secondary, var(--secondary-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      cursor: pointer;
      border-radius: var(--radius-md, 4px);
      display: flex;
      align-items: center;
      gap: var(--space-1, 4px);
      font-size: var(--font-size-sm, 12px);
      font-family: var(--font-ui, inherit);
    }
    .header-button:hover {
      background-color: var(--ui-divider, var(--divider-color));
    }
    .file-tree-container {
      flex: 1;
      overflow: hidden;
    }
    .empty-state {
      padding: var(--space-8, 32px) var(--space-4, 16px);
      text-align: center;
      color: var(--ui-text-secondary, var(--secondary-text-color));
      font-size: var(--font-size-md, 14px);
    }
  `);
f([
  u({ attribute: !1 })
], h.prototype, "hass", 2);
f([
  u({ type: Object })
], h.prototype, "project", 2);
f([
  v()
], h.prototype, "_storage", 2);
h = f([
  y("st-project-explorer")
], h);
export {
  _ as ProjectStorage,
  l as STFileTree,
  h as STProjectExplorer
};
//# sourceMappingURL=project-DSJgCpej.js.map
