// Quark kitchen through the real board: on each level the hint is read, a
// quark is put in and cleared, then every answer is built from the tray (all
// arrows up, then the flips its recipe needs). A repeat is refused, and on
// the three-up-quarks level a flipped arrow is refused by the Pauli rule.
import levels from '../../dist/data/quark-levels.js';
import {answers} from '../../dist/phys/quarks.js';

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const chip = q => $(`.q-chip[data-q="${q}"]`);
  const clear = () => tap($$('.actions .secondary').find(b => b.textContent === 'Clear'));
  const play = build => {
    for (const b of build) tap(chip(b.q));
    build.forEach((b, k) => { if (!b.up) tap($(`.quark-board .quark[data-slot="${k}"]`)); });
  };
  for (const [i, level] of levels.entries()) {
    await go(`#/quarks/${i + 1}`);
    const flips = a => a.build.filter(x => !x.up).length;
    const all = answers(level).sort((a, b) => flips(a) - flips(b));
    tap(tool('Hint'));
    assert.ok(feedback().length > 10, `${level.id}: hint`);
    tap(chip(Object.keys(level.tray)[0]));
    assert.equal($$('.quark-board .quark').length, 1, `${level.id}: a quark goes in`);
    clear();
    assert.equal($$('.quark-board .quark').length, 0, `${level.id}: cleared`);
    if (level.id === 'delta-plus-plus') {
      // Flip the second arrow before the third quark goes in.
      tap(chip('u')); tap(chip('u')); tap($('.quark-board .quark[data-slot="1"]')); tap(chip('u'));
      assert.match($('.quark-status').textContent, /same way/);
      assert.equal(isSolvedShown(), false);
      clear();
    }
    for (const [k, {build}] of all.entries()) {
      play(build);
      if (k < all.length - 1) {
        assert.equal(isSolvedShown(), false, `${level.id}: not done after ${k + 1}`);
        assert.match(feedback(), /to go/, `${level.id}: found ${k + 1}`);
        assert.equal($$('.quark-board .quark').length, 0, `${level.id}: board empties`);
        if (k === 0) {
          play(build);
          assert.match(feedback(), /Already found/, `${level.id}: repeat refused`);
          clear();
        }
      }
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    if (level.chart) assert.equal($$('.chart-spot.found').length, level.find, `${level.id}: chart filled`);
    lines.push(`quarks/${level.id}: ${$('.solved-title').textContent}, ${$('.solved-detail').textContent}`);
  }
  return lines;
}
