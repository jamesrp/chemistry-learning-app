// Valence bridges boards, Easy to Hard. Each is checked in tests/bridges.test.mjs:
// `solutions` is the number of distinct Lewis structures the board allows.
import {fromGrid} from '../chem/bridges.js';

// A six-atom ring with a hydrogen outside each carbon. `ring` lists the ring
// atoms from the top, going round; a nitrogen in the ring has no hydrogen.
function sixRing(ring = ['C', 'C', 'C', 'C', 'C', 'C']) {
  const atoms = [], edges = [], at = k => [+(26 * Math.cos(Math.PI / 2 + k * Math.PI / 3)).toFixed(2), +(26 * Math.sin(Math.PI / 2 + k * Math.PI / 3)).toFixed(2)];
  ring.forEach((el, k) => atoms.push([el, ...at(k)]));
  for (let k = 0; k < 6; k++) edges.push([k, (k + 1) % 6]);
  ring.forEach((el, k) => {
    if (el !== 'C') return;
    const t = Math.PI / 2 + k * Math.PI / 3;
    edges.push([k, atoms.length]);
    atoms.push(['H', +(48 * Math.cos(t)).toFixed(2), +(48 * Math.sin(t)).toFixed(2)]);
  });
  return {atoms, edges};
}

// Hexagons of carbon sharing edges, as in naphthalene: `centers` are ring
// centres in steps of one ring across (dx) and one row down (dy). A carbon in
// only one ring carries a hydrogen, pointing away from that ring.
function fusedRings(centers) {
  const R = 26, W = R * Math.sqrt(3), atoms = [], edges = [], at = new Map(), ringsOf = [];
  const place = (x, y) => {
    const key = `${Math.round(x)},${Math.round(y)}`;
    if (!at.has(key)) { at.set(key, atoms.length); atoms.push(['C', +x.toFixed(2), +y.toFixed(2)]); ringsOf.push([]); }
    return at.get(key);
  };
  const seen = new Set();
  for (const [dx, dy] of centers) {
    const cx = dx * W + dy * W / 2, cy = dy * 1.5 * R;
    const ring = [0, 1, 2, 3, 4, 5].map(k => place(cx + R * Math.cos(Math.PI / 2 + k * Math.PI / 3), cy + R * Math.sin(Math.PI / 2 + k * Math.PI / 3)));
    ring.forEach((a, k) => {
      ringsOf[a].push([cx, cy]);
      const b = ring[(k + 1) % 6], key = [a, b].sort((p, q) => p - q).join('-');
      if (!seen.has(key)) { seen.add(key); edges.push([a, b]); }
    });
  }
  const carbons = atoms.length;
  for (let a = 0; a < carbons; a++) {
    if (ringsOf[a].length !== 1) continue;
    const [cx, cy] = ringsOf[a][0], [, x, y] = atoms[a], d = Math.hypot(x - cx, y - cy);
    edges.push([a, atoms.length]);
    atoms.push(['H', +(cx + (x - cx) * 48 / d).toFixed(2), +(cy + (y - cy) * 48 / d).toFixed(2)]);
  }
  return {atoms, edges, minOrder: 1, maxOrder: 2};
}

