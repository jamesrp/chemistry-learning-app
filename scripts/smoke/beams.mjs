// Balance beams through the real board: hint, undo, then hang the stored
// answer weight by weight as a child would, plus the take-off and wrong-place
// rules once.
import levels from '../../dist/data/beams-levels.js';

export default async function (T) {
  const {go, $, $$, tap, tool, isSolvedShown, feedback, assert} = T;
  const chip = w => $(`.beam-chip[data-w="${w}"]`), hook = k => $(`.fam-beams .hit[data-key="${k}"]`);
  const hung = () => $$('.fam-beams .weight[data-key]').filter(g => !g.classList.contains('fixed')).length;
  const lines = [];
  for (const [i, level] of levels.entries()) {
    await go(`#/beams/${i + 1}`);
    tap(tool('Hint'));
    assert.ok($('.fam-beams .hinted'), `${level.id}: hint marks something`);
    // Hang one weight, then undo it.
    const w0 = level.tray[0], k0 = $$('.fam-beams .hit[data-key]')[0].getAttribute('data-key');
    tap(chip(w0)); tap(hook(k0));
    assert.equal(hung(), 1, `${level.id}: hung`);
    tap(tool('Undo'));
    assert.equal(hung(), 0, `${level.id}: undo takes it off`);
    // The stored answer: loose strings first, then each weight.
    for (const [c, p] of Object.entries(level.solution.hang)) {
      tap($(`.fam-beams .hit[data-hanger="${c}"]`));
      tap(hook(`${level.beams[c].parent[0]}:${p}`));
    }
    for (const [k, w] of Object.entries(level.solution.placed)) {
      assert.equal(isSolvedShown(), false);
      if (!$('.beam-chip[aria-pressed="true"]') || Number($('.beam-chip[aria-pressed="true"]').dataset.w) !== w) tap(chip(w));
      tap(hook(k));
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($$('.fam-beams .beam.level').length, level.beams.length, `${level.id}: every beam green`);
    lines.push(`beams/${level.id}: ${$('.solved-title').textContent}`);
  }
  // A hook tapped with nothing chosen and a mixed tray hangs nothing; a hung
  // weight tapped goes back; a weight no answer has there is named by Hint.
  await go('#/beams/5');
  tap(hook('0:1')); assert.equal(hung(), 0);
  tap(chip(3)); tap(hook('0:3')); assert.equal(hung(), 1);
  assert.equal($$('.beam-chip').length, 2);
  tap($('.fam-beams .weight[data-key="0:3"]')); assert.equal(hung(), 0); assert.equal($$('.beam-chip').length, 3);
  tap(chip(3)); tap(hook('0:3')); tap(tool('Hint'));
  assert.match(feedback(), /wrong place/);
  assert.ok($('.fam-beams .weight.hinted[data-key="0:3"]'));
  // Restart clears the board.
  tap(tool('Restart')); assert.equal(hung(), 0);
  return lines;
}
