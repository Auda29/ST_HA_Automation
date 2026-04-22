var se = Object.defineProperty;
var ae = (a, t, e) => t in a ? se(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var l = (a, t, e) => ae(a, typeof t != "symbol" ? t + "" : t, e);
import { S as re, c as ne, L as oe, E as T, H as le, s as ce, a as K, b as de, D as A, W as he, C as pe, d as L, l as ue, h as ge, e as me, f as fe, g as ve, i as be, j as Ee, k as ye, m as Se, n as Le, o as _e, p as Oe, q as Ce, r as Ue, t as Ne, u as Te, v as Re, w as we, x as xe, y as Ae } from "./codemirror-C8x9REUs.js";
import { W as g } from "./vendor-BhPS5zVw.js";
import { i as j, n as S, a as z, b as u, t as W, r as v } from "./lit-C178dhqO.js";
import { s as Me } from "./ha-websocket-DcUbagYv.js";
import { c as o, L as R, C as Be } from "./chevrotain-cBR36crC.js";
import { a as Y } from "./analyzer-DbAWr__X.js";
const Ie = ':root{--editor-bg: #1e1e1e;--editor-bg-light: #252526;--editor-fg: #d4d4d4;--editor-fg-dim: #808080;--editor-keyword: #569cd6;--editor-type: #4ec9b0;--editor-function: #dcdcaa;--editor-variable: #9cdcfe;--editor-string: #ce9178;--editor-number: #b5cea8;--editor-comment: #6a9955;--editor-pragma: #c586c0;--editor-operator: #d4d4d4;--editor-invalid: #ff0000;--editor-selection: #264f78;--editor-selection-bg: rgba(38, 79, 120, .5);--editor-line-highlight: #2a2d2e;--editor-gutter-bg: #1e1e1e;--editor-gutter-fg: #858585;--editor-border: #404040;--editor-cursor: #aeafad;--editor-tooltip-bg: #252526;--ui-primary: var(--primary-color, #03a9f4);--ui-bg: var(--primary-background-color, #fafafa);--ui-bg-secondary: var(--secondary-background-color, #e5e5e5);--ui-bg-card: var(--card-background-color, #ffffff);--ui-bg-header: var(--app-header-background-color,#03a9f4);--ui-text-primary: var(--primary-text-color, #212121);--ui-text-secondary: var(--secondary-text-color, #727272);--ui-text-header: var(--app-header-text-color, #ffffff);--ui-text-on-primary: var(--text-primary-color, #ffffff);--ui-divider: var(--divider-color, rgba(0,0,0,.12));--ui-success: var(--success-color, #4caf50);--ui-error: var(--error-color, #f44336);--ui-warning: var(--warning-color, #ff9800);--ui-info: var(--info-color, #2196f3);--ui-disabled: var(--disabled-text-color, #9e9e9e);--status-online: #4ec9b0;--status-paused: #dcdcaa;--status-connecting: #569cd6;--status-disconnected: #808080;--status-error: #f44747;--font-mono: "Fira Code", "Consolas", "Courier New", monospace;--font-ui: var(--paper-font-common-base_-_font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);--font-size-editor: 14px;--font-size-diagnostics: 12px;--font-size-xs: 11px;--font-size-sm: 12px;--font-size-base: 13px;--font-size-md: 14px;--font-size-lg: 16px;--font-size-xl: 18px;--font-size-2xl: 20px;--font-weight-normal: 400;--font-weight-medium: 500;--font-weight-bold: 700;--space-1: 4px;--space-2: 8px;--space-3: 12px;--space-4: 16px;--space-5: 20px;--space-6: 24px;--space-8: 32px;--radius-sm: 2px;--radius-md: 4px;--shadow-popover: 0 4px 12px rgba(0, 0, 0, .2);--sidebar-width-min: 240px;--sidebar-width-default: 320px;--sidebar-width-max: 400px;--transition-fast: all .2s ease}.st-h1{font-family:var(--font-ui);font-size:var(--font-size-2xl);font-weight:var(--font-weight-normal);color:var(--ui-text-header);margin:0}.st-h2{font-family:var(--font-ui);font-size:var(--font-size-xl);font-weight:var(--font-weight-medium);color:var(--ui-text-primary);margin:0 0 12px}.st-body{font-family:var(--font-ui);font-size:var(--font-size-base);font-weight:var(--font-weight-normal);color:var(--ui-text-primary)}.st-body-sm{font-family:var(--font-ui);font-size:var(--font-size-sm);color:var(--ui-text-secondary)}.st-mono{font-family:var(--font-mono);font-size:var(--font-size-diagnostics);color:var(--ui-text-primary)}.st-status-ok{color:var(--ui-success)}.st-status-error{color:var(--ui-error)}.st-status-warning{color:var(--ui-warning)}.st-status-info{color:var(--ui-info)}.st-btn-primary{padding:var(--space-2) var(--space-4);border:none;border-radius:var(--radius-md);background:var(--ui-primary);color:var(--ui-text-on-primary);cursor:pointer;font-family:var(--font-ui);font-size:var(--font-size-md)}.st-btn-secondary{padding:6px var(--space-3);border:1px solid var(--ui-divider);border-radius:var(--radius-md);background:var(--ui-bg-secondary);color:var(--ui-text-primary);cursor:pointer;font-family:var(--font-ui);font-size:var(--font-size-md);display:flex;align-items:center;gap:var(--space-1)}.st-btn-secondary:hover{background:var(--ui-divider)}.st-btn-secondary.active{background:var(--ui-primary);color:var(--ui-text-on-primary);border-color:var(--ui-primary)}.st-btn-primary:disabled,.st-btn-secondary:disabled{opacity:.5;cursor:not-allowed}', X = [
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
], H = re.define({
  name: "structuredtext",
  startState() {
    return { inBlockComment: !1 };
  },
  copyState(a) {
    return { inBlockComment: a.inBlockComment };
  },
  token(a, t) {
    if (a.eatSpace()) return null;
    if (a.match("(*") && (t.inBlockComment = !0), t.inBlockComment) {
      for (; !a.eol(); ) {
        if (a.match("*)"))
          return t.inBlockComment = !1, "comment";
        a.next();
      }
      return "comment";
    }
    if (a.match("//"))
      return a.skipToEnd(), "comment";
    if (a.match("{")) {
      let e = 1;
      for (; !a.eol() && e > 0; ) {
        const s = a.next();
        s === "{" && e++, s === "}" && e--;
      }
      return "meta";
    }
    if (a.match("'")) {
      for (; !a.eol(); )
        if (a.next() === "'" && !a.match("'"))
          return "string";
      return "string";
    }
    if (a.match(/T#[\d_hmsdu]+/i) || a.match(/TIME#[\d_hmsdu]+/i) || a.match(/16#[\da-fA-F_]+/) || a.match(/2#[01_]+/) || a.match(/8#[0-7_]+/) || a.match(/\d+\.\d+([eE][+-]?\d+)?/) || a.match(/\d+/))
      return "number";
    if (a.match(":=") || a.match("<=") || a.match(">=") || a.match("<>") || a.match("=>"))
      return "operator";
    if (a.match(/%[IQM][XBWDLxbwdl]?\*?/i))
      return "keyword";
    if (a.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const e = a.current().toUpperCase();
      return X.includes(e) ? "keyword" : Q.includes(e) ? "typeName" : Z.includes(e) ? "function.standard" : J.includes(e) ? "className" : "variableName";
    }
    return a.match(/[+\-*=<>()[\];:,.]/) ? "operator" : (a.next(), null);
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] }
  }
}), De = ne([
  ...X.map((a) => ({ label: a, type: "keyword" })),
  ...Q.map((a) => ({ label: a, type: "type" })),
  ...Z.map((a) => ({ label: a, type: "function" })),
  ...J.map((a) => ({ label: a, type: "class" })),
  ...ke.map((a) => ({
    label: `{${a}}`,
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
  return new oe(H, [
    H.data.of({ autocomplete: De })
  ]);
}
const h = {
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
}, Fe = T.theme(
  {
    "&": {
      color: h.fg,
      backgroundColor: h.bg,
      fontSize: "14px",
      fontFamily: '"Fira Code", "Consolas", monospace'
    },
    ".cm-content": {
      caretColor: h.cursor
    },
    ".cm-cursor": {
      borderLeftColor: h.cursor,
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
      backgroundColor: h.lineHighlight
    },
    ".cm-gutters": {
      backgroundColor: h.gutterBg,
      color: h.gutterFg,
      border: "none",
      borderRight: `1px solid ${h.border}`
    },
    ".cm-activeLineGutter": {
      backgroundColor: h.lineHighlight,
      color: h.fg
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer"
    },
    ".cm-tooltip": {
      backgroundColor: h.bgLight,
      border: `1px solid ${h.border}`
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: h.selection
    }
  },
  { dark: !0 }
), Ve = le.define([
  { tag: g.keyword, color: h.keyword, fontWeight: "bold" },
  { tag: g.typeName, color: h.type },
  {
    tag: [g.function(g.variableName), g.standard(g.function(g.variableName))],
    color: h.function
  },
  { tag: g.className, color: h.type },
  { tag: g.variableName, color: h.variable },
  { tag: g.propertyName, color: h.variable },
  { tag: g.string, color: h.string },
  { tag: g.number, color: h.number },
  { tag: g.comment, color: h.comment, fontStyle: "italic" },
  { tag: g.meta, color: h.pragma },
  { tag: g.operator, color: h.fg },
  { tag: g.invalid, color: "#ff0000", textDecoration: "underline wavy" }
]);
function $e() {
  return [Fe, ce(Ve)];
}
class je {
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
      this.unsubscribe = Me(
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
      const r = this.entityStates.get(i.entityId);
      if (!r) continue;
      const n = this.parseValue(r.state, i.dataType), d = this.liveValues.get(s), p = {
        binding: i,
        currentValue: n,
        previousValue: d == null ? void 0 : d.currentValue,
        hasChanged: d ? d.currentValue.raw !== n.raw : !1,
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
class ze extends he {
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
const We = de.define({
  create() {
    return A.none;
  },
  update(a, t) {
    for (const e of t.effects)
      if (e.is(tt))
        return Ge(t.state.doc.toString(), e.value);
    return t.docChanged && (a = a.map(t.changes)), a;
  },
  provide: (a) => T.decorations.from(a)
});
function Ge(a, t) {
  const e = [], s = a.split(`
`);
  let i = 0;
  for (let r = 0; r < s.length; r++) {
    const n = s[r], d = i + n.length;
    for (const [, p] of t)
      if (p.binding.line === r + 1) {
        const ie = A.widget({
          widget: new ze(p, !0),
          side: 1
        });
        e.push({
          from: d,
          to: d,
          decoration: ie
        });
      }
    i = d + 1;
  }
  return e.sort((r, n) => r.from - n.from), A.set(
    e.map((r) => r.decoration.range(r.from, r.to))
  );
}
const Ye = T.baseTheme({
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
function He() {
  return [We, Ye];
}
function qe(a, t) {
  a.dispatch({
    effects: tt.of(t)
  });
}
var et = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, Xe = (a, t, e) => t in a ? et(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, w = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Ke(t, e) : t, r = a.length - 1, n; r >= 0; r--)
    (n = a[r]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && et(t, e, i), i;
}, Qe = (a, t, e) => Xe(a, t + "", e);
let y = class extends z {
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
        L.readOnly.of(this.readOnly)
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
    this._onlineManager || (this._onlineManager = new je(this.hass.connection), this._onlineUnsubscribe = this._onlineManager.subscribe((s) => {
      this._editor && s.liveValues && qe(this._editor, s.liveValues);
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
      ve(),
      be(),
      L.allowMultipleSelections.of(!0),
      Ee(),
      ye(),
      Se(),
      Le(),
      _e(),
      Oe(),
      Ce.of([
        ...Ue,
        ...Ne,
        ...Te,
        ...Re,
        ...we,
        ...xe,
        Ae
      ]),
      Pe(),
      $e(),
      He(),
      this._readOnlyCompartment.of(L.readOnly.of(this.readOnly)),
      L.tabSize.of(4)
    ];
    this._editor = new T({
      state: L.create({ doc: this.code, extensions: e }),
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
      const i = this._editor.state.selection.main, r = i.empty ? i.head : i.from;
      this._editor.dispatch({
        changes: { from: r, insert: e },
        selection: { anchor: r + e.length }
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
Qe(y, "styles", j`
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
w([
  S({ type: String })
], y.prototype, "code", 2);
w([
  S({ type: Boolean, attribute: "read-only" })
], y.prototype, "readOnly", 2);
w([
  S({ attribute: !1 })
], y.prototype, "hass", 2);
y = w([
  W("st-editor")
], y);
var it = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, Je = (a, t, e) => t in a ? it(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, G = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Ze(t, e) : t, r = a.length - 1, n; r >= 0; r--)
    (n = a[r]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && it(t, e, i), i;
}, ti = (a, t, e) => Je(a, t + "", e);
let C = class extends z {
  constructor() {
    super(), this._showSettings = !1;
  }
  get statusText() {
    var t;
    return {
      disconnected: "Offline",
      connecting: "Connecting...",
      online: "Online",
      paused: "Paused",
      error: "Error"
    }[((t = this.state) == null ? void 0 : t.status) || "disconnected"];
  }
  get isPaused() {
    var a;
    return ((a = this.state) == null ? void 0 : a.status) === "paused";
  }
  get canConnect() {
    var a;
    return ["disconnected", "error"].includes(((a = this.state) == null ? void 0 : a.status) || "disconnected");
  }
  render() {
    var a, t, e, s;
    return u`
      <div class="status">
        <span
          class="status-dot status-dot--${((a = this.state) == null ? void 0 : a.status) || "disconnected"}"
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
        <div class="stat">📊 ${((e = (t = this.state) == null ? void 0 : t.liveValues) == null ? void 0 : e.size) || 0} Variables</div>
        <div class="stat">⚡ ${((s = this.state) == null ? void 0 : s.updateRate) || 100}ms</div>
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
    var a, t, e, s, i, r;
    return u`
      <div class="settings-panel">
        <div class="setting">
          <input
            type="checkbox"
            id="highlight"
            .checked=${(a = this.state) == null ? void 0 : a.highlightChanges}
            @change=${this._handleHighlightChange}
          />
          <label for="highlight">Highlight changes</label>
        </div>
        <div class="setting">
          <input
            type="checkbox"
            id="conditions"
            .checked=${(t = this.state) == null ? void 0 : t.showConditions}
            @change=${this._handleConditionsChange}
          />
          <label for="conditions">Show conditions</label>
        </div>
        <div class="setting">
          <label>Update rate:</label>
          <select @change=${this._handleRateChange}>
            <option value="50" ?selected=${((e = this.state) == null ? void 0 : e.updateRate) === 50}>
              50ms
            </option>
            <option value="100" ?selected=${((s = this.state) == null ? void 0 : s.updateRate) === 100}>
              100ms
            </option>
            <option value="250" ?selected=${((i = this.state) == null ? void 0 : i.updateRate) === 250}>
              250ms
            </option>
            <option value="500" ?selected=${((r = this.state) == null ? void 0 : r.updateRate) === 500}>
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
  _handleHighlightChange(a) {
    const t = a.target.checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "highlightChanges", value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleConditionsChange(a) {
    const t = a.target.checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "showConditions", value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleRateChange(a) {
    const t = Number.parseInt(a.target.value, 10);
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "updateRate", value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ti(C, "styles", j`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-3, 12px);
      padding: var(--space-2, 8px) var(--space-4, 16px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      font-family: var(--font-ui, inherit);
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
      background: var(--status-online, #4ec9b0);
      box-shadow: 0 0 4px var(--status-online, #4ec9b0);
    }

    .status-dot--paused {
      background: var(--status-paused, #dcdcaa);
    }

    .status-dot--connecting {
      background: var(--status-connecting, #569cd6);
      animation: pulse 1s infinite;
    }

    .status-dot--disconnected {
      background: var(--status-disconnected, #808080);
    }

    .status-dot--error {
      background: var(--status-error, #f44747);
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
      font-size: var(--font-size-base, 13px);
      font-weight: 500;
    }

    .controls {
      display: flex;
      gap: var(--space-2, 8px);
    }

    button {
      padding: 6px var(--space-3, 12px);
      border: 1px solid var(--ui-divider, var(--divider-color));
      border-radius: var(--radius-md, 4px);
      background: var(--ui-bg-secondary, var(--secondary-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      cursor: pointer;
      font-size: var(--font-size-base, 13px);
      display: flex;
      align-items: center;
      gap: var(--space-1, 4px);
    }

    button:hover {
      background: var(--ui-divider, var(--divider-color));
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.active {
      background: var(--ui-primary, var(--primary-color));
      color: var(--ui-text-on-primary, var(--text-primary-color));
      border-color: var(--ui-primary, var(--primary-color));
    }

    .spacer {
      flex: 1;
    }

    .stats {
      display: flex;
      gap: var(--space-4, 16px);
      font-size: var(--font-size-sm, 12px);
      color: var(--ui-text-secondary, var(--secondary-text-color));
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
      background: var(--ui-bg-card, var(--card-background-color));
      border: 1px solid var(--ui-divider, var(--divider-color));
      border-radius: var(--radius-md, 4px);
      padding: var(--space-3, 12px);
      box-shadow: var(--shadow-popover, 0 4px 12px rgba(0, 0, 0, 0.2));
      z-index: 100;
    }

    .setting {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      margin-bottom: var(--space-2, 8px);
    }

    .setting:last-child {
      margin-bottom: 0;
    }

    .setting label {
      font-size: var(--font-size-base, 13px);
    }
  `);
G([
  S({ type: Object })
], C.prototype, "state", 2);
G([
  v()
], C.prototype, "_showSettings", 2);
C = G([
  W("st-online-toolbar")
], C);
const c = (a, t) => o({ name: a, pattern: new RegExp(`\\b${t}\\b`, "i") }), ei = o({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: R.SKIPPED
}), ii = o({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: R.SKIPPED
}), si = o({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: R.SKIPPED
}), st = o({
  name: "Pragma",
  pattern: /\{[^}]+\}/
}), at = o({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: void 0
}), ai = o({
  name: "EndFunction",
  pattern: /END_FUNCTION/i
}), ri = o({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i
}), ni = o({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i
}), rt = o({ name: "EndVar", pattern: /END_VAR/i }), nt = o({
  name: "VarInput",
  pattern: /VAR_INPUT/i
}), ot = o({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i
}), lt = o({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i
}), ct = o({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i
}), dt = o({ name: "EndIf", pattern: /END_IF/i }), ht = o({ name: "EndCase", pattern: /END_CASE/i }), pt = o({ name: "EndFor", pattern: /END_FOR/i }), ut = o({
  name: "EndWhile",
  pattern: /END_WHILE/i
}), gt = o({
  name: "EndRepeat",
  pattern: /END_REPEAT/i
}), mt = c("Program", "PROGRAM"), oi = c("Function", "FUNCTION"), ft = c("Var", "VAR"), li = c("Constant", "CONSTANT"), vt = c("If", "IF"), M = c("Then", "THEN"), bt = c("Elsif", "ELSIF"), B = c("Else", "ELSE"), Et = c("Case", "CASE"), yt = c("Of", "OF"), St = c("For", "FOR"), Lt = c("To", "TO"), _t = c("By", "BY"), I = c("Do", "DO"), Ot = c("While", "WHILE"), Ct = c("Repeat", "REPEAT"), Ut = c("Until", "UNTIL"), Nt = c("Return", "RETURN"), Tt = c("Exit", "EXIT"), ci = c("Continue", "CONTINUE"), k = c("At", "AT"), Rt = c("And", "AND"), wt = c("Or", "OR"), di = c("Xor", "XOR"), xt = c("Not", "NOT"), At = c("Mod", "MOD"), Mt = c("True", "TRUE"), Bt = c("False", "FALSE"), It = c("TypeBool", "BOOL"), kt = o({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i
}), Dt = o({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i
}), Pt = o({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i
}), Ft = o({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i
}), hi = o({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i
}), Vt = o({
  name: "TimeLiteral",
  pattern: /T(IME)?#[\d_]+(\.[\d_]+)?([a-z]+)?/i
}), pi = o({
  name: "HexLiteral",
  pattern: /16#[\da-fA-F_]+/
}), ui = o({
  name: "BinaryLiteral",
  pattern: /2#[01_]+/
}), gi = o({
  name: "OctalLiteral",
  pattern: /8#[0-7_]+/
}), $t = o({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/
}), jt = o({
  name: "IntegerLiteral",
  pattern: /\d+/
}), zt = o({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/
}), D = o({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i
}), _ = o({ name: "Assign", pattern: /:=/ }), mi = o({ name: "Output", pattern: /=>/ }), Wt = o({ name: "LessEqual", pattern: /<=/ }), Gt = o({
  name: "GreaterEqual",
  pattern: />=/
}), Yt = o({ name: "NotEqual", pattern: /<>/ }), Ht = o({ name: "Less", pattern: /</ }), qt = o({ name: "Greater", pattern: />/ }), Kt = o({ name: "Equal", pattern: /=/ }), Xt = o({ name: "Plus", pattern: /\+/ }), P = o({ name: "Minus", pattern: /-/ }), Qt = o({ name: "Star", pattern: /\*/ }), Zt = o({ name: "Slash", pattern: /\// }), U = o({ name: "LParen", pattern: /\(/ }), N = o({ name: "RParen", pattern: /\)/ }), fi = o({ name: "LBracket", pattern: /\[/ }), vi = o({ name: "RBracket", pattern: /\]/ }), F = o({ name: "Colon", pattern: /:/ }), E = o({ name: "Semicolon", pattern: /;/ }), V = o({ name: "Comma", pattern: /,/ }), $ = o({ name: "Dot", pattern: /\./ }), Jt = o({ name: "Range", pattern: /\.\./ }), b = o({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}), te = [
  // Skipped
  ei,
  ii,
  si,
  // Pragmas
  st,
  // Multi-word keywords first
  ri,
  ni,
  ai,
  at,
  nt,
  ot,
  lt,
  ct,
  rt,
  dt,
  ht,
  pt,
  ut,
  gt,
  // Keywords
  mt,
  oi,
  ft,
  li,
  vt,
  M,
  bt,
  B,
  Et,
  yt,
  St,
  Lt,
  _t,
  I,
  Ot,
  Ct,
  Ut,
  Nt,
  Tt,
  ci,
  k,
  // Logical
  Rt,
  wt,
  di,
  xt,
  At,
  Mt,
  Bt,
  // Types
  It,
  kt,
  Dt,
  Pt,
  Ft,
  hi,
  // Literals (order: specific before general)
  Vt,
  pi,
  ui,
  gi,
  $t,
  jt,
  zt,
  // I/O
  D,
  // Multi-char operators
  _,
  mi,
  Jt,
  Wt,
  Gt,
  Yt,
  // Single-char operators
  Ht,
  qt,
  Kt,
  Xt,
  P,
  Qt,
  Zt,
  U,
  N,
  fi,
  vi,
  F,
  E,
  V,
  $,
  // Identifier last
  b
], bi = new R(te, {
  ensureOptimizations: !0,
  positionTracking: "full"
  // For error reporting
});
function Ei(a) {
  const t = bi.tokenize(a);
  return {
    tokens: t.tokens,
    errors: t.errors
  };
}
class yi extends Be {
  constructor() {
    super(te, {
      recoveryEnabled: !0,
      nodeLocationTracking: "full"
    });
    // Program structure
    l(this, "program", this.RULE("program", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(mt), this.CONSUME(b, { LABEL: "programName" }), this.MANY1(() => this.SUBRULE(this.variableBlock)), this.MANY2(() => this.SUBRULE(this.statement)), this.CONSUME(at);
    }));
    // Variable declarations
    l(this, "variableBlock", this.RULE("variableBlock", () => {
      this.OR([
        { ALT: () => this.CONSUME(ft) },
        { ALT: () => this.CONSUME(nt) },
        { ALT: () => this.CONSUME(ot) },
        { ALT: () => this.CONSUME(lt) },
        { ALT: () => this.CONSUME(ct) }
      ]), this.MANY(() => this.SUBRULE(this.variableDeclaration)), this.CONSUME(rt);
    }));
    l(this, "variableDeclaration", this.RULE("variableDeclaration", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(b, { LABEL: "varName" }), this.OPTION(() => {
        this.CONSUME(k), this.CONSUME(D);
      }), this.OPTION1(() => {
        this.CONSUME(F), this.SUBRULE(this.typeSpec);
      }), this.OPTION2(() => {
        this.CONSUME(_), this.SUBRULE(this.expression);
      }), this.OPTION3(() => {
        this.CONSUME1(k), this.CONSUME1(D);
      }), this.CONSUME(E);
    }));
    l(this, "pragma", this.RULE("pragma", () => {
      this.CONSUME(st);
    }));
    l(this, "typeSpec", this.RULE("typeSpec", () => {
      this.OR([
        { ALT: () => this.CONSUME(It) },
        { ALT: () => this.CONSUME(kt) },
        { ALT: () => this.CONSUME(Dt) },
        { ALT: () => this.CONSUME(Pt) },
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
      this.SUBRULE(this.variableReference), this.CONSUME(_), this.SUBRULE(this.expression), this.CONSUME(E);
    }));
    l(this, "ifStatement", this.RULE("ifStatement", () => {
      this.CONSUME(vt), this.SUBRULE(this.expression, { LABEL: "condition" }), this.CONSUME(M), this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" })), this.MANY1(() => {
        this.CONSUME(bt), this.SUBRULE1(this.expression, { LABEL: "elsifCondition" }), this.CONSUME1(M), this.MANY2(
          () => this.SUBRULE1(this.statement, { LABEL: "elsifStatements" })
        );
      }), this.OPTION(() => {
        this.CONSUME(B), this.MANY3(
          () => this.SUBRULE2(this.statement, { LABEL: "elseStatements" })
        );
      }), this.CONSUME(dt);
    }));
    l(this, "caseStatement", this.RULE("caseStatement", () => {
      this.CONSUME(Et), this.SUBRULE(this.expression, { LABEL: "selector" }), this.CONSUME(yt), this.MANY(() => this.SUBRULE(this.caseClause)), this.OPTION(() => {
        this.CONSUME(B), this.MANY1(() => this.SUBRULE(this.statement));
      }), this.CONSUME(ht);
    }));
    l(this, "caseClause", this.RULE("caseClause", () => {
      this.SUBRULE(this.caseLabelList), this.CONSUME(F), this.MANY(() => this.SUBRULE(this.statement));
    }));
    l(this, "caseLabelList", this.RULE("caseLabelList", () => {
      this.SUBRULE(this.caseLabel), this.MANY(() => {
        this.CONSUME(V), this.SUBRULE1(this.caseLabel);
      });
    }));
    l(this, "caseLabel", this.RULE("caseLabel", () => {
      this.SUBRULE(this.expression), this.OPTION(() => {
        this.CONSUME(Jt), this.SUBRULE1(this.expression);
      });
    }));
    l(this, "forStatement", this.RULE("forStatement", () => {
      this.CONSUME(St), this.CONSUME(b, { LABEL: "controlVar" }), this.CONSUME(_), this.SUBRULE(this.expression, { LABEL: "start" }), this.CONSUME(Lt), this.SUBRULE1(this.expression, { LABEL: "end" }), this.OPTION(() => {
        this.CONSUME(_t), this.SUBRULE2(this.expression, { LABEL: "step" });
      }), this.CONSUME(I), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(pt);
    }));
    l(this, "whileStatement", this.RULE("whileStatement", () => {
      this.CONSUME(Ot), this.SUBRULE(this.expression), this.CONSUME(I), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(ut);
    }));
    l(this, "repeatStatement", this.RULE("repeatStatement", () => {
      this.CONSUME(Ct), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(Ut), this.SUBRULE(this.expression), this.CONSUME(gt);
    }));
    l(this, "returnStatement", this.RULE("returnStatement", () => {
      this.CONSUME(Nt), this.CONSUME(E);
    }));
    l(this, "exitStatement", this.RULE("exitStatement", () => {
      this.CONSUME(Tt), this.CONSUME(E);
    }));
    l(this, "functionCallStatement", this.RULE("functionCallStatement", () => {
      this.SUBRULE(this.functionCall), this.CONSUME(E);
    }));
    // Expressions with operator precedence
    l(this, "expression", this.RULE("expression", () => {
      this.SUBRULE(this.orExpression);
    }));
    l(this, "orExpression", this.RULE("orExpression", () => {
      this.SUBRULE(this.andExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(wt), this.SUBRULE1(this.andExpression, { LABEL: "rhs" });
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
          { ALT: () => this.CONSUME(Wt) },
          { ALT: () => this.CONSUME(qt) },
          { ALT: () => this.CONSUME(Gt) }
        ]), this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "additiveExpression", this.RULE("additiveExpression", () => {
      this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Xt) },
          { ALT: () => this.CONSUME(P) }
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
            { ALT: () => this.CONSUME(At) }
          ]), this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
        });
      }
    ));
    l(this, "unaryExpression", this.RULE("unaryExpression", () => {
      this.OR([
        {
          ALT: () => {
            this.OR1([
              { ALT: () => this.CONSUME(xt) },
              { ALT: () => this.CONSUME(P) }
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
            this.CONSUME(U), this.SUBRULE(this.expression), this.CONSUME(N);
          }
        }
      ]);
    }));
    l(this, "identifierOrCall", this.RULE("identifierOrCall", () => {
      this.CONSUME(b), this.MANY(() => {
        this.CONSUME($), this.CONSUME1(b);
      }), this.OPTION(() => {
        this.CONSUME(U), this.OPTION1(() => {
          this.SUBRULE(this.argumentList);
        }), this.CONSUME(N);
      });
    }));
    l(this, "literal", this.RULE("literal", () => {
      this.OR([
        { ALT: () => this.CONSUME(Mt) },
        { ALT: () => this.CONSUME(Bt) },
        { ALT: () => this.CONSUME(jt) },
        { ALT: () => this.CONSUME($t) },
        { ALT: () => this.CONSUME(zt) },
        { ALT: () => this.CONSUME(Vt) }
      ]);
    }));
    l(this, "variableReference", this.RULE("variableReference", () => {
      this.CONSUME(b), this.MANY(() => {
        this.CONSUME($), this.CONSUME1(b);
      });
    }));
    l(this, "functionCall", this.RULE("functionCall", () => {
      this.CONSUME(b), this.CONSUME(U), this.OPTION(() => {
        this.SUBRULE(this.argumentList);
      }), this.CONSUME(N);
    }));
    l(this, "argumentList", this.RULE("argumentList", () => {
      this.SUBRULE(this.argument), this.MANY(() => {
        this.CONSUME(V), this.SUBRULE1(this.argument);
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
const O = new yi(), Si = O.getBaseCstVisitorConstructor();
class Li extends Si {
  constructor() {
    super(), this.validateVisitor();
  }
  // Program
  program(t) {
    const e = t.pragma ? t.pragma.map((n) => this.visit(n)) : [], s = t.programName[0].image, i = t.variableBlock ? t.variableBlock.flatMap((n) => this.visit(n)) : [], r = t.statement ? t.statement.map((n) => this.visit(n)) : [];
    return {
      type: "Program",
      name: s,
      pragmas: e,
      variables: i,
      body: r,
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
    const e = t.pragma ? t.pragma.map((d) => this.visit(d)) : [], s = t.varName[0].image, i = t.typeSpec ? this.visit(t.typeSpec[0]) : this.createDataType("UNKNOWN"), r = t.expression ? this.visit(t.expression[0]) : void 0;
    let n;
    return t.IoAddress && (n = this.parseIoAddress(t.IoAddress[0].image), r && r.type === "Literal" && r.kind === "string" && (n.entityId = r.value)), {
      type: "VariableDeclaration",
      name: s,
      dataType: i,
      section: "VAR",
      // Will be set by variableBlock
      pragmas: e,
      constant: !1,
      initialValue: r,
      binding: n,
      location: this.getLocation(t)
    };
  }
  pragma(t) {
    const s = t.Pragma[0].image.slice(1, -1).trim(), i = s.indexOf(":");
    let r, n;
    return i > 0 ? (r = s.substring(0, i).trim(), n = s.substring(i + 1).trim()) : r = s, {
      type: "Pragma",
      name: r,
      value: n,
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
    const e = this.visit(t.condition[0]), s = t.thenStatements ? t.thenStatements.map((n) => this.visit(n)) : [], i = t.elsifCondition ? t.elsifCondition.map((n, d) => {
      const p = t.elsifStatements && t.elsifStatements[d] ? this.visit(t.elsifStatements[d]) : [];
      return {
        condition: this.visit(n),
        body: Array.isArray(p) ? p : [p]
      };
    }) : [], r = t.elseStatements ? t.elseStatements.map((n) => this.visit(n)) : void 0;
    return {
      type: "IfStatement",
      condition: e,
      thenBranch: s,
      elsifBranches: i,
      elseBranch: r,
      location: this.getLocation(t)
    };
  }
  caseStatement(t) {
    const e = this.visit(t.selector[0]), s = t.caseClause ? t.caseClause.map((r) => this.visit(r)) : [], i = t.statement ? t.statement.map((r) => this.visit(r)) : void 0;
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
    const s = [...t.Plus || [], ...t.Minus || []].sort((i, r) => i.startOffset - r.startOffset).map((i) => i.image);
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
    ].sort((i, r) => i.startOffset - r.startOffset).map((i) => i.image);
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
const _i = new Li();
function x(a) {
  const t = [], e = Ei(a);
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
      ast: _i.visit(s),
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
var ee = Object.defineProperty, Oi = Object.getOwnPropertyDescriptor, Ci = (a, t, e) => t in a ? ee(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, f = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Oi(t, e) : t, r = a.length - 1, n; r >= 0; r--)
    (n = a[r]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && ee(t, e, i), i;
}, Ui = (a, t, e) => Ci(a, t + "", e);
let m = class extends z {
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

END_PROGRAM`, this._syntaxOk = !0, this._triggers = [], this._diagnostics = [], this._metadata = null, this._entityCount = 0, this._onlineState = this._createDisconnectedOnlineState();
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
    const { ProjectStorage: t } = await import("./project-DSJgCpej.js");
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
    var s, i, r;
    const t = this._diagnostics.filter(
      (n) => n.severity === "Error"
    ).length, e = this._diagnostics.filter(
      (n) => n.severity === "Warning"
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
            <button class="deploy-button" @click=${this._handleDeploy} ?disabled=${!this._syntaxOk}>
              ▶ Deploy
            </button>
          </div>
        </div>
        <st-online-toolbar
          .state=${this._onlineState ?? this._createDisconnectedOnlineState()}
          @connect=${this._handleOnlineConnect}
          @disconnect=${this._handleOnlineDisconnect}
          @toggle-pause=${this._handleOnlineTogglePause}
          @setting-change=${this._handleOnlineSettingChange}
        ></st-online-toolbar>
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
      (n) => u`
                        <button
                          class="tab ${n.id === this._project.activeFileId ? "active" : ""}"
                          @click=${() => this._switchToFile(n.id)}
                          title=${n.path}
                        >
                          <span>${n.name}</span>
                          ${n.hasUnsavedChanges ? u`<div class="unsaved-dot"></div>` : ""}
                          <div
                            class="tab-close"
                            @click=${(d) => {
        d.stopPropagation(), this._closeFile(n.id);
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
      (n) => u`
                    <div
                      class="diagnostic diagnostic-${n.severity.toLowerCase()}"
                    >
                      ${n.line ? `[${n.line}:${n.column || 0}] ` : ""}${n.code ? `${n.code}: ` : ""}${n.message}
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
          ${(r = this._metadata) != null && r.hasTimers ? u`<span>⏱️ Timers</span>` : ""}
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
  _createDisconnectedOnlineState() {
    return {
      status: "disconnected",
      bindings: [],
      liveValues: /* @__PURE__ */ new Map(),
      updateRate: 100,
      showConditions: !0,
      highlightChanges: !0
    };
  }
  _getOpenFiles() {
    return this._project ? this._project.files.filter((t) => t.isOpen) : [];
  }
  _switchToFile(t) {
    var i;
    if (!this._project) return;
    const e = this._project.files.find((r) => r.id === t);
    if (!e) return;
    const s = (i = this.shadowRoot) == null ? void 0 : i.querySelector(
      "st-editor"
    );
    if (s && this._project.activeFileId) {
      const r = this._project.files.find(
        (n) => n.id === this._project.activeFileId
      );
      if (r) {
        const n = s.getCode();
        n !== r.content && (r.content = n, r.hasUnsavedChanges = !0, r.lastModified = Date.now());
      }
    }
    this._project.activeFileId = t, this._project.files.forEach((r) => {
      r.isOpen = r.id === t || r.isOpen;
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
    const i = this._project.files.find((r) => r.id === e);
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
    !this._projectExplorerLoaded && !this._showProjectExplorer && (await import("./project-DSJgCpej.js"), this._projectExplorerLoaded = !0), this._showProjectExplorer = !this._showProjectExplorer;
  }
  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  _analyzeCode() {
    var i, r;
    const t = [], e = this._getCurrentCode(), s = x(e);
    if (s.errors.length > 0)
      for (const n of s.errors)
        t.push({
          severity: "Error",
          message: n.message,
          line: n.line,
          column: n.column
        });
    if (this._syntaxOk = s.success && s.ast !== void 0, s.success && s.ast) {
      const n = Y(s.ast);
      for (const d of n.diagnostics)
        t.push({
          severity: d.severity,
          code: d.code,
          message: d.message,
          line: (i = d.location) == null ? void 0 : i.line,
          column: (r = d.location) == null ? void 0 : r.column
        });
      this._triggers = n.triggers, this._metadata = n.metadata, this._entityCount = n.dependencies.length;
    } else
      this._triggers = [], this._metadata = null, this._entityCount = 0;
    this._diagnostics = t;
  }
  async _handleDeploy() {
    var d;
    if (!this._syntaxOk) {
      console.error("Cannot deploy: syntax errors present");
      return;
    }
    if (!((d = this.hass) != null && d.connection)) {
      console.error(
        "Cannot deploy: Home Assistant connection is not available"
      );
      return;
    }
    const t = x(this._getCurrentCode());
    if (!t.success || !t.ast) {
      console.error("Cannot deploy: parsing failed");
      return;
    }
    const [{ transpile: e }, { deploy: s, HAApiClient: i }] = await Promise.all([
      import("./transpiler-deploy-BqpcyTqr.js").then((p) => p.i),
      import("./transpiler-deploy-BqpcyTqr.js").then((p) => p.a)
    ]), r = e(t.ast, "home");
    if (r.diagnostics.some((p) => p.severity === "Error")) {
      console.error(
        "Cannot deploy: transpiler reported errors",
        r.diagnostics
      );
      return;
    }
    const n = new i(this.hass.connection);
    try {
      const p = await s(n, r, {
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
    var r, n;
    if (!this._syntaxOk || !((r = this.hass) != null && r.connection))
      return;
    const t = x(this._getCurrentCode());
    if (!t.success || !t.ast)
      return;
    const e = Y(t.ast), s = this._extractBindings(e.dependencies), i = (n = this.shadowRoot) == null ? void 0 : n.querySelector(
      "st-editor"
    );
    if (i)
      try {
        await i.startOnlineMode(s), this._onlineState = i.getOnlineState();
      } catch (d) {
        console.error("Failed to start online mode", d);
      }
  }
  _handleOnlineDisconnect() {
    var e;
    const t = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "st-editor"
    );
    t && (t.stopOnlineMode(), this._onlineState = this._createDisconnectedOnlineState());
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
    const e = this._onlineState ?? this._createDisconnectedOnlineState(), { setting: s, value: i } = t.detail;
    this._onlineState = {
      ...e,
      [s]: i
    };
  }
  async _toggleEntityBrowser() {
    !this._entityBrowserLoaded && !this._showEntityBrowser && (await import("./entity-browser-Cy2iDIVt.js"), this._entityBrowserLoaded = !0), this._showEntityBrowser = !this._showEntityBrowser;
  }
};
Ui(m, "styles", j`
    :host {
      display: block;
      height: 100%;
      background: var(--ui-bg, var(--primary-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      font-family: var(--font-ui, var(--paper-font-common-base_-_font-family));
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
      width: var(--sidebar-width-default, 320px);
      min-width: var(--sidebar-width-min, 240px);
      max-width: var(--sidebar-width-max, 400px);
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: var(--ui-bg-card, var(--card-background-color));
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
      padding: var(--space-2, 8px) var(--space-4, 16px);
      background: var(--ui-bg-header, var(--app-header-background-color));
      color: var(--ui-text-header, var(--app-header-text-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
    }
    .toolbar h1 {
      margin: 0;
      font-size: var(--font-size-2xl, 20px);
      font-weight: var(--font-weight-normal, 400);
      letter-spacing: -0.2px;
      font-family: var(--font-ui, inherit);
    }
    .toolbar-actions {
      display: flex;
      gap: var(--space-2, 8px);
      align-items: center;
    }
    .toolbar-button {
      padding: 6px var(--space-3, 12px);
      border: 1px solid color-mix(in srgb, var(--ui-text-header, #fff) 40%, transparent);
      border-radius: var(--radius-md, 4px);
      background: color-mix(in srgb, var(--ui-text-header, #fff) 15%, transparent);
      color: var(--ui-text-header, #fff);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-family: var(--font-ui, inherit);
      display: flex;
      align-items: center;
      gap: var(--space-1, 4px);
      transition: var(--transition-fast, background-color 0.2s ease);
    }
    .toolbar-button:hover {
      background: color-mix(in srgb, var(--ui-text-header, #fff) 25%, transparent);
    }
    .toolbar-button.active {
      background: color-mix(in srgb, var(--ui-text-header, #fff) 35%, transparent);
      border-color: color-mix(in srgb, var(--ui-text-header, #fff) 60%, transparent);
    }
    .toolbar-button:focus-visible {
      outline: 2px solid var(--ui-text-header, #fff);
      outline-offset: 2px;
    }
    .editor-container {
      flex: 1;
      overflow: hidden;
      padding: var(--space-4, 16px);
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--ui-bg-secondary, #e5e5e5) 32%, transparent),
        transparent 32%
      );
    }
    st-editor {
      height: 100%;
      border-radius: var(--radius-md, 4px);
      box-shadow: var(--shadow-popover, 0 4px 12px rgba(0, 0, 0, 0.2));
    }
    .status-bar {
      display: flex;
      gap: var(--space-4, 16px);
      padding: 6px var(--space-4, 16px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      flex-wrap: wrap;
      align-items: center;
      font-family: var(--font-ui, inherit);
    }
    .status-ok {
      color: var(--ui-success, var(--success-color, #4caf50));
    }
    .status-error {
      color: var(--ui-error, var(--error-color, #f44336));
    }
    .status-warning {
      color: var(--ui-warning, var(--warning-color, #ff9800));
    }
    .deploy-button {
      padding: var(--space-2, 8px) var(--space-4, 16px);
      border: none;
      border-radius: var(--radius-md, 4px);
      background: var(--ui-text-header, #fff);
      color: var(--ui-bg-header, #03a9f4);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-bold, 700);
      font-family: var(--font-ui, inherit);
    }
    .deploy-button:hover:not(:disabled) {
      opacity: 0.9;
    }
    .deploy-button:focus-visible {
      outline: 2px solid var(--ui-text-header, #fff);
      outline-offset: 2px;
    }
    .deploy-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .diagnostics-panel {
      max-height: 130px;
      overflow-y: auto;
      padding: 6px var(--space-4, 16px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      font-family: var(--font-mono, "Fira Code", "Consolas", "Courier New", monospace);
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
      padding: 0 var(--space-2, 8px);
      background: var(--ui-bg-card, var(--card-background-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      overflow-x: auto;
    }
    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: var(--ui-bg-card, var(--card-background-color));
      color: var(--ui-text-primary, var(--primary-text-color));
      cursor: pointer;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: var(--font-size-base, 13px);
      font-family: var(--font-ui, inherit);
      white-space: nowrap;
      transition: all 0.2s;
    }
    .tab:hover {
      background: color-mix(in srgb, var(--ui-primary, #03a9f4) 8%, var(--ui-bg-card, #fff));
    }
    .tab.active {
      background: var(--ui-bg, var(--primary-background-color));
      border-bottom-color: var(--ui-primary, var(--primary-color));
      color: var(--ui-text-primary, var(--primary-text-color));
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
      background: var(--ui-divider, var(--divider-color));
    }
    .unsaved-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--ui-warning, var(--warning-color, #ff9800));
    }
    .project-sidebar {
      width: 280px;
      min-width: 240px;
      max-width: 360px;
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: var(--ui-bg-card, var(--card-background-color));
    }
    .project-sidebar.hidden {
      display: none;
    }
  `);
f([
  S({ attribute: !1 })
], m.prototype, "hass", 2);
f([
  S({ type: Boolean })
], m.prototype, "narrow", 2);
f([
  v()
], m.prototype, "_code", 2);
f([
  v()
], m.prototype, "_project", 2);
f([
  v()
], m.prototype, "_syntaxOk", 2);
f([
  v()
], m.prototype, "_triggers", 2);
f([
  v()
], m.prototype, "_diagnostics", 2);
f([
  v()
], m.prototype, "_metadata", 2);
f([
  v()
], m.prototype, "_entityCount", 2);
f([
  v()
], m.prototype, "_onlineState", 2);
f([
  v()
], m.prototype, "_showEntityBrowser", 2);
f([
  v()
], m.prototype, "_showProjectExplorer", 2);
f([
  v()
], m.prototype, "_storage", 2);
m = f([
  W("st-panel")
], m);
const Ni = document.getElementById("st-ha-design-system");
if (!Ni) {
  const a = document.createElement("style");
  a.id = "st-ha-design-system", a.textContent = Ie, document.head.appendChild(a);
}
console.log("ST for Home Assistant loaded");
export {
  y as STEditor,
  Z as ST_BUILTINS,
  J as ST_FUNCTION_BLOCKS,
  X as ST_KEYWORDS,
  ke as ST_PRAGMAS,
  Q as ST_TYPES,
  Fe as stEditorTheme,
  Ve as stHighlightStyle,
  $e as stTheme,
  Pe as structuredText
};
//# sourceMappingURL=st-panel.js.map
