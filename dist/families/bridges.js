// Valence bridges board: tap the gap between two atoms to add a bond (one,
// two, three, then none again). Each atom shows its outer electrons as dots;
// a bond takes one lone dot from each end, so an atom is done when it has no
// lone single dots left.
import {BRIDGE_LEVELS} from '../data/bridges-levels.js';
import {edgeCap, status, solveAll, hintMove} from '../chem/bridges.js';
import {lonePairsOf} from '../chem/elements.js';
import {h, s, tappable, History, viewBoxAround, bondLines, atomGlyph, f, flash} from '../ui.js';

const R = 6.2, DOT_R = 1.05, DOT_RING = R + 3.1;

export const bridges = {
  id: 'bridges',
  name: 'Valence bridges',
  levels: BRIDGE_LEVELS,
  howTo: [
    'Tap between two atoms to join them. Tap again for a double bond, again for a triple, again to take it away.',
    'Each bond uses one lone dot from each atom. An atom is finished when it has no lone dots left: H makes 1 bond, O 2, N 3, C 4.',
    'Every atom finished and all of them joined into one molecule solves the board.',
  ],
  mount,
};

function mount(host, level, ctx) {
  const history = new History({orders: level.edges.map(() => 0), found: []});
  let solutions = null, hinted = null, done = false;
  const atomsXY = level.atoms.map(([, x, y]) => [x, y]);
  const vb = viewBoxAround(atomsXY, {pad: 16});
  const svg = s('svg', {class: 'board-svg bridges', viewBox: vb.box, 'aria-label': 'Molecule board'});
  const shelf = h('div', {class: 'shelf', hidden: !level.findAll});
  host.append(svg, shelf);

  const neighbours = level.atoms.map(() => []);
  level.edges.forEach(([u, v], i) => { neighbours[u].push([v, i]); neighbours[v].push([u, i]); });

  function render() {
    const {orders, found} = history.state, st = status(level, orders);
    svg.replaceChildren();
    // Candidate bonds, then bonds, then tap targets, then atoms on top.
    level.edges.forEach(([u, v], i) => {
      const a = atomsXY[u], b = atomsXY[v], o = orders[i];
      const g = s('g', {class: `edge${hinted && hinted.edge === i ? ' hinted' : ''}`});
      if (o === 0) g.append(s('line', {class: 'slot', x1: a[0], y1: a[1], x2: b[0], y2: b[1]}));
      g.append(...bondLines(a, b, o, {pull: R + 0.6, gap: 2.5}));
      const hit = s('line', {class: 'hit', 'data-e': i, x1: a[0], y1: a[1], x2: b[0], y2: b[1]});
      const names = `${level.atoms[u][0]} to ${level.atoms[v][0]}`;
      tappable(hit, `Bond ${names}, ${['none', 'single', 'double', 'triple'][o]}`, () => tap(i));
      g.append(hit);
      svg.append(g);
    });
    level.atoms.forEach(([el, x, y], i) => {
      const a = st.atoms[i];
      const g = atomGlyph(el, x, y, {r: R, cls: `${a.full ? 'full' : ''} ${a.over ? 'over' : ''}`});
      g.querySelector('circle').setAttribute('aria-hidden', 'true');
      g.append(...dots(i, a, orders));
      svg.append(g);
    });
    shelf.replaceChildren(...found.map(orders => miniOf(orders)));
    ctx.changed({canUndo: history.canUndo});
    if (!done) check(st, orders);
  }

  // Lewis dots: lone single electrons point at a neighbour they could bond
  // with; lone pairs fill the widest gaps between bonds.
  function dots(i, a, orders) {
    const el = level.atoms[i][0], [x, y] = atomsXY[i];
    const singles = Math.max(0, a.need - a.load), pairs = lonePairsOf(el);
    const taken = [], out = [];
    const angleTo = j => Math.atan2(atomsXY[j][1] - y, atomsXY[j][0] - x);
    for (const [j, e] of neighbours[i]) if (orders[e] > 0) taken.push(angleTo(j));
    const open = neighbours[i].filter(([, e]) => orders[e] === 0).map(([j]) => angleTo(j));
    const place = () => {
      if (!taken.length) return -Math.PI / 2;
      const sorted = [...taken].sort((p, q) => p - q);
      let best = 0, at = 0;
      sorted.forEach((t, k) => { const next = k + 1 < sorted.length ? sorted[k + 1] : sorted[0] + 2 * Math.PI, gap = next - t; if (gap > best) { best = gap; at = t + gap / 2; } });
      return at;
    };
    const groups = [];
    for (let k = 0; k < singles; k++) {
      const free = open.find(t => !taken.some(u => Math.abs(norm(u - t)) < 0.3));
      const t = free !== undefined ? free : place();
      taken.push(t); groups.push([t, 1]);
    }
    for (let k = 0; k < pairs; k++) { const t = place(); taken.push(t); groups.push([t, 2]); }
    for (const [t, n] of groups) {
      const cx = Math.cos(t) * DOT_RING, cy = Math.sin(t) * DOT_RING;
      const px = -Math.sin(t) * 1.45, py = Math.cos(t) * 1.45;
      const spots = n === 1 ? [[cx, cy]] : [[cx + px, cy + py], [cx - px, cy - py]];
      for (const [dx, dy] of spots) out.push(s('circle', {class: n === 1 ? 'dot single' : 'dot pair', cx: f(dx), cy: f(dy), r: DOT_R}));
    }
    return out;
  }

  function tap(i) {
    if (done) return;
    const orders = history.state.orders.slice();
    orders[i] = (orders[i] + 1) % (edgeCap(level, i) + 1);
    hinted = null;
    ctx.feedback(null);
    history.push({...history.state, orders});
    render();
  }

  function check(st, orders) {
    if (!st.solved) return;
    if (!level.findAll) { done = true; ctx.solved({title: level.formula, detail: level.name}); return; }
    const {found} = history.state, key = orders.join('');
    if (found.some(o => o.join('') === key)) { flash(shelf.children[found.findIndex(o => o.join('') === key)]); ctx.feedback('Already found. There is another way.'); return; }
    const nextFound = [...found, orders];
    if (nextFound.length >= level.solutions) {
      history.push({orders, found: nextFound}); done = true; render();
      ctx.solved({title: level.formula, detail: `${level.name}: both ways`});
      return;
    }
    // Keep this one on the shelf and start again on a clear board.
    setTimeout(() => { history.push({orders: level.edges.map(() => 0), found: nextFound}); render(); ctx.feedback('One more way.'); }, 700);
  }

  function miniOf(orders) {
    const atoms = level.atoms, bonds = level.edges.map(([u, v], i) => [u, v, orders[i]]).filter(b => b[2] > 0);
    return h('div', {class: 'shelf-item'}, miniSVG(atoms, bonds));
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      solutions ||= solveAll(level);
      const {orders, found} = history.state;
      const left = solutions.filter(sol => !found.some(o => o.join('') === sol.join('')));
      hinted = hintMove(orders, left.length ? left : solutions);
      render();
    },
  };
}

function miniSVG(atoms, bonds) {
  const vb = viewBoxAround(atoms.map(([, x, y]) => [x, y]), {pad: 8, minW: 0, minH: 0});
  const svg = s('svg', {class: 'mini', viewBox: vb.box, role: 'img', 'aria-label': 'Found structure'});
  for (const [i, j, o] of bonds) svg.append(...bondLines([atoms[i][1], atoms[i][2]], [atoms[j][1], atoms[j][2]], o, {pull: R * 0.9, gap: 2.5}));
  atoms.forEach(([el, x, y]) => svg.append(atomGlyph(el, x, y, {r: R})));
  return svg;
}
const norm = t => Math.atan2(Math.sin(t), Math.cos(t));
