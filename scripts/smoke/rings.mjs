// Ring patches through the real board: a hint marks a bond, a tap makes a
// double bond and undo takes it back, then the asked-for number of Kekulé
// structures are played one by one (a repeat is refused), each landing on
// the shelf.
import levels from '../../dist/data/ring-levels.js';
import {patch, kekule} from '../../dist/chem/rings.js';

export default async function ({assert, go, tick, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const bond = i => $(`.rings .hit[data-b="${i}"]`);
  const play = sol => sol.forEach((v, i) => { if (v) tap(bond(i)); });
  for (const [k, level] of levels.entries()) {
    await go(`#/rings/${k + 1}`);
    const p = patch(level.rings), sols = kekule(p, level.find + 1);
    assert.equal($$('.rings .ring-c').length, p.carbons.length, `${level.id}: every carbon drawn`);
    tap(tool('Hint'));
    assert.ok($('.rings .ring-bond.hinted'), `${level.id}: hint marks a bond`);
    tap(bond(0));
    assert.equal($$('.rings .ring-bond.double').length, 1, `${level.id}: tap makes a double bond`);
    tap(tool('Undo'));
    assert.equal($$('.rings .ring-bond.double').length, 0, `${level.id}: undo`);
    for (let n = 0; n < level.find; n++) {
      play(sols[n]);
      if (n === level.find - 1) break;
      assert.equal(isSolvedShown(), false);
      await tick(800);
      assert.equal($$('.shelf .shelf-item').length, n + 1, `${level.id}: kept ${n + 1}`);
      assert.equal($$('.rings .ring-bond.double').length, 0, `${level.id}: fresh board`);
      if (n === 0) {
        play(sols[0]);
        assert.match(feedback(), /Already found/);
        play(sols[0]);
        assert.equal($$('.rings .ring-bond.double').length, 0);
      }
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($('.solved-title').textContent, level.name);
    lines.push(`rings/${level.id}: ${level.name}, ${$('.solved-detail').textContent}`);
  }
  return lines;
}
