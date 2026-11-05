// Overhang: identical uniform blocks, one per layer, at a table edge. All in
// whole units, a block is L = 12 units long, the table's edge is at x = 0 and
// the table runs left to x = -TABLE. A stack is the list of right ends r[0]
// (bottom) .. r[n-1] (top); block i covers [r[i] - L, r[i]] and its centre is
// r[i] - L/2. No DOM here: stability, moves, reach, and an exact solver.
export const L = 12, TABLE = 24;

// The centre of mass of blocks k..top must lie on what holds them up: the
// table (x <= 0) for the bottom block, block k-1 (between its two ends) for
// the others. Exactly on an edge counts as standing. Integer arithmetic: with
// m blocks above the contact and S the sum of their centres, the condition
// lo <= S/m <= hi becomes m*lo <= S <= m*hi.
export function contacts(r) {
  const n = r.length, out = [];
  let S = 0;
  for (let k = n - 1; k >= 0; k--) {
    S += r[k] - L / 2;
    const m = n - k, lo = k ? r[k - 1] - L : -TABLE, hi = k ? r[k - 1] : 0;
    out[k] = {k, m, S, lo, hi, com: S / m, right: S > m * hi, left: S < m * lo, atEdge: S === m * hi || (k > 0 && S === m * lo)};
  }
  return out;
}

// The lowest contact that fails, or null when the stack stands. The part that
// falls is blocks k..top, tipping over the edge at (pivot, top of block k-1).
export function failure(r) {
  for (const c of contacts(r)) if (c.right || c.left) return {k: c.k, dir: c.right ? 1 : -1, pivot: c.right ? c.hi : c.lo};
  return null;
}
export const stands = r => failure(r) === null;

// A move slides block k by dir (+1 right, -1 left) and carries every block
// above it. Blocks stay over the drawn table on the left.
export function moved(r, k, dir) { return r.map((x, i) => (i >= k ? x + dir : x)); }
export const inBounds = r => r.every(x => x - L >= -TABLE);
export const reach = r => Math.max(...r);
// The goal: the stack's rightmost point reaches the flag, or, on a level with
// a marked block, that block's right end does.
export const goalX = (level, r) => (level.mark === undefined ? reach(r) : r[level.mark]);
export const isWon = (level, r) => goalX(level, r) >= level.flag;
export const start = level => level.start ? level.start.slice() : new Array(level.n).fill(level.at);

// What happens when the player tries a move: 'ok' (the new stack), 'wall'
// (it would leave the table's drawn end), or 'falls' with the failing contact.
export function tryMove(r, k, dir) {
  const next = moved(r, k, dir);
  if (!inBounds(next)) return {kind: 'wall'};
  const fall = failure(next);
  return fall ? {kind: 'falls', next, fall} : {kind: 'ok', next};
}

// Every standing stack of n blocks within the table's bounds, reached from a
// start by single moves (the move graph is undirected: a move and its reverse
// are both standing). Breadth-first, so it also gives shortest move counts.
const key = r => r.join(',');
export function explore(r0) {
  const n = r0.length, seen = new Map([[key(r0), {r: r0, d: 0, from: null}]]), queue = [r0];
  for (let q = 0; q < queue.length; q++) {
    const r = queue[q], d = seen.get(key(r)).d;
    for (let k = 0; k < n; k++) for (const dir of [1, -1]) {
      const t = tryMove(r, k, dir);
      if (t.kind !== 'ok' || seen.has(key(t.next))) continue;
      seen.set(key(t.next), {r: t.next, d: d + 1, from: [key(r), k, dir]});
      queue.push(t.next);
    }
  }
  return seen;
}

// The farthest any standing stack of n blocks reaches past the edge, on this
// grid of twelfths, by an exact top-down search. A sub-stack of the top m
// blocks is summed up, relative to the right end of its lowest block, by S
// (the sum of its centres) and how far it reaches; whether it can sit on
// another block depends only on S, so for each S keep the farthest reach.
// Putting it on a new block with offset d (its lowest block's right end
// minus the new block's) needs its centre S/m + d within [-L, 0].
export function maxReach(n) {
  let layer = new Map([[-L / 2, {reach: 0, offs: []}]]);
  for (let m = 1; m < n; m++) {
    const next = new Map();
    for (const [S, {reach: q, offs}] of layer) for (let d = -L; d <= L; d++) {
      const T = S + m * d;
      if (T < -L * m || T > 0) continue;
      const S2 = T - L / 2, q2 = Math.max(0, d + q), old = next.get(S2);
      if (!old || q2 > old.reach) next.set(S2, {reach: q2, offs: [d, ...offs]});
    }
    layer = next;
  }
  // The bottom block at right end x: the whole stack's centre (S + n x)/n <= 0.
  let best = {reach: -Infinity};
  for (const [S, {reach: q, offs}] of layer) {
    const x = Math.floor(-S / n);
    if (x + q > best.reach) {
      const r = [x];
      for (const d of offs) r.push(r.at(-1) + d);
      best = {reach: x + q, stack: r};
    }
  }
  return best;
}

