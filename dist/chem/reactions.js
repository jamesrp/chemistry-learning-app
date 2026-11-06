// Atom recycling: a reaction takes molecules apart and builds new ones, and
// no atom is made or lost. Breaking a reactant puts its atoms on the bench;
// building a product takes them off. The bench empty with every reactant and
// product used is a balanced equation.
import {gcdAll} from './elements.js';

// Molecules: atoms (for counting) and a small drawing (element, x, y; bonds
// between drawn atoms by index, with order).
export const MOLECULES = {
  H2: {formula: 'H₂', name: 'hydrogen', draw: [['H', 0, 0], ['H', 10, 0]], bonds: [[0, 1, 1]]},
  O2: {formula: 'O₂', name: 'oxygen', draw: [['O', 0, 0], ['O', 12, 0]], bonds: [[0, 1, 2]]},
  N2: {formula: 'N₂', name: 'nitrogen', draw: [['N', 0, 0], ['N', 12, 0]], bonds: [[0, 1, 3]]},
  Cl2: {formula: 'Cl₂', name: 'chlorine', draw: [['Cl', 0, 0], ['Cl', 12, 0]], bonds: [[0, 1, 1]]},
  HCl: {formula: 'HCl', name: 'hydrogen chloride', draw: [['H', 0, 0], ['Cl', 11, 0]], bonds: [[0, 1, 1]]},
  H2O: {formula: 'H₂O', name: 'water', draw: [['O', 0, 0], ['H', -8, 7], ['H', 8, 7]], bonds: [[0, 1, 1], [0, 2, 1]]},
  H2O2: {formula: 'H₂O₂', name: 'hydrogen peroxide', draw: [['O', 0, 0], ['O', 11, 0], ['H', -7, 7], ['H', 18, -7]], bonds: [[0, 1, 1], [0, 2, 1], [1, 3, 1]]},
  NH3: {formula: 'NH₃', name: 'ammonia', draw: [['N', 0, 0], ['H', -9, 6], ['H', 9, 6], ['H', 0, -10]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]]},
  CH4: {formula: 'CH₄', name: 'methane', draw: [['C', 0, 0], ['H', -10, 0], ['H', 10, 0], ['H', 0, -10], ['H', 0, 10]], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]},
  CO2: {formula: 'CO₂', name: 'carbon dioxide', draw: [['C', 0, 0], ['O', -12, 0], ['O', 12, 0]], bonds: [[0, 1, 2], [0, 2, 2]]},
  CO: {formula: 'CO', name: 'carbon monoxide', draw: [['C', 0, 0], ['O', 12, 0]], bonds: [[0, 1, 3]]},
  C3H8: {formula: 'C₃H₈', name: 'propane', draw: [['C', -10, 0], ['C', 0, 0], ['C', 10, 0], ['H', -20, 0], ['H', -10, -10], ['H', -10, 10], ['H', 0, -10], ['H', 0, 10], ['H', 10, -10], ['H', 10, 10], ['H', 20, 0]],
    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [1, 7, 1], [2, 8, 1], [2, 9, 1], [2, 10, 1]]},
  C2H4: {formula: 'C₂H₄', name: 'ethene', draw: [['C', -6, 0], ['C', 6, 0], ['H', -14, -7], ['H', -14, 7], ['H', 14, -7], ['H', 14, 7]],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]]},
  C2H6: {formula: 'C₂H₆', name: 'ethane', draw: [['C', -6, 0], ['C', 6, 0], ['H', -16, 0], ['H', -6, -10], ['H', -6, 10], ['H', 16, 0], ['H', 6, -10], ['H', 6, 10]],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]]},
  CH3OH: {formula: 'CH₃OH', name: 'methanol', draw: [['C', 0, 0], ['O', 11, 0], ['H', 20, 6], ['H', -10, 0], ['H', 0, -10], ['H', 0, 10]],
    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]]},
  C2H5OH: {formula: 'C₂H₅OH', name: 'ethanol', draw: [['C', -10, 0], ['C', 0, 0], ['O', 11, 0], ['H', 20, 6], ['H', -20, 0], ['H', -10, -10], ['H', -10, 10], ['H', 0, -10], ['H', 0, 10]],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1]]},
  N2H4: {formula: 'N₂H₄', name: 'hydrazine', draw: [['N', -6, 0], ['N', 6, 0], ['H', -13, -8], ['H', -13, 8], ['H', 13, -8], ['H', 13, 8]],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]]},
  // Glucose is drawn as its ring of five carbons and an oxygen, with the
  // sixth carbon and the OH groups around it; hydrogens on carbon are left off
  // the picture but counted.
  C6H12O6: {formula: 'C₆H₁₂O₆', name: 'glucose (a sugar)', atoms: {C: 6, H: 12, O: 6},
    draw: [['O', 0, -12], ['C', 10, -6], ['C', 10, 6], ['C', 0, 12], ['C', -10, 6], ['C', -10, -6], ['C', -20, -12], ['O', -30, -6], ['O', 20, -12], ['O', 20, 12], ['O', 0, 23], ['O', -20, 12]],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1], [5, 6, 1], [6, 7, 1], [1, 8, 1], [2, 9, 1], [3, 10, 1], [4, 11, 1]]},
};
for (const m of Object.values(MOLECULES)) if (!m.atoms) {
  m.atoms = {};
  for (const [el] of m.draw) m.atoms[el] = (m.atoms[el] || 0) + 1;
}

