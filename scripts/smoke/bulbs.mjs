// Plays every Bulb board through the DOM: undo, lifting a wire and a hint on
// each board, a short circuit and running out of wires on the first board,
// hints alone on the bridge, the card rows and switches on switch boards,
// then the checked solution.
import {BULB_LEVELS} from '../../dist/data/bulbs-levels.js';
import {layout, evaluate, bulbsOf, fracText} from '../../dist/phys/bulbs.js';

const same = (p, q) => p[0] === q[0] && p[1] === q[1];
const gapOf = (gaps, [a, b]) => gaps.findIndex(([p, q]) => same(p, a) && same(q, b) || same(p, b) && same(q, a));

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const gap = g => $(`.bulbs .hit[data-gap="${g}"]`);
  const laid = () => $$('.bulbs .gap.laid').length;
  for (const [i, level] of BULB_LEVELS.entries()) {
    await go(`#/bulbs/${i + 1}`);
    const {gaps} = layout(level);
    const sol = level.solution.map(pair => gapOf(gaps, pair));
    assert.ok(sol.every(g => g >= 0), `${level.id}: solution gaps exist`);
    assert.equal($$('.wire-piece').length, level.budget, `${level.id}: tray shows the budget`);
    assert.equal($$('.bulbs .bulb').length, bulbsOf(level).length);
    // Undo, and tapping a wire to lift it.
    tap(gap(0)); assert.equal(laid(), 1);
    assert.equal($$('.wire-piece.used').length, 1);
    tap(tool('Undo')); assert.equal(laid(), 0, `${level.id}: undo lifts it`);
    tap(gap(0)); tap(gap(0)); assert.equal(laid(), 0, `${level.id}: tapping a wire lifts it`);
    tap(tool('Hint'));
    assert.ok($('.bulbs .gap.hinted'), `${level.id}: hint marks a gap`);
    if (i === 0) {
      // A short: + round the top and down the middle to −.
      const short = [[[0, 0], [0, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]]].map(pr => gapOf(gaps, pr));
      assert.ok(evaluate(level, short).short);
      for (const g of short) tap(gap(g));
      assert.match(feedback(), /straight to −/);
      assert.ok($('.bulbs .battery.hot'), 'battery shows the short');
      // Out of wires: one more than the budget is refused.
      const spare = gaps.map((_, g) => g).filter(g => !short.includes(g));
      tap(gap(spare[0]));
      assert.equal(laid(), level.budget);
      tap(gap(spare[1]));
      assert.equal(laid(), level.budget, 'over budget refused');
      assert.ok($('.wire-tray').classList.contains('flash'), 'tray flashes');
      tap(tool('Restart')); assert.equal(laid(), 0);
    }
    if (level.id === 'bridge') {
      // From a wrong wire, following hints alone solves it.
      tap(gap(gaps.map((_, g) => g).find(g => !sol.includes(g))));
      for (let k = 0; k < 20 && !isSolvedShown(); k++) {
        tap(tool('Hint'));
        tap($('.bulbs .gap.hinted .hit'));
      }
      assert.ok(isSolvedShown(), 'hints alone solve the bridge');
      const middle = level.parts.findIndex(p => p.kind === 'bulb' && p.want === 'off');
      assert.equal(fracText(evaluate(level, sol).power.get(middle)), '0', 'middle bulb carries nothing');
      assert.equal($('.solved-title').textContent, level.name);
      lines.push(`bulbs/${level.id} (by hints)`);
      continue;
    }
    for (const g of sol) tap(gap(g));
    if (level.table) {
      // Every card row is green; tapping a row sets the switches and the lamp follows.
      assert.equal($$('.card-row').length, level.table.length);
      assert.equal($$('.card-row.met').length, level.table.length, `${level.id}: every row met`);
      for (const [k, row] of level.table.entries()) {
        tap($$('.card-row')[k]);
        assert.ok($$('.card-row')[k].classList.contains('now'));
        const lamp = Number(Object.keys(row.want)[0]);
        assert.ok($(`.bulbs .bulb[data-bulb="${lamp}"]`).classList.contains(`glow-${row.want[lamp]}`), `${level.id} row ${k}`);
      }
      // Switches still flip by tapping them after the board is solved.
      const before = $('.bulbs .switch').classList.contains('on');
      tap($('.bulbs .switch-hit'));
      assert.notEqual($('.bulbs .switch').classList.contains('on'), before);
    } else {
      for (const b of bulbsOf(level)) assert.ok($(`.bulbs .bulb[data-bulb="${b}"]`).classList.contains('met'), `${level.id}: bulb ${b} met`);
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($('.solved-title').textContent, level.name);
    assert.equal($$('.bulbs .hit:not(.switch-hit)').length, 0, 'gaps lock when solved');
    lines.push(`bulbs/${level.id}`);
  }
  return lines;
}