// Every standing stack (within the table's bounds) that wins, by the same
// top-down search with a bound: best(m, S, q) is the farthest the goal can
// still get once the blocks below a top sub-stack (m blocks, centre sum S,
// goal point q relative to its lowest block) are added, ignoring the table's
// left end; sub-stacks that can't reach the flag are dropped at once. Above
// a marked block there is no goal point yet (q = Infinity, no pruning).
export function winners(level) {
  const {n, flag, mark} = level, memo = new Map();
  const below = (q, d) => (q === Infinity ? q : mark === undefined ? Math.max(0, d + q) : d + q);
  const best = (m, S, q) => {
    if (m === n) { const x = Math.floor(-S / n); return x >= L - TABLE ? x + q : -Infinity; }
    const id = `${m},${S},${q}`;
    if (memo.has(id)) return memo.get(id);
    let b = -Infinity;
    for (let d = -L; d <= L; d++) {
      const T = S + m * d;
      if (T >= -L * m && T <= 0) b = Math.max(b, best(m + 1, T - L / 2, n - m - 1 === mark ? 0 : below(q, d)));
    }
    memo.set(id, b);
    return b;
  };
  const out = [];
  const rec = (m, S, q, offs) => {
    if (m === n) {
      for (let x = L - TABLE; x <= Math.floor(-S / n); x++) {
        const r = [x];
        for (const d of offs) r.push(r.at(-1) + d);
        if (isWon(level, r) && inBounds(r) && stands(r)) out.push(r);
      }
      return;
    }
    for (let d = -L; d <= L; d++) {
      const T = S + m * d;
      if (T < -L * m || T > 0) continue;
      const S2 = T - L / 2, q2 = n - m - 1 === mark ? 0 : below(q, d);
      if (best(m + 1, S2, q2) >= flag) rec(m + 1, S2, q2, [d, ...offs]);
    }
  };
  const q1 = mark === undefined || mark === n - 1 ? 0 : Infinity;
  if (best(1, -L / 2, q1) >= flag) rec(1, -L / 2, q1, []);
  return out;
}

// The farthest the goal point can reach for a level's blocks and mark.
export function bestGoal(level) {
  for (let flag = 2 * L; flag > -L; flag--) if (winners({...level, flag}).length) return flag;
  return null;
}

// Each move changes one block's offset over the one below (or the bottom's
// place on the table) by one unit, so the distance in offsets to the nearest
// winning stack is a lower bound on the moves left: A* with that bound finds
// a shortest way to the flag from any standing stack.
const offsets = r => r.map((x, i) => (i ? x - r[i - 1] : x));
export function solveFrom(level, r0, wins = winners(level), cap = 40000) {
  const W = wins.map(offsets);
  const h = r => { const d = offsets(r); let b = Infinity; for (const w of W) { let s = 0; for (let i = 0; i < d.length; i++) s += Math.abs(d[i] - w[i]); if (s < b) b = s; } return b; };
  if (!W.length) return null;
  const heap = [], seen = new Map();
  let seq = 0;
  const less = (a, b) => a.f - b.f || a.h - b.h || a.seq - b.seq;
  const push = node => { heap.push(node); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (less(heap[p], heap[i]) <= 0) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < heap.length && less(heap[a], heap[m]) < 0) m = a; if (b < heap.length && less(heap[b], heap[m]) < 0) m = b; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  const h0 = h(r0);
  push({r: r0, g: 0, h: h0, f: h0, seq: seq++, path: []});
  seen.set(key(r0), 0);
  for (let expanded = 0; heap.length && expanded < cap; expanded++) {
    const node = pop();
    if (node.g > seen.get(key(node.r))) continue;
    if (isWon(level, node.r)) return node.path;
    // Top block first, so ties go to building from the top down.
    for (let k = node.r.length - 1; k >= 0; k--) for (const dir of [1, -1]) {
      const t = tryMove(node.r, k, dir);
      if (t.kind !== 'ok') continue;
      const id = key(t.next), g = node.g + 1;
      if (seen.has(id) && seen.get(id) <= g) continue;
      seen.set(id, g);
      const hh = h(t.next);
      push({r: t.next, g, h: hh, f: g + hh, seq: seq++, path: [...node.path, [k, dir]]});
    }
  }
  return null;
}

// Hint: the next move of the stored witness when the stack is on that path
// (it is a shortest one), otherwise the first move of a shortest way from
// here. Returns [block, dir], or null when won or (never, on these levels)
// stuck.
export function hintMove(level, r, wins) {
  if (isWon(level, r)) return null;
  let w = start(level);
  for (const [k, dir] of level.witness || []) {
    if (key(w) === key(r)) return [k, dir];
    w = moved(w, k, dir);
  }
  const path = solveFrom(level, r, wins);
  return path && path.length ? path[0] : null;
}
export {key as stackKey, offsets};
