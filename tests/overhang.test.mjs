import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/overhang-levels.js';
import * as P from '../dist/phys/overhang.js';

// Every standing stack reachable from a start, walked once per start.
const walked = new Map();
const explore = r0 => { const id = r0.join(','); if (!walked.has(id)) walked.set(id, P.explore(r0)); return walked.get(id); };

const play = (level, moves, r = P.start(level)) => {
  for (const [k, dir] of moves) {
    const t = P.tryMove(r, k, dir);
    assert.equal(t.kind, 'ok', `${level.id}: move ${k},${dir} from ${r}`);
    r = t.next;
  }
  return r;
};

test('the exact maxima on the grid of twelfths: 9, 11, 12, 13, 14 for two to six blocks', () => {
  assert.deepEqual([2, 3, 4, 5, 6].map(n => P.maxReach(n).reach), [9, 11, 12, 13, 14]);
  for (let n = 2; n <= 6; n++) assert.ok(P.stands(P.maxReach(n).stack));
  // The top-down search agrees with walking every standing stack (n <= 5).
  for (let n = 2; n <= 5; n++) {
    let best = -Infinity;
    for (const {r} of explore(new Array(n).fill(0)).values()) best = Math.max(best, P.reach(r));
    assert.equal(best, P.maxReach(n).reach, `n = ${n}`);
  }
});

test('the harmonic stack: each block out by L/(2k) over the one below, floored to the grid, is a maximum', () => {
  // Offsets 6, 3, 2, 1 (1.5 floored), 1 (1.2 floored), 1: build from the top down.
  for (let n = 2; n <= 6; n++) {
    const offs = Array.from({length: n}, (_, i) => Math.floor(P.L / (2 * (n - i))));
    const r = [];
    offs.forEach((d, i) => r.push((i ? r[i - 1] : 0) + d));
    assert.ok(P.stands(r), `n = ${n}`);
    assert.equal(P.reach(r), P.maxReach(n).reach, `n = ${n}`);
    // The top block is always exactly at its tipping point.
    assert.ok(P.contacts(r).at(-1).atEdge);
  }
  // Without the grid: 25/24 of a block for four (exact fractions), so four blocks really reach past one length.
  const half = n => Array.from({length: n}, (_, k) => 1 / (2 * (k + 1))).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(half(4) * 24), 25);
  // Half the harmonic number passes 2 at 31 blocks and 3 at 227 (as the notes say).
  const first = target => { let n = 0, s = 0; while (s < target) { n++; s += 1 / (2 * n); } return n; };
  assert.equal(first(2), 31);
  assert.equal(first(3), 227);
});

test('building greedily from the top reaches the maximum; greedily from the bottom stalls at half a block', () => {
  for (let n = 2; n <= 6; n++) {
    let r = new Array(n).fill(0);
    for (let k = n - 1; k >= 0; k--) for (let t; (t = P.tryMove(r, k, 1)).kind === 'ok';) r = t.next;
    assert.equal(P.reach(r), P.maxReach(n).reach, `top-down, n = ${n}`);
    r = new Array(n).fill(0);
    for (let k = 0; k < n; k++) for (let t; (t = P.tryMove(r, k, 1)).kind === 'ok';) r = t.next;
    assert.equal(P.reach(r), 6, `bottom-up, n = ${n}`);
  }
});

test('stability is exact: on the edge stands, one unit past falls, and the falling part is the right one', () => {
  assert.ok(P.stands([0, 6]));
  assert.deepEqual(P.failure([0, 7]), {k: 1, dir: 1, pivot: 0});
  assert.ok(P.stands([6, 6]));
  assert.deepEqual(P.failure([7, 7]), {k: 0, dir: 1, pivot: 0});
  // Hanging off the left end of the block below is falling too.
  assert.deepEqual(P.failure([0, -7]), {k: 1, dir: -1, pivot: -12});
  // A slide carries the blocks above.
  assert.deepEqual(P.moved([0, 1, 2], 1, 1), [0, 2, 3]);
});

