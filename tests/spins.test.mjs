import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/spin-levels.js';
import {parse, best, redCount, startSpins, hintFlip} from '../dist/chem/spins.js';

test('every board: the stored goal is the fewest red lines, and ways counts the best arrangements', () => {
  for (const l of levels) {
    const b = parse(l), {min, states} = best(b);
    assert.equal(min, l.goal, l.id);
    assert.equal(states.length, l.ways, l.id);
    assert.ok(redCount(b, startSpins(b)) > l.goal, `${l.id} doesn't start solved`);
    assert.ok(b.sites.filter(p => !p.pin).length <= 20, `${l.id} is small enough to check`);
  }
});

test('boards are well formed', () => {
  const ids = new Set();
  for (const l of levels) {
    assert.ok(!ids.has(l.id), l.id); ids.add(l.id);
    assert.ok(['easy', 'medium', 'hard'].includes(l.tier));
    assert.ok(l.title && l.detail, l.id);
    if (l.kind === 'mixed') assert.equal(l.anti.length, parse(l).lines.length, l.id);
    if (l.findAll) assert.ok(l.ways >= 2 && l.ways <= 6, l.id);
  }
  const order = levels.map(l => ['easy', 'medium', 'hard'].indexOf(l.tier));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test('known results: frustration on triangles, walls on a ferromagnet', () => {
  // A triangle of opposite lines: always one red line, 6 ways.
  const tri = best(parse({grid: 'tri', kind: 'a', map: ['uu', 'u ']}));
  assert.equal(tri.min, 1); assert.equal(tri.states.length, 6);
  // A 4 × 4 ferromagnet pinned up on the left and down on the right: a straight wall of 4, in 3 places.
  const wall = best(parse({grid: 'sq', kind: 'f', map: ['UuuD', 'UuuD', 'UuuD', 'UuuD']}));
  assert.equal(wall.min, 4); assert.equal(wall.states.length, 3);
  // An open 4 × 4 antiferromagnet: the two checkerboards.
  const af = best(parse({grid: 'sq', kind: 'a', map: ['uuuu', 'uuuu', 'uuuu', 'uuuu']}));
  assert.equal(af.min, 0); assert.equal(af.states.length, 2);
  // A strip of 8 triangles needs 4 red lines.
  assert.equal(best(parse({grid: 'tri', kind: 'a', map: ['uuuuu', 'uuuu ']})).min, 4);
});

test('the hint flips a free arrow toward a best arrangement', () => {
  for (const l of levels) {
    const b = parse(l), {states} = best(b), spins = startSpins(b);
    const i = hintFlip(b, spins, states);
    assert.ok(i >= 0 && !b.sites[i].pin, l.id);
  }
});
