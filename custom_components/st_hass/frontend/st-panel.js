var ee = Object.defineProperty;
var te = (s, e, t) => e in s ? ee(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var u = (s, e, t) => te(s, typeof e != "symbol" ? e + "" : e, t);
import { S as ie, c as oe, s as A, L as ne, E as T, H as se, a as ae, b as H, d as re, D as F, W as le, C as ce, e as O, l as de, h as he, f as ue, g as pe, i as ge, j as fe, k as be, m as me, n as ye, o as _e, p as ve, q as xe, r as we, t as Ce, u as ke, v as Se, w as Oe, x as Ee, y as Te, z as $e } from "./codemirror-Bci4DoMd.js";
import { W as m } from "./vendor-BhPS5zVw.js";
import { i as R, n as k, a as j, b as c, t as P, r as _ } from "./lit-C178dhqO.js";
import { s as De } from "./ha-websocket-DcUbagYv.js";
import { E as B, p as E, t as V, I as Ne, V as Ie, a as Fe, P as Re, b as je, c as Pe } from "./entity-browser-RyZfc2dh.js";
import { a as I } from "./analyzer-DbAWr__X.js";
import { P as Le } from "./project-Cbp2BmiW.js";
const Ae = ':root{--editor-bg: #1e1e1e;--editor-bg-light: #252526;--editor-fg: #d4d4d4;--editor-fg-dim: #808080;--editor-keyword: #569cd6;--editor-type: #4ec9b0;--editor-function: #dcdcaa;--editor-variable: #9cdcfe;--editor-string: #ce9178;--editor-number: #b5cea8;--editor-comment: #6a9955;--editor-pragma: #c586c0;--editor-operator: #d4d4d4;--editor-invalid: #ff0000;--editor-selection: #264f78;--editor-selection-bg: rgba(38, 79, 120, .5);--editor-line-highlight: #2a2d2e;--editor-gutter-bg: #1e1e1e;--editor-gutter-fg: #858585;--editor-border: #404040;--editor-cursor: #aeafad;--editor-tooltip-bg: #252526;--ui-primary: var(--primary-color, #18b7e6);--ui-primary-strong: #0d7fa6;--ui-primary-soft: rgba(24, 183, 230, .14);--ui-bg: #091119;--ui-bg-secondary: #0e1822;--ui-bg-card: #101c27;--ui-bg-card-strong: #132331;--ui-bg-header: #0c1a24;--ui-bg-inset: #0a141d;--ui-bg-elevated: #162633;--ui-text-primary: #edf6ff;--ui-text-secondary: #8ea6bd;--ui-text-muted: #668097;--ui-text-header: #f4fbff;--ui-text-on-primary: #07141d;--ui-divider: rgba(140, 169, 193, .18);--ui-divider-strong: rgba(140, 169, 193, .32);--ui-success: #4fd39e;--ui-error: #ff7272;--ui-warning: #ffbf47;--ui-info: #6bc9ff;--ui-disabled: #6c8194;--status-online: #4fd39e;--status-paused: #ffbf47;--status-connecting: #6bc9ff;--status-disconnected: #7e8f9f;--status-error: #ff7272;--font-mono: "Fira Code", "Consolas", "Courier New", monospace;--font-ui: "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;--font-size-xs: 11px;--font-size-sm: 12px;--font-size-base: 13px;--font-size-md: 14px;--font-size-lg: 16px;--font-size-xl: 18px;--font-size-2xl: 20px;--font-size-3xl: 26px;--font-size-editor: 14px;--font-size-diagnostics: 12px;--font-weight-normal: 400;--font-weight-medium: 500;--font-weight-semibold: 600;--font-weight-bold: 700;--space-1: 4px;--space-2: 8px;--space-3: 12px;--space-4: 16px;--space-5: 20px;--space-6: 24px;--space-8: 32px;--radius-sm: 6px;--radius-md: 10px;--radius-lg: 16px;--radius-xl: 20px;--radius-pill: 999px;--shadow-soft: 0 12px 30px rgba(0, 0, 0, .22);--shadow-popover: 0 16px 32px rgba(0, 0, 0, .28);--shadow-focus-ring: 0 0 0 3px rgba(24, 183, 230, .32);--shadow-header: inset 0 -1px 0 rgba(255, 255, 255, .04);--sidebar-width-min: 240px;--sidebar-width-default: 320px;--sidebar-width-max: 400px;--transition-fast: all .16s ease;--transition-medium: all .24s ease;--transition-slow: all .32s ease;--focus-ring: 2px solid rgba(91, 212, 255, .7);--focus-ring-offset: 2px}@media (prefers-reduced-motion: reduce){:root{--transition-fast: none;--transition-medium: none;--transition-slow: none}}.st-h1{margin:0;font-family:var(--font-ui);font-size:var(--font-size-3xl);font-weight:700;letter-spacing:-.03em;color:var(--ui-text-header)}.st-h2{margin:0;font-family:var(--font-ui);font-size:var(--font-size-xl);font-weight:600;color:var(--ui-text-primary)}.st-body{font-family:var(--font-ui);font-size:var(--font-size-md);color:var(--ui-text-primary)}.st-body-sm{font-family:var(--font-ui);font-size:var(--font-size-sm);color:var(--ui-text-secondary)}.st-mono{font-family:var(--font-mono);font-size:var(--font-size-diagnostics);color:var(--ui-text-primary)}.st-btn-primary,.st-btn-secondary,.st-btn-ghost{display:inline-flex;align-items:center;gap:var(--space-2);border-radius:var(--radius-md);cursor:pointer;font-family:var(--font-ui);font-size:var(--font-size-md);font-weight:600;transition:var(--transition-medium)}.st-btn-primary{padding:10px 16px;border:1px solid transparent;background:linear-gradient(135deg,var(--ui-primary),#4ad7ff);color:var(--ui-text-on-primary);box-shadow:0 10px 20px #18b7e62e}.st-btn-secondary{padding:9px 14px;border:1px solid var(--ui-divider-strong);background:#ffffff0a;color:var(--ui-text-primary)}.st-btn-ghost{padding:8px 12px;border:1px solid transparent;background:transparent;color:var(--ui-text-secondary)}.st-btn-primary:hover,.st-btn-secondary:hover,.st-btn-ghost:hover{transform:translateY(-1px)}.st-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--ui-divider);border-radius:999px;background:#ffffff0a;color:var(--ui-text-secondary);font-family:var(--font-ui);font-size:var(--font-size-sm);line-height:1}.st-status-ok{color:var(--ui-success)}.st-status-error{color:var(--ui-error)}.st-status-warning{color:var(--ui-warning)}.st-status-info{color:var(--ui-info)}', K = [
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
], W = [
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
], G = [
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
], q = [
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
], Be = [
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
], U = ie.define({
  name: "structuredtext",
  startState() {
    return { inBlockComment: !1 };
  },
  copyState(s) {
    return { inBlockComment: s.inBlockComment };
  },
  token(s, e) {
    if (s.eatSpace()) return null;
    if (s.match("(*") && (e.inBlockComment = !0), e.inBlockComment) {
      for (; !s.eol(); ) {
        if (s.match("*)"))
          return e.inBlockComment = !1, "comment";
        s.next();
      }
      return "comment";
    }
    if (s.match("//"))
      return s.skipToEnd(), "comment";
    if (s.match("{")) {
      let t = 1;
      for (; !s.eol() && t > 0; ) {
        const i = s.next();
        i === "{" && t++, i === "}" && t--;
      }
      return "meta";
    }
    if (s.match("'")) {
      for (; !s.eol(); )
        if (s.next() === "'" && !s.match("'"))
          return "string";
      return "string";
    }
    if (s.match(/T#[\d_hmsdu]+/i) || s.match(/TIME#[\d_hmsdu]+/i) || s.match(/16#[\da-fA-F_]+/) || s.match(/2#[01_]+/) || s.match(/8#[0-7_]+/) || s.match(/\d+\.\d+([eE][+-]?\d+)?/) || s.match(/\d+/))
      return "number";
    if (s.match(":=") || s.match("<=") || s.match(">=") || s.match("<>") || s.match("=>"))
      return "operator";
    if (s.match(/%[IQM][XBWDLxbwdl]?\*?/i))
      return "keyword";
    if (s.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const t = s.current().toUpperCase();
      return K.includes(t) ? "keyword" : W.includes(t) ? "typeName" : G.includes(t) ? "function.standard" : q.includes(t) ? "className" : "variableName";
    }
    return s.match(/[+\-*=<>()[\];:,.]/) ? "operator" : (s.next(), null);
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] }
  }
}), Ve = oe([
  ...K.filter((s) => s !== "PROGRAM" && s !== "IF").map((s) => ({ label: s, type: "keyword" })),
  ...W.map((s) => ({ label: s, type: "type" })),
  ...G.map((s) => ({ label: s, type: "function" })),
  ...q.map((s) => ({ label: s, type: "class" })),
  ...Be.map((s) => ({
    label: `{${s}}`,
    type: "keyword",
    detail: "pragma"
  })),
  A(`PROGRAM \${ProgramName}
VAR
	\${}
END_VAR

\${}
END_PROGRAM`, {
    label: "PROGRAM",
    type: "keyword",
    detail: "template"
  }),
  A("IF ${TRUE} THEN\n	${}\nEND_IF", {
    label: "IF",
    type: "keyword",
    detail: "template"
  })
]);
function Ue() {
  return new ne(U, [
    U.data.of({ autocomplete: Ve })
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
}, ze = T.theme(
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
), Me = se.define([
  { tag: m.keyword, color: d.keyword, fontWeight: "bold" },
  { tag: m.typeName, color: d.type },
  {
    tag: [m.function(m.variableName), m.standard(m.function(m.variableName))],
    color: d.function
  },
  { tag: m.className, color: d.type },
  { tag: m.variableName, color: d.variable },
  { tag: m.propertyName, color: d.variable },
  { tag: m.string, color: d.string },
  { tag: m.number, color: d.number },
  { tag: m.comment, color: d.comment, fontStyle: "italic" },
  { tag: m.meta, color: d.pragma },
  { tag: m.operator, color: d.fg },
  { tag: m.invalid, color: "#ff0000", textDecoration: "underline wavy" }
]);
function He() {
  return [ze, ae(Me)];
}
class Ke {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "connection");
    // HomeAssistant WebSocket connection
    u(this, "bindings", /* @__PURE__ */ new Map());
    u(this, "entityStates", /* @__PURE__ */ new Map());
    u(this, "liveValues", /* @__PURE__ */ new Map());
    u(this, "subscribers", /* @__PURE__ */ new Set());
    u(this, "unsubscribe", null);
    u(this, "subscriptionVersion", 0);
    u(this, "status", "disconnected");
    u(this, "updateRate", 100);
    u(this, "showConditions", !0);
    u(this, "highlightChanges", !0);
    this.connection = e;
  }
  /**
   * Start online mode with given variable bindings
   */
  async start(e) {
    if (this.unsubscribe || this.status === "connecting") return;
    const t = ++this.subscriptionVersion;
    this.bindings.clear();
    for (const i of e)
      this.bindings.set(i.variableName, i);
    this.status = "connecting", this.notifySubscribers();
    try {
      this.unsubscribe = De(
        this.connection,
        (i) => {
          t === this.subscriptionVersion && this.handleHassEntityUpdate(i);
        }
      ), this.status = "online", this.notifySubscribers();
    } catch (i) {
      throw this.subscriptionVersion++, this.status = "error", this.notifySubscribers(), i;
    }
  }
  /**
   * Stop online mode
   */
  stop() {
    this.subscriptionVersion++, this.unsubscribe && (this.unsubscribe(), this.unsubscribe = null), this.status = "disconnected", this.bindings.clear(), this.entityStates.clear(), this.liveValues.clear(), this.notifySubscribers();
  }
  /**
   * Pause/resume updates
   */
  setPaused(e) {
    this.status !== "online" && this.status !== "paused" || (this.status = e ? "paused" : "online", this.notifySubscribers());
  }
  setUpdateRate(e) {
    this.updateRate = e, this.notifySubscribers();
  }
  setShowConditions(e) {
    this.showConditions = e, this.notifySubscribers();
  }
  setHighlightChanges(e) {
    this.highlightChanges = e, this.notifySubscribers();
  }
  /**
   * Subscribe to state changes
   */
  subscribe(e) {
    return this.subscribers.add(e), () => this.subscribers.delete(e);
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
  getLiveValue(e) {
    return this.liveValues.get(e) || null;
  }
  // ==========================================================================
  // Internal Methods
  // ==========================================================================
  /**
   * Handle entity updates from home-assistant-js-websocket
   * Converts HassEntities to our internal EntityState format
   */
  handleHassEntityUpdate(e) {
    if (this.status === "paused") return;
    const t = {};
    for (const [i, o] of Object.entries(e))
      t[i] = {
        entityId: o.entity_id,
        state: o.state,
        lastChanged: o.last_changed,
        attributes: o.attributes
      };
    this.handleEntityUpdate(t);
  }
  handleEntityUpdate(e) {
    if (this.status === "paused") return;
    const t = Date.now();
    for (const [i, o] of Object.entries(e))
      this.entityStates.set(i, o);
    for (const [i, o] of this.bindings) {
      const n = this.entityStates.get(o.entityId);
      if (!n) continue;
      const a = this.parseValue(n.state, o.dataType), l = this.liveValues.get(i), r = {
        binding: o,
        currentValue: a,
        previousValue: l == null ? void 0 : l.currentValue,
        hasChanged: l ? l.currentValue.raw !== a.raw : !1,
        lastUpdate: t
      };
      this.liveValues.set(i, r);
    }
    this.notifySubscribers();
  }
  parseValue(e, t) {
    if (["unavailable", "unknown", "none", ""].includes(e.toLowerCase()))
      return {
        raw: e,
        formatted: "—",
        isValid: !1,
        dataType: "UNKNOWN"
      };
    switch (t.toUpperCase()) {
      case "BOOL": {
        const o = ["on", "true", "1"].includes(e.toLowerCase());
        return {
          raw: e,
          formatted: o ? "TRUE" : "FALSE",
          isValid: !0,
          dataType: "BOOL"
        };
      }
      case "INT":
      case "DINT": {
        const o = Number.parseInt(e, 10);
        return {
          raw: e,
          formatted: Number.isNaN(o) ? "—" : String(o),
          isValid: !Number.isNaN(o),
          dataType: "INT"
        };
      }
      case "REAL":
      case "LREAL": {
        const o = Number.parseFloat(e);
        return {
          raw: e,
          formatted: Number.isNaN(o) ? "—" : o.toFixed(2),
          isValid: !Number.isNaN(o),
          dataType: "REAL"
        };
      }
      case "STRING":
        return {
          raw: e,
          formatted: e.length > 20 ? e.substring(0, 17) + "..." : e,
          isValid: !0,
          dataType: "STRING"
        };
      case "TIME":
        return {
          raw: e,
          formatted: e,
          isValid: !0,
          dataType: "TIME"
        };
      default:
        return {
          raw: e,
          formatted: e,
          isValid: !0,
          dataType: "UNKNOWN"
        };
    }
  }
  notifySubscribers() {
    const e = this.getState();
    for (const t of this.subscribers)
      t(e);
  }
}
class z {
  /**
   * Format value for display with appropriate styling
   */
  static format(e) {
    if (!e.isValid)
      return { text: e.formatted, className: "st-live-value--invalid" };
    switch (e.dataType) {
      case "BOOL":
        return {
          text: e.formatted,
          className: e.formatted === "TRUE" ? "st-live-value--bool-true" : "st-live-value--bool-false"
        };
      case "INT":
        return { text: e.formatted, className: "st-live-value--int" };
      case "REAL":
        return { text: e.formatted, className: "st-live-value--real" };
      case "STRING":
        return {
          text: `"${e.formatted}"`,
          className: "st-live-value--string"
        };
      default:
        return { text: e.formatted, className: "st-live-value--unknown" };
    }
  }
  /**
   * Format with change highlight
   */
  static formatWithChange(e) {
    const t = this.format(e.currentValue);
    return e.hasChanged && (t.className += " st-live-value--changed"), t;
  }
}
const Y = H.define();
H.define();
class We extends le {
  constructor(e, t) {
    super(), this.value = e, this.showChange = t;
  }
  toDOM() {
    const e = document.createElement("span");
    e.className = "st-live-value-widget";
    const t = this.showChange ? z.formatWithChange(this.value) : z.format(this.value.currentValue), i = document.createElement("span");
    return i.className = `st-live-value ${t.className}`, i.textContent = t.text, i.title = `${this.value.binding.entityId}
Last update: ${new Date(this.value.lastUpdate).toLocaleTimeString()}`, e.appendChild(i), e;
  }
  eq(e) {
    return this.value.currentValue.raw === e.value.currentValue.raw && this.value.hasChanged === e.value.hasChanged;
  }
  ignoreEvent() {
    return !1;
  }
}
const Ge = re.define({
  create() {
    return F.none;
  },
  update(s, e) {
    for (const t of e.effects)
      if (t.is(Y))
        return qe(e.state.doc.toString(), t.value);
    return e.docChanged && (s = s.map(e.changes)), s;
  },
  provide: (s) => T.decorations.from(s)
});
function qe(s, e) {
  const t = [], i = s.split(`
`);
  let o = 0;
  for (let n = 0; n < i.length; n++) {
    const a = i[n], l = o + a.length;
    for (const [, r] of e)
      if (r.binding.line === n + 1) {
        const h = F.widget({
          widget: new We(r, !0),
          side: 1
        });
        t.push({
          from: l,
          to: l,
          decoration: h
        });
      }
    o = l + 1;
  }
  return t.sort((n, a) => n.from - a.from), F.set(
    t.map((n) => n.decoration.range(n.from, n.to))
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
function Xe() {
  return [Ge, Ye];
}
function Qe(s, e) {
  s.dispatch({
    effects: Y.of(e)
  });
}
var X = Object.defineProperty, Je = Object.getOwnPropertyDescriptor, Ze = (s, e, t) => e in s ? X(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t, N = (s, e, t, i) => {
  for (var o = i > 1 ? void 0 : i ? Je(e, t) : e, n = s.length - 1, a; n >= 0; n--)
    (a = s[n]) && (o = (i ? a(e, t, o) : a(o)) || o);
  return i && o && X(e, t, o), o;
}, et = (s, e, t) => Ze(s, e + "", t);
let C = class extends j {
  constructor() {
    super();
    u(this, "_editor", null);
    u(this, "_readOnlyCompartment", new ce());
    u(this, "_onlineManager", null);
    u(this, "_onlineUnsubscribe", null);
    this.code = "", this.readOnly = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasUpdated && this._initEditor();
  }
  updated(e) {
    if (!this._editor) {
      this.isConnected && this._initEditor();
      return;
    }
    e.has("readOnly") && this._editor.dispatch({
      effects: this._readOnlyCompartment.reconfigure(
        O.readOnly.of(this.readOnly)
      )
    }), e.has("code") && this.getCode() !== this.code && this._editor.setState(this._createEditorState());
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), this.stopOnlineMode(), (e = this._editor) == null || e.destroy(), this._editor = null;
  }
  /**
   * Start online mode with variable bindings
   */
  async startOnlineMode(e) {
    var t;
    if (!((t = this.hass) != null && t.connection))
      throw new Error("Home Assistant connection not available");
    this._onlineManager || (this._onlineManager = new Ke(this.hass.connection), this._onlineUnsubscribe = this._onlineManager.subscribe((i) => {
      this._editor && i.liveValues && Qe(this._editor, i.liveValues);
    })), await this._onlineManager.start(e);
  }
  /**
   * Stop online mode
   */
  stopOnlineMode() {
    var e, t;
    (e = this._onlineManager) == null || e.stop(), (t = this._onlineUnsubscribe) == null || t.call(this), this._onlineManager = null, this._onlineUnsubscribe = null;
  }
  /**
   * Pause/resume online mode
   */
  setOnlinePaused(e) {
    var t;
    (t = this._onlineManager) == null || t.setPaused(e);
  }
  setOnlineSettings(e) {
    this._onlineManager && (typeof e.updateRate == "number" && this._onlineManager.setUpdateRate(e.updateRate), typeof e.showConditions == "boolean" && this._onlineManager.setShowConditions(e.showConditions), typeof e.highlightChanges == "boolean" && this._onlineManager.setHighlightChanges(e.highlightChanges));
  }
  /**
   * Get current online state
   */
  getOnlineState() {
    var e;
    return ((e = this._onlineManager) == null ? void 0 : e.getState()) || null;
  }
  _initEditor() {
    var t;
    const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector("#editor-container");
    e && (this._editor = new T({
      state: this._createEditorState(),
      parent: e,
      dispatchTransactions: (i, o) => {
        o.update(i), i.some((n) => n.docChanged) && (this.code = o.state.doc.toString(), this.dispatchEvent(
          new CustomEvent("code-change", {
            detail: { code: this.code },
            bubbles: !0,
            composed: !0
          })
        ));
      }
    }));
  }
  _createEditorState() {
    const e = [
      de(),
      he(),
      ue(),
      pe(),
      ge(),
      fe(),
      O.allowMultipleSelections.of(!0),
      be(),
      me(),
      ye(),
      _e(),
      ve(),
      xe(),
      we.of([
        ...Ce,
        ...ke,
        ...Se,
        ...Oe,
        ...Ee,
        ...Te,
        $e
      ]),
      Ue(),
      He(),
      Xe(),
      T.domEventHandlers({
        keydown: this._stopKeyPropagation,
        keyup: this._stopKeyPropagation,
        keypress: this._stopKeyPropagation,
        dragover: (t) => {
          var i;
          return (i = t.dataTransfer) != null && i.types.includes(B) ? (t.preventDefault(), t.stopPropagation(), t.dataTransfer.dropEffect = "copy", !0) : !1;
        },
        drop: (t) => {
          var o;
          const i = (o = t.dataTransfer) == null ? void 0 : o.getData(B);
          return i ? (t.preventDefault(), t.stopPropagation(), this.dispatchEvent(new CustomEvent("binding-feedback", {
            detail: this.insertBinding(i),
            bubbles: !0,
            composed: !0
          })), !0) : !1;
        }
      }),
      this._readOnlyCompartment.of(O.readOnly.of(this.readOnly)),
      O.tabSize.of(4)
    ];
    return O.create({ doc: this.code, extensions: e });
  }
  _stopKeyPropagation(e) {
    return e.stopPropagation(), !1;
  }
  insertBinding(e) {
    if (!this._editor || this.readOnly) return "Open an editable file to insert a binding.";
    const t = e.trim().match(/^(\w+)\s+AT\s+(%[IQ]\*)\s*:\s*\w+\s*:=\s*'([^']+)'\s*;$/i);
    if (!t) return "This entity binding could not be inserted.";
    const i = this.getCode(), { ast: o } = E(i);
    if (!o) return "Fix the Structured Text syntax before inserting a binding.";
    const [, n, a, l] = t, r = a.toUpperCase() === "%I*" ? "INPUT" : "OUTPUT";
    if (o.variables.some(
      (w) => {
        var S;
        return ((S = w.binding) == null ? void 0 : S.entityId) === l && w.binding.direction === r;
      }
    ))
      return `${l} already has an ${r.toLowerCase()} binding.`;
    const h = V(n).tokens, v = h.length === 1 && h[0].tokenType === Ne ? n : `entity_${n}`, f = new Set(o.variables.map((w) => w.name.toLowerCase()));
    let b = v;
    for (let w = 2; f.has(b.toLowerCase()); w++)
      b = `${v}_${w}`;
    const p = b + t[0].slice(n.length), { insertPos: x, content: D } = this._getBindingInsertTarget(i, p, r);
    return this._editor.dispatch({
      changes: { from: x, insert: D },
      selection: { anchor: x + D.length }
    }), this._editor.focus(), `Inserted ${r.toLowerCase()} binding for ${l} as ${b}.`;
  }
  removeBinding(e) {
    if (!this._editor || this.readOnly) return "Open an editable file to remove a binding.";
    const t = this.getCode(), { ast: i } = E(t);
    if (!i) return "Fix the Structured Text syntax before removing a binding.";
    const o = i.variables.flatMap((n) => {
      var b, p;
      const a = n.location, l = ((b = n.pragmas[0]) == null ? void 0 : b.location) ?? a;
      if (((p = n.binding) == null ? void 0 : p.entityId) !== e || !l || !a) return [];
      const r = this._editor.state.doc.line(l.startLine), h = this._editor.state.doc.line(a.endLine), v = r.from + l.startColumn - 1, f = h.from + a.endColumn;
      return !t.slice(r.from, v).trim() && !t.slice(f, h.to).trim() ? [{ from: r.from, to: Math.min(t.length, h.to + 1) }] : [{ from: v, to: f }];
    });
    return o.length ? (this._editor.dispatch({ changes: o }), this._editor.focus(), `Removed binding for ${e}.`) : `No binding found for ${e}.`;
  }
  _getBindingInsertTarget(e, t, i) {
    const { tokens: o } = V(e), n = i === "INPUT" ? je : Pe, a = o.findIndex(
      (f) => f.tokenType === Ie || f.tokenType === n
    );
    if (a !== -1) {
      const f = o.slice(a + 1).find((Z) => Z.tokenType === Fe), b = e.lastIndexOf(`
`, f.startOffset - 1) + 1, p = e.slice(b, f.startOffset), x = o[a + 1], D = e.lastIndexOf(`
`, x.startOffset - 1) + 1, w = e.slice(D, x.startOffset), S = x !== f && !w.trim() ? w : "    ";
      return p.trim() ? { insertPos: f.startOffset, content: `
${S}${t}
` } : { insertPos: b, content: `${S}${t}
` };
    }
    const l = o.findIndex((f) => f.tokenType === Re), r = o[l + 2].startOffset, h = e.lastIndexOf(`
`, r - 1) + 1, v = e.slice(h, r).trim();
    return {
      insertPos: v ? r : h,
      content: `${v ? `
` : ""}VAR
    ${t}
END_VAR
`
    };
  }
  getCode() {
    var e;
    return ((e = this._editor) == null ? void 0 : e.state.doc.toString()) ?? this.code;
  }
  setCode(e) {
    var t;
    this.code = e, (t = this._editor) == null || t.setState(this._createEditorState());
  }
  focus() {
    var e;
    (e = this._editor) == null || e.focus();
  }
  render() {
    return c`<div id="editor-container"></div>`;
  }
};
et(C, "styles", R`
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
N([
  k({ type: String })
], C.prototype, "code", 2);
N([
  k({ type: Boolean, attribute: "read-only" })
], C.prototype, "readOnly", 2);
N([
  k({ attribute: !1 })
], C.prototype, "hass", 2);
C = N([
  P("st-editor")
], C);
var Q = Object.defineProperty, tt = Object.getOwnPropertyDescriptor, it = (s, e, t) => e in s ? Q(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t, L = (s, e, t, i) => {
  for (var o = i > 1 ? void 0 : i ? tt(e, t) : e, n = s.length - 1, a; n >= 0; n--)
    (a = s[n]) && (o = (i ? a(e, t, o) : a(o)) || o);
  return i && o && Q(e, t, o), o;
}, ot = (s, e, t) => it(s, e + "", t);
let $ = class extends j {
  constructor() {
    super();
    u(this, "_handleDocumentClick", null);
    u(this, "_handleKeyDown", null);
    this._showSettings = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._handleDocumentClick = (e) => {
      if (!this._showSettings) return;
      e.composedPath().includes(this) || (this._showSettings = !1);
    }, this._handleKeyDown = (e) => {
      e.key === "Escape" && this._showSettings && (this._showSettings = !1);
    }, document.addEventListener("click", this._handleDocumentClick, !0), document.addEventListener("keydown", this._handleKeyDown);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._handleDocumentClick && (document.removeEventListener("click", this._handleDocumentClick, !0), this._handleDocumentClick = null), this._handleKeyDown && (document.removeEventListener("keydown", this._handleKeyDown), this._handleKeyDown = null);
  }
  get statusText() {
    var t;
    return {
      disconnected: "Live values off",
      connecting: "Connecting",
      online: "Online",
      paused: "Paused",
      error: "Fault"
    }[((t = this.state) == null ? void 0 : t.status) || "disconnected"];
  }
  get isPaused() {
    var e;
    return ((e = this.state) == null ? void 0 : e.status) === "paused";
  }
  get canConnect() {
    var e;
    return ["disconnected", "error"].includes(
      ((e = this.state) == null ? void 0 : e.status) || "disconnected"
    );
  }
  render() {
    var e, t;
    return c`
      <div class="status">
        <span
          class="status-dot status-dot--${((e = this.state) == null ? void 0 : e.status) || "disconnected"}"
        ></span>
        <span class="status-text">${this.statusText}</span>
      </div>

      <div class="controls">
        ${this.canConnect ? c`
              <button @click=${this._handleConnect}>
                <ha-icon icon="mdi:play"></ha-icon>
                Connect
              </button>
            ` : c`
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

      ${(t = this.state) != null && t.liveValues.size ? c`<span class="stats">${this.state.liveValues.size} live values</span>` : ""}

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
    var e, t, i, o, n, a;
    return c`
      <div class="settings-panel">
        <div class="settings-title">Online Settings</div>
        <div class="setting">
          <label for="highlight">Highlight changes</label>
          <input
            type="checkbox"
            id="highlight"
            .checked=${(e = this.state) == null ? void 0 : e.highlightChanges}
            @change=${this._handleHighlightChange}
          />
        </div>
        <div class="setting">
          <label for="conditions">Show conditions</label>
          <input
            type="checkbox"
            id="conditions"
            .checked=${(t = this.state) == null ? void 0 : t.showConditions}
            @change=${this._handleConditionsChange}
          />
        </div>
        <div class="setting">
          <label for="rate">Update rate</label>
          <select id="rate" @change=${this._handleRateChange}>
            <option value="50" ?selected=${((i = this.state) == null ? void 0 : i.updateRate) === 50}>
              50ms
            </option>
            <option value="100" ?selected=${((o = this.state) == null ? void 0 : o.updateRate) === 100}>
              100ms
            </option>
            <option value="250" ?selected=${((n = this.state) == null ? void 0 : n.updateRate) === 250}>
              250ms
            </option>
            <option value="500" ?selected=${((a = this.state) == null ? void 0 : a.updateRate) === 500}>
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
  _handleHighlightChange(e) {
    const t = e.target.checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "highlightChanges", value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleConditionsChange(e) {
    const t = e.target.checked;
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "showConditions", value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleRateChange(e) {
    const t = Number.parseInt(e.target.value, 10);
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { setting: "updateRate", value: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
ot($, "styles", R`
    :host {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 12px;
      padding: 6px 16px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      border-bottom: 1px solid var(--divider-color, #ddd);
      position: relative;
      font-size: 13px;
    }

    .status,
    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      flex: none;
      border-radius: 50%;
      background: var(--secondary-text-color, #666);
    }

    .status-dot--online { background: var(--success-color, #2e7d32); }
    .status-dot--paused { background: var(--warning-color, #b26a00); }
    .status-dot--connecting { background: var(--primary-color, #03a9f4); }
    .status-dot--error { background: var(--error-color, #b00020); }

    button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      padding: 0 7px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    button:hover,
    button.active,
    button.settings-toggle.open {
      background: var(--secondary-background-color, #eee);
    }

    button:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }

    button.settings-toggle {
      min-width: 32px;
      justify-content: center;
    }

    ha-icon {
      --mdc-icon-size: 16px;
    }

    .spacer {
      flex: 1;
    }

    .settings-shell {
      position: relative;
      margin-left: auto;
    }

    .settings-panel {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 235px;
      padding: 12px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
      z-index: 4;
    }

    .settings-title {
      margin: 0 0 8px;
      font-weight: 600;
    }

    .setting {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
    }

    .setting select {
      background: var(--card-background-color, #fff);
      color: inherit;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      padding: 4px;
    }

    @media (max-width: 480px) {
      .stats {
        display: none;
      }
    }
  `);
L([
  k({ type: Object })
], $.prototype, "state", 2);
L([
  _()
], $.prototype, "_showSettings", 2);
$ = L([
  P("st-online-toolbar")
], $);
var J = Object.defineProperty, nt = Object.getOwnPropertyDescriptor, st = (s, e, t) => e in s ? J(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t, y = (s, e, t, i) => {
  for (var o = i > 1 ? void 0 : i ? nt(e, t) : e, n = s.length - 1, a; n >= 0; n--)
    (a = s[n]) && (o = (i ? a(e, t, o) : a(o)) || o);
  return i && o && J(e, t, o), o;
}, at = (s, e, t) => st(s, e + "", t);
const M = "Could not save this project in browser storage. Keep this tab open to retain your edits.";
let g = class extends j {
  constructor() {
    super();
    u(this, "_entityBrowserLoaded", !1);
    u(this, "_projectInitialization");
    u(this, "_onlineAttempt", 0);
    this.narrow = !1, this._showEntityBrowser = !1, this._project = null, this._storage = null, this._code = "", this._syntaxOk = !0, this._triggers = [], this._diagnostics = [], this._metadata = null, this._entityCount = 0, this._onlineState = this._createDisconnectedOnlineState(), this._isDeploying = !1, this._deployFeedback = null, this.addEventListener("binding-feedback", (e) => {
      this._showBindingFeedback(e.detail);
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._initializeProject();
  }
  disconnectedCallback() {
    this._handleOnlineDisconnect(), super.disconnectedCallback();
  }
  willUpdate(e) {
    var i;
    super.willUpdate(e);
    const t = e.get("hass");
    t != null && t.connection && t.connection !== ((i = this.hass) == null ? void 0 : i.connection) && this._handleOnlineDisconnect();
  }
  _initializeProject() {
    return this._projectInitialization ?? (this._projectInitialization = this._loadProject());
  }
  async _loadProject() {
    var t, i, o;
    if (this._project) {
      this._analyzeCode();
      return;
    }
    const e = this._storage ?? (this._storage = new Le(
      ((t = this.hass) == null ? void 0 : t.connection) ?? null,
      ((o = (i = this.hass) == null ? void 0 : i.config) == null ? void 0 : o.entry_id) ?? "default"
    ));
    try {
      const n = await e.loadProject();
      if (n) {
        if (n.activeFileId !== null) {
          const a = n.files.find((l) => l.id === n.activeFileId) ?? n.files[0];
          n.activeFileId = (a == null ? void 0 : a.id) ?? null, a && (a.isOpen = !0);
        }
        this._project = n;
      } else
        this._project = e.createDefaultProject(), this._saveProject();
    } catch (n) {
      console.error("Failed to load project", n), this._setDeployFeedback("error", "Could not load the project from browser storage.");
    }
    this._analyzeCode();
  }
  render() {
    var n, a, l;
    const e = this._diagnostics.filter(
      (r) => r.severity === "Error"
    ).length, t = this._diagnostics.filter(
      (r) => r.severity === "Warning"
    ).length, i = this._isDeploying, o = this._syntaxOk ? this._isDeploying ? "Deploy in progress" : "Deploy to Home Assistant" : "Show deploy errors";
    return c`
      <div class="container">
        <div class="toolbar" role="banner">
          <div class="toolbar-brand">
            ${this.narrow ? c`<button
                  class="menu-button"
                  type="button"
                  aria-label="Open Home Assistant menu"
                  @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
      bubbles: !0,
      composed: !0
    }))}
                ><ha-icon icon="mdi:menu"></ha-icon></button>` : ""}
            <h1 class="st-h1">ST for Home Assistant</h1>
          </div>
          <div class="toolbar-actions" role="group" aria-label="Panel actions">
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
              ?disabled=${i}
              title=${o}
              aria-label=${o}
            >
              <ha-icon
                icon=${this._isDeploying ? "mdi:progress-upload" : "mdi:rocket-launch"}
              ></ha-icon>
              <span class="deploy-label">${this._isDeploying ? "Deploying" : "Deploy"}</span>
            </button>
          </div>
        </div>
        ${this._deployFeedback ? c`
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
            ${this._project ? c`
                  <div class="tabs-container" role="tablist">
                    ${this._getOpenFiles().map(
      (r) => c`
                        <div class="tab-group">
                        <button
                          class="tab ${r.id === this._project.activeFileId ? "active" : ""}"
                          @click=${() => this._switchToFile(r.id)}
                          @auxclick=${(h) => {
        h.button === 1 && (h.preventDefault(), this._closeFile(r.id));
      }}
                          title=${r.path}
                          role="tab"
                          aria-selected=${r.id === this._project.activeFileId}
                        >
                          <span class="tab-label">${this._getFileDisplayName(r.name)}</span>
                          ${r.hasUnsavedChanges ? c`<div
                                class="unsaved-dot"
                                title="Unsaved changes"
                                aria-label="Unsaved changes"
                              ></div>` : ""}
                        </button>
                          <button
                            class="tab-close"
                            type="button"
                            @click=${(h) => {
        h.stopPropagation(), this._closeFile(r.id);
      }}
                            title="Close (middle-click also works)"
                            aria-label="Close ${r.name}"
                          >
                            <ha-icon icon="mdi:close"></ha-icon>
                          </button>
                        </div>
                      `
    )}
                  </div>
                ` : ""}
            <div class="editor-container">
              ${this._project && !this._project.activeFileId ? c`
                    <div class="empty-editor">
                      All files are closed. Open a file from the project explorer or create a new one.
                    </div>
                  ` : c`
                    <st-editor
                      .code=${this._getCurrentCode()}
                      .hass=${this.hass}
                      @code-change=${this._handleCodeChange}
                    ></st-editor>
                  `}
            </div>
            ${this._showEntityBrowser ? c`
                  <div
                    class="entity-overlay"
                    role="dialog"
                    aria-label="Entity Browser"
                    @keydown=${(r) => {
      r.key === "Escape" && (r.stopPropagation(), this._toggleEntityBrowser());
    }}
                  >
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
        ${this._diagnostics.length > 0 ? c`
              <details class="diagnostics-panel" open>
                <summary class="diagnostics-header">
                  <ha-icon icon="mdi:message-alert-outline"></ha-icon>
                  <span>Diagnostics (${this._diagnostics.length})</span>
                </summary>
                <div role="log" aria-label="Diagnostics" aria-live="polite">
                ${this._diagnostics.map(
      (r) => c`
                    <div
                      class="diagnostic diagnostic-${r.severity.toLowerCase()}"
                    >
                      <ha-icon
                        class="diagnostic-icon"
                        icon=${this._getDiagnosticIcon(r.severity)}
                      ></ha-icon>
                      <span class="diagnostic-location">
                        ${r.line ? `Ln ${r.line}, Col ${r.column || 0}` : ""}
                      </span>
                      <span class="diagnostic-message">
                        ${r.code ? c`<span class="diagnostic-code">${r.code}</span>` : ""}${r.message}
                      </span>
                    </div>
                  `
    )}
                </div>
              </details>
            ` : ""}
        <div class="status-bar" role="status" aria-live="polite">
          ${this._syntaxOk ? c`<span class="syntax-chip status-ok" aria-label="Syntax OK"
                >Syntax OK</span
              >` : c`<span class="syntax-chip status-error" aria-label="Syntax Error"
                >Syntax Error</span
              >`}
          ${e > 0 ? c`<span
                class="status-pill status-error"
                title="${e} error${e === 1 ? "" : "s"}"
              >
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                ${e} Error${e === 1 ? "" : "s"}
              </span>` : ""}
          ${t > 0 ? c`<span
                class="status-pill status-warning"
                title="${t} warning${t === 1 ? "" : "s"}"
              >
                <ha-icon icon="mdi:alert"></ha-icon>
                ${t} Warning${t === 1 ? "" : "s"}
              </span>` : ""}
          <span class="status-pill" title="Number of triggers">
            <ha-icon icon="mdi:flash"></ha-icon>
            Triggers: ${this._triggers.length}
          </span>
          <span class="status-pill" title="Bound entities">
            <ha-icon icon="mdi:link-variant"></ha-icon>
            Entities: ${this._entityCount}
          </span>
          ${(n = this._metadata) != null && n.mode ? c`<span class="status-pill" title="Execution mode">
                <ha-icon icon="mdi:cog-outline"></ha-icon>
                Mode: ${this._metadata.mode}
              </span>` : ""}
          ${(a = this._metadata) != null && a.hasPersistentVars ? c`<span class="status-pill status-accent" title="Persistent variables">
                <ha-icon icon="mdi:database-outline"></ha-icon>
                Persistent
              </span>` : ""}
          ${(l = this._metadata) != null && l.hasTimers ? c`<span class="status-pill status-accent" title="Timers used">
                <ha-icon icon="mdi:timer-outline"></ha-icon>
                Timers
              </span>` : ""}
        </div>
      </div>
    `;
  }
  _getDiagnosticIcon(e) {
    switch (e) {
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
  _getDeployFeedbackIcon(e) {
    switch (e) {
      case "success":
        return "mdi:check-circle";
      case "error":
        return "mdi:alert-circle";
      case "info":
      default:
        return "mdi:information";
    }
  }
  _setDeployFeedback(e, t) {
    this._deployFeedback = { tone: e, message: t };
  }
  _formatDeployError(e) {
    if (e instanceof Error && e.message)
      return e.message;
    if (typeof e == "string")
      return e;
    if (e && typeof e == "object") {
      const t = e;
      if (typeof t.message == "string" && t.message.trim())
        return t.message;
      if (t.body && typeof t.body == "object") {
        const i = t.body;
        if (typeof i.message == "string" && i.message.trim())
          return i.message;
        if (typeof i.error == "string" && i.error.trim())
          return i.error;
      }
      if (typeof t.error == "string" && t.error.trim())
        return t.error;
      try {
        return JSON.stringify(e);
      } catch {
        return "Deploy error";
      }
    }
    return "Deploy error";
  }
  _getFileDisplayName(e) {
    return e.replace(/\.st$/i, "");
  }
  _handleCodeChange(e) {
    const { code: t } = e.detail;
    if (this._project) {
      const i = this._project.files.find(
        (n) => {
          var a;
          return n.id === ((a = this._project) == null ? void 0 : a.activeFileId);
        }
      );
      if (!i || i.content === t) return;
      const o = {
        ...i,
        content: t,
        hasUnsavedChanges: !0,
        lastModified: Date.now()
      };
      this._updateProject(this._project.files.map(
        (n) => n.id === o.id ? o : n
      ));
    } else
      this._code = t, this._handleOnlineDisconnect(), this._analyzeCode();
  }
  _getCurrentCode() {
    var e;
    return this._project ? ((e = this._project.files.find(
      (t) => {
        var i;
        return t.id === ((i = this._project) == null ? void 0 : i.activeFileId);
      }
    )) == null ? void 0 : e.content) ?? "" : this._code;
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
    return this._project ? this._project.files.filter((e) => e.isOpen) : [];
  }
  _switchToFile(e) {
    !this._project || e === this._project.activeFileId || this._project.files.some((t) => t.id === e) && this._updateProject(this._project.files.map(
      (t) => t.id === e ? { ...t, isOpen: !0 } : t
    ), e);
  }
  _closeFile(e) {
    var n;
    if (!this._project) return;
    const t = this._project.files.find((a) => a.id === e);
    if (!(t != null && t.isOpen)) return;
    const i = this._project.files.map(
      (a) => a.id === e ? { ...a, isOpen: !1 } : a
    ), o = e === this._project.activeFileId ? ((n = i.find((a) => a.isOpen)) == null ? void 0 : n.id) ?? null : this._project.activeFileId;
    this._updateProject(i, o);
  }
  _handleFileOpen(e) {
    this._switchToFile(e.detail.fileId);
  }
  _handleFileSelected(e) {
    this._switchToFile(e.detail.fileId);
  }
  _handleFileRename(e) {
    if (!this._project) return;
    const { fileId: t, newName: i } = e.detail, o = this._project.files.find((r) => r.id === t), n = i.trim();
    if (!o || !n || n === o.name) return;
    if (n.includes("/") || n.includes("\\")) {
      this._setDeployFeedback("error", "Enter a file name without folder separators.");
      return;
    }
    const a = /\.st$/i.test(n) ? n : `${n}.st`, l = o.path.slice(0, o.path.lastIndexOf("/") + 1) + a;
    if (this._project.files.some(
      (r) => r.id !== t && r.path.toLowerCase() === l.toLowerCase()
    )) {
      this._setDeployFeedback("error", `A file named "${a}" already exists in this folder.`);
      return;
    }
    this._updateProject(this._project.files.map(
      (r) => r.id === t ? { ...r, name: a, path: l, lastModified: Date.now() } : r
    ));
  }
  _handleFileDeleted(e) {
    var n;
    if (!this._project) return;
    const { fileId: t } = e.detail, i = this._project.files.filter((a) => a.id !== t);
    if (i.length === this._project.files.length) return;
    let o = this._project.activeFileId;
    o === t && (o = ((n = i.find((a) => a.isOpen) ?? i[0]) == null ? void 0 : n.id) ?? null), this._updateProject(i.map(
      (a) => a.id === o ? { ...a, isOpen: !0 } : a
    ), o);
  }
  _handleFileCreated(e) {
    if (!this._project) return;
    const { file: t } = e.detail;
    this._updateProject([...this._project.files, t], t.id);
  }
  _updateProject(e, t = ((i) => (i = this._project) == null ? void 0 : i.activeFileId)() ?? null) {
    var l, r;
    if (!this._project) return;
    const o = t !== this._project.activeFileId, n = this._getCurrentCode();
    this._project = {
      ...this._project,
      files: e,
      activeFileId: t,
      lastModified: Date.now()
    };
    const a = this._getCurrentCode();
    (o || a !== n) && (this._handleOnlineDisconnect(), o && t && ((r = (l = this.shadowRoot) == null ? void 0 : l.querySelector("st-editor")) == null || r.setCode(a)), o && this._showBindingFeedback(""), this._analyzeCode()), this._saveProject();
  }
  async _saveProject() {
    var t;
    const e = this._project;
    if (!(!this._storage || !e))
      try {
        if (await this._storage.saveProject(e), this._project !== e) return;
        e.files.some((i) => i.hasUnsavedChanges) && (this._project = {
          ...e,
          files: e.files.map((i) => ({ ...i, hasUnsavedChanges: !1 }))
        }), ((t = this._deployFeedback) == null ? void 0 : t.message) === M && (this._deployFeedback = null);
      } catch (i) {
        this._project === e && this._setDeployFeedback("error", M), console.error("Failed to save project", i);
      }
  }
  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  _analyzeCode() {
    var o, n;
    const e = [];
    if (this._project && !this._project.activeFileId) {
      this._syntaxOk = !0, this._triggers = [], this._metadata = null, this._entityCount = 0, this._diagnostics = e;
      return;
    }
    const t = this._getCurrentCode(), i = E(t);
    if (i.errors.length > 0)
      for (const a of i.errors)
        e.push({
          severity: "Error",
          message: a.message,
          line: a.line,
          column: a.column
        });
    if (this._syntaxOk = i.success && i.ast !== void 0, i.success && i.ast) {
      const a = I(i.ast);
      for (const l of a.diagnostics)
        e.push({
          severity: l.severity,
          code: l.code,
          message: l.message,
          line: (o = l.location) == null ? void 0 : o.line,
          column: (n = l.location) == null ? void 0 : n.column
        });
      this._triggers = a.triggers, this._metadata = a.metadata, this._entityCount = a.dependencies.length;
    } else
      this._triggers = [], this._metadata = null, this._entityCount = 0;
    this._diagnostics = e;
  }
  async _handleDeploy() {
    var t, i, o;
    if (this._isDeploying) return;
    if (this._project && !this._project.activeFileId) {
      this._setDeployFeedback("error", "Open a file to deploy its program.");
      return;
    }
    if (!this._syntaxOk) {
      this._setDeployFeedback(
        "error",
        "Cannot deploy while syntax errors are present."
      ), console.error("Cannot deploy: syntax errors present");
      return;
    }
    if (!((t = this.hass) != null && t.connection) || typeof ((i = this.hass) == null ? void 0 : i.callApi) != "function") {
      this._setDeployFeedback(
        "error",
        "Cannot deploy because the Home Assistant connection is not available."
      ), console.error(
        "Cannot deploy: Home Assistant connection is not available"
      );
      return;
    }
    const e = E(this._getCurrentCode());
    if (!e.success || !e.ast) {
      this._setDeployFeedback("error", "Cannot deploy because parsing failed."), console.error("Cannot deploy: parsing failed");
      return;
    }
    this._isDeploying = !0, this._deployFeedback = null;
    try {
      const [{ transpile: n }, { deploy: a, HAApiClient: l }] = await Promise.all([
        import("./transpiler-deploy-BRwD3o3Z.js").then((p) => p.i),
        import("./transpiler-deploy-BRwD3o3Z.js").then((p) => p.a)
      ]), r = n(e.ast, "home"), h = r.diagnostics.find((p) => p.severity === "Error");
      if (h) {
        const p = h.stLine ? `Line ${h.stLine}: ` : "";
        this._setDeployFeedback(
          "error",
          `Cannot deploy. ${p}${h.message}`
        ), console.error(
          "Cannot deploy: transpiler reported errors",
          r.diagnostics
        );
        return;
      }
      const v = this.hass.states;
      if (v) {
        const p = I(e.ast).dependencies.find(
          ({ entityId: x }) => x && !Object.prototype.hasOwnProperty.call(v, x)
        );
        if (p) {
          const x = p.location ? `Line ${p.location.line}: ` : "";
          this._setDeployFeedback(
            "error",
            `Cannot deploy. ${x}Entity ${p.entityId} was not found in Home Assistant.`
          );
          return;
        }
      }
      const f = new l(this.hass), b = await a(f, r, {
        createBackup: !0
      });
      b.success ? (this._setDeployFeedback(
        "success",
        `Deploy successful (${b.transactionId}).`
      ), console.log("Deploy successful", b.transactionId)) : (this._setDeployFeedback(
        "error",
        ((o = b.errors[0]) == null ? void 0 : o.message) || "Deployment failed."
      ), console.error("Deploy failed", b.errors));
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
  _extractBindings(e) {
    const t = [];
    for (const i of e)
      !i.entityId || !i.location || t.push({
        variableName: i.variableName,
        entityId: i.entityId,
        dataType: i.dataType,
        line: i.location.line,
        column: i.location.column,
        endColumn: i.location.column + i.variableName.length,
        isInput: i.direction === "INPUT",
        isOutput: i.direction === "OUTPUT",
        isPersistent: !1
        // Will be determined from storage analysis if needed
      });
    return t;
  }
  async _handleOnlineConnect() {
    var l, r;
    const e = this._onlineState ?? this._createDisconnectedOnlineState();
    if (e.status !== "disconnected" && e.status !== "error") return;
    if (!this._syntaxOk) {
      this._setDeployFeedback("error", "Fix the syntax errors before connecting live values.");
      return;
    }
    if (!((l = this.hass) != null && l.connection)) {
      this._setDeployFeedback("error", "Cannot connect live values without a Home Assistant connection.");
      return;
    }
    const t = (r = this.shadowRoot) == null ? void 0 : r.querySelector("st-editor");
    if (!t) return;
    const i = E(this._getCurrentCode());
    if (!i.success || !i.ast)
      return;
    const o = I(i.ast), n = this._extractBindings(o.dependencies);
    if (!n.length) {
      this._setDeployFeedback("info", "Add an entity binding before connecting live values.");
      return;
    }
    this._deployFeedback = null;
    const a = ++this._onlineAttempt;
    this._onlineState = { ...e, status: "connecting" };
    try {
      if (await t.startOnlineMode(n), a !== this._onlineAttempt) return;
      t.setOnlineSettings(this._onlineState), this._onlineState = t.getOnlineState();
    } catch (h) {
      if (a !== this._onlineAttempt) return;
      t.stopOnlineMode(), this._onlineState = { ...this._onlineState ?? e, status: "error" }, console.error("Failed to start online mode", h);
    }
  }
  _handleOnlineDisconnect() {
    var e, t;
    !this._onlineState || this._onlineState.status === "disconnected" || (this._onlineAttempt++, (t = (e = this.shadowRoot) == null ? void 0 : e.querySelector("st-editor")) == null || t.stopOnlineMode(), this._onlineState = {
      ...this._onlineState,
      status: "disconnected",
      bindings: [],
      liveValues: /* @__PURE__ */ new Map()
    });
  }
  _handleOnlineTogglePause() {
    var t;
    const e = (t = this.shadowRoot) == null ? void 0 : t.querySelector(
      "st-editor"
    );
    if (e && this._onlineState) {
      const i = this._onlineState.status === "paused";
      e.setOnlinePaused(!i), this._onlineState = e.getOnlineState();
    }
  }
  _handleOnlineSettingChange(e) {
    var a;
    const t = this._onlineState ?? this._createDisconnectedOnlineState(), { setting: i, value: o } = e.detail;
    this._onlineState = {
      ...t,
      [i]: o
    };
    const n = (a = this.shadowRoot) == null ? void 0 : a.querySelector(
      "st-editor"
    );
    n == null || n.setOnlineSettings({
      updateRate: i === "updateRate" && typeof o == "number" ? o : void 0,
      showConditions: i === "showConditions" && typeof o == "boolean" ? o : void 0,
      highlightChanges: i === "highlightChanges" && typeof o == "boolean" ? o : void 0
    }), n && t.status !== "connecting" && (this._onlineState = n.getOnlineState() ?? this._onlineState);
  }
  async _toggleEntityBrowser() {
    var e, t, i;
    if (this._showEntityBrowser) {
      this._showEntityBrowser = !1, (t = (e = this.shadowRoot) == null ? void 0 : e.querySelector(".toolbar-button")) == null || t.focus();
      return;
    }
    try {
      this._entityBrowserLoaded || (await import("./entity-browser-RyZfc2dh.js").then((n) => n.i), this._entityBrowserLoaded = !0), this._showEntityBrowser = !0, await this.updateComplete;
      const o = (i = this.shadowRoot) == null ? void 0 : i.querySelector("st-entity-browser");
      await (o == null ? void 0 : o.focusSearch());
    } catch (o) {
      this._setDeployFeedback("error", `Could not open the entity browser: ${this._formatDeployError(o)}`);
    }
  }
  _handleInsertBinding(e) {
    var o, n;
    e.stopPropagation();
    const t = (o = this.shadowRoot) == null ? void 0 : o.querySelector("st-editor"), i = (n = e.detail) == null ? void 0 : n.bindingSyntax;
    i && this._showBindingFeedback(
      (t == null ? void 0 : t.insertBinding(i)) ?? "Open a file to insert a binding."
    );
  }
  _handleRemoveBinding(e) {
    var o, n;
    e.stopPropagation();
    const t = (o = this.shadowRoot) == null ? void 0 : o.querySelector("st-editor"), i = (n = e.detail) == null ? void 0 : n.entityId;
    i && this._showBindingFeedback(
      (t == null ? void 0 : t.removeBinding(i)) ?? "Open a file to remove a binding."
    );
  }
  _showBindingFeedback(e) {
    var i;
    const t = (i = this.shadowRoot) == null ? void 0 : i.querySelector("st-entity-browser");
    t == null || t.showBindingFeedback(e);
  }
};
at(g, "styles", R`
    :host {
      display: block;
      height: 100%;
      height: 100dvh;
      color: var(--primary-text-color, #212121);
      background: var(--primary-background-color, #fafafa);
      font-family: var(--paper-font-common-base_-_font-family, Roboto, sans-serif);
    }
    * { box-sizing: border-box; }
    .container { display: flex; flex-direction: column; height: 100%; min-height: 0; }
    .toolbar {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 12px 16px; background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #ddd);
    }
    .toolbar-brand { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .menu-button {
      display: grid; place-items: center; flex: none; width: 36px; height: 38px;
      padding: 0; border: 0; background: transparent; color: inherit;
    }
    .toolbar h1 { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 600; }
    .toolbar-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    button, summary { font: inherit; }
    button { cursor: pointer; }
    button:focus-visible, summary:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px;
    }
    .toolbar-button, .deploy-button, .entity-overlay-close {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      min-height: 38px; padding: 0 12px; border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px; background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121); font-weight: 500;
    }
    .toolbar-button:hover, .toolbar-button.active, .entity-overlay-close:hover {
      background: var(--secondary-background-color, #eee);
    }
    .deploy-button { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); border-color: transparent; }
    .deploy-button:hover { filter: brightness(.92); }
    .deploy-button:disabled { opacity: .6; cursor: wait; }
    .toolbar-icon, .deploy-button ha-icon { --mdc-icon-size: 18px; }
    .deploy-feedback { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--secondary-background-color, #eee); }
    .deploy-feedback.error { color: var(--error-color, #b00020); }
    .deploy-feedback.success { color: var(--success-color, #2e7d32); }
    .deploy-feedback ha-icon { --mdc-icon-size: 18px; flex: none; }
    .main-content { display: flex; flex: 1; min-height: 0; overflow: hidden; }
    .project-sidebar {
      display: flex; flex-direction: column; width: 230px; flex: 0 0 230px; min-height: 0;
      background: var(--secondary-background-color, #f3f3f3);
      border-right: 1px solid var(--divider-color, #ddd); overflow: auto;
    }
    .content-area { position: relative; display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
    .tabs-container { display: flex; flex: none; overflow-x: auto; background: var(--secondary-background-color, #f3f3f3); border-bottom: 1px solid var(--divider-color, #ddd); }
    .tab-group { display: flex; align-items: center; flex: none; background: var(--card-background-color, #fff); }
    .tab { display: inline-flex; align-items: center; gap: 8px; flex: none; max-width: 220px; min-height: 40px; padding: 0 12px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--secondary-text-color, #666); }
    .tab:hover { background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
    .tab.active { background: var(--card-background-color, #fff); border-bottom-color: var(--primary-color, #03a9f4); color: var(--primary-text-color, #212121); }
    .tab-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tab-close { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-right: 4px; border: 0; background: transparent; color: var(--secondary-text-color, #666); border-radius: 4px; }
    .tab-close:hover { background: var(--secondary-background-color, #eee); }
    .tab-close ha-icon { --mdc-icon-size: 16px; }
    .unsaved-dot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--warning-color, #ff9800); }
    .editor-container { flex: 1; min-height: 0; overflow: hidden; background: var(--card-background-color, #fff); }
    st-editor { display: block; height: 100%; overflow: hidden; }
    .empty-editor { display: flex; align-items: center; justify-content: center; height: 100%; padding: 24px; color: var(--secondary-text-color, #666); text-align: center; }
    .entity-overlay { position: absolute; inset: 0 0 0 auto; width: min(440px, 100%); display: flex; flex-direction: column; overflow: hidden; z-index: 3; background: var(--card-background-color, #fff); border-left: 1px solid var(--divider-color, #ddd); }
    .entity-overlay st-entity-browser { flex: 1; min-height: 0; }
    .entity-overlay-close { position: absolute; right: 8px; top: 8px; z-index: 2; width: 36px; padding: 0; }
    .entity-overlay-close ha-icon { --mdc-icon-size: 18px; }
    .diagnostics-panel { flex: none; max-height: 28%; overflow: auto; background: var(--card-background-color, #fff); border-top: 1px solid var(--divider-color, #ddd); }
    .diagnostics-header { display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-weight: 600; cursor: pointer; }
    .diagnostics-header::before { content: "▸"; }
    details[open] > .diagnostics-header::before { content: "▾"; }
    .diagnostics-header ha-icon, .diagnostic-icon { --mdc-icon-size: 18px; }
    .diagnostic { display: flex; align-items: baseline; gap: 10px; padding: 6px 16px; font-size: 13px; }
    .diagnostic-icon { flex: none; align-self: center; }
    .diagnostic-location { flex: none; color: var(--secondary-text-color, #666); }
    .diagnostic-message { overflow-wrap: anywhere; }
    .diagnostic-code { margin-right: 6px; color: var(--secondary-text-color, #666); }
    .diagnostic-error .diagnostic-icon { color: var(--error-color, #b00020); }
    .diagnostic-warning .diagnostic-icon { color: var(--warning-color, #b26a00); }
    .diagnostic-info .diagnostic-icon { color: var(--primary-color, #03a9f4); }
    .status-bar { display: flex; align-items: center; flex: none; flex-wrap: wrap; gap: 4px 16px; padding: 7px 16px; background: var(--secondary-background-color, #f3f3f3); border-top: 1px solid var(--divider-color, #ddd); font-size: 12px; }
    .status-pill, .syntax-chip { display: inline-flex; align-items: center; gap: 4px; }
    .status-pill ha-icon { --mdc-icon-size: 15px; }
    .status-ok { color: var(--success-color, #2e7d32); }
    .status-error { color: var(--error-color, #b00020); }
    .status-warning { color: var(--warning-color, #b26a00); }
    @media (max-width: 640px) {
      .toolbar { flex-wrap: wrap; gap: 8px; }
      .toolbar h1 { font-size: 16px; }
      .toolbar-actions { margin-left: auto; }
      .main-content { flex-direction: column; overflow: auto; }
      .project-sidebar { width: 100%; flex: 0 1 auto; max-height: 25vh; border-right: 0; border-bottom: 1px solid var(--divider-color, #ddd); }
      .content-area { flex: 1 0 300px; }
      .status-bar { gap: 4px 12px; }
    }
  `);
y([
  k({ attribute: !1 })
], g.prototype, "hass", 2);
y([
  k({ type: Boolean })
], g.prototype, "narrow", 2);
y([
  _()
], g.prototype, "_code", 2);
y([
  _()
], g.prototype, "_project", 2);
y([
  _()
], g.prototype, "_syntaxOk", 2);
y([
  _()
], g.prototype, "_triggers", 2);
y([
  _()
], g.prototype, "_diagnostics", 2);
y([
  _()
], g.prototype, "_metadata", 2);
y([
  _()
], g.prototype, "_entityCount", 2);
y([
  _()
], g.prototype, "_onlineState", 2);
y([
  _()
], g.prototype, "_showEntityBrowser", 2);
y([
  _()
], g.prototype, "_storage", 2);
y([
  _()
], g.prototype, "_isDeploying", 2);
y([
  _()
], g.prototype, "_deployFeedback", 2);
g = y([
  P("st-panel")
], g);
const rt = document.getElementById("st-ha-design-system");
if (!rt) {
  const s = document.createElement("style");
  s.id = "st-ha-design-system", s.textContent = Ae, document.head.appendChild(s);
}
console.log("ST for Home Assistant loaded");
export {
  C as STEditor,
  G as ST_BUILTINS,
  q as ST_FUNCTION_BLOCKS,
  K as ST_KEYWORDS,
  Be as ST_PRAGMAS,
  W as ST_TYPES,
  ze as stEditorTheme,
  Me as stHighlightStyle,
  He as stTheme,
  Ue as structuredText
};
//# sourceMappingURL=st-panel.js.map
