// Balance beams board: bars on a pivot with hooks at distances 1, 2, 3, 4
// each side. Tap a weight in the tray, then a hook, to hang it; tap a hung
// weight to put it back. Each beam tilts toward its heavier turning side and
// turns green when it is level. A lower beam hangs by a string from a hook of
// the beam above; where its string is loose (free), tap the string, then a
// hook, to move it.
import levels from '../data/beams-levels.js';
import {evaluate, hooksOf, trayLeft, isSolved, solveAll, hintMove, emptyState, hooks, reach, hangOf, key} from '../phys/beams.js';
import {h, s, tappable, History, f, flash} from '../ui.js';

const UNIT = [44, 36, 32], DROP = 78, STRING = 8, MAXT = 8, BAR = 4.5;
const wW = w => 16 + 1.8 * w, wH = w => 14 + 1.5 * w;
const tiltOf = t => (t === 0 ? 0 : Math.sign(t) * Math.min(MAXT, 2.5 + Math.abs(t) * 0.45));
const where = (p, b) => `${Math.abs(p)} ${p < 0 ? 'left' : 'right'}${b > 0 ? ` on lower beam ${b}` : ''}`;

export const beams = {
  id: 'beams',
  name: 'Balance beams',
  shelf: 'physics',
  levels,
  howTo: [
    'Tap a weight, then a hook, to hang it. Tap a hung weight to take it off.',
    'A beam is level, and turns green, when weight × distance adds up to the same on both sides.',
    'A lower beam pulls on its hook with everything it carries. Tap a loose string, then a hook, to move it.',
    'Hang every weight with every beam level. Dark weights stay put.',
  ],
  notes: {
    science: 'A weight hanging from a bar turns it about the pivot, and the turning effect (the torque, or moment) is the weight times its distance from the pivot. The bar stays level when the turning effects on the two sides cancel. This is the law of the lever, which Archimedes proved for weights on a balance; the line "give me a place to stand and I will move the earth" is attributed to him in later writers. It is why a small child far out on a seesaw can hold up a grown-up near the middle, why a crowbar or a bottle opener multiplies a push, and how a steelyard weighs a sack with one small sliding weight. In a mobile a lower beam hangs from one string, so the beam above feels only its total weight at that hook, however it is spread out below; when the lower beam is level, its centre of mass sits right under its string.',
    maths: 'Each beam is one linear equation with whole numbers: the sum of w × d over the left equals the sum over the right, so a beam with hooks 1 to 4 asks for two sub-sums of a weighted set to agree. A mobile is a rooted tree: a beam balances on its own equation, and passes up only one number, its total. So the balance conditions are solved from the leaves up, which is what makes a deep mobile tractable, and what makes the bottom beam the place to start. With only hooks at distance 1, balancing a tray is exactly splitting it into two equal sums, the partition problem, which is NP-complete in general; these trays are small enough to search completely. Counting the arrangements of a tray is a small integer problem (place a multiset on hooks so each equation holds); the levels were chosen by an exhaustive search so that each has exactly one answer, or exactly two that are mirror images when the board is symmetric, and the checker accepts any arrangement that balances.',
    caution: 'These beams have no weight of their own, and their pivots sit exactly on the bar, which is a model. A real ruler or coat hanger has weight, which helps if the pivot is at its middle, and a real balance hangs from a point above its bar, so it settles at a tilt instead of tipping all the way; here the tilt is only a picture of which side turns harder. Strings and weights are treated as points at the hooks. Strictly, the turning effect uses the sideways distance from the pivot, which for a level bar is just the hook\'s distance.',
    kitchen: 'Balance a ruler on a round pencil at the 15 cm mark and stack coins on it: two coins 6 cm from the pencil balance one coin 12 cm out on the other side. Mark the ruler at whole steps and try the puzzles\' trays with coin stacks. Then make a mobile from a wire coat hanger or two straws and string, with paper clips or washers as weights. Try balancing it from the top down, then from the bottom up, and notice which works. Keep small washers and coins away from very young children, and mind the hanger\'s wire ends.',
  },
  mount,
};

