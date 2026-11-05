import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/beams-levels.js';
import {solveAll, isSolved, isLegal, evaluate, hooksOf, mirrorOf, symmetric, hintMove, applyHint, emptyState, hooks, key, trayLeft} from '../dist/phys/beams.js';

// An independent count: every way to put the tray's weights on distinct free
// hooks (and every hook for a loose string), kept if every beam is level.
function bruteCount(level) {
  const free = level.beams.map((_, b) => b).filter(b => level.beams[b].free);
  const hangs = [{}];
  for (const c of free) {
    const next = [];
    for (const hg of hangs) for (const p of hooks(level.beams[level.beams[c].parent[0]])) next.push({...hg, [c]: p});
    hangs.splice(0, hangs.length, ...next);
  }
  const seen = new Set();
  for (const hang of hangs) {
    const base = {placed: {}, hang};
    if (!isLegal(level, base)) continue;
    const slots = [];
    level.beams.forEach((bm, b) => { const used = hooksOf(level, base, b); for (const p of hooks(bm)) if (!used[p]) slots.push(key(b, p)); });
    const rec = (i, placed) => {
      if (i === level.tray.length) {
        const st = {placed, hang};
        if (isSolved(level, st)) seen.add(JSON.stringify([Object.entries(placed).sort(), hang]));
        return;
      }
      for (const k of slots) if (placed[k] === undefined) rec(i + 1, {...placed, [k]: level.tray[i]});
    };
    rec(0, {});
  }
  return seen.size;
}

test('levels: ids, tiers, and a ramp of Easy, Medium, Hard', () => {
  assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
  assert.ok(levels.length >= 10 && levels.length <= 14);
  const tiers = ['easy', 'medium', 'hard'];
  for (const t of tiers) assert.ok(levels.some(l => l.tier === t), t);
  assert.deepEqual(levels.map(l => l.tier), [...levels.map(l => l.tier)].sort((a, b) => tiers.indexOf(a) - tiers.indexOf(b)));
  for (const l of levels) {
    if (l.tier !== 'hard') assert.equal(l.beams.length, 1, `${l.id}: one beam`);
    else assert.ok(l.beams.length >= 2, `${l.id}: a mobile`);
  }
  assert.ok(levels.some(l => l.beams.length === 3), 'a three-beam mobile');
  assert.ok(levels.some(l => l.beams.some(b => b.free)), 'a loose string');
});

test('every stored solution is legal and solves its level', () => {
  for (const l of levels) {
    assert.ok(isLegal(l, l.solution), l.id);
    assert.ok(isSolved(l, l.solution), l.id);
    assert.deepEqual(trayLeft(l, l.solution), [], l.id);
    // Every beam carries at least one tray weight.
    l.beams.forEach((_, b) => assert.ok(Object.values(hooksOf(l, l.solution, b)).some(x => x.w !== undefined && !x.fixed), `${l.id} beam ${b}`));
  }
});

test('answer counts: one, or two mirror images exactly when the board is symmetric', () => {
  for (const l of levels) {
    const sols = solveAll(l);
    assert.equal(sols.length, l.answers, l.id);
    assert.equal(bruteCount(l), l.answers, `${l.id}: brute force agrees`);
    assert.equal(symmetric(l), l.mirror, `${l.id}: symmetric board`);
    if (l.mirror) assert.ok(sols.length === 2 && mirrorOf(l, sols[0], sols[1]), l.id);
    else assert.equal(sols.length, 1, l.id);
    for (const s of sols) assert.ok(isSolved(l, s) && isLegal(l, s), l.id);
  }
});

test('Medium trays only work one way: no tray weight can go on every hook', () => {
  for (const l of levels.filter(l => l.tier === 'medium')) {
    assert.ok(l.tray.length >= 3, l.id);
    // The heaviest weight has at most two possible hooks (one and its mirror).
    const heavy = Math.max(...l.tray), spots = new Set(solveAll(l).map(s => Object.entries(s.placed).find(([, w]) => w === heavy)[0]));
    assert.ok(spots.size <= 2, l.id);
  }
});

test('mobiles: a lower beam pulls like one weight equal to its total', () => {
  const l = levels.find(x => x.id === 'mobile-pair'), ev = evaluate(l, l.solution);
  assert.equal(ev.total[1], 6);
  assert.equal(ev.total[0], 2 + 2 + 4 + 5);
  assert.deepEqual(ev.torque, [0, 0]);
  // The design note's tray: 1, 2, 3 on hooks 1 to 3 has two answers, mirror images.
  const t = {beams: [{n: 3}], fixed: [], tray: [1, 2, 3]}, s = solveAll(t);
  assert.equal(s.length, 2); assert.ok(mirrorOf(t, s[0], s[1]));
  // The loose string must move: where it starts, nothing balances.
  const m = levels.find(x => x.id === 'move-the-string');
  assert.notEqual(m.solution.hang[1], m.beams[1].parent[1]);
});

test('hints: from empty, following hints reaches a solution; a wrong weight is named first', () => {
  for (const l of levels) {
    const sols = solveAll(l);
    let st = emptyState(l);
    for (let n = 0; n < 20 && !isSolved(l, st); n++) {
      const mv = hintMove(l, st, sols);
      assert.ok(mv && mv.kind !== 'remove', `${l.id}: hint from a good state builds`);
      st = applyHint(st, mv);
    }
    assert.ok(isSolved(l, st), `${l.id}: hints solve it`);
    // Hang the heaviest weight somewhere no solution has it: the hint takes it off.
    const heavy = Math.max(...l.tray);
    const bad = l.beams.flatMap((bm, b) => hooks(bm).map(p => key(b, p))).find(k => !sols.some(s => s.placed[k] === heavy) && isLegal(l, {placed: {[k]: heavy}, hang: emptyState(l).hang}));
    const wrong = {placed: {[bad]: heavy}, hang: emptyState(l).hang};
    assert.deepEqual(hintMove(l, wrong, sols), {kind: 'remove', key: bad}, l.id);
    // Hints from a muddled board still finish it.
    let mud = wrong;
    for (let n = 0; n < 30 && !isSolved(l, mud); n++) mud = applyHint(mud, hintMove(l, mud, sols));
    assert.ok(isSolved(l, mud), `${l.id}: hints recover`);
  }
});

test('hints: a forced move is offered when there is one', () => {
  const l = levels.find(x => x.id === 'two-three');
  assert.deepEqual(hintMove(l, emptyState(l)), {kind: 'place', key: '0:2', w: 3, forced: true});
  const m = levels.find(x => x.id === 'move-the-string');
  const mv = hintMove(m, emptyState(m));
  assert.ok(mv.forced, 'the only answer forces the first hint');
});
