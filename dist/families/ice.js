// Square ice board: every link between two oxygens holds a hydrogen. Tap
// near an oxygen to slide the hydrogen close to it (tap there again to put it
// back in the middle). Each oxygen needs exactly two close hydrogens, which
// makes it a water molecule; its other two are hydrogen bonds to neighbours.
import levels from '../data/ice-levels.js';
import {links, counts, solved} from '../chem/ice.js';
import {s, tappable, History, f} from '../ui.js';

const S = 40, OR = 7.4, HR = 3.9, CLOSE = 12, STUB = 28;

export const ice = {
  id: 'ice',
  name: 'Square ice',
  levels,
  howTo: [
    'Every link between two oxygens holds one hydrogen. Tap near an oxygen to slide the hydrogen close to it. Tap there again to put it back in the middle.',
    'Each oxygen needs exactly two close hydrogens: that makes a water molecule, H–O–H. Its other two hydrogens belong to neighbours.',
    'Dark hydrogens are fixed.',
  ],
  mount,
};

function mount(host, level, ctx) {
  const {rows, cols} = level, L = links(rows, cols);
  const fixed = [...level.fixed].map(c => (c === '.' ? null : Number(c))), solution = [...level.solution].map(Number);
  const history = new History({values: fixed.map(v => (v === null ? -1 : v))});
  let done = false, hinted = null;
  const svg = s('svg', {class: 'board-svg ice', viewBox: `${-STUB - 6} ${-STUB - 6} ${(cols - 1) * S + 2 * STUB + 12} ${(rows - 1) * S + 2 * STUB + 12}`, 'aria-label': 'Ice board'});
  host.append(svg);
  const pos = ([r, c]) => [c * S, r * S];
  // An end that leaves the grid is drawn as a stub out from its oxygen.
  const endsOf = l => {
    const a = l.a ? pos(l.a) : null, b = l.b ? pos(l.b) : null;
    if (!a) return [l.kind === 'h' ? [b[0] - STUB, b[1]] : [b[0], b[1] - STUB], b];
    if (!b) return [a, l.kind === 'h' ? [a[0] + STUB, a[1]] : [a[0], a[1] + STUB]];
    return [a, b];
  };

  function render() {
    const {values} = history.state, {near, far} = counts(rows, cols, values);
    svg.replaceChildren();
    L.forEach((l, i) => {
      const [a, b] = endsOf(l), v = values[i], isFixed = fixed[i] !== null;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      // Close to an oxygen: CLOSE from it. Close to the outside: at the stub's end.
      const along = v === -1 ? len / 2 : v === 0 ? (l.a ? CLOSE : 2) : len - (l.b ? CLOSE : 2);
      const hpos = [a[0] + ux * along, a[1] + uy * along];
      const g = s('g', {class: `link ${isFixed ? 'fixed' : ''} ${hinted === i ? 'hinted' : ''}`});
      if (v === -1) g.append(s('line', {class: 'slot', x1: a[0], y1: a[1], x2: b[0], y2: b[1]}));
      else {
        const closeEnd = v === 0 ? a : b, farEnd = v === 0 ? b : a, closeReal = v === 0 ? l.a : l.b, farReal = v === 0 ? l.b : l.a;
        if (closeReal) g.append(s('line', {class: 'oh', x1: closeEnd[0], y1: closeEnd[1], x2: f(hpos[0]), y2: f(hpos[1])}));
        g.append(s('line', {class: `hbond ${farReal ? '' : 'out'}`, x1: f(hpos[0]), y1: f(hpos[1]), x2: farEnd[0], y2: farEnd[1]}));
      }
      if (!isFixed && !done) {
        // Two halves: tap the half by the oxygen you want the hydrogen close to.
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        for (const [side, end, real] of [[0, a, l.a], [1, b, l.b]]) {
          if (!real) continue;
          const hit = s('line', {class: 'hit', 'data-link': i, 'data-side': side, x1: f(end[0] + ux * (side ? -OR : OR)), y1: f(end[1] + uy * (side ? -OR : OR)), x2: f(mid[0]), y2: f(mid[1])});
          tappable(hit, `Hydrogen ${v === side ? 'close to this oxygen; tap to move it to the middle' : 'tap to move it close to this oxygen'}`, () => tap(i, side));
          g.append(hit);
        }
      }
      g.append(s('g', {class: 'hydrogen', transform: `translate(${f(hpos[0])} ${f(hpos[1])})`}, s('circle', {r: HR}), s('text', {y: 1.6, 'font-size': 4.6}, 'H')));
      svg.append(g);
    });
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const o = r * cols + c, [x, y] = pos([r, c]);
      const state = near[o] > 2 || far[o] > 2 ? 'over' : near[o] === 2 && far[o] === 2 ? 'full' : '';
      svg.append(s('g', {class: `atom el-O oxygen ${state}`, transform: `translate(${x} ${y})`}, s('circle', {class: 'atom-disc', r: OR}), s('text', {class: 'atom-label', y: 2.8, 'font-size': 8}, 'O')));
    }
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && solved(rows, cols, values)) { done = true; render(); ctx.solved({title: `${rows * cols} H₂O`, detail: 'every oxygen has two close hydrogens'}); }
  }

  function tap(i, side) {
    if (done) return;
    const values = history.state.values.slice();
    values[i] = values[i] === side ? -1 : side;
    hinted = null; ctx.feedback(null);
    history.push({values}); render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      const {values} = history.state, {near, far} = counts(rows, cols, values);
      const wrong = L.map((_, i) => i).filter(i => values[i] !== -1 && values[i] !== solution[i]);
      if (wrong.length) { hinted = wrong[0]; render(); ctx.feedback('This hydrogen is on the wrong side.'); return; }
      // Prefer a hydrogen the board already forces: next to an oxygen with two close or two far.
      const id = e => e[0] * cols + e[1];
      const open = L.map((_, i) => i).filter(i => values[i] === -1);
      const forced = open.find(i => [L[i].a, L[i].b].some(e => e && (near[id(e)] === 2 || far[id(e)] === 2)));
      hinted = forced ?? open[0] ?? null;
      render();
    },
  };
}