function mount(host, level, ctx) {
  const depth = level.beams.map(() => 0);
  level.beams.forEach((bm, b) => { if (bm.parent) depth[b] = depth[bm.parent[0]] + 1; });
  const unit = b => UNIT[Math.min(depth[b], UNIT.length - 1)];
  const free = level.beams.map((bm, b) => b).filter(b => level.beams[b].free);
  const history = new History(emptyState(level));
  let done = false, sel = null, hinted = null, sols = null;

  // Where each pivot and hook is, for given tilts (degrees).
  function layout(state, tilts) {
    const piv = [], ang = tilts.map(t => (t * Math.PI) / 180);
    const hole = (b, p) => [piv[b][0] + p * unit(b) * Math.cos(ang[b]), piv[b][1] + p * unit(b) * Math.sin(ang[b])];
    level.beams.forEach((bm, b) => {
      if (!bm.parent) { piv[b] = [0, 0]; return; }
      const [x, y] = hole(bm.parent[0], hangOf(level, state, b));
      piv[b] = [x, y + DROP];
    });
    return {piv, hole};
  }

  // A steady viewBox: every free hanging place and every tilt, at the extremes.
  const heaviest = Math.max(...level.tray, ...level.fixed.map(x => x[2]));
  const pts = [[-40, -46], [40, -46]];
  const states = [emptyState(level), ...free.flatMap(c => hooks(level.beams[level.beams[c].parent[0]]).map(p => ({placed: {}, hang: {...emptyState(level).hang, [c]: p}})))];
  for (const st of states) for (const t of [0, MAXT, -MAXT]) {
    const {piv} = layout(st, level.beams.map(() => t));
    level.beams.forEach((bm, b) => {
      const [l, r] = reach(bm), u = unit(b), a = (t * Math.PI) / 180;
      for (const p of [-l, r]) {
        const x = piv[b][0] + p * u * Math.cos(a), y = piv[b][1] + p * u * Math.sin(a);
        pts.push([x - (p < 0 ? 22 : 0), y - 16], [x + (p > 0 ? 22 : 0), y + STRING + 6 + wH(heaviest) + 4]);
      }
    });
  }
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const half = Math.max(-Math.min(...xs), Math.max(...xs)) + 8, y0 = Math.min(...ys) - 4, y1 = Math.max(...ys) + 6;
  const svg = s('svg', {class: 'board-svg beams', viewBox: `${f(-half)} ${f(y0)} ${f(2 * half)} ${f(y1 - y0)}`, 'aria-label': 'Balance board'});
  const tray = h('div', {class: 'tray beam-tray'});
  host.append(svg, tray);

  function render() {
    const st = history.state, ev = evaluate(level, st), tilts = ev.torque.map(tiltOf);
    const {piv, hole} = layout(st, tilts), left = trayLeft(level, st);
    const strings = s('g'), bars = s('g'), front = s('g');
    svg.replaceChildren(
      s('rect', {class: 'ceiling', x: -34, y: -46, width: 68, height: 6, rx: 2}),
      s('line', {class: 'rod', x1: 0, y1: -40, x2: 0, y2: 0}), strings, bars, front);
    level.beams.forEach((bm, b) => {
      const [l, r] = reach(bm), u = unit(b), [x, y] = piv[b], items = hooksOf(level, st, b);
      const levelNow = ev.torque[b] === 0 && ev.total[b] > 0;
      const bar = s('g', {class: `beam${levelNow ? ' level' : ''}`, 'data-beam': b, transform: `translate(${f(x)} ${f(y)}) rotate(${f(tilts[b])})`});
      bar.append(s('rect', {class: 'bar', x: -l * u - 8, y: -BAR, width: (l + r) * u + 16, height: 2 * BAR, rx: BAR}));
      for (const p of hooks(bm)) bar.append(s('circle', {class: 'hole', cx: p * u, r: 1.7}), s('text', {class: 'dist', x: p * u, y: -BAR - 3, 'font-size': 8}, String(Math.abs(p))));
      bar.append(s('circle', {class: 'pin', r: 3.4}));
      bars.append(bar);
      for (const p of hooks(bm)) {
        const [hx, hy] = hole(b, p), it = items[p], k = key(b, p);
        if (it && it.child !== undefined) {
          const c = it.child, [cx, cy] = piv[c], loose = level.beams[c].free;
          const g = s('g', {class: `hanger${loose ? ' loose' : ''}${sel?.beam === c ? ' chosen' : ''}${hinted?.kind === 'hang' && hinted.beam === c ? ' hinted' : ''}`});
          g.append(s('line', {class: 'string', x1: f(hx), y1: f(hy + BAR), x2: f(cx), y2: f(cy - BAR)}), s('circle', {class: 'knot', cx: f(hx), cy: f(hy), r: loose ? 3.4 : 2.4}));
          if (loose && !done) {
            const hit = s('line', {class: 'hit', 'data-hanger': c, x1: f(hx), y1: f(hy + 6), x2: f(cx), y2: f(cy - 8)});
            tappable(hit, `String of lower beam ${c}, on hook ${where(p, b)}; tap, then a hook, to move it`, () => tapHanger(c));
            g.append(hit);
          }
          front.append(g);
        } else if (it) {
          strings.append(s('line', {class: 'string', x1: f(hx), y1: f(hy), x2: f(hx), y2: f(hy + STRING)}));
          const g = weightGlyph(it.w, hx, hy + STRING, `${it.fixed ? 'fixed' : ''}${hinted?.kind === 'remove' && hinted.key === k ? ' hinted' : ''}`);
          g.setAttribute('data-key', k);
          if (!it.fixed && !done) tappable(g, `Weight ${it.w} on hook ${where(p, b)}; tap to take it off`, () => takeOff(k));
          front.append(g);
        } else if (!done) {
          const target = (hinted?.kind === 'place' && hinted.key === k) || (hinted?.kind === 'hang' && level.beams[hinted.beam].parent[0] === b && hinted.p === p);
          const ready = sel && (sel.w !== undefined || level.beams[sel.beam].parent[0] === b);
          const g = s('g', {class: `hook${ready ? ' ready' : ''}${target ? ' hinted' : ''}`, 'data-key': k});
          g.append(s('line', {class: 'drop', x1: f(hx), y1: f(hy + 3), x2: f(hx), y2: f(hy + 22)}), s('circle', {class: 'spot', cx: f(hx), cy: f(hy + 24), r: 3}));
          const hit = s('line', {class: 'hit', 'data-key': k, x1: f(hx), y1: f(hy + 4), x2: f(hx), y2: f(hy + 30)});
          tappable(hit, `Hook ${where(p, b)}, empty`, () => tapHook(b, p));
          g.append(hit);
          front.append(g);
        }
      }
    });
    // The tray: what is left to hang, smallest first.
    tray.replaceChildren(...left.map((w, i) => {
      const chosen = sel?.w === w && left.indexOf(w) === i;
      const mark = hinted?.kind === 'place' && hinted.w === w && left.indexOf(w) === i;
      const btn = h('button', {type: 'button', class: `chip beam-chip${mark ? ' hinted' : ''}`, 'aria-pressed': chosen ? 'true' : 'false', 'aria-label': `Weight ${w}`, 'data-w': w, onclick: () => tapChip(w)});
      const vb = [-wW(9) / 2 - 2, -1, wW(9) + 4, wH(9) + 9];
      btn.append(s('svg', {class: 'chip-weight', viewBox: vb.map(f).join(' '), width: f(vb[2] * 1.15), height: f(vb[3] * 1.15), 'aria-hidden': 'true'}, weightGlyph(w, 0, 0, '')));
      return btn;
    }));
    tray.hidden = left.length === 0;
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && isSolved(level, st)) {
      done = true; sel = null; hinted = null; render();
      ctx.solved({title: `${ev.left[0]} = ${ev.right[0]}`, detail: sums(level, st, ev)});
    }
  }

  const clearMarks = () => { hinted = null; ctx.feedback(null); };
  function tapChip(w) {
    if (done) return;
    sel = sel?.w === w ? null : {w};
    ctx.feedback(null); render();
  }
  function tapHanger(c) {
    if (done) return;
    sel = sel?.beam === c ? null : {beam: c};
    ctx.feedback(null); render();
  }
  function tapHook(b, p) {
    if (done) return;
    const st = history.state, left = trayLeft(level, st);
    if (sel?.beam !== undefined) {
      if (level.beams[sel.beam].parent[0] !== b) { sel = null; render(); return; }
      history.push({placed: st.placed, hang: {...st.hang, [sel.beam]: p}});
      sel = null; clearMarks(); render(); return;
    }
    const w = sel?.w ?? (new Set(left).size === 1 ? left[0] : null);
    if (w === null || !left.includes(w)) { flash(tray); return; }
    history.push({placed: {...st.placed, [key(b, p)]: w}, hang: st.hang});
    sel = null;
    clearMarks(); render();
  }
  function takeOff(k) {
    if (done) return;
    const placed = {...history.state.placed};
    delete placed[k];
    history.push({placed, hang: history.state.hang});
    clearMarks(); render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); sel = null; clearMarks(); render(); },
    restart() { done = false; sel = null; history.restart(); clearMarks(); render(); },
    hint() {
      if (done) return;
      sols ||= solveAll(level);
      hinted = hintMove(level, history.state, sols);
      sel = null;
      render();
      ctx.feedback(hinted?.kind === 'remove' ? 'This weight is in the wrong place.' : null);
    },
  };
}

