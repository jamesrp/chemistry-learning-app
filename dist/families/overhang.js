// Overhang board: identical blocks, one per layer, at the edge of a table.
// Tap a block to pick it, then slide it a twelfth of its length left or right
// (arrows below, or tap beside it); the blocks above ride along. A move that
// would leave the stack falling is shown tipping and doesn't happen. The dots
// mark where the weight of everything above each contact rests.
import levels from '../data/overhang-levels.js';
import {L, TABLE, contacts, tryMove, isWon, goalX, start, winners, hintMove, maxReach} from '../phys/overhang.js';
import {h, s, tappable, History, f} from '../ui.js';

const U = 5, H = 14, FLOOR = 38, TIP_MS = 400, TIP_DEG = 14;
const FR = ['', '¹⁄₁₂', '⅙', '¼', '⅓', '⁵⁄₁₂', '½', '⁷⁄₁₂', '⅔', '¾', '⅚', '¹¹⁄₁₂'];
const inBlocks = x => (x < L ? `${FR[x]} of a block` : x === L ? '1 block' : `1${FR[x - L]} blocks`);

export const overhang = {
  id: 'overhang',
  name: 'Overhang',
  shelf: 'physics',
  levels,
  howTo: [
    'Tap a block, then slide it with the arrows, or tap beside it. The blocks on top of it ride along.',
    'Each dot shows where the weight of everything above it rests. The stack stands while every dot is on the block or table under it, even right at the edge; a move that would tip it doesn\'t happen.',
    'Reach the flag. If a block has a star, that block must reach it.',
  ],
  notes: {
    science: 'Each block, and each pile of blocks, acts as if all its weight sat at one point, its centre of mass. A pile resting on a block stays put while that point is over the block (exactly on the edge still balances); past the edge, the pile turns about the edge and falls. So a block can stick out over the one below only as far as the blocks above it allow. That is why you build from the top down: the top block can go half its length past the one under it; those two together can go a quarter past the third; three together a sixth past the fourth, and so on. Pushing the bottom block out first spends the whole stack\'s balance at once and leaves nothing for the blocks above. The starred levels turn the trick around: blocks set back on top act as a counterweight, holding down a block that sticks out further than it could alone.',
    maths: 'With block length 1, the k-th block from the top can overhang the one below by at most 1/(2k), so n blocks reach at most (1 + 1/2 + ... + 1/n)/2, half the harmonic number: 3/4, 11/12, 25/24 for two, three and four blocks. The harmonic series diverges, so with enough blocks the top one gets as far out as you like, though only logarithmically: it takes 31 blocks to reach two block lengths and 227 to reach three. The board works in twelfths, which floors some steps, so four blocks reach exactly one block length here instead of 25/24, five reach 13/12 and six 7/6; an exact search over every standing stack confirms these are the maxima on this grid. With one block per layer the harmonic stack is optimal. Allowing several blocks side by side in a layer (counterweights) does much better: Paterson and Zwick ("Overhang", 2009) built stacks reaching on the order of the cube root of n, and Paterson, Peres, Thorup, Winkler and Zwick ("Maximum overhang", 2009) proved that nothing does better than a constant times that. The starred levels are a one-wide glimpse of that idea; the board doesn\'t model wider layers.',
    caution: 'Most children push the bottom block out first, the way you build a staircase, and the board refuses everything after that; let them meet that refusal and find the top-down order before explaining it. The board is ideal physics: identical uniform blocks, exact positions, and a stack that stands exactly on the knife edge. Real books and blocks aren\'t perfectly uniform, tables and blocks are slightly springy, and a stack at the exact limit wobbles and falls at a breath, so with real things leave a little margin. Friction is what lets the blocks on top ride along when you slide one; it doesn\'t change where the balance points are.',
    kitchen: 'Stack books, Jenga blocks or playing cards at a table edge and build the overhang from the top down: slide the top one out as far as it will go, then slide the top two together over the third, and so on. With four or five similar books the top one can sit entirely past the edge. Use a soft landing (a cushion on the floor), keep heavy books low and toes clear, and try a starred stack too: a book set back on top lets the one under it reach further.',
  },
  mount,
};