export const addAtoms = (into, atoms, k = 1) => { for (const [el, n] of Object.entries(atoms)) into[el] = (into[el] || 0) + n * k; return into; };
export const hasAtoms = (bench, atoms) => Object.entries(atoms).every(([el, n]) => (bench[el] || 0) >= n);
export const missingAtoms = (bench, atoms) => Object.keys(atoms).filter(el => (bench[el] || 0) < atoms[el]);
export const benchEmpty = bench => Object.values(bench).every(n => n === 0);

// state: {broken: {H2: 2, O2: 1}, built: {H2O: 2}}; the bench follows from it.
export function benchOf(level, state) {
  const bench = {};
  for (const id of level.reactants) addAtoms(bench, MOLECULES[id].atoms, state.broken[id] || 0);
  for (const id of level.products) addAtoms(bench, MOLECULES[id].atoms, -(state.built[id] || 0));
  return bench;
}

export function check(level, state) {
  const bench = benchOf(level, state), empty = benchEmpty(bench);
  const used = level.reactants.every(id => state.broken[id] > 0) && level.products.every(id => state.built[id] > 0);
  const coeffs = [...level.reactants.map(id => state.broken[id] || 0), ...level.products.map(id => state.built[id] || 0)];
  const lowest = gcdAll(coeffs) === 1;
  if (level.most) {
    const made = state.built[level.most] || 0;
    return {bench, empty, best: made === bestYield(level), ok: empty && made === bestYield(level), made};
  }
  return {bench, empty, used, lowest, ok: empty && used && lowest};
}

export const equationOf = (level, state) => {
  const side = ids => ids.filter(id => (state.broken[id] || state.built[id])).map(id => {
    const n = state.broken[id] || state.built[id];
    return (n > 1 ? n : '') + MOLECULES[id].formula;
  }).join(' + ');
  return `${side(level.reactants)} → ${side(level.products)}`;
};

// The equation in words: "methane + oxygen → carbon dioxide + water".
export const wordsOf = level => `${level.reactants.map(id => MOLECULES[id].name).join(' + ')} → ${level.products.map(id => MOLECULES[id].name).join(' + ')}`;

// For a limited pile: the most of one product that can be built with nothing
// left loose on the bench (leftover reactants stay whole on the shelf).
export function bestYield(level) {
  if (level._best !== undefined) return level._best;
  let best = 0;
  const ranges = level.reactants.map(id => level.supply[id]);
  const prods = level.products;
  const caps = prods.map(() => 60);
  const rec = (k, broken) => {
    if (k < ranges.length) { for (let n = 0; n <= ranges[k]; n++) rec(k + 1, {...broken, [level.reactants[k]]: n}); return; }
    const recP = (q, built) => {
      if (q === prods.length) { if (benchEmpty(benchOf(level, {broken, built}))) best = Math.max(best, built[level.most] || 0); return; }
      for (let n = 0; n <= caps[q]; n++) {
        const next = {...built, [prods[q]]: n}, bench = benchOf(level, {broken, built: next});
        if (Object.values(bench).some(x => x < 0)) break;
        recP(q + 1, next);
      }
    };
    recP(0, {});
  };
  rec(0, {});
  Object.defineProperty(level, '_best', {value: best});
  return best;
}

// A small balanced witness for tests and hints: the smallest total of
// coefficients up to `max` each.
export function smallestBalance(level, max = 12) {
  const ids = [...level.reactants, ...level.products], k = level.reactants.length;
  let best = null;
  const coeff = new Array(ids.length).fill(1);
  const rec = i => {
    if (i === ids.length) {
      const state = {broken: Object.fromEntries(ids.slice(0, k).map((id, j) => [id, coeff[j]])), built: Object.fromEntries(ids.slice(k).map((id, j) => [id, coeff[k + j]]))};
      if (benchEmpty(benchOf(level, state))) { const s = coeff.reduce((a, b) => a + b, 0); if (!best || s < best.sum) best = {sum: s, state}; }
      return;
    }
    for (let n = 1; n <= max; n++) { coeff[i] = n; rec(i + 1); }
  };
  rec(0);
  return best && best.state;
}
