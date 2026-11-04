// Valence bridges boards, Easy to Hard. Each is checked in tests/bridges.test.mjs:
// `solutions` is the number of distinct Lewis structures the board allows.
import {fromGrid} from '../chem/bridges.js';

function benzene() {
  const atoms = [], edges = [];
  for (let k = 0; k < 6; k++) {
    const t = Math.PI / 2 + k * Math.PI / 3;
    atoms.push(['C', +(26 * Math.cos(t)).toFixed(2), +(26 * Math.sin(t)).toFixed(2)]);
  }
  for (let k = 0; k < 6; k++) {
    const t = Math.PI / 2 + k * Math.PI / 3;
    atoms.push(['H', +(48 * Math.cos(t)).toFixed(2), +(48 * Math.sin(t)).toFixed(2)]);
  }
  for (let k = 0; k < 6; k++) { edges.push([k, (k + 1) % 6]); edges.push([k, k + 6]); }
  return {atoms, edges};
}

export const BRIDGE_LEVELS = [
  {id: 'water', tier: 'easy', name: 'water', formula: 'H₂O', solutions: 1, ...fromGrid(['O H', 'H .'])},
  {id: 'ammonia', tier: 'easy', name: 'ammonia', formula: 'NH₃', solutions: 1, ...fromGrid(['. H .', 'H N H'])},
  {id: 'methane', tier: 'easy', name: 'methane', formula: 'CH₄', solutions: 1, ...fromGrid(['. H .', 'H C H', '. H .'])},
  {id: 'peroxide', tier: 'easy', name: 'hydrogen peroxide', formula: 'H₂O₂', solutions: 1, ...fromGrid(['H O .', '. O H'])},
  {id: 'oxygen', tier: 'medium', name: 'oxygen', formula: 'O₂', solutions: 1, ...fromGrid(['O O'])},
  {id: 'co2', tier: 'medium', name: 'carbon dioxide', formula: 'CO₂', solutions: 1, ...fromGrid(['O C O'])},
  {id: 'hcn', tier: 'medium', name: 'hydrogen cyanide', formula: 'HCN', solutions: 1, ...fromGrid(['H C N'])},
  {id: 'ethyne', tier: 'medium', name: 'ethyne (acetylene)', formula: 'C₂H₂', solutions: 1, ...fromGrid(['H C C H'])},
  {id: 'formaldehyde', tier: 'medium', name: 'formaldehyde', formula: 'CH₂O', solutions: 1, ...fromGrid(['H C O', '. H .'])},
  // The two lower hydrogens could pair off as H₂, but then the rest isn't joined to them.
  {id: 'ethene', tier: 'medium', name: 'ethene (ethylene)', formula: 'C₂H₄', solutions: 1, ...fromGrid(['H C C H', '. H H .'])},
  {id: 'acrylonitrile', tier: 'hard', name: 'acrylonitrile', formula: 'C₃H₃N', solutions: 1, ...fromGrid(['H C C C N', '. H H . .'])},
  {id: 'acetic', tier: 'hard', name: 'acetic acid (in vinegar)', formula: 'CH₃COOH', solutions: 1, ...fromGrid(['. H O .', 'H C C O H', '. H . .'], {cut: [[[0, 1], [0, 2]]]})},
  {id: 'urea', tier: 'hard', name: 'urea', formula: 'CO(NH₂)₂', solutions: 1, ...fromGrid(['. . O . .', 'H N C N H', '. H . H .'])},
  {id: 'glycine', tier: 'hard', name: 'glycine (an amino acid)', formula: 'NH₂CH₂COOH', solutions: 1, ...fromGrid(['. H H O . .', 'H N C C O H', '. . H . . .'], {cut: [[[0, 2], [0, 3]]]})},
  // Both Kekulé structures: the board is solved when both have been found.
  {id: 'benzene', tier: 'hard', name: 'benzene', formula: 'C₆H₆', solutions: 2, findAll: true, ...benzene()},
];
