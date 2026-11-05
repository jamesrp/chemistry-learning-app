// Bulb boards: a circuit on a grid of posts. Parts sit on the links between
// neighbouring posts: one battery, identical bulbs, fixed wires, switches.
// The player lays wires on the other links. With an ideal battery and
// identical bulbs (resistance 1, battery 1 volt), Kirchhoff's laws fix every
// bulb's current exactly; a bulb's brightness is its power, the square of the
// voltage across it. Everything is computed in exact fractions.

// ---- Exact fractions on BigInt
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
export const frac = (n, d = 1n) => {
  n = BigInt(n); d = BigInt(d);
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d) || 1n;
  return {n: n / g, d: d / g};
};
const add = (x, y) => frac(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => frac(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => frac(x.n * y.n, x.d * y.d);
const div = (x, y) => frac(x.n * y.d, x.d * y.n);
const ZERO = frac(0), ONE = frac(1);
export const cmp = (x, y) => { const v = x.n * y.d - y.n * x.d; return v < 0n ? -1 : v > 0n ? 1 : 0; };
export const fracText = x => (x.d === 1n ? String(x.n) : `${x.n}/${x.d}`);

// ---- Board geometry
// Posts are numbered r * cols + c. A link joins two orthogonal neighbours.
export const postId = (level, [r, c]) => r * level.cols + c;
const linkKey = (p, q) => (p < q ? `${p}-${q}` : `${q}-${p}`);

// Every link of the board with what sits on it: a part (by index) or a gap
// where a wire may go. `level.cut` removes links; `level.holes` removes posts.
export function layout(level) {
  const holes = new Set((level.holes || []).map(p => postId(level, p)));
  const posts = [];
  for (let r = 0; r < level.rows; r++) for (let c = 0; c < level.cols; c++) if (!holes.has(r * level.cols + c)) posts.push([r, c]);
  const taken = new Map();
  level.parts.forEach((part, i) => {
    for (const [a, b] of partLinks(part)) taken.set(linkKey(postId(level, a), postId(level, b)), i);
  });
  const cut = new Set((level.cut || []).map(([a, b]) => linkKey(postId(level, a), postId(level, b))));
  const gaps = [];
  for (const [r, c] of posts) for (const [dr, dc] of [[0, 1], [1, 0]]) {
    const q = [r + dr, c + dc];
    if (q[0] >= level.rows || q[1] >= level.cols || holes.has(postId(level, q))) continue;
    const k = linkKey(postId(level, [r, c]), postId(level, q));
    if (taken.has(k) || cut.has(k)) continue;
    gaps.push([[r, c], q]);
  }
  return {posts, gaps};
}

// The links a part occupies.
export function partLinks(part) {
  if (part.kind === 'spdt') return part.throws.map(t => [part.common, t]);
  return [[part.a, part.b]];
}

// Switches in order of appearance; a level's switch states are listed in this order.
export const switchesOf = level => level.parts.map((p, i) => [p, i]).filter(([p]) => p.kind === 'switch' || p.kind === 'spdt').map(([, i]) => i);
export const bulbsOf = level => level.parts.map((p, i) => [p, i]).filter(([p]) => p.kind === 'bulb').map(([, i]) => i);

// ---- The circuit
// wires: array of gap indices that hold a wire. states: one number per switch
// (0 open / 1 closed for a switch; which throw for a two-way switch).
// Returns {short, power: Map partIndex -> fraction, bright: Map partIndex -> class}.
export function evaluate(level, wires, states = []) {
  const {gaps} = layout(level);
  const n = level.rows * level.cols, parent = [...Array(n).keys()];
  const find = x => { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; };
  const join = (a, b) => { parent[find(a)] = find(b); };
  const id = p => postId(level, p);
  for (const g of wires) join(id(gaps[g][0]), id(gaps[g][1]));
  const sw = switchesOf(level);
  level.parts.forEach((part, i) => {
    if (part.kind === 'wire') join(id(part.a), id(part.b));
    if (part.kind === 'switch' && states[sw.indexOf(i)] === 1) join(id(part.a), id(part.b));
    if (part.kind === 'spdt') join(id(part.common), id(part.throws[states[sw.indexOf(i)] || 0]));
  });
  const battery = level.parts.find(p => p.kind === 'battery');
  const plus = find(id(battery.a)), minus = find(id(battery.b));
  const bulbs = bulbsOf(level), power = new Map(), bright = new Map();
  if (plus === minus) {
    for (const b of bulbs) { power.set(b, ZERO); bright.set(b, 'off'); }
    return {short: true, power, bright};
  }
  // Bulbs between distinct super-posts carry current; others are shorted out.
  const edges = bulbs.map(b => [b, find(id(level.parts[b].a)), find(id(level.parts[b].b))]);
  const adj = new Map();
  for (const [, u, v] of edges) if (u !== v) {
    if (!adj.has(u)) adj.set(u, []); if (!adj.has(v)) adj.set(v, []);
    adj.get(u).push(v); adj.get(v).push(u);
  }
  const comp = new Set([plus]), queue = [plus];
  while (queue.length) for (const v of adj.get(queue.shift()) || []) if (!comp.has(v)) { comp.add(v); queue.push(v); }
  const volt = new Map([[plus, ONE], [minus, ZERO]]);
  if (comp.has(minus)) {
    // Kirchhoff's current law at every other post of the battery's piece:
    // the sum over its bulbs of (V_u - V_v) is zero.
    const unknown = [...comp].filter(u => u !== plus && u !== minus), at = new Map(unknown.map((u, k) => [u, k]));
    const m = unknown.length, A = unknown.map(() => new Array(m + 1).fill(ZERO));
    unknown.forEach((u, k) => {
      for (const v of adj.get(u)) {
        A[k][k] = add(A[k][k], ONE);
        if (at.has(v)) A[k][at.get(v)] = sub(A[k][at.get(v)], ONE);
        else if (volt.has(v)) A[k][m] = add(A[k][m], volt.get(v));
      }
    });
    for (let c = 0; c < m; c++) {
      const p = A.findIndex((row, r) => r >= c && row[c].n !== 0n);
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < m; r++) if (r !== c && A[r][c].n !== 0n) {
        const k = div(A[r][c], A[c][c]);
        A[r] = A[r].map((x, j) => sub(x, mul(k, A[c][j])));
      }
    }
    unknown.forEach((u, k) => volt.set(u, div(A[k][m], A[k][k])));
  }
  for (const [b, u, v] of edges) {
    const p = u !== v && comp.has(u) && comp.has(minus) ? (d => mul(d, d))(sub(volt.get(u), volt.get(v))) : ZERO;
    power.set(b, p); bright.set(b, classOf(p));
  }
  return {short: false, power, bright};
}

// Brightness classes the board draws: bright is a bulb alone across the
// battery (power 1); dim down to a quarter (two in a row); faint is anything
// lower but not zero.
export function classOf(p) {
  if (p.n === 0n) return 'off';
  if (cmp(p, ONE) >= 0) return 'bright';
  if (cmp(p, frac(1, 4)) >= 0) return 'dim';
  return 'faint';
}

// All switch-state combinations, in the order a level's table lists them.
export function stateRows(level) {
  const sw = switchesOf(level);
  if (!sw.length) return [[]];
  let rows = [[]];
  // Every switch has two settings: off/on, or up/down for a two-way one.
  for (let k = 0; k < sw.length; k++) rows = rows.flatMap(r => [[...r, 0], [...r, 1]]);
  return rows;
}

// Does every bulb glow as wanted? Plain boards have `want` on each bulb;
// switch boards have a `table` of {states, want: {partIndex: class}} rows.
export function rowsMet(level, wires) {
  if (!level.table) {
    const e = evaluate(level, wires);
    return [!e.short && bulbsOf(level).every(b => e.bright.get(b) === level.parts[b].want)];
  }
  return level.table.map(row => {
    const e = evaluate(level, wires, row.states);
    return !e.short && Object.entries(row.want).every(([b, w]) => e.bright.get(Number(b)) === w);
  });
}
export const isSolved = (level, wires) => wires.length <= level.budget && rowsMet(level, wires).every(Boolean);

// Every set of at most `max` wires that solves the board (sorted gap lists).
export function solveAll(level, max = level.budget) {
  const {gaps} = layout(level), out = [];
  const pick = [];
  const rec = start => {
    if (rowsMet(level, pick).every(Boolean)) out.push([...pick]);
    if (pick.length === max) return;
    for (let g = start; g < gaps.length; g++) { pick.push(g); rec(g + 1); pick.pop(); }
  };
  rec(0);
  return out;
}

// The fewest wires that solve the board, or null if none within `cap`.
export function fewest(level, cap = 10) {
  for (let k = 0; k <= cap; k++) if (solveAll({...level, budget: k}, k).length) return k;
  return null;
}

// A hint: the wire to lift (one that no nearby solution uses) or the gap to
// fill next, measured against the closest solution.
export function hintMove(wires, solutions) {
  if (!solutions.length) return null;
  const have = new Set(wires);
  let best = null, bestD = Infinity;
  for (const sol of solutions) {
    const s = new Set(sol), d = sol.filter(g => !have.has(g)).length + wires.filter(g => !s.has(g)).length;
    if (d < bestD) { bestD = d; best = s; }
  }
  const extra = wires.find(g => !best.has(g));
  if (extra !== undefined) return {gap: extra, lift: true};
  const missing = [...best].find(g => !have.has(g));
  return missing === undefined ? null : {gap: missing, lift: false};
}
