import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/gears-levels.js';
import {gears} from '../dist/families/gears.js';
import * as G from '../dist/phys/gears.js';

const placedOf = (level, list) => { const p = level.pegs.map(() => 0); for (const [i, r] of list) p[i] = r; return p; };
// A placement a child could make: free pegs only, within the tray, no overlaps.
function legal(level, placed) {
  const left = G.trayLeft(level, placed), sizes = G.sizesOf(level, placed);
  if (Object.values(left).some(n => n < 0)) return false;
  return placed.every((r, i) => !r || (!G.isFixedPeg(level, i) && G.blockers(level, sizes, i, r).length === 0));
}

test('the family has 10 to 14 levels over three tiers, with stable distinct ids', () => {
  assert.ok(levels.length >= 10 && levels.length <= 14);
  assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
  const tiers = levels.map(l => l.tier);
  assert.deepEqual([...new Set(tiers)], ['easy', 'medium', 'hard']);
  assert.equal(gears.levels, levels);
  assert.equal(gears.shelf, 'physics');
  for (const k of ['science', 'maths', 'caution', 'kitchen']) assert.ok(gears.notes[k].length > 80, k);
  assert.ok(gears.howTo.length >= 2 && gears.howTo.length <= 4);
});

test('every stored witness is a legal placement that solves its level', () => {
  for (const l of levels) {
    const p = placedOf(l, l.solution);
    assert.ok(legal(l, p), l.id);
    assert.ok(G.solvedBy(l, p), l.id);
  }
});

test('solution counts are as recorded, every level has one smallest answer, and Hard ones have just one placement', () => {
  for (const l of levels) {
    const sols = G.solveAll(l);
    assert.equal(sols.length, l.count, l.id);
    const mins = G.minimalSolutions(l, sols);
    assert.equal(mins.length, 1, `${l.id}: one solution with nothing spare`);
    assert.deepEqual(mins[0], placedOf(l, l.solution), `${l.id}: the witness is that one`);
    if (l.tier === 'hard') assert.equal(sols.length, 1, l.id);
    else assert.ok(sols.length <= 3, l.id);
  }
});

test('each tier asks for more: gears in the answer grow, and Hard boards have two outputs', () => {
  const n = l => l.solution.length;
  for (const l of levels.filter(l => l.tier === 'easy')) assert.ok(n(l) <= 2 && l.outputs.length === 1, l.id);
  for (const l of levels.filter(l => l.tier === 'medium')) assert.ok(n(l) >= 3 && l.outputs.length === 1, l.id);
  for (const l of levels.filter(l => l.tier === 'hard')) assert.ok(n(l) >= 4 && l.outputs.length === 2, l.id);
});

test('every decoy is a legal placement that fails the way the level says', () => {
  for (const l of levels) {
    assert.ok(l.decoys.length >= 1, l.id);
    for (const d of l.decoys) {
      const p = placedOf(l, d.placed), ev = G.evaluate(l, G.sizesOf(l, p));
      assert.ok(legal(l, p), `${l.id} decoy legal`);
      assert.equal(ev.solved, false, l.id);
      if (d.shows === 'jam') assert.ok(ev.jammed, `${l.id}: jams`);
      else if (d.shows === 'wrong-way') assert.ok(!ev.jammed && ev.outputs.some(o => o.turning && !o.dirOk), `${l.id}: wrong way`);
      else if (d.shows === 'wrong-speed') assert.ok(!ev.jammed && ev.outputs.some(o => o.dirOk && !o.speedOk), `${l.id}: wrong speed`);
      else if (d.shows === 'blocked') {
        const sizes = G.sizesOf(l, p);
        for (const o of l.outputs) for (const r of G.SIZES) assert.ok(G.blockers(l, sizes, o.peg, r).length > 0, `${l.id}: no room at the output`);
      } else assert.fail(`unknown decoy ${d.shows}`);
    }
  }
});

test('the jam decoys are rings of three meshing gears', () => {
  for (const l of levels) for (const d of l.decoys.filter(d => d.shows === 'jam')) {
    const p = placedOf(l, d.placed), sizes = G.sizesOf(l, p), {adj} = G.evaluate(l, sizes);
    const tri = adj.some((ns, a) => ns.some(b => ns.some(c => c !== b && adj[b].includes(c))));
    assert.ok(tri, `${l.id}: a triangle`);
  }
});

