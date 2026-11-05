// Overhang through the real DOM: for each level, a hint marks a block, one
// move and Undo puts it back, then the stored witness is played by picking
// blocks and sliding them (arrows and taps beside a block, alternately).
// Level 1 also checks a refused move: the stack shows tipping and stays put.
import levels from '../../dist/data/overhang-levels.js';
import {start} from '../../dist/phys/overhang.js';

export default async function (T) {
  const {go, tick, $, $$, tap, tool, assert, isSolvedShown} = T, lines = [];
  const stack = () => $('.overhang').getAttribute('data-stack');
  const arrow = dir => $(`.ov-move[data-dir="${dir}"]`);
  for (const [i, level] of levels.entries()) {
    await go(`#/overhang/${i + 1}`);
    const s0 = start(level).join(',');
    assert.equal(stack(), s0, `${level.id}: start`);
    tap(tool('Hint'));
    const hinted = $('.ov-block.hinted');
    assert.ok(hinted, `${level.id}: hint marks a block`);
    assert.ok($('.ov-hint-arrow'), `${level.id}: hint shows a direction`);
    assert.equal(hinted.getAttribute('data-k'), String(level.witness[0][0]), `${level.id}: hint follows the witness`);
    // One move and back.
    tap(arrow(level.witness[0][1]));
    assert.notEqual(stack(), s0, `${level.id}: moved`);
    tap(tool('Undo'));
    assert.equal(stack(), s0, `${level.id}: undo`);
    if (i === 0) {
      // The top block goes out half a block; one more would tip it, so it stays.
      tap($(`.ov-block[data-k="${level.n - 1}"]`));
      for (let t = 0; t < 6; t++) tap(arrow(1));
      const before = stack();
      tap(arrow(1));
      assert.ok($('.ov-tipping'), 'refused move shows tipping');
      assert.equal(stack(), before, 'refused move changes nothing');
      await tick(450);
      assert.equal($('.ov-tipping'), null, 'tipping clears');
      assert.ok($('.ov-com.edge'), 'a dot sits on the edge');
      tap(tool('Restart'));
      assert.equal(stack(), s0, 'restart');
    }
    level.witness.forEach(([k, dir], j) => {
      if (j % 2) tap($(`.ov-side[data-k="${k}"][data-dir="${dir}"]`));
      else { tap($(`.ov-block[data-k="${k}"]`)); tap(arrow(dir)); }
    });
    assert.ok(isSolvedShown(), `${level.id} solved`);
    lines.push(`overhang/${level.id}: ${$('.solved-title').textContent}`);
  }
  return lines;
}
