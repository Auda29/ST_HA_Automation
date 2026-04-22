var se = Object.defineProperty;
var ae = (a, t, e) => t in a ? se(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var l = (a, t, e) => ae(a, typeof t != "symbol" ? t + "" : t, e);
import { S as ne, c as re, L as oe, E as w, H as le, s as ce, a as X, b as de, D as k, W as he, C as pe, d as x, l as ue, h as ge, e as fe, f as me, g as be, i as ve, j as ye, k as Ee, m as Se, n as _e, o as xe, p as Le, q as Ce, r as Oe, t as Ue, u as Ne, v as we, w as Te, x as Re, y as Ae } from "./codemirror-C8x9REUs.js";
import { W as m } from "./vendor-BhPS5zVw.js";
import { i as z, n as _, a as Y, b as u, t as W, r as v } from "./lit-C178dhqO.js";
import { s as ke } from "./ha-websocket-DcUbagYv.js";
import { c as o, L as T, C as Me } from "./chevrotain-cBR36crC.js";
import { a as H } from "./analyzer-DbAWr__X.js";
const Be = ':root{--editor-bg: #1e1e1e;--editor-bg-light: #252526;--editor-fg: #d4d4d4;--editor-fg-dim: #808080;--editor-keyword: #569cd6;--editor-type: #4ec9b0;--editor-function: #dcdcaa;--editor-variable: #9cdcfe;--editor-string: #ce9178;--editor-number: #b5cea8;--editor-comment: #6a9955;--editor-pragma: #c586c0;--editor-operator: #d4d4d4;--editor-invalid: #ff0000;--editor-selection: #264f78;--editor-selection-bg: rgba(38, 79, 120, .5);--editor-line-highlight: #2a2d2e;--editor-gutter-bg: #1e1e1e;--editor-gutter-fg: #858585;--editor-border: #404040;--editor-cursor: #aeafad;--editor-tooltip-bg: #252526;--ui-primary: var(--primary-color, #18b7e6);--ui-primary-strong: #0d7fa6;--ui-primary-soft: rgba(24, 183, 230, .14);--ui-bg: #091119;--ui-bg-secondary: #0e1822;--ui-bg-card: #101c27;--ui-bg-card-strong: #132331;--ui-bg-header: #0c1a24;--ui-bg-inset: #0a141d;--ui-bg-elevated: #162633;--ui-text-primary: #edf6ff;--ui-text-secondary: #8ea6bd;--ui-text-muted: #668097;--ui-text-header: #f4fbff;--ui-text-on-primary: #07141d;--ui-divider: rgba(140, 169, 193, .18);--ui-divider-strong: rgba(140, 169, 193, .32);--ui-success: #4fd39e;--ui-error: #ff7272;--ui-warning: #ffbf47;--ui-info: #6bc9ff;--ui-disabled: #6c8194;--status-online: #4fd39e;--status-paused: #ffbf47;--status-connecting: #6bc9ff;--status-disconnected: #7e8f9f;--status-error: #ff7272;--font-mono: "Fira Code", "Consolas", "Courier New", monospace;--font-ui: "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;--font-size-xs: 11px;--font-size-sm: 12px;--font-size-base: 13px;--font-size-md: 14px;--font-size-lg: 16px;--font-size-xl: 18px;--font-size-2xl: 20px;--font-size-3xl: 26px;--font-size-editor: 14px;--font-size-diagnostics: 12px;--font-weight-normal: 400;--font-weight-medium: 500;--font-weight-semibold: 600;--font-weight-bold: 700;--space-1: 4px;--space-2: 8px;--space-3: 12px;--space-4: 16px;--space-5: 20px;--space-6: 24px;--space-8: 32px;--radius-sm: 6px;--radius-md: 10px;--radius-lg: 16px;--radius-xl: 20px;--radius-pill: 999px;--shadow-soft: 0 12px 30px rgba(0, 0, 0, .22);--shadow-popover: 0 16px 32px rgba(0, 0, 0, .28);--shadow-focus-ring: 0 0 0 3px rgba(24, 183, 230, .32);--shadow-header: inset 0 -1px 0 rgba(255, 255, 255, .04);--sidebar-width-min: 240px;--sidebar-width-default: 320px;--sidebar-width-max: 400px;--transition-fast: all .16s ease;--transition-medium: all .24s ease;--transition-slow: all .32s ease;--focus-ring: 2px solid rgba(91, 212, 255, .7);--focus-ring-offset: 2px}@media (prefers-reduced-motion: reduce){:root{--transition-fast: none;--transition-medium: none;--transition-slow: none}}.st-h1{margin:0;font-family:var(--font-ui);font-size:var(--font-size-3xl);font-weight:700;letter-spacing:-.03em;color:var(--ui-text-header)}.st-h2{margin:0;font-family:var(--font-ui);font-size:var(--font-size-xl);font-weight:600;color:var(--ui-text-primary)}.st-body{font-family:var(--font-ui);font-size:var(--font-size-md);color:var(--ui-text-primary)}.st-body-sm{font-family:var(--font-ui);font-size:var(--font-size-sm);color:var(--ui-text-secondary)}.st-mono{font-family:var(--font-mono);font-size:var(--font-size-diagnostics);color:var(--ui-text-primary)}.st-btn-primary,.st-btn-secondary,.st-btn-ghost{display:inline-flex;align-items:center;gap:var(--space-2);border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-ui);font-size:var(--font-size-md);font-weight:600;transition:var(--transition-medium)}.st-btn-primary{padding:10px 16px;border:1px solid transparent;background:linear-gradient(135deg,var(--ui-primary),#4ad7ff);color:var(--ui-text-on-primary);box-shadow:0 10px 20px #18b7e62e}.st-btn-secondary{padding:9px 14px;border:1px solid var(--ui-divider-strong);background:#ffffff0a;color:var(--ui-text-primary)}.st-btn-ghost{padding:8px 12px;border:1px solid transparent;background:transparent;color:var(--ui-text-secondary)}.st-btn-primary:hover,.st-btn-secondary:hover,.st-btn-ghost:hover{transform:translateY(-1px)}.st-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--ui-divider);border-radius:999px;background:#ffffff0a;color:var(--ui-text-secondary);font-family:var(--font-ui);font-size:var(--font-size-sm);line-height:1}.st-status-ok{color:var(--ui-success)}.st-status-error{color:var(--ui-error)}.st-status-warning{color:var(--ui-warning)}.st-status-info{color:var(--ui-info)}', Q = [
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
], Z = [
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
], J = [
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
], tt = [
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
], Ie = [
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
], q = ne.define({
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
      return Q.includes(e) ? "keyword" : Z.includes(e) ? "typeName" : J.includes(e) ? "function.standard" : tt.includes(e) ? "className" : "variableName";
    }
    return a.match(/[+\-*=<>()[\];:,.]/) ? "operator" : (a.next(), null);
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] }
  }
}), De = re([
  ...Q.map((a) => ({ label: a, type: "keyword" })),
  ...Z.map((a) => ({ label: a, type: "type" })),
  ...J.map((a) => ({ label: a, type: "function" })),
  ...tt.map((a) => ({ label: a, type: "class" })),
  ...Ie.map((a) => ({
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
  return new oe(q, [
    q.data.of({ autocomplete: De })
  ]);
}
const p = {
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
}, Fe = w.theme(
  {
    "&": {
      color: p.fg,
      backgroundColor: p.bg,
      fontSize: "14px",
      fontFamily: '"Fira Code", "Consolas", monospace'
    },
    ".cm-content": {
      caretColor: p.cursor
    },
    ".cm-cursor": {
      borderLeftColor: p.cursor,
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
      backgroundColor: p.lineHighlight
    },
    ".cm-gutters": {
      backgroundColor: p.gutterBg,
      color: p.gutterFg,
      border: "none",
      borderRight: `1px solid ${p.border}`
    },
    ".cm-activeLineGutter": {
      backgroundColor: p.lineHighlight,
      color: p.fg
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer"
    },
    ".cm-tooltip": {
      backgroundColor: p.bgLight,
      border: `1px solid ${p.border}`
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: p.selection
    }
  },
  { dark: !0 }
), $e = le.define([
  { tag: m.keyword, color: p.keyword, fontWeight: "bold" },
  { tag: m.typeName, color: p.type },
  {
    tag: [m.function(m.variableName), m.standard(m.function(m.variableName))],
    color: p.function
  },
  { tag: m.className, color: p.type },
  { tag: m.variableName, color: p.variable },
  { tag: m.propertyName, color: p.variable },
  { tag: m.string, color: p.string },
  { tag: m.number, color: p.number },
  { tag: m.comment, color: p.comment, fontStyle: "italic" },
  { tag: m.meta, color: p.pragma },
  { tag: m.operator, color: p.fg },
  { tag: m.invalid, color: "#ff0000", textDecoration: "underline wavy" }
]);
function je() {
  return [Fe, ce($e)];
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
      this.unsubscribe = ke(
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
      const n = this.entityStates.get(i.entityId);
      if (!n) continue;
      const r = this.parseValue(n.state, i.dataType), d = this.liveValues.get(s), c = {
        binding: i,
        currentValue: r,
        previousValue: d == null ? void 0 : d.currentValue,
        hasChanged: d ? d.currentValue.raw !== r.raw : !1,
        lastUpdate: e
      };
      this.liveValues.set(s, c);
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
class K {
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
const et = X.define();
X.define();
class ze extends he {
  constructor(t, e) {
    super(), this.value = t, this.showChange = e;
  }
  toDOM() {
    const t = document.createElement("span");
    t.className = "st-live-value-widget";
    const e = this.showChange ? K.formatWithChange(this.value) : K.format(this.value.currentValue), s = document.createElement("span");
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
const Ye = de.define({
  create() {
    return k.none;
  },
  update(a, t) {
    for (const e of t.effects)
      if (e.is(et))
        return We(t.state.doc.toString(), e.value);
    return t.docChanged && (a = a.map(t.changes)), a;
  },
  provide: (a) => w.decorations.from(a)
});
function We(a, t) {
  const e = [], s = a.split(`
`);
  let i = 0;
  for (let n = 0; n < s.length; n++) {
    const r = s[n], d = i + r.length;
    for (const [, c] of t)
      if (c.binding.line === n + 1) {
        const f = k.widget({
          widget: new ze(c, !0),
          side: 1
        });
        e.push({
          from: d,
          to: d,
          decoration: f
        });
      }
    i = d + 1;
  }
  return e.sort((n, r) => n.from - r.from), k.set(
    e.map((n) => n.decoration.range(n.from, n.to))
  );
}
const Ge = w.baseTheme({
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
  return [Ye, Ge];
}
function qe(a, t) {
  a.dispatch({
    effects: et.of(t)
  });
}
var it = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, Xe = (a, t, e) => t in a ? it(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, R = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Ke(t, e) : t, n = a.length - 1, r; n >= 0; n--)
    (r = a[n]) && (i = (s ? r(t, e, i) : r(i)) || i);
  return s && i && it(t, e, i), i;
}, Qe = (a, t, e) => Xe(a, t + "", e);
let S = class extends Y {
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
        x.readOnly.of(this.readOnly)
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
      fe(),
      me(),
      be(),
      ve(),
      x.allowMultipleSelections.of(!0),
      ye(),
      Ee(),
      Se(),
      _e(),
      xe(),
      Le(),
      Ce.of([
        ...Oe,
        ...Ue,
        ...Ne,
        ...we,
        ...Te,
        ...Re,
        Ae
      ]),
      Pe(),
      je(),
      He(),
      this._readOnlyCompartment.of(x.readOnly.of(this.readOnly)),
      x.tabSize.of(4)
    ];
    this._editor = new w({
      state: x.create({ doc: this.code, extensions: e }),
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
      const i = this._editor.state.selection.main, n = i.empty ? i.head : i.from;
      this._editor.dispatch({
        changes: { from: n, insert: e },
        selection: { anchor: n + e.length }
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
Qe(S, "styles", z`
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
R([
  _({ type: String })
], S.prototype, "code", 2);
R([
  _({ type: Boolean, attribute: "read-only" })
], S.prototype, "readOnly", 2);
R([
  _({ attribute: !1 })
], S.prototype, "hass", 2);
S = R([
  W("st-editor")
], S);
var st = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, Je = (a, t, e) => t in a ? st(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, G = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Ze(t, e) : t, n = a.length - 1, r; n >= 0; n--)
    (r = a[n]) && (i = (s ? r(t, e, i) : r(i)) || i);
  return s && i && st(t, e, i), i;
}, ti = (a, t, e) => Je(a, t + "", e);
let O = class extends Y {
  constructor() {
    super();
    l(this, "_handleDocumentClick", null);
    l(this, "_handleKeyDown", null);
    this._showSettings = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._handleDocumentClick = (t) => {
      if (!this._showSettings) return;
      t.composedPath().includes(this) || (this._showSettings = !1);
    }, this._handleKeyDown = (t) => {
      t.key === "Escape" && this._showSettings && (this._showSettings = !1);
    }, document.addEventListener("click", this._handleDocumentClick, !0), document.addEventListener("keydown", this._handleKeyDown);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._handleDocumentClick && (document.removeEventListener("click", this._handleDocumentClick, !0), this._handleDocumentClick = null), this._handleKeyDown && (document.removeEventListener("keydown", this._handleKeyDown), this._handleKeyDown = null);
  }
  get statusText() {
    var e;
    return {
      disconnected: "Offline",
      connecting: "Connecting",
      online: "Online",
      paused: "Paused",
      error: "Fault"
    }[((e = this.state) == null ? void 0 : e.status) || "disconnected"];
  }
  get isPaused() {
    var t;
    return ((t = this.state) == null ? void 0 : t.status) === "paused";
  }
  get canConnect() {
    var t;
    return ["disconnected", "error"].includes(
      ((t = this.state) == null ? void 0 : t.status) || "disconnected"
    );
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
        ${this.canConnect ? u`
              <button @click=${this._handleConnect}>
                <ha-icon icon="mdi:play"></ha-icon>
                Connect
              </button>
            ` : u`
              <button
                @click=${this._handleTogglePause}
                class="${this.isPaused ? "active" : ""}"
              >
                <ha-icon
                  icon=${this.isPaused ? "mdi:play-pause" : "mdi:pause"}
                ></ha-icon>
                ${this.isPaused ? "Resume" : "Pause"}
              </button>
              <button @click=${this._handleDisconnect}>
                <ha-icon icon="mdi:stop"></ha-icon>
                Stop
              </button>
            `}
      </div>

      <div class="spacer"></div>

      <div class="stats">
        <div class="stat">
          <ha-icon icon="mdi:variable"></ha-icon>
          ${((s = (e = this.state) == null ? void 0 : e.liveValues) == null ? void 0 : s.size) || 0} Variables
        </div>
        <div class="stat">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>
          ${((i = this.state) == null ? void 0 : i.updateRate) || 100}ms
        </div>
      </div>

      <div class="settings-shell">
        <button
          class="settings-toggle ${this._showSettings ? "open" : ""}"
          @click=${() => this._showSettings = !this._showSettings}
          title="Online settings"
          aria-label="Online settings"
          aria-haspopup="true"
          aria-expanded=${this._showSettings}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>
        ${this._showSettings ? this._renderSettings() : ""}
      </div>
    `;
  }
  _renderSettings() {
    var t, e, s, i, n, r;
    return u`
      <div class="settings-panel">
        <div class="settings-title">Online Settings</div>
        <div class="setting">
          <label for="highlight">Highlight changes</label>
          <input
            type="checkbox"
            id="highlight"
            .checked=${(t = this.state) == null ? void 0 : t.highlightChanges}
            @change=${this._handleHighlightChange}
          />
        </div>
        <div class="setting">
          <label for="conditions">Show conditions</label>
          <input
            type="checkbox"
            id="conditions"
            .checked=${(e = this.state) == null ? void 0 : e.showConditions}
            @change=${this._handleConditionsChange}
          />
        </div>
        <div class="setting">
          <label for="rate">Update rate</label>
          <select id="rate" @change=${this._handleRateChange}>
            <option value="50" ?selected=${((s = this.state) == null ? void 0 : s.updateRate) === 50}>
              50ms
            </option>
            <option value="100" ?selected=${((i = this.state) == null ? void 0 : i.updateRate) === 100}>
              100ms
            </option>
            <option value="250" ?selected=${((n = this.state) == null ? void 0 : n.updateRate) === 250}>
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
ti(O, "styles", z`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-3, 12px);
      padding: var(--space-3, 12px) var(--space-5, 20px);
      background:
        linear-gradient(180deg, rgba(14, 28, 35, 0.96), rgba(11, 17, 21, 0.96));
      border-bottom: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.3));
      font-family: var(--font-ui, inherit);
      position: relative;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 8px);
      padding: var(--space-2, 8px) var(--space-3, 12px);
      border: 1px solid var(--ui-divider, rgba(88, 127, 146, 0.2));
      border-radius: var(--radius-pill, 999px);
      background: rgba(19, 26, 32, 0.9);
      color: var(--ui-text-primary, #f3f7fb);
    }

    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.04);
    }

    .status-dot--online {
      background: var(--status-online, #42d6a4);
      box-shadow: 0 0 12px rgba(66, 214, 164, 0.45);
    }

    .status-dot--paused {
      background: var(--status-paused, #ffce73);
    }

    .status-dot--connecting {
      background: var(--status-connecting, #3aa0ff);
      animation: pulse 1.1s infinite;
    }

    .status-dot--disconnected {
      background: var(--status-disconnected, #6f7c87);
    }

    .status-dot--error {
      background: var(--status-error, #ff6b6b);
      box-shadow: 0 0 12px rgba(255, 107, 107, 0.35);
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.52;
        transform: scale(0.92);
      }
    }

    .status-text {
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-semibold, 600);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .controls {
      display: flex;
      gap: var(--space-2, 8px);
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 8px);
      min-height: 36px;
      padding: 0 var(--space-4, 16px);
      border: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.3));
      border-radius: var(--radius-md, 12px);
      background: rgba(25, 34, 42, 0.92);
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

    button:hover {
      background: rgba(34, 48, 58, 0.96);
      border-color: rgba(120, 173, 199, 0.44);
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }

    button:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }

    button.active {
      background: rgba(255, 206, 115, 0.18);
      border-color: rgba(255, 206, 115, 0.45);
      color: #ffdb97;
    }

    button.settings-toggle {
      min-width: 36px;
      justify-content: center;
      padding: 0;
    }

    button.settings-toggle.open {
      background: rgba(14, 165, 215, 0.18);
      border-color: rgba(91, 212, 255, 0.42);
      color: #dff7ff;
    }

    ha-icon {
      --mdc-icon-size: 16px;
    }

    .spacer {
      flex: 1;
    }

    .stats {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      flex-wrap: wrap;
    }

    .stat {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 34px;
      padding: 0 var(--space-3, 12px);
      border-radius: var(--radius-pill, 999px);
      background: rgba(15, 23, 29, 0.88);
      border: 1px solid rgba(88, 127, 146, 0.18);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .settings-shell {
      position: relative;
    }

    .settings-panel {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 240px;
      padding: var(--space-4, 16px);
      border: 1px solid var(--ui-divider-strong, rgba(88, 127, 146, 0.3));
      border-radius: var(--radius-xl, 18px);
      background:
        linear-gradient(180deg, rgba(22, 31, 38, 0.98), rgba(14, 20, 26, 0.98));
      box-shadow: var(--shadow-popover, 0 18px 42px rgba(0, 0, 0, 0.35));
      z-index: 100;
      animation: settings-pop 160ms ease;
    }

    @keyframes settings-pop {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .settings-panel {
        animation: none;
      }
    }

    .settings-title {
      margin: 0 0 var(--space-3, 12px);
      color: var(--ui-text-primary, #f3f7fb);
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .setting {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 12px);
      margin-bottom: var(--space-3, 12px);
      color: var(--ui-text-secondary, #b6c4cf);
      font-size: var(--font-size-sm, 12px);
    }

    .setting:last-child {
      margin-bottom: 0;
    }

    .setting input,
    .setting select {
      accent-color: var(--ui-primary, #0ea5d7);
      background: rgba(9, 14, 18, 0.92);
      color: var(--ui-text-primary, #f3f7fb);
      border: 1px solid rgba(88, 127, 146, 0.3);
      border-radius: var(--radius-sm, 8px);
      padding: 6px 8px;
    }
  `);
G([
  _({ type: Object })
], O.prototype, "state", 2);
G([
  v()
], O.prototype, "_showSettings", 2);
O = G([
  W("st-online-toolbar")
], O);
const h = (a, t) => o({ name: a, pattern: new RegExp(`\\b${t}\\b`, "i") }), ei = o({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: T.SKIPPED
}), ii = o({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: T.SKIPPED
}), si = o({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: T.SKIPPED
}), at = o({
  name: "Pragma",
  pattern: /\{[^}]+\}/
}), nt = o({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: void 0
}), ai = o({
  name: "EndFunction",
  pattern: /END_FUNCTION/i
}), ni = o({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i
}), ri = o({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i
}), rt = o({ name: "EndVar", pattern: /END_VAR/i }), ot = o({
  name: "VarInput",
  pattern: /VAR_INPUT/i
}), lt = o({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i
}), ct = o({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i
}), dt = o({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i
}), ht = o({ name: "EndIf", pattern: /END_IF/i }), pt = o({ name: "EndCase", pattern: /END_CASE/i }), ut = o({ name: "EndFor", pattern: /END_FOR/i }), gt = o({
  name: "EndWhile",
  pattern: /END_WHILE/i
}), ft = o({
  name: "EndRepeat",
  pattern: /END_REPEAT/i
}), mt = h("Program", "PROGRAM"), oi = h("Function", "FUNCTION"), bt = h("Var", "VAR"), li = h("Constant", "CONSTANT"), vt = h("If", "IF"), M = h("Then", "THEN"), yt = h("Elsif", "ELSIF"), B = h("Else", "ELSE"), Et = h("Case", "CASE"), St = h("Of", "OF"), _t = h("For", "FOR"), xt = h("To", "TO"), Lt = h("By", "BY"), I = h("Do", "DO"), Ct = h("While", "WHILE"), Ot = h("Repeat", "REPEAT"), Ut = h("Until", "UNTIL"), Nt = h("Return", "RETURN"), wt = h("Exit", "EXIT"), ci = h("Continue", "CONTINUE"), D = h("At", "AT"), Tt = h("And", "AND"), Rt = h("Or", "OR"), di = h("Xor", "XOR"), At = h("Not", "NOT"), kt = h("Mod", "MOD"), Mt = h("True", "TRUE"), Bt = h("False", "FALSE"), It = h("TypeBool", "BOOL"), Dt = o({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i
}), Pt = o({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i
}), Ft = o({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i
}), $t = o({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i
}), hi = o({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i
}), jt = o({
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
}), Vt = o({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/
}), zt = o({
  name: "IntegerLiteral",
  pattern: /\d+/
}), Yt = o({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/
}), P = o({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i
}), L = o({ name: "Assign", pattern: /:=/ }), fi = o({ name: "Output", pattern: /=>/ }), Wt = o({ name: "LessEqual", pattern: /<=/ }), Gt = o({
  name: "GreaterEqual",
  pattern: />=/
}), Ht = o({ name: "NotEqual", pattern: /<>/ }), qt = o({ name: "Less", pattern: /</ }), Kt = o({ name: "Greater", pattern: />/ }), Xt = o({ name: "Equal", pattern: /=/ }), Qt = o({ name: "Plus", pattern: /\+/ }), F = o({ name: "Minus", pattern: /-/ }), Zt = o({ name: "Star", pattern: /\*/ }), Jt = o({ name: "Slash", pattern: /\// }), U = o({ name: "LParen", pattern: /\(/ }), N = o({ name: "RParen", pattern: /\)/ }), mi = o({ name: "LBracket", pattern: /\[/ }), bi = o({ name: "RBracket", pattern: /\]/ }), $ = o({ name: "Colon", pattern: /:/ }), E = o({ name: "Semicolon", pattern: /;/ }), j = o({ name: "Comma", pattern: /,/ }), V = o({ name: "Dot", pattern: /\./ }), te = o({ name: "Range", pattern: /\.\./ }), y = o({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}), ee = [
  // Skipped
  ei,
  ii,
  si,
  // Pragmas
  at,
  // Multi-word keywords first
  ni,
  ri,
  ai,
  nt,
  ot,
  lt,
  ct,
  dt,
  rt,
  ht,
  pt,
  ut,
  gt,
  ft,
  // Keywords
  mt,
  oi,
  bt,
  li,
  vt,
  M,
  yt,
  B,
  Et,
  St,
  _t,
  xt,
  Lt,
  I,
  Ct,
  Ot,
  Ut,
  Nt,
  wt,
  ci,
  D,
  // Logical
  Tt,
  Rt,
  di,
  At,
  kt,
  Mt,
  Bt,
  // Types
  It,
  Dt,
  Pt,
  Ft,
  $t,
  hi,
  // Literals (order: specific before general)
  jt,
  pi,
  ui,
  gi,
  Vt,
  zt,
  Yt,
  // I/O
  P,
  // Multi-char operators
  L,
  fi,
  te,
  Wt,
  Gt,
  Ht,
  // Single-char operators
  qt,
  Kt,
  Xt,
  Qt,
  F,
  Zt,
  Jt,
  U,
  N,
  mi,
  bi,
  $,
  E,
  j,
  V,
  // Identifier last
  y
], vi = new T(ee, {
  ensureOptimizations: !0,
  positionTracking: "full"
  // For error reporting
});
function yi(a) {
  const t = vi.tokenize(a);
  return {
    tokens: t.tokens,
    errors: t.errors
  };
}
class Ei extends Me {
  constructor() {
    super(ee, {
      recoveryEnabled: !0,
      nodeLocationTracking: "full"
    });
    // Program structure
    l(this, "program", this.RULE("program", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(mt), this.CONSUME(y, { LABEL: "programName" }), this.MANY1(() => this.SUBRULE(this.variableBlock)), this.MANY2(() => this.SUBRULE(this.statement)), this.CONSUME(nt);
    }));
    // Variable declarations
    l(this, "variableBlock", this.RULE("variableBlock", () => {
      this.OR([
        { ALT: () => this.CONSUME(bt) },
        { ALT: () => this.CONSUME(ot) },
        { ALT: () => this.CONSUME(lt) },
        { ALT: () => this.CONSUME(ct) },
        { ALT: () => this.CONSUME(dt) }
      ]), this.MANY(() => this.SUBRULE(this.variableDeclaration)), this.CONSUME(rt);
    }));
    l(this, "variableDeclaration", this.RULE("variableDeclaration", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(y, { LABEL: "varName" }), this.OPTION(() => {
        this.CONSUME(D), this.CONSUME(P);
      }), this.OPTION1(() => {
        this.CONSUME($), this.SUBRULE(this.typeSpec);
      }), this.OPTION2(() => {
        this.CONSUME(L), this.SUBRULE(this.expression);
      }), this.OPTION3(() => {
        this.CONSUME1(D), this.CONSUME1(P);
      }), this.CONSUME(E);
    }));
    l(this, "pragma", this.RULE("pragma", () => {
      this.CONSUME(at);
    }));
    l(this, "typeSpec", this.RULE("typeSpec", () => {
      this.OR([
        { ALT: () => this.CONSUME(It) },
        { ALT: () => this.CONSUME(Dt) },
        { ALT: () => this.CONSUME(Pt) },
        { ALT: () => this.CONSUME(Ft) },
        { ALT: () => this.CONSUME($t) },
        { ALT: () => this.CONSUME(y) }
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
      this.SUBRULE(this.variableReference), this.CONSUME(L), this.SUBRULE(this.expression), this.CONSUME(E);
    }));
    l(this, "ifStatement", this.RULE("ifStatement", () => {
      this.CONSUME(vt), this.SUBRULE(this.expression, { LABEL: "condition" }), this.CONSUME(M), this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" })), this.MANY1(() => {
        this.CONSUME(yt), this.SUBRULE1(this.expression, { LABEL: "elsifCondition" }), this.CONSUME1(M), this.MANY2(
          () => this.SUBRULE1(this.statement, { LABEL: "elsifStatements" })
        );
      }), this.OPTION(() => {
        this.CONSUME(B), this.MANY3(
          () => this.SUBRULE2(this.statement, { LABEL: "elseStatements" })
        );
      }), this.CONSUME(ht);
    }));
    l(this, "caseStatement", this.RULE("caseStatement", () => {
      this.CONSUME(Et), this.SUBRULE(this.expression, { LABEL: "selector" }), this.CONSUME(St), this.MANY(() => this.SUBRULE(this.caseClause)), this.OPTION(() => {
        this.CONSUME(B), this.MANY1(() => this.SUBRULE(this.statement));
      }), this.CONSUME(pt);
    }));
    l(this, "caseClause", this.RULE("caseClause", () => {
      this.SUBRULE(this.caseLabelList), this.CONSUME($), this.MANY(() => this.SUBRULE(this.statement));
    }));
    l(this, "caseLabelList", this.RULE("caseLabelList", () => {
      this.SUBRULE(this.caseLabel), this.MANY(() => {
        this.CONSUME(j), this.SUBRULE1(this.caseLabel);
      });
    }));
    l(this, "caseLabel", this.RULE("caseLabel", () => {
      this.SUBRULE(this.expression), this.OPTION(() => {
        this.CONSUME(te), this.SUBRULE1(this.expression);
      });
    }));
    l(this, "forStatement", this.RULE("forStatement", () => {
      this.CONSUME(_t), this.CONSUME(y, { LABEL: "controlVar" }), this.CONSUME(L), this.SUBRULE(this.expression, { LABEL: "start" }), this.CONSUME(xt), this.SUBRULE1(this.expression, { LABEL: "end" }), this.OPTION(() => {
        this.CONSUME(Lt), this.SUBRULE2(this.expression, { LABEL: "step" });
      }), this.CONSUME(I), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(ut);
    }));
    l(this, "whileStatement", this.RULE("whileStatement", () => {
      this.CONSUME(Ct), this.SUBRULE(this.expression), this.CONSUME(I), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(gt);
    }));
    l(this, "repeatStatement", this.RULE("repeatStatement", () => {
      this.CONSUME(Ot), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(Ut), this.SUBRULE(this.expression), this.CONSUME(ft);
    }));
    l(this, "returnStatement", this.RULE("returnStatement", () => {
      this.CONSUME(Nt), this.CONSUME(E);
    }));
    l(this, "exitStatement", this.RULE("exitStatement", () => {
      this.CONSUME(wt), this.CONSUME(E);
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
        this.CONSUME(Rt), this.SUBRULE1(this.andExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "andExpression", this.RULE("andExpression", () => {
      this.SUBRULE(this.comparisonExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(Tt), this.SUBRULE1(this.comparisonExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "comparisonExpression", this.RULE("comparisonExpression", () => {
      this.SUBRULE(this.additiveExpression, { LABEL: "lhs" }), this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(Xt) },
          { ALT: () => this.CONSUME(Ht) },
          { ALT: () => this.CONSUME(qt) },
          { ALT: () => this.CONSUME(Wt) },
          { ALT: () => this.CONSUME(Kt) },
          { ALT: () => this.CONSUME(Gt) }
        ]), this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "additiveExpression", this.RULE("additiveExpression", () => {
      this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Qt) },
          { ALT: () => this.CONSUME(F) }
        ]), this.SUBRULE1(this.multiplicativeExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "multiplicativeExpression", this.RULE(
      "multiplicativeExpression",
      () => {
        this.SUBRULE(this.unaryExpression, { LABEL: "lhs" }), this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(Zt) },
            { ALT: () => this.CONSUME(Jt) },
            { ALT: () => this.CONSUME(kt) }
          ]), this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
        });
      }
    ));
    l(this, "unaryExpression", this.RULE("unaryExpression", () => {
      this.OR([
        {
          ALT: () => {
            this.OR1([
              { ALT: () => this.CONSUME(At) },
              { ALT: () => this.CONSUME(F) }
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
      this.CONSUME(y), this.MANY(() => {
        this.CONSUME(V), this.CONSUME1(y);
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
        { ALT: () => this.CONSUME(zt) },
        { ALT: () => this.CONSUME(Vt) },
        { ALT: () => this.CONSUME(Yt) },
        { ALT: () => this.CONSUME(jt) }
      ]);
    }));
    l(this, "variableReference", this.RULE("variableReference", () => {
      this.CONSUME(y), this.MANY(() => {
        this.CONSUME(V), this.CONSUME1(y);
      });
    }));
    l(this, "functionCall", this.RULE("functionCall", () => {
      this.CONSUME(y), this.CONSUME(U), this.OPTION(() => {
        this.SUBRULE(this.argumentList);
      }), this.CONSUME(N);
    }));
    l(this, "argumentList", this.RULE("argumentList", () => {
      this.SUBRULE(this.argument), this.MANY(() => {
        this.CONSUME(j), this.SUBRULE1(this.argument);
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
        this.CONSUME(y, { LABEL: "argName" }), this.CONSUME(L);
      }), this.SUBRULE(this.expression, { LABEL: "argValue" });
    }));
    this.performSelfAnalysis();
  }
}
const C = new Ei(), Si = C.getBaseCstVisitorConstructor();
class _i extends Si {
  constructor() {
    super(), this.validateVisitor();
  }
  // Program
  program(t) {
    const e = t.pragma ? t.pragma.map((r) => this.visit(r)) : [], s = t.programName[0].image, i = t.variableBlock ? t.variableBlock.flatMap((r) => this.visit(r)) : [], n = t.statement ? t.statement.map((r) => this.visit(r)) : [];
    return {
      type: "Program",
      name: s,
      pragmas: e,
      variables: i,
      body: n,
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
    const e = t.pragma ? t.pragma.map((d) => this.visit(d)) : [], s = t.varName[0].image, i = t.typeSpec ? this.visit(t.typeSpec[0]) : this.createDataType("UNKNOWN"), n = t.expression ? this.visit(t.expression[0]) : void 0;
    let r;
    return t.IoAddress && (r = this.parseIoAddress(t.IoAddress[0].image), n && n.type === "Literal" && n.kind === "string" && (r.entityId = n.value)), {
      type: "VariableDeclaration",
      name: s,
      dataType: i,
      section: "VAR",
      // Will be set by variableBlock
      pragmas: e,
      constant: !1,
      initialValue: n,
      binding: r,
      location: this.getLocation(t)
    };
  }
  pragma(t) {
    const s = t.Pragma[0].image.slice(1, -1).trim(), i = s.indexOf(":");
    let n, r;
    return i > 0 ? (n = s.substring(0, i).trim(), r = s.substring(i + 1).trim()) : n = s, {
      type: "Pragma",
      name: n,
      value: r,
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
    const e = this.visit(t.condition[0]), s = t.thenStatements ? t.thenStatements.map((r) => this.visit(r)) : [], i = t.elsifCondition ? t.elsifCondition.map((r, d) => {
      const c = t.elsifStatements && t.elsifStatements[d] ? this.visit(t.elsifStatements[d]) : [];
      return {
        condition: this.visit(r),
        body: Array.isArray(c) ? c : [c]
      };
    }) : [], n = t.elseStatements ? t.elseStatements.map((r) => this.visit(r)) : void 0;
    return {
      type: "IfStatement",
      condition: e,
      thenBranch: s,
      elsifBranches: i,
      elseBranch: n,
      location: this.getLocation(t)
    };
  }
  caseStatement(t) {
    const e = this.visit(t.selector[0]), s = t.caseClause ? t.caseClause.map((n) => this.visit(n)) : [], i = t.statement ? t.statement.map((n) => this.visit(n)) : void 0;
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
    const s = [...t.Plus || [], ...t.Minus || []].sort((i, n) => i.startOffset - n.startOffset).map((i) => i.image);
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
    ].sort((i, n) => i.startOffset - n.startOffset).map((i) => i.image);
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
const xi = new _i();
function A(a) {
  const t = [], e = yi(a);
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
  C.input = e.tokens;
  const s = C.program();
  if (C.errors.length > 0)
    return C.errors.forEach((i) => {
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
      ast: xi.visit(s),
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
var ie = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, Ci = (a, t, e) => t in a ? ie(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, b = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Li(t, e) : t, n = a.length - 1, r; n >= 0; n--)
    (r = a[n]) && (i = (s ? r(t, e, i) : r(i)) || i);
  return s && i && ie(t, e, i), i;
}, Oi = (a, t, e) => Ci(a, t + "", e);
let g = class extends Y {
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

END_PROGRAM`, this._syntaxOk = !0, this._triggers = [], this._diagnostics = [], this._metadata = null, this._entityCount = 0, this._onlineState = this._createDisconnectedOnlineState(), this._isDeploying = !1;
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
    const { ProjectStorage: t } = await import("./project-DHa4EBeG.js");
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
    var n, r, d;
    const t = this._diagnostics.filter(
      (c) => c.severity === "Error"
    ).length, e = this._diagnostics.filter(
      (c) => c.severity === "Warning"
    ).length, s = !this._syntaxOk || this._isDeploying, i = this._syntaxOk ? this._isDeploying ? "Deploy in progress" : "Deploy to Home Assistant" : "Fix syntax errors before deploying";
    return u`
      <div class="container">
        <div class="toolbar" role="banner">
          <div class="toolbar-brand">
            <div class="toolbar-kicker">Structured Text Runtime</div>
            <h1 class="st-h1">ST for Home Assistant</h1>
            <div class="toolbar-subtitle">
              Engineer automations, bind entities, and deploy from one control
              surface.
            </div>
          </div>
          <div class="toolbar-actions" role="toolbar" aria-label="Panel actions">
            <button
              class="toolbar-button ${this._showProjectExplorer ? "active" : ""}"
              @click=${this._toggleProjectExplorer}
              title="Toggle Project Explorer"
              aria-pressed=${this._showProjectExplorer}
              aria-label="Toggle project explorer"
            >
              <ha-icon class="toolbar-icon" icon="mdi:folder-multiple"></ha-icon>
              Project
            </button>
            <button
              class="toolbar-button ${this._showEntityBrowser ? "active" : ""}"
              @click=${this._toggleEntityBrowser}
              title="Toggle Entity Browser"
              aria-pressed=${this._showEntityBrowser}
              aria-label="Toggle entity browser"
            >
              <ha-icon
                class="toolbar-icon"
                icon="mdi:transmission-tower"
              ></ha-icon>
              Entities
            </button>
            <button
              class="deploy-button ${this._isDeploying ? "deploying" : ""}"
              @click=${this._handleDeploy}
              ?disabled=${s}
              title=${i}
              aria-label=${i}
            >
              <ha-icon
                icon=${this._isDeploying ? "mdi:progress-upload" : "mdi:rocket-launch"}
              ></ha-icon>
              <span class="deploy-label">${this._isDeploying ? "Deploying" : "Deploy"}</span>
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
                  <div class="tabs-container" role="tablist">
                    ${this._getOpenFiles().map(
      (c) => u`
                        <button
                          class="tab ${c.id === this._project.activeFileId ? "active" : ""}"
                          @click=${() => this._switchToFile(c.id)}
                          @auxclick=${(f) => {
        f.button === 1 && (f.preventDefault(), this._closeFile(c.id));
      }}
                          title=${c.path}
                          role="tab"
                          aria-selected=${c.id === this._project.activeFileId}
                        >
                          <span class="tab-label">${c.name}</span>
                          ${c.hasUnsavedChanges ? u`<div
                                class="unsaved-dot"
                                title="Unsaved changes"
                                aria-label="Unsaved changes"
                              ></div>` : ""}
                          <div
                            class="tab-close"
                            @click=${(f) => {
        f.stopPropagation(), this._closeFile(c.id);
      }}
                            title="Close (middle-click also works)"
                            role="button"
                            aria-label="Close ${c.name}"
                          >
                            <ha-icon icon="mdi:close"></ha-icon>
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
              <div
                class="diagnostics-panel"
                role="log"
                aria-label="Diagnostics"
                aria-live="polite"
              >
                <div class="diagnostics-header">
                  <ha-icon icon="mdi:message-alert-outline"></ha-icon>
                  <span>Diagnostics (${this._diagnostics.length})</span>
                </div>
                ${this._diagnostics.map(
      (c) => u`
                    <div
                      class="diagnostic diagnostic-${c.severity.toLowerCase()}"
                    >
                      <ha-icon
                        class="diagnostic-icon"
                        icon=${this._getDiagnosticIcon(c.severity)}
                      ></ha-icon>
                      <span class="diagnostic-location">
                        ${c.line ? `Ln ${c.line}, Col ${c.column || 0}` : ""}
                      </span>
                      <span class="diagnostic-message">
                        ${c.code ? u`<span class="diagnostic-code">${c.code}</span>` : ""}${c.message}
                      </span>
                    </div>
                  `
    )}
              </div>
            ` : ""}
        <div class="status-bar" role="status" aria-live="polite">
          ${this._syntaxOk ? u`<span class="syntax-chip status-ok" aria-label="Syntax OK"
                >Syntax OK</span
              >` : u`<span class="syntax-chip status-error" aria-label="Syntax Error"
                >Syntax Error</span
              >`}
          ${t > 0 ? u`<span
                class="status-pill status-error"
                title="${t} error${t === 1 ? "" : "s"}"
              >
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                ${t} Error${t === 1 ? "" : "s"}
              </span>` : ""}
          ${e > 0 ? u`<span
                class="status-pill status-warning"
                title="${e} warning${e === 1 ? "" : "s"}"
              >
                <ha-icon icon="mdi:alert"></ha-icon>
                ${e} Warning${e === 1 ? "" : "s"}
              </span>` : ""}
          <span class="status-pill" title="Number of triggers">
            <ha-icon icon="mdi:flash"></ha-icon>
            Triggers: ${this._triggers.length}
          </span>
          <span class="status-pill" title="Bound entities">
            <ha-icon icon="mdi:link-variant"></ha-icon>
            Entities: ${this._entityCount}
          </span>
          ${(n = this._metadata) != null && n.mode ? u`<span class="status-pill" title="Execution mode">
                <ha-icon icon="mdi:cog-outline"></ha-icon>
                Mode: ${this._metadata.mode}
              </span>` : ""}
          ${(r = this._metadata) != null && r.hasPersistentVars ? u`<span class="status-pill status-accent" title="Persistent variables">
                <ha-icon icon="mdi:database-outline"></ha-icon>
                Persistent
              </span>` : ""}
          ${(d = this._metadata) != null && d.hasTimers ? u`<span class="status-pill status-accent" title="Timers used">
                <ha-icon icon="mdi:timer-outline"></ha-icon>
                Timers
              </span>` : ""}
        </div>
      </div>
    `;
  }
  _getDiagnosticIcon(t) {
    switch (t) {
      case "Error":
        return "mdi:alert-circle";
      case "Warning":
        return "mdi:alert";
      case "Info":
        return "mdi:information";
      case "Hint":
        return "mdi:lightbulb-outline";
      default:
        return "mdi:information-outline";
    }
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
    const e = this._project.files.find((n) => n.id === t);
    if (!e) return;
    const s = (i = this.shadowRoot) == null ? void 0 : i.querySelector(
      "st-editor"
    );
    if (s && this._project.activeFileId) {
      const n = this._project.files.find(
        (r) => r.id === this._project.activeFileId
      );
      if (n) {
        const r = s.getCode();
        r !== n.content && (n.content = r, n.hasUnsavedChanges = !0, n.lastModified = Date.now());
      }
    }
    this._project.activeFileId = t, this._project.files.forEach((n) => {
      n.isOpen = n.id === t || n.isOpen;
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
    const i = this._project.files.find((n) => n.id === e);
    i && (i.name = s, i.path = s, i.lastModified = Date.now(), this._project.lastModified = Date.now(), this._saveProject());
  }
  _handleFileDeleted(t) {
    var r, d;
    const { fileId: e } = t.detail;
    if (!this._project) return;
    const s = this._project.files.filter((c) => c.id !== e);
    let i = this._project.activeFileId;
    if (i === e) {
      const c = s.find((f) => f.isOpen);
      i = (c == null ? void 0 : c.id) ?? ((r = s[0]) == null ? void 0 : r.id) ?? null;
    }
    this._project = {
      ...this._project,
      files: s,
      activeFileId: i,
      lastModified: Date.now()
    };
    const n = (d = this.shadowRoot) == null ? void 0 : d.querySelector(
      "st-editor"
    );
    if (n && i) {
      const c = this._project.files.find((f) => f.id === i);
      c && n.setCode(c.content);
    }
    this._saveProject(), this._analyzeCode(), this.requestUpdate();
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
    !this._projectExplorerLoaded && !this._showProjectExplorer && (await import("./project-DHa4EBeG.js"), this._projectExplorerLoaded = !0), this._showProjectExplorer = !this._showProjectExplorer;
  }
  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  _analyzeCode() {
    var i, n;
    const t = [], e = this._getCurrentCode(), s = A(e);
    if (s.errors.length > 0)
      for (const r of s.errors)
        t.push({
          severity: "Error",
          message: r.message,
          line: r.line,
          column: r.column
        });
    if (this._syntaxOk = s.success && s.ast !== void 0, s.success && s.ast) {
      const r = H(s.ast);
      for (const d of r.diagnostics)
        t.push({
          severity: d.severity,
          code: d.code,
          message: d.message,
          line: (i = d.location) == null ? void 0 : i.line,
          column: (n = d.location) == null ? void 0 : n.column
        });
      this._triggers = r.triggers, this._metadata = r.metadata, this._entityCount = r.dependencies.length;
    } else
      this._triggers = [], this._metadata = null, this._entityCount = 0;
    this._diagnostics = t;
  }
  async _handleDeploy() {
    var e;
    if (this._isDeploying) return;
    if (!this._syntaxOk) {
      console.error("Cannot deploy: syntax errors present");
      return;
    }
    if (!((e = this.hass) != null && e.connection)) {
      console.error(
        "Cannot deploy: Home Assistant connection is not available"
      );
      return;
    }
    const t = A(this._getCurrentCode());
    if (!t.success || !t.ast) {
      console.error("Cannot deploy: parsing failed");
      return;
    }
    this._isDeploying = !0;
    try {
      const [{ transpile: s }, { deploy: i, HAApiClient: n }] = await Promise.all([
        import("./transpiler-deploy-BqpcyTqr.js").then((f) => f.i),
        import("./transpiler-deploy-BqpcyTqr.js").then((f) => f.a)
      ]), r = s(t.ast, "home");
      if (r.diagnostics.some((f) => f.severity === "Error")) {
        console.error(
          "Cannot deploy: transpiler reported errors",
          r.diagnostics
        );
        return;
      }
      const d = new n(this.hass.connection), c = await i(d, r, {
        createBackup: !0
      });
      c.success ? console.log("Deploy successful", c.transactionId) : console.error("Deploy failed", c.errors);
    } catch (s) {
      console.error("Deploy error", s);
    } finally {
      this._isDeploying = !1;
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
    var n, r;
    if (!this._syntaxOk || !((n = this.hass) != null && n.connection))
      return;
    const t = A(this._getCurrentCode());
    if (!t.success || !t.ast)
      return;
    const e = H(t.ast), s = this._extractBindings(e.dependencies), i = (r = this.shadowRoot) == null ? void 0 : r.querySelector(
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
    !this._entityBrowserLoaded && !this._showEntityBrowser && (await import("./entity-browser-DSclhqiT.js"), this._entityBrowserLoaded = !0), this._showEntityBrowser = !this._showEntityBrowser;
  }
};
Oi(g, "styles", z`
    :host {
      display: block;
      height: 100%;
      background:
        radial-gradient(circle at top left, rgba(24, 183, 230, 0.12), transparent 28%),
        radial-gradient(circle at bottom right, rgba(14, 127, 166, 0.08), transparent 36%),
        linear-gradient(180deg, #081018, #091119 26%, #070d13 100%);
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
      min-height: 0;
    }
    .sidebar {
      width: var(--sidebar-width-default, 320px);
      min-width: var(--sidebar-width-min, 240px);
      max-width: var(--sidebar-width-max, 400px);
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%),
        var(--ui-bg-card, var(--card-background-color));
      overflow: hidden;
      box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.03);
    }
    .sidebar.hidden {
      display: none;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4, 16px);
      padding: 18px 20px 14px;
      background:
        linear-gradient(135deg, rgba(24, 183, 230, 0.16), transparent 28%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent),
        var(--ui-bg-header, var(--app-header-background-color));
      color: var(--ui-text-header, var(--app-header-text-color));
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      box-shadow: var(--shadow-header);
      flex-wrap: wrap;
    }
    .toolbar-brand {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .toolbar-kicker {
      font-size: var(--font-size-xs, 11px);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(237, 246, 255, 0.58);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-kicker::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4ad7ff, var(--ui-primary, #18b7e6));
      box-shadow: 0 0 10px rgba(74, 215, 255, 0.6);
    }
    .toolbar h1 {
      margin: 0;
      font-size: var(--font-size-3xl, 26px);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: -0.04em;
      font-family: var(--font-ui, inherit);
    }
    .toolbar-subtitle {
      font-size: var(--font-size-sm, 12px);
      color: rgba(237, 246, 255, 0.7);
      max-width: 56ch;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .toolbar-button {
      padding: 10px 14px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: var(--radius-md, 10px);
      background: rgba(255, 255, 255, 0.06);
      color: var(--ui-text-header, #fff);
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-semibold, 600);
      font-family: var(--font-ui, inherit);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(10px);
      transition: var(--transition-fast, all 160ms ease);
    }
    .toolbar-button:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.22);
      transform: translateY(-1px);
    }
    .toolbar-button:active {
      transform: translateY(0);
    }
    .toolbar-button.active {
      background: linear-gradient(135deg, var(--ui-primary-soft), rgba(24, 183, 230, 0.22));
      border-color: rgba(91, 212, 255, 0.48);
      color: #f6fdff;
      box-shadow: inset 0 0 0 1px rgba(91, 212, 255, 0.2),
        0 6px 18px rgba(24, 183, 230, 0.12);
    }
    .toolbar-button:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }
    .editor-container {
      flex: 1;
      overflow: hidden;
      padding: 18px;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.03),
        transparent 24%
      );
      min-height: 0;
    }
    st-editor {
      height: 100%;
      border-radius: var(--radius-lg, 16px);
      box-shadow: var(--shadow-popover, 0 4px 12px rgba(0, 0, 0, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.04);
      overflow: hidden;
    }
    .status-bar {
      display: flex;
      gap: 10px;
      padding: 10px 16px 12px;
      background: rgba(8, 14, 20, 0.88);
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      flex-wrap: wrap;
      align-items: center;
      font-family: var(--font-ui, inherit);
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: var(--radius-pill, 999px);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--ui-text-secondary);
      line-height: 1;
      font-weight: var(--font-weight-medium, 500);
    }
    .status-pill ha-icon {
      --mdc-icon-size: 14px;
      color: var(--ui-text-muted, #8ea1af);
    }
    .status-pill.status-accent {
      border-color: rgba(91, 212, 255, 0.22);
      background: rgba(24, 183, 230, 0.1);
      color: var(--ui-text-primary, #f3f7fb);
    }
    .status-pill.status-accent ha-icon {
      color: var(--ui-info, #6bc9ff);
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
    .syntax-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: var(--radius-pill, 999px);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      font-weight: var(--font-weight-semibold, 600);
      line-height: 1;
    }
    .syntax-chip::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 10px currentColor;
      opacity: 0.9;
    }
    .syntax-chip.status-ok {
      background: rgba(79, 211, 158, 0.1);
      border-color: rgba(79, 211, 158, 0.24);
    }
    .syntax-chip.status-error {
      background: rgba(255, 114, 114, 0.1);
      border-color: rgba(255, 114, 114, 0.28);
    }
    .deploy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 18px;
      border: 1px solid transparent;
      border-radius: var(--radius-md, 10px);
      background: linear-gradient(135deg, #eafaff, #c9f3ff);
      color: #08141b;
      cursor: pointer;
      font-size: var(--font-size-md, 14px);
      font-weight: var(--font-weight-bold, 700);
      font-family: var(--font-ui, inherit);
      letter-spacing: 0.02em;
      box-shadow: 0 10px 22px rgba(24, 183, 230, 0.18);
      transition: var(--transition-fast, all 160ms ease);
    }
    .deploy-button ha-icon {
      --mdc-icon-size: 16px;
    }
    .deploy-button:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.05);
      box-shadow: 0 14px 28px rgba(24, 183, 230, 0.28);
    }
    .deploy-button:active:not(:disabled) {
      transform: translateY(0);
    }
    .deploy-button:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: var(--focus-ring-offset, 2px);
    }
    .deploy-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
    .deploy-button.deploying {
      pointer-events: none;
    }
    .deploy-button.deploying .deploy-label::after {
      content: "…";
      display: inline-block;
      animation: deploy-dots 1.2s infinite;
    }
    @keyframes deploy-dots {
      0%, 20% { content: "."; }
      40% { content: ".."; }
      60%, 100% { content: "…"; }
    }
    .diagnostics-panel {
      max-height: 150px;
      overflow-y: auto;
      padding: var(--space-2, 8px) 0;
      background: rgba(8, 14, 20, 0.9);
      border-top: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 12px);
      font-family: var(--font-mono, "Fira Code", "Consolas", "Courier New", monospace);
    }
    .diagnostics-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px var(--space-4, 16px);
      color: var(--ui-text-muted, #8ea1af);
      font-family: var(--font-ui, inherit);
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-semibold, 600);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border-bottom: 1px solid rgba(140, 169, 193, 0.08);
    }
    .diagnostic {
      display: grid;
      grid-template-columns: 18px minmax(72px, auto) 1fr;
      gap: 10px;
      padding: 6px var(--space-4, 16px);
      align-items: baseline;
      border-left: 2px solid transparent;
    }
    .diagnostic:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .diagnostic-icon {
      --mdc-icon-size: 14px;
      align-self: center;
    }
    .diagnostic-location {
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-xs, 11px);
      text-align: right;
    }
    .diagnostic-message {
      color: var(--ui-text-primary, #edf6ff);
      overflow-wrap: anywhere;
    }
    .diagnostic-code {
      display: inline-block;
      margin-right: 6px;
      padding: 1px 6px;
      border-radius: var(--radius-sm, 6px);
      background: rgba(140, 169, 193, 0.1);
      color: var(--ui-text-secondary, #8ea6bd);
      font-size: var(--font-size-xs, 11px);
    }
    .diagnostic-error {
      border-left-color: var(--ui-error, #ff7272);
    }
    .diagnostic-error .diagnostic-icon {
      color: var(--ui-error, #ff7272);
    }
    .diagnostic-warning {
      border-left-color: var(--ui-warning, #ffbf47);
    }
    .diagnostic-warning .diagnostic-icon {
      color: var(--ui-warning, #ffbf47);
    }
    .diagnostic-info {
      border-left-color: var(--ui-info, #6bc9ff);
    }
    .diagnostic-info .diagnostic-icon {
      color: var(--ui-info, #6bc9ff);
    }
    .diagnostic-hint {
      border-left-color: var(--ui-disabled, #6c8194);
    }
    .diagnostic-hint .diagnostic-icon {
      color: var(--ui-disabled, #6c8194);
    }
    .tabs-container {
      display: flex;
      gap: 6px;
      padding: 10px 14px 0;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(140, 169, 193, 0.3) transparent;
    }
    .tabs-container::-webkit-scrollbar {
      height: 6px;
    }
    .tabs-container::-webkit-scrollbar-thumb {
      background: rgba(140, 169, 193, 0.22);
      border-radius: 3px;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      background: rgba(255, 255, 255, 0.03);
      color: var(--ui-text-secondary, var(--primary-text-color));
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      font-size: var(--font-size-base, 13px);
      font-family: var(--font-ui, inherit);
      white-space: nowrap;
      transition: var(--transition-fast, all 160ms ease);
      max-width: 220px;
    }
    .tab:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--ui-text-primary);
    }
    .tab:focus-visible {
      outline: var(--focus-ring, 2px solid rgba(91, 212, 255, 0.7));
      outline-offset: -2px;
    }
    .tab.active {
      background: linear-gradient(180deg, rgba(24, 183, 230, 0.16), rgba(255, 255, 255, 0.02));
      border-color: rgba(91, 212, 255, 0.28);
      color: var(--ui-text-primary, var(--primary-text-color));
      box-shadow: inset 0 2px 0 rgba(91, 212, 255, 0.6);
    }
    .tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: var(--font-weight-medium, 500);
    }
    .tab-close {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm, 6px);
      opacity: 0.55;
      transition: var(--transition-fast, all 160ms ease);
    }
    .tab-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
      color: var(--ui-text-primary);
    }
    .tab-close ha-icon {
      --mdc-icon-size: 12px;
    }
    .unsaved-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--ui-warning, var(--warning-color, #ff9800));
      box-shadow: 0 0 6px rgba(255, 191, 71, 0.45);
      flex-shrink: 0;
    }
    .project-sidebar {
      width: 292px;
      min-width: 240px;
      max-width: 380px;
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 16%),
        var(--ui-bg-card, var(--card-background-color));
    }
    .project-sidebar.hidden {
      display: none;
    }
    .toolbar-icon {
      width: 18px;
      height: 18px;
      --mdc-icon-size: 18px;
    }
    .empty-editor {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8, 32px);
      color: var(--ui-text-muted, #8ea1af);
      font-size: var(--font-size-md, 14px);
      text-align: center;
    }
    @media (max-width: 900px) {
      .toolbar {
        padding: 14px 16px 12px;
      }
      .toolbar h1 {
        font-size: 22px;
      }
      .toolbar-subtitle {
        display: none;
      }
      .sidebar,
      .project-sidebar {
        width: 260px;
        min-width: 220px;
      }
      .editor-container {
        padding: 12px;
      }
    }
    @media (max-width: 640px) {
      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }
      .toolbar-actions {
        justify-content: flex-end;
      }
      .main-content {
        flex-direction: column;
      }
      .sidebar,
      .project-sidebar {
        width: 100%;
        max-width: none;
        max-height: 40vh;
      }
    }
  `);
b([
  _({ attribute: !1 })
], g.prototype, "hass", 2);
b([
  _({ type: Boolean })
], g.prototype, "narrow", 2);
b([
  v()
], g.prototype, "_code", 2);
b([
  v()
], g.prototype, "_project", 2);
b([
  v()
], g.prototype, "_syntaxOk", 2);
b([
  v()
], g.prototype, "_triggers", 2);
b([
  v()
], g.prototype, "_diagnostics", 2);
b([
  v()
], g.prototype, "_metadata", 2);
b([
  v()
], g.prototype, "_entityCount", 2);
b([
  v()
], g.prototype, "_onlineState", 2);
b([
  v()
], g.prototype, "_showEntityBrowser", 2);
b([
  v()
], g.prototype, "_showProjectExplorer", 2);
b([
  v()
], g.prototype, "_storage", 2);
b([
  v()
], g.prototype, "_isDeploying", 2);
g = b([
  W("st-panel")
], g);
const Ui = document.getElementById("st-ha-design-system");
if (!Ui) {
  const a = document.createElement("style");
  a.id = "st-ha-design-system", a.textContent = Be, document.head.appendChild(a);
}
console.log("ST for Home Assistant loaded");
export {
  S as STEditor,
  J as ST_BUILTINS,
  tt as ST_FUNCTION_BLOCKS,
  Q as ST_KEYWORDS,
  Ie as ST_PRAGMAS,
  Z as ST_TYPES,
  Fe as stEditorTheme,
  $e as stHighlightStyle,
  je as stTheme,
  Pe as structuredText
};
//# sourceMappingURL=st-panel.js.map
