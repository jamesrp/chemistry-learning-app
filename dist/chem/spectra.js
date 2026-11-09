// Mystery molecule: the clue cards a chemist reads to work out a molecule,
// computed from its structure the way a textbook draws them (idealized,
// first-order spectra).
//
// - Carbon-13 NMR: one peak for each kind of carbon. Two carbons are the same
//   kind when a symmetry of the molecule swaps them, so the peaks count the
//   orbits of the molecule's automorphism group on its carbons. Each peak sits
//   in a zone: C=O, C=C (or C≡C), next to O, N or Cl, or plain.
// - Proton NMR: one signal for each kind of carbon (or O, N) that carries
//   hydrogens. Its size is how many H it stands for; it splits into n + 1
//   lines, where n is the number of H on neighbouring carbons of another kind
//   (the n + 1 rule). H on O or N show as single lines and split nothing.
// - Infrared: which bonds ring like bells: O–H, N–H, C≡C or C≡N, C=O, C=C.
//
// mol: {els: ['C', 'C', 'O'], bonds: [[i, j, order], ...]} as in isomers.js.
import {hydrogensOn} from './isomers.js';

function matrix(mol) {
  const n = mol.els.length, m = Array.from({length: n}, () => new Array(n).fill(0));
  for (const [i, j, o] of mol.bonds) { m[i][j] += o; m[j][i] += o; }
  return m;
}

// Colour refinement: atoms with different colours can never be swapped.
function refine(mol, m) {
  const n = mol.els.length, hs = hydrogensOn(mol);
  let color = mol.els.map((el, i) => `${el}${hs[i]}`);
  for (let round = 0; round <= n; round++) {
    const sig = color.map((c, i) => c + '|' + m[i].map((o, j) => (o ? `${color[j]}${o}` : '')).filter(Boolean).sort().join(','));
    const ranks = [...new Set(sig)].sort();
    const next = sig.map(x => String(ranks.indexOf(x)));
    const stable = new Set(next).size === new Set(color).size;
    color = next;
    if (stable) break;
  }
  return color;
}

// Orbits of the automorphism group: a list of atom-index arrays. Found by a
// backtracking search for automorphisms within colour classes (molecules here
// have at most eight heavy atoms).
export function orbits(mol) {
  const n = mol.els.length, m = matrix(mol), color = refine(mol, m);
  const parent = [...Array(n).keys()];
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const map = new Array(n).fill(-1), used = new Array(n).fill(false);
  const go = i => {
    if (i === n) { for (let a = 0; a < n; a++) parent[find(a)] = find(map[a]); return; }
    for (let t = 0; t < n; t++) {
      if (used[t] || color[t] !== color[i]) continue;
      let ok = true;
      for (let k = 0; k < i && ok; k++) if (m[i][k] !== m[t][map[k]]) ok = false;
      if (!ok) continue;
      map[i] = t; used[t] = true;
      go(i + 1);
      used[t] = false;
    }
    map[i] = -1;
  };
  go(0);
  const groups = new Map();
  for (let a = 0; a < n; a++) { const r = find(a); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(a); }
  return [...groups.values()];
}

const CZONES = ['co', 'cc', 'x', 'plain'];
export const CARBON_ZONES = CZONES;
function carbonZone(mol, m, i) {
  let zone = 'plain';
  for (let j = 0; j < mol.els.length; j++) {
    const o = m[i][j];
    if (!o) continue;
    if (mol.els[j] === 'O' && o >= 2) return 'co';
    if (mol.els[j] === 'C' && o >= 2) zone = 'cc';
    else if (zone === 'plain' && mol.els[j] !== 'C') zone = 'x';
    if (mol.els[j] === 'N' && o === 3) zone = 'cc';
  }
  return zone;
}

// Carbon-13 peaks: one zone per kind of carbon, sorted.
export function carbonPeaks(mol) {
  const m = matrix(mol);
  return orbits(mol).filter(g => mol.els[g[0]] === 'C').map(g => carbonZone(mol, m, g[0])).sort((a, b) => CZONES.indexOf(a) - CZONES.indexOf(b));
}

export const HZONES = ['ald', 'cc', 'oh', 'x', 'plain'];
// Proton NMR signals: {zone, n (how many H), lines (n + 1 rule)}, sorted.
export function protonSignals(mol) {
  const m = matrix(mol), hs = hydrogensOn(mol), orb = orbits(mol), orbitOf = new Array(mol.els.length);
  orb.forEach((g, k) => g.forEach(i => { orbitOf[i] = k; }));
  const out = [];
  for (const g of orb) {
    const i = g[0];
    if (hs[i] <= 0) continue;
    const el = mol.els[i];
    let zone, split = 0;
    if (el === 'O' || el === 'N') zone = 'oh';
    else {
      const cz = carbonZone(mol, m, i);
      zone = cz === 'co' ? 'ald' : cz;
      for (let j = 0; j < mol.els.length; j++) if (m[i][j] && mol.els[j] === 'C' && orbitOf[j] !== orbitOf[i]) split += hs[j];
    }
    out.push({zone, n: hs[i] * g.length, lines: split + 1});
  }
  return out.sort((a, b) => HZONES.indexOf(a.zone) - HZONES.indexOf(b.zone) || b.n - a.n || a.lines - b.lines);
}

export const IR_BANDS = ['oh', 'nh', 'triple', 'co', 'cc'];
export const IR_LABEL = {oh: 'O–H', nh: 'N–H', triple: 'C≡', co: 'C=O', cc: 'C=C'};
// Infrared: which of the five bands the molecule shows.
export function irBands(mol) {
  const hs = hydrogensOn(mol), has = new Set();
  mol.els.forEach((el, i) => { if (el === 'O' && hs[i] > 0) has.add('oh'); if (el === 'N' && hs[i] > 0) has.add('nh'); });
  for (const [i, j, o] of mol.bonds) {
    const pair = [mol.els[i], mol.els[j]].sort().join('');
    if (o === 3) has.add('triple');
    if (o === 2 && pair === 'CO') has.add('co');
    if (o === 2 && pair === 'CC') has.add('cc');
  }
  return IR_BANDS.filter(b => has.has(b));
}

// One string per card, equal exactly when the card reads the same.
export const CARDS = ['ir', 'c', 'h'];
export function cardKey(mol, card) {
  if (card === 'ir') return irBands(mol).join(',');
  if (card === 'c') return carbonPeaks(mol).join(',');
  return protonSignals(mol).map(s => `${s.zone}${s.n}x${s.lines}`).join(',');
}
export const fingerprint = (mol, cards) => cards.map(c => cardKey(mol, c)).join(' | ');
