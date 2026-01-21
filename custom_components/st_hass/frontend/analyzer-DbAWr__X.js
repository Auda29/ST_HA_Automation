var A = Object.defineProperty;
var C = (i, e, t) => e in i ? A(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var l = (i, e, t) => C(i, typeof e != "symbol" ? e + "" : e, t);
const f = {
  // Warnings (W0xx)
  NO_TRIGGERS: "W001",
  MANY_TRIGGERS: "W002",
  UNUSED_INPUT: "W003",
  WRITE_TO_INPUT: "W004",
  READ_FROM_OUTPUT: "W005",
  // Info (I0xx)
  AUTO_TRIGGER: "I001",
  EXPLICIT_NO_TRIGGER: "I002",
  EDGE_TRIGGER_DETECTED: "I003",
  // Errors (E0xx)
  INVALID_ENTITY_ID: "E001"
};
var u = /* @__PURE__ */ ((i) => (i.DERIVED = "DERIVED", i.TRANSIENT = "TRANSIENT", i.PERSISTENT = "PERSISTENT", i))(u || {});
const c = {
  // Info
  AUTO_PERSISTENT: "I010",
  EXPLICIT_PERSISTENT: "I011",
  EXPLICIT_TRANSIENT: "I012",
  // Warnings
  SELF_REF_NOT_PERSISTENT: "W010",
  FB_INSTANCE_NOT_PERSISTENT: "W011",
  UNUSED_PERSISTENT: "W012",
  // Errors
  INVALID_HELPER_TYPE: "E010",
  CONFLICTING_PRAGMAS: "E011"
};
function I(i, e) {
  const t = {
    scope: "PROGRAM",
    inCondition: !1,
    inLoop: !1,
    path: ["PROGRAM"]
  };
  g(i.body, t, e), t.path.pop();
}
function g(i, e, t) {
  for (const a of i) {
    const n = {
      ...e,
      currentStatement: a,
      path: [...e.path]
    };
    P(a, n, t);
  }
}
function P(i, e, t) {
  switch (t.onStatement && t.onStatement(i, e), i.type) {
    case "Assignment":
      t.onAssignment && t.onAssignment(i, e), s(i.value, e, t);
      break;
    case "IfStatement":
      M(i, e, t);
      break;
    case "CaseStatement":
      O(i, e, t);
      break;
    case "ForStatement":
      U(i, e, t);
      break;
    case "WhileStatement":
      v(i, e, t);
      break;
    case "RepeatStatement":
      D(i, e, t);
      break;
    case "FunctionCallStatement":
      t.onFunctionCall && t.onFunctionCall(i.call, e);
      break;
  }
}
function M(i, e, t) {
  const a = { ...e, inCondition: !0 };
  s(i.condition, a, t), e.path.push("IF"), g(i.thenBranch, e, t);
  for (const n of i.elsifBranches)
    s(n.condition, a, t), g(n.body, e, t);
  i.elseBranch && g(i.elseBranch, e, t), e.path.pop();
}
function U(i, e, t) {
  const a = { ...e, inLoop: !0 };
  s(i.from, e, t), s(i.to, e, t), i.by && s(i.by, e, t), a.path.push("FOR"), g(i.body, a, t), a.path.pop();
}
function v(i, e, t) {
  const a = { ...e, inLoop: !0, inCondition: !0 };
  s(i.condition, a, t), a.path.push("WHILE"), a.inCondition = !1, g(i.body, a, t), a.path.pop();
}
function D(i, e, t) {
  const a = { ...e, inLoop: !0 };
  a.path.push("REPEAT"), g(i.body, a, t), a.inCondition = !0, s(i.condition, a, t), a.path.pop();
}
function O(i, e, t) {
  const { ...a } = e;
  a.inCondition = !0, s(i.selector, a, t), e.path.push("CASE");
  for (const n of i.cases) {
    for (const r of n.values)
      s(r, a, t);
    g(n.body, e, t);
  }
  i.elseCase && g(i.elseCase, e, t), e.path.pop();
}
function s(i, e, t) {
  switch (i.type) {
    case "VariableRef":
      t.onVariableRef && t.onVariableRef(i, e);
      break;
    case "BinaryExpression": {
      const a = i;
      t.onBinaryOp && t.onBinaryOp(a, e), s(a.left, e, t), s(a.right, e, t);
      break;
    }
    case "UnaryExpression":
      s(i.operand, e, t);
      break;
    case "FunctionCall":
      G(i, e, t);
      break;
    case "MemberAccess":
      s(i.object, e, t);
      break;
    case "ParenExpression":
      s(i.expression, e, t);
      break;
  }
}
function G(i, e, t) {
  t.onFunctionCall && t.onFunctionCall(i, e);
  for (const a of i.arguments)
    s(a.value, e, t);
}
function E(i, e) {
  const t = [], a = {
    onVariableRef: (n) => {
      t.push(n);
    }
  };
  return s(
    i,
    {
      scope: e.scope || "PROGRAM",
      inCondition: e.inCondition || !1,
      inLoop: e.inLoop || !1,
      path: e.path || ["PROGRAM"]
    },
    a
  ), t;
}
function V(i, e) {
  return E(i, {
    scope: "PROGRAM",
    inCondition: !1,
    inLoop: !1,
    path: []
  }).some((t) => t.name === e);
}
function F(i, e) {
  return {
    platform: "state",
    entity_id: i,
    not_from: ["unavailable", "unknown"],
    not_to: ["unavailable", "unknown"],
    id: e == null ? void 0 : e.id
  };
}
function L(i, e) {
  return {
    platform: "state",
    entity_id: i,
    from: "off",
    to: "on",
    edge: "rising",
    id: e
  };
}
function w(i, e) {
  return {
    platform: "state",
    entity_id: i,
    from: "on",
    to: "off",
    edge: "falling",
    id: e
  };
}
function h(i) {
  return i.map((e) => ({
    name: e.name.toLowerCase(),
    value: e.value
  }));
}
function $(i) {
  const e = h(i);
  if (p(e, "no_trigger"))
    return !1;
  const t = m(e, "edge");
  return t === "rising" || t === "falling" ? t : p(e, "trigger") ? !0 : null;
}
function p(i, e) {
  return i.some((t) => t.name === e);
}
function m(i, e) {
  const t = i.find((a) => a.name === e);
  if ((t == null ? void 0 : t.value) !== void 0)
    return String(t.value);
}
const k = [
  "sensor",
  "binary_sensor",
  "switch",
  "light",
  "input_boolean",
  "input_number",
  "input_select",
  "input_text",
  "number",
  "select",
  "button",
  "climate",
  "cover",
  "fan",
  "lock",
  "media_player",
  "automation",
  "script",
  "scene",
  "timer",
  "counter"
];
function W(i) {
  if (!i || typeof i != "string")
    return !1;
  const e = i.split(".");
  if (e.length !== 2)
    return !1;
  const [t, a] = e;
  return !(!k.includes(t) || !a || !/^[a-z0-9_]+$/.test(a));
}
class z {
  constructor(e) {
    l(this, "ast");
    l(this, "dependencies", []);
    l(this, "triggers", []);
    l(this, "diagnostics", []);
    l(this, "readVariables", /* @__PURE__ */ new Set());
    l(this, "writtenVariables", /* @__PURE__ */ new Set());
    l(this, "variableMap", /* @__PURE__ */ new Map());
    l(this, "detectedEdgeTriggers", []);
    this.ast = e;
  }
  /**
   * Main analysis entry point
   */
  analyze() {
    this.buildVariableMap(), this.extractDependencies(), this.analyzeUsage(), this.generateTriggers(), this.validate();
    const e = this.buildMetadata();
    return {
      triggers: this.triggers,
      dependencies: this.dependencies,
      diagnostics: this.diagnostics,
      metadata: e
    };
  }
  /**
   * Build a map of variable names to declarations for quick lookup
   */
  buildVariableMap() {
    if (!(!this.ast || !this.ast.variables))
      for (const e of this.ast.variables)
        this.variableMap.set(e.name, e);
  }
  /**
   * Extract entity dependencies from variable bindings
   */
  extractDependencies() {
    var e;
    if (this.ast.variables)
      for (const t of this.ast.variables) {
        const a = ((e = t.binding) == null ? void 0 : e.entityId) || this.extractEntityId(t);
        if (!a && !t.binding)
          continue;
        let n;
        if (t.section === "VAR_INPUT")
          n = "INPUT";
        else if (t.section === "VAR_OUTPUT")
          n = "OUTPUT";
        else if (t.binding)
          n = t.binding.direction;
        else
          continue;
        const r = {
          variableName: t.name,
          entityId: a,
          direction: n,
          dataType: t.dataType.name,
          isTrigger: !1,
          // Will be determined later
          location: t.location ? {
            line: t.location.startLine,
            column: t.location.startColumn
          } : void 0
        };
        a && !W(a) && this.addDiagnostic(
          "Error",
          f.INVALID_ENTITY_ID,
          `Invalid entity ID format: ${a}`,
          r.location
        ), this.dependencies.push(r);
      }
  }
  /**
   * Fallback method to extract entity ID from initialValue
   * Used when EntityBinding doesn't have entityId set (backward compatibility)
   */
  extractEntityId(e) {
    if (e.initialValue && e.initialValue.type === "Literal" && e.initialValue.kind === "string")
      return e.initialValue.value;
  }
  /**
   * Analyze variable usage patterns throughout the code
   * Also detects R_TRIG/F_TRIG function block usage for edge triggers
   */
  analyzeUsage() {
    I(this.ast, {
      onVariableRef: (e) => {
        this.readVariables.add(e.name);
      },
      onAssignment: (e) => {
        if (typeof e.target == "string")
          this.writtenVariables.add(e.target);
        else {
          let a = e.target;
          for (; a.type === "MemberAccess"; )
            a = a.object;
          a.type === "VariableRef" && this.writtenVariables.add(a.name);
        }
        const t = E(e.value, {
          scope: "PROGRAM",
          inCondition: !1,
          inLoop: !1,
          path: []
        });
        for (const a of t)
          this.readVariables.add(a.name);
      },
      onFunctionCall: (e) => {
        const t = e.name.toUpperCase();
        (t === "R_TRIG" || t === "F_TRIG") && this.handleEdgeTriggerFB(e, t === "R_TRIG" ? "rising" : "falling");
      }
    });
  }
  /**
   * Handle R_TRIG/F_TRIG function block detection
   * When these FBs are used on input variables, automatically generate edge triggers
   */
  handleEdgeTriggerFB(e, t) {
    if (e.arguments.length > 0) {
      const a = E(e.arguments[0].value, {
        scope: "PROGRAM",
        inCondition: !1,
        inLoop: !1,
        path: []
      });
      for (const n of a) {
        const r = this.dependencies.find((o) => o.variableName === n.name);
        r && r.direction === "INPUT" && (this.detectedEdgeTriggers.push({
          variableName: n.name,
          edge: t,
          location: r.location
        }), this.addDiagnostic(
          "Info",
          f.EDGE_TRIGGER_DETECTED,
          `${t === "rising" ? "R_TRIG" : "F_TRIG"} detected on '${n.name}' - will generate ${t} edge trigger`,
          r.location
        ));
      }
    }
  }
  /**
   * Generate triggers based on INPUT variables and pragmas
   */
  generateTriggers() {
    for (const e of this.dependencies) {
      if (e.direction !== "INPUT")
        continue;
      const t = this.variableMap.get(e.variableName);
      if (!t) continue;
      const a = $(t.pragmas), n = h(t.pragmas);
      if (p(n, "trigger") && this.addDiagnostic(
        "Info",
        f.AUTO_TRIGGER,
        `Variable '${e.variableName}' explicitly marked as trigger`,
        e.location
      ), p(n, "no_trigger") && this.addDiagnostic(
        "Info",
        f.EXPLICIT_NO_TRIGGER,
        `Variable '${e.variableName}' explicitly excluded from triggers`,
        e.location
      ), a === !1 || !e.entityId)
        continue;
      const r = this.detectedEdgeTriggers.find(
        (T) => T.variableName === e.variableName
      ), o = this.createTrigger(e, a, r == null ? void 0 : r.edge);
      o && (this.triggers.push(o), e.isTrigger = !0);
    }
    this.triggers = this.deduplicateTriggers(this.triggers);
  }
  deduplicateTriggers(e) {
    const t = /* @__PURE__ */ new Set();
    return e.filter((a) => {
      const n = Array.isArray(a.from) ? a.from.join(",") : a.from || "", r = Array.isArray(a.to) ? a.to.join(",") : a.to || "", o = `${a.platform}:${a.entity_id}:${n}:${r}:${a.edge || ""}`;
      return t.has(o) ? !1 : (t.add(o), !0);
    });
  }
  createTrigger(e, t, a) {
    if (!e.entityId) return null;
    const n = t === "rising" || t === "falling" ? t : a;
    return n === "rising" ? L(e.entityId, e.variableName) : n === "falling" ? w(e.entityId, e.variableName) : F(e.entityId, { id: e.variableName });
  }
  /**
   * Validate usage patterns and generate diagnostics
   */
  validate() {
    this.triggers.length === 0 && this.addDiagnostic(
      "Warning",
      f.NO_TRIGGERS,
      "No triggers detected. Program will never execute automatically. Add {trigger} pragma to input variables or ensure inputs are read in code."
    ), this.triggers.length > 10 && this.addDiagnostic(
      "Info",
      f.MANY_TRIGGERS,
      `Program triggers on ${this.triggers.length} entities. Consider using {no_trigger} pragma on less important inputs.`
    );
    for (const e of this.dependencies)
      e.direction === "INPUT" && !this.readVariables.has(e.variableName) && this.addDiagnostic(
        "Warning",
        f.UNUSED_INPUT,
        `Input variable '${e.variableName}' is declared but never read`,
        e.location
      );
    for (const e of this.dependencies)
      e.direction === "INPUT" && this.writtenVariables.has(e.variableName) && this.addDiagnostic(
        "Warning",
        f.WRITE_TO_INPUT,
        `Writing to input variable '${e.variableName}' - this may not update the entity`,
        e.location
      );
    for (const e of this.dependencies)
      e.direction === "OUTPUT" && this.readVariables.has(e.variableName) && !this.writtenVariables.has(e.variableName) && this.addDiagnostic(
        "Warning",
        f.READ_FROM_OUTPUT,
        `Reading from output variable '${e.variableName}' without writing - value may be stale`,
        e.location
      );
  }
  /**
   * Build metadata about the program
   */
  buildMetadata() {
    const e = this.dependencies, t = h(this.ast.pragmas), a = this.ast.variables.some((n) => {
      const r = h(n.pragmas);
      return p(r, "persistent");
    });
    return {
      programName: this.ast.name,
      inputCount: e.filter((n) => n.direction === "INPUT").length,
      outputCount: e.filter((n) => n.direction === "OUTPUT").length,
      triggerCount: this.triggers.length,
      hasPersistentVars: a,
      hasTimers: this.hasTimerUsage(),
      mode: m(t, "mode"),
      // Keep throttle/debounce as ST-style time literals (strings)
      throttle: m(t, "throttle"),
      debounce: m(t, "debounce")
    };
  }
  hasTimerUsage() {
    let e = !1;
    const t = /* @__PURE__ */ new Set(["TON", "TOF", "TP", "TON_EDGE"]);
    return I(this.ast, {
      onFunctionCall: (a) => {
        if (e)
          return;
        const n = a.name.toUpperCase();
        if (t.has(n)) {
          e = !0;
          return;
        }
        const r = this.variableMap.get(a.name);
        if (r) {
          const o = r.dataType.name.toUpperCase();
          t.has(o) && (e = !0);
        }
      }
    }), e;
  }
  /**
   * Add a diagnostic message
   */
  addDiagnostic(e, t, a, n) {
    this.diagnostics.push({ severity: e, code: t, message: a, location: n });
  }
}
function K(i) {
  return new z(i).analyze();
}
const b = {
  // Boolean types
  BOOL: { helperType: "input_boolean" },
  // Integer types
  SINT: {
    helperType: "input_number",
    defaultMin: -128,
    defaultMax: 127,
    defaultStep: 1
  },
  INT: {
    helperType: "input_number",
    defaultMin: -32768,
    defaultMax: 32767,
    defaultStep: 1
  },
  DINT: {
    helperType: "input_number",
    defaultMin: -2147483648,
    defaultMax: 2147483647,
    defaultStep: 1
  },
  LINT: {
    helperType: "input_number",
    defaultMin: Number.MIN_SAFE_INTEGER,
    defaultMax: Number.MAX_SAFE_INTEGER,
    defaultStep: 1
  },
  USINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: 255,
    defaultStep: 1
  },
  UINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: 65535,
    defaultStep: 1
  },
  UDINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: 4294967295,
    defaultStep: 1
  },
  ULINT: {
    helperType: "input_number",
    defaultMin: 0,
    defaultMax: Number.MAX_SAFE_INTEGER,
    defaultStep: 1
  },
  // Real types
  REAL: {
    helperType: "input_number",
    defaultMin: -34e37,
    defaultMax: 34e37,
    defaultStep: 0.1
  },
  LREAL: {
    helperType: "input_number",
    defaultMin: Number.MIN_SAFE_INTEGER,
    defaultMax: Number.MAX_SAFE_INTEGER,
    defaultStep: 0.01
  },
  // String types
  STRING: { helperType: "input_text" },
  WSTRING: { helperType: "input_text" },
  // Time types
  TIME: { helperType: "input_text" },
  // Stored as ISO duration string
  DATE: { helperType: "input_datetime" },
  TIME_OF_DAY: { helperType: "input_datetime" },
  TOD: { helperType: "input_datetime" },
  DATE_AND_TIME: { helperType: "input_datetime" },
  DT: { helperType: "input_datetime" }
}, B = [
  "TON",
  "TOF",
  "TP",
  "R_TRIG",
  "F_TRIG",
  "SR",
  "RS",
  "CTU",
  "CTD",
  "CTUD"
];
function N(i) {
  const e = i.toUpperCase(), t = b[e];
  return (t == null ? void 0 : t.helperType) ?? null;
}
function Y(i) {
  return B.includes(i.toUpperCase());
}
function y(i) {
  const e = i.toUpperCase();
  return [
    "SINT",
    "INT",
    "DINT",
    "LINT",
    "USINT",
    "UINT",
    "UDINT",
    "ULINT",
    "REAL",
    "LREAL"
  ].includes(e);
}
function R(i) {
  return i.toUpperCase() === "BOOL";
}
function _(i) {
  const e = i.toUpperCase();
  return ["STRING", "WSTRING"].includes(e);
}
function j(i) {
  const e = i.toUpperCase();
  return ["TIME", "DATE", "TIME_OF_DAY", "TOD", "DATE_AND_TIME", "DT"].includes(
    e
  );
}
function S(i, e, t, a) {
  const n = (o) => o.toLowerCase().replace(/[^a-z0-9]/g, "_"), r = `st_${n(i)}_${n(e)}_${n(t)}`;
  return `${a}.${r}`;
}
function x(i, e, t, a, n) {
  const r = N(a);
  if (!r)
    return null;
  const o = S(i, e, t, r), T = b[a.toUpperCase()], d = {
    id: o,
    type: r,
    name: `ST ${e} - ${t}`
  };
  return r === "input_number" && T && (d.min = T.defaultMin, d.max = T.defaultMax, d.step = T.defaultStep, d.mode = "box", n !== void 0 && typeof n == "number" ? d.initial = n : d.initial = 0), r === "input_boolean" && (d.initial = n === !0), r === "input_text" && (d.initial = typeof n == "string" ? n : ""), d;
}
function H(i) {
  const e = i.toUpperCase();
  return R(e) ? !1 : y(e) ? 0 : _(e) ? "" : j(e) ? "PT0S" : null;
}
function X(i, e) {
  const t = e.toUpperCase();
  return R(t) ? i === !0 || i === "TRUE" || i === 1 : y(t) ? typeof i == "number" ? i : typeof i == "string" && parseFloat(i) || 0 : _(t) ? String(i ?? "") : i;
}
class q {
  constructor(e, t = "default") {
    l(this, "ast");
    l(this, "projectName");
    l(this, "diagnostics", []);
    l(this, "usageMap", /* @__PURE__ */ new Map());
    l(this, "variableMap", /* @__PURE__ */ new Map());
    this.ast = e, this.projectName = t;
  }
  /**
   * Run full storage analysis
   */
  analyze() {
    this.buildVariableMap(), this.analyzeUsage();
    const e = this.determineStorageTypes(), t = this.generateHelperConfigs(e);
    return this.validate(e), {
      variables: e,
      helpers: t,
      diagnostics: this.diagnostics
    };
  }
  // ==========================================================================
  // Phase 1: Build Variable Map
  // ==========================================================================
  buildVariableMap() {
    for (const e of this.ast.variables)
      this.variableMap.set(e.name, e);
  }
  // ==========================================================================
  // Phase 2: Analyze Usage
  // ==========================================================================
  analyzeUsage() {
    for (const t of this.ast.variables)
      this.usageMap.set(t.name, {
        isRead: !1,
        isWritten: !1,
        hasSelfReference: !1,
        isFBInstance: Y(t.dataType.name),
        isTimerRelated: this.isTimerRelatedType(t.dataType.name),
        readCount: 0,
        writeCount: 0
      });
    const e = /* @__PURE__ */ new Map();
    I(this.ast, {
      onVariableRef: (t) => {
        const a = this.usageMap.get(t.name);
        a && (a.isRead = !0, a.readCount++);
      },
      onAssignment: (t) => {
        const a = this.getAssignmentTargetName(t);
        if (a) {
          const n = this.usageMap.get(a);
          n && (n.isWritten = !0, n.writeCount++), e.has(a) || e.set(a, []), e.get(a).push(t.value);
        }
      }
    });
    for (const [t, a] of e)
      for (const n of a)
        if (V(n, t)) {
          const r = this.usageMap.get(t);
          r && (r.hasSelfReference = !0);
        }
  }
  getAssignmentTargetName(e) {
    const t = e.target;
    if (typeof t == "string")
      return t;
    let a = t;
    for (; a.type === "MemberAccess"; )
      a = a.object;
    return a.type === "VariableRef" ? a.name : null;
  }
  isTimerRelatedType(e) {
    return ["TON", "TOF", "TP", "TIME"].includes(e.toUpperCase());
  }
  // ==========================================================================
  // Phase 3: Determine Storage Types
  // ==========================================================================
  determineStorageTypes() {
    const e = [];
    for (const t of this.ast.variables) {
      const a = this.usageMap.get(t.name), n = this.determineStorageType(t, a);
      e.push({
        name: t.name,
        dataType: t.dataType.name,
        storage: n,
        usageInfo: a
      });
    }
    return e;
  }
  determineStorageType(e, t) {
    const a = h(e.pragmas);
    return e.binding ? {
      type: u.DERIVED,
      reason: "Entity-bound variable - value comes from entity state"
    } : p(a, "transient") ? (this.addDiagnostic(
      "Info",
      c.EXPLICIT_TRANSIENT,
      `Variable '${e.name}' explicitly marked as transient`,
      e.location
    ), {
      type: u.TRANSIENT,
      reason: "Explicit {transient} pragma"
    }) : p(a, "persistent") ? (this.addDiagnostic(
      "Info",
      c.EXPLICIT_PERSISTENT,
      `Variable '${e.name}' explicitly marked as persistent`,
      e.location
    ), this.createPersistentDecision(e, "Explicit {persistent} pragma")) : t.hasSelfReference ? (this.addDiagnostic(
      "Info",
      c.AUTO_PERSISTENT,
      `Variable '${e.name}' auto-detected as persistent (self-reference)`,
      e.location
    ), this.createPersistentDecision(e, "Self-reference detected")) : t.isFBInstance ? (this.addDiagnostic(
      "Info",
      c.AUTO_PERSISTENT,
      `Variable '${e.name}' auto-detected as persistent (FB instance)`,
      e.location
    ), this.createFBPersistentDecision(e, "Function Block instance")) : t.isTimerRelated ? (this.addDiagnostic(
      "Info",
      c.AUTO_PERSISTENT,
      `Variable '${e.name}' auto-detected as persistent (timer-related)`,
      e.location
    ), this.createPersistentDecision(e, "Timer-related variable")) : {
      type: u.TRANSIENT,
      reason: "No persistence requirement detected"
    };
  }
  createPersistentDecision(e, t) {
    var o;
    const a = N(e.dataType.name);
    if (!a)
      return this.addDiagnostic(
        "Warning",
        c.INVALID_HELPER_TYPE,
        `Cannot create helper for type '${e.dataType.name}' - using transient storage`,
        e.location
      ), {
        type: u.TRANSIENT,
        reason: `No helper type available for ${e.dataType.name}`
      };
    const n = S(
      this.projectName,
      this.ast.name,
      e.name,
      a
    );
    let r = H(e.dataType.name);
    return ((o = e.initialValue) == null ? void 0 : o.type) === "Literal" && (r = X(
      e.initialValue.value,
      e.dataType.name
    )), {
      type: u.PERSISTENT,
      reason: t,
      helperId: n,
      helperType: a,
      initialValue: r
    };
  }
  /**
   * Create persistent decision for Function Block instances.
   * FB types (TON, R_TRIG, etc.) have internal state that requires
   * special serialization - full helper generation is handled by
   * the Helper Manager in a later phase.
   */
  createFBPersistentDecision(e, t) {
    return {
      type: u.PERSISTENT,
      reason: t
      // No helperId/helperType for FBs - requires special handling
    };
  }
  // ==========================================================================
  // Phase 4: Generate Helper Configs
  // ==========================================================================
  generateHelperConfigs(e) {
    const t = [];
    for (const a of e) {
      if (a.storage.type !== u.PERSISTENT)
        continue;
      const n = x(
        this.projectName,
        this.ast.name,
        a.name,
        a.dataType,
        a.storage.initialValue
      );
      n && t.push(n);
    }
    return t;
  }
  // ==========================================================================
  // Phase 5: Validation
  // ==========================================================================
  validate(e) {
    for (const t of e) {
      const a = t.usageInfo, n = this.variableMap.get(t.name), r = h(n.pragmas);
      a.hasSelfReference && t.storage.type === u.TRANSIENT && this.addDiagnostic(
        "Warning",
        c.SELF_REF_NOT_PERSISTENT,
        `Variable '${t.name}' has self-reference but is transient - value will reset each run`,
        n.location
      ), a.isFBInstance && t.storage.type === u.TRANSIENT && this.addDiagnostic(
        "Warning",
        c.FB_INSTANCE_NOT_PERSISTENT,
        `Function Block '${t.name}' is transient - internal state will reset each run`,
        n.location
      ), t.storage.type === u.PERSISTENT && !a.isWritten && this.addDiagnostic(
        "Warning",
        c.UNUSED_PERSISTENT,
        `Persistent variable '${t.name}' is never written - consider making it transient`,
        n.location
      ), p(r, "persistent") && p(r, "transient") && this.addDiagnostic(
        "Error",
        c.CONFLICTING_PRAGMAS,
        `Variable '${t.name}' has conflicting {persistent} and {transient} pragmas`,
        n.location
      );
    }
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  addDiagnostic(e, t, a, n) {
    this.diagnostics.push({
      severity: e,
      code: t,
      message: a,
      location: n ? { line: n.startLine, column: n.startColumn } : void 0
    });
  }
}
function Q(i, e) {
  return new q(i, e).analyze();
}
export {
  K as a,
  Q as b,
  h as p,
  I as w
};
//# sourceMappingURL=analyzer-DbAWr__X.js.map
