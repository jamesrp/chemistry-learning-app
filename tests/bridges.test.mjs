import test from 'node:test';
import assert from 'node:assert/strict';
import {BRIDGE_LEVELS} from '../dist/data/bridges-levels.js';
import {solveAll, status, hintMove, edgeCap, legalOrders} from '../dist/chem/bridges.js';

test('every board has exactly the structures it claims', () => {
  for (const level of BRIDGE_LEVELS) {
    const sols = solveAll(level);
    assert.equal(sols.length, level.solutions, level.id);
    for (const s of sols) {
      assert.ok(legalOrders(level, s), level.id);
      assert.ok(status(level, s).solved, level.id);
    }
  }
});

test('ids are unique and tiers run easy, medium, hard', () => {
  assert.equal(new Set(BRIDGE_LEVELS.map(l => l.id)).size, BRIDGE_LEVELS.length);
  const order = BRIDGE_LEVELS.map(l => ['easy', 'medium', 'hard'].indexOf(l.tier));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test('an empty board is not solved, and a full but split board is not solved', () => {
  for (const level of BRIDGE_LEVELS) assert.equal(status(level, level.edges.map(() => 0)).solved, false);
  // Ethene's lower hydrogens can pair off as H₂ with ethyne beside them: every
  // atom full, but two molecules.
  const ethene = BRIDGE_LEVELS.find(l => l.id === 'ethene');
  const split = ethene.edges.map(([u, v]) => {
    const pair = [ethene.atoms[u][0], ethene.atoms[v][0]].sort().join('');
    return pair === 'HH' ? 1 : pair === 'CC' ? 3 : (ethene.atoms[u][2] === 0 && ethene.atoms[v][2] === 0 ? 1 : 0);
  });
  const st = status(ethene, split);
  assert.ok(st.allFull, 'every atom is full');
  assert.equal(st.connected, false);
  assert.equal(st.solved, false);
});

test('following hints from an empty board reaches a solution', () => {
  for (const level of BRIDGE_LEVELS) {
    const sols = solveAll(level), orders = level.edges.map(() => 0);
    for (let step = 0; step < 50 && !status(level, orders).solved; step++) {
      const move = hintMove(orders, sols);
      assert.ok(move, level.id);
      assert.ok(move.order <= edgeCap(level, move.edge));
      orders[move.edge] = move.order;
    }
    assert.ok(status(level, orders).solved, level.id);
  }
});

test('hints prefer a bond every solution agrees on', () => {
  const benzene = BRIDGE_LEVELS.find(l => l.id === 'benzene'), sols = solveAll(benzene);
  const move = hintMove(benzene.edges.map(() => 0), sols);
  assert.ok(sols.every(s => s[move.edge] === move.order), 'the first hint is forced (a C–H bond)');
});

test('the two benzene structures are the two Kekulé rings', () => {
  const benzene = BRIDGE_LEVELS.find(l => l.id === 'benzene');
  const rings = solveAll(benzene).map(s => benzene.edges.map(([u, v], i) => (benzene.atoms[u][0] === 'C' && benzene.atoms[v][0] === 'C' ? s[i] : null)).filter(x => x !== null).join(''));
  assert.deepEqual(rings.sort(), ['121212', '212121']);
});
