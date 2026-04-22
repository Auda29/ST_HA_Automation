var I = Object.defineProperty;
var D = (a, t, e) => t in a ? I(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var c = (a, t, e) => D(a, typeof t != "symbol" ? t + "" : t, e);
import { i as g, n as l, a as b, b as o, t as y, r as k } from "./lit-C178dhqO.js";
import { s as O } from "./ha-websocket-DcUbagYv.js";
var x = Object.defineProperty, C = Object.getOwnPropertyDescriptor, T = (a, t, e) => t in a ? x(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, f = (a, t, e, n) => {
  for (var i = n > 1 ? void 0 : n ? C(t, e) : t, s = a.length - 1, r; s >= 0; s--)
    (r = a[s]) && (i = (n ? r(t, e, i) : r(i)) || i);
  return n && i && x(t, e, i), i;
}, z = (a, t, e) => T(a, t + "", e);
let d = class extends b {
  _handleDragStart(a) {
    if (!a.dataTransfer || !this.entity) return;
    const t = a.shiftKey ? "output" : "input", e = t === "input" ? "%I*" : "%Q*", i = `${this._entityIdToVarName(this.entity.entityId)} AT ${e} : ${this.inferredType} := '${this.entity.entityId}';`, s = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction: t,
      bindingSyntax: i
    };
    a.dataTransfer.effectAllowed = "copy", a.dataTransfer.setData("text/plain", i), a.dataTransfer.setData("application/json", JSON.stringify(s)), this.classList.add("dragging");
  }
  _handleDragEnd() {
    this.classList.remove("dragging");
  }
  _entityIdToVarName(a) {
    const t = a.split(".");
    return t.length < 2 ? a : t[1].split("_").map((n, i) => i === 0 ? n : n.charAt(0).toUpperCase() + n.slice(1)).join("");
  }
  _getStateClass(a) {
    const t = a.toLowerCase();
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
    const a = this._getStateClass(this.entity.state), t = this._getEntityIcon(), e = this.entity.friendlyName || this.entity.entityId;
    return o`
      <div
        class="entity-item"
        draggable="true"
        tabindex="0"
        role="button"
        aria-label="${e} — ${this.entity.entityId} — drag to editor to bind"
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
        <div class="entity-state ${a}">${this.entity.state}</div>
      </div>
    `;
  }
};
z(d, "styles", g`
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
  `);
f([
  l({ type: Object })
], d.prototype, "entity", 2);
f([
  l({ type: String })
], d.prototype, "inferredType", 2);
f([
  l({ type: Boolean })
], d.prototype, "isInput", 2);
f([
  l({ type: Boolean })
], d.prototype, "isOutput", 2);
d = f([
  y("st-entity-item")
], d);
var v = Object.defineProperty, E = Object.getOwnPropertyDescriptor, N = (a, t, e) => t in a ? v(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, m = (a, t, e, n) => {
  for (var i = n > 1 ? void 0 : n ? E(t, e) : t, s = a.length - 1, r; s >= 0; s--)
    (r = a[s]) && (i = (n ? r(t, e, i) : r(i)) || i);
  return n && i && v(t, e, i), i;
}, S = (a, t, e) => N(a, t + "", e);
let p = class extends b {
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
        const n = this.filter.searchQuery.toLowerCase();
        if (!(e.entityId.toLowerCase().includes(n) || e.friendlyName && e.friendlyName.toLowerCase().includes(n))) return !1;
      }
      return !(this.filter.selectedDomain && e.domain !== this.filter.selectedDomain || this.filter.showInputsOnly && !this._isInputEntity(e) || this.filter.showOutputsOnly && !this._isOutputEntity(e));
    });
  }
  _groupByDomain(t) {
    const e = /* @__PURE__ */ new Map();
    for (const i of t)
      e.has(i.domain) || e.set(i.domain, []), e.get(i.domain).push(i);
    const n = [];
    for (const [i, s] of e.entries())
      n.push({
        domain: i,
        entities: s.sort(
          (r, u) => (r.friendlyName || r.entityId).localeCompare(
            u.friendlyName || u.entityId
          )
        ),
        icon: this._getDomainIcon(i),
        expanded: this._expandedDomains.has(i)
      });
    return n.sort((i, s) => i.domain.localeCompare(s.domain));
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
      (n) => o`
          <div class="domain-group">
            <div
              class="domain-header"
              @click=${() => this._toggleDomain(n.domain)}
            >
              <div class="domain-icon">
                <ha-icon .icon=${n.icon}></ha-icon>
              </div>
              <div class="domain-name">${n.domain}</div>
              <div class="domain-count">${n.entities.length}</div>
              <div class="domain-toggle ${n.expanded ? "expanded" : ""}">
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </div>
            </div>
            ${n.expanded ? o`
                  <div class="domain-entities">
                    ${n.entities.map(
        (i) => o`
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
S(p, "styles", g`
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
  l({ type: Array })
], p.prototype, "entities", 2);
m([
  l({ type: Object })
], p.prototype, "filter", 2);
m([
  k()
], p.prototype, "_expandedDomains", 2);
p = m([
  y("st-entity-list")
], p);
var _ = Object.defineProperty, A = Object.getOwnPropertyDescriptor, P = (a, t, e) => t in a ? _(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, w = (a, t, e, n) => {
  for (var i = n > 1 ? void 0 : n ? A(t, e) : t, s = a.length - 1, r; s >= 0; s--)
    (r = a[s]) && (i = (n ? r(t, e, i) : r(i)) || i);
  return n && i && _(t, e, i), i;
}, L = (a, t, e) => P(a, t + "", e);
let h = class extends b {
  constructor() {
    super(...arguments);
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
    var e;
    if (super.updated(t), t.has("hass")) {
      const n = t.get("hass"), i = n == null ? void 0 : n.connection, s = (e = this.hass) == null ? void 0 : e.connection;
      i && i !== s && this._disconnect(), s && !this._unsubscribe && this._connect();
    }
  }
  async _connect() {
    var t, e;
    if (!((t = this.hass) != null && t.connection)) {
      this._error = "Home Assistant connection not available";
      return;
    }
    try {
      this._error = null, this._isConnected = !1, !this.hass.connection.haVersion && ((e = this.hass.config) != null && e.version) && (this.hass.connection.haVersion = this.hass.config.version), this.hass.states && this._handleEntityUpdate(this.hass.states), this._unsubscribe = O(this.hass.connection, (n) => {
        this._handleEntityUpdate(n);
      }), this._isConnected = !0;
    } catch (n) {
      this._error = n instanceof Error ? n.message : "Connection failed", this._isConnected = !1, console.error("Failed to subscribe to entities", n);
    }
  }
  _disconnect() {
    this._unsubscribe && (this._unsubscribe(), this._unsubscribe = null), this._isConnected = !1;
  }
  _handleEntityUpdate(t) {
    var i;
    const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
    for (const [s, r] of Object.entries(t)) {
      const u = s.split(".")[0];
      n.add(u);
      const $ = {
        entityId: s,
        state: r.state,
        attributes: r.attributes || {},
        domain: u,
        friendlyName: this._getFriendlyName(r),
        deviceClass: (i = r.attributes) == null ? void 0 : i.device_class,
        icon: this._getEntityIcon(r),
        lastChanged: r.lastChanged
      };
      e.set(s, $);
    }
    this._entities = e, this._domains = Array.from(n).sort(), this.requestUpdate();
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
      const n = Number(t.state);
      if (!Number.isNaN(n)) {
        const i = Number.isInteger(n) && !t.state.includes(".");
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
    const t = this._getFilteredEntities(), e = this._error ? "status-error" : this._isConnected ? "status-connected" : "status-connecting", n = this._error ? this._error : this._isConnected ? "Connected to Home Assistant" : "Connecting to Home Assistant";
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
            Drag an entity onto the editor. Hold <kbd>Shift</kbd> for an output
            binding.
          </span>
        </div>
      </div>

      <div class="status-bar">
        <span class="status-indicator ${e}">
          <span class="status-dot"></span>
          ${n}
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
              ></st-entity-list>
            `}
      </div>
    `;
  }
  _clearSearch() {
    this._filter = { ...this._filter, searchQuery: "" }, this.requestUpdate();
  }
};
L(h, "styles", g`
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
w([
  l({ attribute: !1 })
], h.prototype, "hass", 2);
h = w([
  y("st-entity-browser")
], h);
const j = h.inferDataType;
export {
  h as STEntityBrowser,
  d as STEntityItem,
  p as STEntityList,
  j as inferDataType
};
//# sourceMappingURL=entity-browser-BAvmIZm8.js.map
