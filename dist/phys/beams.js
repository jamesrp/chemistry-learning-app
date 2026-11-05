// Balance beams and mobiles: massless bars with hooks at whole distances
// 1..n each side of their pivot. A beam is level when the turning effects
// match: the sum of weight × distance on the left equals that on the right.
// A lower beam hangs by a string from a hook of the beam above and pulls on
// it like one weight equal to everything it carries.
//
// Level: {beams: [{n | l, r, parent: [b, p] | undefined, free}], fixed: [[b, p, w]], tray: [w, ...]}
// Beam 0 is the top; every beam comes after its parent. A hook is p in
// -l..-1 (left) or 1..r (right); n sets both arms the same. `free` beams hang wherever the player puts
// them on the parent; the others hang at parent[1].
// State: {placed: {'b:p': w}, hang: {b: p}} (hang only for free beams).

export const key = (b, p) => `${b}:${p}`;
export const reach = beam => [beam.l ?? beam.n, beam.r ?? beam.n];
export const hooks = beam => { const [l, r] = reach(beam); return [...Array(l)].map((_, i) => -l + i).concat([...Array(r)].map((_, i) => i + 1)); };
export const childrenOf = (level, b) => level.beams.map((x, c) => c).filter(c => level.beams[c].parent?.[0] === b);
export const hangOf = (level, state, c) => (level.beams[c].free && state.hang?.[c] !== undefined ? state.hang[c] : level.beams[c].parent[1]);
export const emptyState = level => ({placed: {}, hang: Object.fromEntries(level.beams.map((x, c) => [c, x.parent?.[1]]).filter(([c]) => level.beams[c].free))});

// What hangs from each hook: {p: {w, fixed} | {child}}.
export function hooksOf(level, state, b) {
  const out = {};
  for (const [fb, p, w] of level.fixed) if (fb === b) out[p] = {w, fixed: true};
  for (const [k, w] of Object.entries(state.placed)) { const [pb, p] = k.split(':').map(Number); if (pb === b) out[p] = {w}; }
  for (const c of childrenOf(level, b)) out[hangOf(level, state, c)] = {child: c};
  return out;
}

// Total weight each beam carries and its turning sum (right minus left).
export function evaluate(level, state) {
  const total = [], torque = [], left = [], right = [];
  for (let b = level.beams.length - 1; b >= 0; b--) {
    let t = 0, L = 0, R = 0;
    for (const [p, it] of Object.entries(hooksOf(level, state, b))) {
      const w = it.child !== undefined ? total[it.child] : it.w;
      t += w;
      if (p < 0) L += -p * w; else R += p * w;
    }
    total[b] = t; left[b] = L; right[b] = R; torque[b] = R - L;
  }
  return {total, torque, left, right};
}

// What is left in the tray, as a sorted list.
export function trayLeft(level, state) {
  const left = [...level.tray].sort((a, b) => a - b);
  for (const w of Object.values(state.placed)) { const i = left.indexOf(w); if (i >= 0) left.splice(i, 1); }
  return left;
}

export function isSolved(level, state) {
  return Object.keys(state.placed).length === level.tray.length && trayLeft(level, state).length === 0 && evaluate(level, state).torque.every(t => t === 0);
}

// A legal state: one thing per hook, only tray weights, hangers on real hooks.
export function isLegal(level, state) {
  const left = [...level.tray];
  for (const w of Object.values(state.placed)) { const i = left.indexOf(w); if (i < 0) return false; left.splice(i, 1); }
  for (let b = 0; b < level.beams.length; b++) {
    const used = new Set(level.fixed.filter(x => x[0] === b).map(x => x[1]));
    const take = p => { if (used.has(p) || !hooks(level.beams[b]).includes(p)) return false; used.add(p); return true; };
    for (const c of childrenOf(level, b)) if (!take(hangOf(level, state, c))) return false;
    for (const k of Object.keys(state.placed)) { const [pb, p] = k.split(':').map(Number); if (pb === b && !take(p)) return false; }
  }
  return true;
}

// Every finished, level arrangement, up to `limit`. Beams are solved from
// the bottom up: a beam's children are done first, so their totals are known
// when the beam itself is balanced. On each beam the free hooks are filled
// from the furthest out, pruned by the most turning the rest could still add.
export function solveAll(level, {limit = 1e6} = {}) {
  const B = level.beams.length, out = [], total = new Array(B).fill(0);
  const placed = {}, hang = {};
  const left = new Map();
  for (const w of level.tray) left.set(w, (left.get(w) || 0) + 1);
  const fixedAt = b => level.fixed.filter(x => x[0] === b);

  function beam(b) {
    if (b < 0) {
      if ([...left.values()].every(n => n === 0)) out.push({placed: {...placed}, hang: {...hang}});
      return out.length >= limit;
    }
    const kids = childrenOf(level, b), free = kids.filter(c => level.beams[c].free);
    const taken = new Set(fixedAt(b).map(x => x[1]));
    for (const c of kids) if (!level.beams[c].free) taken.add(level.beams[c].parent[1]);
    const all = hooks(level.beams[b]);
    // Place free hangers first (each choice of hooks), then weights.
    const hangers = i => {
      if (i === free.length) return weights();
      const c = free[i];
      for (const p of all) {
        if (taken.has(p)) continue;
        taken.add(p); hang[c] = p;
        if (hangers(i + 1)) return true;
        taken.delete(p); delete hang[c];
      }
      return false;
    };
    const weights = () => {
      let t0 = 0, tot = 0;
      for (const [, p, w] of fixedAt(b)) { t0 += p * w; tot += w; }
      for (const c of kids) { const p = level.beams[c].free ? hang[c] : level.beams[c].parent[1]; t0 += p * total[c]; tot += total[c]; }
      const slots = all.filter(p => !taken.has(p)).sort((x, y) => Math.abs(y) - Math.abs(x));
      const rec = (i, t, tot) => {
        // The most the remaining slots could still turn, using the heaviest weights left.
        const ws = [...left.entries()].flatMap(([w, n]) => Array(n).fill(w)).sort((x, y) => y - x);
        let reach = 0;
        for (let k = i; k < slots.length && k - i < ws.length; k++) reach += Math.abs(slots[k]) * ws[k - i];
        if (Math.abs(t) > reach) return false;
        if (i === slots.length) {
          if (t !== 0) return false;
          total[b] = tot;
          return beam(b - 1);
        }
        if (rec(i + 1, t, tot)) return true;
        const p = slots[i];
        for (const [w, n] of [...left.entries()]) {
          if (!n) continue;
          left.set(w, n - 1); placed[key(b, p)] = w;
          const stop = rec(i + 1, t + p * w, tot + w);
          left.set(w, n); delete placed[key(b, p)];
          if (stop) return true;
        }
        return false;
      };
      return rec(0, t0, tot);
    };
    return hangers(0);
  }
  beam(B - 1);
  return out;
}

