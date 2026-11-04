// Charge jigsaw: ions as whole numbers. A compound is neutral when its
// charges add up to zero, and its formula unit is the smallest such group,
// so Al³⁺ and O²⁻ make Al₂O₃ (3 × 2 = 2 × 3 = 6).
import {sub, withCharge, gcdAll, gcd} from './elements.js';

export const IONS = {
  H: {label: 'H', charge: 1}, Li: {label: 'Li', charge: 1}, Na: {label: 'Na', charge: 1}, K: {label: 'K', charge: 1},
  Mg: {label: 'Mg', charge: 2}, Ca: {label: 'Ca', charge: 2}, Zn: {label: 'Zn', charge: 2}, Al: {label: 'Al', charge: 3}, Fe3: {label: 'Fe', charge: 3},
  NH4: {label: 'NH₄', charge: 1, poly: true},
  F: {label: 'F', charge: -1}, Cl: {label: 'Cl', charge: -1}, Br: {label: 'Br', charge: -1}, O: {label: 'O', charge: -2}, S: {label: 'S', charge: -2}, N: {label: 'N', charge: -3},
  OH: {label: 'OH', charge: -1, poly: true}, NO3: {label: 'NO₃', charge: -1, poly: true}, CO3: {label: 'CO₃', charge: -2, poly: true},
  SO4: {label: 'SO₄', charge: -2, poly: true}, PO4: {label: 'PO₄', charge: -3, poly: true},
};
export const ionName = id => withCharge(IONS[id].label, IONS[id].charge);

// counts: {Ca: 1, Cl: 2}
export const totalCharge = counts => Object.entries(counts).reduce((s, [id, n]) => s + IONS[id].charge * n, 0);
export const kinds = counts => Object.keys(counts).filter(id => counts[id] > 0);

export function formulaUnit(cation, anion) {
  const p = IONS[cation].charge, q = -IONS[anion].charge, l = p * q / gcd(p, q);
  return {[cation]: l / p, [anion]: l / q};
}

// "Ca(OH)₂", "(NH₄)₂SO₄", "Al₂O₃": cations first.
export function formulaOfIons(counts) {
  const ids = kinds(counts).sort((a, b) => IONS[b].charge - IONS[a].charge);
  return ids.map(id => {
    const n = counts[id], {label, poly} = IONS[id];
    return n === 1 ? label : (poly ? `(${label})` : label) + sub(n);
  }).join('');
}

export function checkCompound(counts) {
  const ids = kinds(counts), plus = ids.filter(id => IONS[id].charge > 0), minus = ids.filter(id => IONS[id].charge < 0);
  const neutral = ids.length > 0 && totalCharge(counts) === 0;
  const lowest = gcdAll(ids.map(id => counts[id])) === 1;
  const twoKinds = plus.length === 1 && minus.length === 1;
  return {neutral, lowest, twoKinds, ok: neutral && lowest && twoKinds, formula: formulaOfIons(counts)};
}

// Every compound one tray can make: one cation kind with one anion kind.
export function allCompounds(tray) {
  const plus = tray.filter(id => IONS[id].charge > 0), minus = tray.filter(id => IONS[id].charge < 0);
  return plus.flatMap(c => minus.map(a => formulaUnit(c, a)));
}
export const compoundKey = counts => kinds(counts).sort().map(id => `${id}${counts[id]}`).join(' ');
