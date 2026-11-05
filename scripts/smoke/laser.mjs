// Laser bench through the real DOM: for each level, a hint marks a square,
// a placed piece undoes, then the first stored answer is played as a child
// would (pick the piece in the tray, tap the square, tap again to flip).
// Also: tapping a placed mirror flips it and then takes it back, and an
// empty tray refuses another piece.
import levels from '../../dist/data/laser-levels.js';

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const cell = key => $(`.laser .cell-hit[data-cell="${key}"]`);
  const chip = kind => $(`.laser-tray .piece-chip[data-kind="${kind}"]`);
  for (const [i, level] of levels.entries()) {
    await go(`#/laser/${i + 1}`);
    assert.ok($('.laser .lamp') && $('.laser .target'), `${level.id}: board drawn`);
    assert.ok($$('.laser .beam').length > 0, `${level.id}: beams drawn`);
    tap(tool('Hint'));
    assert.ok($('.laser .hint-mark'), `${level.id}: hint marks a square`);
    const free = $$('.laser .cell-hit')[0];
    tap(free);
    assert.equal($$('.laser .piece.placed').length, 1, `${level.id}: piece placed`);
    tap(tool('Undo'));
    assert.equal($$('.laser .piece.placed').length, 0, `${level.id}: undo takes it back`);
    for (const [r, c, code] of level.answers[0]) {
      tap(chip(code[0]));
      tap(cell(`${r},${c}`));
      if (code[1] === '\\') tap(cell(`${r},${c}`));
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    if (level.fact) assert.equal($('.solved-title').textContent, level.fact);
    assert.equal($$('.laser .target.lit').length, level.targets.length, `${level.id}: every target lit`);
    lines.push(`laser/${level.id}: ${$('.solved-title').textContent}`);
  }

  // Tap cycle and the empty tray, on the first board (one mirror).
  await go('#/laser/1');
  tap(cell('1,1'));
  assert.equal($('.laser .piece.placed .piece-case').getAttribute('x1') < $('.laser .piece.placed .piece-case').getAttribute('x2'), true);
  tap(cell('2,2'));
  assert.match(feedback(), /tray is empty/);
  assert.equal($$('.laser .piece.placed').length, 1);
  tap(cell('1,1')); tap(cell('1,1'));
  assert.equal($$('.laser .piece.placed').length, 0, 'a third tap returns the mirror to the tray');
  assert.match(chip('m').getAttribute('aria-label'), /1 left/);
  // A wrong piece: the hint says so.
  tap(cell('0,3'));
  tap(tool('Hint'));
  assert.match(feedback(), /in the way|Flip/);
  // A target receiving the wrong colour shows it: on the yellow board,
  // bring only red to the yellow target.
  const y = levels.findIndex(l => l.id === 'yellow');
  await go(`#/laser/${y + 1}`);
  tap(cell('1,5'));
  assert.ok($('.laser .target.wrong'), 'red on a yellow target shows as wrong');
  assert.equal(isSolvedShown(), false);
  return lines;
}
