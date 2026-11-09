import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/cell-levels.js';
import {SPOTS, CLASSES, tally, sumText, isSolved, solveAll, classOf, shifted, sameFill, clashes} from '../dist/chem/cells.js';

test('27 spots in 4 classes: corners, edges, faces and the middle each hold whole atoms', () => {
  assert.equal(SPOTS.length, 27);
  for (const c of CLASSES) {
    assert.equal(SPOTS.filter(p => p.cls === c.id).length, c.size, c.id);
    // Shared by 8, 4, 2 or 1 cubes: the shares add to whole atoms.
    assert.equal(c.size / {C: 8, E: 4, F: 2, Z: 1}[c.id], c.atoms, c.id);
  }
  assert.equal(classOf([0, 2, 0]), 'C');
  assert.equal(classOf([1, 0, 2]), 'E');
  assert.equal(classOf([1, 1, 0]), 'F');
  assert.equal(classOf([1, 1, 1]), 'Z');
});

test('the classic counts: simple cubic 1, body-centred 2, face-centred 4, salt 4 + 4', () => {
  assert.equal(tally({C: 'Po'}).atoms.Po, 1);
  assert.equal(tally({Z: 'Po'}).atoms.Po, 1);
  assert.equal(tally({C: 'Fe', Z: 'Fe'}).atoms.Fe, 2);
  const fcc = tally({C: 'Cu', F: 'Cu'});
  assert.equal(fcc.atoms.Cu, 4);
  assert.equal(sumText(fcc.parts.Cu, fcc.atoms.Cu), '6 × ½ + 8 × ⅛ = 4');
  assert.equal(sumText(tally({C: 'Na', Z: 'Na'}).parts.Na, 2), '1 + 8 × ⅛ = 2');
  assert.deepEqual(tally({C: 'Na', F: 'Na', E: 'Cl', Z: 'Cl'}).atoms, {Na: 4, Cl: 4});
});

test('side by side: corners touch edges, edges touch faces, faces touch the middle', () => {
  const pairs = [['C', 'E'], ['E', 'F'], ['F', 'Z']];
  for (const a of 'CEFZ') for (const b of 'CEFZ') {
    if (a === b) continue;
    const touch = pairs.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
    assert.equal(clashes({rule: 'metal'}, {[a]: 'X', [b]: 'Y'}).size > 0, touch, `${a}${b}`);
    // On salt boards only the same ion clashes.
    assert.equal(clashes({rule: 'salt'}, {[a]: 'X', [b]: 'Y'}).size, 0);
    assert.equal(clashes({rule: 'salt'}, {[a]: 'X', [b]: 'X'}).size > 0, touch, `${a}${b} salt`);
  }
});

test('every board accepts only its crystal, or its crystal shifted by half a cube', () => {
  for (const l of levels) {
    const sols = solveAll(l), given = l.given || {};
    assert.ok(sols.some(x => sameFill(x, l.answer)), `${l.id}: the answer is accepted`);
    for (const x of sols) assert.ok(sameFill(x, l.answer) || sameFill(x, shifted(l.answer)), `${l.id}: ${JSON.stringify(x)}`);
    // A given pins the shift; without one, both drawings are accepted (sodium's is its own shift).
    const expect = Object.keys(given).length || sameFill(l.answer, shifted(l.answer)) ? 1 : 2;
    assert.equal(sols.length, expect, l.id);
    for (const [c, el] of Object.entries(given)) assert.equal(l.answer[c], el, `${l.id}: answer keeps the given`);
    assert.equal(isSolved(l, given), false, `${l.id} doesn't start solved`);
  }
});

test('polonium on the corners and polonium in the middle are both right', () => {
  const l = levels.find(x => x.id === 'polonium');
  assert.ok(isSolved(l, {C: 'Po'}));
  assert.ok(isSolved(l, {Z: 'Po'}));
});

test('the rule is what makes the count enough', () => {
  // Copper: corners and edges also make 4, but those atoms sit side by side.
  const cu = levels.find(x => x.id === 'copper');
  assert.equal(tally({C: 'Cu', E: 'Cu'}).atoms.Cu, 4);
  assert.equal(isSolved(cu, {C: 'Cu', E: 'Cu'}), false);
  // Gold drawn from the middle: faces would touch it, so the others go on the edges.
  const au = levels.find(x => x.id === 'gold');
  assert.equal(isSolved(au, {Z: 'Au', F: 'Au'}), false);
  assert.ok(isSolved(au, {Z: 'Au', E: 'Au'}));
  // Cu₃Au: copper on the edges would touch the gold corners.
  const cu3au = levels.find(x => x.id === 'cu3au');
  assert.equal(isSolved(cu3au, {C: 'Au', E: 'Cu'}), false);
});

test('salt is a 3D checkerboard: no sodium next to a sodium along a line', () => {
  const l = levels.find(x => x.id === 'nacl'), at = new Map(SPOTS.map(p => [`${p.x},${p.y},${p.z}`, l.answer[p.cls]]));
  for (const p of SPOTS) for (const [dx, dy, dz] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
    const q = at.get(`${p.x + dx},${p.y + dy},${p.z + dz}`);
    if (q) assert.notEqual(q, at.get(`${p.x},${p.y},${p.z}`));
  }
});

test('levels are well formed', () => {
  const ids = new Set();
  for (const l of levels) {
    assert.ok(!ids.has(l.id), l.id); ids.add(l.id);
    assert.ok(l.title && l.detail);
    assert.ok(['metal', 'salt'].includes(l.rule), l.id);
  }
  const order = levels.map(l => ['easy', 'medium', 'hard'].indexOf(l.tier));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});
