// Spin grids through the real board: a hint marks an arrow, a flip undoes,
// then each level is played by flipping the arrows that differ from a best
// arrangement (every best arrangement on find-all boards, with a repeat
// refused). Pinned arrows have nothing to tap.
import levels from '../../dist/data/spin-levels.js';
import {parse, best, startSpins} from '../../dist/chem/spins.js';

export default async function ({assert, go, tick, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const site = i => $(`.spins .spin-hit[data-site="${i}"]`);
  // Stops early if the board is solved on the way (another best arrangement).
  const play = (from, to) => to.forEach((v, i) => { if (v !== from[i] && !isSolvedShown()) tap(site(i)); });
  for (const [k, level] of levels.entries()) {
    await go(`#/spins/${k + 1}`);
    const board = parse(level), start = startSpins(board), {states} = best(board);
    board.sites.forEach((p, i) => assert.equal(Boolean(site(i)), !p.pin, `${level.id}: only free arrows tap`));
    tap(tool('Hint'));
    assert.ok($('.spins .spin.hinted'), `${level.id}: hint marks an arrow`);
    const flips = i => start.map((v, j) => (j === i ? 1 - v : v)).join('');
    const free = board.sites.findIndex((p, i) => !p.pin && !states.some(st => st.join('') === flips(i))), before = $('.spin-goal .red-now').textContent;
    if (free >= 0) {
      tap(site(free));
      assert.ok($(`.spins .spin[data-site="${free}"]`).classList.contains(start[free] ? 'down' : 'up'), `${level.id}: tap flips`);
      tap(tool('Undo'));
      assert.equal($('.spin-goal .red-now').textContent, before, `${level.id}: undo flips back`);
    }
    if (!level.findAll) play(start, states[0]);
    else {
      // Any best arrangement reached on the way counts, so step one flip at
      // a time toward one not found yet, and wait whenever a new one is kept.
      const key = st => st.join(''), best = new Set(states.map(key)), found = [];
      const now = () => board.sites.map((p, i) => ($(`.spins .spin[data-site="${i}"]`).classList.contains('up') ? 1 : 0));
      while (!isSolvedShown()) {
        const cur = now(), target = states.find(st => !found.includes(key(st)));
        tap(site(target.findIndex((v, i) => v !== cur[i])));
        const k2 = key(now());
        if (isSolvedShown() || !best.has(k2) || found.includes(k2)) continue;
        found.push(k2);
        await tick(800);
        assert.equal($$('.shelf .shelf-item').length, found.length, `${level.id}: kept ${found.length}`);
        // One flip from the start back to the first one found is refused.
        const first = found[0].split('').map(Number), diff = first.filter((v, i) => v !== start[i]).length;
        if (found.length === 1 && diff === 1) {
          play(start, first);
          assert.match(feedback(), /Already found/);
          play(first, start);
        }
      }
      assert.equal(found.length + 1, level.ways, `${level.id}: found every way`);
    }
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($('.solved-title').textContent, level.title);
    lines.push(`spins/${level.id}: ${level.title}`);
  }
  return lines;
}
