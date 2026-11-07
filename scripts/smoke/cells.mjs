// Crystal cells through the real board: one tap fills every spot of a set,
// a second takes it back, a set too big for the balls left is refused, a
// hint points at the answer, and each level's answer is played by picking
// the ball and tapping one spot of each set. On salt levels, two of the same
// ion side by side are marked.
import levels from '../../dist/data/cell-levels.js';
import {SPOTS, setById} from '../../dist/chem/cells.js';

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const spot = set => $(`.cells .spot-hit[data-spot="${SPOTS.findIndex(p => p.set === set)}"]`);
  const chip = el => $(`.cell-tray .cell-chip[data-el="${el}"]`);
  const filled = set => $$(`.cells .spot.filled[data-set="${set}"]`).length;
  for (const [k, level] of levels.entries()) {
    await go(`#/cells/${k + 1}`);
    const given = level.given || {};
    assert.equal($$('.cells .spot').length, 27, `${level.id}: 27 spots`);
    for (const set of Object.keys(given)) assert.equal(spot(set), null, `${level.id}: given ${set} can't be tapped`);
    tap(tool('Hint'));
    assert.ok($('.cells .spot.hinted'), `${level.id}: hint marks a spot`);
    for (const [set, el] of Object.entries(level.answer)) {
      if (given[set]) continue;
      tap(chip(el));
      tap(spot(set));
      assert.equal(filled(set), setById(set).size, `${level.id}: ${set} fills all ${setById(set).size}`);
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($('.solved-title').textContent, level.title);
    assert.equal($$('.cell-count.met').length, $$('.cell-count').length, `${level.id}: every count met`);
    lines.push(`cells/${level.id}: ${level.title}`);
  }

  // Copper: a face pair fills two spots and a second tap empties them; undo
  // brings them back; corners are given so the edges (4 balls) still fit,
  // but then the faces can't all fit any more.
  await go('#/cells/3');
  tap(spot('Fz'));
  assert.equal(filled('Fz'), 2);
  tap(spot('Fz'));
  assert.equal(filled('Fz'), 0);
  tap(tool('Undo'));
  assert.equal(filled('Fz'), 2);
  tap(spot('Ex'));
  tap(spot('Fx'));
  assert.match(feedback(), /need 2 copper balls\. None left/);
  assert.equal(filled('Fx'), 0);
  tap(tool('Hint'));
  assert.match(feedback(), /belong somewhere else/);
  // Salt: sodium on the corners and on the edges touch, and are marked.
  await go(`#/cells/${levels.findIndex(l => l.id === 'nacl') + 1}`);
  tap(chip('Na')); tap(spot('C')); tap(spot('Ex'));
  assert.ok($$('.cells .spot.clash').length >= 2, 'touching sodiums are marked');
  assert.equal(isSolvedShown(), false);
  return lines;
}