test('levels: 10 to 14, every tier present, starts stand, flags not yet reached', () => {
  assert.ok(levels.length >= 10 && levels.length <= 14);
  for (const tier of ['easy', 'medium', 'hard']) assert.ok(levels.some(l => l.tier === tier), tier);
  assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
  for (const l of levels) {
    const r = P.start(l);
    assert.ok(P.stands(r) && P.inBounds(r), l.id);
    assert.equal(P.isWon(l, r), false, l.id);
    assert.ok(l.flag <= l.best, l.id);
  }
});

test('every witness is a sequence of standing single moves that reaches the flag, and is shortest', () => {
  for (const l of levels) {
    const end = play(l, l.witness);
    assert.ok(P.isWon(l, end), l.id);
    const moves = P.solveFrom(l, P.start(l), P.winners(l), 1e6);
    assert.equal(moves.length, l.witness.length, l.id);
    if (l.n <= 5) {
      // Breadth-first over every standing stack agrees on the shortest count and on the winners.
      const all = explore(P.start(l));
      const won = [...all.values()].filter(v => P.isWon(l, v.r));
      assert.equal(Math.min(...won.map(v => v.d)), l.witness.length, l.id);
      assert.equal(won.length, l.ways, l.id);
      assert.equal(P.winners(l).length, l.ways, l.id);
    }
  }
});

test('each level\'s stated best and number of ways', () => {
  for (const l of levels) {
    assert.equal(P.bestGoal(l), l.best, l.id);
    if (l.mark === undefined) assert.equal(l.best, P.maxReach(l.n).reach, l.id);
    assert.equal(P.winners(l).length, l.ways, l.id);
  }
  const by = id => levels.find(l => l.id === id);
  // Two blocks reach 3/4 two ways: the harmonic stack and the top block set back as a counterweight.
  assert.deepEqual(P.winners(by('two-9')).map(P.offsets).sort(), [[3, 6], [9, -6]]);
  // The starred bottom block can reach 3/4 only with the top block all the way back.
  assert.deepEqual(P.winners(by('two-star')).map(P.offsets), [[9, -6]]);
  // The starred middle of three reaches 11/12, as far as three blocks reach at all, in exactly one way.
  assert.deepEqual(P.winners(by('three-star')).map(P.offsets), [[2, 9, -6]]);
  // Five: some block lies wholly past the table's edge; with the star, it's not the top block.
  for (const r of P.winners(by('five-13'))) assert.ok(r.some(x => x - P.L > 0));
  for (const r of P.winners(by('five-star'))) assert.ok(r[3] - P.L > 0 && r[4] < r[3]);
  // Pushed out from the bottom: nothing above can go right until the bottom comes back.
  const pushed = by('four-pushed'), r0 = P.start(pushed);
  for (let k = 1; k < 4; k++) assert.equal(P.tryMove(r0, k, 1).kind, 'falls');
  assert.ok(pushed.witness.some(([, dir]) => dir < 0));
});

test('hints reach the flag in the fewest moves, from the start and from a messed-up stack', () => {
  for (const l of levels) {
    const wins = P.winners(l);
    let r = P.start(l), steps = 0;
    while (!P.isWon(l, r)) {
      const m = P.hintMove(l, r, wins);
      assert.ok(m, `${l.id}: hint at ${r}`);
      r = play(l, [m], r);
      assert.ok(++steps <= l.witness.length, l.id);
    }
    // Off the witness path: push the bottom out as far as it goes first, then follow hints.
    r = P.start(l);
    for (let t; (t = P.tryMove(r, 0, 1)).kind === 'ok' && !P.isWon(l, t.next);) r = t.next;
    const need = P.solveFrom(l, r, wins, 1e6).length;
    // And from a few random standing stacks the hint always has a move.
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let trial = 0; trial < 8; trial++) {
      let q = P.start(l);
      for (let i = 0; i < 150; i++) { const t = P.tryMove(q, Math.floor(rnd() * l.n), rnd() < 0.5 ? 1 : -1); if (t.kind === 'ok' && !P.isWon(l, t.next)) q = t.next; }
      assert.ok(P.hintMove(l, q, wins), `${l.id}: hint from ${q}`);
    }
    steps = 0;
    while (!P.isWon(l, r)) { r = play(l, [P.hintMove(l, r, wins)], r); assert.ok(++steps <= need, l.id); }
  }
});
