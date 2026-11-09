// Crystal cells through the real board: one tap fills every spot of a class,
// a second takes it back, a hint points at the answer, and each level's
// answer is played by picking the atom and tapping one spot of each class.
// Polonium is also solved in the middle, the same crystal shifted. Atoms
// side by side are marked.
import levels from '../../dist/data/cell-levels.js';
import {SPOTS, classById} from '../../dist/chem/cells.js';

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const spot = cls => $(`.cells .spot-hit[data-spot="${SPOTS.findIndex(p => p.cls === cls)}"]`);
  const chip = el => $(`.cell-tray .cell-chip[data-el="${el}"]`);
  const filled = cls => $$(`.cells .spot.filled[data-class="${cls}"]`).length;
  for (const [k, level] of levels.entries()) {
    await go(`#/cells/${k + 1}`);
    const given = level.given || {}, many = Object.keys(level.target).length > 1;
    assert.equal($$('.cells .spot').length, 27, `${level.id}: 27 spots`);
    assert.equal($('.cell-tray').hidden, !many, `${level.id}: tray only when there is a choice`);
    for (const cls of Object.keys(given)) assert.equal(spot(cls), null, `${level.id}: given ${cls} can't be tapped`);
    tap(tool('Hint'));
    assert.ok($('.cells .spot.hinted'), `${level.id}: hint marks a spot`);
    for (const [cls, el] of Object.entries(level.answer)) {
      if (given[cls]) continue;
      if (many) tap(chip(el));
      tap(spot(cls));
      assert.equal(filled(cls), classById(cls).size, `${level.id}: ${cls} fills all ${classById(cls).size}`);
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($('.solved-title').textContent, level.title);
    assert.equal($$('.cell-count.met').length, $$('.cell-count').length, `${level.id}: every count met`);
    lines.push(`cells/${level.id}: ${level.title}`);
  }

  // Polonium in the middle is right too. On the corners, the picture of the
  // cube and its neighbours shows 27 corner atoms, 8 of them this cube's.
  await go('#/cells/1');
  tap(spot('Z'));
  assert.ok(isSolvedShown(), 'polonium in the middle');
  tap(tool('Restart'));
  tap(spot('C'));
  assert.equal($$('.cell-block .block-ball').length, 27);
  assert.equal($$('.cell-block .block-ball.home').length, 8);
  // Copper: a tap fills a class and a second empties it; undo brings it back;
  // corners and edges side by side are marked and not solved.
  await go('#/cells/3');
  tap(spot('F'));
  assert.equal(filled('F'), 6);
  tap(spot('F'));
  assert.equal(filled('F'), 0);
  tap(tool('Undo'));
  assert.equal(filled('F'), 6);
  tap(spot('F'));
  tap(spot('C')); tap(spot('E'));
  assert.ok($$('.cells .spot.clash').length >= 2, 'side-by-side atoms are marked');
  assert.equal(isSolvedShown(), false);
  tap(tool('Hint'));
  assert.match(feedback(), /belong somewhere else/);
  return lines;
}
