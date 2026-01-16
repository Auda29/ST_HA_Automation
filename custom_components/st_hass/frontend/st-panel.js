var _b = Object.defineProperty;
var Ob = (i, e, t) => e in i ? _b(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var E = (i, e, t) => Ob(i, typeof e != "symbol" ? e + "" : e, t);
let Ib = 0, Wa = class {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
};
class K {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = Ib++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    }), this.combine = e.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = it.match(e)), (t) => {
      let n = e(t);
      return n === void 0 ? null : [this, n];
    };
  }
}
K.closedBy = new K({ deserialize: (i) => i.split(" ") });
K.openedBy = new K({ deserialize: (i) => i.split(" ") });
K.group = new K({ deserialize: (i) => i.split(" ") });
K.isolate = new K({ deserialize: (i) => {
  if (i && i != "rtl" && i != "ltr" && i != "auto")
    throw new RangeError("Invalid value for isolate: " + i);
  return i || "auto";
} });
K.contextHash = new K({ perNode: !0 });
K.lookAhead = new K({ perNode: !0 });
K.mounted = new K({ perNode: !0 });
class Ns {
  constructor(e, t, n, s = !1) {
    this.tree = e, this.overlay = t, this.parser = n, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[K.mounted.id];
  }
}
const Rb = /* @__PURE__ */ Object.create(null);
class it {
  /**
  @internal
  */
  constructor(e, t, n, s = 0) {
    this.name = e, this.props = t, this.id = n, this.flags = s;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Rb, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new it(e.name || "", t, e.id, n);
    if (e.props) {
      for (let r of e.props)
        if (Array.isArray(r) || (r = r(s)), r) {
          if (r[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[r[0].id] = r[1];
        }
    }
    return s;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(e) {
    return this.props[e.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(K.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let n in e)
      for (let s of n.split(" "))
        t[s] = e[n];
    return (n) => {
      for (let s = n.prop(K.group), r = -1; r < (s ? s.length : 0); r++) {
        let o = t[r < 0 ? n.name : s[r]];
        if (o)
          return o;
      }
    };
  }
}
it.none = new it(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class Vh {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...e) {
    let t = [];
    for (let n of this.types) {
      let s = null;
      for (let r of e) {
        let o = r(n);
        if (o) {
          s || (s = Object.assign({}, n.props));
          let a = o[1], l = o[0];
          l.combine && l.id in s && (a = l.combine(s[l.id], a)), s[l.id] = a;
        }
      }
      t.push(s ? new it(n.name, s, n.id, n.flags) : n);
    }
    return new Vh(t);
  }
}
const Or = /* @__PURE__ */ new WeakMap(), iu = /* @__PURE__ */ new WeakMap();
var ge;
(function(i) {
  i[i.ExcludeBuffers = 1] = "ExcludeBuffers", i[i.IncludeAnonymous = 2] = "IncludeAnonymous", i[i.IgnoreMounts = 4] = "IgnoreMounts", i[i.IgnoreOverlays = 8] = "IgnoreOverlays", i[i.EnterBracketed = 16] = "EnterBracketed";
})(ge || (ge = {}));
class oe {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, n, s, r) {
    if (this.type = e, this.children = t, this.positions = n, this.length = s, this.props = null, r && r.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, a] of r)
        this.props[typeof o == "number" ? o : o.id] = a;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = Ns.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let n of this.children) {
      let s = n.toString();
      s && (t && (t += ","), t += s);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new Il(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, n = 0) {
    let s = Or.get(this) || this.topNode, r = new Il(s);
    return r.moveTo(e, t), Or.set(this, r._tree), r;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new Tt(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(e, t = 0) {
    let n = Hs(Or.get(this) || this.topNode, e, t, !1);
    return Or.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let n = Hs(iu.get(this) || this.topNode, e, t, !0);
    return iu.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return Lb(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: n, from: s = 0, to: r = this.length } = e, o = e.mode || 0, a = (o & ge.IncludeAnonymous) > 0;
    for (let l = this.cursor(o | ge.IncludeAnonymous); ; ) {
      let h = !1;
      if (l.from <= r && l.to >= s && (!a && l.type.isAnonymous || t(l) !== !1)) {
        if (l.firstChild())
          continue;
        h = !0;
      }
      for (; h && n && (a || !l.type.isAnonymous) && n(l), !l.nextSibling(); ) {
        if (!l.parent())
          return;
        h = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : Gh(it.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, n, s) => new oe(this.type, t, n, s, this.propValues), e.makeTree || ((t, n, s) => new oe(it.none, t, n, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Pb(e);
  }
}
oe.empty = new oe(it.none, [], [], 0);
class jh {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new jh(this.buffer, this.index);
  }
}
class Hi {
  /**
  Create a tree buffer.
  */
  constructor(e, t, n) {
    this.buffer = e, this.length = t, this.set = n;
  }
  /**
  @internal
  */
  get type() {
    return it.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let t = this.buffer[e], n = this.buffer[e + 3], s = this.set.types[t], r = s.name;
    if (/\W/.test(r) && !s.isError && (r = JSON.stringify(r)), e += 4, n == e)
      return r;
    let o = [];
    for (; e < n; )
      o.push(this.childString(e)), e = this.buffer[e + 3];
    return r + "(" + o.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, n, s, r) {
    let { buffer: o } = this, a = -1;
    for (let l = e; l != t && !(ep(r, s, o[l + 1], o[l + 2]) && (a = l, n > 0)); l = o[l + 3])
      ;
    return a;
  }
  /**
  @internal
  */
  slice(e, t, n) {
    let s = this.buffer, r = new Uint16Array(t - e), o = 0;
    for (let a = e, l = 0; a < t; ) {
      r[l++] = s[a++], r[l++] = s[a++] - n;
      let h = r[l++] = s[a++] - n;
      r[l++] = s[a++] - e, o = Math.max(o, h);
    }
    return new Hi(r, o, this.set);
  }
}
function ep(i, e, t, n) {
  switch (i) {
    case -2:
      return t < e;
    case -1:
      return n >= e && t < e;
    case 0:
      return t < e && n > e;
    case 1:
      return t <= e && n > e;
    case 2:
      return n > e;
    case 4:
      return !0;
  }
}
function Hs(i, e, t, n) {
  for (var s; i.from == i.to || (t < 1 ? i.from >= e : i.from > e) || (t > -1 ? i.to <= e : i.to < e); ) {
    let o = !n && i instanceof Tt && i.index < 0 ? null : i.parent;
    if (!o)
      return i;
    i = o;
  }
  let r = n ? 0 : ge.IgnoreOverlays;
  if (n)
    for (let o = i, a = o.parent; a; o = a, a = o.parent)
      o instanceof Tt && o.index < 0 && ((s = a.enter(e, t, r)) === null || s === void 0 ? void 0 : s.from) != o.from && (i = a);
  for (; ; ) {
    let o = i.enter(e, t, r);
    if (!o)
      return i;
    i = o;
  }
}
class tp {
  cursor(e = 0) {
    return new Il(this, e);
  }
  getChild(e, t = null, n = null) {
    let s = nu(this, e, t, n);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, n = null) {
    return nu(this, e, t, n);
  }
  resolve(e, t = 0) {
    return Hs(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return Hs(this, e, t, !0);
  }
  matchContext(e) {
    return Ol(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), n = this;
    for (; t; ) {
      let s = t.lastChild;
      if (!s || s.to != t.to)
        break;
      s.type.isError && s.from == s.to ? (n = t, t = s.prevSibling) : t = s;
    }
    return n;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class Tt extends tp {
  constructor(e, t, n, s) {
    super(), this._tree = e, this.from = t, this.index = n, this._parent = s;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, n, s, r = 0) {
    var o;
    for (let a = this; ; ) {
      for (let { children: l, positions: h } = a._tree, c = t > 0 ? l.length : -1; e != c; e += t) {
        let u = l[e], f = h[e] + a.from;
        if (!(!(r & ge.EnterBracketed && u instanceof oe && ((o = Ns.get(u)) === null || o === void 0 ? void 0 : o.overlay) === null && (f >= n || f + u.length <= n)) && !ep(s, n, f, f + u.length))) {
          if (u instanceof Hi) {
            if (r & ge.ExcludeBuffers)
              continue;
            let d = u.findChild(0, u.buffer.length, t, n - f, s);
            if (d > -1)
              return new Di(new Nb(a, u, e, f), null, d);
          } else if (r & ge.IncludeAnonymous || !u.type.isAnonymous || zh(u)) {
            let d;
            if (!(r & ge.IgnoreMounts) && (d = Ns.get(u)) && !d.overlay)
              return new Tt(d.tree, f, e, a);
            let p = new Tt(u, f, e, a);
            return r & ge.IncludeAnonymous || !p.type.isAnonymous ? p : p.nextChild(t < 0 ? u.children.length - 1 : 0, t, n, s, r);
          }
        }
      }
      if (r & ge.IncludeAnonymous || !a.type.isAnonymous || (a.index >= 0 ? e = a.index + t : e = t < 0 ? -1 : a._parent._tree.children.length, a = a._parent, !a))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.nextChild(
      0,
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this._tree.prop(e);
  }
  enter(e, t, n = 0) {
    let s;
    if (!(n & ge.IgnoreOverlays) && (s = Ns.get(this._tree)) && s.overlay) {
      let r = e - this.from, o = n & ge.EnterBracketed && s.bracketed;
      for (let { from: a, to: l } of s.overlay)
        if ((t > 0 || o ? a <= r : a < r) && (t < 0 || o ? l >= r : l > r))
          return new Tt(s.tree, s.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, n);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function nu(i, e, t, n) {
  let s = i.cursor(), r = [];
  if (!s.firstChild())
    return r;
  if (t != null) {
    for (let o = !1; !o; )
      if (o = s.type.is(t), !s.nextSibling())
        return r;
  }
  for (; ; ) {
    if (n != null && s.type.is(n))
      return r;
    if (s.type.is(e) && r.push(s.node), !s.nextSibling())
      return n == null ? r : [];
  }
}
function Ol(i, e, t = e.length - 1) {
  for (let n = i; t >= 0; n = n.parent) {
    if (!n)
      return !1;
    if (!n.type.isAnonymous) {
      if (e[t] && e[t] != n.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class Nb {
  constructor(e, t, n, s) {
    this.parent = e, this.buffer = t, this.index = n, this.start = s;
  }
}
class Di extends tp {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, n) {
    super(), this.context = e, this._parent = t, this.index = n, this.type = e.buffer.set.types[e.buffer.buffer[n]];
  }
  child(e, t, n) {
    let { buffer: s } = this.context, r = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.context.start, n);
    return r < 0 ? null : new Di(this.context, this, r);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.child(
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.child(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this.type.prop(e);
  }
  enter(e, t, n = 0) {
    if (n & ge.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, r = s.findChild(this.index + 4, s.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return r < 0 ? null : new Di(this.context, this, r);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + e,
      e,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new Di(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new Di(this.context, this._parent, e.findChild(
      t,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: n } = this.context, s = this.index + 4, r = n.buffer[this.index + 3];
    if (r > s) {
      let o = n.buffer[this.index + 1];
      e.push(n.slice(s, r, o)), t.push(0);
    }
    return new oe(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function ip(i) {
  if (!i.length)
    return null;
  let e = 0, t = i[0];
  for (let r = 1; r < i.length; r++) {
    let o = i[r];
    (o.from > t.from || o.to < t.to) && (t = o, e = r);
  }
  let n = t instanceof Tt && t.index < 0 ? null : t.parent, s = i.slice();
  return n ? s[e] = n : s.splice(e, 1), new Mb(s, t);
}
class Mb {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return ip(this.heads);
  }
}
function Lb(i, e, t) {
  let n = i.resolveInner(e, t), s = null;
  for (let r = n instanceof Tt ? n : n.context.parent; r; r = r.parent)
    if (r.index < 0) {
      let o = r.parent;
      (s || (s = [n])).push(o.resolve(e, t)), r = o;
    } else {
      let o = Ns.get(r.tree);
      if (o && o.overlay && o.overlay[0].from <= e && o.overlay[o.overlay.length - 1].to >= e) {
        let a = new Tt(o.tree, o.overlay[0].from + r.from, -1, r);
        (s || (s = [n])).push(Hs(a, e, t, !1));
      }
    }
  return s ? ip(s) : n;
}
class Il {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, t = 0) {
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~ge.EnterBracketed, e instanceof Tt)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let n = e._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: n, buffer: s } = this.buffer;
    return this.type = t || s.set.types[s.buffer[e]], this.from = n + s.buffer[e + 1], this.to = n + s.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof Tt ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(e, t, n) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, n, this.mode));
    let { buffer: s } = this.buffer, r = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.buffer.start, n);
    return r < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(r));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(e) {
    return this.enterChild(
      1,
      e,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(e) {
    return this.enterChild(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(e, t, n = this.mode) {
    return this.buffer ? n & ge.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & ge.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & ge.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, n = this.stack.length - 1;
    if (e < 0) {
      let s = n < 0 ? 0 : this.stack[n] + 4;
      if (this.index != s)
        return this.yieldBuf(t.findChild(
          s,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let s = t.buffer[this.index + 3];
      if (s < (n < 0 ? t.buffer.length : t.buffer[this.stack[n] + 3]))
        return this.yieldBuf(s);
    }
    return n < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, n, { buffer: s } = this;
    if (s) {
      if (e > 0) {
        if (this.index < s.buffer.buffer.length)
          return !1;
      } else
        for (let r = 0; r < this.index; r++)
          if (s.buffer.buffer[r + 3] < this.index)
            return !1;
      ({ index: t, parent: n } = s);
    } else
      ({ index: t, _parent: n } = this._tree);
    for (; n; { index: t, _parent: n } = n)
      if (t > -1)
        for (let r = t + e, o = e < 0 ? -1 : n._tree.children.length; r != o; r += e) {
          let a = n._tree.children[r];
          if (this.mode & ge.IncludeAnonymous || a instanceof Hi || !a.type.isAnonymous || zh(a))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(
      e,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(e = !0) {
    return this.move(1, e);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(e = !0) {
    return this.move(-1, e);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, n = 0;
    if (e && e.context == this.buffer)
      e: for (let s = this.index, r = this.stack.length; r >= 0; ) {
        for (let o = e; o; o = o._parent)
          if (o.index == s) {
            if (s == this.index)
              return o;
            t = o, n = r + 1;
            break e;
          }
        s = this.stack[--r];
      }
    for (let s = n; s < this.stack.length; s++)
      t = new Di(this.buffer, t, this.stack[s]);
    return this.bufferNode = new Di(this.buffer, t, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(e, t) {
    for (let n = 0; ; ) {
      let s = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          n++;
          continue;
        }
        this.type.isAnonymous || (s = !0);
      }
      for (; ; ) {
        if (s && t && t(this), s = this.type.isAnonymous, !n)
          return;
        if (this.nextSibling())
          break;
        this.parent(), n--, s = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(e) {
    if (!this.buffer)
      return Ol(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: n } = t.set;
    for (let s = e.length - 1, r = this.stack.length - 1; s >= 0; r--) {
      if (r < 0)
        return Ol(this._tree, e, s);
      let o = n[t.buffer[this.stack[r]]];
      if (!o.isAnonymous) {
        if (e[s] && e[s] != o.name)
          return !1;
        s--;
      }
    }
    return !0;
  }
}
function zh(i) {
  return i.children.some((e) => e instanceof Hi || !e.type.isAnonymous || zh(e));
}
function Pb(i) {
  var e;
  let { buffer: t, nodeSet: n, maxBufferLength: s = 1024, reused: r = [], minRepeatType: o = n.types.length } = i, a = Array.isArray(t) ? new jh(t, t.length) : t, l = n.types, h = 0, c = 0;
  function u(S, A, w, D, W, j) {
    let { id: F, start: M, end: Y, size: z } = a, q = c, de = h;
    if (z < 0)
      if (a.next(), z == -1) {
        let mt = r[F];
        w.push(mt), D.push(M - S);
        return;
      } else if (z == -3) {
        h = F;
        return;
      } else if (z == -4) {
        c = F;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${z}`);
    let be = l[F], ot, le, He = M - S;
    if (Y - M <= s && (le = g(a.pos - A, W))) {
      let mt = new Uint16Array(le.size - le.skip), Ye = a.pos - le.size, at = mt.length;
      for (; a.pos > Ye; )
        at = y(le.start, mt, at);
      ot = new Hi(mt, Y - le.start, n), He = le.start - S;
    } else {
      let mt = a.pos - z;
      a.next();
      let Ye = [], at = [], ve = F >= o ? F : -1, ui = 0, pe = Y;
      for (; a.pos > mt; )
        ve >= 0 && a.id == ve && a.size >= 0 ? (a.end <= pe - s && (p(Ye, at, M, ui, a.end, pe, ve, q, de), ui = Ye.length, pe = a.end), a.next()) : j > 2500 ? f(M, mt, Ye, at) : u(M, mt, Ye, at, ve, j + 1);
      if (ve >= 0 && ui > 0 && ui < Ye.length && p(Ye, at, M, ui, M, pe, ve, q, de), Ye.reverse(), at.reverse(), ve > -1 && ui > 0) {
        let Ve = d(be, de);
        ot = Gh(be, Ye, at, 0, Ye.length, 0, Y - M, Ve, Ve);
      } else
        ot = m(be, Ye, at, Y - M, q - Y, de);
    }
    w.push(ot), D.push(He);
  }
  function f(S, A, w, D) {
    let W = [], j = 0, F = -1;
    for (; a.pos > A; ) {
      let { id: M, start: Y, end: z, size: q } = a;
      if (q > 4)
        a.next();
      else {
        if (F > -1 && Y < F)
          break;
        F < 0 && (F = z - s), W.push(M, Y, z), j++, a.next();
      }
    }
    if (j) {
      let M = new Uint16Array(j * 4), Y = W[W.length - 2];
      for (let z = W.length - 3, q = 0; z >= 0; z -= 3)
        M[q++] = W[z], M[q++] = W[z + 1] - Y, M[q++] = W[z + 2] - Y, M[q++] = q;
      w.push(new Hi(M, W[2] - Y, n)), D.push(Y - S);
    }
  }
  function d(S, A) {
    return (w, D, W) => {
      let j = 0, F = w.length - 1, M, Y;
      if (F >= 0 && (M = w[F]) instanceof oe) {
        if (!F && M.type == S && M.length == W)
          return M;
        (Y = M.prop(K.lookAhead)) && (j = D[F] + M.length + Y);
      }
      return m(S, w, D, W, j, A);
    };
  }
  function p(S, A, w, D, W, j, F, M, Y) {
    let z = [], q = [];
    for (; S.length > D; )
      z.push(S.pop()), q.push(A.pop() + w - W);
    S.push(m(n.types[F], z, q, j - W, M - j, Y)), A.push(W - w);
  }
  function m(S, A, w, D, W, j, F) {
    if (j) {
      let M = [K.contextHash, j];
      F = F ? [M].concat(F) : [M];
    }
    if (W > 25) {
      let M = [K.lookAhead, W];
      F = F ? [M].concat(F) : [M];
    }
    return new oe(S, A, w, D, F);
  }
  function g(S, A) {
    let w = a.fork(), D = 0, W = 0, j = 0, F = w.end - s, M = { size: 0, start: 0, skip: 0 };
    e: for (let Y = w.pos - S; w.pos > Y; ) {
      let z = w.size;
      if (w.id == A && z >= 0) {
        M.size = D, M.start = W, M.skip = j, j += 4, D += 4, w.next();
        continue;
      }
      let q = w.pos - z;
      if (z < 0 || q < Y || w.start < F)
        break;
      let de = w.id >= o ? 4 : 0, be = w.start;
      for (w.next(); w.pos > q; ) {
        if (w.size < 0)
          if (w.size == -3 || w.size == -4)
            de += 4;
          else
            break e;
        else w.id >= o && (de += 4);
        w.next();
      }
      W = be, D += z, j += de;
    }
    return (A < 0 || D == S) && (M.size = D, M.start = W, M.skip = j), M.size > 4 ? M : void 0;
  }
  function y(S, A, w) {
    let { id: D, start: W, end: j, size: F } = a;
    if (a.next(), F >= 0 && D < o) {
      let M = w;
      if (F > 4) {
        let Y = a.pos - (F - 4);
        for (; a.pos > Y; )
          w = y(S, A, w);
      }
      A[--w] = M, A[--w] = j - S, A[--w] = W - S, A[--w] = D;
    } else F == -3 ? h = D : F == -4 && (c = D);
    return w;
  }
  let b = [], v = [];
  for (; a.pos > 0; )
    u(i.start || 0, i.bufferStart || 0, b, v, -1, 0);
  let T = (e = i.length) !== null && e !== void 0 ? e : b.length ? v[0] + b[0].length : 0;
  return new oe(l[i.topID], b.reverse(), v.reverse(), T);
}
const su = /* @__PURE__ */ new WeakMap();
function no(i, e) {
  if (!i.isAnonymous || e instanceof Hi || e.type != i)
    return 1;
  let t = su.get(e);
  if (t == null) {
    t = 1;
    for (let n of e.children) {
      if (n.type != i || !(n instanceof oe)) {
        t = 1;
        break;
      }
      t += no(i, n);
    }
    su.set(e, t);
  }
  return t;
}
function Gh(i, e, t, n, s, r, o, a, l) {
  let h = 0;
  for (let p = n; p < s; p++)
    h += no(i, e[p]);
  let c = Math.ceil(
    h * 1.5 / 8
    /* Balance.BranchFactor */
  ), u = [], f = [];
  function d(p, m, g, y, b) {
    for (let v = g; v < y; ) {
      let T = v, S = m[v], A = no(i, p[v]);
      for (v++; v < y; v++) {
        let w = no(i, p[v]);
        if (A + w >= c)
          break;
        A += w;
      }
      if (v == T + 1) {
        if (A > c) {
          let w = p[T];
          d(w.children, w.positions, 0, w.children.length, m[T] + b);
          continue;
        }
        u.push(p[T]);
      } else {
        let w = m[v - 1] + p[v - 1].length - S;
        u.push(Gh(i, p, m, T, v, S, w, null, l));
      }
      f.push(S + b - r);
    }
  }
  return d(e, t, n, s, 0), (a || l)(u, f, o);
}
class dn {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, n, s, r = !1, o = !1) {
    this.from = e, this.to = t, this.tree = n, this.offset = s, this.open = (r ? 1 : 0) | (o ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(e, t = [], n = !1) {
    let s = [new dn(0, e.length, e, 0, !1, n)];
    for (let r of t)
      r.to > e.length && s.push(r);
    return s;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, n = 128) {
    if (!t.length)
      return e;
    let s = [], r = 1, o = e.length ? e[0] : null;
    for (let a = 0, l = 0, h = 0; ; a++) {
      let c = a < t.length ? t[a] : null, u = c ? c.fromA : 1e9;
      if (u - l >= n)
        for (; o && o.from < u; ) {
          let f = o;
          if (l >= f.from || u <= f.to || h) {
            let d = Math.max(f.from, l) - h, p = Math.min(f.to, u) - h;
            f = d >= p ? null : new dn(d, p, f.tree, f.offset + h, a > 0, !!c);
          }
          if (f && s.push(f), o.to > u)
            break;
          o = r < e.length ? e[r++] : null;
        }
      if (!c)
        break;
      l = c.toA, h = c.toA - c.toB;
    }
    return s;
  }
}
let np = class {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, n) {
    return typeof e == "string" && (e = new Db(e)), n = n ? n.length ? n.map((s) => new Wa(s.from, s.to)) : [new Wa(0, 0)] : [new Wa(0, e.length)], this.createParse(e, t || [], n);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, n) {
    let s = this.startParse(e, t, n);
    for (; ; ) {
      let r = s.advance();
      if (r)
        return r;
    }
  }
};
class Db {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
new K({ perNode: !0 });
let Rl = [], sp = [];
(() => {
  let i = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < i.length; e++)
    (e % 2 ? sp : Rl).push(t = t + i[e]);
})();
function $b(i) {
  if (i < 768) return !1;
  for (let e = 0, t = Rl.length; ; ) {
    let n = e + t >> 1;
    if (i < Rl[n]) t = n;
    else if (i >= sp[n]) e = n + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function ru(i) {
  return i >= 127462 && i <= 127487;
}
const ou = 8205;
function Bb(i, e, t = !0, n = !0) {
  return (t ? rp : Ub)(i, e, n);
}
function rp(i, e, t) {
  if (e == i.length) return e;
  e && op(i.charCodeAt(e)) && ap(i.charCodeAt(e - 1)) && e--;
  let n = Ha(i, e);
  for (e += au(n); e < i.length; ) {
    let s = Ha(i, e);
    if (n == ou || s == ou || t && $b(s))
      e += au(s), n = s;
    else if (ru(s)) {
      let r = 0, o = e - 2;
      for (; o >= 0 && ru(Ha(i, o)); )
        r++, o -= 2;
      if (r % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Ub(i, e, t) {
  for (; e > 0; ) {
    let n = rp(i, e - 2, t);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function Ha(i, e) {
  let t = i.charCodeAt(e);
  if (!ap(t) || e + 1 == i.length) return t;
  let n = i.charCodeAt(e + 1);
  return op(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function op(i) {
  return i >= 56320 && i < 57344;
}
function ap(i) {
  return i >= 55296 && i < 56320;
}
function au(i) {
  return i < 65536 ? 1 : 2;
}
class J {
  /**
  Get the line description around the given position.
  */
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(e, t, n) {
    [e, t] = Xn(this, e, t);
    let s = [];
    return this.decompose(
      0,
      e,
      s,
      2
      /* Open.To */
    ), n.length && n.decompose(
      0,
      n.length,
      s,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      s,
      1
      /* Open.From */
    ), Jt.from(s, this.length - (t - e) + n.length);
  }
  /**
  Append another document to this one.
  */
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(e, t = this.length) {
    [e, t] = Xn(this, e, t);
    let n = [];
    return this.decompose(e, t, n, 0), Jt.from(n, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), n = this.length - this.scanIdentical(e, -1), s = new Ms(this), r = new Ms(e);
    for (let o = t, a = t; ; ) {
      if (s.next(o), r.next(o), o = 0, s.lineBreak != r.lineBreak || s.done != r.done || s.value != r.value)
        return !1;
      if (a += s.value.length, s.done || a >= n)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new Ms(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new lp(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let n;
    if (e == null)
      n = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let s = this.line(e).from;
      n = this.iterRange(s, Math.max(s, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new hp(n);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? J.empty : e.length <= 32 ? new me(e) : Jt.from(me.split(e, []));
  }
}
class me extends J {
  constructor(e, t = Fb(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, n, s) {
    for (let r = 0; ; r++) {
      let o = this.text[r], a = s + o.length;
      if ((t ? n : a) >= e)
        return new Wb(s, a, n, o);
      s = a + 1, n++;
    }
  }
  decompose(e, t, n, s) {
    let r = e <= 0 && t >= this.length ? this : new me(lu(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let o = n.pop(), a = so(r.text, o.text.slice(), 0, r.length);
      if (a.length <= 32)
        n.push(new me(a, o.length + r.length));
      else {
        let l = a.length >> 1;
        n.push(new me(a.slice(0, l)), new me(a.slice(l)));
      }
    } else
      n.push(r);
  }
  replace(e, t, n) {
    if (!(n instanceof me))
      return super.replace(e, t, n);
    [e, t] = Xn(this, e, t);
    let s = so(this.text, so(n.text, lu(this.text, 0, e)), t), r = this.length + n.length - (t - e);
    return s.length <= 32 ? new me(s, r) : Jt.from(me.split(s, []), r);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = Xn(this, e, t);
    let s = "";
    for (let r = 0, o = 0; r <= t && o < this.text.length; o++) {
      let a = this.text[o], l = r + a.length;
      r > e && o && (s += n), e < l && t > r && (s += a.slice(Math.max(0, e - r), t - r)), r = l + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let n = [], s = -1;
    for (let r of e)
      n.push(r), s += r.length + 1, n.length == 32 && (t.push(new me(n, s)), n = [], s = -1);
    return s > -1 && t.push(new me(n, s)), t;
  }
}
class Jt extends J {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let n of e)
      this.lines += n.lines;
  }
  lineInner(e, t, n, s) {
    for (let r = 0; ; r++) {
      let o = this.children[r], a = s + o.length, l = n + o.lines - 1;
      if ((t ? l : a) >= e)
        return o.lineInner(e, t, n, s);
      s = a + 1, n = l + 1;
    }
  }
  decompose(e, t, n, s) {
    for (let r = 0, o = 0; o <= t && r < this.children.length; r++) {
      let a = this.children[r], l = o + a.length;
      if (e <= l && t >= o) {
        let h = s & ((o <= e ? 1 : 0) | (l >= t ? 2 : 0));
        o >= e && l <= t && !h ? n.push(a) : a.decompose(e - o, t - o, n, h);
      }
      o = l + 1;
    }
  }
  replace(e, t, n) {
    if ([e, t] = Xn(this, e, t), n.lines < this.lines)
      for (let s = 0, r = 0; s < this.children.length; s++) {
        let o = this.children[s], a = r + o.length;
        if (e >= r && t <= a) {
          let l = o.replace(e - r, t - r, n), h = this.lines - o.lines + l.lines;
          if (l.lines < h >> 4 && l.lines > h >> 6) {
            let c = this.children.slice();
            return c[s] = l, new Jt(c, this.length - (t - e) + n.length);
          }
          return super.replace(r, a, l);
        }
        r = a + 1;
      }
    return super.replace(e, t, n);
  }
  sliceString(e, t = this.length, n = `
`) {
    [e, t] = Xn(this, e, t);
    let s = "";
    for (let r = 0, o = 0; r < this.children.length && o <= t; r++) {
      let a = this.children[r], l = o + a.length;
      o > e && r && (s += n), e < l && t > o && (s += a.sliceString(e - o, t - o, n)), o = l + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof Jt))
      return 0;
    let n = 0, [s, r, o, a] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; s += t, r += t) {
      if (s == o || r == a)
        return n;
      let l = this.children[s], h = e.children[r];
      if (l != h)
        return n + l.scanIdentical(h, t);
      n += l.length + 1;
    }
  }
  static from(e, t = e.reduce((n, s) => n + s.length + 1, -1)) {
    let n = 0;
    for (let d of e)
      n += d.lines;
    if (n < 32) {
      let d = [];
      for (let p of e)
        p.flatten(d);
      return new me(d, t);
    }
    let s = Math.max(
      32,
      n >> 5
      /* Tree.BranchShift */
    ), r = s << 1, o = s >> 1, a = [], l = 0, h = -1, c = [];
    function u(d) {
      let p;
      if (d.lines > r && d instanceof Jt)
        for (let m of d.children)
          u(m);
      else d.lines > o && (l > o || !l) ? (f(), a.push(d)) : d instanceof me && l && (p = c[c.length - 1]) instanceof me && d.lines + p.lines <= 32 ? (l += d.lines, h += d.length + 1, c[c.length - 1] = new me(p.text.concat(d.text), p.length + 1 + d.length)) : (l + d.lines > s && f(), l += d.lines, h += d.length + 1, c.push(d));
    }
    function f() {
      l != 0 && (a.push(c.length == 1 ? c[0] : Jt.from(c, h)), h = -1, l = c.length = 0);
    }
    for (let d of e)
      u(d);
    return f(), a.length == 1 ? a[0] : new Jt(a, t);
  }
}
J.empty = /* @__PURE__ */ new me([""], 0);
function Fb(i) {
  let e = -1;
  for (let t of i)
    e += t.length + 1;
  return e;
}
function so(i, e, t = 0, n = 1e9) {
  for (let s = 0, r = 0, o = !0; r < i.length && s <= n; r++) {
    let a = i[r], l = s + a.length;
    l >= t && (l > n && (a = a.slice(0, n - s)), s < t && (a = a.slice(t - s)), o ? (e[e.length - 1] += a, o = !1) : e.push(a)), s = l + 1;
  }
  return e;
}
function lu(i, e, t) {
  return so(i, [""], e, t);
}
class Ms {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof me ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let n = this.nodes.length - 1, s = this.nodes[n], r = this.offsets[n], o = r >> 1, a = s instanceof me ? s.text.length : s.children.length;
      if (o == (t > 0 ? a : 0)) {
        if (n == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[n - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((r & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[n] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof me) {
        let l = s.text[o + (t < 0 ? -1 : 0)];
        if (this.offsets[n] += t, l.length > Math.max(0, e))
          return this.value = e == 0 ? l : t > 0 ? l.slice(e) : l.slice(0, l.length - e), this;
        e -= l.length;
      } else {
        let l = s.children[o + (t < 0 ? -1 : 0)];
        e > l.length ? (e -= l.length, this.offsets[n] += t) : (t < 0 && this.offsets[n]--, this.nodes.push(l), this.offsets.push(t > 0 ? 1 : (l instanceof me ? l.text.length : l.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class lp {
  constructor(e, t, n) {
    this.value = "", this.done = !1, this.cursor = new Ms(e, t > n ? -1 : 1), this.pos = t > n ? e.length : 0, this.from = Math.min(t, n), this.to = Math.max(t, n);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let n = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > n && (e = n), n -= e;
    let { value: s } = this.cursor.next(e);
    return this.pos += (s.length + e) * t, this.value = s.length <= n ? s : t < 0 ? s.slice(s.length - n) : s.slice(0, n), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class hp {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: n, value: s } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : n ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = s, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (J.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Ms.prototype[Symbol.iterator] = lp.prototype[Symbol.iterator] = hp.prototype[Symbol.iterator] = function() {
  return this;
});
class Wb {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.number = n, this.text = s;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
function Xn(i, e, t) {
  return e = Math.max(0, Math.min(i.length, e)), [e, Math.max(e, Math.min(i.length, t))];
}
function Ae(i, e, t = !0, n = !0) {
  return Bb(i, e, t, n);
}
function Hb(i) {
  return i >= 56320 && i < 57344;
}
function Vb(i) {
  return i >= 55296 && i < 56320;
}
function Xe(i, e) {
  let t = i.charCodeAt(e);
  if (!Vb(t) || e + 1 == i.length)
    return t;
  let n = i.charCodeAt(e + 1);
  return Hb(n) ? (t - 55296 << 10) + (n - 56320) + 65536 : t;
}
function Kh(i) {
  return i <= 65535 ? String.fromCharCode(i) : (i -= 65536, String.fromCharCode((i >> 10) + 55296, (i & 1023) + 56320));
}
function Qt(i) {
  return i < 65536 ? 1 : 2;
}
const Nl = /\r\n?|\n/;
var Qe = /* @__PURE__ */ function(i) {
  return i[i.Simple = 0] = "Simple", i[i.TrackDel = 1] = "TrackDel", i[i.TrackBefore = 2] = "TrackBefore", i[i.TrackAfter = 3] = "TrackAfter", i;
}(Qe || (Qe = {}));
class ii {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(e) {
    this.sections = e;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let n = this.sections[t + 1];
      e += n < 0 ? this.sections[t] : n;
    }
    return e;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(e) {
    for (let t = 0, n = 0, s = 0; t < this.sections.length; ) {
      let r = this.sections[t++], o = this.sections[t++];
      o < 0 ? (e(n, s, r), s += r) : s += o, n += r;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(e, t = !1) {
    Ml(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let n = this.sections[t++], s = this.sections[t++];
      s < 0 ? e.push(n, s) : e.push(s, n);
    }
    return new ii(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : cp(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Ll(this, e, t);
  }
  mapPos(e, t = -1, n = Qe.Simple) {
    let s = 0, r = 0;
    for (let o = 0; o < this.sections.length; ) {
      let a = this.sections[o++], l = this.sections[o++], h = s + a;
      if (l < 0) {
        if (h > e)
          return r + (e - s);
        r += a;
      } else {
        if (n != Qe.Simple && h >= e && (n == Qe.TrackDel && s < e && h > e || n == Qe.TrackBefore && s < e || n == Qe.TrackAfter && h > e))
          return null;
        if (h > e || h == e && t < 0 && !a)
          return e == s || t < 0 ? r : r + l;
        r += l;
      }
      s = h;
    }
    if (e > s)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${s}`);
    return r;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(e, t = e) {
    for (let n = 0, s = 0; n < this.sections.length && s <= t; ) {
      let r = this.sections[n++], o = this.sections[n++], a = s + r;
      if (o >= 0 && s <= t && a >= e)
        return s < e && a > t ? "cover" : !0;
      s = a;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let n = this.sections[t++], s = this.sections[t++];
      e += (e ? " " : "") + n + (s >= 0 ? ":" + s : "");
    }
    return e;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new ii(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new ii(e);
  }
}
class xe extends ii {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Ml(this, (t, n, s, r, o) => e = e.replace(s, s + (n - t), o), !1), e;
  }
  mapDesc(e, t = !1) {
    return Ll(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), n = [];
    for (let s = 0, r = 0; s < t.length; s += 2) {
      let o = t[s], a = t[s + 1];
      if (a >= 0) {
        t[s] = a, t[s + 1] = o;
        let l = s >> 1;
        for (; n.length < l; )
          n.push(J.empty);
        n.push(o ? e.slice(r, r + o) : J.empty);
      }
      r += o;
    }
    return new xe(t, n);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : cp(this, e, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(e, t = !1) {
    return e.empty ? this : Ll(this, e, t, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(e, t = !1) {
    Ml(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return ii.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], n = [], s = [], r = new Vs(this);
    e: for (let o = 0, a = 0; ; ) {
      let l = o == e.length ? 1e9 : e[o++];
      for (; a < l || a == l && r.len == 0; ) {
        if (r.done)
          break e;
        let c = Math.min(r.len, l - a);
        $e(s, c, -1);
        let u = r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0;
        $e(t, c, u), u > 0 && $i(n, t, r.text), r.forward(c), a += c;
      }
      let h = e[o++];
      for (; a < h; ) {
        if (r.done)
          break e;
        let c = Math.min(r.len, h - a);
        $e(t, c, -1), $e(s, c, r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0), r.forward(c), a += c;
      }
    }
    return {
      changes: new xe(t, n),
      filtered: ii.create(s)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let n = this.sections[t], s = this.sections[t + 1];
      s < 0 ? e.push(n) : s == 0 ? e.push([n]) : e.push([n].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, n) {
    let s = [], r = [], o = 0, a = null;
    function l(c = !1) {
      if (!c && !s.length)
        return;
      o < t && $e(s, t - o, -1);
      let u = new xe(s, r);
      a = a ? a.compose(u.map(a)) : u, s = [], r = [], o = 0;
    }
    function h(c) {
      if (Array.isArray(c))
        for (let u of c)
          h(u);
      else if (c instanceof xe) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        l(), a = a ? a.compose(c.map(a)) : c;
      } else {
        let { from: u, to: f = u, insert: d } = c;
        if (u > f || u < 0 || f > t)
          throw new RangeError(`Invalid change range ${u} to ${f} (in doc of length ${t})`);
        let p = d ? typeof d == "string" ? J.of(d.split(n || Nl)) : d : J.empty, m = p.length;
        if (u == f && m == 0)
          return;
        u < o && l(), u > o && $e(s, u - o, -1), $e(s, f - u, m), $i(r, s, p), o = f;
      }
    }
    return h(e), l(!a), a;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new xe(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], n = [];
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (typeof r == "number")
        t.push(r, -1);
      else {
        if (!Array.isArray(r) || typeof r[0] != "number" || r.some((o, a) => a && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (r.length == 1)
          t.push(r[0], 0);
        else {
          for (; n.length < s; )
            n.push(J.empty);
          n[s] = J.of(r.slice(1)), t.push(r[0], n[s].length);
        }
      }
    }
    return new xe(t, n);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new xe(e, t);
  }
}
function $e(i, e, t, n = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = i.length - 2;
  s >= 0 && t <= 0 && t == i[s + 1] ? i[s] += e : s >= 0 && e == 0 && i[s] == 0 ? i[s + 1] += t : n ? (i[s] += e, i[s + 1] += t) : i.push(e, t);
}
function $i(i, e, t) {
  if (t.length == 0)
    return;
  let n = e.length - 2 >> 1;
  if (n < i.length)
    i[i.length - 1] = i[i.length - 1].append(t);
  else {
    for (; i.length < n; )
      i.push(J.empty);
    i.push(t);
  }
}
function Ml(i, e, t) {
  let n = i.inserted;
  for (let s = 0, r = 0, o = 0; o < i.sections.length; ) {
    let a = i.sections[o++], l = i.sections[o++];
    if (l < 0)
      s += a, r += a;
    else {
      let h = s, c = r, u = J.empty;
      for (; h += a, c += l, l && n && (u = u.append(n[o - 2 >> 1])), !(t || o == i.sections.length || i.sections[o + 1] < 0); )
        a = i.sections[o++], l = i.sections[o++];
      e(s, h, r, c, u), s = h, r = c;
    }
  }
}
function Ll(i, e, t, n = !1) {
  let s = [], r = n ? [] : null, o = new Vs(i), a = new Vs(e);
  for (let l = -1; ; ) {
    if (o.done && a.len || a.done && o.len)
      throw new Error("Mismatched change set lengths");
    if (o.ins == -1 && a.ins == -1) {
      let h = Math.min(o.len, a.len);
      $e(s, h, -1), o.forward(h), a.forward(h);
    } else if (a.ins >= 0 && (o.ins < 0 || l == o.i || o.off == 0 && (a.len < o.len || a.len == o.len && !t))) {
      let h = a.len;
      for ($e(s, a.ins, -1); h; ) {
        let c = Math.min(o.len, h);
        o.ins >= 0 && l < o.i && o.len <= c && ($e(s, 0, o.ins), r && $i(r, s, o.text), l = o.i), o.forward(c), h -= c;
      }
      a.next();
    } else if (o.ins >= 0) {
      let h = 0, c = o.len;
      for (; c; )
        if (a.ins == -1) {
          let u = Math.min(c, a.len);
          h += u, c -= u, a.forward(u);
        } else if (a.ins == 0 && a.len < c)
          c -= a.len, a.next();
        else
          break;
      $e(s, h, l < o.i ? o.ins : 0), r && l < o.i && $i(r, s, o.text), l = o.i, o.forward(o.len - c);
    } else {
      if (o.done && a.done)
        return r ? xe.createSet(s, r) : ii.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function cp(i, e, t = !1) {
  let n = [], s = t ? [] : null, r = new Vs(i), o = new Vs(e);
  for (let a = !1; ; ) {
    if (r.done && o.done)
      return s ? xe.createSet(n, s) : ii.create(n);
    if (r.ins == 0)
      $e(n, r.len, 0, a), r.next();
    else if (o.len == 0 && !o.done)
      $e(n, 0, o.ins, a), s && $i(s, n, o.text), o.next();
    else {
      if (r.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let l = Math.min(r.len2, o.len), h = n.length;
        if (r.ins == -1) {
          let c = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          $e(n, l, c, a), s && c && $i(s, n, o.text);
        } else o.ins == -1 ? ($e(n, r.off ? 0 : r.len, l, a), s && $i(s, n, r.textBit(l))) : ($e(n, r.off ? 0 : r.len, o.off ? 0 : o.ins, a), s && !o.off && $i(s, n, o.text));
        a = (r.ins > l || o.ins >= 0 && o.len > l) && (a || n.length > h), r.forward2(l), o.forward(l);
      }
    }
  }
}
class Vs {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? J.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, n = this.i - 2 >> 1;
    return n >= t.length && !e ? J.empty : t[n].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class ln {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.flags = n;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let e = this.flags & 7;
    return e == 7 ? null : e;
  }
  /**
  The goal column (stored vertical offset) associated with a
  cursor. This is used to preserve the vertical position when
  [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
  lines of different length.
  */
  get goalColumn() {
    let e = this.flags >> 6;
    return e == 16777215 ? void 0 : e;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(e, t = -1) {
    let n, s;
    return this.empty ? n = s = e.mapPos(this.from, t) : (n = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), n == this.from && s == this.to ? this : new ln(n, s, this.flags);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e) {
    if (e <= this.anchor && t >= this.anchor)
      return x.range(e, t);
    let n = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return x.range(this.anchor, n);
  }
  /**
  Compare this range to another range.
  */
  eq(e, t = !1) {
    return this.anchor == e.anchor && this.head == e.head && (!t || !this.empty || this.assoc == e.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return x.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new ln(e, t, n);
  }
}
class x {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : x.create(this.ranges.map((n) => n.map(e, t)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(e, t = !1) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let n = 0; n < this.ranges.length; n++)
      if (!this.ranges[n].eq(e.ranges[n], t))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new x([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return x.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let n = this.ranges.slice();
    return n[t] = e, x.create(n, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new x(e.ranges.map((t) => ln.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new x([x.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let n = 0, s = 0; s < e.length; s++) {
      let r = e[s];
      if (r.empty ? r.from <= n : r.from < n)
        return x.normalized(e.slice(), t);
      n = r.to;
    }
    return new x(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, n, s) {
    return ln.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (n == null ? 7 : Math.min(6, n)) | (s ?? 16777215) << 6);
  }
  /**
  Create a selection range.
  */
  static range(e, t, n, s) {
    let r = (n ?? 16777215) << 6 | (s == null ? 7 : Math.min(6, s));
    return t < e ? ln.create(t, e, 48 | r) : ln.create(e, t, (t > e ? 8 : 0) | r);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let n = e[t];
    e.sort((s, r) => s.from - r.from), t = e.indexOf(n);
    for (let s = 1; s < e.length; s++) {
      let r = e[s], o = e[s - 1];
      if (r.empty ? r.from <= o.to : r.from < o.to) {
        let a = o.from, l = Math.max(r.to, o.to);
        s <= t && t--, e.splice(--s, 2, r.anchor > r.head ? x.range(l, a) : x.range(a, l));
      }
    }
    return new x(e, t);
  }
}
function up(i, e) {
  for (let t of i.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let qh = 0;
class _ {
  constructor(e, t, n, s, r) {
    this.combine = e, this.compareInput = t, this.compare = n, this.isStatic = s, this.id = qh++, this.default = e([]), this.extensions = typeof r == "function" ? r(this) : r;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(e = {}) {
    return new _(e.combine || ((t) => t), e.compareInput || ((t, n) => t === n), e.compare || (e.combine ? (t, n) => t === n : Yh), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new ro([], this, 0, e);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new ro(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new ro(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (n) => n), this.compute([e], (n) => t(n.field(e)));
  }
}
function Yh(i, e) {
  return i == e || i.length == e.length && i.every((t, n) => t === e[n]);
}
class ro {
  constructor(e, t, n, s) {
    this.dependencies = e, this.facet = t, this.type = n, this.value = s, this.id = qh++;
  }
  dynamicSlot(e) {
    var t;
    let n = this.value, s = this.facet.compareInput, r = this.id, o = e[r] >> 1, a = this.type == 2, l = !1, h = !1, c = [];
    for (let u of this.dependencies)
      u == "doc" ? l = !0 : u == "selection" ? h = !0 : ((t = e[u.id]) !== null && t !== void 0 ? t : 1) & 1 || c.push(e[u.id]);
    return {
      create(u) {
        return u.values[o] = n(u), 1;
      },
      update(u, f) {
        if (l && f.docChanged || h && (f.docChanged || f.selection) || Pl(u, c)) {
          let d = n(u);
          if (a ? !hu(d, u.values[o], s) : !s(d, u.values[o]))
            return u.values[o] = d, 1;
        }
        return 0;
      },
      reconfigure: (u, f) => {
        let d, p = f.config.address[r];
        if (p != null) {
          let m = Ao(f, p);
          if (this.dependencies.every((g) => g instanceof _ ? f.facet(g) === u.facet(g) : g instanceof Ke ? f.field(g, !1) == u.field(g, !1) : !0) || (a ? hu(d = n(u), m, s) : s(d = n(u), m)))
            return u.values[o] = m, 0;
        } else
          d = n(u);
        return u.values[o] = d, 1;
      }
    };
  }
}
function hu(i, e, t) {
  if (i.length != e.length)
    return !1;
  for (let n = 0; n < i.length; n++)
    if (!t(i[n], e[n]))
      return !1;
  return !0;
}
function Pl(i, e) {
  let t = !1;
  for (let n of e)
    Ls(i, n) & 1 && (t = !0);
  return t;
}
function jb(i, e, t) {
  let n = t.map((l) => i[l.id]), s = t.map((l) => l.type), r = n.filter((l) => !(l & 1)), o = i[e.id] >> 1;
  function a(l) {
    let h = [];
    for (let c = 0; c < n.length; c++) {
      let u = Ao(l, n[c]);
      if (s[c] == 2)
        for (let f of u)
          h.push(f);
      else
        h.push(u);
    }
    return e.combine(h);
  }
  return {
    create(l) {
      for (let h of n)
        Ls(l, h);
      return l.values[o] = a(l), 1;
    },
    update(l, h) {
      if (!Pl(l, r))
        return 0;
      let c = a(l);
      return e.compare(c, l.values[o]) ? 0 : (l.values[o] = c, 1);
    },
    reconfigure(l, h) {
      let c = Pl(l, n), u = h.config.facets[e.id], f = h.facet(e);
      if (u && !c && Yh(t, u))
        return l.values[o] = f, 0;
      let d = a(l);
      return e.compare(d, f) ? (l.values[o] = f, 0) : (l.values[o] = d, 1);
    }
  };
}
const Ir = /* @__PURE__ */ _.define({ static: !0 });
class Ke {
  constructor(e, t, n, s, r) {
    this.id = e, this.createF = t, this.updateF = n, this.compareF = s, this.spec = r, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new Ke(qh++, e.create, e.update, e.compare || ((n, s) => n === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Ir).find((n) => n.field == this);
    return ((t == null ? void 0 : t.create) || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (n) => (n.values[t] = this.create(n), 1),
      update: (n, s) => {
        let r = n.values[t], o = this.updateF(r, s);
        return this.compareF(r, o) ? 0 : (n.values[t] = o, 1);
      },
      reconfigure: (n, s) => {
        let r = n.facet(Ir), o = s.facet(Ir), a;
        return (a = r.find((l) => l.field == this)) && a != o.find((l) => l.field == this) ? (n.values[t] = a.create(n), 1) : s.config.address[this.id] != null ? (n.values[t] = s.field(this), 0) : (n.values[t] = this.create(n), 1);
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, Ir.of({ field: this, create: e })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const an = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function ms(i) {
  return (e) => new fp(e, i);
}
const kn = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ ms(an.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ ms(an.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ ms(an.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ ms(an.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ ms(an.lowest)
};
class fp {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
}
class cr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new Dl(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return cr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class Dl {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
}
class Eo {
  constructor(e, t, n, s, r, o) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = n, this.address = s, this.staticValues = r, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < n.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, n) {
    let s = [], r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let f of zb(e, t, o))
      f instanceof Ke ? s.push(f) : (r[f.facet.id] || (r[f.facet.id] = [])).push(f);
    let a = /* @__PURE__ */ Object.create(null), l = [], h = [];
    for (let f of s)
      a[f.id] = h.length << 1, h.push((d) => f.slot(d));
    let c = n == null ? void 0 : n.config.facets;
    for (let f in r) {
      let d = r[f], p = d[0].facet, m = c && c[f] || [];
      if (d.every(
        (g) => g.type == 0
        /* Provider.Static */
      ))
        if (a[p.id] = l.length << 1 | 1, Yh(m, d))
          l.push(n.facet(p));
        else {
          let g = p.combine(d.map((y) => y.value));
          l.push(n && p.compare(g, n.facet(p)) ? n.facet(p) : g);
        }
      else {
        for (let g of d)
          g.type == 0 ? (a[g.id] = l.length << 1 | 1, l.push(g.value)) : (a[g.id] = h.length << 1, h.push((y) => g.dynamicSlot(y)));
        a[p.id] = h.length << 1, h.push((g) => jb(g, p, d));
      }
    }
    let u = h.map((f) => f(a));
    return new Eo(e, o, u, a, l, r);
  }
}
function zb(i, e, t) {
  let n = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function r(o, a) {
    let l = s.get(o);
    if (l != null) {
      if (l <= a)
        return;
      let h = n[l].indexOf(o);
      h > -1 && n[l].splice(h, 1), o instanceof Dl && t.delete(o.compartment);
    }
    if (s.set(o, a), Array.isArray(o))
      for (let h of o)
        r(h, a);
    else if (o instanceof Dl) {
      if (t.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let h = e.get(o.compartment) || o.inner;
      t.set(o.compartment, h), r(h, a);
    } else if (o instanceof fp)
      r(o.inner, o.prec);
    else if (o instanceof Ke)
      n[a].push(o), o.provides && r(o.provides, a);
    else if (o instanceof ro)
      n[a].push(o), o.facet.extensions && r(o.facet.extensions, an.default);
    else {
      let h = o.extension;
      if (!h)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      r(h, a);
    }
  }
  return r(i, an.default), n.reduce((o, a) => o.concat(a));
}
function Ls(i, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, n = i.status[t];
  if (n == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (n & 2)
    return n;
  i.status[t] = 4;
  let s = i.computeSlot(i, i.config.dynamicSlots[t]);
  return i.status[t] = 2 | s;
}
function Ao(i, e) {
  return e & 1 ? i.config.staticValues[e >> 1] : i.values[e >> 1];
}
const dp = /* @__PURE__ */ _.define(), $l = /* @__PURE__ */ _.define({
  combine: (i) => i.some((e) => e),
  static: !0
}), pp = /* @__PURE__ */ _.define({
  combine: (i) => i.length ? i[0] : void 0,
  static: !0
}), mp = /* @__PURE__ */ _.define(), gp = /* @__PURE__ */ _.define(), yp = /* @__PURE__ */ _.define(), bp = /* @__PURE__ */ _.define({
  combine: (i) => i.length ? i[0] : !1
});
class wi {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new Gb();
  }
}
class Gb {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new wi(this, e);
  }
}
class Kb {
  /**
  @internal
  */
  constructor(e) {
    this.map = e;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(e) {
    return new V(this, e);
  }
}
class V {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new V(this.type, t);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(e) {
    return this.type == e;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(e = {}) {
    return new Kb(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let n = [];
    for (let s of e) {
      let r = s.map(t);
      r && n.push(r);
    }
    return n;
  }
}
V.reconfigure = /* @__PURE__ */ V.define();
V.appendConfig = /* @__PURE__ */ V.define();
class we {
  constructor(e, t, n, s, r, o) {
    this.startState = e, this.changes = t, this.selection = n, this.effects = s, this.annotations = r, this.scrollIntoView = o, this._doc = null, this._state = null, n && up(n, t.newLength), r.some((a) => a.type == we.time) || (this.annotations = r.concat(we.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, n, s, r, o) {
    return new we(e, t, n, s, r, o);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(e) {
    let t = this.annotation(we.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
we.time = /* @__PURE__ */ wi.define();
we.userEvent = /* @__PURE__ */ wi.define();
we.addToHistory = /* @__PURE__ */ wi.define();
we.remote = /* @__PURE__ */ wi.define();
function qb(i, e) {
  let t = [];
  for (let n = 0, s = 0; ; ) {
    let r, o;
    if (n < i.length && (s == e.length || e[s] >= i[n]))
      r = i[n++], o = i[n++];
    else if (s < e.length)
      r = e[s++], o = e[s++];
    else
      return t;
    !t.length || t[t.length - 1] < r ? t.push(r, o) : t[t.length - 1] < o && (t[t.length - 1] = o);
  }
}
function vp(i, e, t) {
  var n;
  let s, r, o;
  return t ? (s = e.changes, r = xe.empty(e.changes.length), o = i.changes.compose(e.changes)) : (s = e.changes.map(i.changes), r = i.changes.mapDesc(e.changes, !0), o = i.changes.compose(s)), {
    changes: o,
    selection: e.selection ? e.selection.map(r) : (n = i.selection) === null || n === void 0 ? void 0 : n.map(s),
    effects: V.mapEffects(i.effects, s).concat(V.mapEffects(e.effects, r)),
    annotations: i.annotations.length ? i.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: i.scrollIntoView || e.scrollIntoView
  };
}
function Bl(i, e, t) {
  let n = e.selection, s = Vn(e.annotations);
  return e.userEvent && (s = s.concat(we.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof xe ? e.changes : xe.of(e.changes || [], t, i.facet(pp)),
    selection: n && (n instanceof x ? n : x.single(n.anchor, n.head)),
    effects: Vn(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function Sp(i, e, t) {
  let n = Bl(i, e.length ? e[0] : {}, i.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let r = 1; r < e.length; r++) {
    e[r].filter === !1 && (t = !1);
    let o = !!e[r].sequential;
    n = vp(n, Bl(i, e[r], o ? n.changes.newLength : i.doc.length), o);
  }
  let s = we.create(i, n.changes, n.selection, n.effects, n.annotations, n.scrollIntoView);
  return Xb(t ? Yb(s) : s);
}
function Yb(i) {
  let e = i.startState, t = !0;
  for (let s of e.facet(mp)) {
    let r = s(i);
    if (r === !1) {
      t = !1;
      break;
    }
    Array.isArray(r) && (t = t === !0 ? r : qb(t, r));
  }
  if (t !== !0) {
    let s, r;
    if (t === !1)
      r = i.changes.invertedDesc, s = xe.empty(e.doc.length);
    else {
      let o = i.changes.filter(t);
      s = o.changes, r = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    i = we.create(e, s, i.selection && i.selection.map(r), V.mapEffects(i.effects, r), i.annotations, i.scrollIntoView);
  }
  let n = e.facet(gp);
  for (let s = n.length - 1; s >= 0; s--) {
    let r = n[s](i);
    r instanceof we ? i = r : Array.isArray(r) && r.length == 1 && r[0] instanceof we ? i = r[0] : i = Sp(e, Vn(r), !1);
  }
  return i;
}
function Xb(i) {
  let e = i.startState, t = e.facet(yp), n = i;
  for (let s = t.length - 1; s >= 0; s--) {
    let r = t[s](i);
    r && Object.keys(r).length && (n = vp(n, Bl(e, r, i.changes.newLength), !0));
  }
  return n == i ? i : we.create(e, i.changes, i.selection, n.effects, n.annotations, n.scrollIntoView);
}
const Jb = [];
function Vn(i) {
  return i == null ? Jb : Array.isArray(i) ? i : [i];
}
var ae = /* @__PURE__ */ function(i) {
  return i[i.Word = 0] = "Word", i[i.Space = 1] = "Space", i[i.Other = 2] = "Other", i;
}(ae || (ae = {}));
const Qb = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Ul;
try {
  Ul = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Zb(i) {
  if (Ul)
    return Ul.test(i);
  for (let e = 0; e < i.length; e++) {
    let t = i[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || Qb.test(t)))
      return !0;
  }
  return !1;
}
function ev(i) {
  return (e) => {
    if (!/\S/.test(e))
      return ae.Space;
    if (Zb(e))
      return ae.Word;
    for (let t = 0; t < i.length; t++)
      if (e.indexOf(i[t]) > -1)
        return ae.Word;
    return ae.Other;
  };
}
class G {
  constructor(e, t, n, s, r, o) {
    this.config = e, this.doc = t, this.selection = n, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = r, o && (o._state = this);
    for (let a = 0; a < this.config.dynamicSlots.length; a++)
      Ls(this, a << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let n = this.config.address[e.id];
    if (n == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Ls(this, n), Ao(this, n);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...e) {
    return Sp(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: n, compartments: s } = t;
    for (let a of e.effects)
      a.is(cr.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((l, h) => s.set(h, l)), t = null), s.set(a.value.compartment, a.value.extension)) : a.is(V.reconfigure) ? (t = null, n = a.value) : a.is(V.appendConfig) && (t = null, n = Vn(n).concat(a.value));
    let r;
    t ? r = e.startState.values.slice() : (t = Eo.resolve(n, s, this), r = new G(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (l, h) => h.reconfigure(l, this), null).values);
    let o = e.startState.facet($l) ? e.newSelection : e.newSelection.asSingle();
    new G(t, e.newDoc, o, r, (a, l) => l.update(a, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: x.cursor(t.from + e.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(e) {
    let t = this.selection, n = e(t.ranges[0]), s = this.changes(n.changes), r = [n.range], o = Vn(n.effects);
    for (let a = 1; a < t.ranges.length; a++) {
      let l = e(t.ranges[a]), h = this.changes(l.changes), c = h.map(s);
      for (let f = 0; f < a; f++)
        r[f] = r[f].map(c);
      let u = s.mapDesc(h, !0);
      r.push(l.range.map(u)), s = s.compose(c), o = V.mapEffects(o, c).concat(V.mapEffects(Vn(l.effects), u));
    }
    return {
      changes: s,
      selection: x.create(r, t.mainIndex),
      effects: o
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof xe ? e : xe.of(e, this.doc.length, this.facet(G.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return J.of(e.split(this.facet(G.lineSeparator) || Nl));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (Ls(this, t), Ao(this, t));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let n in e) {
        let s = e[n];
        s instanceof Ke && this.config.address[s.id] != null && (t[n] = s.spec.toJSON(this.field(e[n]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, n) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let s = [];
    if (n) {
      for (let r in n)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
          let o = n[r], a = e[r];
          s.push(o.init((l) => o.spec.fromJSON(a, l)));
        }
    }
    return G.create({
      doc: e.doc,
      selection: x.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Eo.resolve(e.extensions || [], /* @__PURE__ */ new Map()), n = e.doc instanceof J ? e.doc : J.of((e.doc || "").split(t.staticFacet(G.lineSeparator) || Nl)), s = e.selection ? e.selection instanceof x ? e.selection : x.single(e.selection.anchor, e.selection.head) : x.single(0);
    return up(s, n.length), t.staticFacet($l) || (s = s.asSingle()), new G(t, n, s, t.dynamicSlots.map(() => null), (r, o) => o.create(r), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(G.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(G.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(bp);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(e, ...t) {
    for (let n of this.facet(G.phrases))
      if (Object.prototype.hasOwnProperty.call(n, e)) {
        e = n[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (n, s) => {
      if (s == "$")
        return "$";
      let r = +(s || 1);
      return !r || r > t.length ? n : t[r - 1];
    })), e;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(e, t, n = -1) {
    let s = [];
    for (let r of this.facet(dp))
      for (let o of r(this, t, n))
        Object.prototype.hasOwnProperty.call(o, e) && s.push(o[e]);
    return s;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(e) {
    let t = this.languageDataAt("wordChars", e);
    return ev(t.length ? t[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: n, length: s } = this.doc.lineAt(e), r = this.charCategorizer(e), o = e - n, a = e - n;
    for (; o > 0; ) {
      let l = Ae(t, o, !1);
      if (r(t.slice(l, o)) != ae.Word)
        break;
      o = l;
    }
    for (; a < s; ) {
      let l = Ae(t, a);
      if (r(t.slice(a, l)) != ae.Word)
        break;
      a = l;
    }
    return o == a ? null : x.range(o + n, a + n);
  }
}
G.allowMultipleSelections = $l;
G.tabSize = /* @__PURE__ */ _.define({
  combine: (i) => i.length ? i[0] : 4
});
G.lineSeparator = pp;
G.readOnly = bp;
G.phrases = /* @__PURE__ */ _.define({
  compare(i, e) {
    let t = Object.keys(i), n = Object.keys(e);
    return t.length == n.length && t.every((s) => i[s] == e[s]);
  }
});
G.languageData = dp;
G.changeFilter = mp;
G.transactionFilter = gp;
G.transactionExtender = yp;
cr.reconfigure = /* @__PURE__ */ V.define();
function Ci(i, e, t = {}) {
  let n = {};
  for (let s of i)
    for (let r of Object.keys(s)) {
      let o = s[r], a = n[r];
      if (a === void 0)
        n[r] = o;
      else if (!(a === o || o === void 0)) if (Object.hasOwnProperty.call(t, r))
        n[r] = t[r](a, o);
      else
        throw new Error("Config merge conflict for field " + r);
    }
  for (let s in e)
    n[s] === void 0 && (n[s] = e[s]);
  return n;
}
class Vi {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(e) {
    return this == e;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(e, t = e) {
    return Fl.create(e, t, this);
  }
}
Vi.prototype.startSide = Vi.prototype.endSide = 0;
Vi.prototype.point = !1;
Vi.prototype.mapMode = Qe.TrackDel;
function Xh(i, e) {
  return i == e || i.constructor == e.constructor && i.eq(e);
}
let Fl = class Tp {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.value = n;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new Tp(e, t, n);
  }
};
function Wl(i, e) {
  return i.from - e.from || i.value.startSide - e.value.startSide;
}
class Jh {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.value = n, this.maxPoint = s;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, n, s = 0) {
    let r = n ? this.to : this.from;
    for (let o = s, a = r.length; ; ) {
      if (o == a)
        return o;
      let l = o + a >> 1, h = r[l] - e || (n ? this.value[l].endSide : this.value[l].startSide) - t;
      if (l == o)
        return h >= 0 ? o : a;
      h >= 0 ? a = l : o = l + 1;
    }
  }
  between(e, t, n, s) {
    for (let r = this.findIndex(t, -1e9, !0), o = this.findIndex(n, 1e9, !1, r); r < o; r++)
      if (s(this.from[r] + e, this.to[r] + e, this.value[r]) === !1)
        return !1;
  }
  map(e, t) {
    let n = [], s = [], r = [], o = -1, a = -1;
    for (let l = 0; l < this.value.length; l++) {
      let h = this.value[l], c = this.from[l] + e, u = this.to[l] + e, f, d;
      if (c == u) {
        let p = t.mapPos(c, h.startSide, h.mapMode);
        if (p == null || (f = d = p, h.startSide != h.endSide && (d = t.mapPos(c, h.endSide), d < f)))
          continue;
      } else if (f = t.mapPos(c, h.startSide), d = t.mapPos(u, h.endSide), f > d || f == d && h.startSide > 0 && h.endSide <= 0)
        continue;
      (d - f || h.endSide - h.startSide) < 0 || (o < 0 && (o = f), h.point && (a = Math.max(a, d - f)), n.push(h), s.push(f - o), r.push(d - o));
    }
    return { mapped: n.length ? new Jh(s, r, n, a) : null, pos: o };
  }
}
class H {
  constructor(e, t, n, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = n, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, n, s) {
    return new H(e, t, n, s);
  }
  /**
  @internal
  */
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  /**
  @internal
  */
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(e) {
    let { add: t = [], sort: n = !1, filterFrom: s = 0, filterTo: r = this.length } = e, o = e.filter;
    if (t.length == 0 && !o)
      return this;
    if (n && (t = t.slice().sort(Wl)), this.isEmpty)
      return t.length ? H.of(t) : this;
    let a = new xp(this, null, -1).goto(0), l = 0, h = [], c = new ji();
    for (; a.value || l < t.length; )
      if (l < t.length && (a.from - t[l].from || a.startSide - t[l].value.startSide) >= 0) {
        let u = t[l++];
        c.addInner(u.from, u.to, u.value) || h.push(u);
      } else a.rangeIndex == 1 && a.chunkIndex < this.chunk.length && (l == t.length || this.chunkEnd(a.chunkIndex) < t[l].from) && (!o || s > this.chunkEnd(a.chunkIndex) || r < this.chunkPos[a.chunkIndex]) && c.addChunk(this.chunkPos[a.chunkIndex], this.chunk[a.chunkIndex]) ? a.nextChunk() : ((!o || s > a.to || r < a.from || o(a.from, a.to, a.value)) && (c.addInner(a.from, a.to, a.value) || h.push(Fl.create(a.from, a.to, a.value))), a.next());
    return c.finishInner(this.nextLayer.isEmpty && !h.length ? H.empty : this.nextLayer.update({ add: h, filter: o, filterFrom: s, filterTo: r }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], n = [], s = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let a = this.chunkPos[o], l = this.chunk[o], h = e.touchesRange(a, a + l.length);
      if (h === !1)
        s = Math.max(s, l.maxPoint), t.push(l), n.push(e.mapPos(a));
      else if (h === !0) {
        let { mapped: c, pos: u } = l.map(a, e);
        c && (s = Math.max(s, c.maxPoint), t.push(c), n.push(u));
      }
    }
    let r = this.nextLayer.map(e);
    return t.length == 0 ? r : new H(n, t, r || H.empty, s);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, n) {
    if (!this.isEmpty) {
      for (let s = 0; s < this.chunk.length; s++) {
        let r = this.chunkPos[s], o = this.chunk[s];
        if (t >= r && e <= r + o.length && o.between(r, e - r, t - r, n) === !1)
          return;
      }
      this.nextLayer.between(e, t, n);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return js.from([this]).goto(e);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(e, t = 0) {
    return js.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, n, s, r = -1) {
    let o = e.filter((u) => u.maxPoint > 0 || !u.isEmpty && u.maxPoint >= r), a = t.filter((u) => u.maxPoint > 0 || !u.isEmpty && u.maxPoint >= r), l = cu(o, a, n), h = new gs(o, l, r), c = new gs(a, l, r);
    n.iterGaps((u, f, d) => uu(h, u, c, f, d, s)), n.empty && n.length == 0 && uu(h, 0, c, 0, 0, s);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, n = 0, s) {
    s == null && (s = 999999999);
    let r = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), o = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (r.length != o.length)
      return !1;
    if (!r.length)
      return !0;
    let a = cu(r, o), l = new gs(r, a, 0).goto(n), h = new gs(o, a, 0).goto(n);
    for (; ; ) {
      if (l.to != h.to || !Hl(l.active, h.active) || l.point && (!h.point || !Xh(l.point, h.point)))
        return !1;
      if (l.to > s)
        return !0;
      l.next(), h.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(e, t, n, s, r = -1) {
    let o = new gs(e, null, r).goto(t), a = t, l = o.openStart;
    for (; ; ) {
      let h = Math.min(o.to, n);
      if (o.point) {
        let c = o.activeForPoint(o.to), u = o.pointFrom < t ? c.length + 1 : o.point.startSide < 0 ? c.length : Math.min(c.length, l);
        s.point(a, h, o.point, c, u, o.pointRank), l = Math.min(o.openEnd(h), c.length);
      } else h > a && (s.span(a, h, o.active, l), l = o.openEnd(h));
      if (o.to > n)
        return l + (o.point && o.to > n ? 1 : 0);
      a = o.to, o.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(e, t = !1) {
    let n = new ji();
    for (let s of e instanceof Fl ? [e] : t ? tv(e) : e)
      n.add(s.from, s.to, s.value);
    return n.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return H.empty;
    let t = e[e.length - 1];
    for (let n = e.length - 2; n >= 0; n--)
      for (let s = e[n]; s != H.empty; s = s.nextLayer)
        t = new H(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
H.empty = /* @__PURE__ */ new H([], [], null, -1);
function tv(i) {
  if (i.length > 1)
    for (let e = i[0], t = 1; t < i.length; t++) {
      let n = i[t];
      if (Wl(e, n) > 0)
        return i.slice().sort(Wl);
      e = n;
    }
  return i;
}
H.empty.nextLayer = H.empty;
class ji {
  finishChunk(e) {
    this.chunks.push(new Jh(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(e, t, n) {
    this.addInner(e, t, n) || (this.nextLayer || (this.nextLayer = new ji())).add(e, t, n);
  }
  /**
  @internal
  */
  addInner(e, t, n) {
    let s = e - this.lastTo || n.startSide - this.last.endSide;
    if (s <= 0 && (e - this.lastFrom || n.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return s < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = n, this.lastFrom = e, this.lastTo = t, this.value.push(n), n.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let n = t.value.length - 1;
    return this.last = t.value[n], this.lastFrom = t.from[n] + e, this.lastTo = t.to[n] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(H.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = H.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function cu(i, e, t) {
  let n = /* @__PURE__ */ new Map();
  for (let r of i)
    for (let o = 0; o < r.chunk.length; o++)
      r.chunk[o].maxPoint <= 0 && n.set(r.chunk[o], r.chunkPos[o]);
  let s = /* @__PURE__ */ new Set();
  for (let r of e)
    for (let o = 0; o < r.chunk.length; o++) {
      let a = n.get(r.chunk[o]);
      a != null && (t ? t.mapPos(a) : a) == r.chunkPos[o] && !(t != null && t.touchesRange(a, a + r.chunk[o].length)) && s.add(r.chunk[o]);
    }
  return s;
}
class xp {
  constructor(e, t, n, s = 0) {
    this.layer = e, this.skip = t, this.minPoint = n, this.rank = s;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, n) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let s = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(s) || this.layer.chunkEnd(this.chunkIndex) < e || s.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, n = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let s = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!n || this.rangeIndex < s) && this.setRangeIndex(s);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], n = e + t.from[this.rangeIndex];
        if (this.from = n, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class js {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, n = -1) {
    let s = [];
    for (let r = 0; r < e.length; r++)
      for (let o = e[r]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= n && s.push(new xp(o, t, n, r));
    return s.length == 1 ? s[0] : new js(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let n of this.heap)
      n.goto(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Va(this.heap, n);
    return this.next(), this;
  }
  forward(e, t) {
    for (let n of this.heap)
      n.forward(e, t);
    for (let n = this.heap.length >> 1; n >= 0; n--)
      Va(this.heap, n);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Va(this.heap, 0);
    }
  }
}
function Va(i, e) {
  for (let t = i[e]; ; ) {
    let n = (e << 1) + 1;
    if (n >= i.length)
      break;
    let s = i[n];
    if (n + 1 < i.length && s.compare(i[n + 1]) >= 0 && (s = i[n + 1], n++), t.compare(s) < 0)
      break;
    i[n] = t, i[e] = s, e = n;
  }
}
class gs {
  constructor(e, t, n) {
    this.minPoint = n, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = js.from(e, t, n);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    Rr(this.active, e), Rr(this.activeTo, e), Rr(this.activeRank, e), this.minActive = fu(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: n, to: s, rank: r } = this.cursor;
    for (; t < this.activeRank.length && (r - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    Nr(this.active, t, n), Nr(this.activeTo, t, s), Nr(this.activeRank, t, r), e && Nr(e, t, this.cursor.from), this.minActive = fu(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let n = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let s = this.minActive;
      if (s > -1 && (this.activeTo[s] - this.cursor.from || this.active[s].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[s] > e) {
          this.to = this.activeTo[s], this.endSide = this.active[s].endSide;
          break;
        }
        this.removeActive(s), n && Rr(n, s);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let r = this.cursor.value;
          if (!r.point)
            this.addActive(n), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = r, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = r.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (n) {
      this.openStart = 0;
      for (let s = n.length - 1; s >= 0 && n[s] < e; s--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let n = this.active.length - 1; n >= 0 && !(this.activeRank[n] < this.pointRank); n--)
      (this.activeTo[n] > e || this.activeTo[n] == e && this.active[n].endSide >= this.point.endSide) && t.push(this.active[n]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let n = this.activeTo.length - 1; n >= 0 && this.activeTo[n] > e; n--)
      t++;
    return t;
  }
}
function uu(i, e, t, n, s, r) {
  i.goto(e), t.goto(n);
  let o = n + s, a = n, l = n - e, h = !!r.boundChange;
  for (let c = !1; ; ) {
    let u = i.to + l - t.to, f = u || i.endSide - t.endSide, d = f < 0 ? i.to + l : t.to, p = Math.min(d, o);
    if (i.point || t.point ? (i.point && t.point && Xh(i.point, t.point) && Hl(i.activeForPoint(i.to), t.activeForPoint(t.to)) || r.comparePoint(a, p, i.point, t.point), c = !1) : (c && r.boundChange(a), p > a && !Hl(i.active, t.active) && r.compareRange(a, p, i.active, t.active), h && p < o && (u || i.openEnd(d) != t.openEnd(d)) && (c = !0)), d > o)
      break;
    a = d, f <= 0 && i.next(), f >= 0 && t.next();
  }
}
function Hl(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (i[t] != e[t] && !Xh(i[t], e[t]))
      return !1;
  return !0;
}
function Rr(i, e) {
  for (let t = e, n = i.length - 1; t < n; t++)
    i[t] = i[t + 1];
  i.pop();
}
function Nr(i, e, t) {
  for (let n = i.length - 1; n >= e; n--)
    i[n + 1] = i[n];
  i[e] = t;
}
function fu(i, e) {
  let t = -1, n = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - n || i[s].endSide - i[t].endSide) < 0 && (t = s, n = e[s]);
  return t;
}
function ur(i, e, t = i.length) {
  let n = 0;
  for (let s = 0; s < t && s < i.length; )
    i.charCodeAt(s) == 9 ? (n += e - n % e, s++) : (n++, s = Ae(i, s));
  return n;
}
function iv(i, e, t, n) {
  for (let s = 0, r = 0; ; ) {
    if (r >= e)
      return s;
    if (s == i.length)
      break;
    r += i.charCodeAt(s) == 9 ? t - r % t : 1, s = Ae(i, s);
  }
  return i.length;
}
const Vl = "ͼ", du = typeof Symbol > "u" ? "__" + Vl : Symbol.for(Vl), jl = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), pu = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class zi {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: n } = t || {};
    function s(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function r(o, a, l, h) {
      let c = [], u = /^@(\w+)\b/.exec(o[0]), f = u && u[1] == "keyframes";
      if (u && a == null) return l.push(o[0] + ";");
      for (let d in a) {
        let p = a[d];
        if (/&/.test(d))
          r(
            d.split(/,\s*/).map((m) => o.map((g) => m.replace(/&/, g))).reduce((m, g) => m.concat(g)),
            p,
            l
          );
        else if (p && typeof p == "object") {
          if (!u) throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          r(s(d), p, c, f);
        } else p != null && c.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ": " + p + ";");
      }
      (c.length || f) && l.push((n && !u && !h ? o.map(n) : o).join(", ") + " {" + c.join(" ") + "}");
    }
    for (let o in e) r(s(o), e[o], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let e = pu[du] || 1;
    return pu[du] = e + 1, Vl + e.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(e, t, n) {
    let s = e[jl], r = n && n.nonce;
    s ? r && s.setNonce(r) : s = new nv(e, r), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let mu = /* @__PURE__ */ new Map();
class nv {
  constructor(e, t) {
    let n = e.ownerDocument || e, s = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let r = mu.get(n);
      if (r) return e[jl] = r;
      this.sheet = new s.CSSStyleSheet(), mu.set(n, this);
    } else
      this.styleTag = n.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[jl] = this;
  }
  mount(e, t) {
    let n = this.sheet, s = 0, r = 0;
    for (let o = 0; o < e.length; o++) {
      let a = e[o], l = this.modules.indexOf(a);
      if (l < r && l > -1 && (this.modules.splice(l, 1), r--, l = -1), l == -1) {
        if (this.modules.splice(r++, 0, a), n) for (let h = 0; h < a.rules.length; h++)
          n.insertRule(a.rules[h], s++);
      } else {
        for (; r < l; ) s += this.modules[r++].rules.length;
        s += a.rules.length, r++;
      }
    }
    if (n)
      t.adoptedStyleSheets.indexOf(this.sheet) < 0 && (t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
    else {
      let o = "";
      for (let l = 0; l < this.modules.length; l++)
        o += this.modules[l].getRules() + `
`;
      this.styleTag.textContent = o;
      let a = t.head || t;
      this.styleTag.parentNode != a && a.insertBefore(this.styleTag, a.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var Gi = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, zs = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, sv = typeof navigator < "u" && /Mac/.test(navigator.platform), rv = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var Ne = 0; Ne < 10; Ne++) Gi[48 + Ne] = Gi[96 + Ne] = String(Ne);
for (var Ne = 1; Ne <= 24; Ne++) Gi[Ne + 111] = "F" + Ne;
for (var Ne = 65; Ne <= 90; Ne++)
  Gi[Ne] = String.fromCharCode(Ne + 32), zs[Ne] = String.fromCharCode(Ne);
for (var ja in Gi) zs.hasOwnProperty(ja) || (zs[ja] = Gi[ja]);
function ov(i) {
  var e = sv && i.metaKey && i.shiftKey && !i.ctrlKey && !i.altKey || rv && i.shiftKey && i.key && i.key.length == 1 || i.key == "Unidentified", t = !e && i.key || (i.shiftKey ? zs : Gi)[i.keyCode] || i.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function ke() {
  var i = arguments[0];
  typeof i == "string" && (i = document.createElement(i));
  var e = 1, t = arguments[1];
  if (t && typeof t == "object" && t.nodeType == null && !Array.isArray(t)) {
    for (var n in t) if (Object.prototype.hasOwnProperty.call(t, n)) {
      var s = t[n];
      typeof s == "string" ? i.setAttribute(n, s) : s != null && (i[n] = s);
    }
    e++;
  }
  for (; e < arguments.length; e++) Ep(i, arguments[e]);
  return i;
}
function Ep(i, e) {
  if (typeof e == "string")
    i.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    i.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) Ep(i, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let je = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, zl = typeof document < "u" ? document : { documentElement: { style: {} } };
const Gl = /* @__PURE__ */ /Edge\/(\d+)/.exec(je.userAgent), Ap = /* @__PURE__ */ /MSIE \d/.test(je.userAgent), Kl = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(je.userAgent), oa = !!(Ap || Kl || Gl), gu = !oa && /* @__PURE__ */ /gecko\/(\d+)/i.test(je.userAgent), za = !oa && /* @__PURE__ */ /Chrome\/(\d+)/.exec(je.userAgent), av = "webkitFontSmoothing" in zl.documentElement.style, ql = !oa && /* @__PURE__ */ /Apple Computer/.test(je.vendor), yu = ql && (/* @__PURE__ */ /Mobile\/\w+/.test(je.userAgent) || je.maxTouchPoints > 2);
var k = {
  mac: yu || /* @__PURE__ */ /Mac/.test(je.platform),
  windows: /* @__PURE__ */ /Win/.test(je.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(je.platform),
  ie: oa,
  ie_version: Ap ? zl.documentMode || 6 : Kl ? +Kl[1] : Gl ? +Gl[1] : 0,
  gecko: gu,
  gecko_version: gu ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(je.userAgent) || [0, 0])[1] : 0,
  chrome: !!za,
  chrome_version: za ? +za[1] : 0,
  ios: yu,
  android: /* @__PURE__ */ /Android\b/.test(je.userAgent),
  webkit_version: av ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(je.userAgent) || [0, 0])[1] : 0,
  safari: ql,
  safari_version: ql ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(je.userAgent) || [0, 0])[1] : 0,
  tabSize: zl.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function Qh(i, e) {
  for (let t in i)
    t == "class" && e.class ? e.class += " " + i.class : t == "style" && e.style ? e.style += ";" + i.style : e[t] = i[t];
  return e;
}
const wo = /* @__PURE__ */ Object.create(null);
function Zh(i, e, t) {
  if (i == e)
    return !0;
  i || (i = wo), e || (e = wo);
  let n = Object.keys(i), s = Object.keys(e);
  if (n.length - 0 != s.length - 0)
    return !1;
  for (let r of n)
    if (r != t && (s.indexOf(r) == -1 || i[r] !== e[r]))
      return !1;
  return !0;
}
function lv(i, e) {
  for (let t = i.attributes.length - 1; t >= 0; t--) {
    let n = i.attributes[t].name;
    e[n] == null && i.removeAttribute(n);
  }
  for (let t in e) {
    let n = e[t];
    t == "style" ? i.style.cssText = n : i.getAttribute(t) != n && i.setAttribute(t, n);
  }
}
function bu(i, e, t) {
  let n = !1;
  if (e)
    for (let s in e)
      t && s in t || (n = !0, s == "style" ? i.style.cssText = "" : i.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (n = !0, s == "style" ? i.style.cssText = t[s] : i.setAttribute(s, t[s]));
  return n;
}
function hv(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < i.attributes.length; t++) {
    let n = i.attributes[t];
    e[n.name] = n.value;
  }
  return e;
}
class ki {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(e) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(e, t) {
    return !1;
  }
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(e) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(e, t, n) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(e) {
  }
}
var Le = /* @__PURE__ */ function(i) {
  return i[i.Text = 0] = "Text", i[i.WidgetBefore = 1] = "WidgetBefore", i[i.WidgetAfter = 2] = "WidgetAfter", i[i.WidgetRange = 3] = "WidgetRange", i;
}(Le || (Le = {}));
class B extends Vi {
  constructor(e, t, n, s) {
    super(), this.startSide = e, this.endSide = t, this.widget = n, this.spec = s;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(e) {
    return new fr(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), n = !!e.block;
    return t += n && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new gn(e, t, t, n, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, n, s;
    if (e.isBlockGap)
      n = -5e8, s = 4e8;
    else {
      let { start: r, end: o } = wp(e, t);
      n = (r ? t ? -3e8 : -1 : 5e8) - 1, s = (o ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new gn(e, n, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new dr(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return H.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
B.none = H.empty;
class fr extends B {
  constructor(e) {
    let { start: t, end: n } = wp(e);
    super(t ? -1 : 5e8, n ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? Qh(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || wo;
  }
  eq(e) {
    return this == e || e instanceof fr && this.tagName == e.tagName && Zh(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
fr.prototype.point = !1;
class dr extends B {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof dr && this.spec.class == e.spec.class && Zh(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
dr.prototype.mapMode = Qe.TrackBefore;
dr.prototype.point = !0;
class gn extends B {
  constructor(e, t, n, s, r, o) {
    super(t, n, r, e), this.block = s, this.isReplace = o, this.mapMode = s ? t <= 0 ? Qe.TrackBefore : Qe.TrackAfter : Qe.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? Le.WidgetRange : this.startSide <= 0 ? Le.WidgetBefore : Le.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof gn && cv(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
gn.prototype.point = !0;
function wp(i, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: n } = i;
  return t == null && (t = i.inclusive), n == null && (n = i.inclusive), { start: t ?? e, end: n ?? e };
}
function cv(i, e) {
  return i == e || !!(i && e && i.compare(e));
}
function jn(i, e, t, n = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + n >= i ? t[s] = Math.max(t[s], e) : t.push(i, e);
}
class Gs extends Vi {
  constructor(e, t) {
    super(), this.tagName = e, this.attributes = t;
  }
  eq(e) {
    return e == this || e instanceof Gs && this.tagName == e.tagName && Zh(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Gs(e.tagName, e.attributes || wo);
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return H.of(e, t);
  }
}
Gs.prototype.startSide = Gs.prototype.endSide = -1;
function Ks(i) {
  let e;
  return i.nodeType == 11 ? e = i.getSelection ? i : i.ownerDocument : e = i, e.getSelection();
}
function Yl(i, e) {
  return e ? i == e || i.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function oo(i, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Yl(i, e.anchorNode);
  } catch {
    return !1;
  }
}
function ao(i) {
  return i.nodeType == 3 ? qs(i, 0, i.nodeValue.length).getClientRects() : i.nodeType == 1 ? i.getClientRects() : [];
}
function Ps(i, e, t, n) {
  return t ? vu(i, e, t, n, -1) || vu(i, e, t, n, 1) : !1;
}
function Ki(i) {
  for (var e = 0; ; e++)
    if (i = i.previousSibling, !i)
      return e;
}
function Co(i) {
  return i.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(i.nodeName);
}
function vu(i, e, t, n, s) {
  for (; ; ) {
    if (i == t && e == n)
      return !0;
    if (e == (s < 0 ? 0 : vi(i))) {
      if (i.nodeName == "DIV")
        return !1;
      let r = i.parentNode;
      if (!r || r.nodeType != 1)
        return !1;
      e = Ki(i) + (s < 0 ? 0 : 1), i = r;
    } else if (i.nodeType == 1) {
      if (i = i.childNodes[e + (s < 0 ? -1 : 0)], i.nodeType == 1 && i.contentEditable == "false")
        return !1;
      e = s < 0 ? vi(i) : 0;
    } else
      return !1;
  }
}
function vi(i) {
  return i.nodeType == 3 ? i.nodeValue.length : i.childNodes.length;
}
function ko(i, e) {
  let t = e ? i.left : i.right;
  return { left: t, right: t, top: i.top, bottom: i.bottom };
}
function uv(i) {
  let e = i.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: i.innerWidth,
    top: 0,
    bottom: i.innerHeight
  };
}
function Cp(i, e) {
  let t = e.width / i.offsetWidth, n = e.height / i.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - i.offsetWidth) < 1) && (t = 1), (n > 0.995 && n < 1.005 || !isFinite(n) || Math.abs(e.height - i.offsetHeight) < 1) && (n = 1), { scaleX: t, scaleY: n };
}
function fv(i, e, t, n, s, r, o, a) {
  let l = i.ownerDocument, h = l.defaultView || window;
  for (let c = i, u = !1; c && !u; )
    if (c.nodeType == 1) {
      let f, d = c == l.body, p = 1, m = 1;
      if (d)
        f = uv(h);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (u = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let b = c.getBoundingClientRect();
        ({ scaleX: p, scaleY: m } = Cp(c, b)), f = {
          left: b.left,
          right: b.left + c.clientWidth * p,
          top: b.top,
          bottom: b.top + c.clientHeight * m
        };
      }
      let g = 0, y = 0;
      if (s == "nearest")
        e.top < f.top ? (y = e.top - (f.top + o), t > 0 && e.bottom > f.bottom + y && (y = e.bottom - f.bottom + o)) : e.bottom > f.bottom && (y = e.bottom - f.bottom + o, t < 0 && e.top - y < f.top && (y = e.top - (f.top + o)));
      else {
        let b = e.bottom - e.top, v = f.bottom - f.top;
        y = (s == "center" && b <= v ? e.top + b / 2 - v / 2 : s == "start" || s == "center" && t < 0 ? e.top - o : e.bottom - v + o) - f.top;
      }
      if (n == "nearest" ? e.left < f.left ? (g = e.left - (f.left + r), t > 0 && e.right > f.right + g && (g = e.right - f.right + r)) : e.right > f.right && (g = e.right - f.right + r, t < 0 && e.left < f.left + g && (g = e.left - (f.left + r))) : g = (n == "center" ? e.left + (e.right - e.left) / 2 - (f.right - f.left) / 2 : n == "start" == a ? e.left - r : e.right - (f.right - f.left) + r) - f.left, g || y)
        if (d)
          h.scrollBy(g, y);
        else {
          let b = 0, v = 0;
          if (y) {
            let T = c.scrollTop;
            c.scrollTop += y / m, v = (c.scrollTop - T) * m;
          }
          if (g) {
            let T = c.scrollLeft;
            c.scrollLeft += g / p, b = (c.scrollLeft - T) * p;
          }
          e = {
            left: e.left - b,
            top: e.top - v,
            right: e.right - b,
            bottom: e.bottom - v
          }, b && Math.abs(b - g) < 1 && (n = "nearest"), v && Math.abs(v - y) < 1 && (s = "nearest");
        }
      if (d)
        break;
      (e.top < f.top || e.bottom > f.bottom || e.left < f.left || e.right > f.right) && (e = {
        left: Math.max(e.left, f.left),
        right: Math.min(e.right, f.right),
        top: Math.max(e.top, f.top),
        bottom: Math.min(e.bottom, f.bottom)
      }), c = c.assignedSlot || c.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
function dv(i) {
  let e = i.ownerDocument, t, n;
  for (let s = i.parentNode; s && !(s == e.body || t && n); )
    if (s.nodeType == 1)
      !n && s.scrollHeight > s.clientHeight && (n = s), !t && s.scrollWidth > s.clientWidth && (t = s), s = s.assignedSlot || s.parentNode;
    else if (s.nodeType == 11)
      s = s.host;
    else
      break;
  return { x: t, y: n };
}
class pv {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: n } = e;
    this.set(t, Math.min(e.anchorOffset, t ? vi(t) : 0), n, Math.min(e.focusOffset, n ? vi(n) : 0));
  }
  set(e, t, n, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = s;
  }
}
let on = null;
k.safari && k.safari_version >= 26 && (on = !1);
function kp(i) {
  if (i.setActive)
    return i.setActive();
  if (on)
    return i.focus(on);
  let e = [];
  for (let t = i; t && (e.push(t, t.scrollTop, t.scrollLeft), t != t.ownerDocument); t = t.parentNode)
    ;
  if (i.focus(on == null ? {
    get preventScroll() {
      return on = { preventScroll: !0 }, !0;
    }
  } : void 0), !on) {
    on = !1;
    for (let t = 0; t < e.length; ) {
      let n = e[t++], s = e[t++], r = e[t++];
      n.scrollTop != s && (n.scrollTop = s), n.scrollLeft != r && (n.scrollLeft = r);
    }
  }
}
let Su;
function qs(i, e, t = e) {
  let n = Su || (Su = document.createRange());
  return n.setEnd(i, t), n.setStart(i, e), n;
}
function zn(i, e, t, n) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  n && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = n);
  let r = new KeyboardEvent("keydown", s);
  r.synthetic = !0, i.dispatchEvent(r);
  let o = new KeyboardEvent("keyup", s);
  return o.synthetic = !0, i.dispatchEvent(o), r.defaultPrevented || o.defaultPrevented;
}
function mv(i) {
  for (; i; ) {
    if (i && (i.nodeType == 9 || i.nodeType == 11 && i.host))
      return i;
    i = i.assignedSlot || i.parentNode;
  }
  return null;
}
function gv(i, e) {
  let t = e.focusNode, n = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != n)
    return !1;
  for (n = Math.min(n, vi(t)); ; )
    if (n) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[n - 1];
      s.contentEditable == "false" ? n-- : (t = s, n = vi(t));
    } else {
      if (t == i)
        return !0;
      n = Ki(t), t = t.parentNode;
    }
}
function _p(i) {
  return i.scrollTop > Math.max(1, i.scrollHeight - i.clientHeight - 4);
}
function Op(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n > 0)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n - 1], n = vi(t);
    } else if (t.parentNode && !Co(t))
      n = Ki(t), t = t.parentNode;
    else
      return null;
  }
}
function Ip(i, e) {
  for (let t = i, n = e; ; ) {
    if (t.nodeType == 3 && n < t.nodeValue.length)
      return { node: t, offset: n };
    if (t.nodeType == 1 && n < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[n], n = 0;
    } else if (t.parentNode && !Co(t))
      n = Ki(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Mt {
  constructor(e, t, n = !0) {
    this.node = e, this.offset = t, this.precise = n;
  }
  static before(e, t) {
    return new Mt(e.parentNode, Ki(e), t);
  }
  static after(e, t) {
    return new Mt(e.parentNode, Ki(e) + 1, t);
  }
}
var ie = /* @__PURE__ */ function(i) {
  return i[i.LTR = 0] = "LTR", i[i.RTL = 1] = "RTL", i;
}(ie || (ie = {}));
const yn = ie.LTR, ec = ie.RTL;
function Rp(i) {
  let e = [];
  for (let t = 0; t < i.length; t++)
    e.push(1 << +i[t]);
  return e;
}
const yv = /* @__PURE__ */ Rp("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), bv = /* @__PURE__ */ Rp("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), Xl = /* @__PURE__ */ Object.create(null), zt = [];
for (let i of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ i.charCodeAt(0), t = /* @__PURE__ */ i.charCodeAt(1);
  Xl[e] = t, Xl[t] = -e;
}
function Np(i) {
  return i <= 247 ? yv[i] : 1424 <= i && i <= 1524 ? 2 : 1536 <= i && i <= 1785 ? bv[i - 1536] : 1774 <= i && i <= 2220 ? 4 : 8192 <= i && i <= 8204 ? 256 : 64336 <= i && i <= 65023 ? 4 : 1;
}
const vv = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class gi {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? ec : yn;
  }
  /**
  @internal
  */
  constructor(e, t, n) {
    this.from = e, this.to = t, this.level = n;
  }
  /**
  @internal
  */
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(e, t) {
    return e == (this.dir == t);
  }
  /**
  @internal
  */
  static find(e, t, n, s) {
    let r = -1;
    for (let o = 0; o < e.length; o++) {
      let a = e[o];
      if (a.from <= t && a.to >= t) {
        if (a.level == n)
          return o;
        (r < 0 || (s != 0 ? s < 0 ? a.from < t : a.to > t : e[r].level > a.level)) && (r = o);
      }
    }
    if (r < 0)
      throw new RangeError("Index out of range");
    return r;
  }
}
function Mp(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++) {
    let n = i[t], s = e[t];
    if (n.from != s.from || n.to != s.to || n.direction != s.direction || !Mp(n.inner, s.inner))
      return !1;
  }
  return !0;
}
const Z = [];
function Sv(i, e, t, n, s) {
  for (let r = 0; r <= n.length; r++) {
    let o = r ? n[r - 1].to : e, a = r < n.length ? n[r].from : t, l = r ? 256 : s;
    for (let h = o, c = l, u = l; h < a; h++) {
      let f = Np(i.charCodeAt(h));
      f == 512 ? f = c : f == 8 && u == 4 && (f = 16), Z[h] = f == 4 ? 2 : f, f & 7 && (u = f), c = f;
    }
    for (let h = o, c = l, u = l; h < a; h++) {
      let f = Z[h];
      if (f == 128)
        h < a - 1 && c == Z[h + 1] && c & 24 ? f = Z[h] = c : Z[h] = 256;
      else if (f == 64) {
        let d = h + 1;
        for (; d < a && Z[d] == 64; )
          d++;
        let p = h && c == 8 || d < t && Z[d] == 8 ? u == 1 ? 1 : 8 : 256;
        for (let m = h; m < d; m++)
          Z[m] = p;
        h = d - 1;
      } else f == 8 && u == 1 && (Z[h] = 1);
      c = f, f & 7 && (u = f);
    }
  }
}
function Tv(i, e, t, n, s) {
  let r = s == 1 ? 2 : 1;
  for (let o = 0, a = 0, l = 0; o <= n.length; o++) {
    let h = o ? n[o - 1].to : e, c = o < n.length ? n[o].from : t;
    for (let u = h, f, d, p; u < c; u++)
      if (d = Xl[f = i.charCodeAt(u)])
        if (d < 0) {
          for (let m = a - 3; m >= 0; m -= 3)
            if (zt[m + 1] == -d) {
              let g = zt[m + 2], y = g & 2 ? s : g & 4 ? g & 1 ? r : s : 0;
              y && (Z[u] = Z[zt[m]] = y), a = m;
              break;
            }
        } else {
          if (zt.length == 189)
            break;
          zt[a++] = u, zt[a++] = f, zt[a++] = l;
        }
      else if ((p = Z[u]) == 2 || p == 1) {
        let m = p == s;
        l = m ? 0 : 1;
        for (let g = a - 3; g >= 0; g -= 3) {
          let y = zt[g + 2];
          if (y & 2)
            break;
          if (m)
            zt[g + 2] |= 2;
          else {
            if (y & 4)
              break;
            zt[g + 2] |= 4;
          }
        }
      }
  }
}
function xv(i, e, t, n) {
  for (let s = 0, r = n; s <= t.length; s++) {
    let o = s ? t[s - 1].to : i, a = s < t.length ? t[s].from : e;
    for (let l = o; l < a; ) {
      let h = Z[l];
      if (h == 256) {
        let c = l + 1;
        for (; ; )
          if (c == a) {
            if (s == t.length)
              break;
            c = t[s++].to, a = s < t.length ? t[s].from : e;
          } else if (Z[c] == 256)
            c++;
          else
            break;
        let u = r == 1, f = (c < e ? Z[c] : n) == 1, d = u == f ? u ? 1 : 2 : n;
        for (let p = c, m = s, g = m ? t[m - 1].to : i; p > l; )
          p == g && (p = t[--m].from, g = m ? t[m - 1].to : i), Z[--p] = d;
        l = c;
      } else
        r = h, l++;
    }
  }
}
function Jl(i, e, t, n, s, r, o) {
  let a = n % 2 ? 2 : 1;
  if (n % 2 == s % 2)
    for (let l = e, h = 0; l < t; ) {
      let c = !0, u = !1;
      if (h == r.length || l < r[h].from) {
        let m = Z[l];
        m != a && (c = !1, u = m == 16);
      }
      let f = !c && a == 1 ? [] : null, d = c ? n : n + 1, p = l;
      e: for (; ; )
        if (h < r.length && p == r[h].from) {
          if (u)
            break e;
          let m = r[h];
          if (!c)
            for (let g = m.to, y = h + 1; ; ) {
              if (g == t)
                break e;
              if (y < r.length && r[y].from == g)
                g = r[y++].to;
              else {
                if (Z[g] == a)
                  break e;
                break;
              }
            }
          if (h++, f)
            f.push(m);
          else {
            m.from > l && o.push(new gi(l, m.from, d));
            let g = m.direction == yn != !(d % 2);
            Ql(i, g ? n + 1 : n, s, m.inner, m.from, m.to, o), l = m.to;
          }
          p = m.to;
        } else {
          if (p == t || (c ? Z[p] != a : Z[p] == a))
            break;
          p++;
        }
      f ? Jl(i, l, p, n + 1, s, f, o) : l < p && o.push(new gi(l, p, d)), l = p;
    }
  else
    for (let l = t, h = r.length; l > e; ) {
      let c = !0, u = !1;
      if (!h || l > r[h - 1].to) {
        let m = Z[l - 1];
        m != a && (c = !1, u = m == 16);
      }
      let f = !c && a == 1 ? [] : null, d = c ? n : n + 1, p = l;
      e: for (; ; )
        if (h && p == r[h - 1].to) {
          if (u)
            break e;
          let m = r[--h];
          if (!c)
            for (let g = m.from, y = h; ; ) {
              if (g == e)
                break e;
              if (y && r[y - 1].to == g)
                g = r[--y].from;
              else {
                if (Z[g - 1] == a)
                  break e;
                break;
              }
            }
          if (f)
            f.push(m);
          else {
            m.to < l && o.push(new gi(m.to, l, d));
            let g = m.direction == yn != !(d % 2);
            Ql(i, g ? n + 1 : n, s, m.inner, m.from, m.to, o), l = m.from;
          }
          p = m.from;
        } else {
          if (p == e || (c ? Z[p - 1] != a : Z[p - 1] == a))
            break;
          p--;
        }
      f ? Jl(i, p, l, n + 1, s, f, o) : p < l && o.push(new gi(p, l, d)), l = p;
    }
}
function Ql(i, e, t, n, s, r, o) {
  let a = e % 2 ? 2 : 1;
  Sv(i, s, r, n, a), Tv(i, s, r, n, a), xv(s, r, n, a), Jl(i, s, r, e, t, n, o);
}
function Ev(i, e, t) {
  if (!i)
    return [new gi(0, 0, e == ec ? 1 : 0)];
  if (e == yn && !t.length && !vv.test(i))
    return Lp(i.length);
  if (t.length)
    for (; i.length > Z.length; )
      Z[Z.length] = 256;
  let n = [], s = e == yn ? 0 : 1;
  return Ql(i, s, s, t, 0, i.length, n), n;
}
function Lp(i) {
  return [new gi(0, i, 0)];
}
let Pp = "";
function Av(i, e, t, n, s) {
  var r;
  let o = n.head - i.from, a = gi.find(e, o, (r = n.bidiLevel) !== null && r !== void 0 ? r : -1, n.assoc), l = e[a], h = l.side(s, t);
  if (o == h) {
    let f = a += s ? 1 : -1;
    if (f < 0 || f >= e.length)
      return null;
    l = e[a = f], o = l.side(!s, t), h = l.side(s, t);
  }
  let c = Ae(i.text, o, l.forward(s, t));
  (c < l.from || c > l.to) && (c = h), Pp = i.text.slice(Math.min(o, c), Math.max(o, c));
  let u = a == (s ? e.length - 1 : 0) ? null : e[a + (s ? 1 : -1)];
  return u && c == h && u.level + (s ? 0 : 1) < l.level ? x.cursor(u.side(!s, t) + i.from, u.forward(s, t) ? 1 : -1, u.level) : x.cursor(c + i.from, l.forward(s, t) ? -1 : 1, l.level);
}
function wv(i, e, t) {
  for (let n = e; n < t; n++) {
    let s = Np(i.charCodeAt(n));
    if (s == 1)
      return yn;
    if (s == 2 || s == 4)
      return ec;
  }
  return yn;
}
const Dp = /* @__PURE__ */ _.define(), $p = /* @__PURE__ */ _.define(), Bp = /* @__PURE__ */ _.define(), Up = /* @__PURE__ */ _.define(), Zl = /* @__PURE__ */ _.define(), Fp = /* @__PURE__ */ _.define(), Wp = /* @__PURE__ */ _.define(), tc = /* @__PURE__ */ _.define(), ic = /* @__PURE__ */ _.define(), Hp = /* @__PURE__ */ _.define({
  combine: (i) => i.some((e) => e)
}), Vp = /* @__PURE__ */ _.define({
  combine: (i) => i.some((e) => e)
}), jp = /* @__PURE__ */ _.define();
class Gn {
  constructor(e, t = "nearest", n = "nearest", s = 5, r = 5, o = !1) {
    this.range = e, this.y = t, this.x = n, this.yMargin = s, this.xMargin = r, this.isSnapshot = o;
  }
  map(e) {
    return e.empty ? this : new Gn(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new Gn(x.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Mr = /* @__PURE__ */ V.define({ map: (i, e) => i.map(e) }), zp = /* @__PURE__ */ V.define();
function ut(i, e, t) {
  let n = i.facet(Up);
  n.length ? n[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const mi = /* @__PURE__ */ _.define({ combine: (i) => i.length ? i[0] : !0 });
let Cv = 0;
const Un = /* @__PURE__ */ _.define({
  combine(i) {
    return i.filter((e, t) => {
      for (let n = 0; n < t; n++)
        if (i[n].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class Pe {
  constructor(e, t, n, s, r) {
    this.id = e, this.create = t, this.domEventHandlers = n, this.domEventObservers = s, this.baseExtensions = r(this), this.extension = this.baseExtensions.concat(Un.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(Un.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: n, eventObservers: s, provide: r, decorations: o } = t || {};
    return new Pe(Cv++, e, n, s, (a) => {
      let l = [];
      return o && l.push(aa.of((h) => {
        let c = h.plugin(a);
        return c ? o(c) : B.none;
      })), r && l.push(r(a)), l;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return Pe.define((n, s) => new e(n, s), t);
  }
}
class Ga {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  get plugin() {
    return this.spec && this.spec.plugin;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (n) {
            if (ut(t.state, n, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.plugin.create(e, this.spec.arg);
      } catch (t) {
        ut(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (n) {
        ut(e.state, n, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Gp = /* @__PURE__ */ _.define(), nc = /* @__PURE__ */ _.define(), aa = /* @__PURE__ */ _.define(), Kp = /* @__PURE__ */ _.define(), sc = /* @__PURE__ */ _.define(), pr = /* @__PURE__ */ _.define(), qp = /* @__PURE__ */ _.define();
function Tu(i, e) {
  let t = i.state.facet(qp);
  if (!t.length)
    return t;
  let n = t.map((r) => r instanceof Function ? r(i) : r), s = [];
  return H.spans(n, e.from, e.to, {
    point() {
    },
    span(r, o, a, l) {
      let h = r - e.from, c = o - e.from, u = s;
      for (let f = a.length - 1; f >= 0; f--, l--) {
        let d = a[f].spec.bidiIsolate, p;
        if (d == null && (d = wv(e.text, h, c)), l > 0 && u.length && (p = u[u.length - 1]).to == h && p.direction == d)
          p.to = c, u = p.inner;
        else {
          let m = { from: h, to: c, direction: d, inner: [] };
          u.push(m), u = m.inner;
        }
      }
    }
  }), s;
}
const Yp = /* @__PURE__ */ _.define();
function rc(i) {
  let e = 0, t = 0, n = 0, s = 0;
  for (let r of i.state.facet(Yp)) {
    let o = r(i);
    o && (o.left != null && (e = Math.max(e, o.left)), o.right != null && (t = Math.max(t, o.right)), o.top != null && (n = Math.max(n, o.top)), o.bottom != null && (s = Math.max(s, o.bottom)));
  }
  return { left: e, right: t, top: n, bottom: s };
}
const As = /* @__PURE__ */ _.define();
class bt {
  constructor(e, t, n, s) {
    this.fromA = e, this.toA = t, this.fromB = n, this.toB = s;
  }
  join(e) {
    return new bt(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, n = this;
    for (; t > 0; t--) {
      let s = e[t - 1];
      if (!(s.fromA > n.toA)) {
        if (s.toA < n.fromA)
          break;
        n = n.join(s), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, n), e;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let n = [];
    for (let s = 0, r = 0, o = 0; ; ) {
      let a = s < e.length ? e[s].fromB : 1e9, l = r < t.length ? t[r] : 1e9, h = Math.min(a, l);
      if (h == 1e9)
        break;
      let c = h + o, u = h, f = c;
      for (; ; )
        if (r < t.length && t[r] <= u) {
          let d = t[r + 1];
          r += 2, u = Math.max(u, d);
          for (let p = s; p < e.length && e[p].fromB <= u; p++)
            o = e[p].toA - e[p].toB;
          f = Math.max(f, d + o);
        } else if (s < e.length && e[s].fromB <= u) {
          let d = e[s++];
          u = Math.max(u, d.toB), f = Math.max(f, d.toA), o = d.toA - d.toB;
        } else
          break;
      n.push(new bt(c, f, h, u));
    }
    return n;
  }
}
class _o {
  constructor(e, t, n) {
    this.view = e, this.state = t, this.transactions = n, this.flags = 0, this.startState = e.state, this.changes = xe.empty(this.startState.doc.length);
    for (let r of n)
      this.changes = this.changes.compose(r.changes);
    let s = [];
    this.changes.iterChangedRanges((r, o, a, l) => s.push(new bt(r, o, a, l))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new _o(e, t, n);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Returns true when
  [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
  and the viewport change is not just the result of mapping it in
  response to document changes.
  */
  get viewportMoved() {
    return (this.flags & 8) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 18) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
const kv = [];
class ye {
  constructor(e, t, n = 0) {
    this.dom = e, this.length = t, this.flags = n, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return kv;
  }
  isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  isComposite() {
    return !1;
  }
  isLine() {
    return !1;
  }
  isText() {
    return !1;
  }
  isBlock() {
    return !1;
  }
  get domAttrs() {
    return null;
  }
  sync(e) {
    if (this.flags |= 2, this.flags & 4) {
      this.flags &= -5;
      let t = this.domAttrs;
      t && lv(this.dom, t);
    }
  }
  toString() {
    return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
  }
  destroy() {
    this.parent = null;
  }
  setDOM(e) {
    this.dom = e, e.cmTile = this;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e, t = this.posAtStart) {
    let n = t;
    for (let s of this.children) {
      if (s == e)
        return n;
      n += s.length + s.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  covers(e) {
    return !0;
  }
  coordsIn(e, t) {
    return null;
  }
  domPosFor(e, t) {
    let n = Ki(this.dom), s = this.length ? e > 0 : t > 0;
    return new Mt(this.parent.dom, n + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof ha)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class la extends ye {
  constructor(e) {
    super(e, 0), this._children = [];
  }
  isComposite() {
    return !0;
  }
  get children() {
    return this._children;
  }
  get lastChild() {
    return this.children.length ? this.children[this.children.length - 1] : null;
  }
  append(e) {
    this.children.push(e), e.parent = this;
  }
  sync(e) {
    if (this.flags & 2)
      return;
    super.sync(e);
    let t = this.dom, n = null, s, r = (e == null ? void 0 : e.node) == t ? e : null, o = 0;
    for (let a of this.children) {
      if (a.sync(e), o += a.length + a.breakAfter, s = n ? n.nextSibling : t.firstChild, r && s != a.dom && (r.written = !0), a.dom.parentNode == t)
        for (; s && s != a.dom; )
          s = xu(s);
      else
        t.insertBefore(a.dom, s);
      n = a.dom;
    }
    for (s = n ? n.nextSibling : t.firstChild, r && s && (r.written = !0); s; )
      s = xu(s);
    this.length = o;
  }
}
function xu(i) {
  let e = i.nextSibling;
  return i.parentNode.removeChild(i), e;
}
class ha extends la {
  constructor(e, t) {
    super(t), this.view = e;
  }
  owns(e) {
    for (; e; e = e.parent)
      if (e == this)
        return !0;
    return !1;
  }
  isBlock() {
    return !0;
  }
  nearest(e) {
    for (; ; ) {
      if (!e)
        return null;
      let t = ye.get(e);
      if (t && this.owns(t))
        return t;
      e = e.parentNode;
    }
  }
  blockTiles(e) {
    for (let t = [], n = this, s = 0, r = 0; ; )
      if (s == n.children.length) {
        if (!t.length)
          return;
        n = n.parent, n.breakAfter && r++, s = t.pop();
      } else {
        let o = n.children[s++];
        if (o instanceof Bi)
          t.push(s), n = o, s = 0;
        else {
          let a = r + o.length, l = e(o, r);
          if (l !== void 0)
            return l;
          r = a + o.breakAfter;
        }
      }
  }
  // Find the block at the given position. If side < -1, make sure to
  // stay before block widgets at that position, if side > 1, after
  // such widgets (used for selection drawing, which needs to be able
  // to get coordinates for positions that aren't valid cursor positions).
  resolveBlock(e, t) {
    let n, s = -1, r, o = -1;
    if (this.blockTiles((a, l) => {
      let h = l + a.length;
      if (e >= l && e <= h) {
        if (a.isWidget() && t >= -1 && t <= 1) {
          if (a.flags & 32)
            return !0;
          a.flags & 16 && (n = void 0);
        }
        (l < e || e == h && (t < -1 ? a.length : a.covers(1))) && (!n || !a.isWidget() && n.isWidget()) && (n = a, s = e - l), (h > e || e == l && (t > 1 ? a.length : a.covers(-1))) && (!r || !a.isWidget() && r.isWidget()) && (r = a, o = e - l);
      }
    }), !n && !r)
      throw new Error("No tile at position " + e);
    return n && t < 0 || !r ? { tile: n, offset: s } : { tile: r, offset: o };
  }
}
class Bi extends la {
  constructor(e, t) {
    super(e), this.wrapper = t;
  }
  isBlock() {
    return !0;
  }
  covers(e) {
    return this.children.length ? e < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1) : !1;
  }
  get domAttrs() {
    return this.wrapper.attributes;
  }
  static of(e, t) {
    let n = new Bi(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class Jn extends la {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, n) {
    let s = new Jn(t || document.createElement("div"), e);
    return (!t || !n) && (s.flags |= 4), s;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  resolveInline(e, t, n) {
    let s = null, r = -1, o = null, a = -1;
    function l(c, u) {
      for (let f = 0, d = 0; f < c.children.length && d <= u; f++) {
        let p = c.children[f], m = d + p.length;
        m >= u && (p.isComposite() ? l(p, u - d) : (!o || o.isHidden && (t > 0 || n && Ov(o, p))) && (m > u || p.flags & 32) ? (o = p, a = u - d) : (d < u || p.flags & 16 && !p.isHidden) && (s = p, r = u - d)), d = m;
      }
    }
    l(this, e);
    let h = (t < 0 ? s : o) || s || o;
    return h ? { tile: h, offset: h == s ? r : a } : null;
  }
  coordsIn(e, t) {
    let n = this.resolveInline(e, t, !0);
    return n ? n.tile.coordsIn(Math.max(0, n.offset), t) : _v(this);
  }
  domIn(e, t) {
    let n = this.resolveInline(e, t);
    if (n) {
      let { tile: s, offset: r } = n;
      if (this.dom.contains(s.dom))
        return s.isText() ? new Mt(s.dom, Math.min(s.dom.nodeValue.length, r)) : s.domPosFor(r, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let o = n.tile.parent, a = !1;
      for (let l of o.children) {
        if (a)
          return new Mt(l.dom, 0);
        l == n.tile && (a = !0);
      }
    }
    return new Mt(this.dom, 0);
  }
}
function _v(i) {
  let e = i.dom.lastChild;
  if (!e)
    return i.dom.getBoundingClientRect();
  let t = ao(e);
  return t[t.length - 1] || null;
}
function Ov(i, e) {
  let t = i.coordsIn(0, 1), n = e.coordsIn(0, 1);
  return t && n && n.top < t.bottom;
}
class Ze extends la {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let n = new Ze(t || document.createElement(e.tagName), e);
    return t || (n.flags |= 4), n;
  }
}
class hn extends ye {
  constructor(e, t) {
    super(e, t.length), this.text = t;
  }
  sync(e) {
    this.flags & 2 || (super.sync(e), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text));
  }
  isText() {
    return !0;
  }
  toString() {
    return JSON.stringify(this.text);
  }
  coordsIn(e, t) {
    let n = this.dom.nodeValue.length;
    e > n && (e = n);
    let s = e, r = e, o = 0;
    e == 0 && t < 0 || e == n && t >= 0 ? k.chrome || k.gecko || (e ? (s--, o = 1) : r < n && (r++, o = -1)) : t < 0 ? s-- : r < n && r++;
    let a = qs(this.dom, s, r).getClientRects();
    if (!a.length)
      return null;
    let l = a[(o ? o < 0 : t >= 0) ? 0 : a.length - 1];
    return k.safari && !o && l.width == 0 && (l = Array.prototype.find.call(a, (h) => h.width) || l), o ? ko(l, o < 0) : l || null;
  }
  static of(e, t) {
    let n = new hn(t || document.createTextNode(e), e);
    return t || (n.flags |= 2), n;
  }
}
class bn extends ye {
  constructor(e, t, n, s) {
    super(e, t, s), this.widget = n;
  }
  isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  covers(e) {
    return this.flags & 48 ? !1 : (this.flags & (e < 0 ? 64 : 128)) > 0;
  }
  coordsIn(e, t) {
    return this.coordsInWidget(e, t, !1);
  }
  coordsInWidget(e, t, n) {
    let s = this.widget.coordsAt(this.dom, e, t);
    if (s)
      return s;
    if (n)
      return ko(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let r = this.dom.getClientRects(), o = null;
      if (!r.length)
        return null;
      let a = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let l = a ? r.length - 1 : 0; o = r[l], !(e > 0 ? l == 0 : l == r.length - 1 || o.top < o.bottom); l += a ? -1 : 1)
        ;
      return ko(o, !a);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return J.empty;
    let { root: e } = this;
    if (!e)
      return J.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, n, s, r) {
    return r || (r = e.toDOM(t), e.editable || (r.contentEditable = "false")), new bn(r, n, e, s);
  }
}
class Oo extends ye {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return J.empty;
  }
  coordsIn(e) {
    return this.dom.getBoundingClientRect();
  }
}
class Iv {
  constructor(e) {
    this.index = 0, this.beforeBreak = !1, this.parents = [], this.tile = e;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(e, t, n) {
    let { tile: s, index: r, beforeBreak: o, parents: a } = this;
    for (; e || t > 0; )
      if (s.isComposite())
        if (o) {
          if (!e)
            break;
          n && n.break(), e--, o = !1;
        } else if (r == s.children.length) {
          if (!e && !a.length)
            break;
          n && n.leave(s), o = !!s.breakAfter, { tile: s, index: r } = a.pop(), r++;
        } else {
          let l = s.children[r], h = l.breakAfter;
          (t > 0 ? l.length <= e : l.length < e) && (!n || n.skip(l, 0, l.length) !== !1 || !l.isComposite) ? (o = !!h, r++, e -= l.length) : (a.push({ tile: s, index: r }), s = l, r = 0, n && l.isComposite() && n.enter(l));
        }
      else if (r == s.length)
        o = !!s.breakAfter, { tile: s, index: r } = a.pop(), r++;
      else if (e) {
        let l = Math.min(e, s.length - r);
        n && n.skip(s, r, r + l), e -= l, r += l;
      } else
        break;
    return this.tile = s, this.index = r, this.beforeBreak = o, this;
  }
  get root() {
    return this.parents.length ? this.parents[0].tile : this.tile;
  }
}
class Rv {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.wrapper = n, this.rank = s;
  }
}
class Nv {
  constructor(e, t, n) {
    this.cache = e, this.root = t, this.blockWrappers = n, this.curLine = null, this.lastBlock = null, this.afterWidget = null, this.pos = 0, this.wrappers = [], this.wrapperPos = 0;
  }
  addText(e, t, n, s) {
    var r;
    this.flushBuffer();
    let o = this.ensureMarks(t, n), a = o.lastChild;
    if (a && a.isText() && !(a.flags & 8)) {
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
      let l = o.children[o.children.length - 1] = new hn(a.dom, a.text + e);
      l.parent = o;
    } else
      o.append(s || hn.of(e, (r = this.cache.find(hn)) === null || r === void 0 ? void 0 : r.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let n = this.curLine;
    n.dom != t.line.dom && (n.setDOM(this.cache.reused.has(t.line) ? Ka(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = n;
    for (let a = t.marks.length - 1; a >= 0; a--) {
      let l = t.marks[a], h = s.lastChild;
      if (h instanceof Ze && h.mark.eq(l.mark))
        h.dom != l.dom && h.setDOM(Ka(l.dom)), s = h;
      else {
        if (this.cache.reused.get(l)) {
          let u = ye.get(l.dom);
          u && u.setDOM(Ka(l.dom));
        }
        let c = Ze.of(l.mark, l.dom);
        s.append(c), s = c;
      }
      this.cache.reused.set(
        l,
        2
        /* Reused.DOM */
      );
    }
    let r = ye.get(e.text);
    r && this.cache.reused.set(
      r,
      2
      /* Reused.DOM */
    );
    let o = new hn(e.text, e.text.nodeValue);
    o.flags |= 8, s.append(o);
  }
  addInlineWidget(e, t, n) {
    let s = this.afterWidget && e.flags & 48 && (this.afterWidget.flags & 48) == (e.flags & 48);
    s || this.flushBuffer();
    let r = this.ensureMarks(t, n);
    !s && !(e.flags & 16) && r.append(this.getBuffer(1)), r.append(e), this.pos += e.length, this.afterWidget = e;
  }
  addMark(e, t, n) {
    this.flushBuffer(), this.ensureMarks(t, n).append(e), this.pos += e.length, this.afterWidget = null;
  }
  addBlockWidget(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  continueWidget(e) {
    let t = this.afterWidget || this.lastBlock;
    t.length += e, this.pos += e;
  }
  addLineStart(e, t) {
    var n;
    e || (e = Xp);
    let s = Jn.start(e, t || ((n = this.cache.find(Jn)) === null || n === void 0 ? void 0 : n.dom), !!t);
    this.getBlockPos().append(this.lastBlock = this.curLine = s);
  }
  addLine(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  addBreak() {
    this.lastBlock.flags |= 1, this.endLine(), this.pos++;
  }
  addLineStartIfNotCovered(e) {
    this.blockPosCovered() || this.addLineStart(e);
  }
  ensureLine(e) {
    this.curLine || this.addLineStart(e);
  }
  ensureMarks(e, t) {
    var n;
    let s = this.curLine;
    for (let r = e.length - 1; r >= 0; r--) {
      let o = e[r], a;
      if (t > 0 && (a = s.lastChild) && a instanceof Ze && a.mark.eq(o))
        s = a, t--;
      else {
        let l = Ze.of(o, (n = this.cache.find(Ze, (h) => h.mark.eq(o))) === null || n === void 0 ? void 0 : n.dom);
        s.append(l), s = l, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Eu(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(k.ios && Eu(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        qa,
        0,
        32
        /* TileFlag.After */
      ) || new bn(
        qa.toDOM(),
        0,
        qa,
        32
        /* TileFlag.After */
      )), this.curLine = this.afterWidget = null;
    }
  }
  updateBlockWrappers() {
    this.wrapperPos > this.pos + 1e4 && (this.blockWrappers.goto(this.pos), this.wrappers.length = 0);
    for (let e = this.wrappers.length - 1; e >= 0; e--)
      this.wrappers[e].to < this.pos && this.wrappers.splice(e, 1);
    for (let e = this.blockWrappers; e.value && e.from <= this.pos; e.next())
      if (e.to >= this.pos) {
        let t = new Rv(e.from, e.to, e.value, e.rank), n = this.wrappers.length;
        for (; n > 0 && (this.wrappers[n - 1].rank - t.rank || this.wrappers[n - 1].to - t.to) < 0; )
          n--;
        this.wrappers.splice(n, 0, t);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var e;
    this.updateBlockWrappers();
    let t = this.root;
    for (let n of this.wrappers) {
      let s = t.lastChild;
      if (n.from < this.pos && s instanceof Bi && s.wrapper.eq(n.wrapper))
        t = s;
      else {
        let r = Bi.of(n.wrapper, (e = this.cache.find(Bi, (o) => o.wrapper.eq(n.wrapper))) === null || e === void 0 ? void 0 : e.dom);
        t.append(r), t = r;
      }
    }
    return t;
  }
  blockPosCovered() {
    let e = this.lastBlock;
    return e != null && !e.breakAfter && (!e.isWidget() || (e.flags & 160) > 0);
  }
  getBuffer(e) {
    let t = 2 | (e < 0 ? 16 : 32), n = this.cache.find(
      Oo,
      void 0,
      1
      /* Reused.Full */
    );
    return n && (n.flags = t), n || new Oo(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class Mv {
  constructor(e) {
    this.skipCount = 0, this.text = "", this.textOff = 0, this.cursor = e.iter();
  }
  skip(e) {
    this.textOff + e <= this.text.length ? this.textOff += e : (this.skipCount += e - (this.text.length - this.textOff), this.text = "", this.textOff = 0);
  }
  next(e) {
    if (this.textOff == this.text.length) {
      let { value: s, lineBreak: r, done: o } = this.cursor.next(this.skipCount);
      if (this.skipCount = 0, o)
        throw new Error("Ran out of text content when drawing inline views");
      this.text = s;
      let a = this.textOff = Math.min(e, s.length);
      return r ? null : s.slice(0, a);
    }
    let t = Math.min(this.text.length, this.textOff + e), n = this.text.slice(this.textOff, t);
    return this.textOff = t, n;
  }
}
const Io = [bn, Jn, hn, Ze, Oo, Bi, ha];
for (let i = 0; i < Io.length; i++)
  Io[i].bucket = i;
class Lv {
  constructor(e) {
    this.view = e, this.buckets = Io.map(() => []), this.index = Io.map(() => 0), this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(e) {
    let t = e.constructor.bucket, n = this.buckets[t];
    n.length < 6 ? n.push(e) : n[
      this.index[t] = (this.index[t] + 1) % 6
      /* C.Bucket */
    ] = e;
  }
  find(e, t, n = 2) {
    let s = e.bucket, r = this.buckets[s], o = this.index[s];
    for (let a = r.length - 1; a >= 0; a--) {
      let l = (a + o) % r.length, h = r[l];
      if ((!t || t(h)) && !this.reused.has(h))
        return r.splice(l, 1), l < o && this.index[s]--, this.reused.set(h, n), h;
    }
    return null;
  }
  findWidget(e, t, n) {
    let s = this.buckets[0];
    if (s.length)
      for (let r = 0, o = 0; ; r++) {
        if (r == s.length) {
          if (o)
            return null;
          o = 1, r = 0;
        }
        let a = s[r];
        if (!this.reused.has(a) && (o == 0 ? a.widget.compare(e) : a.widget.constructor == e.constructor && e.updateDOM(a.dom, this.view)))
          return s.splice(r, 1), r < this.index[0] && this.index[0]--, a.widget == e && a.length == t && (a.flags & 497) == n ? (this.reused.set(
            a,
            1
            /* Reused.Full */
          ), a) : (this.reused.set(
            a,
            2
            /* Reused.DOM */
          ), new bn(a.dom, t, e, a.flags & -498 | n));
      }
  }
  reuse(e) {
    return this.reused.set(
      e,
      1
      /* Reused.Full */
    ), e;
  }
  maybeReuse(e, t = 2) {
    if (!this.reused.has(e))
      return this.reused.set(e, t), e.dom;
  }
  clear() {
    for (let e = 0; e < this.buckets.length; e++)
      this.buckets[e].length = this.index[e] = 0;
  }
}
class Pv {
  constructor(e, t, n, s, r) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = r, this.openWidget = !1, this.openMarks = 0, this.cache = new Lv(e), this.text = new Mv(e.state.doc), this.builder = new Nv(this.cache, new ha(e, e.contentDOM), H.iter(n)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Iv(t), this.reuseWalker = {
      skip: (o, a, l) => {
        if (this.cache.add(o), o.isComposite())
          return !1;
      },
      enter: (o) => this.cache.add(o),
      leave: () => {
      },
      break: () => {
      }
    };
  }
  run(e, t) {
    let n = t && this.getCompositionContext(t.text);
    for (let s = 0, r = 0, o = 0; ; ) {
      let a = o < e.length ? e[o++] : null, l = a ? a.fromA : this.old.root.length;
      if (l > s) {
        let h = l - s;
        this.preserve(h, !o, !a), s = l, r += h;
      }
      if (!a)
        break;
      t && a.fromA <= t.range.fromA && a.toA >= t.range.toA ? (this.forward(a.fromA, t.range.fromA, t.range.fromA < t.range.toA ? 1 : -1), this.emit(r, t.range.fromB), this.cache.clear(), this.builder.addComposition(t, n), this.text.skip(t.range.toB - t.range.fromB), this.forward(t.range.fromA, a.toA), this.emit(t.range.toB, a.toB)) : (this.forward(a.fromA, a.toA), this.emit(r, a.toB)), r = a.toB, s = a.toA;
    }
    return this.builder.curLine && this.builder.endLine(), this.builder.root;
  }
  preserve(e, t, n) {
    let s = Bv(this.old), r = this.openMarks;
    this.old.advance(e, n ? 1 : -1, {
      skip: (o, a, l) => {
        if (o.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(l - a);
          else {
            let h = l > 0 || a < o.length ? bn.of(o.widget, this.view, l - a, o.flags & 496, this.cache.maybeReuse(o)) : this.cache.reuse(o);
            h.flags & 256 ? (h.flags &= -2, this.builder.addBlockWidget(h)) : (this.builder.ensureLine(null), this.builder.addInlineWidget(h, s, r), r = s.length);
          }
        else if (o.isText())
          this.builder.ensureLine(null), !a && l == o.length ? this.builder.addText(o.text, s, r, this.cache.reuse(o)) : (this.cache.add(o), this.builder.addText(o.text.slice(a, l), s, r)), r = s.length;
        else if (o.isLine())
          o.flags &= -2, this.cache.reused.set(
            o,
            1
            /* Reused.Full */
          ), this.builder.addLine(o);
        else if (o instanceof Oo)
          this.cache.add(o);
        else if (o instanceof Ze)
          this.builder.ensureLine(null), this.builder.addMark(o, s, r), this.cache.reused.set(
            o,
            1
            /* Reused.Full */
          ), r = s.length;
        else
          return !1;
        this.openWidget = !1;
      },
      enter: (o) => {
        o.isLine() ? this.builder.addLineStart(o.attrs, this.cache.maybeReuse(o)) : (this.cache.add(o), o instanceof Ze && s.unshift(o.mark)), this.openWidget = !1;
      },
      leave: (o) => {
        o.isLine() ? s.length && (s.length = r = 0) : o instanceof Ze && (s.shift(), r = Math.min(r, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let n = null, s = this.builder, r = 0, o = H.spans(this.decorations, e, t, {
      point: (a, l, h, c, u, f) => {
        if (h instanceof gn) {
          if (this.disallowBlockEffectsFor[f]) {
            if (h.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (l > this.view.state.doc.lineAt(a).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (r = c.length, u > c.length)
            s.continueWidget(l - a);
          else {
            let d = h.widget || (h.block ? Qn.block : Qn.inline), p = Dv(h), m = this.cache.findWidget(d, l - a, p) || bn.of(d, this.view, l - a, p);
            h.block ? (h.startSide > 0 && s.addLineStartIfNotCovered(n), s.addBlockWidget(m)) : (s.ensureLine(n), s.addInlineWidget(m, c, u));
          }
          n = null;
        } else
          n = $v(n, h);
        l > a && this.text.skip(l - a);
      },
      span: (a, l, h, c) => {
        for (let u = a; u < l; ) {
          let f = this.text.next(Math.min(512, l - u));
          f == null ? (s.addLineStartIfNotCovered(n), s.addBreak(), u++) : (s.ensureLine(n), s.addText(f, h, c), u += f.length), n = null;
        }
      }
    });
    s.addLineStartIfNotCovered(n), this.openWidget = o > r, this.openMarks = o;
  }
  forward(e, t, n = 1) {
    t - e <= 10 ? this.old.advance(t - e, n, this.reuseWalker) : (this.old.advance(5, -1, this.reuseWalker), this.old.advance(t - e - 10, -1), this.old.advance(5, n, this.reuseWalker));
  }
  getCompositionContext(e) {
    let t = [], n = null;
    for (let s = e.parentNode; ; s = s.parentNode) {
      let r = ye.get(s);
      if (s == this.view.contentDOM)
        break;
      r instanceof Ze ? t.push(r) : r != null && r.isLine() ? n = r : s.nodeName == "DIV" && !n && s != this.view.contentDOM ? n = new Jn(s, Xp) : t.push(Ze.of(new fr({ tagName: s.nodeName.toLowerCase(), attributes: hv(s) }), s));
    }
    return { line: n, marks: t };
  }
}
function Eu(i, e) {
  let t = (n) => {
    for (let s of n.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(i);
}
function Dv(i) {
  let e = i.isReplace ? (i.startSide < 0 ? 64 : 0) | (i.endSide > 0 ? 128 : 0) : i.startSide > 0 ? 32 : 16;
  return i.block && (e |= 256), e;
}
const Xp = { class: "cm-line" };
function $v(i, e) {
  let t = e.spec.attributes, n = e.spec.class;
  return !t && !n || (i || (i = { class: "cm-line" }), t && Qh(t, i), n && (i.class += " " + n)), i;
}
function Bv(i) {
  let e = [];
  for (let t = i.parents.length; t > 1; t--) {
    let n = t == i.parents.length ? i.tile : i.parents[t].tile;
    n instanceof Ze && e.push(n.mark);
  }
  return e;
}
function Ka(i) {
  let e = ye.get(i);
  return e && e.setDOM(i.cloneNode()), i;
}
class Qn extends ki {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
Qn.inline = /* @__PURE__ */ new Qn("span");
Qn.block = /* @__PURE__ */ new Qn("div");
const qa = /* @__PURE__ */ new class extends ki {
  toDOM() {
    return document.createElement("br");
  }
  get isHidden() {
    return !0;
  }
  get editable() {
    return !0;
  }
}();
class Au {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = B.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new ha(e, e.contentDOM), this.updateInner([new bt(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let n = e.changedRanges;
    this.minWidth > 0 && n.length && (n.every(({ fromA: c, toA: u }) => u < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Kv(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let r = s > -1 ? Fv(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: u } = this.hasComposition;
      n = new bt(c, u, e.changes.mapPos(c, -1), e.changes.mapPos(u, 1)).addToSet(n.slice());
    }
    this.hasComposition = r ? { from: r.range.fromB, to: r.range.toB } : null, (k.ie || k.chrome) && !r && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let o = this.decorations, a = this.blockWrappers;
    this.updateDeco();
    let l = Vv(o, this.decorations, e.changes);
    l.length && (n = bt.extendWithRanges(n, l));
    let h = zv(a, this.blockWrappers, e.changes);
    return h.length && (n = bt.extendWithRanges(n, h)), r && !n.some((c) => c.fromA <= r.range.fromA && c.toA >= r.range.toA) && (n = r.range.addToSet(n.slice())), this.tile.flags & 2 && n.length == 0 ? !1 : (this.updateInner(n, r), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: n } = this.view;
    n.ignore(() => {
      if (t || e.length) {
        let o = this.tile, a = new Pv(this.view, o, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        this.tile = a.run(e, t), eh(o, a.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let r = k.chrome || k.ios ? { node: n.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(r), r && (r.written || n.selectionRange.focusNode != r.node || !this.tile.dom.contains(r.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let r of this.tile.children)
        r.isWidget() && r.widget instanceof Ya && s.push(r.dom);
    n.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(zp) && (this.editContextFormatting = n.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: n } = this.tile, s = this.view.root.activeElement, r = s == n, o = !r && !(this.view.state.facet(mi) || n.tabIndex > -1) && oo(n, this.view.observer.selectionRange) && !(s && n.contains(s));
    if (!(r || t || o))
      return;
    let a = this.forceSelection;
    this.forceSelection = !1;
    let l = this.view.state.selection.main, h, c;
    if (l.empty ? c = h = this.inlineDOMNearPos(l.anchor, l.assoc || 1) : (c = this.inlineDOMNearPos(l.head, l.head == l.from ? 1 : -1), h = this.inlineDOMNearPos(l.anchor, l.anchor == l.from ? 1 : -1)), k.gecko && l.empty && !this.hasComposition && Uv(h)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => h.node.insertBefore(f, h.node.childNodes[h.offset] || null)), h = c = new Mt(f, 0), a = !0;
    }
    let u = this.view.observer.selectionRange;
    (a || !u.focusNode || (!Ps(h.node, h.offset, u.anchorNode, u.anchorOffset) || !Ps(c.node, c.offset, u.focusNode, u.focusOffset)) && !this.suppressWidgetCursorChange(u, l)) && (this.view.observer.ignore(() => {
      k.android && k.chrome && n.contains(u.focusNode) && Gv(u.focusNode, n) && (n.blur(), n.focus({ preventScroll: !0 }));
      let f = Ks(this.view.root);
      if (f) if (l.empty) {
        if (k.gecko) {
          let d = Wv(h.node, h.offset);
          if (d && d != 3) {
            let p = (d == 1 ? Op : Ip)(h.node, h.offset);
            p && (h = new Mt(p.node, p.offset));
          }
        }
        f.collapse(h.node, h.offset), l.bidiLevel != null && f.caretBidiLevel !== void 0 && (f.caretBidiLevel = l.bidiLevel);
      } else if (f.extend) {
        f.collapse(h.node, h.offset);
        try {
          f.extend(c.node, c.offset);
        } catch {
        }
      } else {
        let d = document.createRange();
        l.anchor > l.head && ([h, c] = [c, h]), d.setEnd(c.node, c.offset), d.setStart(h.node, h.offset), f.removeAllRanges(), f.addRange(d);
      }
      o && this.view.root.activeElement == n && (n.blur(), s && s.focus());
    }), this.view.observer.setSelectionRange(h, c)), this.impreciseAnchor = h.precise ? null : new Mt(u.anchorNode, u.anchorOffset), this.impreciseHead = c.precise ? null : new Mt(u.focusNode, u.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Ps(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, n = Ks(e.root), { anchorNode: s, anchorOffset: r } = e.observer.selectionRange;
    if (!n || !t.empty || !t.assoc || !n.modify)
      return;
    let o = this.lineAt(t.head, t.assoc);
    if (!o)
      return;
    let a = o.posAtStart;
    if (t.head == a || t.head == a + o.length)
      return;
    let l = this.coordsAt(t.head, -1), h = this.coordsAt(t.head, 1);
    if (!l || !h || l.bottom > h.top)
      return;
    let c = this.domAtPos(t.head + t.assoc, t.assoc);
    n.collapse(c.node, c.offset), n.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let u = e.observer.selectionRange;
    e.docView.posFromDOM(u.anchorNode, u.anchorOffset) != t.from && n.collapse(s, r);
  }
  posFromDOM(e, t) {
    let n = this.tile.nearest(e);
    if (!n)
      return this.tile.dom.compareDocumentPosition(e) & 2 ? 0 : this.view.state.doc.length;
    let s = n.posAtStart;
    if (n.isComposite()) {
      let r;
      if (e == n.dom)
        r = n.dom.childNodes[t];
      else {
        let o = vi(e) == 0 ? 0 : t == 0 ? -1 : 1;
        for (; ; ) {
          let a = e.parentNode;
          if (a == n.dom)
            break;
          o == 0 && a.firstChild != a.lastChild && (e == a.firstChild ? o = -1 : o = 1), e = a;
        }
        o < 0 ? r = e : r = e.nextSibling;
      }
      if (r == n.dom.firstChild)
        return s;
      for (; r && !ye.get(r); )
        r = r.nextSibling;
      if (!r)
        return s + n.length;
      for (let o = 0, a = s; ; o++) {
        let l = n.children[o];
        if (l.dom == r)
          return a;
        a += l.length + l.breakAfter;
      }
    } else return n.isText() ? e == n.dom ? s + t : s + (t ? n.length : 0) : s;
  }
  domAtPos(e, t) {
    let { tile: n, offset: s } = this.tile.resolveBlock(e, t);
    return n.isWidget() ? n.domPosFor(e, t) : n.domIn(s, t);
  }
  inlineDOMNearPos(e, t) {
    let n, s = -1, r = !1, o, a = -1, l = !1;
    return this.tile.blockTiles((h, c) => {
      if (h.isWidget()) {
        if (h.flags & 32 && c >= e)
          return !0;
        h.flags & 16 && (r = !0);
      } else {
        let u = c + h.length;
        if (c <= e && (n = h, s = e - c, r = u < e), u >= e && !o && (o = h, a = e - c, l = c > e), c > e && o)
          return !0;
      }
    }), !n && !o ? this.domAtPos(e, t) : (r && o ? n = null : l && n && (o = null), n && t < 0 || !o ? n.domIn(s, t) : o.domIn(a, t));
  }
  coordsAt(e, t) {
    let { tile: n, offset: s } = this.tile.resolveBlock(e, t);
    return n.isWidget() ? n.widget instanceof Ya ? null : n.coordsInWidget(s, t, !0) : n.coordsIn(s, t);
  }
  lineAt(e, t) {
    let { tile: n } = this.tile.resolveBlock(e, t);
    return n.isLine() ? n : null;
  }
  coordsForChar(e) {
    let { tile: t, offset: n } = this.tile.resolveBlock(e, 1);
    if (!t.isLine())
      return null;
    function s(r, o) {
      if (r.isComposite())
        for (let a of r.children) {
          if (a.length >= o) {
            let l = s(a, o);
            if (l)
              return l;
          }
          if (o -= a.length, o < 0)
            break;
        }
      else if (r.isText() && o < r.length) {
        let a = Ae(r.text, o);
        if (a == o)
          return null;
        let l = qs(r.dom, o, a).getClientRects();
        for (let h = 0; h < l.length; h++) {
          let c = l[h];
          if (h == l.length - 1 || c.top < c.bottom && c.left < c.right)
            return c;
        }
      }
      return null;
    }
    return s(t, n);
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: n, to: s } = e, r = this.view.contentDOM.clientWidth, o = r > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, a = -1, l = this.view.textDirection == ie.LTR, h = 0, c = (u, f, d) => {
      for (let p = 0; p < u.children.length && !(f > s); p++) {
        let m = u.children[p], g = f + m.length, y = m.dom.getBoundingClientRect(), { height: b } = y;
        if (d && !p && (h += y.top - d.top), m instanceof Bi)
          g > n && c(m, f, y);
        else if (f >= n && (h > 0 && t.push(-h), t.push(b + h), h = 0, o)) {
          let v = m.dom.lastChild, T = v ? ao(v) : [];
          if (T.length) {
            let S = T[T.length - 1], A = l ? S.right - y.left : y.right - S.left;
            A > a && (a = A, this.minWidth = r, this.minWidthFrom = f, this.minWidthTo = g);
          }
        }
        d && p == u.children.length - 1 && (h += d.bottom - y.bottom), f = g + m.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? ie.RTL : ie.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((o) => {
      if (o.isLine() && o.children.length && o.length <= 20) {
        let a = 0, l;
        for (let h of o.children) {
          if (!h.isText() || /[^ -~]/.test(h.text))
            return;
          let c = ao(h.dom);
          if (c.length != 1)
            return;
          a += c[0].width, l = c[0].height;
        }
        if (a)
          return {
            lineHeight: o.dom.getBoundingClientRect().height,
            charWidth: a / o.length,
            textHeight: l
          };
      }
    });
    if (e)
      return e;
    let t = document.createElement("div"), n, s, r;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.tile.dom.appendChild(t);
      let o = ao(t.firstChild)[0];
      n = t.getBoundingClientRect().height, s = o && o.width ? o.width / 27 : 7, r = o && o.height ? o.height : n, t.remove();
    }), { lineHeight: n, charWidth: s, textHeight: r };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let n = 0, s = 0; ; s++) {
      let r = s == t.viewports.length ? null : t.viewports[s], o = r ? r.from - 1 : this.view.state.doc.length;
      if (o > n) {
        let a = (t.lineBlockAt(o).bottom - t.lineBlockAt(n).top) / this.view.scaleY;
        e.push(B.replace({
          widget: new Ya(a),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(n, o));
      }
      if (!r)
        break;
      n = r.to + 1;
    }
    return B.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(aa).map((r) => (this.dynamicDecorationMap[e++] = typeof r == "function") ? r(this.view) : r), n = !1, s = this.view.state.facet(sc).map((r, o) => {
      let a = typeof r == "function";
      return a && (n = !0), a ? r(this.view) : r;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = n, t.push(H.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Kp).map((r) => typeof r == "function" ? r(this.view) : r);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let h = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = h.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let h of this.view.state.facet(jp))
      try {
        if (h(this.view, e.range, e))
          return !0;
      } catch (c) {
        ut(this.view.state, c, "scroll handler");
      }
    let { range: t } = e, n = this.coordsAt(t.head, t.empty ? t.assoc : t.head > t.anchor ? -1 : 1), s;
    if (!n)
      return;
    !t.empty && (s = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (n = {
      left: Math.min(n.left, s.left),
      top: Math.min(n.top, s.top),
      right: Math.max(n.right, s.right),
      bottom: Math.max(n.bottom, s.bottom)
    });
    let r = rc(this.view), o = {
      left: n.left - r.left,
      top: n.top - r.top,
      right: n.right + r.right,
      bottom: n.bottom + r.bottom
    }, { offsetWidth: a, offsetHeight: l } = this.view.scrollDOM;
    fv(this.view.scrollDOM, o, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, a), -a), Math.max(Math.min(e.yMargin, l), -l), this.view.textDirection == ie.LTR);
  }
  lineHasWidget(e) {
    let t = (n) => n.isWidget() || n.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    eh(this.tile);
  }
}
function eh(i, e) {
  let t = e == null ? void 0 : e.get(i);
  if (t != 1) {
    t == null && i.destroy();
    for (let n of i.children)
      eh(n, e);
  }
}
function Uv(i) {
  return i.node.nodeType == 1 && i.node.firstChild && (i.offset == 0 || i.node.childNodes[i.offset - 1].contentEditable == "false") && (i.offset == i.node.childNodes.length || i.node.childNodes[i.offset].contentEditable == "false");
}
function Jp(i, e) {
  let t = i.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let n = Op(t.focusNode, t.focusOffset), s = Ip(t.focusNode, t.focusOffset), r = n || s;
  if (s && n && s.node != n.node) {
    let a = ye.get(s.node);
    if (!a || a.isText() && a.text != s.node.nodeValue)
      r = s;
    else if (i.docView.lastCompositionAfterCursor) {
      let l = ye.get(n.node);
      !l || l.isText() && l.text != n.node.nodeValue || (r = s);
    }
  }
  if (i.docView.lastCompositionAfterCursor = r != n, !r)
    return null;
  let o = e - r.offset;
  return { from: o, to: o + r.node.nodeValue.length, node: r.node };
}
function Fv(i, e, t) {
  let n = Jp(i, t);
  if (!n)
    return null;
  let { node: s, from: r, to: o } = n, a = s.nodeValue;
  if (/[\n\r]/.test(a) || i.state.doc.sliceString(n.from, n.to) != a)
    return null;
  let l = e.invertedDesc;
  return { range: new bt(l.mapPos(r), l.mapPos(o), r, o), text: s };
}
function Wv(i, e) {
  return i.nodeType != 1 ? 0 : (e && i.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < i.childNodes.length && i.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let Hv = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    jn(e, t, this.changes);
  }
  comparePoint(e, t) {
    jn(e, t, this.changes);
  }
  boundChange(e) {
    jn(e, e, this.changes);
  }
};
function Vv(i, e, t) {
  let n = new Hv();
  return H.compare(i, e, t, n), n.changes;
}
class jv {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    jn(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    jn(e, e, this.changes);
  }
}
function zv(i, e, t) {
  let n = new jv();
  return H.compare(i, e, t, n), n.changes;
}
function Gv(i, e) {
  for (let t = i; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Kv(i, e) {
  let t = !1;
  return e && i.iterChangedRanges((n, s) => {
    n < e.to && s > e.from && (t = !0);
  }), t;
}
class Ya extends ki {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return e.className = "cm-gap", this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
function qv(i, e, t = 1) {
  let n = i.charCategorizer(e), s = i.doc.lineAt(e), r = e - s.from;
  if (s.length == 0)
    return x.cursor(e);
  r == 0 ? t = 1 : r == s.length && (t = -1);
  let o = r, a = r;
  t < 0 ? o = Ae(s.text, r, !1) : a = Ae(s.text, r);
  let l = n(s.text.slice(o, a));
  for (; o > 0; ) {
    let h = Ae(s.text, o, !1);
    if (n(s.text.slice(h, o)) != l)
      break;
    o = h;
  }
  for (; a < s.length; ) {
    let h = Ae(s.text, a);
    if (n(s.text.slice(a, h)) != l)
      break;
    a = h;
  }
  return x.range(o + s.from, a + s.from);
}
function Yv(i, e, t, n, s) {
  let r = Math.round((n - e.left) * i.defaultCharacterWidth);
  if (i.lineWrapping && t.height > i.defaultLineHeight * 1.5) {
    let a = i.viewState.heightOracle.textHeight, l = Math.floor((s - t.top - (i.defaultLineHeight - a) * 0.5) / a);
    r += l * i.viewState.heightOracle.lineLength;
  }
  let o = i.state.sliceDoc(t.from, t.to);
  return t.from + iv(o, r, i.state.tabSize);
}
function th(i, e, t) {
  let n = i.lineBlockAt(e);
  if (Array.isArray(n.type)) {
    let s;
    for (let r of n.type) {
      if (r.from > e)
        break;
      if (!(r.to < e)) {
        if (r.from < e && r.to > e)
          return r;
        (!s || r.type == Le.Text && (s.type != r.type || (t < 0 ? r.from < e : r.to > e))) && (s = r);
      }
    }
    return s || n;
  }
  return n;
}
function Xv(i, e, t, n) {
  let s = th(i, e.head, e.assoc || -1), r = !n || s.type != Le.Text || !(i.lineWrapping || s.widgetLineBreaks) ? null : i.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (r) {
    let o = i.dom.getBoundingClientRect(), a = i.textDirectionAt(s.from), l = i.posAtCoords({
      x: t == (a == ie.LTR) ? o.right - 1 : o.left + 1,
      y: (r.top + r.bottom) / 2
    });
    if (l != null)
      return x.cursor(l, t ? -1 : 1);
  }
  return x.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function wu(i, e, t, n) {
  let s = i.state.doc.lineAt(e.head), r = i.bidiSpans(s), o = i.textDirectionAt(s.from);
  for (let a = e, l = null; ; ) {
    let h = Av(s, r, o, a, t), c = Pp;
    if (!h) {
      if (s.number == (t ? i.state.doc.lines : 1))
        return a;
      c = `
`, s = i.state.doc.line(s.number + (t ? 1 : -1)), r = i.bidiSpans(s), h = i.visualLineSide(s, !t);
    }
    if (l) {
      if (!l(c))
        return a;
    } else {
      if (!n)
        return h;
      l = n(c);
    }
    a = h;
  }
}
function Jv(i, e, t) {
  let n = i.state.charCategorizer(e), s = n(t);
  return (r) => {
    let o = n(r);
    return s == ae.Space && (s = o), s == o;
  };
}
function Qv(i, e, t, n) {
  let s = e.head, r = t ? 1 : -1;
  if (s == (t ? i.state.doc.length : 0))
    return x.cursor(s, e.assoc);
  let o = e.goalColumn, a, l = i.contentDOM.getBoundingClientRect(), h = i.coordsAtPos(s, e.assoc || -1), c = i.documentTop;
  if (h)
    o == null && (o = h.left - l.left), a = r < 0 ? h.top : h.bottom;
  else {
    let d = i.viewState.lineBlockAt(s);
    o == null && (o = Math.min(l.right - l.left, i.defaultCharacterWidth * (s - d.from))), a = (r < 0 ? d.top : d.bottom) + c;
  }
  let u = l.left + o, f = n ?? i.viewState.heightOracle.textHeight >> 1;
  for (let d = 0; ; d += 10) {
    let p = a + (f + d) * r, m = ih(i, { x: u, y: p }, !1, r);
    return x.cursor(m.pos, m.assoc, void 0, o);
  }
}
function Ds(i, e, t) {
  for (; ; ) {
    let n = 0;
    for (let s of i)
      s.between(e - 1, e + 1, (r, o, a) => {
        if (e > r && e < o) {
          let l = n || t || (e - r < o - e ? -1 : 1);
          e = l < 0 ? r : o, n = l;
        }
      });
    if (!n)
      return e;
  }
}
function Qp(i, e) {
  let t = null;
  for (let n = 0; n < e.ranges.length; n++) {
    let s = e.ranges[n], r = null;
    if (s.empty) {
      let o = Ds(i, s.from, 0);
      o != s.from && (r = x.cursor(o, -1));
    } else {
      let o = Ds(i, s.from, -1), a = Ds(i, s.to, 1);
      (o != s.from || a != s.to) && (r = x.range(s.from == s.anchor ? o : a, s.from == s.head ? o : a));
    }
    r && (t || (t = e.ranges.slice()), t[n] = r);
  }
  return t ? x.create(t, e.mainIndex) : e;
}
function Xa(i, e, t) {
  let n = Ds(i.state.facet(pr).map((s) => s(i)), t.from, e.head > t.from ? -1 : 1);
  return n == t.from ? t : x.cursor(n, n < t.from ? 1 : -1);
}
class Zt {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function ih(i, e, t, n) {
  let s = i.contentDOM.getBoundingClientRect(), r = s.top + i.viewState.paddingTop, { x: o, y: a } = e, l = a - r, h;
  for (; ; ) {
    if (l < 0)
      return new Zt(0, 1);
    if (l > i.viewState.docHeight)
      return new Zt(i.state.doc.length, -1);
    if (h = i.elementAtHeight(l), n == null)
      break;
    if (h.type == Le.Text) {
      let f = i.docView.coordsAt(n < 0 ? h.from : h.to, n);
      if (f && (n < 0 ? f.top <= l + r : f.bottom >= l + r))
        break;
    }
    let u = i.viewState.heightOracle.textHeight / 2;
    l = n > 0 ? h.bottom + u : h.top - u;
  }
  if (i.viewport.from >= h.to || i.viewport.to <= h.from) {
    if (t)
      return null;
    if (h.type == Le.Text) {
      let u = Yv(i, s, h, o, a);
      return new Zt(u, u == h.from ? 1 : -1);
    }
  }
  if (h.type != Le.Text)
    return l < (h.top + h.bottom) / 2 ? new Zt(h.from, 1) : new Zt(h.to, -1);
  let c = i.docView.lineAt(h.from, 2);
  return (!c || c.length != h.length) && (c = i.docView.lineAt(h.from, -2)), Zp(i, c, h.from, o, a);
}
function Zp(i, e, t, n, s) {
  let r = -1, o = null, a = 1e9, l = 1e9, h = s, c = s, u = (f, d) => {
    for (let p = 0; p < f.length; p++) {
      let m = f[p];
      if (m.top == m.bottom)
        continue;
      let g = m.left > n ? m.left - n : m.right < n ? n - m.right : 0, y = m.top > s ? m.top - s : m.bottom < s ? s - m.bottom : 0;
      m.top <= c && m.bottom >= h && (h = Math.min(m.top, h), c = Math.max(m.bottom, c), y = 0), (r < 0 || (y - l || g - a) < 0) && (r >= 0 && l && a < g && o.top <= c - 2 && o.bottom >= h + 2 ? l = 0 : (r = d, a = g, l = y, o = m));
    }
  };
  if (e.isText()) {
    for (let d = 0; d < e.length; ) {
      let p = Ae(e.text, d);
      if (u(qs(e.dom, d, p).getClientRects(), d), !a && !l)
        break;
      d = p;
    }
    return n > (o.left + o.right) / 2 == (Cu(i, r + t) == ie.LTR) ? new Zt(t + Ae(e.text, r), -1) : new Zt(t + r, 1);
  } else {
    if (!e.length)
      return new Zt(t, 1);
    for (let m = 0; m < e.children.length; m++) {
      let g = e.children[m];
      if (g.flags & 48)
        continue;
      let y = (g.dom.nodeType == 1 ? g.dom : qs(g.dom, 0, g.length)).getClientRects();
      if (u(y, m), !a && !l)
        break;
    }
    let f = e.children[r], d = e.posBefore(f, t);
    return f.isComposite() || f.isText() ? Zp(i, f, d, Math.max(o.left, Math.min(o.right, n)), s) : n > (o.left + o.right) / 2 == (Cu(i, r + t) == ie.LTR) ? new Zt(d + f.length, -1) : new Zt(d, 1);
  }
}
function Cu(i, e) {
  let t = i.state.doc.lineAt(e);
  return i.bidiSpans(t)[gi.find(i.bidiSpans(t), e - t.from, -1, 1)].dir;
}
const ws = "￿";
class Zv {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(G.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += ws;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let n = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(n, s);
      let r = this.text.length;
      this.readNode(s);
      let o = ye.get(s), a = s.nextSibling;
      if (a == t) {
        o != null && o.breakAfter && !a && n != this.view.contentDOM && this.lineBreak();
        break;
      }
      let l = ye.get(a);
      (o && l ? o.breakAfter : (o ? o.breakAfter : Co(s)) || Co(a) && (s.nodeName != "BR" || o != null && o.isWidget()) && this.text.length > r) && !tS(a, t) && this.lineBreak(), s = a;
    }
    return this.findPointBefore(n, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let n of this.points)
      n.node == e && (n.pos = this.text.length + Math.min(n.offset, t.length));
    for (let n = 0, s = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let r = -1, o = 1, a;
      if (this.lineSeparator ? (r = t.indexOf(this.lineSeparator, n), o = this.lineSeparator.length) : (a = s.exec(t)) && (r = a.index, o = a[0].length), this.append(t.slice(n, r < 0 ? t.length : r)), r < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let l of this.points)
          l.node == e && l.pos > this.text.length && (l.pos -= o - 1);
      n = r + o;
    }
  }
  readNode(e) {
    let t = ye.get(e), n = t && t.overrideDOMText;
    if (n != null) {
      this.findPointInside(e, n.length);
      for (let s = n.iter(); !s.next().done; )
        s.lineBreak ? this.lineBreak() : this.append(s.value);
    } else e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let n of this.points)
      n.node == e && e.childNodes[n.offset] == t && (n.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let n of this.points)
      (e.nodeType == 3 ? n.node == e : e.contains(n.node)) && (n.pos = this.text.length + (eS(e, n.node, n.offset) ? t : 0));
  }
}
function eS(i, e, t) {
  for (; ; ) {
    if (!e || t < vi(e))
      return !1;
    if (e == i)
      return !0;
    t = Ki(e) + 1, e = e.parentNode;
  }
}
function tS(i, e) {
  let t;
  for (; !(i == e || !i); i = i.nextSibling) {
    let n = ye.get(i);
    if (!(n != null && n.isWidget()))
      return !1;
    n && (t || (t = [])).push(n);
  }
  if (t)
    for (let n of t) {
      let s = n.overrideDOMText;
      if (s != null && s.length)
        return !1;
    }
  return !0;
}
class ku {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class iS {
  constructor(e, t, n, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: r, impreciseAnchor: o } = e.docView;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = em(e.docView.tile, t, n, 0))) {
      let a = r || o ? [] : sS(e), l = new Zv(a, e);
      l.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = l.text, this.newSel = rS(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, l = r && r.node == a.focusNode && r.offset == a.focusOffset || !Yl(e.contentDOM, a.focusNode) ? e.state.selection.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), h = o && o.node == a.anchorNode && o.offset == a.anchorOffset || !Yl(e.contentDOM, a.anchorNode) ? e.state.selection.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), c = e.viewport;
      if ((k.ios || k.chrome) && e.state.selection.main.empty && l != h && (c.from > 0 || c.to < e.state.doc.length)) {
        let u = Math.min(l, h), f = Math.max(l, h), d = c.from - u, p = c.to - f;
        (d == 0 || d == 1 || u == 0) && (p == 0 || p == -1 || f == e.state.doc.length) && (l = 0, h = e.state.doc.length);
      }
      e.inputState.composing > -1 && e.state.selection.ranges.length > 1 ? this.newSel = e.state.selection.replaceRange(x.range(h, l)) : this.newSel = x.single(h, l);
    }
  }
}
function em(i, e, t, n) {
  if (i.isComposite()) {
    let s = -1, r = -1, o = -1, a = -1;
    for (let l = 0, h = n, c = n; l < i.children.length; l++) {
      let u = i.children[l], f = h + u.length;
      if (h < e && f > t)
        return em(u, e, t, h);
      if (f >= e && s == -1 && (s = l, r = h), h > t && u.dom.parentNode == i.dom) {
        o = l, a = c;
        break;
      }
      c = f, h = f + u.breakAfter;
    }
    return {
      from: r,
      to: a < 0 ? n + i.length : a,
      startDOM: (s ? i.children[s - 1].dom.nextSibling : null) || i.dom.firstChild,
      endDOM: o < i.children.length && o >= 0 ? i.children[o].dom : null
    };
  } else return i.isText() ? { from: n, to: n + i.length, startDOM: i.dom, endDOM: i.dom.nextSibling } : null;
}
function tm(i, e) {
  let t, { newSel: n } = e, s = i.state.selection.main, r = i.inputState.lastKeyTime > Date.now() - 100 ? i.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: o, to: a } = e.bounds, l = s.from, h = null;
    (r === 8 || k.android && e.text.length < a - o) && (l = s.to, h = "end");
    let c = im(i.state.doc.sliceString(o, a, ws), e.text, l - o, h);
    c && (k.chrome && r == 13 && c.toB == c.from + 2 && e.text.slice(c.from, c.toB) == ws + ws && c.toB--, t = {
      from: o + c.from,
      to: o + c.toA,
      insert: J.of(e.text.slice(c.from, c.toB).split(ws))
    });
  } else n && (!i.hasFocus && i.state.facet(mi) || n.main.eq(s)) && (n = null);
  if (!t && !n)
    return !1;
  if (!t && e.typeOver && !s.empty && n && n.main.empty ? t = { from: s.from, to: s.to, insert: i.state.doc.slice(s.from, s.to) } : (k.mac || k.android) && t && t.from == t.to && t.from == s.head - 1 && /^\. ?$/.test(t.insert.toString()) && i.contentDOM.getAttribute("autocorrect") == "off" ? (n && t.insert.length == 2 && (n = x.single(n.main.anchor - 1, n.main.head - 1)), t = { from: t.from, to: t.to, insert: J.of([t.insert.toString().replace(".", " ")]) }) : t && t.from >= s.from && t.to <= s.to && (t.from != s.from || t.to != s.to) && s.to - s.from - (t.to - t.from) <= 4 ? t = {
    from: s.from,
    to: s.to,
    insert: i.state.doc.slice(s.from, t.from).append(t.insert).append(i.state.doc.slice(t.to, s.to))
  } : i.state.doc.lineAt(s.from).to < s.to && i.docView.lineHasWidget(s.to) && i.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: s.from,
    to: s.to,
    insert: i.state.toText(i.inputState.insertingText)
  } : k.chrome && t && t.from == t.to && t.from == s.head && t.insert.toString() == `
 ` && i.lineWrapping && (n && (n = x.single(n.main.anchor - 1, n.main.head - 1)), t = { from: s.from, to: s.to, insert: J.of([" "]) }), t)
    return oc(i, t, n, r);
  if (n && !n.main.eq(s)) {
    let o = !1, a = "select";
    return i.inputState.lastSelectionTime > Date.now() - 50 && (i.inputState.lastSelectionOrigin == "select" && (o = !0), a = i.inputState.lastSelectionOrigin, a == "select.pointer" && (n = Qp(i.state.facet(pr).map((l) => l(i)), n))), i.dispatch({ selection: n, scrollIntoView: o, userEvent: a }), !0;
  } else
    return !1;
}
function oc(i, e, t, n = -1) {
  if (k.ios && i.inputState.flushIOSKey(e))
    return !0;
  let s = i.state.selection.main;
  if (k.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && i.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && zn(i.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || n == 8 && e.insert.length < e.to - e.from && e.to > s.head) && zn(i.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && zn(i.contentDOM, "Delete", 46)))
    return !0;
  let r = e.insert.toString();
  i.inputState.composing >= 0 && i.inputState.composing++;
  let o, a = () => o || (o = nS(i, e, t));
  return i.state.facet(Fp).some((l) => l(i, e.from, e.to, r, a)) || i.dispatch(a()), !0;
}
function nS(i, e, t) {
  let n, s = i.state, r = s.selection.main, o = -1;
  if (e.from == e.to && e.from < r.from || e.from > r.to) {
    let l = e.from < r.from ? -1 : 1, h = l < 0 ? r.from : r.to, c = Ds(s.facet(pr).map((u) => u(i)), h, l);
    e.from == c && (o = c);
  }
  if (o > -1)
    n = {
      changes: e,
      selection: x.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= r.from && e.to <= r.to && e.to - e.from >= (r.to - r.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && i.inputState.composing < 0) {
    let l = r.from < e.from ? s.sliceDoc(r.from, e.from) : "", h = r.to > e.to ? s.sliceDoc(e.to, r.to) : "";
    n = s.replaceSelection(i.state.toText(l + e.insert.sliceString(0, void 0, i.state.lineBreak) + h));
  } else {
    let l = s.changes(e), h = t && t.main.to <= l.newLength ? t.main : void 0;
    if (s.selection.ranges.length > 1 && (i.inputState.composing >= 0 || i.inputState.compositionPendingChange) && e.to <= r.to + 10 && e.to >= r.to - 10) {
      let c = i.state.sliceDoc(e.from, e.to), u, f = t && Jp(i, t.main.head);
      if (f) {
        let p = e.insert.length - (e.to - e.from);
        u = { from: f.from, to: f.to - p };
      } else
        u = i.state.doc.lineAt(r.head);
      let d = r.to - e.to;
      n = s.changeByRange((p) => {
        if (p.from == r.from && p.to == r.to)
          return { changes: l, range: h || p.map(l) };
        let m = p.to - d, g = m - c.length;
        if (i.state.sliceDoc(g, m) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        m >= u.from && g <= u.to)
          return { range: p };
        let y = s.changes({ from: g, to: m, insert: e.insert }), b = p.to - r.to;
        return {
          changes: y,
          range: h ? x.range(Math.max(0, h.anchor + b), Math.max(0, h.head + b)) : p.map(y)
        };
      });
    } else
      n = {
        changes: l,
        selection: h && s.selection.replaceRange(h)
      };
  }
  let a = "input.type";
  return (i.composing || i.inputState.compositionPendingChange && i.inputState.compositionEndedAt > Date.now() - 50) && (i.inputState.compositionPendingChange = !1, a += ".compose", i.inputState.compositionFirstChange && (a += ".start", i.inputState.compositionFirstChange = !1)), s.update(n, { userEvent: a, scrollIntoView: !0 });
}
function im(i, e, t, n) {
  let s = Math.min(i.length, e.length), r = 0;
  for (; r < s && i.charCodeAt(r) == e.charCodeAt(r); )
    r++;
  if (r == s && i.length == e.length)
    return null;
  let o = i.length, a = e.length;
  for (; o > 0 && a > 0 && i.charCodeAt(o - 1) == e.charCodeAt(a - 1); )
    o--, a--;
  if (n == "end") {
    let l = Math.max(0, r - Math.min(o, a));
    t -= o + l - r;
  }
  if (o < r && i.length < e.length) {
    let l = t <= r && t >= o ? r - t : 0;
    r -= l, a = r + (a - o), o = r;
  } else if (a < r) {
    let l = t <= r && t >= a ? r - t : 0;
    r -= l, o = r + (o - a), a = r;
  }
  return { from: r, toA: o, toB: a };
}
function sS(i) {
  let e = [];
  if (i.root.activeElement != i.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: r } = i.observer.selectionRange;
  return t && (e.push(new ku(t, n)), (s != t || r != n) && e.push(new ku(s, r))), e;
}
function rS(i, e) {
  if (i.length == 0)
    return null;
  let t = i[0].pos, n = i.length == 2 ? i[1].pos : t;
  return t > -1 && n > -1 ? x.single(t + e, n + e) : null;
}
class oS {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.lastTouchTime = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.pendingIOSKey = void 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, k.safari && e.contentDOM.addEventListener("input", () => null), k.gecko && TS(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !pS(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
  }
  runHandlers(e, t) {
    let n = this.handlers[e];
    if (n) {
      for (let s of n.observers)
        s(this.view, t);
      for (let s of n.handlers) {
        if (t.defaultPrevented)
          break;
        if (s(this.view, t)) {
          t.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(e) {
    let t = aS(e), n = this.handlers, s = this.view.contentDOM;
    for (let r in t)
      if (r != "scroll") {
        let o = !t[r].handlers.length, a = n[r];
        a && o != !a.handlers.length && (s.removeEventListener(r, this.handleEvent), a = null), a || s.addEventListener(r, this.handleEvent, { passive: o });
      }
    for (let r in n)
      r != "scroll" && !t[r] && s.removeEventListener(r, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && sm.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), k.android && k.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    let t;
    return k.ios && !e.synthetic && !e.altKey && !e.metaKey && ((t = nm.find((n) => n.keyCode == e.keyCode)) && !e.ctrlKey || lS.indexOf(e.key) > -1 && e.ctrlKey && !e.shiftKey) ? (this.pendingIOSKey = t || e, setTimeout(() => this.flushIOSKey(), 250), !0) : (e.keyCode != 229 && this.view.observer.forceFlush(), !1);
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, zn(this.view.contentDOM, t.key, t.keyCode, t instanceof KeyboardEvent ? t : void 0));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : k.safari && !k.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.view.observer.update(e), this.mouseSelection && this.mouseSelection.update(e), this.draggedContent && e.docChanged && (this.draggedContent = this.draggedContent.map(e.changes)), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function _u(i, e) {
  return (t, n) => {
    try {
      return e.call(i, n, t);
    } catch (s) {
      ut(t.state, s);
    }
  };
}
function aS(i) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(n) {
    return e[n] || (e[n] = { observers: [], handlers: [] });
  }
  for (let n of i) {
    let s = n.spec, r = s && s.plugin.domEventHandlers, o = s && s.plugin.domEventObservers;
    if (r)
      for (let a in r) {
        let l = r[a];
        l && t(a).handlers.push(_u(n.value, l));
      }
    if (o)
      for (let a in o) {
        let l = o[a];
        l && t(a).observers.push(_u(n.value, l));
      }
  }
  for (let n in $t)
    t(n).handlers.push($t[n]);
  for (let n in At)
    t(n).observers.push(At[n]);
  return e;
}
const nm = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], lS = "dthko", sm = [16, 17, 18, 20, 91, 92, 224, 225], Lr = 6;
function Pr(i) {
  return Math.max(0, i) * 0.7 + 8;
}
function hS(i, e) {
  return Math.max(Math.abs(i.clientX - e.clientX), Math.abs(i.clientY - e.clientY));
}
class cS {
  constructor(e, t, n, s) {
    this.view = e, this.startEvent = t, this.style = n, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = dv(e.contentDOM), this.atoms = e.state.facet(pr).map((o) => o(e));
    let r = e.contentDOM.ownerDocument;
    r.addEventListener("mousemove", this.move = this.move.bind(this)), r.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(G.allowMultipleSelections) && uS(e, t), this.dragging = dS(e, t) && am(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && hS(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, n = 0, s = 0, r = 0, o = this.view.win.innerWidth, a = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: o } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: r, bottom: a } = this.scrollParents.y.getBoundingClientRect());
    let l = rc(this.view);
    e.clientX - l.left <= s + Lr ? t = -Pr(s - e.clientX) : e.clientX + l.right >= o - Lr && (t = Pr(e.clientX - o)), e.clientY - l.top <= r + Lr ? n = -Pr(r - e.clientY) : e.clientY + l.bottom >= a - Lr && (n = Pr(e.clientY - a)), this.setScrollSpeed(t, n);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(e, t) {
    this.scrollSpeed = { x: e, y: t }, e || t ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: e, y: t } = this.scrollSpeed;
    e && this.scrollParents.x && (this.scrollParents.x.scrollLeft += e, e = 0), t && this.scrollParents.y && (this.scrollParents.y.scrollTop += t, t = 0), (e || t) && this.view.win.scrollBy(e, t), this.dragging === !1 && this.select(this.lastEvent);
  }
  select(e) {
    let { view: t } = this, n = Qp(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !n.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: n,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function uS(i, e) {
  let t = i.state.facet(Dp);
  return t.length ? t[0](e) : k.mac ? e.metaKey : e.ctrlKey;
}
function fS(i, e) {
  let t = i.state.facet($p);
  return t.length ? t[0](e) : k.mac ? !e.altKey : !e.ctrlKey;
}
function dS(i, e) {
  let { main: t } = i.state.selection;
  if (t.empty)
    return !1;
  let n = Ks(i.root);
  if (!n || n.rangeCount == 0)
    return !0;
  let s = n.getRangeAt(0).getClientRects();
  for (let r = 0; r < s.length; r++) {
    let o = s[r];
    if (o.left <= e.clientX && o.right >= e.clientX && o.top <= e.clientY && o.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function pS(i, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, n; t != i.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (n = ye.get(t)) && n.isWidget() && !n.isHidden && n.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const $t = /* @__PURE__ */ Object.create(null), At = /* @__PURE__ */ Object.create(null), rm = k.ie && k.ie_version < 15 || k.ios && k.webkit_version < 604;
function mS(i) {
  let e = i.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    i.focus(), t.remove(), om(i, t.value);
  }, 50);
}
function ca(i, e, t) {
  for (let n of i.facet(e))
    t = n(t, i);
  return t;
}
function om(i, e) {
  e = ca(i.state, tc, e);
  let { state: t } = i, n, s = 1, r = t.toText(e), o = r.lines == t.selection.ranges.length;
  if (nh != null && t.selection.ranges.every((l) => l.empty) && nh == r.toString()) {
    let l = -1;
    n = t.changeByRange((h) => {
      let c = t.doc.lineAt(h.from);
      if (c.from == l)
        return { range: h };
      l = c.from;
      let u = t.toText((o ? r.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: u },
        range: x.cursor(h.from + u.length)
      };
    });
  } else o ? n = t.changeByRange((l) => {
    let h = r.line(s++);
    return {
      changes: { from: l.from, to: l.to, insert: h.text },
      range: x.cursor(l.from + h.length)
    };
  }) : n = t.replaceSelection(r);
  i.dispatch(n, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
At.scroll = (i) => {
  i.inputState.lastScrollTop = i.scrollDOM.scrollTop, i.inputState.lastScrollLeft = i.scrollDOM.scrollLeft;
};
$t.keydown = (i, e) => (i.inputState.setSelectionOrigin("select"), e.keyCode == 27 && i.inputState.tabFocusMode != 0 && (i.inputState.tabFocusMode = Date.now() + 2e3), !1);
At.touchstart = (i, e) => {
  i.inputState.lastTouchTime = Date.now(), i.inputState.setSelectionOrigin("select.pointer");
};
At.touchmove = (i) => {
  i.inputState.setSelectionOrigin("select.pointer");
};
$t.mousedown = (i, e) => {
  if (i.observer.flush(), i.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let n of i.state.facet(Bp))
    if (t = n(i, e), t)
      break;
  if (!t && e.button == 0 && (t = yS(i, e)), t) {
    let n = !i.hasFocus;
    i.inputState.startMouseSelection(new cS(i, e, t, n)), n && i.observer.ignore(() => {
      kp(i.contentDOM);
      let r = i.root.activeElement;
      r && !r.contains(i.contentDOM) && r.blur();
    });
    let s = i.inputState.mouseSelection;
    if (s)
      return s.start(e), s.dragging === !1;
  } else
    i.inputState.setSelectionOrigin("select.pointer");
  return !1;
};
function Ou(i, e, t, n) {
  if (n == 1)
    return x.cursor(e, t);
  if (n == 2)
    return qv(i.state, e, t);
  {
    let s = i.docView.lineAt(e, t), r = i.state.doc.lineAt(s ? s.posAtEnd : e), o = s ? s.posAtStart : r.from, a = s ? s.posAtEnd : r.to;
    return a < i.state.doc.length && a == r.to && a++, x.range(o, a);
  }
}
const gS = k.ie && k.ie_version <= 11;
let Iu = null, Ru = 0, Nu = 0;
function am(i) {
  if (!gS)
    return i.detail;
  let e = Iu, t = Nu;
  return Iu = i, Nu = Date.now(), Ru = !e || t > Date.now() - 400 && Math.abs(e.clientX - i.clientX) < 2 && Math.abs(e.clientY - i.clientY) < 2 ? (Ru + 1) % 3 : 1;
}
function yS(i, e) {
  let t = i.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), n = am(e), s = i.state.selection;
  return {
    update(r) {
      r.docChanged && (t.pos = r.changes.mapPos(t.pos), s = s.map(r.changes));
    },
    get(r, o, a) {
      let l = i.posAndSideAtCoords({ x: r.clientX, y: r.clientY }, !1), h, c = Ou(i, l.pos, l.assoc, n);
      if (t.pos != l.pos && !o) {
        let u = Ou(i, t.pos, t.assoc, n), f = Math.min(u.from, c.from), d = Math.max(u.to, c.to);
        c = f < c.from ? x.range(f, d) : x.range(d, f);
      }
      return o ? s.replaceRange(s.main.extend(c.from, c.to)) : a && n == 1 && s.ranges.length > 1 && (h = bS(s, l.pos)) ? h : a ? s.addRange(c) : x.create([c]);
    }
  };
}
function bS(i, e) {
  for (let t = 0; t < i.ranges.length; t++) {
    let { from: n, to: s } = i.ranges[t];
    if (n <= e && s >= e)
      return x.create(i.ranges.slice(0, t).concat(i.ranges.slice(t + 1)), i.mainIndex == t ? 0 : i.mainIndex - (i.mainIndex > t ? 1 : 0));
  }
  return null;
}
$t.dragstart = (i, e) => {
  let { selection: { main: t } } = i.state;
  if (e.target.draggable) {
    let s = i.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let r = s.posAtStart, o = r + s.length;
      (r >= t.to || o <= t.from) && (t = x.range(r, o));
    }
  }
  let { inputState: n } = i;
  return n.mouseSelection && (n.mouseSelection.dragging = !0), n.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", ca(i.state, ic, i.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
$t.dragend = (i) => (i.inputState.draggedContent = null, !1);
function Mu(i, e, t, n) {
  if (t = ca(i.state, tc, t), !t)
    return;
  let s = i.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: r } = i.inputState, o = n && r && fS(i, e) ? { from: r.from, to: r.to } : null, a = { from: s, insert: t }, l = i.state.changes(o ? [o, a] : a);
  i.focus(), i.dispatch({
    changes: l,
    selection: { anchor: l.mapPos(s, -1), head: l.mapPos(s, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  }), i.inputState.draggedContent = null;
}
$t.drop = (i, e) => {
  if (!e.dataTransfer)
    return !1;
  if (i.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let n = Array(t.length), s = 0, r = () => {
      ++s == t.length && Mu(i, e, n.filter((o) => o != null).join(i.state.lineBreak), !1);
    };
    for (let o = 0; o < t.length; o++) {
      let a = new FileReader();
      a.onerror = r, a.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(a.result) || (n[o] = a.result), r();
      }, a.readAsText(t[o]);
    }
    return !0;
  } else {
    let n = e.dataTransfer.getData("Text");
    if (n)
      return Mu(i, e, n, !0), !0;
  }
  return !1;
};
$t.paste = (i, e) => {
  if (i.state.readOnly)
    return !0;
  i.observer.flush();
  let t = rm ? null : e.clipboardData;
  return t ? (om(i, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (mS(i), !1);
};
function vS(i, e) {
  let t = i.dom.parentNode;
  if (!t)
    return;
  let n = t.appendChild(document.createElement("textarea"));
  n.style.cssText = "position: fixed; left: -10000px; top: 10px", n.value = e, n.focus(), n.selectionEnd = e.length, n.selectionStart = 0, setTimeout(() => {
    n.remove(), i.focus();
  }, 50);
}
function SS(i) {
  let e = [], t = [], n = !1;
  for (let s of i.selection.ranges)
    s.empty || (e.push(i.sliceDoc(s.from, s.to)), t.push(s));
  if (!e.length) {
    let s = -1;
    for (let { from: r } of i.selection.ranges) {
      let o = i.doc.lineAt(r);
      o.number > s && (e.push(o.text), t.push({ from: o.from, to: Math.min(i.doc.length, o.to + 1) })), s = o.number;
    }
    n = !0;
  }
  return { text: ca(i, ic, e.join(i.lineBreak)), ranges: t, linewise: n };
}
let nh = null;
$t.copy = $t.cut = (i, e) => {
  let { text: t, ranges: n, linewise: s } = SS(i.state);
  if (!t && !s)
    return !1;
  nh = s ? t : null, e.type == "cut" && !i.state.readOnly && i.dispatch({
    changes: n,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let r = rm ? null : e.clipboardData;
  return r ? (r.clearData(), r.setData("text/plain", t), !0) : (vS(i, t), !1);
};
const lm = /* @__PURE__ */ wi.define();
function hm(i, e) {
  let t = [];
  for (let n of i.facet(Wp)) {
    let s = n(i, e);
    s && t.push(s);
  }
  return t.length ? i.update({ effects: t, annotations: lm.of(!0) }) : null;
}
function cm(i) {
  setTimeout(() => {
    let e = i.hasFocus;
    if (e != i.inputState.notifiedFocused) {
      let t = hm(i.state, e);
      t ? i.dispatch(t) : i.update([]);
    }
  }, 10);
}
At.focus = (i) => {
  i.inputState.lastFocusTime = Date.now(), !i.scrollDOM.scrollTop && (i.inputState.lastScrollTop || i.inputState.lastScrollLeft) && (i.scrollDOM.scrollTop = i.inputState.lastScrollTop, i.scrollDOM.scrollLeft = i.inputState.lastScrollLeft), cm(i);
};
At.blur = (i) => {
  i.observer.clearSelectionRange(), cm(i);
};
At.compositionstart = At.compositionupdate = (i) => {
  i.observer.editContext || (i.inputState.compositionFirstChange == null && (i.inputState.compositionFirstChange = !0), i.inputState.composing < 0 && (i.inputState.composing = 0));
};
At.compositionend = (i) => {
  i.observer.editContext || (i.inputState.composing = -1, i.inputState.compositionEndedAt = Date.now(), i.inputState.compositionPendingKey = !0, i.inputState.compositionPendingChange = i.observer.pendingRecords().length > 0, i.inputState.compositionFirstChange = null, k.chrome && k.android ? i.observer.flushSoon() : i.inputState.compositionPendingChange ? Promise.resolve().then(() => i.observer.flush()) : setTimeout(() => {
    i.inputState.composing < 0 && i.docView.hasComposition && i.update([]);
  }, 50));
};
At.contextmenu = (i) => {
  i.inputState.lastContextMenu = Date.now();
};
$t.beforeinput = (i, e) => {
  var t, n;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (i.inputState.insertingText = e.data, i.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && i.observer.editContext) {
    let r = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), o = e.getTargetRanges();
    if (r && o.length) {
      let a = o[0], l = i.posAtDOM(a.startContainer, a.startOffset), h = i.posAtDOM(a.endContainer, a.endOffset);
      return oc(i, { from: l, to: h, insert: i.state.toText(r) }, null), !0;
    }
  }
  let s;
  if (k.chrome && k.android && (s = nm.find((r) => r.inputType == e.inputType)) && (i.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let r = ((n = window.visualViewport) === null || n === void 0 ? void 0 : n.height) || 0;
    setTimeout(() => {
      var o;
      (((o = window.visualViewport) === null || o === void 0 ? void 0 : o.height) || 0) > r + 10 && i.hasFocus && (i.contentDOM.blur(), i.focus());
    }, 100);
  }
  return k.ios && e.inputType == "deleteContentForward" && i.observer.flushSoon(), k.safari && e.inputType == "insertText" && i.inputState.composing >= 0 && setTimeout(() => At.compositionend(i, e), 20), !1;
};
const Lu = /* @__PURE__ */ new Set();
function TS(i) {
  Lu.has(i) || (Lu.add(i), i.addEventListener("copy", () => {
  }), i.addEventListener("cut", () => {
  }));
}
const Pu = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let Zn = !1;
function Du() {
  Zn = !1;
}
class xS {
  constructor(e) {
    this.lineWrapping = e, this.doc = J.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let n = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (n += Math.max(0, Math.ceil((t - e - n * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * n;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / Math.max(1, this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return Pu.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      s < 0 ? n++ : this.heightSamples[Math.floor(s * 10)] || (t = !0, this.heightSamples[Math.floor(s * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, n, s, r, o) {
    let a = Pu.indexOf(e) > -1, l = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != a || Math.abs(n - this.charWidth) > 0.1;
    if (this.lineWrapping = a, this.lineHeight = t, this.charWidth = n, this.textHeight = s, this.lineLength = r, l) {
      this.heightSamples = {};
      for (let h = 0; h < o.length; h++) {
        let c = o[h];
        c < 0 ? h++ : this.heightSamples[Math.floor(c * 10)] = !0;
      }
    }
    return l;
  }
}
class ES {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class Nt {
  /**
  @internal
  */
  constructor(e, t, n, s, r) {
    this.from = e, this.length = t, this.top = n, this.height = s, this._content = r;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? Le.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof gn ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(e) {
    let t = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(e._content) ? e._content : [e]);
    return new Nt(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var te = /* @__PURE__ */ function(i) {
  return i[i.ByPos = 0] = "ByPos", i[i.ByHeight = 1] = "ByHeight", i[i.ByPosNoHeight = 2] = "ByPosNoHeight", i;
}(te || (te = {}));
const lo = 1e-3;
class ze {
  constructor(e, t, n = 2) {
    this.length = e, this.height = t, this.flags = n;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > lo && (Zn = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, n) {
    return ze.of(n);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, n, s) {
    let r = this, o = n.doc;
    for (let a = s.length - 1; a >= 0; a--) {
      let { fromA: l, toA: h, fromB: c, toB: u } = s[a], f = r.lineAt(l, te.ByPosNoHeight, n.setDoc(t), 0, 0), d = f.to >= h ? f : r.lineAt(h, te.ByPosNoHeight, n, 0, 0);
      for (u += d.to - h, h = d.to; a > 0 && f.from <= s[a - 1].toA; )
        l = s[a - 1].fromA, c = s[a - 1].fromB, a--, l < f.from && (f = r.lineAt(l, te.ByPosNoHeight, n, 0, 0));
      c += f.from - l, l = f.from;
      let p = ac.build(n.setDoc(o), e, c, u);
      r = Ro(r, r.replace(l, h, p));
    }
    return r.updateHeight(n, 0);
  }
  static empty() {
    return new ct(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, n = e.length, s = 0, r = 0;
    for (; ; )
      if (t == n)
        if (s > r * 2) {
          let a = e[t - 1];
          a.break ? e.splice(--t, 1, a.left, null, a.right) : e.splice(--t, 1, a.left, a.right), n += 1 + a.break, s -= a.size;
        } else if (r > s * 2) {
          let a = e[n];
          a.break ? e.splice(n, 1, a.left, null, a.right) : e.splice(n, 1, a.left, a.right), n += 2 + a.break, r -= a.size;
        } else
          break;
      else if (s < r) {
        let a = e[t++];
        a && (s += a.size);
      } else {
        let a = e[--n];
        a && (r += a.size);
      }
    let o = 0;
    return e[t - 1] == null ? (o = 1, t--) : e[t] == null && (o = 1, n++), new wS(ze.of(e.slice(0, t)), o, ze.of(e.slice(n)));
  }
}
function Ro(i, e) {
  return i == e ? i : (i.constructor != e.constructor && (Zn = !0), e);
}
ze.prototype.size = 1;
const AS = /* @__PURE__ */ B.replace({});
class um extends ze {
  constructor(e, t, n) {
    super(e, t), this.deco = n, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new Nt(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, n, s) {
    return this.spaceAbove && e < n + this.spaceAbove ? new Nt(s, 0, n, this.spaceAbove, AS) : this.mainBlock(n, s);
  }
  lineAt(e, t, n, s, r) {
    let o = this.mainBlock(s, r);
    return this.spaceAbove ? this.blockAt(0, n, s, r).join(o) : o;
  }
  forEachLine(e, t, n, s, r, o) {
    e <= r + this.length && t >= r && o(this.lineAt(0, te.ByPos, n, s, r));
  }
  setMeasuredHeight(e) {
    let t = e.heights[e.index++];
    t < 0 ? (this.spaceAbove = -t, t = e.heights[e.index++]) : this.spaceAbove = 0, this.setHeight(t);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more && this.setMeasuredHeight(s), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class ct extends um {
  constructor(e, t, n) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = n;
  }
  mainBlock(e, t) {
    return new Nt(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, n) {
    let s = n[0];
    return n.length == 1 && (s instanceof ct || s instanceof Re && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof Re ? s = new ct(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : ze.of(n);
  }
  updateHeight(e, t = 0, n = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (n || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class Re extends ze {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let n = e.doc.lineAt(t).number, s = e.doc.lineAt(t + this.length).number, r = s - n + 1, o, a = 0;
    if (e.lineWrapping) {
      let l = Math.min(this.height, e.lineHeight * r);
      o = l / r, this.length > r + 1 && (a = (this.height - l) / (this.length - r - 1));
    } else
      o = this.height / r;
    return { firstLine: n, lastLine: s, perLine: o, perChar: a };
  }
  blockAt(e, t, n, s) {
    let { firstLine: r, lastLine: o, perLine: a, perChar: l } = this.heightMetrics(t, s);
    if (t.lineWrapping) {
      let h = s + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - n) / this.height)) * this.length)), c = t.doc.lineAt(h), u = a + c.length * l, f = Math.max(n, e - u / 2);
      return new Nt(c.from, c.length, f, u, 0);
    } else {
      let h = Math.max(0, Math.min(o - r, Math.floor((e - n) / a))), { from: c, length: u } = t.doc.line(r + h);
      return new Nt(c, u, n + a * h, a, 0);
    }
  }
  lineAt(e, t, n, s, r) {
    if (t == te.ByHeight)
      return this.blockAt(e, n, s, r);
    if (t == te.ByPosNoHeight) {
      let { from: d, to: p } = n.doc.lineAt(e);
      return new Nt(d, p - d, 0, 0, 0);
    }
    let { firstLine: o, perLine: a, perChar: l } = this.heightMetrics(n, r), h = n.doc.lineAt(e), c = a + h.length * l, u = h.number - o, f = s + a * u + l * (h.from - r - u);
    return new Nt(h.from, h.length, Math.max(s, Math.min(f, s + this.height - c)), c, 0);
  }
  forEachLine(e, t, n, s, r, o) {
    e = Math.max(e, r), t = Math.min(t, r + this.length);
    let { firstLine: a, perLine: l, perChar: h } = this.heightMetrics(n, r);
    for (let c = e, u = s; c <= t; ) {
      let f = n.doc.lineAt(c);
      if (c == e) {
        let p = f.number - a;
        u += l * p + h * (e - r - p);
      }
      let d = l + h * f.length;
      o(new Nt(f.from, f.length, u, d, 0)), u += d, c = f.to + 1;
    }
  }
  replace(e, t, n) {
    let s = this.length - t;
    if (s > 0) {
      let r = n[n.length - 1];
      r instanceof Re ? n[n.length - 1] = new Re(r.length + s) : n.push(null, new Re(s - 1));
    }
    if (e > 0) {
      let r = n[0];
      r instanceof Re ? n[0] = new Re(e + r.length) : n.unshift(new Re(e - 1), null);
    }
    return ze.of(n);
  }
  decomposeLeft(e, t) {
    t.push(new Re(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new Re(this.length - e - 1));
  }
  updateHeight(e, t = 0, n = !1, s) {
    let r = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let o = [], a = Math.max(t, s.from), l = -1;
      for (s.from > t && o.push(new Re(s.from - t - 1).updateHeight(e, t)); a <= r && s.more; ) {
        let c = e.doc.lineAt(a).length;
        o.length && o.push(null);
        let u = s.heights[s.index++], f = 0;
        u < 0 && (f = -u, u = s.heights[s.index++]), l == -1 ? l = u : Math.abs(u - l) >= lo && (l = -2);
        let d = new ct(c, u, f);
        d.outdated = !1, o.push(d), a += c + 1;
      }
      a <= r && o.push(null, new Re(r - a).updateHeight(e, a));
      let h = ze.of(o);
      return (l < 0 || Math.abs(h.height - this.height) >= lo || Math.abs(l - this.heightMetrics(e, t).perLine) >= lo) && (Zn = !0), Ro(this, h);
    } else (n || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class wS extends ze {
  constructor(e, t, n) {
    super(e.length + t + n.length, e.height + n.height, t | (e.outdated || n.outdated ? 2 : 0)), this.left = e, this.right = n, this.size = e.size + n.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, n, s) {
    let r = n + this.left.height;
    return e < r ? this.left.blockAt(e, t, n, s) : this.right.blockAt(e, t, r, s + this.left.length + this.break);
  }
  lineAt(e, t, n, s, r) {
    let o = s + this.left.height, a = r + this.left.length + this.break, l = t == te.ByHeight ? e < o : e < a, h = l ? this.left.lineAt(e, t, n, s, r) : this.right.lineAt(e, t, n, o, a);
    if (this.break || (l ? h.to < a : h.from > a))
      return h;
    let c = t == te.ByPosNoHeight ? te.ByPosNoHeight : te.ByPos;
    return l ? h.join(this.right.lineAt(a, c, n, o, a)) : this.left.lineAt(a, c, n, s, r).join(h);
  }
  forEachLine(e, t, n, s, r, o) {
    let a = s + this.left.height, l = r + this.left.length + this.break;
    if (this.break)
      e < l && this.left.forEachLine(e, t, n, s, r, o), t >= l && this.right.forEachLine(e, t, n, a, l, o);
    else {
      let h = this.lineAt(l, te.ByPos, n, s, r);
      e < h.from && this.left.forEachLine(e, h.from - 1, n, s, r, o), h.to >= e && h.from <= t && o(h), t > h.to && this.right.forEachLine(h.to + 1, t, n, a, l, o);
    }
  }
  replace(e, t, n) {
    let s = this.left.length + this.break;
    if (t < s)
      return this.balanced(this.left.replace(e, t, n), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - s, t - s, n));
    let r = [];
    e > 0 && this.decomposeLeft(e, r);
    let o = r.length;
    for (let a of n)
      r.push(a);
    if (e > 0 && $u(r, o - 1), t < this.length) {
      let a = r.length;
      this.decomposeRight(t, r), $u(r, a);
    }
    return ze.of(r);
  }
  decomposeLeft(e, t) {
    let n = this.left.length;
    if (e <= n)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (n++, e >= n && t.push(null)), e > n && this.right.decomposeLeft(e - n, t);
  }
  decomposeRight(e, t) {
    let n = this.left.length, s = n + this.break;
    if (e >= s)
      return this.right.decomposeRight(e - s, t);
    e < n && this.left.decomposeRight(e, t), this.break && e < s && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? ze.of(this.break ? [e, null, t] : [e, t]) : (this.left = Ro(this.left, e), this.right = Ro(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, n = !1, s) {
    let { left: r, right: o } = this, a = t + r.length + this.break, l = null;
    return s && s.from <= t + r.length && s.more ? l = r = r.updateHeight(e, t, n, s) : r.updateHeight(e, t, n), s && s.from <= a + o.length && s.more ? l = o = o.updateHeight(e, a, n, s) : o.updateHeight(e, a, n), l ? this.balanced(r, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function $u(i, e) {
  let t, n;
  i[e] == null && (t = i[e - 1]) instanceof Re && (n = i[e + 1]) instanceof Re && i.splice(e - 1, 3, new Re(t.length + 1 + n.length));
}
const CS = 5;
class ac {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let n = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof ct ? s.length += n - this.pos : (n > this.pos || !this.isCovered) && this.nodes.push(new ct(n - this.pos, -1, 0)), this.writtenTo = n, t > n && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, n) {
    if (e < t || n.heightRelevant) {
      let s = n.widget ? n.widget.estimatedHeight : 0, r = n.widget ? n.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let o = t - e;
      n.block ? this.addBlock(new um(o, s, n)) : (o || r || s >= CS) && this.addLineDeco(s, r, o);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new ct(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let n = new Re(t - e);
    return this.oracle.doc.lineAt(e).to == t && (n.flags |= 4), n;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof ct)
      return e;
    let t = new ct(0, -1, 0);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, n) {
    let s = this.ensureLine();
    s.length += n, s.collapsed += n, s.widgetHeight = Math.max(s.widgetHeight, e), s.breaks += t, this.writtenTo = this.pos = this.pos + n;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof ct) && !this.isCovered ? this.nodes.push(new ct(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let n = e;
    for (let s of this.nodes)
      s instanceof ct && s.updateHeight(this.oracle, n), n += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, n, s) {
    let r = new ac(n, e);
    return H.spans(t, n, s, r, 0), r.finish(n);
  }
}
function kS(i, e, t) {
  let n = new _S();
  return H.compare(i, e, t, n, 0), n.changes;
}
class _S {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, n, s) {
    (e < t || n && n.heightRelevant || s && s.heightRelevant) && jn(e, t, this.changes, 5);
  }
}
function OS(i, e) {
  let t = i.getBoundingClientRect(), n = i.ownerDocument, s = n.defaultView || window, r = Math.max(0, t.left), o = Math.min(s.innerWidth, t.right), a = Math.max(0, t.top), l = Math.min(s.innerHeight, t.bottom);
  for (let h = i.parentNode; h && h != n.body; )
    if (h.nodeType == 1) {
      let c = h, u = window.getComputedStyle(c);
      if ((c.scrollHeight > c.clientHeight || c.scrollWidth > c.clientWidth) && u.overflow != "visible") {
        let f = c.getBoundingClientRect();
        r = Math.max(r, f.left), o = Math.min(o, f.right), a = Math.max(a, f.top), l = Math.min(h == i.parentNode ? s.innerHeight : l, f.bottom);
      }
      h = u.position == "absolute" || u.position == "fixed" ? c.offsetParent : c.parentNode;
    } else if (h.nodeType == 11)
      h = h.host;
    else
      break;
  return {
    left: r - t.left,
    right: Math.max(r, o) - t.left,
    top: a - (t.top + e),
    bottom: Math.max(a, l) - (t.top + e)
  };
}
function IS(i) {
  let e = i.getBoundingClientRect(), t = i.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function RS(i, e) {
  let t = i.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Ja {
  constructor(e, t, n, s) {
    this.from = e, this.to = t, this.size = n, this.displaySize = s;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let n = 0; n < e.length; n++) {
      let s = e[n], r = t[n];
      if (s.from != r.from || s.to != r.to || s.size != r.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return B.replace({
      widget: new NS(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class NS extends ki {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class Bu {
  constructor(e) {
    this.state = e, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scrollTop = 0, this.scrolledToBottom = !1, this.scaleX = 1, this.scaleY = 1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Uu, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = ie.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let t = e.facet(nc).some((n) => typeof n != "function" && n.class == "cm-lineWrapping");
    this.heightOracle = new xS(t), this.stateDeco = Fu(e), this.heightMap = ze.empty().applyChanges(this.stateDeco, J.empty, this.heightOracle.setDoc(e.doc), [new bt(0, 0, 0, e.doc.length)]);
    for (let n = 0; n < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); n++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = B.set(this.lineGaps.map((n) => n.draw(this, !1))), this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let n = 0; n <= 1; n++) {
      let s = n ? t.head : t.anchor;
      if (!e.some(({ from: r, to: o }) => s >= r && s <= o)) {
        let { from: r, to: o } = this.lineBlockAt(s);
        e.push(new Dr(r, o));
      }
    }
    return this.viewports = e.sort((n, s) => n.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Uu : new lc(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Cs(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let n = this.stateDeco;
    this.stateDeco = Fu(this.state);
    let s = e.changedRanges, r = bt.extendWithRanges(s, kS(n, this.stateDeco, e ? e.changes : xe.empty(this.state.doc.length))), o = this.heightMap.height, a = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
    Du(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), r), (this.heightMap.height != o || Zn) && (e.flags |= 2), a ? (this.scrollAnchorPos = e.changes.mapPos(a.from, -1), this.scrollAnchorHeight = a.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = o);
    let l = r.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < l.from || t.range.head > l.to) || !this.viewportIsAppropriate(l)) && (l = this.getViewport(0, t));
    let h = l.from != this.viewport.from || l.to != this.viewport.to;
    this.viewport = l, e.flags |= this.updateForViewport(), (h || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(Vp) && (this.mustEnforceCursorAssoc = !0);
  }
  measure(e) {
    let t = e.contentDOM, n = window.getComputedStyle(t), s = this.heightOracle, r = n.whiteSpace;
    this.defaultTextDirection = n.direction == "rtl" ? ie.RTL : ie.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(r) || this.mustMeasureContent, a = t.getBoundingClientRect(), l = o || this.mustMeasureContent || this.contentDOMHeight != a.height;
    this.contentDOMHeight = a.height, this.mustMeasureContent = !1;
    let h = 0, c = 0;
    if (a.width && a.height) {
      let { scaleX: T, scaleY: S } = Cp(t, a);
      (T > 5e-3 && Math.abs(this.scaleX - T) > 5e-3 || S > 5e-3 && Math.abs(this.scaleY - S) > 5e-3) && (this.scaleX = T, this.scaleY = S, h |= 16, o = l = !0);
    }
    let u = (parseInt(n.paddingTop) || 0) * this.scaleY, f = (parseInt(n.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != u || this.paddingBottom != f) && (this.paddingTop = u, this.paddingBottom = f, h |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (l = !0), this.editorWidth = e.scrollDOM.clientWidth, h |= 16);
    let d = e.scrollDOM.scrollTop * this.scaleY;
    this.scrollTop != d && (this.scrollAnchorHeight = -1, this.scrollTop = d), this.scrolledToBottom = _p(e.scrollDOM);
    let p = (this.printing ? RS : OS)(t, this.paddingTop), m = p.top - this.pixelViewport.top, g = p.bottom - this.pixelViewport.bottom;
    this.pixelViewport = p;
    let y = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (y != this.inView && (this.inView = y, y && (l = !0)), !this.inView && !this.scrollTarget && !IS(e.dom))
      return 0;
    let b = a.width;
    if ((this.contentDOMWidth != b || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = a.width, this.editorHeight = e.scrollDOM.clientHeight, h |= 16), l) {
      let T = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(T) && (o = !0), o || s.lineWrapping && Math.abs(b - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: S, charWidth: A, textHeight: w } = e.docView.measureTextSize();
        o = S > 0 && s.refresh(r, S, A, w, Math.max(5, b / A), T), o && (e.docView.minWidth = 0, h |= 16);
      }
      m > 0 && g > 0 ? c = Math.max(m, g) : m < 0 && g < 0 && (c = Math.min(m, g)), Du();
      for (let S of this.viewports) {
        let A = S.from == this.viewport.from ? T : e.docView.measureVisibleLineHeights(S);
        this.heightMap = (o ? ze.empty().applyChanges(this.stateDeco, J.empty, this.heightOracle, [new bt(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, o, new ES(S.from, A));
      }
      Zn && (h |= 2);
    }
    let v = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return v && (h & 2 && (h |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), h |= this.updateForViewport()), (h & 2 || v) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps, e)), h |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), h;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let n = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, r = this.heightOracle, { visibleTop: o, visibleBottom: a } = this, l = new Dr(s.lineAt(o - n * 1e3, te.ByHeight, r, 0, 0).from, s.lineAt(a + (1 - n) * 1e3, te.ByHeight, r, 0, 0).to);
    if (t) {
      let { head: h } = t.range;
      if (h < l.from || h > l.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), u = s.lineAt(h, te.ByPos, r, 0, 0), f;
        t.y == "center" ? f = (u.top + u.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && h < l.from ? f = u.top : f = u.bottom - c, l = new Dr(s.lineAt(f - 1e3 / 2, te.ByHeight, r, 0, 0).from, s.lineAt(f + c + 1e3 / 2, te.ByHeight, r, 0, 0).to);
      }
    }
    return l;
  }
  mapViewport(e, t) {
    let n = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new Dr(this.heightMap.lineAt(n, te.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, te.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, n = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, te.ByPos, this.heightOracle, 0, 0), { bottom: r } = this.heightMap.lineAt(t, te.ByPos, this.heightOracle, 0, 0), { visibleTop: o, visibleBottom: a } = this;
    return (e == 0 || s <= o - Math.max(10, Math.min(
      -n,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || r >= a + Math.max(10, Math.min(
      n,
      250
      /* VP.MaxCoverMargin */
    ))) && s > o - 2 * 1e3 && r < a + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let n = [];
    for (let s of e)
      t.touchesRange(s.from, s.to) || n.push(new Ja(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
    return n;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let n = this.heightOracle.lineWrapping, s = n ? 1e4 : 2e3, r = s >> 1, o = s << 1;
    if (this.defaultTextDirection != ie.LTR && !n)
      return [];
    let a = [], l = (c, u, f, d) => {
      if (u - c < r)
        return;
      let p = this.state.selection.main, m = [p.from];
      p.empty || m.push(p.to);
      for (let y of m)
        if (y > c && y < u) {
          l(c, y - 10, f, d), l(y + 10, u, f, d);
          return;
        }
      let g = LS(e, (y) => y.from >= f.from && y.to <= f.to && Math.abs(y.from - c) < r && Math.abs(y.to - u) < r && !m.some((b) => y.from < b && y.to > b));
      if (!g) {
        if (u < f.to && t && n && t.visibleRanges.some((v) => v.from <= u && v.to >= u)) {
          let v = t.moveToLineBoundary(x.cursor(u), !1, !0).head;
          v > c && (u = v);
        }
        let y = this.gapSize(f, c, u, d), b = n || y < 2e6 ? y : 2e6;
        g = new Ja(c, u, y, b);
      }
      a.push(g);
    }, h = (c) => {
      if (c.length < o || c.type != Le.Text)
        return;
      let u = MS(c.from, c.to, this.stateDeco);
      if (u.total < o)
        return;
      let f = this.scrollTarget ? this.scrollTarget.range.head : null, d, p;
      if (n) {
        let m = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, g, y;
        if (f != null) {
          let b = Br(u, f), v = ((this.visibleBottom - this.visibleTop) / 2 + m) / c.height;
          g = b - v, y = b + v;
        } else
          g = (this.visibleTop - c.top - m) / c.height, y = (this.visibleBottom - c.top + m) / c.height;
        d = $r(u, g), p = $r(u, y);
      } else {
        let m = u.total * this.heightOracle.charWidth, g = s * this.heightOracle.charWidth, y = 0;
        if (m > 2e6)
          for (let A of e)
            A.from >= c.from && A.from < c.to && A.size != A.displaySize && A.from * this.heightOracle.charWidth + y < this.pixelViewport.left && (y = A.size - A.displaySize);
        let b = this.pixelViewport.left + y, v = this.pixelViewport.right + y, T, S;
        if (f != null) {
          let A = Br(u, f), w = ((v - b) / 2 + g) / m;
          T = A - w, S = A + w;
        } else
          T = (b - g) / m, S = (v + g) / m;
        d = $r(u, T), p = $r(u, S);
      }
      d > c.from && l(c.from, d, c, u), p < c.to && l(p, c.to, c, u);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(h) : h(c);
    return a;
  }
  gapSize(e, t, n, s) {
    let r = Br(s, n) - Br(s, t);
    return this.heightOracle.lineWrapping ? e.height * r : s.total * this.heightOracle.charWidth * r;
  }
  updateLineGaps(e) {
    Ja.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = B.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let n = [];
    H.spans(t, this.viewport.from, this.viewport.to, {
      span(r, o) {
        n.push({ from: r, to: o });
      },
      point() {
      }
    }, 20);
    let s = 0;
    if (n.length != this.visibleRanges.length)
      s = 12;
    else
      for (let r = 0; r < n.length && !(s & 8); r++) {
        let o = this.visibleRanges[r], a = n[r];
        (o.from != a.from || o.to != a.to) && (s |= 4, e && e.mapPos(o.from, -1) == a.from && e.mapPos(o.to, 1) == a.to || (s |= 8));
      }
    return this.visibleRanges = n, s;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Cs(this.heightMap.lineAt(e, te.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Cs(this.heightMap.lineAt(this.scaler.fromDOM(e), te.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Cs(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Dr {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function MS(i, e, t) {
  let n = [], s = i, r = 0;
  return H.spans(t, i, e, {
    span() {
    },
    point(o, a) {
      o > s && (n.push({ from: s, to: o }), r += o - s), s = a;
    }
  }, 20), s < e && (n.push({ from: s, to: e }), r += e - s), { total: r, ranges: n };
}
function $r({ total: i, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let n = Math.floor(i * t);
  for (let s = 0; ; s++) {
    let { from: r, to: o } = e[s], a = o - r;
    if (n <= a)
      return r + n;
    n -= a;
  }
}
function Br(i, e) {
  let t = 0;
  for (let { from: n, to: s } of i.ranges) {
    if (e <= s) {
      t += e - n;
      break;
    }
    t += s - n;
  }
  return t / i.total;
}
function LS(i, e) {
  for (let t of i)
    if (e(t))
      return t;
}
const Uu = {
  toDOM(i) {
    return i;
  },
  fromDOM(i) {
    return i;
  },
  scale: 1,
  eq(i) {
    return i == this;
  }
};
function Fu(i) {
  let e = i.facet(aa).filter((n) => typeof n != "function"), t = i.facet(sc).filter((n) => typeof n != "function");
  return t.length && e.push(H.join(t)), e;
}
class lc {
  constructor(e, t, n) {
    let s = 0, r = 0, o = 0;
    this.viewports = n.map(({ from: a, to: l }) => {
      let h = t.lineAt(a, te.ByPos, e, 0, 0).top, c = t.lineAt(l, te.ByPos, e, 0, 0).bottom;
      return s += c - h, { from: a, to: l, top: h, bottom: c, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - s) / (t.height - s);
    for (let a of this.viewports)
      a.domTop = o + (a.top - r) * this.scale, o = a.domBottom = a.domTop + (a.bottom - a.top), r = a.bottom;
  }
  toDOM(e) {
    for (let t = 0, n = 0, s = 0; ; t++) {
      let r = t < this.viewports.length ? this.viewports[t] : null;
      if (!r || e < r.top)
        return s + (e - n) * this.scale;
      if (e <= r.bottom)
        return r.domTop + (e - r.top);
      n = r.bottom, s = r.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, n = 0, s = 0; ; t++) {
      let r = t < this.viewports.length ? this.viewports[t] : null;
      if (!r || e < r.domTop)
        return n + (e - s) / this.scale;
      if (e <= r.domBottom)
        return r.top + (e - r.domTop);
      n = r.bottom, s = r.domBottom;
    }
  }
  eq(e) {
    return e instanceof lc ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, n) => t.from == e.viewports[n].from && t.to == e.viewports[n].to) : !1;
  }
}
function Cs(i, e) {
  if (e.scale == 1)
    return i;
  let t = e.toDOM(i.top), n = e.toDOM(i.bottom);
  return new Nt(i.from, i.length, t, n - t, Array.isArray(i._content) ? i._content.map((s) => Cs(s, e)) : i._content);
}
const Ur = /* @__PURE__ */ _.define({ combine: (i) => i.join(" ") }), sh = /* @__PURE__ */ _.define({ combine: (i) => i.indexOf(!0) > -1 }), rh = /* @__PURE__ */ zi.newName(), fm = /* @__PURE__ */ zi.newName(), dm = /* @__PURE__ */ zi.newName(), pm = { "&light": "." + fm, "&dark": "." + dm };
function oh(i, e, t) {
  return new zi(e, {
    finish(n) {
      return /&/.test(n) ? n.replace(/&\w*/, (s) => {
        if (s == "&")
          return i;
        if (!t || !t[s])
          throw new RangeError(`Unsupported selector: ${s}`);
        return t[s];
      }) : i + " " + n;
    }
  });
}
const PS = /* @__PURE__ */ oh("." + rh, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // https://github.com/codemirror/dev/issues/456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#ddd"
  },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    zIndex: 200
  },
  ".cm-gutters-before": { insetInlineStart: 0 },
  ".cm-gutters-after": { insetInlineEnd: 0 },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    border: "0px solid #ddd",
    "&.cm-gutters-before": { borderRightWidth: "1px" },
    "&.cm-gutters-after": { borderLeftWidth: "1px" }
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-dialog": {
    padding: "2px 19px 4px 6px",
    position: "relative",
    "& label": { fontSize: "80%" }
  },
  ".cm-dialog-close": {
    position: "absolute",
    top: "3px",
    right: "4px",
    backgroundColor: "inherit",
    border: "none",
    font: "inherit",
    fontSize: "14px",
    padding: "0"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top",
    userSelect: "none"
  },
  ".cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 5%)",
    backgroundPosition: "center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, pm), DS = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, Qa = k.ie && k.ie_version <= 11;
class $S {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new pv(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let n of t)
        this.queue.push(n);
      (k.ie && k.ie_version <= 11 || k.ios && e.composing) && t.some((n) => n.type == "childList" && n.removedNodes.length || n.type == "characterData" && n.oldValue.length > n.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && k.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(k.chrome && k.chrome_version < 126) && (this.editContext = new US(e), e.state.facet(mi) && (e.contentDOM.editContext = this.editContext.editContext)), Qa && (this.onCharData = (t) => {
      this.queue.push({
        target: t.target,
        type: "characterData",
        oldValue: t.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var t;
      ((t = this.view.docView) === null || t === void 0 ? void 0 : t.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(e.scrollDOM)), this.addWindowListeners(this.win = e.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((t) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), t.length > 0 && t[t.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((t) => {
      t.length > 0 && t[t.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e), this.intersecting && this.view.measure();
  }
  onScroll(e) {
    this.intersecting && this.flush(!1), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(e) {
    (e.type == "change" || !e.type) && !e.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, n) => t != e[n]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    let t = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: n } = this, s = this.selectionRange;
    if (n.state.facet(mi) ? n.root.activeElement != this.dom : !oo(this.dom, s))
      return;
    let r = s.anchorNode && n.docView.tile.nearest(s.anchorNode);
    if (r && r.isWidget() && r.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (k.ie && k.ie_version <= 11 || k.android && k.chrome) && !n.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Ps(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = Ks(e.root);
    if (!t)
      return !1;
    let n = k.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && BS(this.view, t) || t;
    if (!n || this.selectionRange.eq(n))
      return !1;
    let s = oo(this.dom, n);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && gv(this.dom, n) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(n), s && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let n = this.dom; n; )
      if (n.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == n ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(n), n = n.assignedSlot || n.parentNode;
      else if (n.nodeType == 11)
        n = n.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let n of this.scrollTargets)
        n.removeEventListener("scroll", this.onScroll);
      for (let n of this.scrollTargets = t)
        n.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, DS), Qa && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), Qa && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(e, t) {
    var n;
    if (!this.delayedAndroidKey) {
      let s = () => {
        let r = this.delayedAndroidKey;
        r && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = r.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && r.force && zn(this.dom, r.key, r.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(s);
    }
    (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = {
      key: e,
      keyCode: t,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((n = this.delayedAndroidKey) === null || n === void 0) && n.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let e of this.observer.takeRecords())
      this.queue.push(e);
    return this.queue;
  }
  processRecords() {
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let t = -1, n = -1, s = !1;
    for (let r of e) {
      let o = this.readMutation(r);
      o && (o.typeOver && (s = !0), t == -1 ? { from: t, to: n } = o : (t = Math.min(o.from, t), n = Math.max(o.to, n)));
    }
    return { from: t, to: n, typeOver: s };
  }
  readChange() {
    let { from: e, to: t, typeOver: n } = this.processRecords(), s = this.selectionChanged && oo(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let r = new iS(this.view, e, t, n);
    return this.view.docView.domChanged = { newSel: r.newSel ? r.newSel.main : null }, r;
  }
  // Apply pending changes, if any
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    e && this.readSelectionRange();
    let t = this.readChange();
    if (!t)
      return this.view.requestMeasure(), !1;
    let n = this.view.state, s = tm(this.view, t);
    return this.view.state == n && (t.domChanged || t.newSel && !t.newSel.main.eq(this.view.state.selection.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let n = Wu(t, e.previousSibling || e.target.previousSibling, -1), s = Wu(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: n ? t.posAfter(n) : t.posAtStart,
        to: s ? t.posBefore(s) : t.posAtEnd,
        typeOver: !1
      };
    } else return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  setWindow(e) {
    e != this.win && (this.removeWindowListeners(this.win), this.win = e, this.addWindowListeners(this.win));
  }
  addWindowListeners(e) {
    e.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : e.addEventListener("beforeprint", this.onPrint), e.addEventListener("scroll", this.onScroll), e.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(e) {
    e.removeEventListener("scroll", this.onScroll), e.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : e.removeEventListener("beforeprint", this.onPrint), e.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(e) {
    this.editContext && (this.editContext.update(e), e.startState.facet(mi) != e.state.facet(mi) && (e.view.contentDOM.editContext = e.state.facet(mi) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, n;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (n = this.resizeScroll) === null || n === void 0 || n.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function Wu(i, e, t) {
  for (; e; ) {
    let n = ye.get(e);
    if (n && n.parent == i)
      return n;
    let s = e.parentNode;
    e = s != i.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Hu(i, e) {
  let t = e.startContainer, n = e.startOffset, s = e.endContainer, r = e.endOffset, o = i.docView.domAtPos(i.state.selection.main.anchor, 1);
  return Ps(o.node, o.offset, s, r) && ([t, n, s, r] = [s, r, t, n]), { anchorNode: t, anchorOffset: n, focusNode: s, focusOffset: r };
}
function BS(i, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(i.root)[0];
    if (s)
      return Hu(i, s);
  }
  let t = null;
  function n(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return i.contentDOM.addEventListener("beforeinput", n, !0), i.dom.ownerDocument.execCommand("indent"), i.contentDOM.removeEventListener("beforeinput", n, !0), t ? Hu(i, t) : null;
}
class US {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.composing = null, this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (n) => {
      let s = e.state.selection.main, { anchor: r, head: o } = s, a = this.toEditorPos(n.updateRangeStart), l = this.toEditorPos(n.updateRangeEnd);
      e.inputState.composing >= 0 && !this.composing && (this.composing = { contextBase: n.updateRangeStart, editorBase: a, drifted: !1 });
      let h = l - a > n.text.length;
      a == this.from && r < this.from ? a = r : l == this.to && r > this.to && (l = r);
      let c = im(e.state.sliceDoc(a, l), n.text, (h ? s.from : s.to) - a, h ? "end" : null);
      if (!c) {
        let f = x.single(this.toEditorPos(n.selectionStart), this.toEditorPos(n.selectionEnd));
        f.main.eq(s) || e.dispatch({ selection: f, userEvent: "select" });
        return;
      }
      let u = {
        from: c.from + a,
        to: c.toA + a,
        insert: J.of(n.text.slice(c.from, c.toB).split(`
`))
      };
      if ((k.mac || k.android) && u.from == o - 1 && /^\. ?$/.test(n.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (u = { from: a, to: l, insert: J.of([n.text.replace(".", " ")]) }), this.pendingContextChange = u, !e.state.readOnly) {
        let f = this.to - this.from + (u.to - u.from + u.insert.length);
        oc(e, u, x.single(this.toEditorPos(n.selectionStart, f), this.toEditorPos(n.selectionEnd, f)));
      }
      this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)), u.from < u.to && !u.insert.length && e.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(t.text.slice(Math.max(0, n.updateRangeStart - 1), Math.min(t.text.length, n.updateRangeStart + 1))) && this.handlers.compositionend(n);
    }, this.handlers.characterboundsupdate = (n) => {
      let s = [], r = null;
      for (let o = this.toEditorPos(n.rangeStart), a = this.toEditorPos(n.rangeEnd); o < a; o++) {
        let l = e.coordsForChar(o);
        r = l && new DOMRect(l.left, l.top, l.right - l.left, l.bottom - l.top) || r || new DOMRect(), s.push(r);
      }
      t.updateCharacterBounds(n.rangeStart, s);
    }, this.handlers.textformatupdate = (n) => {
      let s = [];
      for (let r of n.getTextFormats()) {
        let o = r.underlineStyle, a = r.underlineThickness;
        if (!/none/i.test(o) && !/none/i.test(a)) {
          let l = this.toEditorPos(r.rangeStart), h = this.toEditorPos(r.rangeEnd);
          if (l < h) {
            let c = `text-decoration: underline ${/^[a-z]/.test(o) ? o + " " : o == "Dashed" ? "dashed " : o == "Squiggle" ? "wavy " : ""}${/thin/i.test(a) ? 1 : 2}px`;
            s.push(B.mark({ attributes: { style: c } }).range(l, h));
          }
        }
      }
      e.dispatch({ effects: zp.of(B.set(s)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      if (e.inputState.composing = -1, e.inputState.compositionFirstChange = null, this.composing) {
        let { drifted: n } = this.composing;
        this.composing = null, n && this.reset(e.state);
      }
    };
    for (let n in this.handlers)
      t.addEventListener(n, this.handlers[n]);
    this.measureReq = { read: (n) => {
      this.editContext.updateControlBounds(n.contentDOM.getBoundingClientRect());
      let s = Ks(n.root);
      s && s.rangeCount && this.editContext.updateSelectionBounds(s.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, n = !1, s = this.pendingContextChange;
    return e.changes.iterChanges((r, o, a, l, h) => {
      if (n)
        return;
      let c = h.length - (o - r);
      if (s && o >= s.to)
        if (s.from == r && s.to == o && s.insert.eq(h)) {
          s = this.pendingContextChange = null, t += c, this.to += c;
          return;
        } else
          s = null, this.revertPending(e.state);
      if (r += t, o += t, o <= this.from)
        this.from += c, this.to += c;
      else if (r < this.to) {
        if (r < this.from || o > this.to || this.to - this.from + h.length > 3e4) {
          n = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(r), this.toContextPos(o), h.toString()), this.to += c;
      }
      t += c;
    }), s && !n && this.revertPending(e.state), !n;
  }
  update(e) {
    let t = this.pendingContextChange, n = e.startState.selection.main;
    this.composing && (this.composing.drifted || !e.changes.touchesRange(n.from, n.to) && e.transactions.some((s) => !s.isUserEvent("input.type") && s.changes.touchesRange(this.from, this.to))) ? (this.composing.drifted = !0, this.composing.editorBase = e.changes.mapPos(this.composing.editorBase)) : !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.reset(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
  }
  resetRange(e) {
    let { head: t } = e.selection.main;
    this.from = Math.max(
      0,
      t - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      e.doc.length,
      t + 1e4
      /* CxVp.Margin */
    );
  }
  reset(e) {
    this.resetRange(e), this.editContext.updateText(0, this.editContext.text.length, e.doc.sliceString(this.from, this.to)), this.setSelection(e);
  }
  revertPending(e) {
    let t = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(t.from), this.toContextPos(t.from + t.insert.length), e.doc.sliceString(t.from, t.to));
  }
  setSelection(e) {
    let { main: t } = e.selection, n = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), s = this.toContextPos(t.head);
    (this.editContext.selectionStart != n || this.editContext.selectionEnd != s) && this.editContext.updateSelection(n, s);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e, t = this.to - this.from) {
    e = Math.min(e, t);
    let n = this.composing;
    return n && n.drifted ? n.editorBase + (e - n.contextBase) : e + this.from;
  }
  toContextPos(e) {
    let t = this.composing;
    return t && t.drifted ? t.contextBase + (e - t.editorBase) : e - this.from;
  }
  destroy() {
    for (let e in this.handlers)
      this.editContext.removeEventListener(e, this.handlers[e]);
  }
}
class O {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return !!this.inputState && this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return !!this.inputState && this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(e = {}) {
    var t;
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), e.parent && e.parent.appendChild(this.dom);
    let { dispatch: n } = e;
    this.dispatchTransactions = e.dispatchTransactions || n && ((s) => s.forEach((r) => n(r, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || mv(e.parent) || document, this.viewState = new Bu(e.state || G.create(e)), e.scrollTo && e.scrollTo.is(Mr) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(Un).map((s) => new Ga(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new $S(this), this.inputState = new oS(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Au(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = !0, this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof we ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
    this.dispatchTransactions(t, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, n = !1, s, r = this.state;
    for (let f of e) {
      if (f.startState != r)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      r = f.state;
    }
    if (this.destroyed) {
      this.viewState.state = r;
      return;
    }
    let o = this.hasFocus, a = 0, l = null;
    e.some((f) => f.annotation(lm)) ? (this.inputState.notifiedFocused = o, a = 1) : o != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = o, l = hm(r, o), l || (a = 1));
    let h = this.observer.delayedAndroidKey, c = null;
    if (h ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(r.doc) || !this.state.selection.eq(r.selection)) && (c = null)) : this.observer.clear(), r.facet(G.phrases) != this.state.facet(G.phrases))
      return this.setState(r);
    s = _o.create(this, r, e), s.flags |= a;
    let u = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let f of e) {
        if (u && (u = u.map(f.changes)), f.scrollIntoView) {
          let { main: d } = f.state.selection;
          u = new Gn(d.empty ? d : x.cursor(d.head, d.head > d.anchor ? -1 : 1));
        }
        for (let d of f.effects)
          d.is(Mr) && (u = d.value.clip(this.state));
      }
      this.viewState.update(s, u), this.bidiCache = No.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(As) != this.styleModules && this.mountStyles(), n = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((f) => f.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(Ur) != s.state.facet(Ur) && (this.viewState.mustMeasureContent = !0), (t || n || u || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let f of this.state.facet(Zl))
        try {
          f(s);
        } catch (d) {
          ut(this.state, d, "update listener");
        }
    (l || c) && Promise.resolve().then(() => {
      l && this.state == l.startState && this.dispatch(l), c && !tm(this, c) && h.force && zn(this.contentDOM, h.key, h.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let n of this.plugins)
        n.destroy(this);
      this.viewState = new Bu(e), this.plugins = e.facet(Un).map((n) => new Ga(n)), this.pluginMap.clear();
      for (let n of this.plugins)
        n.update(this);
      this.docView.destroy(), this.docView = new Au(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(Un), n = e.state.facet(Un);
    if (t != n) {
      let s = [];
      for (let r of n) {
        let o = t.indexOf(r);
        if (o < 0)
          s.push(new Ga(r));
        else {
          let a = this.plugins[o];
          a.mustUpdate = e, s.push(a);
        }
      }
      for (let r of this.plugins)
        r.mustUpdate != e && r.destroy(this);
      this.plugins = s, this.pluginMap.clear();
    } else
      for (let s of this.plugins)
        s.mustUpdate = e;
    for (let s = 0; s < this.plugins.length; s++)
      this.plugins[s].update(this);
    t != n && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (n) {
          ut(this.state, n, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(e = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null, n = this.scrollDOM, s = n.scrollTop * this.scaleY, { scrollAnchorPos: r, scrollAnchorHeight: o } = this.viewState;
    Math.abs(s - this.viewState.scrollTop) > 1 && (o = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let a = 0; ; a++) {
        if (o < 0)
          if (_p(n))
            r = -1, o = this.viewState.heightMap.height;
          else {
            let d = this.viewState.scrollAnchorAt(s);
            r = d.from, o = d.top;
          }
        this.updateState = 1;
        let l = this.viewState.measure(this);
        if (!l && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (a > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let h = [];
        l & 4 || ([this.measureRequests, h] = [h, this.measureRequests]);
        let c = h.map((d) => {
          try {
            return d.read(this);
          } catch (p) {
            return ut(this.state, p), Vu;
          }
        }), u = _o.create(this, this.state, []), f = !1;
        u.flags |= l, t ? t.flags |= l : t = u, this.updateState = 2, u.empty || (this.updatePlugins(u), this.inputState.update(u), this.updateAttrs(), f = this.docView.update(u), f && this.docViewUpdate());
        for (let d = 0; d < h.length; d++)
          if (c[d] != Vu)
            try {
              let p = h[d];
              p.write && p.write(c[d], this);
            } catch (p) {
              ut(this.state, p);
            }
        if (f && this.docView.updateSelection(!0), !u.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, o = -1;
              continue;
            } else {
              let p = (r < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(r).top) - o;
              if (p > 1 || p < -1) {
                s = s + p, n.scrollTop = s / this.scaleY, o = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let a of this.state.facet(Zl))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return rh + " " + (this.state.facet(sh) ? dm : fm) + " " + this.state.facet(Ur);
  }
  updateAttrs() {
    let e = ju(this, Gp, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(mi) ? "true" : "false",
      class: "cm-content",
      style: `${k.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), ju(this, nc, t);
    let n = this.observer.ignore(() => {
      let s = bu(this.contentDOM, this.contentAttrs, t), r = bu(this.dom, this.editorAttrs, e);
      return s || r;
    });
    return this.editorAttrs = e, this.contentAttrs = t, n;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let n of e)
      for (let s of n.effects)
        if (s.is(O.announce)) {
          t && (this.announceDOM.textContent = ""), t = !1;
          let r = this.announceDOM.appendChild(document.createElement("div"));
          r.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(As);
    let e = this.state.facet(O.cspNonce);
    zi.mount(this.root, this.styleModules.concat(PS).reverse(), e ? { nonce: e } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), e) {
      if (this.measureRequests.indexOf(e) > -1)
        return;
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.plugin != e) && this.pluginMap.set(e, t = this.plugins.find((n) => n.plugin == e) || null), t && t.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(e, t, n) {
    return Xa(this, e, wu(this, e, t, n));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return Xa(this, e, wu(this, e, t, (n) => Jv(this, e.head, n)));
  }
  /**
  Get the cursor position visually at the start or end of a line.
  Note that this may differ from the _logical_ position at its
  start or end (which is simply at `line.from`/`line.to`) if text
  at the start or end goes against the line's base text direction.
  */
  visualLineSide(e, t) {
    let n = this.bidiSpans(e), s = this.textDirectionAt(e.from), r = n[t ? n.length - 1 : 0];
    return x.cursor(r.side(t, s) + e.from, r.forward(!t, s) ? 1 : -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, n = !0) {
    return Xv(this, e, t, n);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(e, t, n) {
    return Xa(this, e, Qv(this, e, t, n));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(e, t = 1) {
    return this.docView.domAtPos(e, t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    this.readMeasured();
    let n = ih(this, e, t);
    return n && n.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), ih(this, e, t);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let n = this.docView.coordsAt(e, t);
    if (!n || n.left == n.right)
      return n;
    let s = this.state.doc.lineAt(e), r = this.bidiSpans(s), o = r[gi.find(r, e - s.from, -1, t)];
    return ko(n, o.dir == ie.LTR == t > 0);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(e) {
    return this.readMeasured(), this.docView.coordsForChar(e);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(e) {
    return !this.state.facet(Hp) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(e) {
    if (e.length > FS)
      return Lp(e.length);
    let t = this.textDirectionAt(e.from), n;
    for (let r of this.bidiCache)
      if (r.from == e.from && r.dir == t && (r.fresh || Mp(r.isolates, n = Tu(this, e))))
        return r.order;
    n || (n = Tu(this, e));
    let s = Ev(e.text, t, n);
    return this.bidiCache.push(new No(e.from, e.to, t, n, !0, s)), s;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || k.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      kp(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(e) {
    this._root != e && (this._root = e, this.observer.setWindow((e.nodeType == 9 ? e : e.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(e, t = {}) {
    return Mr.of(new Gn(typeof e == "number" ? x.cursor(e) : e, t.y, t.x, t.yMargin, t.xMargin));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, n = this.viewState.scrollAnchorAt(e);
    return Mr.of(new Gn(x.cursor(n.from), "start", "start", n.top - e, t, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(e) {
    e == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof e == "boolean" ? this.inputState.tabFocusMode = e ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + e);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(e) {
    return Pe.define(() => ({}), { eventHandlers: e });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(e) {
    return Pe.define(() => ({}), { eventObservers: e });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(e, t) {
    let n = zi.newName(), s = [Ur.of(n), As.of(oh(`.${n}`, e))];
    return t && t.dark && s.push(sh.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return kn.lowest(As.of(oh("." + rh, e, pm)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let n = e.querySelector(".cm-content"), s = n && ye.get(n) || ye.get(e);
    return ((t = s == null ? void 0 : s.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
O.styleModule = As;
O.inputHandler = Fp;
O.clipboardInputFilter = tc;
O.clipboardOutputFilter = ic;
O.scrollHandler = jp;
O.focusChangeEffect = Wp;
O.perLineTextDirection = Hp;
O.exceptionSink = Up;
O.updateListener = Zl;
O.editable = mi;
O.mouseSelectionStyle = Bp;
O.dragMovesSelection = $p;
O.clickAddsSelectionRange = Dp;
O.decorations = aa;
O.blockWrappers = Kp;
O.outerDecorations = sc;
O.atomicRanges = pr;
O.bidiIsolatedRanges = qp;
O.scrollMargins = Yp;
O.darkTheme = sh;
O.cspNonce = /* @__PURE__ */ _.define({ combine: (i) => i.length ? i[0] : "" });
O.contentAttributes = nc;
O.editorAttributes = Gp;
O.lineWrapping = /* @__PURE__ */ O.contentAttributes.of({ class: "cm-lineWrapping" });
O.announce = /* @__PURE__ */ V.define();
const FS = 4096, Vu = {};
class No {
  constructor(e, t, n, s, r, o) {
    this.from = e, this.to = t, this.dir = n, this.isolates = s, this.fresh = r, this.order = o;
  }
  static update(e, t) {
    if (t.empty && !e.some((r) => r.fresh))
      return e;
    let n = [], s = e.length ? e[e.length - 1].dir : ie.LTR;
    for (let r = Math.max(0, e.length - 10); r < e.length; r++) {
      let o = e[r];
      o.dir == s && !t.touchesRange(o.from, o.to) && n.push(new No(t.mapPos(o.from, 1), t.mapPos(o.to, -1), o.dir, o.isolates, !1, o.order));
    }
    return n;
  }
}
function ju(i, e, t) {
  for (let n = i.state.facet(e), s = n.length - 1; s >= 0; s--) {
    let r = n[s], o = typeof r == "function" ? r(i) : r;
    o && Qh(o, t);
  }
  return t;
}
const WS = k.mac ? "mac" : k.windows ? "win" : k.linux ? "linux" : "key";
function HS(i, e) {
  const t = i.split(/-(?!$)/);
  let n = t[t.length - 1];
  n == "Space" && (n = " ");
  let s, r, o, a;
  for (let l = 0; l < t.length - 1; ++l) {
    const h = t[l];
    if (/^(cmd|meta|m)$/i.test(h))
      a = !0;
    else if (/^a(lt)?$/i.test(h))
      s = !0;
    else if (/^(c|ctrl|control)$/i.test(h))
      r = !0;
    else if (/^s(hift)?$/i.test(h))
      o = !0;
    else if (/^mod$/i.test(h))
      e == "mac" ? a = !0 : r = !0;
    else
      throw new Error("Unrecognized modifier name: " + h);
  }
  return s && (n = "Alt-" + n), r && (n = "Ctrl-" + n), a && (n = "Meta-" + n), o && (n = "Shift-" + n), n;
}
function Fr(i, e, t) {
  return e.altKey && (i = "Alt-" + i), e.ctrlKey && (i = "Ctrl-" + i), e.metaKey && (i = "Meta-" + i), t !== !1 && e.shiftKey && (i = "Shift-" + i), i;
}
const VS = /* @__PURE__ */ kn.default(/* @__PURE__ */ O.domEventHandlers({
  keydown(i, e) {
    return gm(mm(e.state), i, e, "editor");
  }
})), hc = /* @__PURE__ */ _.define({ enables: VS }), zu = /* @__PURE__ */ new WeakMap();
function mm(i) {
  let e = i.facet(hc), t = zu.get(e);
  return t || zu.set(e, t = GS(e.reduce((n, s) => n.concat(s), []))), t;
}
function jS(i, e, t) {
  return gm(mm(i.state), e, i, t);
}
let Li = null;
const zS = 4e3;
function GS(i, e = WS) {
  let t = /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null), s = (o, a) => {
    let l = n[o];
    if (l == null)
      n[o] = a;
    else if (l != a)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, r = (o, a, l, h, c) => {
    var u, f;
    let d = t[o] || (t[o] = /* @__PURE__ */ Object.create(null)), p = a.split(/ (?!$)/).map((y) => HS(y, e));
    for (let y = 1; y < p.length; y++) {
      let b = p.slice(0, y).join(" ");
      s(b, !0), d[b] || (d[b] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(v) => {
          let T = Li = { view: v, prefix: b, scope: o };
          return setTimeout(() => {
            Li == T && (Li = null);
          }, zS), !0;
        }]
      });
    }
    let m = p.join(" ");
    s(m, !1);
    let g = d[m] || (d[m] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((f = (u = d._any) === null || u === void 0 ? void 0 : u.run) === null || f === void 0 ? void 0 : f.slice()) || []
    });
    l && g.run.push(l), h && (g.preventDefault = !0), c && (g.stopPropagation = !0);
  };
  for (let o of i) {
    let a = o.scope ? o.scope.split(" ") : ["editor"];
    if (o.any)
      for (let h of a) {
        let c = t[h] || (t[h] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: u } = o;
        for (let f in c)
          c[f].run.push((d) => u(d, ah));
      }
    let l = o[e] || o.key;
    if (l)
      for (let h of a)
        r(h, l, o.run, o.preventDefault, o.stopPropagation), o.shift && r(h, "Shift-" + l, o.shift, o.preventDefault, o.stopPropagation);
  }
  return t;
}
let ah = null;
function gm(i, e, t, n) {
  ah = e;
  let s = ov(e), r = Xe(s, 0), o = Qt(r) == s.length && s != " ", a = "", l = !1, h = !1, c = !1;
  Li && Li.view == t && Li.scope == n && (a = Li.prefix + " ", sm.indexOf(e.keyCode) < 0 && (h = !0, Li = null));
  let u = /* @__PURE__ */ new Set(), f = (g) => {
    if (g) {
      for (let y of g.run)
        if (!u.has(y) && (u.add(y), y(t)))
          return g.stopPropagation && (c = !0), !0;
      g.preventDefault && (g.stopPropagation && (c = !0), h = !0);
    }
    return !1;
  }, d = i[n], p, m;
  return d && (f(d[a + Fr(s, e, !o)]) ? l = !0 : o && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(k.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(k.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (p = Gi[e.keyCode]) && p != s ? (f(d[a + Fr(p, e, !0)]) || e.shiftKey && (m = zs[e.keyCode]) != s && m != p && f(d[a + Fr(m, e, !1)])) && (l = !0) : o && e.shiftKey && f(d[a + Fr(s, e, !0)]) && (l = !0), !l && f(d._any) && (l = !0)), h && (l = !0), l && c && e.stopPropagation(), ah = null, l;
}
class mr {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(e, t, n, s, r) {
    this.className = e, this.left = t, this.top = n, this.width = s, this.height = r;
  }
  draw() {
    let e = document.createElement("div");
    return e.className = this.className, this.adjust(e), e;
  }
  update(e, t) {
    return t.className != this.className ? !1 : (this.adjust(e), !0);
  }
  adjust(e) {
    e.style.left = this.left + "px", e.style.top = this.top + "px", this.width != null && (e.style.width = this.width + "px"), e.style.height = this.height + "px";
  }
  eq(e) {
    return this.left == e.left && this.top == e.top && this.width == e.width && this.height == e.height && this.className == e.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(e, t, n) {
    if (n.empty) {
      let s = e.coordsAtPos(n.head, n.assoc || 1);
      if (!s)
        return [];
      let r = ym(e);
      return [new mr(t, s.left - r.left, s.top - r.top, null, s.bottom - s.top)];
    } else
      return KS(e, t, n);
  }
}
function ym(i) {
  let e = i.scrollDOM.getBoundingClientRect();
  return { left: (i.textDirection == ie.LTR ? e.left : e.right - i.scrollDOM.clientWidth * i.scaleX) - i.scrollDOM.scrollLeft * i.scaleX, top: e.top - i.scrollDOM.scrollTop * i.scaleY };
}
function Gu(i, e, t, n) {
  let s = i.coordsAtPos(e, t * 2);
  if (!s)
    return n;
  let r = i.dom.getBoundingClientRect(), o = (s.top + s.bottom) / 2, a = i.posAtCoords({ x: r.left + 1, y: o }), l = i.posAtCoords({ x: r.right - 1, y: o });
  return a == null || l == null ? n : { from: Math.max(n.from, Math.min(a, l)), to: Math.min(n.to, Math.max(a, l)) };
}
function KS(i, e, t) {
  if (t.to <= i.viewport.from || t.from >= i.viewport.to)
    return [];
  let n = Math.max(t.from, i.viewport.from), s = Math.min(t.to, i.viewport.to), r = i.textDirection == ie.LTR, o = i.contentDOM, a = o.getBoundingClientRect(), l = ym(i), h = o.querySelector(".cm-line"), c = h && window.getComputedStyle(h), u = a.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), f = a.right - (c ? parseInt(c.paddingRight) : 0), d = th(i, n, 1), p = th(i, s, -1), m = d.type == Le.Text ? d : null, g = p.type == Le.Text ? p : null;
  if (m && (i.lineWrapping || d.widgetLineBreaks) && (m = Gu(i, n, 1, m)), g && (i.lineWrapping || p.widgetLineBreaks) && (g = Gu(i, s, -1, g)), m && g && m.from == g.from && m.to == g.to)
    return b(v(t.from, t.to, m));
  {
    let S = m ? v(t.from, null, m) : T(d, !1), A = g ? v(null, t.to, g) : T(p, !0), w = [];
    return (m || d).to < (g || p).from - (m && g ? 1 : 0) || d.widgetLineBreaks > 1 && S.bottom + i.defaultLineHeight / 2 < A.top ? w.push(y(u, S.bottom, f, A.top)) : S.bottom < A.top && i.elementAtHeight((S.bottom + A.top) / 2).type == Le.Text && (S.bottom = A.top = (S.bottom + A.top) / 2), b(S).concat(w).concat(b(A));
  }
  function y(S, A, w, D) {
    return new mr(e, S - l.left, A - l.top, w - S, D - A);
  }
  function b({ top: S, bottom: A, horizontal: w }) {
    let D = [];
    for (let W = 0; W < w.length; W += 2)
      D.push(y(w[W], S, w[W + 1], A));
    return D;
  }
  function v(S, A, w) {
    let D = 1e9, W = -1e9, j = [];
    function F(z, q, de, be, ot) {
      let le = i.coordsAtPos(z, z == w.to ? -2 : 2), He = i.coordsAtPos(de, de == w.from ? 2 : -2);
      !le || !He || (D = Math.min(le.top, He.top, D), W = Math.max(le.bottom, He.bottom, W), ot == ie.LTR ? j.push(r && q ? u : le.left, r && be ? f : He.right) : j.push(!r && be ? u : He.left, !r && q ? f : le.right));
    }
    let M = S ?? w.from, Y = A ?? w.to;
    for (let z of i.visibleRanges)
      if (z.to > M && z.from < Y)
        for (let q = Math.max(z.from, M), de = Math.min(z.to, Y); ; ) {
          let be = i.state.doc.lineAt(q);
          for (let ot of i.bidiSpans(be)) {
            let le = ot.from + be.from, He = ot.to + be.from;
            if (le >= de)
              break;
            He > q && F(Math.max(le, q), S == null && le <= M, Math.min(He, de), A == null && He >= Y, ot.dir);
          }
          if (q = be.to + 1, q >= de)
            break;
        }
    return j.length == 0 && F(M, S == null, Y, A == null, i.textDirection), { top: D, bottom: W, horizontal: j };
  }
  function T(S, A) {
    let w = a.top + (A ? S.top : S.bottom);
    return { top: w, bottom: w, horizontal: [] };
  }
}
function qS(i, e) {
  return i.constructor == e.constructor && i.eq(e);
}
class YS {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(ho) != e.state.facet(ho) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, n = e.facet(ho);
    for (; t < n.length && n[t] != this.layer; )
      t++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - t);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  scale() {
    let { scaleX: e, scaleY: t } = this.view;
    (e != this.scaleX || t != this.scaleY) && (this.scaleX = e, this.scaleY = t, this.dom.style.transform = `scale(${1 / e}, ${1 / t})`);
  }
  draw(e) {
    if (e.length != this.drawn.length || e.some((t, n) => !qS(t, this.drawn[n]))) {
      let t = this.dom.firstChild, n = 0;
      for (let s of e)
        s.update && t && s.constructor && this.drawn[n].constructor && s.update(t, this.drawn[n]) ? (t = t.nextSibling, n++) : this.dom.insertBefore(s.draw(), t);
      for (; t; ) {
        let s = t.nextSibling;
        t.remove(), t = s;
      }
      this.drawn = e, k.safari && k.safari_version >= 26 && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const ho = /* @__PURE__ */ _.define();
function bm(i) {
  return [
    Pe.define((e) => new YS(e, i)),
    ho.of(i)
  ];
}
const Ys = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function XS(i = {}) {
  return [
    Ys.of(i),
    JS,
    QS,
    ZS,
    Vp.of(!0)
  ];
}
function vm(i) {
  return i.startState.facet(Ys) != i.state.facet(Ys);
}
const JS = /* @__PURE__ */ bm({
  above: !0,
  markers(i) {
    let { state: e } = i, t = e.facet(Ys), n = [];
    for (let s of e.selection.ranges) {
      let r = s == e.selection.main;
      if (s.empty || t.drawRangeCursor) {
        let o = r ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", a = s.empty ? s : x.cursor(s.head, s.head > s.anchor ? -1 : 1);
        for (let l of mr.forRange(i, o, a))
          n.push(l);
      }
    }
    return n;
  },
  update(i, e) {
    i.transactions.some((n) => n.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = vm(i);
    return t && Ku(i.state, e), i.docChanged || i.selectionSet || t;
  },
  mount(i, e) {
    Ku(e.state, i);
  },
  class: "cm-cursorLayer"
});
function Ku(i, e) {
  e.style.animationDuration = i.facet(Ys).cursorBlinkRate + "ms";
}
const QS = /* @__PURE__ */ bm({
  above: !1,
  markers(i) {
    return i.state.selection.ranges.map((e) => e.empty ? [] : mr.forRange(i, "cm-selectionBackground", e)).reduce((e, t) => e.concat(t));
  },
  update(i, e) {
    return i.docChanged || i.selectionSet || i.viewportChanged || vm(i);
  },
  class: "cm-selectionLayer"
}), ZS = /* @__PURE__ */ kn.highest(/* @__PURE__ */ O.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: "transparent !important" },
    caretColor: "transparent !important"
  },
  ".cm-content": {
    caretColor: "transparent !important",
    "& :focus": {
      caretColor: "initial !important",
      "&::selection, & ::selection": {
        backgroundColor: "Highlight !important"
      }
    }
  }
}));
function qu(i, e, t, n, s) {
  e.lastIndex = 0;
  for (let r = i.iterRange(t, n), o = t, a; !r.next().done; o += r.value.length)
    if (!r.lineBreak)
      for (; a = e.exec(r.value); )
        s(o + a.index, a);
}
function eT(i, e) {
  let t = i.visibleRanges;
  if (t.length == 1 && t[0].from == i.viewport.from && t[0].to == i.viewport.to)
    return t;
  let n = [];
  for (let { from: s, to: r } of t)
    s = Math.max(i.state.doc.lineAt(s).from, s - e), r = Math.min(i.state.doc.lineAt(r).to, r + e), n.length && n[n.length - 1].to >= s ? n[n.length - 1].to = r : n.push({ from: s, to: r });
  return n;
}
class tT {
  /**
  Create a decorator.
  */
  constructor(e) {
    const { regexp: t, decoration: n, decorate: s, boundary: r, maxLength: o = 1e3 } = e;
    if (!t.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = t, s)
      this.addMatch = (a, l, h, c) => s(c, h, h + a[0].length, a, l);
    else if (typeof n == "function")
      this.addMatch = (a, l, h, c) => {
        let u = n(a, l, h);
        u && c(h, h + a[0].length, u);
      };
    else if (n)
      this.addMatch = (a, l, h, c) => c(h, h + a[0].length, n);
    else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = r, this.maxLength = o;
  }
  /**
  Compute the full set of decorations for matches in the given
  view's viewport. You'll want to call this when initializing your
  plugin.
  */
  createDeco(e) {
    let t = new ji(), n = t.add.bind(t);
    for (let { from: s, to: r } of eT(e, this.maxLength))
      qu(e.state.doc, this.regexp, s, r, (o, a) => this.addMatch(a, e, o, n));
    return t.finish();
  }
  /**
  Update a set of decorations for a view update. `deco` _must_ be
  the set of decorations produced by _this_ `MatchDecorator` for
  the view state before the update.
  */
  updateDeco(e, t) {
    let n = 1e9, s = -1;
    return e.docChanged && e.changes.iterChanges((r, o, a, l) => {
      l >= e.view.viewport.from && a <= e.view.viewport.to && (n = Math.min(a, n), s = Math.max(l, s));
    }), e.viewportMoved || s - n > 1e3 ? this.createDeco(e.view) : s > -1 ? this.updateRange(e.view, t.map(e.changes), n, s) : t;
  }
  updateRange(e, t, n, s) {
    for (let r of e.visibleRanges) {
      let o = Math.max(r.from, n), a = Math.min(r.to, s);
      if (a >= o) {
        let l = e.state.doc.lineAt(o), h = l.to < a ? e.state.doc.lineAt(a) : l, c = Math.max(r.from, l.from), u = Math.min(r.to, h.to);
        if (this.boundary) {
          for (; o > l.from; o--)
            if (this.boundary.test(l.text[o - 1 - l.from])) {
              c = o;
              break;
            }
          for (; a < h.to; a++)
            if (this.boundary.test(h.text[a - h.from])) {
              u = a;
              break;
            }
        }
        let f = [], d, p = (m, g, y) => f.push(y.range(m, g));
        if (l == h)
          for (this.regexp.lastIndex = c - l.from; (d = this.regexp.exec(l.text)) && d.index < u - l.from; )
            this.addMatch(d, e, d.index + l.from, p);
        else
          qu(e.state.doc, this.regexp, c, u, (m, g) => this.addMatch(g, e, m, p));
        t = t.update({ filterFrom: c, filterTo: u, filter: (m, g) => m < c || g > u, add: f });
      }
    }
    return t;
  }
}
const lh = /x/.unicode != null ? "gu" : "g", iT = /* @__PURE__ */ new RegExp(`[\0-\b
--­؜​‎‏\u2028\u2029‭‮⁦⁧⁩\uFEFF￹-￼]`, lh), nT = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let Za = null;
function sT() {
  var i;
  if (Za == null && typeof document < "u" && document.body) {
    let e = document.body.style;
    Za = ((i = e.tabSize) !== null && i !== void 0 ? i : e.MozTabSize) != null;
  }
  return Za || !1;
}
const co = /* @__PURE__ */ _.define({
  combine(i) {
    let e = Ci(i, {
      render: null,
      specialChars: iT,
      addSpecialChars: null
    });
    return (e.replaceTabs = !sT()) && (e.specialChars = new RegExp("	|" + e.specialChars.source, lh)), e.addSpecialChars && (e.specialChars = new RegExp(e.specialChars.source + "|" + e.addSpecialChars.source, lh)), e;
  }
});
function rT(i = {}) {
  return [co.of(i), oT()];
}
let Yu = null;
function oT() {
  return Yu || (Yu = Pe.fromClass(class {
    constructor(i) {
      this.view = i, this.decorations = B.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(i.state.facet(co)), this.decorations = this.decorator.createDeco(i);
    }
    makeDecorator(i) {
      return new tT({
        regexp: i.specialChars,
        decoration: (e, t, n) => {
          let { doc: s } = t.state, r = Xe(e[0], 0);
          if (r == 9) {
            let o = s.lineAt(n), a = t.state.tabSize, l = ur(o.text, a, n - o.from);
            return B.replace({
              widget: new cT((a - l % a) * this.view.defaultCharacterWidth / this.view.scaleX)
            });
          }
          return this.decorationCache[r] || (this.decorationCache[r] = B.replace({ widget: new hT(i, r) }));
        },
        boundary: i.replaceTabs ? void 0 : /[^]/
      });
    }
    update(i) {
      let e = i.state.facet(co);
      i.startState.facet(co) != e ? (this.decorator = this.makeDecorator(e), this.decorations = this.decorator.createDeco(i.view)) : this.decorations = this.decorator.updateDeco(i, this.decorations);
    }
  }, {
    decorations: (i) => i.decorations
  }));
}
const aT = "•";
function lT(i) {
  return i >= 32 ? aT : i == 10 ? "␤" : String.fromCharCode(9216 + i);
}
class hT extends ki {
  constructor(e, t) {
    super(), this.options = e, this.code = t;
  }
  eq(e) {
    return e.code == this.code;
  }
  toDOM(e) {
    let t = lT(this.code), n = e.state.phrase("Control character") + " " + (nT[this.code] || "0x" + this.code.toString(16)), s = this.options.render && this.options.render(this.code, n, t);
    if (s)
      return s;
    let r = document.createElement("span");
    return r.textContent = t, r.title = n, r.setAttribute("aria-label", n), r.className = "cm-specialChar", r;
  }
  ignoreEvent() {
    return !1;
  }
}
class cT extends ki {
  constructor(e) {
    super(), this.width = e;
  }
  eq(e) {
    return e.width == this.width;
  }
  toDOM() {
    let e = document.createElement("span");
    return e.textContent = "	", e.className = "cm-tab", e.style.width = this.width + "px", e;
  }
  ignoreEvent() {
    return !1;
  }
}
function uT() {
  return dT;
}
const fT = /* @__PURE__ */ B.line({ class: "cm-activeLine" }), dT = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.decorations = this.getDeco(i);
  }
  update(i) {
    (i.docChanged || i.selectionSet) && (this.decorations = this.getDeco(i.view));
  }
  getDeco(i) {
    let e = -1, t = [];
    for (let n of i.state.selection.ranges) {
      let s = i.lineBlockAt(n.head);
      s.from > e && (t.push(fT.range(s.from)), e = s.from);
    }
    return B.set(t);
  }
}, {
  decorations: (i) => i.decorations
}), Wr = "-10000px";
class pT {
  constructor(e, t, n, s) {
    this.facet = t, this.createTooltipView = n, this.removeTooltipView = s, this.input = e.state.facet(t), this.tooltips = this.input.filter((o) => o);
    let r = null;
    this.tooltipViews = this.tooltips.map((o) => r = n(o, r));
  }
  update(e, t) {
    var n;
    let s = e.state.facet(this.facet), r = s.filter((l) => l);
    if (s === this.input) {
      for (let l of this.tooltipViews)
        l.update && l.update(e);
      return !1;
    }
    let o = [], a = t ? [] : null;
    for (let l = 0; l < r.length; l++) {
      let h = r[l], c = -1;
      if (h) {
        for (let u = 0; u < this.tooltips.length; u++) {
          let f = this.tooltips[u];
          f && f.create == h.create && (c = u);
        }
        if (c < 0)
          o[l] = this.createTooltipView(h, l ? o[l - 1] : null), a && (a[l] = !!h.above);
        else {
          let u = o[l] = this.tooltipViews[c];
          a && (a[l] = t[c]), u.update && u.update(e);
        }
      }
    }
    for (let l of this.tooltipViews)
      o.indexOf(l) < 0 && (this.removeTooltipView(l), (n = l.destroy) === null || n === void 0 || n.call(l));
    return t && (a.forEach((l, h) => t[h] = l), t.length = a.length), this.input = s, this.tooltips = r, this.tooltipViews = o, !0;
  }
}
function mT(i) {
  let e = i.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const el = /* @__PURE__ */ _.define({
  combine: (i) => {
    var e, t, n;
    return {
      position: k.ios ? "absolute" : ((e = i.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = i.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((n = i.find((s) => s.tooltipSpace)) === null || n === void 0 ? void 0 : n.tooltipSpace) || mT
    };
  }
}), Xu = /* @__PURE__ */ new WeakMap(), Sm = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.view = i, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = i.state.facet(el);
    this.position = e.position, this.parent = e.parent, this.classes = i.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new pT(i, Tm, (t, n) => this.createTooltip(t, n), (t) => {
      this.resizeObserver && this.resizeObserver.unobserve(t.dom), t.dom.remove();
    }), this.above = this.manager.tooltips.map((t) => !!t.above), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((t) => {
      Date.now() > this.lastTransaction - 50 && t.length > 0 && t[t.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), i.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let i of this.manager.tooltipViews)
        this.intersectionObserver.observe(i.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(i) {
    i.transactions.length && (this.lastTransaction = Date.now());
    let e = this.manager.update(i, this.above);
    e && this.observeIntersection();
    let t = e || i.geometryChanged, n = i.state.facet(el);
    if (n.position != this.position && !this.madeAbsolute) {
      this.position = n.position;
      for (let s of this.manager.tooltipViews)
        s.dom.style.position = this.position;
      t = !0;
    }
    if (n.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = n.parent, this.createContainer();
      for (let s of this.manager.tooltipViews)
        this.container.appendChild(s.dom);
      t = !0;
    } else this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    t && this.maybeMeasure();
  }
  createTooltip(i, e) {
    let t = i.create(this.view), n = e ? e.dom : null;
    if (t.dom.classList.add("cm-tooltip"), i.arrow && !t.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let s = document.createElement("div");
      s.className = "cm-tooltip-arrow", t.dom.appendChild(s);
    }
    return t.dom.style.position = this.position, t.dom.style.top = Wr, t.dom.style.left = "0px", this.container.insertBefore(t.dom, n), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
  }
  destroy() {
    var i, e, t;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let n of this.manager.tooltipViews)
      n.dom.remove(), (i = n.destroy) === null || i === void 0 || i.call(n);
    this.parent && this.container.remove(), (e = this.resizeObserver) === null || e === void 0 || e.disconnect(), (t = this.intersectionObserver) === null || t === void 0 || t.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let i = 1, e = 1, t = !1;
    if (this.position == "fixed" && this.manager.tooltipViews.length) {
      let { dom: r } = this.manager.tooltipViews[0];
      if (k.safari) {
        let o = r.getBoundingClientRect();
        t = Math.abs(o.top + 1e4) > 1 || Math.abs(o.left) > 1;
      } else
        t = !!r.offsetParent && r.offsetParent != this.container.ownerDocument.body;
    }
    if (t || this.position == "absolute")
      if (this.parent) {
        let r = this.parent.getBoundingClientRect();
        r.width && r.height && (i = r.width / this.parent.offsetWidth, e = r.height / this.parent.offsetHeight);
      } else
        ({ scaleX: i, scaleY: e } = this.view.viewState);
    let n = this.view.scrollDOM.getBoundingClientRect(), s = rc(this.view);
    return {
      visible: {
        left: n.left + s.left,
        top: n.top + s.top,
        right: n.right - s.right,
        bottom: n.bottom - s.bottom
      },
      parent: this.parent ? this.container.getBoundingClientRect() : this.view.dom.getBoundingClientRect(),
      pos: this.manager.tooltips.map((r, o) => {
        let a = this.manager.tooltipViews[o];
        return a.getCoords ? a.getCoords(r.pos) : this.view.coordsAtPos(r.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: r }) => r.getBoundingClientRect()),
      space: this.view.state.facet(el).tooltipSpace(this.view),
      scaleX: i,
      scaleY: e,
      makeAbsolute: t
    };
  }
  writeMeasure(i) {
    var e;
    if (i.makeAbsolute) {
      this.madeAbsolute = !0, this.position = "absolute";
      for (let a of this.manager.tooltipViews)
        a.dom.style.position = "absolute";
    }
    let { visible: t, space: n, scaleX: s, scaleY: r } = i, o = [];
    for (let a = 0; a < this.manager.tooltips.length; a++) {
      let l = this.manager.tooltips[a], h = this.manager.tooltipViews[a], { dom: c } = h, u = i.pos[a], f = i.size[a];
      if (!u || l.clip !== !1 && (u.bottom <= Math.max(t.top, n.top) || u.top >= Math.min(t.bottom, n.bottom) || u.right < Math.max(t.left, n.left) - 0.1 || u.left > Math.min(t.right, n.right) + 0.1)) {
        c.style.top = Wr;
        continue;
      }
      let d = l.arrow ? h.dom.querySelector(".cm-tooltip-arrow") : null, p = d ? 7 : 0, m = f.right - f.left, g = (e = Xu.get(h)) !== null && e !== void 0 ? e : f.bottom - f.top, y = h.offset || yT, b = this.view.textDirection == ie.LTR, v = f.width > n.right - n.left ? b ? n.left : n.right - f.width : b ? Math.max(n.left, Math.min(u.left - (d ? 14 : 0) + y.x, n.right - m)) : Math.min(Math.max(n.left, u.left - m + (d ? 14 : 0) - y.x), n.right - m), T = this.above[a];
      !l.strictSide && (T ? u.top - g - p - y.y < n.top : u.bottom + g + p + y.y > n.bottom) && T == n.bottom - u.bottom > u.top - n.top && (T = this.above[a] = !T);
      let S = (T ? u.top - n.top : n.bottom - u.bottom) - p;
      if (S < g && h.resize !== !1) {
        if (S < this.view.defaultLineHeight) {
          c.style.top = Wr;
          continue;
        }
        Xu.set(h, g), c.style.height = (g = S) / r + "px";
      } else c.style.height && (c.style.height = "");
      let A = T ? u.top - g - p - y.y : u.bottom + p + y.y, w = v + m;
      if (h.overlap !== !0)
        for (let D of o)
          D.left < w && D.right > v && D.top < A + g && D.bottom > A && (A = T ? D.top - g - 2 - p : D.bottom + p + 2);
      if (this.position == "absolute" ? (c.style.top = (A - i.parent.top) / r + "px", Ju(c, (v - i.parent.left) / s)) : (c.style.top = A / r + "px", Ju(c, v / s)), d) {
        let D = u.left + (b ? y.x : -y.x) - (v + 14 - 7);
        d.style.left = D / s + "px";
      }
      h.overlap !== !0 && o.push({ left: v, top: A, right: w, bottom: A + g }), c.classList.toggle("cm-tooltip-above", T), c.classList.toggle("cm-tooltip-below", !T), h.positioned && h.positioned(i.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let i of this.manager.tooltipViews)
        i.dom.style.top = Wr;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function Ju(i, e) {
  let t = parseInt(i.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (i.style.left = e + "px");
}
const gT = /* @__PURE__ */ O.baseTheme({
  ".cm-tooltip": {
    zIndex: 500,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: "7px",
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: "7px solid transparent",
      borderRight: "7px solid transparent"
    },
    ".cm-tooltip-above &": {
      bottom: "-7px",
      "&:before": {
        borderTop: "7px solid #bbb"
      },
      "&:after": {
        borderTop: "7px solid #f5f5f5",
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: "-7px",
      "&:before": {
        borderBottom: "7px solid #bbb"
      },
      "&:after": {
        borderBottom: "7px solid #f5f5f5",
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
}), yT = { x: 0, y: 0 }, Tm = /* @__PURE__ */ _.define({
  enables: [Sm, gT]
});
function xm(i, e) {
  let t = i.plugin(Sm);
  if (!t)
    return null;
  let n = t.manager.tooltips.indexOf(e);
  return n < 0 ? null : t.manager.tooltipViews[n];
}
const Qu = /* @__PURE__ */ _.define({
  combine(i) {
    let e, t;
    for (let n of i)
      e = e || n.topContainer, t = t || n.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
});
function Em(i, e) {
  let t = i.plugin(Am), n = t ? t.specs.indexOf(e) : -1;
  return n > -1 ? t.panels[n] : null;
}
const Am = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.input = i.state.facet(Mo), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(i));
    let e = i.state.facet(Qu);
    this.top = new Hr(i, !0, e.topContainer), this.bottom = new Hr(i, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(i) {
    let e = i.state.facet(Qu);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Hr(i.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Hr(i.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = i.state.facet(Mo);
    if (t != this.input) {
      let n = t.filter((l) => l), s = [], r = [], o = [], a = [];
      for (let l of n) {
        let h = this.specs.indexOf(l), c;
        h < 0 ? (c = l(i.view), a.push(c)) : (c = this.panels[h], c.update && c.update(i)), s.push(c), (c.top ? r : o).push(c);
      }
      this.specs = n, this.panels = s, this.top.sync(r), this.bottom.sync(o);
      for (let l of a)
        l.dom.classList.add("cm-panel"), l.mount && l.mount();
    } else
      for (let n of this.panels)
        n.update && n.update(i);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (i) => O.scrollMargins.of((e) => {
    let t = e.plugin(i);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Hr {
  constructor(e, t, n) {
    this.view = e, this.top = t, this.container = n, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(e) {
    for (let t of this.panels)
      t.destroy && e.indexOf(t) < 0 && t.destroy();
    this.panels = e, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let t = this.container || this.view.dom;
      t.insertBefore(this.dom, this.top ? t.firstChild : null);
    }
    let e = this.dom.firstChild;
    for (let t of this.panels)
      if (t.dom.parentNode == this.dom) {
        for (; e != t.dom; )
          e = Zu(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Zu(e);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let e of this.classes.split(" "))
        e && this.container.classList.remove(e);
      for (let e of (this.classes = this.view.themeClasses).split(" "))
        e && this.container.classList.add(e);
    }
  }
}
function Zu(i) {
  let e = i.nextSibling;
  return i.remove(), e;
}
const Mo = /* @__PURE__ */ _.define({
  enables: Am
});
function bT(i, e) {
  let t, n = new Promise((o) => t = o), s = (o) => vT(o, e, t);
  i.state.field(tl, !1) ? i.dispatch({ effects: wm.of(s) }) : i.dispatch({ effects: V.appendConfig.of(tl.init(() => [s])) });
  let r = Cm.of(s);
  return { close: r, result: n.then((o) => ((i.win.queueMicrotask || ((l) => i.win.setTimeout(l, 10)))(() => {
    i.state.field(tl).indexOf(s) > -1 && i.dispatch({ effects: r });
  }), o)) };
}
const tl = /* @__PURE__ */ Ke.define({
  create() {
    return [];
  },
  update(i, e) {
    for (let t of e.effects)
      t.is(wm) ? i = [t.value].concat(i) : t.is(Cm) && (i = i.filter((n) => n != t.value));
    return i;
  },
  provide: (i) => Mo.computeN([i], (e) => e.field(i))
}), wm = /* @__PURE__ */ V.define(), Cm = /* @__PURE__ */ V.define();
function vT(i, e, t) {
  let n = e.content ? e.content(i, () => o(null)) : null;
  if (!n) {
    if (n = ke("form"), e.input) {
      let a = ke("input", e.input);
      /^(text|password|number|email|tel|url)$/.test(a.type) && a.classList.add("cm-textfield"), a.name || (a.name = "input"), n.appendChild(ke("label", (e.label || "") + ": ", a));
    } else
      n.appendChild(document.createTextNode(e.label || ""));
    n.appendChild(document.createTextNode(" ")), n.appendChild(ke("button", { class: "cm-button", type: "submit" }, e.submitLabel || "OK"));
  }
  let s = n.nodeName == "FORM" ? [n] : n.querySelectorAll("form");
  for (let a = 0; a < s.length; a++) {
    let l = s[a];
    l.addEventListener("keydown", (h) => {
      h.keyCode == 27 ? (h.preventDefault(), o(null)) : h.keyCode == 13 && (h.preventDefault(), o(l));
    }), l.addEventListener("submit", (h) => {
      h.preventDefault(), o(l);
    });
  }
  let r = ke("div", n, ke("button", {
    onclick: () => o(null),
    "aria-label": i.state.phrase("close"),
    class: "cm-dialog-close",
    type: "button"
  }, ["×"]));
  e.class && (r.className = e.class), r.classList.add("cm-dialog");
  function o(a) {
    r.contains(r.ownerDocument.activeElement) && i.focus(), t(a);
  }
  return {
    dom: r,
    top: e.top,
    mount: () => {
      if (e.focus) {
        let a;
        typeof e.focus == "string" ? a = n.querySelector(e.focus) : a = n.querySelector("input") || n.querySelector("button"), a && "select" in a ? a.select() : a && "focus" in a && a.focus();
      }
    }
  };
}
class Si extends Vi {
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(e) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(e) {
  }
}
Si.prototype.elementClass = "";
Si.prototype.toDOM = void 0;
Si.prototype.mapMode = Qe.TrackBefore;
Si.prototype.startSide = Si.prototype.endSide = -1;
Si.prototype.point = !0;
const uo = /* @__PURE__ */ _.define(), ST = /* @__PURE__ */ _.define(), TT = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => H.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, $s = /* @__PURE__ */ _.define();
function xT(i) {
  return [km(), $s.of({ ...TT, ...i })];
}
const ef = /* @__PURE__ */ _.define({
  combine: (i) => i.some((e) => e)
});
function km(i) {
  return [
    ET
  ];
}
const ET = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.view = i, this.domAfter = null, this.prevViewport = i.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = i.state.facet($s).map((e) => new nf(i, e)), this.fixed = !i.state.facet(ef);
    for (let e of this.gutters)
      e.config.side == "after" ? this.getDOMAfter().appendChild(e.dom) : this.dom.appendChild(e.dom);
    this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), i.scrollDOM.insertBefore(this.dom, i.contentDOM);
  }
  getDOMAfter() {
    return this.domAfter || (this.domAfter = document.createElement("div"), this.domAfter.className = "cm-gutters cm-gutters-after", this.domAfter.setAttribute("aria-hidden", "true"), this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.domAfter.style.position = this.fixed ? "sticky" : "", this.view.scrollDOM.appendChild(this.domAfter)), this.domAfter;
  }
  update(i) {
    if (this.updateGutters(i)) {
      let e = this.prevViewport, t = i.view.viewport, n = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(n < (t.to - t.from) * 0.8);
    }
    if (i.geometryChanged) {
      let e = this.view.contentHeight / this.view.scaleY + "px";
      this.dom.style.minHeight = e, this.domAfter && (this.domAfter.style.minHeight = e);
    }
    this.view.state.facet(ef) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = i.view.viewport;
  }
  syncGutters(i) {
    let e = this.dom.nextSibling;
    i && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = H.iter(this.view.state.facet(uo), this.view.viewport.from), n = [], s = this.gutters.map((r) => new AT(r, this.view.viewport, -this.view.documentPadding.top));
    for (let r of this.view.viewportLineBlocks)
      if (n.length && (n = []), Array.isArray(r.type)) {
        let o = !0;
        for (let a of r.type)
          if (a.type == Le.Text && o) {
            hh(t, n, a.from);
            for (let l of s)
              l.line(this.view, a, n);
            o = !1;
          } else if (a.widget)
            for (let l of s)
              l.widget(this.view, a);
      } else if (r.type == Le.Text) {
        hh(t, n, r.from);
        for (let o of s)
          o.line(this.view, r, n);
      } else if (r.widget)
        for (let o of s)
          o.widget(this.view, r);
    for (let r of s)
      r.finish();
    i && (this.view.scrollDOM.insertBefore(this.dom, e), this.domAfter && this.view.scrollDOM.appendChild(this.domAfter));
  }
  updateGutters(i) {
    let e = i.startState.facet($s), t = i.state.facet($s), n = i.docChanged || i.heightChanged || i.viewportChanged || !H.eq(i.startState.facet(uo), i.state.facet(uo), i.view.viewport.from, i.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(i) && (n = !0);
    else {
      n = !0;
      let s = [];
      for (let r of t) {
        let o = e.indexOf(r);
        o < 0 ? s.push(new nf(this.view, r)) : (this.gutters[o].update(i), s.push(this.gutters[o]));
      }
      for (let r of this.gutters)
        r.dom.remove(), s.indexOf(r) < 0 && r.destroy();
      for (let r of s)
        r.config.side == "after" ? this.getDOMAfter().appendChild(r.dom) : this.dom.appendChild(r.dom);
      this.gutters = s;
    }
    return n;
  }
  destroy() {
    for (let i of this.gutters)
      i.destroy();
    this.dom.remove(), this.domAfter && this.domAfter.remove();
  }
}, {
  provide: (i) => O.scrollMargins.of((e) => {
    let t = e.plugin(i);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let n = t.dom.offsetWidth * e.scaleX, s = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == ie.LTR ? { left: n, right: s } : { right: n, left: s };
  })
});
function tf(i) {
  return Array.isArray(i) ? i : [i];
}
function hh(i, e, t) {
  for (; i.value && i.from <= t; )
    i.from == t && e.push(i.value), i.next();
}
class AT {
  constructor(e, t, n) {
    this.gutter = e, this.height = n, this.i = 0, this.cursor = H.iter(e.markers, t.from);
  }
  addElement(e, t, n) {
    let { gutter: s } = this, r = (t.top - this.height) / e.scaleY, o = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let a = new _m(e, o, r, n);
      s.elements.push(a), s.dom.appendChild(a.dom);
    } else
      s.elements[this.i].update(e, o, r, n);
    this.height = t.bottom, this.i++;
  }
  line(e, t, n) {
    let s = [];
    hh(this.cursor, s, t.from), n.length && (s = s.concat(n));
    let r = this.gutter.config.lineMarker(e, t, s);
    r && s.unshift(r);
    let o = this.gutter;
    s.length == 0 && !o.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let n = this.gutter.config.widgetMarker(e, t.widget, t), s = n ? [n] : null;
    for (let r of e.state.facet(ST)) {
      let o = r(e, t.widget, t);
      o && (s || (s = [])).push(o);
    }
    s && this.addElement(e, t, s);
  }
  finish() {
    let e = this.gutter;
    for (; e.elements.length > this.i; ) {
      let t = e.elements.pop();
      e.dom.removeChild(t.dom), t.destroy();
    }
  }
}
class nf {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let n in t.domEventHandlers)
      this.dom.addEventListener(n, (s) => {
        let r = s.target, o;
        if (r != this.dom && this.dom.contains(r)) {
          for (; r.parentNode != this.dom; )
            r = r.parentNode;
          let l = r.getBoundingClientRect();
          o = (l.top + l.bottom) / 2;
        } else
          o = s.clientY;
        let a = e.lineBlockAtHeight(o - e.documentTop);
        t.domEventHandlers[n](e, a, s) && s.preventDefault();
      });
    this.markers = tf(t.markers(e)), t.initialSpacer && (this.spacer = new _m(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = tf(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let n = e.view.viewport;
    return !H.eq(this.markers, t, n.from, n.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class _m {
  constructor(e, t, n, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, n, s);
  }
  update(e, t, n, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != n && (this.dom.style.marginTop = (this.above = n) ? n + "px" : ""), wT(this.markers, s) || this.setMarkers(e, s);
  }
  setMarkers(e, t) {
    let n = "cm-gutterElement", s = this.dom.firstChild;
    for (let r = 0, o = 0; ; ) {
      let a = o, l = r < t.length ? t[r++] : null, h = !1;
      if (l) {
        let c = l.elementClass;
        c && (n += " " + c);
        for (let u = o; u < this.markers.length; u++)
          if (this.markers[u].compare(l)) {
            a = u, h = !0;
            break;
          }
      } else
        a = this.markers.length;
      for (; o < a; ) {
        let c = this.markers[o++];
        if (c.toDOM) {
          c.destroy(s);
          let u = s.nextSibling;
          s.remove(), s = u;
        }
      }
      if (!l)
        break;
      l.toDOM && (h ? s = s.nextSibling : this.dom.insertBefore(l.toDOM(e), s)), h && o++;
    }
    this.dom.className = n, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function wT(i, e) {
  if (i.length != e.length)
    return !1;
  for (let t = 0; t < i.length; t++)
    if (!i[t].compare(e[t]))
      return !1;
  return !0;
}
const CT = /* @__PURE__ */ _.define(), kT = /* @__PURE__ */ _.define(), Fn = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let n = Object.assign({}, e);
        for (let s in t) {
          let r = n[s], o = t[s];
          n[s] = r ? (a, l, h) => r(a, l, h) || o(a, l, h) : o;
        }
        return n;
      }
    });
  }
});
class il extends Si {
  constructor(e) {
    super(), this.number = e;
  }
  eq(e) {
    return this.number == e.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function nl(i, e) {
  return i.state.facet(Fn).formatNumber(e, i.state);
}
const _T = /* @__PURE__ */ $s.compute([Fn], (i) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(CT);
  },
  lineMarker(e, t, n) {
    return n.some((s) => s.toDOM) ? null : new il(nl(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, n) => {
    for (let s of e.state.facet(kT)) {
      let r = s(e, t, n);
      if (r)
        return r;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Fn) != e.state.facet(Fn),
  initialSpacer(e) {
    return new il(nl(e, sf(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let n = nl(t.view, sf(t.view.state.doc.lines));
    return n == e.number ? e : new il(n);
  },
  domEventHandlers: i.facet(Fn).domEventHandlers,
  side: "before"
}));
function OT(i = {}) {
  return [
    Fn.of(i),
    km(),
    _T
  ];
}
function sf(i) {
  let e = 9;
  for (; e < i; )
    e = e * 10 + 9;
  return e;
}
const IT = /* @__PURE__ */ new class extends Si {
  constructor() {
    super(...arguments), this.elementClass = "cm-activeLineGutter";
  }
}(), RT = /* @__PURE__ */ uo.compute(["selection"], (i) => {
  let e = [], t = -1;
  for (let n of i.selection.ranges) {
    let s = i.doc.lineAt(n.head).from;
    s > t && (t = s, e.push(IT.range(s)));
  }
  return H.of(e);
});
function NT() {
  return RT;
}
let MT = 0;
class gt {
  /**
  @internal
  */
  constructor(e, t, n, s) {
    this.name = e, this.set = t, this.base = n, this.modified = s, this.id = MT++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let n = typeof e == "string" ? e : "?";
    if (e instanceof gt && (t = e), t != null && t.base)
      throw new Error("Can not derive from a modified tag");
    let s = new gt(n, [], null, []);
    if (s.set.push(s), t)
      for (let r of t.set)
        s.set.push(r);
    return s;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(e) {
    let t = new Lo(e);
    return (n) => n.modified.indexOf(t) > -1 ? n : Lo.get(n.base || n, n.modified.concat(t).sort((s, r) => s.id - r.id));
  }
}
let LT = 0;
class Lo {
  constructor(e) {
    this.name = e, this.instances = [], this.id = LT++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let n = t[0].instances.find((a) => a.base == e && PT(t, a.modified));
    if (n)
      return n;
    let s = [], r = new gt(e.name, s, e, t);
    for (let a of t)
      a.instances.push(r);
    let o = DT(t);
    for (let a of e.set)
      if (!a.modified.length)
        for (let l of o)
          s.push(Lo.get(a, l));
    return r;
  }
}
function PT(i, e) {
  return i.length == e.length && i.every((t, n) => t == e[n]);
}
function DT(i) {
  let e = [[]];
  for (let t = 0; t < i.length; t++)
    for (let n = 0, s = e.length; n < s; n++)
      e.push(e[n].concat(i[t]));
  return e.sort((t, n) => n.length - t.length);
}
function $T(i) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in i) {
    let n = i[t];
    Array.isArray(n) || (n = [n]);
    for (let s of t.split(" "))
      if (s) {
        let r = [], o = 2, a = s;
        for (let u = 0; ; ) {
          if (a == "..." && u > 0 && u + 3 == s.length) {
            o = 1;
            break;
          }
          let f = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(a);
          if (!f)
            throw new RangeError("Invalid path: " + s);
          if (r.push(f[0] == "*" ? "" : f[0][0] == '"' ? JSON.parse(f[0]) : f[0]), u += f[0].length, u == s.length)
            break;
          let d = s[u++];
          if (u == s.length && d == "!") {
            o = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + s);
          a = s.slice(u);
        }
        let l = r.length - 1, h = r[l];
        if (!h)
          throw new RangeError("Invalid path: " + s);
        let c = new Xs(n, o, l > 0 ? r.slice(0, l) : null);
        e[h] = c.sort(e[h]);
      }
  }
  return Om.add(e);
}
const Om = new K({
  combine(i, e) {
    let t, n, s;
    for (; i || e; ) {
      if (!i || e && i.depth >= e.depth ? (s = e, e = e.next) : (s = i, i = i.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let r = new Xs(s.tags, s.mode, s.context);
      t ? t.next = r : n = r, t = r;
    }
    return n;
  }
});
let Xs = class {
  constructor(e, t, n, s) {
    this.tags = e, this.mode = t, this.context = n, this.next = s;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
};
Xs.empty = new Xs([], 2, null);
function Im(i, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let r of i)
    if (!Array.isArray(r.tag))
      t[r.tag.id] = r.class;
    else
      for (let o of r.tag)
        t[o.id] = r.class;
  let { scope: n, all: s = null } = e || {};
  return {
    style: (r) => {
      let o = s;
      for (let a of r)
        for (let l of a.set) {
          let h = t[l.id];
          if (h) {
            o = o ? o + " " + h : h;
            break;
          }
        }
      return o;
    },
    scope: n
  };
}
function BT(i, e) {
  let t = null;
  for (let n of i) {
    let s = n.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function UT(i, e, t, n = 0, s = i.length) {
  let r = new FT(n, Array.isArray(e) ? e : [e], t);
  r.highlightRange(i.cursor(), n, s, "", r.highlighters), r.flush(s);
}
class FT {
  constructor(e, t, n) {
    this.at = e, this.highlighters = t, this.span = n, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, n, s, r) {
    let { type: o, from: a, to: l } = e;
    if (a >= n || l <= t)
      return;
    o.isTop && (r = this.highlighters.filter((d) => !d.scope || d.scope(o)));
    let h = s, c = WT(e) || Xs.empty, u = BT(r, c.tags);
    if (u && (h && (h += " "), h += u, c.mode == 1 && (s += (s ? " " : "") + u)), this.startSpan(Math.max(t, a), h), c.opaque)
      return;
    let f = e.tree && e.tree.prop(K.mounted);
    if (f && f.overlay) {
      let d = e.node.enter(f.overlay[0].from + a, 1), p = this.highlighters.filter((g) => !g.scope || g.scope(f.tree.type)), m = e.firstChild();
      for (let g = 0, y = a; ; g++) {
        let b = g < f.overlay.length ? f.overlay[g] : null, v = b ? b.from + a : l, T = Math.max(t, y), S = Math.min(n, v);
        if (T < S && m)
          for (; e.from < S && (this.highlightRange(e, T, S, s, r), this.startSpan(Math.min(S, e.to), h), !(e.to >= v || !e.nextSibling())); )
            ;
        if (!b || v > n)
          break;
        y = b.to + a, y > t && (this.highlightRange(d.cursor(), Math.max(t, b.from + a), Math.min(n, y), "", p), this.startSpan(Math.min(n, y), h));
      }
      m && e.parent();
    } else if (e.firstChild()) {
      f && (s = "");
      do
        if (!(e.to <= t)) {
          if (e.from >= n)
            break;
          this.highlightRange(e, t, n, s, r), this.startSpan(Math.min(n, e.to), h);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
function WT(i) {
  let e = i.type.prop(Om);
  for (; e && e.context && !i.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const C = gt.define, Vr = C(), Ni = C(), rf = C(Ni), of = C(Ni), Mi = C(), jr = C(Mi), sl = C(Mi), Yt = C(), sn = C(Yt), Gt = C(), Kt = C(), ch = C(), ys = C(ch), zr = C(), R = {
  /**
  A comment.
  */
  comment: Vr,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: C(Vr),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: C(Vr),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: C(Vr),
  /**
  Any kind of identifier.
  */
  name: Ni,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: C(Ni),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: rf,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: C(rf),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: of,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: C(of),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: C(Ni),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: C(Ni),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: C(Ni),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: C(Ni),
  /**
  A literal value.
  */
  literal: Mi,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: jr,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: C(jr),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: C(jr),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: C(jr),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: sl,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: C(sl),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: C(sl),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: C(Mi),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: C(Mi),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: C(Mi),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: C(Mi),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: C(Mi),
  /**
  A language keyword.
  */
  keyword: Gt,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: C(Gt),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: C(Gt),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: C(Gt),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: C(Gt),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: C(Gt),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: C(Gt),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: C(Gt),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: C(Gt),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: C(Gt),
  /**
  An operator.
  */
  operator: Kt,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: C(Kt),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: C(Kt),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: C(Kt),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: C(Kt),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: C(Kt),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: C(Kt),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: C(Kt),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: C(Kt),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: C(Kt),
  /**
  Program or markup punctuation.
  */
  punctuation: ch,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: C(ch),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: ys,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: C(ys),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: C(ys),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: C(ys),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: C(ys),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Yt,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: sn,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: C(sn),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: C(sn),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: C(sn),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: C(sn),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: C(sn),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: C(sn),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: C(Yt),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: C(Yt),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: C(Yt),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: C(Yt),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: C(Yt),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: C(Yt),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: C(Yt),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: C(Yt),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: C(),
  /**
  Deleted text.
  */
  deleted: C(),
  /**
  Changed text.
  */
  changed: C(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: C(),
  /**
  Metadata or meta-instruction.
  */
  meta: zr,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: C(zr),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: C(zr),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: C(zr),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: gt.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: gt.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: gt.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: gt.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: gt.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: gt.defineModifier("special")
};
for (let i in R) {
  let e = R[i];
  e instanceof gt && (e.name = i);
}
Im([
  { tag: R.link, class: "tok-link" },
  { tag: R.heading, class: "tok-heading" },
  { tag: R.emphasis, class: "tok-emphasis" },
  { tag: R.strong, class: "tok-strong" },
  { tag: R.keyword, class: "tok-keyword" },
  { tag: R.atom, class: "tok-atom" },
  { tag: R.bool, class: "tok-bool" },
  { tag: R.url, class: "tok-url" },
  { tag: R.labelName, class: "tok-labelName" },
  { tag: R.inserted, class: "tok-inserted" },
  { tag: R.deleted, class: "tok-deleted" },
  { tag: R.literal, class: "tok-literal" },
  { tag: R.string, class: "tok-string" },
  { tag: R.number, class: "tok-number" },
  { tag: [R.regexp, R.escape, R.special(R.string)], class: "tok-string2" },
  { tag: R.variableName, class: "tok-variableName" },
  { tag: R.local(R.variableName), class: "tok-variableName tok-local" },
  { tag: R.definition(R.variableName), class: "tok-variableName tok-definition" },
  { tag: R.special(R.variableName), class: "tok-variableName2" },
  { tag: R.definition(R.propertyName), class: "tok-propertyName tok-definition" },
  { tag: R.typeName, class: "tok-typeName" },
  { tag: R.namespace, class: "tok-namespace" },
  { tag: R.className, class: "tok-className" },
  { tag: R.macroName, class: "tok-macroName" },
  { tag: R.propertyName, class: "tok-propertyName" },
  { tag: R.operator, class: "tok-operator" },
  { tag: R.comment, class: "tok-comment" },
  { tag: R.meta, class: "tok-meta" },
  { tag: R.invalid, class: "tok-invalid" },
  { tag: R.punctuation, class: "tok-punctuation" }
]);
var rl;
const Wn = /* @__PURE__ */ new K();
function HT(i) {
  return _.define({
    combine: i ? (e) => e.concat(i) : void 0
  });
}
const VT = /* @__PURE__ */ new K();
class Lt {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, n = [], s = "") {
    this.data = e, this.name = s, G.prototype.hasOwnProperty("tree") || Object.defineProperty(G.prototype, "tree", { get() {
      return Ue(this);
    } }), this.parser = t, this.extension = [
      qi.of(this),
      G.languageData.of((r, o, a) => {
        let l = af(r, o, a), h = l.type.prop(Wn);
        if (!h)
          return [];
        let c = r.facet(h), u = l.type.prop(VT);
        if (u) {
          let f = l.resolve(o - l.from, a);
          for (let d of u)
            if (d.test(f, r)) {
              let p = r.facet(d.facet);
              return d.type == "replace" ? p : p.concat(c);
            }
        }
        return c;
      })
    ].concat(n);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, n = -1) {
    return af(e, t, n).type.prop(Wn) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(qi);
    if ((t == null ? void 0 : t.data) == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let n = [], s = (r, o) => {
      if (r.prop(Wn) == this.data) {
        n.push({ from: o, to: o + r.length });
        return;
      }
      let a = r.prop(K.mounted);
      if (a) {
        if (a.tree.prop(Wn) == this.data) {
          if (a.overlay)
            for (let l of a.overlay)
              n.push({ from: l.from + o, to: l.to + o });
          else
            n.push({ from: o, to: o + r.length });
          return;
        } else if (a.overlay) {
          let l = n.length;
          if (s(a.tree, a.overlay[0].from + o), n.length > l)
            return;
        }
      }
      for (let l = 0; l < r.children.length; l++) {
        let h = r.children[l];
        h instanceof oe && s(h, r.positions[l] + o);
      }
    };
    return s(Ue(e), 0), n;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
Lt.setState = /* @__PURE__ */ V.define();
function af(i, e, t) {
  let n = i.facet(qi), s = Ue(i).topNode;
  if (!n || n.allowsNesting)
    for (let r = s; r; r = r.enter(e, t, ge.ExcludeBuffers | ge.EnterBracketed))
      r.type.isTop && (s = r);
  return s;
}
function Ue(i) {
  let e = i.field(Lt.state, !1);
  return e ? e.tree : oe.empty;
}
class jT {
  /**
  Create an input object for the given document.
  */
  constructor(e) {
    this.doc = e, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let n = this.cursorPos - this.string.length;
    return e < n || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - n, t - n);
  }
}
let bs = null;
class es {
  constructor(e, t, n = [], s, r, o, a, l) {
    this.parser = e, this.state = t, this.fragments = n, this.tree = s, this.treeLen = r, this.viewport = o, this.skipped = a, this.scheduleOn = l, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new es(e, t, [], oe.empty, 0, n, [], null);
  }
  startParse() {
    return this.parser.startParse(new jT(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != oe.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var n;
      if (typeof e == "number") {
        let s = Date.now() + e;
        e = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped(dn.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (n = this.parse.stoppedAt) !== null && n !== void 0 ? n : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(dn.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = bs;
    bs = this;
    try {
      return e();
    } finally {
      bs = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = lf(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: n, tree: s, treeLen: r, viewport: o, skipped: a } = this;
    if (this.takeTree(), !e.empty) {
      let l = [];
      if (e.iterChangedRanges((h, c, u, f) => l.push({ fromA: h, toA: c, fromB: u, toB: f })), n = dn.applyChanges(n, l), s = oe.empty, r = 0, o = { from: e.mapPos(o.from, -1), to: e.mapPos(o.to, 1) }, this.skipped.length) {
        a = [];
        for (let h of this.skipped) {
          let c = e.mapPos(h.from, 1), u = e.mapPos(h.to, -1);
          c < u && a.push({ from: c, to: u });
        }
      }
    }
    return new es(this.parser, t, n, s, r, o, a, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let n = 0; n < this.skipped.length; n++) {
      let { from: s, to: r } = this.skipped[n];
      s < e.to && r > e.from && (this.fragments = lf(this.fragments, s, r), this.skipped.splice(n--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(e) {
    return new class extends np {
      createParse(t, n, s) {
        let r = s[0].from, o = s[s.length - 1].to;
        return {
          parsedPos: r,
          advance() {
            let l = bs;
            if (l) {
              for (let h of s)
                l.tempSkipped.push(h);
              e && (l.scheduleOn = l.scheduleOn ? Promise.all([l.scheduleOn, e]) : e);
            }
            return this.parsedPos = o, new oe(it.none, [], [], o - r);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return bs;
  }
}
function lf(i, e, t) {
  return dn.applyChanges(i, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class ts {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), n = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, n) || t.takeTree(), new ts(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), n = es.create(e.facet(qi).parser, e, { from: 0, to: t });
    return n.work(20, t) || n.takeTree(), new ts(n);
  }
}
Lt.state = /* @__PURE__ */ Ke.define({
  create: ts.init,
  update(i, e) {
    for (let t of e.effects)
      if (t.is(Lt.setState))
        return t.value;
    return e.startState.facet(qi) != e.state.facet(qi) ? ts.init(e.state) : i.apply(e);
  }
});
let Rm = (i) => {
  let e = setTimeout(
    () => i(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Rm = (i) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(i, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const ol = typeof navigator < "u" && (!((rl = navigator.scheduling) === null || rl === void 0) && rl.isInputPending) ? () => navigator.scheduling.isInputPending() : null, zT = /* @__PURE__ */ Pe.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(Lt.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(Lt.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Rm(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: n, viewport: { to: s } } = this.view, r = n.field(Lt.state);
    if (r.tree == r.context.tree && r.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, e && !ol ? Math.max(25, e.timeRemaining() - 5) : 1e9), a = r.context.treeLen < s && n.doc.length > s + 1e3, l = r.context.work(() => ol && ol() || Date.now() > o, s + (a ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (l || this.chunkBudget <= 0) && (r.context.takeTree(), this.view.dispatch({ effects: Lt.setState.of(new ts(r.context)) })), this.chunkBudget > 0 && !(l && !a) && this.scheduleWork(), this.checkAsyncSchedule(r.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => ut(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), qi = /* @__PURE__ */ _.define({
  combine(i) {
    return i.length ? i[0] : null;
  },
  enables: (i) => [
    Lt.state,
    zT,
    O.contentAttributes.compute([i], (e) => {
      let t = e.facet(i);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
});
class GT {
  /**
  Create a language support object.
  */
  constructor(e, t = []) {
    this.language = e, this.support = t, this.extension = [e, t];
  }
}
const KT = /* @__PURE__ */ _.define(), cc = /* @__PURE__ */ _.define({
  combine: (i) => {
    if (!i.length)
      return "  ";
    let e = i[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(i[0]));
    return e;
  }
});
function vn(i) {
  let e = i.facet(cc);
  return e.charCodeAt(0) == 9 ? i.tabSize * e.length : e.length;
}
function Js(i, e) {
  let t = "", n = i.tabSize, s = i.facet(cc)[0];
  if (s == "	") {
    for (; e >= n; )
      t += "	", e -= n;
    s = " ";
  }
  for (let r = 0; r < e; r++)
    t += s;
  return t;
}
function uc(i, e) {
  i instanceof G && (i = new ua(i));
  for (let n of i.state.facet(KT)) {
    let s = n(i, e);
    if (s !== void 0)
      return s;
  }
  let t = Ue(i.state);
  return t.length >= e ? qT(i, t, e) : null;
}
class ua {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = vn(e);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(e, t = 1) {
    let n = this.state.doc.lineAt(e), { simulateBreak: s, simulateDoubleBreak: r } = this.options;
    return s != null && s >= n.from && s <= n.to ? r && s == e ? { text: "", from: e } : (t < 0 ? s < e : s <= e) ? { text: n.text.slice(s - n.from), from: s } : { text: n.text.slice(0, s - n.from), from: n.from } : n;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: n, from: s } = this.lineAt(e, t);
    return n.slice(e - s, Math.min(n.length, e + 100 - s));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: n, from: s } = this.lineAt(e, t), r = this.countColumn(n, e - s), o = this.options.overrideIndentation ? this.options.overrideIndentation(s) : -1;
    return o > -1 && (r += o - this.countColumn(n, n.search(/\S|$/))), r;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return ur(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: n, from: s } = this.lineAt(e, t), r = this.options.overrideIndentation;
    if (r) {
      let o = r(s);
      if (o > -1)
        return o;
    }
    return this.countColumn(n, n.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Nm = /* @__PURE__ */ new K();
function qT(i, e, t) {
  let n = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != n.node) {
    let r = [];
    for (let o = s; o && !(o.from < n.node.from || o.to > n.node.to || o.from == n.node.from && o.type == n.node.type); o = o.parent)
      r.push(o);
    for (let o = r.length - 1; o >= 0; o--)
      n = { node: r[o], next: n };
  }
  return Mm(n, i, t);
}
function Mm(i, e, t) {
  for (let n = i; n; n = n.next) {
    let s = XT(n.node);
    if (s)
      return s(fc.create(e, t, n));
  }
  return 0;
}
function YT(i) {
  return i.pos == i.options.simulateBreak && i.options.simulateDoubleBreak;
}
function XT(i) {
  let e = i.type.prop(Nm);
  if (e)
    return e;
  let t = i.firstChild, n;
  if (t && (n = t.type.prop(K.closedBy))) {
    let s = i.lastChild, r = s && n.indexOf(s.name) > -1;
    return (o) => ex(o, !0, 1, void 0, r && !YT(o) ? s.from : void 0);
  }
  return i.parent == null ? JT : null;
}
function JT() {
  return 0;
}
class fc extends ua {
  constructor(e, t, n) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = n;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(e, t, n) {
    return new fc(e, t, n);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(e) {
    let t = this.state.doc.lineAt(e.from);
    for (; ; ) {
      let n = e.resolve(t.from);
      for (; n.parent && n.parent.from == n.from; )
        n = n.parent;
      if (QT(n, e))
        break;
      t = this.state.doc.lineAt(n.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return Mm(this.context.next, this.base, this.pos);
  }
}
function QT(i, e) {
  for (let t = e; t; t = t.parent)
    if (i == t)
      return !0;
  return !1;
}
function ZT(i) {
  let e = i.node, t = e.childAfter(e.from), n = e.lastChild;
  if (!t)
    return null;
  let s = i.options.simulateBreak, r = i.state.doc.lineAt(t.from), o = s == null || s <= r.from ? r.to : Math.min(r.to, s);
  for (let a = t.to; ; ) {
    let l = e.childAfter(a);
    if (!l || l == n)
      return null;
    if (!l.type.isSkipped) {
      if (l.from >= o)
        return null;
      let h = /^ */.exec(r.text.slice(t.to - r.from))[0].length;
      return { from: t.from, to: t.to + h };
    }
    a = l.to;
  }
}
function ex(i, e, t, n, s) {
  let r = i.textAfter, o = r.match(/^\s*/)[0].length, a = n && r.slice(o, o + n.length) == n || s == i.pos + o, l = ZT(i);
  return l ? a ? i.column(l.from) : i.column(l.to) : i.baseIndent + (a ? 0 : i.unit * t);
}
const tx = 200;
function ix() {
  return G.transactionFilter.of((i) => {
    if (!i.docChanged || !i.isUserEvent("input.type") && !i.isUserEvent("input.complete"))
      return i;
    let e = i.startState.languageDataAt("indentOnInput", i.startState.selection.main.head);
    if (!e.length)
      return i;
    let t = i.newDoc, { head: n } = i.newSelection.main, s = t.lineAt(n);
    if (n > s.from + tx)
      return i;
    let r = t.sliceString(s.from, n);
    if (!e.some((h) => h.test(r)))
      return i;
    let { state: o } = i, a = -1, l = [];
    for (let { head: h } of o.selection.ranges) {
      let c = o.doc.lineAt(h);
      if (c.from == a)
        continue;
      a = c.from;
      let u = uc(o, c.from);
      if (u == null)
        continue;
      let f = /^\s*/.exec(c.text)[0], d = Js(o, u);
      f != d && l.push({ from: c.from, to: c.from + f.length, insert: d });
    }
    return l.length ? [i, { changes: l, sequential: !0 }] : i;
  });
}
const nx = /* @__PURE__ */ _.define(), sx = /* @__PURE__ */ new K();
function rx(i, e, t) {
  let n = Ue(i);
  if (n.length < t)
    return null;
  let s = n.resolveStack(t, 1), r = null;
  for (let o = s; o; o = o.next) {
    let a = o.node;
    if (a.to <= t || a.from > t)
      continue;
    if (r && a.from < e)
      break;
    let l = a.type.prop(sx);
    if (l && (a.to < n.length - 50 || n.length == i.doc.length || !ox(a))) {
      let h = l(a, i);
      h && h.from <= t && h.from >= e && h.to > t && (r = h);
    }
  }
  return r;
}
function ox(i) {
  let e = i.lastChild;
  return e && e.to == i.to && e.type.isError;
}
function Po(i, e, t) {
  for (let n of i.facet(nx)) {
    let s = n(i, e, t);
    if (s)
      return s;
  }
  return rx(i, e, t);
}
function Lm(i, e) {
  let t = e.mapPos(i.from, 1), n = e.mapPos(i.to, -1);
  return t >= n ? void 0 : { from: t, to: n };
}
const fa = /* @__PURE__ */ V.define({ map: Lm }), gr = /* @__PURE__ */ V.define({ map: Lm });
function Pm(i) {
  let e = [];
  for (let { head: t } of i.state.selection.ranges)
    e.some((n) => n.from <= t && n.to >= t) || e.push(i.lineBlockAt(t));
  return e;
}
const Sn = /* @__PURE__ */ Ke.define({
  create() {
    return B.none;
  },
  update(i, e) {
    e.isUserEvent("delete") && e.changes.iterChangedRanges((t, n) => i = hf(i, t, n)), i = i.map(e.changes);
    for (let t of e.effects)
      if (t.is(fa) && !ax(i, t.value.from, t.value.to)) {
        let { preparePlaceholder: n } = e.state.facet(Bm), s = n ? B.replace({ widget: new px(n(e.state, t.value)) }) : cf;
        i = i.update({ add: [s.range(t.value.from, t.value.to)] });
      } else t.is(gr) && (i = i.update({
        filter: (n, s) => t.value.from != n || t.value.to != s,
        filterFrom: t.value.from,
        filterTo: t.value.to
      }));
    return e.selection && (i = hf(i, e.selection.main.head)), i;
  },
  provide: (i) => O.decorations.from(i),
  toJSON(i, e) {
    let t = [];
    return i.between(0, e.doc.length, (n, s) => {
      t.push(n, s);
    }), t;
  },
  fromJSON(i) {
    if (!Array.isArray(i) || i.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let e = [];
    for (let t = 0; t < i.length; ) {
      let n = i[t++], s = i[t++];
      if (typeof n != "number" || typeof s != "number")
        throw new RangeError("Invalid JSON for fold state");
      e.push(cf.range(n, s));
    }
    return B.set(e, !0);
  }
});
function hf(i, e, t = e) {
  let n = !1;
  return i.between(e, t, (s, r) => {
    s < t && r > e && (n = !0);
  }), n ? i.update({
    filterFrom: e,
    filterTo: t,
    filter: (s, r) => s >= t || r <= e
  }) : i;
}
function Do(i, e, t) {
  var n;
  let s = null;
  return (n = i.field(Sn, !1)) === null || n === void 0 || n.between(e, t, (r, o) => {
    (!s || s.from > r) && (s = { from: r, to: o });
  }), s;
}
function ax(i, e, t) {
  let n = !1;
  return i.between(e, e, (s, r) => {
    s == e && r == t && (n = !0);
  }), n;
}
function Dm(i, e) {
  return i.field(Sn, !1) ? e : e.concat(V.appendConfig.of(Um()));
}
const lx = (i) => {
  for (let e of Pm(i)) {
    let t = Po(i.state, e.from, e.to);
    if (t)
      return i.dispatch({ effects: Dm(i.state, [fa.of(t), $m(i, t)]) }), !0;
  }
  return !1;
}, hx = (i) => {
  if (!i.state.field(Sn, !1))
    return !1;
  let e = [];
  for (let t of Pm(i)) {
    let n = Do(i.state, t.from, t.to);
    n && e.push(gr.of(n), $m(i, n, !1));
  }
  return e.length && i.dispatch({ effects: e }), e.length > 0;
};
function $m(i, e, t = !0) {
  let n = i.state.doc.lineAt(e.from).number, s = i.state.doc.lineAt(e.to).number;
  return O.announce.of(`${i.state.phrase(t ? "Folded lines" : "Unfolded lines")} ${n} ${i.state.phrase("to")} ${s}.`);
}
const cx = (i) => {
  let { state: e } = i, t = [];
  for (let n = 0; n < e.doc.length; ) {
    let s = i.lineBlockAt(n), r = Po(e, s.from, s.to);
    r && t.push(fa.of(r)), n = (r ? i.lineBlockAt(r.to) : s).to + 1;
  }
  return t.length && i.dispatch({ effects: Dm(i.state, t) }), !!t.length;
}, ux = (i) => {
  let e = i.state.field(Sn, !1);
  if (!e || !e.size)
    return !1;
  let t = [];
  return e.between(0, i.state.doc.length, (n, s) => {
    t.push(gr.of({ from: n, to: s }));
  }), i.dispatch({ effects: t }), !0;
}, fx = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: lx },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: hx },
  { key: "Ctrl-Alt-[", run: cx },
  { key: "Ctrl-Alt-]", run: ux }
], dx = {
  placeholderDOM: null,
  preparePlaceholder: null,
  placeholderText: "…"
}, Bm = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, dx);
  }
});
function Um(i) {
  return [Sn, yx];
}
function Fm(i, e) {
  let { state: t } = i, n = t.facet(Bm), s = (o) => {
    let a = i.lineBlockAt(i.posAtDOM(o.target)), l = Do(i.state, a.from, a.to);
    l && i.dispatch({ effects: gr.of(l) }), o.preventDefault();
  };
  if (n.placeholderDOM)
    return n.placeholderDOM(i, s, e);
  let r = document.createElement("span");
  return r.textContent = n.placeholderText, r.setAttribute("aria-label", t.phrase("folded code")), r.title = t.phrase("unfold"), r.className = "cm-foldPlaceholder", r.onclick = s, r;
}
const cf = /* @__PURE__ */ B.replace({ widget: /* @__PURE__ */ new class extends ki {
  toDOM(i) {
    return Fm(i, null);
  }
}() });
class px extends ki {
  constructor(e) {
    super(), this.value = e;
  }
  eq(e) {
    return this.value == e.value;
  }
  toDOM(e) {
    return Fm(e, this.value);
  }
}
const mx = {
  openText: "⌄",
  closedText: "›",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => !1
};
class al extends Si {
  constructor(e, t) {
    super(), this.config = e, this.open = t;
  }
  eq(e) {
    return this.config == e.config && this.open == e.open;
  }
  toDOM(e) {
    if (this.config.markerDOM)
      return this.config.markerDOM(this.open);
    let t = document.createElement("span");
    return t.textContent = this.open ? this.config.openText : this.config.closedText, t.title = e.state.phrase(this.open ? "Fold line" : "Unfold line"), t;
  }
}
function gx(i = {}) {
  let e = { ...mx, ...i }, t = new al(e, !0), n = new al(e, !1), s = Pe.fromClass(class {
    constructor(o) {
      this.from = o.viewport.from, this.markers = this.buildMarkers(o);
    }
    update(o) {
      (o.docChanged || o.viewportChanged || o.startState.facet(qi) != o.state.facet(qi) || o.startState.field(Sn, !1) != o.state.field(Sn, !1) || Ue(o.startState) != Ue(o.state) || e.foldingChanged(o)) && (this.markers = this.buildMarkers(o.view));
    }
    buildMarkers(o) {
      let a = new ji();
      for (let l of o.viewportLineBlocks) {
        let h = Do(o.state, l.from, l.to) ? n : Po(o.state, l.from, l.to) ? t : null;
        h && a.add(l.from, l.from, h);
      }
      return a.finish();
    }
  }), { domEventHandlers: r } = e;
  return [
    s,
    xT({
      class: "cm-foldGutter",
      markers(o) {
        var a;
        return ((a = o.plugin(s)) === null || a === void 0 ? void 0 : a.markers) || H.empty;
      },
      initialSpacer() {
        return new al(e, !1);
      },
      domEventHandlers: {
        ...r,
        click: (o, a, l) => {
          if (r.click && r.click(o, a, l))
            return !0;
          let h = Do(o.state, a.from, a.to);
          if (h)
            return o.dispatch({ effects: gr.of(h) }), !0;
          let c = Po(o.state, a.from, a.to);
          return c ? (o.dispatch({ effects: fa.of(c) }), !0) : !1;
        }
      }
    }),
    Um()
  ];
}
const yx = /* @__PURE__ */ O.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class da {
  constructor(e, t) {
    this.specs = e;
    let n;
    function s(a) {
      let l = zi.newName();
      return (n || (n = /* @__PURE__ */ Object.create(null)))["." + l] = a, l;
    }
    const r = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, o = t.scope;
    this.scope = o instanceof Lt ? (a) => a.prop(Wn) == o.data : o ? (a) => a == o : void 0, this.style = Im(e.map((a) => ({
      tag: a.tag,
      class: a.class || s(Object.assign({}, a, { tag: null }))
    })), {
      all: r
    }).style, this.module = n ? new zi(n) : null, this.themeType = t.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(e, t) {
    return new da(e, t || {});
  }
}
const uh = /* @__PURE__ */ _.define(), bx = /* @__PURE__ */ _.define({
  combine(i) {
    return i.length ? [i[0]] : null;
  }
});
function ll(i) {
  let e = i.facet(uh);
  return e.length ? e : i.facet(bx);
}
function vx(i, e) {
  let t = [Tx], n;
  return i instanceof da && (i.module && t.push(O.styleModule.of(i.module)), n = i.themeType), n ? t.push(uh.computeN([O.darkTheme], (s) => s.facet(O.darkTheme) == (n == "dark") ? [i] : [])) : t.push(uh.of(i)), t;
}
class Sx {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Ue(e.state), this.decorations = this.buildDeco(e, ll(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = Ue(e.state), n = ll(e.state), s = n != ll(e.startState), { viewport: r } = e.view, o = e.changes.mapPos(this.decoratedTo, 1);
    t.length < r.to && !s && t.type == this.tree.type && o >= r.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = o) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, n), this.decoratedTo = r.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return B.none;
    let n = new ji();
    for (let { from: s, to: r } of e.visibleRanges)
      UT(this.tree, t, (o, a, l) => {
        n.add(o, a, this.markCache[l] || (this.markCache[l] = B.mark({ class: l })));
      }, s, r);
    return n.finish();
  }
}
const Tx = /* @__PURE__ */ kn.high(/* @__PURE__ */ Pe.fromClass(Sx, {
  decorations: (i) => i.decorations
})), xx = /* @__PURE__ */ O.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
}), Wm = 1e4, Hm = "()[]{}", Vm = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, {
      afterCursor: !0,
      brackets: Hm,
      maxScanDistance: Wm,
      renderMatch: wx
    });
  }
}), Ex = /* @__PURE__ */ B.mark({ class: "cm-matchingBracket" }), Ax = /* @__PURE__ */ B.mark({ class: "cm-nonmatchingBracket" });
function wx(i) {
  let e = [], t = i.matched ? Ex : Ax;
  return e.push(t.range(i.start.from, i.start.to)), i.end && e.push(t.range(i.end.from, i.end.to)), e;
}
const Cx = /* @__PURE__ */ Ke.define({
  create() {
    return B.none;
  },
  update(i, e) {
    if (!e.docChanged && !e.selection)
      return i;
    let t = [], n = e.state.facet(Vm);
    for (let s of e.state.selection.ranges) {
      if (!s.empty)
        continue;
      let r = ei(e.state, s.head, -1, n) || s.head > 0 && ei(e.state, s.head - 1, 1, n) || n.afterCursor && (ei(e.state, s.head, 1, n) || s.head < e.state.doc.length && ei(e.state, s.head + 1, -1, n));
      r && (t = t.concat(n.renderMatch(r, e.state)));
    }
    return B.set(t, !0);
  },
  provide: (i) => O.decorations.from(i)
}), kx = [
  Cx,
  xx
];
function _x(i = {}) {
  return [Vm.of(i), kx];
}
const Ox = /* @__PURE__ */ new K();
function fh(i, e, t) {
  let n = i.prop(e < 0 ? K.openedBy : K.closedBy);
  if (n)
    return n;
  if (i.name.length == 1) {
    let s = t.indexOf(i.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function dh(i) {
  let e = i.type.prop(Ox);
  return e ? e(i.node) : i;
}
function ei(i, e, t, n = {}) {
  let s = n.maxScanDistance || Wm, r = n.brackets || Hm, o = Ue(i), a = o.resolveInner(e, t);
  for (let l = a; l; l = l.parent) {
    let h = fh(l.type, t, r);
    if (h && l.from < l.to) {
      let c = dh(l);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return Ix(i, e, t, l, c, h, r);
    }
  }
  return Rx(i, e, t, o, a.type, s, r);
}
function Ix(i, e, t, n, s, r, o) {
  let a = n.parent, l = { from: s.from, to: s.to }, h = 0, c = a == null ? void 0 : a.cursor();
  if (c && (t < 0 ? c.childBefore(n.from) : c.childAfter(n.to)))
    do
      if (t < 0 ? c.to <= n.from : c.from >= n.to) {
        if (h == 0 && r.indexOf(c.type.name) > -1 && c.from < c.to) {
          let u = dh(c);
          return { start: l, end: u ? { from: u.from, to: u.to } : void 0, matched: !0 };
        } else if (fh(c.type, t, o))
          h++;
        else if (fh(c.type, -t, o)) {
          if (h == 0) {
            let u = dh(c);
            return {
              start: l,
              end: u && u.from < u.to ? { from: u.from, to: u.to } : void 0,
              matched: !1
            };
          }
          h--;
        }
      }
    while (t < 0 ? c.prevSibling() : c.nextSibling());
  return { start: l, matched: !1 };
}
function Rx(i, e, t, n, s, r, o) {
  let a = t < 0 ? i.sliceDoc(e - 1, e) : i.sliceDoc(e, e + 1), l = o.indexOf(a);
  if (l < 0 || l % 2 == 0 != t > 0)
    return null;
  let h = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = i.doc.iterRange(e, t > 0 ? i.doc.length : 0), u = 0;
  for (let f = 0; !c.next().done && f <= r; ) {
    let d = c.value;
    t < 0 && (f += d.length);
    let p = e + f * t;
    for (let m = t > 0 ? 0 : d.length - 1, g = t > 0 ? d.length : -1; m != g; m += t) {
      let y = o.indexOf(d[m]);
      if (!(y < 0 || n.resolveInner(p + m, 1).type != s))
        if (y % 2 == 0 == t > 0)
          u++;
        else {
          if (u == 1)
            return { start: h, end: { from: p + m, to: p + m + 1 }, matched: y >> 1 == l >> 1 };
          u--;
        }
    }
    t > 0 && (f += d.length);
  }
  return c.done ? { start: h, matched: !1 } : null;
}
function uf(i, e, t, n = 0, s = 0) {
  e == null && (e = i.search(/[^\s\u00a0]/), e == -1 && (e = i.length));
  let r = s;
  for (let o = n; o < e; o++)
    i.charCodeAt(o) == 9 ? r += t - r % t : r++;
  return r;
}
class jm {
  /**
  Create a stream.
  */
  constructor(e, t, n, s) {
    this.string = e, this.tabSize = t, this.indentUnit = n, this.overrideIndent = s, this.pos = 0, this.start = 0, this.lastColumnPos = 0, this.lastColumnValue = 0;
  }
  /**
  True if we are at the end of the line.
  */
  eol() {
    return this.pos >= this.string.length;
  }
  /**
  True if we are at the start of the line.
  */
  sol() {
    return this.pos == 0;
  }
  /**
  Get the next code unit after the current position, or undefined
  if we're at the end of the line.
  */
  peek() {
    return this.string.charAt(this.pos) || void 0;
  }
  /**
  Read the next code unit and advance `this.pos`.
  */
  next() {
    if (this.pos < this.string.length)
      return this.string.charAt(this.pos++);
  }
  /**
  Match the next character against the given string, regular
  expression, or predicate. Consume and return it if it matches.
  */
  eat(e) {
    let t = this.string.charAt(this.pos), n;
    if (typeof e == "string" ? n = t == e : n = t && (e instanceof RegExp ? e.test(t) : e(t)), n)
      return ++this.pos, t;
  }
  /**
  Continue matching characters that match the given string,
  regular expression, or predicate function. Return true if any
  characters were consumed.
  */
  eatWhile(e) {
    let t = this.pos;
    for (; this.eat(e); )
      ;
    return this.pos > t;
  }
  /**
  Consume whitespace ahead of `this.pos`. Return true if any was
  found.
  */
  eatSpace() {
    let e = this.pos;
    for (; /[\s\u00a0]/.test(this.string.charAt(this.pos)); )
      ++this.pos;
    return this.pos > e;
  }
  /**
  Move to the end of the line.
  */
  skipToEnd() {
    this.pos = this.string.length;
  }
  /**
  Move to directly before the given character, if found on the
  current line.
  */
  skipTo(e) {
    let t = this.string.indexOf(e, this.pos);
    if (t > -1)
      return this.pos = t, !0;
  }
  /**
  Move back `n` characters.
  */
  backUp(e) {
    this.pos -= e;
  }
  /**
  Get the column position at `this.pos`.
  */
  column() {
    return this.lastColumnPos < this.start && (this.lastColumnValue = uf(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : uf(this.string, null, this.tabSize);
  }
  /**
  Match the input against the given string or regular expression
  (which should start with a `^`). Return true or the regexp match
  if it matches.
  
  Unless `consume` is set to `false`, this will move `this.pos`
  past the matched text.
  
  When matching a string `caseInsensitive` can be set to true to
  make the match case-insensitive.
  */
  match(e, t, n) {
    if (typeof e == "string") {
      let s = (o) => n ? o.toLowerCase() : o, r = this.string.substr(this.pos, e.length);
      return s(r) == s(e) ? (t !== !1 && (this.pos += e.length), !0) : null;
    } else {
      let s = this.string.slice(this.pos).match(e);
      return s && s.index > 0 ? null : (s && t !== !1 && (this.pos += s[0].length), s);
    }
  }
  /**
  Get the current token.
  */
  current() {
    return this.string.slice(this.start, this.pos);
  }
}
function Nx(i) {
  return {
    name: i.name || "",
    token: i.token,
    blankLine: i.blankLine || (() => {
    }),
    startState: i.startState || (() => !0),
    copyState: i.copyState || Mx,
    indent: i.indent || (() => null),
    languageData: i.languageData || {},
    tokenTable: i.tokenTable || mc,
    mergeTokens: i.mergeTokens !== !1
  };
}
function Mx(i) {
  if (typeof i != "object")
    return i;
  let e = {};
  for (let t in i) {
    let n = i[t];
    e[t] = n instanceof Array ? n.slice() : n;
  }
  return e;
}
const ff = /* @__PURE__ */ new WeakMap();
class dc extends Lt {
  constructor(e) {
    let t = HT(e.languageData), n = Nx(e), s, r = new class extends np {
      createParse(o, a, l) {
        return new Px(s, o, a, l);
      }
    }();
    super(t, r, [], e.name), this.topNode = Bx(t, this), s = this, this.streamParser = n, this.stateAfter = new K({ perNode: !0 }), this.tokenTable = e.tokenTable ? new qm(n.tokenTable) : $x;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new dc(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: n } = e.options;
    n && (t = ff.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = pc(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), r, o;
    if (s ? (o = s.state, r = s.pos + 1) : (o = this.streamParser.startState(e.unit), r = e.node.from), e.pos - r > 1e4)
      return null;
    for (; r < e.pos; ) {
      let l = e.state.doc.lineAt(r), h = Math.min(e.pos, l.to);
      if (l.length) {
        let c = n ? n(l.from) : -1, u = new jm(l.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; u.pos < h - l.from; )
          Gm(this.streamParser.token, u, o);
      } else
        this.streamParser.blankLine(o, e.unit);
      if (h == e.pos)
        break;
      r = l.to + 1;
    }
    let a = e.lineAt(e.pos);
    return n && t == null && ff.set(e.state, a.from), this.streamParser.indent(o, /^\s*(.*)/.exec(a.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function pc(i, e, t, n, s) {
  let r = t >= n && t + e.length <= s && e.prop(i.stateAfter);
  if (r)
    return { state: i.streamParser.copyState(r), pos: t + e.length };
  for (let o = e.children.length - 1; o >= 0; o--) {
    let a = e.children[o], l = t + e.positions[o], h = a instanceof oe && l < s && pc(i, a, l, n, s);
    if (h)
      return h;
  }
  return null;
}
function zm(i, e, t, n, s) {
  if (s && t <= 0 && n >= e.length)
    return e;
  !s && t == 0 && e.type == i.topNode && (s = !0);
  for (let r = e.children.length - 1; r >= 0; r--) {
    let o = e.positions[r], a = e.children[r], l;
    if (o < n && a instanceof oe) {
      if (!(l = zm(i, a, t - o, n - o, s)))
        break;
      return s ? new oe(e.type, e.children.slice(0, r).concat(l), e.positions.slice(0, r + 1), o + l.length) : l;
    }
  }
  return null;
}
function Lx(i, e, t, n, s) {
  for (let r of e) {
    let o = r.from + (r.openStart ? 25 : 0), a = r.to - (r.openEnd ? 25 : 0), l = o <= t && a > t && pc(i, r.tree, 0 - r.offset, t, a), h;
    if (l && l.pos <= n && (h = zm(i, r.tree, t + r.offset, l.pos + r.offset, !1)))
      return { state: l.state, tree: h };
  }
  return { state: i.streamParser.startState(s ? vn(s) : 4), tree: oe.empty };
}
class Px {
  constructor(e, t, n, s) {
    this.lang = e, this.input = t, this.fragments = n, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let r = es.get(), o = s[0].from, { state: a, tree: l } = Lx(e, n, o, this.to, r == null ? void 0 : r.state);
    this.state = a, this.parsedPos = this.chunkStart = o + l.length;
    for (let h = 0; h < l.children.length; h++)
      this.chunks.push(l.children[h]), this.chunkPos.push(l.positions[h]);
    r && this.parsedPos < r.viewport.from - 1e5 && s.some((h) => h.from <= r.viewport.from && h.to >= r.viewport.from) && (this.state = this.lang.streamParser.startState(vn(r.state)), r.skipUntilInView(this.parsedPos, r.viewport.from), this.parsedPos = r.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = es.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), n = Math.min(
      t,
      this.chunkStart + 512
      /* C.ChunkSize */
    );
    for (e && (n = Math.min(n, e.viewport.to)); this.parsedPos < n; )
      this.parseLine(e);
    return this.chunkStart < this.parsedPos && this.finishChunk(), this.parsedPos >= t ? this.finish() : e && this.parsedPos >= e.viewport.to ? (e.skipUntilInView(this.parsedPos, t), this.finish()) : null;
  }
  stopAt(e) {
    this.stoppedAt = e;
  }
  lineAfter(e) {
    let t = this.input.chunk(e);
    if (this.input.lineChunks)
      t == `
` && (t = "");
    else {
      let n = t.indexOf(`
`);
      n > -1 && (t = t.slice(0, n));
    }
    return e + t.length <= this.to ? t : t.slice(0, this.to - e);
  }
  nextLine() {
    let e = this.parsedPos, t = this.lineAfter(e), n = e + t.length;
    for (let s = this.rangeIndex; ; ) {
      let r = this.ranges[s].to;
      if (r >= n || (t = t.slice(0, r - (n - t.length)), s++, s == this.ranges.length))
        break;
      let o = this.ranges[s].from, a = this.lineAfter(o);
      t += a, n = o + a.length;
    }
    return { line: t, end: n };
  }
  skipGapsTo(e, t, n) {
    for (; ; ) {
      let s = this.ranges[this.rangeIndex].to, r = e + t;
      if (n > 0 ? s > r : s >= r)
        break;
      let o = this.ranges[++this.rangeIndex].from;
      t += o - s;
    }
    return t;
  }
  moveRangeIndex() {
    for (; this.ranges[this.rangeIndex].to < this.parsedPos; )
      this.rangeIndex++;
  }
  emitToken(e, t, n, s) {
    let r = 4;
    if (this.ranges.length > 1) {
      s = this.skipGapsTo(t, s, 1), t += s;
      let a = this.chunk.length;
      s = this.skipGapsTo(n, s, -1), n += s, r += this.chunk.length - a;
    }
    let o = this.chunk.length - 4;
    return this.lang.streamParser.mergeTokens && r == 4 && o >= 0 && this.chunk[o] == e && this.chunk[o + 2] == t ? this.chunk[o + 2] = n : this.chunk.push(e, t, n, r), s;
  }
  parseLine(e) {
    let { line: t, end: n } = this.nextLine(), s = 0, { streamParser: r } = this.lang, o = new jm(t, e ? e.state.tabSize : 4, e ? vn(e.state) : 2);
    if (o.eol())
      r.blankLine(this.state, o.indentUnit);
    else
      for (; !o.eol(); ) {
        let a = Gm(r.token, o, this.state);
        if (a && (s = this.emitToken(this.lang.tokenTable.resolve(a), this.parsedPos + o.start, this.parsedPos + o.pos, s)), o.start > 1e4)
          break;
      }
    this.parsedPos = n, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = oe.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: Dx,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new oe(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new oe(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function Gm(i, e, t) {
  e.start = e.pos;
  for (let n = 0; n < 10; n++) {
    let s = i(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const mc = /* @__PURE__ */ Object.create(null), Qs = [it.none], Dx = /* @__PURE__ */ new Vh(Qs), df = [], pf = /* @__PURE__ */ Object.create(null), Km = /* @__PURE__ */ Object.create(null);
for (let [i, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  Km[i] = /* @__PURE__ */ Ym(mc, e);
class qm {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Km);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = Ym(this.extra, e)) : 0;
  }
}
const $x = /* @__PURE__ */ new qm(mc);
function hl(i, e) {
  df.indexOf(i) > -1 || (df.push(i), console.warn(e));
}
function Ym(i, e) {
  let t = [];
  for (let a of e.split(" ")) {
    let l = [];
    for (let h of a.split(".")) {
      let c = i[h] || R[h];
      c ? typeof c == "function" ? l.length ? l = l.map(c) : hl(h, `Modifier ${h} used at start of tag`) : l.length ? hl(h, `Tag ${h} used as modifier`) : l = Array.isArray(c) ? c : [c] : hl(h, `Unknown highlighting tag ${h}`);
    }
    for (let h of l)
      t.push(h);
  }
  if (!t.length)
    return 0;
  let n = e.replace(/ /g, "_"), s = n + " " + t.map((a) => a.id), r = pf[s];
  if (r)
    return r.id;
  let o = pf[s] = it.define({
    id: Qs.length,
    name: n,
    props: [$T({ [n]: t })]
  });
  return Qs.push(o), o.id;
}
function Bx(i, e) {
  let t = it.define({ id: Qs.length, name: "Document", props: [
    Wn.add(() => i),
    Nm.add(() => (n) => e.getIndent(n))
  ], top: !0 });
  return Qs.push(t), t;
}
ie.RTL, ie.LTR;
class Xm {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(e, t, n, s) {
    this.state = e, this.pos = t, this.explicit = n, this.view = s, this.abortListeners = [], this.abortOnDocChange = !1;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(e) {
    let t = Ue(this.state).resolveInner(this.pos, -1);
    for (; t && e.indexOf(t.name) < 0; )
      t = t.parent;
    return t ? {
      from: t.from,
      to: this.pos,
      text: this.state.sliceDoc(t.from, this.pos),
      type: t.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(e) {
    let t = this.state.doc.lineAt(this.pos), n = Math.max(t.from, this.pos - 250), s = t.text.slice(n - t.from, this.pos - t.from), r = s.search(Qm(e, !1));
    return r < 0 ? null : { from: n + r, to: this.pos, text: s.slice(r) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(e, t, n) {
    e == "abort" && this.abortListeners && (this.abortListeners.push(t), n && n.onDocChange && (this.abortOnDocChange = !0));
  }
}
function mf(i) {
  let e = Object.keys(i).join(""), t = /\w/.test(e);
  return t && (e = e.replace(/\w/g, "")), `[${t ? "\\w" : ""}${e.replace(/[^\w\s]/g, "\\$&")}]`;
}
function Ux(i) {
  let e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  for (let { label: s } of i) {
    e[s[0]] = !0;
    for (let r = 1; r < s.length; r++)
      t[s[r]] = !0;
  }
  let n = mf(e) + mf(t) + "*$";
  return [new RegExp("^" + n), new RegExp(n)];
}
function Jm(i) {
  let e = i.map((s) => typeof s == "string" ? { label: s } : s), [t, n] = e.every((s) => /^\w+$/.test(s.label)) ? [/\w*$/, /\w+$/] : Ux(e);
  return (s) => {
    let r = s.matchBefore(n);
    return r || s.explicit ? { from: r ? r.from : s.pos, options: e, validFor: t } : null;
  };
}
let gf = class {
  constructor(e, t, n, s) {
    this.completion = e, this.source = t, this.match = n, this.score = s;
  }
};
function pn(i) {
  return i.selection.main.from;
}
function Qm(i, e) {
  var t;
  let { source: n } = i, s = e && n[0] != "^", r = n[n.length - 1] != "$";
  return !s && !r ? i : new RegExp(`${s ? "^" : ""}(?:${n})${r ? "$" : ""}`, (t = i.flags) !== null && t !== void 0 ? t : i.ignoreCase ? "i" : "");
}
const Zm = /* @__PURE__ */ wi.define();
function Fx(i, e, t, n) {
  let { main: s } = i.selection, r = t - s.from, o = n - s.from;
  return {
    ...i.changeByRange((a) => {
      if (a != s && t != n && i.sliceDoc(a.from + r, a.from + o) != i.sliceDoc(t, n))
        return { range: a };
      let l = i.toText(e);
      return {
        changes: { from: a.from + r, to: n == s.from ? a.to : a.from + o, insert: l },
        range: x.cursor(a.from + r + l.length)
      };
    }),
    scrollIntoView: !0,
    userEvent: "input.complete"
  };
}
const yf = /* @__PURE__ */ new WeakMap();
function Wx(i) {
  if (!Array.isArray(i))
    return i;
  let e = yf.get(i);
  return e || yf.set(i, e = Jm(i)), e;
}
const $o = /* @__PURE__ */ V.define(), Zs = /* @__PURE__ */ V.define();
class Hx {
  constructor(e) {
    this.pattern = e, this.chars = [], this.folded = [], this.any = [], this.precise = [], this.byWord = [], this.score = 0, this.matched = [];
    for (let t = 0; t < e.length; ) {
      let n = Xe(e, t), s = Qt(n);
      this.chars.push(n);
      let r = e.slice(t, t + s), o = r.toUpperCase();
      this.folded.push(Xe(o == r ? r.toLowerCase() : o, 0)), t += s;
    }
    this.astral = e.length != this.chars.length;
  }
  ret(e, t) {
    return this.score = e, this.matched = t, this;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return a boolean indicating whether there was a match and,
  // on success, set `this.score` to the score, `this.matched` to an
  // array of `from, to` pairs indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(e) {
    if (this.pattern.length == 0)
      return this.ret(-100, []);
    if (e.length < this.pattern.length)
      return null;
    let { chars: t, folded: n, any: s, precise: r, byWord: o } = this;
    if (t.length == 1) {
      let b = Xe(e, 0), v = Qt(b), T = v == e.length ? 0 : -100;
      if (b != t[0]) if (b == n[0])
        T += -200;
      else
        return null;
      return this.ret(T, [0, v]);
    }
    let a = e.indexOf(this.pattern);
    if (a == 0)
      return this.ret(e.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
    let l = t.length, h = 0;
    if (a < 0) {
      for (let b = 0, v = Math.min(e.length, 200); b < v && h < l; ) {
        let T = Xe(e, b);
        (T == t[h] || T == n[h]) && (s[h++] = b), b += Qt(T);
      }
      if (h < l)
        return null;
    }
    let c = 0, u = 0, f = !1, d = 0, p = -1, m = -1, g = /[a-z]/.test(e), y = !0;
    for (let b = 0, v = Math.min(e.length, 200), T = 0; b < v && u < l; ) {
      let S = Xe(e, b);
      a < 0 && (c < l && S == t[c] && (r[c++] = b), d < l && (S == t[d] || S == n[d] ? (d == 0 && (p = b), m = b + 1, d++) : d = 0));
      let A, w = S < 255 ? S >= 48 && S <= 57 || S >= 97 && S <= 122 ? 2 : S >= 65 && S <= 90 ? 1 : 0 : (A = Kh(S)) != A.toLowerCase() ? 1 : A != A.toUpperCase() ? 2 : 0;
      (!b || w == 1 && g || T == 0 && w != 0) && (t[u] == S || n[u] == S && (f = !0) ? o[u++] = b : o.length && (y = !1)), T = w, b += Qt(S);
    }
    return u == l && o[0] == 0 && y ? this.result(-100 + (f ? -200 : 0), o, e) : d == l && p == 0 ? this.ret(-200 - e.length + (m == e.length ? 0 : -100), [0, m]) : a > -1 ? this.ret(-700 - e.length, [a, a + this.pattern.length]) : d == l ? this.ret(-900 - e.length, [p, m]) : u == l ? this.result(-100 + (f ? -200 : 0) + -700 + (y ? 0 : -1100), o, e) : t.length == 2 ? null : this.result((s[0] ? -700 : 0) + -200 + -1100, s, e);
  }
  result(e, t, n) {
    let s = [], r = 0;
    for (let o of t) {
      let a = o + (this.astral ? Qt(Xe(n, o)) : 1);
      r && s[r - 1] == o ? s[r - 1] = a : (s[r++] = o, s[r++] = a);
    }
    return this.ret(e - n.length, s);
  }
}
class Vx {
  constructor(e) {
    this.pattern = e, this.matched = [], this.score = 0, this.folded = e.toLowerCase();
  }
  match(e) {
    if (e.length < this.pattern.length)
      return null;
    let t = e.slice(0, this.pattern.length), n = t == this.pattern ? 0 : t.toLowerCase() == this.folded ? -200 : null;
    return n == null ? null : (this.matched = [0, t.length], this.score = n + (e.length == this.pattern.length ? 0 : -100), this);
  }
}
const Oe = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, {
      activateOnTyping: !0,
      activateOnCompletion: () => !1,
      activateOnTypingDelay: 100,
      selectOnOpen: !0,
      override: null,
      closeOnBlur: !0,
      maxRenderedOptions: 100,
      defaultKeymap: !0,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: !1,
      icons: !0,
      addToOptions: [],
      positionInfo: jx,
      filterStrict: !1,
      compareCompletions: (e, t) => (e.sortText || e.label).localeCompare(t.sortText || t.label),
      interactionDelay: 75,
      updateSyncTime: 100
    }, {
      defaultKeymap: (e, t) => e && t,
      closeOnBlur: (e, t) => e && t,
      icons: (e, t) => e && t,
      tooltipClass: (e, t) => (n) => bf(e(n), t(n)),
      optionClass: (e, t) => (n) => bf(e(n), t(n)),
      addToOptions: (e, t) => e.concat(t),
      filterStrict: (e, t) => e || t
    });
  }
});
function bf(i, e) {
  return i ? e ? i + " " + e : i : e;
}
function jx(i, e, t, n, s, r) {
  let o = i.textDirection == ie.RTL, a = o, l = !1, h = "top", c, u, f = e.left - s.left, d = s.right - e.right, p = n.right - n.left, m = n.bottom - n.top;
  if (a && f < Math.min(p, d) ? a = !1 : !a && d < Math.min(p, f) && (a = !0), p <= (a ? f : d))
    c = Math.max(s.top, Math.min(t.top, s.bottom - m)) - e.top, u = Math.min(400, a ? f : d);
  else {
    l = !0, u = Math.min(
      400,
      (o ? e.right : s.right - e.left) - 30
      /* Info.Margin */
    );
    let b = s.bottom - e.bottom;
    b >= m || b > e.top ? c = t.bottom - e.top : (h = "bottom", c = e.bottom - t.top);
  }
  let g = (e.bottom - e.top) / r.offsetHeight, y = (e.right - e.left) / r.offsetWidth;
  return {
    style: `${h}: ${c / g}px; max-width: ${u / y}px`,
    class: "cm-completionInfo-" + (l ? o ? "left-narrow" : "right-narrow" : a ? "left" : "right")
  };
}
function zx(i) {
  let e = i.addToOptions.slice();
  return i.icons && e.push({
    render(t) {
      let n = document.createElement("div");
      return n.classList.add("cm-completionIcon"), t.type && n.classList.add(...t.type.split(/\s+/g).map((s) => "cm-completionIcon-" + s)), n.setAttribute("aria-hidden", "true"), n;
    },
    position: 20
  }), e.push({
    render(t, n, s, r) {
      let o = document.createElement("span");
      o.className = "cm-completionLabel";
      let a = t.displayLabel || t.label, l = 0;
      for (let h = 0; h < r.length; ) {
        let c = r[h++], u = r[h++];
        c > l && o.appendChild(document.createTextNode(a.slice(l, c)));
        let f = o.appendChild(document.createElement("span"));
        f.appendChild(document.createTextNode(a.slice(c, u))), f.className = "cm-completionMatchedText", l = u;
      }
      return l < a.length && o.appendChild(document.createTextNode(a.slice(l))), o;
    },
    position: 50
  }, {
    render(t) {
      if (!t.detail)
        return null;
      let n = document.createElement("span");
      return n.className = "cm-completionDetail", n.textContent = t.detail, n;
    },
    position: 80
  }), e.sort((t, n) => t.position - n.position).map((t) => t.render);
}
function cl(i, e, t) {
  if (i <= t)
    return { from: 0, to: i };
  if (e < 0 && (e = 0), e <= i >> 1) {
    let s = Math.floor(e / t);
    return { from: s * t, to: (s + 1) * t };
  }
  let n = Math.floor((i - e) / t);
  return { from: i - (n + 1) * t, to: i - n * t };
}
class Gx {
  constructor(e, t, n) {
    this.view = e, this.stateField = t, this.applyCompletion = n, this.info = null, this.infoDestroy = null, this.placeInfoReq = {
      read: () => this.measureInfo(),
      write: (l) => this.placeInfo(l),
      key: this
    }, this.space = null, this.currentClass = "";
    let s = e.state.field(t), { options: r, selected: o } = s.open, a = e.state.facet(Oe);
    this.optionContent = zx(a), this.optionClass = a.optionClass, this.tooltipClass = a.tooltipClass, this.range = cl(r.length, o, a.maxRenderedOptions), this.dom = document.createElement("div"), this.dom.className = "cm-tooltip-autocomplete", this.updateTooltipClass(e.state), this.dom.addEventListener("mousedown", (l) => {
      let { options: h } = e.state.field(t).open;
      for (let c = l.target, u; c && c != this.dom; c = c.parentNode)
        if (c.nodeName == "LI" && (u = /-(\d+)$/.exec(c.id)) && +u[1] < h.length) {
          this.applyCompletion(e, h[+u[1]]), l.preventDefault();
          return;
        }
    }), this.dom.addEventListener("focusout", (l) => {
      let h = e.state.field(this.stateField, !1);
      h && h.tooltip && e.state.facet(Oe).closeOnBlur && l.relatedTarget != e.contentDOM && e.dispatch({ effects: Zs.of(null) });
    }), this.showOptions(r, s.id);
  }
  mount() {
    this.updateSel();
  }
  showOptions(e, t) {
    this.list && this.list.remove(), this.list = this.dom.appendChild(this.createListBox(e, t, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfoReq);
    });
  }
  update(e) {
    var t;
    let n = e.state.field(this.stateField), s = e.startState.field(this.stateField);
    if (this.updateTooltipClass(e.state), n != s) {
      let { options: r, selected: o, disabled: a } = n.open;
      (!s.open || s.open.options != r) && (this.range = cl(r.length, o, e.state.facet(Oe).maxRenderedOptions), this.showOptions(r, n.id)), this.updateSel(), a != ((t = s.open) === null || t === void 0 ? void 0 : t.disabled) && this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!a);
    }
  }
  updateTooltipClass(e) {
    let t = this.tooltipClass(e);
    if (t != this.currentClass) {
      for (let n of this.currentClass.split(" "))
        n && this.dom.classList.remove(n);
      for (let n of t.split(" "))
        n && this.dom.classList.add(n);
      this.currentClass = t;
    }
  }
  positioned(e) {
    this.space = e, this.info && this.view.requestMeasure(this.placeInfoReq);
  }
  updateSel() {
    let e = this.view.state.field(this.stateField), t = e.open;
    (t.selected > -1 && t.selected < this.range.from || t.selected >= this.range.to) && (this.range = cl(t.options.length, t.selected, this.view.state.facet(Oe).maxRenderedOptions), this.showOptions(t.options, e.id));
    let n = this.updateSelectedOption(t.selected);
    if (n) {
      this.destroyInfo();
      let { completion: s } = t.options[t.selected], { info: r } = s;
      if (!r)
        return;
      let o = typeof r == "string" ? document.createTextNode(r) : r(s);
      if (!o)
        return;
      "then" in o ? o.then((a) => {
        a && this.view.state.field(this.stateField, !1) == e && this.addInfoPane(a, s);
      }).catch((a) => ut(this.view.state, a, "completion info")) : (this.addInfoPane(o, s), n.setAttribute("aria-describedby", this.info.id));
    }
  }
  addInfoPane(e, t) {
    this.destroyInfo();
    let n = this.info = document.createElement("div");
    if (n.className = "cm-tooltip cm-completionInfo", n.id = "cm-completionInfo-" + Math.floor(Math.random() * 65535).toString(16), e.nodeType != null)
      n.appendChild(e), this.infoDestroy = null;
    else {
      let { dom: s, destroy: r } = e;
      n.appendChild(s), this.infoDestroy = r || null;
    }
    this.dom.appendChild(n), this.view.requestMeasure(this.placeInfoReq);
  }
  updateSelectedOption(e) {
    let t = null;
    for (let n = this.list.firstChild, s = this.range.from; n; n = n.nextSibling, s++)
      n.nodeName != "LI" || !n.id ? s-- : s == e ? n.hasAttribute("aria-selected") || (n.setAttribute("aria-selected", "true"), t = n) : n.hasAttribute("aria-selected") && (n.removeAttribute("aria-selected"), n.removeAttribute("aria-describedby"));
    return t && qx(this.list, t), t;
  }
  measureInfo() {
    let e = this.dom.querySelector("[aria-selected]");
    if (!e || !this.info)
      return null;
    let t = this.dom.getBoundingClientRect(), n = this.info.getBoundingClientRect(), s = e.getBoundingClientRect(), r = this.space;
    if (!r) {
      let o = this.dom.ownerDocument.documentElement;
      r = { left: 0, top: 0, right: o.clientWidth, bottom: o.clientHeight };
    }
    return s.top > Math.min(r.bottom, t.bottom) - 10 || s.bottom < Math.max(r.top, t.top) + 10 ? null : this.view.state.facet(Oe).positionInfo(this.view, t, s, n, r, this.dom);
  }
  placeInfo(e) {
    this.info && (e ? (e.style && (this.info.style.cssText = e.style), this.info.className = "cm-tooltip cm-completionInfo " + (e.class || "")) : this.info.style.cssText = "top: -1e6px");
  }
  createListBox(e, t, n) {
    const s = document.createElement("ul");
    s.id = t, s.setAttribute("role", "listbox"), s.setAttribute("aria-expanded", "true"), s.setAttribute("aria-label", this.view.state.phrase("Completions")), s.addEventListener("mousedown", (o) => {
      o.target == s && o.preventDefault();
    });
    let r = null;
    for (let o = n.from; o < n.to; o++) {
      let { completion: a, match: l } = e[o], { section: h } = a;
      if (h) {
        let f = typeof h == "string" ? h : h.name;
        if (f != r && (o > n.from || n.from == 0))
          if (r = f, typeof h != "string" && h.header)
            s.appendChild(h.header(h));
          else {
            let d = s.appendChild(document.createElement("completion-section"));
            d.textContent = f;
          }
      }
      const c = s.appendChild(document.createElement("li"));
      c.id = t + "-" + o, c.setAttribute("role", "option");
      let u = this.optionClass(a);
      u && (c.className = u);
      for (let f of this.optionContent) {
        let d = f(a, this.view.state, this.view, l);
        d && c.appendChild(d);
      }
    }
    return n.from && s.classList.add("cm-completionListIncompleteTop"), n.to < e.length && s.classList.add("cm-completionListIncompleteBottom"), s;
  }
  destroyInfo() {
    this.info && (this.infoDestroy && this.infoDestroy(), this.info.remove(), this.info = null);
  }
  destroy() {
    this.destroyInfo();
  }
}
function Kx(i, e) {
  return (t) => new Gx(t, i, e);
}
function qx(i, e) {
  let t = i.getBoundingClientRect(), n = e.getBoundingClientRect(), s = t.height / i.offsetHeight;
  n.top < t.top ? i.scrollTop -= (t.top - n.top) / s : n.bottom > t.bottom && (i.scrollTop += (n.bottom - t.bottom) / s);
}
function vf(i) {
  return (i.boost || 0) * 100 + (i.apply ? 10 : 0) + (i.info ? 5 : 0) + (i.type ? 1 : 0);
}
function Yx(i, e) {
  let t = [], n = null, s = null, r = (c) => {
    t.push(c);
    let { section: u } = c.completion;
    if (u) {
      n || (n = []);
      let f = typeof u == "string" ? u : u.name;
      n.some((d) => d.name == f) || n.push(typeof u == "string" ? { name: f } : u);
    }
  }, o = e.facet(Oe);
  for (let c of i)
    if (c.hasResult()) {
      let u = c.result.getMatch;
      if (c.result.filter === !1)
        for (let f of c.result.options)
          r(new gf(f, c.source, u ? u(f) : [], 1e9 - t.length));
      else {
        let f = e.sliceDoc(c.from, c.to), d, p = o.filterStrict ? new Vx(f) : new Hx(f);
        for (let m of c.result.options)
          if (d = p.match(m.label)) {
            let g = m.displayLabel ? u ? u(m, d.matched) : [] : d.matched, y = d.score + (m.boost || 0);
            if (r(new gf(m, c.source, g, y)), typeof m.section == "object" && m.section.rank === "dynamic") {
              let { name: b } = m.section;
              s || (s = /* @__PURE__ */ Object.create(null)), s[b] = Math.max(y, s[b] || -1e9);
            }
          }
      }
    }
  if (n) {
    let c = /* @__PURE__ */ Object.create(null), u = 0, f = (d, p) => (d.rank === "dynamic" && p.rank === "dynamic" ? s[p.name] - s[d.name] : 0) || (typeof d.rank == "number" ? d.rank : 1e9) - (typeof p.rank == "number" ? p.rank : 1e9) || (d.name < p.name ? -1 : 1);
    for (let d of n.sort(f))
      u -= 1e5, c[d.name] = u;
    for (let d of t) {
      let { section: p } = d.completion;
      p && (d.score += c[typeof p == "string" ? p : p.name]);
    }
  }
  let a = [], l = null, h = o.compareCompletions;
  for (let c of t.sort((u, f) => f.score - u.score || h(u.completion, f.completion))) {
    let u = c.completion;
    !l || l.label != u.label || l.detail != u.detail || l.type != null && u.type != null && l.type != u.type || l.apply != u.apply || l.boost != u.boost ? a.push(c) : vf(c.completion) > vf(l) && (a[a.length - 1] = c), l = c.completion;
  }
  return a;
}
class Hn {
  constructor(e, t, n, s, r, o) {
    this.options = e, this.attrs = t, this.tooltip = n, this.timestamp = s, this.selected = r, this.disabled = o;
  }
  setSelected(e, t) {
    return e == this.selected || e >= this.options.length ? this : new Hn(this.options, Sf(t, e), this.tooltip, this.timestamp, e, this.disabled);
  }
  static build(e, t, n, s, r, o) {
    if (s && !o && e.some((h) => h.isPending))
      return s.setDisabled();
    let a = Yx(e, t);
    if (!a.length)
      return s && e.some((h) => h.isPending) ? s.setDisabled() : null;
    let l = t.facet(Oe).selectOnOpen ? 0 : -1;
    if (s && s.selected != l && s.selected != -1) {
      let h = s.options[s.selected].completion;
      for (let c = 0; c < a.length; c++)
        if (a[c].completion == h) {
          l = c;
          break;
        }
    }
    return new Hn(a, Sf(n, l), {
      pos: e.reduce((h, c) => c.hasResult() ? Math.min(h, c.from) : h, 1e8),
      create: tE,
      above: r.aboveCursor
    }, s ? s.timestamp : Date.now(), l, !1);
  }
  map(e) {
    return new Hn(this.options, this.attrs, { ...this.tooltip, pos: e.mapPos(this.tooltip.pos) }, this.timestamp, this.selected, this.disabled);
  }
  setDisabled() {
    return new Hn(this.options, this.attrs, this.tooltip, this.timestamp, this.selected, !0);
  }
}
class Bo {
  constructor(e, t, n) {
    this.active = e, this.id = t, this.open = n;
  }
  static start() {
    return new Bo(Zx, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(e) {
    let { state: t } = e, n = t.facet(Oe), r = (n.override || t.languageDataAt("autocomplete", pn(t)).map(Wx)).map((l) => (this.active.find((c) => c.source == l) || new vt(
      l,
      this.active.some(
        (c) => c.state != 0
        /* State.Inactive */
      ) ? 1 : 0
      /* State.Inactive */
    )).update(e, n));
    r.length == this.active.length && r.every((l, h) => l == this.active[h]) && (r = this.active);
    let o = this.open, a = e.effects.some((l) => l.is(gc));
    o && e.docChanged && (o = o.map(e.changes)), e.selection || r.some((l) => l.hasResult() && e.changes.touchesRange(l.from, l.to)) || !Xx(r, this.active) || a ? o = Hn.build(r, t, this.id, o, n, a) : o && o.disabled && !r.some((l) => l.isPending) && (o = null), !o && r.every((l) => !l.isPending) && r.some((l) => l.hasResult()) && (r = r.map((l) => l.hasResult() ? new vt(
      l.source,
      0
      /* State.Inactive */
    ) : l));
    for (let l of e.effects)
      l.is(tg) && (o = o && o.setSelected(l.value, this.id));
    return r == this.active && o == this.open ? this : new Bo(r, this.id, o);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : this.active.length ? Jx : Qx;
  }
}
function Xx(i, e) {
  if (i == e)
    return !0;
  for (let t = 0, n = 0; ; ) {
    for (; t < i.length && !i[t].hasResult(); )
      t++;
    for (; n < e.length && !e[n].hasResult(); )
      n++;
    let s = t == i.length, r = n == e.length;
    if (s || r)
      return s == r;
    if (i[t++].result != e[n++].result)
      return !1;
  }
}
const Jx = {
  "aria-autocomplete": "list"
}, Qx = {};
function Sf(i, e) {
  let t = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": i
  };
  return e > -1 && (t["aria-activedescendant"] = i + "-" + e), t;
}
const Zx = [];
function eg(i, e) {
  if (i.isUserEvent("input.complete")) {
    let n = i.annotation(Zm);
    if (n && e.activateOnCompletion(n))
      return 12;
  }
  let t = i.isUserEvent("input.type");
  return t && e.activateOnTyping ? 5 : t ? 1 : i.isUserEvent("delete.backward") ? 2 : i.selection ? 8 : i.docChanged ? 16 : 0;
}
class vt {
  constructor(e, t, n = !1) {
    this.source = e, this.state = t, this.explicit = n;
  }
  hasResult() {
    return !1;
  }
  get isPending() {
    return this.state == 1;
  }
  update(e, t) {
    let n = eg(e, t), s = this;
    (n & 8 || n & 16 && this.touches(e)) && (s = new vt(
      s.source,
      0
      /* State.Inactive */
    )), n & 4 && s.state == 0 && (s = new vt(
      this.source,
      1
      /* State.Pending */
    )), s = s.updateFor(e, n);
    for (let r of e.effects)
      if (r.is($o))
        s = new vt(s.source, 1, r.value);
      else if (r.is(Zs))
        s = new vt(
          s.source,
          0
          /* State.Inactive */
        );
      else if (r.is(gc))
        for (let o of r.value)
          o.source == s.source && (s = o);
    return s;
  }
  updateFor(e, t) {
    return this.map(e.changes);
  }
  map(e) {
    return this;
  }
  touches(e) {
    return e.changes.touchesRange(pn(e.state));
  }
}
class Kn extends vt {
  constructor(e, t, n, s, r, o) {
    super(e, 3, t), this.limit = n, this.result = s, this.from = r, this.to = o;
  }
  hasResult() {
    return !0;
  }
  updateFor(e, t) {
    var n;
    if (!(t & 3))
      return this.map(e.changes);
    let s = this.result;
    s.map && !e.changes.empty && (s = s.map(s, e.changes));
    let r = e.changes.mapPos(this.from), o = e.changes.mapPos(this.to, 1), a = pn(e.state);
    if (a > o || !s || t & 2 && (pn(e.startState) == this.from || a < this.limit))
      return new vt(
        this.source,
        t & 4 ? 1 : 0
        /* State.Inactive */
      );
    let l = e.changes.mapPos(this.limit);
    return eE(s.validFor, e.state, r, o) ? new Kn(this.source, this.explicit, l, s, r, o) : s.update && (s = s.update(s, r, o, new Xm(e.state, a, !1))) ? new Kn(this.source, this.explicit, l, s, s.from, (n = s.to) !== null && n !== void 0 ? n : pn(e.state)) : new vt(this.source, 1, this.explicit);
  }
  map(e) {
    return e.empty ? this : (this.result.map ? this.result.map(this.result, e) : this.result) ? new Kn(this.source, this.explicit, e.mapPos(this.limit), this.result, e.mapPos(this.from), e.mapPos(this.to, 1)) : new vt(
      this.source,
      0
      /* State.Inactive */
    );
  }
  touches(e) {
    return e.changes.touchesRange(this.from, this.to);
  }
}
function eE(i, e, t, n) {
  if (!i)
    return !1;
  let s = e.sliceDoc(t, n);
  return typeof i == "function" ? i(s, t, n, e) : Qm(i, !0).test(s);
}
const gc = /* @__PURE__ */ V.define({
  map(i, e) {
    return i.map((t) => t.map(e));
  }
}), tg = /* @__PURE__ */ V.define(), Je = /* @__PURE__ */ Ke.define({
  create() {
    return Bo.start();
  },
  update(i, e) {
    return i.update(e);
  },
  provide: (i) => [
    Tm.from(i, (e) => e.tooltip),
    O.contentAttributes.from(i, (e) => e.attrs)
  ]
});
function yc(i, e) {
  const t = e.completion.apply || e.completion.label;
  let n = i.state.field(Je).active.find((s) => s.source == e.source);
  return n instanceof Kn ? (typeof t == "string" ? i.dispatch({
    ...Fx(i.state, t, n.from, n.to),
    annotations: Zm.of(e.completion)
  }) : t(i, e.completion, n.from, n.to), !0) : !1;
}
const tE = /* @__PURE__ */ Kx(Je, yc);
function Gr(i, e = "option") {
  return (t) => {
    let n = t.state.field(Je, !1);
    if (!n || !n.open || n.open.disabled || Date.now() - n.open.timestamp < t.state.facet(Oe).interactionDelay)
      return !1;
    let s = 1, r;
    e == "page" && (r = xm(t, n.open.tooltip)) && (s = Math.max(2, Math.floor(r.dom.offsetHeight / r.dom.querySelector("li").offsetHeight) - 1));
    let { length: o } = n.open.options, a = n.open.selected > -1 ? n.open.selected + s * (i ? 1 : -1) : i ? 0 : o - 1;
    return a < 0 ? a = e == "page" ? 0 : o - 1 : a >= o && (a = e == "page" ? o - 1 : 0), t.dispatch({ effects: tg.of(a) }), !0;
  };
}
const iE = (i) => {
  let e = i.state.field(Je, !1);
  return i.state.readOnly || !e || !e.open || e.open.selected < 0 || e.open.disabled || Date.now() - e.open.timestamp < i.state.facet(Oe).interactionDelay ? !1 : yc(i, e.open.options[e.open.selected]);
}, ul = (i) => i.state.field(Je, !1) ? (i.dispatch({ effects: $o.of(!0) }), !0) : !1, nE = (i) => {
  let e = i.state.field(Je, !1);
  return !e || !e.active.some(
    (t) => t.state != 0
    /* State.Inactive */
  ) ? !1 : (i.dispatch({ effects: Zs.of(null) }), !0);
};
class sE {
  constructor(e, t) {
    this.active = e, this.context = t, this.time = Date.now(), this.updates = [], this.done = void 0;
  }
}
const rE = 50, oE = 1e3, aE = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.view = i, this.debounceUpdate = -1, this.running = [], this.debounceAccept = -1, this.pendingStart = !1, this.composing = 0;
    for (let e of i.state.field(Je).active)
      e.isPending && this.startQuery(e);
  }
  update(i) {
    let e = i.state.field(Je), t = i.state.facet(Oe);
    if (!i.selectionSet && !i.docChanged && i.startState.field(Je) == e)
      return;
    let n = i.transactions.some((r) => {
      let o = eg(r, t);
      return o & 8 || (r.selection || r.docChanged) && !(o & 3);
    });
    for (let r = 0; r < this.running.length; r++) {
      let o = this.running[r];
      if (n || o.context.abortOnDocChange && i.docChanged || o.updates.length + i.transactions.length > rE && Date.now() - o.time > oE) {
        for (let a of o.context.abortListeners)
          try {
            a();
          } catch (l) {
            ut(this.view.state, l);
          }
        o.context.abortListeners = null, this.running.splice(r--, 1);
      } else
        o.updates.push(...i.transactions);
    }
    this.debounceUpdate > -1 && clearTimeout(this.debounceUpdate), i.transactions.some((r) => r.effects.some((o) => o.is($o))) && (this.pendingStart = !0);
    let s = this.pendingStart ? 50 : t.activateOnTypingDelay;
    if (this.debounceUpdate = e.active.some((r) => r.isPending && !this.running.some((o) => o.active.source == r.source)) ? setTimeout(() => this.startUpdate(), s) : -1, this.composing != 0)
      for (let r of i.transactions)
        r.isUserEvent("input.type") ? this.composing = 2 : this.composing == 2 && r.selection && (this.composing = 3);
  }
  startUpdate() {
    this.debounceUpdate = -1, this.pendingStart = !1;
    let { state: i } = this.view, e = i.field(Je);
    for (let t of e.active)
      t.isPending && !this.running.some((n) => n.active.source == t.source) && this.startQuery(t);
    this.running.length && e.open && e.open.disabled && (this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(Oe).updateSyncTime));
  }
  startQuery(i) {
    let { state: e } = this.view, t = pn(e), n = new Xm(e, t, i.explicit, this.view), s = new sE(i, n);
    this.running.push(s), Promise.resolve(i.source(n)).then((r) => {
      s.context.aborted || (s.done = r || null, this.scheduleAccept());
    }, (r) => {
      this.view.dispatch({ effects: Zs.of(null) }), ut(this.view.state, r);
    });
  }
  scheduleAccept() {
    this.running.every((i) => i.done !== void 0) ? this.accept() : this.debounceAccept < 0 && (this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(Oe).updateSyncTime));
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var i;
    this.debounceAccept > -1 && clearTimeout(this.debounceAccept), this.debounceAccept = -1;
    let e = [], t = this.view.state.facet(Oe), n = this.view.state.field(Je);
    for (let s = 0; s < this.running.length; s++) {
      let r = this.running[s];
      if (r.done === void 0)
        continue;
      if (this.running.splice(s--, 1), r.done) {
        let a = pn(r.updates.length ? r.updates[0].startState : this.view.state), l = Math.min(a, r.done.from + (r.active.explicit ? 0 : 1)), h = new Kn(r.active.source, r.active.explicit, l, r.done, r.done.from, (i = r.done.to) !== null && i !== void 0 ? i : a);
        for (let c of r.updates)
          h = h.update(c, t);
        if (h.hasResult()) {
          e.push(h);
          continue;
        }
      }
      let o = n.active.find((a) => a.source == r.active.source);
      if (o && o.isPending)
        if (r.done == null) {
          let a = new vt(
            r.active.source,
            0
            /* State.Inactive */
          );
          for (let l of r.updates)
            a = a.update(l, t);
          a.isPending || e.push(a);
        } else
          this.startQuery(o);
    }
    (e.length || n.open && n.open.disabled) && this.view.dispatch({ effects: gc.of(e) });
  }
}, {
  eventHandlers: {
    blur(i) {
      let e = this.view.state.field(Je, !1);
      if (e && e.tooltip && this.view.state.facet(Oe).closeOnBlur) {
        let t = e.open && xm(this.view, e.open.tooltip);
        (!t || !t.dom.contains(i.relatedTarget)) && setTimeout(() => this.view.dispatch({ effects: Zs.of(null) }), 10);
      }
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      this.composing == 3 && setTimeout(() => this.view.dispatch({ effects: $o.of(!1) }), 20), this.composing = 0;
    }
  }
}), lE = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform), hE = /* @__PURE__ */ kn.highest(/* @__PURE__ */ O.domEventHandlers({
  keydown(i, e) {
    let t = e.state.field(Je, !1);
    if (!t || !t.open || t.open.disabled || t.open.selected < 0 || i.key.length > 1 || i.ctrlKey && !(lE && i.altKey) || i.metaKey)
      return !1;
    let n = t.open.options[t.open.selected], s = t.active.find((o) => o.source == n.source), r = n.completion.commitCharacters || s.result.commitCharacters;
    return r && r.indexOf(i.key) > -1 && yc(e, n), !1;
  }
})), cE = /* @__PURE__ */ O.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
}), er = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>",
  stringPrefixes: []
}, cn = /* @__PURE__ */ V.define({
  map(i, e) {
    let t = e.mapPos(i, -1, Qe.TrackAfter);
    return t ?? void 0;
  }
}), bc = /* @__PURE__ */ new class extends Vi {
}();
bc.startSide = 1;
bc.endSide = -1;
const ig = /* @__PURE__ */ Ke.define({
  create() {
    return H.empty;
  },
  update(i, e) {
    if (i = i.map(e.changes), e.selection) {
      let t = e.state.doc.lineAt(e.selection.main.head);
      i = i.update({ filter: (n) => n >= t.from && n <= t.to });
    }
    for (let t of e.effects)
      t.is(cn) && (i = i.update({ add: [bc.range(t.value, t.value + 1)] }));
    return i;
  }
});
function uE() {
  return [dE, ig];
}
const fl = "()[]{}<>«»»«［］｛｝";
function ng(i) {
  for (let e = 0; e < fl.length; e += 2)
    if (fl.charCodeAt(e) == i)
      return fl.charAt(e + 1);
  return Kh(i < 128 ? i : i + 1);
}
function sg(i, e) {
  return i.languageDataAt("closeBrackets", e)[0] || er;
}
const fE = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), dE = /* @__PURE__ */ O.inputHandler.of((i, e, t, n) => {
  if ((fE ? i.composing : i.compositionStarted) || i.state.readOnly)
    return !1;
  let s = i.state.selection.main;
  if (n.length > 2 || n.length == 2 && Qt(Xe(n, 0)) == 1 || e != s.from || t != s.to)
    return !1;
  let r = gE(i.state, n);
  return r ? (i.dispatch(r), !0) : !1;
}), pE = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let n = sg(i, i.selection.main.head).brackets || er.brackets, s = null, r = i.changeByRange((o) => {
    if (o.empty) {
      let a = yE(i.doc, o.head);
      for (let l of n)
        if (l == a && pa(i.doc, o.head) == ng(Xe(l, 0)))
          return {
            changes: { from: o.head - l.length, to: o.head + l.length },
            range: x.cursor(o.head - l.length)
          };
    }
    return { range: s = o };
  });
  return s || e(i.update(r, { scrollIntoView: !0, userEvent: "delete.backward" })), !s;
}, mE = [
  { key: "Backspace", run: pE }
];
function gE(i, e) {
  let t = sg(i, i.selection.main.head), n = t.brackets || er.brackets;
  for (let s of n) {
    let r = ng(Xe(s, 0));
    if (e == s)
      return r == s ? SE(i, s, n.indexOf(s + s + s) > -1, t) : bE(i, s, r, t.before || er.before);
    if (e == r && rg(i, i.selection.main.from))
      return vE(i, s, r);
  }
  return null;
}
function rg(i, e) {
  let t = !1;
  return i.field(ig).between(0, i.doc.length, (n) => {
    n == e && (t = !0);
  }), t;
}
function pa(i, e) {
  let t = i.sliceString(e, e + 2);
  return t.slice(0, Qt(Xe(t, 0)));
}
function yE(i, e) {
  let t = i.sliceString(e - 2, e);
  return Qt(Xe(t, 0)) == t.length ? t : t.slice(1);
}
function bE(i, e, t, n) {
  let s = null, r = i.changeByRange((o) => {
    if (!o.empty)
      return {
        changes: [{ insert: e, from: o.from }, { insert: t, from: o.to }],
        effects: cn.of(o.to + e.length),
        range: x.range(o.anchor + e.length, o.head + e.length)
      };
    let a = pa(i.doc, o.head);
    return !a || /\s/.test(a) || n.indexOf(a) > -1 ? {
      changes: { insert: e + t, from: o.head },
      effects: cn.of(o.head + e.length),
      range: x.cursor(o.head + e.length)
    } : { range: s = o };
  });
  return s ? null : i.update(r, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function vE(i, e, t) {
  let n = null, s = i.changeByRange((r) => r.empty && pa(i.doc, r.head) == t ? {
    changes: { from: r.head, to: r.head + t.length, insert: t },
    range: x.cursor(r.head + t.length)
  } : n = { range: r });
  return n ? null : i.update(s, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function SE(i, e, t, n) {
  let s = n.stringPrefixes || er.stringPrefixes, r = null, o = i.changeByRange((a) => {
    if (!a.empty)
      return {
        changes: [{ insert: e, from: a.from }, { insert: e, from: a.to }],
        effects: cn.of(a.to + e.length),
        range: x.range(a.anchor + e.length, a.head + e.length)
      };
    let l = a.head, h = pa(i.doc, l), c;
    if (h == e) {
      if (Tf(i, l))
        return {
          changes: { insert: e + e, from: l },
          effects: cn.of(l + e.length),
          range: x.cursor(l + e.length)
        };
      if (rg(i, l)) {
        let f = t && i.sliceDoc(l, l + e.length * 3) == e + e + e ? e + e + e : e;
        return {
          changes: { from: l, to: l + f.length, insert: f },
          range: x.cursor(l + f.length)
        };
      }
    } else {
      if (t && i.sliceDoc(l - 2 * e.length, l) == e + e && (c = xf(i, l - 2 * e.length, s)) > -1 && Tf(i, c))
        return {
          changes: { insert: e + e + e + e, from: l },
          effects: cn.of(l + e.length),
          range: x.cursor(l + e.length)
        };
      if (i.charCategorizer(l)(h) != ae.Word && xf(i, l, s) > -1 && !TE(i, l, e, s))
        return {
          changes: { insert: e + e, from: l },
          effects: cn.of(l + e.length),
          range: x.cursor(l + e.length)
        };
    }
    return { range: r = a };
  });
  return r ? null : i.update(o, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function Tf(i, e) {
  let t = Ue(i).resolveInner(e + 1);
  return t.parent && t.from == e;
}
function TE(i, e, t, n) {
  let s = Ue(i).resolveInner(e, -1), r = n.reduce((o, a) => Math.max(o, a.length), 0);
  for (let o = 0; o < 5; o++) {
    let a = i.sliceDoc(s.from, Math.min(s.to, s.from + t.length + r)), l = a.indexOf(t);
    if (!l || l > -1 && n.indexOf(a.slice(0, l)) > -1) {
      let c = s.firstChild;
      for (; c && c.from == s.from && c.to - c.from > t.length + l; ) {
        if (i.sliceDoc(c.to - t.length, c.to) == t)
          return !1;
        c = c.firstChild;
      }
      return !0;
    }
    let h = s.to == e && s.parent;
    if (!h)
      break;
    s = h;
  }
  return !1;
}
function xf(i, e, t) {
  let n = i.charCategorizer(e);
  if (n(i.sliceDoc(e - 1, e)) != ae.Word)
    return e;
  for (let s of t) {
    let r = e - s.length;
    if (i.sliceDoc(r, e) == s && n(i.sliceDoc(r - 1, r)) != ae.Word)
      return r;
  }
  return -1;
}
function xE(i = {}) {
  return [
    hE,
    Je,
    Oe.of(i),
    aE,
    EE,
    cE
  ];
}
const og = [
  { key: "Ctrl-Space", run: ul },
  { mac: "Alt-`", run: ul },
  { mac: "Alt-i", run: ul },
  { key: "Escape", run: nE },
  { key: "ArrowDown", run: /* @__PURE__ */ Gr(!0) },
  { key: "ArrowUp", run: /* @__PURE__ */ Gr(!1) },
  { key: "PageDown", run: /* @__PURE__ */ Gr(!0, "page") },
  { key: "PageUp", run: /* @__PURE__ */ Gr(!1, "page") },
  { key: "Enter", run: iE }
], EE = /* @__PURE__ */ kn.highest(/* @__PURE__ */ hc.computeN([Oe], (i) => i.facet(Oe).defaultKeymap ? [og] : [])), ag = [
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
], lg = [
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
], hg = [
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
], cg = [
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
], AE = [
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
], Ef = dc.define({
  name: "structuredtext",
  startState() {
    return { inBlockComment: !1 };
  },
  copyState(i) {
    return { inBlockComment: i.inBlockComment };
  },
  token(i, e) {
    if (i.eatSpace()) return null;
    if (i.match("(*") && (e.inBlockComment = !0), e.inBlockComment) {
      for (; !i.eol(); ) {
        if (i.match("*)"))
          return e.inBlockComment = !1, "comment";
        i.next();
      }
      return "comment";
    }
    if (i.match("//"))
      return i.skipToEnd(), "comment";
    if (i.match("{")) {
      let t = 1;
      for (; !i.eol() && t > 0; ) {
        const n = i.next();
        n === "{" && t++, n === "}" && t--;
      }
      return "meta";
    }
    if (i.match("'")) {
      for (; !i.eol(); )
        if (i.next() === "'" && !i.match("'"))
          return "string";
      return "string";
    }
    if (i.match(/T#[\d_hmsdu]+/i) || i.match(/TIME#[\d_hmsdu]+/i) || i.match(/16#[\da-fA-F_]+/) || i.match(/2#[01_]+/) || i.match(/8#[0-7_]+/) || i.match(/\d+\.\d+([eE][+-]?\d+)?/) || i.match(/\d+/))
      return "number";
    if (i.match(":=") || i.match("<=") || i.match(">=") || i.match("<>") || i.match("=>"))
      return "operator";
    if (i.match(/%[IQM][XBWDLxbwdl]?\*?/i))
      return "keyword";
    if (i.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const t = i.current().toUpperCase();
      return ag.includes(t) ? "keyword" : lg.includes(t) ? "typeName" : hg.includes(t) ? "function.standard" : cg.includes(t) ? "className" : "variableName";
    }
    return i.match(/[+\-*=<>()[\];:,.]/) ? "operator" : (i.next(), null);
  },
  languageData: {
    commentTokens: { line: "//", block: { open: "(*", close: "*)" } },
    closeBrackets: { brackets: ["(", "[", "{", "'"] }
  }
}), wE = Jm([
  ...ag.map((i) => ({ label: i, type: "keyword" })),
  ...lg.map((i) => ({ label: i, type: "type" })),
  ...hg.map((i) => ({ label: i, type: "function" })),
  ...cg.map((i) => ({ label: i, type: "class" })),
  ...AE.map((i) => ({
    label: `{${i}}`,
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
function CE() {
  return new GT(Ef, [
    Ef.data.of({ autocomplete: wE })
  ]);
}
const re = {
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
}, kE = O.theme(
  {
    "&": {
      color: re.fg,
      backgroundColor: re.bg,
      fontSize: "14px",
      fontFamily: '"Fira Code", "Consolas", monospace'
    },
    ".cm-content": {
      caretColor: re.cursor
    },
    ".cm-cursor": {
      borderLeftColor: re.cursor,
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
      backgroundColor: re.lineHighlight
    },
    ".cm-gutters": {
      backgroundColor: re.gutterBg,
      color: re.gutterFg,
      border: "none",
      borderRight: `1px solid ${re.border}`
    },
    ".cm-activeLineGutter": {
      backgroundColor: re.lineHighlight,
      color: re.fg
    },
    ".cm-foldGutter .cm-gutterElement": {
      cursor: "pointer"
    },
    ".cm-tooltip": {
      backgroundColor: re.bgLight,
      border: `1px solid ${re.border}`
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: re.selection
    }
  },
  { dark: !0 }
), _E = da.define([
  { tag: R.keyword, color: re.keyword, fontWeight: "bold" },
  { tag: R.typeName, color: re.type },
  {
    tag: [R.function(R.variableName), R.standard(R.function(R.variableName))],
    color: re.function
  },
  { tag: R.className, color: re.type },
  { tag: R.variableName, color: re.variable },
  { tag: R.propertyName, color: re.variable },
  { tag: R.string, color: re.string },
  { tag: R.number, color: re.number },
  { tag: R.comment, color: re.comment, fontStyle: "italic" },
  { tag: R.meta, color: re.pragma },
  { tag: R.operator, color: re.fg },
  { tag: R.invalid, color: "#ff0000", textDecoration: "underline wavy" }
]);
function OE() {
  return [kE, vx(_E)];
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fo = globalThis, vc = fo.ShadowRoot && (fo.ShadyCSS === void 0 || fo.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Sc = Symbol(), Af = /* @__PURE__ */ new WeakMap();
let ug = class {
  constructor(e, t, n) {
    if (this._$cssResult$ = !0, n !== Sc) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (vc && e === void 0) {
      const n = t !== void 0 && t.length === 1;
      n && (e = Af.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && Af.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const IE = (i) => new ug(typeof i == "string" ? i : i + "", void 0, Sc), Ji = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((n, s, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + i[r + 1], i[0]);
  return new ug(t, i, Sc);
}, RE = (i, e) => {
  if (vc) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const n = document.createElement("style"), s = fo.litNonce;
    s !== void 0 && n.setAttribute("nonce", s), n.textContent = t.cssText, i.appendChild(n);
  }
}, wf = vc ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const n of e.cssRules) t += n.cssText;
  return IE(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: NE, defineProperty: ME, getOwnPropertyDescriptor: LE, getOwnPropertyNames: PE, getOwnPropertySymbols: DE, getPrototypeOf: $E } = Object, Ui = globalThis, Cf = Ui.trustedTypes, BE = Cf ? Cf.emptyScript : "", dl = Ui.reactiveElementPolyfillSupport, Bs = (i, e) => i, Uo = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? BE : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, Tc = (i, e) => !NE(i, e), kf = { attribute: !0, type: String, converter: Uo, reflect: !1, useDefault: !1, hasChanged: Tc };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Ui.litPropertyMetadata ?? (Ui.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Pn = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = kf) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const n = Symbol(), s = this.getPropertyDescriptor(e, n, t);
      s !== void 0 && ME(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, n) {
    const { get: s, set: r } = LE(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: s, set(o) {
      const a = s == null ? void 0 : s.call(this);
      r == null || r.call(this, o), this.requestUpdate(e, a, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? kf;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Bs("elementProperties"))) return;
    const e = $E(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Bs("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Bs("properties"))) {
      const t = this.properties, n = [...PE(t), ...DE(t)];
      for (const s of n) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [n, s] of t) this.elementProperties.set(n, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, n] of this.elementProperties) {
      const s = this._$Eu(t, n);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const s of n) t.unshift(wf(s));
    } else e !== void 0 && t.push(wf(e));
    return t;
  }
  static _$Eu(e, t) {
    const n = t.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return RE(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var n;
      return (n = t.hostConnected) == null ? void 0 : n.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var n;
      return (n = t.hostDisconnected) == null ? void 0 : n.call(t);
    });
  }
  attributeChangedCallback(e, t, n) {
    this._$AK(e, n);
  }
  _$ET(e, t) {
    var r;
    const n = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, n);
    if (s !== void 0 && n.reflect === !0) {
      const o = (((r = n.converter) == null ? void 0 : r.toAttribute) !== void 0 ? n.converter : Uo).toAttribute(t, n.type);
      this._$Em = e, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var r, o;
    const n = this.constructor, s = n._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const a = n.getPropertyOptions(s), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((r = a.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? a.converter : Uo;
      this._$Em = s;
      const h = l.fromAttribute(t, a.type);
      this[s] = h ?? ((o = this._$Ej) == null ? void 0 : o.get(s)) ?? h, this._$Em = null;
    }
  }
  requestUpdate(e, t, n, s = !1, r) {
    var o;
    if (e !== void 0) {
      const a = this.constructor;
      if (s === !1 && (r = this[e]), n ?? (n = a.getPropertyOptions(e)), !((n.hasChanged ?? Tc)(r, t) || n.useDefault && n.reflect && r === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, n)))) return;
      this.C(e, t, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: n, reflect: s, wrapped: r }, o) {
    n && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var n;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: a } = o, l = this[r];
        a !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, o, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (n = this._$EO) == null || n.forEach((s) => {
        var r;
        return (r = s.hostUpdate) == null ? void 0 : r.call(s);
      }), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((n) => {
      var s;
      return (s = n.hostUpdated) == null ? void 0 : s.call(n);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
Pn.elementStyles = [], Pn.shadowRootOptions = { mode: "open" }, Pn[Bs("elementProperties")] = /* @__PURE__ */ new Map(), Pn[Bs("finalized")] = /* @__PURE__ */ new Map(), dl == null || dl({ ReactiveElement: Pn }), (Ui.reactiveElementVersions ?? (Ui.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Us = globalThis, _f = (i) => i, Fo = Us.trustedTypes, Of = Fo ? Fo.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, fg = "$lit$", Pi = `lit$${Math.random().toFixed(9).slice(2)}$`, dg = "?" + Pi, UE = `<${dg}>`, Tn = document, tr = () => Tn.createComment(""), ir = (i) => i === null || typeof i != "object" && typeof i != "function", xc = Array.isArray, FE = (i) => xc(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", pl = `[ 	
\f\r]`, vs = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, If = /-->/g, Rf = />/g, rn = RegExp(`>|${pl}(?:([^\\s"'>=/]+)(${pl}*=${pl}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Nf = /'/g, Mf = /"/g, pg = /^(?:script|style|textarea|title)$/i, WE = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), U = WE(1), is = Symbol.for("lit-noChange"), _e = Symbol.for("lit-nothing"), Lf = /* @__PURE__ */ new WeakMap(), un = Tn.createTreeWalker(Tn, 129);
function mg(i, e) {
  if (!xc(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Of !== void 0 ? Of.createHTML(e) : e;
}
const HE = (i, e) => {
  const t = i.length - 1, n = [];
  let s, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = vs;
  for (let a = 0; a < t; a++) {
    const l = i[a];
    let h, c, u = -1, f = 0;
    for (; f < l.length && (o.lastIndex = f, c = o.exec(l), c !== null); ) f = o.lastIndex, o === vs ? c[1] === "!--" ? o = If : c[1] !== void 0 ? o = Rf : c[2] !== void 0 ? (pg.test(c[2]) && (s = RegExp("</" + c[2], "g")), o = rn) : c[3] !== void 0 && (o = rn) : o === rn ? c[0] === ">" ? (o = s ?? vs, u = -1) : c[1] === void 0 ? u = -2 : (u = o.lastIndex - c[2].length, h = c[1], o = c[3] === void 0 ? rn : c[3] === '"' ? Mf : Nf) : o === Mf || o === Nf ? o = rn : o === If || o === Rf ? o = vs : (o = rn, s = void 0);
    const d = o === rn && i[a + 1].startsWith("/>") ? " " : "";
    r += o === vs ? l + UE : u >= 0 ? (n.push(h), l.slice(0, u) + fg + l.slice(u) + Pi + d) : l + Pi + (u === -2 ? a : d);
  }
  return [mg(i, r + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class nr {
  constructor({ strings: e, _$litType$: t }, n) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = e.length - 1, l = this.parts, [h, c] = HE(e, t);
    if (this.el = nr.createElement(h, n), un.currentNode = this.el.content, t === 2 || t === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = un.nextNode()) !== null && l.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(fg)) {
          const f = c[o++], d = s.getAttribute(u).split(Pi), p = /([.?@])?(.*)/.exec(f);
          l.push({ type: 1, index: r, name: p[2], strings: d, ctor: p[1] === "." ? jE : p[1] === "?" ? zE : p[1] === "@" ? GE : ma }), s.removeAttribute(u);
        } else u.startsWith(Pi) && (l.push({ type: 6, index: r }), s.removeAttribute(u));
        if (pg.test(s.tagName)) {
          const u = s.textContent.split(Pi), f = u.length - 1;
          if (f > 0) {
            s.textContent = Fo ? Fo.emptyScript : "";
            for (let d = 0; d < f; d++) s.append(u[d], tr()), un.nextNode(), l.push({ type: 2, index: ++r });
            s.append(u[f], tr());
          }
        }
      } else if (s.nodeType === 8) if (s.data === dg) l.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(Pi, u + 1)) !== -1; ) l.push({ type: 7, index: r }), u += Pi.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const n = Tn.createElement("template");
    return n.innerHTML = e, n;
  }
}
function ns(i, e, t = i, n) {
  var o, a;
  if (e === is) return e;
  let s = n !== void 0 ? (o = t._$Co) == null ? void 0 : o[n] : t._$Cl;
  const r = ir(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== r && ((a = s == null ? void 0 : s._$AO) == null || a.call(s, !1), r === void 0 ? s = void 0 : (s = new r(i), s._$AT(i, t, n)), n !== void 0 ? (t._$Co ?? (t._$Co = []))[n] = s : t._$Cl = s), s !== void 0 && (e = ns(i, s._$AS(i, e.values), s, n)), e;
}
class VE {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: n } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? Tn).importNode(t, !0);
    un.currentNode = s;
    let r = un.nextNode(), o = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new yr(r, r.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (h = new KE(r, this, e)), this._$AV.push(h), l = n[++a];
      }
      o !== (l == null ? void 0 : l.index) && (r = un.nextNode(), o++);
    }
    return un.currentNode = Tn, s;
  }
  p(e) {
    let t = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, t), t += n.strings.length - 2) : n._$AI(e[t])), t++;
  }
}
class yr {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, n, s) {
    this.type = 2, this._$AH = _e, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = ns(this, e, t), ir(e) ? e === _e || e == null || e === "" ? (this._$AH !== _e && this._$AR(), this._$AH = _e) : e !== this._$AH && e !== is && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : FE(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== _e && ir(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Tn.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var r;
    const { values: t, _$litType$: n } = e, s = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = nr.createElement(mg(n.h, n.h[0]), this.options)), n);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === s) this._$AH.p(t);
    else {
      const o = new VE(s, this), a = o.u(this.options);
      o.p(t), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Lf.get(e.strings);
    return t === void 0 && Lf.set(e.strings, t = new nr(e)), t;
  }
  k(e) {
    xc(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let n, s = 0;
    for (const r of e) s === t.length ? t.push(n = new yr(this.O(tr()), this.O(tr()), this, this.options)) : n = t[s], n._$AI(r), s++;
    s < t.length && (this._$AR(n && n._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var n;
    for ((n = this._$AP) == null ? void 0 : n.call(this, !1, !0, t); e !== this._$AB; ) {
      const s = _f(e).nextSibling;
      _f(e).remove(), e = s;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class ma {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, n, s, r) {
    this.type = 1, this._$AH = _e, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = _e;
  }
  _$AI(e, t = this, n, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = ns(this, e, t, 0), o = !ir(e) || e !== this._$AH && e !== is, o && (this._$AH = e);
    else {
      const a = e;
      let l, h;
      for (e = r[0], l = 0; l < r.length - 1; l++) h = ns(this, a[n + l], t, l), h === is && (h = this._$AH[l]), o || (o = !ir(h) || h !== this._$AH[l]), h === _e ? e = _e : e !== _e && (e += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    o && !s && this.j(e);
  }
  j(e) {
    e === _e ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class jE extends ma {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === _e ? void 0 : e;
  }
}
class zE extends ma {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _e);
  }
}
class GE extends ma {
  constructor(e, t, n, s, r) {
    super(e, t, n, s, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = ns(this, e, t, 0) ?? _e) === is) return;
    const n = this._$AH, s = e === _e && n !== _e || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, r = e !== _e && (n === _e || s);
    s && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class KE {
  constructor(e, t, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ns(this, e);
  }
}
const ml = Us.litHtmlPolyfillSupport;
ml == null || ml(nr, yr), (Us.litHtmlVersions ?? (Us.litHtmlVersions = [])).push("3.3.2");
const qE = (i, e, t) => {
  const n = (t == null ? void 0 : t.renderBefore) ?? e;
  let s = n._$litPart$;
  if (s === void 0) {
    const r = (t == null ? void 0 : t.renderBefore) ?? null;
    n._$litPart$ = s = new yr(e.insertBefore(tr(), r), r, void 0, t ?? {});
  }
  return s._$AI(i), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const mn = globalThis;
class xt extends Pn {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = qE(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return is;
  }
}
var Zd;
xt._$litElement$ = !0, xt.finalized = !0, (Zd = mn.litElementHydrateSupport) == null || Zd.call(mn, { LitElement: xt });
const gl = mn.litElementPolyfillSupport;
gl == null || gl({ LitElement: xt });
(mn.litElementVersions ?? (mn.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qi = (i) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(i, e);
  }) : customElements.define(i, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const YE = { attribute: !0, type: String, converter: Uo, reflect: !1, hasChanged: Tc }, XE = (i = YE, e, t) => {
  const { kind: n, metadata: s } = t;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), n === "setter" && ((i = Object.create(i)).wrapped = !0), r.set(t.name, i), n === "accessor") {
    const { name: o } = t;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, l, i, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, i, a), a;
    } };
  }
  if (n === "setter") {
    const { name: o } = t;
    return function(a) {
      const l = this[o];
      e.call(this, a), this.requestUpdate(o, l, i, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function Ce(i) {
  return (e, t) => typeof t == "object" ? XE(i, e, t) : ((n, s, r) => {
    const o = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(i, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function fe(i) {
  return Ce({ ...i, state: !0, attribute: !1 });
}
const JE = (i) => {
  let { state: e } = i, t = e.doc.lineAt(e.selection.main.from), n = Ac(i.state, t.from);
  return n.line ? QE(i) : n.block ? eA(i) : !1;
};
function Ec(i, e) {
  return ({ state: t, dispatch: n }) => {
    if (t.readOnly)
      return !1;
    let s = i(e, t);
    return s ? (n(t.update(s)), !0) : !1;
  };
}
const QE = /* @__PURE__ */ Ec(
  nA,
  0
  /* CommentOption.Toggle */
), ZE = /* @__PURE__ */ Ec(
  gg,
  0
  /* CommentOption.Toggle */
), eA = /* @__PURE__ */ Ec(
  (i, e) => gg(i, e, iA(e)),
  0
  /* CommentOption.Toggle */
);
function Ac(i, e) {
  let t = i.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const Ss = 50;
function tA(i, { open: e, close: t }, n, s) {
  let r = i.sliceDoc(n - Ss, n), o = i.sliceDoc(s, s + Ss), a = /\s*$/.exec(r)[0].length, l = /^\s*/.exec(o)[0].length, h = r.length - a;
  if (r.slice(h - e.length, h) == e && o.slice(l, l + t.length) == t)
    return {
      open: { pos: n - a, margin: a && 1 },
      close: { pos: s + l, margin: l && 1 }
    };
  let c, u;
  s - n <= 2 * Ss ? c = u = i.sliceDoc(n, s) : (c = i.sliceDoc(n, n + Ss), u = i.sliceDoc(s - Ss, s));
  let f = /^\s*/.exec(c)[0].length, d = /\s*$/.exec(u)[0].length, p = u.length - d - t.length;
  return c.slice(f, f + e.length) == e && u.slice(p, p + t.length) == t ? {
    open: {
      pos: n + f + e.length,
      margin: /\s/.test(c.charAt(f + e.length)) ? 1 : 0
    },
    close: {
      pos: s - d - t.length,
      margin: /\s/.test(u.charAt(p - 1)) ? 1 : 0
    }
  } : null;
}
function iA(i) {
  let e = [];
  for (let t of i.selection.ranges) {
    let n = i.doc.lineAt(t.from), s = t.to <= n.to ? n : i.doc.lineAt(t.to);
    s.from > n.from && s.from == t.to && (s = t.to == n.to + 1 ? n : i.doc.lineAt(t.to - 1));
    let r = e.length - 1;
    r >= 0 && e[r].to > n.from ? e[r].to = s.to : e.push({ from: n.from + /^\s*/.exec(n.text)[0].length, to: s.to });
  }
  return e;
}
function gg(i, e, t = e.selection.ranges) {
  let n = t.map((r) => Ac(e, r.from).block);
  if (!n.every((r) => r))
    return null;
  let s = t.map((r, o) => tA(e, n[o], r.from, r.to));
  if (i != 2 && !s.every((r) => r))
    return { changes: e.changes(t.map((r, o) => s[o] ? [] : [{ from: r.from, insert: n[o].open + " " }, { from: r.to, insert: " " + n[o].close }])) };
  if (i != 1 && s.some((r) => r)) {
    let r = [];
    for (let o = 0, a; o < s.length; o++)
      if (a = s[o]) {
        let l = n[o], { open: h, close: c } = a;
        r.push({ from: h.pos - l.open.length, to: h.pos + h.margin }, { from: c.pos - c.margin, to: c.pos + l.close.length });
      }
    return { changes: r };
  }
  return null;
}
function nA(i, e, t = e.selection.ranges) {
  let n = [], s = -1;
  for (let { from: r, to: o } of t) {
    let a = n.length, l = 1e9, h = Ac(e, r).line;
    if (h) {
      for (let c = r; c <= o; ) {
        let u = e.doc.lineAt(c);
        if (u.from > s && (r == o || o > u.from)) {
          s = u.from;
          let f = /^\s*/.exec(u.text)[0].length, d = f == u.length, p = u.text.slice(f, f + h.length) == h ? f : -1;
          f < u.text.length && f < l && (l = f), n.push({ line: u, comment: p, token: h, indent: f, empty: d, single: !1 });
        }
        c = u.to + 1;
      }
      if (l < 1e9)
        for (let c = a; c < n.length; c++)
          n[c].indent < n[c].line.text.length && (n[c].indent = l);
      n.length == a + 1 && (n[a].single = !0);
    }
  }
  if (i != 2 && n.some((r) => r.comment < 0 && (!r.empty || r.single))) {
    let r = [];
    for (let { line: a, token: l, indent: h, empty: c, single: u } of n)
      (u || !c) && r.push({ from: a.from + h, insert: l + " " });
    let o = e.changes(r);
    return { changes: o, selection: e.selection.map(o, 1) };
  } else if (i != 1 && n.some((r) => r.comment >= 0)) {
    let r = [];
    for (let { line: o, comment: a, token: l } of n)
      if (a >= 0) {
        let h = o.from + a, c = h + l.length;
        o.text[c - o.from] == " " && c++, r.push({ from: h, to: c });
      }
    return { changes: r };
  }
  return null;
}
const ph = /* @__PURE__ */ wi.define(), sA = /* @__PURE__ */ wi.define(), rA = /* @__PURE__ */ _.define(), yg = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (e, t) => t
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (e, t) => (n, s) => e(n, s) || t(n, s)
    });
  }
}), bg = /* @__PURE__ */ Ke.define({
  create() {
    return ti.empty;
  },
  update(i, e) {
    let t = e.state.facet(yg), n = e.annotation(ph);
    if (n) {
      let l = et.fromTransaction(e, n.selection), h = n.side, c = h == 0 ? i.undone : i.done;
      return l ? c = Wo(c, c.length, t.minDepth, l) : c = Tg(c, e.startState.selection), new ti(h == 0 ? n.rest : c, h == 0 ? c : n.rest);
    }
    let s = e.annotation(sA);
    if ((s == "full" || s == "before") && (i = i.isolate()), e.annotation(we.addToHistory) === !1)
      return e.changes.empty ? i : i.addMapping(e.changes.desc);
    let r = et.fromTransaction(e), o = e.annotation(we.time), a = e.annotation(we.userEvent);
    return r ? i = i.addChanges(r, o, a, t, e) : e.selection && (i = i.addSelection(e.startState.selection, o, a, t.newGroupDelay)), (s == "full" || s == "after") && (i = i.isolate()), i;
  },
  toJSON(i) {
    return { done: i.done.map((e) => e.toJSON()), undone: i.undone.map((e) => e.toJSON()) };
  },
  fromJSON(i) {
    return new ti(i.done.map(et.fromJSON), i.undone.map(et.fromJSON));
  }
});
function oA(i = {}) {
  return [
    bg,
    yg.of(i),
    O.domEventHandlers({
      beforeinput(e, t) {
        let n = e.inputType == "historyUndo" ? vg : e.inputType == "historyRedo" ? mh : null;
        return n ? (e.preventDefault(), n(t)) : !1;
      }
    })
  ];
}
function ga(i, e) {
  return function({ state: t, dispatch: n }) {
    if (!e && t.readOnly)
      return !1;
    let s = t.field(bg, !1);
    if (!s)
      return !1;
    let r = s.pop(i, t, e);
    return r ? (n(r), !0) : !1;
  };
}
const vg = /* @__PURE__ */ ga(0, !1), mh = /* @__PURE__ */ ga(1, !1), aA = /* @__PURE__ */ ga(0, !0), lA = /* @__PURE__ */ ga(1, !0);
class et {
  constructor(e, t, n, s, r) {
    this.changes = e, this.effects = t, this.mapped = n, this.startSelection = s, this.selectionsAfter = r;
  }
  setSelAfter(e) {
    return new et(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, n;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (n = this.startSelection) === null || n === void 0 ? void 0 : n.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(e) {
    return new et(e.changes && xe.fromJSON(e.changes), [], e.mapped && ii.fromJSON(e.mapped), e.startSelection && x.fromJSON(e.startSelection), e.selectionsAfter.map(x.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(e, t) {
    let n = St;
    for (let s of e.startState.facet(rA)) {
      let r = s(e);
      r.length && (n = n.concat(r));
    }
    return !n.length && e.changes.empty ? null : new et(e.changes.invert(e.startState.doc), n, void 0, t || e.startState.selection, St);
  }
  static selection(e) {
    return new et(void 0, St, void 0, void 0, e);
  }
}
function Wo(i, e, t, n) {
  let s = e + 1 > t + 20 ? e - t - 1 : 0, r = i.slice(s, e);
  return r.push(n), r;
}
function hA(i, e) {
  let t = [], n = !1;
  return i.iterChangedRanges((s, r) => t.push(s, r)), e.iterChangedRanges((s, r, o, a) => {
    for (let l = 0; l < t.length; ) {
      let h = t[l++], c = t[l++];
      a >= h && o <= c && (n = !0);
    }
  }), n;
}
function cA(i, e) {
  return i.ranges.length == e.ranges.length && i.ranges.filter((t, n) => t.empty != e.ranges[n].empty).length === 0;
}
function Sg(i, e) {
  return i.length ? e.length ? i.concat(e) : i : e;
}
const St = [], uA = 200;
function Tg(i, e) {
  if (i.length) {
    let t = i[i.length - 1], n = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - uA));
    return n.length && n[n.length - 1].eq(e) ? i : (n.push(e), Wo(i, i.length - 1, 1e9, t.setSelAfter(n)));
  } else
    return [et.selection([e])];
}
function fA(i) {
  let e = i[i.length - 1], t = i.slice();
  return t[i.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function yl(i, e) {
  if (!i.length)
    return i;
  let t = i.length, n = St;
  for (; t; ) {
    let s = dA(i[t - 1], e, n);
    if (s.changes && !s.changes.empty || s.effects.length) {
      let r = i.slice(0, t);
      return r[t - 1] = s, r;
    } else
      e = s.mapped, t--, n = s.selectionsAfter;
  }
  return n.length ? [et.selection(n)] : St;
}
function dA(i, e, t) {
  let n = Sg(i.selectionsAfter.length ? i.selectionsAfter.map((a) => a.map(e)) : St, t);
  if (!i.changes)
    return et.selection(n);
  let s = i.changes.map(e), r = e.mapDesc(i.changes, !0), o = i.mapped ? i.mapped.composeDesc(r) : r;
  return new et(s, V.mapEffects(i.effects, e), o, i.startSelection.map(r), n);
}
const pA = /^(input\.type|delete)($|\.)/;
class ti {
  constructor(e, t, n = 0, s = void 0) {
    this.done = e, this.undone = t, this.prevTime = n, this.prevUserEvent = s;
  }
  isolate() {
    return this.prevTime ? new ti(this.done, this.undone) : this;
  }
  addChanges(e, t, n, s, r) {
    let o = this.done, a = o[o.length - 1];
    return a && a.changes && !a.changes.empty && e.changes && (!n || pA.test(n)) && (!a.selectionsAfter.length && t - this.prevTime < s.newGroupDelay && s.joinToEvent(r, hA(a.changes, e.changes)) || // For compose (but not compose.start) events, always join with previous event
    n == "input.type.compose") ? o = Wo(o, o.length - 1, s.minDepth, new et(e.changes.compose(a.changes), Sg(V.mapEffects(e.effects, a.changes), a.effects), a.mapped, a.startSelection, St)) : o = Wo(o, o.length, s.minDepth, e), new ti(o, St, t, n);
  }
  addSelection(e, t, n, s) {
    let r = this.done.length ? this.done[this.done.length - 1].selectionsAfter : St;
    return r.length > 0 && t - this.prevTime < s && n == this.prevUserEvent && n && /^select($|\.)/.test(n) && cA(r[r.length - 1], e) ? this : new ti(Tg(this.done, e), this.undone, t, n);
  }
  addMapping(e) {
    return new ti(yl(this.done, e), yl(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, n) {
    let s = e == 0 ? this.done : this.undone;
    if (s.length == 0)
      return null;
    let r = s[s.length - 1], o = r.selectionsAfter[0] || t.selection;
    if (n && r.selectionsAfter.length)
      return t.update({
        selection: r.selectionsAfter[r.selectionsAfter.length - 1],
        annotations: ph.of({ side: e, rest: fA(s), selection: o }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (r.changes) {
      let a = s.length == 1 ? St : s.slice(0, s.length - 1);
      return r.mapped && (a = yl(a, r.mapped)), t.update({
        changes: r.changes,
        selection: r.startSelection,
        effects: r.effects,
        annotations: ph.of({ side: e, rest: a, selection: o }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
ti.empty = /* @__PURE__ */ new ti(St, St);
const mA = [
  { key: "Mod-z", run: vg, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: mh, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: mh, preventDefault: !0 },
  { key: "Mod-u", run: aA, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: lA, preventDefault: !0 }
];
function us(i, e) {
  return x.create(i.ranges.map(e), i.mainIndex);
}
function Ft(i, e) {
  return i.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Wt({ state: i, dispatch: e }, t) {
  let n = us(i.selection, t);
  return n.eq(i.selection, !0) ? !1 : (e(Ft(i, n)), !0);
}
function ya(i, e) {
  return x.cursor(e ? i.to : i.from);
}
function xg(i, e) {
  return Wt(i, (t) => t.empty ? i.moveByChar(t, e) : ya(t, e));
}
function We(i) {
  return i.textDirectionAt(i.state.selection.main.head) == ie.LTR;
}
const Eg = (i) => xg(i, !We(i)), Ag = (i) => xg(i, We(i));
function wg(i, e) {
  return Wt(i, (t) => t.empty ? i.moveByGroup(t, e) : ya(t, e));
}
const gA = (i) => wg(i, !We(i)), yA = (i) => wg(i, We(i));
function bA(i, e, t) {
  if (e.type.prop(t))
    return !0;
  let n = e.to - e.from;
  return n && (n > 2 || /[^\s,.;:]/.test(i.sliceDoc(e.from, e.to))) || e.firstChild;
}
function ba(i, e, t) {
  let n = Ue(i).resolveInner(e.head), s = t ? K.closedBy : K.openedBy;
  for (let l = e.head; ; ) {
    let h = t ? n.childAfter(l) : n.childBefore(l);
    if (!h)
      break;
    bA(i, h, s) ? n = h : l = t ? h.to : h.from;
  }
  let r = n.type.prop(s), o, a;
  return r && (o = t ? ei(i, n.from, 1) : ei(i, n.to, -1)) && o.matched ? a = t ? o.end.to : o.end.from : a = t ? n.to : n.from, x.cursor(a, t ? -1 : 1);
}
const vA = (i) => Wt(i, (e) => ba(i.state, e, !We(i))), SA = (i) => Wt(i, (e) => ba(i.state, e, We(i)));
function Cg(i, e) {
  return Wt(i, (t) => {
    if (!t.empty)
      return ya(t, e);
    let n = i.moveVertically(t, e);
    return n.head != t.head ? n : i.moveToLineBoundary(t, e);
  });
}
const kg = (i) => Cg(i, !1), _g = (i) => Cg(i, !0);
function Og(i) {
  let e = i.scrollDOM.clientHeight < i.scrollDOM.scrollHeight - 2, t = 0, n = 0, s;
  if (e) {
    for (let r of i.state.facet(O.scrollMargins)) {
      let o = r(i);
      o != null && o.top && (t = Math.max(o == null ? void 0 : o.top, t)), o != null && o.bottom && (n = Math.max(o == null ? void 0 : o.bottom, n));
    }
    s = i.scrollDOM.clientHeight - t - n;
  } else
    s = (i.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: n,
    selfScroll: e,
    height: Math.max(i.defaultLineHeight, s - 5)
  };
}
function Ig(i, e) {
  let t = Og(i), { state: n } = i, s = us(n.selection, (o) => o.empty ? i.moveVertically(o, e, t.height) : ya(o, e));
  if (s.eq(n.selection))
    return !1;
  let r;
  if (t.selfScroll) {
    let o = i.coordsAtPos(n.selection.main.head), a = i.scrollDOM.getBoundingClientRect(), l = a.top + t.marginTop, h = a.bottom - t.marginBottom;
    o && o.top > l && o.bottom < h && (r = O.scrollIntoView(s.main.head, { y: "start", yMargin: o.top - l }));
  }
  return i.dispatch(Ft(n, s), { effects: r }), !0;
}
const Pf = (i) => Ig(i, !1), gh = (i) => Ig(i, !0);
function Zi(i, e, t) {
  let n = i.lineBlockAt(e.head), s = i.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? n.to : n.from) && (s = i.moveToLineBoundary(e, t, !1)), !t && s.head == n.from && n.length) {
    let r = /^\s*/.exec(i.state.sliceDoc(n.from, Math.min(n.from + 100, n.to)))[0].length;
    r && e.head != n.from + r && (s = x.cursor(n.from + r));
  }
  return s;
}
const TA = (i) => Wt(i, (e) => Zi(i, e, !0)), xA = (i) => Wt(i, (e) => Zi(i, e, !1)), EA = (i) => Wt(i, (e) => Zi(i, e, !We(i))), AA = (i) => Wt(i, (e) => Zi(i, e, We(i))), wA = (i) => Wt(i, (e) => x.cursor(i.lineBlockAt(e.head).from, 1)), CA = (i) => Wt(i, (e) => x.cursor(i.lineBlockAt(e.head).to, -1));
function kA(i, e, t) {
  let n = !1, s = us(i.selection, (r) => {
    let o = ei(i, r.head, -1) || ei(i, r.head, 1) || r.head > 0 && ei(i, r.head - 1, 1) || r.head < i.doc.length && ei(i, r.head + 1, -1);
    if (!o || !o.end)
      return r;
    n = !0;
    let a = o.start.from == r.head ? o.end.to : o.end.from;
    return x.cursor(a);
  });
  return n ? (e(Ft(i, s)), !0) : !1;
}
const _A = ({ state: i, dispatch: e }) => kA(i, e);
function _t(i, e) {
  let t = us(i.state.selection, (n) => {
    let s = e(n);
    return x.range(n.anchor, s.head, s.goalColumn, s.bidiLevel || void 0);
  });
  return t.eq(i.state.selection) ? !1 : (i.dispatch(Ft(i.state, t)), !0);
}
function Rg(i, e) {
  return _t(i, (t) => i.moveByChar(t, e));
}
const Ng = (i) => Rg(i, !We(i)), Mg = (i) => Rg(i, We(i));
function Lg(i, e) {
  return _t(i, (t) => i.moveByGroup(t, e));
}
const OA = (i) => Lg(i, !We(i)), IA = (i) => Lg(i, We(i)), RA = (i) => _t(i, (e) => ba(i.state, e, !We(i))), NA = (i) => _t(i, (e) => ba(i.state, e, We(i)));
function Pg(i, e) {
  return _t(i, (t) => i.moveVertically(t, e));
}
const Dg = (i) => Pg(i, !1), $g = (i) => Pg(i, !0);
function Bg(i, e) {
  return _t(i, (t) => i.moveVertically(t, e, Og(i).height));
}
const Df = (i) => Bg(i, !1), $f = (i) => Bg(i, !0), MA = (i) => _t(i, (e) => Zi(i, e, !0)), LA = (i) => _t(i, (e) => Zi(i, e, !1)), PA = (i) => _t(i, (e) => Zi(i, e, !We(i))), DA = (i) => _t(i, (e) => Zi(i, e, We(i))), $A = (i) => _t(i, (e) => x.cursor(i.lineBlockAt(e.head).from)), BA = (i) => _t(i, (e) => x.cursor(i.lineBlockAt(e.head).to)), Bf = ({ state: i, dispatch: e }) => (e(Ft(i, { anchor: 0 })), !0), Uf = ({ state: i, dispatch: e }) => (e(Ft(i, { anchor: i.doc.length })), !0), Ff = ({ state: i, dispatch: e }) => (e(Ft(i, { anchor: i.selection.main.anchor, head: 0 })), !0), Wf = ({ state: i, dispatch: e }) => (e(Ft(i, { anchor: i.selection.main.anchor, head: i.doc.length })), !0), UA = ({ state: i, dispatch: e }) => (e(i.update({ selection: { anchor: 0, head: i.doc.length }, userEvent: "select" })), !0), FA = ({ state: i, dispatch: e }) => {
  let t = va(i).map(({ from: n, to: s }) => x.range(n, Math.min(s + 1, i.doc.length)));
  return e(i.update({ selection: x.create(t), userEvent: "select" })), !0;
}, WA = ({ state: i, dispatch: e }) => {
  let t = us(i.selection, (n) => {
    let s = Ue(i), r = s.resolveStack(n.from, 1);
    if (n.empty) {
      let o = s.resolveStack(n.from, -1);
      o.node.from >= r.node.from && o.node.to <= r.node.to && (r = o);
    }
    for (let o = r; o; o = o.next) {
      let { node: a } = o;
      if ((a.from < n.from && a.to >= n.to || a.to > n.to && a.from <= n.from) && o.next)
        return x.range(a.to, a.from);
    }
    return n;
  });
  return t.eq(i.selection) ? !1 : (e(Ft(i, t)), !0);
};
function Ug(i, e) {
  let { state: t } = i, n = t.selection, s = t.selection.ranges.slice();
  for (let r of t.selection.ranges) {
    let o = t.doc.lineAt(r.head);
    if (e ? o.to < i.state.doc.length : o.from > 0)
      for (let a = r; ; ) {
        let l = i.moveVertically(a, e);
        if (l.head < o.from || l.head > o.to) {
          s.some((h) => h.head == l.head) || s.push(l);
          break;
        } else {
          if (l.head == a.head)
            break;
          a = l;
        }
      }
  }
  return s.length == n.ranges.length ? !1 : (i.dispatch(Ft(t, x.create(s, s.length - 1))), !0);
}
const HA = (i) => Ug(i, !1), VA = (i) => Ug(i, !0), jA = ({ state: i, dispatch: e }) => {
  let t = i.selection, n = null;
  return t.ranges.length > 1 ? n = x.create([t.main]) : t.main.empty || (n = x.create([x.cursor(t.main.head)])), n ? (e(Ft(i, n)), !0) : !1;
};
function br(i, e) {
  if (i.state.readOnly)
    return !1;
  let t = "delete.selection", { state: n } = i, s = n.changeByRange((r) => {
    let { from: o, to: a } = r;
    if (o == a) {
      let l = e(r);
      l < o ? (t = "delete.backward", l = Kr(i, l, !1)) : l > o && (t = "delete.forward", l = Kr(i, l, !0)), o = Math.min(o, l), a = Math.max(a, l);
    } else
      o = Kr(i, o, !1), a = Kr(i, a, !0);
    return o == a ? { range: r } : { changes: { from: o, to: a }, range: x.cursor(o, o < r.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (i.dispatch(n.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? O.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function Kr(i, e, t) {
  if (i instanceof O)
    for (let n of i.state.facet(O.atomicRanges).map((s) => s(i)))
      n.between(e, e, (s, r) => {
        s < e && r > e && (e = t ? r : s);
      });
  return e;
}
const Fg = (i, e, t) => br(i, (n) => {
  let s = n.from, { state: r } = i, o = r.doc.lineAt(s), a, l;
  if (t && !e && s > o.from && s < o.from + 200 && !/[^ \t]/.test(a = o.text.slice(0, s - o.from))) {
    if (a[a.length - 1] == "	")
      return s - 1;
    let h = ur(a, r.tabSize), c = h % vn(r) || vn(r);
    for (let u = 0; u < c && a[a.length - 1 - u] == " "; u++)
      s--;
    l = s;
  } else
    l = Ae(o.text, s - o.from, e, e) + o.from, l == s && o.number != (e ? r.doc.lines : 1) ? l += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(o.text.slice(l - o.from, s - o.from)) && (l = Ae(o.text, l - o.from, !1, !1) + o.from);
  return l;
}), yh = (i) => Fg(i, !1, !0), Wg = (i) => Fg(i, !0, !1), Hg = (i, e) => br(i, (t) => {
  let n = t.head, { state: s } = i, r = s.doc.lineAt(n), o = s.charCategorizer(n);
  for (let a = null; ; ) {
    if (n == (e ? r.to : r.from)) {
      n == t.head && r.number != (e ? s.doc.lines : 1) && (n += e ? 1 : -1);
      break;
    }
    let l = Ae(r.text, n - r.from, e) + r.from, h = r.text.slice(Math.min(n, l) - r.from, Math.max(n, l) - r.from), c = o(h);
    if (a != null && c != a)
      break;
    (h != " " || n != t.head) && (a = c), n = l;
  }
  return n;
}), Vg = (i) => Hg(i, !1), zA = (i) => Hg(i, !0), GA = (i) => br(i, (e) => {
  let t = i.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), KA = (i) => br(i, (e) => {
  let t = i.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), qA = (i) => br(i, (e) => {
  let t = i.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(i.state.doc.length, e.head + 1);
}), YA = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => ({
    changes: { from: n.from, to: n.to, insert: J.of(["", ""]) },
    range: x.cursor(n.from)
  }));
  return e(i.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, XA = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = i.changeByRange((n) => {
    if (!n.empty || n.from == 0 || n.from == i.doc.length)
      return { range: n };
    let s = n.from, r = i.doc.lineAt(s), o = s == r.from ? s - 1 : Ae(r.text, s - r.from, !1) + r.from, a = s == r.to ? s + 1 : Ae(r.text, s - r.from, !0) + r.from;
    return {
      changes: { from: o, to: a, insert: i.doc.slice(s, a).append(i.doc.slice(o, s)) },
      range: x.cursor(a)
    };
  });
  return t.changes.empty ? !1 : (e(i.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function va(i) {
  let e = [], t = -1;
  for (let n of i.selection.ranges) {
    let s = i.doc.lineAt(n.from), r = i.doc.lineAt(n.to);
    if (!n.empty && n.to == r.from && (r = i.doc.lineAt(n.to - 1)), t >= s.number) {
      let o = e[e.length - 1];
      o.to = r.to, o.ranges.push(n);
    } else
      e.push({ from: s.from, to: r.to, ranges: [n] });
    t = r.number + 1;
  }
  return e;
}
function jg(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [], s = [];
  for (let r of va(i)) {
    if (t ? r.to == i.doc.length : r.from == 0)
      continue;
    let o = i.doc.lineAt(t ? r.to + 1 : r.from - 1), a = o.length + 1;
    if (t) {
      n.push({ from: r.to, to: o.to }, { from: r.from, insert: o.text + i.lineBreak });
      for (let l of r.ranges)
        s.push(x.range(Math.min(i.doc.length, l.anchor + a), Math.min(i.doc.length, l.head + a)));
    } else {
      n.push({ from: o.from, to: r.from }, { from: r.to, insert: i.lineBreak + o.text });
      for (let l of r.ranges)
        s.push(x.range(l.anchor - a, l.head - a));
    }
  }
  return n.length ? (e(i.update({
    changes: n,
    scrollIntoView: !0,
    selection: x.create(s, i.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const JA = ({ state: i, dispatch: e }) => jg(i, e, !1), QA = ({ state: i, dispatch: e }) => jg(i, e, !0);
function zg(i, e, t) {
  if (i.readOnly)
    return !1;
  let n = [];
  for (let r of va(i))
    t ? n.push({ from: r.from, insert: i.doc.slice(r.from, r.to) + i.lineBreak }) : n.push({ from: r.to, insert: i.lineBreak + i.doc.slice(r.from, r.to) });
  let s = i.changes(n);
  return e(i.update({
    changes: s,
    selection: i.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const ZA = ({ state: i, dispatch: e }) => zg(i, e, !1), ew = ({ state: i, dispatch: e }) => zg(i, e, !0), tw = (i) => {
  if (i.state.readOnly)
    return !1;
  let { state: e } = i, t = e.changes(va(e).map(({ from: s, to: r }) => (s > 0 ? s-- : r < e.doc.length && r++, { from: s, to: r }))), n = us(e.selection, (s) => {
    let r;
    if (i.lineWrapping) {
      let o = i.lineBlockAt(s.head), a = i.coordsAtPos(s.head, s.assoc || 1);
      a && (r = o.bottom + i.documentTop - a.bottom + i.defaultLineHeight / 2);
    }
    return i.moveVertically(s, !0, r);
  }).map(t);
  return i.dispatch({ changes: t, selection: n, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function iw(i, e) {
  if (/\(\)|\[\]|\{\}/.test(i.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Ue(i).resolveInner(e), n = t.childBefore(e), s = t.childAfter(e), r;
  return n && s && n.to <= e && s.from >= e && (r = n.type.prop(K.closedBy)) && r.indexOf(s.name) > -1 && i.doc.lineAt(n.to).from == i.doc.lineAt(s.from).from && !/\S/.test(i.sliceDoc(n.to, s.from)) ? { from: n.to, to: s.from } : null;
}
const Hf = /* @__PURE__ */ Gg(!1), nw = /* @__PURE__ */ Gg(!0);
function Gg(i) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let n = e.changeByRange((s) => {
      let { from: r, to: o } = s, a = e.doc.lineAt(r), l = !i && r == o && iw(e, r);
      i && (r = o = (o <= a.to ? a : e.doc.lineAt(o)).to);
      let h = new ua(e, { simulateBreak: r, simulateDoubleBreak: !!l }), c = uc(h, r);
      for (c == null && (c = ur(/^\s*/.exec(e.doc.lineAt(r).text)[0], e.tabSize)); o < a.to && /\s/.test(a.text[o - a.from]); )
        o++;
      l ? { from: r, to: o } = l : r > a.from && r < a.from + 100 && !/\S/.test(a.text.slice(0, r)) && (r = a.from);
      let u = ["", Js(e, c)];
      return l && u.push(Js(e, h.lineIndent(a.from, -1))), {
        changes: { from: r, to: o, insert: J.of(u) },
        range: x.cursor(r + 1 + u[1].length)
      };
    });
    return t(e.update(n, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function wc(i, e) {
  let t = -1;
  return i.changeByRange((n) => {
    let s = [];
    for (let o = n.from; o <= n.to; ) {
      let a = i.doc.lineAt(o);
      a.number > t && (n.empty || n.to > a.from) && (e(a, s, n), t = a.number), o = a.to + 1;
    }
    let r = i.changes(s);
    return {
      changes: s,
      range: x.range(r.mapPos(n.anchor, 1), r.mapPos(n.head, 1))
    };
  });
}
const sw = ({ state: i, dispatch: e }) => {
  if (i.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), n = new ua(i, { overrideIndentation: (r) => {
    let o = t[r];
    return o ?? -1;
  } }), s = wc(i, (r, o, a) => {
    let l = uc(n, r.from);
    if (l == null)
      return;
    /\S/.test(r.text) || (l = 0);
    let h = /^\s*/.exec(r.text)[0], c = Js(i, l);
    (h != c || a.from < r.from + h.length) && (t[r.from] = l, o.push({ from: r.from, to: r.from + h.length, insert: c }));
  });
  return s.changes.empty || e(i.update(s, { userEvent: "indent" })), !0;
}, Kg = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(wc(i, (t, n) => {
  n.push({ from: t.from, insert: i.facet(cc) });
}), { userEvent: "input.indent" })), !0), qg = ({ state: i, dispatch: e }) => i.readOnly ? !1 : (e(i.update(wc(i, (t, n) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let r = ur(s, i.tabSize), o = 0, a = Js(i, Math.max(0, r - vn(i)));
  for (; o < s.length && o < a.length && s.charCodeAt(o) == a.charCodeAt(o); )
    o++;
  n.push({ from: t.from + o, to: t.from + s.length, insert: a.slice(o) });
}), { userEvent: "delete.dedent" })), !0), rw = (i) => (i.setTabFocusMode(), !0), ow = [
  { key: "Ctrl-b", run: Eg, shift: Ng, preventDefault: !0 },
  { key: "Ctrl-f", run: Ag, shift: Mg },
  { key: "Ctrl-p", run: kg, shift: Dg },
  { key: "Ctrl-n", run: _g, shift: $g },
  { key: "Ctrl-a", run: wA, shift: $A },
  { key: "Ctrl-e", run: CA, shift: BA },
  { key: "Ctrl-d", run: Wg },
  { key: "Ctrl-h", run: yh },
  { key: "Ctrl-k", run: GA },
  { key: "Ctrl-Alt-h", run: Vg },
  { key: "Ctrl-o", run: YA },
  { key: "Ctrl-t", run: XA },
  { key: "Ctrl-v", run: gh }
], aw = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Eg, shift: Ng, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: gA, shift: OA, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: EA, shift: PA, preventDefault: !0 },
  { key: "ArrowRight", run: Ag, shift: Mg, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: yA, shift: IA, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: AA, shift: DA, preventDefault: !0 },
  { key: "ArrowUp", run: kg, shift: Dg, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Bf, shift: Ff },
  { mac: "Ctrl-ArrowUp", run: Pf, shift: Df },
  { key: "ArrowDown", run: _g, shift: $g, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Uf, shift: Wf },
  { mac: "Ctrl-ArrowDown", run: gh, shift: $f },
  { key: "PageUp", run: Pf, shift: Df },
  { key: "PageDown", run: gh, shift: $f },
  { key: "Home", run: xA, shift: LA, preventDefault: !0 },
  { key: "Mod-Home", run: Bf, shift: Ff },
  { key: "End", run: TA, shift: MA, preventDefault: !0 },
  { key: "Mod-End", run: Uf, shift: Wf },
  { key: "Enter", run: Hf, shift: Hf },
  { key: "Mod-a", run: UA },
  { key: "Backspace", run: yh, shift: yh, preventDefault: !0 },
  { key: "Delete", run: Wg, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: Vg, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: zA, preventDefault: !0 },
  { mac: "Mod-Backspace", run: KA, preventDefault: !0 },
  { mac: "Mod-Delete", run: qA, preventDefault: !0 }
].concat(/* @__PURE__ */ ow.map((i) => ({ mac: i.key, run: i.run, shift: i.shift }))), lw = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: vA, shift: RA },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: SA, shift: NA },
  { key: "Alt-ArrowUp", run: JA },
  { key: "Shift-Alt-ArrowUp", run: ZA },
  { key: "Alt-ArrowDown", run: QA },
  { key: "Shift-Alt-ArrowDown", run: ew },
  { key: "Mod-Alt-ArrowUp", run: HA },
  { key: "Mod-Alt-ArrowDown", run: VA },
  { key: "Escape", run: jA },
  { key: "Mod-Enter", run: nw },
  { key: "Alt-l", mac: "Ctrl-l", run: FA },
  { key: "Mod-i", run: WA, preventDefault: !0 },
  { key: "Mod-[", run: qg },
  { key: "Mod-]", run: Kg },
  { key: "Mod-Alt-\\", run: sw },
  { key: "Shift-Mod-k", run: tw },
  { key: "Shift-Mod-\\", run: _A },
  { key: "Mod-/", run: JE },
  { key: "Alt-A", run: ZE },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: rw }
].concat(aw), hw = { key: "Tab", run: Kg, shift: qg }, Vf = typeof String.prototype.normalize == "function" ? (i) => i.normalize("NFKD") : (i) => i;
class ss {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(e, t, n = 0, s = e.length, r, o) {
    this.test = o, this.value = { from: 0, to: 0 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = e.iterRange(n, s), this.bufferStart = n, this.normalize = r ? (a) => r(Vf(a)) : Vf, this.query = this.normalize(t);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return Xe(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    for (; this.matches.length; )
      this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let e = this.peek();
      if (e < 0)
        return this.done = !0, this;
      let t = Kh(e), n = this.bufferStart + this.bufferPos;
      this.bufferPos += Qt(e);
      let s = this.normalize(t);
      if (s.length)
        for (let r = 0, o = n; ; r++) {
          let a = s.charCodeAt(r), l = this.match(a, o, this.bufferPos + this.bufferStart);
          if (r == s.length - 1) {
            if (l)
              return this.value = l, this;
            break;
          }
          o == n && r < t.length && t.charCodeAt(r) == a && o++;
        }
    }
  }
  match(e, t, n) {
    let s = null;
    for (let r = 0; r < this.matches.length; r += 2) {
      let o = this.matches[r], a = !1;
      this.query.charCodeAt(o) == e && (o == this.query.length - 1 ? s = { from: this.matches[r + 1], to: n } : (this.matches[r]++, a = !0)), a || (this.matches.splice(r, 2), r -= 2);
    }
    return this.query.charCodeAt(0) == e && (this.query.length == 1 ? s = { from: t, to: n } : this.matches.push(1, t)), s && this.test && !this.test(s.from, s.to, this.buffer, this.bufferStart) && (s = null), s;
  }
}
typeof Symbol < "u" && (ss.prototype[Symbol.iterator] = function() {
  return this;
});
const Yg = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") }, Cc = "gm" + (/x/.unicode == null ? "" : "u");
class Xg {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(e, t, n, s = 0, r = e.length) {
    if (this.text = e, this.to = r, this.curLine = "", this.done = !1, this.value = Yg, /\\[sWDnr]|\n|\r|\[\^/.test(t))
      return new Jg(e, t, n, s, r);
    this.re = new RegExp(t, Cc + (n != null && n.ignoreCase ? "i" : "")), this.test = n == null ? void 0 : n.test, this.iter = e.iter();
    let o = e.lineAt(s);
    this.curLineStart = o.from, this.matchPos = Ho(e, s), this.getLine(this.curLineStart);
  }
  getLine(e) {
    this.iter.next(e), this.iter.lineBreak ? this.curLine = "" : (this.curLine = this.iter.value, this.curLineStart + this.curLine.length > this.to && (this.curLine = this.curLine.slice(0, this.to - this.curLineStart)), this.iter.next());
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1, this.curLineStart > this.to ? this.curLine = "" : this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let e = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = e;
      let t = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (t) {
        let n = this.curLineStart + t.index, s = n + t[0].length;
        if (this.matchPos = Ho(this.text, s + (n == s ? 1 : 0)), n == this.curLineStart + this.curLine.length && this.nextLine(), (n < s || n > this.value.to) && (!this.test || this.test(n, s, t)))
          return this.value = { from: n, to: s, match: t }, this;
        e = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), e = 0;
      else
        return this.done = !0, this;
    }
  }
}
const bl = /* @__PURE__ */ new WeakMap();
class qn {
  constructor(e, t) {
    this.from = e, this.text = t;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(e, t, n) {
    let s = bl.get(e);
    if (!s || s.from >= n || s.to <= t) {
      let a = new qn(t, e.sliceString(t, n));
      return bl.set(e, a), a;
    }
    if (s.from == t && s.to == n)
      return s;
    let { text: r, from: o } = s;
    return o > t && (r = e.sliceString(t, o) + r, o = t), s.to < n && (r += e.sliceString(s.to, n)), bl.set(e, new qn(o, r)), new qn(t, r.slice(t - o, n - o));
  }
}
class Jg {
  constructor(e, t, n, s, r) {
    this.text = e, this.to = r, this.done = !1, this.value = Yg, this.matchPos = Ho(e, s), this.re = new RegExp(t, Cc + (n != null && n.ignoreCase ? "i" : "")), this.test = n == null ? void 0 : n.test, this.flat = qn.get(e, s, this.chunkEnd(
      s + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(e) {
    return e >= this.to ? this.to : this.text.lineAt(e).to;
  }
  next() {
    for (; ; ) {
      let e = this.re.lastIndex = this.matchPos - this.flat.from, t = this.re.exec(this.flat.text);
      if (t && !t[0] && t.index == e && (this.re.lastIndex = e + 1, t = this.re.exec(this.flat.text)), t) {
        let n = this.flat.from + t.index, s = n + t[0].length;
        if ((this.flat.to >= this.to || t.index + t[0].length <= this.flat.text.length - 10) && (!this.test || this.test(n, s, t)))
          return this.value = { from: n, to: s, match: t }, this.matchPos = Ho(this.text, s + (n == s ? 1 : 0)), this;
      }
      if (this.flat.to == this.to)
        return this.done = !0, this;
      this.flat = qn.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
}
typeof Symbol < "u" && (Xg.prototype[Symbol.iterator] = Jg.prototype[Symbol.iterator] = function() {
  return this;
});
function cw(i) {
  try {
    return new RegExp(i, Cc), !0;
  } catch {
    return !1;
  }
}
function Ho(i, e) {
  if (e >= i.length)
    return e;
  let t = i.lineAt(e), n;
  for (; e < t.to && (n = t.text.charCodeAt(e - t.from)) >= 56320 && n < 57344; )
    e++;
  return e;
}
const uw = (i) => {
  let { state: e } = i, t = String(e.doc.lineAt(i.state.selection.main.head).number), { close: n, result: s } = bT(i, {
    label: e.phrase("Go to line"),
    input: { type: "text", name: "line", value: t },
    focus: !0,
    submitLabel: e.phrase("go")
  });
  return s.then((r) => {
    let o = r && /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(r.elements.line.value);
    if (!o) {
      i.dispatch({ effects: n });
      return;
    }
    let a = e.doc.lineAt(e.selection.main.head), [, l, h, c, u] = o, f = c ? +c.slice(1) : 0, d = h ? +h : a.number;
    if (h && u) {
      let g = d / 100;
      l && (g = g * (l == "-" ? -1 : 1) + a.number / e.doc.lines), d = Math.round(e.doc.lines * g);
    } else h && l && (d = d * (l == "-" ? -1 : 1) + a.number);
    let p = e.doc.line(Math.max(1, Math.min(e.doc.lines, d))), m = x.cursor(p.from + Math.max(0, Math.min(f, p.length)));
    i.dispatch({
      effects: [n, O.scrollIntoView(m.from, { y: "center" })],
      selection: m
    });
  }), !0;
}, fw = {
  highlightWordAroundCursor: !1,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: !1
}, dw = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, fw, {
      highlightWordAroundCursor: (e, t) => e || t,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function pw(i) {
  return [vw, bw];
}
const mw = /* @__PURE__ */ B.mark({ class: "cm-selectionMatch" }), gw = /* @__PURE__ */ B.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
function jf(i, e, t, n) {
  return (t == 0 || i(e.sliceDoc(t - 1, t)) != ae.Word) && (n == e.doc.length || i(e.sliceDoc(n, n + 1)) != ae.Word);
}
function yw(i, e, t, n) {
  return i(e.sliceDoc(t, t + 1)) == ae.Word && i(e.sliceDoc(n - 1, n)) == ae.Word;
}
const bw = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.decorations = this.getDeco(i);
  }
  update(i) {
    (i.selectionSet || i.docChanged || i.viewportChanged) && (this.decorations = this.getDeco(i.view));
  }
  getDeco(i) {
    let e = i.state.facet(dw), { state: t } = i, n = t.selection;
    if (n.ranges.length > 1)
      return B.none;
    let s = n.main, r, o = null;
    if (s.empty) {
      if (!e.highlightWordAroundCursor)
        return B.none;
      let l = t.wordAt(s.head);
      if (!l)
        return B.none;
      o = t.charCategorizer(s.head), r = t.sliceDoc(l.from, l.to);
    } else {
      let l = s.to - s.from;
      if (l < e.minSelectionLength || l > 200)
        return B.none;
      if (e.wholeWords) {
        if (r = t.sliceDoc(s.from, s.to), o = t.charCategorizer(s.head), !(jf(o, t, s.from, s.to) && yw(o, t, s.from, s.to)))
          return B.none;
      } else if (r = t.sliceDoc(s.from, s.to), !r)
        return B.none;
    }
    let a = [];
    for (let l of i.visibleRanges) {
      let h = new ss(t.doc, r, l.from, l.to);
      for (; !h.next().done; ) {
        let { from: c, to: u } = h.value;
        if ((!o || jf(o, t, c, u)) && (s.empty && c <= s.from && u >= s.to ? a.push(gw.range(c, u)) : (c >= s.to || u <= s.from) && a.push(mw.range(c, u)), a.length > e.maxMatches))
          return B.none;
      }
    }
    return B.set(a);
  }
}, {
  decorations: (i) => i.decorations
}), vw = /* @__PURE__ */ O.baseTheme({
  ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
  ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
}), Sw = ({ state: i, dispatch: e }) => {
  let { selection: t } = i, n = x.create(t.ranges.map((s) => i.wordAt(s.head) || x.cursor(s.head)), t.mainIndex);
  return n.eq(t) ? !1 : (e(i.update({ selection: n })), !0);
};
function Tw(i, e) {
  let { main: t, ranges: n } = i.selection, s = i.wordAt(t.head), r = s && s.from == t.from && s.to == t.to;
  for (let o = !1, a = new ss(i.doc, e, n[n.length - 1].to); ; )
    if (a.next(), a.done) {
      if (o)
        return null;
      a = new ss(i.doc, e, 0, Math.max(0, n[n.length - 1].from - 1)), o = !0;
    } else {
      if (o && n.some((l) => l.from == a.value.from))
        continue;
      if (r) {
        let l = i.wordAt(a.value.from);
        if (!l || l.from != a.value.from || l.to != a.value.to)
          continue;
      }
      return a.value;
    }
}
const xw = ({ state: i, dispatch: e }) => {
  let { ranges: t } = i.selection;
  if (t.some((r) => r.from === r.to))
    return Sw({ state: i, dispatch: e });
  let n = i.sliceDoc(t[0].from, t[0].to);
  if (i.selection.ranges.some((r) => i.sliceDoc(r.from, r.to) != n))
    return !1;
  let s = Tw(i, n);
  return s ? (e(i.update({
    selection: i.selection.addRange(x.range(s.from, s.to), !1),
    effects: O.scrollIntoView(s.to)
  })), !0) : !1;
}, fs = /* @__PURE__ */ _.define({
  combine(i) {
    return Ci(i, {
      top: !1,
      caseSensitive: !1,
      literal: !1,
      regexp: !1,
      wholeWord: !1,
      createPanel: (e) => new Dw(e),
      scrollToMatch: (e) => O.scrollIntoView(e)
    });
  }
});
class Qg {
  /**
  Create a query object.
  */
  constructor(e) {
    this.search = e.search, this.caseSensitive = !!e.caseSensitive, this.literal = !!e.literal, this.regexp = !!e.regexp, this.replace = e.replace || "", this.valid = !!this.search && (!this.regexp || cw(this.search)), this.unquoted = this.unquote(this.search), this.wholeWord = !!e.wholeWord, this.test = e.test;
  }
  /**
  @internal
  */
  unquote(e) {
    return this.literal ? e : e.replace(/\\([nrt\\])/g, (t, n) => n == "n" ? `
` : n == "r" ? "\r" : n == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(e) {
    return this.search == e.search && this.replace == e.replace && this.caseSensitive == e.caseSensitive && this.regexp == e.regexp && this.wholeWord == e.wholeWord && this.test == e.test;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new _w(this) : new ww(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(e, t = 0, n) {
    let s = e.doc ? e : G.create({ doc: e });
    return n == null && (n = s.doc.length), this.regexp ? $n(this, s, t, n) : Dn(this, s, t, n);
  }
}
class Zg {
  constructor(e) {
    this.spec = e;
  }
}
function Ew(i, e, t) {
  return (n, s, r, o) => {
    if (t && !t(n, s, r, o))
      return !1;
    let a = n >= o && s <= o + r.length ? r.slice(n - o, s - o) : e.doc.sliceString(n, s);
    return i(a, e, n, s);
  };
}
function Dn(i, e, t, n) {
  let s;
  return i.wholeWord && (s = Aw(e.doc, e.charCategorizer(e.selection.main.head))), i.test && (s = Ew(i.test, e, s)), new ss(e.doc, i.unquoted, t, n, i.caseSensitive ? void 0 : (r) => r.toLowerCase(), s);
}
function Aw(i, e) {
  return (t, n, s, r) => ((r > t || r + s.length < n) && (r = Math.max(0, t - 2), s = i.sliceString(r, Math.min(i.length, n + 2))), (e(Vo(s, t - r)) != ae.Word || e(jo(s, t - r)) != ae.Word) && (e(jo(s, n - r)) != ae.Word || e(Vo(s, n - r)) != ae.Word));
}
class ww extends Zg {
  constructor(e) {
    super(e);
  }
  nextMatch(e, t, n) {
    let s = Dn(this.spec, e, n, e.doc.length).nextOverlapping();
    if (s.done) {
      let r = Math.min(e.doc.length, t + this.spec.unquoted.length);
      s = Dn(this.spec, e, 0, r).nextOverlapping();
    }
    return s.done || s.value.from == t && s.value.to == n ? null : s.value;
  }
  // Searching in reverse is, rather than implementing an inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(e, t, n) {
    for (let s = n; ; ) {
      let r = Math.max(t, s - 1e4 - this.spec.unquoted.length), o = Dn(this.spec, e, r, s), a = null;
      for (; !o.nextOverlapping().done; )
        a = o.value;
      if (a)
        return a;
      if (r == t)
        return null;
      s -= 1e4;
    }
  }
  prevMatch(e, t, n) {
    let s = this.prevMatchInRange(e, 0, t);
    return s || (s = this.prevMatchInRange(e, Math.max(0, n - this.spec.unquoted.length), e.doc.length)), s && (s.from != t || s.to != n) ? s : null;
  }
  getReplacement(e) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(e, t) {
    let n = Dn(this.spec, e, 0, e.doc.length), s = [];
    for (; !n.next().done; ) {
      if (s.length >= t)
        return null;
      s.push(n.value);
    }
    return s;
  }
  highlight(e, t, n, s) {
    let r = Dn(this.spec, e, Math.max(0, t - this.spec.unquoted.length), Math.min(n + this.spec.unquoted.length, e.doc.length));
    for (; !r.next().done; )
      s(r.value.from, r.value.to);
  }
}
function Cw(i, e, t) {
  return (n, s, r) => (!t || t(n, s, r)) && i(r[0], e, n, s);
}
function $n(i, e, t, n) {
  let s;
  return i.wholeWord && (s = kw(e.charCategorizer(e.selection.main.head))), i.test && (s = Cw(i.test, e, s)), new Xg(e.doc, i.search, { ignoreCase: !i.caseSensitive, test: s }, t, n);
}
function Vo(i, e) {
  return i.slice(Ae(i, e, !1), e);
}
function jo(i, e) {
  return i.slice(e, Ae(i, e));
}
function kw(i) {
  return (e, t, n) => !n[0].length || (i(Vo(n.input, n.index)) != ae.Word || i(jo(n.input, n.index)) != ae.Word) && (i(jo(n.input, n.index + n[0].length)) != ae.Word || i(Vo(n.input, n.index + n[0].length)) != ae.Word);
}
class _w extends Zg {
  nextMatch(e, t, n) {
    let s = $n(this.spec, e, n, e.doc.length).next();
    return s.done && (s = $n(this.spec, e, 0, t).next()), s.done ? null : s.value;
  }
  prevMatchInRange(e, t, n) {
    for (let s = 1; ; s++) {
      let r = Math.max(
        t,
        n - s * 1e4
        /* FindPrev.ChunkSize */
      ), o = $n(this.spec, e, r, n), a = null;
      for (; !o.next().done; )
        a = o.value;
      if (a && (r == t || a.from > r + 10))
        return a;
      if (r == t)
        return null;
    }
  }
  prevMatch(e, t, n) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, n, e.doc.length);
  }
  getReplacement(e) {
    return this.spec.unquote(this.spec.replace).replace(/\$([$&]|\d+)/g, (t, n) => {
      if (n == "&")
        return e.match[0];
      if (n == "$")
        return "$";
      for (let s = n.length; s > 0; s--) {
        let r = +n.slice(0, s);
        if (r > 0 && r < e.match.length)
          return e.match[r] + n.slice(s);
      }
      return t;
    });
  }
  matchAll(e, t) {
    let n = $n(this.spec, e, 0, e.doc.length), s = [];
    for (; !n.next().done; ) {
      if (s.length >= t)
        return null;
      s.push(n.value);
    }
    return s;
  }
  highlight(e, t, n, s) {
    let r = $n(this.spec, e, Math.max(
      0,
      t - 250
      /* RegExp.HighlightMargin */
    ), Math.min(n + 250, e.doc.length));
    for (; !r.next().done; )
      s(r.value.from, r.value.to);
  }
}
const sr = /* @__PURE__ */ V.define(), kc = /* @__PURE__ */ V.define(), Fi = /* @__PURE__ */ Ke.define({
  create(i) {
    return new vl(bh(i).create(), null);
  },
  update(i, e) {
    for (let t of e.effects)
      t.is(sr) ? i = new vl(t.value.create(), i.panel) : t.is(kc) && (i = new vl(i.query, t.value ? _c : null));
    return i;
  },
  provide: (i) => Mo.from(i, (e) => e.panel)
});
class vl {
  constructor(e, t) {
    this.query = e, this.panel = t;
  }
}
const Ow = /* @__PURE__ */ B.mark({ class: "cm-searchMatch" }), Iw = /* @__PURE__ */ B.mark({ class: "cm-searchMatch cm-searchMatch-selected" }), Rw = /* @__PURE__ */ Pe.fromClass(class {
  constructor(i) {
    this.view = i, this.decorations = this.highlight(i.state.field(Fi));
  }
  update(i) {
    let e = i.state.field(Fi);
    (e != i.startState.field(Fi) || i.docChanged || i.selectionSet || i.viewportChanged) && (this.decorations = this.highlight(e));
  }
  highlight({ query: i, panel: e }) {
    if (!e || !i.spec.valid)
      return B.none;
    let { view: t } = this, n = new ji();
    for (let s = 0, r = t.visibleRanges, o = r.length; s < o; s++) {
      let { from: a, to: l } = r[s];
      for (; s < o - 1 && l > r[s + 1].from - 2 * 250; )
        l = r[++s].to;
      i.highlight(t.state, a, l, (h, c) => {
        let u = t.state.selection.ranges.some((f) => f.from == h && f.to == c);
        n.add(h, c, u ? Iw : Ow);
      });
    }
    return n.finish();
  }
}, {
  decorations: (i) => i.decorations
});
function vr(i) {
  return (e) => {
    let t = e.state.field(Fi, !1);
    return t && t.query.spec.valid ? i(e, t) : iy(e);
  };
}
const zo = /* @__PURE__ */ vr((i, { query: e }) => {
  let { to: t } = i.state.selection.main, n = e.nextMatch(i.state, t, t);
  if (!n)
    return !1;
  let s = x.single(n.from, n.to), r = i.state.facet(fs);
  return i.dispatch({
    selection: s,
    effects: [Oc(i, n), r.scrollToMatch(s.main, i)],
    userEvent: "select.search"
  }), ty(i), !0;
}), Go = /* @__PURE__ */ vr((i, { query: e }) => {
  let { state: t } = i, { from: n } = t.selection.main, s = e.prevMatch(t, n, n);
  if (!s)
    return !1;
  let r = x.single(s.from, s.to), o = i.state.facet(fs);
  return i.dispatch({
    selection: r,
    effects: [Oc(i, s), o.scrollToMatch(r.main, i)],
    userEvent: "select.search"
  }), ty(i), !0;
}), Nw = /* @__PURE__ */ vr((i, { query: e }) => {
  let t = e.matchAll(i.state, 1e3);
  return !t || !t.length ? !1 : (i.dispatch({
    selection: x.create(t.map((n) => x.range(n.from, n.to))),
    userEvent: "select.search.matches"
  }), !0);
}), Mw = ({ state: i, dispatch: e }) => {
  let t = i.selection;
  if (t.ranges.length > 1 || t.main.empty)
    return !1;
  let { from: n, to: s } = t.main, r = [], o = 0;
  for (let a = new ss(i.doc, i.sliceDoc(n, s)); !a.next().done; ) {
    if (r.length > 1e3)
      return !1;
    a.value.from == n && (o = r.length), r.push(x.range(a.value.from, a.value.to));
  }
  return e(i.update({
    selection: x.create(r, o),
    userEvent: "select.search.matches"
  })), !0;
}, zf = /* @__PURE__ */ vr((i, { query: e }) => {
  let { state: t } = i, { from: n, to: s } = t.selection.main;
  if (t.readOnly)
    return !1;
  let r = e.nextMatch(t, n, n);
  if (!r)
    return !1;
  let o = r, a = [], l, h, c = [];
  o.from == n && o.to == s && (h = t.toText(e.getReplacement(o)), a.push({ from: o.from, to: o.to, insert: h }), o = e.nextMatch(t, o.from, o.to), c.push(O.announce.of(t.phrase("replaced match on line $", t.doc.lineAt(n).number) + ".")));
  let u = i.state.changes(a);
  return o && (l = x.single(o.from, o.to).map(u), c.push(Oc(i, o)), c.push(t.facet(fs).scrollToMatch(l.main, i))), i.dispatch({
    changes: u,
    selection: l,
    effects: c,
    userEvent: "input.replace"
  }), !0;
}), Lw = /* @__PURE__ */ vr((i, { query: e }) => {
  if (i.state.readOnly)
    return !1;
  let t = e.matchAll(i.state, 1e9).map((s) => {
    let { from: r, to: o } = s;
    return { from: r, to: o, insert: e.getReplacement(s) };
  });
  if (!t.length)
    return !1;
  let n = i.state.phrase("replaced $ matches", t.length) + ".";
  return i.dispatch({
    changes: t,
    effects: O.announce.of(n),
    userEvent: "input.replace.all"
  }), !0;
});
function _c(i) {
  return i.state.facet(fs).createPanel(i);
}
function bh(i, e) {
  var t, n, s, r, o;
  let a = i.selection.main, l = a.empty || a.to > a.from + 100 ? "" : i.sliceDoc(a.from, a.to);
  if (e && !l)
    return e;
  let h = i.facet(fs);
  return new Qg({
    search: ((t = e == null ? void 0 : e.literal) !== null && t !== void 0 ? t : h.literal) ? l : l.replace(/\n/g, "\\n"),
    caseSensitive: (n = e == null ? void 0 : e.caseSensitive) !== null && n !== void 0 ? n : h.caseSensitive,
    literal: (s = e == null ? void 0 : e.literal) !== null && s !== void 0 ? s : h.literal,
    regexp: (r = e == null ? void 0 : e.regexp) !== null && r !== void 0 ? r : h.regexp,
    wholeWord: (o = e == null ? void 0 : e.wholeWord) !== null && o !== void 0 ? o : h.wholeWord
  });
}
function ey(i) {
  let e = Em(i, _c);
  return e && e.dom.querySelector("[main-field]");
}
function ty(i) {
  let e = ey(i);
  e && e == i.root.activeElement && e.select();
}
const iy = (i) => {
  let e = i.state.field(Fi, !1);
  if (e && e.panel) {
    let t = ey(i);
    if (t && t != i.root.activeElement) {
      let n = bh(i.state, e.query.spec);
      n.valid && i.dispatch({ effects: sr.of(n) }), t.focus(), t.select();
    }
  } else
    i.dispatch({ effects: [
      kc.of(!0),
      e ? sr.of(bh(i.state, e.query.spec)) : V.appendConfig.of(Bw)
    ] });
  return !0;
}, ny = (i) => {
  let e = i.state.field(Fi, !1);
  if (!e || !e.panel)
    return !1;
  let t = Em(i, _c);
  return t && t.dom.contains(i.root.activeElement) && i.focus(), i.dispatch({ effects: kc.of(!1) }), !0;
}, Pw = [
  { key: "Mod-f", run: iy, scope: "editor search-panel" },
  { key: "F3", run: zo, shift: Go, scope: "editor search-panel", preventDefault: !0 },
  { key: "Mod-g", run: zo, shift: Go, scope: "editor search-panel", preventDefault: !0 },
  { key: "Escape", run: ny, scope: "editor search-panel" },
  { key: "Mod-Shift-l", run: Mw },
  { key: "Mod-Alt-g", run: uw },
  { key: "Mod-d", run: xw, preventDefault: !0 }
];
class Dw {
  constructor(e) {
    this.view = e;
    let t = this.query = e.state.field(Fi).query.spec;
    this.commit = this.commit.bind(this), this.searchField = ke("input", {
      value: t.search,
      placeholder: ht(e, "Find"),
      "aria-label": ht(e, "Find"),
      class: "cm-textfield",
      name: "search",
      form: "",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.replaceField = ke("input", {
      value: t.replace,
      placeholder: ht(e, "Replace"),
      "aria-label": ht(e, "Replace"),
      class: "cm-textfield",
      name: "replace",
      form: "",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.caseField = ke("input", {
      type: "checkbox",
      name: "case",
      form: "",
      checked: t.caseSensitive,
      onchange: this.commit
    }), this.reField = ke("input", {
      type: "checkbox",
      name: "re",
      form: "",
      checked: t.regexp,
      onchange: this.commit
    }), this.wordField = ke("input", {
      type: "checkbox",
      name: "word",
      form: "",
      checked: t.wholeWord,
      onchange: this.commit
    });
    function n(s, r, o) {
      return ke("button", { class: "cm-button", name: s, onclick: r, type: "button" }, o);
    }
    this.dom = ke("div", { onkeydown: (s) => this.keydown(s), class: "cm-search" }, [
      this.searchField,
      n("next", () => zo(e), [ht(e, "next")]),
      n("prev", () => Go(e), [ht(e, "previous")]),
      n("select", () => Nw(e), [ht(e, "all")]),
      ke("label", null, [this.caseField, ht(e, "match case")]),
      ke("label", null, [this.reField, ht(e, "regexp")]),
      ke("label", null, [this.wordField, ht(e, "by word")]),
      ...e.state.readOnly ? [] : [
        ke("br"),
        this.replaceField,
        n("replace", () => zf(e), [ht(e, "replace")]),
        n("replaceAll", () => Lw(e), [ht(e, "replace all")])
      ],
      ke("button", {
        name: "close",
        onclick: () => ny(e),
        "aria-label": ht(e, "close"),
        type: "button"
      }, ["×"])
    ]);
  }
  commit() {
    let e = new Qg({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      wholeWord: this.wordField.checked,
      replace: this.replaceField.value
    });
    e.eq(this.query) || (this.query = e, this.view.dispatch({ effects: sr.of(e) }));
  }
  keydown(e) {
    jS(this.view, e, "search-panel") ? e.preventDefault() : e.keyCode == 13 && e.target == this.searchField ? (e.preventDefault(), (e.shiftKey ? Go : zo)(this.view)) : e.keyCode == 13 && e.target == this.replaceField && (e.preventDefault(), zf(this.view));
  }
  update(e) {
    for (let t of e.transactions)
      for (let n of t.effects)
        n.is(sr) && !n.value.eq(this.query) && this.setQuery(n.value);
  }
  setQuery(e) {
    this.query = e, this.searchField.value = e.search, this.replaceField.value = e.replace, this.caseField.checked = e.caseSensitive, this.reField.checked = e.regexp, this.wordField.checked = e.wholeWord;
  }
  mount() {
    this.searchField.select();
  }
  get pos() {
    return 80;
  }
  get top() {
    return this.view.state.facet(fs).top;
  }
}
function ht(i, e) {
  return i.state.phrase(e);
}
const qr = 30, Yr = /[\s\.,:;?!]/;
function Oc(i, { from: e, to: t }) {
  let n = i.state.doc.lineAt(e), s = i.state.doc.lineAt(t).to, r = Math.max(n.from, e - qr), o = Math.min(s, t + qr), a = i.state.sliceDoc(r, o);
  if (r != n.from) {
    for (let l = 0; l < qr; l++)
      if (!Yr.test(a[l + 1]) && Yr.test(a[l])) {
        a = a.slice(l);
        break;
      }
  }
  if (o != s) {
    for (let l = a.length - 1; l > a.length - qr; l--)
      if (!Yr.test(a[l - 1]) && Yr.test(a[l])) {
        a = a.slice(0, l);
        break;
      }
  }
  return O.announce.of(`${i.state.phrase("current match")}. ${a} ${i.state.phrase("on line")} ${n.number}.`);
}
const $w = /* @__PURE__ */ O.baseTheme({
  ".cm-panel.cm-search": {
    padding: "2px 6px 4px",
    position: "relative",
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    },
    "& input, & button, & label": {
      margin: ".2em .6em .2em 0"
    },
    "& input[type=checkbox]": {
      marginRight: ".2em"
    },
    "& label": {
      fontSize: "80%",
      whiteSpace: "pre"
    }
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
  "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
  "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
}), Bw = [
  Fi,
  /* @__PURE__ */ kn.low(Rw),
  $w
];
class Uw {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    E(this, "connection");
    // HomeAssistant WebSocket connection
    E(this, "bindings", /* @__PURE__ */ new Map());
    E(this, "entityStates", /* @__PURE__ */ new Map());
    E(this, "liveValues", /* @__PURE__ */ new Map());
    E(this, "subscribers", /* @__PURE__ */ new Set());
    E(this, "unsubscribe", null);
    E(this, "status", "disconnected");
    E(this, "updateRate", 100);
    E(this, "showConditions", !0);
    E(this, "highlightChanges", !0);
    this.connection = e;
  }
  /**
   * Start online mode with given variable bindings
   */
  async start(e) {
    this.status = "connecting", this.notifySubscribers(), this.bindings.clear();
    for (const t of e)
      this.bindings.set(t.variableName, t);
    try {
      this.unsubscribe = await this.connection.subscribeEntities(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t) => {
          this.handleEntityUpdate(t);
        }
      ), this.status = "online", this.notifySubscribers();
    } catch (t) {
      throw this.status = "error", this.notifySubscribers(), t;
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
  setPaused(e) {
    this.status = e ? "paused" : "online", this.notifySubscribers();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleEntityUpdate(e) {
    if (this.status === "paused") return;
    const t = Date.now();
    for (const [n, s] of Object.entries(e))
      this.entityStates.set(n, s);
    for (const [n, s] of this.bindings) {
      const r = this.entityStates.get(s.entityId);
      if (!r) continue;
      const o = this.parseValue(r.state, s.dataType), a = this.liveValues.get(n), l = {
        binding: s,
        currentValue: o,
        previousValue: a == null ? void 0 : a.currentValue,
        hasChanged: a ? a.currentValue.raw !== o.raw : !1,
        lastUpdate: t
      };
      this.liveValues.set(n, l);
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
        const s = ["on", "true", "1"].includes(e.toLowerCase());
        return {
          raw: e,
          formatted: s ? "TRUE" : "FALSE",
          isValid: !0,
          dataType: "BOOL"
        };
      }
      case "INT":
      case "DINT": {
        const s = Number.parseInt(e, 10);
        return {
          raw: e,
          formatted: Number.isNaN(s) ? "—" : String(s),
          isValid: !Number.isNaN(s),
          dataType: "INT"
        };
      }
      case "REAL":
      case "LREAL": {
        const s = Number.parseFloat(e);
        return {
          raw: e,
          formatted: Number.isNaN(s) ? "—" : s.toFixed(2),
          isValid: !Number.isNaN(s),
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
class Gf {
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
const sy = V.define();
V.define();
class Fw extends ki {
  constructor(e, t) {
    super(), this.value = e, this.showChange = t;
  }
  toDOM() {
    const e = document.createElement("span");
    e.className = "st-live-value-widget";
    const t = this.showChange ? Gf.formatWithChange(this.value) : Gf.format(this.value.currentValue), n = document.createElement("span");
    return n.className = `st-live-value ${t.className}`, n.textContent = t.text, n.title = `${this.value.binding.entityId}
Last update: ${new Date(this.value.lastUpdate).toLocaleTimeString()}`, e.appendChild(n), e;
  }
  eq(e) {
    return this.value.currentValue.raw === e.value.currentValue.raw && this.value.hasChanged === e.value.hasChanged;
  }
  ignoreEvent() {
    return !1;
  }
}
const Ww = Ke.define({
  create() {
    return B.none;
  },
  update(i, e) {
    for (const t of e.effects)
      if (t.is(sy))
        return Hw(e.state.doc.toString(), t.value);
    return e.docChanged && (i = i.map(e.changes)), i;
  },
  provide: (i) => O.decorations.from(i)
});
function Hw(i, e) {
  const t = [], n = i.split(`
`);
  let s = 0;
  for (let r = 0; r < n.length; r++) {
    const o = n[r], a = s + o.length;
    for (const [, l] of e)
      if (l.binding.line === r + 1) {
        const h = B.widget({
          widget: new Fw(l, !0),
          side: 1
        });
        t.push({
          from: a,
          to: a,
          decoration: h
        });
      }
    s = a + 1;
  }
  return t.sort((r, o) => r.from - o.from), B.set(
    t.map((r) => r.decoration.range(r.from, r.to))
  );
}
const Vw = O.baseTheme({
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
function jw() {
  return [Ww, Vw];
}
function zw(i, e) {
  i.dispatch({
    effects: sy.of(e)
  });
}
var ry = Object.defineProperty, Gw = Object.getOwnPropertyDescriptor, Kw = (i, e, t) => e in i ? ry(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, Sa = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? Gw(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && ry(e, t, s), s;
}, qw = (i, e, t) => Kw(i, e + "", t);
let rs = class extends xt {
  constructor() {
    super();
    E(this, "_editor", null);
    E(this, "_readOnlyCompartment", new cr());
    E(this, "_onlineManager", null);
    E(this, "_onlineUnsubscribe", null);
    this.code = "", this.readOnly = !1;
  }
  async firstUpdated(e) {
    console.log("STEditor.firstUpdated called"), await this.updateComplete, console.log("STEditor: updateComplete resolved"), await new Promise((t) => requestAnimationFrame(t)), console.log("STEditor: requestAnimationFrame resolved"), this._initEditor();
  }
  updated(e) {
    if (e.has("readOnly") && this._editor && this._editor.dispatch({
      effects: this._readOnlyCompartment.reconfigure(
        G.readOnly.of(this.readOnly)
      )
    }), e.has("code") && this._editor) {
      const t = this._editor.state.doc.toString();
      t !== this.code && this._editor.dispatch({
        changes: { from: 0, to: t.length, insert: this.code }
      });
    }
  }
  disconnectedCallback() {
    var e, t, n;
    super.disconnectedCallback(), (e = this._onlineUnsubscribe) == null || e.call(this), (t = this._onlineManager) == null || t.stop(), (n = this._editor) == null || n.destroy();
  }
  /**
   * Start online mode with variable bindings
   */
  async startOnlineMode(e) {
    var t;
    if (!((t = this.hass) != null && t.connection))
      throw new Error("Home Assistant connection not available");
    this._onlineManager || (this._onlineManager = new Uw(this.hass.connection), this._onlineUnsubscribe = this._onlineManager.subscribe((n) => {
      this._editor && n.liveValues && zw(this._editor, n.liveValues);
    })), await this._onlineManager.start(e);
  }
  /**
   * Stop online mode
   */
  stopOnlineMode() {
    var e;
    (e = this._onlineManager) == null || e.stop();
  }
  /**
   * Pause/resume online mode
   */
  setOnlinePaused(e) {
    var t;
    (t = this._onlineManager) == null || t.setPaused(e);
  }
  /**
   * Get current online state
   */
  getOnlineState() {
    var e;
    return ((e = this._onlineManager) == null ? void 0 : e.getState()) || null;
  }
  _initEditor() {
    var n;
    const e = (n = this.shadowRoot) == null ? void 0 : n.querySelector(
      "#editor-container"
    );
    if (console.log("STEditor._initEditor called, container:", e), !e) {
      console.error("STEditor: container not found!");
      return;
    }
    const t = [
      OT(),
      NT(),
      rT(),
      oA(),
      gx(),
      XS(),
      G.allowMultipleSelections.of(!0),
      ix(),
      _x(),
      uE(),
      xE(),
      uT(),
      pw(),
      hc.of([
        ...mE,
        ...lw,
        ...Pw,
        ...mA,
        ...fx,
        ...og,
        hw
      ]),
      CE(),
      OE(),
      jw(),
      this._readOnlyCompartment.of(G.readOnly.of(this.readOnly)),
      G.tabSize.of(4)
    ];
    this._editor = new O({
      state: G.create({ doc: this.code, extensions: t }),
      parent: e,
      dispatch: (s) => {
        this._editor.update([s]), s.docChanged && this.dispatchEvent(
          new CustomEvent("code-change", {
            detail: { code: s.newDoc.toString() },
            bubbles: !0,
            composed: !0
          })
        );
      }
    }), e.addEventListener("keydown", (s) => s.stopPropagation()), e.addEventListener("keyup", (s) => s.stopPropagation()), e.addEventListener("keypress", (s) => s.stopPropagation()), e.addEventListener("dragover", (s) => {
      s.preventDefault(), s.stopPropagation(), s.dataTransfer && (s.dataTransfer.dropEffect = "copy");
    }), e.addEventListener("drop", (s) => {
      s.preventDefault(), s.stopPropagation(), this._handleDrop(s);
    });
  }
  /**
   * Handle drop event from entity browser
   */
  _handleDrop(e) {
    if (!this._editor || !e.dataTransfer) return;
    let t = e.dataTransfer.getData("text/plain");
    if (!t)
      try {
        const s = e.dataTransfer.getData("application/json");
        s && (t = JSON.parse(s).bindingSyntax);
      } catch (s) {
        console.error("Failed to parse drag data", s);
        return;
      }
    if (!t) return;
    const n = this._editor.posAtCoords({
      x: e.clientX,
      y: e.clientY
    });
    if (n === null) {
      const s = this._editor.state.selection.main, r = s.empty ? s.head : s.from;
      this._editor.dispatch({
        changes: { from: r, insert: t },
        selection: { anchor: r + t.length }
      });
    } else
      this._editor.dispatch({
        changes: { from: n, insert: t },
        selection: { anchor: n + t.length }
      });
    this._editor.focus();
  }
  getCode() {
    var e;
    return ((e = this._editor) == null ? void 0 : e.state.doc.toString()) ?? this.code;
  }
  setCode(e) {
    this.code = e;
  }
  focus() {
    var e;
    (e = this._editor) == null || e.focus();
  }
  render() {
    return U`<div id="editor-container"></div>`;
  }
};
qw(rs, "styles", Ji`
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
Sa([
  Ce({ type: String })
], rs.prototype, "code", 2);
Sa([
  Ce({ type: Boolean, attribute: "read-only" })
], rs.prototype, "readOnly", 2);
Sa([
  Ce({ attribute: !1 })
], rs.prototype, "hass", 2);
rs = Sa([
  Qi("st-editor")
], rs);
var oy = Object.defineProperty, Yw = Object.getOwnPropertyDescriptor, Xw = (i, e, t) => e in i ? oy(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, Ic = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? Yw(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && oy(e, t, s), s;
}, Jw = (i, e, t) => Xw(i, e + "", t);
let rr = class extends xt {
  constructor() {
    super(...arguments);
    E(this, "_showSettings", !1);
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
    var e;
    return ((e = this.state) == null ? void 0 : e.status) === "paused";
  }
  get canConnect() {
    var e;
    return ["disconnected", "error"].includes(((e = this.state) == null ? void 0 : e.status) || "disconnected");
  }
  render() {
    var e, t, n, s;
    return U`
      <div class="status">
        <span
          class="status-dot status-dot--${((e = this.state) == null ? void 0 : e.status) || "disconnected"}"
        ></span>
        <span class="status-text">${this.statusText}</span>
      </div>

      <div class="controls">
        ${this.canConnect ? U` <button @click=${this._handleConnect}>▶ Connect</button> ` : U`
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
        <div class="stat">📊 ${((n = (t = this.state) == null ? void 0 : t.liveValues) == null ? void 0 : n.size) || 0} Variables</div>
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
    var e, t, n, s, r, o;
    return U`
      <div class="settings-panel">
        <div class="setting">
          <input
            type="checkbox"
            id="highlight"
            .checked=${(e = this.state) == null ? void 0 : e.highlightChanges}
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
            <option value="50" ?selected=${((n = this.state) == null ? void 0 : n.updateRate) === 50}>
              50ms
            </option>
            <option value="100" ?selected=${((s = this.state) == null ? void 0 : s.updateRate) === 100}>
              100ms
            </option>
            <option value="250" ?selected=${((r = this.state) == null ? void 0 : r.updateRate) === 250}>
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
Jw(rr, "styles", Ji`
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
Ic([
  Ce({ type: Object })
], rr.prototype, "state", 2);
Ic([
  fe()
], rr.prototype, "_showSettings", 2);
rr = Ic([
  Qi("st-online-toolbar")
], rr);
var ay = Object.defineProperty, Qw = Object.getOwnPropertyDescriptor, Zw = (i, e, t) => e in i ? ay(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, Sr = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? Qw(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && ay(e, t, s), s;
}, eC = (i, e, t) => Zw(i, e + "", t);
let xn = class extends xt {
  _handleDragStart(i) {
    if (!i.dataTransfer || !this.entity) return;
    const e = i.shiftKey ? "output" : "input", t = e === "input" ? "%I*" : "%Q*", s = `${this._entityIdToVarName(this.entity.entityId)} AT ${t} : ${this.inferredType} := '${this.entity.entityId}';`, r = {
      entityId: this.entity.entityId,
      dataType: this.inferredType,
      direction: e,
      bindingSyntax: s
    };
    i.dataTransfer.effectAllowed = "copy", i.dataTransfer.setData("text/plain", s), i.dataTransfer.setData("application/json", JSON.stringify(r)), this.classList.add("dragging");
  }
  _handleDragEnd() {
    this.classList.remove("dragging");
  }
  _entityIdToVarName(i) {
    const e = i.split(".");
    return e.length < 2 ? i : e[1].split("_").map((n, s) => s === 0 ? n : n.charAt(0).toUpperCase() + n.slice(1)).join("");
  }
  _getStateClass(i) {
    const e = i.toLowerCase();
    return e === "on" || e === "open" || e === "active" ? "on" : e === "off" || e === "closed" || e === "inactive" ? "off" : e === "unavailable" || e === "unknown" ? "unavailable" : "";
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
    if (!this.entity) return U``;
    const i = this._getStateClass(this.entity.state), e = this._getEntityIcon(), t = this.entity.friendlyName || this.entity.entityId;
    return U`
      <div
        class="entity-item"
        draggable="true"
        @dragstart=${this._handleDragStart}
        @dragend=${this._handleDragEnd}
        title="Drag to editor (Shift+drag for output binding)"
      >
        ${this.isInput || this.isOutput ? U`<div
              class="direction-indicator ${this.isInput ? "input" : "output"}"
              title="${this.isInput ? "Input" : "Output"}"
            ></div>` : ""}
        <div class="entity-icon">
          <ha-icon .icon=${e}></ha-icon>
        </div>
        <div class="entity-info">
          <div class="entity-name">${t}</div>
          <div class="entity-id">${this.entity.entityId}</div>
        </div>
        <div class="entity-state ${i}">${this.entity.state}</div>
      </div>
    `;
  }
};
eC(xn, "styles", Ji`
    :host {
      display: block;
    }
    .entity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: grab;
      border-radius: 4px;
      transition: background-color 0.2s;
      user-select: none;
    }
    .entity-item:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .entity-item:active {
      cursor: grabbing;
    }
    .entity-item.dragging {
      opacity: 0.5;
    }
    .entity-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-text-color);
    }
    .entity-icon ha-icon {
      width: 20px;
      height: 20px;
    }
    .entity-info {
      flex: 1;
      min-width: 0;
    }
    .entity-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entity-id {
      font-size: 11px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .entity-state {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      background-color: var(--secondary-background-color);
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .entity-state.on {
      background-color: var(--success-color, #4caf50);
      color: white;
    }
    .entity-state.off {
      background-color: var(--disabled-color, #9e9e9e);
      color: white;
    }
    .entity-state.unavailable {
      background-color: var(--error-color, #f44336);
      color: white;
    }
    .direction-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .direction-indicator.input {
      background-color: var(--info-color, #2196f3);
    }
    .direction-indicator.output {
      background-color: var(--warning-color, #ff9800);
    }
  `);
Sr([
  Ce({ type: Object })
], xn.prototype, "entity", 2);
Sr([
  Ce({ type: String })
], xn.prototype, "inferredType", 2);
Sr([
  Ce({ type: Boolean })
], xn.prototype, "isInput", 2);
Sr([
  Ce({ type: Boolean })
], xn.prototype, "isOutput", 2);
xn = Sr([
  Qi("st-entity-item")
], xn);
var ly = Object.defineProperty, tC = Object.getOwnPropertyDescriptor, iC = (i, e, t) => e in i ? ly(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, Ta = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? tC(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && ly(e, t, s), s;
}, nC = (i, e, t) => iC(i, e + "", t);
let os = class extends xt {
  constructor() {
    super();
    E(this, "_expandedDomains", /* @__PURE__ */ new Set());
    this.entities = [], this.filter = {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    };
  }
  _getDomainIcon(e) {
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
    }[e] || "mdi:circle";
  }
  _isInputEntity(e) {
    return [
      "sensor",
      "binary_sensor",
      "input_number",
      "input_text",
      "input_select",
      "sun",
      "weather"
    ].includes(e.domain);
  }
  _isOutputEntity(e) {
    return [
      "light",
      "switch",
      "input_boolean",
      "cover",
      "fan",
      "climate",
      "lock",
      "media_player"
    ].includes(e.domain);
  }
  _filterEntities(e) {
    return e.filter((t) => {
      if (this.filter.searchQuery) {
        const n = this.filter.searchQuery.toLowerCase();
        if (!(t.entityId.toLowerCase().includes(n) || t.friendlyName && t.friendlyName.toLowerCase().includes(n))) return !1;
      }
      return !(this.filter.selectedDomain && t.domain !== this.filter.selectedDomain || this.filter.showInputsOnly && !this._isInputEntity(t) || this.filter.showOutputsOnly && !this._isOutputEntity(t));
    });
  }
  _groupByDomain(e) {
    const t = /* @__PURE__ */ new Map();
    for (const s of e)
      t.has(s.domain) || t.set(s.domain, []), t.get(s.domain).push(s);
    const n = [];
    for (const [s, r] of t.entries())
      n.push({
        domain: s,
        entities: r.sort(
          (o, a) => (o.friendlyName || o.entityId).localeCompare(
            a.friendlyName || a.entityId
          )
        ),
        icon: this._getDomainIcon(s),
        expanded: this._expandedDomains.has(s)
      });
    return n.sort((s, r) => s.domain.localeCompare(r.domain));
  }
  _toggleDomain(e) {
    this._expandedDomains.has(e) ? this._expandedDomains.delete(e) : this._expandedDomains.add(e), this._expandedDomains = new Set(this._expandedDomains), this.requestUpdate();
  }
  render() {
    const e = this._filterEntities(this.entities), t = this._groupByDomain(e);
    return t.length === 0 ? U`
        <div class="empty-state">
          ${this.filter.searchQuery ? "No entities match your search" : "No entities available"}
        </div>
      ` : U`
      ${t.map(
      (n) => U`
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
            ${n.expanded ? U`
                  <div class="domain-entities">
                    ${n.entities.map(
        (s) => U`
                        <st-entity-item
                          .entity=${s}
                          .inferredType=${aC(s).dataType}
                          .isInput=${this._isInputEntity(s)}
                          .isOutput=${this._isOutputEntity(s)}
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
nC(os, "styles", Ji`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }
    .domain-group {
      margin-bottom: 8px;
    }
    .domain-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      color: var(--primary-text-color);
      background-color: var(--secondary-background-color);
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .domain-header:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .domain-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .domain-icon ha-icon {
      width: 20px;
      height: 20px;
    }
    .domain-name {
      flex: 1;
      font-size: 14px;
    }
    .domain-count {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .domain-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .domain-toggle.expanded {
      transform: rotate(90deg);
    }
    .domain-entities {
      margin-top: 4px;
      padding-left: 8px;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 14px;
    }
  `);
Ta([
  Ce({ type: Array })
], os.prototype, "entities", 2);
Ta([
  Ce({ type: Object })
], os.prototype, "filter", 2);
Ta([
  fe()
], os.prototype, "_expandedDomains", 2);
os = Ta([
  Qi("st-entity-list")
], os);
var hy = Object.defineProperty, sC = Object.getOwnPropertyDescriptor, rC = (i, e, t) => e in i ? hy(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, _n = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? sC(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && hy(e, t, s), s;
}, oC = (i, e, t) => rC(i, e + "", t);
let si = class extends xt {
  constructor() {
    super(...arguments);
    E(this, "_entities", /* @__PURE__ */ new Map());
    E(this, "_filter", {
      searchQuery: "",
      selectedDomain: null,
      showInputsOnly: !1,
      showOutputsOnly: !1
    });
    E(this, "_domains", []);
    E(this, "_isConnected", !1);
    E(this, "_error", null);
    E(this, "_unsubscribe", null);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this.hass) != null && e.connection && this._connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._disconnect();
  }
  updated(e) {
    var t;
    super.updated(e), e.has("hass") && (this._disconnect(), (t = this.hass) != null && t.connection && this._connect());
  }
  /**
   * Connect to HA WebSocket and subscribe to entity updates
   */
  async _connect() {
    var e;
    if (!((e = this.hass) != null && e.connection)) {
      this._error = "Home Assistant connection not available";
      return;
    }
    try {
      this._error = null, this._isConnected = !1, this._unsubscribe = await this.hass.connection.subscribeEntities(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t) => {
          this._handleEntityUpdate(t);
        }
      ), this._isConnected = !0;
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Connection failed", this._isConnected = !1, console.error("Failed to subscribe to entities", t);
    }
  }
  /**
   * Disconnect from WebSocket subscription
   */
  _disconnect() {
    this._unsubscribe && (this._unsubscribe(), this._unsubscribe = null), this._isConnected = !1;
  }
  /**
   * Handle entity state updates from WebSocket
   */
  _handleEntityUpdate(e) {
    var s;
    const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
    for (const [r, o] of Object.entries(e)) {
      const a = r.split(".")[0];
      n.add(a);
      const l = {
        entityId: r,
        state: o.state,
        attributes: o.attributes || {},
        domain: a,
        friendlyName: this._getFriendlyName(o),
        deviceClass: (s = o.attributes) == null ? void 0 : s.device_class,
        icon: this._getEntityIcon(o),
        lastChanged: o.lastChanged
      };
      t.set(r, l);
    }
    this._entities = t, this._domains = Array.from(n).sort();
  }
  /**
   * Extract friendly name from entity state
   */
  _getFriendlyName(e) {
    var t;
    if ((t = e.attributes) != null && t.friendly_name)
      return e.attributes.friendly_name;
  }
  /**
   * Extract icon from entity state
   */
  _getEntityIcon(e) {
    var t;
    if ((t = e.attributes) != null && t.icon)
      return e.attributes.icon;
  }
  /**
   * Infer data type from entity
   */
  static inferDataType(e) {
    const t = e.domain;
    if (["binary_sensor", "input_boolean", "switch", "light"].includes(t))
      return {
        dataType: "BOOL",
        confidence: "high",
        reason: `Domain ${t} typically uses boolean values`
      };
    if (t === "input_number" || t === "number")
      return {
        dataType: "REAL",
        confidence: "high",
        reason: `Domain ${t} uses numeric values`
      };
    if (t === "sensor") {
      const n = parseFloat(e.state);
      return isNaN(n) ? {
        dataType: "STRING",
        confidence: "medium",
        reason: "Sensor state is non-numeric"
      } : Number.isInteger(n) ? {
        dataType: "INT",
        confidence: "medium",
        reason: "Sensor state is a numeric integer"
      } : {
        dataType: "REAL",
        confidence: "medium",
        reason: "Sensor state is a numeric value"
      };
    }
    return {
      dataType: "STRING",
      confidence: "low",
      reason: "Unknown domain, defaulting to STRING"
    };
  }
  _handleSearchChange(e) {
    const t = e.target;
    this._filter = {
      ...this._filter,
      searchQuery: t.value
    };
  }
  _handleDomainChange(e) {
    const t = e.target;
    this._filter = {
      ...this._filter,
      selectedDomain: t.value || null
    };
  }
  _handleInputsOnlyChange(e) {
    const t = e.target;
    this._filter = {
      ...this._filter,
      showInputsOnly: t.checked,
      showOutputsOnly: !1
      // Mutually exclusive
    };
  }
  _handleOutputsOnlyChange(e) {
    const t = e.target;
    this._filter = {
      ...this._filter,
      showInputsOnly: !1,
      // Mutually exclusive
      showOutputsOnly: t.checked
    };
  }
  render() {
    const e = Array.from(this._entities.values());
    return U`
      <div class="header">
        <h2>Entity Browser</h2>
        <input
          type="text"
          class="search-box"
          placeholder="🔍 Filter entities..."
          .value=${this._filter.searchQuery}
          @input=${this._handleSearchChange}
        />
        <div class="filters">
          <select
            class="filter-select"
            @change=${this._handleDomainChange}
            .value=${this._filter.selectedDomain || ""}
          >
            <option value="">All Domains</option>
            ${this._domains.map(
      (t) => U`
                <option value=${t}>${t}</option>
              `
    )}
          </select>
          <label class="filter-checkbox">
            <input
              type="checkbox"
              .checked=${this._filter.showInputsOnly}
              @change=${this._handleInputsOnlyChange}
            />
            Inputs Only
          </label>
          <label class="filter-checkbox">
            <input
              type="checkbox"
              .checked=${this._filter.showOutputsOnly}
              @change=${this._handleOutputsOnlyChange}
            />
            Outputs Only
          </label>
        </div>
      </div>
      <div class="status-bar">
        <span
          class=${this._isConnected ? "status-connected" : ""}
        >
          ${this._isConnected ? `✓ ${e.length} entities` : "Connecting..."}
        </span>
        ${this._error ? U`<span class="status-error">${this._error}</span>` : ""}
      </div>
      <div class="entity-list-container">
        ${this._isConnected ? U`
              <st-entity-list
                .entities=${e}
                .filter=${this._filter}
              ></st-entity-list>
            ` : U`
              <div class="empty-state">
                ${this._error || "Connecting to Home Assistant..."}
              </div>
            `}
      </div>
    `;
  }
};
oC(si, "styles", Ji`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
    }
    .header {
      padding: 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    .header h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .search-box {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 14px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    .search-box:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .filters {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .filter-select {
      flex: 1;
      min-width: 120px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--primary-text-color);
    }
    .filter-checkbox input {
      margin: 0;
    }
    .status-bar {
      padding: 8px 16px;
      font-size: 12px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      display: flex;
      justify-content: space-between;
    }
    .status-connected {
      color: var(--success-color, #4caf50);
    }
    .status-error {
      color: var(--error-color, #f44336);
    }
    .entity-list-container {
      flex: 1;
      overflow: hidden;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
    }
  `);
_n([
  Ce({ attribute: !1 })
], si.prototype, "hass", 2);
_n([
  fe()
], si.prototype, "_entities", 2);
_n([
  fe()
], si.prototype, "_filter", 2);
_n([
  fe()
], si.prototype, "_domains", 2);
_n([
  fe()
], si.prototype, "_isConnected", 2);
_n([
  fe()
], si.prototype, "_error", 2);
si = _n([
  Qi("st-entity-browser")
], si);
function aC(i) {
  return si.inferDataType(i);
}
const Kf = "st_hass_project";
class Ko {
  constructor(e, t) {
  }
  /**
   * Load project structure from localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async loadProject() {
    const e = localStorage.getItem(Kf);
    if (e)
      try {
        const t = JSON.parse(e);
        return this._deserializeProject(t);
      } catch (t) {
        console.error("Failed to parse localStorage project data", t);
      }
    return null;
  }
  /**
   * Save project structure to localStorage
   * Note: HA storage API integration can be added later if needed
   */
  async saveProject(e) {
    const t = this._serializeProject(e);
    localStorage.setItem(Kf, JSON.stringify(t));
  }
  /**
   * Create a new project with default structure
   */
  createDefaultProject() {
    const e = Date.now(), t = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: `{mode: restart}
PROGRAM Main
VAR
END_VAR

(* Your ST code here *)

END_PROGRAM`,
      lastModified: e,
      isOpen: !0,
      hasUnsavedChanges: !1
    };
    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [t],
      activeFileId: t.id,
      createdAt: e,
      lastModified: e
    };
  }
  /**
   * Migrate from single-file mode to project mode
   */
  migrateFromSingleFile(e) {
    const t = Date.now(), n = {
      id: this._generateFileId(),
      name: "Main.st",
      path: "Main.st",
      content: e,
      lastModified: t,
      isOpen: !0,
      hasUnsavedChanges: !1
    };
    return {
      id: this._generateProjectId(),
      name: "My ST Project",
      files: [n],
      activeFileId: n.id,
      createdAt: t,
      lastModified: t
    };
  }
  /**
   * Serialize project for storage (exclude transient state)
   */
  _serializeProject(e) {
    return {
      id: e.id,
      name: e.name,
      files: e.files.map((t) => ({
        id: t.id,
        name: t.name,
        path: t.path,
        content: t.content,
        lastModified: t.lastModified
        // Don't serialize isOpen and hasUnsavedChanges (transient state)
      })),
      activeFileId: e.activeFileId,
      createdAt: e.createdAt,
      lastModified: e.lastModified
    };
  }
  /**
   * Deserialize project from storage
   */
  _deserializeProject(e) {
    const t = e;
    return {
      id: t.id,
      name: t.name,
      files: t.files.map((n) => ({
        ...n,
        isOpen: !1,
        // Reset on load
        hasUnsavedChanges: !1
        // Reset on load
      })),
      activeFileId: t.activeFileId,
      createdAt: t.createdAt,
      lastModified: t.lastModified
    };
  }
  /**
   * Generate unique file ID
   */
  _generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Generate unique project ID
   */
  _generateProjectId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
var cy = Object.defineProperty, lC = Object.getOwnPropertyDescriptor, hC = (i, e, t) => e in i ? cy(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, On = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? lC(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && cy(e, t, s), s;
}, cC = (i, e, t) => hC(i, e + "", t);
let Ti = class extends xt {
  constructor() {
    super();
    E(this, "_expandedPaths");
    E(this, "_editingFileId");
    E(this, "_editingName");
    this.files = [], this.activeFileId = null, this.selectedFileId = null, this._expandedPaths = /* @__PURE__ */ new Set(), this._editingFileId = null, this._editingName = "";
  }
  _buildTree() {
    const e = {
      name: "",
      path: "",
      children: /* @__PURE__ */ new Map(),
      isFolder: !0
    };
    for (const t of this.files) {
      const n = t.path.split("/");
      let s = e;
      for (let r = 0; r < n.length; r++) {
        const o = n[r], a = r === n.length - 1;
        s.children.has(o) || s.children.set(o, {
          name: o,
          path: n.slice(0, r + 1).join("/"),
          children: /* @__PURE__ */ new Map(),
          isFolder: !a
        });
        const l = s.children.get(o);
        a && (l.file = t), s = l;
      }
    }
    return e;
  }
  _toggleExpand(e) {
    this._expandedPaths.has(e) ? this._expandedPaths.delete(e) : this._expandedPaths.add(e), this._expandedPaths = new Set(this._expandedPaths), this.requestUpdate();
  }
  _handleFileClick(e, t) {
    t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileDoubleClick(e, t) {
    t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleContextMenu(e, t) {
    t.preventDefault(), t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("file-context-menu", {
        detail: { fileId: e.id, x: t.clientX, y: t.clientY },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _renderNode(e, t = 0) {
    const n = this._expandedPaths.has(e.path), s = e.children.size > 0;
    if (e.isFolder && e.path === "") {
      const l = Array.from(e.children.values()).sort((h, c) => h.isFolder !== c.isFolder ? h.isFolder ? -1 : 1 : h.name.localeCompare(c.name));
      return U`
        ${l.map((h) => this._renderNode(h, t))}
      `;
    }
    if (e.isFolder)
      return U`
        <div class="tree-node">
          <div
            class="tree-item"
            @click=${() => this._toggleExpand(e.path)}
          >
            <div class="tree-toggle ${n ? "expanded" : ""}">
              ${s ? U`<ha-icon icon="mdi:chevron-right"></ha-icon>` : U`<span style="width: 16px;"></span>`}
            </div>
            <div class="tree-icon">
              <ha-icon icon="mdi:folder"></ha-icon>
            </div>
            <div class="tree-label">${e.name}</div>
          </div>
          ${n && s ? U`
                <div class="tree-children">
                  ${Array.from(e.children.values()).sort((l, h) => l.isFolder !== h.isFolder ? l.isFolder ? -1 : 1 : l.name.localeCompare(h.name)).map((l) => this._renderNode(l, t + 1))}
                </div>
              ` : ""}
        </div>
      `;
    if (!e.file) return U``;
    const r = e.file.id === this.activeFileId, o = e.file.id === this.selectedFileId, a = this._editingFileId === e.file.id;
    return U`
      <div class="tree-node">
        <div
          class="tree-item ${r ? "active" : ""} ${o ? "selected" : ""}"
          @click=${(l) => this._handleFileClick(e.file, l)}
          @dblclick=${(l) => this._handleFileDoubleClick(e.file, l)}
          @contextmenu=${(l) => this._handleContextMenu(e.file, l)}
        >
          <div class="tree-toggle">
            <span style="width: 16px;"></span>
          </div>
          <div class="tree-icon">
            <ha-icon icon="mdi:file-code"></ha-icon>
          </div>
          ${a ? U`
                <div class="tree-label editing">
                  <input
                    type="text"
                    .value=${this._editingName}
                    @blur=${() => this._finishEditing(e.file)}
                    @keydown=${(l) => {
      l.key === "Enter" ? this._finishEditing(e.file) : l.key === "Escape" && this._cancelEditing();
    }}
                    @click=${(l) => l.stopPropagation()}
                  />
                </div>
              ` : U`<div class="tree-label">${e.name}</div>`}
          ${e.file.hasUnsavedChanges ? U`<div class="unsaved-indicator" title="Unsaved changes"></div>` : ""}
        </div>
      </div>
    `;
  }
  _finishEditing(e) {
    this._editingName && this._editingName !== e.name && this.dispatchEvent(
      new CustomEvent("file-rename", {
        detail: { fileId: e.id, newName: this._editingName },
        bubbles: !0,
        composed: !0
      })
    ), this._editingFileId = null, this._editingName = "";
  }
  _cancelEditing() {
    this._editingFileId = null, this._editingName = "";
  }
  startRename(e) {
    const t = this.files.find((n) => n.id === e);
    t && (this._editingFileId = e, this._editingName = t.name);
  }
  render() {
    const e = this._buildTree();
    return U`
      <div class="file-tree">
        ${this._renderNode(e)}
      </div>
    `;
  }
};
cC(Ti, "styles", Ji`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-size: 14px;
    }
    .file-tree {
      padding: 8px;
    }
    .tree-node {
      user-select: none;
    }
    .tree-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .tree-item:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }
    .tree-item.active {
      background-color: var(--primary-color);
      color: var(--text-primary-color);
    }
    .tree-item.selected {
      background-color: var(--secondary-background-color);
    }
    .tree-toggle {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tree-toggle.expanded {
      transform: rotate(90deg);
    }
    .tree-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tree-icon ha-icon {
      width: 16px;
      height: 16px;
    }
    .tree-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tree-label.editing {
      padding: 2px 4px;
      border: 1px solid var(--primary-color);
      border-radius: 2px;
      background: var(--card-background-color);
    }
    .tree-label input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 14px;
    }
    .tree-children {
      margin-left: 16px;
    }
    .unsaved-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--warning-color, #ff9800);
      flex-shrink: 0;
    }
    .context-menu {
      position: fixed;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      min-width: 150px;
    }
    .context-menu-item {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
    }
    .context-menu-item:hover {
      background-color: var(--divider-color);
    }
  `);
On([
  Ce({ type: Array })
], Ti.prototype, "files", 2);
On([
  Ce({ type: String })
], Ti.prototype, "activeFileId", 2);
On([
  Ce({ type: String })
], Ti.prototype, "selectedFileId", 2);
On([
  fe()
], Ti.prototype, "_expandedPaths", 2);
On([
  fe()
], Ti.prototype, "_editingFileId", 2);
On([
  fe()
], Ti.prototype, "_editingName", 2);
Ti = On([
  Qi("st-file-tree")
], Ti);
var uy = Object.defineProperty, uC = Object.getOwnPropertyDescriptor, fC = (i, e, t) => e in i ? uy(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, xa = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? uC(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && uy(e, t, s), s;
}, dC = (i, e, t) => fC(i, e + "", t);
let as = class extends xt {
  constructor() {
    super();
    E(this, "_storage", null);
    this.project = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._initializeStorage();
  }
  updated(e) {
    super.updated(e), e.has("hass") && this._initializeStorage();
  }
  _initializeStorage() {
    var e, t;
    if ((e = this.hass) != null && e.connection) {
      const n = ((t = this.hass.config) == null ? void 0 : t.entry_id) || "default";
      this._storage = new Ko(this.hass.connection, n);
    } else
      this._storage = new Ko(null, "default");
  }
  _handleNewFile() {
    if (!this.project) return;
    const e = {
      id: this._generateFileId(),
      name: "NewFile.st",
      path: "NewFile.st",
      content: `{mode: restart}
PROGRAM NewFile
VAR
END_VAR

(* Your ST code here *)

END_PROGRAM`,
      lastModified: Date.now(),
      isOpen: !1,
      hasUnsavedChanges: !1
    }, t = {
      ...this.project,
      files: [...this.project.files, e],
      lastModified: Date.now()
    };
    this._updateProject(t), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: e.id },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileSelected(e) {
    const { fileId: t } = e.detail;
    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: { fileId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileOpen(e) {
    const { fileId: t } = e.detail;
    if (!this.project) return;
    const n = this.project.files.map((r) => ({
      ...r,
      isOpen: r.id === t || r.isOpen
    })), s = {
      ...this.project,
      files: n,
      activeFileId: t,
      lastModified: Date.now()
    };
    this._updateProject(s), this.dispatchEvent(
      new CustomEvent("file-open", {
        detail: { fileId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _handleFileRename(e) {
    const { fileId: t, newName: n } = e.detail;
    if (!this.project) return;
    const s = this.project.files.map((o) => o.id === t ? {
      ...o,
      name: n,
      path: n,
      // Simple: path = name for now
      lastModified: Date.now()
    } : o), r = {
      ...this.project,
      files: s,
      lastModified: Date.now()
    };
    this._updateProject(r);
  }
  _updateProject(e) {
    this.project = e, this._saveProject(), this.requestUpdate();
  }
  async _saveProject() {
    if (!(!this._storage || !this.project))
      try {
        await this._storage.saveProject(this.project);
      } catch (e) {
        console.error("Failed to save project", e);
      }
  }
  _generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  render() {
    return this.project ? U`
      <div class="header">
        <h3>${this.project.name}</h3>
        <div class="header-actions">
          <button
            class="header-button"
            @click=${this._handleNewFile}
            title="New File"
          >
            <ha-icon icon="mdi:file-plus"></ha-icon>
            New
          </button>
        </div>
      </div>
      <div class="file-tree-container">
        <st-file-tree
          .files=${this.project.files}
          .activeFileId=${this.project.activeFileId}
          @file-selected=${this._handleFileSelected}
          @file-open=${this._handleFileOpen}
          @file-rename=${this._handleFileRename}
        ></st-file-tree>
      </div>
    ` : U`
        <div class="empty-state">
          No project loaded. Create a new file to start.
        </div>
      `;
  }
};
dC(as, "styles", Ji`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
    }
    .header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .header-actions {
      display: flex;
      gap: 4px;
    }
    .header-button {
      padding: 4px 8px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }
    .header-button:hover {
      background-color: var(--divider-color);
    }
    .file-tree-container {
      flex: 1;
      overflow: hidden;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 14px;
    }
  `);
xa([
  Ce({ attribute: !1 })
], as.prototype, "hass", 2);
xa([
  Ce({ type: Object })
], as.prototype, "project", 2);
xa([
  fe()
], as.prototype, "_storage", 2);
as = xa([
  Qi("st-project-explorer")
], as);
var fy = typeof global == "object" && global && global.Object === Object && global, pC = typeof self == "object" && self && self.Object === Object && self, ri = fy || pC || Function("return this")(), wt = ri.Symbol, dy = Object.prototype, mC = dy.hasOwnProperty, gC = dy.toString, Ts = wt ? wt.toStringTag : void 0;
function yC(i) {
  var e = mC.call(i, Ts), t = i[Ts];
  try {
    i[Ts] = void 0;
    var n = !0;
  } catch {
  }
  var s = gC.call(i);
  return n && (e ? i[Ts] = t : delete i[Ts]), s;
}
var bC = Object.prototype, vC = bC.toString;
function SC(i) {
  return vC.call(i);
}
var TC = "[object Null]", xC = "[object Undefined]", qf = wt ? wt.toStringTag : void 0;
function en(i) {
  return i == null ? i === void 0 ? xC : TC : qf && qf in Object(i) ? yC(i) : SC(i);
}
function Bt(i) {
  return i != null && typeof i == "object";
}
var EC = "[object Symbol]";
function Ea(i) {
  return typeof i == "symbol" || Bt(i) && en(i) == EC;
}
function Aa(i, e) {
  for (var t = -1, n = i == null ? 0 : i.length, s = Array(n); ++t < n; )
    s[t] = e(i[t], t, i);
  return s;
}
var X = Array.isArray, Yf = wt ? wt.prototype : void 0, Xf = Yf ? Yf.toString : void 0;
function py(i) {
  if (typeof i == "string")
    return i;
  if (X(i))
    return Aa(i, py) + "";
  if (Ea(i))
    return Xf ? Xf.call(i) : "";
  var e = i + "";
  return e == "0" && 1 / i == -1 / 0 ? "-0" : e;
}
var AC = /\s/;
function wC(i) {
  for (var e = i.length; e-- && AC.test(i.charAt(e)); )
    ;
  return e;
}
var CC = /^\s+/;
function kC(i) {
  return i && i.slice(0, wC(i) + 1).replace(CC, "");
}
function Ct(i) {
  var e = typeof i;
  return i != null && (e == "object" || e == "function");
}
var Jf = NaN, _C = /^[-+]0x[0-9a-f]+$/i, OC = /^0b[01]+$/i, IC = /^0o[0-7]+$/i, RC = parseInt;
function NC(i) {
  if (typeof i == "number")
    return i;
  if (Ea(i))
    return Jf;
  if (Ct(i)) {
    var e = typeof i.valueOf == "function" ? i.valueOf() : i;
    i = Ct(e) ? e + "" : e;
  }
  if (typeof i != "string")
    return i === 0 ? i : +i;
  i = kC(i);
  var t = OC.test(i);
  return t || IC.test(i) ? RC(i.slice(2), t ? 2 : 8) : _C.test(i) ? Jf : +i;
}
var Qf = 1 / 0, MC = 17976931348623157e292;
function LC(i) {
  if (!i)
    return i === 0 ? i : 0;
  if (i = NC(i), i === Qf || i === -Qf) {
    var e = i < 0 ? -1 : 1;
    return e * MC;
  }
  return i === i ? i : 0;
}
function wa(i) {
  var e = LC(i), t = e % 1;
  return e === e ? t ? e - t : e : 0;
}
function ls(i) {
  return i;
}
var PC = "[object AsyncFunction]", DC = "[object Function]", $C = "[object GeneratorFunction]", BC = "[object Proxy]";
function _i(i) {
  if (!Ct(i))
    return !1;
  var e = en(i);
  return e == DC || e == $C || e == PC || e == BC;
}
var Sl = ri["__core-js_shared__"], Zf = function() {
  var i = /[^.]+$/.exec(Sl && Sl.keys && Sl.keys.IE_PROTO || "");
  return i ? "Symbol(src)_1." + i : "";
}();
function UC(i) {
  return !!Zf && Zf in i;
}
var FC = Function.prototype, WC = FC.toString;
function In(i) {
  if (i != null) {
    try {
      return WC.call(i);
    } catch {
    }
    try {
      return i + "";
    } catch {
    }
  }
  return "";
}
var HC = /[\\^$.*+?()[\]{}|]/g, VC = /^\[object .+?Constructor\]$/, jC = Function.prototype, zC = Object.prototype, GC = jC.toString, KC = zC.hasOwnProperty, qC = RegExp(
  "^" + GC.call(KC).replace(HC, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function YC(i) {
  if (!Ct(i) || UC(i))
    return !1;
  var e = _i(i) ? qC : VC;
  return e.test(In(i));
}
function XC(i, e) {
  return i == null ? void 0 : i[e];
}
function Rn(i, e) {
  var t = XC(i, e);
  return YC(t) ? t : void 0;
}
var vh = Rn(ri, "WeakMap"), ed = Object.create, JC = /* @__PURE__ */ function() {
  function i() {
  }
  return function(e) {
    if (!Ct(e))
      return {};
    if (ed)
      return ed(e);
    i.prototype = e;
    var t = new i();
    return i.prototype = void 0, t;
  };
}();
function QC(i, e, t) {
  switch (t.length) {
    case 0:
      return i.call(e);
    case 1:
      return i.call(e, t[0]);
    case 2:
      return i.call(e, t[0], t[1]);
    case 3:
      return i.call(e, t[0], t[1], t[2]);
  }
  return i.apply(e, t);
}
function Se() {
}
function ZC(i, e) {
  var t = -1, n = i.length;
  for (e || (e = Array(n)); ++t < n; )
    e[t] = i[t];
  return e;
}
var e1 = 800, t1 = 16, i1 = Date.now;
function n1(i) {
  var e = 0, t = 0;
  return function() {
    var n = i1(), s = t1 - (n - t);
    if (t = n, s > 0) {
      if (++e >= e1)
        return arguments[0];
    } else
      e = 0;
    return i.apply(void 0, arguments);
  };
}
function s1(i) {
  return function() {
    return i;
  };
}
var qo = function() {
  try {
    var i = Rn(Object, "defineProperty");
    return i({}, "", {}), i;
  } catch {
  }
}(), r1 = qo ? function(i, e) {
  return qo(i, "toString", {
    configurable: !0,
    enumerable: !1,
    value: s1(e),
    writable: !0
  });
} : ls, o1 = n1(r1);
function my(i, e) {
  for (var t = -1, n = i == null ? 0 : i.length; ++t < n && e(i[t], t, i) !== !1; )
    ;
  return i;
}
function gy(i, e, t, n) {
  for (var s = i.length, r = t + -1; ++r < s; )
    if (e(i[r], r, i))
      return r;
  return -1;
}
function a1(i) {
  return i !== i;
}
function l1(i, e, t) {
  for (var n = t - 1, s = i.length; ++n < s; )
    if (i[n] === e)
      return n;
  return -1;
}
function Rc(i, e, t) {
  return e === e ? l1(i, e, t) : gy(i, a1, t);
}
function yy(i, e) {
  var t = i == null ? 0 : i.length;
  return !!t && Rc(i, e, 0) > -1;
}
var h1 = 9007199254740991, c1 = /^(?:0|[1-9]\d*)$/;
function Ca(i, e) {
  var t = typeof i;
  return e = e ?? h1, !!e && (t == "number" || t != "symbol" && c1.test(i)) && i > -1 && i % 1 == 0 && i < e;
}
function Nc(i, e, t) {
  e == "__proto__" && qo ? qo(i, e, {
    configurable: !0,
    enumerable: !0,
    value: t,
    writable: !0
  }) : i[e] = t;
}
function Tr(i, e) {
  return i === e || i !== i && e !== e;
}
var u1 = Object.prototype, f1 = u1.hasOwnProperty;
function ka(i, e, t) {
  var n = i[e];
  (!(f1.call(i, e) && Tr(n, t)) || t === void 0 && !(e in i)) && Nc(i, e, t);
}
function Mc(i, e, t, n) {
  var s = !t;
  t || (t = {});
  for (var r = -1, o = e.length; ++r < o; ) {
    var a = e[r], l = void 0;
    l === void 0 && (l = i[a]), s ? Nc(t, a, l) : ka(t, a, l);
  }
  return t;
}
var td = Math.max;
function d1(i, e, t) {
  return e = td(e === void 0 ? i.length - 1 : e, 0), function() {
    for (var n = arguments, s = -1, r = td(n.length - e, 0), o = Array(r); ++s < r; )
      o[s] = n[e + s];
    s = -1;
    for (var a = Array(e + 1); ++s < e; )
      a[s] = n[s];
    return a[e] = t(o), QC(i, this, a);
  };
}
function Lc(i, e) {
  return o1(d1(i, e, ls), i + "");
}
var p1 = 9007199254740991;
function Pc(i) {
  return typeof i == "number" && i > -1 && i % 1 == 0 && i <= p1;
}
function oi(i) {
  return i != null && Pc(i.length) && !_i(i);
}
function by(i, e, t) {
  if (!Ct(t))
    return !1;
  var n = typeof e;
  return (n == "number" ? oi(t) && Ca(e, t.length) : n == "string" && e in t) ? Tr(t[e], i) : !1;
}
function m1(i) {
  return Lc(function(e, t) {
    var n = -1, s = t.length, r = s > 1 ? t[s - 1] : void 0, o = s > 2 ? t[2] : void 0;
    for (r = i.length > 3 && typeof r == "function" ? (s--, r) : void 0, o && by(t[0], t[1], o) && (r = s < 3 ? void 0 : r, s = 1), e = Object(e); ++n < s; ) {
      var a = t[n];
      a && i(e, a, n, r);
    }
    return e;
  });
}
var g1 = Object.prototype;
function xr(i) {
  var e = i && i.constructor, t = typeof e == "function" && e.prototype || g1;
  return i === t;
}
function y1(i, e) {
  for (var t = -1, n = Array(i); ++t < i; )
    n[t] = e(t);
  return n;
}
var b1 = "[object Arguments]";
function id(i) {
  return Bt(i) && en(i) == b1;
}
var vy = Object.prototype, v1 = vy.hasOwnProperty, S1 = vy.propertyIsEnumerable, _a = id(/* @__PURE__ */ function() {
  return arguments;
}()) ? id : function(i) {
  return Bt(i) && v1.call(i, "callee") && !S1.call(i, "callee");
};
function T1() {
  return !1;
}
var Sy = typeof exports == "object" && exports && !exports.nodeType && exports, nd = Sy && typeof module == "object" && module && !module.nodeType && module, x1 = nd && nd.exports === Sy, sd = x1 ? ri.Buffer : void 0, E1 = sd ? sd.isBuffer : void 0, or = E1 || T1, A1 = "[object Arguments]", w1 = "[object Array]", C1 = "[object Boolean]", k1 = "[object Date]", _1 = "[object Error]", O1 = "[object Function]", I1 = "[object Map]", R1 = "[object Number]", N1 = "[object Object]", M1 = "[object RegExp]", L1 = "[object Set]", P1 = "[object String]", D1 = "[object WeakMap]", $1 = "[object ArrayBuffer]", B1 = "[object DataView]", U1 = "[object Float32Array]", F1 = "[object Float64Array]", W1 = "[object Int8Array]", H1 = "[object Int16Array]", V1 = "[object Int32Array]", j1 = "[object Uint8Array]", z1 = "[object Uint8ClampedArray]", G1 = "[object Uint16Array]", K1 = "[object Uint32Array]", se = {};
se[U1] = se[F1] = se[W1] = se[H1] = se[V1] = se[j1] = se[z1] = se[G1] = se[K1] = !0;
se[A1] = se[w1] = se[$1] = se[C1] = se[B1] = se[k1] = se[_1] = se[O1] = se[I1] = se[R1] = se[N1] = se[M1] = se[L1] = se[P1] = se[D1] = !1;
function q1(i) {
  return Bt(i) && Pc(i.length) && !!se[en(i)];
}
function Oa(i) {
  return function(e) {
    return i(e);
  };
}
var Ty = typeof exports == "object" && exports && !exports.nodeType && exports, Fs = Ty && typeof module == "object" && module && !module.nodeType && module, Y1 = Fs && Fs.exports === Ty, Tl = Y1 && fy.process, Yi = function() {
  try {
    var i = Fs && Fs.require && Fs.require("util").types;
    return i || Tl && Tl.binding && Tl.binding("util");
  } catch {
  }
}(), rd = Yi && Yi.isTypedArray, Dc = rd ? Oa(rd) : q1, X1 = Object.prototype, J1 = X1.hasOwnProperty;
function xy(i, e) {
  var t = X(i), n = !t && _a(i), s = !t && !n && or(i), r = !t && !n && !s && Dc(i), o = t || n || s || r, a = o ? y1(i.length, String) : [], l = a.length;
  for (var h in i)
    (e || J1.call(i, h)) && !(o && // Safari 9 has enumerable `arguments.length` in strict mode.
    (h == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    s && (h == "offset" || h == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    r && (h == "buffer" || h == "byteLength" || h == "byteOffset") || // Skip index properties.
    Ca(h, l))) && a.push(h);
  return a;
}
function Ey(i, e) {
  return function(t) {
    return i(e(t));
  };
}
var Q1 = Ey(Object.keys, Object), Z1 = Object.prototype, ek = Z1.hasOwnProperty;
function Ay(i) {
  if (!xr(i))
    return Q1(i);
  var e = [];
  for (var t in Object(i))
    ek.call(i, t) && t != "constructor" && e.push(t);
  return e;
}
function kt(i) {
  return oi(i) ? xy(i) : Ay(i);
}
var tk = Object.prototype, ik = tk.hasOwnProperty, ft = m1(function(i, e) {
  if (xr(e) || oi(e)) {
    Mc(e, kt(e), i);
    return;
  }
  for (var t in e)
    ik.call(e, t) && ka(i, t, e[t]);
});
function nk(i) {
  var e = [];
  if (i != null)
    for (var t in Object(i))
      e.push(t);
  return e;
}
var sk = Object.prototype, rk = sk.hasOwnProperty;
function ok(i) {
  if (!Ct(i))
    return nk(i);
  var e = xr(i), t = [];
  for (var n in i)
    n == "constructor" && (e || !rk.call(i, n)) || t.push(n);
  return t;
}
function wy(i) {
  return oi(i) ? xy(i, !0) : ok(i);
}
var ak = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, lk = /^\w*$/;
function $c(i, e) {
  if (X(i))
    return !1;
  var t = typeof i;
  return t == "number" || t == "symbol" || t == "boolean" || i == null || Ea(i) ? !0 : lk.test(i) || !ak.test(i) || e != null && i in Object(e);
}
var ar = Rn(Object, "create");
function hk() {
  this.__data__ = ar ? ar(null) : {}, this.size = 0;
}
function ck(i) {
  var e = this.has(i) && delete this.__data__[i];
  return this.size -= e ? 1 : 0, e;
}
var uk = "__lodash_hash_undefined__", fk = Object.prototype, dk = fk.hasOwnProperty;
function pk(i) {
  var e = this.__data__;
  if (ar) {
    var t = e[i];
    return t === uk ? void 0 : t;
  }
  return dk.call(e, i) ? e[i] : void 0;
}
var mk = Object.prototype, gk = mk.hasOwnProperty;
function yk(i) {
  var e = this.__data__;
  return ar ? e[i] !== void 0 : gk.call(e, i);
}
var bk = "__lodash_hash_undefined__";
function vk(i, e) {
  var t = this.__data__;
  return this.size += this.has(i) ? 0 : 1, t[i] = ar && e === void 0 ? bk : e, this;
}
function En(i) {
  var e = -1, t = i == null ? 0 : i.length;
  for (this.clear(); ++e < t; ) {
    var n = i[e];
    this.set(n[0], n[1]);
  }
}
En.prototype.clear = hk;
En.prototype.delete = ck;
En.prototype.get = pk;
En.prototype.has = yk;
En.prototype.set = vk;
function Sk() {
  this.__data__ = [], this.size = 0;
}
function Ia(i, e) {
  for (var t = i.length; t--; )
    if (Tr(i[t][0], e))
      return t;
  return -1;
}
var Tk = Array.prototype, xk = Tk.splice;
function Ek(i) {
  var e = this.__data__, t = Ia(e, i);
  if (t < 0)
    return !1;
  var n = e.length - 1;
  return t == n ? e.pop() : xk.call(e, t, 1), --this.size, !0;
}
function Ak(i) {
  var e = this.__data__, t = Ia(e, i);
  return t < 0 ? void 0 : e[t][1];
}
function wk(i) {
  return Ia(this.__data__, i) > -1;
}
function Ck(i, e) {
  var t = this.__data__, n = Ia(t, i);
  return n < 0 ? (++this.size, t.push([i, e])) : t[n][1] = e, this;
}
function Oi(i) {
  var e = -1, t = i == null ? 0 : i.length;
  for (this.clear(); ++e < t; ) {
    var n = i[e];
    this.set(n[0], n[1]);
  }
}
Oi.prototype.clear = Sk;
Oi.prototype.delete = Ek;
Oi.prototype.get = Ak;
Oi.prototype.has = wk;
Oi.prototype.set = Ck;
var lr = Rn(ri, "Map");
function kk() {
  this.size = 0, this.__data__ = {
    hash: new En(),
    map: new (lr || Oi)(),
    string: new En()
  };
}
function _k(i) {
  var e = typeof i;
  return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? i !== "__proto__" : i === null;
}
function Ra(i, e) {
  var t = i.__data__;
  return _k(e) ? t[typeof e == "string" ? "string" : "hash"] : t.map;
}
function Ok(i) {
  var e = Ra(this, i).delete(i);
  return this.size -= e ? 1 : 0, e;
}
function Ik(i) {
  return Ra(this, i).get(i);
}
function Rk(i) {
  return Ra(this, i).has(i);
}
function Nk(i, e) {
  var t = Ra(this, i), n = t.size;
  return t.set(i, e), this.size += t.size == n ? 0 : 1, this;
}
function Ii(i) {
  var e = -1, t = i == null ? 0 : i.length;
  for (this.clear(); ++e < t; ) {
    var n = i[e];
    this.set(n[0], n[1]);
  }
}
Ii.prototype.clear = kk;
Ii.prototype.delete = Ok;
Ii.prototype.get = Ik;
Ii.prototype.has = Rk;
Ii.prototype.set = Nk;
var Mk = "Expected a function";
function Bc(i, e) {
  if (typeof i != "function" || e != null && typeof e != "function")
    throw new TypeError(Mk);
  var t = function() {
    var n = arguments, s = e ? e.apply(this, n) : n[0], r = t.cache;
    if (r.has(s))
      return r.get(s);
    var o = i.apply(this, n);
    return t.cache = r.set(s, o) || r, o;
  };
  return t.cache = new (Bc.Cache || Ii)(), t;
}
Bc.Cache = Ii;
var Lk = 500;
function Pk(i) {
  var e = Bc(i, function(n) {
    return t.size === Lk && t.clear(), n;
  }), t = e.cache;
  return e;
}
var Dk = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, $k = /\\(\\)?/g, Bk = Pk(function(i) {
  var e = [];
  return i.charCodeAt(0) === 46 && e.push(""), i.replace(Dk, function(t, n, s, r) {
    e.push(s ? r.replace($k, "$1") : n || t);
  }), e;
});
function Uk(i) {
  return i == null ? "" : py(i);
}
function Na(i, e) {
  return X(i) ? i : $c(i, e) ? [i] : Bk(Uk(i));
}
function Er(i) {
  if (typeof i == "string" || Ea(i))
    return i;
  var e = i + "";
  return e == "0" && 1 / i == -1 / 0 ? "-0" : e;
}
function Uc(i, e) {
  e = Na(e, i);
  for (var t = 0, n = e.length; i != null && t < n; )
    i = i[Er(e[t++])];
  return t && t == n ? i : void 0;
}
function Fk(i, e, t) {
  var n = i == null ? void 0 : Uc(i, e);
  return n === void 0 ? t : n;
}
function Fc(i, e) {
  for (var t = -1, n = e.length, s = i.length; ++t < n; )
    i[s + t] = e[t];
  return i;
}
var od = wt ? wt.isConcatSpreadable : void 0;
function Wk(i) {
  return X(i) || _a(i) || !!(od && i && i[od]);
}
function Wc(i, e, t, n, s) {
  var r = -1, o = i.length;
  for (t || (t = Wk), s || (s = []); ++r < o; ) {
    var a = i[r];
    t(a) ? Fc(s, a) : n || (s[s.length] = a);
  }
  return s;
}
function Pt(i) {
  var e = i == null ? 0 : i.length;
  return e ? Wc(i) : [];
}
var Cy = Ey(Object.getPrototypeOf, Object);
function ky(i, e, t) {
  var n = -1, s = i.length;
  e < 0 && (e = -e > s ? 0 : s + e), t = t > s ? s : t, t < 0 && (t += s), s = e > t ? 0 : t - e >>> 0, e >>>= 0;
  for (var r = Array(s); ++n < s; )
    r[n] = i[n + e];
  return r;
}
function Hk(i, e, t, n) {
  var s = -1, r = i == null ? 0 : i.length;
  for (n && r && (t = i[++s]); ++s < r; )
    t = e(t, i[s], s, i);
  return t;
}
function Vk() {
  this.__data__ = new Oi(), this.size = 0;
}
function jk(i) {
  var e = this.__data__, t = e.delete(i);
  return this.size = e.size, t;
}
function zk(i) {
  return this.__data__.get(i);
}
function Gk(i) {
  return this.__data__.has(i);
}
var Kk = 200;
function qk(i, e) {
  var t = this.__data__;
  if (t instanceof Oi) {
    var n = t.__data__;
    if (!lr || n.length < Kk - 1)
      return n.push([i, e]), this.size = ++t.size, this;
    t = this.__data__ = new Ii(n);
  }
  return t.set(i, e), this.size = t.size, this;
}
function ni(i) {
  var e = this.__data__ = new Oi(i);
  this.size = e.size;
}
ni.prototype.clear = Vk;
ni.prototype.delete = jk;
ni.prototype.get = zk;
ni.prototype.has = Gk;
ni.prototype.set = qk;
function Yk(i, e) {
  return i && Mc(e, kt(e), i);
}
var _y = typeof exports == "object" && exports && !exports.nodeType && exports, ad = _y && typeof module == "object" && module && !module.nodeType && module, Xk = ad && ad.exports === _y, ld = Xk ? ri.Buffer : void 0, hd = ld ? ld.allocUnsafe : void 0;
function Jk(i, e) {
  var t = i.length, n = hd ? hd(t) : new i.constructor(t);
  return i.copy(n), n;
}
function Hc(i, e) {
  for (var t = -1, n = i == null ? 0 : i.length, s = 0, r = []; ++t < n; ) {
    var o = i[t];
    e(o, t, i) && (r[s++] = o);
  }
  return r;
}
function Oy() {
  return [];
}
var Qk = Object.prototype, Zk = Qk.propertyIsEnumerable, cd = Object.getOwnPropertySymbols, Vc = cd ? function(i) {
  return i == null ? [] : (i = Object(i), Hc(cd(i), function(e) {
    return Zk.call(i, e);
  }));
} : Oy;
function e_(i, e) {
  return Mc(i, Vc(i), e);
}
var t_ = Object.getOwnPropertySymbols, i_ = t_ ? function(i) {
  for (var e = []; i; )
    Fc(e, Vc(i)), i = Cy(i);
  return e;
} : Oy;
function Iy(i, e, t) {
  var n = e(i);
  return X(i) ? n : Fc(n, t(i));
}
function Sh(i) {
  return Iy(i, kt, Vc);
}
function n_(i) {
  return Iy(i, wy, i_);
}
var Th = Rn(ri, "DataView"), xh = Rn(ri, "Promise"), Yn = Rn(ri, "Set"), ud = "[object Map]", s_ = "[object Object]", fd = "[object Promise]", dd = "[object Set]", pd = "[object WeakMap]", md = "[object DataView]", r_ = In(Th), o_ = In(lr), a_ = In(xh), l_ = In(Yn), h_ = In(vh), yt = en;
(Th && yt(new Th(new ArrayBuffer(1))) != md || lr && yt(new lr()) != ud || xh && yt(xh.resolve()) != fd || Yn && yt(new Yn()) != dd || vh && yt(new vh()) != pd) && (yt = function(i) {
  var e = en(i), t = e == s_ ? i.constructor : void 0, n = t ? In(t) : "";
  if (n)
    switch (n) {
      case r_:
        return md;
      case o_:
        return ud;
      case a_:
        return fd;
      case l_:
        return dd;
      case h_:
        return pd;
    }
  return e;
});
var c_ = Object.prototype, u_ = c_.hasOwnProperty;
function f_(i) {
  var e = i.length, t = new i.constructor(e);
  return e && typeof i[0] == "string" && u_.call(i, "index") && (t.index = i.index, t.input = i.input), t;
}
var Yo = ri.Uint8Array;
function d_(i) {
  var e = new i.constructor(i.byteLength);
  return new Yo(e).set(new Yo(i)), e;
}
function p_(i, e) {
  var t = i.buffer;
  return new i.constructor(t, i.byteOffset, i.byteLength);
}
var m_ = /\w*$/;
function g_(i) {
  var e = new i.constructor(i.source, m_.exec(i));
  return e.lastIndex = i.lastIndex, e;
}
var gd = wt ? wt.prototype : void 0, yd = gd ? gd.valueOf : void 0;
function y_(i) {
  return yd ? Object(yd.call(i)) : {};
}
function b_(i, e) {
  var t = i.buffer;
  return new i.constructor(t, i.byteOffset, i.length);
}
var v_ = "[object Boolean]", S_ = "[object Date]", T_ = "[object Map]", x_ = "[object Number]", E_ = "[object RegExp]", A_ = "[object Set]", w_ = "[object String]", C_ = "[object Symbol]", k_ = "[object ArrayBuffer]", __ = "[object DataView]", O_ = "[object Float32Array]", I_ = "[object Float64Array]", R_ = "[object Int8Array]", N_ = "[object Int16Array]", M_ = "[object Int32Array]", L_ = "[object Uint8Array]", P_ = "[object Uint8ClampedArray]", D_ = "[object Uint16Array]", $_ = "[object Uint32Array]";
function B_(i, e, t) {
  var n = i.constructor;
  switch (e) {
    case k_:
      return d_(i);
    case v_:
    case S_:
      return new n(+i);
    case __:
      return p_(i);
    case O_:
    case I_:
    case R_:
    case N_:
    case M_:
    case L_:
    case P_:
    case D_:
    case $_:
      return b_(i);
    case T_:
      return new n();
    case x_:
    case w_:
      return new n(i);
    case E_:
      return g_(i);
    case A_:
      return new n();
    case C_:
      return y_(i);
  }
}
function U_(i) {
  return typeof i.constructor == "function" && !xr(i) ? JC(Cy(i)) : {};
}
var F_ = "[object Map]";
function W_(i) {
  return Bt(i) && yt(i) == F_;
}
var bd = Yi && Yi.isMap, H_ = bd ? Oa(bd) : W_, V_ = "[object Set]";
function j_(i) {
  return Bt(i) && yt(i) == V_;
}
var vd = Yi && Yi.isSet, z_ = vd ? Oa(vd) : j_, Ry = "[object Arguments]", G_ = "[object Array]", K_ = "[object Boolean]", q_ = "[object Date]", Y_ = "[object Error]", Ny = "[object Function]", X_ = "[object GeneratorFunction]", J_ = "[object Map]", Q_ = "[object Number]", My = "[object Object]", Z_ = "[object RegExp]", eO = "[object Set]", tO = "[object String]", iO = "[object Symbol]", nO = "[object WeakMap]", sO = "[object ArrayBuffer]", rO = "[object DataView]", oO = "[object Float32Array]", aO = "[object Float64Array]", lO = "[object Int8Array]", hO = "[object Int16Array]", cO = "[object Int32Array]", uO = "[object Uint8Array]", fO = "[object Uint8ClampedArray]", dO = "[object Uint16Array]", pO = "[object Uint32Array]", ee = {};
ee[Ry] = ee[G_] = ee[sO] = ee[rO] = ee[K_] = ee[q_] = ee[oO] = ee[aO] = ee[lO] = ee[hO] = ee[cO] = ee[J_] = ee[Q_] = ee[My] = ee[Z_] = ee[eO] = ee[tO] = ee[iO] = ee[uO] = ee[fO] = ee[dO] = ee[pO] = !0;
ee[Y_] = ee[Ny] = ee[nO] = !1;
function po(i, e, t, n, s, r) {
  var o;
  if (o !== void 0)
    return o;
  if (!Ct(i))
    return i;
  var a = X(i);
  if (a)
    return o = f_(i), ZC(i, o);
  var l = yt(i), h = l == Ny || l == X_;
  if (or(i))
    return Jk(i);
  if (l == My || l == Ry || h && !s)
    return o = h ? {} : U_(i), e_(i, Yk(o, i));
  if (!ee[l])
    return s ? i : {};
  o = B_(i, l), r || (r = new ni());
  var c = r.get(i);
  if (c)
    return c;
  r.set(i, o), z_(i) ? i.forEach(function(d) {
    o.add(po(d, e, t, d, i, r));
  }) : H_(i) && i.forEach(function(d, p) {
    o.set(p, po(d, e, t, p, i, r));
  });
  var u = Sh, f = a ? void 0 : u(i);
  return my(f || i, function(d, p) {
    f && (p = d, d = i[p]), ka(o, p, po(d, e, t, p, i, r));
  }), o;
}
var mO = 4;
function De(i) {
  return po(i, mO);
}
function Ar(i) {
  for (var e = -1, t = i == null ? 0 : i.length, n = 0, s = []; ++e < t; ) {
    var r = i[e];
    r && (s[n++] = r);
  }
  return s;
}
var gO = "__lodash_hash_undefined__";
function yO(i) {
  return this.__data__.set(i, gO), this;
}
function bO(i) {
  return this.__data__.has(i);
}
function hs(i) {
  var e = -1, t = i == null ? 0 : i.length;
  for (this.__data__ = new Ii(); ++e < t; )
    this.add(i[e]);
}
hs.prototype.add = hs.prototype.push = yO;
hs.prototype.has = bO;
function Ly(i, e) {
  for (var t = -1, n = i == null ? 0 : i.length; ++t < n; )
    if (e(i[t], t, i))
      return !0;
  return !1;
}
function jc(i, e) {
  return i.has(e);
}
var vO = 1, SO = 2;
function Py(i, e, t, n, s, r) {
  var o = t & vO, a = i.length, l = e.length;
  if (a != l && !(o && l > a))
    return !1;
  var h = r.get(i), c = r.get(e);
  if (h && c)
    return h == e && c == i;
  var u = -1, f = !0, d = t & SO ? new hs() : void 0;
  for (r.set(i, e), r.set(e, i); ++u < a; ) {
    var p = i[u], m = e[u];
    if (n)
      var g = o ? n(m, p, u, e, i, r) : n(p, m, u, i, e, r);
    if (g !== void 0) {
      if (g)
        continue;
      f = !1;
      break;
    }
    if (d) {
      if (!Ly(e, function(y, b) {
        if (!jc(d, b) && (p === y || s(p, y, t, n, r)))
          return d.push(b);
      })) {
        f = !1;
        break;
      }
    } else if (!(p === m || s(p, m, t, n, r))) {
      f = !1;
      break;
    }
  }
  return r.delete(i), r.delete(e), f;
}
function TO(i) {
  var e = -1, t = Array(i.size);
  return i.forEach(function(n, s) {
    t[++e] = [s, n];
  }), t;
}
function zc(i) {
  var e = -1, t = Array(i.size);
  return i.forEach(function(n) {
    t[++e] = n;
  }), t;
}
var xO = 1, EO = 2, AO = "[object Boolean]", wO = "[object Date]", CO = "[object Error]", kO = "[object Map]", _O = "[object Number]", OO = "[object RegExp]", IO = "[object Set]", RO = "[object String]", NO = "[object Symbol]", MO = "[object ArrayBuffer]", LO = "[object DataView]", Sd = wt ? wt.prototype : void 0, xl = Sd ? Sd.valueOf : void 0;
function PO(i, e, t, n, s, r, o) {
  switch (t) {
    case LO:
      if (i.byteLength != e.byteLength || i.byteOffset != e.byteOffset)
        return !1;
      i = i.buffer, e = e.buffer;
    case MO:
      return !(i.byteLength != e.byteLength || !r(new Yo(i), new Yo(e)));
    case AO:
    case wO:
    case _O:
      return Tr(+i, +e);
    case CO:
      return i.name == e.name && i.message == e.message;
    case OO:
    case RO:
      return i == e + "";
    case kO:
      var a = TO;
    case IO:
      var l = n & xO;
      if (a || (a = zc), i.size != e.size && !l)
        return !1;
      var h = o.get(i);
      if (h)
        return h == e;
      n |= EO, o.set(i, e);
      var c = Py(a(i), a(e), n, s, r, o);
      return o.delete(i), c;
    case NO:
      if (xl)
        return xl.call(i) == xl.call(e);
  }
  return !1;
}
var DO = 1, $O = Object.prototype, BO = $O.hasOwnProperty;
function UO(i, e, t, n, s, r) {
  var o = t & DO, a = Sh(i), l = a.length, h = Sh(e), c = h.length;
  if (l != c && !o)
    return !1;
  for (var u = l; u--; ) {
    var f = a[u];
    if (!(o ? f in e : BO.call(e, f)))
      return !1;
  }
  var d = r.get(i), p = r.get(e);
  if (d && p)
    return d == e && p == i;
  var m = !0;
  r.set(i, e), r.set(e, i);
  for (var g = o; ++u < l; ) {
    f = a[u];
    var y = i[f], b = e[f];
    if (n)
      var v = o ? n(b, y, f, e, i, r) : n(y, b, f, i, e, r);
    if (!(v === void 0 ? y === b || s(y, b, t, n, r) : v)) {
      m = !1;
      break;
    }
    g || (g = f == "constructor");
  }
  if (m && !g) {
    var T = i.constructor, S = e.constructor;
    T != S && "constructor" in i && "constructor" in e && !(typeof T == "function" && T instanceof T && typeof S == "function" && S instanceof S) && (m = !1);
  }
  return r.delete(i), r.delete(e), m;
}
var FO = 1, Td = "[object Arguments]", xd = "[object Array]", Xr = "[object Object]", WO = Object.prototype, Ed = WO.hasOwnProperty;
function HO(i, e, t, n, s, r) {
  var o = X(i), a = X(e), l = o ? xd : yt(i), h = a ? xd : yt(e);
  l = l == Td ? Xr : l, h = h == Td ? Xr : h;
  var c = l == Xr, u = h == Xr, f = l == h;
  if (f && or(i)) {
    if (!or(e))
      return !1;
    o = !0, c = !1;
  }
  if (f && !c)
    return r || (r = new ni()), o || Dc(i) ? Py(i, e, t, n, s, r) : PO(i, e, l, t, n, s, r);
  if (!(t & FO)) {
    var d = c && Ed.call(i, "__wrapped__"), p = u && Ed.call(e, "__wrapped__");
    if (d || p) {
      var m = d ? i.value() : i, g = p ? e.value() : e;
      return r || (r = new ni()), s(m, g, t, n, r);
    }
  }
  return f ? (r || (r = new ni()), UO(i, e, t, n, s, r)) : !1;
}
function Gc(i, e, t, n, s) {
  return i === e ? !0 : i == null || e == null || !Bt(i) && !Bt(e) ? i !== i && e !== e : HO(i, e, t, n, Gc, s);
}
var VO = 1, jO = 2;
function zO(i, e, t, n) {
  var s = t.length, r = s;
  if (i == null)
    return !r;
  for (i = Object(i); s--; ) {
    var o = t[s];
    if (o[2] ? o[1] !== i[o[0]] : !(o[0] in i))
      return !1;
  }
  for (; ++s < r; ) {
    o = t[s];
    var a = o[0], l = i[a], h = o[1];
    if (o[2]) {
      if (l === void 0 && !(a in i))
        return !1;
    } else {
      var c = new ni(), u;
      if (!(u === void 0 ? Gc(h, l, VO | jO, n, c) : u))
        return !1;
    }
  }
  return !0;
}
function Dy(i) {
  return i === i && !Ct(i);
}
function GO(i) {
  for (var e = kt(i), t = e.length; t--; ) {
    var n = e[t], s = i[n];
    e[t] = [n, s, Dy(s)];
  }
  return e;
}
function $y(i, e) {
  return function(t) {
    return t == null ? !1 : t[i] === e && (e !== void 0 || i in Object(t));
  };
}
function KO(i) {
  var e = GO(i);
  return e.length == 1 && e[0][2] ? $y(e[0][0], e[0][1]) : function(t) {
    return t === i || zO(t, i, e);
  };
}
function qO(i, e) {
  return i != null && e in Object(i);
}
function By(i, e, t) {
  e = Na(e, i);
  for (var n = -1, s = e.length, r = !1; ++n < s; ) {
    var o = Er(e[n]);
    if (!(r = i != null && t(i, o)))
      break;
    i = i[o];
  }
  return r || ++n != s ? r : (s = i == null ? 0 : i.length, !!s && Pc(s) && Ca(o, s) && (X(i) || _a(i)));
}
function YO(i, e) {
  return i != null && By(i, e, qO);
}
var XO = 1, JO = 2;
function QO(i, e) {
  return $c(i) && Dy(e) ? $y(Er(i), e) : function(t) {
    var n = Fk(t, i);
    return n === void 0 && n === e ? YO(t, i) : Gc(e, n, XO | JO);
  };
}
function ZO(i) {
  return function(e) {
    return e == null ? void 0 : e[i];
  };
}
function eI(i) {
  return function(e) {
    return Uc(e, i);
  };
}
function tI(i) {
  return $c(i) ? ZO(Er(i)) : eI(i);
}
function ai(i) {
  return typeof i == "function" ? i : i == null ? ls : typeof i == "object" ? X(i) ? QO(i[0], i[1]) : KO(i) : tI(i);
}
function iI(i, e, t, n) {
  for (var s = -1, r = i == null ? 0 : i.length; ++s < r; ) {
    var o = i[s];
    e(n, o, t(o), i);
  }
  return n;
}
function nI(i) {
  return function(e, t, n) {
    for (var s = -1, r = Object(e), o = n(e), a = o.length; a--; ) {
      var l = o[++s];
      if (t(r[l], l, r) === !1)
        break;
    }
    return e;
  };
}
var sI = nI();
function rI(i, e) {
  return i && sI(i, e, kt);
}
function oI(i, e) {
  return function(t, n) {
    if (t == null)
      return t;
    if (!oi(t))
      return i(t, n);
    for (var s = t.length, r = -1, o = Object(t); ++r < s && n(o[r], r, o) !== !1; )
      ;
    return t;
  };
}
var Nn = oI(rI);
function aI(i, e, t, n) {
  return Nn(i, function(s, r, o) {
    e(n, s, t(s), o);
  }), n;
}
function lI(i, e) {
  return function(t, n) {
    var s = X(t) ? iI : aI, r = e ? e() : {};
    return s(t, i, ai(n), r);
  };
}
var Uy = Object.prototype, hI = Uy.hasOwnProperty, Kc = Lc(function(i, e) {
  i = Object(i);
  var t = -1, n = e.length, s = n > 2 ? e[2] : void 0;
  for (s && by(e[0], e[1], s) && (n = 1); ++t < n; )
    for (var r = e[t], o = wy(r), a = -1, l = o.length; ++a < l; ) {
      var h = o[a], c = i[h];
      (c === void 0 || Tr(c, Uy[h]) && !hI.call(i, h)) && (i[h] = r[h]);
    }
  return i;
});
function Ad(i) {
  return Bt(i) && oi(i);
}
var cI = 200;
function uI(i, e, t, n) {
  var s = -1, r = yy, o = !0, a = i.length, l = [], h = e.length;
  if (!a)
    return l;
  e.length >= cI && (r = jc, o = !1, e = new hs(e));
  e:
    for (; ++s < a; ) {
      var c = i[s], u = c;
      if (c = c !== 0 ? c : 0, o && u === u) {
        for (var f = h; f--; )
          if (e[f] === u)
            continue e;
        l.push(c);
      } else r(e, u, n) || l.push(c);
    }
  return l;
}
var Ma = Lc(function(i, e) {
  return Ad(i) ? uI(i, Wc(e, 1, Ad, !0)) : [];
});
function An(i) {
  var e = i == null ? 0 : i.length;
  return e ? i[e - 1] : void 0;
}
function Ie(i, e, t) {
  var n = i == null ? 0 : i.length;
  return n ? (e = e === void 0 ? 1 : wa(e), ky(i, e < 0 ? 0 : e, n)) : [];
}
function hr(i, e, t) {
  var n = i == null ? 0 : i.length;
  return n ? (e = e === void 0 ? 1 : wa(e), e = n - e, ky(i, 0, e < 0 ? 0 : e)) : [];
}
function fI(i) {
  return typeof i == "function" ? i : ls;
}
function P(i, e) {
  var t = X(i) ? my : Nn;
  return t(i, fI(e));
}
function dI(i, e) {
  for (var t = -1, n = i == null ? 0 : i.length; ++t < n; )
    if (!e(i[t], t, i))
      return !1;
  return !0;
}
function pI(i, e) {
  var t = !0;
  return Nn(i, function(n, s, r) {
    return t = !!e(n, s, r), t;
  }), t;
}
function Dt(i, e, t) {
  var n = X(i) ? dI : pI;
  return n(i, ai(e));
}
function Fy(i, e) {
  var t = [];
  return Nn(i, function(n, s, r) {
    e(n, s, r) && t.push(n);
  }), t;
}
function Ot(i, e) {
  var t = X(i) ? Hc : Fy;
  return t(i, ai(e));
}
function mI(i) {
  return function(e, t, n) {
    var s = Object(e);
    if (!oi(e)) {
      var r = ai(t);
      e = kt(e), t = function(a) {
        return r(s[a], a, s);
      };
    }
    var o = i(e, t, n);
    return o > -1 ? s[r ? e[o] : o] : void 0;
  };
}
var gI = Math.max;
function yI(i, e, t) {
  var n = i == null ? 0 : i.length;
  if (!n)
    return -1;
  var s = t == null ? 0 : wa(t);
  return s < 0 && (s = gI(n + s, 0)), gy(i, ai(e), s);
}
var cs = mI(yI);
function Ut(i) {
  return i && i.length ? i[0] : void 0;
}
function bI(i, e) {
  var t = -1, n = oi(i) ? Array(i.length) : [];
  return Nn(i, function(s, r, o) {
    n[++t] = e(s, r, o);
  }), n;
}
function I(i, e) {
  var t = X(i) ? Aa : bI;
  return t(i, ai(e));
}
function Et(i, e) {
  return Wc(I(i, e));
}
var vI = Object.prototype, SI = vI.hasOwnProperty, TI = lI(function(i, e, t) {
  SI.call(i, t) ? i[t].push(e) : Nc(i, t, [e]);
}), xI = Object.prototype, EI = xI.hasOwnProperty;
function AI(i, e) {
  return i != null && EI.call(i, e);
}
function L(i, e) {
  return i != null && By(i, e, AI);
}
var wI = "[object String]";
function nt(i) {
  return typeof i == "string" || !X(i) && Bt(i) && en(i) == wI;
}
function CI(i, e) {
  return Aa(e, function(t) {
    return i[t];
  });
}
function Te(i) {
  return i == null ? [] : CI(i, kt(i));
}
var kI = Math.max;
function qe(i, e, t, n) {
  i = oi(i) ? i : Te(i), t = t ? wa(t) : 0;
  var s = i.length;
  return t < 0 && (t = kI(s + t, 0)), nt(i) ? t <= s && i.indexOf(e, t) > -1 : !!s && Rc(i, e, t) > -1;
}
function wd(i, e, t) {
  var n = i == null ? 0 : i.length;
  if (!n)
    return -1;
  var s = 0;
  return Rc(i, e, s);
}
var _I = "[object Map]", OI = "[object Set]", II = Object.prototype, RI = II.hasOwnProperty;
function ne(i) {
  if (i == null)
    return !0;
  if (oi(i) && (X(i) || typeof i == "string" || typeof i.splice == "function" || or(i) || Dc(i) || _a(i)))
    return !i.length;
  var e = yt(i);
  if (e == _I || e == OI)
    return !i.size;
  if (xr(i))
    return !Ay(i).length;
  for (var t in i)
    if (RI.call(i, t))
      return !1;
  return !0;
}
var NI = "[object RegExp]";
function MI(i) {
  return Bt(i) && en(i) == NI;
}
var Cd = Yi && Yi.isRegExp, xi = Cd ? Oa(Cd) : MI;
function Ei(i) {
  return i === void 0;
}
var LI = "Expected a function";
function PI(i) {
  if (typeof i != "function")
    throw new TypeError(LI);
  return function() {
    var e = arguments;
    switch (e.length) {
      case 0:
        return !i.call(this);
      case 1:
        return !i.call(this, e[0]);
      case 2:
        return !i.call(this, e[0], e[1]);
      case 3:
        return !i.call(this, e[0], e[1], e[2]);
    }
    return !i.apply(this, e);
  };
}
function DI(i, e, t, n) {
  if (!Ct(i))
    return i;
  e = Na(e, i);
  for (var s = -1, r = e.length, o = r - 1, a = i; a != null && ++s < r; ) {
    var l = Er(e[s]), h = t;
    if (l === "__proto__" || l === "constructor" || l === "prototype")
      return i;
    if (s != o) {
      var c = a[l];
      h = void 0, h === void 0 && (h = Ct(c) ? c : Ca(e[s + 1]) ? [] : {});
    }
    ka(a, l, h), a = a[l];
  }
  return i;
}
function $I(i, e, t) {
  for (var n = -1, s = e.length, r = {}; ++n < s; ) {
    var o = e[n], a = Uc(i, o);
    t(a, o) && DI(r, Na(o, i), a);
  }
  return r;
}
function Ht(i, e) {
  if (i == null)
    return {};
  var t = Aa(n_(i), function(n) {
    return [n];
  });
  return e = ai(e), $I(i, t, function(n, s) {
    return e(n, s[0]);
  });
}
function BI(i, e, t, n, s) {
  return s(i, function(r, o, a) {
    t = n ? (n = !1, r) : e(t, r, o, a);
  }), t;
}
function dt(i, e, t) {
  var n = X(i) ? Hk : BI, s = arguments.length < 3;
  return n(i, ai(e), t, s, Nn);
}
function La(i, e) {
  var t = X(i) ? Hc : Fy;
  return t(i, PI(ai(e)));
}
function UI(i, e) {
  var t;
  return Nn(i, function(n, s, r) {
    return t = e(n, s, r), !t;
  }), !!t;
}
function Wy(i, e, t) {
  var n = X(i) ? Ly : UI;
  return n(i, ai(e));
}
var FI = 1 / 0, WI = Yn && 1 / zc(new Yn([, -0]))[1] == FI ? function(i) {
  return new Yn(i);
} : Se, HI = 200;
function VI(i, e, t) {
  var n = -1, s = yy, r = i.length, o = !0, a = [], l = a;
  if (r >= HI) {
    var h = WI(i);
    if (h)
      return zc(h);
    o = !1, s = jc, l = new hs();
  } else
    l = a;
  e:
    for (; ++n < r; ) {
      var c = i[n], u = c;
      if (c = c !== 0 ? c : 0, o && u === u) {
        for (var f = l.length; f--; )
          if (l[f] === u)
            continue e;
        a.push(c);
      } else s(l, u, t) || (l !== a && l.push(u), a.push(c));
    }
  return a;
}
function qc(i) {
  return i && i.length ? VI(i) : [];
}
function Eh(i) {
  console && console.error && console.error(`Error: ${i}`);
}
function Hy(i) {
  console && console.warn && console.warn(`Warning: ${i}`);
}
function Vy(i) {
  const e = (/* @__PURE__ */ new Date()).getTime(), t = i();
  return { time: (/* @__PURE__ */ new Date()).getTime() - e, value: t };
}
function jy(i) {
  function e() {
  }
  e.prototype = i;
  const t = new e();
  function n() {
    return typeof t.bar;
  }
  return n(), n(), i;
}
function jI(i) {
  return zI(i) ? i.LABEL : i.name;
}
function zI(i) {
  return nt(i.LABEL) && i.LABEL !== "";
}
class li {
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
    e.visit(this), P(this.definition, (t) => {
      t.accept(e);
    });
  }
}
class pt extends li {
  constructor(e) {
    super([]), this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
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
class ds extends li {
  constructor(e) {
    super(e.definition), this.orgText = "", ft(this, Ht(e, (t) => t !== void 0));
  }
}
class st extends li {
  constructor(e) {
    super(e.definition), this.ignoreAmbiguities = !1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class tt extends li {
  constructor(e) {
    super(e.definition), this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class hi extends li {
  constructor(e) {
    super(e.definition), this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class ci extends li {
  constructor(e) {
    super(e.definition), this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class Ee extends li {
  constructor(e) {
    super(e.definition), this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class Vt extends li {
  constructor(e) {
    super(e.definition), this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class jt extends li {
  get definition() {
    return this._definition;
  }
  set definition(e) {
    this._definition = e;
  }
  constructor(e) {
    super(e.definition), this.idx = 1, this.ignoreAmbiguities = !1, this.hasPredicates = !1, ft(this, Ht(e, (t) => t !== void 0));
  }
}
class he {
  constructor(e) {
    this.idx = 1, ft(this, Ht(e, (t) => t !== void 0));
  }
  accept(e) {
    e.visit(this);
  }
}
function GI(i) {
  return I(i, mo);
}
function mo(i) {
  function e(t) {
    return I(t, mo);
  }
  if (i instanceof pt) {
    const t = {
      type: "NonTerminal",
      name: i.nonTerminalName,
      idx: i.idx
    };
    return nt(i.label) && (t.label = i.label), t;
  } else {
    if (i instanceof st)
      return {
        type: "Alternative",
        definition: e(i.definition)
      };
    if (i instanceof tt)
      return {
        type: "Option",
        idx: i.idx,
        definition: e(i.definition)
      };
    if (i instanceof hi)
      return {
        type: "RepetitionMandatory",
        idx: i.idx,
        definition: e(i.definition)
      };
    if (i instanceof ci)
      return {
        type: "RepetitionMandatoryWithSeparator",
        idx: i.idx,
        separator: mo(new he({ terminalType: i.separator })),
        definition: e(i.definition)
      };
    if (i instanceof Vt)
      return {
        type: "RepetitionWithSeparator",
        idx: i.idx,
        separator: mo(new he({ terminalType: i.separator })),
        definition: e(i.definition)
      };
    if (i instanceof Ee)
      return {
        type: "Repetition",
        idx: i.idx,
        definition: e(i.definition)
      };
    if (i instanceof jt)
      return {
        type: "Alternation",
        idx: i.idx,
        definition: e(i.definition)
      };
    if (i instanceof he) {
      const t = {
        type: "Terminal",
        name: i.terminalType.name,
        label: jI(i.terminalType),
        idx: i.idx
      };
      nt(i.label) && (t.terminalLabel = i.label);
      const n = i.terminalType.PATTERN;
      return i.terminalType.PATTERN && (t.pattern = xi(n) ? n.source : n), t;
    } else {
      if (i instanceof ds)
        return {
          type: "Rule",
          name: i.name,
          orgText: i.orgText,
          definition: e(i.definition)
        };
      throw Error("non exhaustive match");
    }
  }
}
class ps {
  visit(e) {
    const t = e;
    switch (t.constructor) {
      case pt:
        return this.visitNonTerminal(t);
      case st:
        return this.visitAlternative(t);
      case tt:
        return this.visitOption(t);
      case hi:
        return this.visitRepetitionMandatory(t);
      case ci:
        return this.visitRepetitionMandatoryWithSeparator(t);
      case Vt:
        return this.visitRepetitionWithSeparator(t);
      case Ee:
        return this.visitRepetition(t);
      case jt:
        return this.visitAlternation(t);
      case he:
        return this.visitTerminal(t);
      case ds:
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
function KI(i) {
  return i instanceof st || i instanceof tt || i instanceof Ee || i instanceof hi || i instanceof ci || i instanceof Vt || i instanceof he || i instanceof ds;
}
function Xo(i, e = []) {
  return i instanceof tt || i instanceof Ee || i instanceof Vt ? !0 : i instanceof jt ? Wy(i.definition, (n) => Xo(n, e)) : i instanceof pt && qe(e, i) ? !1 : i instanceof li ? (i instanceof pt && e.push(i), Dt(i.definition, (n) => Xo(n, e))) : !1;
}
function qI(i) {
  return i instanceof jt;
}
function Xt(i) {
  if (i instanceof pt)
    return "SUBRULE";
  if (i instanceof tt)
    return "OPTION";
  if (i instanceof jt)
    return "OR";
  if (i instanceof hi)
    return "AT_LEAST_ONE";
  if (i instanceof ci)
    return "AT_LEAST_ONE_SEP";
  if (i instanceof Vt)
    return "MANY_SEP";
  if (i instanceof Ee)
    return "MANY";
  if (i instanceof he)
    return "CONSUME";
  throw Error("non exhaustive match");
}
class Pa {
  walk(e, t = []) {
    P(e.definition, (n, s) => {
      const r = Ie(e.definition, s + 1);
      if (n instanceof pt)
        this.walkProdRef(n, r, t);
      else if (n instanceof he)
        this.walkTerminal(n, r, t);
      else if (n instanceof st)
        this.walkFlat(n, r, t);
      else if (n instanceof tt)
        this.walkOption(n, r, t);
      else if (n instanceof hi)
        this.walkAtLeastOne(n, r, t);
      else if (n instanceof ci)
        this.walkAtLeastOneSep(n, r, t);
      else if (n instanceof Vt)
        this.walkManySep(n, r, t);
      else if (n instanceof Ee)
        this.walkMany(n, r, t);
      else if (n instanceof jt)
        this.walkOr(n, r, t);
      else
        throw Error("non exhaustive match");
    });
  }
  walkTerminal(e, t, n) {
  }
  walkProdRef(e, t, n) {
  }
  walkFlat(e, t, n) {
    const s = t.concat(n);
    this.walk(e, s);
  }
  walkOption(e, t, n) {
    const s = t.concat(n);
    this.walk(e, s);
  }
  walkAtLeastOne(e, t, n) {
    const s = [
      new tt({ definition: e.definition })
    ].concat(t, n);
    this.walk(e, s);
  }
  walkAtLeastOneSep(e, t, n) {
    const s = kd(e, t, n);
    this.walk(e, s);
  }
  walkMany(e, t, n) {
    const s = [
      new tt({ definition: e.definition })
    ].concat(t, n);
    this.walk(e, s);
  }
  walkManySep(e, t, n) {
    const s = kd(e, t, n);
    this.walk(e, s);
  }
  walkOr(e, t, n) {
    const s = t.concat(n);
    P(e.definition, (r) => {
      const o = new st({ definition: [r] });
      this.walk(o, s);
    });
  }
}
function kd(i, e, t) {
  return [
    new tt({
      definition: [
        new he({ terminalType: i.separator })
      ].concat(i.definition)
    })
  ].concat(e, t);
}
function wr(i) {
  if (i instanceof pt)
    return wr(i.referencedRule);
  if (i instanceof he)
    return JI(i);
  if (KI(i))
    return YI(i);
  if (qI(i))
    return XI(i);
  throw Error("non exhaustive match");
}
function YI(i) {
  let e = [];
  const t = i.definition;
  let n = 0, s = t.length > n, r, o = !0;
  for (; s && o; )
    r = t[n], o = Xo(r), e = e.concat(wr(r)), n = n + 1, s = t.length > n;
  return qc(e);
}
function XI(i) {
  const e = I(i.definition, (t) => wr(t));
  return qc(Pt(e));
}
function JI(i) {
  return [i.terminalType];
}
const zy = "_~IN~_";
class QI extends Pa {
  constructor(e) {
    super(), this.topProd = e, this.follows = {};
  }
  startWalking() {
    return this.walk(this.topProd), this.follows;
  }
  walkTerminal(e, t, n) {
  }
  walkProdRef(e, t, n) {
    const s = eR(e.referencedRule, e.idx) + this.topProd.name, r = t.concat(n), o = new st({ definition: r }), a = wr(o);
    this.follows[s] = a;
  }
}
function ZI(i) {
  const e = {};
  return P(i, (t) => {
    const n = new QI(t).startWalking();
    ft(e, n);
  }), e;
}
function eR(i, e) {
  return i.name + e + zy;
}
function $(i) {
  return i.charCodeAt(0);
}
function El(i, e) {
  Array.isArray(i) ? i.forEach(function(t) {
    e.push(t);
  }) : e.push(i);
}
function xs(i, e) {
  if (i[e] === !0)
    throw "duplicate flag " + e;
  i[e], i[e] = !0;
}
function Ln(i) {
  if (i === void 0)
    throw Error("Internal Error - Should never get here!");
  return !0;
}
function tR() {
  throw Error("Internal Error - Should never get here!");
}
function _d(i) {
  return i.type === "Character";
}
const Jo = [];
for (let i = $("0"); i <= $("9"); i++)
  Jo.push(i);
const Qo = [$("_")].concat(Jo);
for (let i = $("a"); i <= $("z"); i++)
  Qo.push(i);
for (let i = $("A"); i <= $("Z"); i++)
  Qo.push(i);
const Od = [
  $(" "),
  $("\f"),
  $(`
`),
  $("\r"),
  $("	"),
  $("\v"),
  $("	"),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $(" "),
  $("\u2028"),
  $("\u2029"),
  $(" "),
  $(" "),
  $("　"),
  $("\uFEFF")
], iR = /[0-9a-fA-F]/, Jr = /[0-9]/, nR = /[1-9]/;
class sR {
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
    const n = {
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
          xs(n, "global");
          break;
        case "i":
          xs(n, "ignoreCase");
          break;
        case "m":
          xs(n, "multiLine");
          break;
        case "u":
          xs(n, "unicode");
          break;
        case "y":
          xs(n, "sticky");
          break;
      }
    if (this.idx !== this.input.length)
      throw Error("Redundant input: " + this.input.substring(this.idx));
    return {
      type: "Pattern",
      flags: n,
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
        Ln(t);
        const n = this.disjunction();
        return this.consumeChar(")"), {
          type: t,
          value: n,
          loc: this.loc(e)
        };
    }
    return tR();
  }
  quantifier(e = !1) {
    let t;
    const n = this.idx;
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
        const s = this.integerIncludingZero();
        switch (this.popChar()) {
          case "}":
            t = {
              atLeast: s,
              atMost: s
            };
            break;
          case ",":
            let r;
            this.isDigit() ? (r = this.integerIncludingZero(), t = {
              atLeast: s,
              atMost: r
            }) : t = {
              atLeast: s,
              atMost: 1 / 0
            }, this.consumeChar("}");
            break;
        }
        if (e === !0 && t === void 0)
          return;
        Ln(t);
        break;
    }
    if (!(e === !0 && t === void 0) && Ln(t))
      return this.peekChar(0) === "?" ? (this.consumeChar("?"), t.greedy = !1) : t.greedy = !0, t.type = "Quantifier", t.loc = this.loc(n), t;
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
    if (e === void 0 && this.isPatternCharacter() && (e = this.patternCharacter()), Ln(e))
      return e.loc = this.loc(t), this.isQuantifier() && (e.quantifier = this.quantifier()), e;
  }
  dotAll() {
    return this.consumeChar("."), {
      type: "Set",
      complement: !0,
      value: [$(`
`), $("\r"), $("\u2028"), $("\u2029")]
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
        e = Jo;
        break;
      case "D":
        e = Jo, t = !0;
        break;
      case "s":
        e = Od;
        break;
      case "S":
        e = Od, t = !0;
        break;
      case "w":
        e = Qo;
        break;
      case "W":
        e = Qo, t = !0;
        break;
    }
    if (Ln(e))
      return { type: "Set", value: e, complement: t };
  }
  controlEscapeAtom() {
    let e;
    switch (this.popChar()) {
      case "f":
        e = $("\f");
        break;
      case "n":
        e = $(`
`);
        break;
      case "r":
        e = $("\r");
        break;
      case "t":
        e = $("	");
        break;
      case "v":
        e = $("\v");
        break;
    }
    if (Ln(e))
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
    return this.consumeChar("0"), { type: "Character", value: $("\0") };
  }
  hexEscapeSequenceAtom() {
    return this.consumeChar("x"), this.parseHexDigits(2);
  }
  regExpUnicodeEscapeSequenceAtom() {
    return this.consumeChar("u"), this.parseHexDigits(4);
  }
  identityEscapeAtom() {
    const e = this.popChar();
    return { type: "Character", value: $(e) };
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
        return { type: "Character", value: $(e) };
    }
  }
  characterClass() {
    const e = [];
    let t = !1;
    for (this.consumeChar("["), this.peekChar(0) === "^" && (this.consumeChar("^"), t = !0); this.isClassAtom(); ) {
      const n = this.classAtom();
      if (n.type, _d(n) && this.isRangeDash()) {
        this.consumeChar("-");
        const s = this.classAtom();
        if (s.type, _d(s)) {
          if (s.value < n.value)
            throw Error("Range out of order in character class");
          e.push({ from: n.value, to: s.value });
        } else
          El(n.value, e), e.push($("-")), El(s.value, e);
      } else
        El(n.value, e);
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
        return this.consumeChar("b"), { type: "Character", value: $("\b") };
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
    const n = {
      type: "Group",
      capturing: e,
      value: t
    };
    return e && (n.idx = this.groupIdx), n;
  }
  positiveInteger() {
    let e = this.popChar();
    if (nR.test(e) === !1)
      throw Error("Expecting a positive integer");
    for (; Jr.test(this.peekChar(0)); )
      e += this.popChar();
    return parseInt(e, 10);
  }
  integerIncludingZero() {
    let e = this.popChar();
    if (Jr.test(e) === !1)
      throw Error("Expecting an integer");
    for (; Jr.test(this.peekChar(0)); )
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
        return { type: "Character", value: $(e) };
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
    return Jr.test(this.peekChar(0));
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
    for (let s = 0; s < e; s++) {
      const r = this.popChar();
      if (iR.test(r) === !1)
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
class Yc {
  visitChildren(e) {
    for (const t in e) {
      const n = e[t];
      e.hasOwnProperty(t) && (n.type !== void 0 ? this.visit(n) : Array.isArray(n) && n.forEach((s) => {
        this.visit(s);
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
let go = {};
const rR = new sR();
function Da(i) {
  const e = i.toString();
  if (go.hasOwnProperty(e))
    return go[e];
  {
    const t = rR.pattern(e);
    return go[e] = t, t;
  }
}
function oR() {
  go = {};
}
const Gy = "Complement Sets are not supported for first char optimization", Zo = `Unable to use "first char" lexer optimizations:
`;
function aR(i, e = !1) {
  try {
    const t = Da(i);
    return Ah(t.value, {}, t.flags.ignoreCase);
  } catch (t) {
    if (t.message === Gy)
      e && Hy(`${Zo}	Unable to optimize: < ${i.toString()} >
	Complement Sets cannot be automatically optimized.
	This will disable the lexer's first char optimizations.
	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#COMPLEMENT for details.`);
    else {
      let n = "";
      e && (n = `
	This will disable the lexer's first char optimizations.
	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#REGEXP_PARSING for details.`), Eh(`${Zo}
	Failed parsing: < ${i.toString()} >
	Using the @chevrotain/regexp-to-ast library
	Please open an issue at: https://github.com/chevrotain/chevrotain/issues` + n);
    }
  }
  return [];
}
function Ah(i, e, t) {
  switch (i.type) {
    case "Disjunction":
      for (let s = 0; s < i.value.length; s++)
        Ah(i.value[s], e, t);
      break;
    case "Alternative":
      const n = i.value;
      for (let s = 0; s < n.length; s++) {
        const r = n[s];
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
        const o = r;
        switch (o.type) {
          case "Character":
            Qr(o.value, e, t);
            break;
          case "Set":
            if (o.complement === !0)
              throw Error(Gy);
            P(o.value, (l) => {
              if (typeof l == "number")
                Qr(l, e, t);
              else {
                const h = l;
                if (t === !0)
                  for (let c = h.from; c <= h.to; c++)
                    Qr(c, e, t);
                else {
                  for (let c = h.from; c <= h.to && c < _s; c++)
                    Qr(c, e, t);
                  if (h.to >= _s) {
                    const c = h.from >= _s ? h.from : _s, u = h.to, f = Xi(c), d = Xi(u);
                    for (let p = f; p <= d; p++)
                      e[p] = p;
                  }
                }
              }
            });
            break;
          case "Group":
            Ah(o.value, e, t);
            break;
          default:
            throw Error("Non Exhaustive Match");
        }
        const a = o.quantifier !== void 0 && o.quantifier.atLeast === 0;
        if (
          // A group may be optional due to empty contents /(?:)/
          // or if everything inside it is optional /((a)?)/
          o.type === "Group" && wh(o) === !1 || // If this term is not a group it may only be optional if it has an optional quantifier
          o.type !== "Group" && a === !1
        )
          break;
      }
      break;
    default:
      throw Error("non exhaustive match!");
  }
  return Te(e);
}
function Qr(i, e, t) {
  const n = Xi(i);
  e[n] = n, t === !0 && lR(i, e);
}
function lR(i, e) {
  const t = String.fromCharCode(i), n = t.toUpperCase();
  if (n !== t) {
    const s = Xi(n.charCodeAt(0));
    e[s] = s;
  } else {
    const s = t.toLowerCase();
    if (s !== t) {
      const r = Xi(s.charCodeAt(0));
      e[r] = r;
    }
  }
}
function Id(i, e) {
  return cs(i.value, (t) => {
    if (typeof t == "number")
      return qe(e, t);
    {
      const n = t;
      return cs(e, (s) => n.from <= s && s <= n.to) !== void 0;
    }
  });
}
function wh(i) {
  const e = i.quantifier;
  return e && e.atLeast === 0 ? !0 : i.value ? X(i.value) ? Dt(i.value, wh) : wh(i.value) : !1;
}
class hR extends Yc {
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
    qe(this.targetCharCodes, e.value) && (this.found = !0);
  }
  visitSet(e) {
    e.complement ? Id(e, this.targetCharCodes) === void 0 && (this.found = !0) : Id(e, this.targetCharCodes) !== void 0 && (this.found = !0);
  }
}
function Xc(i, e) {
  if (e instanceof RegExp) {
    const t = Da(e), n = new hR(i);
    return n.visit(t), n.found;
  } else
    return cs(e, (t) => qe(i, t.charCodeAt(0))) !== void 0;
}
const wn = "PATTERN", ks = "defaultMode", Zr = "modes";
let Ky = typeof new RegExp("(?:)").sticky == "boolean";
function cR(i, e) {
  e = Kc(e, {
    useSticky: Ky,
    debug: !1,
    safeMode: !1,
    positionTracking: "full",
    lineTerminatorCharacters: ["\r", `
`],
    tracer: (b, v) => v()
  });
  const t = e.tracer;
  t("initCharCodeToOptimizedIndexMap", () => {
    LR();
  });
  let n;
  t("Reject Lexer.NA", () => {
    n = La(i, (b) => b[wn] === Be.NA);
  });
  let s = !1, r;
  t("Transform Patterns", () => {
    s = !1, r = I(n, (b) => {
      const v = b[wn];
      if (xi(v)) {
        const T = v.source;
        return T.length === 1 && // only these regExp meta characters which can appear in a length one regExp
        T !== "^" && T !== "$" && T !== "." && !v.ignoreCase ? T : T.length === 2 && T[0] === "\\" && // not a meta character
        !qe([
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
        ], T[1]) ? T[1] : e.useSticky ? Nd(v) : Rd(v);
      } else {
        if (_i(v))
          return s = !0, { exec: v };
        if (typeof v == "object")
          return s = !0, v;
        if (typeof v == "string") {
          if (v.length === 1)
            return v;
          {
            const T = v.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"), S = new RegExp(T);
            return e.useSticky ? Nd(S) : Rd(S);
          }
        } else
          throw Error("non exhaustive match");
      }
    });
  });
  let o, a, l, h, c;
  t("misc mapping", () => {
    o = I(n, (b) => b.tokenTypeIdx), a = I(n, (b) => {
      const v = b.GROUP;
      if (v !== Be.SKIPPED) {
        if (nt(v))
          return v;
        if (Ei(v))
          return !1;
        throw Error("non exhaustive match");
      }
    }), l = I(n, (b) => {
      const v = b.LONGER_ALT;
      if (v)
        return X(v) ? I(v, (S) => wd(n, S)) : [wd(n, v)];
    }), h = I(n, (b) => b.PUSH_MODE), c = I(n, (b) => L(b, "POP_MODE"));
  });
  let u;
  t("Line Terminator Handling", () => {
    const b = Xy(e.lineTerminatorCharacters);
    u = I(n, (v) => !1), e.positionTracking !== "onlyOffset" && (u = I(n, (v) => L(v, "LINE_BREAKS") ? !!v.LINE_BREAKS : Yy(v, b) === !1 && Xc(b, v.PATTERN)));
  });
  let f, d, p, m;
  t("Misc Mapping #2", () => {
    f = I(n, qy), d = I(r, RR), p = dt(n, (b, v) => {
      const T = v.GROUP;
      return nt(T) && T !== Be.SKIPPED && (b[T] = []), b;
    }, {}), m = I(r, (b, v) => ({
      pattern: r[v],
      longerAlt: l[v],
      canLineTerminator: u[v],
      isCustom: f[v],
      short: d[v],
      group: a[v],
      push: h[v],
      pop: c[v],
      tokenTypeIdx: o[v],
      tokenType: n[v]
    }));
  });
  let g = !0, y = [];
  return e.safeMode || t("First Char Optimization", () => {
    y = dt(n, (b, v, T) => {
      if (typeof v.PATTERN == "string") {
        const S = v.PATTERN.charCodeAt(0), A = Xi(S);
        Al(b, A, m[T]);
      } else if (X(v.START_CHARS_HINT)) {
        let S;
        P(v.START_CHARS_HINT, (A) => {
          const w = typeof A == "string" ? A.charCodeAt(0) : A, D = Xi(w);
          S !== D && (S = D, Al(b, D, m[T]));
        });
      } else if (xi(v.PATTERN))
        if (v.PATTERN.unicode)
          g = !1, e.ensureOptimizations && Eh(`${Zo}	Unable to analyze < ${v.PATTERN.toString()} > pattern.
	The regexp unicode flag is not currently supported by the regexp-to-ast library.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNICODE_OPTIMIZE`);
        else {
          const S = aR(v.PATTERN, e.ensureOptimizations);
          ne(S) && (g = !1), P(S, (A) => {
            Al(b, A, m[T]);
          });
        }
      else
        e.ensureOptimizations && Eh(`${Zo}	TokenType: <${v.name}> is using a custom token pattern without providing <start_chars_hint> parameter.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_OPTIMIZE`), g = !1;
      return b;
    }, []);
  }), {
    emptyGroups: p,
    patternIdxToConfig: m,
    charCodeToPatternIdxToConfig: y,
    hasCustom: s,
    canBeOptimized: g
  };
}
function uR(i, e) {
  let t = [];
  const n = dR(i);
  t = t.concat(n.errors);
  const s = pR(n.valid), r = s.valid;
  return t = t.concat(s.errors), t = t.concat(fR(r)), t = t.concat(xR(r)), t = t.concat(ER(r, e)), t = t.concat(AR(r)), t;
}
function fR(i) {
  let e = [];
  const t = Ot(i, (n) => xi(n[wn]));
  return e = e.concat(gR(t)), e = e.concat(vR(t)), e = e.concat(SR(t)), e = e.concat(TR(t)), e = e.concat(yR(t)), e;
}
function dR(i) {
  const e = Ot(i, (s) => !L(s, wn)), t = I(e, (s) => ({
    message: "Token Type: ->" + s.name + "<- missing static 'PATTERN' property",
    type: ue.MISSING_PATTERN,
    tokenTypes: [s]
  })), n = Ma(i, e);
  return { errors: t, valid: n };
}
function pR(i) {
  const e = Ot(i, (s) => {
    const r = s[wn];
    return !xi(r) && !_i(r) && !L(r, "exec") && !nt(r);
  }), t = I(e, (s) => ({
    message: "Token Type: ->" + s.name + "<- static 'PATTERN' can only be a RegExp, a Function matching the {CustomPatternMatcherFunc} type or an Object matching the {ICustomPattern} interface.",
    type: ue.INVALID_PATTERN,
    tokenTypes: [s]
  })), n = Ma(i, e);
  return { errors: t, valid: n };
}
const mR = /[^\\][$]/;
function gR(i) {
  class e extends Yc {
    constructor() {
      super(...arguments), this.found = !1;
    }
    visitEndAnchor(r) {
      this.found = !0;
    }
  }
  const t = Ot(i, (s) => {
    const r = s.PATTERN;
    try {
      const o = Da(r), a = new e();
      return a.visit(o), a.found;
    } catch {
      return mR.test(r.source);
    }
  });
  return I(t, (s) => ({
    message: `Unexpected RegExp Anchor Error:
	Token Type: ->` + s.name + `<- static 'PATTERN' cannot contain end of input anchor '$'
	See chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.`,
    type: ue.EOI_ANCHOR_FOUND,
    tokenTypes: [s]
  }));
}
function yR(i) {
  const e = Ot(i, (n) => n.PATTERN.test(""));
  return I(e, (n) => ({
    message: "Token Type: ->" + n.name + "<- static 'PATTERN' must not match an empty string",
    type: ue.EMPTY_MATCH_PATTERN,
    tokenTypes: [n]
  }));
}
const bR = /[^\\[][\^]|^\^/;
function vR(i) {
  class e extends Yc {
    constructor() {
      super(...arguments), this.found = !1;
    }
    visitStartAnchor(r) {
      this.found = !0;
    }
  }
  const t = Ot(i, (s) => {
    const r = s.PATTERN;
    try {
      const o = Da(r), a = new e();
      return a.visit(o), a.found;
    } catch {
      return bR.test(r.source);
    }
  });
  return I(t, (s) => ({
    message: `Unexpected RegExp Anchor Error:
	Token Type: ->` + s.name + `<- static 'PATTERN' cannot contain start of input anchor '^'
	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.`,
    type: ue.SOI_ANCHOR_FOUND,
    tokenTypes: [s]
  }));
}
function SR(i) {
  const e = Ot(i, (n) => {
    const s = n[wn];
    return s instanceof RegExp && (s.multiline || s.global);
  });
  return I(e, (n) => ({
    message: "Token Type: ->" + n.name + "<- static 'PATTERN' may NOT contain global('g') or multiline('m')",
    type: ue.UNSUPPORTED_FLAGS_FOUND,
    tokenTypes: [n]
  }));
}
function TR(i) {
  const e = [];
  let t = I(i, (r) => dt(i, (o, a) => (r.PATTERN.source === a.PATTERN.source && !qe(e, a) && a.PATTERN !== Be.NA && (e.push(a), o.push(a)), o), []));
  t = Ar(t);
  const n = Ot(t, (r) => r.length > 1);
  return I(n, (r) => {
    const o = I(r, (l) => l.name);
    return {
      message: `The same RegExp pattern ->${Ut(r).PATTERN}<-has been used in all of the following Token Types: ${o.join(", ")} <-`,
      type: ue.DUPLICATE_PATTERNS_FOUND,
      tokenTypes: r
    };
  });
}
function xR(i) {
  const e = Ot(i, (n) => {
    if (!L(n, "GROUP"))
      return !1;
    const s = n.GROUP;
    return s !== Be.SKIPPED && s !== Be.NA && !nt(s);
  });
  return I(e, (n) => ({
    message: "Token Type: ->" + n.name + "<- static 'GROUP' can only be Lexer.SKIPPED/Lexer.NA/A String",
    type: ue.INVALID_GROUP_TYPE_FOUND,
    tokenTypes: [n]
  }));
}
function ER(i, e) {
  const t = Ot(i, (s) => s.PUSH_MODE !== void 0 && !qe(e, s.PUSH_MODE));
  return I(t, (s) => ({
    message: `Token Type: ->${s.name}<- static 'PUSH_MODE' value cannot refer to a Lexer Mode ->${s.PUSH_MODE}<-which does not exist`,
    type: ue.PUSH_MODE_DOES_NOT_EXIST,
    tokenTypes: [s]
  }));
}
function AR(i) {
  const e = [], t = dt(i, (n, s, r) => {
    const o = s.PATTERN;
    return o === Be.NA || (nt(o) ? n.push({ str: o, idx: r, tokenType: s }) : xi(o) && CR(o) && n.push({ str: o.source, idx: r, tokenType: s })), n;
  }, []);
  return P(i, (n, s) => {
    P(t, ({ str: r, idx: o, tokenType: a }) => {
      if (s < o && wR(r, n.PATTERN)) {
        const l = `Token: ->${a.name}<- can never be matched.
Because it appears AFTER the Token Type ->${n.name}<-in the lexer's definition.
See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNREACHABLE`;
        e.push({
          message: l,
          type: ue.UNREACHABLE_PATTERN,
          tokenTypes: [n, a]
        });
      }
    });
  }), e;
}
function wR(i, e) {
  if (xi(e)) {
    if (kR(e))
      return !1;
    const t = e.exec(i);
    return t !== null && t.index === 0;
  } else {
    if (_i(e))
      return e(i, 0, [], {});
    if (L(e, "exec"))
      return e.exec(i, 0, [], {});
    if (typeof e == "string")
      return e === i;
    throw Error("non exhaustive match");
  }
}
function CR(i) {
  return cs([
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
  ], (t) => i.source.indexOf(t) !== -1) === void 0;
}
function kR(i) {
  return /(\(\?=)|(\(\?!)|(\(\?<=)|(\(\?<!)/.test(i.source);
}
function Rd(i) {
  const e = i.ignoreCase ? "i" : "";
  return new RegExp(`^(?:${i.source})`, e);
}
function Nd(i) {
  const e = i.ignoreCase ? "iy" : "y";
  return new RegExp(`${i.source}`, e);
}
function _R(i, e, t) {
  const n = [];
  return L(i, ks) || n.push({
    message: "A MultiMode Lexer cannot be initialized without a <" + ks + `> property in its definition
`,
    type: ue.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE
  }), L(i, Zr) || n.push({
    message: "A MultiMode Lexer cannot be initialized without a <" + Zr + `> property in its definition
`,
    type: ue.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY
  }), L(i, Zr) && L(i, ks) && !L(i.modes, i.defaultMode) && n.push({
    message: `A MultiMode Lexer cannot be initialized with a ${ks}: <${i.defaultMode}>which does not exist
`,
    type: ue.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST
  }), L(i, Zr) && P(i.modes, (s, r) => {
    P(s, (o, a) => {
      if (Ei(o))
        n.push({
          message: `A Lexer cannot be initialized using an undefined Token Type. Mode:<${r}> at index: <${a}>
`,
          type: ue.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED
        });
      else if (L(o, "LONGER_ALT")) {
        const l = X(o.LONGER_ALT) ? o.LONGER_ALT : [o.LONGER_ALT];
        P(l, (h) => {
          !Ei(h) && !qe(s, h) && n.push({
            message: `A MultiMode Lexer cannot be initialized with a longer_alt <${h.name}> on token <${o.name}> outside of mode <${r}>
`,
            type: ue.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE
          });
        });
      }
    });
  }), n;
}
function OR(i, e, t) {
  const n = [];
  let s = !1;
  const r = Ar(Pt(Te(i.modes))), o = La(r, (l) => l[wn] === Be.NA), a = Xy(t);
  return e && P(o, (l) => {
    const h = Yy(l, a);
    if (h !== !1) {
      const u = {
        message: MR(l, h),
        type: h.issue,
        tokenType: l
      };
      n.push(u);
    } else
      L(l, "LINE_BREAKS") ? l.LINE_BREAKS === !0 && (s = !0) : Xc(a, l.PATTERN) && (s = !0);
  }), e && !s && n.push({
    message: `Warning: No LINE_BREAKS Found.
	This Lexer has been defined to track line and column information,
	But none of the Token Types can be identified as matching a line terminator.
	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#LINE_BREAKS 
	for details.`,
    type: ue.NO_LINE_BREAKS_FLAGS
  }), n;
}
function IR(i) {
  const e = {}, t = kt(i);
  return P(t, (n) => {
    const s = i[n];
    if (X(s))
      e[n] = [];
    else
      throw Error("non exhaustive match");
  }), e;
}
function qy(i) {
  const e = i.PATTERN;
  if (xi(e))
    return !1;
  if (_i(e))
    return !0;
  if (L(e, "exec"))
    return !0;
  if (nt(e))
    return !1;
  throw Error("non exhaustive match");
}
function RR(i) {
  return nt(i) && i.length === 1 ? i.charCodeAt(0) : !1;
}
const NR = {
  // implements /\n|\r\n?/g.test
  test: function(i) {
    const e = i.length;
    for (let t = this.lastIndex; t < e; t++) {
      const n = i.charCodeAt(t);
      if (n === 10)
        return this.lastIndex = t + 1, !0;
      if (n === 13)
        return i.charCodeAt(t + 1) === 10 ? this.lastIndex = t + 2 : this.lastIndex = t + 1, !0;
    }
    return !1;
  },
  lastIndex: 0
};
function Yy(i, e) {
  if (L(i, "LINE_BREAKS"))
    return !1;
  if (xi(i.PATTERN)) {
    try {
      Xc(e, i.PATTERN);
    } catch (t) {
      return {
        issue: ue.IDENTIFY_TERMINATOR,
        errMsg: t.message
      };
    }
    return !1;
  } else {
    if (nt(i.PATTERN))
      return !1;
    if (qy(i))
      return { issue: ue.CUSTOM_LINE_BREAK };
    throw Error("non exhaustive match");
  }
}
function MR(i, e) {
  if (e.issue === ue.IDENTIFY_TERMINATOR)
    return `Warning: unable to identify line terminator usage in pattern.
	The problem is in the <${i.name}> Token Type
	 Root cause: ${e.errMsg}.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#IDENTIFY_TERMINATOR`;
  if (e.issue === ue.CUSTOM_LINE_BREAK)
    return `Warning: A Custom Token Pattern should specify the <line_breaks> option.
	The problem is in the <${i.name}> Token Type
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_LINE_BREAK`;
  throw Error("non exhaustive match");
}
function Xy(i) {
  return I(i, (t) => nt(t) ? t.charCodeAt(0) : t);
}
function Al(i, e, t) {
  i[e] === void 0 ? i[e] = [t] : i[e].push(t);
}
const _s = 256;
let yo = [];
function Xi(i) {
  return i < _s ? i : yo[i];
}
function LR() {
  if (ne(yo)) {
    yo = new Array(65536);
    for (let i = 0; i < 65536; i++)
      yo[i] = i > 255 ? 255 + ~~(i / 255) : i;
  }
}
function Cr(i, e) {
  const t = i.tokenTypeIdx;
  return t === e.tokenTypeIdx ? !0 : e.isParent === !0 && e.categoryMatchesMap[t] === !0;
}
function ea(i, e) {
  return i.tokenTypeIdx === e.tokenTypeIdx;
}
let Md = 1;
const Jy = {};
function kr(i) {
  const e = PR(i);
  DR(e), BR(e), $R(e), P(e, (t) => {
    t.isParent = t.categoryMatches.length > 0;
  });
}
function PR(i) {
  let e = De(i), t = i, n = !0;
  for (; n; ) {
    t = Ar(Pt(I(t, (r) => r.CATEGORIES)));
    const s = Ma(t, e);
    e = e.concat(s), ne(s) ? n = !1 : t = s;
  }
  return e;
}
function DR(i) {
  P(i, (e) => {
    Zy(e) || (Jy[Md] = e, e.tokenTypeIdx = Md++), Ld(e) && !X(e.CATEGORIES) && (e.CATEGORIES = [e.CATEGORIES]), Ld(e) || (e.CATEGORIES = []), UR(e) || (e.categoryMatches = []), FR(e) || (e.categoryMatchesMap = {});
  });
}
function $R(i) {
  P(i, (e) => {
    e.categoryMatches = [], P(e.categoryMatchesMap, (t, n) => {
      e.categoryMatches.push(Jy[n].tokenTypeIdx);
    });
  });
}
function BR(i) {
  P(i, (e) => {
    Qy([], e);
  });
}
function Qy(i, e) {
  P(i, (t) => {
    e.categoryMatchesMap[t.tokenTypeIdx] = !0;
  }), P(e.CATEGORIES, (t) => {
    const n = i.concat(e);
    qe(n, t) || Qy(n, t);
  });
}
function Zy(i) {
  return L(i, "tokenTypeIdx");
}
function Ld(i) {
  return L(i, "CATEGORIES");
}
function UR(i) {
  return L(i, "categoryMatches");
}
function FR(i) {
  return L(i, "categoryMatchesMap");
}
function WR(i) {
  return L(i, "tokenTypeIdx");
}
const HR = {
  buildUnableToPopLexerModeMessage(i) {
    return `Unable to pop Lexer Mode after encountering Token ->${i.image}<- The Mode Stack is empty`;
  },
  buildUnexpectedCharactersMessage(i, e, t, n, s, r) {
    return `unexpected character: ->${i.charAt(e)}<- at offset: ${e}, skipped ${t} characters.`;
  }
};
var ue;
(function(i) {
  i[i.MISSING_PATTERN = 0] = "MISSING_PATTERN", i[i.INVALID_PATTERN = 1] = "INVALID_PATTERN", i[i.EOI_ANCHOR_FOUND = 2] = "EOI_ANCHOR_FOUND", i[i.UNSUPPORTED_FLAGS_FOUND = 3] = "UNSUPPORTED_FLAGS_FOUND", i[i.DUPLICATE_PATTERNS_FOUND = 4] = "DUPLICATE_PATTERNS_FOUND", i[i.INVALID_GROUP_TYPE_FOUND = 5] = "INVALID_GROUP_TYPE_FOUND", i[i.PUSH_MODE_DOES_NOT_EXIST = 6] = "PUSH_MODE_DOES_NOT_EXIST", i[i.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE = 7] = "MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE", i[i.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY = 8] = "MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY", i[i.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST = 9] = "MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST", i[i.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED = 10] = "LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED", i[i.SOI_ANCHOR_FOUND = 11] = "SOI_ANCHOR_FOUND", i[i.EMPTY_MATCH_PATTERN = 12] = "EMPTY_MATCH_PATTERN", i[i.NO_LINE_BREAKS_FLAGS = 13] = "NO_LINE_BREAKS_FLAGS", i[i.UNREACHABLE_PATTERN = 14] = "UNREACHABLE_PATTERN", i[i.IDENTIFY_TERMINATOR = 15] = "IDENTIFY_TERMINATOR", i[i.CUSTOM_LINE_BREAK = 16] = "CUSTOM_LINE_BREAK", i[i.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE = 17] = "MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE";
})(ue || (ue = {}));
const Os = {
  deferDefinitionErrorsHandling: !1,
  positionTracking: "full",
  lineTerminatorsPattern: /\n|\r\n?/g,
  lineTerminatorCharacters: [`
`, "\r"],
  ensureOptimizations: !1,
  safeMode: !1,
  errorMessageProvider: HR,
  traceInitPerf: !1,
  skipValidations: !1,
  recoveryEnabled: !0
};
Object.freeze(Os);
class Be {
  constructor(e, t = Os) {
    if (this.lexerDefinition = e, this.lexerDefinitionErrors = [], this.lexerDefinitionWarning = [], this.patternIdxToConfig = {}, this.charCodeToPatternIdxToConfig = {}, this.modes = [], this.emptyGroups = {}, this.trackStartLines = !0, this.trackEndLines = !0, this.hasCustom = !1, this.canModeBeOptimized = {}, this.TRACE_INIT = (s, r) => {
      if (this.traceInitPerf === !0) {
        this.traceInitIndent++;
        const o = new Array(this.traceInitIndent + 1).join("	");
        this.traceInitIndent < this.traceInitMaxIdent && console.log(`${o}--> <${s}>`);
        const { time: a, value: l } = Vy(r), h = a > 10 ? console.warn : console.log;
        return this.traceInitIndent < this.traceInitMaxIdent && h(`${o}<-- <${s}> time: ${a}ms`), this.traceInitIndent--, l;
      } else
        return r();
    }, typeof t == "boolean")
      throw Error(`The second argument to the Lexer constructor is now an ILexerConfig Object.
a boolean 2nd argument is no longer supported`);
    this.config = ft({}, Os, t);
    const n = this.config.traceInitPerf;
    n === !0 ? (this.traceInitMaxIdent = 1 / 0, this.traceInitPerf = !0) : typeof n == "number" && (this.traceInitMaxIdent = n, this.traceInitPerf = !0), this.traceInitIndent = -1, this.TRACE_INIT("Lexer Constructor", () => {
      let s, r = !0;
      this.TRACE_INIT("Lexer Config handling", () => {
        if (this.config.lineTerminatorsPattern === Os.lineTerminatorsPattern)
          this.config.lineTerminatorsPattern = NR;
        else if (this.config.lineTerminatorCharacters === Os.lineTerminatorCharacters)
          throw Error(`Error: Missing <lineTerminatorCharacters> property on the Lexer config.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#MISSING_LINE_TERM_CHARS`);
        if (t.safeMode && t.ensureOptimizations)
          throw Error('"safeMode" and "ensureOptimizations" flags are mutually exclusive.');
        this.trackStartLines = /full|onlyStart/i.test(this.config.positionTracking), this.trackEndLines = /full/i.test(this.config.positionTracking), X(e) ? s = {
          modes: { defaultMode: De(e) },
          defaultMode: ks
        } : (r = !1, s = De(e));
      }), this.config.skipValidations === !1 && (this.TRACE_INIT("performRuntimeChecks", () => {
        this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(_R(s, this.trackStartLines, this.config.lineTerminatorCharacters));
      }), this.TRACE_INIT("performWarningRuntimeChecks", () => {
        this.lexerDefinitionWarning = this.lexerDefinitionWarning.concat(OR(s, this.trackStartLines, this.config.lineTerminatorCharacters));
      })), s.modes = s.modes ? s.modes : {}, P(s.modes, (a, l) => {
        s.modes[l] = La(a, (h) => Ei(h));
      });
      const o = kt(s.modes);
      if (P(s.modes, (a, l) => {
        this.TRACE_INIT(`Mode: <${l}> processing`, () => {
          if (this.modes.push(l), this.config.skipValidations === !1 && this.TRACE_INIT("validatePatterns", () => {
            this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(uR(a, o));
          }), ne(this.lexerDefinitionErrors)) {
            kr(a);
            let h;
            this.TRACE_INIT("analyzeTokenTypes", () => {
              h = cR(a, {
                lineTerminatorCharacters: this.config.lineTerminatorCharacters,
                positionTracking: t.positionTracking,
                ensureOptimizations: t.ensureOptimizations,
                safeMode: t.safeMode,
                tracer: this.TRACE_INIT
              });
            }), this.patternIdxToConfig[l] = h.patternIdxToConfig, this.charCodeToPatternIdxToConfig[l] = h.charCodeToPatternIdxToConfig, this.emptyGroups = ft({}, this.emptyGroups, h.emptyGroups), this.hasCustom = h.hasCustom || this.hasCustom, this.canModeBeOptimized[l] = h.canBeOptimized;
          }
        });
      }), this.defaultMode = s.defaultMode, !ne(this.lexerDefinitionErrors) && !this.config.deferDefinitionErrorsHandling) {
        const l = I(this.lexerDefinitionErrors, (h) => h.message).join(`-----------------------
`);
        throw new Error(`Errors detected in definition of Lexer:
` + l);
      }
      P(this.lexerDefinitionWarning, (a) => {
        Hy(a.message);
      }), this.TRACE_INIT("Choosing sub-methods implementations", () => {
        if (Ky ? (this.chopInput = ls, this.match = this.matchWithTest) : (this.updateLastIndex = Se, this.match = this.matchWithExec), r && (this.handleModes = Se), this.trackStartLines === !1 && (this.computeNewColumn = ls), this.trackEndLines === !1 && (this.updateTokenEndLineColumnLocation = Se), /full/i.test(this.config.positionTracking))
          this.createTokenInstance = this.createFullToken;
        else if (/onlyStart/i.test(this.config.positionTracking))
          this.createTokenInstance = this.createStartOnlyToken;
        else if (/onlyOffset/i.test(this.config.positionTracking))
          this.createTokenInstance = this.createOffsetOnlyToken;
        else
          throw Error(`Invalid <positionTracking> config option: "${this.config.positionTracking}"`);
        this.hasCustom ? (this.addToken = this.addTokenUsingPush, this.handlePayload = this.handlePayloadWithCustom) : (this.addToken = this.addTokenUsingMemberAccess, this.handlePayload = this.handlePayloadNoCustom);
      }), this.TRACE_INIT("Failed Optimization Warnings", () => {
        const a = dt(this.canModeBeOptimized, (l, h, c) => (h === !1 && l.push(c), l), []);
        if (t.ensureOptimizations && !ne(a))
          throw Error(`Lexer Modes: < ${a.join(", ")} > cannot be optimized.
	 Disable the "ensureOptimizations" lexer config flag to silently ignore this and run the lexer in an un-optimized mode.
	 Or inspect the console log for details on how to resolve these issues.`);
      }), this.TRACE_INIT("clearRegExpParserCache", () => {
        oR();
      }), this.TRACE_INIT("toFastProperties", () => {
        jy(this);
      });
    });
  }
  tokenize(e, t = this.defaultMode) {
    if (!ne(this.lexerDefinitionErrors)) {
      const s = I(this.lexerDefinitionErrors, (r) => r.message).join(`-----------------------
`);
      throw new Error(`Unable to Tokenize because Errors detected in definition of Lexer:
` + s);
    }
    return this.tokenizeInternal(e, t);
  }
  // There is quite a bit of duplication between this and "tokenizeInternalLazy"
  // This is intentional due to performance considerations.
  // this method also used quite a bit of `!` none null assertions because it is too optimized
  // for `tsc` to always understand it is "safe"
  tokenizeInternal(e, t) {
    let n, s, r, o, a, l, h, c, u, f, d, p, m, g, y;
    const b = e, v = b.length;
    let T = 0, S = 0;
    const A = this.hasCustom ? 0 : Math.floor(e.length / 10), w = new Array(A), D = [];
    let W = this.trackStartLines ? 1 : void 0, j = this.trackStartLines ? 1 : void 0;
    const F = IR(this.emptyGroups), M = this.trackStartLines, Y = this.config.lineTerminatorsPattern;
    let z = 0, q = [], de = [];
    const be = [], ot = [];
    Object.freeze(ot);
    let le;
    function He() {
      return q;
    }
    function mt(pe) {
      const Ve = Xi(pe), Mn = de[Ve];
      return Mn === void 0 ? ot : Mn;
    }
    const Ye = (pe) => {
      if (be.length === 1 && // if we have both a POP_MODE and a PUSH_MODE this is in-fact a "transition"
      // So no error should occur.
      pe.tokenType.PUSH_MODE === void 0) {
        const Ve = this.config.errorMessageProvider.buildUnableToPopLexerModeMessage(pe);
        D.push({
          offset: pe.startOffset,
          line: pe.startLine,
          column: pe.startColumn,
          length: pe.image.length,
          message: Ve
        });
      } else {
        be.pop();
        const Ve = An(be);
        q = this.patternIdxToConfig[Ve], de = this.charCodeToPatternIdxToConfig[Ve], z = q.length;
        const Mn = this.canModeBeOptimized[Ve] && this.config.safeMode === !1;
        de && Mn ? le = mt : le = He;
      }
    };
    function at(pe) {
      be.push(pe), de = this.charCodeToPatternIdxToConfig[pe], q = this.patternIdxToConfig[pe], z = q.length, z = q.length;
      const Ve = this.canModeBeOptimized[pe] && this.config.safeMode === !1;
      de && Ve ? le = mt : le = He;
    }
    at.call(this, t);
    let ve;
    const ui = this.config.recoveryEnabled;
    for (; T < v; ) {
      l = null;
      const pe = b.charCodeAt(T), Ve = le(pe), Mn = Ve.length;
      for (n = 0; n < Mn; n++) {
        ve = Ve[n];
        const lt = ve.pattern;
        h = null;
        const fi = ve.short;
        if (fi !== !1 ? pe === fi && (l = lt) : ve.isCustom === !0 ? (y = lt.exec(b, T, w, F), y !== null ? (l = y[0], y.payload !== void 0 && (h = y.payload)) : l = null) : (this.updateLastIndex(lt, T), l = this.match(lt, e, T)), l !== null) {
          if (a = ve.longerAlt, a !== void 0) {
            const Ri = a.length;
            for (r = 0; r < Ri; r++) {
              const di = q[a[r]], nn = di.pattern;
              if (c = null, di.isCustom === !0 ? (y = nn.exec(b, T, w, F), y !== null ? (o = y[0], y.payload !== void 0 && (c = y.payload)) : o = null) : (this.updateLastIndex(nn, T), o = this.match(nn, e, T)), o && o.length > l.length) {
                l = o, h = c, ve = di;
                break;
              }
            }
          }
          break;
        }
      }
      if (l !== null) {
        if (u = l.length, f = ve.group, f !== void 0 && (d = ve.tokenTypeIdx, p = this.createTokenInstance(l, T, d, ve.tokenType, W, j, u), this.handlePayload(p, h), f === !1 ? S = this.addToken(w, S, p) : F[f].push(p)), e = this.chopInput(e, u), T = T + u, j = this.computeNewColumn(j, u), M === !0 && ve.canLineTerminator === !0) {
          let lt = 0, fi, Ri;
          Y.lastIndex = 0;
          do
            fi = Y.test(l), fi === !0 && (Ri = Y.lastIndex - 1, lt++);
          while (fi === !0);
          lt !== 0 && (W = W + lt, j = u - Ri, this.updateTokenEndLineColumnLocation(p, f, Ri, lt, W, j, u));
        }
        this.handleModes(ve, Ye, at, p);
      } else {
        const lt = T, fi = W, Ri = j;
        let di = ui === !1;
        for (; di === !1 && T < v; )
          for (e = this.chopInput(e, 1), T++, s = 0; s < z; s++) {
            const nn = q[s], Fa = nn.pattern, tu = nn.short;
            if (tu !== !1 ? b.charCodeAt(T) === tu && (di = !0) : nn.isCustom === !0 ? di = Fa.exec(b, T, w, F) !== null : (this.updateLastIndex(Fa, T), di = Fa.exec(e) !== null), di === !0)
              break;
          }
        if (m = T - lt, j = this.computeNewColumn(j, m), g = this.config.errorMessageProvider.buildUnexpectedCharactersMessage(b, lt, m, fi, Ri, An(be)), D.push({
          offset: lt,
          line: fi,
          column: Ri,
          length: m,
          message: g
        }), ui === !1)
          break;
      }
    }
    return this.hasCustom || (w.length = S), {
      tokens: w,
      groups: F,
      errors: D
    };
  }
  handleModes(e, t, n, s) {
    if (e.pop === !0) {
      const r = e.push;
      t(s), r !== void 0 && n.call(this, r);
    } else e.push !== void 0 && n.call(this, e.push);
  }
  chopInput(e, t) {
    return e.substring(t);
  }
  updateLastIndex(e, t) {
    e.lastIndex = t;
  }
  // TODO: decrease this under 600 characters? inspect stripping comments option in TSC compiler
  updateTokenEndLineColumnLocation(e, t, n, s, r, o, a) {
    let l, h;
    t !== void 0 && (l = n === a - 1, h = l ? -1 : 0, s === 1 && l === !0 || (e.endLine = r + h, e.endColumn = o - 1 + -h));
  }
  computeNewColumn(e, t) {
    return e + t;
  }
  createOffsetOnlyToken(e, t, n, s) {
    return {
      image: e,
      startOffset: t,
      tokenTypeIdx: n,
      tokenType: s
    };
  }
  createStartOnlyToken(e, t, n, s, r, o) {
    return {
      image: e,
      startOffset: t,
      startLine: r,
      startColumn: o,
      tokenTypeIdx: n,
      tokenType: s
    };
  }
  createFullToken(e, t, n, s, r, o, a) {
    return {
      image: e,
      startOffset: t,
      endOffset: t + a - 1,
      startLine: r,
      endLine: r,
      startColumn: o,
      endColumn: o + a - 1,
      tokenTypeIdx: n,
      tokenType: s
    };
  }
  addTokenUsingPush(e, t, n) {
    return e.push(n), t;
  }
  addTokenUsingMemberAccess(e, t, n) {
    return e[t] = n, t++, t;
  }
  handlePayloadNoCustom(e, t) {
  }
  handlePayloadWithCustom(e, t) {
    t !== null && (e.payload = t);
  }
  matchWithTest(e, t, n) {
    return e.test(t) === !0 ? t.substring(n, e.lastIndex) : null;
  }
  matchWithExec(e, t) {
    const n = e.exec(t);
    return n !== null ? n[0] : null;
  }
}
Be.SKIPPED = "This marks a skipped Token pattern, this means each token identified by it will be consumed and then thrown into oblivion, this can be used to for example to completely ignore whitespace.";
Be.NA = /NOT_APPLICABLE/;
function Ws(i) {
  return e0(i) ? i.LABEL : i.name;
}
function e0(i) {
  return nt(i.LABEL) && i.LABEL !== "";
}
const VR = "parent", Pd = "categories", Dd = "label", $d = "group", Bd = "push_mode", Ud = "pop_mode", Fd = "longer_alt", Wd = "line_breaks", Hd = "start_chars_hint";
function N(i) {
  return jR(i);
}
function jR(i) {
  const e = i.pattern, t = {};
  if (t.name = i.name, Ei(e) || (t.PATTERN = e), L(i, VR))
    throw `The parent property is no longer supported.
See: https://github.com/chevrotain/chevrotain/issues/564#issuecomment-349062346 for details.`;
  return L(i, Pd) && (t.CATEGORIES = i[Pd]), kr([t]), L(i, Dd) && (t.LABEL = i[Dd]), L(i, $d) && (t.GROUP = i[$d]), L(i, Ud) && (t.POP_MODE = i[Ud]), L(i, Bd) && (t.PUSH_MODE = i[Bd]), L(i, Fd) && (t.LONGER_ALT = i[Fd]), L(i, Wd) && (t.LINE_BREAKS = i[Wd]), L(i, Hd) && (t.START_CHARS_HINT = i[Hd]), t;
}
const Cn = N({ name: "EOF", pattern: Be.NA });
kr([Cn]);
function Jc(i, e, t, n, s, r, o, a) {
  return {
    image: e,
    startOffset: t,
    endOffset: n,
    startLine: s,
    endLine: r,
    startColumn: o,
    endColumn: a,
    tokenTypeIdx: i.tokenTypeIdx,
    tokenType: i
  };
}
function zR(i, e) {
  return Cr(i, e);
}
const t0 = {
  buildMismatchTokenMessage({ expected: i, actual: e, previous: t, ruleName: n }) {
    return `Expecting ${e0(i) ? `--> ${Ws(i)} <--` : `token of type --> ${i.name} <--`} but found --> '${e.image}' <--`;
  },
  buildNotAllInputParsedMessage({ firstRedundant: i, ruleName: e }) {
    return "Redundant input, expecting EOF but found: " + i.image;
  },
  buildNoViableAltMessage({ expectedPathsPerAlt: i, actual: e, previous: t, customUserDescription: n, ruleName: s }) {
    const r = "Expecting: ", a = `
but found: '` + Ut(e).image + "'";
    if (n)
      return r + n + a;
    {
      const l = dt(i, (f, d) => f.concat(d), []), h = I(l, (f) => `[${I(f, (d) => Ws(d)).join(", ")}]`), u = `one of these possible Token sequences:
${I(h, (f, d) => `  ${d + 1}. ${f}`).join(`
`)}`;
      return r + u + a;
    }
  },
  buildEarlyExitMessage({ expectedIterationPaths: i, actual: e, customUserDescription: t, ruleName: n }) {
    const s = "Expecting: ", o = `
but found: '` + Ut(e).image + "'";
    if (t)
      return s + t + o;
    {
      const l = `expecting at least one iteration which starts with one of these possible Token sequences::
  <${I(i, (h) => `[${I(h, (c) => Ws(c)).join(",")}]`).join(" ,")}>`;
      return s + l + o;
    }
  }
};
Object.freeze(t0);
const GR = {
  buildRuleNotFoundError(i, e) {
    return "Invalid grammar, reference to a rule which is not defined: ->" + e.nonTerminalName + `<-
inside top level rule: ->` + i.name + "<-";
  }
}, fn = {
  buildDuplicateFoundError(i, e) {
    function t(c) {
      return c instanceof he ? c.terminalType.name : c instanceof pt ? c.nonTerminalName : "";
    }
    const n = i.name, s = Ut(e), r = s.idx, o = Xt(s), a = t(s), l = r > 0;
    let h = `->${o}${l ? r : ""}<- ${a ? `with argument: ->${a}<-` : ""}
                  appears more than once (${e.length} times) in the top level rule: ->${n}<-.                  
                  For further details see: https://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES 
                  `;
    return h = h.replace(/[ \t]+/g, " "), h = h.replace(/\s\s+/g, `
`), h;
  },
  buildNamespaceConflictError(i) {
    return `Namespace conflict found in grammar.
The grammar has both a Terminal(Token) and a Non-Terminal(Rule) named: <${i.name}>.
To resolve this make sure each Terminal and Non-Terminal names are unique
This is easy to accomplish by using the convention that Terminal names start with an uppercase letter
and Non-Terminal names start with a lower case letter.`;
  },
  buildAlternationPrefixAmbiguityError(i) {
    const e = I(i.prefixPath, (s) => Ws(s)).join(", "), t = i.alternation.idx === 0 ? "" : i.alternation.idx;
    return `Ambiguous alternatives: <${i.ambiguityIndices.join(" ,")}> due to common lookahead prefix
in <OR${t}> inside <${i.topLevelRule.name}> Rule,
<${e}> may appears as a prefix path in all these alternatives.
See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#COMMON_PREFIX
For Further details.`;
  },
  buildAlternationAmbiguityError(i) {
    const e = I(i.prefixPath, (s) => Ws(s)).join(", "), t = i.alternation.idx === 0 ? "" : i.alternation.idx;
    let n = `Ambiguous Alternatives Detected: <${i.ambiguityIndices.join(" ,")}> in <OR${t}> inside <${i.topLevelRule.name}> Rule,
<${e}> may appears as a prefix path in all these alternatives.
`;
    return n = n + `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#AMBIGUOUS_ALTERNATIVES
For Further details.`, n;
  },
  buildEmptyRepetitionError(i) {
    let e = Xt(i.repetition);
    return i.repetition.idx !== 0 && (e += i.repetition.idx), `The repetition <${e}> within Rule <${i.topLevelRule.name}> can never consume any tokens.
This could lead to an infinite loop.`;
  },
  // TODO: remove - `errors_public` from nyc.config.js exclude
  //       once this method is fully removed from this file
  buildTokenNameError(i) {
    return "deprecated";
  },
  buildEmptyAlternationError(i) {
    return `Ambiguous empty alternative: <${i.emptyChoiceIdx + 1}> in <OR${i.alternation.idx}> inside <${i.topLevelRule.name}> Rule.
Only the last alternative may be an empty alternative.`;
  },
  buildTooManyAlternativesError(i) {
    return `An Alternation cannot have more than 256 alternatives:
<OR${i.alternation.idx}> inside <${i.topLevelRule.name}> Rule.
 has ${i.alternation.definition.length + 1} alternatives.`;
  },
  buildLeftRecursionError(i) {
    const e = i.topLevelRule.name, t = I(i.leftRecursionPath, (r) => r.name), n = `${e} --> ${t.concat([e]).join(" --> ")}`;
    return `Left Recursion found in grammar.
rule: <${e}> can be invoked from itself (directly or indirectly)
without consuming any Tokens. The grammar path that causes this is: 
 ${n}
 To fix this refactor your grammar to remove the left recursion.
see: https://en.wikipedia.org/wiki/LL_parser#Left_factoring.`;
  },
  // TODO: remove - `errors_public` from nyc.config.js exclude
  //       once this method is fully removed from this file
  buildInvalidRuleNameError(i) {
    return "deprecated";
  },
  buildDuplicateRuleNameError(i) {
    let e;
    return i.topLevelRule instanceof ds ? e = i.topLevelRule.name : e = i.topLevelRule, `Duplicate definition, rule: ->${e}<- is already defined in the grammar: ->${i.grammarName}<-`;
  }
};
function KR(i, e) {
  const t = new qR(i, e);
  return t.resolveRefs(), t.errors;
}
class qR extends ps {
  constructor(e, t) {
    super(), this.nameToTopRule = e, this.errMsgProvider = t, this.errors = [];
  }
  resolveRefs() {
    P(Te(this.nameToTopRule), (e) => {
      this.currTopLevel = e, e.accept(this);
    });
  }
  visitNonTerminal(e) {
    const t = this.nameToTopRule[e.nonTerminalName];
    if (t)
      e.referencedRule = t;
    else {
      const n = this.errMsgProvider.buildRuleNotFoundError(this.currTopLevel, e);
      this.errors.push({
        message: n,
        type: Ge.UNRESOLVED_SUBRULE_REF,
        ruleName: this.currTopLevel.name,
        unresolvedRefName: e.nonTerminalName
      });
    }
  }
}
class YR extends Pa {
  constructor(e, t) {
    super(), this.topProd = e, this.path = t, this.possibleTokTypes = [], this.nextProductionName = "", this.nextProductionOccurrence = 0, this.found = !1, this.isAtEndOfPath = !1;
  }
  startWalking() {
    if (this.found = !1, this.path.ruleStack[0] !== this.topProd.name)
      throw Error("The path does not start with the walker's top Rule!");
    return this.ruleStack = De(this.path.ruleStack).reverse(), this.occurrenceStack = De(this.path.occurrenceStack).reverse(), this.ruleStack.pop(), this.occurrenceStack.pop(), this.updateExpectedNext(), this.walk(this.topProd), this.possibleTokTypes;
  }
  walk(e, t = []) {
    this.found || super.walk(e, t);
  }
  walkProdRef(e, t, n) {
    if (e.referencedRule.name === this.nextProductionName && e.idx === this.nextProductionOccurrence) {
      const s = t.concat(n);
      this.updateExpectedNext(), this.walk(e.referencedRule, s);
    }
  }
  updateExpectedNext() {
    ne(this.ruleStack) ? (this.nextProductionName = "", this.nextProductionOccurrence = 0, this.isAtEndOfPath = !0) : (this.nextProductionName = this.ruleStack.pop(), this.nextProductionOccurrence = this.occurrenceStack.pop());
  }
}
class XR extends YR {
  constructor(e, t) {
    super(e, t), this.path = t, this.nextTerminalName = "", this.nextTerminalOccurrence = 0, this.nextTerminalName = this.path.lastTok.name, this.nextTerminalOccurrence = this.path.lastTokOccurrence;
  }
  walkTerminal(e, t, n) {
    if (this.isAtEndOfPath && e.terminalType.name === this.nextTerminalName && e.idx === this.nextTerminalOccurrence && !this.found) {
      const s = t.concat(n), r = new st({ definition: s });
      this.possibleTokTypes = wr(r), this.found = !0;
    }
  }
}
class $a extends Pa {
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
class JR extends $a {
  walkMany(e, t, n) {
    if (e.idx === this.occurrence) {
      const s = Ut(t.concat(n));
      this.result.isEndOfRule = s === void 0, s instanceof he && (this.result.token = s.terminalType, this.result.occurrence = s.idx);
    } else
      super.walkMany(e, t, n);
  }
}
class Vd extends $a {
  walkManySep(e, t, n) {
    if (e.idx === this.occurrence) {
      const s = Ut(t.concat(n));
      this.result.isEndOfRule = s === void 0, s instanceof he && (this.result.token = s.terminalType, this.result.occurrence = s.idx);
    } else
      super.walkManySep(e, t, n);
  }
}
class QR extends $a {
  walkAtLeastOne(e, t, n) {
    if (e.idx === this.occurrence) {
      const s = Ut(t.concat(n));
      this.result.isEndOfRule = s === void 0, s instanceof he && (this.result.token = s.terminalType, this.result.occurrence = s.idx);
    } else
      super.walkAtLeastOne(e, t, n);
  }
}
class jd extends $a {
  walkAtLeastOneSep(e, t, n) {
    if (e.idx === this.occurrence) {
      const s = Ut(t.concat(n));
      this.result.isEndOfRule = s === void 0, s instanceof he && (this.result.token = s.terminalType, this.result.occurrence = s.idx);
    } else
      super.walkAtLeastOneSep(e, t, n);
  }
}
function Ch(i, e, t = []) {
  t = De(t);
  let n = [], s = 0;
  function r(a) {
    return a.concat(Ie(i, s + 1));
  }
  function o(a) {
    const l = Ch(r(a), e, t);
    return n.concat(l);
  }
  for (; t.length < e && s < i.length; ) {
    const a = i[s];
    if (a instanceof st)
      return o(a.definition);
    if (a instanceof pt)
      return o(a.definition);
    if (a instanceof tt)
      n = o(a.definition);
    else if (a instanceof hi) {
      const l = a.definition.concat([
        new Ee({
          definition: a.definition
        })
      ]);
      return o(l);
    } else if (a instanceof ci) {
      const l = [
        new st({ definition: a.definition }),
        new Ee({
          definition: [new he({ terminalType: a.separator })].concat(a.definition)
        })
      ];
      return o(l);
    } else if (a instanceof Vt) {
      const l = a.definition.concat([
        new Ee({
          definition: [new he({ terminalType: a.separator })].concat(a.definition)
        })
      ]);
      n = o(l);
    } else if (a instanceof Ee) {
      const l = a.definition.concat([
        new Ee({
          definition: a.definition
        })
      ]);
      n = o(l);
    } else {
      if (a instanceof jt)
        return P(a.definition, (l) => {
          ne(l.definition) === !1 && (n = o(l.definition));
        }), n;
      if (a instanceof he)
        t.push(a.terminalType);
      else
        throw Error("non exhaustive match");
    }
    s++;
  }
  return n.push({
    partialPath: t,
    suffixDef: Ie(i, s)
  }), n;
}
function i0(i, e, t, n) {
  const s = "EXIT_NONE_TERMINAL", r = [s], o = "EXIT_ALTERNATIVE";
  let a = !1;
  const l = e.length, h = l - n - 1, c = [], u = [];
  for (u.push({
    idx: -1,
    def: i,
    ruleStack: [],
    occurrenceStack: []
  }); !ne(u); ) {
    const f = u.pop();
    if (f === o) {
      a && An(u).idx <= h && u.pop();
      continue;
    }
    const d = f.def, p = f.idx, m = f.ruleStack, g = f.occurrenceStack;
    if (ne(d))
      continue;
    const y = d[0];
    if (y === s) {
      const b = {
        idx: p,
        def: Ie(d),
        ruleStack: hr(m),
        occurrenceStack: hr(g)
      };
      u.push(b);
    } else if (y instanceof he)
      if (p < l - 1) {
        const b = p + 1, v = e[b];
        if (t(v, y.terminalType)) {
          const T = {
            idx: b,
            def: Ie(d),
            ruleStack: m,
            occurrenceStack: g
          };
          u.push(T);
        }
      } else if (p === l - 1)
        c.push({
          nextTokenType: y.terminalType,
          nextTokenOccurrence: y.idx,
          ruleStack: m,
          occurrenceStack: g
        }), a = !0;
      else
        throw Error("non exhaustive match");
    else if (y instanceof pt) {
      const b = De(m);
      b.push(y.nonTerminalName);
      const v = De(g);
      v.push(y.idx);
      const T = {
        idx: p,
        def: y.definition.concat(r, Ie(d)),
        ruleStack: b,
        occurrenceStack: v
      };
      u.push(T);
    } else if (y instanceof tt) {
      const b = {
        idx: p,
        def: Ie(d),
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(b), u.push(o);
      const v = {
        idx: p,
        def: y.definition.concat(Ie(d)),
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(v);
    } else if (y instanceof hi) {
      const b = new Ee({
        definition: y.definition,
        idx: y.idx
      }), v = y.definition.concat([b], Ie(d)), T = {
        idx: p,
        def: v,
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(T);
    } else if (y instanceof ci) {
      const b = new he({
        terminalType: y.separator
      }), v = new Ee({
        definition: [b].concat(y.definition),
        idx: y.idx
      }), T = y.definition.concat([v], Ie(d)), S = {
        idx: p,
        def: T,
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(S);
    } else if (y instanceof Vt) {
      const b = {
        idx: p,
        def: Ie(d),
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(b), u.push(o);
      const v = new he({
        terminalType: y.separator
      }), T = new Ee({
        definition: [v].concat(y.definition),
        idx: y.idx
      }), S = y.definition.concat([T], Ie(d)), A = {
        idx: p,
        def: S,
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(A);
    } else if (y instanceof Ee) {
      const b = {
        idx: p,
        def: Ie(d),
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(b), u.push(o);
      const v = new Ee({
        definition: y.definition,
        idx: y.idx
      }), T = y.definition.concat([v], Ie(d)), S = {
        idx: p,
        def: T,
        ruleStack: m,
        occurrenceStack: g
      };
      u.push(S);
    } else if (y instanceof jt)
      for (let b = y.definition.length - 1; b >= 0; b--) {
        const v = y.definition[b], T = {
          idx: p,
          def: v.definition.concat(Ie(d)),
          ruleStack: m,
          occurrenceStack: g
        };
        u.push(T), u.push(o);
      }
    else if (y instanceof st)
      u.push({
        idx: p,
        def: y.definition.concat(Ie(d)),
        ruleStack: m,
        occurrenceStack: g
      });
    else if (y instanceof ds)
      u.push(ZR(y, p, m, g));
    else
      throw Error("non exhaustive match");
  }
  return c;
}
function ZR(i, e, t, n) {
  const s = De(t);
  s.push(i.name);
  const r = De(n);
  return r.push(1), {
    idx: e,
    def: i.definition,
    ruleStack: s,
    occurrenceStack: r
  };
}
var ce;
(function(i) {
  i[i.OPTION = 0] = "OPTION", i[i.REPETITION = 1] = "REPETITION", i[i.REPETITION_MANDATORY = 2] = "REPETITION_MANDATORY", i[i.REPETITION_MANDATORY_WITH_SEPARATOR = 3] = "REPETITION_MANDATORY_WITH_SEPARATOR", i[i.REPETITION_WITH_SEPARATOR = 4] = "REPETITION_WITH_SEPARATOR", i[i.ALTERNATION = 5] = "ALTERNATION";
})(ce || (ce = {}));
function n0(i) {
  if (i instanceof tt || i === "Option")
    return ce.OPTION;
  if (i instanceof Ee || i === "Repetition")
    return ce.REPETITION;
  if (i instanceof hi || i === "RepetitionMandatory")
    return ce.REPETITION_MANDATORY;
  if (i instanceof ci || i === "RepetitionMandatoryWithSeparator")
    return ce.REPETITION_MANDATORY_WITH_SEPARATOR;
  if (i instanceof Vt || i === "RepetitionWithSeparator")
    return ce.REPETITION_WITH_SEPARATOR;
  if (i instanceof jt || i === "Alternation")
    return ce.ALTERNATION;
  throw Error("non exhaustive match");
}
function eN(i, e, t, n, s, r) {
  const o = Qc(i, e, t), a = o0(o) ? ea : Cr;
  return r(o, n, a, s);
}
function tN(i, e, t, n, s, r) {
  const o = Zc(i, e, s, t), a = o0(o) ? ea : Cr;
  return r(o[0], a, n);
}
function iN(i, e, t, n) {
  const s = i.length, r = Dt(i, (o) => Dt(o, (a) => a.length === 1));
  if (e)
    return function(o) {
      const a = I(o, (l) => l.GATE);
      for (let l = 0; l < s; l++) {
        const h = i[l], c = h.length, u = a[l];
        if (!(u !== void 0 && u.call(this) === !1))
          e: for (let f = 0; f < c; f++) {
            const d = h[f], p = d.length;
            for (let m = 0; m < p; m++) {
              const g = this.LA(m + 1);
              if (t(g, d[m]) === !1)
                continue e;
            }
            return l;
          }
      }
    };
  if (r && !n) {
    const o = I(i, (l) => Pt(l)), a = dt(o, (l, h, c) => (P(h, (u) => {
      L(l, u.tokenTypeIdx) || (l[u.tokenTypeIdx] = c), P(u.categoryMatches, (f) => {
        L(l, f) || (l[f] = c);
      });
    }), l), {});
    return function() {
      const l = this.LA(1);
      return a[l.tokenTypeIdx];
    };
  } else
    return function() {
      for (let o = 0; o < s; o++) {
        const a = i[o], l = a.length;
        e: for (let h = 0; h < l; h++) {
          const c = a[h], u = c.length;
          for (let f = 0; f < u; f++) {
            const d = this.LA(f + 1);
            if (t(d, c[f]) === !1)
              continue e;
          }
          return o;
        }
      }
    };
}
function nN(i, e, t) {
  const n = Dt(i, (r) => r.length === 1), s = i.length;
  if (n && !t) {
    const r = Pt(i);
    if (r.length === 1 && ne(r[0].categoryMatches)) {
      const a = r[0].tokenTypeIdx;
      return function() {
        return this.LA(1).tokenTypeIdx === a;
      };
    } else {
      const o = dt(r, (a, l, h) => (a[l.tokenTypeIdx] = !0, P(l.categoryMatches, (c) => {
        a[c] = !0;
      }), a), []);
      return function() {
        const a = this.LA(1);
        return o[a.tokenTypeIdx] === !0;
      };
    }
  } else
    return function() {
      e: for (let r = 0; r < s; r++) {
        const o = i[r], a = o.length;
        for (let l = 0; l < a; l++) {
          const h = this.LA(l + 1);
          if (e(h, o[l]) === !1)
            continue e;
        }
        return !0;
      }
      return !1;
    };
}
class sN extends Pa {
  constructor(e, t, n) {
    super(), this.topProd = e, this.targetOccurrence = t, this.targetProdType = n;
  }
  startWalking() {
    return this.walk(this.topProd), this.restDef;
  }
  checkIsTarget(e, t, n, s) {
    return e.idx === this.targetOccurrence && this.targetProdType === t ? (this.restDef = n.concat(s), !0) : !1;
  }
  walkOption(e, t, n) {
    this.checkIsTarget(e, ce.OPTION, t, n) || super.walkOption(e, t, n);
  }
  walkAtLeastOne(e, t, n) {
    this.checkIsTarget(e, ce.REPETITION_MANDATORY, t, n) || super.walkOption(e, t, n);
  }
  walkAtLeastOneSep(e, t, n) {
    this.checkIsTarget(e, ce.REPETITION_MANDATORY_WITH_SEPARATOR, t, n) || super.walkOption(e, t, n);
  }
  walkMany(e, t, n) {
    this.checkIsTarget(e, ce.REPETITION, t, n) || super.walkOption(e, t, n);
  }
  walkManySep(e, t, n) {
    this.checkIsTarget(e, ce.REPETITION_WITH_SEPARATOR, t, n) || super.walkOption(e, t, n);
  }
}
class s0 extends ps {
  constructor(e, t, n) {
    super(), this.targetOccurrence = e, this.targetProdType = t, this.targetRef = n, this.result = [];
  }
  checkIsTarget(e, t) {
    e.idx === this.targetOccurrence && this.targetProdType === t && (this.targetRef === void 0 || e === this.targetRef) && (this.result = e.definition);
  }
  visitOption(e) {
    this.checkIsTarget(e, ce.OPTION);
  }
  visitRepetition(e) {
    this.checkIsTarget(e, ce.REPETITION);
  }
  visitRepetitionMandatory(e) {
    this.checkIsTarget(e, ce.REPETITION_MANDATORY);
  }
  visitRepetitionMandatoryWithSeparator(e) {
    this.checkIsTarget(e, ce.REPETITION_MANDATORY_WITH_SEPARATOR);
  }
  visitRepetitionWithSeparator(e) {
    this.checkIsTarget(e, ce.REPETITION_WITH_SEPARATOR);
  }
  visitAlternation(e) {
    this.checkIsTarget(e, ce.ALTERNATION);
  }
}
function zd(i) {
  const e = new Array(i);
  for (let t = 0; t < i; t++)
    e[t] = [];
  return e;
}
function wl(i) {
  let e = [""];
  for (let t = 0; t < i.length; t++) {
    const n = i[t], s = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r];
      s.push(o + "_" + n.tokenTypeIdx);
      for (let a = 0; a < n.categoryMatches.length; a++) {
        const l = "_" + n.categoryMatches[a];
        s.push(o + l);
      }
    }
    e = s;
  }
  return e;
}
function rN(i, e, t) {
  for (let n = 0; n < i.length; n++) {
    if (n === t)
      continue;
    const s = i[n];
    for (let r = 0; r < e.length; r++) {
      const o = e[r];
      if (s[o] === !0)
        return !1;
    }
  }
  return !0;
}
function r0(i, e) {
  const t = I(i, (o) => Ch([o], 1)), n = zd(t.length), s = I(t, (o) => {
    const a = {};
    return P(o, (l) => {
      const h = wl(l.partialPath);
      P(h, (c) => {
        a[c] = !0;
      });
    }), a;
  });
  let r = t;
  for (let o = 1; o <= e; o++) {
    const a = r;
    r = zd(a.length);
    for (let l = 0; l < a.length; l++) {
      const h = a[l];
      for (let c = 0; c < h.length; c++) {
        const u = h[c].partialPath, f = h[c].suffixDef, d = wl(u);
        if (rN(s, d, l) || ne(f) || u.length === e) {
          const m = n[l];
          if (kh(m, u) === !1) {
            m.push(u);
            for (let g = 0; g < d.length; g++) {
              const y = d[g];
              s[l][y] = !0;
            }
          }
        } else {
          const m = Ch(f, o + 1, u);
          r[l] = r[l].concat(m), P(m, (g) => {
            const y = wl(g.partialPath);
            P(y, (b) => {
              s[l][b] = !0;
            });
          });
        }
      }
    }
  }
  return n;
}
function Qc(i, e, t, n) {
  const s = new s0(i, ce.ALTERNATION, n);
  return e.accept(s), r0(s.result, t);
}
function Zc(i, e, t, n) {
  const s = new s0(i, t);
  e.accept(s);
  const r = s.result, a = new sN(e, i, t).startWalking(), l = new st({ definition: r }), h = new st({ definition: a });
  return r0([l, h], n);
}
function kh(i, e) {
  e: for (let t = 0; t < i.length; t++) {
    const n = i[t];
    if (n.length === e.length) {
      for (let s = 0; s < n.length; s++) {
        const r = e[s], o = n[s];
        if ((r === o || o.categoryMatchesMap[r.tokenTypeIdx] !== void 0) === !1)
          continue e;
      }
      return !0;
    }
  }
  return !1;
}
function oN(i, e) {
  return i.length < e.length && Dt(i, (t, n) => {
    const s = e[n];
    return t === s || s.categoryMatchesMap[t.tokenTypeIdx];
  });
}
function o0(i) {
  return Dt(i, (e) => Dt(e, (t) => Dt(t, (n) => ne(n.categoryMatches))));
}
function aN(i) {
  const e = i.lookaheadStrategy.validate({
    rules: i.rules,
    tokenTypes: i.tokenTypes,
    grammarName: i.grammarName
  });
  return I(e, (t) => Object.assign({ type: Ge.CUSTOM_LOOKAHEAD_VALIDATION }, t));
}
function lN(i, e, t, n) {
  const s = Et(i, (l) => hN(l, t)), r = TN(i, e, t), o = Et(i, (l) => yN(l, t)), a = Et(i, (l) => fN(l, i, n, t));
  return s.concat(r, o, a);
}
function hN(i, e) {
  const t = new uN();
  i.accept(t);
  const n = t.allProductions, s = TI(n, cN), r = Ht(s, (a) => a.length > 1);
  return I(Te(r), (a) => {
    const l = Ut(a), h = e.buildDuplicateFoundError(i, a), c = Xt(l), u = {
      message: h,
      type: Ge.DUPLICATE_PRODUCTIONS,
      ruleName: i.name,
      dslName: c,
      occurrence: l.idx
    }, f = a0(l);
    return f && (u.parameter = f), u;
  });
}
function cN(i) {
  return `${Xt(i)}_#_${i.idx}_#_${a0(i)}`;
}
function a0(i) {
  return i instanceof he ? i.terminalType.name : i instanceof pt ? i.nonTerminalName : "";
}
class uN extends ps {
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
function fN(i, e, t, n) {
  const s = [];
  if (dt(e, (o, a) => a.name === i.name ? o + 1 : o, 0) > 1) {
    const o = n.buildDuplicateRuleNameError({
      topLevelRule: i,
      grammarName: t
    });
    s.push({
      message: o,
      type: Ge.DUPLICATE_RULE_NAME,
      ruleName: i.name
    });
  }
  return s;
}
function dN(i, e, t) {
  const n = [];
  let s;
  return qe(e, i) || (s = `Invalid rule override, rule: ->${i}<- cannot be overridden in the grammar: ->${t}<-as it is not defined in any of the super grammars `, n.push({
    message: s,
    type: Ge.INVALID_RULE_OVERRIDE,
    ruleName: i
  })), n;
}
function l0(i, e, t, n = []) {
  const s = [], r = bo(e.definition);
  if (ne(r))
    return [];
  {
    const o = i.name;
    qe(r, i) && s.push({
      message: t.buildLeftRecursionError({
        topLevelRule: i,
        leftRecursionPath: n
      }),
      type: Ge.LEFT_RECURSION,
      ruleName: o
    });
    const l = Ma(r, n.concat([i])), h = Et(l, (c) => {
      const u = De(n);
      return u.push(c), l0(i, c, t, u);
    });
    return s.concat(h);
  }
}
function bo(i) {
  let e = [];
  if (ne(i))
    return e;
  const t = Ut(i);
  if (t instanceof pt)
    e.push(t.referencedRule);
  else if (t instanceof st || t instanceof tt || t instanceof hi || t instanceof ci || t instanceof Vt || t instanceof Ee)
    e = e.concat(bo(t.definition));
  else if (t instanceof jt)
    e = Pt(I(t.definition, (r) => bo(r.definition)));
  else if (!(t instanceof he)) throw Error("non exhaustive match");
  const n = Xo(t), s = i.length > 1;
  if (n && s) {
    const r = Ie(i);
    return e.concat(bo(r));
  } else
    return e;
}
class eu extends ps {
  constructor() {
    super(...arguments), this.alternations = [];
  }
  visitAlternation(e) {
    this.alternations.push(e);
  }
}
function pN(i, e) {
  const t = new eu();
  i.accept(t);
  const n = t.alternations;
  return Et(n, (r) => {
    const o = hr(r.definition);
    return Et(o, (a, l) => {
      const h = i0([a], [], Cr, 1);
      return ne(h) ? [
        {
          message: e.buildEmptyAlternationError({
            topLevelRule: i,
            alternation: r,
            emptyChoiceIdx: l
          }),
          type: Ge.NONE_LAST_EMPTY_ALT,
          ruleName: i.name,
          occurrence: r.idx,
          alternative: l + 1
        }
      ] : [];
    });
  });
}
function mN(i, e, t) {
  const n = new eu();
  i.accept(n);
  let s = n.alternations;
  return s = La(s, (o) => o.ignoreAmbiguities === !0), Et(s, (o) => {
    const a = o.idx, l = o.maxLookahead || e, h = Qc(a, i, l, o), c = vN(h, o, i, t), u = SN(h, o, i, t);
    return c.concat(u);
  });
}
class gN extends ps {
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
function yN(i, e) {
  const t = new eu();
  i.accept(t);
  const n = t.alternations;
  return Et(n, (r) => r.definition.length > 255 ? [
    {
      message: e.buildTooManyAlternativesError({
        topLevelRule: i,
        alternation: r
      }),
      type: Ge.TOO_MANY_ALTS,
      ruleName: i.name,
      occurrence: r.idx
    }
  ] : []);
}
function bN(i, e, t) {
  const n = [];
  return P(i, (s) => {
    const r = new gN();
    s.accept(r);
    const o = r.allProductions;
    P(o, (a) => {
      const l = n0(a), h = a.maxLookahead || e, c = a.idx, f = Zc(c, s, l, h)[0];
      if (ne(Pt(f))) {
        const d = t.buildEmptyRepetitionError({
          topLevelRule: s,
          repetition: a
        });
        n.push({
          message: d,
          type: Ge.NO_NON_EMPTY_LOOKAHEAD,
          ruleName: s.name
        });
      }
    });
  }), n;
}
function vN(i, e, t, n) {
  const s = [], r = dt(i, (a, l, h) => (e.definition[h].ignoreAmbiguities === !0 || P(l, (c) => {
    const u = [h];
    P(i, (f, d) => {
      h !== d && kh(f, c) && // ignore (skip) ambiguities with this "other" alternative
      e.definition[d].ignoreAmbiguities !== !0 && u.push(d);
    }), u.length > 1 && !kh(s, c) && (s.push(c), a.push({
      alts: u,
      path: c
    }));
  }), a), []);
  return I(r, (a) => {
    const l = I(a.alts, (c) => c + 1);
    return {
      message: n.buildAlternationAmbiguityError({
        topLevelRule: t,
        alternation: e,
        ambiguityIndices: l,
        prefixPath: a.path
      }),
      type: Ge.AMBIGUOUS_ALTS,
      ruleName: t.name,
      occurrence: e.idx,
      alternatives: a.alts
    };
  });
}
function SN(i, e, t, n) {
  const s = dt(i, (o, a, l) => {
    const h = I(a, (c) => ({ idx: l, path: c }));
    return o.concat(h);
  }, []);
  return Ar(Et(s, (o) => {
    if (e.definition[o.idx].ignoreAmbiguities === !0)
      return [];
    const l = o.idx, h = o.path, c = Ot(s, (f) => (
      // ignore (skip) ambiguities with this "other" alternative
      e.definition[f.idx].ignoreAmbiguities !== !0 && f.idx < l && // checking for strict prefix because identical lookaheads
      // will be be detected using a different validation.
      oN(f.path, h)
    ));
    return I(c, (f) => {
      const d = [f.idx + 1, l + 1], p = e.idx === 0 ? "" : e.idx;
      return {
        message: n.buildAlternationPrefixAmbiguityError({
          topLevelRule: t,
          alternation: e,
          ambiguityIndices: d,
          prefixPath: f.path
        }),
        type: Ge.AMBIGUOUS_PREFIX_ALTS,
        ruleName: t.name,
        occurrence: p,
        alternatives: d
      };
    });
  }));
}
function TN(i, e, t) {
  const n = [], s = I(e, (r) => r.name);
  return P(i, (r) => {
    const o = r.name;
    if (qe(s, o)) {
      const a = t.buildNamespaceConflictError(r);
      n.push({
        message: a,
        type: Ge.CONFLICT_TOKENS_RULES_NAMESPACE,
        ruleName: o
      });
    }
  }), n;
}
function xN(i) {
  const e = Kc(i, {
    errMsgProvider: GR
  }), t = {};
  return P(i.rules, (n) => {
    t[n.name] = n;
  }), KR(t, e.errMsgProvider);
}
function EN(i) {
  return i = Kc(i, {
    errMsgProvider: fn
  }), lN(i.rules, i.tokenTypes, i.errMsgProvider, i.grammarName);
}
const h0 = "MismatchedTokenException", c0 = "NoViableAltException", u0 = "EarlyExitException", f0 = "NotAllInputParsedException", d0 = [
  h0,
  c0,
  u0,
  f0
];
Object.freeze(d0);
function ta(i) {
  return qe(d0, i.name);
}
class Ba extends Error {
  constructor(e, t) {
    super(e), this.token = t, this.resyncedTokens = [], Object.setPrototypeOf(this, new.target.prototype), Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }
}
class p0 extends Ba {
  constructor(e, t, n) {
    super(e, t), this.previousToken = n, this.name = h0;
  }
}
class AN extends Ba {
  constructor(e, t, n) {
    super(e, t), this.previousToken = n, this.name = c0;
  }
}
class wN extends Ba {
  constructor(e, t) {
    super(e, t), this.name = f0;
  }
}
class CN extends Ba {
  constructor(e, t, n) {
    super(e, t), this.previousToken = n, this.name = u0;
  }
}
const Cl = {}, m0 = "InRuleRecoveryException";
class kN extends Error {
  constructor(e) {
    super(e), this.name = m0;
  }
}
class _N {
  initRecoverable(e) {
    this.firstAfterRepMap = {}, this.resyncFollows = {}, this.recoveryEnabled = L(e, "recoveryEnabled") ? e.recoveryEnabled : Ai.recoveryEnabled, this.recoveryEnabled && (this.attemptInRepetitionRecovery = ON);
  }
  getTokenToInsert(e) {
    const t = Jc(e, "", NaN, NaN, NaN, NaN, NaN, NaN);
    return t.isInsertedInRecovery = !0, t;
  }
  canTokenTypeBeInsertedInRecovery(e) {
    return !0;
  }
  canTokenTypeBeDeletedInRecovery(e) {
    return !0;
  }
  tryInRepetitionRecovery(e, t, n, s) {
    const r = this.findReSyncTokenType(), o = this.exportLexerState(), a = [];
    let l = !1;
    const h = this.LA(1);
    let c = this.LA(1);
    const u = () => {
      const f = this.LA(0), d = this.errorMessageProvider.buildMismatchTokenMessage({
        expected: s,
        actual: h,
        previous: f,
        ruleName: this.getCurrRuleFullName()
      }), p = new p0(d, h, this.LA(0));
      p.resyncedTokens = hr(a), this.SAVE_ERROR(p);
    };
    for (; !l; )
      if (this.tokenMatcher(c, s)) {
        u();
        return;
      } else if (n.call(this)) {
        u(), e.apply(this, t);
        return;
      } else this.tokenMatcher(c, r) ? l = !0 : (c = this.SKIP_TOKEN(), this.addToResyncTokens(c, a));
    this.importLexerState(o);
  }
  shouldInRepetitionRecoveryBeTried(e, t, n) {
    return !(n === !1 || this.tokenMatcher(this.LA(1), e) || this.isBackTracking() || this.canPerformInRuleRecovery(e, this.getFollowsForInRuleRecovery(e, t)));
  }
  // Error Recovery functionality
  getFollowsForInRuleRecovery(e, t) {
    const n = this.getCurrentGrammarPath(e, t);
    return this.getNextPossibleTokenTypes(n);
  }
  tryInRuleRecovery(e, t) {
    if (this.canRecoverWithSingleTokenInsertion(e, t))
      return this.getTokenToInsert(e);
    if (this.canRecoverWithSingleTokenDeletion(e)) {
      const n = this.SKIP_TOKEN();
      return this.consumeToken(), n;
    }
    throw new kN("sad sad panda");
  }
  canPerformInRuleRecovery(e, t) {
    return this.canRecoverWithSingleTokenInsertion(e, t) || this.canRecoverWithSingleTokenDeletion(e);
  }
  canRecoverWithSingleTokenInsertion(e, t) {
    if (!this.canTokenTypeBeInsertedInRecovery(e) || ne(t))
      return !1;
    const n = this.LA(1);
    return cs(t, (r) => this.tokenMatcher(n, r)) !== void 0;
  }
  canRecoverWithSingleTokenDeletion(e) {
    return this.canTokenTypeBeDeletedInRecovery(e) ? this.tokenMatcher(this.LA(2), e) : !1;
  }
  isInCurrentRuleReSyncSet(e) {
    const t = this.getCurrFollowKey(), n = this.getFollowSetFromFollowKey(t);
    return qe(n, e);
  }
  findReSyncTokenType() {
    const e = this.flattenFollowSet();
    let t = this.LA(1), n = 2;
    for (; ; ) {
      const s = cs(e, (r) => zR(t, r));
      if (s !== void 0)
        return s;
      t = this.LA(n), n++;
    }
  }
  getCurrFollowKey() {
    if (this.RULE_STACK.length === 1)
      return Cl;
    const e = this.getLastExplicitRuleShortName(), t = this.getLastExplicitRuleOccurrenceIndex(), n = this.getPreviousExplicitRuleShortName();
    return {
      ruleName: this.shortRuleNameToFullName(e),
      idxInCallingRule: t,
      inRule: this.shortRuleNameToFullName(n)
    };
  }
  buildFullFollowKeyStack() {
    const e = this.RULE_STACK, t = this.RULE_OCCURRENCE_STACK;
    return I(e, (n, s) => s === 0 ? Cl : {
      ruleName: this.shortRuleNameToFullName(n),
      idxInCallingRule: t[s],
      inRule: this.shortRuleNameToFullName(e[s - 1])
    });
  }
  flattenFollowSet() {
    const e = I(this.buildFullFollowKeyStack(), (t) => this.getFollowSetFromFollowKey(t));
    return Pt(e);
  }
  getFollowSetFromFollowKey(e) {
    if (e === Cl)
      return [Cn];
    const t = e.ruleName + e.idxInCallingRule + zy + e.inRule;
    return this.resyncFollows[t];
  }
  // It does not make any sense to include a virtual EOF token in the list of resynced tokens
  // as EOF does not really exist and thus does not contain any useful information (line/column numbers)
  addToResyncTokens(e, t) {
    return this.tokenMatcher(e, Cn) || t.push(e), t;
  }
  reSyncTo(e) {
    const t = [];
    let n = this.LA(1);
    for (; this.tokenMatcher(n, e) === !1; )
      n = this.SKIP_TOKEN(), this.addToResyncTokens(n, t);
    return hr(t);
  }
  attemptInRepetitionRecovery(e, t, n, s, r, o, a) {
  }
  getCurrentGrammarPath(e, t) {
    const n = this.getHumanReadableRuleStack(), s = De(this.RULE_OCCURRENCE_STACK);
    return {
      ruleStack: n,
      occurrenceStack: s,
      lastTok: e,
      lastTokOccurrence: t
    };
  }
  getHumanReadableRuleStack() {
    return I(this.RULE_STACK, (e) => this.shortRuleNameToFullName(e));
  }
}
function ON(i, e, t, n, s, r, o) {
  const a = this.getKeyForAutomaticLookahead(n, s);
  let l = this.firstAfterRepMap[a];
  if (l === void 0) {
    const f = this.getCurrRuleFullName(), d = this.getGAstProductions()[f];
    l = new r(d, s).startWalking(), this.firstAfterRepMap[a] = l;
  }
  let h = l.token, c = l.occurrence;
  const u = l.isEndOfRule;
  this.RULE_STACK.length === 1 && u && h === void 0 && (h = Cn, c = 1), !(h === void 0 || c === void 0) && this.shouldInRepetitionRecoveryBeTried(h, c, o) && this.tryInRepetitionRecovery(i, e, t, h);
}
const IN = 4, tn = 8, g0 = 1 << tn, y0 = 2 << tn, _h = 3 << tn, Oh = 4 << tn, Ih = 5 << tn, vo = 6 << tn;
function kl(i, e, t) {
  return t | e | i;
}
class RN {
  constructor(e) {
    var t;
    this.maxLookahead = (t = e == null ? void 0 : e.maxLookahead) !== null && t !== void 0 ? t : Ai.maxLookahead;
  }
  validate(e) {
    const t = this.validateNoLeftRecursion(e.rules);
    if (ne(t)) {
      const n = this.validateEmptyOrAlternatives(e.rules), s = this.validateAmbiguousAlternationAlternatives(e.rules, this.maxLookahead), r = this.validateSomeNonEmptyLookaheadPath(e.rules, this.maxLookahead);
      return [
        ...t,
        ...n,
        ...s,
        ...r
      ];
    }
    return t;
  }
  validateNoLeftRecursion(e) {
    return Et(e, (t) => l0(t, t, fn));
  }
  validateEmptyOrAlternatives(e) {
    return Et(e, (t) => pN(t, fn));
  }
  validateAmbiguousAlternationAlternatives(e, t) {
    return Et(e, (n) => mN(n, t, fn));
  }
  validateSomeNonEmptyLookaheadPath(e, t) {
    return bN(e, t, fn);
  }
  buildLookaheadForAlternation(e) {
    return eN(e.prodOccurrence, e.rule, e.maxLookahead, e.hasPredicates, e.dynamicTokensEnabled, iN);
  }
  buildLookaheadForOptional(e) {
    return tN(e.prodOccurrence, e.rule, e.maxLookahead, e.dynamicTokensEnabled, n0(e.prodType), nN);
  }
}
class NN {
  initLooksAhead(e) {
    this.dynamicTokensEnabled = L(e, "dynamicTokensEnabled") ? e.dynamicTokensEnabled : Ai.dynamicTokensEnabled, this.maxLookahead = L(e, "maxLookahead") ? e.maxLookahead : Ai.maxLookahead, this.lookaheadStrategy = L(e, "lookaheadStrategy") ? e.lookaheadStrategy : new RN({ maxLookahead: this.maxLookahead }), this.lookAheadFuncsCache = /* @__PURE__ */ new Map();
  }
  preComputeLookaheadFunctions(e) {
    P(e, (t) => {
      this.TRACE_INIT(`${t.name} Rule Lookahead`, () => {
        const { alternation: n, repetition: s, option: r, repetitionMandatory: o, repetitionMandatoryWithSeparator: a, repetitionWithSeparator: l } = LN(t);
        P(n, (h) => {
          const c = h.idx === 0 ? "" : h.idx;
          this.TRACE_INIT(`${Xt(h)}${c}`, () => {
            const u = this.lookaheadStrategy.buildLookaheadForAlternation({
              prodOccurrence: h.idx,
              rule: t,
              maxLookahead: h.maxLookahead || this.maxLookahead,
              hasPredicates: h.hasPredicates,
              dynamicTokensEnabled: this.dynamicTokensEnabled
            }), f = kl(this.fullRuleNameToShort[t.name], g0, h.idx);
            this.setLaFuncCache(f, u);
          });
        }), P(s, (h) => {
          this.computeLookaheadFunc(t, h.idx, _h, "Repetition", h.maxLookahead, Xt(h));
        }), P(r, (h) => {
          this.computeLookaheadFunc(t, h.idx, y0, "Option", h.maxLookahead, Xt(h));
        }), P(o, (h) => {
          this.computeLookaheadFunc(t, h.idx, Oh, "RepetitionMandatory", h.maxLookahead, Xt(h));
        }), P(a, (h) => {
          this.computeLookaheadFunc(t, h.idx, vo, "RepetitionMandatoryWithSeparator", h.maxLookahead, Xt(h));
        }), P(l, (h) => {
          this.computeLookaheadFunc(t, h.idx, Ih, "RepetitionWithSeparator", h.maxLookahead, Xt(h));
        });
      });
    });
  }
  computeLookaheadFunc(e, t, n, s, r, o) {
    this.TRACE_INIT(`${o}${t === 0 ? "" : t}`, () => {
      const a = this.lookaheadStrategy.buildLookaheadForOptional({
        prodOccurrence: t,
        rule: e,
        maxLookahead: r || this.maxLookahead,
        dynamicTokensEnabled: this.dynamicTokensEnabled,
        prodType: s
      }), l = kl(this.fullRuleNameToShort[e.name], n, t);
      this.setLaFuncCache(l, a);
    });
  }
  // this actually returns a number, but it is always used as a string (object prop key)
  getKeyForAutomaticLookahead(e, t) {
    const n = this.getLastExplicitRuleShortName();
    return kl(n, e, t);
  }
  getLaFuncFromCache(e) {
    return this.lookAheadFuncsCache.get(e);
  }
  /* istanbul ignore next */
  setLaFuncCache(e, t) {
    this.lookAheadFuncsCache.set(e, t);
  }
}
class MN extends ps {
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
const eo = new MN();
function LN(i) {
  eo.reset(), i.accept(eo);
  const e = eo.dslMethods;
  return eo.reset(), e;
}
function Gd(i, e) {
  isNaN(i.startOffset) === !0 ? (i.startOffset = e.startOffset, i.endOffset = e.endOffset) : i.endOffset < e.endOffset && (i.endOffset = e.endOffset);
}
function Kd(i, e) {
  isNaN(i.startOffset) === !0 ? (i.startOffset = e.startOffset, i.startColumn = e.startColumn, i.startLine = e.startLine, i.endOffset = e.endOffset, i.endColumn = e.endColumn, i.endLine = e.endLine) : i.endOffset < e.endOffset && (i.endOffset = e.endOffset, i.endColumn = e.endColumn, i.endLine = e.endLine);
}
function PN(i, e, t) {
  i.children[t] === void 0 ? i.children[t] = [e] : i.children[t].push(e);
}
function DN(i, e, t) {
  i.children[e] === void 0 ? i.children[e] = [t] : i.children[e].push(t);
}
const $N = "name";
function b0(i, e) {
  Object.defineProperty(i, $N, {
    enumerable: !1,
    configurable: !0,
    writable: !1,
    value: e
  });
}
function BN(i, e) {
  const t = kt(i), n = t.length;
  for (let s = 0; s < n; s++) {
    const r = t[s], o = i[r], a = o.length;
    for (let l = 0; l < a; l++) {
      const h = o[l];
      h.tokenTypeIdx === void 0 && this[h.name](h.children, e);
    }
  }
}
function UN(i, e) {
  const t = function() {
  };
  b0(t, i + "BaseSemantics");
  const n = {
    visit: function(s, r) {
      if (X(s) && (s = s[0]), !Ei(s))
        return this[s.name](s.children, r);
    },
    validateVisitor: function() {
      const s = WN(this, e);
      if (!ne(s)) {
        const r = I(s, (o) => o.msg);
        throw Error(`Errors Detected in CST Visitor <${this.constructor.name}>:
	${r.join(`

`).replace(/\n/g, `
	`)}`);
      }
    }
  };
  return t.prototype = n, t.prototype.constructor = t, t._RULE_NAMES = e, t;
}
function FN(i, e, t) {
  const n = function() {
  };
  b0(n, i + "BaseSemanticsWithDefaults");
  const s = Object.create(t.prototype);
  return P(e, (r) => {
    s[r] = BN;
  }), n.prototype = s, n.prototype.constructor = n, n;
}
var Rh;
(function(i) {
  i[i.REDUNDANT_METHOD = 0] = "REDUNDANT_METHOD", i[i.MISSING_METHOD = 1] = "MISSING_METHOD";
})(Rh || (Rh = {}));
function WN(i, e) {
  return HN(i, e);
}
function HN(i, e) {
  const t = Ot(e, (s) => _i(i[s]) === !1), n = I(t, (s) => ({
    msg: `Missing visitor method: <${s}> on ${i.constructor.name} CST Visitor.`,
    type: Rh.MISSING_METHOD,
    methodName: s
  }));
  return Ar(n);
}
class VN {
  initTreeBuilder(e) {
    if (this.CST_STACK = [], this.outputCst = e.outputCst, this.nodeLocationTracking = L(e, "nodeLocationTracking") ? e.nodeLocationTracking : Ai.nodeLocationTracking, !this.outputCst)
      this.cstInvocationStateUpdate = Se, this.cstFinallyStateUpdate = Se, this.cstPostTerminal = Se, this.cstPostNonTerminal = Se, this.cstPostRule = Se;
    else if (/full/i.test(this.nodeLocationTracking))
      this.recoveryEnabled ? (this.setNodeLocationFromToken = Kd, this.setNodeLocationFromNode = Kd, this.cstPostRule = Se, this.setInitialNodeLocation = this.setInitialNodeLocationFullRecovery) : (this.setNodeLocationFromToken = Se, this.setNodeLocationFromNode = Se, this.cstPostRule = this.cstPostRuleFull, this.setInitialNodeLocation = this.setInitialNodeLocationFullRegular);
    else if (/onlyOffset/i.test(this.nodeLocationTracking))
      this.recoveryEnabled ? (this.setNodeLocationFromToken = Gd, this.setNodeLocationFromNode = Gd, this.cstPostRule = Se, this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRecovery) : (this.setNodeLocationFromToken = Se, this.setNodeLocationFromNode = Se, this.cstPostRule = this.cstPostRuleOnlyOffset, this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRegular);
    else if (/none/i.test(this.nodeLocationTracking))
      this.setNodeLocationFromToken = Se, this.setNodeLocationFromNode = Se, this.cstPostRule = Se, this.setInitialNodeLocation = Se;
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
    const t = this.LA(0), n = e.location;
    n.startOffset <= t.startOffset ? (n.endOffset = t.endOffset, n.endLine = t.endLine, n.endColumn = t.endColumn) : (n.startOffset = NaN, n.startLine = NaN, n.startColumn = NaN);
  }
  cstPostRuleOnlyOffset(e) {
    const t = this.LA(0), n = e.location;
    n.startOffset <= t.startOffset ? n.endOffset = t.endOffset : n.startOffset = NaN;
  }
  cstPostTerminal(e, t) {
    const n = this.CST_STACK[this.CST_STACK.length - 1];
    PN(n, t, e), this.setNodeLocationFromToken(n.location, t);
  }
  cstPostNonTerminal(e, t) {
    const n = this.CST_STACK[this.CST_STACK.length - 1];
    DN(n, t, e), this.setNodeLocationFromNode(n.location, e.location);
  }
  getBaseCstVisitorConstructor() {
    if (Ei(this.baseCstVisitorConstructor)) {
      const e = UN(this.className, kt(this.gastProductionsCache));
      return this.baseCstVisitorConstructor = e, e;
    }
    return this.baseCstVisitorConstructor;
  }
  getBaseCstVisitorConstructorWithDefaults() {
    if (Ei(this.baseCstVisitorWithDefaultsConstructor)) {
      const e = FN(this.className, kt(this.gastProductionsCache), this.getBaseCstVisitorConstructor());
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
class jN {
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
    return this.currIdx <= this.tokVector.length - 2 ? (this.consumeToken(), this.LA(1)) : na;
  }
  // Lexer (accessing Token vector) related methods which can be overridden to implement lazy lexers
  // or lexers dependent on parser context.
  LA(e) {
    const t = this.currIdx + e;
    return t < 0 || this.tokVectorLength <= t ? na : this.tokVector[t];
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
class zN {
  ACTION(e) {
    return e.call(this);
  }
  consume(e, t, n) {
    return this.consumeInternal(t, e, n);
  }
  subrule(e, t, n) {
    return this.subruleInternal(t, e, n);
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
  RULE(e, t, n = sa) {
    if (qe(this.definedRulesNames, e)) {
      const o = {
        message: fn.buildDuplicateRuleNameError({
          topLevelRule: e,
          grammarName: this.className
        }),
        type: Ge.DUPLICATE_RULE_NAME,
        ruleName: e
      };
      this.definitionErrors.push(o);
    }
    this.definedRulesNames.push(e);
    const s = this.defineRule(e, t, n);
    return this[e] = s, s;
  }
  OVERRIDE_RULE(e, t, n = sa) {
    const s = dN(e, this.definedRulesNames, this.className);
    this.definitionErrors = this.definitionErrors.concat(s);
    const r = this.defineRule(e, t, n);
    return this[e] = r, r;
  }
  BACKTRACK(e, t) {
    return function() {
      this.isBackTrackingStack.push(1);
      const n = this.saveRecogState();
      try {
        return e.apply(this, t), !0;
      } catch (s) {
        if (ta(s))
          return !1;
        throw s;
      } finally {
        this.reloadRecogState(n), this.isBackTrackingStack.pop();
      }
    };
  }
  // GAST export APIs
  getGAstProductions() {
    return this.gastProductionsCache;
  }
  getSerializedGastProductions() {
    return GI(Te(this.gastProductionsCache));
  }
}
class GN {
  initRecognizerEngine(e, t) {
    if (this.className = this.constructor.name, this.shortRuleNameToFull = {}, this.fullRuleNameToShort = {}, this.ruleShortNameIdx = 256, this.tokenMatcher = ea, this.subruleIdx = 0, this.definedRulesNames = [], this.tokensMap = {}, this.isBackTrackingStack = [], this.RULE_STACK = [], this.RULE_OCCURRENCE_STACK = [], this.gastProductionsCache = {}, L(t, "serializedGrammar"))
      throw Error(`The Parser's configuration can no longer contain a <serializedGrammar> property.
	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_6-0-0
	For Further details.`);
    if (X(e)) {
      if (ne(e))
        throw Error(`A Token Vocabulary cannot be empty.
	Note that the first argument for the parser constructor
	is no longer a Token vector (since v4.0).`);
      if (typeof e[0].startOffset == "number")
        throw Error(`The Parser constructor no longer accepts a token vector as the first argument.
	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_4-0-0
	For Further details.`);
    }
    if (X(e))
      this.tokensMap = dt(e, (r, o) => (r[o.name] = o, r), {});
    else if (L(e, "modes") && Dt(Pt(Te(e.modes)), WR)) {
      const r = Pt(Te(e.modes)), o = qc(r);
      this.tokensMap = dt(o, (a, l) => (a[l.name] = l, a), {});
    } else if (Ct(e))
      this.tokensMap = De(e);
    else
      throw new Error("<tokensDictionary> argument must be An Array of Token constructors, A dictionary of Token constructors or an IMultiModeLexerDefinition");
    this.tokensMap.EOF = Cn;
    const n = L(e, "modes") ? Pt(Te(e.modes)) : Te(e), s = Dt(n, (r) => ne(r.categoryMatches));
    this.tokenMatcher = s ? ea : Cr, kr(Te(this.tokensMap));
  }
  defineRule(e, t, n) {
    if (this.selfAnalysisDone)
      throw Error(`Grammar rule <${e}> may not be defined after the 'performSelfAnalysis' method has been called'
Make sure that all grammar rule definitions are done before 'performSelfAnalysis' is called.`);
    const s = L(n, "resyncEnabled") ? n.resyncEnabled : sa.resyncEnabled, r = L(n, "recoveryValueFunc") ? n.recoveryValueFunc : sa.recoveryValueFunc, o = this.ruleShortNameIdx << IN + tn;
    this.ruleShortNameIdx++, this.shortRuleNameToFull[o] = e, this.fullRuleNameToShort[e] = o;
    let a;
    return this.outputCst === !0 ? a = function(...c) {
      try {
        this.ruleInvocationStateUpdate(o, e, this.subruleIdx), t.apply(this, c);
        const u = this.CST_STACK[this.CST_STACK.length - 1];
        return this.cstPostRule(u), u;
      } catch (u) {
        return this.invokeRuleCatch(u, s, r);
      } finally {
        this.ruleFinallyStateUpdate();
      }
    } : a = function(...c) {
      try {
        return this.ruleInvocationStateUpdate(o, e, this.subruleIdx), t.apply(this, c);
      } catch (u) {
        return this.invokeRuleCatch(u, s, r);
      } finally {
        this.ruleFinallyStateUpdate();
      }
    }, Object.assign(a, { ruleName: e, originalGrammarAction: t });
  }
  invokeRuleCatch(e, t, n) {
    const s = this.RULE_STACK.length === 1, r = t && !this.isBackTracking() && this.recoveryEnabled;
    if (ta(e)) {
      const o = e;
      if (r) {
        const a = this.findReSyncTokenType();
        if (this.isInCurrentRuleReSyncSet(a))
          if (o.resyncedTokens = this.reSyncTo(a), this.outputCst) {
            const l = this.CST_STACK[this.CST_STACK.length - 1];
            return l.recoveredNode = !0, l;
          } else
            return n(e);
        else {
          if (this.outputCst) {
            const l = this.CST_STACK[this.CST_STACK.length - 1];
            l.recoveredNode = !0, o.partialCstResult = l;
          }
          throw o;
        }
      } else {
        if (s)
          return this.moveToTerminatedState(), n(e);
        throw o;
      }
    } else
      throw e;
  }
  // Implementation of parsing DSL
  optionInternal(e, t) {
    const n = this.getKeyForAutomaticLookahead(y0, t);
    return this.optionInternalLogic(e, t, n);
  }
  optionInternalLogic(e, t, n) {
    let s = this.getLaFuncFromCache(n), r;
    if (typeof e != "function") {
      r = e.DEF;
      const o = e.GATE;
      if (o !== void 0) {
        const a = s;
        s = () => o.call(this) && a.call(this);
      }
    } else
      r = e;
    if (s.call(this) === !0)
      return r.call(this);
  }
  atLeastOneInternal(e, t) {
    const n = this.getKeyForAutomaticLookahead(Oh, e);
    return this.atLeastOneInternalLogic(e, t, n);
  }
  atLeastOneInternalLogic(e, t, n) {
    let s = this.getLaFuncFromCache(n), r;
    if (typeof t != "function") {
      r = t.DEF;
      const o = t.GATE;
      if (o !== void 0) {
        const a = s;
        s = () => o.call(this) && a.call(this);
      }
    } else
      r = t;
    if (s.call(this) === !0) {
      let o = this.doSingleRepetition(r);
      for (; s.call(this) === !0 && o === !0; )
        o = this.doSingleRepetition(r);
    } else
      throw this.raiseEarlyExitException(e, ce.REPETITION_MANDATORY, t.ERR_MSG);
    this.attemptInRepetitionRecovery(this.atLeastOneInternal, [e, t], s, Oh, e, QR);
  }
  atLeastOneSepFirstInternal(e, t) {
    const n = this.getKeyForAutomaticLookahead(vo, e);
    this.atLeastOneSepFirstInternalLogic(e, t, n);
  }
  atLeastOneSepFirstInternalLogic(e, t, n) {
    const s = t.DEF, r = t.SEP;
    if (this.getLaFuncFromCache(n).call(this) === !0) {
      s.call(this);
      const a = () => this.tokenMatcher(this.LA(1), r);
      for (; this.tokenMatcher(this.LA(1), r) === !0; )
        this.CONSUME(r), s.call(this);
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        e,
        r,
        a,
        s,
        jd
      ], a, vo, e, jd);
    } else
      throw this.raiseEarlyExitException(e, ce.REPETITION_MANDATORY_WITH_SEPARATOR, t.ERR_MSG);
  }
  manyInternal(e, t) {
    const n = this.getKeyForAutomaticLookahead(_h, e);
    return this.manyInternalLogic(e, t, n);
  }
  manyInternalLogic(e, t, n) {
    let s = this.getLaFuncFromCache(n), r;
    if (typeof t != "function") {
      r = t.DEF;
      const a = t.GATE;
      if (a !== void 0) {
        const l = s;
        s = () => a.call(this) && l.call(this);
      }
    } else
      r = t;
    let o = !0;
    for (; s.call(this) === !0 && o === !0; )
      o = this.doSingleRepetition(r);
    this.attemptInRepetitionRecovery(
      this.manyInternal,
      [e, t],
      s,
      _h,
      e,
      JR,
      // The notStuck parameter is only relevant when "attemptInRepetitionRecovery"
      // is invoked from manyInternal, in the MANY_SEP case and AT_LEAST_ONE[_SEP]
      // An infinite loop cannot occur as:
      // - Either the lookahead is guaranteed to consume something (Single Token Separator)
      // - AT_LEAST_ONE by definition is guaranteed to consume something (or error out).
      o
    );
  }
  manySepFirstInternal(e, t) {
    const n = this.getKeyForAutomaticLookahead(Ih, e);
    this.manySepFirstInternalLogic(e, t, n);
  }
  manySepFirstInternalLogic(e, t, n) {
    const s = t.DEF, r = t.SEP;
    if (this.getLaFuncFromCache(n).call(this) === !0) {
      s.call(this);
      const a = () => this.tokenMatcher(this.LA(1), r);
      for (; this.tokenMatcher(this.LA(1), r) === !0; )
        this.CONSUME(r), s.call(this);
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        e,
        r,
        a,
        s,
        Vd
      ], a, Ih, e, Vd);
    }
  }
  repetitionSepSecondInternal(e, t, n, s, r) {
    for (; n(); )
      this.CONSUME(t), s.call(this);
    this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
      e,
      t,
      n,
      s,
      r
    ], n, vo, e, r);
  }
  doSingleRepetition(e) {
    const t = this.getLexerPosition();
    return e.call(this), this.getLexerPosition() > t;
  }
  orInternal(e, t) {
    const n = this.getKeyForAutomaticLookahead(g0, t), s = X(e) ? e : e.DEF, o = this.getLaFuncFromCache(n).call(this, s);
    if (o !== void 0)
      return s[o].ALT.call(this);
    this.raiseNoAltException(t, e.ERR_MSG);
  }
  ruleFinallyStateUpdate() {
    if (this.RULE_STACK.pop(), this.RULE_OCCURRENCE_STACK.pop(), this.cstFinallyStateUpdate(), this.RULE_STACK.length === 0 && this.isAtEndOfInput() === !1) {
      const e = this.LA(1), t = this.errorMessageProvider.buildNotAllInputParsedMessage({
        firstRedundant: e,
        ruleName: this.getCurrRuleFullName()
      });
      this.SAVE_ERROR(new wN(t, e));
    }
  }
  subruleInternal(e, t, n) {
    let s;
    try {
      const r = n !== void 0 ? n.ARGS : void 0;
      return this.subruleIdx = t, s = e.apply(this, r), this.cstPostNonTerminal(s, n !== void 0 && n.LABEL !== void 0 ? n.LABEL : e.ruleName), s;
    } catch (r) {
      throw this.subruleInternalError(r, n, e.ruleName);
    }
  }
  subruleInternalError(e, t, n) {
    throw ta(e) && e.partialCstResult !== void 0 && (this.cstPostNonTerminal(e.partialCstResult, t !== void 0 && t.LABEL !== void 0 ? t.LABEL : n), delete e.partialCstResult), e;
  }
  consumeInternal(e, t, n) {
    let s;
    try {
      const r = this.LA(1);
      this.tokenMatcher(r, e) === !0 ? (this.consumeToken(), s = r) : this.consumeInternalError(e, r, n);
    } catch (r) {
      s = this.consumeInternalRecovery(e, t, r);
    }
    return this.cstPostTerminal(n !== void 0 && n.LABEL !== void 0 ? n.LABEL : e.name, s), s;
  }
  consumeInternalError(e, t, n) {
    let s;
    const r = this.LA(0);
    throw n !== void 0 && n.ERR_MSG ? s = n.ERR_MSG : s = this.errorMessageProvider.buildMismatchTokenMessage({
      expected: e,
      actual: t,
      previous: r,
      ruleName: this.getCurrRuleFullName()
    }), this.SAVE_ERROR(new p0(s, t, r));
  }
  consumeInternalRecovery(e, t, n) {
    if (this.recoveryEnabled && // TODO: more robust checking of the exception type. Perhaps Typescript extending expressions?
    n.name === "MismatchedTokenException" && !this.isBackTracking()) {
      const s = this.getFollowsForInRuleRecovery(e, t);
      try {
        return this.tryInRuleRecovery(e, s);
      } catch (r) {
        throw r.name === m0 ? n : r;
      }
    } else
      throw n;
  }
  saveRecogState() {
    const e = this.errors, t = De(this.RULE_STACK);
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
  ruleInvocationStateUpdate(e, t, n) {
    this.RULE_OCCURRENCE_STACK.push(n), this.RULE_STACK.push(e), this.cstInvocationStateUpdate(t);
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
    return this.tokenMatcher(this.LA(1), Cn);
  }
  reset() {
    this.resetLexerState(), this.subruleIdx = 0, this.isBackTrackingStack = [], this.errors = [], this.RULE_STACK = [], this.CST_STACK = [], this.RULE_OCCURRENCE_STACK = [];
  }
}
class KN {
  initErrorHandler(e) {
    this._errors = [], this.errorMessageProvider = L(e, "errorMessageProvider") ? e.errorMessageProvider : Ai.errorMessageProvider;
  }
  SAVE_ERROR(e) {
    if (ta(e))
      return e.context = {
        ruleStack: this.getHumanReadableRuleStack(),
        ruleOccurrenceStack: De(this.RULE_OCCURRENCE_STACK)
      }, this._errors.push(e), e;
    throw Error("Trying to save an Error which is not a RecognitionException");
  }
  get errors() {
    return De(this._errors);
  }
  set errors(e) {
    this._errors = e;
  }
  // TODO: consider caching the error message computed information
  raiseEarlyExitException(e, t, n) {
    const s = this.getCurrRuleFullName(), r = this.getGAstProductions()[s], a = Zc(e, r, t, this.maxLookahead)[0], l = [];
    for (let c = 1; c <= this.maxLookahead; c++)
      l.push(this.LA(c));
    const h = this.errorMessageProvider.buildEarlyExitMessage({
      expectedIterationPaths: a,
      actual: l,
      previous: this.LA(0),
      customUserDescription: n,
      ruleName: s
    });
    throw this.SAVE_ERROR(new CN(h, this.LA(1), this.LA(0)));
  }
  // TODO: consider caching the error message computed information
  raiseNoAltException(e, t) {
    const n = this.getCurrRuleFullName(), s = this.getGAstProductions()[n], r = Qc(e, s, this.maxLookahead), o = [];
    for (let h = 1; h <= this.maxLookahead; h++)
      o.push(this.LA(h));
    const a = this.LA(0), l = this.errorMessageProvider.buildNoViableAltMessage({
      expectedPathsPerAlt: r,
      actual: o,
      previous: a,
      customUserDescription: t,
      ruleName: this.getCurrRuleFullName()
    });
    throw this.SAVE_ERROR(new AN(l, this.LA(1), a));
  }
}
class qN {
  initContentAssist() {
  }
  computeContentAssist(e, t) {
    const n = this.gastProductionsCache[e];
    if (Ei(n))
      throw Error(`Rule ->${e}<- does not exist in this grammar.`);
    return i0([n], t, this.tokenMatcher, this.maxLookahead);
  }
  // TODO: should this be a member method or a utility? it does not have any state or usage of 'this'...
  // TODO: should this be more explicitly part of the public API?
  getNextPossibleTokenTypes(e) {
    const t = Ut(e.ruleStack), s = this.getGAstProductions()[t];
    return new XR(s, e).startWalking();
  }
}
const Ua = {
  description: "This Object indicates the Parser is during Recording Phase"
};
Object.freeze(Ua);
const qd = !0, Yd = Math.pow(2, tn) - 1, v0 = N({ name: "RECORDING_PHASE_TOKEN", pattern: Be.NA });
kr([v0]);
const S0 = Jc(
  v0,
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
Object.freeze(S0);
const YN = {
  name: `This CSTNode indicates the Parser is in Recording Phase
	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details`,
  children: {}
};
class XN {
  initGastRecorder(e) {
    this.recordingProdStack = [], this.RECORDING_PHASE = !1;
  }
  enableRecording() {
    this.RECORDING_PHASE = !0, this.TRACE_INIT("Enable Recording", () => {
      for (let e = 0; e < 10; e++) {
        const t = e > 0 ? e : "";
        this[`CONSUME${t}`] = function(n, s) {
          return this.consumeInternalRecord(n, e, s);
        }, this[`SUBRULE${t}`] = function(n, s) {
          return this.subruleInternalRecord(n, e, s);
        }, this[`OPTION${t}`] = function(n) {
          return this.optionInternalRecord(n, e);
        }, this[`OR${t}`] = function(n) {
          return this.orInternalRecord(n, e);
        }, this[`MANY${t}`] = function(n) {
          this.manyInternalRecord(e, n);
        }, this[`MANY_SEP${t}`] = function(n) {
          this.manySepFirstInternalRecord(e, n);
        }, this[`AT_LEAST_ONE${t}`] = function(n) {
          this.atLeastOneInternalRecord(e, n);
        }, this[`AT_LEAST_ONE_SEP${t}`] = function(n) {
          this.atLeastOneSepFirstInternalRecord(e, n);
        };
      }
      this.consume = function(e, t, n) {
        return this.consumeInternalRecord(t, e, n);
      }, this.subrule = function(e, t, n) {
        return this.subruleInternalRecord(t, e, n);
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
        const n = t > 0 ? t : "";
        delete e[`CONSUME${n}`], delete e[`SUBRULE${n}`], delete e[`OPTION${n}`], delete e[`OR${n}`], delete e[`MANY${n}`], delete e[`MANY_SEP${n}`], delete e[`AT_LEAST_ONE${n}`], delete e[`AT_LEAST_ONE_SEP${n}`];
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
    return na;
  }
  topLevelRuleRecord(e, t) {
    try {
      const n = new ds({ definition: [], name: e });
      return n.name = e, this.recordingProdStack.push(n), t.call(this), this.recordingProdStack.pop(), n;
    } catch (n) {
      if (n.KNOWN_RECORDER_ERROR !== !0)
        try {
          n.message = n.message + `
	 This error was thrown during the "grammar recording phase" For more info see:
	https://chevrotain.io/docs/guide/internals.html#grammar-recording`;
        } catch {
          throw n;
        }
      throw n;
    }
  }
  // Implementation of parsing DSL
  optionInternalRecord(e, t) {
    return Es.call(this, tt, e, t);
  }
  atLeastOneInternalRecord(e, t) {
    Es.call(this, hi, t, e);
  }
  atLeastOneSepFirstInternalRecord(e, t) {
    Es.call(this, ci, t, e, qd);
  }
  manyInternalRecord(e, t) {
    Es.call(this, Ee, t, e);
  }
  manySepFirstInternalRecord(e, t) {
    Es.call(this, Vt, t, e, qd);
  }
  orInternalRecord(e, t) {
    return JN.call(this, e, t);
  }
  subruleInternalRecord(e, t, n) {
    if (ia(t), !e || L(e, "ruleName") === !1) {
      const a = new Error(`<SUBRULE${Xd(t)}> argument is invalid expecting a Parser method reference but got: <${JSON.stringify(e)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
      throw a.KNOWN_RECORDER_ERROR = !0, a;
    }
    const s = An(this.recordingProdStack), r = e.ruleName, o = new pt({
      idx: t,
      nonTerminalName: r,
      label: n == null ? void 0 : n.LABEL,
      // The resolving of the `referencedRule` property will be done once all the Rule's GASTs have been created
      referencedRule: void 0
    });
    return s.definition.push(o), this.outputCst ? YN : Ua;
  }
  consumeInternalRecord(e, t, n) {
    if (ia(t), !Zy(e)) {
      const o = new Error(`<CONSUME${Xd(t)}> argument is invalid expecting a TokenType reference but got: <${JSON.stringify(e)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
      throw o.KNOWN_RECORDER_ERROR = !0, o;
    }
    const s = An(this.recordingProdStack), r = new he({
      idx: t,
      terminalType: e,
      label: n == null ? void 0 : n.LABEL
    });
    return s.definition.push(r), S0;
  }
}
function Es(i, e, t, n = !1) {
  ia(t);
  const s = An(this.recordingProdStack), r = _i(e) ? e : e.DEF, o = new i({ definition: [], idx: t });
  return n && (o.separator = e.SEP), L(e, "MAX_LOOKAHEAD") && (o.maxLookahead = e.MAX_LOOKAHEAD), this.recordingProdStack.push(o), r.call(this), s.definition.push(o), this.recordingProdStack.pop(), Ua;
}
function JN(i, e) {
  ia(e);
  const t = An(this.recordingProdStack), n = X(i) === !1, s = n === !1 ? i : i.DEF, r = new jt({
    definition: [],
    idx: e,
    ignoreAmbiguities: n && i.IGNORE_AMBIGUITIES === !0
  });
  L(i, "MAX_LOOKAHEAD") && (r.maxLookahead = i.MAX_LOOKAHEAD);
  const o = Wy(s, (a) => _i(a.GATE));
  return r.hasPredicates = o, t.definition.push(r), P(s, (a) => {
    const l = new st({ definition: [] });
    r.definition.push(l), L(a, "IGNORE_AMBIGUITIES") ? l.ignoreAmbiguities = a.IGNORE_AMBIGUITIES : L(a, "GATE") && (l.ignoreAmbiguities = !0), this.recordingProdStack.push(l), a.ALT.call(this), this.recordingProdStack.pop();
  }), Ua;
}
function Xd(i) {
  return i === 0 ? "" : `${i}`;
}
function ia(i) {
  if (i < 0 || i > Yd) {
    const e = new Error(
      // The stack trace will contain all the needed details
      `Invalid DSL Method idx value: <${i}>
	Idx value must be a none negative value smaller than ${Yd + 1}`
    );
    throw e.KNOWN_RECORDER_ERROR = !0, e;
  }
}
class QN {
  initPerformanceTracer(e) {
    if (L(e, "traceInitPerf")) {
      const t = e.traceInitPerf, n = typeof t == "number";
      this.traceInitMaxIdent = n ? t : 1 / 0, this.traceInitPerf = n ? t > 0 : t;
    } else
      this.traceInitMaxIdent = 0, this.traceInitPerf = Ai.traceInitPerf;
    this.traceInitIndent = -1;
  }
  TRACE_INIT(e, t) {
    if (this.traceInitPerf === !0) {
      this.traceInitIndent++;
      const n = new Array(this.traceInitIndent + 1).join("	");
      this.traceInitIndent < this.traceInitMaxIdent && console.log(`${n}--> <${e}>`);
      const { time: s, value: r } = Vy(t), o = s > 10 ? console.warn : console.log;
      return this.traceInitIndent < this.traceInitMaxIdent && o(`${n}<-- <${e}> time: ${s}ms`), this.traceInitIndent--, r;
    } else
      return t();
  }
}
function ZN(i, e) {
  e.forEach((t) => {
    const n = t.prototype;
    Object.getOwnPropertyNames(n).forEach((s) => {
      if (s === "constructor")
        return;
      const r = Object.getOwnPropertyDescriptor(n, s);
      r && (r.get || r.set) ? Object.defineProperty(i.prototype, s, r) : i.prototype[s] = t.prototype[s];
    });
  });
}
const na = Jc(Cn, "", NaN, NaN, NaN, NaN, NaN, NaN);
Object.freeze(na);
const Ai = Object.freeze({
  recoveryEnabled: !1,
  maxLookahead: 3,
  dynamicTokensEnabled: !1,
  outputCst: !0,
  errorMessageProvider: t0,
  nodeLocationTracking: "none",
  traceInitPerf: !1,
  skipValidations: !1
}), sa = Object.freeze({
  recoveryValueFunc: () => {
  },
  resyncEnabled: !0
});
var Ge;
(function(i) {
  i[i.INVALID_RULE_NAME = 0] = "INVALID_RULE_NAME", i[i.DUPLICATE_RULE_NAME = 1] = "DUPLICATE_RULE_NAME", i[i.INVALID_RULE_OVERRIDE = 2] = "INVALID_RULE_OVERRIDE", i[i.DUPLICATE_PRODUCTIONS = 3] = "DUPLICATE_PRODUCTIONS", i[i.UNRESOLVED_SUBRULE_REF = 4] = "UNRESOLVED_SUBRULE_REF", i[i.LEFT_RECURSION = 5] = "LEFT_RECURSION", i[i.NONE_LAST_EMPTY_ALT = 6] = "NONE_LAST_EMPTY_ALT", i[i.AMBIGUOUS_ALTS = 7] = "AMBIGUOUS_ALTS", i[i.CONFLICT_TOKENS_RULES_NAMESPACE = 8] = "CONFLICT_TOKENS_RULES_NAMESPACE", i[i.INVALID_TOKEN_NAME = 9] = "INVALID_TOKEN_NAME", i[i.NO_NON_EMPTY_LOOKAHEAD = 10] = "NO_NON_EMPTY_LOOKAHEAD", i[i.AMBIGUOUS_PREFIX_ALTS = 11] = "AMBIGUOUS_PREFIX_ALTS", i[i.TOO_MANY_ALTS = 12] = "TOO_MANY_ALTS", i[i.CUSTOM_LOOKAHEAD_VALIDATION = 13] = "CUSTOM_LOOKAHEAD_VALIDATION";
})(Ge || (Ge = {}));
class _r {
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
        jy(this);
      }), this.TRACE_INIT("Grammar Recording", () => {
        try {
          this.enableRecording(), P(this.definedRulesNames, (s) => {
            const o = this[s].originalGrammarAction;
            let a;
            this.TRACE_INIT(`${s} Rule`, () => {
              a = this.topLevelRuleRecord(s, o);
            }), this.gastProductionsCache[s] = a;
          });
        } finally {
          this.disableRecording();
        }
      });
      let n = [];
      if (this.TRACE_INIT("Grammar Resolving", () => {
        n = xN({
          rules: Te(this.gastProductionsCache)
        }), this.definitionErrors = this.definitionErrors.concat(n);
      }), this.TRACE_INIT("Grammar Validations", () => {
        if (ne(n) && this.skipValidations === !1) {
          const s = EN({
            rules: Te(this.gastProductionsCache),
            tokenTypes: Te(this.tokensMap),
            errMsgProvider: fn,
            grammarName: t
          }), r = aN({
            lookaheadStrategy: this.lookaheadStrategy,
            rules: Te(this.gastProductionsCache),
            tokenTypes: Te(this.tokensMap),
            grammarName: t
          });
          this.definitionErrors = this.definitionErrors.concat(s, r);
        }
      }), ne(this.definitionErrors) && (this.recoveryEnabled && this.TRACE_INIT("computeAllProdsFollows", () => {
        const s = ZI(Te(this.gastProductionsCache));
        this.resyncFollows = s;
      }), this.TRACE_INIT("ComputeLookaheadFunctions", () => {
        var s, r;
        (r = (s = this.lookaheadStrategy).initialize) === null || r === void 0 || r.call(s, {
          rules: Te(this.gastProductionsCache)
        }), this.preComputeLookaheadFunctions(Te(this.gastProductionsCache));
      })), !_r.DEFER_DEFINITION_ERRORS_HANDLING && !ne(this.definitionErrors))
        throw e = I(this.definitionErrors, (s) => s.message), new Error(`Parser Definition Errors detected:
 ${e.join(`
-------------------------------
`)}`);
    });
  }
  constructor(e, t) {
    this.definitionErrors = [], this.selfAnalysisDone = !1;
    const n = this;
    if (n.initErrorHandler(t), n.initLexerAdapter(), n.initLooksAhead(t), n.initRecognizerEngine(e, t), n.initRecoverable(t), n.initTreeBuilder(t), n.initContentAssist(), n.initGastRecorder(t), n.initPerformanceTracer(t), L(t, "ignoredIssues"))
      throw new Error(`The <ignoredIssues> IParserConfig property has been deprecated.
	Please use the <IGNORE_AMBIGUITIES> flag on the relevant DSL method instead.
	See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#IGNORING_AMBIGUITIES
	For further details.`);
    this.skipValidations = L(t, "skipValidations") ? t.skipValidations : Ai.skipValidations;
  }
}
_r.DEFER_DEFINITION_ERRORS_HANDLING = !1;
ZN(_r, [
  _N,
  NN,
  VN,
  jN,
  GN,
  zN,
  KN,
  qN,
  XN,
  QN
]);
class eM extends _r {
  constructor(e, t = Ai) {
    const n = De(t);
    n.outputCst = !0, super(e, n);
  }
}
const Q = (i, e) => N({ name: i, pattern: new RegExp(`\\b${e}\\b`, "i") }), tM = N({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Be.SKIPPED
}), iM = N({
  name: "LineComment",
  pattern: /\/\/.*/,
  group: Be.SKIPPED
}), nM = N({
  name: "BlockComment",
  pattern: /\(\*[\s\S]*?\*\)/,
  group: Be.SKIPPED
}), T0 = N({
  name: "Pragma",
  pattern: /\{[^}]+\}/
}), x0 = N({
  name: "EndProgram",
  pattern: /END_PROGRAM/i,
  longer_alt: void 0
}), sM = N({
  name: "EndFunction",
  pattern: /END_FUNCTION/i
}), rM = N({
  name: "EndFunctionBlock",
  pattern: /END_FUNCTION_BLOCK/i
}), oM = N({
  name: "FunctionBlock",
  pattern: /FUNCTION_BLOCK/i
}), E0 = N({ name: "EndVar", pattern: /END_VAR/i }), A0 = N({
  name: "VarInput",
  pattern: /VAR_INPUT/i
}), w0 = N({
  name: "VarOutput",
  pattern: /VAR_OUTPUT/i
}), C0 = N({
  name: "VarInOut",
  pattern: /VAR_IN_OUT/i
}), k0 = N({
  name: "VarGlobal",
  pattern: /VAR_GLOBAL/i
}), _0 = N({ name: "EndIf", pattern: /END_IF/i }), O0 = N({ name: "EndCase", pattern: /END_CASE/i }), I0 = N({ name: "EndFor", pattern: /END_FOR/i }), R0 = N({
  name: "EndWhile",
  pattern: /END_WHILE/i
}), N0 = N({
  name: "EndRepeat",
  pattern: /END_REPEAT/i
}), M0 = Q("Program", "PROGRAM"), aM = Q("Function", "FUNCTION"), L0 = Q("Var", "VAR"), lM = Q("Constant", "CONSTANT"), P0 = Q("If", "IF"), Nh = Q("Then", "THEN"), D0 = Q("Elsif", "ELSIF"), Mh = Q("Else", "ELSE"), $0 = Q("Case", "CASE"), B0 = Q("Of", "OF"), U0 = Q("For", "FOR"), F0 = Q("To", "TO"), W0 = Q("By", "BY"), Lh = Q("Do", "DO"), H0 = Q("While", "WHILE"), V0 = Q("Repeat", "REPEAT"), j0 = Q("Until", "UNTIL"), z0 = Q("Return", "RETURN"), G0 = Q("Exit", "EXIT"), hM = Q("Continue", "CONTINUE"), Ph = Q("At", "AT"), K0 = Q("And", "AND"), q0 = Q("Or", "OR"), cM = Q("Xor", "XOR"), Y0 = Q("Not", "NOT"), X0 = Q("Mod", "MOD"), J0 = Q("True", "TRUE"), Q0 = Q("False", "FALSE"), Z0 = Q("TypeBool", "BOOL"), eb = N({
  name: "TypeInt",
  pattern: /\b(DINT|LINT|SINT|USINT|UINT|UDINT|ULINT|INT)\b/i
}), tb = N({
  name: "TypeReal",
  pattern: /\b(LREAL|REAL)\b/i
}), ib = N({
  name: "TypeString",
  pattern: /\b(WSTRING|STRING)\b/i
}), nb = N({
  name: "TypeTime",
  pattern: /\b(TIME_OF_DAY|DATE_AND_TIME|TIME|DATE|TOD|DT)\b/i
}), uM = N({
  name: "TypeByte",
  pattern: /\b(LWORD|DWORD|WORD|BYTE)\b/i
}), sb = N({
  name: "TimeLiteral",
  pattern: /T(IME)?#[\d_]+(\.[\d_]+)?([a-z]+)?/i
}), fM = N({
  name: "HexLiteral",
  pattern: /16#[\da-fA-F_]+/
}), dM = N({
  name: "BinaryLiteral",
  pattern: /2#[01_]+/
}), pM = N({
  name: "OctalLiteral",
  pattern: /8#[0-7_]+/
}), rb = N({
  name: "RealLiteral",
  pattern: /\d+\.\d+([eE][+-]?\d+)?/
}), ob = N({
  name: "IntegerLiteral",
  pattern: /\d+/
}), ab = N({
  name: "StringLiteral",
  pattern: /'([^']|'')*'/
}), Dh = N({
  name: "IoAddress",
  pattern: /%[IQM][XBWDLxbwdl]?(?:[\d.]+|\*)/i
}), Is = N({ name: "Assign", pattern: /:=/ }), mM = N({ name: "Output", pattern: /=>/ }), lb = N({ name: "LessEqual", pattern: /<=/ }), hb = N({
  name: "GreaterEqual",
  pattern: />=/
}), cb = N({ name: "NotEqual", pattern: /<>/ }), ub = N({ name: "Less", pattern: /</ }), fb = N({ name: "Greater", pattern: />/ }), db = N({ name: "Equal", pattern: /=/ }), pb = N({ name: "Plus", pattern: /\+/ }), $h = N({ name: "Minus", pattern: /-/ }), mb = N({ name: "Star", pattern: /\*/ }), gb = N({ name: "Slash", pattern: /\// }), So = N({ name: "LParen", pattern: /\(/ }), To = N({ name: "RParen", pattern: /\)/ }), gM = N({ name: "LBracket", pattern: /\[/ }), yM = N({ name: "RBracket", pattern: /\]/ }), Bh = N({ name: "Colon", pattern: /:/ }), Bn = N({ name: "Semicolon", pattern: /;/ }), Uh = N({ name: "Comma", pattern: /,/ }), Fh = N({ name: "Dot", pattern: /\./ }), yb = N({ name: "Range", pattern: /\.\./ }), It = N({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
}), bb = [
  // Skipped
  tM,
  iM,
  nM,
  // Pragmas
  T0,
  // Multi-word keywords first
  rM,
  oM,
  sM,
  x0,
  A0,
  w0,
  C0,
  k0,
  E0,
  _0,
  O0,
  I0,
  R0,
  N0,
  // Keywords
  M0,
  aM,
  L0,
  lM,
  P0,
  Nh,
  D0,
  Mh,
  $0,
  B0,
  U0,
  F0,
  W0,
  Lh,
  H0,
  V0,
  j0,
  z0,
  G0,
  hM,
  Ph,
  // Logical
  K0,
  q0,
  cM,
  Y0,
  X0,
  J0,
  Q0,
  // Types
  Z0,
  eb,
  tb,
  ib,
  nb,
  uM,
  // Literals (order: specific before general)
  sb,
  fM,
  dM,
  pM,
  rb,
  ob,
  ab,
  // I/O
  Dh,
  // Multi-char operators
  Is,
  mM,
  yb,
  lb,
  hb,
  cb,
  // Single-char operators
  ub,
  fb,
  db,
  pb,
  $h,
  mb,
  gb,
  So,
  To,
  gM,
  yM,
  Bh,
  Bn,
  Uh,
  Fh,
  // Identifier last
  It
], bM = new Be(bb, {
  ensureOptimizations: !0,
  positionTracking: "full"
  // For error reporting
});
function vM(i) {
  const e = bM.tokenize(i);
  return {
    tokens: e.tokens,
    errors: e.errors
  };
}
class SM extends eM {
  constructor() {
    super(bb, {
      recoveryEnabled: !0,
      nodeLocationTracking: "full"
    });
    // Program structure
    E(this, "program", this.RULE("program", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(M0), this.CONSUME(It, { LABEL: "programName" }), this.MANY1(() => this.SUBRULE(this.variableBlock)), this.MANY2(() => this.SUBRULE(this.statement)), this.CONSUME(x0);
    }));
    // Variable declarations
    E(this, "variableBlock", this.RULE("variableBlock", () => {
      this.OR([
        { ALT: () => this.CONSUME(L0) },
        { ALT: () => this.CONSUME(A0) },
        { ALT: () => this.CONSUME(w0) },
        { ALT: () => this.CONSUME(C0) },
        { ALT: () => this.CONSUME(k0) }
      ]), this.MANY(() => this.SUBRULE(this.variableDeclaration)), this.CONSUME(E0);
    }));
    E(this, "variableDeclaration", this.RULE("variableDeclaration", () => {
      this.MANY(() => this.SUBRULE(this.pragma)), this.CONSUME(It, { LABEL: "varName" }), this.OPTION(() => {
        this.CONSUME(Ph), this.CONSUME(Dh);
      }), this.OPTION1(() => {
        this.CONSUME(Bh), this.SUBRULE(this.typeSpec);
      }), this.OPTION2(() => {
        this.CONSUME(Is), this.SUBRULE(this.expression);
      }), this.OPTION3(() => {
        this.CONSUME1(Ph), this.CONSUME1(Dh);
      }), this.CONSUME(Bn);
    }));
    E(this, "pragma", this.RULE("pragma", () => {
      this.CONSUME(T0);
    }));
    E(this, "typeSpec", this.RULE("typeSpec", () => {
      this.OR([
        { ALT: () => this.CONSUME(Z0) },
        { ALT: () => this.CONSUME(eb) },
        { ALT: () => this.CONSUME(tb) },
        { ALT: () => this.CONSUME(ib) },
        { ALT: () => this.CONSUME(nb) },
        { ALT: () => this.CONSUME(It) }
        // Custom type
      ]);
    }));
    // Statements
    E(this, "statement", this.RULE("statement", () => {
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
    E(this, "assignmentStatement", this.RULE("assignmentStatement", () => {
      this.SUBRULE(this.variableReference), this.CONSUME(Is), this.SUBRULE(this.expression), this.CONSUME(Bn);
    }));
    E(this, "ifStatement", this.RULE("ifStatement", () => {
      this.CONSUME(P0), this.SUBRULE(this.expression, { LABEL: "condition" }), this.CONSUME(Nh), this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" })), this.MANY1(() => {
        this.CONSUME(D0), this.SUBRULE1(this.expression, { LABEL: "elsifCondition" }), this.CONSUME1(Nh), this.MANY2(
          () => this.SUBRULE1(this.statement, { LABEL: "elsifStatements" })
        );
      }), this.OPTION(() => {
        this.CONSUME(Mh), this.MANY3(
          () => this.SUBRULE2(this.statement, { LABEL: "elseStatements" })
        );
      }), this.CONSUME(_0);
    }));
    E(this, "caseStatement", this.RULE("caseStatement", () => {
      this.CONSUME($0), this.SUBRULE(this.expression, { LABEL: "selector" }), this.CONSUME(B0), this.MANY(() => this.SUBRULE(this.caseClause)), this.OPTION(() => {
        this.CONSUME(Mh), this.MANY1(() => this.SUBRULE(this.statement));
      }), this.CONSUME(O0);
    }));
    E(this, "caseClause", this.RULE("caseClause", () => {
      this.SUBRULE(this.caseLabelList), this.CONSUME(Bh), this.MANY(() => this.SUBRULE(this.statement));
    }));
    E(this, "caseLabelList", this.RULE("caseLabelList", () => {
      this.SUBRULE(this.caseLabel), this.MANY(() => {
        this.CONSUME(Uh), this.SUBRULE1(this.caseLabel);
      });
    }));
    E(this, "caseLabel", this.RULE("caseLabel", () => {
      this.SUBRULE(this.expression), this.OPTION(() => {
        this.CONSUME(yb), this.SUBRULE1(this.expression);
      });
    }));
    E(this, "forStatement", this.RULE("forStatement", () => {
      this.CONSUME(U0), this.CONSUME(It, { LABEL: "controlVar" }), this.CONSUME(Is), this.SUBRULE(this.expression, { LABEL: "start" }), this.CONSUME(F0), this.SUBRULE1(this.expression, { LABEL: "end" }), this.OPTION(() => {
        this.CONSUME(W0), this.SUBRULE2(this.expression, { LABEL: "step" });
      }), this.CONSUME(Lh), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(I0);
    }));
    E(this, "whileStatement", this.RULE("whileStatement", () => {
      this.CONSUME(H0), this.SUBRULE(this.expression), this.CONSUME(Lh), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(R0);
    }));
    E(this, "repeatStatement", this.RULE("repeatStatement", () => {
      this.CONSUME(V0), this.MANY(() => this.SUBRULE(this.statement)), this.CONSUME(j0), this.SUBRULE(this.expression), this.CONSUME(N0);
    }));
    E(this, "returnStatement", this.RULE("returnStatement", () => {
      this.CONSUME(z0), this.CONSUME(Bn);
    }));
    E(this, "exitStatement", this.RULE("exitStatement", () => {
      this.CONSUME(G0), this.CONSUME(Bn);
    }));
    E(this, "functionCallStatement", this.RULE("functionCallStatement", () => {
      this.SUBRULE(this.functionCall), this.CONSUME(Bn);
    }));
    // Expressions with operator precedence
    E(this, "expression", this.RULE("expression", () => {
      this.SUBRULE(this.orExpression);
    }));
    E(this, "orExpression", this.RULE("orExpression", () => {
      this.SUBRULE(this.andExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(q0), this.SUBRULE1(this.andExpression, { LABEL: "rhs" });
      });
    }));
    E(this, "andExpression", this.RULE("andExpression", () => {
      this.SUBRULE(this.comparisonExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.CONSUME(K0), this.SUBRULE1(this.comparisonExpression, { LABEL: "rhs" });
      });
    }));
    E(this, "comparisonExpression", this.RULE("comparisonExpression", () => {
      this.SUBRULE(this.additiveExpression, { LABEL: "lhs" }), this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(db) },
          { ALT: () => this.CONSUME(cb) },
          { ALT: () => this.CONSUME(ub) },
          { ALT: () => this.CONSUME(lb) },
          { ALT: () => this.CONSUME(fb) },
          { ALT: () => this.CONSUME(hb) }
        ]), this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
      });
    }));
    E(this, "additiveExpression", this.RULE("additiveExpression", () => {
      this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" }), this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(pb) },
          { ALT: () => this.CONSUME($h) }
        ]), this.SUBRULE1(this.multiplicativeExpression, { LABEL: "rhs" });
      });
    }));
    E(this, "multiplicativeExpression", this.RULE(
      "multiplicativeExpression",
      () => {
        this.SUBRULE(this.unaryExpression, { LABEL: "lhs" }), this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(mb) },
            { ALT: () => this.CONSUME(gb) },
            { ALT: () => this.CONSUME(X0) }
          ]), this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
        });
      }
    ));
    E(this, "unaryExpression", this.RULE("unaryExpression", () => {
      this.OR([
        {
          ALT: () => {
            this.OR1([
              { ALT: () => this.CONSUME(Y0) },
              { ALT: () => this.CONSUME($h) }
            ]), this.SUBRULE(this.unaryExpression);
          }
        },
        { ALT: () => this.SUBRULE(this.primaryExpression) }
      ]);
    }));
    E(this, "primaryExpression", this.RULE("primaryExpression", () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.literal) },
        { ALT: () => this.SUBRULE(this.identifierOrCall) },
        {
          ALT: () => {
            this.CONSUME(So), this.SUBRULE(this.expression), this.CONSUME(To);
          }
        }
      ]);
    }));
    E(this, "identifierOrCall", this.RULE("identifierOrCall", () => {
      this.CONSUME(It), this.MANY(() => {
        this.CONSUME(Fh), this.CONSUME1(It);
      }), this.OPTION(() => {
        this.CONSUME(So), this.OPTION1(() => {
          this.SUBRULE(this.argumentList);
        }), this.CONSUME(To);
      });
    }));
    E(this, "literal", this.RULE("literal", () => {
      this.OR([
        { ALT: () => this.CONSUME(J0) },
        { ALT: () => this.CONSUME(Q0) },
        { ALT: () => this.CONSUME(ob) },
        { ALT: () => this.CONSUME(rb) },
        { ALT: () => this.CONSUME(ab) },
        { ALT: () => this.CONSUME(sb) }
      ]);
    }));
    E(this, "variableReference", this.RULE("variableReference", () => {
      this.CONSUME(It), this.MANY(() => {
        this.CONSUME(Fh), this.CONSUME1(It);
      });
    }));
    E(this, "functionCall", this.RULE("functionCall", () => {
      this.CONSUME(It), this.CONSUME(So), this.OPTION(() => {
        this.SUBRULE(this.argumentList);
      }), this.CONSUME(To);
    }));
    E(this, "argumentList", this.RULE("argumentList", () => {
      this.SUBRULE(this.argument), this.MANY(() => {
        this.CONSUME(Uh), this.SUBRULE1(this.argument);
      });
    }));
    /**
     * Function argument
     * Supports both positional and named arguments:
     *   - foo(1, 2)
     *   - foo(IN := TRUE, PT := T#5s)
     */
    E(this, "argument", this.RULE("argument", () => {
      this.OPTION(() => {
        this.CONSUME(It, { LABEL: "argName" }), this.CONSUME(Is);
      }), this.SUBRULE(this.expression, { LABEL: "argValue" });
    }));
    this.performSelfAnalysis();
  }
}
const Rs = new SM(), TM = Rs.getBaseCstVisitorConstructor();
class xM extends TM {
  constructor() {
    super(), this.validateVisitor();
  }
  // Program
  program(e) {
    const t = e.pragma ? e.pragma.map((o) => this.visit(o)) : [], n = e.programName[0].image, s = e.variableBlock ? e.variableBlock.flatMap((o) => this.visit(o)) : [], r = e.statement ? e.statement.map((o) => this.visit(o)) : [];
    return {
      type: "Program",
      name: n,
      pragmas: t,
      variables: s,
      body: r,
      location: this.getLocation(e)
    };
  }
  // Variable declarations
  variableBlock(e) {
    let t = "VAR";
    return e.VarInput ? t = "VAR_INPUT" : e.VarOutput ? t = "VAR_OUTPUT" : e.VarInOut ? t = "VAR_IN_OUT" : e.VarGlobal && (t = "VAR_GLOBAL"), e.variableDeclaration ? e.variableDeclaration.map((n) => {
      const s = this.visit(n);
      return s.section = t, s;
    }) : [];
  }
  variableDeclaration(e) {
    const t = e.pragma ? e.pragma.map((a) => this.visit(a)) : [], n = e.varName[0].image, s = e.typeSpec ? this.visit(e.typeSpec) : this.createDataType("UNKNOWN"), r = e.expression ? this.visit(e.expression[0]) : void 0;
    let o;
    return e.IoAddress && (o = this.parseIoAddress(e.IoAddress[0].image), r && r.type === "Literal" && r.kind === "string" && (o.entityId = r.value)), {
      type: "VariableDeclaration",
      name: n,
      dataType: s,
      section: "VAR",
      // Will be set by variableBlock
      pragmas: t,
      constant: !1,
      initialValue: r,
      binding: o,
      location: this.getLocation(e)
    };
  }
  pragma(e) {
    const n = e.Pragma[0].image.slice(1, -1).trim(), s = n.indexOf(":");
    let r, o;
    return s > 0 ? (r = n.substring(0, s).trim(), o = n.substring(s + 1).trim()) : r = n, {
      type: "Pragma",
      name: r,
      value: o,
      location: this.getLocation(e)
    };
  }
  typeSpec(e) {
    let t;
    return e.TypeBool ? t = "BOOL" : e.TypeInt ? t = e.TypeInt[0].image : e.TypeReal ? t = e.TypeReal[0].image : e.TypeString ? t = e.TypeString[0].image : e.TypeTime ? t = e.TypeTime[0].image : e.Identifier ? t = e.Identifier[0].image : t = "UNKNOWN", this.createDataType(t);
  }
  // Statements
  statement(e) {
    if (e.assignmentStatement) return this.visit(e.assignmentStatement[0]);
    if (e.ifStatement) return this.visit(e.ifStatement[0]);
    if (e.caseStatement) return this.visit(e.caseStatement[0]);
    if (e.forStatement) return this.visit(e.forStatement[0]);
    if (e.whileStatement) return this.visit(e.whileStatement[0]);
    if (e.repeatStatement) return this.visit(e.repeatStatement[0]);
    if (e.returnStatement) return this.visit(e.returnStatement[0]);
    if (e.exitStatement) return this.visit(e.exitStatement[0]);
    if (e.functionCallStatement)
      return this.visit(e.functionCallStatement[0]);
    throw new Error("Unknown statement type");
  }
  assignmentStatement(e) {
    const t = this.visit(e.variableReference[0]);
    return {
      type: "Assignment",
      target: t.type === "VariableRef" ? t.name : t,
      value: this.visit(e.expression[0]),
      location: this.getLocation(e)
    };
  }
  ifStatement(e) {
    const t = this.visit(e.condition[0]), n = e.thenStatements ? e.thenStatements.map((o) => this.visit(o)) : [], s = e.elsifCondition ? e.elsifCondition.map((o) => {
      const a = e.elsifStatements ? e.elsifStatements.map((l) => this.visit(l)) : [];
      return {
        condition: this.visit(o),
        body: a
      };
    }) : [], r = e.elseStatements ? e.elseStatements.map((o) => this.visit(o)) : void 0;
    return {
      type: "IfStatement",
      condition: t,
      thenBranch: n,
      elsifBranches: s,
      elseBranch: r,
      location: this.getLocation(e)
    };
  }
  caseStatement(e) {
    const t = this.visit(e.selector[0]), n = e.caseClause ? e.caseClause.map((r) => this.visit(r)) : [], s = e.statement ? e.statement.map((r) => this.visit(r)) : void 0;
    return {
      type: "CaseStatement",
      selector: t,
      cases: n,
      elseCase: s,
      location: this.getLocation(e)
    };
  }
  caseClause(e) {
    const t = this.visit(e.caseLabelList[0]), n = e.statement ? e.statement.map((s) => this.visit(s)) : [];
    return { values: t, body: n };
  }
  caseLabelList(e) {
    return e.caseLabel.map((t) => this.visit(t));
  }
  caseLabel(e) {
    return this.visit(e.expression[0]);
  }
  forStatement(e) {
    return {
      type: "ForStatement",
      variable: e.controlVar[0].image,
      from: this.visit(e.start[0]),
      to: this.visit(e.end[0]),
      by: e.step ? this.visit(e.step[0]) : void 0,
      body: e.statement ? e.statement.map((t) => this.visit(t)) : [],
      location: this.getLocation(e)
    };
  }
  whileStatement(e) {
    return {
      type: "WhileStatement",
      condition: this.visit(e.expression[0]),
      body: e.statement ? e.statement.map((t) => this.visit(t)) : [],
      location: this.getLocation(e)
    };
  }
  repeatStatement(e) {
    return {
      type: "RepeatStatement",
      condition: this.visit(e.expression[0]),
      body: e.statement ? e.statement.map((t) => this.visit(t)) : [],
      location: this.getLocation(e)
    };
  }
  returnStatement(e) {
    return {
      type: "ReturnStatement",
      location: this.getLocation(e)
    };
  }
  exitStatement(e) {
    return {
      type: "ExitStatement",
      location: this.getLocation(e)
    };
  }
  functionCallStatement(e) {
    return {
      type: "FunctionCallStatement",
      call: this.visit(e.functionCall[0]),
      location: this.getLocation(e)
    };
  }
  // Expressions
  expression(e) {
    return this.visit(e.orExpression[0]);
  }
  orExpression(e) {
    if (!e.Or || e.Or.length === 0)
      return this.visit(e.lhs[0]);
    let t = this.visit(e.lhs[0]);
    for (let n = 0; n < e.Or.length; n++)
      t = {
        type: "BinaryExpression",
        operator: "OR",
        left: t,
        right: this.visit(e.rhs[n]),
        location: this.getLocation(e)
      };
    return t;
  }
  andExpression(e) {
    if (!e.And || e.And.length === 0)
      return this.visit(e.lhs[0]);
    let t = this.visit(e.lhs[0]);
    for (let n = 0; n < e.And.length; n++)
      t = {
        type: "BinaryExpression",
        operator: "AND",
        left: t,
        right: this.visit(e.rhs[n]),
        location: this.getLocation(e)
      };
    return t;
  }
  comparisonExpression(e) {
    const t = this.visit(e.lhs[0]);
    if (!e.rhs || e.rhs.length === 0)
      return t;
    let n = "=";
    return e.Equal ? n = "=" : e.NotEqual ? n = "<>" : e.Less ? n = "<" : e.LessEqual ? n = "<=" : e.Greater ? n = ">" : e.GreaterEqual && (n = ">="), {
      type: "BinaryExpression",
      operator: n,
      left: t,
      right: this.visit(e.rhs[0]),
      location: this.getLocation(e)
    };
  }
  additiveExpression(e) {
    let t = this.visit(e.lhs[0]);
    if (!e.Plus && !e.Minus)
      return t;
    const n = [...e.Plus || [], ...e.Minus || []].sort((s, r) => s.startOffset - r.startOffset).map((s) => s.image);
    for (let s = 0; s < n.length; s++)
      t = {
        type: "BinaryExpression",
        operator: n[s],
        left: t,
        right: this.visit(e.rhs[s]),
        location: this.getLocation(e)
      };
    return t;
  }
  multiplicativeExpression(e) {
    let t = this.visit(e.lhs[0]);
    if (!e.Star && !e.Slash && !e.Mod)
      return t;
    const n = [
      ...e.Star || [],
      ...e.Slash || [],
      ...e.Mod || []
    ].sort((s, r) => s.startOffset - r.startOffset).map((s) => s.image);
    for (let s = 0; s < n.length; s++)
      t = {
        type: "BinaryExpression",
        operator: n[s],
        left: t,
        right: this.visit(e.rhs[s]),
        location: this.getLocation(e)
      };
    return t;
  }
  unaryExpression(e) {
    return e.Not || e.Minus ? {
      type: "UnaryExpression",
      operator: e.Not ? "NOT" : "-",
      operand: this.visit(e.unaryExpression[0]),
      location: this.getLocation(e)
    } : this.visit(e.primaryExpression[0]);
  }
  primaryExpression(e) {
    if (e.literal) return this.visit(e.literal[0]);
    if (e.identifierOrCall) return this.visit(e.identifierOrCall[0]);
    if (e.expression) return this.visit(e.expression[0]);
    throw new Error("Unknown primary expression");
  }
  identifierOrCall(e) {
    const t = e.Identifier.map((s) => s.image), n = t.join(".");
    if (e.LParen) {
      const s = e.argumentList ? this.visit(e.argumentList[0]) : [];
      return {
        type: "FunctionCall",
        name: t[0],
        // Only use first part for function name
        arguments: s,
        location: this.getLocation(e)
      };
    }
    return {
      type: "VariableRef",
      name: n,
      location: this.getLocation(e)
    };
  }
  literal(e) {
    let t, n, s;
    return e.True || e.False ? (t = !!e.True, n = "boolean", s = e.True ? "TRUE" : "FALSE") : e.IntegerLiteral ? (s = e.IntegerLiteral[0].image, t = parseInt(s, 10), n = "integer") : e.RealLiteral ? (s = e.RealLiteral[0].image, t = parseFloat(s), n = "real") : e.StringLiteral ? (s = e.StringLiteral[0].image, t = s.slice(1, -1).replace(/''/g, "'"), n = "string") : e.TimeLiteral ? (s = e.TimeLiteral[0].image, t = s, n = "time") : (t = null, n = "integer", s = "null"), {
      type: "Literal",
      kind: n,
      value: t,
      raw: s,
      location: this.getLocation(e)
    };
  }
  variableReference(e) {
    return {
      type: "VariableRef",
      name: e.Identifier.map((n) => n.image).join("."),
      location: this.getLocation(e)
    };
  }
  functionCall(e) {
    const t = e.Identifier[0].image, n = e.argumentList ? this.visit(e.argumentList[0]) : [];
    return {
      type: "FunctionCall",
      name: t,
      arguments: n,
      location: this.getLocation(e)
    };
  }
  argumentList(e) {
    return e.argument.map((t) => this.visit(t));
  }
  argument(e) {
    const t = e.argName ? e.argName[0].image : void 0, n = e.argValue ? this.visit(e.argValue[0]) : this.visit(e.expression[0]);
    return {
      type: "FunctionArgument",
      name: t,
      value: n,
      location: this.getLocation(e)
    };
  }
  // Helper methods
  createDataType(e) {
    return {
      type: "DataType",
      name: e
    };
  }
  parseIoAddress(e) {
    const t = e.substring(1);
    return {
      type: "EntityBinding",
      direction: e[1] === "I" ? "INPUT" : e[1] === "Q" ? "OUTPUT" : "MEMORY",
      ioAddress: t
      // entityId will be set from initialValue if present
    };
  }
  getLocation(e) {
    const t = this.getAllTokens(e);
    if (t.length === 0) return;
    const n = t[0], s = t[t.length - 1];
    return {
      startLine: n.startLine || 0,
      startColumn: n.startColumn || 0,
      endLine: s.endLine || s.startLine || 0,
      endColumn: s.endColumn || s.startColumn || 0
    };
  }
  getAllTokens(e) {
    const t = [];
    for (const n in e)
      if (Array.isArray(e[n]))
        for (const s of e[n])
          s && typeof s == "object" && "image" in s && t.push(s);
    return t.sort((n, s) => n.startOffset - s.startOffset);
  }
}
const EM = new xM();
function _l(i) {
  const e = [], t = vM(i);
  if (t.errors.length > 0 && t.errors.forEach((s) => {
    e.push({
      message: s.message,
      line: s.line,
      column: s.column,
      offset: s.offset
    });
  }), e.length > 0)
    return {
      success: !1,
      errors: e
    };
  Rs.input = t.tokens;
  const n = Rs.program();
  if (Rs.errors.length > 0)
    return Rs.errors.forEach((s) => {
      e.push({
        message: s.message,
        line: s.token.startLine,
        column: s.token.startColumn,
        offset: s.token.startOffset
      });
    }), {
      success: !1,
      errors: e
    };
  try {
    return {
      success: !0,
      ast: EM.visit(n),
      errors: []
    };
  } catch (s) {
    return e.push({
      message: s instanceof Error ? s.message : "Unknown AST transformation error"
    }), {
      success: !1,
      errors: e
    };
  }
}
const pi = {
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
var Rt = /* @__PURE__ */ ((i) => (i.DERIVED = "DERIVED", i.TRANSIENT = "TRANSIENT", i.PERSISTENT = "PERSISTENT", i))(Rt || {});
const qt = {
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
function ra(i, e) {
  const t = {
    scope: "PROGRAM",
    inCondition: !1,
    inLoop: !1,
    path: ["PROGRAM"]
  };
  bi(i.body, t, e), t.path.pop();
}
function bi(i, e, t) {
  for (const n of i) {
    const s = {
      ...e,
      currentStatement: n,
      path: [...e.path]
    };
    AM(n, s, t);
  }
}
function AM(i, e, t) {
  switch (t.onStatement && t.onStatement(i, e), i.type) {
    case "Assignment":
      t.onAssignment && t.onAssignment(i, e), Me(i.value, e, t);
      break;
    case "IfStatement":
      wM(i, e, t);
      break;
    case "CaseStatement":
      OM(i, e, t);
      break;
    case "ForStatement":
      CM(i, e, t);
      break;
    case "WhileStatement":
      kM(i, e, t);
      break;
    case "RepeatStatement":
      _M(i, e, t);
      break;
    case "FunctionCallStatement":
      t.onFunctionCall && t.onFunctionCall(i.call, e);
      break;
  }
}
function wM(i, e, t) {
  const n = { ...e, inCondition: !0 };
  Me(i.condition, n, t), e.path.push("IF"), bi(i.thenBranch, e, t);
  for (const s of i.elsifBranches)
    Me(s.condition, n, t), bi(s.body, e, t);
  i.elseBranch && bi(i.elseBranch, e, t), e.path.pop();
}
function CM(i, e, t) {
  const n = { ...e, inLoop: !0 };
  Me(i.from, e, t), Me(i.to, e, t), i.by && Me(i.by, e, t), n.path.push("FOR"), bi(i.body, n, t), n.path.pop();
}
function kM(i, e, t) {
  const n = { ...e, inLoop: !0, inCondition: !0 };
  Me(i.condition, n, t), n.path.push("WHILE"), n.inCondition = !1, bi(i.body, n, t), n.path.pop();
}
function _M(i, e, t) {
  const n = { ...e, inLoop: !0 };
  n.path.push("REPEAT"), bi(i.body, n, t), n.inCondition = !0, Me(i.condition, n, t), n.path.pop();
}
function OM(i, e, t) {
  const { ...n } = e;
  n.inCondition = !0, Me(i.selector, n, t), e.path.push("CASE");
  for (const s of i.cases) {
    for (const r of s.values)
      Me(r, n, t);
    bi(s.body, e, t);
  }
  i.elseCase && bi(i.elseCase, e, t), e.path.pop();
}
function Me(i, e, t) {
  switch (i.type) {
    case "VariableRef":
      t.onVariableRef && t.onVariableRef(i, e);
      break;
    case "BinaryExpression": {
      const n = i;
      t.onBinaryOp && t.onBinaryOp(n, e), Me(n.left, e, t), Me(n.right, e, t);
      break;
    }
    case "UnaryExpression":
      Me(i.operand, e, t);
      break;
    case "FunctionCall":
      IM(i, e, t);
      break;
    case "MemberAccess":
      Me(i.object, e, t);
      break;
    case "ParenExpression":
      Me(i.expression, e, t);
      break;
  }
}
function IM(i, e, t) {
  t.onFunctionCall && t.onFunctionCall(i, e);
  for (const n of i.arguments)
    Me(n.value, e, t);
}
function Wh(i, e) {
  const t = [], n = {
    onVariableRef: (s) => {
      t.push(s);
    }
  };
  return Me(
    i,
    {
      scope: e.scope || "PROGRAM",
      inCondition: e.inCondition || !1,
      inLoop: e.inLoop || !1,
      path: e.path || ["PROGRAM"]
    },
    n
  ), t;
}
function RM(i, e) {
  return Wh(i, {
    scope: "PROGRAM",
    inCondition: !1,
    inLoop: !1,
    path: []
  }).some((t) => t.name === e);
}
function NM(i, e) {
  return {
    platform: "state",
    entity_id: i,
    not_from: ["unavailable", "unknown"],
    not_to: ["unavailable", "unknown"],
    id: e == null ? void 0 : e.id
  };
}
function MM(i, e) {
  return {
    platform: "state",
    entity_id: i,
    from: "off",
    to: "on",
    edge: "rising",
    id: e
  };
}
function LM(i, e) {
  return {
    platform: "state",
    entity_id: i,
    from: "on",
    to: "off",
    edge: "falling",
    id: e
  };
}
function Wi(i) {
  return i.map((e) => ({
    name: e.name.toLowerCase(),
    value: e.value
  }));
}
function PM(i) {
  const e = Wi(i);
  if (yi(e, "no_trigger"))
    return !1;
  const t = xo(e, "edge");
  return t === "rising" || t === "falling" ? t : yi(e, "trigger") ? !0 : null;
}
function yi(i, e) {
  return i.some((t) => t.name === e);
}
function xo(i, e) {
  const t = i.find((n) => n.name === e);
  if ((t == null ? void 0 : t.value) !== void 0)
    return String(t.value);
}
const DM = [
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
function $M(i) {
  if (!i || typeof i != "string")
    return !1;
  const e = i.split(".");
  if (e.length !== 2)
    return !1;
  const [t, n] = e;
  return !(!DM.includes(t) || !n || !/^[a-z0-9_]+$/.test(n));
}
class BM {
  constructor(e) {
    E(this, "ast");
    E(this, "dependencies", []);
    E(this, "triggers", []);
    E(this, "diagnostics", []);
    E(this, "readVariables", /* @__PURE__ */ new Set());
    E(this, "writtenVariables", /* @__PURE__ */ new Set());
    E(this, "variableMap", /* @__PURE__ */ new Map());
    E(this, "detectedEdgeTriggers", []);
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
        const n = ((e = t.binding) == null ? void 0 : e.entityId) || this.extractEntityId(t);
        if (!n && !t.binding)
          continue;
        let s;
        if (t.section === "VAR_INPUT")
          s = "INPUT";
        else if (t.section === "VAR_OUTPUT")
          s = "OUTPUT";
        else if (t.binding)
          s = t.binding.direction;
        else
          continue;
        const r = {
          variableName: t.name,
          entityId: n,
          direction: s,
          dataType: t.dataType.name,
          isTrigger: !1,
          // Will be determined later
          location: t.location ? {
            line: t.location.startLine,
            column: t.location.startColumn
          } : void 0
        };
        n && !$M(n) && this.addDiagnostic(
          "Error",
          pi.INVALID_ENTITY_ID,
          `Invalid entity ID format: ${n}`,
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
    ra(this.ast, {
      onVariableRef: (e) => {
        this.readVariables.add(e.name);
      },
      onAssignment: (e) => {
        if (typeof e.target == "string")
          this.writtenVariables.add(e.target);
        else {
          let n = e.target;
          for (; n.type === "MemberAccess"; )
            n = n.object;
          n.type === "VariableRef" && this.writtenVariables.add(n.name);
        }
        const t = Wh(e.value, {
          scope: "PROGRAM",
          inCondition: !1,
          inLoop: !1,
          path: []
        });
        for (const n of t)
          this.readVariables.add(n.name);
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
      const n = Wh(e.arguments[0].value, {
        scope: "PROGRAM",
        inCondition: !1,
        inLoop: !1,
        path: []
      });
      for (const s of n) {
        const r = this.dependencies.find((o) => o.variableName === s.name);
        r && r.direction === "INPUT" && (this.detectedEdgeTriggers.push({
          variableName: s.name,
          edge: t,
          location: r.location
        }), this.addDiagnostic(
          "Info",
          pi.EDGE_TRIGGER_DETECTED,
          `${t === "rising" ? "R_TRIG" : "F_TRIG"} detected on '${s.name}' - will generate ${t} edge trigger`,
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
      const n = PM(t.pragmas), s = Wi(t.pragmas);
      if (yi(s, "trigger") && this.addDiagnostic(
        "Info",
        pi.AUTO_TRIGGER,
        `Variable '${e.variableName}' explicitly marked as trigger`,
        e.location
      ), yi(s, "no_trigger") && this.addDiagnostic(
        "Info",
        pi.EXPLICIT_NO_TRIGGER,
        `Variable '${e.variableName}' explicitly excluded from triggers`,
        e.location
      ), n === !1 || !e.entityId)
        continue;
      const r = this.detectedEdgeTriggers.find(
        (a) => a.variableName === e.variableName
      ), o = this.createTrigger(e, n, r == null ? void 0 : r.edge);
      o && (this.triggers.push(o), e.isTrigger = !0);
    }
    this.triggers = this.deduplicateTriggers(this.triggers);
  }
  deduplicateTriggers(e) {
    const t = /* @__PURE__ */ new Set();
    return e.filter((n) => {
      const s = Array.isArray(n.from) ? n.from.join(",") : n.from || "", r = Array.isArray(n.to) ? n.to.join(",") : n.to || "", o = `${n.platform}:${n.entity_id}:${s}:${r}:${n.edge || ""}`;
      return t.has(o) ? !1 : (t.add(o), !0);
    });
  }
  createTrigger(e, t, n) {
    if (!e.entityId) return null;
    const s = t === "rising" || t === "falling" ? t : n;
    return s === "rising" ? MM(e.entityId, e.variableName) : s === "falling" ? LM(e.entityId, e.variableName) : NM(e.entityId, { id: e.variableName });
  }
  /**
   * Validate usage patterns and generate diagnostics
   */
  validate() {
    this.triggers.length === 0 && this.addDiagnostic(
      "Warning",
      pi.NO_TRIGGERS,
      "No triggers detected. Program will never execute automatically. Add {trigger} pragma to input variables or ensure inputs are read in code."
    ), this.triggers.length > 10 && this.addDiagnostic(
      "Info",
      pi.MANY_TRIGGERS,
      `Program triggers on ${this.triggers.length} entities. Consider using {no_trigger} pragma on less important inputs.`
    );
    for (const e of this.dependencies)
      e.direction === "INPUT" && !this.readVariables.has(e.variableName) && this.addDiagnostic(
        "Warning",
        pi.UNUSED_INPUT,
        `Input variable '${e.variableName}' is declared but never read`,
        e.location
      );
    for (const e of this.dependencies)
      e.direction === "INPUT" && this.writtenVariables.has(e.variableName) && this.addDiagnostic(
        "Warning",
        pi.WRITE_TO_INPUT,
        `Writing to input variable '${e.variableName}' - this may not update the entity`,
        e.location
      );
    for (const e of this.dependencies)
      e.direction === "OUTPUT" && this.readVariables.has(e.variableName) && !this.writtenVariables.has(e.variableName) && this.addDiagnostic(
        "Warning",
        pi.READ_FROM_OUTPUT,
        `Reading from output variable '${e.variableName}' without writing - value may be stale`,
        e.location
      );
  }
  /**
   * Build metadata about the program
   */
  buildMetadata() {
    const e = this.dependencies, t = Wi(this.ast.pragmas), n = this.ast.variables.some((s) => {
      const r = Wi(s.pragmas);
      return yi(r, "persistent");
    });
    return {
      programName: this.ast.name,
      inputCount: e.filter((s) => s.direction === "INPUT").length,
      outputCount: e.filter((s) => s.direction === "OUTPUT").length,
      triggerCount: this.triggers.length,
      hasPersistentVars: n,
      hasTimers: this.hasTimerUsage(),
      mode: xo(t, "mode"),
      // Keep throttle/debounce as ST-style time literals (strings)
      throttle: xo(t, "throttle"),
      debounce: xo(t, "debounce")
    };
  }
  hasTimerUsage() {
    let e = !1;
    const t = /* @__PURE__ */ new Set(["TON", "TOF", "TP", "TON_EDGE"]);
    return ra(this.ast, {
      onFunctionCall: (n) => {
        if (e)
          return;
        const s = n.name.toUpperCase();
        if (t.has(s)) {
          e = !0;
          return;
        }
        const r = this.variableMap.get(n.name);
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
  addDiagnostic(e, t, n, s) {
    this.diagnostics.push({ severity: e, code: t, message: n, location: s });
  }
}
function Hh(i) {
  return new BM(i).analyze();
}
const vb = {
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
}, UM = [
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
function Sb(i) {
  const e = i.toUpperCase(), t = vb[e];
  return (t == null ? void 0 : t.helperType) ?? null;
}
function FM(i) {
  return UM.includes(i.toUpperCase());
}
function Tb(i) {
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
function xb(i) {
  return i.toUpperCase() === "BOOL";
}
function Eb(i) {
  const e = i.toUpperCase();
  return ["STRING", "WSTRING"].includes(e);
}
function WM(i) {
  const e = i.toUpperCase();
  return ["TIME", "DATE", "TIME_OF_DAY", "TOD", "DATE_AND_TIME", "DT"].includes(
    e
  );
}
function Ab(i, e, t, n) {
  const s = (o) => o.toLowerCase().replace(/[^a-z0-9]/g, "_"), r = `st_${s(i)}_${s(e)}_${s(t)}`;
  return `${n}.${r}`;
}
function HM(i, e, t, n, s) {
  const r = Sb(n);
  if (!r)
    return null;
  const o = Ab(i, e, t, r), a = vb[n.toUpperCase()], l = {
    id: o,
    type: r,
    name: `ST ${e} - ${t}`
  };
  return r === "input_number" && a && (l.min = a.defaultMin, l.max = a.defaultMax, l.step = a.defaultStep, l.mode = "box", s !== void 0 && typeof s == "number" ? l.initial = s : l.initial = 0), r === "input_boolean" && (l.initial = s === !0), r === "input_text" && (l.initial = typeof s == "string" ? s : ""), l;
}
function VM(i) {
  const e = i.toUpperCase();
  return xb(e) ? !1 : Tb(e) ? 0 : Eb(e) ? "" : WM(e) ? "PT0S" : null;
}
function jM(i, e) {
  const t = e.toUpperCase();
  return xb(t) ? i === !0 || i === "TRUE" || i === 1 : Tb(t) ? typeof i == "number" ? i : typeof i == "string" && parseFloat(i) || 0 : Eb(t) ? String(i ?? "") : i;
}
class zM {
  constructor(e, t = "default") {
    E(this, "ast");
    E(this, "projectName");
    E(this, "diagnostics", []);
    E(this, "usageMap", /* @__PURE__ */ new Map());
    E(this, "variableMap", /* @__PURE__ */ new Map());
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
        isFBInstance: FM(t.dataType.name),
        isTimerRelated: this.isTimerRelatedType(t.dataType.name),
        readCount: 0,
        writeCount: 0
      });
    const e = /* @__PURE__ */ new Map();
    ra(this.ast, {
      onVariableRef: (t) => {
        const n = this.usageMap.get(t.name);
        n && (n.isRead = !0, n.readCount++);
      },
      onAssignment: (t) => {
        const n = this.getAssignmentTargetName(t);
        if (n) {
          const s = this.usageMap.get(n);
          s && (s.isWritten = !0, s.writeCount++), e.has(n) || e.set(n, []), e.get(n).push(t.value);
        }
      }
    });
    for (const [t, n] of e)
      for (const s of n)
        if (RM(s, t)) {
          const r = this.usageMap.get(t);
          r && (r.hasSelfReference = !0);
        }
  }
  getAssignmentTargetName(e) {
    const t = e.target;
    if (typeof t == "string")
      return t;
    let n = t;
    for (; n.type === "MemberAccess"; )
      n = n.object;
    return n.type === "VariableRef" ? n.name : null;
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
      const n = this.usageMap.get(t.name), s = this.determineStorageType(t, n);
      e.push({
        name: t.name,
        dataType: t.dataType.name,
        storage: s,
        usageInfo: n
      });
    }
    return e;
  }
  determineStorageType(e, t) {
    const n = Wi(e.pragmas);
    return e.binding ? {
      type: Rt.DERIVED,
      reason: "Entity-bound variable - value comes from entity state"
    } : yi(n, "transient") ? (this.addDiagnostic(
      "Info",
      qt.EXPLICIT_TRANSIENT,
      `Variable '${e.name}' explicitly marked as transient`,
      e.location
    ), {
      type: Rt.TRANSIENT,
      reason: "Explicit {transient} pragma"
    }) : yi(n, "persistent") ? (this.addDiagnostic(
      "Info",
      qt.EXPLICIT_PERSISTENT,
      `Variable '${e.name}' explicitly marked as persistent`,
      e.location
    ), this.createPersistentDecision(e, "Explicit {persistent} pragma")) : t.hasSelfReference ? (this.addDiagnostic(
      "Info",
      qt.AUTO_PERSISTENT,
      `Variable '${e.name}' auto-detected as persistent (self-reference)`,
      e.location
    ), this.createPersistentDecision(e, "Self-reference detected")) : t.isFBInstance ? (this.addDiagnostic(
      "Info",
      qt.AUTO_PERSISTENT,
      `Variable '${e.name}' auto-detected as persistent (FB instance)`,
      e.location
    ), this.createFBPersistentDecision(e, "Function Block instance")) : t.isTimerRelated ? (this.addDiagnostic(
      "Info",
      qt.AUTO_PERSISTENT,
      `Variable '${e.name}' auto-detected as persistent (timer-related)`,
      e.location
    ), this.createPersistentDecision(e, "Timer-related variable")) : {
      type: Rt.TRANSIENT,
      reason: "No persistence requirement detected"
    };
  }
  createPersistentDecision(e, t) {
    var o;
    const n = Sb(e.dataType.name);
    if (!n)
      return this.addDiagnostic(
        "Warning",
        qt.INVALID_HELPER_TYPE,
        `Cannot create helper for type '${e.dataType.name}' - using transient storage`,
        e.location
      ), {
        type: Rt.TRANSIENT,
        reason: `No helper type available for ${e.dataType.name}`
      };
    const s = Ab(
      this.projectName,
      this.ast.name,
      e.name,
      n
    );
    let r = VM(e.dataType.name);
    return ((o = e.initialValue) == null ? void 0 : o.type) === "Literal" && (r = jM(
      e.initialValue.value,
      e.dataType.name
    )), {
      type: Rt.PERSISTENT,
      reason: t,
      helperId: s,
      helperType: n,
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
      type: Rt.PERSISTENT,
      reason: t
      // No helperId/helperType for FBs - requires special handling
    };
  }
  // ==========================================================================
  // Phase 4: Generate Helper Configs
  // ==========================================================================
  generateHelperConfigs(e) {
    const t = [];
    for (const n of e) {
      if (n.storage.type !== Rt.PERSISTENT)
        continue;
      const s = HM(
        this.projectName,
        this.ast.name,
        n.name,
        n.dataType,
        n.storage.initialValue
      );
      s && t.push(s);
    }
    return t;
  }
  // ==========================================================================
  // Phase 5: Validation
  // ==========================================================================
  validate(e) {
    for (const t of e) {
      const n = t.usageInfo, s = this.variableMap.get(t.name), r = Wi(s.pragmas);
      n.hasSelfReference && t.storage.type === Rt.TRANSIENT && this.addDiagnostic(
        "Warning",
        qt.SELF_REF_NOT_PERSISTENT,
        `Variable '${t.name}' has self-reference but is transient - value will reset each run`,
        s.location
      ), n.isFBInstance && t.storage.type === Rt.TRANSIENT && this.addDiagnostic(
        "Warning",
        qt.FB_INSTANCE_NOT_PERSISTENT,
        `Function Block '${t.name}' is transient - internal state will reset each run`,
        s.location
      ), t.storage.type === Rt.PERSISTENT && !n.isWritten && this.addDiagnostic(
        "Warning",
        qt.UNUSED_PERSISTENT,
        `Persistent variable '${t.name}' is never written - consider making it transient`,
        s.location
      ), yi(r, "persistent") && yi(r, "transient") && this.addDiagnostic(
        "Error",
        qt.CONFLICTING_PRAGMAS,
        `Variable '${t.name}' has conflicting {persistent} and {transient} pragmas`,
        s.location
      );
    }
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  addDiagnostic(e, t, n, s) {
    this.diagnostics.push({
      severity: e,
      code: t,
      message: n,
      location: s ? { line: s.startLine, column: s.startColumn } : void 0
    });
  }
}
function GM(i, e) {
  return new zM(i, e).analyze();
}
class wb {
  constructor(e, t) {
    E(this, "context");
    E(this, "timerResolver");
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
    const t = e.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
    if (!t) return "0";
    const n = parseInt(t[1] || "0", 10), s = parseInt(t[2] || "0", 10), r = parseInt(t[3] || "0", 10), o = parseInt(t[4] || "0", 10), a = n * 3600 + s * 60 + r + o / 1e3;
    return String(a);
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
    const n = `states('${e}')`, s = "['unavailable', 'unknown', 'none', '']";
    switch (t.toUpperCase()) {
      case "BOOL":
        return `(${n} in ['on', 'true', 'True', '1'])`;
      case "INT":
      case "DINT":
      case "SINT":
      case "LINT":
      case "UINT":
      case "UDINT":
      case "USINT":
      case "ULINT":
        return `(${n} | int(default=0) if ${n} not in ${s} else 0)`;
      case "REAL":
      case "LREAL":
        return `(${n} | float(default=0.0) if ${n} not in ${s} else 0.0)`;
      case "STRING":
      case "WSTRING":
        return `(${n} if ${n} not in ['unavailable', 'unknown'] else '')`;
      default:
        return n;
    }
  }
  /**
   * Generate defensive helper state read
   */
  generateHelperRead(e, t) {
    const n = `states('${e}')`, s = "['unavailable', 'unknown', 'none', '']";
    switch (t.toUpperCase()) {
      case "BOOL":
        return `(${n} == 'on')`;
      case "INT":
      case "DINT":
      case "SINT":
      case "LINT":
      case "UINT":
      case "UDINT":
      case "USINT":
      case "ULINT":
        return `(${n} | int(default=0) if ${n} not in ${s} else 0)`;
      case "REAL":
      case "LREAL":
        return `(${n} | float(default=0.0) if ${n} not in ${s} else 0.0)`;
      case "STRING":
      case "WSTRING":
        return `(${n} if ${n} not in ${s} else '')`;
      default:
        return n;
    }
  }
  // ==========================================================================
  // Binary Expression Generation
  // ==========================================================================
  generateBinaryExpression(e) {
    const t = this.generateExpression(e.left), n = this.generateExpression(e.right);
    switch (e.operator.toUpperCase()) {
      case "+":
        return `(${t} + ${n})`;
      case "-":
        return `(${t} - ${n})`;
      case "*":
        return `(${t} * ${n})`;
      case "/":
        return `(${t} / ${n})`;
      case "MOD":
        return `(${t} % ${n})`;
      case "=":
        return `(${t} == ${n})`;
      case "<>":
        return `(${t} != ${n})`;
      case "<":
        return `(${t} < ${n})`;
      case ">":
        return `(${t} > ${n})`;
      case "<=":
        return `(${t} <= ${n})`;
      case ">=":
        return `(${t} >= ${n})`;
      case "AND":
        return `(${t} and ${n})`;
      case "OR":
        return `(${t} or ${n})`;
      case "XOR":
        return `((${t} or ${n}) and not (${t} and ${n}))`;
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
    const t = e.name.toUpperCase(), n = e.arguments.map((s) => this.generateExpression(s.value));
    switch (t) {
      case "SEL":
        return this.generateSEL(n);
      case "MUX":
        return this.generateMUX(n);
      case "MIN":
        return `min(${n[0]}, ${n[1]})`;
      case "MAX":
        return `max(${n[0]}, ${n[1]})`;
      case "LIMIT":
        return this.generateLIMIT(n);
      case "ABS":
        return `(${n[0]} | abs)`;
      case "SQRT":
        return this.generateSQRT(n);
      case "TRUNC":
        return `(${n[0]} | int)`;
      case "ROUND":
        return `(${n[0]} | round)`;
      case "TO_INT":
      case "TO_DINT":
        return `(${n[0]} | int(default=0))`;
      case "TO_REAL":
      case "TO_LREAL":
        return `(${n[0]} | float(default=0.0))`;
      case "TO_STRING":
        return `(${n[0]} | string)`;
      case "TO_BOOL":
        return `(${n[0]} | bool)`;
      case "LEN":
        return `(${n[0]} | length)`;
      case "CONCAT":
        return `(${n[0]} ~ ${n[1]})`;
      default:
        return `${t.toLowerCase()}(${n.join(", ")})`;
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
    const t = e[0], n = e.slice(1);
    let s = n[n.length - 1];
    for (let r = n.length - 2; r >= 0; r--)
      s = `(${n[r]} if ${t} == ${r} else ${s})`;
    return s;
  }
  generateLIMIT(e) {
    if (e.length < 3)
      throw new Error("LIMIT requires 3 arguments");
    const [t, n, s] = e;
    return `{% set _v = ${n} %}{% if _v is number %}{{ [[${t}, _v] | max, ${s}] | min }}{% else %}{{ ${t} }}{% endif %}`;
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
      let n = e.object;
      for (; n.type === "MemberAccess"; )
        n = n.object;
      if (n.type === "VariableRef") {
        const s = this.timerResolver.resolveOutput(
          n.name,
          e.member.toUpperCase() === "ET" ? "ET" : "Q"
        );
        if (s)
          return s;
      }
    }
    return `${this.generateExpression(e.object)}.${e.member}`;
  }
}
const Jd = 1e3;
class KM {
  constructor(e, t, n) {
    E(this, "context");
    E(this, "jinja");
    E(this, "sourceMap");
    this.context = e, this.jinja = new wb(e, t), this.sourceMap = n;
  }
  /**
   * Generate HA actions from ST statements
   */
  generateActions(e) {
    const t = [];
    return e.forEach((n, s) => {
      this.sourceMap && this.sourceMap.pushPath(String(s));
      const r = this.generateAction(n);
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
    const t = typeof e.target == "string" ? e.target : this.getTargetName(e.target), n = this.context.variables.get(t);
    return n ? n.isOutput && n.entityId ? this.generateEntityWrite(n.entityId, e.value, n.dataType) : n.isPersistent && n.helperId ? this.generateHelperWrite(n.helperId, e.value, n.dataType) : [this.generateVariableAssignment(t, e.value)] : [this.generateVariableAssignment(t, e.value)];
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
  generateEntityWrite(e, t, n) {
    const s = e.split(".")[0], r = this.jinja.generateExpression(t);
    return n.toUpperCase() === "BOOL" ? [{
      service: `{{ '${s}.turn_on' if ${r} else '${s}.turn_off' }}`,
      target: { entity_id: e }
    }] : s === "input_number" || s === "number" ? [{
      service: `${s}.set_value`,
      target: { entity_id: e },
      data: { value: `{{ ${r} }}` }
    }] : s === "input_text" ? [{
      service: "input_text.set_value",
      target: { entity_id: e },
      data: { value: `{{ ${r} }}` }
    }] : [{
      service: `${s}.turn_on`,
      target: { entity_id: e }
    }];
  }
  generateHelperWrite(e, t, n) {
    const s = e.split(".")[0], r = this.jinja.generateExpression(t);
    switch (s) {
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
        throw new Error(`Unknown helper type: ${s}`);
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
    for (const s of e.elsifBranches)
      t.push({
        conditions: [this.generateCondition(s.condition)],
        sequence: this.generateActions(s.body)
      });
    const n = { choose: t };
    return e.elseBranch && e.elseBranch.length > 0 && (n.default = this.generateActions(e.elseBranch)), n;
  }
  generateCase(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "CASE statement");
    const t = this.jinja.generateExpression(e.selector), n = [];
    for (const r of e.cases) {
      const o = r.values.map((l) => {
        const h = this.jinja.generateExpression(l);
        return {
          condition: "template",
          value_template: `{{ ${t} == ${h} }}`
        };
      }), a = o.length === 1 ? o[0] : { condition: "or", conditions: o };
      n.push({
        conditions: [a],
        sequence: this.generateActions(r.body)
      });
    }
    const s = { choose: n };
    return e.elseCase && e.elseCase.length > 0 && (s.default = this.generateActions(e.elseCase)), s;
  }
  generateFor(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "FOR statement");
    const t = this.jinja.generateExpression(e.from), n = this.jinja.generateExpression(e.to), s = e.by ? this.jinja.generateExpression(e.by) : "1", r = `{{ (((${n}) - (${t})) / (${s})) | int + 1 }}`, o = {
      variables: {
        [e.variable]: `{{ ${t} }}`
      }
    }, a = {
      variables: {
        [e.variable]: `{{ ${e.variable} + ${s} }}`
      }
    };
    return {
      repeat: {
        count: r,
        sequence: [
          o,
          ...this.generateActions(e.body),
          a
        ]
      }
    };
  }
  generateWhile(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "WHILE statement");
    const t = `_while_safety_${this.context.safetyCounters++}`, n = {
      variables: { [t]: 0 }
    }, s = {
      variables: { [t]: `{{ ${t} + 1 }}` }
    }, r = this.generateCondition(e.condition), o = {
      condition: "template",
      value_template: `{{ ${t} < ${Jd} }}`
    };
    return {
      repeat: {
        while: [r, o],
        sequence: [
          n,
          s,
          ...this.generateActions(e.body)
        ]
      }
    };
  }
  generateRepeat(e) {
    this.sourceMap && e.location && this.sourceMap.recordNode(e, "REPEAT statement");
    const t = `_repeat_safety_${this.context.safetyCounters++}`, n = {
      variables: { [t]: 0 }
    }, s = {
      variables: { [t]: `{{ ${t} + 1 }}` }
    }, r = this.generateCondition(e.condition), o = {
      condition: "template",
      value_template: `{{ ${t} < ${Jd} }}`
    };
    return {
      repeat: {
        until: [
          { condition: "or", conditions: [r, { condition: "not", conditions: [o] }] }
        ],
        sequence: [
          n,
          s,
          ...this.generateActions(e.body)
        ]
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
    for (const n of e.arguments) {
      const s = n.name || `arg_${e.arguments.indexOf(n)}`;
      t[s] = `{{ ${this.jinja.generateExpression(n.value)} }}`;
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
class qM {
  constructor(e) {
    E(this, "jinja");
    this.jinja = new wb(e);
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
    const n = t.name.toUpperCase(), s = {};
    for (const o of t.arguments) {
      const a = (r = o.name) == null ? void 0 : r.toUpperCase();
      if (a)
        switch (a) {
          case "IN":
            s.IN = this.jinja.generateExpression(o.value);
            break;
          case "PT":
            s.PT = this.parseTimeToSeconds(o.value);
            break;
          case "R":
            s.R = this.jinja.generateExpression(o.value);
            break;
        }
    }
    return { instanceName: e, type: n, inputs: s };
  }
  /**
   * Transpile a timer FB instance given its resolved type and inputs.
   *
   * The caller is responsible for:
   * - Determining the correct `TimerInstance` (name/program/project/type)
   * - Providing normalized `TimerInputs` (IN/PT Jinja expressions)
   */
  transpileTimer(e, t) {
    const n = this.generateEntityIds(e), s = this.generateHelperConfigs(e, n);
    switch (e.type) {
      case "TON":
        return this.transpileTON(e, t, n, s);
      case "TOF":
        return this.transpileTOF(e, t, n, s);
      case "TP":
        return this.transpileTP(e, t, n, s);
      default:
        throw new Error(`Unknown timer type: ${e.type}`);
    }
  }
  // ==========================================================================
  // TON - On-Delay Timer
  // ==========================================================================
  transpileTON(e, t, n, s) {
    const r = [
      {
        // High-level choose block for TON behavior
        // Case 1: IN = TRUE and timer idle -> start timer
        // Case 2: IN = FALSE -> cancel timer and reset Q
        choose: [
          {
            conditions: [
              this.templateCondition(t.IN),
              this.stateCondition(n.timerId, "idle")
            ],
            sequence: [this.timerStart(n.timerId, t.PT)]
          },
          {
            conditions: [this.templateCondition(`not (${t.IN})`)],
            sequence: [
              this.timerCancel(n.timerId),
              this.booleanTurnOff(n.outputHelperId)
            ]
          }
        ]
      }
    ], o = this.generateFinishedAutomation(
      e,
      n,
      t.IN,
      [this.booleanTurnOn(n.outputHelperId)]
    ), a = {
      Q: `(states('${n.outputHelperId}') == 'on')`,
      ET: n.elapsedHelperId ? `(states('${n.elapsedHelperId}') | float(default=0))` : void 0
    };
    return {
      entities: n,
      helpers: s,
      mainActions: r,
      finishedAutomation: o,
      outputMappings: a
    };
  }
  // ==========================================================================
  // TOF - Off-Delay Timer
  // ==========================================================================
  transpileTOF(e, t, n, s) {
    const r = [
      {
        choose: [
          // Case 1: IN = TRUE -> cancel timer and set Q immediately
          {
            conditions: [this.templateCondition(t.IN)],
            sequence: [
              this.timerCancel(n.timerId),
              this.booleanTurnOn(n.outputHelperId)
            ]
          },
          // Case 2: IN = FALSE and Q ON and timer idle -> start timer
          {
            conditions: [
              this.templateCondition(`not (${t.IN})`),
              this.stateCondition(n.outputHelperId, "on"),
              this.stateCondition(n.timerId, "idle")
            ],
            sequence: [this.timerStart(n.timerId, t.PT)]
          }
        ]
      }
    ], o = this.generateFinishedAutomation(
      e,
      n,
      `not (${t.IN})`,
      [this.booleanTurnOff(n.outputHelperId)]
    ), a = {
      Q: `(states('${n.outputHelperId}') == 'on')`
    };
    return {
      entities: n,
      helpers: s,
      mainActions: r,
      finishedAutomation: o,
      outputMappings: a
    };
  }
  // ==========================================================================
  // TP - Pulse Timer
  // ==========================================================================
  transpileTP(e, t, n, s) {
    const r = `input_boolean.${this.sanitize(
      e.projectName
    )}_${this.sanitize(e.programName)}_${this.sanitize(e.name)}_triggered`;
    s.push({
      id: r,
      type: "input_boolean",
      name: `ST ${e.programName} ${e.name} Triggered`,
      initial: !1
    });
    const o = [
      {
        choose: [
          // Case 1: Rising edge (IN TRUE and not triggered) -> start pulse
          {
            conditions: [
              this.templateCondition(t.IN),
              this.stateCondition(r, "off"),
              this.stateCondition(n.timerId, "idle")
            ],
            sequence: [
              this.booleanTurnOn(r),
              this.booleanTurnOn(n.outputHelperId),
              this.timerStart(n.timerId, t.PT)
            ]
          },
          // Case 2: IN FALSE and timer idle -> reset trigger flag
          {
            conditions: [
              this.templateCondition(`not (${t.IN})`),
              this.stateCondition(n.timerId, "idle")
            ],
            sequence: [this.booleanTurnOff(r)]
          }
        ]
      }
    ], a = this.generateFinishedAutomation(
      e,
      n,
      "true",
      // always execute when timer finishes
      [this.booleanTurnOff(n.outputHelperId)]
    ), l = {
      Q: `(states('${n.outputHelperId}') == 'on')`
    };
    return {
      entities: n,
      helpers: s,
      mainActions: o,
      finishedAutomation: a,
      outputMappings: l
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
    const n = `ST ${e.programName} ${e.name}`;
    return [
      {
        id: t.timerId,
        type: "timer",
        name: `${n} Timer`
      },
      {
        id: t.outputHelperId,
        type: "input_boolean",
        name: `${n} Q`,
        initial: !1
      }
    ];
  }
  generateFinishedAutomation(e, t, n, s) {
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
      condition: n !== "true" ? [
        {
          condition: "template",
          value_template: `{{ ${n} }}`
        }
      ] : void 0,
      action: s
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
      const n = e.raw.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
      if (n) {
        const s = parseInt(n[1] || "0", 10), r = parseInt(n[2] || "0", 10), o = parseInt(n[3] || "0", 10), a = parseInt(n[4] || "0", 10), l = s * 3600 + r * 60 + o + a / 1e3;
        return String(l);
      }
    }
    return this.jinja.generateExpression(e);
  }
}
class YM {
  constructor() {
    E(this, "timerMappings", /* @__PURE__ */ new Map());
  }
  registerTimer(e, t) {
    this.timerMappings.set(e, t);
  }
  resolveOutput(e, t) {
    const n = this.timerMappings.get(e);
    if (!n) return null;
    switch (t) {
      case "Q":
        return n.Q;
      case "ET":
        return n.ET ?? null;
      default:
        return null;
    }
  }
  /**
   * Check if a variable/member pair refers to a known timer output.
   */
  isTimerOutputRef(e, t) {
    if (!this.timerMappings.has(e)) return !1;
    const n = t.toUpperCase();
    return n === "Q" || n === "ET";
  }
}
class XM {
  constructor(e) {
    E(this, "mappings", /* @__PURE__ */ new Map());
    E(this, "currentPath", []);
    E(this, "project");
    E(this, "program");
    E(this, "sourceFile");
    E(this, "sourceHash");
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
    const n = this.getCurrentPath();
    n && this.mappings.set(n, {
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
  recordAt(e, t, n) {
    this.mappings.set(e, {
      st: {
        file: this.sourceFile,
        line: t.line,
        column: t.column,
        endLine: t.endLine,
        endColumn: t.endColumn
      },
      description: n
    });
  }
  /**
   * Record mapping for an AST node
   * Handles both parser SourceLocation (startLine/startColumn) and sourcemap SourceLocation (line/column)
   */
  recordNode(e, t) {
    if (!e.location) return;
    const n = {
      file: this.sourceFile,
      line: e.location.startLine ?? e.location.line ?? 1,
      column: e.location.startColumn ?? e.location.column ?? 1
    };
    e.location.endLine && (n.endLine = e.location.endLine), e.location.endColumn && (n.endColumn = e.location.endColumn), this.record(n, t);
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
    for (let n = 0; n < e.length; n++) {
      const s = e.charCodeAt(n);
      t = (t << 5) - t + s, t = t & t;
    }
    return t.toString(16);
  }
}
class JM {
  constructor(e, t = "default", n) {
    E(this, "ast");
    E(this, "projectName");
    E(this, "depAnalysis");
    E(this, "storageAnalysis");
    E(this, "context");
    E(this, "sourceMapBuilder");
    E(this, "diagnostics", []);
    E(this, "timerTranspiler");
    E(this, "timerResolver");
    E(this, "timerHelpers", []);
    E(this, "additionalAutomations", []);
    E(this, "timerMainActions", []);
    this.ast = e, this.projectName = t, n && (this.sourceMapBuilder = new XM({
      project: t,
      program: e.name,
      sourceFile: `${e.name}.st`,
      sourceContent: n
      // Explicitly use parameter to avoid TS6133
    }));
  }
  /**
   * Transpile AST to HA automation and script
   */
  transpile() {
    this.depAnalysis = Hh(this.ast), this.storageAnalysis = GM(this.ast, this.projectName), this.diagnostics.push(
      ...this.depAnalysis.diagnostics.map((r) => {
        var o;
        return {
          severity: r.severity,
          code: r.code,
          message: r.message,
          stLine: (o = r.location) == null ? void 0 : o.line
        };
      }),
      ...this.storageAnalysis.diagnostics.map((r) => {
        var o;
        return {
          severity: r.severity,
          code: r.code,
          message: r.message,
          stLine: (o = r.location) == null ? void 0 : o.line
        };
      })
    ), this.buildContext(), this.timerTranspiler = new qM(this.context), this.timerResolver = new YM(), this.processTimerFBs();
    const e = this.generateAutomation(), t = this.generateScript(), n = [...this.storageAnalysis.helpers, ...this.timerHelpers], s = this.sourceMapBuilder ? this.sourceMapBuilder.build(e.id, t.alias.replace(/\[ST\]\s*/, "").toLowerCase().replace(/[^a-z0-9_]/g, "_")) : {
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
      helpers: n,
      additionalAutomations: this.additionalAutomations,
      sourceMap: s,
      diagnostics: this.diagnostics
    };
  }
  // ==========================================================================
  // Context Building
  // ==========================================================================
  buildContext() {
    var n, s, r;
    const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
    for (const o of this.ast.variables) {
      const a = this.storageAnalysis.variables.find((c) => c.name === o.name), l = this.depAnalysis.dependencies.find((c) => c.variableName === o.name), h = {
        name: o.name,
        dataType: o.dataType.name,
        isInput: ((n = o.binding) == null ? void 0 : n.direction) === "INPUT" || o.section === "VAR_INPUT",
        isOutput: ((s = o.binding) == null ? void 0 : s.direction) === "OUTPUT" || o.section === "VAR_OUTPUT",
        isPersistent: (a == null ? void 0 : a.storage.type) === "PERSISTENT",
        helperId: a == null ? void 0 : a.storage.helperId,
        entityId: (l == null ? void 0 : l.entityId) || ((r = o.binding) == null ? void 0 : r.entityId)
      };
      e.set(o.name, h), l && l.entityId && (l.direction === "INPUT" || l.direction === "OUTPUT") && t.set(o.name, {
        entityId: l.entityId,
        variableName: o.name,
        direction: l.direction,
        dataType: o.dataType.name
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
      const n = t.dataType.name.toUpperCase();
      (n === "TON" || n === "TOF" || n === "TP") && e.set(t.name, n);
    }
    e.size !== 0 && ra(this.ast, {
      onFunctionCall: (t) => {
        const n = e.get(t.name);
        if (!n)
          return;
        const s = {
          name: t.name,
          type: n,
          programName: this.ast.name,
          projectName: this.projectName
        }, r = this.timerTranspiler.parseTimerCall(t.name, t), o = {
          IN: r.inputs.IN ?? "true",
          PT: r.inputs.PT ?? "0"
        }, a = this.timerTranspiler.transpileTimer(s, o);
        this.timerHelpers.push(...a.helpers), this.additionalAutomations.push(a.finishedAutomation), this.timerMainActions.push(...a.mainActions), this.timerResolver.registerTimer(s.name, a.outputMappings);
      }
    });
  }
  // ==========================================================================
  // Automation Generation
  // ==========================================================================
  generateAutomation() {
    var r, o;
    const e = Wi(this.ast.pragmas), t = (r = e.find((a) => a.name === "throttle")) == null ? void 0 : r.value, n = (o = e.find((a) => a.name === "debounce")) == null ? void 0 : o.value, s = {
      id: `st_${this.projectName}_${this.ast.name}`.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      alias: `[ST] ${this.ast.name}`,
      description: `Generated from ST program: ${this.ast.name}`,
      mode: "single",
      // Automation is just dispatcher
      trigger: this.depAnalysis.triggers.map((a) => this.mapTriggerConfig(a)),
      action: []
    };
    if (t) {
      const a = `input_datetime.st_${this.projectName}_${this.ast.name}_last_run`.toLowerCase().replace(/[^a-z0-9_]/g, "_"), l = this.parseTimeToSeconds(t);
      s.condition = [{
        condition: "template",
        value_template: this.generateThrottleCondition(a, l)
      }], s.action.push({
        service: "input_datetime.set_datetime",
        target: { entity_id: a },
        data: { datetime: "{{ now().isoformat() }}" }
      });
    }
    if (n) {
      s.mode = "restart";
      const a = this.parseTimeToSeconds(n);
      s.action.push({
        delay: { seconds: a }
      });
    }
    return s.action.push({
      service: "script.turn_on",
      target: {
        entity_id: `script.st_${this.projectName}_${this.ast.name}_logic`.toLowerCase().replace(/[^a-z0-9_]/g, "_")
      }
    }), s;
  }
  generateThrottleCondition(e, t) {
    return `{% set last = states('${e}') %}
{% if last in ['unknown', 'unavailable', 'none', ''] %}
  true
{% else %}
  {{ (now() - (last | as_datetime)).total_seconds() > ${t} }}
{% endif %}`;
  }
  parseTimeToSeconds(e) {
    const t = e.match(/T#(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:(\d+)ms)?/i);
    if (!t) return 0;
    const n = parseInt(t[1] || "0", 10), s = parseInt(t[2] || "0", 10), r = parseInt(t[3] || "0", 10), o = parseInt(t[4] || "0", 10);
    return n * 3600 + s * 60 + r + o / 1e3;
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
    var a;
    const t = ((a = Wi(this.ast.pragmas).find((l) => l.name === "mode")) == null ? void 0 : a.value) || "restart", n = new KM(this.context, this.timerResolver, this.sourceMapBuilder), s = {
      alias: `[ST] ${this.ast.name} Logic`,
      description: `Logic script for ST program: ${this.ast.name}`,
      mode: t,
      sequence: []
    }, r = this.generateVariableInitializers();
    Object.keys(r).length > 0 && (s.variables = r), this.sourceMapBuilder && this.sourceMapBuilder.pushPath("sequence");
    const o = n.generateActions(this.ast.body);
    if (this.sourceMapBuilder && this.sourceMapBuilder.popPath(), s.sequence = [...this.timerMainActions, ...o], this.sourceMapBuilder) {
      const l = this.sourceMapBuilder.buildEmbedded();
      s.variables ? s.variables = {
        ...s.variables,
        _st_source_map: JSON.stringify(l._st_source_map),
        _st_source_file: l._st_source_file,
        _st_source_hash: l._st_source_hash
      } : s.variables = {
        _st_source_map: JSON.stringify(l._st_source_map),
        _st_source_file: l._st_source_file,
        _st_source_hash: l._st_source_hash
      };
    }
    return s;
  }
  generateVariableInitializers() {
    const e = {};
    for (const t of this.storageAnalysis.variables) {
      if (t.storage.type !== "TRANSIENT")
        continue;
      const n = this.ast.variables.find((s) => s.name === t.name);
      n != null && n.initialValue && n.initialValue.type === "Literal" && (n.initialValue.kind === "string" ? e[t.name] = String(n.initialValue.value) : n.initialValue.kind === "boolean" ? e[t.name] = n.initialValue.value ? "true" : "false" : e[t.name] = String(n.initialValue.value));
    }
    return e;
  }
}
function QM(i, e, t) {
  return new JM(i, e, t).transpile();
}
class ZM {
  constructor(e) {
    E(this, "connection");
    this.connection = e;
  }
  // ==========================================================================
  // Automation API
  // ==========================================================================
  async getAutomations() {
    return this.connection.callWS({
      type: "config/automation/list"
    });
  }
  async getAutomation(e) {
    try {
      return await this.connection.callWS({
        type: "config/automation/config",
        automation_id: e
      });
    } catch {
      return null;
    }
  }
  async saveAutomation(e, t) {
    await this.connection.callWS({
      type: "config/automation/config",
      automation_id: e,
      config: t
    });
  }
  async deleteAutomation(e) {
    await this.connection.callWS({
      type: "config/automation/delete",
      automation_id: e
    });
  }
  async reloadAutomations() {
    await this.connection.callService("automation", "reload");
  }
  // ==========================================================================
  // Script API
  // ==========================================================================
  async getScripts() {
    return this.connection.callWS({
      type: "config/script/list"
    });
  }
  async getScript(e) {
    try {
      return await this.connection.callWS({
        type: "config/script/config",
        script_id: e
      });
    } catch {
      return null;
    }
  }
  async saveScript(e, t) {
    await this.connection.callWS({
      type: "config/script/config",
      script_id: e,
      config: t
    });
  }
  async deleteScript(e) {
    await this.connection.callWS({
      type: "config/script/delete",
      script_id: e
    });
  }
  async reloadScripts() {
    await this.connection.callService("script", "reload");
  }
  // ==========================================================================
  // Helper API
  // ==========================================================================
  async getStates() {
    return this.connection.getStates();
  }
  async getSTHelpers(e = "st_") {
    return (await this.getStates()).filter((n) => {
      const s = n.entity_id.split(".")[1];
      return s == null ? void 0 : s.startsWith(e);
    });
  }
  async deleteHelper(e) {
    const [t, n] = e.split(".");
    await this.connection.callWS({
      type: `${t}/delete`,
      // e.g. input_number_id, input_boolean_id, ...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [`${t}_id`]: n
    });
  }
  async setHelperValue(e, t) {
    const [n] = e.split(".");
    switch (n) {
      case "input_boolean":
        await this.connection.callService(
          "input_boolean",
          t ? "turn_on" : "turn_off",
          { entity_id: e }
        );
        break;
      case "input_number":
        await this.connection.callService("input_number", "set_value", {
          entity_id: e,
          value: t
        });
        break;
      case "input_text":
        await this.connection.callService("input_text", "set_value", {
          entity_id: e,
          value: t
        });
        break;
      case "input_datetime":
        await this.connection.callService("input_datetime", "set_datetime", {
          entity_id: e,
          datetime: t
        });
        break;
      case "counter":
        await this.connection.callService("counter", "set_value", {
          entity_id: e,
          value: t
        });
        break;
    }
  }
}
class Cb {
  constructor(e, t = "st_") {
    E(this, "api");
    E(this, "projectPrefix");
    this.api = e, this.projectPrefix = t;
  }
  async calculateSync(e) {
    const t = await this.getExistingHelpers(), n = new Set(t.map((o) => o.entityId)), s = new Set(e.map((o) => o.id)), r = {
      toCreate: [],
      toUpdate: [],
      toDelete: [],
      unchanged: []
    };
    for (const o of e)
      if (!n.has(o.id))
        r.toCreate.push(o);
      else {
        const a = t.find((l) => l.entityId === o.id);
        a && this.needsUpdate(o, a) ? r.toUpdate.push(o) : r.unchanged.push(o.id);
      }
    for (const o of t)
      s.has(o.entityId) || r.toDelete.push(o.entityId);
    return r;
  }
  async getExistingHelpers() {
    return (await this.api.getSTHelpers(this.projectPrefix)).map((t) => ({
      entityId: t.entity_id,
      type: t.entity_id.split(".")[0],
      state: t.state,
      attributes: t.attributes
    }));
  }
  needsUpdate(e, t) {
    if (e.type !== t.type)
      return !0;
    if (e.type === "input_number") {
      const n = t.attributes, s = n.min, r = n.max;
      if (e.min !== s || e.max !== r)
        return !0;
    }
    return !1;
  }
  async applySync(e, t = {}) {
    for (const n of e.toCreate)
      await this.createHelper(n);
    for (const n of e.toUpdate)
      await this.api.deleteHelper(n.id), await this.createHelper(n);
    if (!t.skipDeletes)
      for (const n of e.toDelete)
        await this.api.deleteHelper(n);
  }
  async createHelper(e) {
    const t = e.name || this.extractName(e.id);
    switch (e.type) {
      case "input_boolean":
        await this.api.setHelperValue(e.id, e.initial ?? !1);
        break;
      case "input_number":
        await this.api.setHelperValue(e.id, e.initial ?? e.min ?? 0);
        break;
      case "input_text":
        await this.api.setHelperValue(e.id, e.initial ?? "");
        break;
      case "input_datetime":
        await this.api.setHelperValue(e.id, e.initial ?? "");
        break;
      default:
        throw new Error(`Unknown helper type: ${e.type} (${t})`);
    }
  }
  extractName(e) {
    const t = e.split(".");
    return t.length !== 2 ? e : t[1].split("_").map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
  }
  async getHelperStates(e) {
    const t = await this.api.getStates(), n = {};
    for (const s of e) {
      const r = t.find((o) => o.entity_id === s);
      r && (n[s] = this.parseHelperValue(r));
    }
    return n;
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
    for (const [t, n] of Object.entries(e))
      try {
        await this.api.setHelperValue(t, n);
      } catch (s) {
        console.warn(`Failed to restore ${t}:`, s);
      }
  }
}
const to = "st_hass_backups", Qd = 10;
class eL {
  constructor(e) {
    E(this, "api");
    E(this, "helperManager");
    this.api = e, this.helperManager = new Cb(e);
  }
  async createBackup(e, t) {
    const n = await this.api.getAutomation(e), s = `st_${e}_logic`, r = await this.api.getScript(s), a = (await this.helperManager.getExistingHelpers()).map((u) => ({
      id: u.entityId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: u.type,
      name: u.attributes.friendly_name || u.entityId
    })), l = a.map((u) => u.id), h = await this.helperManager.getHelperStates(l), c = {
      id: this.generateId(),
      timestamp: /* @__PURE__ */ new Date(),
      projectName: "default",
      programName: t,
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        automation: n,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        script: r,
        helpers: a,
        helperStates: h
      }
    };
    return await this.saveBackup(c), c;
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
      const n = `st_${t.data.automation.id}_logic`;
      await this.api.saveScript(
        n,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t.data.script
      );
    }
    for (const n of t.data.helpers)
      try {
        await this.helperManager.createHelper(n);
      } catch {
      }
    await this.helperManager.restoreHelperStates(t.data.helperStates), await this.api.reloadAutomations(), await this.api.reloadScripts();
  }
  async listBackups() {
    const e = window.localStorage.getItem(to);
    if (!e) return [];
    try {
      return JSON.parse(e).map((n) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    } catch {
      return [];
    }
  }
  async loadBackup(e) {
    return (await this.listBackups()).find((n) => n.id === e) || null;
  }
  async deleteBackup(e) {
    const n = (await this.listBackups()).filter((s) => s.id !== e);
    window.localStorage.setItem(to, JSON.stringify(n));
  }
  async saveBackup(e) {
    const t = await this.listBackups();
    t.unshift(e);
    const n = t.slice(0, Qd);
    window.localStorage.setItem(to, JSON.stringify(n));
  }
  async cleanupOldBackups(e = Qd) {
    const t = await this.listBackups();
    if (t.length <= e) return 0;
    const n = t.slice(e), s = t.slice(0, e);
    return window.localStorage.setItem(to, JSON.stringify(s)), n.length;
  }
  generateId() {
    return `backup_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }
}
const io = "st_hass_schemas";
class tL {
  save(e, t) {
    const n = this.loadAll();
    n[e] = t, localStorage.setItem(io, JSON.stringify(n));
  }
  load(e) {
    return this.loadAll()[e] || null;
  }
  loadAll() {
    const e = localStorage.getItem(io);
    if (!e) return {};
    try {
      return JSON.parse(e);
    } catch {
      return {};
    }
  }
  delete(e) {
    const t = this.loadAll();
    delete t[e], localStorage.setItem(io, JSON.stringify(t));
  }
  clear() {
    localStorage.removeItem(io);
  }
}
class iL {
  /**
   * Detect migration issues between old and new schema
   */
  detectIssues(e, t) {
    const n = [];
    if (!e)
      return {
        issues: [],
        hasDestructiveChanges: !1,
        requiresUserInput: !1
      };
    const s = new Map(e.variables.map((o) => [o.name, o])), r = new Map(t.variables.map((o) => [o.name, o]));
    for (const [o, a] of s)
      r.has(o) || n.push(this.createRemovedIssue(a));
    for (const [o, a] of r) {
      const l = s.get(o);
      if (!l)
        n.push(this.createAddedIssue(a));
      else {
        const h = this.detectChanges(l, a);
        n.push(...h);
      }
    }
    return {
      issues: n,
      hasDestructiveChanges: n.some(
        (o) => o.options.some((a) => a.isDestructive)
      ),
      requiresUserInput: n.some(
        (o) => o.type === "removed" || o.type === "type_changed"
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
    const n = [];
    return e.dataType !== t.dataType && n.push({
      type: "type_changed",
      variable: e.name,
      helperId: e.helperId,
      details: `Typ geändert: ${e.dataType} → ${t.dataType}`,
      oldSchema: e,
      newSchema: t,
      options: this.getTypeChangeOptions(e, t),
      defaultOption: "convert"
    }), e.helperType === "input_number" && t.helperType === "input_number" && (e.min !== t.min || e.max !== t.max) && n.push({
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
    }), n;
  }
  getTypeChangeOptions(e, t) {
    const n = [];
    return this.canConvert(e.dataType, t.dataType) && n.push({
      id: "convert",
      label: "Wert konvertieren",
      description: `Konvertiert ${e.dataType} zu ${t.dataType}`
    }), n.push({
      id: "reset",
      label: "Auf Initialwert zurücksetzen",
      description: `Setzt auf ${JSON.stringify(t.initialValue)}`,
      isDestructive: !0
    }), n.push({
      id: "keep_helper",
      label: "Alten Helper behalten, neuen erstellen",
      description: "Erstellt neuen Helper, alter wird orphaned"
    }), n;
  }
  canConvert(e, t) {
    var s;
    return ((s = {
      INT: ["DINT", "REAL", "LREAL", "STRING"],
      DINT: ["REAL", "LREAL", "STRING"],
      REAL: ["LREAL", "STRING"],
      LREAL: ["STRING"],
      BOOL: ["INT", "STRING"]
    }[e]) == null ? void 0 : s.includes(t)) ?? !1;
  }
}
class nL {
  constructor(e) {
    E(this, "api");
    E(this, "helperManager");
    E(this, "backupManager");
    E(this, "schemaStorage");
    E(this, "migrationDetector");
    this.api = e, this.helperManager = new Cb(e), this.backupManager = new eL(e), this.schemaStorage = new tL(), this.migrationDetector = new iL();
  }
  async deploy(e, t = {}) {
    const n = this.createTransaction(e);
    try {
      await this.validateDeployment(e), t.createBackup && await this.backupManager.createBackup(e.automation.id, e.automation.alias);
      const s = await this.calculateOperations(e);
      if (n.operations = s, t.dryRun)
        return {
          success: !0,
          transactionId: n.id,
          operations: s,
          errors: []
        };
      n.status = "in_progress";
      for (const o of s)
        try {
          await this.applyOperation(o), o.status = "applied";
        } catch (a) {
          return o.status = "failed", o.error = a instanceof Error ? a.message : String(a), await this.rollback(n), {
            success: !1,
            transactionId: n.id,
            operations: s,
            errors: [
              {
                operation: o,
                message: o.error ?? "Unknown deploy error",
                code: "DEPLOY_FAILED"
              }
            ]
          };
        }
      return await this.reloadAll(), await this.verifyDeployment(e) ? (n.status = "committed", {
        success: !0,
        transactionId: n.id,
        operations: s,
        errors: []
      }) : (await this.rollback(n), {
        success: !1,
        transactionId: n.id,
        operations: s,
        errors: [
          {
            message: "Deployment verification failed",
            code: "VERIFY_FAILED"
          }
        ]
      });
    } catch (s) {
      n.status = "failed";
      const r = {
        message: s instanceof Error ? s.message : String(s),
        code: "DEPLOY_ERROR"
      };
      return {
        success: !1,
        transactionId: n.id,
        operations: n.operations,
        errors: [r]
      };
    }
  }
  async rollback(e) {
    const t = e.operations.filter((n) => n.status === "applied").reverse();
    for (const n of t)
      try {
        await this.revertOperation(n), n.status = "reverted";
      } catch (s) {
        console.error(`Failed to revert operation ${n.id}:`, s);
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
    const t = e.diagnostics.filter((n) => n.severity === "Error");
    if (t.length > 0)
      throw new Error(`Transpilation errors: ${t.map((n) => n.message).join(", ")}`);
    if (e.automation.trigger.length === 0)
      throw new Error("Automation has no triggers - it will never execute");
  }
  async calculateOperations(e) {
    const t = [], n = await this.api.getAutomation(e.automation.id);
    t.push({
      id: this.generateId(),
      type: n ? "update" : "create",
      entityType: "automation",
      entityId: e.automation.id,
      previousState: n ?? void 0,
      newState: e.automation,
      status: "pending"
    });
    const s = `st_${e.automation.id}_logic`, r = await this.api.getScript(s);
    t.push({
      id: this.generateId(),
      type: r ? "update" : "create",
      entityType: "script",
      entityId: s,
      previousState: r ?? void 0,
      newState: e.script,
      status: "pending"
    });
    const o = await this.helperManager.calculateSync(e.helpers);
    for (const a of o.toCreate)
      t.push({
        id: this.generateId(),
        type: "create",
        entityType: "helper",
        entityId: a.id,
        newState: a,
        status: "pending"
      });
    for (const a of o.toUpdate)
      t.push({
        id: this.generateId(),
        type: "update",
        entityType: "helper",
        entityId: a.id,
        newState: a,
        status: "pending"
      });
    for (const a of o.toDelete)
      t.push({
        id: this.generateId(),
        type: "delete",
        entityType: "helper",
        entityId: a,
        status: "pending"
      });
    return t;
  }
  /**
   * Build a ProgramSchema from current helper configuration.
   * This does not change deploy behaviour and can be used by UI code
   * to drive migration flows.
   */
  buildProgramSchema(e) {
    const t = e.automation.alias.replace("[ST] ", ""), n = "default", s = e.helpers.map((r) => ({
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
      projectName: n,
      variables: s,
      version: "1.0",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Create a migration plan based on previous and current schemas.
   * Intended to be called by higher-level UI logic before executing a deploy.
   */
  createMigrationPlan(e) {
    const t = this.buildProgramSchema(e), n = e.automation.id, s = this.schemaStorage.load(n), r = this.migrationDetector.detectIssues(s, t);
    return this.schemaStorage.save(n, t), r;
  }
  generateId() {
    return `op_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
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
        e.type === "delete" ? await this.api.deleteHelper(e.entityId) : await this.helperManager.createHelper(e.newState);
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
    if (!await this.api.getAutomation(e.automation.id)) return !1;
    const n = `st_${e.automation.id}_logic`;
    if (!await this.api.getScript(n)) return !1;
    const r = await this.api.getStates();
    for (const o of e.helpers)
      if (!r.some((l) => l.entity_id === o.id)) return !1;
    return !0;
  }
}
async function sL(i, e, t) {
  return new nL(i).deploy(e, t);
}
var kb = Object.defineProperty, rL = Object.getOwnPropertyDescriptor, oL = (i, e, t) => e in i ? kb(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t, rt = (i, e, t, n) => {
  for (var s = n > 1 ? void 0 : n ? rL(e, t) : e, r = i.length - 1, o; r >= 0; r--)
    (o = i[r]) && (s = (n ? o(e, t, s) : o(s)) || s);
  return n && s && kb(e, t, s), s;
}, aL = (i, e, t) => oL(i, e + "", t);
let Fe = class extends xt {
  constructor() {
    super(), this.narrow = !1, this._showEntityBrowser = !1, this._showProjectExplorer = !1, this._project = null, this._storage = null, this._code = `{mode: restart}
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
  updated(i) {
    super.updated(i), i.has("hass") && (this._initializeStorage(), this._project || this._initializeProject());
  }
  _initializeStorage() {
    var i, e;
    if ((i = this.hass) != null && i.connection) {
      const t = ((e = this.hass.config) == null ? void 0 : e.entry_id) || "default";
      this._storage = new Ko(this.hass.connection, t);
    } else
      this._storage = new Ko(null, "default");
  }
  async _initializeProject() {
    if (this._storage || this._initializeStorage(), this._storage)
      try {
        const i = await this._storage.loadProject();
        if (i) {
          if (this._project = i, i.activeFileId) {
            const e = i.files.find(
              (t) => t.id === i.activeFileId
            );
            e && (this._code = e.content);
          }
        } else
          this._project = this._storage.migrateFromSingleFile(this._code), await this._storage.saveProject(this._project);
      } catch (i) {
        console.error("Failed to load project", i);
      }
  }
  render() {
    var t, n, s;
    const i = this._diagnostics.filter(
      (r) => r.severity === "Error"
    ).length, e = this._diagnostics.filter(
      (r) => r.severity === "Warning"
    ).length;
    return U`
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
        ${this._onlineState ? U`
              <st-online-toolbar
                .state=${this._onlineState}
                @connect=${this._handleOnlineConnect}
                @disconnect=${this._handleOnlineDisconnect}
                @toggle-pause=${this._handleOnlineTogglePause}
                @setting-change=${this._handleOnlineSettingChange}
              ></st-online-toolbar>
            ` : ""}
        <div class="main-content">
          ${this._showProjectExplorer ? U`
                <div class="project-sidebar">
                  <st-project-explorer
                    .hass=${this.hass}
                    .project=${this._project}
                    @file-open=${this._handleFileOpen}
                    @file-selected=${this._handleFileSelected}
                    @file-rename=${this._handleFileRename}
                    @file-deleted=${this._handleFileDeleted}
                  ></st-project-explorer>
                </div>
              ` : ""}
          <div class="sidebar ${this._showEntityBrowser ? "" : "hidden"}">
            <st-entity-browser .hass=${this.hass}></st-entity-browser>
          </div>
          <div class="content-area">
            ${this._project ? U`
                  <div class="tabs-container">
                    ${this._getOpenFiles().map(
      (r) => U`
                        <button
                          class="tab ${r.id === this._project.activeFileId ? "active" : ""}"
                          @click=${() => this._switchToFile(r.id)}
                          title=${r.path}
                        >
                          <span>${r.name}</span>
                          ${r.hasUnsavedChanges ? U`<div class="unsaved-dot"></div>` : ""}
                          <div
                            class="tab-close"
                            @click=${(o) => {
        o.stopPropagation(), this._closeFile(r.id);
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
        ${this._diagnostics.length > 0 ? U`
              <div class="diagnostics-panel">
                ${this._diagnostics.map(
      (r) => U`
                    <div
                      class="diagnostic diagnostic-${r.severity.toLowerCase()}"
                    >
                      ${r.line ? `[${r.line}:${r.column || 0}] ` : ""}${r.code ? `${r.code}: ` : ""}${r.message}
                    </div>
                  `
    )}
              </div>
            ` : ""}
        <div class="status-bar">
          ${this._syntaxOk ? U`<span class="status-ok">✓ Syntax OK</span>` : U`<span class="status-error">✗ Syntax Error</span>`}
          ${i > 0 ? U`<span class="status-error">${i} Error(s)</span>` : ""}
          ${e > 0 ? U`<span class="status-warning"
                >${e} Warning(s)</span
              >` : ""}
          <span>Triggers: ${this._triggers.length}</span>
          <span>Entities: ${this._entityCount}</span>
          ${(t = this._metadata) != null && t.mode ? U`<span>Mode: ${this._metadata.mode}</span>` : ""}
          ${(n = this._metadata) != null && n.hasPersistentVars ? U`<span>💾 Persistent</span>` : ""}
          ${(s = this._metadata) != null && s.hasTimers ? U`<span>⏱️ Timers</span>` : ""}
        </div>
      </div>
    `;
  }
  _handleCodeChange(i) {
    const e = i.detail.code;
    if (this._project && this._project.activeFileId) {
      const t = this._project.files.find(
        (n) => n.id === this._project.activeFileId
      );
      t && (t.content = e, t.hasUnsavedChanges = !0, t.lastModified = Date.now(), this._project.lastModified = Date.now());
    } else
      this._code = e;
    this._analyzeCode();
  }
  _getCurrentCode() {
    if (this._project && this._project.activeFileId) {
      const i = this._project.files.find(
        (e) => e.id === this._project.activeFileId
      );
      return (i == null ? void 0 : i.content) || "";
    }
    return this._code;
  }
  _getOpenFiles() {
    return this._project ? this._project.files.filter((i) => i.isOpen) : [];
  }
  _switchToFile(i) {
    var n;
    if (!this._project) return;
    const e = this._project.files.find((s) => s.id === i);
    if (!e) return;
    const t = (n = this.shadowRoot) == null ? void 0 : n.querySelector(
      "st-editor"
    );
    if (t && this._project.activeFileId) {
      const s = this._project.files.find(
        (r) => r.id === this._project.activeFileId
      );
      if (s) {
        const r = t.getCode();
        r !== s.content && (s.content = r, s.hasUnsavedChanges = !0, s.lastModified = Date.now());
      }
    }
    this._project.activeFileId = i, this._project.files.forEach((s) => {
      s.isOpen = s.id === i || s.isOpen;
    }), this._project.lastModified = Date.now(), t && t.setCode(e.content), this._saveProject(), this.requestUpdate();
  }
  _closeFile(i) {
    if (!this._project) return;
    const e = this._project.files.find((t) => t.id === i);
    if (e && !(e.hasUnsavedChanges && !confirm(`File "${e.name}" has unsaved changes. Close anyway?`))) {
      if (e.isOpen = !1, this._project.activeFileId === i) {
        const t = this._project.files.filter(
          (n) => n.isOpen && n.id !== i
        );
        this._project.activeFileId = t.length > 0 ? t[0].id : null;
      }
      this._project.lastModified = Date.now(), this._saveProject(), this.requestUpdate();
    }
  }
  _handleFileOpen(i) {
    const { fileId: e } = i.detail;
    this._switchToFile(e);
  }
  _handleFileSelected(i) {
  }
  _handleFileRename(i) {
    const { fileId: e, newName: t } = i.detail;
    if (!this._project) return;
    const n = this._project.files.find((s) => s.id === e);
    n && (n.name = t, n.path = t, n.lastModified = Date.now(), this._project.lastModified = Date.now(), this._saveProject());
  }
  _handleFileDeleted(i) {
    const { fileId: e } = i.detail;
    this._closeFile(e);
  }
  async _saveProject() {
    if (!(!this._storage || !this._project))
      try {
        await this._storage.saveProject(this._project);
      } catch (i) {
        console.error("Failed to save project", i);
      }
  }
  _toggleProjectExplorer() {
    this._showProjectExplorer = !this._showProjectExplorer;
  }
  /**
   * Parse and analyze the current code
   * Updates all reactive state with results
   */
  _analyzeCode() {
    var t, n;
    const i = [], e = _l(this._code);
    if (e.errors.length > 0)
      for (const s of e.errors)
        i.push({
          severity: "Error",
          message: s.message,
          line: s.line,
          column: s.column
        });
    if (this._syntaxOk = e.success && e.ast !== void 0, e.success && e.ast) {
      const s = Hh(e.ast);
      for (const r of s.diagnostics)
        i.push({
          severity: r.severity,
          code: r.code,
          message: r.message,
          line: (t = r.location) == null ? void 0 : t.line,
          column: (n = r.location) == null ? void 0 : n.column
        });
      this._triggers = s.triggers, this._metadata = s.metadata, this._entityCount = s.dependencies.length;
    } else
      this._triggers = [], this._metadata = null, this._entityCount = 0;
    this._diagnostics = i;
  }
  async _handleDeploy() {
    var n;
    if (!this._syntaxOk) {
      console.error("Cannot deploy: syntax errors present");
      return;
    }
    if (!((n = this.hass) != null && n.connection)) {
      console.error(
        "Cannot deploy: Home Assistant connection is not available"
      );
      return;
    }
    const i = _l(this._code);
    if (!i.success || !i.ast) {
      console.error("Cannot deploy: parsing failed");
      return;
    }
    const e = QM(i.ast, "home");
    if (e.diagnostics.some((s) => s.severity === "Error")) {
      console.error(
        "Cannot deploy: transpiler reported errors",
        e.diagnostics
      );
      return;
    }
    const t = new ZM(this.hass.connection);
    try {
      const s = await sL(t, e, {
        createBackup: !0
      });
      s.success ? console.log("Deploy successful", s.transactionId) : console.error("Deploy failed", s.errors);
    } catch (s) {
      console.error("Deploy error", s);
    }
  }
  /**
   * Extract variable bindings from AST for online mode
   */
  _extractBindings(i) {
    const e = [];
    for (const t of i)
      !t.entityId || !t.location || e.push({
        variableName: t.variableName,
        entityId: t.entityId,
        dataType: t.dataType,
        line: t.location.line,
        column: t.location.column,
        endColumn: t.location.column + t.variableName.length,
        isInput: t.direction === "INPUT",
        isOutput: t.direction === "OUTPUT",
        isPersistent: !1
        // Will be determined from storage analysis if needed
      });
    return e;
  }
  async _handleOnlineConnect() {
    var s, r;
    if (!this._syntaxOk || !((s = this.hass) != null && s.connection))
      return;
    const i = _l(this._code);
    if (!i.success || !i.ast)
      return;
    const e = Hh(i.ast), t = this._extractBindings(e.dependencies), n = (r = this.shadowRoot) == null ? void 0 : r.querySelector(
      "st-editor"
    );
    if (n)
      try {
        await n.startOnlineMode(t), this._onlineState = n.getOnlineState();
      } catch (o) {
        console.error("Failed to start online mode", o);
      }
  }
  _handleOnlineDisconnect() {
    var e;
    const i = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "st-editor"
    );
    i && (i.stopOnlineMode(), this._onlineState = null);
  }
  _handleOnlineTogglePause() {
    var e;
    const i = (e = this.shadowRoot) == null ? void 0 : e.querySelector(
      "st-editor"
    );
    if (i && this._onlineState) {
      const t = this._onlineState.status === "paused";
      i.setOnlinePaused(!t), this._onlineState = i.getOnlineState();
    }
  }
  _handleOnlineSettingChange(i) {
    console.log("Online setting changed", i.detail);
  }
  _toggleEntityBrowser() {
    this._showEntityBrowser = !this._showEntityBrowser;
  }
};
aL(Fe, "styles", Ji`
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
rt([
  Ce({ attribute: !1 })
], Fe.prototype, "hass", 2);
rt([
  Ce({ type: Boolean })
], Fe.prototype, "narrow", 2);
rt([
  fe()
], Fe.prototype, "_code", 2);
rt([
  fe()
], Fe.prototype, "_project", 2);
rt([
  fe()
], Fe.prototype, "_syntaxOk", 2);
rt([
  fe()
], Fe.prototype, "_triggers", 2);
rt([
  fe()
], Fe.prototype, "_diagnostics", 2);
rt([
  fe()
], Fe.prototype, "_metadata", 2);
rt([
  fe()
], Fe.prototype, "_entityCount", 2);
rt([
  fe()
], Fe.prototype, "_onlineState", 2);
rt([
  fe()
], Fe.prototype, "_showEntityBrowser", 2);
rt([
  fe()
], Fe.prototype, "_showProjectExplorer", 2);
rt([
  fe()
], Fe.prototype, "_storage", 2);
Fe = rt([
  Qi("st-panel")
], Fe);
console.log("ST for Home Assistant loaded");
export {
  rs as STEditor,
  hg as ST_BUILTINS,
  cg as ST_FUNCTION_BLOCKS,
  ag as ST_KEYWORDS,
  AE as ST_PRAGMAS,
  lg as ST_TYPES,
  kE as stEditorTheme,
  _E as stHighlightStyle,
  OE as stTheme,
  CE as structuredText
};
//# sourceMappingURL=st-panel.js.map
