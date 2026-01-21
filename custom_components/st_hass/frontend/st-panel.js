var se = Object.defineProperty;
var ne = (n, t, e) => t in n ? se(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var l = (n, t, e) => ne(n, typeof t != "symbol" ? t + "" : t, e);
import { S as ae, c as oe, L as re, E as T, H as le, s as ce, a as K, b as he, D as M, W as de, C as pe, d as y, l as ue, h as ge, e as me, f as fe, g as Ee, i as be, j as ve, k as Se, m as Le, n as ye, o as _e, p as Oe, q as Ue, r as Ce, t as Ne, u as Te, v as Re, w as Ae, x as we, y as Me } from "./codemirror-C8x9REUs.js";
import { W as g } from "./vendor-BhPS5zVw.js";
import { i as j, n as L, a as W, b as u, t as G, r as E } from "./lit-C178dhqO.js";
import { s as Be } from "./ha-websocket-DcUbagYv.js";
import { c as r, L as R, C as Ie } from "./chevrotain-cBR36crC.js";
import { a as Y } from "./analyzer-DbAWr__X.js";
const X = [
  "PROGRAM",
  "END_PROGRAM",
  "FUNCTION",
  "END_FUNCTION",
  "FUNCTION_BLOCK",
  "END_FUNCTION_BLOCK",
  "VAR",
  "VAR_INPUT",
  "VAR_OUTPUT",
  "VAR_IN_OUT",
  "VAR_GLOBAL",
  "END_VAR",
  "CONSTANT",
  "IF",
  "THEN",
  "ELSIF",
  "ELSE",
  "END_IF",
  "CASE",
  "OF",
  "END_CASE",
  "FOR",
  "TO",
  "BY",
  "DO",
  "END_FOR",
  "WHILE",
  "END_WHILE",
  "REPEAT",
  "UNTIL",
  "END_REPEAT",
  "EXIT",
  "RETURN",
  "CONTINUE",
  "AND",
  "OR",
  "XOR",
  "NOT",
  "MOD",
  "TRUE",
  "FALSE",
  "AT"
], Q = [
  "BOOL",
  "BYTE",
  "WORD",
  "DWORD",
  "LWORD",
  "SINT",
  "INT",
  "DINT",
  "LINT",
  "USINT",
  "UINT",
  "UDINT",
  "ULINT",
  "REAL",
  "LREAL",
  "STRING",
  "WSTRING",
  "TIME",
  "DATE",
  "TIME_OF_DAY",
  "DATE_AND_TIME",
  "TOD",
  "DT"
], Z = [
  "SEL",
  "MUX",
  "MAX",
  "MIN",
  "LIMIT",
  "ABS",
  "SQRT",
  "LN",
  "LOG",
  "EXP",
  "SIN",
  "COS",
  "TAN",
  "TRUNC",
  "ROUND",
  "CEIL",
  "FLOOR",
  "TO_BOOL",
  "TO_INT",
  "TO_DINT",
  "TO_REAL",
  "TO_LREAL",
  "TO_STRING",
  "LEN",
  "LEFT",
  "RIGHT",
  "MID",
  "CONCAT",
  "FIND"
], J = [
  "R_TRIG",
  "F_TRIG",
  "SR",
  "RS",
  "TON",
  "TOF",
  "TP",
  "CTU",
  "CTD",
  "CTUD"
], ke = [
  "trigger",
  "no_trigger",
  "persistent",
  "transient",
  "reset_on_restart",
  "require_restore",
  "mode",
  "max_queued",
  "max_parallel",
  "throttle",
  "debounce"
], H = ae.define({
  name: "structuredtext",
  startState() {
    return { inBlockComment: !1 };
  },
  copyState(n) {
    return { inBlockComment: n.inBlockComment };
  },
  token(n, t) {
    if (n.eatSpace()) return null;
    if (n.match("(*") && (t.inBlockComment = !0), t.inBlockComment) {
      for (; !n.eol(); ) {
        if (n.match("*)"))
          return t.inBlockComment = !1, "comment";
        n.next();
      }
      return "comment";
    }
    if (n.match("//"))
      return n.skipToEnd(), "comment";
    if (n.match("{")) {
      let e = 1;
      for (; !n.eol() && e > 0; ) {
        const s = n.next();
        s === "{" && e++, s === "}" && e--;
      }
      return "meta";
    }
    if (n.match("'")) {
      for (; !n.eol(); )
        if (n.next() === "'" && !n.match("'"))
          return "string";
      return "string";
    }
    if (n.match(/T#[\d_hmsdu]+/i) || n.match(/TIME#[\d_hmsdu]+/i) || n.match(/16#[\da-fA-F_]+/) || n.match(/2#[01_]+/) || n.match(/8#[0-7_]+/) || n.match(/\d+\.\d+([eE][+-]?\d+)?/) || n.match(/\d+/))
      return "number";
    if (n.match(":=") || n.match("<=") || n.match(">=") || n.match("<>") || n.match("=>"))
      return "operator";
    if (n.match(/%[IQM][XBWDLxbwdl]?\*?/i))
      return "keyword";
    if (n.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const e = n.current().toUpperCase();
      return X.includes(e) ? "keyword" : Q.includes(e) ? "typeName" : Z.includes(e) ? "function.standard" : J.includes(e) ? "className" : "variableName";
    }
    return n.match(/[+\-*=<>()[\];:,.]/) ? "operator" : (n.next(), null);
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] }
  }
}), xe = oe([
  ...X.map((n) => ({ label: n, type: "keyword" })),
  ...Q.map((n) => ({ label: n, type: "type" })),
  ...Z.map((n) => ({ label: n, type: "function" })),
  ...J.map((n) => ({ label: n, type: "class" })),
  ...ke.map((n) => ({
    label: `{${n}}`,
    type: "keyword",
    detail: "pragma"
  })),
  {
    label: "PROGRAM",
    type: "keyword",
    apply: `PROGRAM \${name}
VAR
	
END_VAR


END_PROGRAM`,
    detail: "template"
  },
  {
    label: "IF",
    type: "keyword",
    apply: `IF \${cond} THEN
	
END_IF`,
    detail: "template"
  }
]);
function Pe() {
  return new re(H, [
    H.data.of({ autocomplete: xe })
  ]);
}
const d = {
  bg: "#1e1e1e",
  bgLight: "#252526",
  fg: "#d4d4d4",
  keyword: "#569cd6",
  type: "#4ec9b0",
  function: "#dcdcaa",
  variable: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  comment: "#6a9955",
  pragma: "#c586c0",
  selection: "#264f78",
  cursor: "#aeafad",
  lineHighlight: "#2a2d2e",
  gutterBg: "#1e1e1e",
  gutterFg: "#858585",
  border: "#404040"
}, De = T.theme(
  {
    "&": {
      color: d.fg,
      backgroundColor: d.bg,
      fontSize: "14px",
      fontFamily: '"Fira Code", "Consolas", monospace'
    },
    ".cm-content": {
      caretColor: d.cursor
    },
    ".cm-cursor": {
      borderLeftColor: d.cursor,
      borderLeftWidth: "2px"
    },
    // Selection highlighting - semi-transparent so text remains visible
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(38, 79, 120, 0.5)"
    },
    ".cm-selectionBackground": {
      backgroundColor: "rgba(38, 79, 120, 0.5)"
    },
    "& .cm-selectionLayer .cm-selectionBackground": {
      backgroundColor: "rgba(38, 79, 120, 0.5)"
    },
    ".cm-selectionMatch": {
      backgroundColor: "rgba(58, 61, 65, 0.5)"
    },
    // Native selection fallback
    ".cm-content ::selection": {
      backgroundColor: "rgba(38, 79, 120, 0.5)"
    },
    ".cm-line ::selection": {
      backgroundColor: "rgba(38, 79, 120, 0.5)"
    },
    ".cm-activeLine": {
      backgroundColor: d.lineHighlight
    },
    ".cm-gutters": {
      backgroundColor: d.gutterBg,
      color: d.gutterFg,
      border: "none",
      borderRight: `1px solid ${d.border}`
    },
    ".cm-activeLineGutter": {
      backgroundColor: d.lineHighlight,
      color: d.fg
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer"
    },
    ".cm-tooltip": {
      backgroundColor: d.bgLight,
      border: `1px solid ${d.border}`
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: d.selection
    }
  },
  { dark: !0 }
), Fe = le.define([
  { tag: g.keyword, color: d.keyword, fontWeight: "bold" },
  { tag: g.typeName, color: d.type },
  {
    tag: [g.function(g.variableName), g.standard(g.function(g.variableName))],
    color: d.function
  },
  { tag: g.className, color: d.type },
  { tag: g.variableName, color: d.variable },
  { tag: g.propertyName, color: d.variable },
  { tag: g.string, color: d.string },
  { tag: g.number, color: d.number },
  { tag: g.comment, color: d.comment, fontStyle: "italic" },
  { tag: g.meta, color: d.pragma },
  { tag: g.operator, color: d.fg },
  { tag: g.invalid, color: "#ff0000", textDecoration: "underline wavy" }
]);
function $e() {
  return [De, ce(Fe)];
}
class Ve {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(t) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    l(this, "connection");
    // HomeAssistant WebSocket connection
    l(this, "bindings", /* @__PURE__ */ new Map());
    l(this, "entityStates", /* @__PURE__ */ new Map());
    l(this, "liveValues", /* @__PURE__ */ new Map());
    l(this, "subscribers", /* @__PURE__ */ new Set());
    l(this, "unsubscribe", null);
    l(this, "status", "disconnected");
    l(this, "updateRate", 100);
    l(this, "showConditions", !0);
    l(this, "highlightChanges", !0);
    this.connection = t;
  }
  /**
   * Start online mode with given variable bindings
   */
  async start(t) {
    this.status = "connecting", this.notifySubscribers(), this.bindings.clear();
    for (const e of t)
      this.bindings.set(e.variableName, e);
    try {
      this.unsubscribe = Be(
        this.connection,
        (e) => {
          this.handleHassEntityUpdate(e);
        }
      ), this.status = "online", this.notifySubscribers();
    } catch (e) {
      throw this.status = "error", this.notifySubscribers(), e;
    }
  }
  /**
   * Stop online mode
   */
  stop() {
    this.unsubscribe && (this.unsubscribe(), this.unsubscribe = null), this.status = "disconnected", this.liveValues.clear(), this.notifySubscribers();
  }
  /**
   * Pause/resume updates
   */
  setPaused(t) {
    this.status = t ? "paused" : "online", this.notifySubscribers();
  }
  /**
   * Subscribe to state changes
   */
  subscribe(t) {
    return this.subscribers.add(t), () => this.subscribers.delete(t);
  }
  /**
   * Get current state
   */
  getState() {
    return {
      status: this.status,
      bindings: Array.from(this.bindings.values()),
      liveValues: this.liveValues,
      updateRate: this.updateRate,
      showConditions: this.showConditions,
      highlightChanges: this.highlightChanges
    };
  }
  /**
   * Get live value for a variable
   */
  getLiveValue(t) {
    return this.liveValues.get(t) || null;
  }
  // ==========================================================================
  // Internal Methods
  // ==========================================================================
  /**
   * Handle entity updates from home-assistant-js-websocket
   * Converts HassEntities to our internal EntityState format
   */
  handleHassEntityUpdate(t) {
    if (this.status === "paused") return;
    const e = {};
    for (const [s, i] of Object.entries(t))
      e[s] = {
        entityId: i.entity_id,
        state: i.state,
        lastChanged: i.last_changed,
        attributes: i.attributes
      };
    this.handleEntityUpdate(e);
  }
  handleEntityUpdate(t) {
    if (this.status === "paused") return;
    const e = Date.now();
    for (const [s, i] of Object.entries(t))
      this.entityStates.set(s, i);
    for (const [s, i] of this.bindings) {
      const a = this.entityStates.get(i.entityId);
      if (!a) continue;
      const o = this.parseValue(a.state, i.dataType), h = this.liveValues.get(s), p = {
        binding: i,
        currentValue: o,
        previousValue: h == null ? void 0 : h.currentValue,
        hasChanged: h ? h.currentValue.raw !== o.raw : !1,
        lastUpdate: e
      };
      this.liveValues.set(s, p);
    }
    this.notifySubscribers();
  }
  parseValue(t, e) {
    if (["unavailable", "unknown", "none", ""].includes(t.toLowerCase()))
      return {
        raw: t,
        formatted: "—",
        isValid: !1,
        dataType: "UNKNOWN"
      };
    switch (e.toUpperCase()) {
      case "BOOL": {
        const i = ["on", "true", "1"].includes(t.toLowerCase());
        return {
          raw: t,
          formatted: i ? "TRUE" : "FALSE",
          isValid: !0,
          dataType: "BOOL"
        };
      }
      case "INT":
      case "DINT": {
        const i = Number.parseInt(t, 10);
        return {
          raw: t,
          formatted: Number.isNaN(i) ? "—" : String(i),
          isValid: !Number.isNaN(i),
          dataType: "INT"
        };
      }
      case "REAL":
      case "LREAL": {
        const i = Number.parseFloat(t);
        return {
          raw: t,
          formatted: Number.isNaN(i) ? "—" : i.toFixed(2),
          isValid: !Number.isNaN(i),
          dataType: "REAL"
        };
      }
      case "STRING":
        return {
          raw: t,
          formatted: t.length > 20 ? t.substring(0, 17) + "..." : t,
          isValid: !0,
          dataType: "STRING"
        };
      case "TIME":
        return {
          raw: t,
          formatted: t,
          isValid: !0,
          dataType: "TIME"
        };
      default:
        return {
          raw: t,
          formatted: t,
          isValid: !0,
          dataType: "UNKNOWN"
        };
    }
  }
  notifySubscribers() {
    const t = this.getState();
    for (const e of this.subscribers)
      e(t);
  }
}
class q {
  /**
   * Format value for display with appropriate styling
   */
  static format(t) {
    if (!t.isValid)
      return { text: t.formatted, className: "st-live-value--invalid" };
    switch (t.dataType) {
      case "BOOL":
        return {
          text: t.formatted,
          className: t.formatted === "TRUE" ? "st-live-value--bool-true" : "st-live-value--bool-false"
        };
      case "INT":
        return { text: t.formatted, className: "st-live-value--int" };
      case "REAL":
        return { text: t.formatted, className: "st-live-value--real" };
      case "STRING":
        return {
          text: `"${t.formatted}"`,
          className: "st-live-value--string"
        };
      default:
        return { text: t.formatted, className: "st-live-value--unknown" };
    }
  }
  /**
   * Format with change highlight
   */
  static formatWithChange(t) {
    const e = this.format(t.currentValue);
    return t.hasChanged && (e.className += " st-live-value--changed"), e;
  }
}
const tt = K.define();
K.define();
class je extends de {
  constructor(t, e) {
    super(), this.value = t, this.showChange = e;
  }
  toDOM() {
    const t = document.createElement("span");
    t.className = "st-live-value-widget";
    const e = this.showChange ? q.formatWithChange(this.value) : q.format(this.value.currentValue), s = document.createElement("span");
    return s.className = `st-live-value ${e.className}`, s.textContent = e.text, s.title = `${this.value.binding.entityId}
Last update: ${new Date(this.value.lastUpdate).toLocaleTimeString()}`, t.appendChild(s), t;
  }
  eq(t) {
    return this.value.currentValue.raw === t.value.currentValue.raw && this.value.hasChanged === t.value.hasChanged;
  }
  ignoreEvent() {
    return !1;
  }
}
const We = he.define({
  create() {
    return M.none;
  },
  update(n, t) {
    for (const e of t.effects)
      if (e.is(tt))
        return Ge(t.state.doc.toString(), e.value);
    return t.docChanged && (n = n.map(t.changes)), n;
  },
  provide: (n) => T.decorations.from(n)
});
function Ge(n, t) {
  const e = [], s = n.split(`
`);
  let i = 0;
  for (let a = 0; a < s.length; a++) {
    const o = s[a], h = i + o.length;
    for (const [, p] of t)
      if (p.binding.line === a + 1) {
        const ie = M.widget({
          widget: new je(p, !0),
          side: 1
        });
        e.push({
          from: h,
          to: h,
          decoration: ie
        });
      }
    i = h + 1;
  }
  return e.sort((a, o) => a.from - o.from), M.set(
    e.map((a) => a.decoration.range(a.from, a.to))
  );
}
const ze = T.baseTheme({
  ".st-live-value-widget": {
    marginLeft: "16px",
    display: "inline-flex",
    alignItems: "center"
  },
  ".st-live-value": {
    padding: "2px 8px",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "var(--st-live-bg, #2d2d30)",
    border: "1px solid var(--st-live-border, #3c3c3c)",
    minWidth: "60px",
    textAlign: "right"
  },
  ".st-live-value--bool-true": {
    color: "#4ec9b0",
    backgroundColor: "rgba(78, 201, 176, 0.1)",
    borderColor: "#4ec9b0"
  },
  ".st-live-value--bool-false": {
    color: "#808080",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderColor: "#808080"
  },
  ".st-live-value--int": {
    color: "#b5cea8"
  },
  ".st-live-value--real": {
    color: "#dcdcaa"
  },
  ".st-live-value--string": {
    color: "#ce9178"
  },
  ".st-live-value--invalid": {
    color: "#f44747",
    fontStyle: "italic"
  },
  ".st-live-value--changed": {
    animation: "st-value-flash 0.5s ease-out",
    boxShadow: "0 0 4px var(--st-change-glow, #569cd6)"
  },
  "@keyframes st-value-flash": {
    "0%": { backgroundColor: "rgba(86, 156, 214, 0.3)" },
    "100%": { backgroundColor: "var(--st-live-bg, #2d2d30)" }
  }
});
function Ye() {
  return [We, ze];
}
function He(n, t) {
  n.dispatch({
    effects: tt.of(t)
  });
}
var et = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, Ke = (n, t, e) => t in n ? et(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, A = (n, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? qe(t, e) : t, a = n.length - 1, o; a >= 0; a--)
    (o = n[a]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && et(t, e, i), i;
}, Xe = (n, t, e) => Ke(n, t + "", e);
let S = class extends W {
  constructor() {
    super();
    l(this, "_editor", null);
    l(this, "_readOnlyCompartment", new pe());
    l(this, "_onlineManager", null);
    l(this, "_onlineUnsubscribe", null);
    this.code = "", this.readOnly = !1;
  }
  async firstUpdated(t) {
    console.log("STEditor.firstUpdated called"), await this.updateComplete, console.log("STEditor: updateComplete resolved"), await new Promise((e) => requestAnimationFrame(e)), console.log("STEditor: requestAnimationFrame resolved"), this._initEditor();
  }
  updated(t) {
    if (t.has("readOnly") && this._editor && this._editor.dispatch({
      effects: this._readOnlyCompartment.reconfigure(
        y.readOnly.of(this.readOnly)
      )
    }), t.has("code") && this._editor) {
      const e = this._editor.state.doc.toString();
      e !== this.code && this._editor.dispatch({
        changes: { from: 0, to: e.length, insert: this.code }
      });
    }
  }
  disconnectedCallback() {
    var t, e, s;
    super.disconnectedCallback(), (t = this._onlineUnsubscribe) == null || t.call(this), (e = this._onlineManager) == null || e.stop(), (s = this._editor) == null || s.destroy();
  }
  /**
   * Start online mode with variable bindings
   */
  async startOnlineMode(t) {
    var e;
    if (!((e = this.hass) != null && e.connection))
      throw new Error("Home Assistant connection not available");
    this._onlineManager || (this._onlineManager = new Ve(this.hass.connection), this._onlineUnsubscribe = this._onlineManager.subscribe((s) => {
      this._editor && s.liveValues && He(this._editor, s.liveValues);
    })), await this._onlineManager.start(t);
  }
  /**
   * Stop online mode
   */
  stopOnlineMode() {
    var t;
    (t = this._onlineManager) == null || t.stop();
  }
  /**
   * Pause/resume online mode
   */
  setOnlinePaused(t) {
    var e;
    (e = this._onlineManager) == null || e.setPaused(t);
  }
  /**
   * Get current online state
   */
  getOnlineState() {
    var t;
    return ((t = this._onlineManager) == null ? void 0 : t.getState()) || null;
  }
  _initEditor() {
    var s;
    const t = (s = this.shadowRoot) == null ? void 0 : s.querySelector(
      "#editor-container"
    );
    if (console.log("STEditor._initEditor called, container:", t), !t) {
      console.error("STEditor: container not found!");
      return;
    }
    const e = [
      ue(),
      ge(),
      me(),
      fe(),
      Ee(),
      be(),
      y.allowMultipleSelections.of(!0),
      ve(),
      Se(),
      Le(),
      ye(),
      _e(),
      Oe(),
      Ue.of([
        ...Ce,
        ...Ne,
        ...Te,
        ...Re,
        ...Ae,
        ...we,
        Me
      ]),
      Pe(),
      $e(),
      Ye(),
      this._readOnlyCompartment.of(y.readOnly.of(this.readOnly)),
      y.tabSize.of(4)
    ];
    this._editor = new T({
      state: y.create({ doc: this.code, extensions: e }),
      parent: t,
      dispatch: (i) => {
        this._editor.update([i]), i.docChanged && this.dispatchEvent(
          new CustomEvent("code-change", {
            detail: { code: i.newDoc.toString() },
            bubbles: !0,
            composed: !0
          })
        );
      }
    }), t.addEventListener("keydown", (i) => i.stopPropagation()), t.addEventListener("keyup", (i) => i.stopPropagation()), t.addEventListener("keypress", (i) => i.stopPropagation()), t.addEventListener("dragover", (i) => {
      i.preventDefault(), i.stopPropagation(), i.dataTransfer && (i.dataTransfer.dropEffect = "copy");
    }), t.addEventListener("drop", (i) => {
      i.preventDefault(), i.stopPropagation(), this._handleDrop(i);
    });
  }
  /**
   * Handle drop event from entity browser
   */
  _handleDrop(t) {
    if (!this._editor || !t.dataTransfer) return;
    let e = t.dataTransfer.getData("text/plain");
    if (!e)
      try {
        const i = t.dataTransfer.getData("application/json");
        i && (e = JSON.parse(i).bindingSyntax);
      } catch (i) {
        console.error("Failed to parse drag data", i);
        return;
      }
    if (!e) return;
    const s = this._editor.posAtCoords({
      x: t.clientX,
      y: t.clientY
    });
    if (s === null) {
      const i = this._editor.state.selection.main, a = i.empty ? i.head : i.from;
      this._editor.dispatch({
        changes: { from: a, insert: e },
        selection: { anchor: a + e.length }
      });
    } else
      this._editor.dispatch({
        changes: { from: s, insert: e },
        selection: { anchor: s + e.length }
      });
    this._editor.focus();
  }
  getCode() {
    var t;
    return ((t = this._editor) == null ? void 0 : t.state.doc.toString()) ?? this.code;
  }
  setCode(t) {
    this.code = t;
  }
  focus() {
    var t;
    (t = this._editor) == null || t.focus();
  }
  render() {
    return u`<div id="editor-container"></div>`;
  }
};
Xe(S, "styles", j`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    #editor-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
    }
    #editor-container .cm-editor {
      height: 100%;
    }
    #editor-container .cm-scroller {
      overflow: auto;
    }
    /* Ensure selection highlighting is visible but not covering text */
    #editor-container .cm-selectionBackground {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    #editor-container .cm-focused .cm-selectionBackground {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    #editor-container .cm-selectionLayer .cm-selectionBackground {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    /* Native selection as fallback */
    #editor-container .cm-content ::selection {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
    #editor-container .cm-line ::selection {
      background-color: rgba(38, 79, 120, 0.5) !important;
    }
  `);
A([
  L({ type: String })
], S.prototype, "code", 2);
A([
  L({ type: Boolean, attribute: "read-only" })
], S.prototype, "readOnly", 2);
A([
  L({ attribute: !1 })
], S.prototype, "hass", 2);
S = A([
  G("st-editor")
], S);
var it = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, Ze = (n, t, e) => t in n ? it(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, z = (n, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Qe(t, e) : t, a = n.length - 1, o; a >= 0; a--)
    (o = n[a]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && it(t, e, i), i;
}, Je = (n, t, e) => Ze(n, t + "", e);
let U = class extends W {
  constructor() {
    super(...arguments);
    l(this, "_showSettings", !1);
  }
  get statusText() {
    var e;
    return {
      disconnected: "Offline",
      connecting: "Connecting...",
      online: "Online",
      paused: "Paused",
      error: "Error"
    }[((e = this.state) == null ? void 0 : e.status) || "disconnected"];
  }
  get isPaused() {
    var t;
    return ((t = this.state) == null ? void 0 : t.status) === "paused";
  }
  get canConnect() {
    var t;
    return ["disconnected", "error"].includes(((t = this.state) == null ? void 0 : t.status) || "disconnected");
  }
  render() {
    var t, e, s, i;
    return u`
      <div class="status">
        <span
          class="status-dot status-dot--${((t = this.state) == null ? void 0 : t.status) || "disconnected"}"
        ></span>
        <span class="status-text">${this.statusText}</span>
      </div>

      <div class="controls">
        ${this.canConnect ? u` <button @click=${this._handleConnect}>▶ Connect</button> ` : u`
              <button
                @click=${this._handleTogglePause}
                class="${this.isPaused ? "active" : ""}"
              >
                ${this.isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button @click=${this._handleDisconnect}>⏹ Stop</button>
            `}
      </div>

      <div class="spacer"></div>

      <div class="stats">
        <div class="stat">📊 ${((s = (e = this.state) == null ? void 0 : e.liveValues) == null ? void 0 : s.size) || 0} Variables</div>
        <div class="stat">⚡ ${((i = this.state) == null ? void 0 : i.updateRate) || 100}ms</div>
      </div>

      <div style="position: relative;">
        <button @click=${() => this._showSettings = !this._showSettings}>
          ⚙️
        </button>
        ${this._showSettings ? this._renderSettings() : ""}
      </div>
    `;
  }
  _renderSettings() {
    var t, e, s, i, a, o;
    return u`
      <div class="settings-panel">
        <div class="setting">
          <input
            type="checkbox"
            id="highlight"
            .checked=${(t = this.state) == null ? void 0 : t.highlightChanges}
            @change=${this._handleHighlightChange}
          />
          <label for="highlight">Highlight changes</label>
        </div>
        <div class="setting">
          <input
            type="checkbox"
            id="conditions"
            .checked=${(e = this.state) == null ? void 0 : e.showConditions}
            @change=${this._handleConditionsChange}
          />
          <label for="conditions">Show conditions</label>
        </div>
        <div class="setting">
          <label>Update rate:</label>
          <select @change=${this._handleRateChange}>
            <option value="50" ?selected=${((s = this.state) == null ? void 0 : s.updateRate) === 50}>
              50ms
            </option>
            <option value="100" ?selected=${((i = this.state) == null ? void 0 : i.updateRate) === 100}>
              100ms
            </option>
            <option value="250" ?selected=${((a = this.state) == null ? void 0 : a.updateRate) === 250}>
              250ms
            </option>
            <option value="500" ?selected=${((o = this.state) == null ? void 0 : o.updateRate) === 500}>
              500ms
            </option>
          </select>
        </div>
      </div>
    `;
  }
  _handleConnect() {
    this.dispatchEvent(
      new CustomEvent("connect", { bubbles: !0, composed: !0 })
    );
  }
  _handleDisconnect() {
    this.dispatchEvent(
      new CustomEvent("disconnect", { bubbles: !0, composed: !0 })
    );
  }
  _handleTogglePause() {
    this.dispatchEvent(
      new CustomEvent("toggle-pause", { bubbles: !0, composed: !0 })
    );
  }
  _handleHighlightChange(t) {
    const e = t.target.checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "highlightChanges", value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleConditionsChange(t) {
    const e = t.target.checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "showConditions", value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleRateChange(t) {
    const e = Number.parseInt(t.target.value, 10);
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "updateRate", value: e },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
Je(U, "styles", j`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot--online {
      background: #4ec9b0;
      box-shadow: 0 0 4px #4ec9b0;
    }

    .status-dot--paused {
      background: #dcdcaa;
    }

    .status-dot--connecting {
      background: #569cd6;
      animation: pulse 1s infinite;
    }

    .status-dot--disconnected {
      background: #808080;
    }

    .status-dot--error {
      background: #f44747;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .status-text {
      font-size: 13px;
      font-weight: 500;
    }

    .controls {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    button:hover {
      background: var(--secondary-background-color);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .spacer {
      flex: 1;
    }

    .stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .settings-panel {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 100;
    }

    .setting {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .setting:last-child {
      margin-bottom: 0;
    }

    .setting label {
      font-size: 13px;
    }
  `);
z([
  L({ type: Object })
], U.prototype, "state", 2);
z([
  E()
], U.prototype, "_showSettings", 2);
U = z([
  G("st-online-toolbar")
], U);
const c = (n, t) => r({ name: n, pattern: new RegExp(`\\b${t}\\b`, "i") }), ti = r({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: R.SKIPPED
}), ei = r({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: R.SKIPPED
}), ii = r({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: R.SKIPPED
}), st = r({
  name: "Pragma",
  pattern: /\{[^}]+\}/
}), nt = r({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: void 0
}), si = r({
  name: "EndFunction",
  pattern: /END_FUNCTION/i
}), ni = r({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i
}), ai = r({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i
}), at = r({ name: "EndVar", pattern: /END_VAR/i }), ot = r({
  name: "VarInput",
  pattern: /VAR_INPUT/i
}), rt = r({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i
}), lt = r({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i
}), ct = r({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i
}), ht = r({ name: "EndIf", pattern: /END_IF/i }), dt = r({ name: "EndCase", pattern: /END_CASE/i }), pt = r({ name: "EndFor", pattern: /END_FOR/i }), ut = r({
  name: "EndWhile",
  pattern: /END_WHILE/i
}), gt = r({
  name: "EndRepeat",
  pattern: /END_REPEAT/i
}), mt = c("Program", "PROGRAM"), oi = c("Function", "FUNCTION"), ft = c("Var", "VAR"), ri = c("Constant", "CONSTANT"), Et = c("If", "IF"), B = c("Then", "THEN"), bt = c("Elsif", "ELSIF"), I = c("Else", "ELSE"), vt = c("Case", "CASE"), St = c("Of", "OF"), Lt = c("For", "FOR"), yt = c("To", "TO"), _t = c("By", "BY"), k = c("Do", "DO"), Ot = c("While", "WHILE"), Ut = c("Repeat", "REPEAT"), Ct = c("Until", "UNTIL"), Nt = c("Return", "RETURN"), Tt = c("Exit", "EXIT"), li = c("Continue", "CONTINUE"), x = c("At", "AT"), Rt = c("And", "AND"), At = c("Or", "OR"), ci = c("Xor", "XOR"), wt = c("Not", "NOT"), Mt = c("Mod", "MOD"), Bt = c("True", "TRUE"), It = c("False", "FALSE"), kt = c("TypeBool", "BOOL"), xt = r({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i
}), Pt = r({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i
}), Dt = r({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i
}), Ft = r({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i
}), hi = r({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i
}), $t = r({
  name: "TimeLiteral",
  pattern: /T(IME)?#[\d_]+(\.[\d_]+)?([a-z]+)?/i
}), di = r({
  name: "HexLiteral",
  pattern: /16#[\da-fA-F_]+/
}), pi = r({
  name: "BinaryLiteral",
  pattern: /2#[01_]+/
}), ui = r({
  name: "OctalLiteral",
  pattern: /8#[0-7_]+/
}), Vt = r({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/
}), jt = r({
  name: "IntegerLiteral",
  pattern: /\d+/
}), Wt = r({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/
}), P = r({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i
}), _ = r({ name: "Assign", pattern: /:=/ }), gi = r({ name: "Output", pattern: /=>/ }), Gt = r({ name: "LessEqual", pattern: /<=/ }), zt = r({
  name: "GreaterEqual",
  pattern: />=/
}), Yt = r({ name: "NotEqual", pattern: /<>/ }), Ht = r({ name: "Less", pattern: /</ }), qt = r({ name: "Greater", pattern: />/ }), Kt = r({ name: "Equal", pattern: /=/ }), Xt = r({ name: "Plus", pattern: /\+/ }), D = r({ name: "Minus", pattern: /-/ }), Qt = r({ name: "Star", pattern: /\*/ }), Zt = r({ name: "Slash", pattern: /\// }), C = r({ name: "LParen", pattern: /\(/ }), N = r({ name: "RParen", pattern: /\)/ }), mi = r({ name: "LBracket", pattern: /\[/ }), fi = r({ name: "RBracket", pattern: /\]/ }), F = r({ name: "Colon", pattern: /:/ }), v = r({ name: "Semicolon", pattern: /;/ }), $ = r({ name: "Comma", pattern: /,/ }), V = r({ name: "Dot", pattern: /\./ }), Jt = r({ name: "Range", pattern: /\.\./ }), b = r({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}), te = [
  // Skipped
  ti,
  ei,
  ii,
  // Pragmas
  st,
  // Multi-word keywords first
  ni,
  ai,
  si,
  nt,
  ot,
  rt,
  lt,
  ct,
  at,
  ht,
  dt,
  pt,
  ut,
  gt,
  // Keywords
  mt,
  oi,
  ft,
  ri,
  Et,
  B,
  bt,
  I,
  vt,
  St,
  Lt,
  yt,
  _t,
  k,
  Ot,
  Ut,
  Ct,
  Nt,
  Tt,
  li,
  x,
  // Logical
  Rt,
  At,
  ci,
  wt,
  Mt,
  Bt,
  It,
  // Types
  kt,
  xt,
  Pt,
  Dt,
  Ft,
  hi,
  // Literals (order: specific before general)
  $t,
  di,
  pi,
  ui,
  Vt,
  jt,
  Wt,
  // I/O
  P,
  // Multi-char operators
  _,
  gi,
  Jt,
  Gt,
  zt,
  Yt,
  // Single-char operators
  Ht,
  qt,
  Kt,
  Xt,
  D,
  Qt,
  Zt,
  C,
  N,
  mi,
  fi,
  F,
  v,
  $,
  V,
  // Identifier last
  b
], Ei = new R(te, {
  ensureOptimizations: !0,
  positionTracking: "full"
  // For error reporting
});
function bi(n) {
  const t = Ei.tokenize(n);
  return {
    tokens: t.tokens,
    errors: t.errors
  };
}
class vi extends Ie {
  constructor() {
    super(te, {
      recoveryEnabled: !0,
      nodeLocationTracking: "full"
    });
    // Program structure
    l(this, "program", this.RULE("program", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(mt), this.CONSUME(b, { LABEL: "programName" }), this.MANY1(() => this.SUBRULE(this.variableBlock)), this.MANY2(() => this.SUBRULE(this.statement)), this.CONSUME(nt);
    }));
    // Variable declarations
    l(this, "variableBlock", this.RULE("variableBlock", () => {
      this.OR([
        { ALT: () => this.CONSUME(ft) },
        { ALT: () => this.CONSUME(ot) },
        { ALT: () => this.CONSUME(rt) },
        { ALT: () => this.CONSUME(lt) },
        { ALT: () => this.CONSUME(ct) }
      ]), this.MANY(() => this.SUBRULE(this.variableDeclaration)), this.CONSUME(at);
    }));
    l(this, "variableDeclaration", this.RULE("variableDeclaration", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(b, { LABEL: "varName" }), this.OPTION(() => {
        this.CONSUME(x), this.CONSUME(P);
      }), this.OPTION1(() => {
        this.CONSUME(F), this.SUBRULE(this.typeSpec);
      }), this.OPTION2(() => {
        this.CONSUME(_), this.SUBRULE(this.expression);
      }), this.OPTION3(() => {
        this.CONSUME1(x), this.CONSUME1(P);
      }), this.CONSUME(v);
    }));
    l(this, "pragma", this.RULE("pragma", () => {
      this.CONSUME(st);
    }));
    l(this, "typeSpec", this.RULE("typeSpec", () => {
      this.OR([
        { ALT: () => this.CONSUME(kt) },
        { ALT: () => this.CONSUME(xt) },
        { ALT: () => this.CONSUME(Pt) },
        { ALT: () => this.CONSUME(Dt) },
        { ALT: () => this.CONSUME(Ft) },
        { ALT: () => this.CONSUME(b) }
        // Custom type
      ]);
    }));
    // Statements
    l(this, "statement", this.RULE("statement", () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.assignmentStatement) },
        { ALT: () => this.SUBRULE(this.ifStatement) },
        { ALT: () => this.SUBRULE(this.caseStatement) },
        { ALT: () => this.SUBRULE(this.forStatement) },
        { ALT: () => this.SUBRULE(this.whileStatement) },
        { ALT: () => this.SUBRULE(this.repeatStatement) },
        { ALT: () => this.SUBRULE(this.returnStatement) },
        { ALT: () => this.SUBRULE(this.exitStatement) },
        { ALT: () => this.SUBRULE(this.functionCallStatement) }
      ]);
    }));
    l(this, "assignmentStatement", this.RULE("assignmentStatement", () => {
      this.SUBRULE(this.variableReference), this.CONSUME(_), this.SUBRULE(this.expression), this.CONSUME(v);
    }));
    l(this, "ifStatement", this.RULE("ifStatement", () => {
      this.CONSUME(Et), this.SUBRULE(this.expression, { LABEL: "condition" }), this.CONSUME(B), this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" })), this.MANY1(() => {
        this.CONSUME(bt), this.SUBRULE1(this.expression, { LABEL: "elsifCondition" }), this.CONSUME1(B), this.MANY2(
          () => this.SUBRULE1(this.statement, { LABEL: "elsifStatements" })
        );
      }), this.OPTION(() => {
        this.CONSUME(I), this.MANY3(
          () => this.SUBRULE2(this.statement, { LABEL: "elseStatements" })
        );
      }), this.CONSUME(ht);
    }));
    l(this, "caseStatement", this.RULE("caseStatement", () => {
      this.CONSUME(vt), this.SUBRULE(this.expression, { LABEL: "selector" }), this.CONSUME(St), this.MANY(() => this.SUBRULE(this.caseClause)), this.OPTION(() => {
        this.CONSUME(I), this.MANY1(() => this.SUBRULE(this.statement));
      }), this.CONSUME(dt);
    }));
    l(this, "caseClause", this.RULE("caseClause", () => {
      this.SUBRULE(this.caseLabelList), this.CONSUME(F), this.MANY(() => this.SUBRULE(this.statement));
    }));
    l(this, "caseLabelList", this.RULE("caseLabelList", () => {
      this.SUBRULE(this.caseLabel), this.MANY(() => {
        this.CONSUME($), this.SUBRULE1(this.caseLabel);
      });
    }));
    l(this, "caseLabel", this.RULE("caseLabel", () => {
      this.SUBRULE(this.expression), this.OPTION(() => {
        this.CONSUME(Jt), this.SUBRULE1(this.expression);
      });
    }));
    l(this, "forStatement", this.RULE("forStatement", () => {
      this.CONSUME(Lt), this.CONSUME(b, { LABEL: "controlVar" }), this.CONSUME(_), this.SUBRULE(this.expression, { LABEL: "start" }), this.CONSUME(yt), this.SUBRULE1(this.expression, { LABEL: "end" }), this.OPTION(() => {
        this.CONSUME(_t), this.SUBRULE2(this.expression, { LABEL: "step" });
      }), this.CONSUME(k), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(pt);
    }));
    l(this, "whileStatement", this.RULE("whileStatement", () => {
      this.CONSUME(Ot), this.SUBRULE(this.expression), this.CONSUME(k), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(ut);
    }));
    l(this, "repeatStatement", this.RULE("repeatStatement", () => {
      this.CONSUME(Ut), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(Ct), this.SUBRULE(this.expression), this.CONSUME(gt);
    }));
    l(this, "returnStatement", this.RULE("returnStatement", () => {
      this.CONSUME(Nt), this.CONSUME(v);
    }));
    l(this, "exitStatement", this.RULE("exitStatement", () => {
      this.CONSUME(Tt), this.CONSUME(v);
    }));
    l(this, "functionCallStatement", this.RULE("functionCallStatement", () => {
      this.SUBRULE(this.functionCall), this.CONSUME(v);
    }));
    // Expressions with operator precedence
    l(this, "expression", this.RULE("expression", () => {
      this.SUBRULE(this.orExpression);
    }));
    l(this, "orExpression", this.RULE("orExpression", () => {
      this.SUBRULE(this.andExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(At), this.SUBRULE1(this.andExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "andExpression", this.RULE("andExpression", () => {
      this.SUBRULE(this.comparisonExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(Rt), this.SUBRULE1(this.comparisonExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "comparisonExpression", this.RULE("comparisonExpression", () => {
      this.SUBRULE(this.additiveExpression, { LABEL: "lhs" }), this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(Kt) },
          { ALT: () => this.CONSUME(Yt) },
          { ALT: () => this.CONSUME(Ht) },
          { ALT: () => this.CONSUME(Gt) },
          { ALT: () => this.CONSUME(qt) },
          { ALT: () => this.CONSUME(zt) }
        ]), this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "additiveExpression", this.RULE("additiveExpression", () => {
      this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Xt) },
          { ALT: () => this.CONSUME(D) }
        ]), this.SUBRULE1(this.multiplicativeExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "multiplicativeExpression", this.RULE(
      "multiplicativeExpression",
      () => {
        this.SUBRULE(this.unaryExpression, { LABEL: "lhs" }), this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(Qt) },
            { ALT: () => this.CONSUME(Zt) },
            { ALT: () => this.CONSUME(Mt) }
          ]), this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
        });
      }
    ));
    l(this, "unaryExpression", this.RULE("unaryExpression", () => {
      this.OR([
        {
          ALT: () => {
            this.OR1([
              { ALT: () => this.CONSUME(wt) },
              { ALT: () => this.CONSUME(D) }
            ]), this.SUBRULE(this.unaryExpression);
          }
        },
        { ALT: () => this.SUBRULE(this.primaryExpression) }
      ]);
    }));
    l(this, "primaryExpression", this.RULE("primaryExpression", () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.literal) },
        { ALT: () => this.SUBRULE(this.identifierOrCall) },
        {
          ALT: () => {
            this.CONSUME(C), this.SUBRULE(this.expression), this.CONSUME(N);
          }
        }
      ]);
    }));
    l(this, "identifierOrCall", this.RULE("identifierOrCall", () => {
      this.CONSUME(b), this.MANY(() => {
        this.CONSUME(V), this.CONSUME1(b);
      }), this.OPTION(() => {
        this.CONSUME(C), this.OPTION1(() => {
          this.SUBRULE(this.argumentList);
        }), this.CONSUME(N);
      });
    }));
    l(this, "literal", this.RULE("literal", () => {
      this.OR([
        { ALT: () => this.CONSUME(Bt) },
        { ALT: () => this.CONSUME(It) },
        { ALT: () => this.CONSUME(jt) },
        { ALT: () => this.CONSUME(Vt) },
        { ALT: () => this.CONSUME(Wt) },
        { ALT: () => this.CONSUME($t) }
      ]);
    }));
    l(this, "variableReference", this.RULE("variableReference", () => {
      this.CONSUME(b), this.MANY(() => {
        this.CONSUME(V), this.CONSUME1(b);
      });
    }));
    l(this, "functionCall", this.RULE("functionCall", () => {
      this.CONSUME(b), this.CONSUME(C), this.OPTION(() => {
        this.SUBRULE(this.argumentList);
      }), this.CONSUME(N);
    }));
    l(this, "argumentList", this.RULE("argumentList", () => {
      this.SUBRULE(this.argument), this.MANY(() => {
        this.CONSUME($), this.SUBRULE1(this.argument);
      });
    }));
    /**
     * Function argument
     * Supports both positional and named arguments:
     *   - foo(1, 2)
     *   - foo(IN := TRUE, PT := T#5s)
     */
    l(this, "argument", this.RULE("argument", () => {
      this.OPTION(() => {
        this.CONSUME(b, { LABEL: "argName" }), this.CONSUME(_);
      }), this.SUBRULE(this.expression, { LABEL: "argValue" });
    }));
    this.performSelfAnalysis();
  }
}
const O = new vi(), Si = O.getBaseCstVisitorConstructor();
class Li extends Si {
  constructor() {
    super(), this.validateVisitor();
  }
  // Program
  program(t) {
    const e = t.pragma ? t.pragma.map((o) => this.visit(o)) : [], s = t.programName[0].image, i = t.variableBlock ? t.variableBlock.flatMap((o) => this.visit(o)) : [], a = t.statement ? t.statement.map((o) => this.visit(o)) : [];
    return {
      type: "Program",
      name: s,
      pragmas: e,
      variables: i,
      body: a,
      location: this.getLocation(t)
    };
  }
  // Variable declarations
  variableBlock(t) {
    let e = "VAR";
    return t.VarInput ? e = "VAR_INPUT" : t.VarOutput ? e = "VAR_OUTPUT" : t.VarInOut ? e = "VAR_IN_OUT" : t.VarGlobal && (e = "VAR_GLOBAL"), t.variableDeclaration ? t.variableDeclaration.map((s) => {
      const i = this.visit(s);
      return i.section = e, i;
    }) : [];
  }
  variableDeclaration(t) {
    const e = t.pragma ? t.pragma.map((h) => this.visit(h)) : [], s = t.varName[0].image, i = t.typeSpec ? this.visit(t.typeSpec[0]) : this.createDataType("UNKNOWN"), a = t.expression ? this.visit(t.expression[0]) : void 0;
    let o;
    return t.IoAddress && (o = this.parseIoAddress(t.IoAddress[0].image), a && a.type === "Literal" && a.kind === "string" && (o.entityId = a.value)), {
      type: "VariableDeclaration",
      name: s,
      dataType: i,
      section: "VAR",
      // Will be set by variableBlock
      pragmas: e,
      constant: !1,
      initialValue: a,
      binding: o,
      location: this.getLocation(t)
    };
  }
  pragma(t) {
    const s = t.Pragma[0].image.slice(1, -1).trim(), i = s.indexOf(":");
    let a, o;
    return i > 0 ? (a = s.substring(0, i).trim(), o = s.substring(i + 1).trim()) : a = s, {
      type: "Pragma",
      name: a,
      value: o,
      location: this.getLocation(t)
    };
  }
  typeSpec(t) {
    let e;
    return t.TypeBool ? e = "BOOL" : t.TypeInt ? e = t.TypeInt[0].image : t.TypeReal ? e = t.TypeReal[0].image : t.TypeString ? e = t.TypeString[0].image : t.TypeTime ? e = t.TypeTime[0].image : t.Identifier ? e = t.Identifier[0].image : e = "UNKNOWN", this.createDataType(e);
  }
  // Statements
  statement(t) {
    if (t.assignmentStatement) return this.visit(t.assignmentStatement[0]);
    if (t.ifStatement) return this.visit(t.ifStatement[0]);
    if (t.caseStatement) return this.visit(t.caseStatement[0]);
    if (t.forStatement) return this.visit(t.forStatement[0]);
    if (t.whileStatement) return this.visit(t.whileStatement[0]);
    if (t.repeatStatement) return this.visit(t.repeatStatement[0]);
    if (t.returnStatement) return this.visit(t.returnStatement[0]);
    if (t.exitStatement) return this.visit(t.exitStatement[0]);
    if (t.functionCallStatement)
      return this.visit(t.functionCallStatement[0]);
    throw new Error("Unknown statement type");
  }
  assignmentStatement(t) {
    return {
      type: "Assignment",
      target: this.visit(t.variableReference[0]).name,
      value: this.visit(t.expression[0]),
      location: this.getLocation(t)
    };
  }
  ifStatement(t) {
    const e = this.visit(t.condition[0]), s = t.thenStatements ? t.thenStatements.map((o) => this.visit(o)) : [], i = t.elsifCondition ? t.elsifCondition.map((o, h) => {
      const p = t.elsifStatements && t.elsifStatements[h] ? this.visit(t.elsifStatements[h]) : [];
      return {
        condition: this.visit(o),
        body: Array.isArray(p) ? p : [p]
      };
    }) : [], a = t.elseStatements ? t.elseStatements.map((o) => this.visit(o)) : void 0;
    return {
      type: "IfStatement",
      condition: e,
      thenBranch: s,
      elsifBranches: i,
      elseBranch: a,
      location: this.getLocation(t)
    };
  }
  caseStatement(t) {
    const e = this.visit(t.selector[0]), s = t.caseClause ? t.caseClause.map((a) => this.visit(a)) : [], i = t.statement ? t.statement.map((a) => this.visit(a)) : void 0;
    return {
      type: "CaseStatement",
      selector: e,
      cases: s,
      elseCase: i,
      location: this.getLocation(t)
    };
  }
  caseClause(t) {
    const e = this.visit(t.caseLabelList[0]), s = t.statement ? t.statement.map((i) => this.visit(i)) : [];
    return { values: e, body: s };
  }
  caseLabelList(t) {
    return t.caseLabel.map((e) => this.visit(e));
  }
  caseLabel(t) {
    return this.visit(t.expression[0]);
  }
  forStatement(t) {
    return {
      type: "ForStatement",
      variable: t.controlVar[0].image,
      from: this.visit(t.start[0]),
      to: this.visit(t.end[0]),
      by: t.step ? this.visit(t.step[0]) : void 0,
      body: t.statement ? t.statement.map((e) => this.visit(e)) : [],
      location: this.getLocation(t)
    };
  }
  whileStatement(t) {
    return {
      type: "WhileStatement",
      condition: this.visit(t.expression[0]),
      body: t.statement ? t.statement.map((e) => this.visit(e)) : [],
      location: this.getLocation(t)
    };
  }
  repeatStatement(t) {
    return {
      type: "RepeatStatement",
      condition: this.visit(t.expression[0]),
      body: t.statement ? t.statement.map((e) => this.visit(e)) : [],
      location: this.getLocation(t)
    };
  }
  returnStatement(t) {
    return {
      type: "ReturnStatement",
      location: this.getLocation(t)
    };
  }
  exitStatement(t) {
    return {
      type: "ExitStatement",
      location: this.getLocation(t)
    };
  }
  functionCallStatement(t) {
    return {
      type: "FunctionCallStatement",
      call: this.visit(t.functionCall[0]),
      location: this.getLocation(t)
    };
  }
  // Expressions
  expression(t) {
    return this.visit(t.orExpression[0]);
  }
  orExpression(t) {
    if (!t.Or || t.Or.length === 0)
      return this.visit(t.lhs[0]);
    let e = this.visit(t.lhs[0]);
    for (let s = 0; s < t.Or.length; s++)
      e = {
        type: "BinaryExpression",
        operator: "OR",
        left: e,
        right: this.visit(t.rhs[s]),
        location: this.getLocation(t)
      };
    return e;
  }
  andExpression(t) {
    if (!t.And || t.And.length === 0)
      return this.visit(t.lhs[0]);
    let e = this.visit(t.lhs[0]);
    for (let s = 0; s < t.And.length; s++)
      e = {
        type: "BinaryExpression",
        operator: "AND",
        left: e,
        right: this.visit(t.rhs[s]),
        location: this.getLocation(t)
      };
    return e;
  }
  comparisonExpression(t) {
    const e = this.visit(t.lhs[0]);
    if (!t.rhs || t.rhs.length === 0)
      return e;
    let s = "=";
    return t.Equal ? s = "=" : t.NotEqual ? s = "<>" : t.Less ? s = "<" : t.LessEqual ? s = "<=" : t.Greater ? s = ">" : t.GreaterEqual && (s = ">="), {
      type: "BinaryExpression",
      operator: s,
      left: e,
      right: this.visit(t.rhs[0]),
      location: this.getLocation(t)
    };
  }
  additiveExpression(t) {
    let e = this.visit(t.lhs[0]);
    if (!t.Plus && !t.Minus)
      return e;
    const s = [...t.Plus || [], ...t.Minus || []].sort((i, a) => i.startOffset - a.startOffset).map((i) => i.image);
    for (let i = 0; i < s.length; i++)
      e = {
        type: "BinaryExpression",
        operator: s[i],
        left: e,
        right: this.visit(t.rhs[i]),
        location: this.getLocation(t)
      };
    return e;
  }
  multiplicativeExpression(t) {
    let e = this.visit(t.lhs[0]);
    if (!t.Star && !t.Slash && !t.Mod)
      return e;
    const s = [
      ...t.Star || [],
      ...t.Slash || [],
      ...t.Mod || []
    ].sort((i, a) => i.startOffset - a.startOffset).map((i) => i.image);
    for (let i = 0; i < s.length; i++)
      e = {
        type: "BinaryExpression",
        operator: s[i],
        left: e,
        right: this.visit(t.rhs[i]),
        location: this.getLocation(t)
      };
    return e;
  }
  unaryExpression(t) {
    return t.Not || t.Minus ? {
      type: "UnaryExpression",
      operator: t.Not ? "NOT" : "-",
      operand: this.visit(t.unaryExpression[0]),
      location: this.getLocation(t)
    } : this.visit(t.primaryExpression[0]);
  }
  primaryExpression(t) {
    if (t.literal) return this.visit(t.literal[0]);
    if (t.identifierOrCall) return this.visit(t.identifierOrCall[0]);
    if (t.expression) return this.visit(t.expression[0]);
    throw new Error("Unknown primary expression");
  }
  identifierOrCall(t) {
    const e = t.Identifier.map((i) => i.image), s = e.join(".");
    if (t.LParen) {
      const i = t.argumentList ? this.visit(t.argumentList[0]) : [];
      return {
        type: "FunctionCall",
        name: e[0],
        // Only use first part for function name
        arguments: i,
        location: this.getLocation(t)
      };
    }
    return {
      type: "VariableRef",
      name: s,
      location: this.getLocation(t)
    };
  }
  literal(t) {
    let e, s, i;
    return t.True || t.False ? (e = !!t.True, s = "boolean", i = t.True ? "TRUE" : "FALSE") : t.IntegerLiteral ? (i = t.IntegerLiteral[0].image, e = parseInt(i, 10), s = "integer") : t.RealLiteral ? (i = t.RealLiteral[0].image, e = parseFloat(i), s = "real") : t.StringLiteral ? (i = t.StringLiteral[0].image, e = i.slice(1, -1).replace(/''/g, "'"), s = "string") : t.TimeLiteral ? (i = t.TimeLiteral[0].image, e = i, s = "time") : (i = "0", e = 0, s = "integer"), {
      type: "Literal",
      kind: s,
      value: e,
      raw: i,
      location: this.getLocation(t)
    };
  }
  variableReference(t) {
    return {
      type: "VariableRef",
      name: t.Identifier.map((s) => s.image).join("."),
      location: this.getLocation(t)
    };
  }
  functionCall(t) {
    const e = t.Identifier[0].image, s = t.argumentList ? this.visit(t.argumentList[0]) : [];
    return {
      type: "FunctionCall",
      name: e,
      arguments: s,
      location: this.getLocation(t)
    };
  }
  argumentList(t) {
    return t.argument.map((e) => this.visit(e));
  }
  argument(t) {
    const e = t.argName ? t.argName[0].image : void 0, s = t.argValue ? this.visit(t.argValue[0]) : this.visit(t.expression[0]);
    return {
      type: "FunctionArgument",
      name: e,
      value: s,
      location: this.getLocation(t)
    };
  }
  // Helper methods
  createDataType(t) {
    return {
      type: "DataType",
      name: t
    };
  }
  parseIoAddress(t) {
    const e = t.substring(1);
    return {
      type: "EntityBinding",
      direction: t[1] === "I" ? "INPUT" : t[1] === "Q" ? "OUTPUT" : "MEMORY",
      ioAddress: e
      // entityId will be set from initialValue if present
    };
  }
  getLocation(t) {
    const e = this.getAllTokens(t);
    if (e.length === 0) return;
    const s = e[0], i = e[e.length - 1];
    return {
      startLine: s.startLine || 0,
      startColumn: s.startColumn || 0,
      endLine: i.endLine || i.startLine || 0,
      endColumn: i.endColumn || i.startColumn || 0
    };
  }
  getAllTokens(t) {
    const e = [];
    for (const s in t)
      if (Array.isArray(t[s]))
        for (const i of t[s])
          i && typeof i == "object" && "image" in i && e.push(i);
    return e.sort((s, i) => s.startOffset - i.startOffset);
  }
}
const yi = new Li();
function w(n) {
  const t = [], e = bi(n);
  if (e.errors.length > 0 && e.errors.forEach((i) => {
    t.push({
      message: i.message,
      line: i.line,
      column: i.column,
      offset: i.offset
    });
  }), t.length > 0)
    return {
      success: !1,
      errors: t
    };
  O.input = e.tokens;
  const s = O.program();
  if (O.errors.length > 0)
    return O.errors.forEach((i) => {
      t.push({
        message: i.message,
        line: i.token.startLine,
        column: i.token.startColumn,
        offset: i.token.startOffset
      });
    }), {
      success: !1,
      errors: t
    };
  try {
    return {
      success: !0,
      ast: yi.visit(s),
      errors: []
    };
  } catch (i) {
    return t.push({
      message: i instanceof Error ? i.message : "Unknown AST transformation error"
    }), {
      success: !1,
      errors: t
    };
  }
}
var ee = Object.defineProperty, _i = Object.getOwnPropertyDescriptor, Oi = (n, t, e) => t in n ? ee(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, f = (n, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? _i(t, e) : t, a = n.length - 1, o; a >= 0; a--)
    (o = n[a]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && ee(t, e, i), i;
}, Ui = (n, t, e) => Oi(n, t + "", e);
let m = class extends W {
  constructor() {
    super();
    l(this, "_entityBrowserLoaded", !1);
    l(this, "_projectExplorerLoaded", !1);
    this.narrow = !1, this._showEntityBrowser = !1, this._showProjectExplorer = !1, this._project = null, this._storage = null, this._code = `{mode: restart}
{throttle: T#1s}
PROGRAM Kitchen_Light
VAR
    {trigger}
    motion AT %I* : BOOL := 'binary_sensor.kitchen_motion';

    {no_trigger}
    temperature AT %I* : REAL := 'sensor.kitchen_temperature';

    {persistent}
    activationCount : INT := 0;

    light AT %Q* : BOOL := 'light.kitchen';
END_VAR

(* Main logic *)
IF motion THEN
    light := TRUE;
    activationCount := activationCount + 1;
ELSE
    light := FALSE;
END_IF

END_PROGRAM`, this._syntaxOk = !0, this._triggers = [], this._diagnostics = [], this._metadata = null, this._entityCount = 0, this._onlineState = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._initializeProject(), this._analyzeCode();
  }
  updated(t) {
    super.updated(t), t.has("hass") && this._initializeStorage().then(() => {
      this._project || this._initializeProject();
    });
  }
  async _initializeStorage() {
    var e, s;
    if (this._storage) return;
    const { ProjectStorage: t } = await import("./project-CwEQ2u1-.js");
    if ((e = this.hass) != null && e.connection) {
      const i = ((s = this.hass.config) == null ? void 0 : s.entry_id) || "default";
      this._storage = new t(this.hass.connection, i);
    } else
      this._storage = new t(null, "default");
  }
  async _initializeProject() {
    if (this._storage || await this._initializeStorage(), this._storage)
      try {
        const t = await this._storage.loadProject();
        if (t) {
          if (this._project = t, t.activeFileId) {
            const e = t.files.find(
              (s) => s.id === t.activeFileId
            );
            e && (this._code = e.content);
          }
        } else
          this._project = this._storage.migrateFromSingleFile(this._code), await this._storage.saveProject(this._project);
      } catch (t) {
        console.error("Failed to load project", t);
      }
  }
  render() {
    var s, i, a;
    const t = this._diagnostics.filter(
      (o) => o.severity === "Error"
    ).length, e = this._diagnostics.filter(
      (o) => o.severity === "Warning"
    ).length;
    return u`
      <div class="container">
        <div class="toolbar">
          <h1>ST for Home Assistant</h1>
          <div class="toolbar-actions">
            <button
              class="toolbar-button ${this._showProjectExplorer ? "active" : ""}"
              @click=${this._toggleProjectExplorer}
              title="Toggle Project Explorer"
            >
              <ha-icon icon="mdi:folder"></ha-icon>
              Project
            </button>
            <button
              class="toolbar-button ${this._showEntityBrowser ? "active" : ""}"
              @click=${this._toggleEntityBrowser}
              title="Toggle Entity Browser"
            >
              <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
              Entities
            </button>
            <button @click=${this._handleDeploy} ?disabled=${!this._syntaxOk}>
              ▶ Deploy
            </button>
          </div>
        </div>
        ${this._onlineState ? u`
              <st-online-toolbar
                .state=${this._onlineState}
                @connect=${this._handleOnlineConnect}
                @disconnect=${this._handleOnlineDisconnect}
                @toggle-pause=${this._handleOnlineTogglePause}
                @setting-change=${this._handleOnlineSettingChange}
              ></st-online-toolbar>
            ` : ""}
        <div class="main-content">
          ${this._showProjectExplorer ? u`
                <div class="project-sidebar">
                  <st-project-explorer
                    .hass=${this.hass}
                    .project=${this._project}
                    @file-open=${this._handleFileOpen}
                    @file-selected=${this._handleFileSelected}
                    @file-rename=${this._handleFileRename}
                    @file-deleted=${this._handleFileDeleted}
                    @file-created=${this._handleFileCreated}
                  ></st-project-explorer>
                </div>
              ` : ""}
          <div class="sidebar ${this._showEntityBrowser ? "" : "hidden"}">
            <st-entity-browser .hass=${this.hass}></st-entity-browser>
          </div>
          <div class="content-area">
            ${this._project ? u`
                  <div class="tabs-container">
                    ${this._getOpenFiles().map(
      (o) => u`
                        <button
                          class="tab ${o.id === this._project.activeFileId ? "active" : ""}"
                          @click=${() => this._switchToFile(o.id)}
                          title=${o.path}
                        >
                          <span>${o.name}</span>
                          ${o.hasUnsavedChanges ? u`<div class="unsaved-dot"></div>` : ""}
                          <div
                            class="tab-close"
                            @click=${(h) => {
        h.stopPropagation(), this._closeFile(o.id);
      }}
                            title="Close"
                          >
                            <ha-icon
                              icon="mdi:close"
                              style="width: 12px; height: 12px;"
                            ></ha-icon>
                          </div>
                        </button>
                      `
    )}
                  </div>
                ` : ""}
            <div class="editor-container">
              <st-editor
                .code=${this._getCurrentCode()}
                .hass=${this.hass}
                @code-change=${this._handleCodeChange}
              ></st-editor>
            </div>
          </div>
        </div>
        ${this._diagnostics.length > 0 ? u`
              <div class="diagnostics-panel">
                ${this._diagnostics.map(
      (o) => u`
                    <div
                      class="diagnostic diagnostic-${o.severity.toLowerCase()}"
                    >
                      ${o.line ? `[${o.line}:${o.column || 0}] ` : ""}${o.code ? `${o.code}: ` : ""}${o.message}
                    </div>
                  `
    )}
              </div>
            ` : ""}
        <div class="status-bar">
          ${this._syntaxOk ? u`<span class="status-ok">✓ Syntax OK</span>` : u`<span class="status-error">✗ Syntax Error</span>`}
          ${t > 0 ? u`<span class="status-error">${t} Error(s)</span>` : ""}
          ${e > 0 ? u`<span class="status-warning"
                >${e} Warning(s)</span
              >` : ""}
          <span>Triggers: ${this._triggers.length}</span>
          <span>Entities: ${this._entityCount}</span>
          ${(s = this._metadata) != null && s.mode ? u`<span>Mode: ${this._metadata.mode}</span>` : ""}
          ${(i = this._metadata) != null && i.hasPersistentVars ? u`<span>💾 Persistent</span>` : ""}
          ${(a = this._metadata) != null && a.hasTimers ? u`<span>⏱️ Timers</span>` : ""}
        </div>
      </div>
    `;
  }
  _handleCodeChange(t) {
    const e = t.detail.code;
    if (this._project && this._project.activeFileId) {
      const s = this._project.files.find(
        (i) => i.id === this._project.activeFileId
      );
      s && (s.content = e, s.hasUnsavedChanges = !0, s.lastModified = Date.now(), this._project.lastModified = Date.now());
    } else
      this._code = e;
    this._analyzeCode();
  }
  _getCurrentCode() {
    if (this._project && this._project.activeFileId) {
      const t = this._project.files.find(
        (e) => e.id === this._project.activeFileId
      );
      return (t == null ? void 0 : t.content) || "";
    }
    return this._code;
  }
  _getOpenFiles() {
    return this._project ? this._project.files.filter((t) => t.isOpen) : [];
  }
  _switchToFile(t) {
    var i;
    if (!this._project) return;
    const e = this._project.files.find((a) => a.id === t);
    if (!e) return;
    const s = (i = this.shadowRoot) == null ? void 0 : i.querySelector(
      "st-editor"
    );
    if (s && this._project.activeFileId) {
      const a = this._project.files.find(
        (o) => o.id === this._project.activeFileId
      );
      if (a) {
        const o = s.getCode();
        o !== a.content && (a.content = o, a.hasUnsavedChanges = !0, a.lastModified = Date.now());
      }
    }
    this._project.activeFileId = t, this._project.files.forEach((a) => {
      a.isOpen = a.id === t || a.isOpen;
    }), this._project.lastModified = Date.now(), s && s.setCode(e.content), this._saveProject(), this.requestUpdate();
  }
  _closeFile(t) {
    if (!this._project) return;
    const e = this._project.files.find((s) => s.id === t);
    if (e && !(e.hasUnsavedChanges && !confirm(`File "${e.name}" has unsaved changes. Close anyway?`))) {
      if (e.isOpen = !1, this._project.activeFileId === t) {
        const s = this._project.files.filter(
          (i) => i.isOpen && i.id !== t
        );
        this._project.activeFileId = s.length > 0 ? s[0].id : null;
      }
      this._project.lastModified = Date.now(), this._saveProject(), this.requestUpdate();
    }
  }
  _handleFileOpen(t) {
    const { fileId: e } = t.detail;
    this._switchToFile(e);
  }
  _handleFileSelected(t) {
  }
  _handleFileRename(t) {
    const { fileId: e, newName: s } = t.detail;
    if (!this._project) return;
    const i = this._project.files.find((a) => a.id === e);
    i && (i.name = s, i.path = s, i.lastModified = Date.now(), this._project.lastModified = Date.now(), this._saveProject());
  }
  _handleFileDeleted(t) {
    const { fileId: e } = t.detail;
    this._closeFile(e);
  }
  _handleFileCreated(t) {
    var i;
    const { file: e } = t.detail;
    if (!this._project || !e) return;
    this._project = {
      ...this._project,
      files: [...this._project.files, e],
      activeFileId: e.id,
      lastModified: Date.now()
    };
    const s = (i = this.shadowRoot) == null ? void 0 : i.querySelector(
      "st-editor"
    );
    s && s.setCode(e.content), this._saveProject(), this._analyzeCode(), this.requestUpdate();
  }
  async _saveProject() {
    if (!(!this._storage || !this._project))
      try {
        await this._storage.saveProject(this._project);
      } catch (t) {
        console.error("Failed to save project", t);
      }
  }
  async _toggleProjectExplorer() {
    !this._projectExplorerLoaded && !this._showProjectExplorer && (await import("./project-CwEQ2u1-.js"), this._projectExplorerLoaded = !0), this._showProjectExplorer = !this._showProjectExplorer;
  }
  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  _analyzeCode() {
    var i, a;
    const t = [], e = this._getCurrentCode(), s = w(e);
    if (s.errors.length > 0)
      for (const o of s.errors)
        t.push({
          severity: "Error",
          message: o.message,
          line: o.line,
          column: o.column
        });
    if (this._syntaxOk = s.success && s.ast !== void 0, s.success && s.ast) {
      const o = Y(s.ast);
      for (const h of o.diagnostics)
        t.push({
          severity: h.severity,
          code: h.code,
          message: h.message,
          line: (i = h.location) == null ? void 0 : i.line,
          column: (a = h.location) == null ? void 0 : a.column
        });
      this._triggers = o.triggers, this._metadata = o.metadata, this._entityCount = o.dependencies.length;
    } else
      this._triggers = [], this._metadata = null, this._entityCount = 0;
    this._diagnostics = t;
  }
  async _handleDeploy() {
    var h;
    if (!this._syntaxOk) {
      console.error("Cannot deploy: syntax errors present");
      return;
    }
    if (!((h = this.hass) != null && h.connection)) {
      console.error(
        "Cannot deploy: Home Assistant connection is not available"
      );
      return;
    }
    const t = w(this._code);
    if (!t.success || !t.ast) {
      console.error("Cannot deploy: parsing failed");
      return;
    }
    const [{ transpile: e }, { deploy: s, HAApiClient: i }] = await Promise.all([
      import("./transpiler-deploy-BqpcyTqr.js").then((p) => p.i),
      import("./transpiler-deploy-BqpcyTqr.js").then((p) => p.a)
    ]), a = e(t.ast, "home");
    if (a.diagnostics.some((p) => p.severity === "Error")) {
      console.error(
        "Cannot deploy: transpiler reported errors",
        a.diagnostics
      );
      return;
    }
    const o = new i(this.hass.connection);
    try {
      const p = await s(o, a, {
        createBackup: !0
      });
      p.success ? console.log("Deploy successful", p.transactionId) : console.error("Deploy failed", p.errors);
    } catch (p) {
      console.error("Deploy error", p);
    }
  }
  /**
   * Extract variable bindings from AST for online mode
   */
  _extractBindings(t) {
    const e = [];
    for (const s of t)
      !s.entityId || !s.location || e.push({
        variableName: s.variableName,
        entityId: s.entityId,
        dataType: s.dataType,
        line: s.location.line,
        column: s.location.column,
        endColumn: s.location.column + s.variableName.length,
        isInput: s.direction === "INPUT",
        isOutput: s.direction === "OUTPUT",
        isPersistent: !1
        // Will be determined from storage analysis if needed
      });
    return e;
  }
  async _handleOnlineConnect() {
    var a, o;
    if (!this._syntaxOk || !((a = this.hass) != null && a.connection))
      return;
    const t = w(this._code);
    if (!t.success || !t.ast)
      return;
    const e = Y(t.ast), s = this._extractBindings(e.dependencies), i = (o = this.shadowRoot) == null ? void 0 : o.querySelector(
      "st-editor"
    );
    if (i)
      try {
        await i.startOnlineMode(s), this._onlineState = i.getOnlineState();
      } catch (h) {
        console.error("Failed to start online mode", h);
      }
  }
  _handleOnlineDisconnect() {
    var e;
    const t = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "st-editor"
    );
    t && (t.stopOnlineMode(), this._onlineState = null);
  }
  _handleOnlineTogglePause() {
    var e;
    const t = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "st-editor"
    );
    if (t && this._onlineState) {
      const s = this._onlineState.status === "paused";
      t.setOnlinePaused(!s), this._onlineState = t.getOnlineState();
    }
  }
  _handleOnlineSettingChange(t) {
    console.log("Online setting changed", t.detail);
  }
  async _toggleEntityBrowser() {
    !this._entityBrowserLoaded && !this._showEntityBrowser && (await import("./entity-browser-Cy2iDIVt.js"), this._entityBrowserLoaded = !0), this._showEntityBrowser = !this._showEntityBrowser;
  }
};
Ui(m, "styles", j`
    :host {
      display: block;
      height: 100%;
      background: var(--primary-background-color);
    }
    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 320px;
      min-width: 280px;
      max-width: 400px;
      border-right: 1px solid var(--divider-color);
      display: flex;
      flex-direction: column;
      background: var(--primary-background-color);
      overflow: hidden;
    }
    .sidebar.hidden {
      display: none;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--app-header-background-color);
      color: var(--app-header-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .toolbar h1 {
      margin: 0;
      font-size: 20px;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .toolbar-button {
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .toolbar-button:hover {
      background: var(--divider-color);
    }
    .toolbar-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }
    .editor-container {
      flex: 1;
      overflow: hidden;
      padding: 16px;
    }
    st-editor {
      height: 100%;
      border-radius: 4px;
    }
    .status-bar {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-top: 1px solid var(--divider-color);
      font-size: 12px;
      flex-wrap: wrap;
    }
    .status-ok {
      color: var(--success-color, #4caf50);
    }
    .status-error {
      color: var(--error-color, #f44336);
    }
    .status-warning {
      color: var(--warning-color, #ff9800);
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .diagnostics-panel {
      max-height: 150px;
      overflow-y: auto;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border-top: 1px solid var(--divider-color);
      font-size: 12px;
      font-family: monospace;
    }
    .diagnostic {
      padding: 2px 0;
    }
    .diagnostic-error {
      color: var(--error-color, #f44336);
    }
    .diagnostic-warning {
      color: var(--warning-color, #ff9800);
    }
    .diagnostic-info {
      color: var(--info-color, #2196f3);
    }
    .diagnostic-hint {
      color: var(--disabled-text-color, #9e9e9e);
    }
    .tabs-container {
      display: flex;
      gap: 2px;
      padding: 0 8px;
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
      overflow-x: auto;
    }
    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 13px;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .tab:hover {
      background: var(--divider-color);
    }
    .tab.active {
      background: var(--card-background-color);
      border-bottom-color: var(--primary-color);
      color: var(--primary-text-color);
    }
    .tab-close {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      opacity: 0.6;
    }
    .tab-close:hover {
      opacity: 1;
      background: var(--divider-color);
    }
    .unsaved-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--warning-color, #ff9800);
    }
    .project-sidebar {
      width: 280px;
      min-width: 240px;
      max-width: 360px;
      border-right: 1px solid var(--divider-color);
      display: flex;
      flex-direction: column;
      background: var(--primary-background-color);
    }
    .project-sidebar.hidden {
      display: none;
    }
  `);
