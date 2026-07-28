var ae = Object.defineProperty;
var oe = (a, t, e) => t in a ? ae(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var l = (a, t, e) => oe(a, typeof t != "symbol" ? t + "" : t, e);
import { S as re, c as le, L as ce, E as N, H as de, s as he, a as Z, b as pe, D as B, W as ue, C as ge, d as C, l as fe, h as me, e as be, f as ve, g as ye, i as Ee, j as _e, k as Se, m as xe, n as Le, o as Ce, p as Oe, q as Ue, r as Ne, t as we, u as Te, v as Re, w as ke, x as Ae, y as Ie } from "./codemirror-C8x9REUs.js";
import { W as m } from "./vendor-BhPS5zVw.js";
import { i as W, n as x, a as G, b as u, t as H, r as v } from "./lit-C178dhqO.js";
import { s as Be } from "./ha-websocket-DcUbagYv.js";
import "./project-DwWQHIot.js";
import { c as r, L as k, C as Me } from "./chevrotain-cBR36crC.js";
import { a as K } from "./analyzer-DbAWr__X.js";
const De = ':root{--editor-bg: #1e1e1e;--editor-bg-light: #252526;--editor-fg: #d4d4d4;--editor-fg-dim: #808080;--editor-keyword: #569cd6;--editor-type: #4ec9b0;--editor-function: #dcdcaa;--editor-variable: #9cdcfe;--editor-string: #ce9178;--editor-number: #b5cea8;--editor-comment: #6a9955;--editor-pragma: #c586c0;--editor-operator: #d4d4d4;--editor-invalid: #ff0000;--editor-selection: #264f78;--editor-selection-bg: rgba(38, 79, 120, .5);--editor-line-highlight: #2a2d2e;--editor-gutter-bg: #1e1e1e;--editor-gutter-fg: #858585;--editor-border: #404040;--editor-cursor: #aeafad;--editor-tooltip-bg: #252526;--ui-primary: var(--primary-color, #18b7e6);--ui-primary-strong: #0d7fa6;--ui-primary-soft: rgba(24, 183, 230, .14);--ui-bg: #091119;--ui-bg-secondary: #0e1822;--ui-bg-card: #101c27;--ui-bg-card-strong: #132331;--ui-bg-header: #0c1a24;--ui-bg-inset: #0a141d;--ui-bg-elevated: #162633;--ui-text-primary: #edf6ff;--ui-text-secondary: #8ea6bd;--ui-text-muted: #668097;--ui-text-header: #f4fbff;--ui-text-on-primary: #07141d;--ui-divider: rgba(140, 169, 193, .18);--ui-divider-strong: rgba(140, 169, 193, .32);--ui-success: #4fd39e;--ui-error: #ff7272;--ui-warning: #ffbf47;--ui-info: #6bc9ff;--ui-disabled: #6c8194;--status-online: #4fd39e;--status-paused: #ffbf47;--status-connecting: #6bc9ff;--status-disconnected: #7e8f9f;--status-error: #ff7272;--font-mono: "Fira Code", "Consolas", "Courier New", monospace;--font-ui: "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;--font-size-xs: 11px;--font-size-sm: 12px;--font-size-base: 13px;--font-size-md: 14px;--font-size-lg: 16px;--font-size-xl: 18px;--font-size-2xl: 20px;--font-size-3xl: 26px;--font-size-editor: 14px;--font-size-diagnostics: 12px;--font-weight-normal: 400;--font-weight-medium: 500;--font-weight-semibold: 600;--font-weight-bold: 700;--space-1: 4px;--space-2: 8px;--space-3: 12px;--space-4: 16px;--space-5: 20px;--space-6: 24px;--space-8: 32px;--radius-sm: 6px;--radius-md: 10px;--radius-lg: 16px;--radius-xl: 20px;--radius-pill: 999px;--shadow-soft: 0 12px 30px rgba(0, 0, 0, .22);--shadow-popover: 0 16px 32px rgba(0, 0, 0, .28);--shadow-focus-ring: 0 0 0 3px rgba(24, 183, 230, .32);--shadow-header: inset 0 -1px 0 rgba(255, 255, 255, .04);--sidebar-width-min: 240px;--sidebar-width-default: 320px;--sidebar-width-max: 400px;--transition-fast: all .16s ease;--transition-medium: all .24s ease;--transition-slow: all .32s ease;--focus-ring: 2px solid rgba(91, 212, 255, .7);--focus-ring-offset: 2px}@media (prefers-reduced-motion: reduce){:root{--transition-fast: none;--transition-medium: none;--transition-slow: none}}.st-h1{margin:0;font-family:var(--font-ui);font-size:var(--font-size-3xl);font-weight:700;letter-spacing:-.03em;color:var(--ui-text-header)}.st-h2{margin:0;font-family:var(--font-ui);font-size:var(--font-size-xl);font-weight:600;color:var(--ui-text-primary)}.st-body{font-family:var(--font-ui);font-size:var(--font-size-md);color:var(--ui-text-primary)}.st-body-sm{font-family:var(--font-ui);font-size:var(--font-size-sm);color:var(--ui-text-secondary)}.st-mono{font-family:var(--font-mono);font-size:var(--font-size-diagnostics);color:var(--ui-text-primary)}.st-btn-primary,.st-btn-secondary,.st-btn-ghost{display:inline-flex;align-items:center;gap:var(--space-2);border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-ui);font-size:var(--font-size-md);font-weight:600;transition:var(--transition-medium)}.st-btn-primary{padding:10px 16px;border:1px solid transparent;background:linear-gradient(135deg,var(--ui-primary),#4ad7ff);color:var(--ui-text-on-primary);box-shadow:0 10px 20px #18b7e62e}.st-btn-secondary{padding:9px 14px;border:1px solid var(--ui-divider-strong);background:#ffffff0a;color:var(--ui-text-primary)}.st-btn-ghost{padding:8px 12px;border:1px solid transparent;background:transparent;color:var(--ui-text-secondary)}.st-btn-primary:hover,.st-btn-secondary:hover,.st-btn-ghost:hover{transform:translateY(-1px)}.st-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--ui-divider);border-radius:999px;background:#ffffff0a;color:var(--ui-text-secondary);font-family:var(--font-ui);font-size:var(--font-size-sm);line-height:1}.st-status-ok{color:var(--ui-success)}.st-status-error{color:var(--ui-error)}.st-status-warning{color:var(--ui-warning)}.st-status-info{color:var(--ui-info)}', J = [
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
], tt = [
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
], et = [
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
], it = [
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
], Fe = [
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
], X = re.define({
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
      return J.includes(e) ? "keyword" : tt.includes(e) ? "typeName" : et.includes(e) ? "function.standard" : it.includes(e) ? "className" : "variableName";
    }
    return a.match(/[+\-*=<>()[\];:,.]/) ? "operator" : (a.next(), null);
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] }
  }
}), Pe = le([
  ...J.map((a) => ({ label: a, type: "keyword" })),
  ...tt.map((a) => ({ label: a, type: "type" })),
  ...et.map((a) => ({ label: a, type: "function" })),
  ...it.map((a) => ({ label: a, type: "class" })),
  ...Fe.map((a) => ({
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
function $e() {
  return new ce(X, [
    X.data.of({ autocomplete: Pe })
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
}, Ve = N.theme(
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
), ze = de.define([
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
  return [Ve, he(ze)];
}
class Ye {
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
  setUpdateRate(t) {
    this.updateRate = t, this.notifySubscribers();
  }
  setShowConditions(t) {
    this.showConditions = t, this.notifySubscribers();
  }
  setHighlightChanges(t) {
    this.highlightChanges = t, this.notifySubscribers();
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
      const o = this.parseValue(n.state, i.dataType), d = this.liveValues.get(s), c = {
        binding: i,
        currentValue: o,
        previousValue: d == null ? void 0 : d.currentValue,
        hasChanged: d ? d.currentValue.raw !== o.raw : !1,
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
class Q {
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
const st = Z.define();
Z.define();
class We extends ue {
  constructor(t, e) {
    super(), this.value = t, this.showChange = e;
  }
  toDOM() {
    const t = document.createElement("span");
    t.className = "st-live-value-widget";
    const e = this.showChange ? Q.formatWithChange(this.value) : Q.format(this.value.currentValue), s = document.createElement("span");
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
const Ge = pe.define({
  create() {
    return B.none;
  },
  update(a, t) {
    for (const e of t.effects)
      if (e.is(st))
        return He(t.state.doc.toString(), e.value);
    return t.docChanged && (a = a.map(t.changes)), a;
  },
  provide: (a) => N.decorations.from(a)
});
function He(a, t) {
  const e = [], s = a.split(`
`);
  let i = 0;
  for (let n = 0; n < s.length; n++) {
    const o = s[n], d = i + o.length;
    for (const [, c] of t)
      if (c.binding.line === n + 1) {
        const g = B.widget({
          widget: new We(c, !0),
          side: 1
        });
        e.push({
          from: d,
          to: d,
          decoration: g
        });
      }
    i = d + 1;
  }
  return e.sort((n, o) => n.from - o.from), B.set(
    e.map((n) => n.decoration.range(n.from, n.to))
  );
}
const qe = N.baseTheme({
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
function Ke() {
  return [Ge, qe];
}
function Xe(a, t) {
  a.dispatch({
    effects: st.of(t)
  });
}
var nt = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, Ze = (a, t, e) => t in a ? nt(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, A = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Qe(t, e) : t, n = a.length - 1, o; n >= 0; n--)
    (o = a[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && nt(t, e, i), i;
}, Je = (a, t, e) => Ze(a, t + "", e);
let S = class extends G {
  constructor() {
    super();
    l(this, "_editor", null);
    l(this, "_readOnlyCompartment", new ge());
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
        C.readOnly.of(this.readOnly)
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
    this._onlineManager || (this._onlineManager = new Ye(this.hass.connection), this._onlineUnsubscribe = this._onlineManager.subscribe((s) => {
      this._editor && s.liveValues && Xe(this._editor, s.liveValues);
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
  setOnlineSettings(t) {
    this._onlineManager && (typeof t.updateRate == "number" && this._onlineManager.setUpdateRate(t.updateRate), typeof t.showConditions == "boolean" && this._onlineManager.setShowConditions(t.showConditions), typeof t.highlightChanges == "boolean" && this._onlineManager.setHighlightChanges(t.highlightChanges));
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
      fe(),
      me(),
      be(),
      ve(),
      ye(),
      Ee(),
      C.allowMultipleSelections.of(!0),
      _e(),
      Se(),
      xe(),
      Le(),
      Ce(),
      Oe(),
      Ue.of([
        ...Ne,
        ...we,
        ...Te,
        ...Re,
        ...ke,
        ...Ae,
        Ie
      ]),
      $e(),
      je(),
      Ke(),
      N.domEventHandlers({
        dragover: (i) => (i.preventDefault(), i.stopPropagation(), i.dataTransfer && (i.dataTransfer.dropEffect = "copy"), !0),
        drop: (i) => (i.preventDefault(), i.stopPropagation(), this._handleDrop(i), !0)
      }),
      this._readOnlyCompartment.of(C.readOnly.of(this.readOnly)),
      C.tabSize.of(4)
    ];
    this._editor = new N({
      state: C.create({ doc: this.code, extensions: e }),
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
    }), t.addEventListener("keydown", (i) => i.stopPropagation()), t.addEventListener("keyup", (i) => i.stopPropagation()), t.addEventListener("keypress", (i) => i.stopPropagation());
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
  insertBinding(t) {
    if (!this._editor || !t) return;
    const e = this.getCode();
    if (e.includes(t))
      return;
    const { insertPos: s, content: i } = this._getBindingInsertTarget(e, t);
    this._editor.dispatch({
      changes: { from: s, insert: i },
      selection: { anchor: s + i.length }
    }), this._editor.focus();
  }
  removeBinding(t) {
    if (!this._editor || !t) return;
    const e = this.getCode(), s = e.split(`
`), i = s.filter((n) => !n.includes(`'${t}'`));
    i.length !== s.length && (this._editor.dispatch({
      changes: { from: 0, to: e.length, insert: i.join(`
`) }
    }), this._editor.focus());
  }
  _getBindingInsertTarget(t, e) {
    const s = t.split(`
`), i = this._getLineStarts(s), n = this._findDeclarationBlock(s);
    if (n) {
      const c = this._getDeclarationIndent(
        s,
        n.startLine,
        n.endLine
      );
      return {
        insertPos: i[n.endLine],
        content: `${c}${e}
`
      };
    }
    const o = s.findIndex(
      (c) => /^\s*(PROGRAM|FUNCTION_BLOCK|FUNCTION)\b/i.test(c)
    );
    if (o !== -1) {
      const c = Math.min(o + 1, s.length - 1);
      return {
        insertPos: i[c],
        content: `VAR
    ${e}
END_VAR
`
      };
    }
    const d = t.length > 0 && !t.endsWith(`
`) ? `
` : "";
    return {
      insertPos: t.length,
      content: `${d}VAR
    ${e}
END_VAR
`
    };
  }
  _findDeclarationBlock(t) {
    let e = -1;
    for (let s = 0; s < t.length; s += 1) {
      const i = t[s].trim().toUpperCase();
      if (/^VAR(?:_(INPUT|OUTPUT|IN_OUT|GLOBAL|TEMP))?$/.test(i)) {
        e = s;
        continue;
      }
      if (i === "END_VAR" && e !== -1)
        return { startLine: e, endLine: s };
    }
    return null;
  }
  _getDeclarationIndent(t, e, s) {
    for (let i = e + 1; i < s; i += 1) {
      const n = t[i].match(/^(\s*)\S/);
      if (n)
        return n[1];
    }
    return "    ";
  }
  _getLineStarts(t) {
    const e = [];
    let s = 0;
    for (const i of t)
      e.push(s), s += i.length + 1;
    return e;
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
Je(S, "styles", W`
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
  x({ type: String })
], S.prototype, "code", 2);
A([
  x({ type: Boolean, attribute: "read-only" })
], S.prototype, "readOnly", 2);
A([
  x({ attribute: !1 })
], S.prototype, "hass", 2);
S = A([
  H("st-editor")
], S);
var at = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, ei = (a, t, e) => t in a ? at(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, q = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ti(t, e) : t, n = a.length - 1, o; n >= 0; n--)
    (o = a[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && at(t, e, i), i;
}, ii = (a, t, e) => ei(a, t + "", e);
let w = class extends G {
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
    var t, e, s, i, n, o;
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
ii(w, "styles", W`
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
q([
  x({ type: Object })
], w.prototype, "state", 2);
q([
  v()
], w.prototype, "_showSettings", 2);
w = q([
  H("st-online-toolbar")
], w);
const h = (a, t) => r({ name: a, pattern: new RegExp(`\\b${t}\\b`, "i") }), si = r({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: k.SKIPPED
}), ni = r({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: k.SKIPPED
}), ai = r({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: k.SKIPPED
}), ot = r({
  name: "Pragma",
  pattern: /\{[^}]+\}/
}), rt = r({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: void 0
}), oi = r({
  name: "EndFunction",
  pattern: /END_FUNCTION/i
}), ri = r({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i
}), li = r({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i
}), lt = r({ name: "EndVar", pattern: /END_VAR/i }), ct = r({
  name: "VarInput",
  pattern: /VAR_INPUT/i
}), dt = r({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i
}), ht = r({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i
}), pt = r({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i
}), ut = r({ name: "EndIf", pattern: /END_IF/i }), gt = r({ name: "EndCase", pattern: /END_CASE/i }), ft = r({ name: "EndFor", pattern: /END_FOR/i }), mt = r({
  name: "EndWhile",
  pattern: /END_WHILE/i
}), bt = r({
  name: "EndRepeat",
  pattern: /END_REPEAT/i
}), vt = h("Program", "PROGRAM"), ci = h("Function", "FUNCTION"), yt = h("Var", "VAR"), di = h("Constant", "CONSTANT"), Et = h("If", "IF"), M = h("Then", "THEN"), _t = h("Elsif", "ELSIF"), D = h("Else", "ELSE"), St = h("Case", "CASE"), xt = h("Of", "OF"), Lt = h("For", "FOR"), Ct = h("To", "TO"), Ot = h("By", "BY"), F = h("Do", "DO"), Ut = h("While", "WHILE"), Nt = h("Repeat", "REPEAT"), wt = h("Until", "UNTIL"), Tt = h("Return", "RETURN"), Rt = h("Exit", "EXIT"), hi = h("Continue", "CONTINUE"), P = h("At", "AT"), kt = h("And", "AND"), At = h("Or", "OR"), pi = h("Xor", "XOR"), It = h("Not", "NOT"), Bt = h("Mod", "MOD"), Mt = h("True", "TRUE"), Dt = h("False", "FALSE"), Ft = h("TypeBool", "BOOL"), Pt = r({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i
}), $t = r({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i
}), Vt = r({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i
}), zt = r({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i
}), ui = r({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i
}), jt = r({
  name: "TimeLiteral",
  pattern: /T(IME)?#[\d_]+(\.[\d_]+)?([a-z]+)?/i
}), gi = r({
  name: "HexLiteral",
  pattern: /16#[\da-fA-F_]+/
}), fi = r({
  name: "BinaryLiteral",
  pattern: /2#[01_]+/
}), mi = r({
  name: "OctalLiteral",
  pattern: /8#[0-7_]+/
}), Yt = r({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/
}), Wt = r({
  name: "IntegerLiteral",
  pattern: /\d+/
}), Gt = r({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/
}), $ = r({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i
}), O = r({ name: "Assign", pattern: /:=/ }), bi = r({ name: "Output", pattern: /=>/ }), Ht = r({ name: "LessEqual", pattern: /<=/ }), qt = r({
  name: "GreaterEqual",
  pattern: />=/
}), Kt = r({ name: "NotEqual", pattern: /<>/ }), Xt = r({ name: "Less", pattern: /</ }), Qt = r({ name: "Greater", pattern: />/ }), Zt = r({ name: "Equal", pattern: /=/ }), Jt = r({ name: "Plus", pattern: /\+/ }), V = r({ name: "Minus", pattern: /-/ }), te = r({ name: "Star", pattern: /\*/ }), ee = r({ name: "Slash", pattern: /\// }), T = r({ name: "LParen", pattern: /\(/ }), R = r({ name: "RParen", pattern: /\)/ }), vi = r({ name: "LBracket", pattern: /\[/ }), yi = r({ name: "RBracket", pattern: /\]/ }), z = r({ name: "Colon", pattern: /:/ }), _ = r({ name: "Semicolon", pattern: /;/ }), j = r({ name: "Comma", pattern: /,/ }), Y = r({ name: "Dot", pattern: /\./ }), ie = r({ name: "Range", pattern: /\.\./ }), y = r({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}), se = [
  // Skipped
  si,
  ni,
  ai,
  // Pragmas
  ot,
  // Multi-word keywords first
  ri,
  li,
  oi,
  rt,
  ct,
  dt,
  ht,
  pt,
  lt,
  ut,
  gt,
  ft,
  mt,
  bt,
  // Keywords
  vt,
  ci,
  yt,
  di,
  Et,
  M,
  _t,
  D,
  St,
  xt,
  Lt,
  Ct,
  Ot,
  F,
  Ut,
  Nt,
  wt,
  Tt,
  Rt,
  hi,
  P,
  // Logical
  kt,
  At,
  pi,
  It,
  Bt,
  Mt,
  Dt,
  // Types
  Ft,
  Pt,
  $t,
  Vt,
  zt,
  ui,
  // Literals (order: specific before general)
  jt,
  gi,
  fi,
  mi,
  Yt,
  Wt,
  Gt,
  // I/O
  $,
  // Multi-char operators
  O,
  bi,
  ie,
  Ht,
  qt,
  Kt,
  // Single-char operators
  Xt,
  Qt,
  Zt,
  Jt,
  V,
  te,
  ee,
  T,
  R,
  vi,
  yi,
  z,
  _,
  j,
  Y,
  // Identifier last
  y
], Ei = new k(se, {
  ensureOptimizations: !0,
  positionTracking: "full"
  // For error reporting
});
function _i(a) {
  const t = Ei.tokenize(a);
  return {
    tokens: t.tokens,
    errors: t.errors
  };
}
class Si extends Me {
  constructor() {
    super(se, {
      recoveryEnabled: !0,
      nodeLocationTracking: "full"
    });
    // Program structure
    l(this, "program", this.RULE("program", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(vt), this.CONSUME(y, { LABEL: "programName" }), this.MANY1(() => this.SUBRULE(this.variableBlock)), this.MANY2(() => this.SUBRULE(this.statement)), this.CONSUME(rt);
    }));
    // Variable declarations
    l(this, "variableBlock", this.RULE("variableBlock", () => {
      this.OR([
        { ALT: () => this.CONSUME(yt) },
        { ALT: () => this.CONSUME(ct) },
        { ALT: () => this.CONSUME(dt) },
        { ALT: () => this.CONSUME(ht) },
        { ALT: () => this.CONSUME(pt) }
      ]), this.MANY(() => this.SUBRULE(this.variableDeclaration)), this.CONSUME(lt);
    }));
    l(this, "variableDeclaration", this.RULE("variableDeclaration", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(y, { LABEL: "varName" }), this.OPTION(() => {
        this.CONSUME(P), this.CONSUME($);
      }), this.OPTION1(() => {
        this.CONSUME(z), this.SUBRULE(this.typeSpec);
      }), this.OPTION2(() => {
        this.CONSUME(O), this.SUBRULE(this.expression);
      }), this.OPTION3(() => {
        this.CONSUME1(P), this.CONSUME1($);
      }), this.CONSUME(_);
    }));
    l(this, "pragma", this.RULE("pragma", () => {
      this.CONSUME(ot);
    }));
    l(this, "typeSpec", this.RULE("typeSpec", () => {
      this.OR([
        { ALT: () => this.CONSUME(Ft) },
        { ALT: () => this.CONSUME(Pt) },
        { ALT: () => this.CONSUME($t) },
        { ALT: () => this.CONSUME(Vt) },
        { ALT: () => this.CONSUME(zt) },
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
      this.SUBRULE(this.variableReference), this.CONSUME(O), this.SUBRULE(this.expression), this.CONSUME(_);
    }));
    l(this, "ifStatement", this.RULE("ifStatement", () => {
      this.CONSUME(Et), this.SUBRULE(this.expression, { LABEL: "condition" }), this.CONSUME(M), this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" })), this.MANY1(() => {
        this.CONSUME(_t), this.SUBRULE1(this.expression, { LABEL: "elsifCondition" }), this.CONSUME1(M), this.MANY2(
          () => this.SUBRULE1(this.statement, { LABEL: "elsifStatements" })
        );
      }), this.OPTION(() => {
        this.CONSUME(D), this.MANY3(
          () => this.SUBRULE2(this.statement, { LABEL: "elseStatements" })
        );
      }), this.CONSUME(ut);
    }));
    l(this, "caseStatement", this.RULE("caseStatement", () => {
      this.CONSUME(St), this.SUBRULE(this.expression, { LABEL: "selector" }), this.CONSUME(xt), this.MANY(() => this.SUBRULE(this.caseClause)), this.OPTION(() => {
        this.CONSUME(D), this.MANY1(() => this.SUBRULE(this.statement));
      }), this.CONSUME(gt);
    }));
    l(this, "caseClause", this.RULE("caseClause", () => {
      this.SUBRULE(this.caseLabelList), this.CONSUME(z), this.MANY(() => this.SUBRULE(this.statement));
    }));
    l(this, "caseLabelList", this.RULE("caseLabelList", () => {
      this.SUBRULE(this.caseLabel), this.MANY(() => {
        this.CONSUME(j), this.SUBRULE1(this.caseLabel);
      });
    }));
    l(this, "caseLabel", this.RULE("caseLabel", () => {
      this.SUBRULE(this.expression), this.OPTION(() => {
        this.CONSUME(ie), this.SUBRULE1(this.expression);
      });
    }));
    l(this, "forStatement", this.RULE("forStatement", () => {
      this.CONSUME(Lt), this.CONSUME(y, { LABEL: "controlVar" }), this.CONSUME(O), this.SUBRULE(this.expression, { LABEL: "start" }), this.CONSUME(Ct), this.SUBRULE1(this.expression, { LABEL: "end" }), this.OPTION(() => {
        this.CONSUME(Ot), this.SUBRULE2(this.expression, { LABEL: "step" });
      }), this.CONSUME(F), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(ft);
    }));
    l(this, "whileStatement", this.RULE("whileStatement", () => {
      this.CONSUME(Ut), this.SUBRULE(this.expression), this.CONSUME(F), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(mt);
    }));
    l(this, "repeatStatement", this.RULE("repeatStatement", () => {
      this.CONSUME(Nt), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(wt), this.SUBRULE(this.expression), this.CONSUME(bt);
    }));
    l(this, "returnStatement", this.RULE("returnStatement", () => {
      this.CONSUME(Tt), this.CONSUME(_);
    }));
    l(this, "exitStatement", this.RULE("exitStatement", () => {
      this.CONSUME(Rt), this.CONSUME(_);
    }));
    l(this, "functionCallStatement", this.RULE("functionCallStatement", () => {
      this.SUBRULE(this.functionCall), this.CONSUME(_);
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
        this.CONSUME(kt), this.SUBRULE1(this.comparisonExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "comparisonExpression", this.RULE("comparisonExpression", () => {
      this.SUBRULE(this.additiveExpression, { LABEL: "lhs" }), this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(Zt) },
          { ALT: () => this.CONSUME(Kt) },
          { ALT: () => this.CONSUME(Xt) },
          { ALT: () => this.CONSUME(Ht) },
          { ALT: () => this.CONSUME(Qt) },
          { ALT: () => this.CONSUME(qt) }
        ]), this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "additiveExpression", this.RULE("additiveExpression", () => {
      this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Jt) },
          { ALT: () => this.CONSUME(V) }
        ]), this.SUBRULE1(this.multiplicativeExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "multiplicativeExpression", this.RULE(
      "multiplicativeExpression",
      () => {
        this.SUBRULE(this.unaryExpression, { LABEL: "lhs" }), this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(te) },
            { ALT: () => this.CONSUME(ee) },
            { ALT: () => this.CONSUME(Bt) }
          ]), this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
        });
      }
    ));
    l(this, "unaryExpression", this.RULE("unaryExpression", () => {
      this.OR([
        {
          ALT: () => {
            this.OR1([
              { ALT: () => this.CONSUME(It) },
              { ALT: () => this.CONSUME(V) }
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
            this.CONSUME(T), this.SUBRULE(this.expression), this.CONSUME(R);
          }
        }
      ]);
    }));
    l(this, "identifierOrCall", this.RULE("identifierOrCall", () => {
      this.CONSUME(y), this.MANY(() => {
        this.CONSUME(Y), this.CONSUME1(y);
      }), this.OPTION(() => {
        this.CONSUME(T), this.OPTION1(() => {
          this.SUBRULE(this.argumentList);
        }), this.CONSUME(R);
      });
    }));
    l(this, "literal", this.RULE("literal", () => {
      this.OR([
        { ALT: () => this.CONSUME(Mt) },
        { ALT: () => this.CONSUME(Dt) },
        { ALT: () => this.CONSUME(Wt) },
        { ALT: () => this.CONSUME(Yt) },
        { ALT: () => this.CONSUME(Gt) },
        { ALT: () => this.CONSUME(jt) }
      ]);
    }));
    l(this, "variableReference", this.RULE("variableReference", () => {
      this.CONSUME(y), this.MANY(() => {
        this.CONSUME(Y), this.CONSUME1(y);
      });
    }));
    l(this, "functionCall", this.RULE("functionCall", () => {
      this.CONSUME(y), this.CONSUME(T), this.OPTION(() => {
        this.SUBRULE(this.argumentList);
      }), this.CONSUME(R);
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
        this.CONSUME(y, { LABEL: "argName" }), this.CONSUME(O);
      }), this.SUBRULE(this.expression, { LABEL: "argValue" });
    }));
    this.performSelfAnalysis();
  }
}
const U = new Si(), xi = U.getBaseCstVisitorConstructor();
class Li extends xi {
  constructor() {
    super(), this.validateVisitor();
  }
  // Program
  program(t) {
    const e = t.pragma ? t.pragma.map((o) => this.visit(o)) : [], s = t.programName[0].image, i = t.variableBlock ? t.variableBlock.flatMap((o) => this.visit(o)) : [], n = t.statement ? t.statement.map((o) => this.visit(o)) : [];
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
    let o;
    return t.IoAddress && (o = this.parseIoAddress(t.IoAddress[0].image), n && n.type === "Literal" && n.kind === "string" && (o.entityId = n.value)), {
      type: "VariableDeclaration",
      name: s,
      dataType: i,
      section: "VAR",
      // Will be set by variableBlock
      pragmas: e,
      constant: !1,
      initialValue: n,
      binding: o,
      location: this.getLocation(t)
    };
  }
  pragma(t) {
    const s = t.Pragma[0].image.slice(1, -1).trim(), i = s.indexOf(":");
    let n, o;
    return i > 0 ? (n = s.substring(0, i).trim(), o = s.substring(i + 1).trim()) : n = s, {
      type: "Pragma",
      name: n,
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
    const e = this.visit(t.condition[0]), s = t.thenStatements ? t.thenStatements.map((o) => this.visit(o)) : [], i = t.elsifCondition ? t.elsifCondition.map((o, d) => {
      const c = t.elsifStatements && t.elsifStatements[d] ? this.visit(t.elsifStatements[d]) : [];
      return {
        condition: this.visit(o),
        body: Array.isArray(c) ? c : [c]
      };
    }) : [], n = t.elseStatements ? t.elseStatements.map((o) => this.visit(o)) : void 0;
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
const Ci = new Li();
function I(a) {
  const t = [], e = _i(a);
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
  U.input = e.tokens;
  const s = U.program();
  if (U.errors.length > 0)
    return U.errors.forEach((i) => {
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
      ast: Ci.visit(s),
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
var ne = Object.defineProperty, Oi = Object.getOwnPropertyDescriptor, Ui = (a, t, e) => t in a ? ne(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e, b = (a, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Oi(t, e) : t, n = a.length - 1, o; n >= 0; n--)
    (o = a[n]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && ne(t, e, i), i;
}, Ni = (a, t, e) => Ui(a, t + "", e);
let f = class extends G {
  constructor() {
    super();
    l(this, "_entityBrowserLoaded", !1);
    this.narrow = !1, this._showEntityBrowser = !1, this._project = null, this._storage = null, this._code = `{mode: restart}
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

END_PROGRAM`, this._syntaxOk = !0, this._triggers = [], this._diagnostics = [], this._metadata = null, this._entityCount = 0, this._onlineState = this._createDisconnectedOnlineState(), this._isDeploying = !1, this._deployFeedback = null;
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
    const { ProjectStorage: t } = await import("./project-DwWQHIot.js");
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
          if (t.activeFileId && (t.files = t.files.map((e) => ({
            ...e,
            isOpen: e.id === t.activeFileId || e.isOpen
          }))), this._project = t, t.activeFileId) {
            const e = t.files.find(
              (s) => s.id === t.activeFileId
            );
            e && (this._code = e.content);
          }
          this._analyzeCode();
        } else
          this._project = this._storage.migrateFromSingleFile(this._code), await this._storage.saveProject(this._project), this._analyzeCode();
      } catch (t) {
        console.error("Failed to load project", t);
      }
  }
  render() {
    var n, o, d;
    const t = this._diagnostics.filter(
      (c) => c.severity === "Error"
    ).length, e = this._diagnostics.filter(
      (c) => c.severity === "Warning"
    ).length, s = this._isDeploying, i = this._syntaxOk ? this._isDeploying ? "Deploy in progress" : "Deploy to Home Assistant" : "Show deploy errors";
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
        ${this._deployFeedback ? u`
              <div
                class="deploy-feedback ${this._deployFeedback.tone}"
                role="status"
                aria-live="polite"
              >
                <ha-icon
                  icon=${this._getDeployFeedbackIcon(this._deployFeedback.tone)}
                ></ha-icon>
                <span>${this._deployFeedback.message}</span>
              </div>
            ` : ""}
        <st-online-toolbar
          .state=${this._onlineState ?? this._createDisconnectedOnlineState()}
          @connect=${this._handleOnlineConnect}
          @disconnect=${this._handleOnlineDisconnect}
          @toggle-pause=${this._handleOnlineTogglePause}
          @setting-change=${this._handleOnlineSettingChange}
        ></st-online-toolbar>
        <div class="main-content">
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
          <div class="content-area">
            ${this._project ? u`
                  <div class="tabs-container" role="tablist">
                    ${this._getOpenFiles().map(
      (c) => u`
                        <button
                          class="tab ${c.id === this._project.activeFileId ? "active" : ""}"
                          @click=${() => this._switchToFile(c.id)}
                          @auxclick=${(g) => {
        g.button === 1 && (g.preventDefault(), this._closeFile(c.id));
      }}
                          title=${c.path}
                          role="tab"
                          aria-selected=${c.id === this._project.activeFileId}
                        >
                          <span class="tab-label">${this._getFileDisplayName(c.name)}</span>
                          ${c.hasUnsavedChanges ? u`<div
                                class="unsaved-dot"
                                title="Unsaved changes"
                                aria-label="Unsaved changes"
                              ></div>` : ""}
                          <div
                            class="tab-close"
                            @click=${(g) => {
        g.stopPropagation(), this._closeFile(c.id);
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
              ${this._project && !this._project.activeFileId ? u`
                    <div class="empty-editor">
                      All files are closed. Open a file from the project explorer or create a new one.
                    </div>
                  ` : u`
                    <st-editor
                      .code=${this._getCurrentCode()}
                      .hass=${this.hass}
                      @code-change=${this._handleCodeChange}
                    ></st-editor>
                  `}
            </div>
            ${this._showEntityBrowser ? u`
                  <div class="entity-overlay" role="dialog" aria-label="Entity Browser">
                    <button
                      class="entity-overlay-close"
                      @click=${this._toggleEntityBrowser}
                      title="Close Entity Browser"
                      aria-label="Close entity browser"
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                    <st-entity-browser
                      .hass=${this.hass}
                      .currentCode=${this._getCurrentCode()}
                      @insert-binding=${this._handleInsertBinding}
                      @remove-binding=${this._handleRemoveBinding}
                    ></st-entity-browser>
                  </div>
                ` : ""}
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
          ${(o = this._metadata) != null && o.hasPersistentVars ? u`<span class="status-pill status-accent" title="Persistent variables">
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
  _getDeployFeedbackIcon(t) {
    switch (t) {
      case "success":
        return "mdi:check-circle";
      case "error":
        return "mdi:alert-circle";
      case "info":
      default:
        return "mdi:information";
    }
  }
  _setDeployFeedback(t, e) {
    this._deployFeedback = { tone: t, message: e };
  }
  _formatDeployError(t) {
    if (t instanceof Error && t.message)
      return t.message;
    if (typeof t == "string")
      return t;
    if (t && typeof t == "object") {
      const e = t;
      if (typeof e.message == "string" && e.message.trim())
        return e.message;
      if (e.body && typeof e.body == "object") {
        const s = e.body;
        if (typeof s.message == "string" && s.message.trim())
          return s.message;
        if (typeof s.error == "string" && s.error.trim())
          return s.error;
      }
      if (typeof e.error == "string" && e.error.trim())
        return e.error;
      try {
        return JSON.stringify(t);
      } catch {
        return "Deploy error";
      }
    }
    return "Deploy error";
  }
  _getFileDisplayName(t) {
    return t.replace(/\.st$/i, "");
  }
  _markProjectSaved() {
    this._project && this._project.files.forEach((t) => {
      t.hasUnsavedChanges = !1;
    });
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
    if (this._project) {
      if (!this._project.activeFileId)
        return "";
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
        (o) => o.id === this._project.activeFileId
      );
      if (n) {
        const o = s.getCode();
        o !== n.content && (n.content = o, n.hasUnsavedChanges = !0, n.lastModified = Date.now());
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
      this._project.lastModified = Date.now(), this._saveProject(), this._analyzeCode(), this.requestUpdate();
    }
  }
  _handleFileOpen(t) {
    const { fileId: e } = t.detail;
    this._switchToFile(e);
  }
  _handleFileSelected(t) {
    const { fileId: e } = t.detail;
    e && this._switchToFile(e);
  }
  _handleFileRename(t) {
    const { fileId: e, newName: s } = t.detail;
    if (!this._project) return;
    const i = this._project.files.find((n) => n.id === e);
    i && (i.name = s, i.path = s, i.lastModified = Date.now(), this._project.lastModified = Date.now(), this._saveProject());
  }
  _handleFileDeleted(t) {
    var d, c;
    const { fileId: e } = t.detail;
    if (!this._project) return;
    const s = this._project.files.filter((g) => g.id !== e);
    let i = this._project.activeFileId;
    if (i === e) {
      const g = s.find((E) => E.isOpen);
      i = (g == null ? void 0 : g.id) ?? ((d = s[0]) == null ? void 0 : d.id) ?? null;
    }
    const n = s.map(
      (g) => g.id === i ? { ...g, isOpen: !0 } : g
    );
    this._project = {
      ...this._project,
      files: n,
      activeFileId: i,
      lastModified: Date.now()
    };
    const o = (c = this.shadowRoot) == null ? void 0 : c.querySelector(
      "st-editor"
    );
    if (o && i) {
      const g = this._project.files.find((E) => E.id === i);
      g && o.setCode(g.content);
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
        await this._storage.saveProject(this._project), this._markProjectSaved(), this.requestUpdate();
      } catch (t) {
        console.error("Failed to save project", t);
      }
  }
  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  _analyzeCode() {
    var i, n;
    const t = [], e = this._getCurrentCode(), s = I(e);
    if (s.errors.length > 0)
      for (const o of s.errors)
        t.push({
          severity: "Error",
          message: o.message,
          line: o.line,
          column: o.column
        });
    if (this._syntaxOk = s.success && s.ast !== void 0, s.success && s.ast) {
      const o = K(s.ast);
      for (const d of o.diagnostics)
        t.push({
          severity: d.severity,
          code: d.code,
          message: d.message,
          line: (i = d.location) == null ? void 0 : i.line,
          column: (n = d.location) == null ? void 0 : n.column
        });
      this._triggers = o.triggers, this._metadata = o.metadata, this._entityCount = o.dependencies.length;
    } else
      this._triggers = [], this._metadata = null, this._entityCount = 0;
    this._diagnostics = t;
  }
  async _handleDeploy() {
    var e, s, i;
    if (this._isDeploying) return;
    if (!this._syntaxOk) {
      this._setDeployFeedback(
        "error",
        "Cannot deploy while syntax errors are present."
      ), console.error("Cannot deploy: syntax errors present");
      return;
    }
    if (!((e = this.hass) != null && e.connection) || typeof ((s = this.hass) == null ? void 0 : s.callApi) != "function") {
      this._setDeployFeedback(
        "error",
        "Cannot deploy because the Home Assistant connection is not available."
      ), console.error(
        "Cannot deploy: Home Assistant connection is not available"
      );
      return;
    }
    const t = I(this._getCurrentCode());
    if (!t.success || !t.ast) {
      this._setDeployFeedback("error", "Cannot deploy because parsing failed."), console.error("Cannot deploy: parsing failed");
      return;
    }
    this._isDeploying = !0, this._deployFeedback = null;
    try {
      const [{ transpile: n }, { deploy: o, HAApiClient: d }] = await Promise.all([
        import("./transpiler-deploy-41TsQdYw.js").then((L) => L.i),
        import("./transpiler-deploy-41TsQdYw.js").then((L) => L.a)
      ]), c = n(t.ast, "home");
      if (c.diagnostics.some((L) => L.severity === "Error")) {
        this._setDeployFeedback(
          "error",
          "Cannot deploy because transpilation reported errors."
        ), console.error(
          "Cannot deploy: transpiler reported errors",
          c.diagnostics
        );
        return;
      }
      const g = new d(this.hass), E = await o(g, c, {
        createBackup: !0
      });
      E.success ? (this._setDeployFeedback(
        "success",
        `Deploy successful (${E.transactionId}).`
      ), console.log("Deploy successful", E.transactionId)) : (this._setDeployFeedback(
        "error",
        ((i = E.errors[0]) == null ? void 0 : i.message) || "Deployment failed."
      ), console.error("Deploy failed", E.errors));
    } catch (n) {
      this._setDeployFeedback(
        "error",
        this._formatDeployError(n)
      ), console.error("Deploy error", n);
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
    var n, o;
    if (!this._syntaxOk || !((n = this.hass) != null && n.connection))
      return;
    const t = I(this._getCurrentCode());
    if (!t.success || !t.ast)
      return;
    const e = K(t.ast), s = this._extractBindings(e.dependencies), i = (o = this.shadowRoot) == null ? void 0 : o.querySelector(
      "st-editor"
    );
    if (i)
      try {
        await i.startOnlineMode(s);
        const d = this._onlineState ?? this._createDisconnectedOnlineState();
        i.setOnlineSettings({
          updateRate: d.updateRate,
          showConditions: d.showConditions,
          highlightChanges: d.highlightChanges
        }), this._onlineState = i.getOnlineState();
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
    var o;
    const e = this._onlineState ?? this._createDisconnectedOnlineState(), { setting: s, value: i } = t.detail;
    this._onlineState = {
      ...e,
      [s]: i
    };
    const n = (o = this.shadowRoot) == null ? void 0 : o.querySelector(
      "st-editor"
    );
    n == null || n.setOnlineSettings({
      updateRate: s === "updateRate" && typeof i == "number" ? i : void 0,
      showConditions: s === "showConditions" && typeof i == "boolean" ? i : void 0,
      highlightChanges: s === "highlightChanges" && typeof i == "boolean" ? i : void 0
    }), n && (this._onlineState = n.getOnlineState() ?? this._onlineState);
  }
  async _toggleEntityBrowser() {
    !this._entityBrowserLoaded && !this._showEntityBrowser && (await import("./entity-browser-YwrqL27V.js"), this._entityBrowserLoaded = !0), this._showEntityBrowser = !this._showEntityBrowser;
  }
  _handleInsertBinding(t) {
    var i, n;
    t.stopPropagation();
    const e = (i = this.shadowRoot) == null ? void 0 : i.querySelector("st-editor"), s = (n = t.detail) == null ? void 0 : n.bindingSyntax;
    !e || !s || e.insertBinding(s);
  }
  _handleRemoveBinding(t) {
    var i, n;
    t.stopPropagation();
    const e = (i = this.shadowRoot) == null ? void 0 : i.querySelector("st-editor"), s = (n = t.detail) == null ? void 0 : n.entityId;
    !e || !s || e.removeBinding(s);
  }
};
Ni(f, "styles", W`
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
      position: relative;
      display: flex;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }
    .content-area {
      position: relative;
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
    .deploy-feedback {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--ui-divider, var(--divider-color));
      font-size: var(--font-size-sm, 13px);
      font-weight: var(--font-weight-medium, 500);
      background: rgba(8, 14, 20, 0.9);
    }
    .deploy-feedback ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .deploy-feedback.error {
      color: var(--ui-error, #ff7272);
      background: rgba(255, 114, 114, 0.08);
      border-bottom-color: rgba(255, 114, 114, 0.24);
    }
    .deploy-feedback.success {
      color: var(--ui-success, #4fd39e);
      background: rgba(79, 211, 158, 0.08);
      border-bottom-color: rgba(79, 211, 158, 0.22);
    }
    .deploy-feedback.info {
      color: var(--ui-info, #6bc9ff);
      background: rgba(107, 201, 255, 0.08);
      border-bottom-color: rgba(107, 201, 255, 0.22);
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
      width: 236px;
      min-width: 212px;
      max-width: 260px;
      border-right: 1px solid var(--ui-divider, var(--divider-color));
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 16%),
        var(--ui-bg-card, var(--card-background-color));
    }
    .entity-overlay {
      position: absolute;
      top: 18px;
      left: 18px;
      bottom: 18px;
      width: min(420px, calc(100% - 36px));
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(91, 212, 255, 0.18);
      border-radius: var(--radius-xl, 18px);
      overflow: hidden;
      background: rgba(6, 12, 16, 0.86);
      backdrop-filter: blur(16px);
      box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.42),
        0 0 0 1px rgba(255, 255, 255, 0.03) inset;
      z-index: 3;
    }
    .entity-overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top left, rgba(24, 183, 230, 0.14), transparent 36%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%);
      pointer-events: none;
    }
    .entity-overlay st-entity-browser {
      position: relative;
      z-index: 1;
    }
    .entity-overlay-close {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      background: rgba(8, 14, 20, 0.82);
      color: var(--ui-text-primary, #edf6ff);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-fast, all 160ms ease);
    }
    .entity-overlay-close:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .entity-overlay-close ha-icon {
      --mdc-icon-size: 16px;
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
      .project-sidebar {
        width: 220px;
        min-width: 200px;
      }
      .entity-overlay {
        top: 12px;
        left: 12px;
        bottom: 12px;
        width: min(380px, calc(100% - 24px));
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
      .project-sidebar {
        width: 100%;
        max-width: none;
        max-height: 32vh;
      }
      .entity-overlay {
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        width: auto;
      }
    }
  `);
b([
  x({ attribute: !1 })
], f.prototype, "hass", 2);
b([
  x({ type: Boolean })
], f.prototype, "narrow", 2);
b([
  v()
], f.prototype, "_code", 2);
b([
  v()
], f.prototype, "_project", 2);
b([
  v()
], f.prototype, "_syntaxOk", 2);
b([
  v()
], f.prototype, "_triggers", 2);
b([
  v()
], f.prototype, "_diagnostics", 2);
b([
  v()
], f.prototype, "_metadata", 2);
b([
  v()
], f.prototype, "_entityCount", 2);
b([
  v()
], f.prototype, "_onlineState", 2);
b([
  v()
], f.prototype, "_showEntityBrowser", 2);
b([
  v()
], f.prototype, "_storage", 2);
b([
  v()
], f.prototype, "_isDeploying", 2);
b([
  v()
], f.prototype, "_deployFeedback", 2);
f = b([
  H("st-panel")
], f);
const wi = document.getElementById("st-ha-design-system");
if (!wi) {
  const a = document.createElement("style");
  a.id = "st-ha-design-system", a.textContent = De, document.head.appendChild(a);
}
console.log("ST for Home Assistant loaded");
export {
  S as STEditor,
  et as ST_BUILTINS,
  it as ST_FUNCTION_BLOCKS,
  J as ST_KEYWORDS,
  Fe as ST_PRAGMAS,
  tt as ST_TYPES,
  Ve as stEditorTheme,
  ze as stHighlightStyle,
  je as stTheme,
  $e as structuredText
};
//# sourceMappingURL=st-panel.js.map
