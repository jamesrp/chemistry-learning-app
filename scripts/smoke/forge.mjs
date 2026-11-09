// Star forge through the real board: on each level a move that lands where
// nothing lives is refused (where the tray has one), a move is undone, the
// hint marks a button, and a shortest path is played to the target. On the
// helium-4 level a long way round is refused as over par.
import levels from '../../dist/data/forge-levels.js';
import {moves, shortestPaths} from '../../dist/phys/nuclides.js';

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const btn = m => $(`.forge-move[data-move="${m}"]`);
  const moveTo = (from, to, tray) => moves(from, tray).find(o => o.to === to).move;
  const here = () => $('.nuc.here').getAttribute('data-key');
  for (const [i, level] of levels.entries()) {
    await go(`#/forge/${i + 1}`);
    assert.equal(here(), level.start, `${level.id}: marker on the start`);
    assert.ok($(`.nuc.goal[data-key="${level.target}"]`), `${level.id}: target drawn`);
    const dead = moves(level.start, level.tray).find(o => !o.to);
    if (dead) {
      tap(btn(dead.move));
      assert.match(feedback(), /falls apart|off this corner/, `${level.id}: dead move refused`);
      assert.equal(here(), level.start);
    }
    const path = shortestPaths(level.start, level.target, level.tray)[0];
    if (level.par > 1) {
      tap(btn(moveTo(path[0], path[1], level.tray)));
      assert.equal(here(), path[1], `${level.id}: first move`);
      tap(tool('Undo'));
      assert.equal(here(), level.start, `${level.id}: undo`);
    }
    tap(tool('Hint'));
    assert.ok($('.forge-move.hinted'), `${level.id}: hint marks a move`);
    if (level.id === 'helium-4') {
      // The long way: deuterium, tritium, its beta decay to helium-3, then a neutron: 4 moves.
      for (const k of ['H-2', 'H-3', 'He-3']) tap(btn(moveTo(here(), k, level.tray)));
      assert.match(feedback(), /over 3|no way/, 'over par is flagged');
      tap(btn(moveTo(here(), 'He-4', level.tray)));
      assert.equal(isSolvedShown(), false, 'four moves is not par');
      assert.match(feedback(), /can be done in 3/);
      tap(tool('Restart'));
      assert.equal(here(), level.start, 'restart');
    }
    for (let k = 1; k < path.length; k++) tap(btn(moveTo(path[k - 1], path[k], level.tray)));
    assert.ok(isSolvedShown(), `${level.id} solved`);
    lines.push(`forge/${level.id}: ${$('.solved-title').textContent} in ${level.par}`);
  }
  return lines;
}
