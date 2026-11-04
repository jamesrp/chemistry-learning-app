import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/ice-levels.js';
import {links, solveAll, solved, forcedOnly, counts} from '../dist/chem/ice.js';

const parse = l => [...l.fixed].map(c => (c === '.' ? null : Number(c)));

test('every board has exactly one arrangement, the stored one', () => {
  for (const l of levels) {
    const sols = solveAll(l.rows, l.cols, parse(l), 3);
    assert.equal(sols.length, 1, l.id);
    assert.equal(sols[0].join(''), l.solution, l.id);
    assert.ok(solved(l.rows, l.cols, [...l.solution].map(Number)), l.id);
  }
});

test('edge hydrogens are all given, and givens agree with the solution', () => {
  for (const l of levels) {
    const L = links(l.rows, l.cols), fixed = parse(l);
    L.forEach((link, i) => { if (!link.a || !link.b) assert.notEqual(fixed[i], null, `${l.id} link ${i}`); });
    fixed.forEach((v, i) => { if (v !== null) assert.equal(v, Number(l.solution[i])); });
    assert.equal(fixed.length, L.length);
  }
});

test('boards can be finished by forced moves alone', () => {
  for (const l of levels) assert.ok(forcedOnly(l.rows, l.cols, parse(l)), l.id);
});

test('the ice rule: two close hydrogens per oxygen', () => {
  // Every hydrogen close to its right or lower oxygen is ice.
  const all = links(3, 3).map(() => 1);
  assert.ok(solved(3, 3, all));
  assert.deepEqual(counts(3, 3, all).near, new Array(9).fill(2));
  all[links(3, 3).findIndex(l => l.a && l.b)] = 0;
  assert.equal(solved(3, 3, all), false);
});

test('the solver counts the 3 × 3 domain-wall boards: 7, as alternating-sign matrices predict', () => {
  // Domain-wall boundary: hydrogens on the left and right edges point in,
  // on the top and bottom point out.
  const n = 3, L = links(n, n);
  const fixed = L.map(l => (!l.a ? 1 : !l.b ? 0 : null));
  L.forEach((l, i) => {
    if (l.kind === 'v' && !l.a) fixed[i] = 0;
    if (l.kind === 'v' && !l.b) fixed[i] = 1;
  });
  assert.equal(solveAll(n, n, fixed).length, 7);
});
