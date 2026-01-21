let An = 0;
class ft {
  constructor(e, r) {
    this.from = e, this.to = r;
  }
}
class E {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = An++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
    return typeof e != "function" && (e = V.match(e)), (r) => {
      let n = e(r);
      return n === void 0 ? null : [this, n];
    };
  }
}
E.closedBy = new E({ deserialize: (t) => t.split(" ") });
E.openedBy = new E({ deserialize: (t) => t.split(" ") });
E.group = new E({ deserialize: (t) => t.split(" ") });
E.isolate = new E({ deserialize: (t) => {
  if (t && t != "rtl" && t != "ltr" && t != "auto")
    throw new RangeError("Invalid value for isolate: " + t);
  return t || "auto";
} });
E.contextHash = new E({ perNode: !0 });
E.lookAhead = new E({ perNode: !0 });
E.mounted = new E({ perNode: !0 });
class Ce {
  constructor(e, r, n, i = !1) {
    this.tree = e, this.overlay = r, this.parser = n, this.bracketed = i;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[E.mounted.id];
  }
}
const Sn = /* @__PURE__ */ Object.create(null);
class V {
  /**
  @internal
  */
  constructor(e, r, n, i = 0) {
    this.name = e, this.props = r, this.id = n, this.flags = i;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let r = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Sn, n = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), i = new V(e.name || "", r, e.id, n);
    if (e.props) {
      for (let s of e.props)
        if (Array.isArray(s) || (s = s(i)), s) {
          if (s[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          r[s[0].id] = s[1];
        }
    }
    return i;
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
      let r = this.prop(E.group);
      return r ? r.indexOf(e) > -1 : !1;
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
    let r = /* @__PURE__ */ Object.create(null);
    for (let n in e)
      for (let i of n.split(" "))
        r[i] = e[n];
    return (n) => {
      for (let i = n.prop(E.group), s = -1; s < (i ? i.length : 0); s++) {
        let a = r[s < 0 ? n.name : i[s]];
        if (a)
          return a;
      }
    };
  }
}
V.none = new V(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class Mr {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(e) {
    this.types = e;
    for (let r = 0; r < e.length; r++)
      if (e[r].id != r)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...e) {
    let r = [];
    for (let n of this.types) {
      let i = null;
      for (let s of e) {
        let a = s(n);
        if (a) {
          i || (i = Object.assign({}, n.props));
          let o = a[1], f = a[0];
          f.combine && f.id in i && (o = f.combine(i[f.id], o)), i[f.id] = o;
        }
      }
      r.push(i ? new V(n.name, i, n.id, n.flags) : n);
    }
    return new Mr(r);
  }
}
const ze = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap();
var M;
(function(t) {
  t[t.ExcludeBuffers = 1] = "ExcludeBuffers", t[t.IncludeAnonymous = 2] = "IncludeAnonymous", t[t.IgnoreMounts = 4] = "IgnoreMounts", t[t.IgnoreOverlays = 8] = "IgnoreOverlays", t[t.EnterBracketed = 16] = "EnterBracketed";
})(M || (M = {}));
class K {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, r, n, i, s) {
    if (this.type = e, this.children = r, this.positions = n, this.length = i, this.props = null, s && s.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [a, o] of s)
        this.props[typeof a == "number" ? a : a.id] = o;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = Ce.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let r = "";
    for (let n of this.children) {
      let i = n.toString();
      i && (r && (r += ","), r += i);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (r.length ? "(" + r + ")" : "") : r;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new yt(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, r = 0, n = 0) {
    let i = ze.get(this) || this.topNode, s = new yt(i);
    return s.moveTo(e, r), ze.set(this, s._tree), s;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new G(this, 0, 0, null);
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
  resolve(e, r = 0) {
    let n = Ee(ze.get(this) || this.topNode, e, r, !1);
    return ze.set(this, n), n;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, r = 0) {
    let n = Ee(Wt.get(this) || this.topNode, e, r, !0);
    return Wt.set(this, n), n;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, r = 0) {
    return $n(this, e, r);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: r, leave: n, from: i = 0, to: s = this.length } = e, a = e.mode || 0, o = (a & M.IncludeAnonymous) > 0;
    for (let f = this.cursor(a | M.IncludeAnonymous); ; ) {
      let l = !1;
      if (f.from <= s && f.to >= i && (!o && f.type.isAnonymous || r(f) !== !1)) {
        if (f.firstChild())
          continue;
        l = !0;
      }
      for (; l && n && (o || !f.type.isAnonymous) && n(f), !f.nextSibling(); ) {
        if (!f.parent())
          return;
        l = !0;
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
      for (let r in this.props)
        e.push([+r, this.props[r]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : Ct(V.none, this.children, this.positions, 0, this.children.length, 0, this.length, (r, n, i) => new K(this.type, r, n, i, this.propValues), e.makeTree || ((r, n, i) => new K(V.none, r, n, i)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Cn(e);
  }
}
K.empty = new K(V.none, [], [], 0);
class Ot {
  constructor(e, r) {
    this.buffer = e, this.index = r;
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
    return new Ot(this.buffer, this.index);
  }
}
class ue {
  /**
  Create a tree buffer.
  */
  constructor(e, r, n) {
    this.buffer = e, this.length = r, this.set = n;
  }
  /**
  @internal
  */
  get type() {
    return V.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let r = 0; r < this.buffer.length; )
      e.push(this.childString(r)), r = this.buffer[r + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let r = this.buffer[e], n = this.buffer[e + 3], i = this.set.types[r], s = i.name;
    if (/\W/.test(s) && !i.isError && (s = JSON.stringify(s)), e += 4, n == e)
      return s;
    let a = [];
    for (; e < n; )
      a.push(this.childString(e)), e = this.buffer[e + 3];
    return s + "(" + a.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, r, n, i, s) {
    let { buffer: a } = this, o = -1;
    for (let f = e; f != r && !(Br(s, i, a[f + 1], a[f + 2]) && (o = f, n > 0)); f = a[f + 3])
      ;
    return o;
  }
  /**
  @internal
  */
  slice(e, r, n) {
    let i = this.buffer, s = new Uint16Array(r - e), a = 0;
    for (let o = e, f = 0; o < r; ) {
      s[f++] = i[o++], s[f++] = i[o++] - n;
      let l = s[f++] = i[o++] - n;
      s[f++] = i[o++] - e, a = Math.max(a, l);
    }
    return new ue(s, a, this.set);
  }
}
function Br(t, e, r, n) {
  switch (t) {
    case -2:
      return r < e;
    case -1:
      return n >= e && r < e;
    case 0:
      return r < e && n > e;
    case 1:
      return r <= e && n > e;
    case 2:
      return n > e;
    case 4:
      return !0;
  }
}
function Ee(t, e, r, n) {
  for (var i; t.from == t.to || (r < 1 ? t.from >= e : t.from > e) || (r > -1 ? t.to <= e : t.to < e); ) {
    let a = !n && t instanceof G && t.index < 0 ? null : t.parent;
    if (!a)
      return t;
    t = a;
  }
  let s = n ? 0 : M.IgnoreOverlays;
  if (n)
    for (let a = t, o = a.parent; o; a = o, o = a.parent)
      a instanceof G && a.index < 0 && ((i = o.enter(e, r, s)) === null || i === void 0 ? void 0 : i.from) != a.from && (t = o);
  for (; ; ) {
    let a = t.enter(e, r, s);
    if (!a)
      return t;
    t = a;
  }
}
class Dr {
  cursor(e = 0) {
    return new yt(this, e);
  }
  getChild(e, r = null, n = null) {
    let i = Zt(this, e, r, n);
    return i.length ? i[0] : null;
  }
  getChildren(e, r = null, n = null) {
    return Zt(this, e, r, n);
  }
  resolve(e, r = 0) {
    return Ee(this, e, r, !1);
  }
  resolveInner(e, r = 0) {
    return Ee(this, e, r, !0);
  }
  matchContext(e) {
    return dt(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let r = this.childBefore(e), n = this;
    for (; r; ) {
      let i = r.lastChild;
      if (!i || i.to != r.to)
        break;
      i.type.isError && i.from == i.to ? (n = r, r = i.prevSibling) : r = i;
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
class G extends Dr {
  constructor(e, r, n, i) {
    super(), this._tree = e, this.from = r, this.index = n, this._parent = i;
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
  nextChild(e, r, n, i, s = 0) {
    var a;
    for (let o = this; ; ) {
      for (let { children: f, positions: l } = o._tree, g = r > 0 ? f.length : -1; e != g; e += r) {
        let h = f[e], c = l[e] + o.from;
        if (!(!(s & M.EnterBracketed && h instanceof K && ((a = Ce.get(h)) === null || a === void 0 ? void 0 : a.overlay) === null && (c >= n || c + h.length <= n)) && !Br(i, n, c, c + h.length))) {
          if (h instanceof ue) {
            if (s & M.ExcludeBuffers)
              continue;
            let y = h.findChild(0, h.buffer.length, r, n - c, i);
            if (y > -1)
              return new le(new Tn(o, h, e, c), null, y);
          } else if (s & M.IncludeAnonymous || !h.type.isAnonymous || $t(h)) {
            let y;
            if (!(s & M.IgnoreMounts) && (y = Ce.get(h)) && !y.overlay)
              return new G(y.tree, c, e, o);
            let p = new G(h, c, e, o);
            return s & M.IncludeAnonymous || !p.type.isAnonymous ? p : p.nextChild(r < 0 ? h.children.length - 1 : 0, r, n, i, s);
          }
        }
      }
      if (s & M.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? e = o.index + r : e = r < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
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
  enter(e, r, n = 0) {
    let i;
    if (!(n & M.IgnoreOverlays) && (i = Ce.get(this._tree)) && i.overlay) {
      let s = e - this.from, a = n & M.EnterBracketed && i.bracketed;
      for (let { from: o, to: f } of i.overlay)
        if ((r > 0 || a ? o <= s : o < s) && (r < 0 || a ? f >= s : f > s))
          return new G(i.tree, i.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, r, n);
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
function Zt(t, e, r, n) {
  let i = t.cursor(), s = [];
  if (!i.firstChild())
    return s;
  if (r != null) {
    for (let a = !1; !a; )
      if (a = i.type.is(r), !i.nextSibling())
        return s;
  }
  for (; ; ) {
    if (n != null && i.type.is(n))
      return s;
    if (i.type.is(e) && s.push(i.node), !i.nextSibling())
      return n == null ? s : [];
  }
}
function dt(t, e, r = e.length - 1) {
  for (let n = t; r >= 0; n = n.parent) {
    if (!n)
      return !1;
    if (!n.type.isAnonymous) {
      if (e[r] && e[r] != n.name)
        return !1;
      r--;
    }
  }
  return !0;
}
class Tn {
  constructor(e, r, n, i) {
    this.parent = e, this.buffer = r, this.index = n, this.start = i;
  }
}
class le extends Dr {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, r, n) {
    super(), this.context = e, this._parent = r, this.index = n, this.type = e.buffer.set.types[e.buffer.buffer[n]];
  }
  child(e, r, n) {
    let { buffer: i } = this.context, s = i.findChild(this.index + 4, i.buffer[this.index + 3], e, r - this.context.start, n);
    return s < 0 ? null : new le(this.context, this, s);
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
  enter(e, r, n = 0) {
    if (n & M.ExcludeBuffers)
      return null;
    let { buffer: i } = this.context, s = i.findChild(this.index + 4, i.buffer[this.index + 3], r > 0 ? 1 : -1, e - this.context.start, r);
    return s < 0 ? null : new le(this.context, this, s);
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
    let { buffer: e } = this.context, r = e.buffer[this.index + 3];
    return r < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new le(this.context, this._parent, r) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, r = this._parent ? this._parent.index + 4 : 0;
    return this.index == r ? this.externalSibling(-1) : new le(this.context, this._parent, e.findChild(
      r,
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
    let e = [], r = [], { buffer: n } = this.context, i = this.index + 4, s = n.buffer[this.index + 3];
    if (s > i) {
      let a = n.buffer[this.index + 1];
      e.push(n.slice(i, s, a)), r.push(0);
    }
    return new K(this.type, e, r, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function Lr(t) {
  if (!t.length)
    return null;
  let e = 0, r = t[0];
  for (let s = 1; s < t.length; s++) {
    let a = t[s];
    (a.from > r.from || a.to < r.to) && (r = a, e = s);
  }
  let n = r instanceof G && r.index < 0 ? null : r.parent, i = t.slice();
  return n ? i[e] = n : i.splice(e, 1), new On(i, r);
}
class On {
  constructor(e, r) {
    this.heads = e, this.node = r;
  }
  get next() {
    return Lr(this.heads);
  }
}
function $n(t, e, r) {
  let n = t.resolveInner(e, r), i = null;
  for (let s = n instanceof G ? n : n.context.parent; s; s = s.parent)
    if (s.index < 0) {
      let a = s.parent;
      (i || (i = [n])).push(a.resolve(e, r)), s = a;
    } else {
      let a = Ce.get(s.tree);
      if (a && a.overlay && a.overlay[0].from <= e && a.overlay[a.overlay.length - 1].to >= e) {
        let o = new G(a.tree, a.overlay[0].from + s.from, -1, s);
        (i || (i = [n])).push(Ee(o, e, r, !1));
      }
    }
  return i ? Lr(i) : n;
}
class yt {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, r = 0) {
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = r & ~M.EnterBracketed, e instanceof G)
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
  yieldBuf(e, r) {
    this.index = e;
    let { start: n, buffer: i } = this.buffer;
    return this.type = r || i.set.types[i.buffer[e]], this.from = n + i.buffer[e + 1], this.to = n + i.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof G ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
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
  enterChild(e, r, n) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, r, n, this.mode));
    let { buffer: i } = this.buffer, s = i.findChild(this.index + 4, i.buffer[this.index + 3], e, r - this.buffer.start, n);
    return s < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(s));
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
  enter(e, r, n = this.mode) {
    return this.buffer ? n & M.ExcludeBuffers ? !1 : this.enterChild(1, e, r) : this.yield(this._tree.enter(e, r, n));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & M.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & M.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: r } = this.buffer, n = this.stack.length - 1;
    if (e < 0) {
      let i = n < 0 ? 0 : this.stack[n] + 4;
      if (this.index != i)
        return this.yieldBuf(r.findChild(
          i,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let i = r.buffer[this.index + 3];
      if (i < (n < 0 ? r.buffer.length : r.buffer[this.stack[n] + 3]))
        return this.yieldBuf(i);
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
    let r, n, { buffer: i } = this;
    if (i) {
      if (e > 0) {
        if (this.index < i.buffer.buffer.length)
          return !1;
      } else
        for (let s = 0; s < this.index; s++)
          if (i.buffer.buffer[s + 3] < this.index)
            return !1;
      ({ index: r, parent: n } = i);
    } else
      ({ index: r, _parent: n } = this._tree);
    for (; n; { index: r, _parent: n } = n)
      if (r > -1)
        for (let s = r + e, a = e < 0 ? -1 : n._tree.children.length; s != a; s += e) {
          let o = n._tree.children[s];
          if (this.mode & M.IncludeAnonymous || o instanceof ue || !o.type.isAnonymous || $t(o))
            return !1;
        }
    return !0;
  }
  move(e, r) {
    if (r && this.enterChild(
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
  moveTo(e, r = 0) {
    for (; (this.from == this.to || (r < 1 ? this.from >= e : this.from > e) || (r > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, r); )
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
    let e = this.bufferNode, r = null, n = 0;
    if (e && e.context == this.buffer)
      e: for (let i = this.index, s = this.stack.length; s >= 0; ) {
        for (let a = e; a; a = a._parent)
          if (a.index == i) {
            if (i == this.index)
              return a;
            r = a, n = s + 1;
            break e;
          }
        i = this.stack[--s];
      }
    for (let i = n; i < this.stack.length; i++)
      r = new le(this.buffer, r, this.stack[i]);
    return this.bufferNode = new le(this.buffer, r, this.index);
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
  iterate(e, r) {
    for (let n = 0; ; ) {
      let i = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          n++;
          continue;
        }
        this.type.isAnonymous || (i = !0);
      }
      for (; ; ) {
        if (i && r && r(this), i = this.type.isAnonymous, !n)
          return;
        if (this.nextSibling())
          break;
        this.parent(), n--, i = !0;
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
      return dt(this.node.parent, e);
    let { buffer: r } = this.buffer, { types: n } = r.set;
    for (let i = e.length - 1, s = this.stack.length - 1; i >= 0; s--) {
      if (s < 0)
        return dt(this._tree, e, i);
      let a = n[r.buffer[this.stack[s]]];
      if (!a.isAnonymous) {
        if (e[i] && e[i] != a.name)
          return !1;
        i--;
      }
    }
    return !0;
  }
}
function $t(t) {
  return t.children.some((e) => e instanceof ue || !e.type.isAnonymous || $t(e));
}
function Cn(t) {
  var e;
  let { buffer: r, nodeSet: n, maxBufferLength: i = 1024, reused: s = [], minRepeatType: a = n.types.length } = t, o = Array.isArray(r) ? new Ot(r, r.length) : r, f = n.types, l = 0, g = 0;
  function h(w, C, d, I, _, N) {
    let { id: x, start: b, end: T, size: P } = o, B = g, ae = l;
    if (P < 0)
      if (o.next(), P == -1) {
        let ne = s[x];
        d.push(ne), I.push(b - w);
        return;
      } else if (P == -3) {
        l = x;
        return;
      } else if (P == -4) {
        g = x;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${P}`);
    let Te = f[x], De, ge, Kt = b - w;
    if (T - b <= i && (ge = O(o.pos - C, _))) {
      let ne = new Uint16Array(ge.size - ge.skip), z = o.pos - ge.size, Z = ne.length;
      for (; o.pos > z; )
        Z = k(ge.start, ne, Z);
      De = new ue(ne, T - ge.start, n), Kt = ge.start - w;
    } else {
      let ne = o.pos - P;
      o.next();
      let z = [], Z = [], pe = x >= a ? x : -1, _e = 0, Le = T;
      for (; o.pos > ne; )
        pe >= 0 && o.id == pe && o.size >= 0 ? (o.end <= Le - i && (p(z, Z, b, _e, o.end, Le, pe, B, ae), _e = z.length, Le = o.end), o.next()) : N > 2500 ? c(b, ne, z, Z) : h(b, ne, z, Z, pe, N + 1);
      if (pe >= 0 && _e > 0 && _e < z.length && p(z, Z, b, _e, b, Le, pe, B, ae), z.reverse(), Z.reverse(), pe > -1 && _e > 0) {
        let qt = y(Te, ae);
        De = Ct(Te, z, Z, 0, z.length, 0, T - b, qt, qt);
      } else
        De = v(Te, z, Z, T - b, B - T, ae);
    }
    d.push(De), I.push(Kt);
  }
  function c(w, C, d, I) {
    let _ = [], N = 0, x = -1;
    for (; o.pos > C; ) {
      let { id: b, start: T, end: P, size: B } = o;
      if (B > 4)
        o.next();
      else {
        if (x > -1 && T < x)
          break;
        x < 0 && (x = P - i), _.push(b, T, P), N++, o.next();
      }
    }
    if (N) {
      let b = new Uint16Array(N * 4), T = _[_.length - 2];
      for (let P = _.length - 3, B = 0; P >= 0; P -= 3)
        b[B++] = _[P], b[B++] = _[P + 1] - T, b[B++] = _[P + 2] - T, b[B++] = B;
      d.push(new ue(b, _[2] - T, n)), I.push(T - w);
    }
  }
  function y(w, C) {
    return (d, I, _) => {
      let N = 0, x = d.length - 1, b, T;
      if (x >= 0 && (b = d[x]) instanceof K) {
        if (!x && b.type == w && b.length == _)
          return b;
        (T = b.prop(E.lookAhead)) && (N = I[x] + b.length + T);
      }
      return v(w, d, I, _, N, C);
    };
  }
  function p(w, C, d, I, _, N, x, b, T) {
    let P = [], B = [];
    for (; w.length > I; )
      P.push(w.pop()), B.push(C.pop() + d - _);
    w.push(v(n.types[x], P, B, N - _, b - N, T)), C.push(_ - d);
  }
  function v(w, C, d, I, _, N, x) {
    if (N) {
      let b = [E.contextHash, N];
      x = x ? [b].concat(x) : [b];
    }
    if (_ > 25) {
      let b = [E.lookAhead, _];
      x = x ? [b].concat(x) : [b];
    }
    return new K(w, C, d, I, x);
  }
  function O(w, C) {
    let d = o.fork(), I = 0, _ = 0, N = 0, x = d.end - i, b = { size: 0, start: 0, skip: 0 };
    e: for (let T = d.pos - w; d.pos > T; ) {
      let P = d.size;
      if (d.id == C && P >= 0) {
        b.size = I, b.start = _, b.skip = N, N += 4, I += 4, d.next();
        continue;
      }
      let B = d.pos - P;
      if (P < 0 || B < T || d.start < x)
        break;
      let ae = d.id >= a ? 4 : 0, Te = d.start;
      for (d.next(); d.pos > B; ) {
        if (d.size < 0)
          if (d.size == -3 || d.size == -4)
            ae += 4;
          else
            break e;
        else d.id >= a && (ae += 4);
        d.next();
      }
      _ = Te, I += P, N += ae;
    }
    return (C < 0 || I == w) && (b.size = I, b.start = _, b.skip = N), b.size > 4 ? b : void 0;
  }
  function k(w, C, d) {
    let { id: I, start: _, end: N, size: x } = o;
    if (o.next(), x >= 0 && I < a) {
      let b = d;
      if (x > 4) {
        let T = o.pos - (x - 4);
        for (; o.pos > T; )
          d = k(w, C, d);
      }
      C[--d] = b, C[--d] = N - w, C[--d] = _ - w, C[--d] = I;
    } else x == -3 ? l = I : x == -4 && (g = I);
    return d;
  }
  let j = [], $ = [];
  for (; o.pos > 0; )
    h(t.start || 0, t.bufferStart || 0, j, $, -1, 0);
  let L = (e = t.length) !== null && e !== void 0 ? e : j.length ? $[0] + j[0].length : 0;
  return new K(f[t.topID], j.reverse(), $.reverse(), L);
}
const Xt = /* @__PURE__ */ new WeakMap();
function Ke(t, e) {
  if (!t.isAnonymous || e instanceof ue || e.type != t)
    return 1;
  let r = Xt.get(e);
  if (r == null) {
    r = 1;
    for (let n of e.children) {
      if (n.type != t || !(n instanceof K)) {
        r = 1;
        break;
      }
      r += Ke(t, n);
    }
    Xt.set(e, r);
  }
  return r;
}
function Ct(t, e, r, n, i, s, a, o, f) {
  let l = 0;
  for (let p = n; p < i; p++)
    l += Ke(t, e[p]);
  let g = Math.ceil(
    l * 1.5 / 8
    /* Balance.BranchFactor */
  ), h = [], c = [];
  function y(p, v, O, k, j) {
    for (let $ = O; $ < k; ) {
      let L = $, w = v[$], C = Ke(t, p[$]);
      for ($++; $ < k; $++) {
        let d = Ke(t, p[$]);
        if (C + d >= g)
          break;
        C += d;
      }
      if ($ == L + 1) {
        if (C > g) {
          let d = p[L];
          y(d.children, d.positions, 0, d.children.length, v[L] + j);
          continue;
        }
        h.push(p[L]);
      } else {
        let d = v[$ - 1] + p[$ - 1].length - w;
        h.push(Ct(t, p, v, L, $, w, d, null, f));
      }
      c.push(w + j - s);
    }
  }
  return y(e, r, n, i, 0), (o || f)(h, c, a);
}
class bt {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, r, n, i, s = !1, a = !1) {
    this.from = e, this.to = r, this.tree = n, this.offset = i, this.open = (s ? 1 : 0) | (a ? 2 : 0);
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
  static addTree(e, r = [], n = !1) {
    let i = [new bt(0, e.length, e, 0, !1, n)];
    for (let s of r)
      s.to > e.length && i.push(s);
    return i;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, r, n = 128) {
    if (!r.length)
      return e;
    let i = [], s = 1, a = e.length ? e[0] : null;
    for (let o = 0, f = 0, l = 0; ; o++) {
      let g = o < r.length ? r[o] : null, h = g ? g.fromA : 1e9;
      if (h - f >= n)
        for (; a && a.from < h; ) {
          let c = a;
          if (f >= c.from || h <= c.to || l) {
            let y = Math.max(c.from, f) - l, p = Math.min(c.to, h) - l;
            c = y >= p ? null : new bt(y, p, c.tree, c.offset + l, o > 0, !!g);
          }
          if (c && i.push(c), a.to > h)
            break;
          a = s < e.length ? e[s++] : null;
        }
      if (!g)
        break;
      f = g.toA, l = g.toA - g.toB;
    }
    return i;
  }
}
class Sl {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, r, n) {
    return typeof e == "string" && (e = new Pn(e)), n = n ? n.length ? n.map((i) => new ft(i.from, i.to)) : [new ft(0, 0)] : [new ft(0, e.length)], this.createParse(e, r || [], n);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, r, n) {
    let i = this.startParse(e, r, n);
    for (; ; ) {
      let s = i.advance();
      if (s)
        return s;
    }
  }
}
class Pn {
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
  read(e, r) {
    return this.string.slice(e, r);
  }
}
new E({ perNode: !0 });
let mt = [], zr = [];
(() => {
  let t = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, r = 0; e < t.length; e++)
    (e % 2 ? zr : mt).push(r = r + t[e]);
})();
function En(t) {
  if (t < 768) return !1;
  for (let e = 0, r = mt.length; ; ) {
    let n = e + r >> 1;
    if (t < mt[n]) r = n;
    else if (t >= zr[n]) e = n + 1;
    else return !0;
    if (e == r) return !1;
  }
}
function Yt(t) {
  return t >= 127462 && t <= 127487;
}
const Jt = 8205;
function Tl(t, e, r = !0, n = !0) {
  return (r ? Fr : In)(t, e, n);
}
function Fr(t, e, r) {
  if (e == t.length) return e;
  e && Ur(t.charCodeAt(e)) && Gr(t.charCodeAt(e - 1)) && e--;
  let n = lt(t, e);
  for (e += Qt(n); e < t.length; ) {
    let i = lt(t, e);
    if (n == Jt || i == Jt || r && En(i))
      e += Qt(i), n = i;
    else if (Yt(i)) {
      let s = 0, a = e - 2;
      for (; a >= 0 && Yt(lt(t, a)); )
        s++, a -= 2;
      if (s % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function In(t, e, r) {
  for (; e > 0; ) {
    let n = Fr(t, e - 2, r);
    if (n < e) return n;
    e--;
  }
  return 0;
}
function lt(t, e) {
  let r = t.charCodeAt(e);
  if (!Gr(r) || e + 1 == t.length) return r;
  let n = t.charCodeAt(e + 1);
  return Ur(n) ? (r - 55296 << 10) + (n - 56320) + 65536 : r;
}
function Ur(t) {
  return t >= 56320 && t < 57344;
}
function Gr(t) {
  return t >= 55296 && t < 56320;
}
function Qt(t) {
  return t < 65536 ? 1 : 2;
}
const wt = "ͼ", Vt = typeof Symbol > "u" ? "__" + wt : Symbol.for(wt), xt = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), er = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class Ol {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, r) {
    this.rules = [];
    let { finish: n } = r || {};
    function i(a) {
      return /^@/.test(a) ? [a] : a.split(/,\s*/);
    }
    function s(a, o, f, l) {
      let g = [], h = /^@(\w+)\b/.exec(a[0]), c = h && h[1] == "keyframes";
      if (h && o == null) return f.push(a[0] + ";");
      for (let y in o) {
        let p = o[y];
        if (/&/.test(y))
          s(
            y.split(/,\s*/).map((v) => a.map((O) => v.replace(/&/, O))).reduce((v, O) => v.concat(O)),
            p,
            f
          );
        else if (p && typeof p == "object") {
          if (!h) throw new RangeError("The value of a property (" + y + ") should be a primitive value.");
          s(i(y), p, g, c);
        } else p != null && g.push(y.replace(/_.*/, "").replace(/[A-Z]/g, (v) => "-" + v.toLowerCase()) + ": " + p + ";");
      }
      (g.length || c) && f.push((n && !h && !l ? a.map(n) : a).join(", ") + " {" + g.join(" ") + "}");
    }
    for (let a in e) s(i(a), e[a], this.rules);
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
    let e = er[Vt] || 1;
    return er[Vt] = e + 1, wt + e.toString(36);
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
  static mount(e, r, n) {
    let i = e[xt], s = n && n.nonce;
    i ? s && i.setNonce(s) : i = new Nn(e, s), i.mount(Array.isArray(r) ? r : [r], e);
  }
}
let tr = /* @__PURE__ */ new Map();
class Nn {
  constructor(e, r) {
    let n = e.ownerDocument || e, i = n.defaultView;
    if (!e.head && e.adoptedStyleSheets && i.CSSStyleSheet) {
      let s = tr.get(n);
      if (s) return e[xt] = s;
      this.sheet = new i.CSSStyleSheet(), tr.set(n, this);
    } else
      this.styleTag = n.createElement("style"), r && this.styleTag.setAttribute("nonce", r);
    this.modules = [], e[xt] = this;
  }
  mount(e, r) {
    let n = this.sheet, i = 0, s = 0;
    for (let a = 0; a < e.length; a++) {
      let o = e[a], f = this.modules.indexOf(o);
      if (f < s && f > -1 && (this.modules.splice(f, 1), s--, f = -1), f == -1) {
        if (this.modules.splice(s++, 0, o), n) for (let l = 0; l < o.rules.length; l++)
          n.insertRule(o.rules[l], i++);
      } else {
        for (; s < f; ) i += this.modules[s++].rules.length;
        i += o.rules.length, s++;
      }
    }
    if (n)
      r.adoptedStyleSheets.indexOf(this.sheet) < 0 && (r.adoptedStyleSheets = [this.sheet, ...r.adoptedStyleSheets]);
    else {
      let a = "";
      for (let f = 0; f < this.modules.length; f++)
        a += this.modules[f].getRules() + `
`;
      this.styleTag.textContent = a;
      let o = r.head || r;
      this.styleTag.parentNode != o && o.insertBefore(this.styleTag, o.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var ye = {
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
}, We = {
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
}, jn = typeof navigator < "u" && /Mac/.test(navigator.platform), Rn = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var D = 0; D < 10; D++) ye[48 + D] = ye[96 + D] = String(D);
for (var D = 1; D <= 24; D++) ye[D + 111] = "F" + D;
for (var D = 65; D <= 90; D++)
  ye[D] = String.fromCharCode(D + 32), We[D] = String.fromCharCode(D);
for (var ut in ye) We.hasOwnProperty(ut) || (We[ut] = ye[ut]);
function $l(t) {
  var e = jn && t.metaKey && t.shiftKey && !t.ctrlKey && !t.altKey || Rn && t.shiftKey && t.key && t.key.length == 1 || t.key == "Unidentified", r = !e && t.key || (t.shiftKey ? We : ye)[t.keyCode] || t.key || "Unidentified";
  return r == "Esc" && (r = "Escape"), r == "Del" && (r = "Delete"), r == "Left" && (r = "ArrowLeft"), r == "Up" && (r = "ArrowUp"), r == "Right" && (r = "ArrowRight"), r == "Down" && (r = "ArrowDown"), r;
}
function Cl() {
  var t = arguments[0];
  typeof t == "string" && (t = document.createElement(t));
  var e = 1, r = arguments[1];
  if (r && typeof r == "object" && r.nodeType == null && !Array.isArray(r)) {
    for (var n in r) if (Object.prototype.hasOwnProperty.call(r, n)) {
      var i = r[n];
      typeof i == "string" ? t.setAttribute(n, i) : i != null && (t[n] = i);
    }
    e++;
  }
  for (; e < arguments.length; e++) Hr(t, arguments[e]);
  return t;
}
function Hr(t, e) {
  if (typeof e == "string")
    t.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    t.appendChild(e);
  else if (Array.isArray(e))
    for (var r = 0; r < e.length; r++) Hr(t, e[r]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let kn = 0;
class F {
  /**
  @internal
  */
  constructor(e, r, n, i) {
    this.name = e, this.set = r, this.base = n, this.modified = i, this.id = kn++;
  }
  toString() {
    let { name: e } = this;
    for (let r of this.modified)
      r.name && (e = `${r.name}(${e})`);
    return e;
  }
  static define(e, r) {
    let n = typeof e == "string" ? e : "?";
    if (e instanceof F && (r = e), r != null && r.base)
      throw new Error("Can not derive from a modified tag");
    let i = new F(n, [], null, []);
    if (i.set.push(i), r)
      for (let s of r.set)
        i.set.push(s);
    return i;
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
    let r = new Ze(e);
    return (n) => n.modified.indexOf(r) > -1 ? n : Ze.get(n.base || n, n.modified.concat(r).sort((i, s) => i.id - s.id));
  }
}
let Mn = 0;
class Ze {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Mn++;
  }
  static get(e, r) {
    if (!r.length)
      return e;
    let n = r[0].instances.find((o) => o.base == e && Bn(r, o.modified));
    if (n)
      return n;
    let i = [], s = new F(e.name, i, e, r);
    for (let o of r)
      o.instances.push(s);
    let a = Dn(r);
    for (let o of e.set)
      if (!o.modified.length)
        for (let f of a)
          i.push(Ze.get(o, f));
    return s;
  }
}
function Bn(t, e) {
  return t.length == e.length && t.every((r, n) => r == e[n]);
}
function Dn(t) {
  let e = [[]];
  for (let r = 0; r < t.length; r++)
    for (let n = 0, i = e.length; n < i; n++)
      e.push(e[n].concat(t[r]));
  return e.sort((r, n) => n.length - r.length);
}
function Pl(t) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let r in t) {
    let n = t[r];
    Array.isArray(n) || (n = [n]);
    for (let i of r.split(" "))
      if (i) {
        let s = [], a = 2, o = i;
        for (let h = 0; ; ) {
          if (o == "..." && h > 0 && h + 3 == i.length) {
            a = 1;
            break;
          }
          let c = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(o);
          if (!c)
            throw new RangeError("Invalid path: " + i);
          if (s.push(c[0] == "*" ? "" : c[0][0] == '"' ? JSON.parse(c[0]) : c[0]), h += c[0].length, h == i.length)
            break;
          let y = i[h++];
          if (h == i.length && y == "!") {
            a = 0;
            break;
          }
          if (y != "/")
            throw new RangeError("Invalid path: " + i);
          o = i.slice(h);
        }
        let f = s.length - 1, l = s[f];
        if (!l)
          throw new RangeError("Invalid path: " + i);
        let g = new Ie(n, a, f > 0 ? s.slice(0, f) : null);
        e[l] = g.sort(e[l]);
      }
  }
  return Kr.add(e);
}
const Kr = new E({
  combine(t, e) {
    let r, n, i;
    for (; t || e; ) {
      if (!t || e && t.depth >= e.depth ? (i = e, e = e.next) : (i = t, t = t.next), r && r.mode == i.mode && !i.context && !r.context)
        continue;
      let s = new Ie(i.tags, i.mode, i.context);
      r ? r.next = s : n = s, r = s;
    }
    return n;
  }
});
class Ie {
  constructor(e, r, n, i) {
    this.tags = e, this.mode = r, this.context = n, this.next = i;
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
}
Ie.empty = new Ie([], 2, null);
function Ln(t, e) {
  let r = /* @__PURE__ */ Object.create(null);
  for (let s of t)
    if (!Array.isArray(s.tag))
      r[s.tag.id] = s.class;
    else
      for (let a of s.tag)
        r[a.id] = s.class;
  let { scope: n, all: i = null } = e || {};
  return {
    style: (s) => {
      let a = i;
      for (let o of s)
        for (let f of o.set) {
          let l = r[f.id];
          if (l) {
            a = a ? a + " " + l : l;
            break;
          }
        }
      return a;
    },
    scope: n
  };
}
function zn(t, e) {
  let r = null;
  for (let n of t) {
    let i = n.style(e);
    i && (r = r ? r + " " + i : i);
  }
  return r;
}
function El(t, e, r, n = 0, i = t.length) {
  let s = new Fn(n, Array.isArray(e) ? e : [e], r);
  s.highlightRange(t.cursor(), n, i, "", s.highlighters), s.flush(i);
}
class Fn {
  constructor(e, r, n) {
    this.at = e, this.highlighters = r, this.span = n, this.class = "";
  }
  startSpan(e, r) {
    r != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = r);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, r, n, i, s) {
    let { type: a, from: o, to: f } = e;
    if (o >= n || f <= r)
      return;
    a.isTop && (s = this.highlighters.filter((y) => !y.scope || y.scope(a)));
    let l = i, g = Un(e) || Ie.empty, h = zn(s, g.tags);
    if (h && (l && (l += " "), l += h, g.mode == 1 && (i += (i ? " " : "") + h)), this.startSpan(Math.max(r, o), l), g.opaque)
      return;
    let c = e.tree && e.tree.prop(E.mounted);
    if (c && c.overlay) {
      let y = e.node.enter(c.overlay[0].from + o, 1), p = this.highlighters.filter((O) => !O.scope || O.scope(c.tree.type)), v = e.firstChild();
      for (let O = 0, k = o; ; O++) {
        let j = O < c.overlay.length ? c.overlay[O] : null, $ = j ? j.from + o : f, L = Math.max(r, k), w = Math.min(n, $);
        if (L < w && v)
          for (; e.from < w && (this.highlightRange(e, L, w, i, s), this.startSpan(Math.min(w, e.to), l), !(e.to >= $ || !e.nextSibling())); )
            ;
        if (!j || $ > n)
          break;
        k = j.to + o, k > r && (this.highlightRange(y.cursor(), Math.max(r, j.from + o), Math.min(n, k), "", p), this.startSpan(Math.min(n, k), l));
      }
      v && e.parent();
    } else if (e.firstChild()) {
      c && (i = "");
      do
        if (!(e.to <= r)) {
          if (e.from >= n)
            break;
          this.highlightRange(e, r, n, i, s), this.startSpan(Math.min(n, e.to), l);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
function Un(t) {
  let e = t.type.prop(Kr);
  for (; e && e.context && !t.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const u = F.define, Fe = u(), oe = u(), rr = u(oe), nr = u(oe), fe = u(), Ue = u(fe), ht = u(fe), J = u(), de = u(J), X = u(), Y = u(), vt = u(), Oe = u(vt), Ge = u(), m = {
  /**
  A comment.
  */
  comment: Fe,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: u(Fe),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: u(Fe),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: u(Fe),
  /**
  Any kind of identifier.
  */
  name: oe,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: u(oe),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: rr,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: u(rr),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: nr,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: u(nr),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: u(oe),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: u(oe),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: u(oe),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: u(oe),
  /**
  A literal value.
  */
  literal: fe,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Ue,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: u(Ue),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: u(Ue),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: u(Ue),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: ht,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: u(ht),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: u(ht),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: u(fe),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: u(fe),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: u(fe),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: u(fe),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: u(fe),
  /**
  A language keyword.
  */
  keyword: X,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: u(X),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: u(X),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: u(X),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: u(X),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: u(X),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: u(X),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: u(X),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: u(X),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: u(X),
  /**
  An operator.
  */
  operator: Y,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: u(Y),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: u(Y),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: u(Y),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: u(Y),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: u(Y),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: u(Y),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: u(Y),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: u(Y),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: u(Y),
  /**
  Program or markup punctuation.
  */
  punctuation: vt,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: u(vt),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Oe,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: u(Oe),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: u(Oe),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: u(Oe),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: u(Oe),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: J,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: de,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: u(de),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: u(de),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: u(de),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: u(de),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: u(de),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: u(de),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: u(J),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: u(J),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: u(J),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: u(J),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: u(J),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: u(J),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: u(J),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: u(J),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: u(),
  /**
  Deleted text.
  */
  deleted: u(),
  /**
  Changed text.
  */
  changed: u(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: u(),
  /**
  Metadata or meta-instruction.
  */
  meta: Ge,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: u(Ge),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: u(Ge),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: u(Ge),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: F.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: F.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: F.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: F.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: F.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: F.defineModifier("special")
};
for (let t in m) {
  let e = m[t];
  e instanceof F && (e.name = t);
}
Ln([
  { tag: m.link, class: "tok-link" },
  { tag: m.heading, class: "tok-heading" },
  { tag: m.emphasis, class: "tok-emphasis" },
  { tag: m.strong, class: "tok-strong" },
  { tag: m.keyword, class: "tok-keyword" },
  { tag: m.atom, class: "tok-atom" },
  { tag: m.bool, class: "tok-bool" },
  { tag: m.url, class: "tok-url" },
  { tag: m.labelName, class: "tok-labelName" },
  { tag: m.inserted, class: "tok-inserted" },
  { tag: m.deleted, class: "tok-deleted" },
  { tag: m.literal, class: "tok-literal" },
  { tag: m.string, class: "tok-string" },
  { tag: m.number, class: "tok-number" },
  { tag: [m.regexp, m.escape, m.special(m.string)], class: "tok-string2" },
  { tag: m.variableName, class: "tok-variableName" },
  { tag: m.local(m.variableName), class: "tok-variableName tok-local" },
  { tag: m.definition(m.variableName), class: "tok-variableName tok-definition" },
  { tag: m.special(m.variableName), class: "tok-variableName2" },
  { tag: m.definition(m.propertyName), class: "tok-propertyName tok-definition" },
  { tag: m.typeName, class: "tok-typeName" },
  { tag: m.namespace, class: "tok-namespace" },
  { tag: m.className, class: "tok-className" },
  { tag: m.macroName, class: "tok-macroName" },
  { tag: m.propertyName, class: "tok-propertyName" },
  { tag: m.operator, class: "tok-operator" },
  { tag: m.comment, class: "tok-comment" },
  { tag: m.meta, class: "tok-meta" },
  { tag: m.invalid, class: "tok-invalid" },
  { tag: m.punctuation, class: "tok-punctuation" }
]);
var qr = typeof global == "object" && global && global.Object === Object && global, Gn = typeof self == "object" && self && self.Object === Object && self, ee = qr || Gn || Function("return this")(), H = ee.Symbol, Wr = Object.prototype, Hn = Wr.hasOwnProperty, Kn = Wr.toString, $e = H ? H.toStringTag : void 0;
function qn(t) {
  var e = Hn.call(t, $e), r = t[$e];
  try {
    t[$e] = void 0;
    var n = !0;
  } catch {
  }
  var i = Kn.call(t);
  return n && (e ? t[$e] = r : delete t[$e]), i;
}
var Wn = Object.prototype, Zn = Wn.toString;
function Xn(t) {
  return Zn.call(t);
}
var Yn = "[object Null]", Jn = "[object Undefined]", ir = H ? H.toStringTag : void 0;
function ce(t) {
  return t == null ? t === void 0 ? Jn : Yn : ir && ir in Object(t) ? qn(t) : Xn(t);
}
function q(t) {
  return t != null && typeof t == "object";
}
var Qn = "[object Symbol]";
function Je(t) {
  return typeof t == "symbol" || q(t) && ce(t) == Qn;
}
function Qe(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length, i = Array(n); ++r < n; )
    i[r] = e(t[r], r, t);
  return i;
}
var R = Array.isArray, sr = H ? H.prototype : void 0, ar = sr ? sr.toString : void 0;
function Zr(t) {
  if (typeof t == "string")
    return t;
  if (R(t))
    return Qe(t, Zr) + "";
  if (Je(t))
    return ar ? ar.call(t) : "";
  var e = t + "";
  return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
}
var Vn = /\s/;
function ei(t) {
  for (var e = t.length; e-- && Vn.test(t.charAt(e)); )
    ;
  return e;
}
var ti = /^\s+/;
function ri(t) {
  return t && t.slice(0, ei(t) + 1).replace(ti, "");
}
function W(t) {
  var e = typeof t;
  return t != null && (e == "object" || e == "function");
}
var or = NaN, ni = /^[-+]0x[0-9a-f]+$/i, ii = /^0b[01]+$/i, si = /^0o[0-7]+$/i, ai = parseInt;
function oi(t) {
  if (typeof t == "number")
    return t;
  if (Je(t))
    return or;
  if (W(t)) {
    var e = typeof t.valueOf == "function" ? t.valueOf() : t;
    t = W(e) ? e + "" : e;
  }
  if (typeof t != "string")
    return t === 0 ? t : +t;
  t = ri(t);
  var r = ii.test(t);
  return r || si.test(t) ? ai(t.slice(2), r ? 2 : 8) : ni.test(t) ? or : +t;
}
var fr = 1 / 0, fi = 17976931348623157e292;
function li(t) {
  if (!t)
    return t === 0 ? t : 0;
  if (t = oi(t), t === fr || t === -fr) {
    var e = t < 0 ? -1 : 1;
    return e * fi;
  }
  return t === t ? t : 0;
}
function Ve(t) {
  var e = li(t), r = e % 1;
  return e === e ? r ? e - r : e : 0;
}
function et(t) {
  return t;
}
var ui = "[object AsyncFunction]", hi = "[object Function]", ci = "[object GeneratorFunction]", gi = "[object Proxy]";
function Xr(t) {
  if (!W(t))
    return !1;
  var e = ce(t);
  return e == hi || e == ci || e == ui || e == gi;
}
var ct = ee["__core-js_shared__"], lr = function() {
  var t = /[^.]+$/.exec(ct && ct.keys && ct.keys.IE_PROTO || "");
  return t ? "Symbol(src)_1." + t : "";
}();
function pi(t) {
  return !!lr && lr in t;
}
var di = Function.prototype, yi = di.toString;
function me(t) {
  if (t != null) {
    try {
      return yi.call(t);
    } catch {
    }
    try {
      return t + "";
    } catch {
    }
  }
  return "";
}
var bi = /[\\^$.*+?()[\]{}|]/g, mi = /^\[object .+?Constructor\]$/, wi = Function.prototype, xi = Object.prototype, vi = wi.toString, _i = xi.hasOwnProperty, Ai = RegExp(
  "^" + vi.call(_i).replace(bi, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Si(t) {
  if (!W(t) || pi(t))
    return !1;
  var e = Xr(t) ? Ai : mi;
  return e.test(me(t));
}
function Ti(t, e) {
  return t == null ? void 0 : t[e];
}
function we(t, e) {
  var r = Ti(t, e);
  return Si(r) ? r : void 0;
}
var _t = we(ee, "WeakMap"), ur = Object.create, Oi = /* @__PURE__ */ function() {
  function t() {
  }
  return function(e) {
    if (!W(e))
      return {};
    if (ur)
      return ur(e);
    t.prototype = e;
    var r = new t();
    return t.prototype = void 0, r;
  };
}();
function $i(t, e, r) {
  switch (r.length) {
    case 0:
      return t.call(e);
    case 1:
      return t.call(e, r[0]);
    case 2:
      return t.call(e, r[0], r[1]);
    case 3:
      return t.call(e, r[0], r[1], r[2]);
  }
  return t.apply(e, r);
}
function Ci() {
}
function Pi(t, e) {
  var r = -1, n = t.length;
  for (e || (e = Array(n)); ++r < n; )
    e[r] = t[r];
  return e;
}
var Ei = 800, Ii = 16, Ni = Date.now;
function ji(t) {
  var e = 0, r = 0;
  return function() {
    var n = Ni(), i = Ii - (n - r);
    if (r = n, i > 0) {
      if (++e >= Ei)
        return arguments[0];
    } else
      e = 0;
    return t.apply(void 0, arguments);
  };
}
function Ri(t) {
  return function() {
    return t;
  };
}
var Xe = function() {
  try {
    var t = we(Object, "defineProperty");
    return t({}, "", {}), t;
  } catch {
  }
}(), ki = Xe ? function(t, e) {
  return Xe(t, "toString", {
    configurable: !0,
    enumerable: !1,
    value: Ri(e),
    writable: !0
  });
} : et, Mi = ji(ki);
function Yr(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length; ++r < n && e(t[r], r, t) !== !1; )
    ;
  return t;
}
function Jr(t, e, r, n) {
  for (var i = t.length, s = r + -1; ++s < i; )
    if (e(t[s], s, t))
      return s;
  return -1;
}
function Bi(t) {
  return t !== t;
}
function Di(t, e, r) {
  for (var n = r - 1, i = t.length; ++n < i; )
    if (t[n] === e)
      return n;
  return -1;
}
function Pt(t, e, r) {
  return e === e ? Di(t, e, r) : Jr(t, Bi, r);
}
function Qr(t, e) {
  var r = t == null ? 0 : t.length;
  return !!r && Pt(t, e, 0) > -1;
}
var Li = 9007199254740991, zi = /^(?:0|[1-9]\d*)$/;
function tt(t, e) {
  var r = typeof t;
  return e = e ?? Li, !!e && (r == "number" || r != "symbol" && zi.test(t)) && t > -1 && t % 1 == 0 && t < e;
}
function Et(t, e, r) {
  e == "__proto__" && Xe ? Xe(t, e, {
    configurable: !0,
    enumerable: !0,
    value: r,
    writable: !0
  }) : t[e] = r;
}
function ke(t, e) {
  return t === e || t !== t && e !== e;
}
var Fi = Object.prototype, Ui = Fi.hasOwnProperty;
function rt(t, e, r) {
  var n = t[e];
  (!(Ui.call(t, e) && ke(n, r)) || r === void 0 && !(e in t)) && Et(t, e, r);
}
function It(t, e, r, n) {
  var i = !r;
  r || (r = {});
  for (var s = -1, a = e.length; ++s < a; ) {
    var o = e[s], f = void 0;
    f === void 0 && (f = t[o]), i ? Et(r, o, f) : rt(r, o, f);
  }
  return r;
}
var hr = Math.max;
function Gi(t, e, r) {
  return e = hr(e === void 0 ? t.length - 1 : e, 0), function() {
    for (var n = arguments, i = -1, s = hr(n.length - e, 0), a = Array(s); ++i < s; )
      a[i] = n[e + i];
    i = -1;
    for (var o = Array(e + 1); ++i < e; )
      o[i] = n[i];
    return o[e] = r(a), $i(t, this, o);
  };
}
function Nt(t, e) {
  return Mi(Gi(t, e, et), t + "");
}
var Hi = 9007199254740991;
function jt(t) {
  return typeof t == "number" && t > -1 && t % 1 == 0 && t <= Hi;
}
function te(t) {
  return t != null && jt(t.length) && !Xr(t);
}
function Vr(t, e, r) {
  if (!W(r))
    return !1;
  var n = typeof e;
  return (n == "number" ? te(r) && tt(e, r.length) : n == "string" && e in r) ? ke(r[e], t) : !1;
}
function Ki(t) {
  return Nt(function(e, r) {
    var n = -1, i = r.length, s = i > 1 ? r[i - 1] : void 0, a = i > 2 ? r[2] : void 0;
    for (s = t.length > 3 && typeof s == "function" ? (i--, s) : void 0, a && Vr(r[0], r[1], a) && (s = i < 3 ? void 0 : s, i = 1), e = Object(e); ++n < i; ) {
      var o = r[n];
      o && t(e, o, n, s);
    }
    return e;
  });
}
var qi = Object.prototype;
function Me(t) {
  var e = t && t.constructor, r = typeof e == "function" && e.prototype || qi;
  return t === r;
}
function Wi(t, e) {
  for (var r = -1, n = Array(t); ++r < t; )
    n[r] = e(r);
  return n;
}
var Zi = "[object Arguments]";
function cr(t) {
  return q(t) && ce(t) == Zi;
}
var en = Object.prototype, Xi = en.hasOwnProperty, Yi = en.propertyIsEnumerable, nt = cr(/* @__PURE__ */ function() {
  return arguments;
}()) ? cr : function(t) {
  return q(t) && Xi.call(t, "callee") && !Yi.call(t, "callee");
};
function Ji() {
  return !1;
}
var tn = typeof exports == "object" && exports && !exports.nodeType && exports, gr = tn && typeof module == "object" && module && !module.nodeType && module, Qi = gr && gr.exports === tn, pr = Qi ? ee.Buffer : void 0, Vi = pr ? pr.isBuffer : void 0, Ne = Vi || Ji, es = "[object Arguments]", ts = "[object Array]", rs = "[object Boolean]", ns = "[object Date]", is = "[object Error]", ss = "[object Function]", as = "[object Map]", os = "[object Number]", fs = "[object Object]", ls = "[object RegExp]", us = "[object Set]", hs = "[object String]", cs = "[object WeakMap]", gs = "[object ArrayBuffer]", ps = "[object DataView]", ds = "[object Float32Array]", ys = "[object Float64Array]", bs = "[object Int8Array]", ms = "[object Int16Array]", ws = "[object Int32Array]", xs = "[object Uint8Array]", vs = "[object Uint8ClampedArray]", _s = "[object Uint16Array]", As = "[object Uint32Array]", S = {};
S[ds] = S[ys] = S[bs] = S[ms] = S[ws] = S[xs] = S[vs] = S[_s] = S[As] = !0;
S[es] = S[ts] = S[gs] = S[rs] = S[ps] = S[ns] = S[is] = S[ss] = S[as] = S[os] = S[fs] = S[ls] = S[us] = S[hs] = S[cs] = !1;
function Ss(t) {
  return q(t) && jt(t.length) && !!S[ce(t)];
}
function it(t) {
  return function(e) {
    return t(e);
  };
}
var rn = typeof exports == "object" && exports && !exports.nodeType && exports, Pe = rn && typeof module == "object" && module && !module.nodeType && module, Ts = Pe && Pe.exports === rn, gt = Ts && qr.process, he = function() {
  try {
    var t = Pe && Pe.require && Pe.require("util").types;
    return t || gt && gt.binding && gt.binding("util");
  } catch {
  }
}(), dr = he && he.isTypedArray, Rt = dr ? it(dr) : Ss, Os = Object.prototype, $s = Os.hasOwnProperty;
function nn(t, e) {
  var r = R(t), n = !r && nt(t), i = !r && !n && Ne(t), s = !r && !n && !i && Rt(t), a = r || n || i || s, o = a ? Wi(t.length, String) : [], f = o.length;
  for (var l in t)
    (e || $s.call(t, l)) && !(a && // Safari 9 has enumerable `arguments.length` in strict mode.
    (l == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    i && (l == "offset" || l == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    s && (l == "buffer" || l == "byteLength" || l == "byteOffset") || // Skip index properties.
    tt(l, f))) && o.push(l);
  return o;
}
function sn(t, e) {
  return function(r) {
    return t(e(r));
  };
}
var Cs = sn(Object.keys, Object), Ps = Object.prototype, Es = Ps.hasOwnProperty;
function an(t) {
  if (!Me(t))
    return Cs(t);
  var e = [];
  for (var r in Object(t))
    Es.call(t, r) && r != "constructor" && e.push(r);
  return e;
}
function xe(t) {
  return te(t) ? nn(t) : an(t);
}
var Is = Object.prototype, Ns = Is.hasOwnProperty, Il = Ki(function(t, e) {
  if (Me(e) || te(e)) {
    It(e, xe(e), t);
    return;
  }
  for (var r in e)
    Ns.call(e, r) && rt(t, r, e[r]);
});
function js(t) {
  var e = [];
  if (t != null)
    for (var r in Object(t))
      e.push(r);
  return e;
}
var Rs = Object.prototype, ks = Rs.hasOwnProperty;
function Ms(t) {
  if (!W(t))
    return js(t);
  var e = Me(t), r = [];
  for (var n in t)
    n == "constructor" && (e || !ks.call(t, n)) || r.push(n);
  return r;
}
function on(t) {
  return te(t) ? nn(t, !0) : Ms(t);
}
var Bs = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Ds = /^\w*$/;
function kt(t, e) {
  if (R(t))
    return !1;
  var r = typeof t;
  return r == "number" || r == "symbol" || r == "boolean" || t == null || Je(t) ? !0 : Ds.test(t) || !Bs.test(t) || e != null && t in Object(e);
}
var je = we(Object, "create");
function Ls() {
  this.__data__ = je ? je(null) : {}, this.size = 0;
}
function zs(t) {
  var e = this.has(t) && delete this.__data__[t];
  return this.size -= e ? 1 : 0, e;
}
var Fs = "__lodash_hash_undefined__", Us = Object.prototype, Gs = Us.hasOwnProperty;
function Hs(t) {
  var e = this.__data__;
  if (je) {
    var r = e[t];
    return r === Fs ? void 0 : r;
  }
  return Gs.call(e, t) ? e[t] : void 0;
}
var Ks = Object.prototype, qs = Ks.hasOwnProperty;
function Ws(t) {
  var e = this.__data__;
  return je ? e[t] !== void 0 : qs.call(e, t);
}
var Zs = "__lodash_hash_undefined__";
function Xs(t, e) {
  var r = this.__data__;
  return this.size += this.has(t) ? 0 : 1, r[t] = je && e === void 0 ? Zs : e, this;
}
function be(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.clear(); ++e < r; ) {
    var n = t[e];
    this.set(n[0], n[1]);
  }
}
be.prototype.clear = Ls;
be.prototype.delete = zs;
be.prototype.get = Hs;
be.prototype.has = Ws;
be.prototype.set = Xs;
function Ys() {
  this.__data__ = [], this.size = 0;
}
function st(t, e) {
  for (var r = t.length; r--; )
    if (ke(t[r][0], e))
      return r;
  return -1;
}
var Js = Array.prototype, Qs = Js.splice;
function Vs(t) {
  var e = this.__data__, r = st(e, t);
  if (r < 0)
    return !1;
  var n = e.length - 1;
  return r == n ? e.pop() : Qs.call(e, r, 1), --this.size, !0;
}
function ea(t) {
  var e = this.__data__, r = st(e, t);
  return r < 0 ? void 0 : e[r][1];
}
function ta(t) {
  return st(this.__data__, t) > -1;
}
function ra(t, e) {
  var r = this.__data__, n = st(r, t);
  return n < 0 ? (++this.size, r.push([t, e])) : r[n][1] = e, this;
}
function ie(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.clear(); ++e < r; ) {
    var n = t[e];
    this.set(n[0], n[1]);
  }
}
ie.prototype.clear = Ys;
ie.prototype.delete = Vs;
ie.prototype.get = ea;
ie.prototype.has = ta;
ie.prototype.set = ra;
var Re = we(ee, "Map");
function na() {
  this.size = 0, this.__data__ = {
    hash: new be(),
    map: new (Re || ie)(),
    string: new be()
  };
}
function ia(t) {
  var e = typeof t;
  return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
}
function at(t, e) {
  var r = t.__data__;
  return ia(e) ? r[typeof e == "string" ? "string" : "hash"] : r.map;
}
function sa(t) {
  var e = at(this, t).delete(t);
  return this.size -= e ? 1 : 0, e;
}
function aa(t) {
  return at(this, t).get(t);
}
function oa(t) {
  return at(this, t).has(t);
}
function fa(t, e) {
  var r = at(this, t), n = r.size;
  return r.set(t, e), this.size += r.size == n ? 0 : 1, this;
}
function se(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.clear(); ++e < r; ) {
    var n = t[e];
    this.set(n[0], n[1]);
  }
}
se.prototype.clear = na;
se.prototype.delete = sa;
se.prototype.get = aa;
se.prototype.has = oa;
se.prototype.set = fa;
var la = "Expected a function";
function Mt(t, e) {
  if (typeof t != "function" || e != null && typeof e != "function")
    throw new TypeError(la);
  var r = function() {
    var n = arguments, i = e ? e.apply(this, n) : n[0], s = r.cache;
    if (s.has(i))
      return s.get(i);
    var a = t.apply(this, n);
    return r.cache = s.set(i, a) || s, a;
  };
  return r.cache = new (Mt.Cache || se)(), r;
}
Mt.Cache = se;
var ua = 500;
function ha(t) {
  var e = Mt(t, function(n) {
    return r.size === ua && r.clear(), n;
  }), r = e.cache;
  return e;
}
var ca = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ga = /\\(\\)?/g, pa = ha(function(t) {
  var e = [];
  return t.charCodeAt(0) === 46 && e.push(""), t.replace(ca, function(r, n, i, s) {
    e.push(i ? s.replace(ga, "$1") : n || r);
  }), e;
});
function da(t) {
  return t == null ? "" : Zr(t);
}
function ot(t, e) {
  return R(t) ? t : kt(t, e) ? [t] : pa(da(t));
}
function Be(t) {
  if (typeof t == "string" || Je(t))
    return t;
  var e = t + "";
  return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
}
function Bt(t, e) {
  e = ot(e, t);
  for (var r = 0, n = e.length; t != null && r < n; )
    t = t[Be(e[r++])];
  return r && r == n ? t : void 0;
}
function ya(t, e, r) {
  var n = t == null ? void 0 : Bt(t, e);
  return n === void 0 ? r : n;
}
function Dt(t, e) {
  for (var r = -1, n = e.length, i = t.length; ++r < n; )
    t[i + r] = e[r];
  return t;
}
var yr = H ? H.isConcatSpreadable : void 0;
function ba(t) {
  return R(t) || nt(t) || !!(yr && t && t[yr]);
}
function Lt(t, e, r, n, i) {
  var s = -1, a = t.length;
  for (r || (r = ba), i || (i = []); ++s < a; ) {
    var o = t[s];
    r(o) ? Dt(i, o) : n || (i[i.length] = o);
  }
  return i;
}
function Nl(t) {
  var e = t == null ? 0 : t.length;
  return e ? Lt(t) : [];
}
var fn = sn(Object.getPrototypeOf, Object);
function ln(t, e, r) {
  var n = -1, i = t.length;
  e < 0 && (e = -e > i ? 0 : i + e), r = r > i ? i : r, r < 0 && (r += i), i = e > r ? 0 : r - e >>> 0, e >>>= 0;
  for (var s = Array(i); ++n < i; )
    s[n] = t[n + e];
  return s;
}
function ma(t, e, r, n) {
  var i = -1, s = t == null ? 0 : t.length;
  for (n && s && (r = t[++i]); ++i < s; )
    r = e(r, t[i], i, t);
  return r;
}
function wa() {
  this.__data__ = new ie(), this.size = 0;
}
function xa(t) {
  var e = this.__data__, r = e.delete(t);
  return this.size = e.size, r;
}
function va(t) {
  return this.__data__.get(t);
}
function _a(t) {
  return this.__data__.has(t);
}
var Aa = 200;
function Sa(t, e) {
  var r = this.__data__;
  if (r instanceof ie) {
    var n = r.__data__;
    if (!Re || n.length < Aa - 1)
      return n.push([t, e]), this.size = ++r.size, this;
    r = this.__data__ = new se(n);
  }
  return r.set(t, e), this.size = r.size, this;
}
function Q(t) {
  var e = this.__data__ = new ie(t);
  this.size = e.size;
}
Q.prototype.clear = wa;
Q.prototype.delete = xa;
Q.prototype.get = va;
Q.prototype.has = _a;
Q.prototype.set = Sa;
function Ta(t, e) {
  return t && It(e, xe(e), t);
}
var un = typeof exports == "object" && exports && !exports.nodeType && exports, br = un && typeof module == "object" && module && !module.nodeType && module, Oa = br && br.exports === un, mr = Oa ? ee.Buffer : void 0, wr = mr ? mr.allocUnsafe : void 0;
function $a(t, e) {
  var r = t.length, n = wr ? wr(r) : new t.constructor(r);
  return t.copy(n), n;
}
function zt(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length, i = 0, s = []; ++r < n; ) {
    var a = t[r];
    e(a, r, t) && (s[i++] = a);
  }
  return s;
}
function hn() {
  return [];
}
var Ca = Object.prototype, Pa = Ca.propertyIsEnumerable, xr = Object.getOwnPropertySymbols, Ft = xr ? function(t) {
  return t == null ? [] : (t = Object(t), zt(xr(t), function(e) {
    return Pa.call(t, e);
  }));
} : hn;
function Ea(t, e) {
  return It(t, Ft(t), e);
}
var Ia = Object.getOwnPropertySymbols, Na = Ia ? function(t) {
  for (var e = []; t; )
    Dt(e, Ft(t)), t = fn(t);
  return e;
} : hn;
function cn(t, e, r) {
  var n = e(t);
  return R(t) ? n : Dt(n, r(t));
}
function At(t) {
  return cn(t, xe, Ft);
}
function ja(t) {
  return cn(t, on, Na);
}
var St = we(ee, "DataView"), Tt = we(ee, "Promise"), Ae = we(ee, "Set"), vr = "[object Map]", Ra = "[object Object]", _r = "[object Promise]", Ar = "[object Set]", Sr = "[object WeakMap]", Tr = "[object DataView]", ka = me(St), Ma = me(Re), Ba = me(Tt), Da = me(Ae), La = me(_t), U = ce;
(St && U(new St(new ArrayBuffer(1))) != Tr || Re && U(new Re()) != vr || Tt && U(Tt.resolve()) != _r || Ae && U(new Ae()) != Ar || _t && U(new _t()) != Sr) && (U = function(t) {
  var e = ce(t), r = e == Ra ? t.constructor : void 0, n = r ? me(r) : "";
  if (n)
    switch (n) {
      case ka:
        return Tr;
      case Ma:
        return vr;
      case Ba:
        return _r;
      case Da:
        return Ar;
      case La:
        return Sr;
    }
  return e;
});
var za = Object.prototype, Fa = za.hasOwnProperty;
function Ua(t) {
  var e = t.length, r = new t.constructor(e);
  return e && typeof t[0] == "string" && Fa.call(t, "index") && (r.index = t.index, r.input = t.input), r;
}
var Ye = ee.Uint8Array;
function Ga(t) {
  var e = new t.constructor(t.byteLength);
  return new Ye(e).set(new Ye(t)), e;
}
function Ha(t, e) {
  var r = t.buffer;
  return new t.constructor(r, t.byteOffset, t.byteLength);
}
var Ka = /\w*$/;
function qa(t) {
  var e = new t.constructor(t.source, Ka.exec(t));
  return e.lastIndex = t.lastIndex, e;
}
var Or = H ? H.prototype : void 0, $r = Or ? Or.valueOf : void 0;
function Wa(t) {
  return $r ? Object($r.call(t)) : {};
}
function Za(t, e) {
  var r = t.buffer;
  return new t.constructor(r, t.byteOffset, t.length);
}
var Xa = "[object Boolean]", Ya = "[object Date]", Ja = "[object Map]", Qa = "[object Number]", Va = "[object RegExp]", eo = "[object Set]", to = "[object String]", ro = "[object Symbol]", no = "[object ArrayBuffer]", io = "[object DataView]", so = "[object Float32Array]", ao = "[object Float64Array]", oo = "[object Int8Array]", fo = "[object Int16Array]", lo = "[object Int32Array]", uo = "[object Uint8Array]", ho = "[object Uint8ClampedArray]", co = "[object Uint16Array]", go = "[object Uint32Array]";
function po(t, e, r) {
  var n = t.constructor;
  switch (e) {
    case no:
      return Ga(t);
    case Xa:
    case Ya:
      return new n(+t);
    case io:
      return Ha(t);
    case so:
    case ao:
    case oo:
    case fo:
    case lo:
    case uo:
    case ho:
    case co:
    case go:
      return Za(t);
    case Ja:
      return new n();
    case Qa:
    case to:
      return new n(t);
    case Va:
      return qa(t);
    case eo:
      return new n();
    case ro:
      return Wa(t);
  }
}
function yo(t) {
  return typeof t.constructor == "function" && !Me(t) ? Oi(fn(t)) : {};
}
var bo = "[object Map]";
function mo(t) {
  return q(t) && U(t) == bo;
}
var Cr = he && he.isMap, wo = Cr ? it(Cr) : mo, xo = "[object Set]";
function vo(t) {
  return q(t) && U(t) == xo;
}
var Pr = he && he.isSet, _o = Pr ? it(Pr) : vo, gn = "[object Arguments]", Ao = "[object Array]", So = "[object Boolean]", To = "[object Date]", Oo = "[object Error]", pn = "[object Function]", $o = "[object GeneratorFunction]", Co = "[object Map]", Po = "[object Number]", dn = "[object Object]", Eo = "[object RegExp]", Io = "[object Set]", No = "[object String]", jo = "[object Symbol]", Ro = "[object WeakMap]", ko = "[object ArrayBuffer]", Mo = "[object DataView]", Bo = "[object Float32Array]", Do = "[object Float64Array]", Lo = "[object Int8Array]", zo = "[object Int16Array]", Fo = "[object Int32Array]", Uo = "[object Uint8Array]", Go = "[object Uint8ClampedArray]", Ho = "[object Uint16Array]", Ko = "[object Uint32Array]", A = {};
A[gn] = A[Ao] = A[ko] = A[Mo] = A[So] = A[To] = A[Bo] = A[Do] = A[Lo] = A[zo] = A[Fo] = A[Co] = A[Po] = A[dn] = A[Eo] = A[Io] = A[No] = A[jo] = A[Uo] = A[Go] = A[Ho] = A[Ko] = !0;
A[Oo] = A[pn] = A[Ro] = !1;
function qe(t, e, r, n, i, s) {
  var a;
  if (a !== void 0)
    return a;
  if (!W(t))
    return t;
  var o = R(t);
  if (o)
    return a = Ua(t), Pi(t, a);
  var f = U(t), l = f == pn || f == $o;
  if (Ne(t))
    return $a(t);
  if (f == dn || f == gn || l && !i)
    return a = l ? {} : yo(t), Ea(t, Ta(a, t));
  if (!A[f])
    return i ? t : {};
  a = po(t, f), s || (s = new Q());
  var g = s.get(t);
  if (g)
    return g;
  s.set(t, a), _o(t) ? t.forEach(function(y) {
    a.add(qe(y, e, r, y, t, s));
  }) : wo(t) && t.forEach(function(y, p) {
    a.set(p, qe(y, e, r, p, t, s));
  });
  var h = At, c = o ? void 0 : h(t);
  return Yr(c || t, function(y, p) {
    c && (p = y, y = t[p]), rt(a, p, qe(y, e, r, p, t, s));
  }), a;
}
var qo = 4;
function jl(t) {
  return qe(t, qo);
}
function Rl(t) {
  for (var e = -1, r = t == null ? 0 : t.length, n = 0, i = []; ++e < r; ) {
    var s = t[e];
    s && (i[n++] = s);
  }
  return i;
}
var Wo = "__lodash_hash_undefined__";
function Zo(t) {
  return this.__data__.set(t, Wo), this;
}
function Xo(t) {
  return this.__data__.has(t);
}
function Se(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.__data__ = new se(); ++e < r; )
    this.add(t[e]);
}
Se.prototype.add = Se.prototype.push = Zo;
Se.prototype.has = Xo;
function yn(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length; ++r < n; )
    if (e(t[r], r, t))
      return !0;
  return !1;
}
function Ut(t, e) {
  return t.has(e);
}
var Yo = 1, Jo = 2;
function bn(t, e, r, n, i, s) {
  var a = r & Yo, o = t.length, f = e.length;
  if (o != f && !(a && f > o))
    return !1;
  var l = s.get(t), g = s.get(e);
  if (l && g)
    return l == e && g == t;
  var h = -1, c = !0, y = r & Jo ? new Se() : void 0;
  for (s.set(t, e), s.set(e, t); ++h < o; ) {
    var p = t[h], v = e[h];
    if (n)
      var O = a ? n(v, p, h, e, t, s) : n(p, v, h, t, e, s);
    if (O !== void 0) {
      if (O)
        continue;
      c = !1;
      break;
    }
    if (y) {
      if (!yn(e, function(k, j) {
        if (!Ut(y, j) && (p === k || i(p, k, r, n, s)))
          return y.push(j);
      })) {
        c = !1;
        break;
      }
    } else if (!(p === v || i(p, v, r, n, s))) {
      c = !1;
      break;
    }
  }
  return s.delete(t), s.delete(e), c;
}
function Qo(t) {
  var e = -1, r = Array(t.size);
  return t.forEach(function(n, i) {
    r[++e] = [i, n];
  }), r;
}
function Gt(t) {
  var e = -1, r = Array(t.size);
  return t.forEach(function(n) {
    r[++e] = n;
  }), r;
}
var Vo = 1, ef = 2, tf = "[object Boolean]", rf = "[object Date]", nf = "[object Error]", sf = "[object Map]", af = "[object Number]", of = "[object RegExp]", ff = "[object Set]", lf = "[object String]", uf = "[object Symbol]", hf = "[object ArrayBuffer]", cf = "[object DataView]", Er = H ? H.prototype : void 0, pt = Er ? Er.valueOf : void 0;
function gf(t, e, r, n, i, s, a) {
  switch (r) {
    case cf:
      if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset)
        return !1;
      t = t.buffer, e = e.buffer;
    case hf:
      return !(t.byteLength != e.byteLength || !s(new Ye(t), new Ye(e)));
    case tf:
    case rf:
    case af:
      return ke(+t, +e);
    case nf:
      return t.name == e.name && t.message == e.message;
    case of:
    case lf:
      return t == e + "";
    case sf:
      var o = Qo;
    case ff:
      var f = n & Vo;
      if (o || (o = Gt), t.size != e.size && !f)
        return !1;
      var l = a.get(t);
      if (l)
        return l == e;
      n |= ef, a.set(t, e);
      var g = bn(o(t), o(e), n, i, s, a);
      return a.delete(t), g;
    case uf:
      if (pt)
        return pt.call(t) == pt.call(e);
  }
  return !1;
}
var pf = 1, df = Object.prototype, yf = df.hasOwnProperty;
function bf(t, e, r, n, i, s) {
  var a = r & pf, o = At(t), f = o.length, l = At(e), g = l.length;
  if (f != g && !a)
    return !1;
  for (var h = f; h--; ) {
    var c = o[h];
    if (!(a ? c in e : yf.call(e, c)))
      return !1;
  }
  var y = s.get(t), p = s.get(e);
  if (y && p)
    return y == e && p == t;
  var v = !0;
  s.set(t, e), s.set(e, t);
  for (var O = a; ++h < f; ) {
    c = o[h];
    var k = t[c], j = e[c];
    if (n)
      var $ = a ? n(j, k, c, e, t, s) : n(k, j, c, t, e, s);
    if (!($ === void 0 ? k === j || i(k, j, r, n, s) : $)) {
      v = !1;
      break;
    }
    O || (O = c == "constructor");
  }
  if (v && !O) {
    var L = t.constructor, w = e.constructor;
    L != w && "constructor" in t && "constructor" in e && !(typeof L == "function" && L instanceof L && typeof w == "function" && w instanceof w) && (v = !1);
  }
  return s.delete(t), s.delete(e), v;
}
var mf = 1, Ir = "[object Arguments]", Nr = "[object Array]", He = "[object Object]", wf = Object.prototype, jr = wf.hasOwnProperty;
function xf(t, e, r, n, i, s) {
  var a = R(t), o = R(e), f = a ? Nr : U(t), l = o ? Nr : U(e);
  f = f == Ir ? He : f, l = l == Ir ? He : l;
  var g = f == He, h = l == He, c = f == l;
  if (c && Ne(t)) {
    if (!Ne(e))
      return !1;
    a = !0, g = !1;
  }
  if (c && !g)
    return s || (s = new Q()), a || Rt(t) ? bn(t, e, r, n, i, s) : gf(t, e, f, r, n, i, s);
  if (!(r & mf)) {
    var y = g && jr.call(t, "__wrapped__"), p = h && jr.call(e, "__wrapped__");
    if (y || p) {
      var v = y ? t.value() : t, O = p ? e.value() : e;
      return s || (s = new Q()), i(v, O, r, n, s);
    }
  }
  return c ? (s || (s = new Q()), bf(t, e, r, n, i, s)) : !1;
}
function Ht(t, e, r, n, i) {
  return t === e ? !0 : t == null || e == null || !q(t) && !q(e) ? t !== t && e !== e : xf(t, e, r, n, Ht, i);
}
var vf = 1, _f = 2;
function Af(t, e, r, n) {
  var i = r.length, s = i;
  if (t == null)
    return !s;
  for (t = Object(t); i--; ) {
    var a = r[i];
    if (a[2] ? a[1] !== t[a[0]] : !(a[0] in t))
      return !1;
  }
  for (; ++i < s; ) {
    a = r[i];
    var o = a[0], f = t[o], l = a[1];
    if (a[2]) {
      if (f === void 0 && !(o in t))
        return !1;
    } else {
      var g = new Q(), h;
      if (!(h === void 0 ? Ht(l, f, vf | _f, n, g) : h))
        return !1;
    }
  }
  return !0;
}
function mn(t) {
  return t === t && !W(t);
}
function Sf(t) {
  for (var e = xe(t), r = e.length; r--; ) {
    var n = e[r], i = t[n];
    e[r] = [n, i, mn(i)];
  }
  return e;
}
function wn(t, e) {
  return function(r) {
    return r == null ? !1 : r[t] === e && (e !== void 0 || t in Object(r));
  };
}
function Tf(t) {
  var e = Sf(t);
  return e.length == 1 && e[0][2] ? wn(e[0][0], e[0][1]) : function(r) {
    return r === t || Af(r, t, e);
  };
}
function Of(t, e) {
  return t != null && e in Object(t);
}
function xn(t, e, r) {
  e = ot(e, t);
  for (var n = -1, i = e.length, s = !1; ++n < i; ) {
    var a = Be(e[n]);
    if (!(s = t != null && r(t, a)))
      break;
    t = t[a];
  }
  return s || ++n != i ? s : (i = t == null ? 0 : t.length, !!i && jt(i) && tt(a, i) && (R(t) || nt(t)));
}
function $f(t, e) {
  return t != null && xn(t, e, Of);
}
var Cf = 1, Pf = 2;
function Ef(t, e) {
  return kt(t) && mn(e) ? wn(Be(t), e) : function(r) {
    var n = ya(r, t);
    return n === void 0 && n === e ? $f(r, t) : Ht(e, n, Cf | Pf);
  };
}
function If(t) {
  return function(e) {
    return e == null ? void 0 : e[t];
  };
}
function Nf(t) {
  return function(e) {
    return Bt(e, t);
  };
}
function jf(t) {
  return kt(t) ? If(Be(t)) : Nf(t);
}
function re(t) {
  return typeof t == "function" ? t : t == null ? et : typeof t == "object" ? R(t) ? Ef(t[0], t[1]) : Tf(t) : jf(t);
}
function Rf(t, e, r, n) {
  for (var i = -1, s = t == null ? 0 : t.length; ++i < s; ) {
    var a = t[i];
    e(n, a, r(a), t);
  }
  return n;
}
function kf(t) {
  return function(e, r, n) {
    for (var i = -1, s = Object(e), a = n(e), o = a.length; o--; ) {
      var f = a[++i];
      if (r(s[f], f, s) === !1)
        break;
    }
    return e;
  };
}
var Mf = kf();
function Bf(t, e) {
  return t && Mf(t, e, xe);
}
function Df(t, e) {
  return function(r, n) {
    if (r == null)
      return r;
    if (!te(r))
      return t(r, n);
    for (var i = r.length, s = -1, a = Object(r); ++s < i && n(a[s], s, a) !== !1; )
      ;
    return r;
  };
}
var ve = Df(Bf);
function Lf(t, e, r, n) {
  return ve(t, function(i, s, a) {
    e(n, i, r(i), a);
  }), n;
}
function zf(t, e) {
  return function(r, n) {
    var i = R(r) ? Rf : Lf, s = e ? e() : {};
    return i(r, t, re(n), s);
  };
}
var vn = Object.prototype, Ff = vn.hasOwnProperty, kl = Nt(function(t, e) {
  t = Object(t);
  var r = -1, n = e.length, i = n > 2 ? e[2] : void 0;
  for (i && Vr(e[0], e[1], i) && (n = 1); ++r < n; )
    for (var s = e[r], a = on(s), o = -1, f = a.length; ++o < f; ) {
      var l = a[o], g = t[l];
      (g === void 0 || ke(g, vn[l]) && !Ff.call(t, l)) && (t[l] = s[l]);
    }
  return t;
});
function Rr(t) {
  return q(t) && te(t);
}
var Uf = 200;
function Gf(t, e, r, n) {
  var i = -1, s = Qr, a = !0, o = t.length, f = [], l = e.length;
  if (!o)
    return f;
  e.length >= Uf && (s = Ut, a = !1, e = new Se(e));
  e:
    for (; ++i < o; ) {
      var g = t[i], h = g;
      if (g = g !== 0 ? g : 0, a && h === h) {
        for (var c = l; c--; )
          if (e[c] === h)
            continue e;
        f.push(g);
      } else s(e, h, n) || f.push(g);
    }
  return f;
}
var Ml = Nt(function(t, e) {
  return Rr(t) ? Gf(t, Lt(e, 1, Rr, !0)) : [];
});
function Bl(t) {
  var e = t == null ? 0 : t.length;
  return e ? t[e - 1] : void 0;
}
function Dl(t, e, r) {
  var n = t == null ? 0 : t.length;
  return n ? (e = e === void 0 ? 1 : Ve(e), ln(t, e < 0 ? 0 : e, n)) : [];
}
function Ll(t, e, r) {
  var n = t == null ? 0 : t.length;
  return n ? (e = e === void 0 ? 1 : Ve(e), e = n - e, ln(t, 0, e < 0 ? 0 : e)) : [];
}
function Hf(t) {
  return typeof t == "function" ? t : et;
}
function zl(t, e) {
  var r = R(t) ? Yr : ve;
  return r(t, Hf(e));
}
function Kf(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length; ++r < n; )
    if (!e(t[r], r, t))
      return !1;
  return !0;
}
function qf(t, e) {
  var r = !0;
  return ve(t, function(n, i, s) {
    return r = !!e(n, i, s), r;
  }), r;
}
function Fl(t, e, r) {
  var n = R(t) ? Kf : qf;
  return n(t, re(e));
}
function _n(t, e) {
  var r = [];
  return ve(t, function(n, i, s) {
    e(n, i, s) && r.push(n);
  }), r;
}
function Ul(t, e) {
  var r = R(t) ? zt : _n;
  return r(t, re(e));
}
function Wf(t) {
  return function(e, r, n) {
    var i = Object(e);
    if (!te(e)) {
      var s = re(r);
      e = xe(e), r = function(o) {
        return s(i[o], o, i);
      };
    }
    var a = t(e, r, n);
    return a > -1 ? i[s ? e[a] : a] : void 0;
  };
}
var Zf = Math.max;
function Xf(t, e, r) {
  var n = t == null ? 0 : t.length;
  if (!n)
    return -1;
  var i = r == null ? 0 : Ve(r);
  return i < 0 && (i = Zf(n + i, 0)), Jr(t, re(e), i);
}
var Gl = Wf(Xf);
function Hl(t) {
  return t && t.length ? t[0] : void 0;
}
function Yf(t, e) {
  var r = -1, n = te(t) ? Array(t.length) : [];
  return ve(t, function(i, s, a) {
    n[++r] = e(i, s, a);
  }), n;
}
function Jf(t, e) {
  var r = R(t) ? Qe : Yf;
  return r(t, re(e));
}
function Kl(t, e) {
  return Lt(Jf(t, e));
}
var Qf = Object.prototype, Vf = Qf.hasOwnProperty, ql = zf(function(t, e, r) {
  Vf.call(t, r) ? t[r].push(e) : Et(t, r, [e]);
}), el = Object.prototype, tl = el.hasOwnProperty;
function rl(t, e) {
  return t != null && tl.call(t, e);
}
function Wl(t, e) {
  return t != null && xn(t, e, rl);
}
var nl = "[object String]";
function il(t) {
  return typeof t == "string" || !R(t) && q(t) && ce(t) == nl;
}
function sl(t, e) {
  return Qe(e, function(r) {
    return t[r];
  });
}
function al(t) {
  return t == null ? [] : sl(t, xe(t));
}
var ol = Math.max;
function Zl(t, e, r, n) {
  t = te(t) ? t : al(t), r = r ? Ve(r) : 0;
  var i = t.length;
  return r < 0 && (r = ol(i + r, 0)), il(t) ? r <= i && t.indexOf(e, r) > -1 : !!i && Pt(t, e, r) > -1;
}
function Xl(t, e, r) {
  var n = t == null ? 0 : t.length;
  if (!n)
    return -1;
  var i = 0;
  return Pt(t, e, i);
}
var fl = "[object Map]", ll = "[object Set]", ul = Object.prototype, hl = ul.hasOwnProperty;
function Yl(t) {
  if (t == null)
    return !0;
  if (te(t) && (R(t) || typeof t == "string" || typeof t.splice == "function" || Ne(t) || Rt(t) || nt(t)))
    return !t.length;
  var e = U(t);
  if (e == fl || e == ll)
    return !t.size;
  if (Me(t))
    return !an(t).length;
  for (var r in t)
    if (hl.call(t, r))
      return !1;
  return !0;
}
var cl = "[object RegExp]";
function gl(t) {
  return q(t) && ce(t) == cl;
}
var kr = he && he.isRegExp, Jl = kr ? it(kr) : gl;
function Ql(t) {
  return t === void 0;
}
var pl = "Expected a function";
function dl(t) {
  if (typeof t != "function")
    throw new TypeError(pl);
  return function() {
    var e = arguments;
    switch (e.length) {
      case 0:
        return !t.call(this);
      case 1:
        return !t.call(this, e[0]);
      case 2:
        return !t.call(this, e[0], e[1]);
      case 3:
        return !t.call(this, e[0], e[1], e[2]);
    }
    return !t.apply(this, e);
  };
}
function yl(t, e, r, n) {
  if (!W(t))
    return t;
  e = ot(e, t);
  for (var i = -1, s = e.length, a = s - 1, o = t; o != null && ++i < s; ) {
    var f = Be(e[i]), l = r;
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return t;
    if (i != a) {
      var g = o[f];
      l = void 0, l === void 0 && (l = W(g) ? g : tt(e[i + 1]) ? [] : {});
    }
    rt(o, f, l), o = o[f];
  }
  return t;
}
function bl(t, e, r) {
  for (var n = -1, i = e.length, s = {}; ++n < i; ) {
    var a = e[n], o = Bt(t, a);
    r(o, a) && yl(s, ot(a, t), o);
  }
  return s;
}
function Vl(t, e) {
  if (t == null)
    return {};
  var r = Qe(ja(t), function(n) {
    return [n];
  });
  return e = re(e), bl(t, r, function(n, i) {
    return e(n, i[0]);
  });
}
function ml(t, e, r, n, i) {
  return i(t, function(s, a, o) {
    r = n ? (n = !1, s) : e(r, s, a, o);
  }), r;
}
function eu(t, e, r) {
  var n = R(t) ? ma : ml, i = arguments.length < 3;
  return n(t, re(e), r, i, ve);
}
function tu(t, e) {
  var r = R(t) ? zt : _n;
  return r(t, dl(re(e)));
}
function wl(t, e) {
  var r;
  return ve(t, function(n, i, s) {
    return r = e(n, i, s), !r;
  }), !!r;
}
function ru(t, e, r) {
  var n = R(t) ? yn : wl;
  return n(t, re(e));
}
var xl = 1 / 0, vl = Ae && 1 / Gt(new Ae([, -0]))[1] == xl ? function(t) {
  return new Ae(t);
} : Ci, _l = 200;
function Al(t, e, r) {
  var n = -1, i = Qr, s = t.length, a = !0, o = [], f = o;
  if (s >= _l) {
    var l = vl(t);
    if (l)
      return Gt(l);
    a = !1, i = Ut, f = new Se();
  } else
    f = o;
  e:
    for (; ++n < s; ) {
      var g = t[n], h = g;
      if (g = g !== 0 ? g : 0, a && h === h) {
        for (var c = f.length; c--; )
          if (f[c] === h)
            continue e;
        o.push(g);
      } else i(f, h, r) || (f !== o && f.push(h), o.push(g));
    }
  return o;
}
function nu(t) {
  return t && t.length ? Al(t) : [];
}
export {
  Ml as A,
  Hl as B,
  jl as C,
  et as D,
  Ci as E,
  Bl as F,
  Ll as G,
  Kl as H,
  ql as I,
  W as J,
  Tl as K,
  $l as L,
  ye as M,
  We as N,
  Cl as O,
  E as P,
  Sl as Q,
  V as R,
  Ol as S,
  K as T,
  M as U,
  Mr as V,
  m as W,
  Pl as X,
  bt as Y,
  Ln as Z,
  El as _,
  Il as a,
  Jl as b,
  Zl as c,
  Dl as d,
  Fl as e,
  zl as f,
  Nl as g,
  Gl as h,
  il as i,
  R as j,
  Wl as k,
  Rl as l,
  Jf as m,
  xe as n,
  Ql as o,
  Vl as p,
  Xr as q,
  tu as r,
  ru as s,
  kl as t,
  nu as u,
  al as v,
  Xl as w,
  eu as x,
  Yl as y,
  Ul as z
};
//# sourceMappingURL=vendor-BhPS5zVw.js.map
