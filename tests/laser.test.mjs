import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/laser-levels.js';
import {parse, trace, solved, solveAll, hint, used, reflect, fromWitness, isLitRight, MASK, DIRS} from '../dist/phys/laser.js';

const keyOf = placed => Object.keys(placed).sort().map(k => `${k}${placed[k]}`).join(' ');
const setOf = list => new Set(list.map(keyOf));

test('mirrors turn a beam through a right angle, angle in equals angle out', () => {
  // '/' : east to north, north to east, west to south, south to west.
  assert.deepEqual(reflect(DIRS.E, '/'), DIRS.N);
  assert.deepEqual(reflect(DIRS.N, '/'), DIRS.E);
  assert.deepEqual(reflect(DIRS.W, '/'), DIRS.S);
  assert.deepEqual(reflect(DIRS.S, '/'), DIRS.W);
  // '\' : east to south, south to east, west to north, north to west.
  assert.deepEqual(reflect(DIRS.E, '\\'), DIRS.S);
  assert.deepEqual(reflect(DIRS.N, '\\'), DIRS.W);
  // Reflecting twice in the same mirror gives the beam back.
  for (const d of Object.values(DIRS)) for (const m of ['/', '\\']) assert.deepEqual(reflect(reflect(d, m), m), d);
});

test('every level has the levels shape, a unique id and 10 to 14 levels over three tiers', () => {
  assert.ok(levels.length >= 10 && levels.length <= 14);
  assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
  for (const tier of ['easy', 'medium', 'hard']) assert.ok(levels.some(l => l.tier === tier), tier);
  for (const l of levels) {
    const b = parse(l);
    assert.ok(b.rows <= 8 && b.cols <= 8, l.id);
    assert.ok(l.answers.length >= 1, l.id);
  }
});

test('the stored answers are exactly every answer the exhaustive search finds', () => {
  for (const l of levels) {
    const b = parse(l), found = solveAll(b), stored = l.answers.map(fromWitness);
    assert.deepEqual([...setOf(found)].sort(), [...setOf(stored)].sort(), l.id);
    for (const a of stored) {
      assert.ok(solved(b, a), `${l.id}: stored answer solves`);
      const n = used(a);
      assert.ok(n.m <= b.tray.m && n.s <= b.tray.s, `${l.id}: within the tray`);
      for (const k of Object.keys(a)) assert.equal(b.cells[k.split(',')[0] * b.cols + Number(k.split(',')[1])], 'empty', `${l.id}: on an empty square`);
    }
  }
});

test('the search misses nothing: a blind search over every placement agrees on the small boards', () => {
  // Every way to put up to the tray's pieces, each slant, on every empty
  // square; keep the wins in which every piece is reached by a beam.
  for (const l of levels) {
    const b = parse(l), total = b.tray.m + b.tray.s;
    if (total > 3) continue;
    const empty = [];
    b.cells.forEach((k, i) => { if (k === 'empty') empty.push(`${Math.floor(i / b.cols)},${i % b.cols}`); });
    const wins = [];
    const rec = (start, placed, left) => {
      const t = trace(b, placed);
      if (isLitRight(b, t.got) && Object.keys(placed).every(p => t.hit.has(p))) wins.push({...placed});
      for (let i = start; i < empty.length; i++) for (const kind of ['m', 's']) {
        if (!left[kind]) continue;
        for (const slant of ['/', '\\']) rec(i + 1, {...placed, [empty[i]]: kind + slant}, {...left, [kind]: left[kind] - 1});
      }
    };
    rec(0, {}, {...b.tray});
    assert.deepEqual([...setOf(wins)].sort(), [...setOf(solveAll(b))].sort(), l.id);
  }
});

test('trays are tight: one piece fewer of any kind leaves no answer', () => {
  for (const l of levels) {
    const b = parse(l);
    for (const k of ['m', 's']) if (b.tray[k]) assert.equal(solveAll(b, {...b.tray, [k]: b.tray[k] - 1}, {limit: 1}).length, 0, `${l.id} without one ${k}`);
  }
});

