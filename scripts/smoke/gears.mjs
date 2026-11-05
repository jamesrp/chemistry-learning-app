// Gear trains through the real board: hint, undo, a refused gear, a jam and
// its hint, then every level's stored solution tapped in like a child would.
import levels from '../../dist/data/gears-levels.js';

export default async function (T) {
  const {go, $, $$, tap, tool, isSolvedShown, feedback, assert} = T;
  const chip = r => $(`.gear-chip[data-r="${r}"]`);
  const peg = i => $(`.gears .peg-hit[data-peg="${i}"]`);
  const gear = i => $(`.gears .gear[data-peg="${i}"]`);
  const put = (i, r) => { tap(chip(r)); tap(peg(i)); assert.ok(gear(i), `gear on peg ${i}`); };
  const lines = [];
  for (const [k, level] of levels.entries()) {
    await go(`#/gears/${k + 1}`);
    assert.ok($('.gears .gear.crank.turning'), `${level.id}: the crank turns`);
    tap(tool('Hint'));
    assert.ok($('.gears .hint-ring'), `${level.id}: hint marks a peg`);
    const ring = $('.gears .hint-ring'), at = ([x, y]) => `${x * 20},${y * 20}`;
    const hinted = level.solution.find(([i]) => at(level.pegs[i]) === `${ring.getAttribute('cx')},${ring.getAttribute('cy')}`);
    assert.ok(hinted, `${level.id}: the hint is part of the answer`);
    assert.equal($('.gear-chip[aria-pressed="true"]').dataset.r, String(hinted[1]), `${level.id}: hint picks the size`);
    const [i0, r0] = level.decoys[0].placed[0];
    put(i0, r0);
    assert.equal(isSolvedShown(), false);
    tap(tool('Undo'));
    assert.equal(gear(i0), null, `${level.id}: undo takes it off`);

    if (level.id === 'same-way') {
      // Too big: the large gear can't go next to the crank.
      tap(chip(3)); tap(peg(1));
      assert.equal(gear(1), null);
      assert.match(feedback(), /Too big/);
      // Two small idlers turn the output the wrong way: its target stays unmet.
      put(1, 1); put(2, 1);
      assert.ok($('.gears .gear.output.turning') && !$('.gears .target.dir-ok'), 'wrong way');
      tap(gear(1)); tap(gear(2));
      assert.equal($$('.gears .gear.placed').length, 0, 'tapping a gear takes it off');
    }
    if (level.id === 'twice') {
      // A small and a large around the crank: a ring of three, jammed.
      put(1, 1); put(2, 3);
      assert.ok($('.gears .gear.crank.jammed'), 'the ring jams');
      tap(tool('Hint'));
      assert.match(feedback(), /in the way/);
      tap(tool('Restart'));
      assert.equal($$('.gears .gear.placed').length, 0);
    }

    for (const [i, r] of level.solution) put(i, r);
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($$('.gears .target.ok').length, level.outputs.length);
    lines.push(`gears/${level.id}`);
  }
  return lines;
}
