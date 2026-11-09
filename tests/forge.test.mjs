import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/forge-levels.js';
import {NUCLIDES, nuclide, moves, par, shortestPaths, UNBOUND, landing} from '../dist/phys/nuclides.js';

test('every level: par is the fewest moves, found by searching the chart', () => {
  for (const l of levels) {
    assert.ok(nuclide(l.start) && nuclide(l.target), l.id);
    assert.equal(par(l.start, l.target, l.tray), l.par, l.id);
    assert.ok(l.tray.every(m => ['p', 'n', 'a'].includes(m)), l.id);
  }
  assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
  assert.deepEqual([...new Set(levels.map(l => l.tier))], ['easy', 'medium', 'hard']);
});

test('every decay lands on a nuclide in the table', () => {
  for (const k of NUCLIDES.keys()) for (const m of moves(k, [])) assert.ok(m.to, `${k} ${m.move}`);
});

test('decays change protons and neutrons the textbook way', () => {
  const zn = k => [nuclide(k).Z, nuclide(k).N];
  const after = (k, m) => moves(k, []).find(o => o.move === m).to;
  assert.equal(after('C-14', 'b-'), 'N-14');
  assert.equal(after('N-13', 'b+'), 'C-13');
  assert.equal(after('U-238', 'a-decay'), 'Th-234');
  assert.deepEqual(zn('U-238'), [92, 146]);
  assert.deepEqual(zn('Pb-206'), [82, 124]);
});

test('the gaps at mass 5 and 8: nothing lives at helium-5 or lithium-5, and beryllium-8 only takes helium-4', () => {
  assert.ok(!NUCLIDES.has('He-5') && !NUCLIDES.has('Li-5') && UNBOUND.has('Li-5'));
  assert.equal(landing('He-4', 'p').key, 'Li-5');
  assert.equal(moves('He-4', ['p', 'n']).every(m => m.to === null), true);
  assert.deepEqual(moves('Be-8', ['p', 'n', 'a']).map(m => m.move), ['a', 'a-decay']);
});

test('the decay chains: uranium-238 takes 8 alpha and 6 beta decays to lead-206, by 8 routes', () => {
  const paths = shortestPaths('U-238', 'Pb-206', []);
  assert.equal(paths.length, 8);
  for (const p of paths) {
    let alpha = 0;
    for (let i = 1; i < p.length; i++) if (nuclide(p[i]).A !== nuclide(p[i - 1]).A) alpha++;
    assert.equal(alpha, 8);
    assert.equal(p.length - 1 - alpha, 6);
  }
  assert.equal(shortestPaths('Ca-40', 'Fe-56', ['a']).length, 10);
});
