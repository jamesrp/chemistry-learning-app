import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/cell-levels.js';
import {SPOTS, SETS, tally, sumText, isSolved, solveAll, setOf} from '../dist/chem/cells.js';

test('27 spots: 8 corners, 12 edges, 6 faces, 1 centre, each set worth one atom', () => {
  assert.equal(SPOTS.length, 27);
  for (const st of SETS) assert.equal(SPOTS.filter(p => p.set === st.id).length, st.size, st.id);
  assert.equal(setOf([0, 2, 0]), 'C');
  assert.equal(setOf([1, 0, 2]), 'Ex');
  assert.equal(setOf([1, 1, 0]), 'Fz');
  assert.equal(setOf([1, 1, 1]), 'Z');
  // Opposite faces share a set; the 4 parallel edges share a set.
  assert.deepEqual(SPOTS.filter(p => p.set === 'Fz').map(p => p.z), [0, 2]);
  assert.deepEqual(SPOTS.filter(p => p.set === 'Ex').map(p => p.x), [1, 1, 1, 1]);
});

test('the classic counts: simple cubic 1, body-centred 2, face-centred 4, salt 4 + 4', () => {
  assert.equal(tally({C: 'Po'}).atoms.Po, 1);
  assert.equal(tally({C: 'Fe', Z: 'Fe'}).atoms.Fe, 2);
  const fcc = tally({C: 'Cu', Fx: 'Cu', Fy: 'Cu', Fz: 'Cu'});
  assert.equal(fcc.atoms.Cu, 4); assert.equal(fcc.balls.Cu, 14);
  assert.equal(sumText(fcc.parts.Cu, fcc.atoms.Cu), '6 × ½ + 8 × ⅛ = 4');
  const salt = tally({C: 'Na', Fx: 'Na', Fy: 'Na', Fz: 'Na', Ex: 'Cl', Ey: 'Cl', Ez: 'Cl', Z: 'Cl'});
  assert.deepEqual(salt.atoms, {Na: 4, Cl: 4});
  assert.equal(salt.balls.Na + salt.balls.Cl, 27);
});

test('every level has exactly one answer, the stored one', () => {
  for (const l of levels) {
    const sols = solveAll(l);
    assert.equal(sols.length, 1, l.id);
    assert.deepEqual(sols[0], l.answer, l.id);
    assert.ok(isSolved(l, l.answer), l.id);
    assert.equal(isSolved(l, l.given || {}), false, `${l.id} doesn't start solved`);
  }
});

test('salt is a 3D checkerboard: no sodium next to a sodium along a line', () => {
  const l = levels.find(x => x.id === 'nacl'), at = new Map(SPOTS.map(p => [`${p.x},${p.y},${p.z}`, l.answer[p.set]]));
  for (const p of SPOTS) for (const [dx, dy, dz] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
    const q = at.get(`${p.x + dx},${p.y + dy},${p.z + dz}`);
    if (q) assert.notEqual(q, at.get(`${p.x},${p.y},${p.z}`));
  }
});

test('without the salt rule, table salt’s tray has 4 answers', () => {
  const l = levels.find(x => x.id === 'nacl');
  assert.equal(solveAll({...l, apart: false}).length, 4);
});

test('levels are well formed', () => {
  const ids = new Set();
  for (const l of levels) {
    assert.ok(!ids.has(l.id), l.id); ids.add(l.id);
    assert.ok(l.title && l.detail);
  }
  const order = levels.map(l => ['easy', 'medium', 'hard'].indexOf(l.tier));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});
