var Yt = Object.defineProperty;
var zt = (n, t, e) => t in n ? Yt(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var l = (n, t, e) => zt(n, typeof t != "symbol" ? t + "" : t, e);
import { i as x, n as u, a as k, b as c, t as $, r as P } from "./lit-C178dhqO.js";
import { c as a, L as N, C as qt } from "./chevrotain-cBR36crC.js";
import { s as Gt } from "./ha-websocket-DcUbagYv.js";
const h = (n, t) => a({ name: n, pattern: new RegExp(`\\b${t}\\b`, "i") }), Wt = a({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: N.SKIPPED
}), Qt = a({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: N.SKIPPED
}), jt = a({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: N.SKIPPED
}), F = a({
  name: "Pragma",
  pattern: /\{[^}]+\}/
}), V = a({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: void 0
}), Ht = a({
  name: "EndFunction",
  pattern: /END_FUNCTION/i
}), Kt = a({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i
}), Xt = a({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i
}), Y = a({ name: "EndVar", pattern: /END_VAR/i }), z = a({
  name: "VarInput",
  pattern: /VAR_INPUT/i
}), q = a({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i
}), G = a({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i
}), W = a({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i
}), Q = a({ name: "EndIf", pattern: /END_IF/i }), j = a({ name: "EndCase", pattern: /END_CASE/i }), H = a({ name: "EndFor", pattern: /END_FOR/i }), K = a({
  name: "EndWhile",
  pattern: /END_WHILE/i
}), X = a({
  name: "EndRepeat",
  pattern: /END_REPEAT/i
}), Z = h("Program", "PROGRAM"), Zt = h("Function", "FUNCTION"), J = h("Var", "VAR"), Jt = h("Constant", "CONSTANT"), tt = h("If", "IF"), C = h("Then", "THEN"), et = h("Elsif", "ELSIF"), T = h("Else", "ELSE"), it = h("Case", "CASE"), st = h("Of", "OF"), nt = h("For", "FOR"), at = h("To", "TO"), rt = h("By", "BY"), R = h("Do", "DO"), ot = h("While", "WHILE"), lt = h("Repeat", "REPEAT"), ht = h("Until", "UNTIL"), ct = h("Return", "RETURN"), pt = h("Exit", "EXIT"), te = h("Continue", "CONTINUE"), A = h("At", "AT"), dt = h("And", "AND"), ut = h("Or", "OR"), ee = h("Xor", "XOR"), mt = h("Not", "NOT"), ft = h("Mod", "MOD"), Et = h("True", "TRUE"), gt = h("False", "FALSE"), yt = h("TypeBool", "BOOL"), Lt = a({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i
}), St = a({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i
}), Ut = a({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i
}), bt = a({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i
}), ie = a({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i
}), vt = a({
  name: "TimeLiteral",
  pattern: /T(IME)?#[\d_]+(\.[\d_]+)?([a-z]+)?/i
}), se = a({
  name: "HexLiteral",
  pattern: /16#[\da-fA-F_]+/
}), ne = a({
  name: "BinaryLiteral",
  pattern: /2#[01_]+/
}), ae = a({
  name: "OctalLiteral",
  pattern: /8#[0-7_]+/
}), Ot = a({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/
}), Nt = a({
  name: "IntegerLiteral",
  pattern: /\d+/
}), _t = a({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/
}), I = a({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i
}), S = a({ name: "Assign", pattern: /:=/ }), re = a({ name: "Output", pattern: /=>/ }), Ct = a({ name: "LessEqual", pattern: /<=/ }), Tt = a({
  name: "GreaterEqual",
  pattern: />=/
}), Rt = a({ name: "NotEqual", pattern: /<>/ }), At = a({ name: "Less", pattern: /</ }), It = a({ name: "Greater", pattern: />/ }), Bt = a({ name: "Equal", pattern: /=/ }), Mt = a({ name: "Plus", pattern: /\+/ }), B = a({ name: "Minus", pattern: /-/ }), wt = a({ name: "Star", pattern: /\*/ }), Dt = a({ name: "Slash", pattern: /\// }), v = a({ name: "LParen", pattern: /\(/ }), O = a({ name: "RParen", pattern: /\)/ }), oe = a({ name: "LBracket", pattern: /\[/ }), le = a({ name: "RBracket", pattern: /\]/ }), M = a({ name: "Colon", pattern: /:/ }), g = a({ name: "Semicolon", pattern: /;/ }), w = a({ name: "Comma", pattern: /,/ }), D = a({ name: "Dot", pattern: /\./ }), xt = a({ name: "Range", pattern: /\.\./ }), p = a({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}), kt = [
  // Skipped
  Wt,
  Qt,
  jt,
  // Pragmas
  F,
  // Multi-word keywords first
  Kt,
  Xt,
  Ht,
  V,
  z,
  q,
  G,
  W,
  Y,
  Q,
  j,
  H,
  K,
  X,
  // Keywords
  Z,
  Zt,
  J,
  Jt,
  tt,
  C,
  et,
  T,
  it,
  st,
  nt,
  at,
  rt,
  R,
  ot,
  lt,
  ht,
  ct,
  pt,
  te,
  A,
  // Logical
  dt,
  ut,
  ee,
  mt,
  ft,
  Et,
  gt,
  // Types
  yt,
  Lt,
  St,
  Ut,
  bt,
  ie,
  // Literals (order: specific before general)
  vt,
  se,
  ne,
  ae,
  Ot,
  Nt,
  _t,
  // I/O
  I,
  // Multi-char operators
  S,
  re,
  xt,
  Ct,
  Tt,
  Rt,
  // Single-char operators
  At,
  It,
  Bt,
  Mt,
  B,
  wt,
  Dt,
  v,
  O,
  oe,
  le,
  M,
  g,
  w,
  D,
  // Identifier last
  p
], he = new N(kt, {
  ensureOptimizations: !0,
  positionTracking: "full"
  // For error reporting
});
function ce(n) {
  const t = he.tokenize(n);
  return {
    tokens: t.tokens,
    errors: t.errors
  };
}
class pe extends qt {
  constructor() {
    super(kt, {
      recoveryEnabled: !0,
      nodeLocationTracking: "full"
    });
    // Program structure
    l(this, "program", this.RULE("program", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(Z), this.CONSUME(p, { LABEL: "programName" }), this.MANY1(() => this.SUBRULE(this.variableBlock)), this.MANY2(() => this.SUBRULE(this.statement)), this.CONSUME(V);
    }));
    // Variable declarations
    l(this, "variableBlock", this.RULE("variableBlock", () => {
      this.OR([
        { ALT: () => this.CONSUME(J) },
        { ALT: () => this.CONSUME(z) },
        { ALT: () => this.CONSUME(q) },
        { ALT: () => this.CONSUME(G) },
        { ALT: () => this.CONSUME(W) }
      ]), this.MANY(() => this.SUBRULE(this.variableDeclaration)), this.CONSUME(Y);
    }));
    l(this, "variableDeclaration", this.RULE("variableDeclaration", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(p, { LABEL: "varName" }), this.OPTION(() => {
        this.CONSUME(A), this.CONSUME(I);
      }), this.OPTION1(() => {
        this.CONSUME(M), this.SUBRULE(this.typeSpec);
      }), this.OPTION2(() => {
        this.CONSUME(S), this.SUBRULE(this.expression);
      }), this.OPTION3(() => {
        this.CONSUME1(A), this.CONSUME1(I);
      }), this.CONSUME(g);
    }));
    l(this, "pragma", this.RULE("pragma", () => {
      this.CONSUME(F);
    }));
    l(this, "typeSpec", this.RULE("typeSpec", () => {
      this.OR([
        { ALT: () => this.CONSUME(yt) },
        { ALT: () => this.CONSUME(Lt) },
        { ALT: () => this.CONSUME(St) },
        { ALT: () => this.CONSUME(Ut) },
        { ALT: () => this.CONSUME(bt) },
        { ALT: () => this.CONSUME(p) }
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
      this.SUBRULE(this.variableReference), this.CONSUME(S), this.SUBRULE(this.expression), this.CONSUME(g);
    }));
    l(this, "ifStatement", this.RULE("ifStatement", () => {
      this.CONSUME(tt), this.SUBRULE(this.expression, { LABEL: "condition" }), this.CONSUME(C), this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" })), this.MANY1(() => {
        this.CONSUME(et), this.SUBRULE1(this.expression, { LABEL: "elsifCondition" }), this.CONSUME1(C), this.MANY2(
          () => this.SUBRULE1(this.statement, { LABEL: "elsifStatements" })
        );
      }), this.OPTION(() => {
        this.CONSUME(T), this.MANY3(
          () => this.SUBRULE2(this.statement, { LABEL: "elseStatements" })
        );
      }), this.CONSUME(Q);
    }));
    l(this, "caseStatement", this.RULE("caseStatement", () => {
      this.CONSUME(it), this.SUBRULE(this.expression, { LABEL: "selector" }), this.CONSUME(st), this.MANY(() => this.SUBRULE(this.caseClause)), this.OPTION(() => {
        this.CONSUME(T), this.MANY1(() => this.SUBRULE(this.statement));
      }), this.CONSUME(j);
    }));
    l(this, "caseClause", this.RULE("caseClause", () => {
      this.SUBRULE(this.caseLabelList), this.CONSUME(M), this.MANY(() => this.SUBRULE(this.statement));
    }));
    l(this, "caseLabelList", this.RULE("caseLabelList", () => {
      this.SUBRULE(this.caseLabel), this.MANY(() => {
        this.CONSUME(w), this.SUBRULE1(this.caseLabel);
      });
    }));
    l(this, "caseLabel", this.RULE("caseLabel", () => {
      this.SUBRULE(this.expression), this.OPTION(() => {
        this.CONSUME(xt), this.SUBRULE1(this.expression);
      });
    }));
    l(this, "forStatement", this.RULE("forStatement", () => {
      this.CONSUME(nt), this.CONSUME(p, { LABEL: "controlVar" }), this.CONSUME(S), this.SUBRULE(this.expression, { LABEL: "start" }), this.CONSUME(at), this.SUBRULE1(this.expression, { LABEL: "end" }), this.OPTION(() => {
        this.CONSUME(rt), this.SUBRULE2(this.expression, { LABEL: "step" });
      }), this.CONSUME(R), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(H);
    }));
    l(this, "whileStatement", this.RULE("whileStatement", () => {
      this.CONSUME(ot), this.SUBRULE(this.expression), this.CONSUME(R), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(K);
    }));
    l(this, "repeatStatement", this.RULE("repeatStatement", () => {
      this.CONSUME(lt), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(ht), this.SUBRULE(this.expression), this.CONSUME(X);
    }));
    l(this, "returnStatement", this.RULE("returnStatement", () => {
      this.CONSUME(ct), this.CONSUME(g);
    }));
    l(this, "exitStatement", this.RULE("exitStatement", () => {
      this.CONSUME(pt), this.CONSUME(g);
    }));
    l(this, "functionCallStatement", this.RULE("functionCallStatement", () => {
      this.SUBRULE(this.functionCall), this.CONSUME(g);
    }));
    // Expressions with operator precedence
    l(this, "expression", this.RULE("expression", () => {
      this.SUBRULE(this.orExpression);
    }));
    l(this, "orExpression", this.RULE("orExpression", () => {
      this.SUBRULE(this.andExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(ut), this.SUBRULE1(this.andExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "andExpression", this.RULE("andExpression", () => {
      this.SUBRULE(this.comparisonExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(dt), this.SUBRULE1(this.comparisonExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "comparisonExpression", this.RULE("comparisonExpression", () => {
      this.SUBRULE(this.additiveExpression, { LABEL: "lhs" }), this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(Bt) },
          { ALT: () => this.CONSUME(Rt) },
          { ALT: () => this.CONSUME(At) },
          { ALT: () => this.CONSUME(Ct) },
          { ALT: () => this.CONSUME(It) },
          { ALT: () => this.CONSUME(Tt) }
        ]), this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "additiveExpression", this.RULE("additiveExpression", () => {
      this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Mt) },
          { ALT: () => this.CONSUME(B) }
        ]), this.SUBRULE1(this.multiplicativeExpression, { LABEL: "rhs" });
      });
    }));
    l(this, "multiplicativeExpression", this.RULE(
      "multiplicativeExpression",
      () => {
        this.SUBRULE(this.unaryExpression, { LABEL: "lhs" }), this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(wt) },
            { ALT: () => this.CONSUME(Dt) },
            { ALT: () => this.CONSUME(ft) }
          ]), this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
        });
      }
    ));
    l(this, "unaryExpression", this.RULE("unaryExpression", () => {
      this.OR([
        {
          ALT: () => {
            this.OR1([
              { ALT: () => this.CONSUME(mt) },
              { ALT: () => this.CONSUME(B) }
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
            this.CONSUME(v), this.SUBRULE(this.expression), this.CONSUME(O);
          }
        }
      ]);
    }));
    l(this, "identifierOrCall", this.RULE("identifierOrCall", () => {
      this.CONSUME(p), this.MANY(() => {
        this.CONSUME(D), this.CONSUME1(p);
      }), this.OPTION(() => {
        this.CONSUME(v), this.OPTION1(() => {
          this.SUBRULE(this.argumentList);
        }), this.CONSUME(O);
      });
    }));
    l(this, "literal", this.RULE("literal", () => {
      this.OR([
        { ALT: () => this.CONSUME(Et) },
        { ALT: () => this.CONSUME(gt) },
        { ALT: () => this.CONSUME(Nt) },
        { ALT: () => this.CONSUME(Ot) },
        { ALT: () => this.CONSUME(_t) },
        { ALT: () => this.CONSUME(vt) }
      ]);
    }));
    l(this, "variableReference", this.RULE("variableReference", () => {
      this.CONSUME(p), this.MANY(() => {
        this.CONSUME(D), this.CONSUME1(p);
      });
    }));
    l(this, "functionCall", this.RULE("functionCall", () => {
      this.CONSUME(p), this.CONSUME(v), this.OPTION(() => {
        this.SUBRULE(this.argumentList);
      }), this.CONSUME(O);
    }));
    l(this, "argumentList", this.RULE("argumentList", () => {
      this.SUBRULE(this.argument), this.MANY(() => {
        this.CONSUME(w), this.SUBRULE1(this.argument);
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
        this.CONSUME(p, { LABEL: "argName" }), this.CONSUME(S);
      }), this.SUBRULE(this.expression, { LABEL: "argValue" });
    }));
    this.performSelfAnalysis();
  }
}
const U = new pe(), de = U.getBaseCstVisitorConstructor();
class ue extends de {
  constructor() {
    super(), this.validateVisitor();
  }
  // Program
  program(t) {
    const e = t.pragma ? t.pragma.map((o) => this.visit(o)) : [], s = t.programName[0].image, i = t.variableBlock ? t.variableBlock.flatMap((o) => this.visit(o)) : [], r = t.statement ? t.statement.map((o) => this.visit(o)) : [];
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
    let o;
    return t.IoAddress && (o = this.parseIoAddress(t.IoAddress[0].image), r && r.type === "Literal" && r.kind === "string" && (o.entityId = r.value)), {
      type: "VariableDeclaration",
      name: s,
      dataType: i,
      section: "VAR",
      // Will be set by variableBlock
      pragmas: e,
      constant: !1,
      initialValue: r,
      binding: o,
      location: this.getLocation(t)
    };
  }
  pragma(t) {
    const s = t.Pragma[0].image.slice(1, -1).trim(), i = s.indexOf(":");
    let r, o;
    return i > 0 ? (r = s.substring(0, i).trim(), o = s.substring(i + 1).trim()) : r = s, {
      type: "Pragma",
      name: r,
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
      const L = t.elsifStatements && t.elsifStatements[d] ? this.visit(t.elsifStatements[d]) : [];
      return {
        condition: this.visit(o),
        body: Array.isArray(L) ? L : [L]
      };
    }) : [], r = t.elseStatements ? t.elseStatements.map((o) => this.visit(o)) : void 0;
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
const me = new ue();
function fe(n) {
  const t = [], e = ce(n);
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
      ast: me.visit(s),
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
const Ee = "application/x-st-entity-binding";
var $t = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, ye = (n, t, e) => t in n ? $t(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, y = (n, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ge(t, e) : t, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && $t(t, e, i), i;
}, Le = (n, t, e) => ye(n, t + "", e);
let m = class extends k {
  _handleDragStart(n) {
    if (!n.dataTransfer || !this.entity) return;
    const t = n.shiftKey ? "output" : "input", e = this._buildBindingSyntax(t), s = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction: t,
      bindingSyntax: e
    };
    n.dataTransfer.effectAllowed = "copy", n.dataTransfer.setData(Ee, e), n.dataTransfer.setData("text/plain", e), n.dataTransfer.setData("application/json", JSON.stringify(s)), this.classList.add("dragging");
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
  _entityIdToVarName(n) {
    const t = n.split(".");
    return t.length < 2 ? n : t[1].split("_").map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join("");
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
    if (!this.entity) return c``;
    const n = this._getStateClass(this.entity.state), t = this._getEntityIcon(), e = this.entity.friendlyName || this.entity.entityId, s = this.hasBinding;
    return c`
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
        ${this.isInput || this.isOutput ? c`<div
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
          ${s ? c`
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
Le(m, "styles", x`
    :host {
      display: block;
    }

    .entity-item {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 6px 4px;
      border-top: 1px solid var(--divider-color, #ddd);
      cursor: grab;
    }

    .entity-item.dragging {
      opacity: .5;
    }

    .entity-icon,
    .direction-indicator {
      display: inline-flex;
      color: var(--secondary-text-color, #666);
      --mdc-icon-size: 16px;
    }

    .direction-indicator::before {
      content: "";
      width: 5px;
      height: 5px;
      background: var(--primary-color, #03a9f4);
      border-radius: 50%;
    }

    .entity-info {
      flex: 1 1 140px;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .entity-name {
      font-size: 13px;
      font-weight: 600;
    }

    .entity-id,
    .entity-state {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
    }

    .entity-state.on {
      color: var(--success-color, #2e7d32);
    }

    .entity-state.unavailable {
      color: var(--error-color, #b00020);
    }

    .entity-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .entity-action {
      min-height: 30px;
      padding: 0 6px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font: inherit;
      cursor: pointer;
    }

    .entity-action:hover {
      background: var(--secondary-background-color, #eee);
    }

    .entity-action:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }

    .entity-action.remove {
      color: var(--error-color, #b00020);
    }
  `);
y([
  u({ type: Object })
], m.prototype, "entity", 2);
y([
  u({ type: String })
], m.prototype, "inferredType", 2);
y([
  u({ type: Boolean })
], m.prototype, "isInput", 2);
y([
  u({ type: Boolean })
], m.prototype, "isOutput", 2);
y([
  u({ type: Boolean })
], m.prototype, "hasBinding", 2);
m = y([
  $("st-entity-item")
], m);
var Pt = Object.defineProperty, Se = Object.getOwnPropertyDescriptor, Ue = (n, t, e) => t in n ? Pt(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, b = (n, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? Se(t, e) : t, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && Pt(t, e, i), i;
}, be = (n, t, e) => Ue(n, t + "", e);
let f = class extends k {
  constructor() {
    super();
    l(this, "_boundEntityIds", /* @__PURE__ */ new Set());
    this.entities = [], this.filter = {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    }, this.currentCode = "", this._expandedDomains = /* @__PURE__ */ new Set();
  }
  willUpdate(t) {
    if (t.has("currentCode")) {
      const { ast: s } = fe(this.currentCode);
      this._boundEntityIds = new Set(s == null ? void 0 : s.variables.flatMap(
        ({ binding: i }) => i != null && i.entityId ? [i.entityId] : []
      ));
    }
    const e = t.get("filter");
    t.has("filter") && this.filter.searchQuery && this.filter.searchQuery !== (e == null ? void 0 : e.searchQuery) && (this._expandedDomains = new Set(
      this._filterEntities(this.entities).map((s) => s.domain)
    ));
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
        const s = this.filter.searchQuery.toLowerCase();
        if (!(e.entityId.toLowerCase().includes(s) || e.friendlyName && e.friendlyName.toLowerCase().includes(s))) return !1;
      }
      return !(this.filter.selectedDomain && e.domain !== this.filter.selectedDomain || this.filter.showInputsOnly && !this._isInputEntity(e) || this.filter.showOutputsOnly && !this._isOutputEntity(e));
    });
  }
  _groupByDomain(t) {
    const e = /* @__PURE__ */ new Map();
    for (const i of t)
      e.has(i.domain) || e.set(i.domain, []), e.get(i.domain).push(i);
    const s = [];
    for (const [i, r] of e.entries())
      s.push({
        domain: i,
        entities: r.sort(
          (o, d) => (o.friendlyName || o.entityId).localeCompare(
            d.friendlyName || d.entityId
          )
        ),
        icon: this._getDomainIcon(i),
        expanded: this._expandedDomains.has(i)
      });
    return s.sort((i, r) => i.domain.localeCompare(r.domain));
  }
  _toggleDomain(t) {
    this._expandedDomains.has(t) ? this._expandedDomains.delete(t) : this._expandedDomains.add(t), this._expandedDomains = new Set(this._expandedDomains), this.requestUpdate();
  }
  render() {
    const t = this._filterEntities(this.entities), e = this._groupByDomain(t);
    return e.length === 0 ? c`
        <div class="empty-state">
          ${this.filter.searchQuery ? "No entities match your search" : "No entities available"}
        </div>
      ` : c`
      ${e.map(
      (s) => c`
          <div class="domain-group">
            <button
              class="domain-header"
              type="button"
              aria-expanded=${s.expanded}
              @click=${() => this._toggleDomain(s.domain)}
            >
              <div class="domain-icon">
                <ha-icon .icon=${s.icon}></ha-icon>
              </div>
              <div class="domain-name">${s.domain}</div>
              <div class="domain-count">${s.entities.length}</div>
              <div class="domain-toggle ${s.expanded ? "expanded" : ""}">
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </div>
            </button>
            ${s.expanded ? c`
                  <div class="domain-entities">
                    ${s.entities.map(
        (i) => c`
                        <st-entity-item
                          .entity=${i}
                          .inferredType=${Vt(i).dataType}
                          .isInput=${this._isInputEntity(i)}
                          .isOutput=${this._isOutputEntity(i)}
                          .hasBinding=${this._boundEntityIds.has(i.entityId)}
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
be(f, "styles", x`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      padding: 4px 8px;
      box-sizing: border-box;
    }

    .domain-group {
      margin-bottom: 6px;
      border: 1px solid rgba(88, 127, 146, 0.16);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      overflow: hidden;
    }

    .domain-header {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
      padding: 4px 8px;
      width: 100%;
      border: 0;
      background: transparent;
      text-align: left;
      cursor: pointer;
      user-select: none;
      color: var(--primary-text-color, #212121);
      transition: background var(--transition-fast, 160ms ease);
    }

    .domain-header:hover {
      background: var(--secondary-background-color, #eee);
    }

    .domain-icon {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--secondary-text-color, #666);
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
      background: transparent;
      color: var(--secondary-text-color, #666);
      font-size: var(--font-size-sm, 12px);
    }

    .domain-toggle {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color, #666);
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
      color: var(--secondary-text-color, #666);
      font-size: var(--font-size-md, 14px);
    }
  `);
b([
  u({ type: Array })
], f.prototype, "entities", 2);
b([
  u({ type: Object })
], f.prototype, "filter", 2);
b([
  u({ type: String })
], f.prototype, "currentCode", 2);
b([
  P()
], f.prototype, "_expandedDomains", 2);
f = b([
  $("st-entity-list")
], f);
var Ft = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, Oe = (n, t, e) => t in n ? Ft(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e, _ = (n, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ve(t, e) : t, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (i = (s ? o(t, e, i) : o(i)) || i);
  return s && i && Ft(t, e, i), i;
}, Ne = (n, t, e) => Oe(n, t + "", e);
let E = class extends k {
  constructor() {
    super();
    l(this, "_entities", /* @__PURE__ */ new Map());
    l(this, "_filter", {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    });
    l(this, "_domains", []);
    l(this, "_isConnected", !1);
    l(this, "_error", null);
    l(this, "_unsubscribe", null);
    this.currentCode = "", this._bindingFeedback = "";
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), this.hasUpdated && ((t = this.hass) != null && t.connection) && this._connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._disconnect();
  }
  willUpdate(t) {
    var e;
    if (super.willUpdate(t), t.has("hass")) {
      const s = t.get("hass"), i = s == null ? void 0 : s.connection, r = (e = this.hass) == null ? void 0 : e.connection;
      i && i !== r && this._disconnect(), r && !this._unsubscribe && this.isConnected && this._connect();
    }
  }
  _connect() {
    var t, e;
    if (!((t = this.hass) != null && t.connection)) {
      this._error = "Home Assistant connection not available";
      return;
    }
    try {
      this._error = null, this._isConnected = !1, !this.hass.connection.haVersion && ((e = this.hass.config) != null && e.version) && (this.hass.connection.haVersion = this.hass.config.version), this.hass.states && this._handleEntityUpdate(this.hass.states);
      const s = this.hass.connection;
      this._unsubscribe = Gt(s, (i) => {
        var r;
        this.isConnected && ((r = this.hass) == null ? void 0 : r.connection) === s && this._handleEntityUpdate(i);
      }), this._isConnected = !0;
    } catch (s) {
      this._error = s instanceof Error ? s.message : "Connection failed", this._isConnected = !1, console.error("Failed to subscribe to entities", s);
    }
    this.requestUpdate();
  }
  _disconnect() {
    this._unsubscribe && (this._unsubscribe(), this._unsubscribe = null), this._isConnected = !1, this._entities.clear(), this._domains = [], this._error = null, this.requestUpdate();
  }
  showBindingFeedback(t) {
    this._bindingFeedback = t;
  }
  _handleEntityUpdate(t) {
    var i;
    const e = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
    for (const [r, o] of Object.entries(t)) {
      const d = r.split(".")[0];
      s.add(d);
      const L = {
        entityId: r,
        state: o.state,
        attributes: o.attributes || {},
        domain: d,
        friendlyName: this._getFriendlyName(o),
        deviceClass: (i = o.attributes) == null ? void 0 : i.device_class,
        icon: this._getEntityIcon(o),
        lastChanged: o.last_changed ?? o.lastChanged
      };
      e.set(r, L);
    }
    this._entities = e, this._domains = Array.from(s).sort(), this.requestUpdate();
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
      const s = Number(t.state);
      if (!Number.isNaN(s)) {
        const i = Number.isInteger(s) && !t.state.includes(".");
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
    var i;
    const t = this._getFilteredEntities(), e = this._error ? "status-error" : this._isConnected ? "status-connected" : "status-connecting", s = this._error ? this._error : this._isConnected ? "Connected to Home Assistant" : (i = this.hass) != null && i.connection ? "Connecting to Home Assistant" : "Home Assistant connection unavailable";
    return c`
      <div class="header">
        <h2>Entity Browser</h2>
        <div class="search-shell">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            class="search-box"
            type="text"
            .value=${this._filter.searchQuery}
            @input=${this._handleSearchInput}
            placeholder="Filter entities by name or ID"
            aria-label="Search entities"
          />
          ${this._filter.searchQuery ? c`
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
      (r) => c`
                <option
                  value=${r}
                  ?selected=${this._filter.selectedDomain === r}
                >
                  ${r}
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
      </div>

      <div class="status-bar">
        <span class="status-indicator ${e}">
          ${s}
        </span>
        <span class="status-count">${t.length} entities</span>
      </div>
      <div class="binding-feedback" role="status" aria-live="polite">${this._bindingFeedback || ""}</div>

      <div class="entity-list-container">
        ${t.length === 0 ? c`
              <div class="empty-state">
                ${this._error ? "Entity stream unavailable" : "Waiting for entities from Home Assistant"}
              </div>
            ` : c`
              <st-entity-list
                .entities=${t}
                .filter=${this._filter}
                .currentCode=${this.currentCode}
              ></st-entity-list>
            `}
      </div>
    `;
  }
  async focusSearch() {
    var t, e;
    await this.updateComplete, (e = (t = this.shadowRoot) == null ? void 0 : t.querySelector(".search-box")) == null || e.focus();
  }
  _clearSearch() {
    this._filter = { ...this._filter, searchQuery: "" }, this.requestUpdate();
  }
};
Ne(E, "styles", x`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-size: 13px;
    }

    .header {
      flex: none;
      display: grid;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }

    h2 {
      margin: 0;
      padding-right: 36px;
      font-size: 16px;
      line-height: 28px;
    }

    .search-shell {
      position: relative;
    }

    .search-shell > ha-icon {
      position: absolute;
      inset: 8px auto auto 8px;
      --mdc-icon-size: 16px;
      pointer-events: none;
    }

    .search-box,
    .filter-select {
      box-sizing: border-box;
      width: 100%;
      min-height: 32px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      padding: 0 6px;
      color: inherit;
      background: var(--card-background-color, #fff);
      font: inherit;
    }

    .search-box {
      padding-inline: 30px;
    }

    .search-clear {
      position: absolute;
      inset: 2px 2px 2px auto;
      padding: 0 4px;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      --mdc-icon-size: 16px;
    }

    .filters,
    .checkbox-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 10px;
    }

    .filter-select {
      flex: 1 1 9em;
      width: auto;
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
    }

    .status-bar,
    .binding-feedback {
      flex: none;
      padding: 5px 12px;
      color: var(--secondary-text-color, #666);
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      gap: 6px;
    }

    .status-error {
      color: var(--error-color, #b00020);
    }

    .binding-feedback:empty {
      padding: 0;
    }

    .entity-list-container {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .empty-state {
      padding: 16px;
      color: var(--secondary-text-color, #666);
    }
  `);
_([
  u({ attribute: !1 })
], E.prototype, "hass", 2);
_([
  u({ type: String })
], E.prototype, "currentCode", 2);
_([
  P()
], E.prototype, "_bindingFeedback", 2);
E = _([
  $("st-entity-browser")
], E);
const Vt = E.inferDataType, Ae = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get STEntityBrowser() {
    return E;
  },
  get STEntityItem() {
    return m;
  },
  get STEntityList() {
    return f;
  },
  inferDataType: Vt
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ee as E,
  p as I,
  Z as P,
  J as V,
  Y as a,
  z as b,
  q as c,
  Ae as i,
  fe as p,
  ce as t
};
//# sourceMappingURL=entity-browser-RyZfc2dh.js.map