test('boards are sound: every free peg can take a gear, outputs have whole sizes from the tray', () => {
  for (const l of levels) {
    const sizes = G.sizesOf(l, null);
    for (const i of G.freePegs(l)) assert.ok(G.SIZES.some(r => l.tray[r] && !G.blockers(l, sizes, i, r).length), `${l.id} peg ${i}`);
    for (const o of l.outputs) {
      const fixed = (l.fixed || []).find(g => g.peg === o.peg);
      const r = fixed ? fixed.r : (l.crank.r * o.speed[1]) / o.speed[0];
      assert.ok(Number.isInteger(r) && (fixed || l.tray[r] > 0), `${l.id}: output size ${r}`);
      assert.ok(['n', 's', 'e', 'w'].includes(o.side), l.id);
    }
    for (let i = 0; i < l.pegs.length; i++) for (let j = i + 1; j < l.pegs.length; j++)
      assert.ok((l.pegs[i][0] - l.pegs[j][0]) ** 2 + (l.pegs[i][1] - l.pegs[j][1]) ** 2 >= 4, `${l.id}: pegs ${i}, ${j} not crowded`);
  }
});

test('following hints from an empty board, or from every decoy, reaches a solution', () => {
  for (const l of levels) for (const start of [[], ...l.decoys.map(d => d.placed)]) {
    let p = placedOf(l, start);
    const sols = G.solveAll(l);
    for (let step = 0; step < 20 && !G.solvedBy(l, p); step++) {
      const m = G.hintMove(l, p, sols);
      assert.ok(m, l.id);
      p = p.slice(); p[m.peg] = m.kind === 'place' ? m.r : 0;
      assert.ok(legal(l, p), `${l.id}: hinted move is legal`);
    }
    assert.ok(G.solvedBy(l, p), `${l.id} from ${JSON.stringify(start)}`);
  }
});

test('gear physics: meshing, idlers, ratios and jams', () => {
  const base = (pegs, r, outputs = []) => ({pegs, crank: {peg: 0, r}, fixed: [], tray: {}, outputs});
  // Crank 16 teeth driving 8 directly: the other way, twice as fast.
  let L = base([[0, 0], [3, 0]], 2), ev = G.evaluate(L, [2, 1]);
  assert.deepEqual(ev.speed[1], [-2, 1]);
  // An idler of any size: same way as the crank, the speed set by the last gear.
  for (const idler of [[[3, 0], 1], [[4, 0], 2], [[5, 0], 3]]) {
    const [pos, r] = idler, end = [pos[0] + r + 1, 0];
    L = base([[0, 0], pos, end], 2); ev = G.evaluate(L, [2, r, 1]);
    assert.deepEqual(ev.speed[2], [2, 1], `idler ${r}`);
  }
  // Too close: overlap; too far: apart.
  assert.equal(G.relation([0, 0], [3, 0], 2, 2), 'overlap');
  assert.equal(G.relation([0, 0], [5, 0], 2, 2), 'apart');
  assert.equal(G.relation([0, 0], [3, 4], 2, 3), 'mesh');
  // A 3-4-5 triangle with radii 2, 1, 3: all three mesh, and nothing turns.
  L = base([[0, 0], [3, 0], [3, 4]], 2); ev = G.evaluate(L, [2, 1, 3]);
  assert.ok(ev.jammed);
  assert.ok(ev.speed.every(v => v[0] === 0));
  // A ring of four turns freely.
  L = base([[0, 0], [4, 0], [4, 4], [0, 4]], 2); ev = G.evaluate(L, [2, 2, 2, 2]);
  assert.equal(ev.jammed, false);
  assert.deepEqual(ev.speed, [[1, 1], [-1, 1], [1, 1], [-1, 1]]);
  // A gear off on its own stands still.
  L = base([[0, 0], [9, 0]], 2); ev = G.evaluate(L, [2, 1]);
  assert.equal(ev.speed[1], null);
  assert.deepEqual(['×2', '×½', '×⅓', '×1½', '×3'], [[2, 1], [1, 2], [1, 3], [3, 2], [3, 1]].map(G.speedLabel));
});
