// Bulb boards: the circuit solver and every claim made in the level comments.
import test from 'node:test';
import assert from 'node:assert/strict';
import {BULB_LEVELS} from '../dist/data/bulbs-levels.js';
import {layout, evaluate, solveAll, fewest, isSolved, rowsMet, hintMove, bulbsOf, fracText, classOf, frac} from '../dist/phys/bulbs.js';

const same = (p, q) => p[0] === q[0] && p[1] === q[1];
const gapOf = (level, [a, b]) => layout(level).gaps.findIndex(([p, q]) => same(p, a) && same(q, b) || same(p, b) && same(q, a));
const solutionOf = level => level.solution.map(pair => gapOf(level, pair)).sort((x, y) => x - y);
const byId = id => BULB_LEVELS.find(l => l.id === id);
const powers = (level, wires, states) => { const e = evaluate(level, wires, states); return bulbsOf(level).map(b => fracText(e.power.get(b))); };

test('brightness classes', () => {
  assert.equal(classOf(frac(1)), 'bright');
  assert.equal(classOf(frac(1, 4)), 'dim');
  assert.equal(classOf(frac(4, 9)), 'dim');
  assert.equal(classOf(frac(1, 9)), 'faint');
  assert.equal(classOf(frac(0)), 'off');
});

test('every board: the stored solution is the only one at the budget, and the budget is the fewest', () => {
  for (const level of BULB_LEVELS) {
    const sol = solutionOf(level);
    assert.ok(sol.every(g => g >= 0), level.id);
    assert.equal(sol.length, level.budget, level.id);
    assert.ok(isSolved(level, sol), `${level.id} solved by its solution`);
    assert.deepEqual(solveAll(level), [sol], `${level.id} unique`);
    assert.equal(fewest(level), level.budget, `${level.id} fewest`);
  }
});

test('ids are unique and tiers run easy, medium, hard', () => {
  assert.equal(new Set(BULB_LEVELS.map(l => l.id)).size, BULB_LEVELS.length);
  const order = {easy: 0, medium: 1, hard: 2}, tiers = BULB_LEVELS.map(l => order[l.tier]);
  assert.deepEqual(tiers, [...tiers].sort());
});

test('A loop, and In parallel: one wire is not enough, and the middle link shorts the battery', () => {
  const mid = byId('side-by-side');
  assert.equal(evaluate(mid, [...solutionOf(mid), gapOf(mid, [[0, 2], [1, 2]])]).short, true);
  const level = byId('loop');
  for (let g = 0; g < layout(level).gaps.length; g++) assert.equal(isSolved(level, [g]), false);
  const short = [[[0, 0], [0, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]]].map(p => gapOf(level, p));
  assert.equal(evaluate(level, short).short, true);
  assert.deepEqual(rowsMet(level, short), [false]);
});

test('series bulbs get a quarter of the power; parallel bulbs get it all', () => {
  assert.deepEqual(powers(byId('in-a-row'), solutionOf(byId('in-a-row'))), ['1/4', '1/4']);
  assert.deepEqual(powers(byId('side-by-side'), solutionOf(byId('side-by-side'))), ['1', '1']);
  assert.deepEqual(powers(byId('bright-and-dim'), solutionOf(byId('bright-and-dim'))), ['1', '1/4', '1/4']);
});

test('Short circuit: the wire carries the current and the bulb goes out', () => {
  const level = byId('put-it-out');
  assert.deepEqual(powers(level, []), ['1/4', '1/4']);
  assert.deepEqual(powers(level, solutionOf(level)), ['1', '0']);
});

test('Shared current: the two faint bulbs split what comes through the dim one', () => {
  const level = byId('dim-and-faint');
  assert.deepEqual(powers(level, solutionOf(level)), ['1/9', '1/9', '4/9']);
});

test('A balanced bridge: the middle bulb stays dark though both its ends are wired', () => {
  const level = byId('bridge');
  const p = powers(level, solutionOf(level));
  assert.deepEqual(p, ['1/4', '1/4', '0', '1/4', '1/4']);
});

test('switch boards: both, either, and the hallway two-way switches', () => {
  for (const id of ['both', 'either', 'hallway']) {
    const level = byId(id), sol = solutionOf(level);
    assert.deepEqual(rowsMet(level, sol), level.table.map(() => true), id);
  }
  // Hallway: flipping either switch alone always changes the lamp.
  const level = byId('hallway'), sol = solutionOf(level), lamp = 5;
  const glow = st => evaluate(level, sol, st).bright.get(lamp);
  for (const st of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
    assert.notEqual(glow(st), glow([1 - st[0], st[1]]));
    assert.notEqual(glow(st), glow([st[0], 1 - st[1]]));
  }
});

test('hints: lift a stray wire first, then fill toward the solution', () => {
  for (const level of BULB_LEVELS) {
    const sol = solutionOf(level), stray = layout(level).gaps.map((_, g) => g).find(g => !sol.includes(g));
    let wires = [stray];
    assert.notEqual(stray, undefined, `${level.id}: some gap is a wrong choice`);
    for (let k = 0; k < 20 && !isSolved(level, wires); k++) {
      const m = hintMove(wires, [sol]);
      wires = m.lift ? wires.filter(g => g !== m.gap) : [...wires, m.gap];
      if (k === 0) assert.equal(m.lift, true, level.id);
    }
    assert.ok(isSolved(level, wires), level.id);
  }
});
