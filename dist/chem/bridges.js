// Valence bridges: a molecule as a multigraph. Atoms sit at fixed places and
// some pairs of neighbouring atoms may be joined by 0 to 3 bonds. A board is
// solved when every atom makes exactly its number of bonds (H 1, O 2, N 3,
// C 4, Cl 1) and the bonds join all the atoms into one molecule. That is a
// Lewis structure; the puzzle is Hashiwokakero with chemistry's numbers.
import {bondsOf} from './elements.js';

// Lay a board out from rows of tokens separated by spaces ("." is empty).
// Atoms in orthogonally neighbouring cells may bond; `extra` adds more pairs
// (by [row, col] cells) and `cut` removes some.
export function fromGrid(rows, {extra = [], cut = [], step = 24} = {}) {
  const atoms = [], at = new Map();
  rows.forEach((row, r) => row.trim().split(/\s+/).forEach((tok, c) => {
    if (tok === '.') return;
    at.set(`${r},${c}`, atoms.length);
    atoms.push([tok, c * step, r * step]);
  }));
  const key = ([a, b]) => `${a},${b}`, edges = [];
  const cutSet = new Set(cut.map(([p, q]) => [key(p), key(q)].sort().join('|')));
  for (const [cell, i] of at) {
    const [r, c] = cell.split(',').map(Number);
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const j = at.get(`${r + dr},${c + dc}`);
      if (j === undefined) continue;
      if (cutSet.has([cell, `${r + dr},${c + dc}`].sort().join('|'))) continue;
      edges.push([i, j]);
    }
  }
  for (const [p, q] of extra) edges.push([at.get(key(p)), at.get(key(q))]);
  return {atoms, edges};
}

export const edgeCap = (board, i) => Math.min(3, bondsOf(board.atoms[board.edges[i][0]][0]), bondsOf(board.atoms[board.edges[i][1]][0]));

export function loads(board, orders) {
  const load = board.atoms.map(() => 0);
  board.edges.forEach(([u, v], i) => { load[u] += orders[i]; load[v] += orders[i]; });
  return load;
}

export function connected(board, orders) {
  const n = board.atoms.length, adj = board.atoms.map(() => []);
  board.edges.forEach(([u, v], i) => { if (orders[i] > 0) { adj[u].push(v); adj[v].push(u); } });
  const seen = new Set([0]), stack = [0];
  while (stack.length) for (const w of adj[stack.pop()]) if (!seen.has(w)) { seen.add(w); stack.push(w); }
  return seen.size === n;
}

// Each atom: its bond count so far, how many it makes, and whether it's full or over.
export function status(board, orders) {
  const load = loads(board, orders);
  const atoms = board.atoms.map(([el], i) => ({load: load[i], need: bondsOf(el), full: load[i] === bondsOf(el), over: load[i] > bondsOf(el)}));
  const allFull = atoms.every(a => a.full), joined = connected(board, orders);
  return {atoms, allFull, connected: joined, solved: allFull && joined};
}

export const legalOrders = (board, orders) => orders.length === board.edges.length && orders.every((o, i) => Number.isInteger(o) && o >= 0 && o <= edgeCap(board, i));

// Every solution, by backtracking over the edges with each atom's remaining
// bond count as the bound. Small boards make this exhaustive.
export function solveAll(board, limit = 5000) {
  const n = board.edges.length, need = board.atoms.map(([el]) => bondsOf(el));
  // Edges touching each atom, and the last edge index that touches it, so an
  // atom whose edges are all decided can be checked at once.
  const last = board.atoms.map(() => -1);
  board.edges.forEach(([u, v], i) => { last[u] = i; last[v] = i; });
  const left = need.slice(), orders = new Array(n).fill(0), out = [];
  function go(i) {
    if (out.length >= limit) return;
    if (i === n) { if (left.every(x => x === 0) && connected(board, orders)) out.push(orders.slice()); return; }
    const [u, v] = board.edges[i], cap = Math.min(edgeCap(board, i), left[u], left[v]);
    for (let o = cap; o >= 0; o--) {
      orders[i] = o; left[u] -= o; left[v] -= o;
      if (!((last[u] === i && left[u] !== 0) || (last[v] === i && left[v] !== 0))) go(i + 1);
      left[u] += o; left[v] += o;
    }
    orders[i] = 0;
  }
  // An atom with no possible edge can never be full.
  if (last.some(x => x === -1)) return [];
  go(0);
  return out;
}

// The edge to change next, toward the solution that agrees most with the
// board: an edge every solution agrees on comes first.
export function hintMove(current, solutions) {
  if (!solutions.length) return null;
  let best = solutions[0], bestScore = -1;
  for (const s of solutions) {
    const score = s.reduce((n, o, i) => n + (o === current[i]), 0);
    if (score > bestScore) { best = s; bestScore = score; }
  }
  const differs = best.map((o, i) => (o !== current[i] ? i : -1)).filter(i => i >= 0);
  if (!differs.length) return null;
  const forced = differs.filter(i => solutions.every(s => s[i] === best[i]));
  const i = (forced.length ? forced : differs)[0];
  return {edge: i, order: best[i]};
}
