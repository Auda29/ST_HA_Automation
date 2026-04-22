import { i as x, n as u, r as v, a as w, b as d, t as F } from "./lit-C178dhqO.js";
const b = "st_hass_project";
class _ {
  constructor(e, i) {
  }
  /**
   * Load project structure from localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async loadProject() {
    const e = localStorage.getItem(b);
    if (e)
      try {
        const i = JSON.parse(e);
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
  async saveProject(e) {
    const i = this._serializeProject(e);
    localStorage.setItem(b, JSON.stringify(i));
  }
  /**
   * Create a new project with default structure
   */
  createDefaultProject() {
    const e = Date.now(), i = {
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
      files: [i],
      activeFileId: i.id,
      createdAt: e,
      lastModified: e
    };
  }
  /**
   * Migrate from single-file mode to project mode
   */
  migrateFromSingleFile(e) {
    const i = Date.now(), a = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: e,
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
  _serializeProject(e) {
    return {
      id: e.id,
      name: e.name,
      files: e.files.map((i) => ({
        id: i.id,
        name: i.name,
        path: i.path,
        content: i.content,
        lastModified: i.lastModified
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
    const i = e;
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
var y = Object.defineProperty, j = Object.getOwnPropertyDescriptor, $ = (t, e, i) => e in t ? y(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, p = (t, e, i, a) => {
  for (var r = a > 1 ? void 0 : a ? j(e, i) : e, s = t.length - 1, o; s >= 0; s--)
    (o = t[s]) && (r = (a ? o(e, i, r) : o(r)) || r);
  return a && r && y(e, i, r), r;
}, I = (t, e, i) => $(t, e + "", i);
let l = class extends w {
  constructor() {
    super(), this.files = [], this.activeFileId = null, this.selectedFileId = null, this._expandedPaths = /* @__PURE__ */ new Set(), this._editingFileId = null, this._editingName = "";
  }
  _buildTree() {
    const t = {
      name: "",
      path: "",
      children: /* @__PURE__ */ new Map(),
      isFolder: !0
    };
    for (const e of this.files) {
      const i = e.path.split("/");
      let a = t;
      for (let r = 0; r < i.length; r++) {
        const s = i[r], o = r === i.length - 1;
        a.children.has(s) || a.children.set(s, {
          name: s,
          path: i.slice(0, r + 1).join("/"),
          children: /* @__PURE__ */ new Map(),
          isFolder: !o
        });
        const f = a.children.get(s);
        o && (f.file = e), a = f;
      }
    }
    return t;
  }
  _toggleExpand(t) {
    this._expandedPaths.has(t) ? this._expandedPaths.delete(t) : this._expandedPaths.add(t), this._expandedPaths = new Set(this._expandedPaths), this.requestUpdate();
  }
  _handleFileClick(t, e) {
    e.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: t.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileDoubleClick(t, e) {
    e.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: t.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _startRename(t, e) {
    e.preventDefault(), e.stopPropagation(), this._editingFileId = t.id, this._editingName = t.name;
  }
  _finishRename(t) {
    const e = this._editingName.trim();
    e && this.dispatchEvent(
      new CustomEvent("file-rename", {
        detail: { fileId: t, newName: e },
        bubbles: !0,
        composed: !0
      })
    ), this._editingFileId = null, this._editingName = "";
  }
  _renderNode(t, e = 0) {
    const i = this._expandedPaths.has(t.path), a = t.children.size > 0;
    if (t.isFolder && t.path === "") {
      const n = Array.from(t.children.values()).sort((c, m) => c.isFolder !== m.isFolder ? c.isFolder ? -1 : 1 : c.name.localeCompare(m.name));
      return d`${n.map((c) => this._renderNode(c, e))}`;
    }
    if (t.isFolder)
      return d`
        <div class="tree-node">
          <div class="tree-item" @click=${() => this._toggleExpand(t.path)}>
            <div class="tree-toggle ${i ? "expanded" : ""}">
              ${a ? d`<ha-icon icon="mdi:chevron-right"></ha-icon>` : d`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder-open-outline"></ha-icon>
            </div>
            <div class="tree-label">${t.name}</div>
          </div>
          ${i ? d`
                <div class="tree-children">
                  ${Array.from(t.children.values()).sort((n, c) => n.isFolder !== c.isFolder ? n.isFolder ? -1 : 1 : n.name.localeCompare(c.name)).map((n) => this._renderNode(n, e + 1))}
                </div>
              ` : ""}
        </div>
      `;
    const r = t.file, s = r.id === this.activeFileId, o = r.id === this.selectedFileId, f = r.id === this._editingFileId;
    return d`
      <div class="tree-node">
        <div
          class="tree-item ${s ? "active" : ""} ${o ? "selected" : ""}"
          @click=${(n) => this._handleFileClick(r, n)}
          @dblclick=${(n) => this._handleFileDoubleClick(r, n)}
          @contextmenu=${(n) => this._startRename(r, n)}
          title=${r.path}
        >
          <div class="tree-toggle"></div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-document-outline"></ha-icon>
          </div>
          <div class="tree-label ${f ? "editing" : ""}">
            ${f ? d`
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
          ${r.hasUnsavedChanges ? d`<div class="unsaved-indicator" title="Unsaved changes"></div>` : ""}
        </div>
      </div>
    `;
  }
  render() {
    const t = this._buildTree();
    return d`
      <div class="file-tree">${this._renderNode(t)}</div>
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
  F("st-file-tree")
], l);
var P = Object.defineProperty, N = Object.getOwnPropertyDescriptor, M = (t, e, i) => e in t ? P(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, g = (t, e, i, a) => {
  for (var r = a > 1 ? void 0 : a ? N(e, i) : e, s = t.length - 1, o; s >= 0; s--)
    (o = t[s]) && (r = (a ? o(e, i, r) : o(r)) || r);
  return a && r && P(e, i, r), r;
}, E = (t, e, i) => M(t, e + "", i);
let h = class extends w {
  constructor() {
    super(), this.project = null, this._storage = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._initializeStorage();
  }
  updated(t) {
    super.updated(t), t.has("hass") && this._initializeStorage();
  }
  _initializeStorage() {
    var t, e;
    if ((t = this.hass) != null && t.connection) {
      const i = ((e = this.hass.config) == null ? void 0 : e.entry_id) || "default";
      this._storage = new _(this.hass.connection, i);
    } else
      this._storage = new _(null, "default");
  }
  _handleNewFile() {
    if (!this.project) return;
    const t = {
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
        detail: { file: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileSelected(t) {
    const { fileId: e } = t.detail;
    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileOpen(t) {
    const { fileId: e } = t.detail;
    if (!this.project) return;
    const i = this.project.files.map((r) => ({
      ...r,
      isOpen: r.id === e || r.isOpen
    })), a = {
      ...this.project,
      files: i,
      activeFileId: e,
      lastModified: Date.now()
    };
    this._updateProject(a), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileRename(t) {
    const { fileId: e, newName: i } = t.detail;
    if (!this.project) return;
    const a = this.project.files.map((s) => s.id === e ? {
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
  _updateProject(t) {
    this.project = t, this._saveProject(), this.requestUpdate();
  }
  async _saveProject() {
    if (!(!this._storage || !this.project))
      try {
        await this._storage.saveProject(this.project);
      } catch (t) {
        console.error("Failed to save project", t);
      }
  }
  _generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  render() {
    return this.project ? d`
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
    ` : d`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
  }
};
E(h, "styles", x`
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
  `);
g([
  u({ attribute: !1 })
], h.prototype, "hass", 2);
g([
  u({ type: Object })
], h.prototype, "project", 2);
g([
  v()
], h.prototype, "_storage", 2);
h = g([
  F("st-project-explorer")
], h);
export {
  _ as ProjectStorage,
  l as STFileTree,
  h as STProjectExplorer
};
//# sourceMappingURL=project-B48wM8Lq.js.map
