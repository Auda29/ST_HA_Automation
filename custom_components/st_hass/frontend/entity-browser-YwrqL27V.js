var I = Object.defineProperty;
var C = (n, t, e) => t in n ? I(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var c = (n, t, e) => C(n, typeof t != "symbol" ? t + "" : t, e);
import { i as g, n as d, a as b, b as o, t as y, r as k } from "./lit-C178dhqO.js";
import { s as D } from "./ha-websocket-DcUbagYv.js";
var v = Object.defineProperty, O = Object.getOwnPropertyDescriptor, E = (n, t, e) => t in n ? v(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, h = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? O(t, e) : t, a = n.length - 1, s; a >= 0; a--)
    (s = n[a]) && (i = (r ? s(t, e, i) : s(i)) || i);
  return r && i && v(t, e, i), i;
}, S = (n, t, e) => E(n, t + "", e);
let l = class extends b {
  constructor() {
    super(), this.currentCode = "";
  }
  _handleDragStart(n) {
    if (!n.dataTransfer || !this.entity) return;
    const t = n.shiftKey ? "output" : "input", e = this._buildBindingSyntax(t), r = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction: t,
      bindingSyntax: e
    };
    n.dataTransfer.effectAllowed = "copy", n.dataTransfer.setData("text/plain", e), n.dataTransfer.setData("application/json", JSON.stringify(r)), this.classList.add("dragging");
  }
  _handleDragEnd() {
    this.classList.remove("dragging");
  }
  _buildBindingSyntax(n) {
    const t = n === "input" ? "%I*" : "%Q*";
    return `${this._entityIdToVarName(this.entity.entityId)} AT ${t} : ${this.inferredType} := '${this.entity.entityId}';`;
  }
  _dispatchInsertBinding(n, t) {
    t.preventDefault(), t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("insert-binding", {
        detail: {
          entityId: this.entity.entityId,
          direction: n,
          bindingSyntax: this._buildBindingSyntax(n)
        },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _dispatchRemoveBinding(n) {
    n.preventDefault(), n.stopPropagation(), this.dispatchEvent(
      new CustomEvent("remove-binding", {
        detail: { entityId: this.entity.entityId },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _hasBinding() {
    return !!this.currentCode && this.currentCode.includes(`'${this.entity.entityId}'`);
  }
  _entityIdToVarName(n) {
    const t = n.split(".");
    return t.length < 2 ? n : t[1].split("_").map((r, i) => i === 0 ? r : r.charAt(0).toUpperCase() + r.slice(1)).join("");
  }
  _getStateClass(n) {
    const t = n.toLowerCase();
    return t === "on" || t === "open" || t === "active" ? "on" : t === "off" || t === "closed" || t === "inactive" ? "off" : t === "unavailable" || t === "unknown" ? "unavailable" : "";
  }
  _getEntityIcon() {
    return this.entity.icon ? this.entity.icon : {
      light: "mdi:lightbulb",
      switch: "mdi:toggle-switch",
      sensor: "mdi:gauge",
      binary_sensor: "mdi:radiobox-marked",
      input_boolean: "mdi:toggle-switch-outline",
      input_number: "mdi:counter",
      number: "mdi:counter",
      climate: "mdi:thermostat",
      cover: "mdi:window-shutter",
      fan: "mdi:fan",
      lock: "mdi:lock",
      media_player: "mdi:cast"
    }[this.entity.domain] || "mdi:circle";
  }
  render() {
    if (!this.entity) return o``;
    const n = this._getStateClass(this.entity.state), t = this._getEntityIcon(), e = this.entity.friendlyName || this.entity.entityId, r = this._hasBinding();
    return o`
      <div
        class="entity-item"
        draggable="true"
        tabindex="0"
        role="button"
        aria-label="${e} - ${this.entity.entityId} - drag to editor to bind"
        @dragstart=${this._handleDragStart}
        @dragend=${this._handleDragEnd}
        title="Drag to editor. Hold Shift while dragging for an output binding."
      >
        ${this.isInput || this.isOutput ? o`<div
              class="direction-indicator ${this.isInput ? "input" : "output"}"
              title="${this.isInput ? "Input" : "Output"}"
            ></div>` : ""}
        <div class="entity-icon">
          <ha-icon .icon=${t}></ha-icon>
        </div>
        <div class="entity-info">
          <div class="entity-name">${e}</div>
          <div class="entity-id">${this.entity.entityId}</div>
        </div>
        <div class="entity-state ${n}">${this.entity.state}</div>
        <div class="entity-actions">
          <button
            class="entity-action"
            @click=${(i) => this._dispatchInsertBinding("input", i)}
            title="Insert input binding"
            aria-label="Insert input binding for ${e}"
          >
            + Input
          </button>
          <button
            class="entity-action output"
            @click=${(i) => this._dispatchInsertBinding("output", i)}
            title="Insert output binding"
            aria-label="Insert output binding for ${e}"
          >
            + Output
          </button>
          ${r ? o`
                <button
                  class="entity-action remove"
                  @click=${(i) => this._dispatchRemoveBinding(i)}
                  title="Remove binding from code"
                  aria-label="Remove binding for ${e}"
                >
                  Remove
                </button>
              ` : ""}
        </div>
      </div>
    `;
  }
};
S(l, "styles", g`
    :host {
      display: block;
    }

    .entity-item {
      display: flex;
      align-items: center;
      gap: var(--space-3, 12px);
      padding: var(--space-3, 12px);
      cursor: grab;
      border-radius: var(--radius-md, 12px);
      transition:
        transform var(--transition-fast, 160ms ease),
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease);
      user-select: none;
      border: 1px solid transparent;
      margin-bottom: 6px;
    }

    .entity-item:hover {
      background: rgba(21, 31, 39, 0.96);
      border-color: rgba(88, 127, 146, 0.22);
      transform: translateX(1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
    }

    .entity-item:active {
      cursor: grabbing;
    }

    .entity-item:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .entity-item.dragging {
      opacity: 0.5;
      border-style: dashed;
      border-color: rgba(91, 212, 255, 0.5);
    }

    .direction-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .direction-indicator.input {
      background: var(--status-connecting, #3aa0ff);
      box-shadow: 0 0 8px rgba(58, 160, 255, 0.35);
    }

    .direction-indicator.output {
      background: var(--status-paused, #ffce73);
      box-shadow: 0 0 8px rgba(255, 206, 115, 0.35);
    }

    .entity-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(132, 212, 238, 0.95);
      background: rgba(14, 165, 215, 0.12);
      flex-shrink: 0;
    }

    .entity-icon ha-icon {
      width: 18px;
      height: 18px;
    }

    .entity-info {
      flex: 1;
      min-width: 0;
    }

    .entity-name {
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--ui-text-primary, #f3f7fb);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-id {
      margin-top: 2px;
      font-size: var(--font-size-xs, 11px);
      color: var(--ui-text-muted, #8ea1af);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-state {
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-semibold, 600);
      padding: 6px 10px;
      border-radius: var(--radius-pill, 999px);
      background: rgba(28, 39, 48, 0.92);
      color: var(--ui-text-primary, #f3f7fb);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .entity-state.on {
      background: rgba(66, 214, 164, 0.16);
      color: #8ff0c9;
    }

    .entity-state.off {
      background: rgba(111, 124, 135, 0.22);
      color: #c5d0d8;
    }

    .entity-state.unavailable {
      background: rgba(255, 107, 107, 0.16);
      color: #ffb2b2;
    }

    .entity-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .entity-action {
      min-height: 30px;
      padding: 0 10px;
      border-radius: var(--radius-pill, 999px);
      border: 1px solid rgba(88, 127, 146, 0.24);
      background: rgba(24, 35, 43, 0.94);
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-semibold, 600);
      cursor: pointer;
      transition:
        background var(--transition-fast, 160ms ease),
        border-color var(--transition-fast, 160ms ease),
        transform var(--transition-fast, 160ms ease);
    }

    .entity-action:hover {
      background: rgba(34, 48, 58, 0.96);
      border-color: rgba(120, 173, 199, 0.44);
      transform: translateY(-1px);
    }

    .entity-action.output {
      color: #ffdb97;
      border-color: rgba(255, 206, 115, 0.28);
    }

    .entity-action.remove {
      color: #ffb2b2;
      border-color: rgba(255, 107, 107, 0.24);
    }
  `);
h([
  d({ type: Object })
], l.prototype, "entity", 2);
h([
  d({ type: String })
], l.prototype, "inferredType", 2);
h([
  d({ type: Boolean })
], l.prototype, "isInput", 2);
h([
  d({ type: Boolean })
], l.prototype, "isOutput", 2);
h([
  d({ type: String })
], l.prototype, "currentCode", 2);
l = h([
  y("st-entity-item")
], l);
var _ = Object.defineProperty, z = Object.getOwnPropertyDescriptor, T = (n, t, e) => t in n ? _(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, m = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? z(t, e) : t, a = n.length - 1, s; a >= 0; a--)
    (s = n[a]) && (i = (r ? s(t, e, i) : s(i)) || i);
  return r && i && _(t, e, i), i;
}, N = (n, t, e) => T(n, t + "", e);
let p = class extends b {
  constructor() {
    super();
    c(this, "_expandedDomains", /* @__PURE__ */ new Set());
    this.entities = [], this.filter = {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    }, this.currentCode = "";
  }
  _getDomainIcon(t) {
    return {
      light: "mdi:lightbulb",
      switch: "mdi:toggle-switch",
      sensor: "mdi:gauge",
      binary_sensor: "mdi:radiobox-marked",
      input_boolean: "mdi:toggle-switch-outline",
      input_number: "mdi:counter",
      number: "mdi:counter",
      climate: "mdi:thermostat",
      cover: "mdi:window-shutter",
      fan: "mdi:fan",
      lock: "mdi:lock",
      media_player: "mdi:cast",
      person: "mdi:account",
      device_tracker: "mdi:account-multiple",
      sun: "mdi:weather-sunny",
      weather: "mdi:weather-cloudy"
    }[t] || "mdi:circle";
  }
  _isInputEntity(t) {
    return [
      "sensor",
      "binary_sensor",
      "input_number",
      "input_text",
      "input_select",
      "sun",
      "weather"
    ].includes(t.domain);
  }
  _isOutputEntity(t) {
    return [
      "light",
      "switch",
      "input_boolean",
      "cover",
      "fan",
      "climate",
      "lock",
      "media_player"
    ].includes(t.domain);
  }
  _filterEntities(t) {
    return t.filter((e) => {
      if (this.filter.searchQuery) {
        const r = this.filter.searchQuery.toLowerCase();
        if (!(e.entityId.toLowerCase().includes(r) || e.friendlyName && e.friendlyName.toLowerCase().includes(r))) return !1;
      }
      return !(this.filter.selectedDomain && e.domain !== this.filter.selectedDomain || this.filter.showInputsOnly && !this._isInputEntity(e) || this.filter.showOutputsOnly && !this._isOutputEntity(e));
    });
  }
  _groupByDomain(t) {
    const e = /* @__PURE__ */ new Map();
    for (const i of t)
      e.has(i.domain) || e.set(i.domain, []), e.get(i.domain).push(i);
    const r = [];
    for (const [i, a] of e.entries())
      r.push({
        domain: i,
        entities: a.sort(
          (s, f) => (s.friendlyName || s.entityId).localeCompare(
            f.friendlyName || f.entityId
          )
        ),
        icon: this._getDomainIcon(i),
        expanded: this._expandedDomains.has(i)
      });
    return r.sort((i, a) => i.domain.localeCompare(a.domain));
  }
  _toggleDomain(t) {
    this._expandedDomains.has(t) ? this._expandedDomains.delete(t) : this._expandedDomains.add(t), this._expandedDomains = new Set(this._expandedDomains), this.requestUpdate();
  }
  render() {
    const t = this._filterEntities(this.entities), e = this._groupByDomain(t);
    return e.length === 0 ? o`
        <div class="empty-state">
          ${this.filter.searchQuery ? "No entities match your search" : "No entities available"}
        </div>
      ` : o`
      ${e.map(
      (r) => o`
          <div class="domain-group">
            <div
              class="domain-header"
              @click=${() => this._toggleDomain(r.domain)}
            >
              <div class="domain-icon">
                <ha-icon .icon=${r.icon}></ha-icon>
              </div>
              <div class="domain-name">${r.domain}</div>
              <div class="domain-count">${r.entities.length}</div>
              <div class="domain-toggle ${r.expanded ? "expanded" : ""}">
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </div>
            </div>
            ${r.expanded ? o`
                  <div class="domain-entities">
                    ${r.entities.map(
        (i) => o`
                        <st-entity-item
                          .entity=${i}
                          .inferredType=${L(i).dataType}
                          .isInput=${this._isInputEntity(i)}
                          .isOutput=${this._isOutputEntity(i)}
                          .currentCode=${this.currentCode}
                        ></st-entity-item>
                      `
      )}
                  </div>
                ` : ""}
          </div>
        `
    )}
    `;
  }
};
N(p, "styles", g`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      padding: var(--space-3, 12px);
      box-sizing: border-box;
    }

    .domain-group {
      margin-bottom: var(--space-3, 12px);
      border: 1px solid rgba(88, 127, 146, 0.16);
      border-radius: var(--radius-lg, 16px);
      background: rgba(14, 20, 26, 0.92);
      overflow: hidden;
    }

    .domain-header {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      padding: var(--space-3, 12px) var(--space-4, 16px);
      cursor: pointer;
      user-select: none;
      color: var(--ui-text-primary, #f3f7fb);
      transition: background var(--transition-fast, 160ms ease);
    }

    .domain-header:hover {
      background: rgba(24, 35, 43, 0.96);
    }

    .domain-icon {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(14, 165, 215, 0.14);
      color: rgba(132, 212, 238, 0.95);
    }

    .domain-icon ha-icon {
      width: 18px;
      height: 18px;
    }

    .domain-name {
      flex: 1;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-semibold, 600);
      text-transform: capitalize;
    }

    .domain-count {
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-pill, 999px);
      background: rgba(24, 37, 46, 0.92);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .domain-toggle {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ui-text-muted, #8ea1af);
      transition: transform var(--transition-fast, 160ms ease);
    }

    .domain-toggle.expanded {
      transform: rotate(90deg);
    }

    .domain-entities {
      padding: 0 var(--space-2, 8px) var(--space-2, 8px);
    }

    .empty-state {
      padding: var(--space-8, 32px) var(--space-5, 20px);
      text-align: center;
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-md, 14px);
    }
  `);
m([
  d({ type: Array })
], p.prototype, "entities", 2);
m([
  d({ type: Object })
], p.prototype, "filter", 2);
m([
  d({ type: String })
], p.prototype, "currentCode", 2);
m([
  k()
], p.prototype, "_expandedDomains", 2);
p = m([
  y("st-entity-list")
], p);
var w = Object.defineProperty, B = Object.getOwnPropertyDescriptor, P = (n, t, e) => t in n ? w(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, x = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? B(t, e) : t, a = n.length - 1, s; a >= 0; a--)
    (s = n[a]) && (i = (r ? s(t, e, i) : s(i)) || i);
  return r && i && w(t, e, i), i;
}, A = (n, t, e) => P(n, t + "", e);
let u = class extends b {
  constructor() {
    super();
    c(this, "_entities", /* @__PURE__ */ new Map());
    c(this, "_filter", {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    });
    c(this, "_domains", []);
    c(this, "_isConnected", !1);
    c(this, "_error", null);
    c(this, "_unsubscribe", null);
    this.currentCode = "";
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this.hass) != null && t.connection && this._connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._disconnect();
  }
  updated(t) {
    var e;
    if (super.updated(t), t.has("hass")) {
      const r = t.get("hass"), i = r == null ? void 0 : r.connection, a = (e = this.hass) == null ? void 0 : e.connection;
      i && i !== a && this._disconnect(), a && !this._unsubscribe && this._connect();
    }
  }
  async _connect() {
    var t, e;
    if (!((t = this.hass) != null && t.connection)) {
      this._error = "Home Assistant connection not available";
      return;
    }
    try {
      this._error = null, this._isConnected = !1, !this.hass.connection.haVersion && ((e = this.hass.config) != null && e.version) && (this.hass.connection.haVersion = this.hass.config.version), this.hass.states && this._handleEntityUpdate(this.hass.states), this._unsubscribe = D(this.hass.connection, (r) => {
        this._handleEntityUpdate(r);
      }), this._isConnected = !0;
    } catch (r) {
      this._error = r instanceof Error ? r.message : "Connection failed", this._isConnected = !1, console.error("Failed to subscribe to entities", r);
    }
  }
  _disconnect() {
    this._unsubscribe && (this._unsubscribe(), this._unsubscribe = null), this._isConnected = !1;
  }
  _handleEntityUpdate(t) {
    var i;
    const e = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
    for (const [a, s] of Object.entries(t)) {
      const f = a.split(".")[0];
      r.add(f);
      const $ = {
        entityId: a,
        state: s.state,
        attributes: s.attributes || {},
        domain: f,
        friendlyName: this._getFriendlyName(s),
        deviceClass: (i = s.attributes) == null ? void 0 : i.device_class,
        icon: this._getEntityIcon(s),
        lastChanged: s.lastChanged
      };
      e.set(a, $);
    }
    this._entities = e, this._domains = Array.from(r).sort(), this.requestUpdate();
  }
  _getFriendlyName(t) {
    var e;
    if ((e = t.attributes) != null && e.friendly_name)
      return t.attributes.friendly_name;
  }
  _getEntityIcon(t) {
    var e;
    if ((e = t.attributes) != null && e.icon)
      return t.attributes.icon;
  }
  static inferDataType(t) {
    const e = t.domain;
    if (["binary_sensor", "input_boolean", "switch", "light"].includes(e))
      return {
        dataType: "BOOL",
        confidence: "high",
        reason: `Domain ${e} typically uses boolean values`
      };
    if (e === "input_number" || e === "number")
      return {
        dataType: "REAL",
        confidence: "high",
        reason: `Domain ${e} typically uses numeric values`
      };
    if (e === "climate")
      return {
        dataType: "REAL",
        confidence: "medium",
        reason: "Climate entities often expose temperature setpoints"
      };
    if (e === "sensor") {
      const r = Number(t.state);
      if (!Number.isNaN(r)) {
        const i = Number.isInteger(r) && !t.state.includes(".");
        return {
          dataType: i ? "INT" : "REAL",
          confidence: "medium",
          reason: i ? "Sensor state is a whole number" : "Sensor state is a decimal number"
        };
      }
      return {
        dataType: "STRING",
        confidence: "medium",
        reason: "Sensor state is non-numeric text"
      };
    }
    return {
      dataType: "STRING",
      confidence: "low",
      reason: "Fallback type for unclassified entity domains"
    };
  }
  _getFilteredEntities() {
    return Array.from(this._entities.values());
  }
  _handleSearchInput(t) {
    this._filter = {
      ...this._filter,
      searchQuery: t.target.value
    }, this.requestUpdate();
  }
  _handleDomainChange(t) {
    const e = t.target.value;
    this._filter = {
      ...this._filter,
      selectedDomain: e || null
    }, this.requestUpdate();
  }
  _handleInputsToggle(t) {
    this._filter = {
      ...this._filter,
      showInputsOnly: t.target.checked
    }, this.requestUpdate();
  }
  _handleOutputsToggle(t) {
    this._filter = {
      ...this._filter,
      showOutputsOnly: t.target.checked
    }, this.requestUpdate();
  }
  render() {
    const t = this._getFilteredEntities(), e = this._error ? "status-error" : this._isConnected ? "status-connected" : "status-connecting", r = this._error ? this._error : this._isConnected ? "Connected to Home Assistant" : "Connecting to Home Assistant";
    return o`
      <div class="header">
        <div class="eyebrow">Entity Linker</div>
        <h2>Entity Browser</h2>
        <div class="search-shell">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            class="search-box"
            type="text"
            .value=${this._filter.searchQuery}
            @input=${this._handleSearchInput}
            placeholder="Filter entities, devices, or states"
            aria-label="Search entities"
          />
          ${this._filter.searchQuery ? o`
                <button
                  class="search-clear"
                  @click=${this._clearSearch}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              ` : ""}
        </div>
        <div class="filters">
          <select
            class="filter-select"
            @change=${this._handleDomainChange}
            aria-label="Filter by domain"
          >
            <option value="">All Domains</option>
            ${this._domains.map(
      (i) => o`
                <option
                  value=${i}
                  ?selected=${this._filter.selectedDomain === i}
                >
                  ${i}
                </option>
              `
    )}
          </select>
          <div class="checkbox-row">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                .checked=${this._filter.showInputsOnly}
                @change=${this._handleInputsToggle}
              />
              Inputs only
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                .checked=${this._filter.showOutputsOnly}
                @change=${this._handleOutputsToggle}
              />
              Outputs only
            </label>
          </div>
        </div>
        <div class="drag-hint">
          <ha-icon icon="mdi:drag-variant"></ha-icon>
          <span>
            Drag is optional. Use <strong>+ Input</strong>, <strong>+ Output</strong>,
            or <strong>Remove</strong> to edit bindings without covering the editor.
          </span>
        </div>
      </div>

      <div class="status-bar">
        <span class="status-indicator ${e}">
          <span class="status-dot"></span>
          ${r}
        </span>
        <span class="status-count">${t.length} entities</span>
      </div>

      <div class="entity-list-container">
        ${t.length === 0 ? o`
              <div class="empty-state">
                ${this._error ? "Entity stream unavailable" : "Waiting for entities from Home Assistant"}
              </div>
            ` : o`
              <st-entity-list
                .entities=${t}
                .filter=${this._filter}
                .currentCode=${this.currentCode}
              ></st-entity-list>
            `}
      </div>
    `;
  }
  _clearSearch() {
    this._filter = { ...this._filter, searchQuery: "" }, this.requestUpdate();
  }
};
A(u, "styles", g`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background:
        linear-gradient(180deg, rgba(15, 21, 27, 0.94), rgba(10, 14, 18, 0.94));
      color: var(--ui-text-primary, #f3f7fb);
      font-family: var(--font-ui, inherit);
    }

    .header {
      padding: 18px 16px 14px;
      border-bottom: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.28));
      background: rgba(8, 14, 20, 0.46);
      backdrop-filter: blur(10px);
    }

    .eyebrow {
      margin-bottom: 6px;
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }

    .header h2 {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: var(--font-weight-semibold, 600);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .search-shell {
      position: relative;
      margin-bottom: var(--space-3, 12px);
    }

    .search-shell ha-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ui-text-muted, #8ea1af);
      --mdc-icon-size: 16px;
    }

    .search-box,
    .filter-select {
      width: 100%;
      box-sizing: border-box;
      min-height: 40px;
      border: 1px solid rgba(88, 127, 146, 0.22);
      border-radius: var(--radius-md, 12px);
      background: rgba(25, 34, 42, 0.94);
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-md, 14px);
      font-family: inherit;
      transition: var(--transition-fast, all 160ms ease);
    }

    .search-box {
      padding: 0 36px 0 38px;
    }

    .search-box:focus,
    .filter-select:focus {
      outline: none;
      border-color: rgba(71, 187, 226, 0.48);
      box-shadow: 0 0 0 3px rgba(14, 165, 215, 0.12);
    }

    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--ui-text-muted, #8ea1af);
      cursor: pointer;
      border-radius: var(--radius-sm, 6px);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast, all 160ms ease);
    }

    .search-clear:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .search-clear ha-icon {
      --mdc-icon-size: 14px;
    }

    .drag-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: var(--radius-md, 10px);
      background: rgba(14, 165, 215, 0.08);
      border: 1px dashed rgba(91, 212, 255, 0.3);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-xs, 11px);
      line-height: 1.4;
    }

    .drag-hint ha-icon {
      --mdc-icon-size: 14px;
      color: var(--ui-info, #6bc9ff);
      flex-shrink: 0;
    }

    .drag-hint kbd {
      padding: 1px 5px;
      border: 1px solid rgba(140, 169, 193, 0.26);
      border-radius: 4px;
      background: rgba(9, 17, 25, 0.9);
      color: var(--ui-text-primary, #f3f7fb);
      font-family: var(--font-mono, monospace);
      font-size: 10px;
    }

    .filters {
      display: grid;
      gap: var(--space-2, 8px);
      grid-template-columns: minmax(0, 1fr);
    }

    .checkbox-row {
      display: grid;
      gap: var(--space-2, 8px);
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 38px;
      padding: 0 12px;
      border-radius: var(--radius-md, 12px);
      background: rgba(17, 24, 30, 0.94);
      border: 1px solid rgba(88, 127, 146, 0.18);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .filter-checkbox input {
      accent-color: var(--ui-primary, #0ea5d7);
      margin: 0;
    }

    .status-bar {
      padding: 12px 16px;
      font-size: var(--font-size-sm, 12px);
      color: var(--ui-text-secondary, #b6c4cf);
      border-bottom: 1px solid rgba(88, 127, 146, 0.18);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3, 12px);
      background: rgba(7, 12, 16, 0.78);
    }

    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .status-count {
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(88, 127, 146, 0.18);
      background: rgba(255, 255, 255, 0.04);
      color: var(--ui-text-primary, #f3f7fb);
      font-weight: 600;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }

    .status-connected {
      color: var(--status-online, #42d6a4);
    }

    .status-error {
      color: var(--status-error, #ff6b6b);
    }

    .status-connecting {
      color: var(--status-connecting, #6bc9ff);
    }

    .status-connecting .status-dot {
      animation: entity-pulse 1.1s infinite;
    }

    @keyframes entity-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @media (prefers-reduced-motion: reduce) {
      .status-connecting .status-dot {
        animation: none;
      }
    }

    .entity-list-container {
      flex: 1;
      overflow: hidden;
      padding: 8px;
    }

    .empty-state {
      padding: var(--space-8, 32px) var(--space-5, 20px);
      text-align: center;
      color: var(--ui-text-secondary, #b6c4cf);
    }
  `);
x([
  d({ attribute: !1 })
], u.prototype, "hass", 2);
x([
  d({ type: String })
], u.prototype, "currentCode", 2);
u = x([
  y("st-entity-browser")
], u);
const L = u.inferDataType;
export {
  u as STEntityBrowser,
  l as STEntityItem,
  p as STEntityList,
  L as inferDataType
};
//# sourceMappingURL=entity-browser-YwrqL27V.js.map
