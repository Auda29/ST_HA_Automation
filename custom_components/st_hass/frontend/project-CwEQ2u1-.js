var I = Object.defineProperty;
var $ = (a, e, t) => e in a ? I(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var u = (a, e, t) => $(a, typeof e != "symbol" ? e + "" : e, t);
import { i as F, n as f, r as v, a as w, b as d, t as y } from "./lit-C178dhqO.js";
const x = "st_hass_project";
class b {
  constructor(e, t) {
  }
  /**
   * Load project structure from localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async loadProject() {
    const e = localStorage.getItem(x);
    if (e)
      try {
        const t = JSON.parse(e);
        return this._deserializeProject(t);
      } catch (t) {
        console.error("Failed to parse localStorage project data", t);
      }
    return null;
  }
  /**
   * Save project structure to localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async saveProject(e) {
    const t = this._serializeProject(e);
    localStorage.setItem(x, JSON.stringify(t));
  }
  /**
   * Create a new project with default structure
   */
  createDefaultProject() {
    const e = Date.now(), t = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: `{mode: restart}
PROGRAM Main
VAR
END_VAR

(* Your ST code here *)

END_PROGRAM`,
      lastModified: e,
      isOpen: !0,
      hasUnsavedChanges: !1
    };
    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [t],
      activeFileId: t.id,
      createdAt: e,
      lastModified: e
    };
  }
  /**
   * Migrate from single-file mode to project mode
   */
  migrateFromSingleFile(e) {
    const t = Date.now(), i = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: e,
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
   * Serialize project for storage (exclude transient state)
   */
  _serializeProject(e) {
    return {
      id: e.id,
      name: e.name,
      files: e.files.map((t) => ({
        id: t.id,
        name: t.name,
        path: t.path,
        content: t.content,
        lastModified: t.lastModified
        // Don't serialize isOpen and hasUnsavedChanges (transient state)
      })),
      activeFileId: e.activeFileId,
      createdAt: e.createdAt,
      lastModified: e.lastModified
    };
  }
  /**
   * Deserialize project from storage
   */
  _deserializeProject(e) {
    const t = e;
    return {
      id: t.id,
      name: t.name,
      files: t.files.map((i) => ({
        ...i,
        isOpen: !1,
        // Reset on load
        hasUnsavedChanges: !1
        // Reset on load
      })),
      activeFileId: t.activeFileId,
      createdAt: t.createdAt,
      lastModified: t.lastModified
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
var P = Object.defineProperty, E = Object.getOwnPropertyDescriptor, M = (a, e, t) => e in a ? P(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t, p = (a, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? E(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && P(e, t, r), r;
}, N = (a, e, t) => M(a, e + "", t);
let l = class extends w {
  constructor() {
    super();
    u(this, "_expandedPaths");
    u(this, "_editingFileId");
    u(this, "_editingName");
    this.files = [], this.activeFileId = null, this.selectedFileId = null, this._expandedPaths = /* @__PURE__ */ new Set(), this._editingFileId = null, this._editingName = "";
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
      let r = e;
      for (let s = 0; s < i.length; s++) {
        const o = i[s], g = s === i.length - 1;
        r.children.has(o) || r.children.set(o, {
          name: o,
          path: i.slice(0, s + 1).join("/"),
          children: /* @__PURE__ */ new Map(),
          isFolder: !g
        });
        const n = r.children.get(o);
        g && (n.file = t), r = n;
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
    const i = this._expandedPaths.has(e.path), r = e.children.size > 0;
    if (e.isFolder && e.path === "") {
      const n = Array.from(e.children.values()).sort((c, _) => c.isFolder !== _.isFolder ? c.isFolder ? -1 : 1 : c.name.localeCompare(_.name));
      return d`
        ${n.map((c) => this._renderNode(c, t))}
      `;
    }
    if (e.isFolder)
      return d`
        <div class="tree-node">
          <div
            class="tree-item"
            @click=${() => this._toggleExpand(e.path)}
          >
            <div class="tree-toggle ${i ? "expanded" : ""}">
              ${r ? d`<ha-icon icon="mdi:chevron-right"></ha-icon>` : d`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder"></ha-icon>
            </div>
            <div class="tree-label">${e.name}</div>
          </div>
          ${i && r ? d`
                <div class="tree-children">
                  ${Array.from(e.children.values()).sort((n, c) => n.isFolder !== c.isFolder ? n.isFolder ? -1 : 1 : n.name.localeCompare(c.name)).map((n) => this._renderNode(n, t + 1))}
                </div>
              ` : ""}
        </div>
      `;
    if (!e.file) return d``;
    const s = e.file.id === this.activeFileId, o = e.file.id === this.selectedFileId, g = this._editingFileId === e.file.id;
    return d`
      <div class="tree-node">
        <div
          class="tree-item ${s ? "active" : ""} ${o ? "selected" : ""}"
          @click=${(n) => this._handleFileClick(e.file, n)}
          @dblclick=${(n) => this._handleFileDoubleClick(e.file, n)}
          @contextmenu=${(n) => this._handleContextMenu(e.file, n)}
        >
          <div class="tree-toggle">
            <span style="width: 16px;"></span>
          </div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-code"></ha-icon>
          </div>
          ${g ? d`
                <div class="tree-label editing">
                  <input
                    type="text"
                    .value=${this._editingName}
                    @blur=${() => this._finishEditing(e.file)}
                    @keydown=${(n) => {
      n.key === "Enter" ? this._finishEditing(e.file) : n.key === "Escape" && this._cancelEditing();
    }}
                    @click=${(n) => n.stopPropagation()}
                  />
                </div>
              ` : d`<div class="tree-label">${e.name}</div>`}
          ${e.file.hasUnsavedChanges ? d`<div class="unsaved-indicator" title="Unsaved changes"></div>` : ""}
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
    return d`
      <div class="file-tree">
        ${this._renderNode(e)}
      </div>
    `;
  }
};
N(l, "styles", F`
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
  `);
p([
  f({ type: Array })
], l.prototype, "files", 2);
p([
  f({ type: String })
], l.prototype, "activeFileId", 2);
p([
  f({ type: String })
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
var j = Object.defineProperty, C = Object.getOwnPropertyDescriptor, S = (a, e, t) => e in a ? j(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t, m = (a, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? C(e, t) : e, s = a.length - 1, o; s >= 0; s--)
    (o = a[s]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && j(e, t, r), r;
}, O = (a, e, t) => S(a, e + "", t);
let h = class extends w {
  constructor() {
    super();
    u(this, "_storage", null);
    this.project = null;
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
      this._storage = new b(this.hass.connection, i);
    } else
      this._storage = new b(null, "default");
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
    const i = this.project.files.map((s) => ({
      ...s,
      isOpen: s.id === t || s.isOpen
    })), r = {
      ...this.project,
      files: i,
      activeFileId: t,
      lastModified: Date.now()
    };
    this._updateProject(r), this.dispatchEvent(
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
    const r = this.project.files.map((o) => o.id === t ? {
      ...o,
      name: i,
      path: i,
      // Simple: path = name for now
      lastModified: Date.now()
    } : o), s = {
      ...this.project,
      files: r,
      lastModified: Date.now()
    };
    this._updateProject(s);
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
    return this.project ? d`
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
    ` : d`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
  }
};
O(h, "styles", F`
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
  `);
m([
  f({ attribute: !1 })
], h.prototype, "hass", 2);
m([
  f({ type: Object })
], h.prototype, "project", 2);
m([
  v()
], h.prototype, "_storage", 2);
h = m([
  y("st-project-explorer")
], h);
export {
  b as ProjectStorage,
  l as STFileTree,
  h as STProjectExplorer
};
//# sourceMappingURL=project-CwEQ2u1-.js.map
