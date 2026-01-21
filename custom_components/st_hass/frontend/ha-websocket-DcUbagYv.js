function p() {
  return {
    type: "get_states"
  };
}
const y = (e, s, a, i) => {
  const [t, n, r] = e.split(".", 3);
  return Number(t) > s || Number(t) === s && (i === void 0 ? Number(n) >= a : Number(n) > a) || i !== void 0 && Number(t) === s && Number(n) === a && Number(r) >= i;
}, v = (e) => {
  let s = [];
  function a(t) {
    let n = [];
    for (let r = 0; r < s.length; r++)
      s[r] === t ? t = null : n.push(s[r]);
    s = n;
  }
  function i(t, n) {
    e = n ? t : Object.assign(Object.assign({}, e), t);
    let r = s;
    for (let c = 0; c < r.length; c++)
      r[c](e);
  }
  return {
    get state() {
      return e;
    },
    /**
     * Create a bound copy of the given action function.
     * The bound returned function invokes action() and persists the result back to the store.
     * If the return value of `action` is a Promise, the resolved value will be used as state.
     * @param {Function} action	An action of the form `action(state, ...args) -> stateUpdate`
     * @returns {Function} boundAction()
     */
    action(t) {
      function n(r) {
        i(r, !1);
      }
      return function() {
        let r = [e];
        for (let u = 0; u < arguments.length; u++)
          r.push(arguments[u]);
        let c = t.apply(this, r);
        if (c != null)
          return c instanceof Promise ? c.then(n) : n(c);
      };
    },
    /**
     * Apply a partial state object to the current state, invoking registered listeners.
     * @param {Object} update				An object with properties to be merged into state
     * @param {Boolean} [overwrite=false]	If `true`, update will replace state instead of being merged into it
     */
    setState: i,
    clearState() {
      e = void 0;
    },
    /**
     * Register a listener function to be called whenever state is changed. Returns an `unsubscribe()` function.
     * @param {Function} listener	A function to call when state changes. Gets passed the new state.
     * @returns {Function} unsubscribe()
     */
    subscribe(t) {
      return s.push(t), () => {
        a(t);
      };
    }
    // /**
    //  * Remove a previously-registered listener function.
    //  * @param {Function} listener	The callback previously passed to `subscribe()` that should be removed.
    //  * @function
    //  */
    // unsubscribe,
  };
}, w = 5e3, g = (e, s, a, i, t = { unsubGrace: !0 }) => {
  if (e[s])
    return e[s];
  let n = 0, r, c, u = v();
  const l = () => {
    if (!a)
      throw new Error("Collection does not support refresh");
    return a(e).then((o) => u.setState(o, !0));
  }, f = () => l().catch((o) => {
    if (e.connected)
      throw o;
  }), h = () => {
    if (c !== void 0) {
      clearTimeout(c), c = void 0;
      return;
    }
    i && (r = i(e, u)), a && (e.addEventListener("ready", f), f()), e.addEventListener("disconnected", b);
  }, d = () => {
    c = void 0, r && r.then((o) => {
      o();
    }), u.clearState(), e.removeEventListener("ready", l), e.removeEventListener("disconnected", b);
  }, S = () => {
    c = setTimeout(d, w);
  }, b = () => {
    c && (clearTimeout(c), d());
  };
  return e[s] = {
    get state() {
      return u.state;
    },
    refresh: l,
    subscribe(o) {
      n++, n === 1 && h();
      const _ = u.subscribe(o);
      return u.state !== void 0 && setTimeout(() => o(u.state), 0), () => {
        _(), n--, n || (t.unsubGrace ? S() : d());
      };
    }
  }, e[s];
}, m = (e) => e.sendMessagePromise(p());
function O(e, s) {
  const a = Object.assign({}, e.state);
  if (s.a)
    for (const i in s.a) {
      const t = s.a[i];
      let n = new Date(t.lc * 1e3).toISOString();
      a[i] = {
        entity_id: i,
        state: t.s,
        attributes: t.a,
        context: typeof t.c == "string" ? { id: t.c, parent_id: null, user_id: null } : t.c,
        last_changed: n,
        last_updated: t.lu ? new Date(t.lu * 1e3).toISOString() : n
      };
    }
  if (s.r)
    for (const i of s.r)
      delete a[i];
  if (s.c)
    for (const i in s.c) {
      let t = a[i];
      if (!t) {
        console.warn("Received state update for unknown entity", i);
        continue;
      }
      t = Object.assign({}, t);
      const { "+": n, "-": r } = s.c[i], c = (n == null ? void 0 : n.a) || (r == null ? void 0 : r.a), u = c ? Object.assign({}, t.attributes) : t.attributes;
      if (n && (n.s !== void 0 && (t.state = n.s), n.c && (typeof n.c == "string" ? t.context = Object.assign(Object.assign({}, t.context), { id: n.c }) : t.context = Object.assign(Object.assign({}, t.context), n.c)), n.lc ? t.last_updated = t.last_changed = new Date(n.lc * 1e3).toISOString() : n.lu && (t.last_updated = new Date(n.lu * 1e3).toISOString()), n.a && Object.assign(u, n.a)), r != null && r.a)
        for (const l of r.a)
          delete u[l];
      c && (t.attributes = u), a[i] = t;
    }
  e.setState(a, !0);
}
const E = (e, s) => e.subscribeMessage((a) => O(s, a), {
  type: "subscribe_entities"
});
function j(e, s) {
  const a = e.state;
  if (a === void 0)
    return;
  const { entity_id: i, new_state: t } = s.data;
  if (t)
    e.setState({ [t.entity_id]: t });
  else {
    const n = Object.assign({}, a);
    delete n[i], e.setState(n, !0);
  }
}
async function I(e) {
  const s = await m(e), a = {};
  for (let i = 0; i < s.length; i++) {
    const t = s[i];
    a[t.entity_id] = t;
  }
  return a;
}
const N = (e, s) => e.subscribeEvents((a) => j(s, a), "state_changed"), x = (e) => y(e.haVersion, 2022, 4, 0) ? g(e, "_ent", void 0, E) : g(e, "_ent", I, N), D = (e, s) => x(e).subscribe(s);
export {
  D as s
};
//# sourceMappingURL=ha-websocket-DcUbagYv.js.map
