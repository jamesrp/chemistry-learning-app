// Electron swap through the real board: a hint marks a line, a tap moves an
// electron and undo takes it back, a full line sends its electrons back on
// the next tap, then each board's one answer is tapped in.
import levels from '../../dist/data/swap-levels.js';
import {solveAll, capOf} from '../../dist/chem/swap.js';

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown}) {
  const lines = [];
  const link = k => $(`.swap .hit[data-link="${k}"]`);
  for (const [i, level] of levels.entries()) {
    await go(`#/swap/${i + 1}`);
    const [sol] = solveAll(level, 1);
    tap(tool('Hint'));
    assert.ok($('.swap .swap-link.hinted'), `${level.id}: hint marks a line`);
    // On a one-line board the first tap can finish it, so these checks need two lines.
    if (level.links.length > 1) {
      tap(link(0));
      assert.ok($$('.swap .electron.moving').length >= 1, `${level.id}: an electron moves`);
      tap(tool('Undo'));
      assert.equal($$('.swap .swap-link.moving').length, 0, `${level.id}: undo`);
      // Past the most a line can carry, a tap sends them back.
      for (let t = 0; t <= capOf(level, 0); t++) tap(link(0));
      assert.equal($$('.swap .swap-link.moving').length, 0, `${level.id}: full line empties`);
    }
    sol.forEach((n, k) => { for (let t = 0; t < n; t++) tap(link(k)); });
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($$('.swap .swap-atom.full').length, level.atoms.length, `${level.id}: every atom finished`);
    lines.push(`swap/${level.id}: ${$('.solved-title').textContent} (${$('.solved-detail').textContent})`);
  }
  return lines;
}
