import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/quark-levels.js';
import {identify, answers, allBuilds, chartPos, CHARGE3} from '../dist/phys/quarks.js';

const make = (qs, ups = [...qs].map(() => true)) => identify([...qs].map((q, i) => ({q, up: !!ups[i]})));

test('each level: find is the number of different particles the tray can make for the goal', () => {
  for (const l of levels) {
    assert.equal(answers(l).length, l.find, l.id);
    for (const q of Object.keys(l.tray)) assert.ok(l.tray[q] > 0 && 'udsUDS'.includes(q), l.id);
  }
  assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
  assert.deepEqual([...new Set(levels.map(l => l.tier))], ['easy', 'medium', 'hard']);
});

test('the quark model: charges, spins and names', () => {
  const p = make('uud', [1, 1, 0]).particle;
  assert.deepEqual([p.name, p.charge, p.spin], ['proton', 1, 1]);
  assert.equal(make('udd', [1, 0, 1]).particle.name, 'neutron');
  assert.equal(make('uud').particle.name, 'Delta-plus');
  assert.equal(make('sss').particle.name, 'Omega-minus');
  assert.equal(make('sss').particle.charge, -1);
  assert.equal(make('uD', [1, 0]).particle.name, 'pion-plus');
  assert.equal(make('uD').particle.name, 'rho-plus');
  assert.equal(make('sS', [0, 1]).particle.name, 'eta');
  assert.equal(make('UUD', [1, 0, 1]).particle.name, 'antiproton');
  assert.equal(make('UUD', [1, 0, 1]).particle.charge, -1);
});

test('only colourless groups hold together, and identical quarks spin together', () => {
  assert.equal(make('uu').ok, false);
  assert.equal(make('UD').ok, false);
  assert.equal(make('uuD').ok, false);
  assert.equal(make('u').ok, false);
  assert.equal(make('uuu', [1, 1, 0]).ok, false);
  assert.match(make('ddd', [0, 1, 1]).why, /same way/);
  assert.equal(make('ddd', [0, 0, 0]).particle.spin, 3);
});

test('every real particle has a whole-number charge', () => {
  for (const {build, result} of allBuilds({u: 3, d: 3, s: 3, U: 2, D: 2, S: 2})) {
    if (!result.ok) continue;
    assert.equal(Math.abs(build.reduce((a, b) => a + CHARGE3[b.q], 0) % 3), 0);
    assert.equal(Number.isInteger(result.particle.charge), true);
  }
});

test('the decuplet is a triangle on the chart, with the Omega-minus at the bottom', () => {
  const dec = answers(levels.find(l => l.id === 'decuplet')).map(a => a.particle);
  const rows = [0, 1, 2, 3].map(y => dec.filter(p => chartPos(p).y === y).length);
  assert.deepEqual(rows, [4, 3, 2, 1]);
  assert.equal(dec.find(p => chartPos(p).y === 3).name, 'Omega-minus');
  const oct = answers(levels.find(l => l.id === 'octet')).map(a => a.particle.sym).sort();
  assert.deepEqual(oct, ['n', 'p', 'Ξ⁰', 'Ξ⁻', 'Λ⁰', 'Σ⁺', 'Σ⁻'].sort());
});
