import test from 'node:test';
import assert from 'node:assert/strict';
import {ISOMER_LEVELS} from '../dist/data/isomer-levels.js';
import {enumerate, canonical, parseMol, checkBuild, hydrogenCount} from '../dist/chem/isomers.js';
import {triLattice} from '../dist/chem/lattice.js';

// The board the app shows for a bag (dist/families/isomers.js).
const boardFor = level => triLattice(Object.values(level.heavy).reduce((a, b) => a + b, 0) > 5 ? 5 : 4, 4, 30);

test('each bag names every molecule it can make, once', () => {
  for (const level of ISOMER_LEVELS) {
    const all = new Set(enumerate(level).map(canonical));
    const known = level.known.map(([, t]) => canonical(parseMol(t)));
    assert.equal(new Set(known).size, known.length, `${level.id}: no name twice`);
    assert.deepEqual([...known].sort(), [...all].sort(), level.id);
    for (const [name, t] of level.known) assert.ok(checkBuild(parseMol(t), level).ok, `${level.id}: ${name}`);
  }
});

test('known isomer counts', () => {
  const count = (heavy, H) => enumerate({heavy, H}).length;
  assert.equal(count({C: 4}, 10), 2);
  assert.equal(count({C: 5}, 12), 3);
  assert.equal(count({C: 6}, 14), 5);
  assert.equal(count({C: 7}, 16), 9);
  assert.equal(count({C: 2, O: 1}, 6), 2);
  assert.equal(count({C: 3, O: 1}, 8), 3);
  assert.equal(count({C: 4}, 8), 5);
});

test('a molecule drawn with its atoms in another order is the same molecule', () => {
  const rand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (const level of ISOMER_LEVELS) for (const [, t] of level.known) {
    const mol = parseMol(t), n = mol.els.length;
    for (let k = 0; k < 5; k++) {
      const p = [...Array(n).keys()].sort(() => rand() - 0.5);
      const moved = {els: p.map(i => mol.els[i]), bonds: mol.bonds.map(([i, j, o]) => [p.indexOf(i), p.indexOf(j), o])};
      assert.equal(canonical(moved), canonical(mol));
    }
  }
});

test('hydrogens fill spare bonds, and a wrong build is refused', () => {
  assert.equal(hydrogenCount(parseMol('CCO 0-1 1-2')), 6);
  const bag = ISOMER_LEVELS.find(l => l.id === 'c2h6o');
  assert.equal(checkBuild(parseMol('CCO 0=1 1-2'), bag).ok, false, 'too few hydrogens');
  assert.equal(checkBuild(parseMol('CCO 0-1'), bag).ok, false, 'not joined');
  assert.equal(checkBuild(parseMol('CO 0-1'), bag).ok, false, 'an atom left in the bag');
});

// Can this molecule be laid on the lattice with every bond between neighbours?
function embeds(mol, lattice) {
  const n = mol.els.length, P = lattice.points.length, adj = lattice.points.map(() => new Set());
  for (const [a, b] of lattice.edges) { adj[a].add(b); adj[b].add(a); }
  const nbrs = mol.els.map(() => []);
  for (const [i, j] of mol.bonds) { nbrs[i].push(j); nbrs[j].push(i); }
  const at = new Array(n).fill(-1), used = new Set();
  const go = i => {
    if (i === n) return true;
    for (let p = 0; p < P; p++) {
      if (used.has(p)) continue;
      if (nbrs[i].some(j => j < i && !adj[p].has(at[j]))) continue;
      at[i] = p; used.add(p);
      if (go(i + 1)) return true;
      used.delete(p); at[i] = -1;
    }
    return false;
  };
  return go(0);
}

test('every molecule fits on its board', () => {
  for (const level of ISOMER_LEVELS) for (const [name, t] of level.known) assert.ok(embeds(parseMol(t), boardFor(level)), `${level.id}: ${name}`);
});

test('different molecules get different keys', () => {
  const keys = ['CO 0-1', 'CN 0-1', 'CC 0-1', 'CC 0=1', 'CCO 0-1 1-2', 'COC 0-1 1-2', 'CCC 0-1 1-2 2-0', 'CCC 0=1 1-2', 'CCCC 0-1 1-2 2-3 3-0', 'CCCC 0-1 1-2 2-0 0-3']
    .map(t => canonical(parseMol(t)));
  assert.equal(new Set(keys).size, keys.length);
});
