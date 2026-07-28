var N = Object.defineProperty;
var E = (u, e, t) => e in u ? N(u, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[e] = t;
var c = (u, e, t) => E(u, typeof e != "symbol" ? e + "" : e, t);
import { a as A, b as C, w as O, p as f } from "./analyzer-DbAWr__X.js";
class _ {
  constructor(e, t) {
    c(this, "context");
    c(this, "timerResolver");
    this.context = e, this.timerResolver = t;
  }
  /**
   * Generate a defensive Jinja template from an ST expression
   */
  generateExpression(e) {
    switch (e.type) {
      case "Literal":
        return this.generateLiteral(e);
      case "VariableRef":
        return this.generateVariableRef(e);
      case "BinaryExpression":
        return this.generateBinaryExpression(e);
      case "UnaryExpression":
        return this.generateUnaryExpression(e);
      case "FunctionCall":
        return this.generateFunctionCall(e);
      case "ParenExpression":
        return `(${this.generateExpression(e.expression)})`;
      case "MemberAccess":
        return this.generateMemberAccess(e);
      default:
        throw new Error(`Unknown expression type: ${e.type}`);
    }
  }
  /**
   * Generate a complete condition template (wrapped in {{ }})
   */
  generateCondition(e) {
    return `{{ ${this.generateExpression(e)} }}`;
  }
  // ==========================================================================
  // Literal Generation
  // ==========================================================================
  generateLiteral(e) {
    switch (e.kind) {
      case "boolean":
        return e.value ? "true" : "false";
      case "integer":
        return String(e.value);
      case "real":
        return String(e.value);
      case "string":
        return `'${String(e.value).replace(/'/g, "\\'")}'`;
      case "time":
        return this.convertTimeToSeconds(e.raw);
      default:
        return String(e.value);
    }
  }
  convertTimeToSeconds(e) {
    if (!/^T#/i.test(e)) return "0";
    const t = e.slice(2), a = /(\d+)(ms|h|m|s)/gi;
    let i = 0, r = "";
    for (const n of t.matchAll(a)) {
      const s = parseInt(n[1], 10), o = n[2].toLowerCase();
      switch (r += n[0], o) {
        case "h":
          i += s * 3600;
          break;
        case "m":
          i += s * 60;
          break;
        case "s":
          i += s;
          break;
        case "ms":
          i += s / 1e3;
          break;
      }
    }
    return r.toLowerCase() === t.toLowerCase() ? String(i) : "0";
  }
  // ==========================================================================
  // Variable Reference Generation
  // ==========================================================================
  generateVariableRef(e) {
    const t = this.context.variables.get(e.name);
    return t ? t.entityId ? this.generateEntityRead(t.entityId, t.dataType) : t.isPersistent && t.helperId ? this.generateHelperRead(t.helperId, t.dataType) : e.name : e.name;
  }
  /**
   * Generate defensive entity state read
   */
  generateEntityRead(e, t) {
    const a = `states('${e}')`, i = "['unavailable', 'unknown', 'none', '']";
    switch (t.toUpperCase()) {
      case "BOOL":
        return `(${a} in ['on', 'true', 'True', '1'])`;
      case "INT":
      case "DINT":
      case "SINT":
      case "LINT":
      case "UINT":
      case "UDINT":
      case "USINT":
      case "ULINT":
        return `(${a} | int(default=0) if ${a} not in ${i} else 0)`;
      case "REAL":
      case "LREAL":
        return `(${a} | float(default=0.0) if ${a} not in ${i} else 0.0)`;
      case "STRING":
      case "WSTRING":
        return `(${a} if ${a} not in ['unavailable', 'unknown'] else '')`;
      default:
        return a;
    }
  }
  /**
   * Generate defensive helper state read
   */
  generateHelperRead(e, t) {
    const a = `states('${e}')`, i = "['unavailable', 'unknown', 'none', '']";
    switch (t.toUpperCase()) {
      case "BOOL":
        return `(${a} == 'on')`;
      case "INT":
      case "DINT":
      case "SINT":
      case "LINT":
      case "UINT":
      case "UDINT":
      case "USINT":
      case "ULINT":
        return `(${a} | int(default=0) if ${a} not in ${i} else 0)`;
      case "REAL":
      case "LREAL":
        return `(${a} | float(default=0.0) if ${a} not in ${i} else 0.0)`;
      case "STRING":
      case "WSTRING":
        return `(${a} if ${a} not in ${i} else '')`;
      default:
        return a;
    }
  }
  // ==========================================================================
  // Binary Expression Generation
  // ==========================================================================
  generateBinaryExpression(e) {
    const t = this.generateExpression(e.left), a = this.generateExpression(e.right);
    switch (e.operator.toUpperCase()) {
      case "+":
        return `(${t} + ${a})`;
      case "-":
        return `(${t} - ${a})`;
      case "*":
        return `(${t} * ${a})`;
      case "/":
        return `(${t} / ${a})`;
      case "MOD":
        return `(${t} % ${a})`;
      case "=":
        return `(${t} == ${a})`;
      case "<>":
        return `(${t} != ${a})`;
      case "<":
        return `(${t} < ${a})`;
      case ">":
        return `(${t} > ${a})`;
      case "<=":
        return `(${t} <= ${a})`;
      case ">=":
        return `(${t} >= ${a})`;
      case "AND":
        return `(${t} and ${a})`;
      case "OR":
        return `(${t} or ${a})`;
      case "XOR":
        return `((${t} or ${a}) and not (${t} and ${a}))`;
      default:
        throw new Error(`Unknown operator: ${e.operator}`);
    }
  }
  // ==========================================================================
  // Unary Expression Generation
  // ==========================================================================
  generateUnaryExpression(e) {
    const t = this.generateExpression(e.operand);
    switch (e.operator.toUpperCase()) {
      case "NOT":
        return `(not ${t})`;
      case "-":
        return `(-${t})`;
      default:
        throw new Error(`Unknown unary operator: ${e.operator}`);
    }
  }
  // ==========================================================================
  // Function Call Generation
  // ==========================================================================
  generateFunctionCall(e) {
    const t = e.name.toUpperCase(), a = e.arguments.map((i) => this.generateExpression(i.value));
    switch (t) {
      case "SEL":
        return this.generateSEL(a);
      case "MUX":
        return this.generateMUX(a);
      case "MIN":
        return `min(${a[0]}, ${a[1]})`;
      case "MAX":
        return `max(${a[0]}, ${a[1]})`;
      case "LIMIT":
        return this.generateLIMIT(a);
      case "ABS":
        return `(${a[0]} | abs)`;
      case "SQRT":
        return this.generateSQRT(a);
      case "TRUNC":
        return `(${a[0]} | int)`;
      case "ROUND":
        return `(${a[0]} | round)`;
      case "TO_INT":
      case "TO_DINT":
        return `(${a[0]} | int(default=0))`;
      case "TO_REAL":
      case "TO_LREAL":
        return `(${a[0]} | float(default=0.0))`;
      case "TO_STRING":
        return `(${a[0]} | string)`;
      case "TO_BOOL":
        return `(${a[0]} | bool)`;
      case "LEN":
        return `(${a[0]} | length)`;
      case "CONCAT":
        return `(${a[0]} ~ ${a[1]})`;
      default:
        return `${t.toLowerCase()}(${a.join(", ")})`;
    }
  }
  generateSEL(e) {
    if (e.length < 3)
      throw new Error("SEL requires 3 arguments");
    return `(${e[2]} if ${e[0]} else ${e[1]})`;
  }
  generateMUX(e) {
    if (e.length < 2)
      throw new Error("MUX requires at least 2 arguments");
    const t = e[0], a = e.slice(1);
    let i = a[a.length - 1];
    for (let r = a.length - 2; r >= 0; r--)
      i = `(${a[r]} if ${t} == ${r} else ${i})`;
    return i;
  }
  generateLIMIT(e) {
    if (e.length < 3)
      throw new Error("LIMIT requires 3 arguments");
    const [t, a, i] = e;
    return `{% set _v = ${a} %}{% if _v is number %}{{ [[${t}, _v] | max, ${i}] | min }}{% else %}{{ ${t} }}{% endif %}`;
  }
  generateSQRT(e) {
    if (e.length < 1)
      throw new Error("SQRT requires 1 argument");
    return `{% set _v = ${e[0]} %}{% if _v is number and _v >= 0 %}{{ _v | sqrt }}{% else %}{{ 0 }}{% endif %}`;
  }
  // ==========================================================================
  // Member Access Generation
  // ==========================================================================
  generateMemberAccess(e) {
    if (this.timerResolver) {
      let a = e.object;
      for (; a.type === "MemberAccess"; )
        a = a.object;
      if (a.type === "VariableRef") {
        const i = this.timerResolver.resolveOutput(
          a.name,
          e.member.toUpperCase() === "ET" ? "ET" : "Q"
        );
        if (i)
          return i;
      }
    }
    return `${this.generateExpression(e.object)}.${e.member}`;
  }
}
function M(u, e) {
  const t = `states('${u}')`, a = "['unavailable', 'unknown', 'none', '']";
  switch (e.toUpperCase()) {
    case "BOOL":
      return `{{ ${t} in ['on', 'true', 'True', '1'] }}`;
    case "INT":
    case "DINT":
      return `{{ ${t} | int(default=0) if ${t} not in ${a} else 0 }}`;
    case "REAL":
    case "LREAL":
      return `{{ ${t} | float(default=0.0) if ${t} not in ${a} else 0.0 }}`;
    default:
      return `{{ ${t} }}`;
  }
}
function H(u, e) {
  return `{% set last = states('${u}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (as_timestamp(now()) - as_timestamp(last, 0)) > ${e} }}
{% endif %}`;
}
const w = 1e3;
class v {
  constructor(e, t, a) {
    c(this, "context");
    c(this, "jinja");
    c(this, "sourceMap");
    this.context = e, this.jinja = new _(e, t), this.sourceMap = a;
  }
  /**
   * Generate HA actions from ST statements
   */
  generateActions(e) {
    const t = [];
    return e.forEach((a, i) => {
      this.sourceMap && this.sourceMap.pushPath(String(i));
      const r = this.generateAction(a);
      t.push(...r), this.sourceMap && this.sourceMap.popPath();
    }), t;
  }
  /**
   * Generate single HA action from ST statement
   */
  generateAction(e) {
    switch (e.type) {
      case "Assignment":
        return this.generateAssignment(e);
      case "IfStatement":
        return [this.generateIf(e)];
      case "CaseStatement":
        return [this.generateCase(e)];
      case "ForStatement":
        return [this.generateFor(e)];
      case "WhileStatement":
        return [this.generateWhile(e)];
      case "RepeatStatement":
        return [this.generateRepeat(e)];
      case "FunctionCallStatement":
        return this.generateFunctionCall(e);
      case "ReturnStatement":
        return [{ stop: "Return from program", error: !1 }];
      case "ExitStatement":
        return [{ stop: "Exit loop", error: !1 }];
      default:
        throw new Error(`Unknown statement type: ${e.type}`);
    }
  }
  // ==========================================================================
  // Assignment Generation
  // ==========================================================================
  generateAssignment(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "Assignment");
    const t = typeof e.target == "string" ? e.target : this.getTargetName(e.target), a = this.context.variables.get(t);
    return a ? a.isOutput && a.entityId ? this.generateEntityWrite(a.entityId, e.value, a.dataType) : a.isPersistent && a.helperId ? this.generateHelperWrite(a.helperId, e.value, a.dataType) : [this.generateVariableAssignment(t, e.value)] : [this.generateVariableAssignment(t, e.value)];
  }
  getTargetName(e) {
    if (typeof e == "string")
      return e;
    let t = e;
    for (; t.type === "MemberAccess"; )
      t = t.object;
    return t.type === "VariableRef" ? t.name : "unknown";
  }
  generateVariableAssignment(e, t) {
    return {
      variables: {
        [e]: `{{ ${this.jinja.generateExpression(t)} }}`
      }
    };
  }
  generateEntityWrite(e, t, a) {
    const i = e.split(".")[0], r = this.jinja.generateExpression(t);
    return a.toUpperCase() === "BOOL" ? [{
      service: `{{ '${i}.turn_on' if ${r} else '${i}.turn_off' }}`,
      target: { entity_id: e }
    }] : i === "input_number" || i === "number" ? [{
      service: `${i}.set_value`,
      target: { entity_id: e },
      data: { value: `{{ ${r} }}` }
    }] : i === "input_text" ? [{
      service: "input_text.set_value",
      target: { entity_id: e },
      data: { value: `{{ ${r} }}` }
    }] : [{
      service: `${i}.turn_on`,
      target: { entity_id: e }
    }];
  }
  generateHelperWrite(e, t, a) {
    const i = e.split(".")[0], r = this.jinja.generateExpression(t);
    switch (i) {
      case "input_boolean":
        return [{
          service: `{{ 'input_boolean.turn_on' if ${r} else 'input_boolean.turn_off' }}`,
          target: { entity_id: e }
        }];
      case "input_number":
        return [{
          service: "input_number.set_value",
          target: { entity_id: e },
          data: { value: `{{ ${r} }}` }
        }];
      case "input_text":
        return [{
          service: "input_text.set_value",
          target: { entity_id: e },
          data: { value: `{{ ${r} }}` }
        }];
      case "input_datetime":
        return [{
          service: "input_datetime.set_datetime",
          target: { entity_id: e },
          data: { datetime: `{{ ${r} }}` }
        }];
      case "counter":
        return [{
          service: "counter.set_value",
          target: { entity_id: e },
          data: { value: `{{ ${r} }}` }
        }];
      default:
        throw new Error(`Unknown helper type: ${i}`);
    }
  }
  // ==========================================================================
  // Control Flow Generation
  // ==========================================================================
  generateIf(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "IF statement");
    const t = [];
    t.push({
      conditions: [this.generateCondition(e.condition)],
      sequence: this.generateActions(e.thenBranch)
    });
    for (const i of e.elsifBranches)
      t.push({
        conditions: [this.generateCondition(i.condition)],
        sequence: this.generateActions(i.body)
      });
    const a = { choose: t };
    return e.elseBranch && e.elseBranch.length > 0 && (a.default = this.generateActions(e.elseBranch)), a;
  }
  generateCase(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "CASE statement");
    const t = this.jinja.generateExpression(e.selector), a = [];
    for (const r of e.cases) {
      const n = r.values.map((o) => {
        const p = this.jinja.generateExpression(o);
        return {
          condition: "template",
          value_template: `{{ ${t} == ${p} }}`
        };
      }), s = n.length === 1 ? n[0] : { condition: "or", conditions: n };
      a.push({
        conditions: [s],
        sequence: this.generateActions(r.body)
      });
    }
    const i = { choose: a };
    return e.elseCase && e.elseCase.length > 0 && (i.default = this.generateActions(e.elseCase)), i;
  }
  generateFor(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "FOR statement");
    const t = this.jinja.generateExpression(e.from), a = this.jinja.generateExpression(e.to), i = e.by ? this.jinja.generateExpression(e.by) : "1", r = `{{ (((${a}) - (${t})) / (${i})) | int + 1 }}`, n = {
      variables: {
        [e.variable]: `{{ (${t}) + ((repeat.index | default(1) | int - 1) * (${i})) }}`
      }
    };
    return {
      repeat: {
        count: r,
        sequence: [
          n,
          ...this.generateActions(e.body)
        ]
      }
    };
  }
  generateWhile(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "WHILE statement");
    const t = this.generateCondition(e.condition), a = {
      condition: "template",
      value_template: `{{ (repeat.index | default(1) | int) <= ${w} }}`
    };
    return {
      repeat: {
        while: [t, a],
        sequence: this.generateActions(e.body)
      }
    };
  }
  generateRepeat(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "REPEAT statement");
    const t = this.generateCondition(e.condition), a = {
      condition: "template",
      value_template: `{{ (repeat.index | default(1) | int) <= ${w} }}`
    };
    return {
      repeat: {
        until: [
          { condition: "or", conditions: [t, { condition: "not", conditions: [a] }] }
        ],
        sequence: this.generateActions(e.body)
      }
    };
  }
  // ==========================================================================
  // Function Call Generation
  // ==========================================================================
  generateFunctionCall(e) {
    const t = e.call.name.toUpperCase();
    switch (t) {
      case "R_TRIG":
      case "F_TRIG":
        return [];
      case "TON":
      case "TOF":
      case "TP":
        return [];
      default:
        return [{
          service: `script.${t.toLowerCase()}`,
          data: this.buildFunctionCallData(e.call)
        }];
    }
  }
  buildFunctionCallData(e) {
    const t = {};
    for (const a of e.arguments) {
      const i = a.name || `arg_${e.arguments.indexOf(a)}`;
      t[i] = `{{ ${this.jinja.generateExpression(a.value)} }}`;
    }
    return t;
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  generateCondition(e) {
    return {
      condition: "template",
      value_template: this.jinja.generateCondition(e)
    };
  }
}
class k {
  constructor(e) {
    c(this, "jinja");
    this.jinja = new _(e);
  }
  /**
   * Check if a function call is a timer FB (by FB type name)
   */
  isTimerFBType(e) {
    const t = e.toUpperCase();
    return t === "TON" || t === "TOF" || t === "TP";
  }
  /**
   * Parse a timer FB call
   *
   * Note: The current parser models FB calls with `call.name` equal to the
   * called symbol. Whether this is the instance name or FB type depends on
   * how the ST code is written; this helper is intentionally generic and
   * leaves the instance/type resolution to the caller.
   */
  parseTimerCall(e, t) {
    var r;
    const a = t.name.toUpperCase(), i = {};
    for (const n of t.arguments) {
      const s = (r = n.name) == null ? void 0 : r.toUpperCase();
      if (s)
        switch (s) {
          case "IN":
            i.IN = this.jinja.generateExpression(n.value);
            break;
          case "PT":
            i.PT = this.parseTimeToSeconds(n.value);
            break;
          case "R":
            i.R = this.jinja.generateExpression(n.value);
            break;
        }
    }
    return { instanceName: e, type: a, inputs: i };
  }
  /**
   * Transpile a timer FB instance given its resolved type and inputs.
   *
   * The caller is responsible for:
   * - Determining the correct `TimerInstance` (name/program/project/type)
   * - Providing normalized `TimerInputs` (IN/PT Jinja expressions)
   */
  transpileTimer(e, t) {
    const a = this.generateEntityIds(e), i = this.generateHelperConfigs(e, a);
    switch (e.type) {
      case "TON":
        return this.transpileTON(e, t, a, i);
      case "TOF":
        return this.transpileTOF(e, t, a, i);
      case "TP":
        return this.transpileTP(e, t, a, i);
      default:
        throw new Error(`Unknown timer type: ${e.type}`);
    }
  }
  // ==========================================================================
  // TON - On-Delay Timer
  // ==========================================================================
  transpileTON(e, t, a, i) {
    const r = [
      {
        // High-level choose block for TON behavior
        // Case 1: IN = TRUE and timer idle -> start timer
        // Case 2: IN = FALSE -> cancel timer and reset Q
        choose: [
          {
            conditions: [
              this.templateCondition(t.IN),
              this.stateCondition(a.timerId, "idle")
            ],
            sequence: [this.timerStart(a.timerId, t.PT)]
          },
          {
            conditions: [this.templateCondition(`not (${t.IN})`)],
            sequence: [
              this.timerCancel(a.timerId),
              this.booleanTurnOff(a.outputHelperId)
            ]
          }
        ]
      }
    ], n = this.generateFinishedAutomation(
      e,
      a,
      t.IN,
      [this.booleanTurnOn(a.outputHelperId)]
    ), s = {
      Q: `(states('${a.outputHelperId}') == 'on')`,
      ET: a.elapsedHelperId ? `(states('${a.elapsedHelperId}') | float(default=0))` : void 0
    };
    return {
      entities: a,
      helpers: i,
      mainActions: r,
      finishedAutomation: n,
      outputMappings: s
    };
  }
  // ==========================================================================
  // TOF - Off-Delay Timer
  // ==========================================================================
  transpileTOF(e, t, a, i) {
    const r = [
      {
        choose: [
          // Case 1: IN = TRUE -> cancel timer and set Q immediately
          {
            conditions: [this.templateCondition(t.IN)],
            sequence: [
              this.timerCancel(a.timerId),
              this.booleanTurnOn(a.outputHelperId)
            ]
          },
          // Case 2: IN = FALSE and Q ON and timer idle -> start timer
          {
            conditions: [
              this.templateCondition(`not (${t.IN})`),
              this.stateCondition(a.outputHelperId, "on"),
              this.stateCondition(a.timerId, "idle")
            ],
            sequence: [this.timerStart(a.timerId, t.PT)]
          }
        ]
      }
    ], n = this.generateFinishedAutomation(
      e,
      a,
      `not (${t.IN})`,
      [this.booleanTurnOff(a.outputHelperId)]
    ), s = {
      Q: `(states('${a.outputHelperId}') == 'on')`
    };
    return {
      entities: a,
      helpers: i,
      mainActions: r,
      finishedAutomation: n,
      outputMappings: s
    };
  }
  // ==========================================================================
  // TP - Pulse Timer
  // ==========================================================================
  transpileTP(e, t, a, i) {
    const r = `input_boolean.${this.sanitize(
      e.projectName
    )}_${this.sanitize(e.programName)}_${this.sanitize(e.name)}_triggered`;
    i.push({
      id: r,
      type: "input_boolean",
      name: `ST ${e.programName} ${e.name} Triggered`,
      initial: !1
    });
    const n = [
      {
        choose: [
          // Case 1: Rising edge (IN TRUE and not triggered) -> start pulse
          {
            conditions: [
              this.templateCondition(t.IN),
              this.stateCondition(r, "off"),
              this.stateCondition(a.timerId, "idle")
            ],
            sequence: [
              this.booleanTurnOn(r),
              this.booleanTurnOn(a.outputHelperId),
              this.timerStart(a.timerId, t.PT)
            ]
          },
          // Case 2: IN FALSE and timer idle -> reset trigger flag
          {
            conditions: [
              this.templateCondition(`not (${t.IN})`),
              this.stateCondition(a.timerId, "idle")
            ],
            sequence: [this.booleanTurnOff(r)]
          }
        ]
      }
    ], s = this.generateFinishedAutomation(
      e,
      a,
      "true",
      // always execute when timer finishes
      [this.booleanTurnOff(a.outputHelperId)]
    ), o = {
      Q: `(states('${a.outputHelperId}') == 'on')`
    };
    return {
      entities: a,
      helpers: i,
      mainActions: n,
      finishedAutomation: s,
      outputMappings: o
    };
  }
  // ==========================================================================
  // Helper Generators
  // ==========================================================================
  generateEntityIds(e) {
    const t = `st_${this.sanitize(e.projectName)}_${this.sanitize(
      e.programName
    )}_${this.sanitize(e.name)}`;
    return {
      timerId: `timer.${t}`,
      outputHelperId: `input_boolean.${t}_q`,
      elapsedHelperId: `input_number.${t}_et`
    };
  }
  generateHelperConfigs(e, t) {
    const a = `ST ${e.programName} ${e.name}`;
    return [
      {
        id: t.timerId,
        type: "timer",
        name: `${a} Timer`
      },
      {
        id: t.outputHelperId,
        type: "input_boolean",
        name: `${a} Q`,
        initial: !1
      }
    ];
  }
  generateFinishedAutomation(e, t, a, i) {
    return {
      id: `st_${this.sanitize(e.projectName)}_${this.sanitize(
        e.programName
      )}_${this.sanitize(e.name)}_finished`,
      alias: `[ST] ${e.programName} - ${e.name} Finished`,
      description: `Timer finished handler for ${e.type} ${e.name}`,
      mode: "single",
      trigger: [
        {
          platform: "event",
          event_type: "timer.finished",
          event_data: {
            entity_id: t.timerId
          }
        }
      ],
      condition: a !== "true" ? [
        {
          condition: "template",
          value_template: `{{ ${a} }}`
        }
      ] : void 0,
      action: i
    };
  }
  // ==========================================================================
  // Action Helpers
  // ==========================================================================
  timerStart(e, t) {
    return {
      service: "timer.start",
      target: { entity_id: e },
      data: { duration: `{{ ${t} }}` }
    };
  }
  timerCancel(e) {
    return {
      service: "timer.cancel",
      target: { entity_id: e }
    };
  }
  booleanTurnOn(e) {
    return {
      service: "input_boolean.turn_on",
      target: { entity_id: e }
    };
  }
  booleanTurnOff(e) {
    return {
      service: "input_boolean.turn_off",
      target: { entity_id: e }
    };
  }
  // ==========================================================================
  // Condition Helpers
  // ==========================================================================
  templateCondition(e) {
    return {
      condition: "template",
      value_template: `{{ ${e} }}`
    };
  }
  stateCondition(e, t) {
    return {
      condition: "state",
      entity_id: e,
      state: t
    };
  }
  // ==========================================================================
  // Utility Helpers
  // ==========================================================================
  sanitize(e) {
    return e.toLowerCase().replace(/[^a-z0-9]/g, "_");
  }
  parseTimeToSeconds(e) {
    if (e.type === "Literal" && e.kind === "time") {
      const t = e.raw;
      if (/^T#/i.test(t)) {
        const a = t.slice(2), i = /(\d+)(ms|h|m|s)/gi;
        let r = 0, n = "";
        for (const s of a.matchAll(i)) {
          const o = parseInt(s[1], 10), p = s[2].toLowerCase();
          switch (n += s[0], p) {
            case "h":
              r += o * 3600;
              break;
            case "m":
              r += o * 60;
              break;
            case "s":
              r += o;
              break;
            case "ms":
              r += o / 1e3;
              break;
          }
        }
        if (n.toLowerCase() === a.toLowerCase())
          return String(r);
      }
    }
    return this.jinja.generateExpression(e);
  }
}
class j {
  constructor() {
    c(this, "timerMappings", /* @__PURE__ */ new Map());
  }
  registerTimer(e, t) {
    this.timerMappings.set(e, t);
  }
  resolveOutput(e, t) {
    const a = this.timerMappings.get(e);
    if (!a) return null;
    switch (t) {
      case "Q":
        return a.Q;
      case "ET":
        return a.ET ?? null;
      default:
        return null;
    }
  }
  /**
   * Check if a variable/member pair refers to a known timer output.
   */
  isTimerOutputRef(e, t) {
    if (!this.timerMappings.has(e)) return !1;
    const a = t.toUpperCase();
    return a === "Q" || a === "ET";
  }
}
class L {
  constructor(e) {
    c(this, "mappings", /* @__PURE__ */ new Map());
    c(this, "currentPath", []);
    c(this, "project");
    c(this, "program");
    c(this, "sourceFile");
    c(this, "sourceHash");
    this.project = e.project, this.program = e.program, this.sourceFile = e.sourceFile, this.sourceHash = this.hashContent(e.sourceContent);
  }
  // ==========================================================================
  // Path Management
  // ==========================================================================
  /**
   * Push a path segment (e.g., entering an action array)
   */
  pushPath(e) {
    this.currentPath.push(String(e));
  }
  /**
   * Pop the last path segment
   */
  popPath() {
    this.currentPath.pop();
  }
  /**
   * Get current YAML path as string
   */
  getCurrentPath() {
    return this.currentPath.join(".");
  }
  /**
   * Execute function with temporary path segment
   */
  withPath(e, t) {
    this.pushPath(e);
    try {
      return t();
    } finally {
      this.popPath();
    }
  }
  // ==========================================================================
  // Recording Mappings
  // ==========================================================================
  /**
   * Record a mapping at the current path
   */
  record(e, t) {
    const a = this.getCurrentPath();
    a && this.mappings.set(a, {
      st: {
        file: this.sourceFile,
        line: e.line,
        column: e.column,
        endLine: e.endLine,
        endColumn: e.endColumn
      },
      description: t
    });
  }
  /**
   * Record a mapping at a specific path
   */
  recordAt(e, t, a) {
    this.mappings.set(e, {
      st: {
        file: this.sourceFile,
        line: t.line,
        column: t.column,
        endLine: t.endLine,
        endColumn: t.endColumn
      },
      description: a
    });
  }
  /**
   * Record mapping for an AST node
   * Handles both parser SourceLocation (startLine/startColumn) and sourcemap SourceLocation (line/column)
   */
  recordNode(e, t) {
    if (!e.location) return;
    const a = {
      file: this.sourceFile,
      line: e.location.startLine ?? e.location.line ?? 1,
      column: e.location.startColumn ?? e.location.column ?? 1
    };
    e.location.endLine && (a.endLine = e.location.endLine), e.location.endColumn && (a.endColumn = e.location.endColumn), this.record(a, t);
  }
  // ==========================================================================
  // Building Output
  // ==========================================================================
  /**
   * Build the complete source map
   */
  build(e, t) {
    return {
      version: 1,
      project: this.project,
      program: this.program,
      automationId: e,
      scriptId: t,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      mappings: Object.fromEntries(this.mappings),
      sourceHash: this.sourceHash
    };
  }
  /**
   * Build source map for embedding in YAML variables
   */
  buildEmbedded() {
    return {
      _st_source_map: Object.fromEntries(this.mappings),
      _st_source_file: this.sourceFile,
      _st_source_hash: this.sourceHash
    };
  }
  /**
   * Export mappings as JSON string (for storage)
   */
  toJSON() {
    return JSON.stringify(this.build(""), null, 2);
  }
  // ==========================================================================
  // Utilities
  // ==========================================================================
  hashContent(e) {
    let t = 0;
    for (let a = 0; a < e.length; a++) {
      const i = e.charCodeAt(a);
      t = (t << 5) - t + i, t = t & t;
    }
    return t.toString(16);
  }
}
class I {
  constructor(e, t = "default", a) {
    c(this, "ast");
    c(this, "projectName");
    c(this, "depAnalysis");
    c(this, "storageAnalysis");
    c(this, "context");
    c(this, "sourceMapBuilder");
    c(this, "diagnostics", []);
    c(this, "timerTranspiler");
    c(this, "timerResolver");
    c(this, "timerHelpers", []);
    c(this, "additionalAutomations", []);
    c(this, "timerMainActions", []);
    this.ast = e, this.projectName = t, a && (this.sourceMapBuilder = new L({
      project: t,
      program: e.name,
      sourceFile: `${e.name}.st`,
      sourceContent: a
      // Explicitly use parameter to avoid TS6133
    }));
  }
  /**
   * Transpile AST to HA automation and script
   */
  transpile() {
    this.depAnalysis = A(this.ast), this.storageAnalysis = C(this.ast, this.projectName), this.diagnostics.push(
      ...this.depAnalysis.diagnostics.map((r) => {
        var n;
        return {
          severity: r.severity,
          code: r.code,
          message: r.message,
          stLine: (n = r.location) == null ? void 0 : n.line
        };
      }),
      ...this.storageAnalysis.diagnostics.map((r) => {
        var n;
        return {
          severity: r.severity,
          code: r.code,
          message: r.message,
          stLine: (n = r.location) == null ? void 0 : n.line
        };
      })
    ), this.buildContext(), this.timerTranspiler = new k(this.context), this.timerResolver = new j(), this.processTimerFBs();
    const e = this.generateAutomation(), t = this.generateScript(), a = this.collectHelpers(), i = this.sourceMapBuilder ? this.sourceMapBuilder.build(e.id, t.alias.replace(/\[ST\]\s*/, "").toLowerCase().replace(/[^a-z0-9_]/g, "_")) : {
      version: 1,
      project: this.projectName,
      program: this.ast.name,
      automationId: e.id,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      mappings: {}
    };
    return {
      automation: e,
      script: t,
      helpers: a,
      additionalAutomations: this.additionalAutomations,
      sourceMap: i,
      diagnostics: this.diagnostics
    };
  }
  // ==========================================================================
  // Context Building
  // ==========================================================================
  buildContext() {
    var a, i, r;
    const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
    for (const n of this.ast.variables) {
      const s = this.storageAnalysis.variables.find((l) => l.name === n.name), o = this.depAnalysis.dependencies.find((l) => l.variableName === n.name), p = {
        name: n.name,
        dataType: n.dataType.name,
        isInput: ((a = n.binding) == null ? void 0 : a.direction) === "INPUT" || n.section === "VAR_INPUT",
        isOutput: ((i = n.binding) == null ? void 0 : i.direction) === "OUTPUT" || n.section === "VAR_OUTPUT",
        isPersistent: (s == null ? void 0 : s.storage.type) === "PERSISTENT",
        helperId: s == null ? void 0 : s.storage.helperId,
        entityId: (o == null ? void 0 : o.entityId) || ((r = n.binding) == null ? void 0 : r.entityId)
      };
      e.set(n.name, p), o && o.entityId && (o.direction === "INPUT" || o.direction === "OUTPUT") && t.set(n.name, {
        entityId: o.entityId,
        variableName: n.name,
        direction: o.direction,
        dataType: n.dataType.name
      });
    }
    this.context = {
      programName: this.ast.name,
      projectName: this.projectName,
      variables: e,
      entityBindings: t,
      currentPath: [],
      loopDepth: 0,
      safetyCounters: 0
    };
  }
  // ==========================================================================
  // Timer FB Processing
  // ==========================================================================
  processTimerFBs() {
    if (!this.timerTranspiler || !this.timerResolver)
      return;
    const e = /* @__PURE__ */ new Map();
    for (const t of this.ast.variables) {
      const a = t.dataType.name.toUpperCase();
      (a === "TON" || a === "TOF" || a === "TP") && e.set(t.name, a);
    }
    e.size !== 0 && O(this.ast, {
      onFunctionCall: (t) => {
        const a = e.get(t.name);
        if (!a)
          return;
        const i = {
          name: t.name,
          type: a,
          programName: this.ast.name,
          projectName: this.projectName
        }, r = this.timerTranspiler.parseTimerCall(t.name, t), n = {
          IN: r.inputs.IN ?? "true",
          PT: r.inputs.PT ?? "0"
        }, s = this.timerTranspiler.transpileTimer(i, n);
        this.timerHelpers.push(...s.helpers), this.additionalAutomations.push(s.finishedAutomation), this.timerMainActions.push(...s.mainActions), this.timerResolver.registerTimer(i.name, s.outputMappings);
      }
    });
  }
  // ==========================================================================
  // Automation Generation
  // ==========================================================================
  generateAutomation() {
    var r, n;
    const e = f(this.ast.pragmas), t = (r = e.find((s) => s.name === "throttle")) == null ? void 0 : r.value, a = (n = e.find((s) => s.name === "debounce")) == null ? void 0 : n.value, i = {
      id: `st_${this.projectName}_${this.ast.name}`.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      alias: `[ST] ${this.ast.name}`,
      description: `Generated from ST program: ${this.ast.name}`,
      mode: "single",
      // Automation is just dispatcher
      trigger: this.depAnalysis.triggers.map((s) => this.mapTriggerConfig(s)),
      action: []
    };
    if (t) {
      const s = this.buildEntityId("input_datetime", `st_${this.projectName}_${this.ast.name}_last_run`), o = this.parseTimeToSeconds(t);
      i.condition = [{
        condition: "template",
        value_template: this.generateThrottleCondition(s, o)
      }], i.action.push({
        service: "input_datetime.set_datetime",
        target: { entity_id: s },
        data: { datetime: "{{ now().isoformat() }}" }
      });
    }
    if (a) {
      i.mode = "restart";
      const s = this.parseTimeToSeconds(a);
      i.action.push({
        delay: { seconds: s }
      });
    }
    return i.action.push({
      service: "script.turn_on",
      target: {
        entity_id: this.buildEntityId("script", `st_${this.projectName}_${this.ast.name}_logic`)
      }
    }), i;
  }
  collectHelpers() {
    const e = [...this.storageAnalysis.helpers, ...this.timerHelpers], t = this.createThrottleHelper();
    t && e.push(t);
    const a = /* @__PURE__ */ new Map();
    for (const i of e)
      a.set(i.id, i);
    return [...a.values()];
  }
  createThrottleHelper() {
    var a;
    return ((a = f(this.ast.pragmas).find((i) => i.name === "throttle")) == null ? void 0 : a.value) ? {
      id: this.buildEntityId("input_datetime", `st_${this.projectName}_${this.ast.name}_last_run`),
      type: "input_datetime",
      name: `ST ${this.ast.name} Last Run`
    } : null;
  }
  buildEntityId(e, t) {
    return `${e}.${t}`.toLowerCase().replace(/[^a-z0-9_.]/g, "_");
  }
  /**
   * Build the throttle condition (MUST-DO #10).
   *
   * `now()` is timezone-aware while an input_datetime state is naive
   * ("2026-07-28 13:00:00"), so subtracting the two datetimes raises
   * "can't subtract offset-naive and offset-aware datetimes". as_timestamp()
   * reads the naive helper state as local time and takes a default for the
   * uninitialised case, which keeps the first-run fallback intact.
   */
  generateThrottleCondition(e, t) {
    return `{% set last = states('${e}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (as_timestamp(now()) - as_timestamp(last, 0)) > ${t} }}
{% endif %}`;
  }
  parseTimeToSeconds(e) {
    if (!/^T#/i.test(e)) return 0;
    const t = e.slice(2), a = /(\d+)(ms|h|m|s)/gi;
    let i = 0, r = "";
    for (const n of t.matchAll(a)) {
      const s = parseInt(n[1], 10), o = n[2].toLowerCase();
      switch (r += n[0], o) {
        case "h":
          i += s * 3600;
          break;
        case "m":
          i += s * 60;
          break;
        case "s":
          i += s;
          break;
        case "ms":
          i += s / 1e3;
          break;
      }
    }
    return r.toLowerCase() === t.toLowerCase() ? i : 0;
  }
  // ==========================================================================
  // Trigger Mapping
  // ==========================================================================
  mapTriggerConfig(e) {
    switch (e.platform) {
      case "state":
        return {
          platform: "state",
          entity_id: e.entity_id,
          from: e.from,
          to: e.to,
          not_from: e.not_from,
          not_to: e.not_to,
          attribute: e.attribute,
          for: e.for,
          id: e.id
        };
      case "numeric_state":
        return {
          platform: "numeric_state",
          entity_id: e.entity_id,
          above: e.above,
          below: e.below,
          attribute: e.attribute,
          for: e.for,
          id: e.id
        };
      case "event":
        return {
          platform: "event",
          event_type: e.event_type,
          event_data: e.event_data,
          id: e.id
        };
      case "time":
        return {
          platform: "time",
          at: e.at,
          id: e.id
        };
      default:
        return {
          platform: "state",
          entity_id: e.entity_id || "",
          id: e.id
        };
    }
  }
  // ==========================================================================
  // Script Generation
  // ==========================================================================
  generateScript() {
    var s;
    const t = ((s = f(this.ast.pragmas).find((o) => o.name === "mode")) == null ? void 0 : s.value) || "restart", a = new v(this.context, this.timerResolver, this.sourceMapBuilder), i = {
      alias: `[ST] ${this.ast.name} Logic`,
      description: `Logic script for ST program: ${this.ast.name}`,
      mode: t,
      sequence: []
    }, r = this.generateVariableInitializers();
    Object.keys(r).length > 0 && (i.variables = r), this.sourceMapBuilder && this.sourceMapBuilder.pushPath("sequence");
    const n = a.generateActions(this.ast.body);
    if (this.sourceMapBuilder && this.sourceMapBuilder.popPath(), i.sequence = [...this.timerMainActions, ...n], this.sourceMapBuilder) {
      const o = this.sourceMapBuilder.buildEmbedded();
      i.variables ? i.variables = {
        ...i.variables,
        _st_source_map: JSON.stringify(o._st_source_map),
        _st_source_file: o._st_source_file,
        _st_source_hash: o._st_source_hash
      } : i.variables = {
        _st_source_map: JSON.stringify(o._st_source_map),
        _st_source_file: o._st_source_file,
        _st_source_hash: o._st_source_hash
      };
    }
    return i;
  }
  generateVariableInitializers() {
    const e = {};
    for (const t of this.storageAnalysis.variables) {
      if (t.storage.type !== "TRANSIENT")
        continue;
      const a = this.ast.variables.find((i) => i.name === t.name);
      a != null && a.initialValue && a.initialValue.type === "Literal" && (a.initialValue.kind === "string" ? e[t.name] = String(a.initialValue.value) : a.initialValue.kind === "boolean" ? e[t.name] = a.initialValue.value ? "true" : "false" : e[t.name] = String(a.initialValue.value));
    }
    return e;
  }
}
function R(u, e, t) {
  return new I(u, e, t).transpile();
}
const F = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ActionGenerator: v,
  JinjaGenerator: _,
  Transpiler: I,
  generateEntityStateRead: M,
  generateThrottleCondition: H,
  transpile: R
}, Symbol.toStringTag, { value: "Module" })), h = class h {
  constructor(e) {
    c(this, "client");
    c(this, "connection");
    this.client = e, this.connection = e.connection;
  }
  // ==========================================================================
  // Automation API (REST)
  // ==========================================================================
  static automationPath(e) {
    return `config/automation/config/${encodeURIComponent(e)}`;
  }
  async getAutomation(e) {
    try {
      return await this.client.callApi(
        "GET",
        h.automationPath(e)
      );
    } catch {
      return null;
    }
  }
  async saveAutomation(e, t) {
    await this.client.callApi(
      "POST",
      h.automationPath(e),
      t
    );
  }
  async deleteAutomation(e) {
    await this.client.callApi(
      "DELETE",
      h.automationPath(e)
    );
  }
  async reloadAutomations() {
    await this.connection.sendMessagePromise({
      type: "call_service",
      domain: "automation",
      service: "reload"
    });
  }
  // ==========================================================================
  // Script API (REST)
  // ==========================================================================
  static scriptPath(e) {
    return `config/script/config/${encodeURIComponent(e)}`;
  }
  async getScript(e) {
    try {
      return await this.client.callApi(
        "GET",
        h.scriptPath(e)
      );
    } catch {
      return null;
    }
  }
  async saveScript(e, t) {
    await this.client.callApi(
      "POST",
      h.scriptPath(e),
      t
    );
  }
  async deleteScript(e) {
    await this.client.callApi("DELETE", h.scriptPath(e));
  }
  async reloadScripts() {
    await this.connection.sendMessagePromise({
      type: "call_service",
      domain: "script",
      service: "reload"
    });
  }
  // ==========================================================================
  // Helper API
  // ==========================================================================
  async getStates() {
    return this.connection.sendMessagePromise({
      type: "get_states"
    });
  }
  async getSTHelpers(e = "st_") {
    return (await this.getStates()).filter((a) => {
      const [i, r] = a.entity_id.split(".");
      return !!r && h.HELPER_DOMAINS.has(i) && r.startsWith(e);
    });
  }
  async deleteHelper(e) {
    const [t, a] = e.split(".");
    await this.connection.sendMessagePromise({
      type: `${t}/delete`,
      // e.g. input_number_id, input_boolean_id, ...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [`${t}_id`]: a
    });
  }
  /**
   * HA derives a storage helper's immutable id from its name on create. Create
   * with the requested object id first, verify what HA allocated, then restore
   * the human-readable name through the update command (which keeps the id).
   */
  async createHelperWithExactId(e, t, a) {
    if (!t) {
      await this.connection.sendMessagePromise({
        type: `${e}/create`,
        ...a
      });
      return;
    }
    const [i, r, ...n] = t.split(".");
    if (i !== e || !r || n.length > 0)
      throw new Error(
        `Invalid ${e} entity id '${t}' for helper creation`
      );
    const { name: s, ...o } = a, p = await this.connection.sendMessagePromise({
      type: `${e}/create`,
      name: r,
      ...o
    }), l = p == null ? void 0 : p.id;
    if (typeof l != "string")
      throw new Error(
        `Home Assistant did not return an id while creating ${t}`
      );
    if (l !== r)
      throw await this.deleteHelper(`${e}.${l}`), new Error(
        `Home Assistant created ${e}.${l} instead of ${t}`
      );
    if (s !== r)
      try {
        await this.connection.sendMessagePromise({
          type: `${e}/update`,
          [`${e}_id`]: r,
          name: s,
          ...o
        });
      } catch (d) {
        try {
          await this.deleteHelper(t);
        } catch {
        }
        throw d;
      }
  }
  async createInputBoolean(e) {
    await this.createHelperWithExactId("input_boolean", e.id, {
      name: e.name,
      initial: e.initial ?? !1
    });
  }
  async createInputNumber(e) {
    await this.createHelperWithExactId("input_number", e.id, {
      name: e.name,
      initial: e.initial ?? 0,
      min: e.min ?? 0,
      max: e.max ?? 100,
      step: e.step ?? 1,
      mode: e.mode ?? "box"
    });
  }
  async createInputText(e) {
    await this.createHelperWithExactId("input_text", e.id, {
      name: e.name,
      initial: e.initial ?? "",
      pattern: e.pattern
    });
  }
  async createInputDateTime(e) {
    await this.createHelperWithExactId("input_datetime", e.id, {
      name: e.name,
      has_date: !0,
      has_time: !0,
      initial: e.initial ?? ""
    });
  }
  async createTimer(e) {
    await this.createHelperWithExactId("timer", e.id, {
      name: e.name,
      duration: e.duration ?? "00:00:00"
    });
  }
  async setHelperValue(e, t) {
    const [a] = e.split(".");
    switch (a) {
      case "input_boolean":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_boolean",
          service: t ? "turn_on" : "turn_off",
          service_data: { entity_id: e }
        });
        break;
      case "input_number":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_number",
          service: "set_value",
          service_data: { entity_id: e, value: t }
        });
        break;
      case "input_text":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_text",
          service: "set_value",
          service_data: { entity_id: e, value: t }
        });
        break;
      case "input_datetime":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "input_datetime",
          service: "set_datetime",
          service_data: { entity_id: e, datetime: t }
        });
        break;
      case "counter":
        await this.connection.sendMessagePromise({
          type: "call_service",
          domain: "counter",
          service: "set_value",
          service_data: { entity_id: e, value: t }
        });
        break;
    }
  }
};
c(h, "HELPER_DOMAINS", /* @__PURE__ */ new Set([
  "input_boolean",
  "input_number",
  "input_text",
  "input_datetime",
  "input_select",
  "counter",
  "timer"
]));
let y = h;
class b {
  constructor(e, t = "st_") {
    c(this, "api");
    c(this, "projectPrefix");
    this.api = e, this.projectPrefix = t;
  }
  async calculateSync(e, t, a) {
    const r = (a ?? await this.getExistingHelpers(t)).filter(
      (p) => this.isInScope(p.entityId, t)
    ), n = new Set(r.map((p) => p.entityId)), s = new Set(e.map((p) => p.id)), o = {
      toCreate: [],
      toUpdate: [],
      toDelete: [],
      unchanged: []
    };
    for (const p of e)
      if (!n.has(p.id))
        o.toCreate.push(p);
      else {
        const l = r.find((d) => d.entityId === p.id);
        l && this.needsUpdate(p, l) ? o.toUpdate.push(p) : o.unchanged.push(p.id);
      }
    for (const p of r)
      s.has(p.entityId) || o.toDelete.push(p.entityId);
    return o;
  }
  async getExistingHelpers(e = this.projectPrefix) {
    return (await this.api.getSTHelpers(e)).map((a) => ({
      entityId: a.entity_id,
      type: a.entity_id.split(".")[0],
      state: a.state,
      attributes: a.attributes
    }));
  }
  toHelperConfig(e) {
    const t = typeof e.attributes.friendly_name == "string" && e.attributes.friendly_name || this.extractName(e.entityId);
    switch (e.type) {
      case "input_boolean":
        return {
          id: e.entityId,
          type: "input_boolean",
          name: t,
          initial: e.state === "on"
        };
      case "input_number":
        return {
          id: e.entityId,
          type: "input_number",
          name: t,
          initial: this.parseNumericValue(e.state),
          min: this.parseOptionalNumber(e.attributes.min),
          max: this.parseOptionalNumber(e.attributes.max),
          step: this.parseOptionalNumber(e.attributes.step),
          mode: e.attributes.mode === "slider" || e.attributes.mode === "box" ? e.attributes.mode : void 0
        };
      case "input_text":
        return {
          id: e.entityId,
          type: "input_text",
          name: t,
          initial: e.state,
          pattern: typeof e.attributes.pattern == "string" ? e.attributes.pattern : void 0
        };
      case "input_datetime":
        return {
          id: e.entityId,
          type: "input_datetime",
          name: t,
          initial: e.state
        };
      case "input_select":
        return {
          id: e.entityId,
          type: "input_select",
          name: t,
          initial: e.state,
          options: Array.isArray(e.attributes.options) ? e.attributes.options.filter(
            (a) => typeof a == "string"
          ) : void 0
        };
      case "counter":
        return {
          id: e.entityId,
          type: "counter",
          name: t,
          initial: this.parseNumericValue(e.state),
          min: this.parseOptionalNumber(e.attributes.minimum),
          max: this.parseOptionalNumber(e.attributes.maximum),
          step: this.parseOptionalNumber(e.attributes.step)
        };
      case "timer":
        return {
          id: e.entityId,
          type: "timer",
          name: t,
          initial: typeof e.attributes.duration == "string" && e.attributes.duration || e.state
        };
      default:
        return {
          id: e.entityId,
          type: e.type,
          name: t,
          initial: e.state
        };
    }
  }
  needsUpdate(e, t) {
    if (e.type !== t.type)
      return !0;
    if (e.type === "input_number") {
      const a = t.attributes, i = a.min, r = a.max;
      if (e.min !== i || e.max !== r)
        return !0;
    }
    return !1;
  }
  async applySync(e, t = {}) {
    for (const a of e.toCreate)
      await this.createHelper(a);
    for (const a of e.toUpdate)
      await this.api.deleteHelper(a.id), await this.createHelper(a);
    if (!t.skipDeletes)
      for (const a of e.toDelete)
        await this.api.deleteHelper(a);
  }
  async createHelper(e) {
    const t = e.name || this.extractName(e.id);
    switch (e.type) {
      case "input_boolean":
        await this.api.createInputBoolean({
          id: e.id,
          name: t,
          initial: !!(e.initial ?? !1)
        });
        break;
      case "input_number":
        await this.api.createInputNumber({
          id: e.id,
          name: t,
          initial: Number(e.initial ?? e.min ?? 0),
          min: e.min,
          max: e.max,
          step: e.step,
          mode: e.mode
        });
        break;
      case "input_text":
        await this.api.createInputText({
          id: e.id,
          name: t,
          initial: String(e.initial ?? ""),
          pattern: e.pattern
        });
        break;
      case "input_datetime":
        await this.api.createInputDateTime({
          id: e.id,
          name: t,
          initial: String(e.initial ?? "")
        });
        break;
      case "timer":
        await this.api.createTimer({
          id: e.id,
          name: t,
          duration: String(e.initial ?? "00:00:00")
        });
        break;
      default:
        throw new Error(`Unknown helper type: ${e.type} (${t})`);
    }
  }
  isInScope(e, t) {
    const a = e.split(".")[1];
    return !!a && a.startsWith(t);
  }
  extractName(e) {
    const t = e.split(".");
    return t.length !== 2 ? e : t[1].split("_").map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(" ");
  }
  parseOptionalNumber(e) {
    if (typeof e == "number") return e;
    if (typeof e == "string" && e.trim() !== "") {
      const t = Number(e);
      return Number.isNaN(t) ? void 0 : t;
    }
  }
  parseNumericValue(e) {
    const t = Number(e);
    return Number.isNaN(t) ? 0 : t;
  }
  async getHelperStates(e) {
    const t = await this.api.getStates(), a = {};
    for (const i of e) {
      const r = t.find((n) => n.entity_id === i);
      r && (a[i] = this.parseHelperValue(r));
    }
    return a;
  }
  parseHelperValue(e) {
    switch (e.entity_id.split(".")[0]) {
      case "input_boolean":
        return e.state === "on";
      case "input_number":
      case "counter":
        return Number.isNaN(Number(e.state)) ? 0 : Number(e.state);
      case "input_text":
      case "input_datetime":
      default:
        return e.state;
    }
  }
  async restoreHelperStates(e) {
    for (const [t, a] of Object.entries(e))
      try {
        await this.api.setHelperValue(t, a);
      } catch (i) {
        console.warn(`Failed to restore ${t}:`, i);
      }
  }
}
const m = "st_hass_backups", T = 10;
class $ {
  constructor(e) {
    c(this, "api");
    c(this, "helperManager");
    this.api = e, this.helperManager = new b(e);
  }
  async createBackup(e, t) {
    const a = await this.api.getAutomation(e), i = this.getScriptId(e), r = await this.api.getScript(i), s = (await this.helperManager.getExistingHelpers(
      `${e}_`
    )).map(
      (d) => this.helperManager.toHelperConfig(d)
    ), o = s.map((d) => d.id), p = await this.helperManager.getHelperStates(o), l = {
      id: this.generateId(),
      timestamp: /* @__PURE__ */ new Date(),
      projectName: "default",
      programName: t,
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        automation: a,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        script: r,
        helpers: s,
        helperStates: p
      }
    };
    return await this.saveBackup(l), l;
  }
  async restoreBackup(e) {
    const t = await this.loadBackup(e);
    if (!t)
      throw new Error(`Backup not found: ${e}`);
    if (t.data.automation && await this.api.saveAutomation(
      t.data.automation.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      t.data.automation
    ), t.data.script && t.data.automation) {
      const a = this.getScriptId(t.data.automation.id);
      await this.api.saveScript(
        a,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t.data.script
      );
    }
    for (const a of t.data.helpers)
      try {
        await this.helperManager.createHelper(a);
      } catch {
      }
    await this.helperManager.restoreHelperStates(t.data.helperStates), await this.api.reloadAutomations(), await this.api.reloadScripts();
  }
  async listBackups() {
    const e = window.localStorage.getItem(m);
    if (!e) return [];
    try {
      return JSON.parse(e).map((a) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }));
    } catch {
      return [];
    }
  }
  async loadBackup(e) {
    return (await this.listBackups()).find((a) => a.id === e) || null;
  }
  async deleteBackup(e) {
    const a = (await this.listBackups()).filter((i) => i.id !== e);
    window.localStorage.setItem(m, JSON.stringify(a));
  }
  async saveBackup(e) {
    const t = await this.listBackups();
    t.unshift(e);
    const a = t.slice(0, T);
    window.localStorage.setItem(m, JSON.stringify(a));
  }
  async cleanupOldBackups(e = T) {
    const t = await this.listBackups();
    if (t.length <= e) return 0;
    const a = t.slice(e), i = t.slice(0, e);
    return window.localStorage.setItem(m, JSON.stringify(i)), a.length;
  }
  generateId() {
    return `backup_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }
  getScriptId(e) {
    return `${e}_logic`;
  }
}
const g = "st_hass_schemas";
class P {
  save(e, t) {
    const a = this.loadAll();
    a[e] = t, localStorage.setItem(g, JSON.stringify(a));
  }
  load(e) {
    return this.loadAll()[e] || null;
  }
  loadAll() {
    const e = localStorage.getItem(g);
    if (!e) return {};
    try {
      return JSON.parse(e);
    } catch {
      return {};
    }
  }
  delete(e) {
    const t = this.loadAll();
    delete t[e], localStorage.setItem(g, JSON.stringify(t));
  }
  clear() {
    localStorage.removeItem(g);
  }
}
class x {
  /**
   * Detect migration issues between old and new schema
   */
  detectIssues(e, t) {
    const a = [];
    if (!e)
      return {
        issues: [],
        hasDestructiveChanges: !1,
        requiresUserInput: !1
      };
    const i = new Map(e.variables.map((n) => [n.name, n])), r = new Map(t.variables.map((n) => [n.name, n]));
    for (const [n, s] of i)
      r.has(n) || a.push(this.createRemovedIssue(s));
    for (const [n, s] of r) {
      const o = i.get(n);
      if (!o)
        a.push(this.createAddedIssue(s));
      else {
        const p = this.detectChanges(o, s);
        a.push(...p);
      }
    }
    return {
      issues: a,
      hasDestructiveChanges: a.some(
        (n) => n.options.some((s) => s.isDestructive)
      ),
      requiresUserInput: a.some(
        (n) => n.type === "removed" || n.type === "type_changed"
      )
    };
  }
  createRemovedIssue(e) {
    return {
      type: "removed",
      variable: e.name,
      helperId: e.helperId,
      details: `Variable '${e.name}' wurde aus dem Code entfernt`,
      oldSchema: e,
      options: [
        {
          id: "delete",
          label: "Helper löschen",
          description: "Entfernt den Helper und seinen Wert",
          isDestructive: !0
        },
        {
          id: "keep",
          label: "Helper behalten (orphaned)",
          description: "Behält den Helper, wird aber nicht mehr verwendet"
        }
      ],
      defaultOption: "delete"
    };
  }
  createAddedIssue(e) {
    return {
      type: "added",
      variable: e.name,
      helperId: e.helperId,
      details: `Neue Variable '${e.name}' hinzugefügt`,
      newSchema: e,
      options: [
        {
          id: "create",
          label: "Helper erstellen",
          description: `Erstellt neuen Helper mit Initialwert ${JSON.stringify(
            e.initialValue
          )}`
        }
      ],
      defaultOption: "create"
    };
  }
  detectChanges(e, t) {
    const a = [];
    return e.dataType !== t.dataType && a.push({
      type: "type_changed",
      variable: e.name,
      helperId: e.helperId,
      details: `Typ geändert: ${e.dataType} → ${t.dataType}`,
      oldSchema: e,
      newSchema: t,
      options: this.getTypeChangeOptions(e, t),
      defaultOption: "convert"
    }), e.helperType === "input_number" && t.helperType === "input_number" && (e.min !== t.min || e.max !== t.max) && a.push({
      type: "range_changed",
      variable: e.name,
      helperId: e.helperId,
      details: `Bereich geändert: [${e.min}, ${e.max}] → [${t.min}, ${t.max}]`,
      oldSchema: e,
      newSchema: t,
      options: [
        {
          id: "update_range",
          label: "Bereich aktualisieren",
          description: "Aktualisiert min/max, Wert wird ggf. begrenzt"
        },
        {
          id: "reset",
          label: "Auf Initialwert zurücksetzen",
          description: `Setzt auf ${t.initialValue}`
        }
      ],
      defaultOption: "update_range"
    }), a;
  }
  getTypeChangeOptions(e, t) {
    const a = [];
    return this.canConvert(e.dataType, t.dataType) && a.push({
      id: "convert",
      label: "Wert konvertieren",
      description: `Konvertiert ${e.dataType} zu ${t.dataType}`
    }), a.push({
      id: "reset",
      label: "Auf Initialwert zurücksetzen",
      description: `Setzt auf ${JSON.stringify(t.initialValue)}`,
      isDestructive: !0
    }), a.push({
      id: "keep_helper",
      label: "Alten Helper behalten, neuen erstellen",
      description: "Erstellt neuen Helper, alter wird orphaned"
    }), a;
  }
  canConvert(e, t) {
    var i;
    return ((i = {
      INT: ["DINT", "REAL", "LREAL", "STRING"],
      DINT: ["REAL", "LREAL", "STRING"],
      REAL: ["LREAL", "STRING"],
      LREAL: ["STRING"],
      BOOL: ["INT", "STRING"]
    }[e]) == null ? void 0 : i.includes(t)) ?? !1;
  }
}
class S {
  constructor(e) {
    c(this, "api");
    c(this, "helperManager");
    c(this, "backupManager");
    c(this, "schemaStorage");
    c(this, "migrationDetector");
    this.api = e, this.helperManager = new b(e), this.backupManager = new $(e), this.schemaStorage = new P(), this.migrationDetector = new x();
  }
  async deploy(e, t = {}) {
    const a = this.createTransaction(e);
    try {
      await this.validateDeployment(e), t.createBackup && await this.backupManager.createBackup(e.automation.id, e.automation.alias);
      const i = await this.calculateOperations(e);
      if (a.operations = i, t.dryRun)
        return {
          success: !0,
          transactionId: a.id,
          operations: i,
          errors: []
        };
      a.status = "in_progress";
      for (const n of i)
        try {
          await this.applyOperation(n), n.status = "applied";
        } catch (s) {
          return n.status = "failed", n.error = this.formatError(s), await this.rollback(a), {
            success: !1,
            transactionId: a.id,
            operations: i,
            errors: [
              {
                operation: n,
                message: n.error ?? "Unknown deploy error",
                code: "DEPLOY_FAILED"
              }
            ]
          };
        }
      return await this.reloadAll(), await this.verifyDeployment(e) ? (a.status = "committed", {
        success: !0,
        transactionId: a.id,
        operations: i,
        errors: []
      }) : (await this.rollback(a), {
        success: !1,
        transactionId: a.id,
        operations: i,
        errors: [
          {
            message: "Deployment verification failed",
            code: "VERIFY_FAILED"
          }
        ]
      });
    } catch (i) {
      a.status = "failed", a.operations.some((n) => n.status === "applied") && await this.rollback(a);
      const r = {
        message: this.formatError(i),
        code: "DEPLOY_ERROR"
      };
      return {
        success: !1,
        transactionId: a.id,
        operations: a.operations,
        errors: [r]
      };
    }
  }
  async rollback(e) {
    const t = e.operations.filter((a) => a.status === "applied").reverse();
    for (const a of t)
      try {
        await this.revertOperation(a), a.status = "reverted";
      } catch (i) {
        console.error(`Failed to revert operation ${a.id}:`, i);
      }
    try {
      await this.reloadAll();
    } catch (a) {
      console.error("Failed to reload Home Assistant after rollback:", a);
    }
    e.status = "rolled_back";
  }
  createTransaction(e) {
    return {
      id: this.generateId(),
      timestamp: /* @__PURE__ */ new Date(),
      projectName: "default",
      programName: e.automation.alias.replace("[ST] ", ""),
      operations: [],
      status: "pending"
    };
  }
  async validateDeployment(e) {
    const t = e.diagnostics.filter((a) => a.severity === "Error");
    if (t.length > 0)
      throw new Error(`Transpilation errors: ${t.map((a) => a.message).join(", ")}`);
    if (e.automation.trigger.length === 0)
      throw new Error("Automation has no triggers - it will never execute");
  }
  async calculateOperations(e) {
    const t = [], a = [e.automation, ...e.additionalAutomations ?? []];
    for (const l of a) {
      const d = await this.api.getAutomation(l.id);
      t.push({
        id: this.generateId(),
        type: d ? "update" : "create",
        entityType: "automation",
        entityId: l.id,
        previousState: d ?? void 0,
        newState: l,
        status: "pending"
      });
    }
    const i = this.getScriptId(e), r = await this.api.getScript(i);
    t.push({
      id: this.generateId(),
      type: r ? "update" : "create",
      entityType: "script",
      entityId: i,
      previousState: r ?? void 0,
      newState: e.script,
      status: "pending"
    });
    const n = `${e.automation.id}_`, s = await this.helperManager.getExistingHelpers(n), o = new Map(
      s.map((l) => [l.entityId, l])
    ), p = await this.helperManager.calculateSync(
      e.helpers,
      n,
      s
    );
    for (const l of p.toCreate)
      t.push({
        id: this.generateId(),
        type: "create",
        entityType: "helper",
        entityId: l.id,
        newState: l,
        status: "pending"
      });
    for (const l of p.toUpdate) {
      const d = o.get(l.id);
      t.push({
        id: this.generateId(),
        type: "update",
        entityType: "helper",
        entityId: l.id,
        previousState: d ? this.helperManager.toHelperConfig(d) : void 0,
        newState: l,
        status: "pending"
      });
    }
    for (const l of p.toDelete) {
      const d = o.get(l);
      t.push({
        id: this.generateId(),
        type: "delete",
        entityType: "helper",
        entityId: l,
        previousState: d ? this.helperManager.toHelperConfig(d) : void 0,
        status: "pending"
      });
    }
    return t;
  }
  /**
   * Build a ProgramSchema from current helper configuration.
   * This does not change deploy behaviour and can be used by UI code
   * to drive migration flows.
   */
  buildProgramSchema(e) {
    const t = e.automation.alias.replace("[ST] ", ""), a = "default", i = e.helpers.map((r) => ({
      name: r.id,
      dataType: r.type,
      helperId: r.id,
      helperType: r.type === "counter" ? "input_number" : r.type,
      initialValue: r.initial,
      restorePolicy: 0,
      // restore policy is assigned at analysis time; not wired here yet
      min: r.min,
      max: r.max,
      step: r.step
    }));
    return {
      programName: t,
      projectName: a,
      variables: i,
      version: "1.0",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Create a migration plan based on previous and current schemas.
   * Intended to be called by higher-level UI logic before executing a deploy.
   */
  createMigrationPlan(e) {
    const t = this.buildProgramSchema(e), a = e.automation.id, i = this.schemaStorage.load(a), r = this.migrationDetector.detectIssues(i, t);
    return this.schemaStorage.save(a, t), r;
  }
  generateId() {
    return `op_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }
  formatError(e) {
    if (e instanceof Error && e.message)
      return e.message;
    if (typeof e == "string")
      return e;
    if (e && typeof e == "object") {
      const t = e;
      if (typeof t.message == "string" && t.message.trim())
        return t.message;
      if (t.body && typeof t.body == "object") {
        const a = t.body;
        if (typeof a.message == "string" && a.message.trim())
          return a.message;
        if (typeof a.error == "string" && a.error.trim())
          return a.error;
      }
      if (typeof t.error == "string" && t.error.trim())
        return t.error;
      try {
        return JSON.stringify(e);
      } catch {
      }
    }
    return "Unknown deploy error";
  }
  getScriptId(e) {
    return `${e.automation.id}_logic`;
  }
  async applyOperation(e) {
    switch (e.entityType) {
      case "automation":
        e.type === "delete" ? await this.api.deleteAutomation(e.entityId) : await this.api.saveAutomation(e.entityId, e.newState);
        break;
      case "script":
        e.type === "delete" ? await this.api.deleteScript(e.entityId) : await this.api.saveScript(e.entityId, e.newState);
        break;
      case "helper":
        if (e.type === "delete")
          await this.api.deleteHelper(e.entityId);
        else if (e.type === "update") {
          await this.api.deleteHelper(e.entityId);
          try {
            await this.helperManager.createHelper(e.newState);
          } catch (t) {
            if (e.previousState)
              try {
                await this.helperManager.createHelper(
                  e.previousState
                );
              } catch (a) {
                throw new Error(
                  `Helper update failed (${this.formatError(t)}) and the previous helper could not be restored (${this.formatError(a)})`
                );
              }
            throw t;
          }
        } else
          await this.helperManager.createHelper(e.newState);
        break;
    }
  }
  async revertOperation(e) {
    switch (e.type) {
      case "create":
        e.entityType === "automation" ? await this.api.deleteAutomation(e.entityId) : e.entityType === "script" ? await this.api.deleteScript(e.entityId) : e.entityType === "helper" && await this.api.deleteHelper(e.entityId);
        break;
      case "update":
        if (!e.previousState) return;
        e.entityType === "automation" ? await this.api.saveAutomation(e.entityId, e.previousState) : e.entityType === "script" ? await this.api.saveScript(e.entityId, e.previousState) : e.entityType === "helper" && (await this.api.deleteHelper(e.entityId), await this.helperManager.createHelper(e.previousState));
        break;
      case "delete":
        if (!e.previousState) return;
        e.entityType === "automation" ? await this.api.saveAutomation(e.entityId, e.previousState) : e.entityType === "script" ? await this.api.saveScript(e.entityId, e.previousState) : e.entityType === "helper" && await this.helperManager.createHelper(e.previousState);
        break;
    }
  }
  async reloadAll() {
    await this.api.reloadAutomations(), await this.api.reloadScripts();
  }
  async verifyDeployment(e) {
    const t = [e.automation, ...e.additionalAutomations ?? []];
    for (const n of t)
      if (!await this.api.getAutomation(n.id)) return !1;
    const a = this.getScriptId(e);
    if (!await this.api.getScript(a)) return !1;
    const r = await this.api.getStates();
    for (const n of e.helpers)
      if (!r.some((o) => o.entity_id === n.id)) return !1;
    return !0;
  }
}
async function U(u, e, t) {
  return new S(u).deploy(e, t);
}
const z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BackupManager: $,
  DeployManager: S,
  HAApiClient: y,
  HelperManager: b,
  deploy: U
}, Symbol.toStringTag, { value: "Module" }));
export {
  z as a,
  F as i
};
//# sourceMappingURL=transpiler-deploy-BEqdI1Ag.js.map