// A picture of an arrangement that ignores which beam is which, so a mirror
// image can be recognised: each beam lists what hangs at each distance.
export function shape(level, state, b = 0, sign = 1) {
  const items = Object.entries(hooksOf(level, state, b)).map(([p, it]) => [sign * Number(p), it.child !== undefined ? shape(level, state, it.child, sign) : String(it.w)]);
  return '[' + items.sort((x, y) => x[0] - y[0]).map(([p, v]) => `${p}:${v}`).join(',') + ']';
}
export const mirrorOf = (level, a, b) => shape(level, a) === shape(level, b, 0, -1);

// Is the starting board its own mirror image?
export const symmetric = level => shape(level, emptyState(level)) === shape(level, emptyState(level), 0, -1);

// Solutions that keep everything already hung where it is.
export function consistent(level, state, sols = solveAll(level)) {
  return sols.filter(sol => Object.entries(state.placed).every(([k, w]) => sol.placed[k] === w)
    && Object.entries(state.hang || {}).every(([c, p]) => sol.hang[c] === p));
}

// One useful next move:
//  {kind: 'remove', key}  a hung weight that no solution has there;
//  {kind: 'place', key, w, forced}  a weight to hang (forced: every
//    solution that keeps the board so far has it there);
//  {kind: 'hang', beam, p, forced}  where a free beam should hang.
export function hintMove(level, state, sols = solveAll(level)) {
  if (isSolved(level, state)) return null;
  const keep = consistent(level, state, sols);
  if (!keep.length) {
    const placedNow = Object.entries(state.placed).sort((a, b) => b[1] - a[1]);
    const agrees = sol => placedNow.every(([k, w]) => sol.placed[k] === w);
    // A weight that is wrong in every solution, heaviest first.
    for (const [k, w] of placedNow) if (!sols.some(sol => sol.placed[k] === w)) return {kind: 'remove', key: k};
    // A beam hanging where no solution hangs it, or the weights fit only with it elsewhere.
    for (const [c, p] of Object.entries(state.hang || {})) {
      const to = sols.find(agrees);
      if (to && to.hang[c] !== p) return {kind: 'hang', beam: Number(c), p: to.hang[c], forced: sols.filter(agrees).every(sol => sol.hang[c] === to.hang[c])};
    }
    // Each weight alone is fine but not together: take off one whose removal
    // leaves the rest finishable, else the lightest.
    for (const [k] of placedNow) {
      const rest = {placed: {...state.placed}, hang: state.hang};
      delete rest.placed[k];
      if (consistent(level, rest, sols).length) return {kind: 'remove', key: k};
    }
    return placedNow.length ? {kind: 'remove', key: placedNow.at(-1)[0]} : null;
  }
  // A free beam whose hook every solution agrees on, if it isn't there yet.
  for (const c of Object.keys(state.hang || {}).map(Number)) {
    const ps = new Set(keep.map(sol => sol.hang[c]));
    if (ps.size === 1 && [...ps][0] !== state.hang[c]) return {kind: 'hang', beam: c, p: [...ps][0], forced: true};
  }
  // Forced weights: same hook and weight in every remaining solution; the heaviest first.
  const open = sol => Object.entries(sol.placed).filter(([k]) => state.placed[k] === undefined);
  const forced = open(keep[0]).filter(([k, w]) => keep.every(sol => sol.placed[k] === w)).sort((a, b) => b[1] - a[1]);
  if (forced.length) return {kind: 'place', key: forced[0][0], w: forced[0][1], forced: true};
  for (const c of Object.keys(state.hang || {}).map(Number)) if (keep[0].hang[c] !== state.hang[c]) return {kind: 'hang', beam: c, p: keep[0].hang[c], forced: false};
  const next = open(keep[0]).sort((a, b) => b[1] - a[1])[0];
  return next ? {kind: 'place', key: next[0], w: next[1], forced: false} : null;
}

// Apply a hint move to a state (for tests and the smoke run).
export function applyHint(state, move) {
  const next = {placed: {...state.placed}, hang: {...(state.hang || {})}};
  if (move.kind === 'remove') delete next.placed[move.key];
  if (move.kind === 'place') next.placed[move.key] = move.w;
  if (move.kind === 'hang') next.hang[move.beam] = move.p;
  return next;
}