// A five-pointed star centred at (x, y).
const star = (x, y, R) => 'M' + Array.from({length: 10}, (_, i) => {
  const a = Math.PI * (i / 5 - 0.5), q = i % 2 ? R * 0.42 : R;
  return `${f(x + q * Math.cos(a))} ${f(y + q * Math.sin(a))}`;
}).join('L') + 'Z';

function mount(host, level, ctx) {
  const n = level.n, wins = winners(level);
  const history = new History({r: start(level)});
  let selected = n - 1, hinted = null, tip = null, tipTimer = null, done = false;
  const right = Math.max(level.flag, maxReach(n).reach) * U + 26, left = -TABLE * U - 6, top = -n * H - 26;
  const svg = s('svg', {class: 'board-svg overhang', viewBox: `${left} ${top} ${right - left} ${FLOOR + 6 - top}`, 'aria-label': 'Overhang board'});
  const arrows = h('div', {class: 'ov-arrows'},
    h('button', {type: 'button', class: 'ov-move', 'data-dir': '-1', 'aria-label': 'Slide left', onclick: () => slide(selected, -1)}, '◀'),
    h('button', {type: 'button', class: 'ov-move', 'data-dir': '1', 'aria-label': 'Slide right', onclick: () => slide(selected, 1)}, '▶'));
  host.append(svg, arrows);
  host.addEventListener('keydown', event => {
    const keys = {ArrowLeft: () => slide(selected, -1), ArrowRight: () => slide(selected, 1), ArrowUp: () => pick(Math.min(n - 1, selected + 1)), ArrowDown: () => pick(Math.max(0, selected - 1))};
    if (keys[event.key] && !done) { event.preventDefault(); keys[event.key](); }
  });
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(angle = 0) {
    const r = tip ? tip.next : history.state.r, won = !tip && isWon(level, r);
    svg.replaceChildren();
    svg.setAttribute('data-stack', history.state.r.join(','));
    // Table, floor, and faint twelfths past the edge.
    svg.append(s('line', {class: 'ov-floor', x1: left, y1: FLOOR, x2: right, y2: FLOOR}),
      s('rect', {class: 'ov-leg', x: -TABLE * U + 10, y: 7, width: 7, height: FLOOR - 7}),
      s('rect', {class: 'ov-leg', x: -17, y: 7, width: 7, height: FLOOR - 7}),
      s('rect', {class: 'ov-table', x: -TABLE * U, y: 0, width: TABLE * U, height: 7}));
    for (let x = 1; x * U < right - 8; x++) svg.append(s('line', {class: `ov-tick ${x % L ? (x % 6 ? '' : 'half') : 'whole'}`, x1: x * U, y1: 0, x2: x * U, y2: x % 6 ? 2.5 : 5}));
    // The flag.
    const fx = level.flag * U, ftop = -n * H - 18;
    svg.append(s('g', {class: `ov-flag ${level.mark !== undefined ? 'starred' : ''} ${won ? 'won' : ''}`},
      s('line', {class: 'ov-pole', x1: fx, y1: FLOOR, x2: fx, y2: ftop}),
      s('path', {class: 'ov-pennant', d: `M${fx} ${ftop}L${fx + 13} ${ftop + 4.5}L${fx} ${ftop + 9}Z`})));
    // Blocks: the part that would fall goes in its own group, turned about the edge.
    const falling = tip ? s('g', {class: 'ov-tipping', transform: `rotate(${f(angle * tip.fall.dir)} ${tip.fall.pivot * U} ${-tip.fall.k * H})`}) : null;
    const rows = s('g', {});
    r.forEach((x, k) => {
      const y = -(k + 1) * H, g = s('g', {class: `ov-block c${k % 3} ${level.mark === k ? 'starred' : ''} ${k === selected && !done ? 'selected' : ''} ${hinted && hinted.k === k ? 'hinted' : ''}`, 'data-k': k});
      g.append(s('rect', {class: 'ov-body', x: (x - L) * U, y, width: L * U, height: H, rx: 1.5}));
      if (level.mark === k) g.append(s('path', {class: 'ov-star', d: star((x - L / 2) * U, y + H / 2 + 0.6, 4.6)}));
      if (!done) tappable(g, `Block ${k + 1} from the bottom${level.mark === k ? ', with the star' : ''}`, () => pick(k));
      (falling && k >= tip.fall.k ? falling : rows).append(g);
    });
    svg.append(rows);
    if (hinted) {
      const x = history.state.r[hinted.k], y = -(hinted.k + 0.5) * H, ax = hinted.dir > 0 ? x * U + 4 : (x - L) * U - 4;
      svg.append(s('path', {class: 'ov-hint-arrow', d: `M${ax} ${y - 5}L${ax + 7 * hinted.dir} ${y}L${ax} ${y + 5}Z`}));
    }
    // Dots: where the weight of everything above each contact rests.
    for (const c of contacts(r)) {
      const dot = s('circle', {class: `ov-com ${c.right || c.left ? 'off' : c.atEdge ? 'edge' : ''}`, cx: f(c.com * U), cy: -c.k * H, r: c.atEdge || c.right || c.left ? 2.6 : 2});
      (falling && c.k > tip.fall.k ? falling : svg).append(dot);
    }
    if (falling) svg.append(falling);
    // Tap beside a block to slide it that way.
    if (!done && !tip) history.state.r.forEach((x, k) => {
      const y = -(k + 1) * H;
      for (const [dir, x0, x1] of [[-1, left, (x - L) * U], [1, x * U, right]]) {
        if (x1 - x0 < 2) continue;
        svg.append(tappable(s('rect', {class: 'ov-side', 'data-k': k, 'data-dir': dir, x: x0, y, width: x1 - x0, height: H}), `Slide block ${k + 1} ${dir > 0 ? 'right' : 'left'}`, () => slide(k, dir)));
      }
    });
    for (const b of arrows.children) b.disabled = done;
    ctx.changed({canUndo: history.canUndo && !done});
  }

  function stopTip() { if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; } tip = null; }
  function pick(k) { if (done) return; stopTip(); selected = k; if (hinted && hinted.k !== k) hinted = null; render(); }

  function slide(k, dir) {
    if (done) return;
    stopTip();
    selected = k;
    const t = tryMove(history.state.r, k, dir);
    if (t.kind === 'wall') { render(); return; }
    if (t.kind === 'falls') { showTip(t); return; }
    hinted = null;
    history.push({r: t.next});
    if (isWon(level, t.next)) {
      done = true; render();
      const x = goalX(level, t.next);
      ctx.solved({title: inBlocks(x), detail: x >= level.best ? (level.mark === undefined ? `as far as ${n} blocks reach` : 'as far as that block can go') : null});
      return;
    }
    render();
  }

  // The part that would fall turns over the edge for a moment, then the
  // stack is back as it was.
  function showTip(t) {
    tip = t;
    const t0 = Date.now(), still = reduced();
    const frame = () => {
      if (tip !== t) return;
      const p = Math.min(1, (Date.now() - t0) / TIP_MS);
      render(still ? TIP_DEG * 0.6 : TIP_DEG * p * p);
      if (p < 1 && !still && typeof requestAnimationFrame === 'function') requestAnimationFrame(frame);
    };
    frame();
    tipTimer = setTimeout(() => { if (tip === t) { tip = null; tipTimer = null; render(); } }, TIP_MS);
  }

  render();
  return {
    undo() { if (done) return; stopTip(); history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; stopTip(); history.restart(); hinted = null; selected = n - 1; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      stopTip();
      const m = hintMove(level, history.state.r, wins);
      if (m) { hinted = {k: m[0], dir: m[1]}; selected = m[0]; }
      render();
    },
  };
}