test('every answer uses the whole tray, and Medium boards have at most 2 answers and Hard boards exactly 1', () => {
  for (const l of levels) {
    for (const a of l.answers) assert.equal(a.length, (l.tray.m || 0) + (l.tray.s || 0), l.id);
    if (l.tier === 'medium') assert.ok(l.answers.length <= 2, `${l.id}: ${l.answers.length} answers`);
    if (l.tier === 'hard') assert.equal(l.answers.length, 1, l.id);
  }
});

test('no target starts lit right, and the tiers bring in splitters and then colour', () => {
  for (const l of levels) {
    const b = parse(l);
    assert.ok(trace(b, {}).got.every((g, i) => g !== b.targets[i].want), l.id);
    const colours = new Set([...l.lamps.map(x => x[1]), ...l.targets]);
    if (l.tier === 'easy') { assert.equal(b.tray.s, 0, l.id); assert.deepEqual([...colours], ['R'], l.id); }
    if (l.tier === 'medium') { assert.ok(b.tray.s > 0, l.id); assert.ok(l.targets.length >= 2 && b.lamps.length === 1, l.id); }
    if (l.tier === 'hard') assert.ok(colours.size > 1 && l.targets.some(t => MASK[t] !== 1 && MASK[t] !== 2 && MASK[t] !== 4), l.id);
  }
  assert.ok(levels.some(l => l.targets.includes('W')), 'a white target');
});

test('colours add, and an extra colour is wrong', () => {
  const share = levels.find(l => l.id === 'share'), b = parse(share), a = fromWitness(share.answers[0]);
  const t = trace(b, a);
  assert.deepEqual(t.got, [MASK.R, MASK.Y]);
  // Without the green lamp's mirror the yellow target only gets red.
  const noGreen = {...a};
  delete noGreen['2,3'];
  assert.deepEqual(trace(b, noGreen).got, [MASK.R, MASK.R]);
  assert.equal(solved(b, noGreen), false);
  // White wants all three: on the white board, dropping blue's mirror leaves yellow.
  const white = levels.find(l => l.id === 'white'), bw = parse(white), aw = fromWitness(white.answers[0]);
  assert.deepEqual(trace(bw, aw).got, [MASK.W]);
  const noBlue = {...aw};
  delete noBlue['3,3'];
  assert.deepEqual(trace(bw, noBlue).got, [MASK.Y]);
});

test('a splitter where red and green cross sends yellow both ways', () => {
  const l = levels.find(x => x.id === 'both'), b = parse(l), a = fromWitness(l.answers[0]);
  const {halves, got} = trace(b, a);
  assert.deepEqual(got, [MASK.Y, MASK.Y]);
  assert.equal(halves.get('2,3,E'), MASK.Y);
  assert.equal(halves.get('2,3,S'), MASK.Y);
});

test('beams that loop through splitters stop', () => {
  const b = parse({id: 'loop', map: ['L....', '.....', '.....', '....T'], lamps: [['E', 'R']], targets: ['R'], tray: {m: 4, s: 1}});
  const loop = {'0,1': 's\\', '2,1': 'm\\', '2,3': 'm/', '0,3': 'm/'};
  const t = trace(b, loop);
  assert.ok(t.hit.has('0,3'));
});

test('following hints from an empty board, or from a wrong start, reaches an answer', () => {
  for (const l of levels) {
    const b = parse(l), answers = l.answers.map(fromWitness);
    const play = start => {
      const placed = {...start};
      for (let step = 0; step < 20; step++) {
        if (solved(b, placed)) return true;
        const hn = hint(b, placed, answers);
        assert.ok(hn, `${l.id}: a hint`);
        if (hn.wrong) delete placed[hn.cell];
        else {
          // A hint names a square a beam already crosses.
          assert.ok(trace(b, placed).path.has(hn.cell), `${l.id}: hinted square is lit`);
          placed[hn.cell] = hn.code;
        }
      }
      return false;
    };
    assert.ok(play({}), `${l.id} from empty`);
    // A wrong first piece: the first lit square that no answer uses, or one turned the wrong way.
    const first = answers[0], [cell] = Object.keys(first);
    const flipped = {[cell]: first[cell][0] + (first[cell][1] === '/' ? '\\' : '/')};
    assert.equal(hint(b, flipped, answers).wrong, answers.some(a => a[cell] === flipped[cell]) ? undefined : 'flip', l.id);
    assert.ok(play(flipped), `${l.id} from a flipped piece`);
  }
});
