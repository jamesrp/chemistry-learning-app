// Gear trains, with no DOM. Gears sit on pegs at integer points; a gear's
// radius is proportional to its teeth (8 teeth per unit), so every size has
// the same tooth pitch and any two can mesh. Two gears on pegs a distance d
// apart mesh when r1 + r2 = d, would overlap when r1 + r2 > d (not allowed),
// and don't touch when r1 + r2 < d. Speeds are exact fractions of the
// crank's, signed: + is clockwise (the crank's way).
export const TEETH = 8;
export const SIZES = [1, 2, 3, 4];

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const frac = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const feq = (a, b) => a[0] === b[0] && a[1] === b[1];

const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
// 'mesh', 'overlap' or 'apart' for two gears of radius ra, rb on pegs a, b.
export function relation(a, b, ra, rb) {
  const s = (ra + rb) ** 2, d = d2(a, b);
  return s === d ? 'mesh' : s > d ? 'overlap' : 'apart';
}

// The sizes on every peg: fixed gears (crank, fixed outputs) plus placements
// (an array over pegs, 0 for none).
export function sizesOf(level, placed) {
  const sizes = level.pegs.map((_, i) => placed?.[i] || 0);
  sizes[level.crank.peg] = level.crank.r;
  for (const g of level.fixed || []) sizes[g.peg] = g.r;
  return sizes;
}
export const isFixedPeg = (level, i) => i === level.crank.peg || (level.fixed || []).some(g => g.peg === i);
export const freePegs = level => level.pegs.map((_, i) => i).filter(i => !isFixedPeg(level, i));

// Pegs whose gears would overlap a gear of radius r on peg i.
export function blockers(level, sizes, i, r) {
  const out = [];
  level.pegs.forEach((p, j) => { if (j !== i && sizes[j] && relation(level.pegs[i], p, r, sizes[j]) === 'overlap') out.push(j); });
  return out;
}

// Gears left in the tray after these placements.
export function trayLeft(level, placed) {
  const left = {...level.tray};
  freePegs(level).forEach(i => { if (placed[i]) left[placed[i]] = (left[placed[i]] || 0) - 1; });
  return left;
}

// Turn the crank: each gear's signed speed (a fraction of the crank's), by a
// breadth-first walk over meshing pairs from the crank. Meshing gears turn
// opposite ways with speeds in inverse ratio to their teeth. If any meshing
// pair disagrees, the whole group joined to the crank is jammed and nothing
// in it turns. Gears not joined to the crank stand still.
export function evaluate(level, sizes) {
  const n = level.pegs.length, adj = sizes.map(() => []);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
    if (sizes[i] && sizes[j] && relation(level.pegs[i], level.pegs[j], sizes[i], sizes[j]) === 'mesh') { adj[i].push(j); adj[j].push(i); }
  const speed = sizes.map(() => null), parent = sizes.map(() => -1), c = level.crank.peg;
  speed[c] = frac(1);
  const queue = [c];
  let jammed = false;
  while (queue.length) {
    const i = queue.shift();
    for (const j of adj[i]) {
      const want = frac(-speed[i][0] * sizes[i], speed[i][1] * sizes[j]);
      if (speed[j] === null) { speed[j] = want; parent[j] = i; queue.push(j); }
      else if (!feq(speed[j], want)) jammed = true;
    }
  }
  const group = speed.map((v, i) => v !== null ? i : -1).filter(i => i >= 0);
  if (jammed) group.forEach(i => { speed[i] = frac(0); });
  const outputs = level.outputs.map(o => {
    const v = speed[o.peg], turning = Boolean(v && v[0] !== 0);
    const dirOk = turning && Math.sign(v[0]) === o.dir;
    const speedOk = turning && feq([Math.abs(v[0]), v[1]], o.speed);
    return {turning, dirOk, speedOk, ok: dirOk && speedOk};
  });
  return {speed, parent, adj, group, jammed, outputs, solved: !jammed && outputs.every(o => o.ok)};
}

