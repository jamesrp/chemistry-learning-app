import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/swap-levels.js';
import {solveAll, isSolved, products, wants, isMetal, fromGrid, chargeText} from '../dist/chem/swap.js';

const want = {
  nacl: 'NaCl', mgo: 'MgO', mgcl2: 'MgCl₂', na2o: 'Na₂O', alcl3: 'AlCl₃', li3n: 'Li₃N', al2o3: 'Al₂O₃', mg3n2: 'Mg₃N₂',
  calcium: 'CaCl₂ + Ca₃N₂', 'lithium-calcium': 'LiCl + CaCl₂', oxides: 'Al₂O₃ + Na₂O', alumina: 'Al₂O₃',
  'three-salts': 'CaCl₂ + LiCl + Li₃N', magnesium: 'Mg₃N₂ + MgCl₂ + NaCl',
};

test('every board has exactly one way, and it makes the named compounds', () => {
  for (const l of levels) {
    const sols = solveAll(l, 5);
    assert.equal(sols.length, 1, l.id);
    assert.ok(isSolved(l, sols[0]), l.id);
    assert.equal(products(l, sols[0]).map(p => p.formula).join(' + '), want[l.id], l.id);
  }
});

test('electrons given equal electrons taken, and every atom has a line', () => {
  for (const l of levels) {
    const give = l.atoms.filter(([e]) => isMetal(e)).reduce((n, [e]) => n + wants(e), 0);
    const take = l.atoms.filter(([e]) => !isMetal(e)).reduce((n, [e]) => n + wants(e), 0);
    assert.equal(give, take, l.id);
    assert.equal(new Set(l.links.flat()).size, l.atoms.length, l.id);
    for (const [a, b] of l.links) assert.ok(isMetal(l.atoms[a][0]) && !isMetal(l.atoms[b][0]), `${l.id}: metal first`);
  }
});

test('outer shells: metals give 1 to 3, non-metals take 1 to 3', () => {
  assert.deepEqual(['Na', 'Mg', 'Al', 'Li', 'K', 'Ca'].map(wants), [1, 2, 3, 1, 1, 2]);
  assert.deepEqual(['Cl', 'O', 'N', 'F', 'S'].map(wants), [1, 2, 3, 1, 2]);
  assert.equal(chargeText('Al', 3), '3+');
  assert.equal(chargeText('Cl', 1), '−');
});

test('names: the compounds come out with their real names', () => {
  const b = fromGrid(['O Al O Al O']);
  assert.deepEqual(products(b, solveAll(b)[0]), [{formula: 'Al₂O₃', name: 'aluminum oxide'}]);
  const m = fromGrid(['Mg N Mg N Mg']);
  assert.equal(products(m, solveAll(m)[0])[0].name, 'magnesium nitride');
});

test('levels are well formed', () => {
  const ids = new Set();
  for (const l of levels) { assert.ok(!ids.has(l.id)); ids.add(l.id); }
  const order = levels.map(l => ['easy', 'medium', 'hard'].indexOf(l.tier));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});
