// Isomer hunt: every molecule that one bag of atoms can make. A molecule is
// its heavy atoms (C, N, O) and the bonds between them; each heavy atom's
// spare bonds go to hydrogens, as in a condensed formula (CH₃, OH). Two
// drawings are the same molecule when one graph can be relabelled into the
// other, which `canonical` decides by trying every relabelling (bags are small).
import {bondsOf} from './elements.js';

// mol: {els: ['C', 'C', 'O'], bonds: [[i, j, order], ...]}
export function loads(mol) {
  const load = mol.els.map(() => 0);
  for (const [i, j, o] of mol.bonds) { load[i] += o; load[j] += o; }
  return load;
}
export const hydrogensOn = mol => { const load = loads(mol); return mol.els.map((el, i) => bondsOf(el) - load[i]); };
export const hydrogenCount = mol => hydrogensOn(mol).reduce((a, b) => a + b, 0);

export function isConnected(mol) {
  const n = mol.els.length;
  if (n === 0) return false;
  const adj = mol.els.map(() => []);
  for (const [i, j, o] of mol.bonds) if (o > 0) { adj[i].push(j); adj[j].push(i); }
  const seen = new Set([0]), stack = [0];
  while (stack.length) for (const w of adj[stack.pop()]) if (!seen.has(w)) { seen.add(w); stack.push(w); }
  return seen.size === n;
}

// Is it a whole molecule from this bag: every heavy atom used, joined, none
// over its bond count, and exactly the bag's hydrogens left over.
export function checkBuild(mol, bag) {
  const counts = {};
  for (const el of mol.els) counts[el] = (counts[el] || 0) + 1;
  const sameAtoms = Object.keys(bag.heavy).every(el => (counts[el] || 0) === bag.heavy[el]) && Object.keys(counts).every(el => bag.heavy[el] === counts[el]);
  const hs = hydrogensOn(mol), over = hs.some(h => h < 0);
  const h = hs.reduce((a, b) => a + b, 0);
  return {sameAtoms, over, hydrogens: h, connected: isConnected(mol), ok: sameAtoms && !over && h === bag.H && isConnected(mol)};
}

function* permutationsWithin(groups) {
  // groups: arrays of indices; yields one array per combined permutation,
  // where each group is permuted among its own positions.
  const perms = groups.map(g => [...permute(g)]);
  const idx = perms.map(() => 0);
  while (true) {
    yield perms.flatMap((p, k) => p[idx[k]]);
    let k = 0;
    while (k < idx.length && ++idx[k] === perms[k].length) { idx[k] = 0; k++; }
    if (k === idx.length) return;
  }
}
function* permute(list) {
  if (list.length <= 1) { yield list.slice(); return; }
  for (let i = 0; i < list.length; i++) for (const rest of permute([...list.slice(0, i), ...list.slice(i + 1)])) yield [list[i], ...rest];
}

// A string that is the same for two drawings exactly when they are the same
// molecule. Atoms are first sorted into classes by structure (element, then
// repeatedly the classes and bond orders of their neighbours), which every
// relabelling preserves; then every relabelling within classes is tried and
// the smallest bond table wins. Bags are small, so this is exact and quick.
export function canonical(mol) {
  const n = mol.els.length, m = Array.from({length: n}, () => new Array(n).fill(0));
  for (const [i, j, o] of mol.bonds) { m[i][j] += o; m[j][i] += o; }
  let color = mol.els.slice();
  for (let round = 0; round < n; round++) {
    const sig = color.map((c, i) => c + '|' + m[i].map((o, j) => (o ? `${color[j]}${o}` : '')).filter(Boolean).sort().join(','));
    const ranks = [...new Set(sig)].sort();
    const next = sig.map((x, i) => String(ranks.indexOf(x)).padStart(3, '0') + mol.els[i]);
    const stable = new Set(next).size === new Set(color).size;
    color = next;
    if (stable) break;
  }
  const order = [...mol.els.keys()].sort((a, b) => (color[a] < color[b] ? -1 : color[a] > color[b] ? 1 : 0));
  const groups = [];
  for (const i of order) { const g = groups.at(-1); if (g && color[g[0]] === color[i]) g.push(i); else groups.push([i]); }
  let best = null;
  for (const p of permutationsWithin(groups)) {
    let str = '';
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) str += m[p[a]][p[b]];
    if (best === null || str < best) best = str;
  }
  return order.map(i => color[i]).join(' ') + ':' + best;
}

// Every distinct molecule for a bag, as {els, bonds}. The bonds' total order
// is fixed by the bag: (sum of bond counts - H) / 2.
export function enumerate(bag) {
  const els = Object.entries(bag.heavy).flatMap(([el, n]) => new Array(n).fill(el));
  const n = els.length, total = els.reduce((s, el) => s + bondsOf(el), 0) - bag.H;
  if (total < n - 1 || total % 2) return [];
  const target = total / 2, pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j, Math.min(3, bondsOf(els[i]), bondsOf(els[j]))]);
  const left = els.map(bondsOf), orders = new Array(pairs.length).fill(0), seen = new Map();
  function go(k, remaining) {
    if (remaining === 0) {
      const mol = {els, bonds: pairs.map(([i, j], q) => [i, j, orders[q]]).filter(b => b[2] > 0)};
      if (isConnected(mol)) { const key = canonical(mol); if (!seen.has(key)) seen.set(key, mol); }
      return;
    }
    if (k === pairs.length) return;
    const [i, j, cap] = pairs[k];
    for (let o = Math.min(cap, left[i], left[j], remaining); o >= 0; o--) {
      orders[k] = o; left[i] -= o; left[j] -= o;
      go(k + 1, remaining - o);
      left[i] += o; left[j] += o;
    }
    orders[k] = 0;
  }
  go(0, target);
  return [...seen.values()];
}

// Molecules from a short text: atoms in order, then bonds "0-1 1=2 2#3"
// (- single, = double, # triple). "CCO 0-1 1-2" is ethanol.
export function parseMol(text) {
  const [atoms, ...bonds] = text.trim().split(/\s+/);
  const els = atoms.match(/[A-Z][a-z]?/g);
  return {els, bonds: bonds.map(b => { const [, i, s, j] = /^(\d+)([-=#])(\d+)$/.exec(b); return [+i, +j, {'-': 1, '=': 2, '#': 3}[s]]; })};
}