export const solvedBy = (level, placed) => evaluate(level, sizesOf(level, placed)).solved;

// Every placement of tray gears on free pegs (no overlaps, within the tray)
// that solves the level. Placements are arrays over pegs (0 for none, and
// fixed pegs 0). Small boards: a plain depth-first search.
export function solveAll(level, {limit = Infinity} = {}) {
  const free = freePegs(level), sizes = sizesOf(level, null), left = {...level.tray}, out = [];
  const kinds = SIZES.filter(r => level.tray[r] > 0);
  const rec = k => {
    if (out.length >= limit) return;
    if (k === free.length) {
      if (evaluate(level, sizes).solved) out.push(sizes.map((r, i) => (isFixedPeg(level, i) ? 0 : r)));
      return;
    }
    const i = free[k];
    rec(k + 1);
    for (const r of kinds) {
      if (!left[r] || blockers(level, sizes, i, r).length) continue;
      sizes[i] = r; left[r]--;
      rec(k + 1);
      sizes[i] = 0; left[r]++;
    }
  };
  rec(0);
  return out;
}

// Solutions from which no gear can be taken away (taking a gear away never
// makes an overlap, so this is just: every single removal fails).
export function isMinimal(level, placed) {
  return placed.every((r, i) => !r || !solvedBy(level, placed.map((x, j) => (j === i ? 0 : x))));
}
export const minimalSolutions = (level, sols = solveAll(level)) => sols.filter(p => isMinimal(level, p));
export const gearCount = placed => placed.filter(Boolean).length;

// A useful next move. If the gears placed so far are part of some solution,
// the next placement: one that every such solution makes (a forced move)
// if there is one, preferring a peg that meshes with the crank's group;
// otherwise one from the smallest such solution. If they aren't, the gear to
// take away: one whose removal leaves a position that can still be solved.
export function hintMove(level, placed, sols = solveAll(level)) {
  const free = freePegs(level);
  const agrees = sol => free.every(i => !placed[i] || placed[i] === sol[i]);
  const ok = sols.filter(agrees);
  if (ok.length) {
    const sizes = sizesOf(level, placed), {group} = evaluate(level, sizes);
    const moves = [];
    for (const i of free) {
      if (placed[i]) continue;
      const rs = new Set(ok.map(sol => sol[i]));
      if (rs.size === 1 && !rs.has(0)) moves.push({peg: i, r: [...rs][0], forced: true});
    }
    const touches = m => group.some(g => relation(level.pegs[m.peg], level.pegs[g], m.r, sizes[g]) === 'mesh');
    moves.sort((a, b) => touches(b) - touches(a));
    if (moves.length) return {kind: 'place', ...moves[0]};
    const best = ok.reduce((a, b) => (gearCount(b) < gearCount(a) ? b : a));
    const cand = free.filter(i => !placed[i] && best[i]).map(i => ({peg: i, r: best[i], forced: false}));
    cand.sort((a, b) => touches(b) - touches(a));
    return cand.length ? {kind: 'place', ...cand[0]} : null;
  }
  const placedPegs = free.filter(i => placed[i]);
  for (const i of placedPegs) {
    const less = placed.map((x, j) => (j === i ? 0 : x));
    if (sols.some(sol => free.every(j => !less[j] || less[j] === sol[j]))) return {kind: 'remove', peg: i};
  }
  return placedPegs.length ? {kind: 'remove', peg: placedPegs[0]} : null;
}

// "×2", "×½", "×1½" for a speed [n, d] (n, d > 0).
const FR = {'1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾'};
export function speedLabel([n, d]) {
  if (d === 1) return `×${n}`;
  const whole = Math.floor(n / d), rest = `${n % d}/${d}`;
  return `×${whole || ''}${FR[rest] || (whole ? ' ' : '') + rest}`;
}
