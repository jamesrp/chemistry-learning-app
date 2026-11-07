// Electron swap: why ions have the charges they do. A metal atom has a few
// outer electrons (sodium 1, magnesium 2, aluminum 3) and a non-metal atom
// is a few short of eight (chlorine 1, oxygen 2, nitrogen 3). Moving outer
// electrons from metal atoms to the non-metal atoms next to them until every
// metal has none left and every non-metal has eight leaves ions with full
// outer shells: Na⁺ and Cl⁻, Mg²⁺ and O²⁻. Each line between a metal and a
// non-metal carries 0 or more electrons, always from the metal.
import {gcdAll} from './elements.js';
import {formulaOfIons, compoundName} from './ions.js';

export const OUTER = {Li: 1, Na: 1, K: 1, Mg: 2, Ca: 2, Al: 3, F: 7, Cl: 7, O: 6, S: 6, N: 5};
export const isMetal = el => OUTER[el] <= 3;
// Electrons a metal gives away, or a non-metal takes.
export const wants = el => (isMetal(el) ? OUTER[el] : 8 - OUTER[el]);

// Lay a board out from rows of tokens ("." empty). Orthogonal neighbours that
// are a metal and a non-metal are joined; `cut` removes some pairs.
export function fromGrid(rows, {cut = [], step = 78} = {}) {
  const atoms = [], at = new Map();
  rows.forEach((row, r) => row.trim().split(/\s+/).forEach((tok, c) => {
    if (tok === '.') return;
    at.set(`${r},${c}`, atoms.length);
    atoms.push([tok, c * step, r * step]);
  }));
  const cutSet = new Set(cut.map(([p, q]) => [p.join(), q.join()].sort().join('|')));
  const links = [];
  for (const [cell, i] of at) {
    const [r, c] = cell.split(',').map(Number);
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const j = at.get(`${r + dr},${c + dc}`);
      if (j === undefined || isMetal(atoms[i][0]) === isMetal(atoms[j][0])) continue;
      if (cutSet.has([cell, `${r + dr},${c + dc}`].sort().join('|'))) continue;
      // Always metal first: electrons go from a to b.
      links.push(isMetal(atoms[i][0]) ? [i, j] : [j, i]);
    }
  }
  return {atoms, links};
}

export const capOf = (board, k) => Math.min(wants(board.atoms[board.links[k][0]][0]), wants(board.atoms[board.links[k][1]][0]));

// Electrons moved so far by each atom (given or taken).
export function moved(board, flow) {
  const m = board.atoms.map(() => 0);
  board.links.forEach(([a, b], k) => { m[a] += flow[k]; m[b] += flow[k]; });
  return m;
}
export const status = (board, flow) => moved(board, flow).map((n, i) => {
  const w = wants(board.atoms[i][0]);
  return {n, want: w, full: n === w, over: n > w};
});
export const isSolved = (board, flow) => status(board, flow).every(st => st.full);

// Every solution (electrons per line), by search with the totals as limits.
export function solveAll(board, limit = 50) {
  const n = board.links.length, flow = new Array(n).fill(0), out = [];
  const left = board.atoms.map(([el]) => wants(el));
  const lastUse = board.atoms.map(() => -1);
  board.links.forEach(([a, b], k) => { lastUse[a] = k; lastUse[b] = k; });
  const go = k => {
    if (out.length >= limit) return;
    if (k === n) { if (left.every(v => v === 0)) out.push(flow.slice()); return; }
    const [a, b] = board.links[k];
    for (let v = Math.min(left[a], left[b]); v >= 0; v--) {
      // An atom whose last line this is must finish on it.
      if (lastUse[a] === k && left[a] - v !== 0) continue;
      if (lastUse[b] === k && left[b] - v !== 0) continue;
      flow[k] = v; left[a] -= v; left[b] -= v;
      go(k + 1);
      left[a] += v; left[b] += v; flow[k] = 0;
    }
  };
  go(0);
  return out;
}

// The compounds formed: each group of atoms joined by lines that carry
// electrons is one piece of crystal; its ion counts, reduced, give a formula
// and a name. Several pieces of the same compound count once.
export function products(board, flow) {
  const parent = board.atoms.map((_, i) => i);
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  board.links.forEach(([a, b], k) => { if (flow[k]) parent[find(a)] = find(b); });
  const groups = new Map();
  board.atoms.forEach(([el], i) => {
    const g = find(i);
    if (!groups.has(g)) groups.set(g, {});
    groups.get(g)[el] = (groups.get(g)[el] || 0) + 1;
  });
  const seen = new Map();
  for (const counts of groups.values()) {
    const d = gcdAll(Object.values(counts)), reduced = {};
    for (const [el, c] of Object.entries(counts)) reduced[el] = c / d;
    const formula = formulaOfIons(reduced);
    if (!seen.has(formula)) seen.set(formula, compoundName(reduced));
  }
  return [...seen].map(([formula, name]) => ({formula, name}));
}

// The charge an atom has after moving n electrons: "+", "2+", "−", "3−".
export const chargeText = (el, n) => (n > 1 ? String(n) : '') + (isMetal(el) ? '+' : '−');
