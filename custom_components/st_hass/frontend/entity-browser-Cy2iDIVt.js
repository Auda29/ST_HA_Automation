var O = Object.defineProperty;
var I = (n, t, e) => t in n ? O(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var c = (n, t, e) => I(n, typeof t != "symbol" ? t + "" : t, e);
import { i as y, n as d, a as g, b as a, t as _, r as D } from "./lit-C178dhqO.js";
import { s as C } from "./ha-websocket-DcUbagYv.js";
var v = Object.defineProperty, T = Object.getOwnPropertyDescriptor, k = (n, t, e) => t in n ? v(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, m = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? T(t, e) : t, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && v(t, e, i), i;
}, N = (n, t, e) => k(n, t + "", e);
let l = class extends g {
  _handleDragStart(n) {
    if (!n.dataTransfer || !this.entity) return;
    const t = n.shiftKey ? "output" : "input", e = t === "input" ? "%I*" : "%Q*", i = `${this._entityIdToVarName(this.entity.entityId)} AT ${e} : ${this.inferredType} := '${this.entity.entityId}';`, s = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction: t,
      bindingSyntax: i
    };
    n.dataTransfer.effectAllowed = "copy", n.dataTransfer.setData("text/plain", i), n.dataTransfer.setData("application/json", JSON.stringify(s)), this.classList.add("dragging");
  }
  _handleDragEnd() {
    this.classList.remove("dragging");
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
    if (!this.entity) return a``;
    const n = this._getStateClass(this.entity.state), t = this._getEntityIcon(), e = this.entity.friendlyName || this.entity.entityId;
    return a`
      <div
        class="entity-item"
        draggable="true"
        @dragstart=${this._handleDragStart}
        @dragend=${this._handleDragEnd}
        title="Drag to editor (Shift+drag for output binding)"
      >
        ${this.isInput || this.isOutput ? a`<div
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
      </div>
    `;
  }
};
N(l, "styles", y`
    :host {
      display: block;
    }
    .entity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: grab;
      border-radius: 4px;
      transition: background-color 0.2s;
      user-select: none;
    }
    .entity-item:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .entity-item:active {
      cursor: grabbing;
    }
    .entity-item.dragging {
      opacity: 0.5;
    }
    .entity-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-text-color);
    }
    .entity-icon ha-icon {
      width: 20px;
      height: 20px;
    }
    .entity-info {
      flex: 1;
      min-width: 0;
    }
    .entity-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entity-id {
      font-size: 11px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entity-state {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      background-color: var(--secondary-background-color);
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .entity-state.on {
      background-color: var(--success-color, #4caf50);
      color: white;
    }
    .entity-state.off {
      background-color: var(--disabled-color, #9e9e9e);
      color: white;
    }
    .entity-state.unavailable {
      background-color: var(--error-color, #f44336);
      color: white;
    }
    .direction-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .direction-indicator.input {
      background-color: var(--info-color, #2196f3);
    }
    .direction-indicator.output {
      background-color: var(--warning-color, #ff9800);
    }
  `);
m([
  d({ type: Object })
], l.prototype, "entity", 2);
m([
  d({ type: String })
], l.prototype, "inferredType", 2);
m([
  d({ type: Boolean })
], l.prototype, "isInput", 2);
m([
  d({ type: Boolean })
], l.prototype, "isOutput", 2);
l = m([
  _("st-entity-item")
], l);
var b = Object.defineProperty, E = Object.getOwnPropertyDescriptor, S = (n, t, e) => t in n ? b(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, f = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? E(t, e) : t, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && b(t, e, i), i;
}, z = (n, t, e) => S(n, t + "", e);
let p = class extends g {
  constructor() {
    super();
    c(this, "_expandedDomains", /* @__PURE__ */ new Set());
    this.entities = [], this.filter = {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    };
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
    for (const [i, s] of e.entries())
      r.push({
        domain: i,
        entities: s.sort(
          (o, u) => (o.friendlyName || o.entityId).localeCompare(
            u.friendlyName || u.entityId
          )
        ),
        icon: this._getDomainIcon(i),
        expanded: this._expandedDomains.has(i)
      });
    return r.sort((i, s) => i.domain.localeCompare(s.domain));
  }
  _toggleDomain(t) {
    this._expandedDomains.has(t) ? this._expandedDomains.delete(t) : this._expandedDomains.add(t), this._expandedDomains = new Set(this._expandedDomains), this.requestUpdate();
  }
  render() {
    const t = this._filterEntities(this.entities), e = this._groupByDomain(t);
    return e.length === 0 ? a`
        <div class="empty-state">
          ${this.filter.searchQuery ? "No entities match your search" : "No entities available"}
        </div>
      ` : a`
      ${e.map(
      (r) => a`
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
            ${r.expanded ? a`
                  <div class="domain-entities">
                    ${r.entities.map(
        (i) => a`
                        <st-entity-item
                          .entity=${i}
                          .inferredType=${j(i).dataType}
                          .isInput=${this._isInputEntity(i)}
                          .isOutput=${this._isOutputEntity(i)}
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
z(p, "styles", y`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }
    .domain-group {
      margin-bottom: 8px;
    }
    .domain-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      color: var(--primary-text-color);
      background-color: var(--secondary-background-color);
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .domain-header:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .domain-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .domain-icon ha-icon {
      width: 20px;
      height: 20px;
    }
    .domain-name {
      flex: 1;
      font-size: 14px;
    }
    .domain-count {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .domain-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .domain-toggle.expanded {
      transform: rotate(90deg);
    }
    .domain-entities {
      margin-top: 4px;
      padding-left: 8px;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 14px;
    }
  `);
f([
  d({ type: Array })
], p.prototype, "entities", 2);
f([
  d({ type: Object })
], p.prototype, "filter", 2);
f([
  D()
], p.prototype, "_expandedDomains", 2);
p = f([
  _("st-entity-list")
], p);
var x = Object.defineProperty, P = Object.getOwnPropertyDescriptor, A = (n, t, e) => t in n ? x(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, w = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? P(t, e) : t, s = n.length - 1, o; s >= 0; s--)
    (o = n[s]) && (i = (r ? o(t, e, i) : o(i)) || i);
  return r && i && x(t, e, i), i;
}, L = (n, t, e) => A(n, t + "", e);
let h = class extends g {
  constructor() {
    super(...arguments);
    // Home Assistant object with connection
    // Internal state (we manually trigger updates when these change)
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
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this.hass) != null && t.connection && this._connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._disconnect();
  }
  updated(t) {
    var e, r;
    if (super.updated(t), t.has("hass")) {
      const i = t.get("hass");
      i && i.connection !== ((e = this.hass) == null ? void 0 : e.connection) && (this._disconnect(), (r = this.hass) != null && r.connection && this._connect());
    }
  }
  /**
   * Connect to HA WebSocket and subscribe to entity updates
   */
  async _connect() {
    var t, e;
    if (!((t = this.hass) != null && t.connection)) {
      this._error = "Home Assistant connection not available";
      return;
    }
    try {
      this._error = null, this._isConnected = !1, !this.hass.connection.haVersion && ((e = this.hass.config) != null && e.version) && (this.hass.connection.haVersion = this.hass.config.version), this._unsubscribe = C(
        this.hass.connection,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r) => {
          this._handleEntityUpdate(r);
        }
      ), this._isConnected = !0;
    } catch (r) {
      this._error = r instanceof Error ? r.message : "Connection failed", this._isConnected = !1, console.error("Failed to subscribe to entities", r);
    }
  }
  /**
   * Disconnect from WebSocket subscription
   */
  _disconnect() {
    this._unsubscribe && (this._unsubscribe(), this._unsubscribe = null), this._isConnected = !1;
  }
  /**
   * Handle entity state updates from WebSocket
   */
  _handleEntityUpdate(t) {
    var i;
    const e = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
    for (const [s, o] of Object.entries(t)) {
      const u = s.split(".")[0];
      r.add(u);
      const $ = {
        entityId: s,
        state: o.state,
        attributes: o.attributes || {},
        domain: u,
        friendlyName: this._getFriendlyName(o),
        deviceClass: (i = o.attributes) == null ? void 0 : i.device_class,
        icon: this._getEntityIcon(o),
        lastChanged: o.lastChanged
      };
      e.set(s, $);
    }
    this._entities = e, this._domains = Array.from(r).sort(), this.requestUpdate();
  }
  /**
   * Extract friendly name from entity state
   */
  _getFriendlyName(t) {
    var e;
    if ((e = t.attributes) != null && e.friendly_name)
      return t.attributes.friendly_name;
  }
  /**
   * Extract icon from entity state
   */
  _getEntityIcon(t) {
    var e;
    if ((e = t.attributes) != null && e.icon)
      return t.attributes.icon;
  }
  /**
   * Infer data type from entity
   */
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
        reason: `Domain ${e} uses numeric values`
      };
    if (e === "sensor") {
      const r = parseFloat(t.state);
      return isNaN(r) ? {
        dataType: "STRING",
        confidence: "medium",
        reason: "Sensor state is non-numeric"
      } : Number.isInteger(r) ? {
        dataType: "INT",
        confidence: "medium",
        reason: "Sensor state is a numeric integer"
      } : {
        dataType: "REAL",
        confidence: "medium",
        reason: "Sensor state is a numeric value"
      };
    }
    return {
      dataType: "STRING",
      confidence: "low",
      reason: "Unknown domain, defaulting to STRING"
    };
  }
  _handleSearchChange(t) {
    const e = t.target;
    this._filter = {
      ...this._filter,
      searchQuery: e.value
    };
  }
  _handleDomainChange(t) {
    const e = t.target;
    this._filter = {
      ...this._filter,
      selectedDomain: e.value || null
    };
  }
  _handleInputsOnlyChange(t) {
    const e = t.target;
    this._filter = {
      ...this._filter,
      showInputsOnly: e.checked,
      showOutputsOnly: !1
      // Mutually exclusive
    };
  }
  _handleOutputsOnlyChange(t) {
    const e = t.target;
    this._filter = {
      ...this._filter,
      showInputsOnly: !1,
      // Mutually exclusive
      showOutputsOnly: e.checked
    };
  }
  render() {
    const t = Array.from(this._entities.values());
    return a`
      <div class="header">
        <h2>Entity Browser</h2>
        <input
          type="text"
          class="search-box"
          placeholder="🔍 Filter entities..."
          .value=${this._filter.searchQuery}
          @input=${this._handleSearchChange}
        />
        <div class="filters">
          <select
            class="filter-select"
            @change=${this._handleDomainChange}
            .value=${this._filter.selectedDomain || ""}
          >
            <option value="">All Domains</option>
            ${this._domains.map(
      (e) => a` <option value=${e}>${e}</option> `
    )}
          </select>
          <label class="filter-checkbox">
            <input
              type="checkbox"
              .checked=${this._filter.showInputsOnly}
              @change=${this._handleInputsOnlyChange}
            />
            Inputs Only
          </label>
          <label class="filter-checkbox">
            <input
              type="checkbox"
              .checked=${this._filter.showOutputsOnly}
              @change=${this._handleOutputsOnlyChange}
            />
            Outputs Only
          </label>
        </div>
      </div>
      <div class="status-bar">
        <span class=${this._isConnected ? "status-connected" : ""}>
          ${this._isConnected ? `✓ ${t.length} entities` : "Connecting..."}
        </span>
        ${this._error ? a`<span class="status-error">${this._error}</span>` : ""}
      </div>
      <div class="entity-list-container">
        ${this._isConnected ? a`
              <st-entity-list
                .entities=${t}
                .filter=${this._filter}
              ></st-entity-list>
            ` : a`
              <div class="empty-state">
                ${this._error || "Connecting to Home Assistant..."}
              </div>
            `}
      </div>
    `;
  }
};
L(h, "styles", y`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
    }
    .header {
      padding: 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    .header h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .search-box {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 14px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    .search-box:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .filters {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .filter-select {
      flex: 1;
      min-width: 120px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--primary-text-color);
    }
    .filter-checkbox input {
      margin: 0;
    }
    .status-bar {
      padding: 8px 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      display: flex;
      justify-content: space-between;
    }
    .status-connected {
      color: var(--success-color, #4caf50);
    }
    .status-error {
      color: var(--error-color, #f44336);
    }
    .entity-list-container {
      flex: 1;
      overflow: hidden;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
    }
  `);
w([
  d({ attribute: !1 })
], h.prototype, "hass", 2);
h = w([
  _("st-entity-browser")
], h);
function j(n) {
  return h.inferDataType(n);
}
export {
  h as STEntityBrowser,
  l as STEntityItem,
  p as STEntityList,
  j as inferDataType
};
//# sourceMappingURL=entity-browser-Cy2iDIVt.js.map