f([
  L({ attribute: !1 })
], m.prototype, "hass", 2);
f([
  L({ type: Boolean })
], m.prototype, "narrow", 2);
f([
  E()
], m.prototype, "_code", 2);
f([
  E()
], m.prototype, "_project", 2);
f([
  E()
], m.prototype, "_syntaxOk", 2);
f([
  E()
], m.prototype, "_triggers", 2);
f([
  E()
], m.prototype, "_diagnostics", 2);
f([
  E()
], m.prototype, "_metadata", 2);
f([
  E()
], m.prototype, "_entityCount", 2);
f([
  E()
], m.prototype, "_onlineState", 2);
f([
  E()
], m.prototype, "_showEntityBrowser", 2);
f([
  E()
], m.prototype, "_showProjectExplorer", 2);
f([
  E()
], m.prototype, "_storage", 2);
m = f([
  G("st-panel")
], m);
console.log("ST for Home Assistant loaded");
export {
  S as STEditor,
  Z as ST_BUILTINS,
  J as ST_FUNCTION_BLOCKS,
  X as ST_KEYWORDS,
  ke as ST_PRAGMAS,
  Q as ST_TYPES,
  De as stEditorTheme,
  Fe as stHighlightStyle,
  $e as stTheme,
  Pe as structuredText
};
//# sourceMappingURL=st-panel.js.map
