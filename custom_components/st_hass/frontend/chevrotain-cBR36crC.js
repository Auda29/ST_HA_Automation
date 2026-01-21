import { a as $, p as te, f as I, m, i as W, b as he, s as kn, c as U, e as Z, d as M, u as Ut, g as J, h as Le, v, j as z, k as A, l as He, r as pt, n as We, o as ue, q as Oe, t as Dt, w as Qt, x as K, y as O, z as X, A as mt, B as ee, C as b, D as Zt, E as P, F as Ne, G as Ke, H as Y, I as os, J as cs } from "./vendor-BhPS5zVw.js";
function Lt(n) {
  console && console.error && console.error(`Error: ${n}`);
}
function On(n) {
  console && console.warn && console.warn(`Warning: ${n}`);
}
function _n(n) {
  const e = (/* @__PURE__ */ new Date()).getTime(), t = n();
  return { time: (/* @__PURE__ */ new Date()).getTime() - e, value: t };
}
function Cn(n) {
  function e() {
  }
  e.prototype = n;
  const t = new e();
  function s() {
    return typeof t.bar;
  }
  return s(), s(), n;
}
function ls(n) {
  return hs(n) ? n.LABEL : n.name;
}
function hs(n) {
  return W(n.LABEL) && n.LABEL !== "";
}
class re {
  get definition() {
    return this._definition;
  }
  set definition(e) {
    this._definition = e;
  }
  constructor(e) {
    this._definition = e;
  }
  accept(e) {
    e.visit(this), I(this.definition, (t) => {
      t.accept(e);
    });
  }
}
class H extends re {
  constructor(e) {
    super([]), this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
  set definition(e) {
  }
  get definition() {
    return this.referencedRule !== void 0 ? this.referencedRule.definition : [];
  }
  accept(e) {
    e.visit(this);
  }
}
class xe extends re {
  constructor(e) {
    super(e.definition), this.orgText = "", $(this, te(e, (t) => t !== void 0));
  }
}
class G extends re {
  constructor(e) {
    super(e.definition), this.ignoreAmbiguities = !1, $(this, te(e, (t) => t !== void 0));
  }
}
class D extends re {
  constructor(e) {
    super(e.definition), this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
}
class ae extends re {
  constructor(e) {
    super(e.definition), this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
}
class oe extends re {
  constructor(e) {
    super(e.definition), this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
}
class y extends re {
  constructor(e) {
    super(e.definition), this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
}
class ne extends re {
  constructor(e) {
    super(e.definition), this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
}
class se extends re {
  get definition() {
    return this._definition;
  }
  set definition(e) {
    this._definition = e;
  }
  constructor(e) {
    super(e.definition), this.idx = 1, this.ignoreAmbiguities = !1, this.hasPredicates = !1, $(this, te(e, (t) => t !== void 0));
  }
}
class _ {
  constructor(e) {
    this.idx = 1, $(this, te(e, (t) => t !== void 0));
  }
  accept(e) {
    e.visit(this);
  }
}
function us(n) {
  return m(n, et);
}
function et(n) {
  function e(t) {
    return m(t, et);
  }
  if (n instanceof H) {
    const t = {
      type: "NonTerminal",
      name: n.nonTerminalName,
      idx: n.idx
    };
    return W(n.label) && (t.label = n.label), t;
  } else {
    if (n instanceof G)
      return {
        type: "Alternative",
        definition: e(n.definition)
      };
    if (n instanceof D)
      return {
        type: "Option",
        idx: n.idx,
        definition: e(n.definition)
      };
    if (n instanceof ae)
      return {
        type: "RepetitionMandatory",
        idx: n.idx,
        definition: e(n.definition)
      };
    if (n instanceof oe)
      return {
        type: "RepetitionMandatoryWithSeparator",
        idx: n.idx,
        separator: et(new _({ terminalType: n.separator })),
        definition: e(n.definition)
      };
    if (n instanceof ne)
      return {
        type: "RepetitionWithSeparator",
        idx: n.idx,
        separator: et(new _({ terminalType: n.separator })),
        definition: e(n.definition)
      };
    if (n instanceof y)
      return {
        type: "Repetition",
        idx: n.idx,
        definition: e(n.definition)
      };
    if (n instanceof se)
      return {
        type: "Alternation",
        idx: n.idx,
        definition: e(n.definition)
      };
    if (n instanceof _) {
      const t = {
        type: "Terminal",
        name: n.terminalType.name,
        label: ls(n.terminalType),
        idx: n.idx
      };
      W(n.label) && (t.terminalLabel = n.label);
      const s = n.terminalType.PATTERN;
      return n.terminalType.PATTERN && (t.pattern = he(s) ? s.source : s), t;
    } else {
      if (n instanceof xe)
        return {
          type: "Rule",
          name: n.name,
          orgText: n.orgText,
          definition: e(n.definition)
        };
      throw Error("non exhaustive match");
    }
  }
}
class ye {
  visit(e) {
    const t = e;
    switch (t.constructor) {
      case H:
        return this.visitNonTerminal(t);
      case G:
        return this.visitAlternative(t);
      case D:
        return this.visitOption(t);
      case ae:
        return this.visitRepetitionMandatory(t);
      case oe:
        return this.visitRepetitionMandatoryWithSeparator(t);
      case ne:
        return this.visitRepetitionWithSeparator(t);
      case y:
        return this.visitRepetition(t);
      case se:
        return this.visitAlternation(t);
      case _:
        return this.visitTerminal(t);
      case xe:
        return this.visitRule(t);
      default:
        throw Error("non exhaustive match");
    }
  }
  /* c8 ignore next */
  visitNonTerminal(e) {
  }
  /* c8 ignore next */
  visitAlternative(e) {
  }
  /* c8 ignore next */
  visitOption(e) {
  }
  /* c8 ignore next */
  visitRepetition(e) {
  }
  /* c8 ignore next */
  visitRepetitionMandatory(e) {
  }
  /* c8 ignore next 3 */
  visitRepetitionMandatoryWithSeparator(e) {
  }
  /* c8 ignore next */
  visitRepetitionWithSeparator(e) {
  }
  /* c8 ignore next */
  visitAlternation(e) {
  }
  /* c8 ignore next */
  visitTerminal(e) {
  }
  /* c8 ignore next */
  visitRule(e) {
  }
}
function ds(n) {
  return n instanceof G || n instanceof D || n instanceof y || n instanceof ae || n instanceof oe || n instanceof ne || n instanceof _ || n instanceof xe;
}
function rt(n, e = []) {
  return n instanceof D || n instanceof y || n instanceof ne ? !0 : n instanceof se ? kn(n.definition, (s) => rt(s, e)) : n instanceof H && U(e, n) ? !1 : n instanceof re ? (n instanceof H && e.push(n), Z(n.definition, (s) => rt(s, e))) : !1;
}
function fs(n) {
  return n instanceof se;
}
function ie(n) {
  if (n instanceof H)
    return "SUBRULE";
  if (n instanceof D)
    return "OPTION";
  if (n instanceof se)
    return "OR";
  if (n instanceof ae)
    return "AT_LEAST_ONE";
  if (n instanceof oe)
    return "AT_LEAST_ONE_SEP";
  if (n instanceof ne)
    return "MANY_SEP";
  if (n instanceof y)
    return "MANY";
  if (n instanceof _)
    return "CONSUME";
  throw Error("non exhaustive match");
}
class Et {
  walk(e, t = []) {
    I(e.definition, (s, i) => {
      const r = M(e.definition, i + 1);
      if (s instanceof H)
        this.walkProdRef(s, r, t);
      else if (s instanceof _)
        this.walkTerminal(s, r, t);
      else if (s instanceof G)
        this.walkFlat(s, r, t);
      else if (s instanceof D)
        this.walkOption(s, r, t);
      else if (s instanceof ae)
        this.walkAtLeastOne(s, r, t);
      else if (s instanceof oe)
        this.walkAtLeastOneSep(s, r, t);
      else if (s instanceof ne)
        this.walkManySep(s, r, t);
      else if (s instanceof y)
        this.walkMany(s, r, t);
      else if (s instanceof se)
        this.walkOr(s, r, t);
      else
        throw Error("non exhaustive match");
    });
  }
  walkTerminal(e, t, s) {
  }
  walkProdRef(e, t, s) {
  }
  walkFlat(e, t, s) {
    const i = t.concat(s);
    this.walk(e, i);
  }
  walkOption(e, t, s) {
    const i = t.concat(s);
    this.walk(e, i);
  }
  walkAtLeastOne(e, t, s) {
    const i = [
      new D({ definition: e.definition })
    ].concat(t, s);
    this.walk(e, i);
  }
  walkAtLeastOneSep(e, t, s) {
    const i = Jt(e, t, s);
    this.walk(e, i);
  }
  walkMany(e, t, s) {
    const i = [
      new D({ definition: e.definition })
    ].concat(t, s);
    this.walk(e, i);
  }
  walkManySep(e, t, s) {
    const i = Jt(e, t, s);
    this.walk(e, i);
  }
  walkOr(e, t, s) {
    const i = t.concat(s);
    I(e.definition, (r) => {
      const a = new G({ definition: [r] });
      this.walk(a, i);
    });
  }
}
function Jt(n, e, t) {
  return [
    new D({
      definition: [
        new _({ terminalType: n.separator })
      ].concat(n.definition)
    })
  ].concat(e, t);
}
function Ve(n) {
  if (n instanceof H)
    return Ve(n.referencedRule);
  if (n instanceof _)
    return Es(n);
  if (ds(n))
    return ps(n);
  if (fs(n))
    return ms(n);
  throw Error("non exhaustive match");
}
function ps(n) {
  let e = [];
  const t = n.definition;
  let s = 0, i = t.length > s, r, a = !0;
  for (; i && a; )
    r = t[s], a = rt(r), e = e.concat(Ve(r)), s = s + 1, i = t.length > s;
  return Ut(e);
}
function ms(n) {
  const e = m(n.definition, (t) => Ve(t));
  return Ut(J(e));
}
function Es(n) {
  return [n.terminalType];
}
const Ln = "_~IN~_";
class Ts extends Et {
  constructor(e) {
    super(), this.topProd = e, this.follows = {};
  }
  startWalking() {
    return this.walk(this.topProd), this.follows;
  }
  walkTerminal(e, t, s) {
  }
  walkProdRef(e, t, s) {
    const i = As(e.referencedRule, e.idx) + this.topProd.name, r = t.concat(s), a = new G({ definition: r }), o = Ve(a);
    this.follows[i] = o;
  }
}
function gs(n) {
  const e = {};
  return I(n, (t) => {
    const s = new Ts(t).startWalking();
    $(e, s);
  }), e;
}
function As(n, e) {
  return n.name + e + Ln;
}
function R(n) {
  return n.charCodeAt(0);
}
function St(n, e) {
  Array.isArray(n) ? n.forEach(function(t) {
    e.push(t);
  }) : e.push(n);
}
function Fe(n, e) {
  if (n[e] === !0)
    throw "duplicate flag " + e;
  n[e], n[e] = !0;
}
function Ce(n) {
  if (n === void 0)
    throw Error("Internal Error - Should never get here!");
  return !0;
}
function Is() {
  throw Error("Internal Error - Should never get here!");
}
function en(n) {
  return n.type === "Character";
}
const at = [];
for (let n = R("0"); n <= R("9"); n++)
  at.push(n);
const ot = [R("_")].concat(at);
for (let n = R("a"); n <= R("z"); n++)
  ot.push(n);
for (let n = R("A"); n <= R("Z"); n++)
  ot.push(n);
const tn = [
  R(" "),
  R("\f"),
  R(`
`),
  R("\r"),
  R("	"),
  R("\v"),
  R("	"),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R(" "),
  R("\u2028"),
  R("\u2029"),
  R(" "),
  R(" "),
  R("　"),
  R("\uFEFF")
], Rs = /[0-9a-fA-F]/, qe = /[0-9]/, Ns = /[1-9]/;
class Ss {
  constructor() {
    this.idx = 0, this.input = "", this.groupIdx = 0;
  }
  saveState() {
    return {
      idx: this.idx,
      input: this.input,
      groupIdx: this.groupIdx
    };
  }
  restoreState(e) {
    this.idx = e.idx, this.input = e.input, this.groupIdx = e.groupIdx;
  }
  pattern(e) {
    this.idx = 0, this.input = e, this.groupIdx = 0, this.consumeChar("/");
    const t = this.disjunction();
    this.consumeChar("/");
    const s = {
      type: "Flags",
      loc: { begin: this.idx, end: e.length },
      global: !1,
      ignoreCase: !1,
      multiLine: !1,
      unicode: !1,
      sticky: !1
    };
    for (; this.isRegExpFlag(); )
      switch (this.popChar()) {
        case "g":
          Fe(s, "global");
          break;
        case "i":
          Fe(s, "ignoreCase");
          break;
        case "m":
          Fe(s, "multiLine");
          break;
        case "u":
          Fe(s, "unicode");
          break;
        case "y":
          Fe(s, "sticky");
          break;
      }
    if (this.idx !== this.input.length)
      throw Error("Redundant input: " + this.input.substring(this.idx));
    return {
      type: "Pattern",
      flags: s,
      value: t,
      loc: this.loc(0)
    };
  }
  disjunction() {
    const e = [], t = this.idx;
    for (e.push(this.alternative()); this.peekChar() === "|"; )
      this.consumeChar("|"), e.push(this.alternative());
    return { type: "Disjunction", value: e, loc: this.loc(t) };
  }
  alternative() {
    const e = [], t = this.idx;
    for (; this.isTerm(); )
      e.push(this.term());
    return { type: "Alternative", value: e, loc: this.loc(t) };
  }
  term() {
    return this.isAssertion() ? this.assertion() : this.atom();
  }
  assertion() {
    const e = this.idx;
    switch (this.popChar()) {
      case "^":
        return {
          type: "StartAnchor",
          loc: this.loc(e)
        };
      case "$":
        return { type: "EndAnchor", loc: this.loc(e) };
      case "\\":
        switch (this.popChar()) {
          case "b":
            return {
              type: "WordBoundary",
              loc: this.loc(e)
            };
          case "B":
            return {
              type: "NonWordBoundary",
              loc: this.loc(e)
            };
        }
        throw Error("Invalid Assertion Escape");
      case "(":
        this.consumeChar("?");
        let t;
        switch (this.popChar()) {
          case "=":
            t = "Lookahead";
            break;
          case "!":
            t = "NegativeLookahead";
            break;
          case "<": {
            switch (this.popChar()) {
              case "=":
                t = "Lookbehind";
                break;
              case "!":
                t = "NegativeLookbehind";
            }
            break;
          }
        }
        Ce(t);
        const s = this.disjunction();
        return this.consumeChar(")"), {
          type: t,
          value: s,
          loc: this.loc(e)
        };
    }
    return Is();
  }
  quantifier(e = !1) {
    let t;
    const s = this.idx;
    switch (this.popChar()) {
      case "*":
        t = {
          atLeast: 0,
          atMost: 1 / 0
        };
        break;
      case "+":
        t = {
          atLeast: 1,
          atMost: 1 / 0
        };
        break;
      case "?":
        t = {
          atLeast: 0,
          atMost: 1
        };
        break;
      case "{":
        const i = this.integerIncludingZero();
        switch (this.popChar()) {
          case "}":
            t = {
              atLeast: i,
              atMost: i
            };
            break;
          case ",":
            let r;
            this.isDigit() ? (r = this.integerIncludingZero(), t = {
              atLeast: i,
              atMost: r
            }) : t = {
              atLeast: i,
              atMost: 1 / 0
            }, this.consumeChar("}");
            break;
        }
        if (e === !0 && t === void 0)
          return;
        Ce(t);
        break;
    }
    if (!(e === !0 && t === void 0) && Ce(t))
      return this.peekChar(0) === "?" ? (this.consumeChar("?"), t.greedy = !1) : t.greedy = !0, t.type = "Quantifier", t.loc = this.loc(s), t;
  }
  atom() {
    let e;
    const t = this.idx;
    switch (this.peekChar()) {
      case ".":
        e = this.dotAll();
        break;
      case "\\":
        e = this.atomEscape();
        break;
      case "[":
        e = this.characterClass();
        break;
      case "(":
        e = this.group();
        break;
    }
    if (e === void 0 && this.isPatternCharacter() && (e = this.patternCharacter()), Ce(e))
      return e.loc = this.loc(t), this.isQuantifier() && (e.quantifier = this.quantifier()), e;
  }
  dotAll() {
    return this.consumeChar("."), {
      type: "Set",
      complement: !0,
      value: [R(`
`), R("\r"), R("\u2028"), R("\u2029")]
    };
  }
  atomEscape() {
    switch (this.consumeChar("\\"), this.peekChar()) {
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        return this.decimalEscapeAtom();
      case "d":
      case "D":
      case "s":
      case "S":
      case "w":
      case "W":
        return this.characterClassEscape();
      case "f":
      case "n":
      case "r":
      case "t":
      case "v":
        return this.controlEscapeAtom();
      case "c":
        return this.controlLetterEscapeAtom();
      case "0":
        return this.nulCharacterAtom();
      case "x":
        return this.hexEscapeSequenceAtom();
      case "u":
        return this.regExpUnicodeEscapeSequenceAtom();
      default:
        return this.identityEscapeAtom();
    }
  }
  decimalEscapeAtom() {
    return { type: "GroupBackReference", value: this.positiveInteger() };
  }
  characterClassEscape() {
    let e, t = !1;
    switch (this.popChar()) {
      case "d":
        e = at;
        break;
      case "D":
        e = at, t = !0;
        break;
      case "s":
        e = tn;
        break;
      case "S":
        e = tn, t = !0;
        break;
      case "w":
        e = ot;
        break;
      case "W":
        e = ot, t = !0;
        break;
    }
    if (Ce(e))
      return { type: "Set", value: e, complement: t };
  }
  controlEscapeAtom() {
    let e;
    switch (this.popChar()) {
      case "f":
        e = R("\f");
        break;
      case "n":
        e = R(`
`);
        break;
      case "r":
        e = R("\r");
        break;
      case "t":
        e = R("	");
        break;
      case "v":
        e = R("\v");
        break;
    }
    if (Ce(e))
      return { type: "Character", value: e };
  }
  controlLetterEscapeAtom() {
    this.consumeChar("c");
    const e = this.popChar();
    if (/[a-zA-Z]/.test(e) === !1)
      throw Error("Invalid ");
    return { type: "Character", value: e.toUpperCase().charCodeAt(0) - 64 };
  }
  nulCharacterAtom() {
    return this.consumeChar("0"), { type: "Character", value: R("\0") };
  }
  hexEscapeSequenceAtom() {
    return this.consumeChar("x"), this.parseHexDigits(2);
  }
  regExpUnicodeEscapeSequenceAtom() {
    return this.consumeChar("u"), this.parseHexDigits(4);
  }
  identityEscapeAtom() {
    const e = this.popChar();
    return { type: "Character", value: R(e) };
  }
  classPatternCharacterAtom() {
    switch (this.peekChar()) {
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
      case "\\":
      case "]":
        throw Error("TBD");
      default:
        const e = this.popChar();
        return { type: "Character", value: R(e) };
    }
  }
  characterClass() {
    const e = [];
    let t = !1;
    for (this.consumeChar("["), this.peekChar(0) === "^" && (this.consumeChar("^"), t = !0); this.isClassAtom(); ) {
      const s = this.classAtom();
      if (s.type, en(s) && this.isRangeDash()) {
        this.consumeChar("-");
        const i = this.classAtom();
        if (i.type, en(i)) {
          if (i.value < s.value)
            throw Error("Range out of order in character class");
          e.push({ from: s.value, to: i.value });
        } else
          St(s.value, e), e.push(R("-")), St(i.value, e);
      } else
        St(s.value, e);
    }
    return this.consumeChar("]"), { type: "Set", complement: t, value: e };
  }
  classAtom() {
    switch (this.peekChar()) {
      case "]":
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        throw Error("TBD");
      case "\\":
        return this.classEscape();
      default:
        return this.classPatternCharacterAtom();
    }
  }
  classEscape() {
    switch (this.consumeChar("\\"), this.peekChar()) {
      case "b":
        return this.consumeChar("b"), { type: "Character", value: R("\b") };
      case "d":
      case "D":
      case "s":
      case "S":
      case "w":
      case "W":
        return this.characterClassEscape();
      case "f":
      case "n":
      case "r":
      case "t":
      case "v":
        return this.controlEscapeAtom();
      case "c":
        return this.controlLetterEscapeAtom();
      case "0":
        return this.nulCharacterAtom();
      case "x":
        return this.hexEscapeSequenceAtom();
      case "u":
        return this.regExpUnicodeEscapeSequenceAtom();
      default:
        return this.identityEscapeAtom();
    }
  }
  group() {
    let e = !0;
    switch (this.consumeChar("("), this.peekChar(0)) {
      case "?":
        this.consumeChar("?"), this.consumeChar(":"), e = !1;
        break;
      default:
        this.groupIdx++;
        break;
    }
    const t = this.disjunction();
    this.consumeChar(")");
    const s = {
      type: "Group",
      capturing: e,
      value: t
    };
    return e && (s.idx = this.groupIdx), s;
  }
  positiveInteger() {
    let e = this.popChar();
    if (Ns.test(e) === !1)
      throw Error("Expecting a positive integer");
    for (; qe.test(this.peekChar(0)); )
      e += this.popChar();
    return parseInt(e, 10);
  }
  integerIncludingZero() {
    let e = this.popChar();
    if (qe.test(e) === !1)
      throw Error("Expecting an integer");
    for (; qe.test(this.peekChar(0)); )
      e += this.popChar();
    return parseInt(e, 10);
  }
  patternCharacter() {
    const e = this.popChar();
    switch (e) {
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
      case "^":
      case "$":
      case "\\":
      case ".":
      case "*":
      case "+":
      case "?":
      case "(":
      case ")":
      case "[":
      case "|":
        throw Error("TBD");
      default:
        return { type: "Character", value: R(e) };
    }
  }
  isRegExpFlag() {
    switch (this.peekChar(0)) {
      case "g":
      case "i":
      case "m":
      case "u":
      case "y":
        return !0;
      default:
        return !1;
    }
  }
  isRangeDash() {
    return this.peekChar() === "-" && this.isClassAtom(1);
  }
  isDigit() {
    return qe.test(this.peekChar(0));
  }
  isClassAtom(e = 0) {
    switch (this.peekChar(e)) {
      case "]":
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        return !1;
      default:
        return !0;
    }
  }
  isTerm() {
    return this.isAtom() || this.isAssertion();
  }
  isAtom() {
    if (this.isPatternCharacter())
      return !0;
    switch (this.peekChar(0)) {
      case ".":
      case "\\":
      case "[":
      case "(":
        return !0;
      default:
        return !1;
    }
  }
  isAssertion() {
    switch (this.peekChar(0)) {
      case "^":
      case "$":
        return !0;
      case "\\":
        switch (this.peekChar(1)) {
          case "b":
          case "B":
            return !0;
          default:
            return !1;
        }
      case "(":
        return this.peekChar(1) === "?" && (this.peekChar(2) === "=" || this.peekChar(2) === "!" || this.peekChar(2) === "<" && (this.peekChar(3) === "=" || this.peekChar(3) === "!"));
      default:
        return !1;
    }
  }
  isQuantifier() {
    const e = this.saveState();
    try {
      return this.quantifier(!0) !== void 0;
    } catch {
      return !1;
    } finally {
      this.restoreState(e);
    }
  }
  isPatternCharacter() {
    switch (this.peekChar()) {
      case "^":
      case "$":
      case "\\":
      case ".":
      case "*":
      case "+":
      case "?":
      case "(":
      case ")":
      case "[":
      case "|":
      case "/":
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        return !1;
      default:
        return !0;
    }
  }
  parseHexDigits(e) {
    let t = "";
    for (let i = 0; i < e; i++) {
      const r = this.popChar();
      if (Rs.test(r) === !1)
        throw Error("Expecting a HexDecimal digits");
      t += r;
    }
    return { type: "Character", value: parseInt(t, 16) };
  }
  peekChar(e = 0) {
    return this.input[this.idx + e];
  }
  popChar() {
    const e = this.peekChar(0);
    return this.consumeChar(void 0), e;
  }
  consumeChar(e) {
    if (e !== void 0 && this.input[this.idx] !== e)
      throw Error("Expected: '" + e + "' but found: '" + this.input[this.idx] + "' at offset: " + this.idx);
    if (this.idx >= this.input.length)
      throw Error("Unexpected end of input");
    this.idx++;
  }
  loc(e) {
    return { begin: e, end: this.idx };
  }
}
class Gt {
  visitChildren(e) {
    for (const t in e) {
      const s = e[t];
      e.hasOwnProperty(t) && (s.type !== void 0 ? this.visit(s) : Array.isArray(s) && s.forEach((i) => {
        this.visit(i);
      }, this));
    }
  }
  visit(e) {
    switch (e.type) {
      case "Pattern":
        this.visitPattern(e);
        break;
      case "Flags":
        this.visitFlags(e);
        break;
      case "Disjunction":
        this.visitDisjunction(e);
        break;
      case "Alternative":
        this.visitAlternative(e);
        break;
      case "StartAnchor":
        this.visitStartAnchor(e);
        break;
      case "EndAnchor":
        this.visitEndAnchor(e);
        break;
      case "WordBoundary":
        this.visitWordBoundary(e);
        break;
      case "NonWordBoundary":
        this.visitNonWordBoundary(e);
        break;
      case "Lookahead":
        this.visitLookahead(e);
        break;
      case "NegativeLookahead":
        this.visitNegativeLookahead(e);
        break;
      case "Lookbehind":
        this.visitLookbehind(e);
        break;
      case "NegativeLookbehind":
        this.visitNegativeLookbehind(e);
        break;
      case "Character":
        this.visitCharacter(e);
        break;
      case "Set":
        this.visitSet(e);
        break;
      case "Group":
        this.visitGroup(e);
        break;
      case "GroupBackReference":
        this.visitGroupBackReference(e);
        break;
      case "Quantifier":
        this.visitQuantifier(e);
        break;
    }
    this.visitChildren(e);
  }
  visitPattern(e) {
  }
  visitFlags(e) {
  }
  visitDisjunction(e) {
  }
  visitAlternative(e) {
  }
  // Assertion
  visitStartAnchor(e) {
  }
  visitEndAnchor(e) {
  }
  visitWordBoundary(e) {
  }
  visitNonWordBoundary(e) {
  }
  visitLookahead(e) {
  }
  visitNegativeLookahead(e) {
  }
  visitLookbehind(e) {
  }
  visitNegativeLookbehind(e) {
  }
  // atoms
  visitCharacter(e) {
  }
  visitSet(e) {
  }
  visitGroup(e) {
  }
  visitGroupBackReference(e) {
  }
  visitQuantifier(e) {
  }
}
let tt = {};
const ks = new Ss();
function Tt(n) {
  const e = n.toString();
  if (tt.hasOwnProperty(e))
    return tt[e];
  {
    const t = ks.pattern(e);
    return tt[e] = t, t;
  }
}
function Os() {
  tt = {};
}
const xn = "Complement Sets are not supported for first char optimization", ct = `Unable to use "first char" lexer optimizations:
`;
function _s(n, e = !1) {
  try {
    const t = Tt(n);
    return xt(t.value, {}, t.flags.ignoreCase);
  } catch (t) {
    if (t.message === xn)
      e && On(`${ct}	Unable to optimize: < ${n.toString()} >
	Complement Sets cannot be automatically optimized.
	This will disable the lexer's first char optimizations.
	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#COMPLEMENT for details.`);
    else {
      let s = "";
      e && (s = `
	This will disable the lexer's first char optimizations.
	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#REGEXP_PARSING for details.`), Lt(`${ct}
	Failed parsing: < ${n.toString()} >
	Using the @chevrotain/regexp-to-ast library
	Please open an issue at: https://github.com/chevrotain/chevrotain/issues` + s);
    }
  }
  return [];
}
function xt(n, e, t) {
  switch (n.type) {
    case "Disjunction":
      for (let i = 0; i < n.value.length; i++)
        xt(n.value[i], e, t);
      break;
    case "Alternative":
      const s = n.value;
      for (let i = 0; i < s.length; i++) {
        const r = s[i];
        switch (r.type) {
          case "EndAnchor":
          case "GroupBackReference":
          case "Lookahead":
          case "NegativeLookahead":
          case "Lookbehind":
          case "NegativeLookbehind":
          case "StartAnchor":
          case "WordBoundary":
          case "NonWordBoundary":
            continue;
        }
        const a = r;
        switch (a.type) {
          case "Character":
            Qe(a.value, e, t);
            break;
          case "Set":
            if (a.complement === !0)
              throw Error(xn);
            I(a.value, (c) => {
              if (typeof c == "number")
                Qe(c, e, t);
              else {
                const l = c;
                if (t === !0)
                  for (let h = l.from; h <= l.to; h++)
                    Qe(h, e, t);
                else {
                  for (let h = l.from; h <= l.to && h < Ge; h++)
                    Qe(h, e, t);
                  if (l.to >= Ge) {
                    const h = l.from >= Ge ? l.from : Ge, u = l.to, p = Te(h), g = Te(u);
                    for (let N = p; N <= g; N++)
                      e[N] = N;
                  }
                }
              }
            });
            break;
          case "Group":
            xt(a.value, e, t);
            break;
          default:
            throw Error("Non Exhaustive Match");
        }
        const o = a.quantifier !== void 0 && a.quantifier.atLeast === 0;
        if (
          // A group may be optional due to empty contents /(?:)/
          // or if everything inside it is optional /((a)?)/
          a.type === "Group" && yt(a) === !1 || // If this term is not a group it may only be optional if it has an optional quantifier
          a.type !== "Group" && o === !1
        )
          break;
      }
      break;
    default:
      throw Error("non exhaustive match!");
  }
  return v(e);
}
function Qe(n, e, t) {
  const s = Te(n);
  e[s] = s, t === !0 && Cs(n, e);
}
function Cs(n, e) {
  const t = String.fromCharCode(n), s = t.toUpperCase();
  if (s !== t) {
    const i = Te(s.charCodeAt(0));
    e[i] = i;
  } else {
    const i = t.toLowerCase();
    if (i !== t) {
      const r = Te(i.charCodeAt(0));
      e[r] = r;
    }
  }
}
function nn(n, e) {
  return Le(n.value, (t) => {
    if (typeof t == "number")
      return U(e, t);
    {
      const s = t;
      return Le(e, (i) => s.from <= i && i <= s.to) !== void 0;
    }
  });
}
function yt(n) {
  const e = n.quantifier;
  return e && e.atLeast === 0 ? !0 : n.value ? z(n.value) ? Z(n.value, yt) : yt(n.value) : !1;
}
class Ls extends Gt {
  constructor(e) {
    super(), this.targetCharCodes = e, this.found = !1;
  }
  visitChildren(e) {
    if (this.found !== !0) {
      switch (e.type) {
        case "Lookahead":
          this.visitLookahead(e);
          return;
        case "NegativeLookahead":
          this.visitNegativeLookahead(e);
          return;
        case "Lookbehind":
          this.visitLookbehind(e);
          return;
        case "NegativeLookbehind":
          this.visitNegativeLookbehind(e);
          return;
      }
      super.visitChildren(e);
    }
  }
  visitCharacter(e) {
    U(this.targetCharCodes, e.value) && (this.found = !0);
  }
  visitSet(e) {
    e.complement ? nn(e, this.targetCharCodes) === void 0 && (this.found = !0) : nn(e, this.targetCharCodes) !== void 0 && (this.found = !0);
  }
}
function Bt(n, e) {
  if (e instanceof RegExp) {
    const t = Tt(e), s = new Ls(n);
    return s.visit(t), s.found;
  } else
    return Le(e, (t) => U(n, t.charCodeAt(0))) !== void 0;
}
const Se = "PATTERN", De = "defaultMode", Ze = "modes";
let yn = typeof new RegExp("(?:)").sticky == "boolean";
function xs(n, e) {
  e = Dt(e, {
    useSticky: yn,
    debug: !1,
    safeMode: !1,
    positionTracking: "full",
    lineTerminatorCharacters: ["\r", `
`],
    tracer: (f, d) => d()
  });
  const t = e.tracer;
  t("initCharCodeToOptimizedIndexMap", () => {
    Js();
  });
  let s;
  t("Reject Lexer.NA", () => {
    s = pt(n, (f) => f[Se] === j.NA);
  });
  let i = !1, r;
  t("Transform Patterns", () => {
    i = !1, r = m(s, (f) => {
      const d = f[Se];
      if (he(d)) {
        const T = d.source;
        return T.length === 1 && // only these regExp meta characters which can appear in a length one regExp
        T !== "^" && T !== "$" && T !== "." && !d.ignoreCase ? T : T.length === 2 && T[0] === "\\" && // not a meta character
        !U([
          "d",
          "D",
          "s",
          "S",
          "t",
          "r",
          "n",
          "t",
          "0",
          "c",
          "b",
          "B",
          "f",
          "v",
          "w",
          "W"
        ], T[1]) ? T[1] : e.useSticky ? rn(d) : sn(d);
      } else {
        if (Oe(d))
          return i = !0, { exec: d };
        if (typeof d == "object")
          return i = !0, d;
        if (typeof d == "string") {
          if (d.length === 1)
            return d;
          {
            const T = d.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"), C = new RegExp(T);
            return e.useSticky ? rn(C) : sn(C);
          }
        } else
          throw Error("non exhaustive match");
      }
    });
  });
  let a, o, c, l, h;
  t("misc mapping", () => {
    a = m(s, (f) => f.tokenTypeIdx), o = m(s, (f) => {
      const d = f.GROUP;
      if (d !== j.SKIPPED) {
        if (W(d))
          return d;
        if (ue(d))
          return !1;
        throw Error("non exhaustive match");
      }
    }), c = m(s, (f) => {
      const d = f.LONGER_ALT;
      if (d)
        return z(d) ? m(d, (C) => Qt(s, C)) : [Qt(s, d)];
    }), l = m(s, (f) => f.PUSH_MODE), h = m(s, (f) => A(f, "POP_MODE"));
  });
  let u;
  t("Line Terminator Handling", () => {
    const f = Mn(e.lineTerminatorCharacters);
    u = m(s, (d) => !1), e.positionTracking !== "onlyOffset" && (u = m(s, (d) => A(d, "LINE_BREAKS") ? !!d.LINE_BREAKS : vn(d, f) === !1 && Bt(f, d.PATTERN)));
  });
  let p, g, N, S;
  t("Misc Mapping #2", () => {
    p = m(s, Pn), g = m(r, qs), N = K(s, (f, d) => {
      const T = d.GROUP;
      return W(T) && T !== j.SKIPPED && (f[T] = []), f;
    }, {}), S = m(r, (f, d) => ({
      pattern: r[d],
      longerAlt: c[d],
      canLineTerminator: u[d],
      isCustom: p[d],
      short: g[d],
      group: o[d],
      push: l[d],
      pop: h[d],
      tokenTypeIdx: a[d],
      tokenType: s[d]
    }));
  });
  let k = !0, E = [];
  return e.safeMode || t("First Char Optimization", () => {
    E = K(s, (f, d, T) => {
      if (typeof d.PATTERN == "string") {
        const C = d.PATTERN.charCodeAt(0), q = Te(C);
        kt(f, q, S[T]);
      } else if (z(d.START_CHARS_HINT)) {
        let C;
        I(d.START_CHARS_HINT, (q) => {
          const fe = typeof q == "string" ? q.charCodeAt(0) : q, Ae = Te(fe);
          C !== Ae && (C = Ae, kt(f, Ae, S[T]));
        });
      } else if (he(d.PATTERN))
        if (d.PATTERN.unicode)
          k = !1, e.ensureOptimizations && Lt(`${ct}	Unable to analyze < ${d.PATTERN.toString()} > pattern.
	The regexp unicode flag is not currently supported by the regexp-to-ast library.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNICODE_OPTIMIZE`);
        else {
          const C = _s(d.PATTERN, e.ensureOptimizations);
          O(C) && (k = !1), I(C, (q) => {
            kt(f, q, S[T]);
          });
        }
      else
        e.ensureOptimizations && Lt(`${ct}	TokenType: <${d.name}> is using a custom token pattern without providing <start_chars_hint> parameter.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_OPTIMIZE`), k = !1;
      return f;
    }, []);
  }), {
    emptyGroups: N,
    patternIdxToConfig: S,
    charCodeToPatternIdxToConfig: E,
    hasCustom: i,
    canBeOptimized: k
  };
}
function ys(n, e) {
  let t = [];
  const s = vs(n);
  t = t.concat(s.errors);
  const i = Ms(s.valid), r = i.valid;
  return t = t.concat(i.errors), t = t.concat(Ps(r)), t = t.concat($s(r)), t = t.concat(Ws(r, e)), t = t.concat(Ks(r)), t;
}
function Ps(n) {
  let e = [];
  const t = X(n, (s) => he(s[Se]));
  return e = e.concat(ws(t)), e = e.concat(Ds(t)), e = e.concat(Gs(t)), e = e.concat(Bs(t)), e = e.concat(Fs(t)), e;
}
function vs(n) {
  const e = X(n, (i) => !A(i, Se)), t = m(e, (i) => ({
    message: "Token Type: ->" + i.name + "<- missing static 'PATTERN' property",
    type: x.MISSING_PATTERN,
    tokenTypes: [i]
  })), s = mt(n, e);
  return { errors: t, valid: s };
}
function Ms(n) {
  const e = X(n, (i) => {
    const r = i[Se];
    return !he(r) && !Oe(r) && !A(r, "exec") && !W(r);
  }), t = m(e, (i) => ({
    message: "Token Type: ->" + i.name + "<- static 'PATTERN' can only be a RegExp, a Function matching the {CustomPatternMatcherFunc} type or an Object matching the {ICustomPattern} interface.",
    type: x.INVALID_PATTERN,
    tokenTypes: [i]
  })), s = mt(n, e);
  return { errors: t, valid: s };
}
const bs = /[^\\][$]/;
function ws(n) {
  class e extends Gt {
    constructor() {
      super(...arguments), this.found = !1;
    }
    visitEndAnchor(r) {
      this.found = !0;
    }
  }
  const t = X(n, (i) => {
    const r = i.PATTERN;
    try {
      const a = Tt(r), o = new e();
      return o.visit(a), o.found;
    } catch {
      return bs.test(r.source);
    }
  });
  return m(t, (i) => ({
    message: `Unexpected RegExp Anchor Error:
	Token Type: ->` + i.name + `<- static 'PATTERN' cannot contain end of input anchor '$'
	See chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.`,
    type: x.EOI_ANCHOR_FOUND,
    tokenTypes: [i]
  }));
}
function Fs(n) {
  const e = X(n, (s) => s.PATTERN.test(""));
  return m(e, (s) => ({
    message: "Token Type: ->" + s.name + "<- static 'PATTERN' must not match an empty string",
    type: x.EMPTY_MATCH_PATTERN,
    tokenTypes: [s]
  }));
}
const Us = /[^\\[][\^]|^\^/;
function Ds(n) {
  class e extends Gt {
    constructor() {
      super(...arguments), this.found = !1;
    }
    visitStartAnchor(r) {
      this.found = !0;
    }
  }
  const t = X(n, (i) => {
    const r = i.PATTERN;
    try {
      const a = Tt(r), o = new e();
      return o.visit(a), o.found;
    } catch {
      return Us.test(r.source);
    }
  });
  return m(t, (i) => ({
    message: `Unexpected RegExp Anchor Error:
	Token Type: ->` + i.name + `<- static 'PATTERN' cannot contain start of input anchor '^'
	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.`,
    type: x.SOI_ANCHOR_FOUND,
    tokenTypes: [i]
  }));
}
function Gs(n) {
  const e = X(n, (s) => {
    const i = s[Se];
    return i instanceof RegExp && (i.multiline || i.global);
  });
  return m(e, (s) => ({
    message: "Token Type: ->" + s.name + "<- static 'PATTERN' may NOT contain global('g') or multiline('m')",
    type: x.UNSUPPORTED_FLAGS_FOUND,
    tokenTypes: [s]
  }));
}
function Bs(n) {
  const e = [];
  let t = m(n, (r) => K(n, (a, o) => (r.PATTERN.source === o.PATTERN.source && !U(e, o) && o.PATTERN !== j.NA && (e.push(o), a.push(o)), a), []));
  t = He(t);
  const s = X(t, (r) => r.length > 1);
  return m(s, (r) => {
    const a = m(r, (c) => c.name);
    return {
      message: `The same RegExp pattern ->${ee(r).PATTERN}<-has been used in all of the following Token Types: ${a.join(", ")} <-`,
      type: x.DUPLICATE_PATTERNS_FOUND,
      tokenTypes: r
    };
  });
}
function $s(n) {
  const e = X(n, (s) => {
    if (!A(s, "GROUP"))
      return !1;
    const i = s.GROUP;
    return i !== j.SKIPPED && i !== j.NA && !W(i);
  });
  return m(e, (s) => ({
    message: "Token Type: ->" + s.name + "<- static 'GROUP' can only be Lexer.SKIPPED/Lexer.NA/A String",
    type: x.INVALID_GROUP_TYPE_FOUND,
    tokenTypes: [s]
  }));
}
function Ws(n, e) {
  const t = X(n, (i) => i.PUSH_MODE !== void 0 && !U(e, i.PUSH_MODE));
  return m(t, (i) => ({
    message: `Token Type: ->${i.name}<- static 'PUSH_MODE' value cannot refer to a Lexer Mode ->${i.PUSH_MODE}<-which does not exist`,
    type: x.PUSH_MODE_DOES_NOT_EXIST,
    tokenTypes: [i]
  }));
}
function Ks(n) {
  const e = [], t = K(n, (s, i, r) => {
    const a = i.PATTERN;
    return a === j.NA || (W(a) ? s.push({ str: a, idx: r, tokenType: i }) : he(a) && Vs(a) && s.push({ str: a.source, idx: r, tokenType: i })), s;
  }, []);
  return I(n, (s, i) => {
    I(t, ({ str: r, idx: a, tokenType: o }) => {
      if (i < a && Hs(r, s.PATTERN)) {
        const c = `Token: ->${o.name}<- can never be matched.
Because it appears AFTER the Token Type ->${s.name}<-in the lexer's definition.
See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNREACHABLE`;
        e.push({
          message: c,
          type: x.UNREACHABLE_PATTERN,
          tokenTypes: [s, o]
        });
      }
    });
  }), e;
}
function Hs(n, e) {
  if (he(e)) {
    if (zs(e))
      return !1;
    const t = e.exec(n);
    return t !== null && t.index === 0;
  } else {
    if (Oe(e))
      return e(n, 0, [], {});
    if (A(e, "exec"))
      return e.exec(n, 0, [], {});
    if (typeof e == "string")
      return e === n;
    throw Error("non exhaustive match");
  }
}
function Vs(n) {
  return Le([
    ".",
    "\\",
    "[",
    "]",
    "|",
    "^",
    "$",
    "(",
    ")",
    "?",
    "*",
    "+",
    "{"
  ], (t) => n.source.indexOf(t) !== -1) === void 0;
}
function zs(n) {
  return /(\(\?=)|(\(\?!)|(\(\?<=)|(\(\?<!)/.test(n.source);
}
function sn(n) {
  const e = n.ignoreCase ? "i" : "";
  return new RegExp(`^(?:${n.source})`, e);
}
function rn(n) {
  const e = n.ignoreCase ? "iy" : "y";
  return new RegExp(`${n.source}`, e);
}
function Ys(n, e, t) {
  const s = [];
  return A(n, De) || s.push({
    message: "A MultiMode Lexer cannot be initialized without a <" + De + `> property in its definition
`,
    type: x.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE
  }), A(n, Ze) || s.push({
    message: "A MultiMode Lexer cannot be initialized without a <" + Ze + `> property in its definition
`,
    type: x.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY
  }), A(n, Ze) && A(n, De) && !A(n.modes, n.defaultMode) && s.push({
    message: `A MultiMode Lexer cannot be initialized with a ${De}: <${n.defaultMode}>which does not exist
`,
    type: x.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST
  }), A(n, Ze) && I(n.modes, (i, r) => {
    I(i, (a, o) => {
      if (ue(a))
        s.push({
          message: `A Lexer cannot be initialized using an undefined Token Type. Mode:<${r}> at index: <${o}>
`,
          type: x.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED
        });
      else if (A(a, "LONGER_ALT")) {
        const c = z(a.LONGER_ALT) ? a.LONGER_ALT : [a.LONGER_ALT];
        I(c, (l) => {
          !ue(l) && !U(i, l) && s.push({
            message: `A MultiMode Lexer cannot be initialized with a longer_alt <${l.name}> on token <${a.name}> outside of mode <${r}>
`,
            type: x.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE
          });
        });
      }
    });
  }), s;
}
function js(n, e, t) {
  const s = [];
  let i = !1;
  const r = He(J(v(n.modes))), a = pt(r, (c) => c[Se] === j.NA), o = Mn(t);
  return e && I(a, (c) => {
    const l = vn(c, o);
    if (l !== !1) {
      const u = {
        message: Zs(c, l),
        type: l.issue,
        tokenType: c
      };
      s.push(u);
    } else
      A(c, "LINE_BREAKS") ? c.LINE_BREAKS === !0 && (i = !0) : Bt(o, c.PATTERN) && (i = !0);
  }), e && !i && s.push({
    message: `Warning: No LINE_BREAKS Found.
	This Lexer has been defined to track line and column information,
	But none of the Token Types can be identified as matching a line terminator.
	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#LINE_BREAKS 
	for details.`,
    type: x.NO_LINE_BREAKS_FLAGS
  }), s;
}
function Xs(n) {
  const e = {}, t = We(n);
  return I(t, (s) => {
    const i = n[s];
    if (z(i))
      e[s] = [];
    else
      throw Error("non exhaustive match");
  }), e;
}
function Pn(n) {
  const e = n.PATTERN;
  if (he(e))
    return !1;
  if (Oe(e))
    return !0;
  if (A(e, "exec"))
    return !0;
  if (W(e))
    return !1;
  throw Error("non exhaustive match");
}
function qs(n) {
  return W(n) && n.length === 1 ? n.charCodeAt(0) : !1;
}
const Qs = {
  // implements /\n|\r\n?/g.test
  test: function(n) {
    const e = n.length;
    for (let t = this.lastIndex; t < e; t++) {
      const s = n.charCodeAt(t);
      if (s === 10)
        return this.lastIndex = t + 1, !0;
      if (s === 13)
        return n.charCodeAt(t + 1) === 10 ? this.lastIndex = t + 2 : this.lastIndex = t + 1, !0;
    }
    return !1;
  },
  lastIndex: 0
};
function vn(n, e) {
  if (A(n, "LINE_BREAKS"))
    return !1;
  if (he(n.PATTERN)) {
    try {
      Bt(e, n.PATTERN);
    } catch (t) {
      return {
        issue: x.IDENTIFY_TERMINATOR,
        errMsg: t.message
      };
    }
    return !1;
  } else {
    if (W(n.PATTERN))
      return !1;
    if (Pn(n))
      return { issue: x.CUSTOM_LINE_BREAK };
    throw Error("non exhaustive match");
  }
}
function Zs(n, e) {
  if (e.issue === x.IDENTIFY_TERMINATOR)
    return `Warning: unable to identify line terminator usage in pattern.
	The problem is in the <${n.name}> Token Type
	 Root cause: ${e.errMsg}.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#IDENTIFY_TERMINATOR`;
  if (e.issue === x.CUSTOM_LINE_BREAK)
    return `Warning: A Custom Token Pattern should specify the <line_breaks> option.
	The problem is in the <${n.name}> Token Type
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_LINE_BREAK`;
  throw Error("non exhaustive match");
}
function Mn(n) {
  return m(n, (t) => W(t) ? t.charCodeAt(0) : t);
}
function kt(n, e, t) {
  n[e] === void 0 ? n[e] = [t] : n[e].push(t);
}
const Ge = 256;
let nt = [];
function Te(n) {
  return n < Ge ? n : nt[n];
}
function Js() {
  if (O(nt)) {
    nt = new Array(65536);
    for (let n = 0; n < 65536; n++)
      nt[n] = n > 255 ? 255 + ~~(n / 255) : n;
  }
}
function ze(n, e) {
  const t = n.tokenTypeIdx;
  return t === e.tokenTypeIdx ? !0 : e.isParent === !0 && e.categoryMatchesMap[t] === !0;
}
function lt(n, e) {
  return n.tokenTypeIdx === e.tokenTypeIdx;
}
let an = 1;
const bn = {};
function Ye(n) {
  const e = ei(n);
  ti(e), si(e), ni(e), I(e, (t) => {
    t.isParent = t.categoryMatches.length > 0;
  });
}
function ei(n) {
  let e = b(n), t = n, s = !0;
  for (; s; ) {
    t = He(J(m(t, (r) => r.CATEGORIES)));
    const i = mt(t, e);
    e = e.concat(i), O(i) ? s = !1 : t = i;
  }
  return e;
}
function ti(n) {
  I(n, (e) => {
    Fn(e) || (bn[an] = e, e.tokenTypeIdx = an++), on(e) && !z(e.CATEGORIES) && (e.CATEGORIES = [e.CATEGORIES]), on(e) || (e.CATEGORIES = []), ii(e) || (e.categoryMatches = []), ri(e) || (e.categoryMatchesMap = {});
  });
}
function ni(n) {
  I(n, (e) => {
    e.categoryMatches = [], I(e.categoryMatchesMap, (t, s) => {
      e.categoryMatches.push(bn[s].tokenTypeIdx);
    });
  });
}
function si(n) {
  I(n, (e) => {
    wn([], e);
  });
}
function wn(n, e) {
  I(n, (t) => {
    e.categoryMatchesMap[t.tokenTypeIdx] = !0;
  }), I(e.CATEGORIES, (t) => {
    const s = n.concat(e);
    U(s, t) || wn(s, t);
  });
}
function Fn(n) {
  return A(n, "tokenTypeIdx");
}
function on(n) {
  return A(n, "CATEGORIES");
}
function ii(n) {
  return A(n, "categoryMatches");
}
function ri(n) {
  return A(n, "categoryMatchesMap");
}
function ai(n) {
  return A(n, "tokenTypeIdx");
}
const oi = {
  buildUnableToPopLexerModeMessage(n) {
    return `Unable to pop Lexer Mode after encountering Token ->${n.image}<- The Mode Stack is empty`;
  },
  buildUnexpectedCharactersMessage(n, e, t, s, i, r) {
    return `unexpected character: ->${n.charAt(e)}<- at offset: ${e}, skipped ${t} characters.`;
  }
};
var x;
(function(n) {
  n[n.MISSING_PATTERN = 0] = "MISSING_PATTERN", n[n.INVALID_PATTERN = 1] = "INVALID_PATTERN", n[n.EOI_ANCHOR_FOUND = 2] = "EOI_ANCHOR_FOUND", n[n.UNSUPPORTED_FLAGS_FOUND = 3] = "UNSUPPORTED_FLAGS_FOUND", n[n.DUPLICATE_PATTERNS_FOUND = 4] = "DUPLICATE_PATTERNS_FOUND", n[n.INVALID_GROUP_TYPE_FOUND = 5] = "INVALID_GROUP_TYPE_FOUND", n[n.PUSH_MODE_DOES_NOT_EXIST = 6] = "PUSH_MODE_DOES_NOT_EXIST", n[n.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE = 7] = "MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE", n[n.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY = 8] = "MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY", n[n.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST = 9] = "MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST", n[n.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED = 10] = "LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED", n[n.SOI_ANCHOR_FOUND = 11] = "SOI_ANCHOR_FOUND", n[n.EMPTY_MATCH_PATTERN = 12] = "EMPTY_MATCH_PATTERN", n[n.NO_LINE_BREAKS_FLAGS = 13] = "NO_LINE_BREAKS_FLAGS", n[n.UNREACHABLE_PATTERN = 14] = "UNREACHABLE_PATTERN", n[n.IDENTIFY_TERMINATOR = 15] = "IDENTIFY_TERMINATOR", n[n.CUSTOM_LINE_BREAK = 16] = "CUSTOM_LINE_BREAK", n[n.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE = 17] = "MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE";
})(x || (x = {}));
const Be = {
  deferDefinitionErrorsHandling: !1,
  positionTracking: "full",
  lineTerminatorsPattern: /\n|\r\n?/g,
  lineTerminatorCharacters: [`
`, "\r"],
  ensureOptimizations: !1,
  safeMode: !1,
  errorMessageProvider: oi,
  traceInitPerf: !1,
  skipValidations: !1,
  recoveryEnabled: !0
};
Object.freeze(Be);
class j {
  constructor(e, t = Be) {
    if (this.lexerDefinition = e, this.lexerDefinitionErrors = [], this.lexerDefinitionWarning = [], this.patternIdxToConfig = {}, this.charCodeToPatternIdxToConfig = {}, this.modes = [], this.emptyGroups = {}, this.trackStartLines = !0, this.trackEndLines = !0, this.hasCustom = !1, this.canModeBeOptimized = {}, this.TRACE_INIT = (i, r) => {
      if (this.traceInitPerf === !0) {
        this.traceInitIndent++;
        const a = new Array(this.traceInitIndent + 1).join("	");
        this.traceInitIndent < this.traceInitMaxIdent && console.log(`${a}--> <${i}>`);
        const { time: o, value: c } = _n(r), l = o > 10 ? console.warn : console.log;
        return this.traceInitIndent < this.traceInitMaxIdent && l(`${a}<-- <${i}> time: ${o}ms`), this.traceInitIndent--, c;
      } else
        return r();
    }, typeof t == "boolean")
      throw Error(`The second argument to the Lexer constructor is now an ILexerConfig Object.
a boolean 2nd argument is no longer supported`);
    this.config = $({}, Be, t);
    const s = this.config.traceInitPerf;
    s === !0 ? (this.traceInitMaxIdent = 1 / 0, this.traceInitPerf = !0) : typeof s == "number" && (this.traceInitMaxIdent = s, this.traceInitPerf = !0), this.traceInitIndent = -1, this.TRACE_INIT("Lexer Constructor", () => {
      let i, r = !0;
      this.TRACE_INIT("Lexer Config handling", () => {
        if (this.config.lineTerminatorsPattern === Be.lineTerminatorsPattern)
          this.config.lineTerminatorsPattern = Qs;
        else if (this.config.lineTerminatorCharacters === Be.lineTerminatorCharacters)
          throw Error(`Error: Missing <lineTerminatorCharacters> property on the Lexer config.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#MISSING_LINE_TERM_CHARS`);
        if (t.safeMode && t.ensureOptimizations)
          throw Error('"safeMode" and "ensureOptimizations" flags are mutually exclusive.');
        this.trackStartLines = /full|onlyStart/i.test(this.config.positionTracking), this.trackEndLines = /full/i.test(this.config.positionTracking), z(e) ? i = {
          modes: { defaultMode: b(e) },
          defaultMode: De
        } : (r = !1, i = b(e));
      }), this.config.skipValidations === !1 && (this.TRACE_INIT("performRuntimeChecks", () => {
        this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(Ys(i, this.trackStartLines, this.config.lineTerminatorCharacters));
      }), this.TRACE_INIT("performWarningRuntimeChecks", () => {
        this.lexerDefinitionWarning = this.lexerDefinitionWarning.concat(js(i, this.trackStartLines, this.config.lineTerminatorCharacters));
      })), i.modes = i.modes ? i.modes : {}, I(i.modes, (o, c) => {
        i.modes[c] = pt(o, (l) => ue(l));
      });
      const a = We(i.modes);
      if (I(i.modes, (o, c) => {
        this.TRACE_INIT(`Mode: <${c}> processing`, () => {
          if (this.modes.push(c), this.config.skipValidations === !1 && this.TRACE_INIT("validatePatterns", () => {
            this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(ys(o, a));
          }), O(this.lexerDefinitionErrors)) {
            Ye(o);
            let l;
            this.TRACE_INIT("analyzeTokenTypes", () => {
              l = xs(o, {
                lineTerminatorCharacters: this.config.lineTerminatorCharacters,
                positionTracking: t.positionTracking,
                ensureOptimizations: t.ensureOptimizations,
                safeMode: t.safeMode,
                tracer: this.TRACE_INIT
              });
            }), this.patternIdxToConfig[c] = l.patternIdxToConfig, this.charCodeToPatternIdxToConfig[c] = l.charCodeToPatternIdxToConfig, this.emptyGroups = $({}, this.emptyGroups, l.emptyGroups), this.hasCustom = l.hasCustom || this.hasCustom, this.canModeBeOptimized[c] = l.canBeOptimized;
          }
        });
      }), this.defaultMode = i.defaultMode, !O(this.lexerDefinitionErrors) && !this.config.deferDefinitionErrorsHandling) {
        const c = m(this.lexerDefinitionErrors, (l) => l.message).join(`-----------------------
`);
        throw new Error(`Errors detected in definition of Lexer:
` + c);
      }
      I(this.lexerDefinitionWarning, (o) => {
        On(o.message);
      }), this.TRACE_INIT("Choosing sub-methods implementations", () => {
        if (yn ? (this.chopInput = Zt, this.match = this.matchWithTest) : (this.updateLastIndex = P, this.match = this.matchWithExec), r && (this.handleModes = P), this.trackStartLines === !1 && (this.computeNewColumn = Zt), this.trackEndLines === !1 && (this.updateTokenEndLineColumnLocation = P), /full/i.test(this.config.positionTracking))
          this.createTokenInstance = this.createFullToken;
        else if (/onlyStart/i.test(this.config.positionTracking))
          this.createTokenInstance = this.createStartOnlyToken;
        else if (/onlyOffset/i.test(this.config.positionTracking))
          this.createTokenInstance = this.createOffsetOnlyToken;
        else
          throw Error(`Invalid <positionTracking> config option: "${this.config.positionTracking}"`);
        this.hasCustom ? (this.addToken = this.addTokenUsingPush, this.handlePayload = this.handlePayloadWithCustom) : (this.addToken = this.addTokenUsingMemberAccess, this.handlePayload = this.handlePayloadNoCustom);
      }), this.TRACE_INIT("Failed Optimization Warnings", () => {
        const o = K(this.canModeBeOptimized, (c, l, h) => (l === !1 && c.push(h), c), []);
        if (t.ensureOptimizations && !O(o))
          throw Error(`Lexer Modes: < ${o.join(", ")} > cannot be optimized.
	 Disable the "ensureOptimizations" lexer config flag to silently ignore this and run the lexer in an un-optimized mode.
	 Or inspect the console log for details on how to resolve these issues.`);
      }), this.TRACE_INIT("clearRegExpParserCache", () => {
        Os();
      }), this.TRACE_INIT("toFastProperties", () => {
        Cn(this);
      });
    });
  }
  tokenize(e, t = this.defaultMode) {
    if (!O(this.lexerDefinitionErrors)) {
      const i = m(this.lexerDefinitionErrors, (r) => r.message).join(`-----------------------
`);
      throw new Error(`Unable to Tokenize because Errors detected in definition of Lexer:
` + i);
    }
    return this.tokenizeInternal(e, t);
  }
  // There is quite a bit of duplication between this and "tokenizeInternalLazy"
  // This is intentional due to performance considerations.
  // this method also used quite a bit of `!` none null assertions because it is too optimized
  // for `tsc` to always understand it is "safe"
  tokenizeInternal(e, t) {
    let s, i, r, a, o, c, l, h, u, p, g, N, S, k, E;
    const f = e, d = f.length;
    let T = 0, C = 0;
    const q = this.hasCustom ? 0 : Math.floor(e.length / 10), fe = new Array(q), Ae = [];
    let Pe = this.trackStartLines ? 1 : void 0, pe = this.trackStartLines ? 1 : void 0;
    const ve = Xs(this.emptyGroups), rs = this.trackStartLines, Rt = this.config.lineTerminatorsPattern;
    let Xe = 0, me = [], Me = [];
    const be = [], Vt = [];
    Object.freeze(Vt);
    let we;
    function zt() {
      return me;
    }
    function Yt(w) {
      const V = Te(w), _e = Me[V];
      return _e === void 0 ? Vt : _e;
    }
    const as = (w) => {
      if (be.length === 1 && // if we have both a POP_MODE and a PUSH_MODE this is in-fact a "transition"
      // So no error should occur.
      w.tokenType.PUSH_MODE === void 0) {
        const V = this.config.errorMessageProvider.buildUnableToPopLexerModeMessage(w);
        Ae.push({
          offset: w.startOffset,
          line: w.startLine,
          column: w.startColumn,
          length: w.image.length,
          message: V
        });
      } else {
        be.pop();
        const V = Ne(be);
        me = this.patternIdxToConfig[V], Me = this.charCodeToPatternIdxToConfig[V], Xe = me.length;
        const _e = this.canModeBeOptimized[V] && this.config.safeMode === !1;
        Me && _e ? we = Yt : we = zt;
      }
    };
    function jt(w) {
      be.push(w), Me = this.charCodeToPatternIdxToConfig[w], me = this.patternIdxToConfig[w], Xe = me.length, Xe = me.length;
      const V = this.canModeBeOptimized[w] && this.config.safeMode === !1;
      Me && V ? we = Yt : we = zt;
    }
    jt.call(this, t);
    let Q;
    const Xt = this.config.recoveryEnabled;
    for (; T < d; ) {
      c = null;
      const w = f.charCodeAt(T), V = we(w), _e = V.length;
      for (s = 0; s < _e; s++) {
        Q = V[s];
        const B = Q.pattern;
        l = null;
        const ce = Q.short;
        if (ce !== !1 ? w === ce && (c = B) : Q.isCustom === !0 ? (E = B.exec(f, T, fe, ve), E !== null ? (c = E[0], E.payload !== void 0 && (l = E.payload)) : c = null) : (this.updateLastIndex(B, T), c = this.match(B, e, T)), c !== null) {
          if (o = Q.longerAlt, o !== void 0) {
            const Ee = o.length;
            for (r = 0; r < Ee; r++) {
              const le = me[o[r]], Ie = le.pattern;
              if (h = null, le.isCustom === !0 ? (E = Ie.exec(f, T, fe, ve), E !== null ? (a = E[0], E.payload !== void 0 && (h = E.payload)) : a = null) : (this.updateLastIndex(Ie, T), a = this.match(Ie, e, T)), a && a.length > c.length) {
                c = a, l = h, Q = le;
                break;
              }
            }
          }
          break;
        }
      }
      if (c !== null) {
        if (u = c.length, p = Q.group, p !== void 0 && (g = Q.tokenTypeIdx, N = this.createTokenInstance(c, T, g, Q.tokenType, Pe, pe, u), this.handlePayload(N, l), p === !1 ? C = this.addToken(fe, C, N) : ve[p].push(N)), e = this.chopInput(e, u), T = T + u, pe = this.computeNewColumn(pe, u), rs === !0 && Q.canLineTerminator === !0) {
          let B = 0, ce, Ee;
          Rt.lastIndex = 0;
          do
            ce = Rt.test(c), ce === !0 && (Ee = Rt.lastIndex - 1, B++);
          while (ce === !0);
          B !== 0 && (Pe = Pe + B, pe = u - Ee, this.updateTokenEndLineColumnLocation(N, p, Ee, B, Pe, pe, u));
        }
        this.handleModes(Q, as, jt, N);
      } else {
        const B = T, ce = Pe, Ee = pe;
        let le = Xt === !1;
        for (; le === !1 && T < d; )
          for (e = this.chopInput(e, 1), T++, i = 0; i < Xe; i++) {
            const Ie = me[i], Nt = Ie.pattern, qt = Ie.short;
            if (qt !== !1 ? f.charCodeAt(T) === qt && (le = !0) : Ie.isCustom === !0 ? le = Nt.exec(f, T, fe, ve) !== null : (this.updateLastIndex(Nt, T), le = Nt.exec(e) !== null), le === !0)
              break;
          }
        if (S = T - B, pe = this.computeNewColumn(pe, S), k = this.config.errorMessageProvider.buildUnexpectedCharactersMessage(f, B, S, ce, Ee, Ne(be)), Ae.push({
          offset: B,
          line: ce,
          column: Ee,
          length: S,
          message: k
        }), Xt === !1)
          break;
      }
    }
    return this.hasCustom || (fe.length = C), {
      tokens: fe,
      groups: ve,
      errors: Ae
    };
  }
  handleModes(e, t, s, i) {
    if (e.pop === !0) {
      const r = e.push;
      t(i), r !== void 0 && s.call(this, r);
    } else e.push !== void 0 && s.call(this, e.push);
  }
  chopInput(e, t) {
    return e.substring(t);
  }
  updateLastIndex(e, t) {
    e.lastIndex = t;
  }
  // TODO: decrease this under 600 characters? inspect stripping comments option in TSC compiler
  updateTokenEndLineColumnLocation(e, t, s, i, r, a, o) {
    let c, l;
    t !== void 0 && (c = s === o - 1, l = c ? -1 : 0, i === 1 && c === !0 || (e.endLine = r + l, e.endColumn = a - 1 + -l));
  }
  computeNewColumn(e, t) {
    return e + t;
  }
  createOffsetOnlyToken(e, t, s, i) {
    return {
      image: e,
      startOffset: t,
      tokenTypeIdx: s,
      tokenType: i
    };
  }
  createStartOnlyToken(e, t, s, i, r, a) {
    return {
      image: e,
      startOffset: t,
      startLine: r,
      startColumn: a,
      tokenTypeIdx: s,
      tokenType: i
    };
  }
  createFullToken(e, t, s, i, r, a, o) {
    return {
      image: e,
      startOffset: t,
      endOffset: t + o - 1,
      startLine: r,
      endLine: r,
      startColumn: a,
      endColumn: a + o - 1,
      tokenTypeIdx: s,
      tokenType: i
    };
  }
  addTokenUsingPush(e, t, s) {
    return e.push(s), t;
  }
  addTokenUsingMemberAccess(e, t, s) {
    return e[t] = s, t++, t;
  }
  handlePayloadNoCustom(e, t) {
  }
  handlePayloadWithCustom(e, t) {
    t !== null && (e.payload = t);
  }
  matchWithTest(e, t, s) {
    return e.test(t) === !0 ? t.substring(s, e.lastIndex) : null;
  }
  matchWithExec(e, t) {
    const s = e.exec(t);
    return s !== null ? s[0] : null;
  }
}
j.SKIPPED = "This marks a skipped Token pattern, this means each token identified by it will be consumed and then thrown into oblivion, this can be used to for example to completely ignore whitespace.";
j.NA = /NOT_APPLICABLE/;
function $e(n) {
  return Un(n) ? n.LABEL : n.name;
}
function Un(n) {
  return W(n.LABEL) && n.LABEL !== "";
}
const ci = "parent", cn = "categories", ln = "label", hn = "group", un = "push_mode", dn = "pop_mode", fn = "longer_alt", pn = "line_breaks", mn = "start_chars_hint";
function Dn(n) {
  return li(n);
}
function li(n) {
  const e = n.pattern, t = {};
  if (t.name = n.name, ue(e) || (t.PATTERN = e), A(n, ci))
    throw `The parent property is no longer supported.
See: https://github.com/chevrotain/chevrotain/issues/564#issuecomment-349062346 for details.`;
  return A(n, cn) && (t.CATEGORIES = n[cn]), Ye([t]), A(n, ln) && (t.LABEL = n[ln]), A(n, hn) && (t.GROUP = n[hn]), A(n, dn) && (t.POP_MODE = n[dn]), A(n, un) && (t.PUSH_MODE = n[un]), A(n, fn) && (t.LONGER_ALT = n[fn]), A(n, pn) && (t.LINE_BREAKS = n[pn]), A(n, mn) && (t.START_CHARS_HINT = n[mn]), t;
}
const ke = Dn({ name: "EOF", pattern: j.NA });
Ye([ke]);
function $t(n, e, t, s, i, r, a, o) {
  return {
    image: e,
    startOffset: t,
    endOffset: s,
    startLine: i,
    endLine: r,
    startColumn: a,
    endColumn: o,
    tokenTypeIdx: n.tokenTypeIdx,
    tokenType: n
  };
}
function hi(n, e) {
  return ze(n, e);
}
const Gn = {
  buildMismatchTokenMessage({ expected: n, actual: e, previous: t, ruleName: s }) {
    return `Expecting ${Un(n) ? `--> ${$e(n)} <--` : `token of type --> ${n.name} <--`} but found --> '${e.image}' <--`;
  },
  buildNotAllInputParsedMessage({ firstRedundant: n, ruleName: e }) {
    return "Redundant input, expecting EOF but found: " + n.image;
  },
  buildNoViableAltMessage({ expectedPathsPerAlt: n, actual: e, previous: t, customUserDescription: s, ruleName: i }) {
    const r = "Expecting: ", o = `
but found: '` + ee(e).image + "'";
    if (s)
      return r + s + o;
    {
      const c = K(n, (p, g) => p.concat(g), []), l = m(c, (p) => `[${m(p, (g) => $e(g)).join(", ")}]`), u = `one of these possible Token sequences:
${m(l, (p, g) => `  ${g + 1}. ${p}`).join(`
`)}`;
      return r + u + o;
    }
  },
  buildEarlyExitMessage({ expectedIterationPaths: n, actual: e, customUserDescription: t, ruleName: s }) {
    const i = "Expecting: ", a = `
but found: '` + ee(e).image + "'";
    if (t)
      return i + t + a;
    {
      const c = `expecting at least one iteration which starts with one of these possible Token sequences::
  <${m(n, (l) => `[${m(l, (h) => $e(h)).join(",")}]`).join(" ,")}>`;
      return i + c + a;
    }
  }
};
Object.freeze(Gn);
const ui = {
  buildRuleNotFoundError(n, e) {
    return "Invalid grammar, reference to a rule which is not defined: ->" + e.nonTerminalName + `<-
inside top level rule: ->` + n.name + "<-";
  }
}, Re = {
  buildDuplicateFoundError(n, e) {
    function t(h) {
      return h instanceof _ ? h.terminalType.name : h instanceof H ? h.nonTerminalName : "";
    }
    const s = n.name, i = ee(e), r = i.idx, a = ie(i), o = t(i), c = r > 0;
    let l = `->${a}${c ? r : ""}<- ${o ? `with argument: ->${o}<-` : ""}
                  appears more than once (${e.length} times) in the top level rule: ->${s}<-.                  
                  For further details see: https://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES 
                  `;
    return l = l.replace(/[ \t]+/g, " "), l = l.replace(/\s\s+/g, `
`), l;
  },
  buildNamespaceConflictError(n) {
    return `Namespace conflict found in grammar.
The grammar has both a Terminal(Token) and a Non-Terminal(Rule) named: <${n.name}>.
To resolve this make sure each Terminal and Non-Terminal names are unique
This is easy to accomplish by using the convention that Terminal names start with an uppercase letter
and Non-Terminal names start with a lower case letter.`;
  },
  buildAlternationPrefixAmbiguityError(n) {
    const e = m(n.prefixPath, (i) => $e(i)).join(", "), t = n.alternation.idx === 0 ? "" : n.alternation.idx;
    return `Ambiguous alternatives: <${n.ambiguityIndices.join(" ,")}> due to common lookahead prefix
in <OR${t}> inside <${n.topLevelRule.name}> Rule,
<${e}> may appears as a prefix path in all these alternatives.
See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#COMMON_PREFIX
For Further details.`;
  },
  buildAlternationAmbiguityError(n) {
    const e = m(n.prefixPath, (i) => $e(i)).join(", "), t = n.alternation.idx === 0 ? "" : n.alternation.idx;
    let s = `Ambiguous Alternatives Detected: <${n.ambiguityIndices.join(" ,")}> in <OR${t}> inside <${n.topLevelRule.name}> Rule,
<${e}> may appears as a prefix path in all these alternatives.
`;
    return s = s + `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#AMBIGUOUS_ALTERNATIVES
For Further details.`, s;
  },
  buildEmptyRepetitionError(n) {
    let e = ie(n.repetition);
    return n.repetition.idx !== 0 && (e += n.repetition.idx), `The repetition <${e}> within Rule <${n.topLevelRule.name}> can never consume any tokens.
This could lead to an infinite loop.`;
  },
  // TODO: remove - `errors_public` from nyc.config.js exclude
  //       once this method is fully removed from this file
  buildTokenNameError(n) {
    return "deprecated";
  },
  buildEmptyAlternationError(n) {
    return `Ambiguous empty alternative: <${n.emptyChoiceIdx + 1}> in <OR${n.alternation.idx}> inside <${n.topLevelRule.name}> Rule.
Only the last alternative may be an empty alternative.`;
  },
  buildTooManyAlternativesError(n) {
    return `An Alternation cannot have more than 256 alternatives:
<OR${n.alternation.idx}> inside <${n.topLevelRule.name}> Rule.
 has ${n.alternation.definition.length + 1} alternatives.`;
  },
  buildLeftRecursionError(n) {
    const e = n.topLevelRule.name, t = m(n.leftRecursionPath, (r) => r.name), s = `${e} --> ${t.concat([e]).join(" --> ")}`;
    return `Left Recursion found in grammar.
rule: <${e}> can be invoked from itself (directly or indirectly)
without consuming any Tokens. The grammar path that causes this is: 
 ${s}
 To fix this refactor your grammar to remove the left recursion.
see: https://en.wikipedia.org/wiki/LL_parser#Left_factoring.`;
  },
  // TODO: remove - `errors_public` from nyc.config.js exclude
  //       once this method is fully removed from this file
  buildInvalidRuleNameError(n) {
    return "deprecated";
  },
  buildDuplicateRuleNameError(n) {
    let e;
    return n.topLevelRule instanceof xe ? e = n.topLevelRule.name : e = n.topLevelRule, `Duplicate definition, rule: ->${e}<- is already defined in the grammar: ->${n.grammarName}<-`;
  }
};
function di(n, e) {
  const t = new fi(n, e);
  return t.resolveRefs(), t.errors;
}
class fi extends ye {
  constructor(e, t) {
    super(), this.nameToTopRule = e, this.errMsgProvider = t, this.errors = [];
  }
  resolveRefs() {
    I(v(this.nameToTopRule), (e) => {
      this.currTopLevel = e, e.accept(this);
    });
  }
  visitNonTerminal(e) {
    const t = this.nameToTopRule[e.nonTerminalName];
    if (t)
      e.referencedRule = t;
    else {
      const s = this.errMsgProvider.buildRuleNotFoundError(this.currTopLevel, e);
      this.errors.push({
        message: s,
        type: F.UNRESOLVED_SUBRULE_REF,
        ruleName: this.currTopLevel.name,
        unresolvedRefName: e.nonTerminalName
      });
    }
  }
}
class pi extends Et {
  constructor(e, t) {
    super(), this.topProd = e, this.path = t, this.possibleTokTypes = [], this.nextProductionName = "", this.nextProductionOccurrence = 0, this.found = !1, this.isAtEndOfPath = !1;
  }
  startWalking() {
    if (this.found = !1, this.path.ruleStack[0] !== this.topProd.name)
      throw Error("The path does not start with the walker's top Rule!");
    return this.ruleStack = b(this.path.ruleStack).reverse(), this.occurrenceStack = b(this.path.occurrenceStack).reverse(), this.ruleStack.pop(), this.occurrenceStack.pop(), this.updateExpectedNext(), this.walk(this.topProd), this.possibleTokTypes;
  }
  walk(e, t = []) {
    this.found || super.walk(e, t);
  }
  walkProdRef(e, t, s) {
    if (e.referencedRule.name === this.nextProductionName && e.idx === this.nextProductionOccurrence) {
      const i = t.concat(s);
      this.updateExpectedNext(), this.walk(e.referencedRule, i);
    }
  }
  updateExpectedNext() {
    O(this.ruleStack) ? (this.nextProductionName = "", this.nextProductionOccurrence = 0, this.isAtEndOfPath = !0) : (this.nextProductionName = this.ruleStack.pop(), this.nextProductionOccurrence = this.occurrenceStack.pop());
  }
}
class mi extends pi {
  constructor(e, t) {
    super(e, t), this.path = t, this.nextTerminalName = "", this.nextTerminalOccurrence = 0, this.nextTerminalName = this.path.lastTok.name, this.nextTerminalOccurrence = this.path.lastTokOccurrence;
  }
  walkTerminal(e, t, s) {
    if (this.isAtEndOfPath && e.terminalType.name === this.nextTerminalName && e.idx === this.nextTerminalOccurrence && !this.found) {
      const i = t.concat(s), r = new G({ definition: i });
      this.possibleTokTypes = Ve(r), this.found = !0;
    }
  }
}
class gt extends Et {
  constructor(e, t) {
    super(), this.topRule = e, this.occurrence = t, this.result = {
      token: void 0,
      occurrence: void 0,
      isEndOfRule: void 0
    };
  }
  startWalking() {
    return this.walk(this.topRule), this.result;
  }
}
class Ei extends gt {
  walkMany(e, t, s) {
    if (e.idx === this.occurrence) {
      const i = ee(t.concat(s));
      this.result.isEndOfRule = i === void 0, i instanceof _ && (this.result.token = i.terminalType, this.result.occurrence = i.idx);
    } else
      super.walkMany(e, t, s);
  }
}
class En extends gt {
  walkManySep(e, t, s) {
    if (e.idx === this.occurrence) {
      const i = ee(t.concat(s));
      this.result.isEndOfRule = i === void 0, i instanceof _ && (this.result.token = i.terminalType, this.result.occurrence = i.idx);
    } else
      super.walkManySep(e, t, s);
  }
}
class Ti extends gt {
  walkAtLeastOne(e, t, s) {
    if (e.idx === this.occurrence) {
      const i = ee(t.concat(s));
      this.result.isEndOfRule = i === void 0, i instanceof _ && (this.result.token = i.terminalType, this.result.occurrence = i.idx);
    } else
      super.walkAtLeastOne(e, t, s);
  }
}
class Tn extends gt {
  walkAtLeastOneSep(e, t, s) {
    if (e.idx === this.occurrence) {
      const i = ee(t.concat(s));
      this.result.isEndOfRule = i === void 0, i instanceof _ && (this.result.token = i.terminalType, this.result.occurrence = i.idx);
    } else
      super.walkAtLeastOneSep(e, t, s);
  }
}
function Pt(n, e, t = []) {
  t = b(t);
  let s = [], i = 0;
  function r(o) {
    return o.concat(M(n, i + 1));
  }
  function a(o) {
    const c = Pt(r(o), e, t);
    return s.concat(c);
  }
  for (; t.length < e && i < n.length; ) {
    const o = n[i];
    if (o instanceof G)
      return a(o.definition);
    if (o instanceof H)
      return a(o.definition);
    if (o instanceof D)
      s = a(o.definition);
    else if (o instanceof ae) {
      const c = o.definition.concat([
        new y({
          definition: o.definition
        })
      ]);
      return a(c);
    } else if (o instanceof oe) {
      const c = [
        new G({ definition: o.definition }),
        new y({
          definition: [new _({ terminalType: o.separator })].concat(o.definition)
        })
      ];
      return a(c);
    } else if (o instanceof ne) {
      const c = o.definition.concat([
        new y({
          definition: [new _({ terminalType: o.separator })].concat(o.definition)
        })
      ]);
      s = a(c);
    } else if (o instanceof y) {
      const c = o.definition.concat([
        new y({
          definition: o.definition
        })
      ]);
      s = a(c);
    } else {
      if (o instanceof se)
        return I(o.definition, (c) => {
          O(c.definition) === !1 && (s = a(c.definition));
        }), s;
      if (o instanceof _)
        t.push(o.terminalType);
      else
        throw Error("non exhaustive match");
    }
    i++;
  }
  return s.push({
    partialPath: t,
    suffixDef: M(n, i)
  }), s;
}
function Bn(n, e, t, s) {
  const i = "EXIT_NONE_TERMINAL", r = [i], a = "EXIT_ALTERNATIVE";
  let o = !1;
  const c = e.length, l = c - s - 1, h = [], u = [];
  for (u.push({
    idx: -1,
    def: n,
    ruleStack: [],
    occurrenceStack: []
  }); !O(u); ) {
    const p = u.pop();
    if (p === a) {
      o && Ne(u).idx <= l && u.pop();
      continue;
    }
    const g = p.def, N = p.idx, S = p.ruleStack, k = p.occurrenceStack;
    if (O(g))
      continue;
    const E = g[0];
    if (E === i) {
      const f = {
        idx: N,
        def: M(g),
        ruleStack: Ke(S),
        occurrenceStack: Ke(k)
      };
      u.push(f);
    } else if (E instanceof _)
      if (N < c - 1) {
        const f = N + 1, d = e[f];
        if (t(d, E.terminalType)) {
          const T = {
            idx: f,
            def: M(g),
            ruleStack: S,
            occurrenceStack: k
          };
          u.push(T);
        }
      } else if (N === c - 1)
        h.push({
          nextTokenType: E.terminalType,
          nextTokenOccurrence: E.idx,
          ruleStack: S,
          occurrenceStack: k
        }), o = !0;
      else
        throw Error("non exhaustive match");
    else if (E instanceof H) {
      const f = b(S);
      f.push(E.nonTerminalName);
      const d = b(k);
      d.push(E.idx);
      const T = {
        idx: N,
        def: E.definition.concat(r, M(g)),
        ruleStack: f,
        occurrenceStack: d
      };
      u.push(T);
    } else if (E instanceof D) {
      const f = {
        idx: N,
        def: M(g),
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(f), u.push(a);
      const d = {
        idx: N,
        def: E.definition.concat(M(g)),
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(d);
    } else if (E instanceof ae) {
      const f = new y({
        definition: E.definition,
        idx: E.idx
      }), d = E.definition.concat([f], M(g)), T = {
        idx: N,
        def: d,
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(T);
    } else if (E instanceof oe) {
      const f = new _({
        terminalType: E.separator
      }), d = new y({
        definition: [f].concat(E.definition),
        idx: E.idx
      }), T = E.definition.concat([d], M(g)), C = {
        idx: N,
        def: T,
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(C);
    } else if (E instanceof ne) {
      const f = {
        idx: N,
        def: M(g),
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(f), u.push(a);
      const d = new _({
        terminalType: E.separator
      }), T = new y({
        definition: [d].concat(E.definition),
        idx: E.idx
      }), C = E.definition.concat([T], M(g)), q = {
        idx: N,
        def: C,
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(q);
    } else if (E instanceof y) {
      const f = {
        idx: N,
        def: M(g),
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(f), u.push(a);
      const d = new y({
        definition: E.definition,
        idx: E.idx
      }), T = E.definition.concat([d], M(g)), C = {
        idx: N,
        def: T,
        ruleStack: S,
        occurrenceStack: k
      };
      u.push(C);
    } else if (E instanceof se)
      for (let f = E.definition.length - 1; f >= 0; f--) {
        const d = E.definition[f], T = {
          idx: N,
          def: d.definition.concat(M(g)),
          ruleStack: S,
          occurrenceStack: k
        };
        u.push(T), u.push(a);
      }
    else if (E instanceof G)
      u.push({
        idx: N,
        def: E.definition.concat(M(g)),
        ruleStack: S,
        occurrenceStack: k
      });
    else if (E instanceof xe)
      u.push(gi(E, N, S, k));
    else
      throw Error("non exhaustive match");
  }
  return h;
}
function gi(n, e, t, s) {
  const i = b(t);
  i.push(n.name);
  const r = b(s);
  return r.push(1), {
    idx: e,
    def: n.definition,
    ruleStack: i,
    occurrenceStack: r
  };
}
var L;
(function(n) {
  n[n.OPTION = 0] = "OPTION", n[n.REPETITION = 1] = "REPETITION", n[n.REPETITION_MANDATORY = 2] = "REPETITION_MANDATORY", n[n.REPETITION_MANDATORY_WITH_SEPARATOR = 3] = "REPETITION_MANDATORY_WITH_SEPARATOR", n[n.REPETITION_WITH_SEPARATOR = 4] = "REPETITION_WITH_SEPARATOR", n[n.ALTERNATION = 5] = "ALTERNATION";
})(L || (L = {}));
function $n(n) {
  if (n instanceof D || n === "Option")
    return L.OPTION;
  if (n instanceof y || n === "Repetition")
    return L.REPETITION;
  if (n instanceof ae || n === "RepetitionMandatory")
    return L.REPETITION_MANDATORY;
  if (n instanceof oe || n === "RepetitionMandatoryWithSeparator")
    return L.REPETITION_MANDATORY_WITH_SEPARATOR;
  if (n instanceof ne || n === "RepetitionWithSeparator")
    return L.REPETITION_WITH_SEPARATOR;
  if (n instanceof se || n === "Alternation")
    return L.ALTERNATION;
  throw Error("non exhaustive match");
}
function Ai(n, e, t, s, i, r) {
  const a = Wt(n, e, t), o = Hn(a) ? lt : ze;
  return r(a, s, o, i);
}
function Ii(n, e, t, s, i, r) {
  const a = Kt(n, e, i, t), o = Hn(a) ? lt : ze;
  return r(a[0], o, s);
}
function Ri(n, e, t, s) {
  const i = n.length, r = Z(n, (a) => Z(a, (o) => o.length === 1));
  if (e)
    return function(a) {
      const o = m(a, (c) => c.GATE);
      for (let c = 0; c < i; c++) {
        const l = n[c], h = l.length, u = o[c];
        if (!(u !== void 0 && u.call(this) === !1))
          e: for (let p = 0; p < h; p++) {
            const g = l[p], N = g.length;
            for (let S = 0; S < N; S++) {
              const k = this.LA(S + 1);
              if (t(k, g[S]) === !1)
                continue e;
            }
            return c;
          }
      }
    };
  if (r && !s) {
    const a = m(n, (c) => J(c)), o = K(a, (c, l, h) => (I(l, (u) => {
      A(c, u.tokenTypeIdx) || (c[u.tokenTypeIdx] = h), I(u.categoryMatches, (p) => {
        A(c, p) || (c[p] = h);
      });
    }), c), {});
    return function() {
      const c = this.LA(1);
      return o[c.tokenTypeIdx];
    };
  } else
    return function() {
      for (let a = 0; a < i; a++) {
        const o = n[a], c = o.length;
        e: for (let l = 0; l < c; l++) {
          const h = o[l], u = h.length;
          for (let p = 0; p < u; p++) {
            const g = this.LA(p + 1);
            if (t(g, h[p]) === !1)
              continue e;
          }
          return a;
        }
      }
    };
}
function Ni(n, e, t) {
  const s = Z(n, (r) => r.length === 1), i = n.length;
  if (s && !t) {
    const r = J(n);
    if (r.length === 1 && O(r[0].categoryMatches)) {
      const o = r[0].tokenTypeIdx;
      return function() {
        return this.LA(1).tokenTypeIdx === o;
      };
    } else {
      const a = K(r, (o, c, l) => (o[c.tokenTypeIdx] = !0, I(c.categoryMatches, (h) => {
        o[h] = !0;
      }), o), []);
      return function() {
        const o = this.LA(1);
        return a[o.tokenTypeIdx] === !0;
      };
    }
  } else
    return function() {
      e: for (let r = 0; r < i; r++) {
        const a = n[r], o = a.length;
        for (let c = 0; c < o; c++) {
          const l = this.LA(c + 1);
          if (e(l, a[c]) === !1)
            continue e;
        }
        return !0;
      }
      return !1;
    };
}
class Si extends Et {
  constructor(e, t, s) {
    super(), this.topProd = e, this.targetOccurrence = t, this.targetProdType = s;
  }
  startWalking() {
    return this.walk(this.topProd), this.restDef;
  }
  checkIsTarget(e, t, s, i) {
    return e.idx === this.targetOccurrence && this.targetProdType === t ? (this.restDef = s.concat(i), !0) : !1;
  }
  walkOption(e, t, s) {
    this.checkIsTarget(e, L.OPTION, t, s) || super.walkOption(e, t, s);
  }
  walkAtLeastOne(e, t, s) {
    this.checkIsTarget(e, L.REPETITION_MANDATORY, t, s) || super.walkOption(e, t, s);
  }
  walkAtLeastOneSep(e, t, s) {
    this.checkIsTarget(e, L.REPETITION_MANDATORY_WITH_SEPARATOR, t, s) || super.walkOption(e, t, s);
  }
  walkMany(e, t, s) {
    this.checkIsTarget(e, L.REPETITION, t, s) || super.walkOption(e, t, s);
  }
  walkManySep(e, t, s) {
    this.checkIsTarget(e, L.REPETITION_WITH_SEPARATOR, t, s) || super.walkOption(e, t, s);
  }
}
class Wn extends ye {
  constructor(e, t, s) {
    super(), this.targetOccurrence = e, this.targetProdType = t, this.targetRef = s, this.result = [];
  }
  checkIsTarget(e, t) {
    e.idx === this.targetOccurrence && this.targetProdType === t && (this.targetRef === void 0 || e === this.targetRef) && (this.result = e.definition);
  }
  visitOption(e) {
    this.checkIsTarget(e, L.OPTION);
  }
  visitRepetition(e) {
    this.checkIsTarget(e, L.REPETITION);
  }
  visitRepetitionMandatory(e) {
    this.checkIsTarget(e, L.REPETITION_MANDATORY);
  }
  visitRepetitionMandatoryWithSeparator(e) {
    this.checkIsTarget(e, L.REPETITION_MANDATORY_WITH_SEPARATOR);
  }
  visitRepetitionWithSeparator(e) {
    this.checkIsTarget(e, L.REPETITION_WITH_SEPARATOR);
  }
  visitAlternation(e) {
    this.checkIsTarget(e, L.ALTERNATION);
  }
}
function gn(n) {
  const e = new Array(n);
  for (let t = 0; t < n; t++)
    e[t] = [];
  return e;
}
function Ot(n) {
  let e = [""];
  for (let t = 0; t < n.length; t++) {
    const s = n[t], i = [];
    for (let r = 0; r < e.length; r++) {
      const a = e[r];
      i.push(a + "_" + s.tokenTypeIdx);
      for (let o = 0; o < s.categoryMatches.length; o++) {
        const c = "_" + s.categoryMatches[o];
        i.push(a + c);
      }
    }
    e = i;
  }
  return e;
}
function ki(n, e, t) {
  for (let s = 0; s < n.length; s++) {
    if (s === t)
      continue;
    const i = n[s];
    for (let r = 0; r < e.length; r++) {
      const a = e[r];
      if (i[a] === !0)
        return !1;
    }
  }
  return !0;
}
function Kn(n, e) {
  const t = m(n, (a) => Pt([a], 1)), s = gn(t.length), i = m(t, (a) => {
    const o = {};
    return I(a, (c) => {
      const l = Ot(c.partialPath);
      I(l, (h) => {
        o[h] = !0;
      });
    }), o;
  });
  let r = t;
  for (let a = 1; a <= e; a++) {
    const o = r;
    r = gn(o.length);
    for (let c = 0; c < o.length; c++) {
      const l = o[c];
      for (let h = 0; h < l.length; h++) {
        const u = l[h].partialPath, p = l[h].suffixDef, g = Ot(u);
        if (ki(i, g, c) || O(p) || u.length === e) {
          const S = s[c];
          if (vt(S, u) === !1) {
            S.push(u);
            for (let k = 0; k < g.length; k++) {
              const E = g[k];
              i[c][E] = !0;
            }
          }
        } else {
          const S = Pt(p, a + 1, u);
          r[c] = r[c].concat(S), I(S, (k) => {
            const E = Ot(k.partialPath);
            I(E, (f) => {
              i[c][f] = !0;
            });
          });
        }
      }
    }
  }
  return s;
}
function Wt(n, e, t, s) {
  const i = new Wn(n, L.ALTERNATION, s);
  return e.accept(i), Kn(i.result, t);
}
function Kt(n, e, t, s) {
  const i = new Wn(n, t);
  e.accept(i);
  const r = i.result, o = new Si(e, n, t).startWalking(), c = new G({ definition: r }), l = new G({ definition: o });
  return Kn([c, l], s);
}
function vt(n, e) {
  e: for (let t = 0; t < n.length; t++) {
    const s = n[t];
    if (s.length === e.length) {
      for (let i = 0; i < s.length; i++) {
        const r = e[i], a = s[i];
        if ((r === a || a.categoryMatchesMap[r.tokenTypeIdx] !== void 0) === !1)
          continue e;
      }
      return !0;
    }
  }
  return !1;
}
function Oi(n, e) {
  return n.length < e.length && Z(n, (t, s) => {
    const i = e[s];
    return t === i || i.categoryMatchesMap[t.tokenTypeIdx];
  });
}
function Hn(n) {
  return Z(n, (e) => Z(e, (t) => Z(t, (s) => O(s.categoryMatches))));
}
function _i(n) {
  const e = n.lookaheadStrategy.validate({
    rules: n.rules,
    tokenTypes: n.tokenTypes,
    grammarName: n.grammarName
  });
  return m(e, (t) => Object.assign({ type: F.CUSTOM_LOOKAHEAD_VALIDATION }, t));
}
function Ci(n, e, t, s) {
  const i = Y(n, (c) => Li(c, t)), r = Bi(n, e, t), a = Y(n, (c) => Fi(c, t)), o = Y(n, (c) => Pi(c, n, s, t));
  return i.concat(r, a, o);
}
function Li(n, e) {
  const t = new yi();
  n.accept(t);
  const s = t.allProductions, i = os(s, xi), r = te(i, (o) => o.length > 1);
  return m(v(r), (o) => {
    const c = ee(o), l = e.buildDuplicateFoundError(n, o), h = ie(c), u = {
      message: l,
      type: F.DUPLICATE_PRODUCTIONS,
      ruleName: n.name,
      dslName: h,
      occurrence: c.idx
    }, p = Vn(c);
    return p && (u.parameter = p), u;
  });
}
function xi(n) {
  return `${ie(n)}_#_${n.idx}_#_${Vn(n)}`;
}
function Vn(n) {
  return n instanceof _ ? n.terminalType.name : n instanceof H ? n.nonTerminalName : "";
}
class yi extends ye {
  constructor() {
    super(...arguments), this.allProductions = [];
  }
  visitNonTerminal(e) {
    this.allProductions.push(e);
  }
  visitOption(e) {
    this.allProductions.push(e);
  }
  visitRepetitionWithSeparator(e) {
    this.allProductions.push(e);
  }
  visitRepetitionMandatory(e) {
    this.allProductions.push(e);
  }
  visitRepetitionMandatoryWithSeparator(e) {
    this.allProductions.push(e);
  }
  visitRepetition(e) {
    this.allProductions.push(e);
  }
  visitAlternation(e) {
    this.allProductions.push(e);
  }
  visitTerminal(e) {
    this.allProductions.push(e);
  }
}
function Pi(n, e, t, s) {
  const i = [];
  if (K(e, (a, o) => o.name === n.name ? a + 1 : a, 0) > 1) {
    const a = s.buildDuplicateRuleNameError({
      topLevelRule: n,
      grammarName: t
    });
    i.push({
      message: a,
      type: F.DUPLICATE_RULE_NAME,
      ruleName: n.name
    });
  }
  return i;
}
function vi(n, e, t) {
  const s = [];
  let i;
  return U(e, n) || (i = `Invalid rule override, rule: ->${n}<- cannot be overridden in the grammar: ->${t}<-as it is not defined in any of the super grammars `, s.push({
    message: i,
    type: F.INVALID_RULE_OVERRIDE,
    ruleName: n
  })), s;
}
function zn(n, e, t, s = []) {
  const i = [], r = st(e.definition);
  if (O(r))
    return [];
  {
    const a = n.name;
    U(r, n) && i.push({
      message: t.buildLeftRecursionError({
        topLevelRule: n,
        leftRecursionPath: s
      }),
      type: F.LEFT_RECURSION,
      ruleName: a
    });
    const c = mt(r, s.concat([n])), l = Y(c, (h) => {
      const u = b(s);
      return u.push(h), zn(n, h, t, u);
    });
    return i.concat(l);
  }
}
function st(n) {
  let e = [];
  if (O(n))
    return e;
  const t = ee(n);
  if (t instanceof H)
    e.push(t.referencedRule);
  else if (t instanceof G || t instanceof D || t instanceof ae || t instanceof oe || t instanceof ne || t instanceof y)
    e = e.concat(st(t.definition));
  else if (t instanceof se)
    e = J(m(t.definition, (r) => st(r.definition)));
  else if (!(t instanceof _)) throw Error("non exhaustive match");
  const s = rt(t), i = n.length > 1;
  if (s && i) {
    const r = M(n);
    return e.concat(st(r));
  } else
    return e;
}
class Ht extends ye {
  constructor() {
    super(...arguments), this.alternations = [];
  }
  visitAlternation(e) {
    this.alternations.push(e);
  }
}
function Mi(n, e) {
  const t = new Ht();
  n.accept(t);
  const s = t.alternations;
  return Y(s, (r) => {
    const a = Ke(r.definition);
    return Y(a, (o, c) => {
      const l = Bn([o], [], ze, 1);
      return O(l) ? [
        {
          message: e.buildEmptyAlternationError({
            topLevelRule: n,
            alternation: r,
            emptyChoiceIdx: c
          }),
          type: F.NONE_LAST_EMPTY_ALT,
          ruleName: n.name,
          occurrence: r.idx,
          alternative: c + 1
        }
      ] : [];
    });
  });
}
function bi(n, e, t) {
  const s = new Ht();
  n.accept(s);
  let i = s.alternations;
  return i = pt(i, (a) => a.ignoreAmbiguities === !0), Y(i, (a) => {
    const o = a.idx, c = a.maxLookahead || e, l = Wt(o, n, c, a), h = Di(l, a, n, t), u = Gi(l, a, n, t);
    return h.concat(u);
  });
}
class wi extends ye {
  constructor() {
    super(...arguments), this.allProductions = [];
  }
  visitRepetitionWithSeparator(e) {
    this.allProductions.push(e);
  }
  visitRepetitionMandatory(e) {
    this.allProductions.push(e);
  }
  visitRepetitionMandatoryWithSeparator(e) {
    this.allProductions.push(e);
  }
  visitRepetition(e) {
    this.allProductions.push(e);
  }
}
function Fi(n, e) {
  const t = new Ht();
  n.accept(t);
  const s = t.alternations;
  return Y(s, (r) => r.definition.length > 255 ? [
    {
      message: e.buildTooManyAlternativesError({
        topLevelRule: n,
        alternation: r
      }),
      type: F.TOO_MANY_ALTS,
      ruleName: n.name,
      occurrence: r.idx
    }
  ] : []);
}
function Ui(n, e, t) {
  const s = [];
  return I(n, (i) => {
    const r = new wi();
    i.accept(r);
    const a = r.allProductions;
    I(a, (o) => {
      const c = $n(o), l = o.maxLookahead || e, h = o.idx, p = Kt(h, i, c, l)[0];
      if (O(J(p))) {
        const g = t.buildEmptyRepetitionError({
          topLevelRule: i,
          repetition: o
        });
        s.push({
          message: g,
          type: F.NO_NON_EMPTY_LOOKAHEAD,
          ruleName: i.name
        });
      }
    });
  }), s;
}
function Di(n, e, t, s) {
  const i = [], r = K(n, (o, c, l) => (e.definition[l].ignoreAmbiguities === !0 || I(c, (h) => {
    const u = [l];
    I(n, (p, g) => {
      l !== g && vt(p, h) && // ignore (skip) ambiguities with this "other" alternative
      e.definition[g].ignoreAmbiguities !== !0 && u.push(g);
    }), u.length > 1 && !vt(i, h) && (i.push(h), o.push({
      alts: u,
      path: h
    }));
  }), o), []);
  return m(r, (o) => {
    const c = m(o.alts, (h) => h + 1);
    return {
      message: s.buildAlternationAmbiguityError({
        topLevelRule: t,
        alternation: e,
        ambiguityIndices: c,
        prefixPath: o.path
      }),
      type: F.AMBIGUOUS_ALTS,
      ruleName: t.name,
      occurrence: e.idx,
      alternatives: o.alts
    };
  });
}
function Gi(n, e, t, s) {
  const i = K(n, (a, o, c) => {
    const l = m(o, (h) => ({ idx: c, path: h }));
    return a.concat(l);
  }, []);
  return He(Y(i, (a) => {
    if (e.definition[a.idx].ignoreAmbiguities === !0)
      return [];
    const c = a.idx, l = a.path, h = X(i, (p) => (
      // ignore (skip) ambiguities with this "other" alternative
      e.definition[p.idx].ignoreAmbiguities !== !0 && p.idx < c && // checking for strict prefix because identical lookaheads
      // will be be detected using a different validation.
      Oi(p.path, l)
    ));
    return m(h, (p) => {
      const g = [p.idx + 1, c + 1], N = e.idx === 0 ? "" : e.idx;
      return {
        message: s.buildAlternationPrefixAmbiguityError({
          topLevelRule: t,
          alternation: e,
          ambiguityIndices: g,
          prefixPath: p.path
        }),
        type: F.AMBIGUOUS_PREFIX_ALTS,
        ruleName: t.name,
        occurrence: N,
        alternatives: g
      };
    });
  }));
}
function Bi(n, e, t) {
  const s = [], i = m(e, (r) => r.name);
  return I(n, (r) => {
    const a = r.name;
    if (U(i, a)) {
      const o = t.buildNamespaceConflictError(r);
      s.push({
        message: o,
        type: F.CONFLICT_TOKENS_RULES_NAMESPACE,
        ruleName: a
      });
    }
  }), s;
}
function $i(n) {
  const e = Dt(n, {
    errMsgProvider: ui
  }), t = {};
  return I(n.rules, (s) => {
    t[s.name] = s;
  }), di(t, e.errMsgProvider);
}
function Wi(n) {
  return n = Dt(n, {
    errMsgProvider: Re
  }), Ci(n.rules, n.tokenTypes, n.errMsgProvider, n.grammarName);
}
const Yn = "MismatchedTokenException", jn = "NoViableAltException", Xn = "EarlyExitException", qn = "NotAllInputParsedException", Qn = [
  Yn,
  jn,
  Xn,
  qn
];
Object.freeze(Qn);
function ht(n) {
  return U(Qn, n.name);
}
class At extends Error {
  constructor(e, t) {
    super(e), this.token = t, this.resyncedTokens = [], Object.setPrototypeOf(this, new.target.prototype), Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }
}
class Zn extends At {
  constructor(e, t, s) {
    super(e, t), this.previousToken = s, this.name = Yn;
  }
}
class Ki extends At {
  constructor(e, t, s) {
    super(e, t), this.previousToken = s, this.name = jn;
  }
}
class Hi extends At {
  constructor(e, t) {
    super(e, t), this.name = qn;
  }
}
class Vi extends At {
  constructor(e, t, s) {
    super(e, t), this.previousToken = s, this.name = Xn;
  }
}
const _t = {}, Jn = "InRuleRecoveryException";
class zi extends Error {
  constructor(e) {
    super(e), this.name = Jn;
  }
}
class Yi {
  initRecoverable(e) {
    this.firstAfterRepMap = {}, this.resyncFollows = {}, this.recoveryEnabled = A(e, "recoveryEnabled") ? e.recoveryEnabled : de.recoveryEnabled, this.recoveryEnabled && (this.attemptInRepetitionRecovery = ji);
  }
  getTokenToInsert(e) {
    const t = $t(e, "", NaN, NaN, NaN, NaN, NaN, NaN);
    return t.isInsertedInRecovery = !0, t;
  }
  canTokenTypeBeInsertedInRecovery(e) {
    return !0;
  }
  canTokenTypeBeDeletedInRecovery(e) {
    return !0;
  }
  tryInRepetitionRecovery(e, t, s, i) {
    const r = this.findReSyncTokenType(), a = this.exportLexerState(), o = [];
    let c = !1;
    const l = this.LA(1);
    let h = this.LA(1);
    const u = () => {
      const p = this.LA(0), g = this.errorMessageProvider.buildMismatchTokenMessage({
        expected: i,
        actual: l,
        previous: p,
        ruleName: this.getCurrRuleFullName()
      }), N = new Zn(g, l, this.LA(0));
      N.resyncedTokens = Ke(o), this.SAVE_ERROR(N);
    };
    for (; !c; )
      if (this.tokenMatcher(h, i)) {
        u();
        return;
      } else if (s.call(this)) {
        u(), e.apply(this, t);
        return;
      } else this.tokenMatcher(h, r) ? c = !0 : (h = this.SKIP_TOKEN(), this.addToResyncTokens(h, o));
    this.importLexerState(a);
  }
  shouldInRepetitionRecoveryBeTried(e, t, s) {
    return !(s === !1 || this.tokenMatcher(this.LA(1), e) || this.isBackTracking() || this.canPerformInRuleRecovery(e, this.getFollowsForInRuleRecovery(e, t)));
  }
  // Error Recovery functionality
  getFollowsForInRuleRecovery(e, t) {
    const s = this.getCurrentGrammarPath(e, t);
    return this.getNextPossibleTokenTypes(s);
  }
  tryInRuleRecovery(e, t) {
    if (this.canRecoverWithSingleTokenInsertion(e, t))
      return this.getTokenToInsert(e);
    if (this.canRecoverWithSingleTokenDeletion(e)) {
      const s = this.SKIP_TOKEN();
      return this.consumeToken(), s;
    }
    throw new zi("sad sad panda");
  }
  canPerformInRuleRecovery(e, t) {
    return this.canRecoverWithSingleTokenInsertion(e, t) || this.canRecoverWithSingleTokenDeletion(e);
  }
  canRecoverWithSingleTokenInsertion(e, t) {
    if (!this.canTokenTypeBeInsertedInRecovery(e) || O(t))
      return !1;
    const s = this.LA(1);
    return Le(t, (r) => this.tokenMatcher(s, r)) !== void 0;
  }
  canRecoverWithSingleTokenDeletion(e) {
    return this.canTokenTypeBeDeletedInRecovery(e) ? this.tokenMatcher(this.LA(2), e) : !1;
  }
  isInCurrentRuleReSyncSet(e) {
    const t = this.getCurrFollowKey(), s = this.getFollowSetFromFollowKey(t);
    return U(s, e);
  }
  findReSyncTokenType() {
    const e = this.flattenFollowSet();
    let t = this.LA(1), s = 2;
    for (; ; ) {
      const i = Le(e, (r) => hi(t, r));
      if (i !== void 0)
        return i;
      t = this.LA(s), s++;
    }
  }
  getCurrFollowKey() {
    if (this.RULE_STACK.length === 1)
      return _t;
    const e = this.getLastExplicitRuleShortName(), t = this.getLastExplicitRuleOccurrenceIndex(), s = this.getPreviousExplicitRuleShortName();
    return {
      ruleName: this.shortRuleNameToFullName(e),
      idxInCallingRule: t,
      inRule: this.shortRuleNameToFullName(s)
    };
  }
  buildFullFollowKeyStack() {
    const e = this.RULE_STACK, t = this.RULE_OCCURRENCE_STACK;
    return m(e, (s, i) => i === 0 ? _t : {
      ruleName: this.shortRuleNameToFullName(s),
      idxInCallingRule: t[i],
      inRule: this.shortRuleNameToFullName(e[i - 1])
    });
  }
  flattenFollowSet() {
    const e = m(this.buildFullFollowKeyStack(), (t) => this.getFollowSetFromFollowKey(t));
    return J(e);
  }
  getFollowSetFromFollowKey(e) {
    if (e === _t)
      return [ke];
    const t = e.ruleName + e.idxInCallingRule + Ln + e.inRule;
    return this.resyncFollows[t];
  }
  // It does not make any sense to include a virtual EOF token in the list of resynced tokens
  // as EOF does not really exist and thus does not contain any useful information (line/column numbers)
  addToResyncTokens(e, t) {
    return this.tokenMatcher(e, ke) || t.push(e), t;
  }
  reSyncTo(e) {
    const t = [];
    let s = this.LA(1);
    for (; this.tokenMatcher(s, e) === !1; )
      s = this.SKIP_TOKEN(), this.addToResyncTokens(s, t);
    return Ke(t);
  }
  attemptInRepetitionRecovery(e, t, s, i, r, a, o) {
  }
  getCurrentGrammarPath(e, t) {
    const s = this.getHumanReadableRuleStack(), i = b(this.RULE_OCCURRENCE_STACK);
    return {
      ruleStack: s,
      occurrenceStack: i,
      lastTok: e,
      lastTokOccurrence: t
    };
  }
  getHumanReadableRuleStack() {
    return m(this.RULE_STACK, (e) => this.shortRuleNameToFullName(e));
  }
}
function ji(n, e, t, s, i, r, a) {
  const o = this.getKeyForAutomaticLookahead(s, i);
  let c = this.firstAfterRepMap[o];
  if (c === void 0) {
    const p = this.getCurrRuleFullName(), g = this.getGAstProductions()[p];
    c = new r(g, i).startWalking(), this.firstAfterRepMap[o] = c;
  }
  let l = c.token, h = c.occurrence;
  const u = c.isEndOfRule;
  this.RULE_STACK.length === 1 && u && l === void 0 && (l = ke, h = 1), !(l === void 0 || h === void 0) && this.shouldInRepetitionRecoveryBeTried(l, h, a) && this.tryInRepetitionRecovery(n, e, t, l);
}
const Xi = 4, ge = 8, es = 1 << ge, ts = 2 << ge, Mt = 3 << ge, bt = 4 << ge, wt = 5 << ge, it = 6 << ge;
function Ct(n, e, t) {
  return t | e | n;
}
class qi {
  constructor(e) {
    var t;
    this.maxLookahead = (t = e == null ? void 0 : e.maxLookahead) !== null && t !== void 0 ? t : de.maxLookahead;
  }
  validate(e) {
    const t = this.validateNoLeftRecursion(e.rules);
    if (O(t)) {
      const s = this.validateEmptyOrAlternatives(e.rules), i = this.validateAmbiguousAlternationAlternatives(e.rules, this.maxLookahead), r = this.validateSomeNonEmptyLookaheadPath(e.rules, this.maxLookahead);
      return [
        ...t,
        ...s,
        ...i,
        ...r
      ];
    }
    return t;
  }
  validateNoLeftRecursion(e) {
    return Y(e, (t) => zn(t, t, Re));
  }
  validateEmptyOrAlternatives(e) {
    return Y(e, (t) => Mi(t, Re));
  }
  validateAmbiguousAlternationAlternatives(e, t) {
    return Y(e, (s) => bi(s, t, Re));
  }
  validateSomeNonEmptyLookaheadPath(e, t) {
    return Ui(e, t, Re);
  }
  buildLookaheadForAlternation(e) {
    return Ai(e.prodOccurrence, e.rule, e.maxLookahead, e.hasPredicates, e.dynamicTokensEnabled, Ri);
  }
  buildLookaheadForOptional(e) {
    return Ii(e.prodOccurrence, e.rule, e.maxLookahead, e.dynamicTokensEnabled, $n(e.prodType), Ni);
  }
}
class Qi {
  initLooksAhead(e) {
    this.dynamicTokensEnabled = A(e, "dynamicTokensEnabled") ? e.dynamicTokensEnabled : de.dynamicTokensEnabled, this.maxLookahead = A(e, "maxLookahead") ? e.maxLookahead : de.maxLookahead, this.lookaheadStrategy = A(e, "lookaheadStrategy") ? e.lookaheadStrategy : new qi({ maxLookahead: this.maxLookahead }), this.lookAheadFuncsCache = /* @__PURE__ */ new Map();
  }
  preComputeLookaheadFunctions(e) {
    I(e, (t) => {
      this.TRACE_INIT(`${t.name} Rule Lookahead`, () => {
        const { alternation: s, repetition: i, option: r, repetitionMandatory: a, repetitionMandatoryWithSeparator: o, repetitionWithSeparator: c } = Ji(t);
        I(s, (l) => {
          const h = l.idx === 0 ? "" : l.idx;
          this.TRACE_INIT(`${ie(l)}${h}`, () => {
            const u = this.lookaheadStrategy.buildLookaheadForAlternation({
              prodOccurrence: l.idx,
              rule: t,
              maxLookahead: l.maxLookahead || this.maxLookahead,
              hasPredicates: l.hasPredicates,
              dynamicTokensEnabled: this.dynamicTokensEnabled
            }), p = Ct(this.fullRuleNameToShort[t.name], es, l.idx);
            this.setLaFuncCache(p, u);
          });
        }), I(i, (l) => {
          this.computeLookaheadFunc(t, l.idx, Mt, "Repetition", l.maxLookahead, ie(l));
        }), I(r, (l) => {
          this.computeLookaheadFunc(t, l.idx, ts, "Option", l.maxLookahead, ie(l));
        }), I(a, (l) => {
          this.computeLookaheadFunc(t, l.idx, bt, "RepetitionMandatory", l.maxLookahead, ie(l));
        }), I(o, (l) => {
          this.computeLookaheadFunc(t, l.idx, it, "RepetitionMandatoryWithSeparator", l.maxLookahead, ie(l));
        }), I(c, (l) => {
          this.computeLookaheadFunc(t, l.idx, wt, "RepetitionWithSeparator", l.maxLookahead, ie(l));
        });
      });
    });
  }
  computeLookaheadFunc(e, t, s, i, r, a) {
    this.TRACE_INIT(`${a}${t === 0 ? "" : t}`, () => {
      const o = this.lookaheadStrategy.buildLookaheadForOptional({
        prodOccurrence: t,
        rule: e,
        maxLookahead: r || this.maxLookahead,
        dynamicTokensEnabled: this.dynamicTokensEnabled,
        prodType: i
      }), c = Ct(this.fullRuleNameToShort[e.name], s, t);
      this.setLaFuncCache(c, o);
    });
  }
  // this actually returns a number, but it is always used as a string (object prop key)
  getKeyForAutomaticLookahead(e, t) {
    const s = this.getLastExplicitRuleShortName();
    return Ct(s, e, t);
  }
  getLaFuncFromCache(e) {
    return this.lookAheadFuncsCache.get(e);
  }
  /* istanbul ignore next */
  setLaFuncCache(e, t) {
    this.lookAheadFuncsCache.set(e, t);
  }
}
class Zi extends ye {
  constructor() {
    super(...arguments), this.dslMethods = {
      option: [],
      alternation: [],
      repetition: [],
      repetitionWithSeparator: [],
      repetitionMandatory: [],
      repetitionMandatoryWithSeparator: []
    };
  }
  reset() {
    this.dslMethods = {
      option: [],
      alternation: [],
      repetition: [],
      repetitionWithSeparator: [],
      repetitionMandatory: [],
      repetitionMandatoryWithSeparator: []
    };
  }
  visitOption(e) {
    this.dslMethods.option.push(e);
  }
  visitRepetitionWithSeparator(e) {
    this.dslMethods.repetitionWithSeparator.push(e);
  }
  visitRepetitionMandatory(e) {
    this.dslMethods.repetitionMandatory.push(e);
  }
  visitRepetitionMandatoryWithSeparator(e) {
    this.dslMethods.repetitionMandatoryWithSeparator.push(e);
  }
  visitRepetition(e) {
    this.dslMethods.repetition.push(e);
  }
  visitAlternation(e) {
    this.dslMethods.alternation.push(e);
  }
}
const Je = new Zi();
function Ji(n) {
  Je.reset(), n.accept(Je);
  const e = Je.dslMethods;
  return Je.reset(), e;
}
function An(n, e) {
  isNaN(n.startOffset) === !0 ? (n.startOffset = e.startOffset, n.endOffset = e.endOffset) : n.endOffset < e.endOffset && (n.endOffset = e.endOffset);
}
function In(n, e) {
  isNaN(n.startOffset) === !0 ? (n.startOffset = e.startOffset, n.startColumn = e.startColumn, n.startLine = e.startLine, n.endOffset = e.endOffset, n.endColumn = e.endColumn, n.endLine = e.endLine) : n.endOffset < e.endOffset && (n.endOffset = e.endOffset, n.endColumn = e.endColumn, n.endLine = e.endLine);
}
function er(n, e, t) {
  n.children[t] === void 0 ? n.children[t] = [e] : n.children[t].push(e);
}
function tr(n, e, t) {
  n.children[e] === void 0 ? n.children[e] = [t] : n.children[e].push(t);
}
const nr = "name";
function ns(n, e) {
  Object.defineProperty(n, nr, {
    enumerable: !1,
    configurable: !0,
    writable: !1,
    value: e
  });
}
function sr(n, e) {
  const t = We(n), s = t.length;
  for (let i = 0; i < s; i++) {
    const r = t[i], a = n[r], o = a.length;
    for (let c = 0; c < o; c++) {
      const l = a[c];
      l.tokenTypeIdx === void 0 && this[l.name](l.children, e);
    }
  }
}
function ir(n, e) {
  const t = function() {
  };
  ns(t, n + "BaseSemantics");
  const s = {
    visit: function(i, r) {
      if (z(i) && (i = i[0]), !ue(i))
        return this[i.name](i.children, r);
    },
    validateVisitor: function() {
      const i = ar(this, e);
      if (!O(i)) {
        const r = m(i, (a) => a.msg);
        throw Error(`Errors Detected in CST Visitor <${this.constructor.name}>:
	${r.join(`

`).replace(/\n/g, `
	`)}`);
      }
    }
  };
  return t.prototype = s, t.prototype.constructor = t, t._RULE_NAMES = e, t;
}
function rr(n, e, t) {
  const s = function() {
  };
  ns(s, n + "BaseSemanticsWithDefaults");
  const i = Object.create(t.prototype);
  return I(e, (r) => {
    i[r] = sr;
  }), s.prototype = i, s.prototype.constructor = s, s;
}
var Ft;
(function(n) {
  n[n.REDUNDANT_METHOD = 0] = "REDUNDANT_METHOD", n[n.MISSING_METHOD = 1] = "MISSING_METHOD";
})(Ft || (Ft = {}));
function ar(n, e) {
  return or(n, e);
}
function or(n, e) {
  const t = X(e, (i) => Oe(n[i]) === !1), s = m(t, (i) => ({
    msg: `Missing visitor method: <${i}> on ${n.constructor.name} CST Visitor.`,
    type: Ft.MISSING_METHOD,
    methodName: i
  }));
  return He(s);
}
class cr {
  initTreeBuilder(e) {
    if (this.CST_STACK = [], this.outputCst = e.outputCst, this.nodeLocationTracking = A(e, "nodeLocationTracking") ? e.nodeLocationTracking : de.nodeLocationTracking, !this.outputCst)
      this.cstInvocationStateUpdate = P, this.cstFinallyStateUpdate = P, this.cstPostTerminal = P, this.cstPostNonTerminal = P, this.cstPostRule = P;
    else if (/full/i.test(this.nodeLocationTracking))
      this.recoveryEnabled ? (this.setNodeLocationFromToken = In, this.setNodeLocationFromNode = In, this.cstPostRule = P, this.setInitialNodeLocation = this.setInitialNodeLocationFullRecovery) : (this.setNodeLocationFromToken = P, this.setNodeLocationFromNode = P, this.cstPostRule = this.cstPostRuleFull, this.setInitialNodeLocation = this.setInitialNodeLocationFullRegular);
    else if (/onlyOffset/i.test(this.nodeLocationTracking))
      this.recoveryEnabled ? (this.setNodeLocationFromToken = An, this.setNodeLocationFromNode = An, this.cstPostRule = P, this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRecovery) : (this.setNodeLocationFromToken = P, this.setNodeLocationFromNode = P, this.cstPostRule = this.cstPostRuleOnlyOffset, this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRegular);
    else if (/none/i.test(this.nodeLocationTracking))
      this.setNodeLocationFromToken = P, this.setNodeLocationFromNode = P, this.cstPostRule = P, this.setInitialNodeLocation = P;
    else
      throw Error(`Invalid <nodeLocationTracking> config option: "${e.nodeLocationTracking}"`);
  }
  setInitialNodeLocationOnlyOffsetRecovery(e) {
    e.location = {
      startOffset: NaN,
      endOffset: NaN
    };
  }
  setInitialNodeLocationOnlyOffsetRegular(e) {
    e.location = {
      // without error recovery the starting Location of a new CstNode is guaranteed
      // To be the next Token's startOffset (for valid inputs).
      // For invalid inputs there won't be any CSTOutput so this potential
      // inaccuracy does not matter
      startOffset: this.LA(1).startOffset,
      endOffset: NaN
    };
  }
  setInitialNodeLocationFullRecovery(e) {
    e.location = {
      startOffset: NaN,
      startLine: NaN,
      startColumn: NaN,
      endOffset: NaN,
      endLine: NaN,
      endColumn: NaN
    };
  }
  /**
       *  @see setInitialNodeLocationOnlyOffsetRegular for explanation why this work
  
       * @param cstNode
       */
  setInitialNodeLocationFullRegular(e) {
    const t = this.LA(1);
    e.location = {
      startOffset: t.startOffset,
      startLine: t.startLine,
      startColumn: t.startColumn,
      endOffset: NaN,
      endLine: NaN,
      endColumn: NaN
    };
  }
  cstInvocationStateUpdate(e) {
    const t = {
      name: e,
      children: /* @__PURE__ */ Object.create(null)
    };
    this.setInitialNodeLocation(t), this.CST_STACK.push(t);
  }
  cstFinallyStateUpdate() {
    this.CST_STACK.pop();
  }
  cstPostRuleFull(e) {
    const t = this.LA(0), s = e.location;
    s.startOffset <= t.startOffset ? (s.endOffset = t.endOffset, s.endLine = t.endLine, s.endColumn = t.endColumn) : (s.startOffset = NaN, s.startLine = NaN, s.startColumn = NaN);
  }
  cstPostRuleOnlyOffset(e) {
    const t = this.LA(0), s = e.location;
    s.startOffset <= t.startOffset ? s.endOffset = t.endOffset : s.startOffset = NaN;
  }
  cstPostTerminal(e, t) {
    const s = this.CST_STACK[this.CST_STACK.length - 1];
    er(s, t, e), this.setNodeLocationFromToken(s.location, t);
  }
  cstPostNonTerminal(e, t) {
    const s = this.CST_STACK[this.CST_STACK.length - 1];
    tr(s, t, e), this.setNodeLocationFromNode(s.location, e.location);
  }
  getBaseCstVisitorConstructor() {
    if (ue(this.baseCstVisitorConstructor)) {
      const e = ir(this.className, We(this.gastProductionsCache));
      return this.baseCstVisitorConstructor = e, e;
    }
    return this.baseCstVisitorConstructor;
  }
  getBaseCstVisitorConstructorWithDefaults() {
    if (ue(this.baseCstVisitorWithDefaultsConstructor)) {
      const e = rr(this.className, We(this.gastProductionsCache), this.getBaseCstVisitorConstructor());
      return this.baseCstVisitorWithDefaultsConstructor = e, e;
    }
    return this.baseCstVisitorWithDefaultsConstructor;
  }
  getLastExplicitRuleShortName() {
    const e = this.RULE_STACK;
    return e[e.length - 1];
  }
  getPreviousExplicitRuleShortName() {
    const e = this.RULE_STACK;
    return e[e.length - 2];
  }
  getLastExplicitRuleOccurrenceIndex() {
    const e = this.RULE_OCCURRENCE_STACK;
    return e[e.length - 1];
  }
}
class lr {
  initLexerAdapter() {
    this.tokVector = [], this.tokVectorLength = 0, this.currIdx = -1;
  }
  set input(e) {
    if (this.selfAnalysisDone !== !0)
      throw Error("Missing <performSelfAnalysis> invocation at the end of the Parser's constructor.");
    this.reset(), this.tokVector = e, this.tokVectorLength = e.length;
  }
  get input() {
    return this.tokVector;
  }
  // skips a token and returns the next token
  SKIP_TOKEN() {
    return this.currIdx <= this.tokVector.length - 2 ? (this.consumeToken(), this.LA(1)) : dt;
  }
  // Lexer (accessing Token vector) related methods which can be overridden to implement lazy lexers
  // or lexers dependent on parser context.
  LA(e) {
    const t = this.currIdx + e;
    return t < 0 || this.tokVectorLength <= t ? dt : this.tokVector[t];
  }
  consumeToken() {
    this.currIdx++;
  }
  exportLexerState() {
    return this.currIdx;
  }
  importLexerState(e) {
    this.currIdx = e;
  }
  resetLexerState() {
    this.currIdx = -1;
  }
  moveToTerminatedState() {
    this.currIdx = this.tokVector.length - 1;
  }
  getLexerPosition() {
    return this.exportLexerState();
  }
}
class hr {
  ACTION(e) {
    return e.call(this);
  }
  consume(e, t, s) {
    return this.consumeInternal(t, e, s);
  }
  subrule(e, t, s) {
    return this.subruleInternal(t, e, s);
  }
  option(e, t) {
    return this.optionInternal(t, e);
  }
  or(e, t) {
    return this.orInternal(t, e);
  }
  many(e, t) {
    return this.manyInternal(e, t);
  }
  atLeastOne(e, t) {
    return this.atLeastOneInternal(e, t);
  }
  CONSUME(e, t) {
    return this.consumeInternal(e, 0, t);
  }
  CONSUME1(e, t) {
    return this.consumeInternal(e, 1, t);
  }
  CONSUME2(e, t) {
    return this.consumeInternal(e, 2, t);
  }
  CONSUME3(e, t) {
    return this.consumeInternal(e, 3, t);
  }
  CONSUME4(e, t) {
    return this.consumeInternal(e, 4, t);
  }
  CONSUME5(e, t) {
    return this.consumeInternal(e, 5, t);
  }
  CONSUME6(e, t) {
    return this.consumeInternal(e, 6, t);
  }
  CONSUME7(e, t) {
    return this.consumeInternal(e, 7, t);
  }
  CONSUME8(e, t) {
    return this.consumeInternal(e, 8, t);
  }
  CONSUME9(e, t) {
    return this.consumeInternal(e, 9, t);
  }
  SUBRULE(e, t) {
    return this.subruleInternal(e, 0, t);
  }
  SUBRULE1(e, t) {
    return this.subruleInternal(e, 1, t);
  }
  SUBRULE2(e, t) {
    return this.subruleInternal(e, 2, t);
  }
  SUBRULE3(e, t) {
    return this.subruleInternal(e, 3, t);
  }
  SUBRULE4(e, t) {
    return this.subruleInternal(e, 4, t);
  }
  SUBRULE5(e, t) {
    return this.subruleInternal(e, 5, t);
  }
  SUBRULE6(e, t) {
    return this.subruleInternal(e, 6, t);
  }
  SUBRULE7(e, t) {
    return this.subruleInternal(e, 7, t);
  }
  SUBRULE8(e, t) {
    return this.subruleInternal(e, 8, t);
  }
  SUBRULE9(e, t) {
    return this.subruleInternal(e, 9, t);
  }
  OPTION(e) {
    return this.optionInternal(e, 0);
  }
  OPTION1(e) {
    return this.optionInternal(e, 1);
  }
  OPTION2(e) {
    return this.optionInternal(e, 2);
  }
  OPTION3(e) {
    return this.optionInternal(e, 3);
  }
  OPTION4(e) {
    return this.optionInternal(e, 4);
  }
  OPTION5(e) {
    return this.optionInternal(e, 5);
  }
  OPTION6(e) {
    return this.optionInternal(e, 6);
  }
  OPTION7(e) {
    return this.optionInternal(e, 7);
  }
  OPTION8(e) {
    return this.optionInternal(e, 8);
  }
  OPTION9(e) {
    return this.optionInternal(e, 9);
  }
  OR(e) {
    return this.orInternal(e, 0);
  }
  OR1(e) {
    return this.orInternal(e, 1);
  }
  OR2(e) {
    return this.orInternal(e, 2);
  }
  OR3(e) {
    return this.orInternal(e, 3);
  }
  OR4(e) {
    return this.orInternal(e, 4);
  }
  OR5(e) {
    return this.orInternal(e, 5);
  }
  OR6(e) {
    return this.orInternal(e, 6);
  }
  OR7(e) {
    return this.orInternal(e, 7);
  }
  OR8(e) {
    return this.orInternal(e, 8);
  }
  OR9(e) {
    return this.orInternal(e, 9);
  }
  MANY(e) {
    this.manyInternal(0, e);
  }
  MANY1(e) {
    this.manyInternal(1, e);
  }
  MANY2(e) {
    this.manyInternal(2, e);
  }
  MANY3(e) {
    this.manyInternal(3, e);
  }
  MANY4(e) {
    this.manyInternal(4, e);
  }
  MANY5(e) {
    this.manyInternal(5, e);
  }
  MANY6(e) {
    this.manyInternal(6, e);
  }
  MANY7(e) {
    this.manyInternal(7, e);
  }
  MANY8(e) {
    this.manyInternal(8, e);
  }
  MANY9(e) {
    this.manyInternal(9, e);
  }
  MANY_SEP(e) {
    this.manySepFirstInternal(0, e);
  }
  MANY_SEP1(e) {
    this.manySepFirstInternal(1, e);
  }
  MANY_SEP2(e) {
    this.manySepFirstInternal(2, e);
  }
  MANY_SEP3(e) {
    this.manySepFirstInternal(3, e);
  }
  MANY_SEP4(e) {
    this.manySepFirstInternal(4, e);
  }
  MANY_SEP5(e) {
    this.manySepFirstInternal(5, e);
  }
  MANY_SEP6(e) {
    this.manySepFirstInternal(6, e);
  }
  MANY_SEP7(e) {
    this.manySepFirstInternal(7, e);
  }
  MANY_SEP8(e) {
    this.manySepFirstInternal(8, e);
  }
  MANY_SEP9(e) {
    this.manySepFirstInternal(9, e);
  }
  AT_LEAST_ONE(e) {
    this.atLeastOneInternal(0, e);
  }
  AT_LEAST_ONE1(e) {
    return this.atLeastOneInternal(1, e);
  }
  AT_LEAST_ONE2(e) {
    this.atLeastOneInternal(2, e);
  }
  AT_LEAST_ONE3(e) {
    this.atLeastOneInternal(3, e);
  }
  AT_LEAST_ONE4(e) {
    this.atLeastOneInternal(4, e);
  }
  AT_LEAST_ONE5(e) {
    this.atLeastOneInternal(5, e);
  }
  AT_LEAST_ONE6(e) {
    this.atLeastOneInternal(6, e);
  }
  AT_LEAST_ONE7(e) {
    this.atLeastOneInternal(7, e);
  }
  AT_LEAST_ONE8(e) {
    this.atLeastOneInternal(8, e);
  }
  AT_LEAST_ONE9(e) {
    this.atLeastOneInternal(9, e);
  }
  AT_LEAST_ONE_SEP(e) {
    this.atLeastOneSepFirstInternal(0, e);
  }
  AT_LEAST_ONE_SEP1(e) {
    this.atLeastOneSepFirstInternal(1, e);
  }
  AT_LEAST_ONE_SEP2(e) {
    this.atLeastOneSepFirstInternal(2, e);
  }
  AT_LEAST_ONE_SEP3(e) {
    this.atLeastOneSepFirstInternal(3, e);
  }
  AT_LEAST_ONE_SEP4(e) {
    this.atLeastOneSepFirstInternal(4, e);
  }
  AT_LEAST_ONE_SEP5(e) {
    this.atLeastOneSepFirstInternal(5, e);
  }
  AT_LEAST_ONE_SEP6(e) {
    this.atLeastOneSepFirstInternal(6, e);
  }
  AT_LEAST_ONE_SEP7(e) {
    this.atLeastOneSepFirstInternal(7, e);
  }
  AT_LEAST_ONE_SEP8(e) {
    this.atLeastOneSepFirstInternal(8, e);
  }
  AT_LEAST_ONE_SEP9(e) {
    this.atLeastOneSepFirstInternal(9, e);
  }
  RULE(e, t, s = ft) {
    if (U(this.definedRulesNames, e)) {
      const a = {
        message: Re.buildDuplicateRuleNameError({
          topLevelRule: e,
          grammarName: this.className
        }),
        type: F.DUPLICATE_RULE_NAME,
        ruleName: e
      };
      this.definitionErrors.push(a);
    }
    this.definedRulesNames.push(e);
    const i = this.defineRule(e, t, s);
    return this[e] = i, i;
  }
  OVERRIDE_RULE(e, t, s = ft) {
    const i = vi(e, this.definedRulesNames, this.className);
    this.definitionErrors = this.definitionErrors.concat(i);
    const r = this.defineRule(e, t, s);
    return this[e] = r, r;
  }
  BACKTRACK(e, t) {
    return function() {
      this.isBackTrackingStack.push(1);
      const s = this.saveRecogState();
      try {
        return e.apply(this, t), !0;
      } catch (i) {
        if (ht(i))
          return !1;
        throw i;
      } finally {
        this.reloadRecogState(s), this.isBackTrackingStack.pop();
      }
    };
  }
  // GAST export APIs
  getGAstProductions() {
    return this.gastProductionsCache;
  }
  getSerializedGastProductions() {
    return us(v(this.gastProductionsCache));
  }
}
class ur {
  initRecognizerEngine(e, t) {
    if (this.className = this.constructor.name, this.shortRuleNameToFull = {}, this.fullRuleNameToShort = {}, this.ruleShortNameIdx = 256, this.tokenMatcher = lt, this.subruleIdx = 0, this.definedRulesNames = [], this.tokensMap = {}, this.isBackTrackingStack = [], this.RULE_STACK = [], this.RULE_OCCURRENCE_STACK = [], this.gastProductionsCache = {}, A(t, "serializedGrammar"))
      throw Error(`The Parser's configuration can no longer contain a <serializedGrammar> property.
	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_6-0-0
	For Further details.`);
    if (z(e)) {
      if (O(e))
        throw Error(`A Token Vocabulary cannot be empty.
	Note that the first argument for the parser constructor
	is no longer a Token vector (since v4.0).`);
      if (typeof e[0].startOffset == "number")
        throw Error(`The Parser constructor no longer accepts a token vector as the first argument.
	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_4-0-0
	For Further details.`);
    }
    if (z(e))
      this.tokensMap = K(e, (r, a) => (r[a.name] = a, r), {});
    else if (A(e, "modes") && Z(J(v(e.modes)), ai)) {
      const r = J(v(e.modes)), a = Ut(r);
      this.tokensMap = K(a, (o, c) => (o[c.name] = c, o), {});
    } else if (cs(e))
      this.tokensMap = b(e);
    else
      throw new Error("<tokensDictionary> argument must be An Array of Token constructors, A dictionary of Token constructors or an IMultiModeLexerDefinition");
    this.tokensMap.EOF = ke;
    const s = A(e, "modes") ? J(v(e.modes)) : v(e), i = Z(s, (r) => O(r.categoryMatches));
    this.tokenMatcher = i ? lt : ze, Ye(v(this.tokensMap));
  }
  defineRule(e, t, s) {
    if (this.selfAnalysisDone)
      throw Error(`Grammar rule <${e}> may not be defined after the 'performSelfAnalysis' method has been called'
Make sure that all grammar rule definitions are done before 'performSelfAnalysis' is called.`);
    const i = A(s, "resyncEnabled") ? s.resyncEnabled : ft.resyncEnabled, r = A(s, "recoveryValueFunc") ? s.recoveryValueFunc : ft.recoveryValueFunc, a = this.ruleShortNameIdx << Xi + ge;
    this.ruleShortNameIdx++, this.shortRuleNameToFull[a] = e, this.fullRuleNameToShort[e] = a;
    let o;
    return this.outputCst === !0 ? o = function(...h) {
      try {
        this.ruleInvocationStateUpdate(a, e, this.subruleIdx), t.apply(this, h);
        const u = this.CST_STACK[this.CST_STACK.length - 1];
        return this.cstPostRule(u), u;
      } catch (u) {
        return this.invokeRuleCatch(u, i, r);
      } finally {
        this.ruleFinallyStateUpdate();
      }
    } : o = function(...h) {
      try {
        return this.ruleInvocationStateUpdate(a, e, this.subruleIdx), t.apply(this, h);
      } catch (u) {
        return this.invokeRuleCatch(u, i, r);
      } finally {
        this.ruleFinallyStateUpdate();
      }
    }, Object.assign(o, { ruleName: e, originalGrammarAction: t });
  }
  invokeRuleCatch(e, t, s) {
    const i = this.RULE_STACK.length === 1, r = t && !this.isBackTracking() && this.recoveryEnabled;
    if (ht(e)) {
      const a = e;
      if (r) {
        const o = this.findReSyncTokenType();
        if (this.isInCurrentRuleReSyncSet(o))
          if (a.resyncedTokens = this.reSyncTo(o), this.outputCst) {
            const c = this.CST_STACK[this.CST_STACK.length - 1];
            return c.recoveredNode = !0, c;
          } else
            return s(e);
        else {
          if (this.outputCst) {
            const c = this.CST_STACK[this.CST_STACK.length - 1];
            c.recoveredNode = !0, a.partialCstResult = c;
          }
          throw a;
        }
      } else {
        if (i)
          return this.moveToTerminatedState(), s(e);
        throw a;
      }
    } else
      throw e;
  }
  // Implementation of parsing DSL
  optionInternal(e, t) {
    const s = this.getKeyForAutomaticLookahead(ts, t);
    return this.optionInternalLogic(e, t, s);
  }
  optionInternalLogic(e, t, s) {
    let i = this.getLaFuncFromCache(s), r;
    if (typeof e != "function") {
      r = e.DEF;
      const a = e.GATE;
      if (a !== void 0) {
        const o = i;
        i = () => a.call(this) && o.call(this);
      }
    } else
      r = e;
    if (i.call(this) === !0)
      return r.call(this);
  }
  atLeastOneInternal(e, t) {
    const s = this.getKeyForAutomaticLookahead(bt, e);
    return this.atLeastOneInternalLogic(e, t, s);
  }
  atLeastOneInternalLogic(e, t, s) {
    let i = this.getLaFuncFromCache(s), r;
    if (typeof t != "function") {
      r = t.DEF;
      const a = t.GATE;
      if (a !== void 0) {
        const o = i;
        i = () => a.call(this) && o.call(this);
      }
    } else
      r = t;
    if (i.call(this) === !0) {
      let a = this.doSingleRepetition(r);
      for (; i.call(this) === !0 && a === !0; )
        a = this.doSingleRepetition(r);
    } else
      throw this.raiseEarlyExitException(e, L.REPETITION_MANDATORY, t.ERR_MSG);
    this.attemptInRepetitionRecovery(this.atLeastOneInternal, [e, t], i, bt, e, Ti);
  }
  atLeastOneSepFirstInternal(e, t) {
    const s = this.getKeyForAutomaticLookahead(it, e);
    this.atLeastOneSepFirstInternalLogic(e, t, s);
  }
  atLeastOneSepFirstInternalLogic(e, t, s) {
    const i = t.DEF, r = t.SEP;
    if (this.getLaFuncFromCache(s).call(this) === !0) {
      i.call(this);
      const o = () => this.tokenMatcher(this.LA(1), r);
      for (; this.tokenMatcher(this.LA(1), r) === !0; )
        this.CONSUME(r), i.call(this);
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        e,
        r,
        o,
        i,
        Tn
      ], o, it, e, Tn);
    } else
      throw this.raiseEarlyExitException(e, L.REPETITION_MANDATORY_WITH_SEPARATOR, t.ERR_MSG);
  }
  manyInternal(e, t) {
    const s = this.getKeyForAutomaticLookahead(Mt, e);
    return this.manyInternalLogic(e, t, s);
  }
  manyInternalLogic(e, t, s) {
    let i = this.getLaFuncFromCache(s), r;
    if (typeof t != "function") {
      r = t.DEF;
      const o = t.GATE;
      if (o !== void 0) {
        const c = i;
        i = () => o.call(this) && c.call(this);
      }
    } else
      r = t;
    let a = !0;
    for (; i.call(this) === !0 && a === !0; )
      a = this.doSingleRepetition(r);
    this.attemptInRepetitionRecovery(
      this.manyInternal,
      [e, t],
      i,
      Mt,
      e,
      Ei,
      // The notStuck parameter is only relevant when "attemptInRepetitionRecovery"
      // is invoked from manyInternal, in the MANY_SEP case and AT_LEAST_ONE[_SEP]
      // An infinite loop cannot occur as:
      // - Either the lookahead is guaranteed to consume something (Single Token Separator)
      // - AT_LEAST_ONE by definition is guaranteed to consume something (or error out).
      a
    );
  }
  manySepFirstInternal(e, t) {
    const s = this.getKeyForAutomaticLookahead(wt, e);
    this.manySepFirstInternalLogic(e, t, s);
  }
  manySepFirstInternalLogic(e, t, s) {
    const i = t.DEF, r = t.SEP;
    if (this.getLaFuncFromCache(s).call(this) === !0) {
      i.call(this);
      const o = () => this.tokenMatcher(this.LA(1), r);
      for (; this.tokenMatcher(this.LA(1), r) === !0; )
        this.CONSUME(r), i.call(this);
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        e,
        r,
        o,
        i,
        En
      ], o, wt, e, En);
    }
  }
  repetitionSepSecondInternal(e, t, s, i, r) {
    for (; s(); )
      this.CONSUME(t), i.call(this);
    this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
      e,
      t,
      s,
      i,
      r
    ], s, it, e, r);
  }
  doSingleRepetition(e) {
    const t = this.getLexerPosition();
    return e.call(this), this.getLexerPosition() > t;
  }
  orInternal(e, t) {
    const s = this.getKeyForAutomaticLookahead(es, t), i = z(e) ? e : e.DEF, a = this.getLaFuncFromCache(s).call(this, i);
    if (a !== void 0)
      return i[a].ALT.call(this);
    this.raiseNoAltException(t, e.ERR_MSG);
  }
  ruleFinallyStateUpdate() {
    if (this.RULE_STACK.pop(), this.RULE_OCCURRENCE_STACK.pop(), this.cstFinallyStateUpdate(), this.RULE_STACK.length === 0 && this.isAtEndOfInput() === !1) {
      const e = this.LA(1), t = this.errorMessageProvider.buildNotAllInputParsedMessage({
        firstRedundant: e,
        ruleName: this.getCurrRuleFullName()
      });
      this.SAVE_ERROR(new Hi(t, e));
    }
  }
  subruleInternal(e, t, s) {
    let i;
    try {
      const r = s !== void 0 ? s.ARGS : void 0;
      return this.subruleIdx = t, i = e.apply(this, r), this.cstPostNonTerminal(i, s !== void 0 && s.LABEL !== void 0 ? s.LABEL : e.ruleName), i;
    } catch (r) {
      throw this.subruleInternalError(r, s, e.ruleName);
    }
  }
  subruleInternalError(e, t, s) {
    throw ht(e) && e.partialCstResult !== void 0 && (this.cstPostNonTerminal(e.partialCstResult, t !== void 0 && t.LABEL !== void 0 ? t.LABEL : s), delete e.partialCstResult), e;
  }
  consumeInternal(e, t, s) {
    let i;
    try {
      const r = this.LA(1);
      this.tokenMatcher(r, e) === !0 ? (this.consumeToken(), i = r) : this.consumeInternalError(e, r, s);
    } catch (r) {
      i = this.consumeInternalRecovery(e, t, r);
    }
    return this.cstPostTerminal(s !== void 0 && s.LABEL !== void 0 ? s.LABEL : e.name, i), i;
  }
  consumeInternalError(e, t, s) {
    let i;
    const r = this.LA(0);
    throw s !== void 0 && s.ERR_MSG ? i = s.ERR_MSG : i = this.errorMessageProvider.buildMismatchTokenMessage({
      expected: e,
      actual: t,
      previous: r,
      ruleName: this.getCurrRuleFullName()
    }), this.SAVE_ERROR(new Zn(i, t, r));
  }
  consumeInternalRecovery(e, t, s) {
    if (this.recoveryEnabled && // TODO: more robust checking of the exception type. Perhaps Typescript extending expressions?
    s.name === "MismatchedTokenException" && !this.isBackTracking()) {
      const i = this.getFollowsForInRuleRecovery(e, t);
      try {
        return this.tryInRuleRecovery(e, i);
      } catch (r) {
        throw r.name === Jn ? s : r;
      }
    } else
      throw s;
  }
  saveRecogState() {
    const e = this.errors, t = b(this.RULE_STACK);
    return {
      errors: e,
      lexerState: this.exportLexerState(),
      RULE_STACK: t,
      CST_STACK: this.CST_STACK
    };
  }
  reloadRecogState(e) {
    this.errors = e.errors, this.importLexerState(e.lexerState), this.RULE_STACK = e.RULE_STACK;
  }
  ruleInvocationStateUpdate(e, t, s) {
    this.RULE_OCCURRENCE_STACK.push(s), this.RULE_STACK.push(e), this.cstInvocationStateUpdate(t);
  }
  isBackTracking() {
    return this.isBackTrackingStack.length !== 0;
  }
  getCurrRuleFullName() {
    const e = this.getLastExplicitRuleShortName();
    return this.shortRuleNameToFull[e];
  }
  shortRuleNameToFullName(e) {
    return this.shortRuleNameToFull[e];
  }
  isAtEndOfInput() {
    return this.tokenMatcher(this.LA(1), ke);
  }
  reset() {
    this.resetLexerState(), this.subruleIdx = 0, this.isBackTrackingStack = [], this.errors = [], this.RULE_STACK = [], this.CST_STACK = [], this.RULE_OCCURRENCE_STACK = [];
  }
}
class dr {
  initErrorHandler(e) {
    this._errors = [], this.errorMessageProvider = A(e, "errorMessageProvider") ? e.errorMessageProvider : de.errorMessageProvider;
  }
  SAVE_ERROR(e) {
    if (ht(e))
      return e.context = {
        ruleStack: this.getHumanReadableRuleStack(),
        ruleOccurrenceStack: b(this.RULE_OCCURRENCE_STACK)
      }, this._errors.push(e), e;
    throw Error("Trying to save an Error which is not a RecognitionException");
  }
  get errors() {
    return b(this._errors);
  }
  set errors(e) {
    this._errors = e;
  }
  // TODO: consider caching the error message computed information
  raiseEarlyExitException(e, t, s) {
    const i = this.getCurrRuleFullName(), r = this.getGAstProductions()[i], o = Kt(e, r, t, this.maxLookahead)[0], c = [];
    for (let h = 1; h <= this.maxLookahead; h++)
      c.push(this.LA(h));
    const l = this.errorMessageProvider.buildEarlyExitMessage({
      expectedIterationPaths: o,
      actual: c,
      previous: this.LA(0),
      customUserDescription: s,
      ruleName: i
    });
    throw this.SAVE_ERROR(new Vi(l, this.LA(1), this.LA(0)));
  }
  // TODO: consider caching the error message computed information
  raiseNoAltException(e, t) {
    const s = this.getCurrRuleFullName(), i = this.getGAstProductions()[s], r = Wt(e, i, this.maxLookahead), a = [];
    for (let l = 1; l <= this.maxLookahead; l++)
      a.push(this.LA(l));
    const o = this.LA(0), c = this.errorMessageProvider.buildNoViableAltMessage({
      expectedPathsPerAlt: r,
      actual: a,
      previous: o,
      customUserDescription: t,
      ruleName: this.getCurrRuleFullName()
    });
    throw this.SAVE_ERROR(new Ki(c, this.LA(1), o));
  }
}
class fr {
  initContentAssist() {
  }
  computeContentAssist(e, t) {
    const s = this.gastProductionsCache[e];
    if (ue(s))
      throw Error(`Rule ->${e}<- does not exist in this grammar.`);
    return Bn([s], t, this.tokenMatcher, this.maxLookahead);
  }
  // TODO: should this be a member method or a utility? it does not have any state or usage of 'this'...
  // TODO: should this be more explicitly part of the public API?
  getNextPossibleTokenTypes(e) {
    const t = ee(e.ruleStack), i = this.getGAstProductions()[t];
    return new mi(i, e).startWalking();
  }
}
const It = {
  description: "This Object indicates the Parser is during Recording Phase"
};
Object.freeze(It);
const Rn = !0, Nn = Math.pow(2, ge) - 1, ss = Dn({ name: "RECORDING_PHASE_TOKEN", pattern: j.NA });
Ye([ss]);
const is = $t(
  ss,
  `This IToken indicates the Parser is in Recording Phase
	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details`,
  // Using "-1" instead of NaN (as in EOF) because an actual number is less likely to
  // cause errors if the output of LA or CONSUME would be (incorrectly) used during the recording phase.
  -1,
  -1,
  -1,
  -1,
  -1,
  -1
);
Object.freeze(is);
const pr = {
  name: `This CSTNode indicates the Parser is in Recording Phase
	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details`,
  children: {}
};
class mr {
  initGastRecorder(e) {
    this.recordingProdStack = [], this.RECORDING_PHASE = !1;
  }
  enableRecording() {
    this.RECORDING_PHASE = !0, this.TRACE_INIT("Enable Recording", () => {
      for (let e = 0; e < 10; e++) {
        const t = e > 0 ? e : "";
        this[`CONSUME${t}`] = function(s, i) {
          return this.consumeInternalRecord(s, e, i);
        }, this[`SUBRULE${t}`] = function(s, i) {
          return this.subruleInternalRecord(s, e, i);
        }, this[`OPTION${t}`] = function(s) {
          return this.optionInternalRecord(s, e);
        }, this[`OR${t}`] = function(s) {
          return this.orInternalRecord(s, e);
        }, this[`MANY${t}`] = function(s) {
          this.manyInternalRecord(e, s);
        }, this[`MANY_SEP${t}`] = function(s) {
          this.manySepFirstInternalRecord(e, s);
        }, this[`AT_LEAST_ONE${t}`] = function(s) {
          this.atLeastOneInternalRecord(e, s);
        }, this[`AT_LEAST_ONE_SEP${t}`] = function(s) {
          this.atLeastOneSepFirstInternalRecord(e, s);
        };
      }
      this.consume = function(e, t, s) {
        return this.consumeInternalRecord(t, e, s);
      }, this.subrule = function(e, t, s) {
        return this.subruleInternalRecord(t, e, s);
      }, this.option = function(e, t) {
        return this.optionInternalRecord(t, e);
      }, this.or = function(e, t) {
        return this.orInternalRecord(t, e);
      }, this.many = function(e, t) {
        this.manyInternalRecord(e, t);
      }, this.atLeastOne = function(e, t) {
        this.atLeastOneInternalRecord(e, t);
      }, this.ACTION = this.ACTION_RECORD, this.BACKTRACK = this.BACKTRACK_RECORD, this.LA = this.LA_RECORD;
    });
  }
  disableRecording() {
    this.RECORDING_PHASE = !1, this.TRACE_INIT("Deleting Recording methods", () => {
      const e = this;
      for (let t = 0; t < 10; t++) {
        const s = t > 0 ? t : "";
        delete e[`CONSUME${s}`], delete e[`SUBRULE${s}`], delete e[`OPTION${s}`], delete e[`OR${s}`], delete e[`MANY${s}`], delete e[`MANY_SEP${s}`], delete e[`AT_LEAST_ONE${s}`], delete e[`AT_LEAST_ONE_SEP${s}`];
      }
      delete e.consume, delete e.subrule, delete e.option, delete e.or, delete e.many, delete e.atLeastOne, delete e.ACTION, delete e.BACKTRACK, delete e.LA;
    });
  }
  //   Parser methods are called inside an ACTION?
  //   Maybe try/catch/finally on ACTIONS while disabling the recorders state changes?
  // @ts-expect-error -- noop place holder
  ACTION_RECORD(e) {
  }
  // Executing backtracking logic will break our recording logic assumptions
  BACKTRACK_RECORD(e, t) {
    return () => !0;
  }
  // LA is part of the official API and may be used for custom lookahead logic
  // by end users who may forget to wrap it in ACTION or inside a GATE
  LA_RECORD(e) {
    return dt;
  }
  topLevelRuleRecord(e, t) {
    try {
      const s = new xe({ definition: [], name: e });
      return s.name = e, this.recordingProdStack.push(s), t.call(this), this.recordingProdStack.pop(), s;
    } catch (s) {
      if (s.KNOWN_RECORDER_ERROR !== !0)
        try {
          s.message = s.message + `
	 This error was thrown during the "grammar recording phase" For more info see:
	https://chevrotain.io/docs/guide/internals.html#grammar-recording`;
        } catch {
          throw s;
        }
      throw s;
    }
  }
  // Implementation of parsing DSL
  optionInternalRecord(e, t) {
    return Ue.call(this, D, e, t);
  }
  atLeastOneInternalRecord(e, t) {
    Ue.call(this, ae, t, e);
  }
  atLeastOneSepFirstInternalRecord(e, t) {
    Ue.call(this, oe, t, e, Rn);
  }
  manyInternalRecord(e, t) {
    Ue.call(this, y, t, e);
  }
  manySepFirstInternalRecord(e, t) {
    Ue.call(this, ne, t, e, Rn);
  }
  orInternalRecord(e, t) {
    return Er.call(this, e, t);
  }
  subruleInternalRecord(e, t, s) {
    if (ut(t), !e || A(e, "ruleName") === !1) {
      const o = new Error(`<SUBRULE${Sn(t)}> argument is invalid expecting a Parser method reference but got: <${JSON.stringify(e)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
      throw o.KNOWN_RECORDER_ERROR = !0, o;
    }
    const i = Ne(this.recordingProdStack), r = e.ruleName, a = new H({
      idx: t,
      nonTerminalName: r,
      label: s == null ? void 0 : s.LABEL,
      // The resolving of the `referencedRule` property will be done once all the Rule's GASTs have been created
      referencedRule: void 0
    });
    return i.definition.push(a), this.outputCst ? pr : It;
  }
  consumeInternalRecord(e, t, s) {
    if (ut(t), !Fn(e)) {
      const a = new Error(`<CONSUME${Sn(t)}> argument is invalid expecting a TokenType reference but got: <${JSON.stringify(e)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
      throw a.KNOWN_RECORDER_ERROR = !0, a;
    }
    const i = Ne(this.recordingProdStack), r = new _({
      idx: t,
      terminalType: e,
      label: s == null ? void 0 : s.LABEL
    });
    return i.definition.push(r), is;
  }
}
function Ue(n, e, t, s = !1) {
  ut(t);
  const i = Ne(this.recordingProdStack), r = Oe(e) ? e : e.DEF, a = new n({ definition: [], idx: t });
  return s && (a.separator = e.SEP), A(e, "MAX_LOOKAHEAD") && (a.maxLookahead = e.MAX_LOOKAHEAD), this.recordingProdStack.push(a), r.call(this), i.definition.push(a), this.recordingProdStack.pop(), It;
}
function Er(n, e) {
  ut(e);
  const t = Ne(this.recordingProdStack), s = z(n) === !1, i = s === !1 ? n : n.DEF, r = new se({
    definition: [],
    idx: e,
    ignoreAmbiguities: s && n.IGNORE_AMBIGUITIES === !0
  });
  A(n, "MAX_LOOKAHEAD") && (r.maxLookahead = n.MAX_LOOKAHEAD);
  const a = kn(i, (o) => Oe(o.GATE));
  return r.hasPredicates = a, t.definition.push(r), I(i, (o) => {
    const c = new G({ definition: [] });
    r.definition.push(c), A(o, "IGNORE_AMBIGUITIES") ? c.ignoreAmbiguities = o.IGNORE_AMBIGUITIES : A(o, "GATE") && (c.ignoreAmbiguities = !0), this.recordingProdStack.push(c), o.ALT.call(this), this.recordingProdStack.pop();
  }), It;
}
function Sn(n) {
  return n === 0 ? "" : `${n}`;
}
function ut(n) {
  if (n < 0 || n > Nn) {
    const e = new Error(
      // The stack trace will contain all the needed details
      `Invalid DSL Method idx value: <${n}>
	Idx value must be a none negative value smaller than ${Nn + 1}`
    );
    throw e.KNOWN_RECORDER_ERROR = !0, e;
  }
}
class Tr {
  initPerformanceTracer(e) {
    if (A(e, "traceInitPerf")) {
      const t = e.traceInitPerf, s = typeof t == "number";
      this.traceInitMaxIdent = s ? t : 1 / 0, this.traceInitPerf = s ? t > 0 : t;
    } else
      this.traceInitMaxIdent = 0, this.traceInitPerf = de.traceInitPerf;
    this.traceInitIndent = -1;
  }
  TRACE_INIT(e, t) {
    if (this.traceInitPerf === !0) {
      this.traceInitIndent++;
      const s = new Array(this.traceInitIndent + 1).join("	");
      this.traceInitIndent < this.traceInitMaxIdent && console.log(`${s}--> <${e}>`);
      const { time: i, value: r } = _n(t), a = i > 10 ? console.warn : console.log;
      return this.traceInitIndent < this.traceInitMaxIdent && a(`${s}<-- <${e}> time: ${i}ms`), this.traceInitIndent--, r;
    } else
      return t();
  }
}
function gr(n, e) {
  e.forEach((t) => {
    const s = t.prototype;
    Object.getOwnPropertyNames(s).forEach((i) => {
      if (i === "constructor")
        return;
      const r = Object.getOwnPropertyDescriptor(s, i);
      r && (r.get || r.set) ? Object.defineProperty(n.prototype, i, r) : n.prototype[i] = t.prototype[i];
    });
  });
}
const dt = $t(ke, "", NaN, NaN, NaN, NaN, NaN, NaN);
Object.freeze(dt);
const de = Object.freeze({
  recoveryEnabled: !1,
  maxLookahead: 3,
  dynamicTokensEnabled: !1,
  outputCst: !0,
  errorMessageProvider: Gn,
  nodeLocationTracking: "none",
  traceInitPerf: !1,
  skipValidations: !1
}), ft = Object.freeze({
  recoveryValueFunc: () => {
  },
  resyncEnabled: !0
});
var F;
(function(n) {
  n[n.INVALID_RULE_NAME = 0] = "INVALID_RULE_NAME", n[n.DUPLICATE_RULE_NAME = 1] = "DUPLICATE_RULE_NAME", n[n.INVALID_RULE_OVERRIDE = 2] = "INVALID_RULE_OVERRIDE", n[n.DUPLICATE_PRODUCTIONS = 3] = "DUPLICATE_PRODUCTIONS", n[n.UNRESOLVED_SUBRULE_REF = 4] = "UNRESOLVED_SUBRULE_REF", n[n.LEFT_RECURSION = 5] = "LEFT_RECURSION", n[n.NONE_LAST_EMPTY_ALT = 6] = "NONE_LAST_EMPTY_ALT", n[n.AMBIGUOUS_ALTS = 7] = "AMBIGUOUS_ALTS", n[n.CONFLICT_TOKENS_RULES_NAMESPACE = 8] = "CONFLICT_TOKENS_RULES_NAMESPACE", n[n.INVALID_TOKEN_NAME = 9] = "INVALID_TOKEN_NAME", n[n.NO_NON_EMPTY_LOOKAHEAD = 10] = "NO_NON_EMPTY_LOOKAHEAD", n[n.AMBIGUOUS_PREFIX_ALTS = 11] = "AMBIGUOUS_PREFIX_ALTS", n[n.TOO_MANY_ALTS = 12] = "TOO_MANY_ALTS", n[n.CUSTOM_LOOKAHEAD_VALIDATION = 13] = "CUSTOM_LOOKAHEAD_VALIDATION";
})(F || (F = {}));
class je {
  /**
   *  @deprecated use the **instance** method with the same name instead
   */
  static performSelfAnalysis(e) {
    throw Error("The **static** `performSelfAnalysis` method has been deprecated.	\nUse the **instance** method with the same name instead.");
  }
  performSelfAnalysis() {
    this.TRACE_INIT("performSelfAnalysis", () => {
      let e;
      this.selfAnalysisDone = !0;
      const t = this.className;
      this.TRACE_INIT("toFastProps", () => {
        Cn(this);
      }), this.TRACE_INIT("Grammar Recording", () => {
        try {
          this.enableRecording(), I(this.definedRulesNames, (i) => {
            const a = this[i].originalGrammarAction;
            let o;
            this.TRACE_INIT(`${i} Rule`, () => {
              o = this.topLevelRuleRecord(i, a);
            }), this.gastProductionsCache[i] = o;
          });
        } finally {
          this.disableRecording();
        }
      });
      let s = [];
      if (this.TRACE_INIT("Grammar Resolving", () => {
        s = $i({
          rules: v(this.gastProductionsCache)
        }), this.definitionErrors = this.definitionErrors.concat(s);
      }), this.TRACE_INIT("Grammar Validations", () => {
        if (O(s) && this.skipValidations === !1) {
          const i = Wi({
            rules: v(this.gastProductionsCache),
            tokenTypes: v(this.tokensMap),
            errMsgProvider: Re,
            grammarName: t
          }), r = _i({
            lookaheadStrategy: this.lookaheadStrategy,
            rules: v(this.gastProductionsCache),
            tokenTypes: v(this.tokensMap),
            grammarName: t
          });
          this.definitionErrors = this.definitionErrors.concat(i, r);
        }
      }), O(this.definitionErrors) && (this.recoveryEnabled && this.TRACE_INIT("computeAllProdsFollows", () => {
        const i = gs(v(this.gastProductionsCache));
        this.resyncFollows = i;
      }), this.TRACE_INIT("ComputeLookaheadFunctions", () => {
        var i, r;
        (r = (i = this.lookaheadStrategy).initialize) === null || r === void 0 || r.call(i, {
          rules: v(this.gastProductionsCache)
        }), this.preComputeLookaheadFunctions(v(this.gastProductionsCache));
      })), !je.DEFER_DEFINITION_ERRORS_HANDLING && !O(this.definitionErrors))
        throw e = m(this.definitionErrors, (i) => i.message), new Error(`Parser Definition Errors detected:
 ${e.join(`
-------------------------------
`)}`);
    });
  }
  constructor(e, t) {
    this.definitionErrors = [], this.selfAnalysisDone = !1;
    const s = this;
    if (s.initErrorHandler(t), s.initLexerAdapter(), s.initLooksAhead(t), s.initRecognizerEngine(e, t), s.initRecoverable(t), s.initTreeBuilder(t), s.initContentAssist(), s.initGastRecorder(t), s.initPerformanceTracer(t), A(t, "ignoredIssues"))
      throw new Error(`The <ignoredIssues> IParserConfig property has been deprecated.
	Please use the <IGNORE_AMBIGUITIES> flag on the relevant DSL method instead.
	See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#IGNORING_AMBIGUITIES
	For further details.`);
    this.skipValidations = A(t, "skipValidations") ? t.skipValidations : de.skipValidations;
  }
}
je.DEFER_DEFINITION_ERRORS_HANDLING = !1;
gr(je, [
  Yi,
  Qi,
  cr,
  lr,
  ur,
  hr,
  dr,
  fr,
  mr,
  Tr
]);
class Ir extends je {
  constructor(e, t = de) {
    const s = b(t);
    s.outputCst = !0, super(e, s);
  }
}
export {
  Ir as C,
  j as L,
  Dn as c
};
//# sourceMappingURL=chevrotain-cBR36crC.js.map
