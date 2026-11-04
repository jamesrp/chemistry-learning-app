// Elements the puzzles use. `e` is the number of outer (valence) electrons and
// `bonds` the number of bonds the element makes in these puzzles (the number
// of unpaired dots in its Lewis dot picture). The rest of the outer electrons
// are lone pairs: (e - bonds) / 2 of them.
export const ELEMENTS = {
  H: {e: 1, bonds: 1, name: 'hydrogen'},
  C: {e: 4, bonds: 4, name: 'carbon'},
  N: {e: 5, bonds: 3, name: 'nitrogen'},
  O: {e: 6, bonds: 2, name: 'oxygen'},
  F: {e: 7, bonds: 1, name: 'fluorine'},
  S: {e: 6, bonds: 2, name: 'sulfur'},
  Cl: {e: 7, bonds: 1, name: 'chlorine'},
};

export const bondsOf = el => {
  const info = ELEMENTS[el];
  if (!info) throw new Error(`Unknown element ${el}`);
  return info.bonds;
};
export const lonePairsOf = el => (ELEMENTS[el].e - ELEMENTS[el].bonds) / 2;

const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const sub = n => String(n).split('').map(d => SUB[d]).join('');
export const sup = n => String(n).split('').map(d => SUP[d]).join('');
// "Ca" with charge 2 -> "Ca²⁺"; charge -1 -> "Cl⁻".
export const withCharge = (label, charge) => label + (Math.abs(charge) === 1 ? '' : sup(Math.abs(charge))) + (charge > 0 ? '⁺' : '⁻');

// A formula from element counts, in the order given: {C: 2, H: 6, O: 1} -> "C₂H₆O".
export const formulaOf = counts => Object.entries(counts).filter(([, n]) => n > 0).map(([el, n]) => el + (n > 1 ? sub(n) : '')).join('');

export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const gcdAll = list => list.reduce((g, n) => gcd(g, n), 0);