export const BRIDGE_LEVELS = [
  {id: 'water', tier: 'easy', name: 'water', formula: 'H₂O', solutions: 1, ...fromGrid(['O H', 'H .'])},
  {id: 'ammonia', tier: 'easy', name: 'ammonia', formula: 'NH₃', solutions: 1, ...fromGrid(['. H .', 'H N H'])},
  {id: 'methane', tier: 'easy', name: 'methane', formula: 'CH₄', solutions: 1, ...fromGrid(['. H .', 'H C H', '. H .'])},
  {id: 'peroxide', tier: 'easy', name: 'hydrogen peroxide', formula: 'H₂O₂', solutions: 1, ...fromGrid(['H O .', '. O H'])},
  {id: 'chloromethane', tier: 'easy', name: 'chloromethane', formula: 'CH₃Cl', solutions: 1, ...fromGrid(['. H .', 'H C Cl', '. H .'])},
  {id: 'h2s', tier: 'easy', name: 'hydrogen sulfide (the rotten-egg smell)', formula: 'H₂S', solutions: 1, ...fromGrid(['S H', 'H .'])},
  {id: 'methanol', tier: 'easy', name: 'methanol (wood alcohol)', formula: 'CH₃OH', solutions: 1, ...fromGrid(['. H . .', 'H C O H', '. H . .'])},
  {id: 'methylamine', tier: 'easy', name: 'methylamine', formula: 'CH₃NH₂', solutions: 1, ...fromGrid(['. H H .', 'H C N H', '. H . .'])},
  {id: 'chloroform', tier: 'easy', name: 'chloroform', formula: 'CHCl₃', solutions: 1, ...fromGrid(['. Cl .', 'Cl C Cl', '. H .'])},
  {id: 'oxygen', tier: 'medium', name: 'oxygen', formula: 'O₂', solutions: 1, ...fromGrid(['O O'])},
  {id: 'co2', tier: 'medium', name: 'carbon dioxide', formula: 'CO₂', solutions: 1, ...fromGrid(['O C O'])},
  {id: 'hcn', tier: 'medium', name: 'hydrogen cyanide', formula: 'HCN', solutions: 1, ...fromGrid(['H C N'])},
  {id: 'ethyne', tier: 'medium', name: 'ethyne (acetylene)', formula: 'C₂H₂', solutions: 1, ...fromGrid(['H C C H'])},
  {id: 'formaldehyde', tier: 'medium', name: 'formaldehyde', formula: 'CH₂O', solutions: 1, ...fromGrid(['H C O', '. H .'])},
  // The two lower hydrogens could pair off as H₂, but then the rest isn't joined to them.
  {id: 'ethene', tier: 'medium', name: 'ethene (ethylene)', formula: 'C₂H₄', solutions: 1, ...fromGrid(['H C C H', '. H H .'])},
  {id: 'nitrogen', tier: 'medium', name: 'nitrogen (most of the air)', formula: 'N₂', solutions: 1, ...fromGrid(['N N'])},
  {id: 'hydroxylamine', tier: 'medium', name: 'hydroxylamine', formula: 'NH₂OH', solutions: 1, ...fromGrid(['H N O H', '. H . .'])},
  {id: 'hydrazine', tier: 'medium', name: 'hydrazine (a rocket fuel)', formula: 'N₂H₄', solutions: 1, ...fromGrid(['. H H .', 'H N N H'])},
  {id: 'formic', tier: 'medium', name: 'formic acid (in ant stings)', formula: 'HCOOH', solutions: 1, ...fromGrid(['. O .', 'H C O H'])},
  {id: 'ethanol', tier: 'medium', name: 'ethanol', formula: 'C₂H₅OH', solutions: 1, ...fromGrid(['. H H .', 'H C C O H', '. H H .'])},
  {id: 'acetaldehyde', tier: 'medium', name: 'acetaldehyde', formula: 'CH₃CHO', solutions: 1, ...fromGrid(['. H O', 'H C C', '. H H'], {cut: [[[0, 1], [0, 2]]]})},
  {id: 'formamide', tier: 'medium', name: 'formamide', formula: 'HCONH₂', solutions: 1, ...fromGrid(['. O . .', 'H C N H', '. . H .'])},
  {id: 'propyne', tier: 'medium', name: 'propyne', formula: 'CH₃CCH', solutions: 1, ...fromGrid(['. . . H .', 'H C C C H', '. . . H .'])},
  {id: 'cyanogen', tier: 'medium', name: 'cyanogen', formula: 'NCCN', solutions: 1, ...fromGrid(['N C C N'])},
  {id: 'acrylonitrile', tier: 'hard', name: 'acrylonitrile', formula: 'C₃H₃N', solutions: 1, ...fromGrid(['H C C C N', '. H H . .'])},
  {id: 'acetic', tier: 'hard', name: 'acetic acid (in vinegar)', formula: 'CH₃COOH', solutions: 1, ...fromGrid(['. H O .', 'H C C O H', '. H . .'], {cut: [[[0, 1], [0, 2]]]})},
  {id: 'urea', tier: 'hard', name: 'urea', formula: 'CO(NH₂)₂', solutions: 1, ...fromGrid(['. . O . .', 'H N C N H', '. H . H .'])},
  {id: 'glycine', tier: 'hard', name: 'glycine (an amino acid)', formula: 'NH₂CH₂COOH', solutions: 1, ...fromGrid(['. H H O . .', 'H N C C O H', '. . H . . .'], {cut: [[[0, 2], [0, 3]]]})},
  {id: 'acetone', tier: 'hard', name: 'acetone (in nail polish remover)', formula: '(CH₃)₂CO', solutions: 1, ...fromGrid(['. H O H .', 'H C C C H', '. H . H .'], {cut: [[[0, 1], [0, 2]], [[0, 2], [0, 3]]]})},
  {id: 'glycol', tier: 'hard', name: 'ethylene glycol (in antifreeze)', formula: 'HOCH₂CH₂OH', solutions: 1, ...fromGrid(['. . H H . .', 'H O C C O H', '. . H H . .'])},
  {id: 'methyl-formate', tier: 'hard', name: 'methyl formate', formula: 'HCOOCH₃', solutions: 1, ...fromGrid(['. O . H .', 'H C O C H', '. . . H .'])},
  {id: 'oxalic', tier: 'hard', name: 'oxalic acid (in rhubarb leaves)', formula: '(COOH)₂', solutions: 1, ...fromGrid(['. . O O . .', 'H O C C O H'], {cut: [[[0, 2], [0, 3]]]})},
  {id: 'acrylic', tier: 'hard', name: 'acrylic acid', formula: 'CH₂CHCOOH', solutions: 1, ...fromGrid(['. H . O .', 'H C C C O H', '. . H . . .'])},
  {id: 'lactic', tier: 'hard', name: 'lactic acid (in sour milk)', formula: 'CH₃CH(OH)COOH', solutions: 1,
    ...fromGrid(['. H H O . .', 'H C C C O H', '. H O . . .', '. . H . . .'], {cut: [[[0, 1], [0, 2]], [[0, 2], [0, 3]]]})},
  {id: 'alanine', tier: 'hard', name: 'alanine (an amino acid)', formula: 'CH₃CH(NH₂)COOH', solutions: 1,
    ...fromGrid(['. H H O . .', 'H C C C O H', '. H N H . .', '. . H . . .'], {cut: [[[0, 1], [0, 2]], [[0, 2], [0, 3]], [[2, 1], [2, 2]], [[1, 3], [2, 3]]]})},
  // A benzene ring with one CH swapped for N: it too has two ring patterns.
  {id: 'pyridine', tier: 'hard', name: 'pyridine (benzene with a nitrogen in the ring)', formula: 'C₅H₅N', solutions: 2, findAll: true, ...sixRing(['N', 'C', 'C', 'C', 'C', 'C'])},
  // Both Kekulé structures: the board is solved when both have been found.
  {id: 'benzene', tier: 'hard', name: 'benzene', formula: 'C₆H₆', solutions: 2, findAll: true, ...sixRing()},
  // Rings joined edge to edge: find every pattern of double bonds.
  {id: 'naphthalene', tier: 'hard', name: 'naphthalene (mothballs)', formula: 'C₁₀H₈', solutions: 3, findAll: true, ...fusedRings([[0, 0], [1, 0]])},
  {id: 'anthracene', tier: 'hard', name: 'anthracene', formula: 'C₁₄H₁₀', solutions: 4, findAll: true, ...fusedRings([[0, 0], [1, 0], [2, 0]])},
  {id: 'phenanthrene', tier: 'hard', name: 'phenanthrene', formula: 'C₁₄H₁₀', solutions: 5, findAll: true, ...fusedRings([[0, 0], [1, 0], [1, 1]])},
  {id: 'pyrene', tier: 'hard', name: 'pyrene', formula: 'C₁₆H₁₀', solutions: 6, findAll: true, ...fusedRings([[0, 0], [1, 0], [0, 1], [1, 1]])},
];
