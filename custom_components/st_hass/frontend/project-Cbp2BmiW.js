import { i as x, n as u, r as m, a as _, b as l, t as y } from "./lit-C178dhqO.js";
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, P = (t, e, i) => e in t ? w(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, h = (t, e, i, n) => {
  for (var r = n > 1 ? void 0 : n ? $(e, i) : e, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (r = (n ? s(e, i, r) : s(r)) || r);
  return n && r && w(e, i, r), r;
}, I = (t, e, i) => P(t, e + "", i);
let d = class extends _ {
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
      let n = t;
      for (let r = 0; r < i.length; r++) {
        const o = i[r], s = r === i.length - 1, c = s ? `file:${e.id}` : `folder:${o}`;
        n.children.has(c) || n.children.set(c, {
          name: o,
          path: i.slice(0, r + 1).join("/"),
          children: /* @__PURE__ */ new Map(),
          isFolder: !s
        });
        const a = n.children.get(c);
        s && (a.file = e), n = a;
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
    e.preventDefault(), e.stopPropagation(), this._editingFileId = t.id, this._editingName = t.name, this.updateComplete.then(() => {
      var n;
      if (this._editingFileId !== t.id) return;
      const i = (n = this.shadowRoot) == null ? void 0 : n.querySelector(".editing input");
      i == null || i.focus(), i == null || i.select();
    });
  }
  _finishRename(t) {
    if (this._editingFileId !== t) return;
    const e = this._editingName.trim();
    this._editingFileId = null, this._editingName = "", e && this.dispatchEvent(
      new CustomEvent("file-rename", {
        detail: { fileId: t, newName: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _getDisplayName(t, e) {
    return e ? t : t.replace(/\.st$/i, "");
  }
  _renderNode(t, e = 0) {
    const i = this._expandedPaths.has(t.path), n = t.children.size > 0;
    if (t.isFolder && t.path === "") {
      const a = Array.from(t.children.values()).sort((p, g) => p.isFolder !== g.isFolder ? p.isFolder ? -1 : 1 : p.name.localeCompare(g.name));
      return l`${a.map((p) => this._renderNode(p, e))}`;
    }
    if (t.isFolder)
      return l`
        <div class="tree-node">
          <div class="tree-item" @click=${() => this._toggleExpand(t.path)}>
            <div class="tree-toggle ${i ? "expanded" : ""}">
              ${n ? l`<ha-icon icon="mdi:chevron-right"></ha-icon>` : l`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder-open-outline"></ha-icon>
            </div>
            <div class="tree-label">${t.name}</div>
          </div>
          ${i ? l`
                <div class="tree-children">
                  ${Array.from(t.children.values()).sort((a, p) => a.isFolder !== p.isFolder ? a.isFolder ? -1 : 1 : a.name.localeCompare(p.name)).map((a) => this._renderNode(a, e + 1))}
                </div>
              ` : ""}
        </div>
      `;
    const r = t.file, o = r.id === this.activeFileId, s = r.id === this.selectedFileId, c = r.id === this._editingFileId;
    return l`
      <div class="tree-node">
        <div
          class="tree-item ${o ? "active" : ""} ${s ? "selected" : ""}"
          @click=${(a) => this._handleFileClick(r, a)}
          @dblclick=${(a) => this._handleFileDoubleClick(r, a)}
          @contextmenu=${(a) => this._startRename(r, a)}
          @keydown=${(a) => this._handleItemKey(a, r)}
          tabindex="0"
          role="treeitem"
          aria-selected=${o}
          title="${r.path} — double-click to open, F2 to rename, Delete to remove"
        >
          <div class="tree-toggle"></div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-document-outline"></ha-icon>
          </div>
          <div class="tree-label ${c ? "editing" : ""}">
            ${c ? l`
                  <input
                    .value=${this._editingName}
                    @click=${(a) => a.stopPropagation()}
                    @input=${(a) => this._editingName = a.target.value}
                    @blur=${() => this._finishRename(r.id)}
                    @keydown=${(a) => {
      a.stopPropagation(), a.key === "Enter" && (a.preventDefault(), this._finishRename(r.id)), a.key === "Escape" && (a.preventDefault(), this._editingFileId = null, this._editingName = "");
    }}
                  />
                ` : this._getDisplayName(r.name, c)}
          </div>
          ${r.hasUnsavedChanges ? l`<div class="unsaved-indicator" title="Unsaved changes"></div>` : ""}
          ${c ? "" : l`
                <div class="tree-actions">
                  <button
                    class="tree-action-btn"
                    title="Rename (F2)"
                    aria-label="Rename ${r.name}"
                    @click=${(a) => this._startRename(r, a)}
                  >
                    <ha-icon icon="mdi:pencil-outline"></ha-icon>
                  </button>
                  <button
                    class="tree-action-btn danger"
                    title="Delete"
                    aria-label="Delete ${r.name}"
                    @click=${(a) => this._handleDelete(r, a)}
                  >
                    <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }
  _handleItemKey(t, e) {
    t.target === t.currentTarget && (t.key === "Enter" ? (t.preventDefault(), this._handleFileDoubleClick(e, t)) : t.key === "F2" ? (t.preventDefault(), this._startRename(e, t)) : t.key === "Delete" && (t.preventDefault(), this._handleDelete(e, t)));
  }
  _handleDelete(t, e) {
    e.preventDefault(), e.stopPropagation(), confirm(
      `Delete "${t.name}"? This cannot be undone.`
    ) && this.dispatchEvent(
      new CustomEvent("file-deleted", {
        detail: { fileId: t.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    const t = this._buildTree();
    return this.files.length === 0 ? l`
        <div class="empty-hint">
          <ha-icon icon="mdi:file-plus-outline"></ha-icon>
          No files yet. Use <strong>New File</strong> to create your first ST
          program.
        </div>
      ` : l`
      <div class="file-tree" role="tree">${this._renderNode(t)}</div>
    `;
  }
};
I(d, "styles", x`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-size: var(--font-size-md, 14px);
      font-family: var(--font-ui, inherit);
      background: transparent;
      color: var(--primary-text-color, #212121);
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
      border-radius: 4px;
      transition:
        transform var(--transition-fast, 160ms ease),
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease);
      border: 1px solid transparent;
      color: var(--secondary-text-color, #666);
    }

    .tree-item:hover {
      background: var(--card-background-color, #fff);
      border-color: rgba(88, 127, 146, 0.18);
      transform: translateX(1px);
    }

    .tree-item:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .tree-item.active {
      background: var(--card-background-color, #fff);
      border-color: var(--divider-color, #ddd);
      border-inline-start-color: var(--primary-color, #03a9f4);
      color: var(--primary-text-color, #212121);
    }

    .tree-item.selected {
      background: var(--card-background-color, #fff);
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

    @media (hover: none), (max-width: 640px) {
      .tree-actions {
        opacity: 1;
      }
    }

    .tree-action-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm, 6px);
      background: transparent;
      color: var(--secondary-text-color, #666);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast, all 160ms ease);
    }

    .tree-action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--primary-text-color, #212121);
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
      color: var(--secondary-text-color, #666);
      transition: transform var(--transition-fast, 160ms ease);
    }

    .tree-toggle.expanded {
      transform: rotate(90deg);
    }

    .tree-icon {
      color: var(--primary-color, #03a9f4);
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
      background: var(--card-background-color, #fff);
    }

    .tree-label input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--primary-text-color, #212121);
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
      color: var(--secondary-text-color, #666);
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
h([
  u({ type: Array })
], d.prototype, "files", 2);
h([
  u({ type: String })
], d.prototype, "activeFileId", 2);
h([
  u({ type: String })
], d.prototype, "selectedFileId", 2);
h([
  m()
], d.prototype, "_expandedPaths", 2);
h([
  m()
], d.prototype, "_editingFileId", 2);
h([
  m()
], d.prototype, "_editingName", 2);
d = h([
  y("st-file-tree")
], d);
var F = Object.defineProperty, D = Object.getOwnPropertyDescriptor, N = (t, e, i) => e in t ? F(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, v = (t, e, i, n) => {
  for (var r = n > 1 ? void 0 : n ? D(e, i) : e, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (r = (n ? s(e, i, r) : s(r)) || r);
  return n && r && F(e, i, r), r;
}, k = (t, e, i) => N(t, e + "", i);
let f = class extends _ {
  constructor() {
    super(), this.project = null;
  }
  _handleNewFile() {
    if (!this.project) return;
    const t = new Set(this.project.files.map((r) => r.path.toLowerCase()));
    let e = "NewFile";
    for (let r = 2; t.has(`${e.toLowerCase()}.st`); r++)
      e = `NewFile${r}`;
    const i = `${e}.st`, n = {
      id: this._generateFileId(),
      name: i,
      path: i,
      content: `{mode: restart}
PROGRAM ${e}
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
        detail: { file: n },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  render() {
    return this.project ? l`
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
    ` : l`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
  }
};
k(f, "styles", x`
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
  `);
v([
  u({ attribute: !1 })
], f.prototype, "hass", 2);
v([
  u({ type: Object })
], f.prototype, "project", 2);
f = v([
  y("st-project-explorer")
], f);
const b = "st_hass_project";
class E {
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

(* Add inputs and outputs using Entities, then write your logic here. *)

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
    const i = Date.now(), n = {
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
      files: [n],
      activeFileId: n.id,
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
      files: i.files.map((n) => ({
        ...n,
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
export {
  E as P
};
//# sourceMappingURL=project-Cbp2BmiW.js.map