// A hanging weight: a loop and a stamped block, wider and taller as it gets heavier.
function weightGlyph(w, x, y, cls) {
  const W = wW(w), H = wH(w), top = 5;
  return s('g', {class: `weight ${cls}`.trim(), transform: `translate(${f(x)} ${f(y)})`},
    s('circle', {class: 'loop', cy: 2.4, r: 2.4}),
    s('path', {class: 'block', d: `M${f(-W * 0.36)} ${top}H${f(W * 0.36)}L${f(W / 2)} ${f(top + H)}H${f(-W / 2)}Z`}),
    s('text', {class: 'stamp', y: f(top + H * 0.5 + 4.2), 'font-size': f(11 + w * 0.35)}, String(w)));
}

// The top beam's sums, e.g. "2×3 = 3×2", a lower beam counted as its total.
function sums(level, st, ev) {
  const items = Object.entries(hooksOf(level, st, 0)).map(([p, it]) => [Number(p), it.child !== undefined ? ev.total[it.child] : it.w]);
  const side = sgn => items.filter(([p]) => Math.sign(p) === sgn).sort((a, b) => Math.abs(b[0]) - Math.abs(a[0])).map(([p, w]) => `${w}×${Math.abs(p)}`).join(' + ');
  return `${side(-1)} = ${side(1)}`;
}
