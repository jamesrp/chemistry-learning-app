// Crystal cells board: a cube of 27 spots, shown as its bottom, middle and
// top layers, with a small picture of the whole cube above. Pick a ball from
// the tray and tap a spot: the same ball goes into every spot like it (all 8
// corners, both opposite faces, the 4 parallel edges), because a crystal is
// the cube repeated. Tap a filled spot to take its balls back. Under the
// cube, each element's count adds the shares: a corner ⅛, an edge ¼, a face
// ½, the centre 1.
import levels from '../data/cell-levels.js';
import {SPOTS, setById, tally, sumText, ballsLeft, isSolved, clashes, elementsOf} from '../chem/cells.js';
import {h, s, tappable, History, f} from '../ui.js';

const P = 30, R = 10.5, GAP = 26, PANEL = 2 * P + 2 * R + 6;
const FILL = {Po: '#c4b2d6', Na: '#e2ddcc', Fe: '#aaa69c', Cu: '#d9925f', Cs: '#d2bd8f', Cl: '#9cc08f', Au: '#efc76e', Re: '#a3afc0',
  O: '#e7a28f', N: '#9cc9de', Ni: '#bccab3', Al: '#d3dbe2', Mg: '#ece6d2', Ca: '#f3eedf', Ti: '#9fabb9', Sr: '#e6d3a6'};
const NAME = {Po: 'polonium', Na: 'sodium', Fe: 'iron', Cu: 'copper', Cs: 'caesium', Cl: 'chloride', Au: 'gold', Re: 'rhenium', O: 'oxygen',
  N: 'nitrogen', Ni: 'nickel', Al: 'aluminum', Mg: 'magnesium', Ca: 'calcium', Ti: 'titanium', Sr: 'strontium'};
const LAYERS = ['Bottom', 'Middle', 'Top'];

export const cells = {
  id: 'cells',
  name: 'Crystal cells',
  shelf: 'materials',
  levels,
  howTo: [
    'A crystal is one small cube repeated over and over. Pick a ball in the tray, then tap a spot in the cube: every spot like it fills too, because the cube next door must match.',
    'A ball on a corner is shared by the 8 cubes that meet there, so only ⅛ of it belongs to this cube. An edge ball counts ¼, a face ball ½ and the ball in the middle 1.',
    'Use every ball in the tray and make the cube hold the atoms the board asks for. In salts, two of the same ion can’t sit side by side.',
  ],
  notes: {
    science: 'A metal is atoms packed like oranges in a crate, held together by a shared sea of electrons. How they pack is the metal’s lattice. Polonium is the only element that packs as plain cubes. Sodium, iron and tungsten are body-centred, with one atom in the middle of each cube of eight. Copper, aluminum, silver and gold are face-centred, which is the closest any spheres can pack (the same as a greengrocer’s stack of oranges). Iron changes from body-centred to face-centred when it is heated past about 900 °C, which is part of how steel is hardened. Salts and oxides pack two kinds of ion: in table salt each sodium sits among six chlorides and each chloride among six sodiums, a 3D checkerboard. Perovskite, calcium titanate, gives its name to a family of crystals now used in new solar cells.',
    maths: 'The cube is a unit cell, and the crystal is the cell translated by whole steps in three directions. A point on a corner lies in 8 cells, on an edge in 4 and on a face in 2, so it counts 1/8, 1/4 or 1/2 for each. Translation symmetry also forces the 8 corners to match, opposite faces to match and parallel edges to match, which splits the 27 spots into 8 orbits each worth exactly one atom: 8 × 1/8 = 4 × 1/4 = 2 × 1/2 = 1. So a cell’s formula is just which orbits each element fills, and the tray (how many balls) decides which orbits those must be. Every level is checked by trying all ways to fill the 8 orbits; each has exactly one answer. On the salt levels a second rule, no two like ions on neighbouring spots, is what rules out the others.',
    caution: 'The balls are drawn small so the inside shows; in a real metal the atoms touch. Only cubic cells appear here; magnesium, zinc and titanium pack in a hexagonal pattern that this board can’t show. Some of these structures are the textbook ideal: real Cu₃Au, for example, only orders this neatly when cooled slowly.',
    kitchen: 'Stack marbles, oranges or ping-pong balls in a square tray: a square layer, then a second layer in the dips, then a third. Count how many balls touch each one. Grow salt crystals from a strong salt solution on a saucer or a string over a few days and look at them with a magnifier: they are tiny cubes, because the cell is a cube.',
  },
  mount,
};

function mount(host, level, ctx) {
  const given = level.given || {}, els = elementsOf(level), trayEls = Object.keys(level.tray);
  const history = new History({fill: {...given}});
  let pick = trayEls[0], done = false, hinted = null;
  const goal = h('p', {class: 'puzzle-goal'});
  const tray = h('div', {class: 'tray cell-tray'});
  const cube = s('svg', {class: 'cell-cube', viewBox: '-9 -57 75 66', role: 'img', 'aria-label': 'The cube'});
  const layers = s('svg', {class: 'board-svg cells', viewBox: `-4 -4 ${3 * PANEL + 2 * GAP + 8} ${PANEL + 26}`, 'aria-label': 'Cube layers'});
  const counts = h('div', {class: 'cell-counts'});
  host.append(goal, tray, h('div', {class: 'cell-views'}, cube, layers), counts);
  const want = Object.entries(level.target).map(([el, n]) => `${n} ${el}`).join(', ');
  goal.textContent = `Use every ball, and make a cube that holds ${want}.${level.apart ? ' Two of the same ion can’t sit side by side.' : ''}`;

  const spotXY = p => [p.z * (PANEL + GAP) + R + 3 + p.x * P, R + 3 + (2 - p.y) * P];

  function render() {
    const {fill} = history.state, left = ballsLeft(level, fill), {atoms, parts} = tally(fill);
    const clash = level.apart ? clashes(fill) : new Set();
    tray.replaceChildren(...trayEls.map(el => {
      const chip = h('button', {type: 'button', class: `chip cell-chip ${left[el] ? '' : 'empty'}`, 'data-el': el, 'aria-pressed': String(pick === el),
        'aria-label': `${NAME[el]} balls, ${left[el]} left`, onclick: () => { pick = el; ctx.feedback(null); render(); }});
      chip.append(ballIcon(el), h('span', {class: 'chip-n'}, `×${left[el]}`));
      return chip;
    }));

    layers.replaceChildren();
    for (let z = 0; z < 3; z++) {
      const x0 = z * (PANEL + GAP);
      const g = s('g', {class: 'layer'});
      g.append(s('rect', {class: 'layer-card', x: x0, y: 0, width: PANEL, height: PANEL, rx: 8}));
      for (let k = 0; k < 3; k++) {
        g.append(s('line', {class: 'layer-line', x1: x0 + R + 3, y1: R + 3 + k * P, x2: x0 + R + 3 + 2 * P, y2: R + 3 + k * P}));
        g.append(s('line', {class: 'layer-line', x1: x0 + R + 3 + k * P, y1: R + 3, x2: x0 + R + 3 + k * P, y2: R + 3 + 2 * P}));
      }
      g.append(s('text', {class: 'layer-label', x: x0 + PANEL / 2, y: PANEL + 17}, LAYERS[z]));
      layers.append(g);
    }
    SPOTS.forEach((p, i) => {
      const [x, y] = spotXY(p), el = fill[p.set], st = setById(p.set), fixed = Boolean(given[p.set]);
      const g = s('g', {class: `spot ${el ? 'filled' : 'open'} ${fixed ? 'fixed' : ''} ${clash.has(i) ? 'clash' : ''} ${hinted && hinted.set === p.set ? 'hinted' : ''}`,
        transform: `translate(${x} ${y})`, 'data-spot': i, 'data-set': p.set});
      if (el) g.append(s('circle', {class: 'cell-ball', r: R, fill: FILL[el]}), s('text', {class: 'ball-label', y: 3.6, 'font-size': el.length > 1 ? 9 : 10.5}, el));
      else g.append(s('circle', {class: 'spot-ring', r: R - 1.5}), s('text', {class: 'spot-frac', y: 3.5, 'font-size': 10}, st.frac));
      if (!fixed && !done) {
        const hit = s('circle', {class: 'spot-hit', r: R + 3, 'data-spot': i});
        tappable(hit, el ? `${NAME[el]} on the ${st.name}; tap to take it back` : `Empty spot on the ${st.name}, worth ${st.frac}`, () => tap(p.set));
        g.append(hit);
      }
      layers.append(g);
    });

    drawCube(fill);
    counts.replaceChildren(...els.map(el => {
      const have = atoms[el] || 0, need = level.target[el] || 0;
      return h('div', {class: `cell-count ${have === need ? 'met' : ''}`, 'data-el': el},
        ballIcon(el), h('span', {class: 'count-sum'}, sumText(parts[el], have)), h('span', {class: 'count-want'}, `want ${need}`));
    }));
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && isSolved(level, fill)) { done = true; render(); ctx.solved({title: level.title, detail: level.detail}); }
  }

  // An oblique drawing: x across, y back and up a little, z up. Back balls first.
  function drawCube(fill) {
    const L = 34, at = ([x, y, z]) => [f(x * L + y * L * 0.5), f(-z * L - y * L * 0.42)];
    cube.replaceChildren();
    const corners = [];
    for (const x of [0, 2]) for (const y of [0, 2]) for (const z of [0, 2]) corners.push([x, y, z]);
    for (const a of corners) for (const b of corners) {
      const diff = a.filter((v, k) => v !== b[k]).length;
      if (diff !== 1 || a.join() > b.join()) continue;
      const [x1, y1] = at(a.map(v => v / 2)), [x2, y2] = at(b.map(v => v / 2));
      cube.append(s('line', {class: `cube-edge ${a[1] === 2 && b[1] === 2 ? 'back' : ''}`, x1, y1, x2, y2}));
    }
    [...SPOTS].sort((p, q) => q.y - p.y || p.z - q.z).forEach(p => {
      const [x, y] = at([p.x / 2, p.y / 2, p.z / 2]), el = fill[p.set];
      cube.append(el ? s('circle', {class: 'cube-ball', cx: x, cy: y, r: 5.2, fill: FILL[el]}) : s('circle', {class: 'cube-dot', cx: x, cy: y, r: 1.6}));
    });
  }

  function tap(set) {
    if (done) return;
    const fill = {...history.state.fill}, st = setById(set);
    hinted = null; ctx.feedback(null);
    if (fill[set]) delete fill[set];
    else {
      const left = ballsLeft(level, fill)[pick];
      if (left < st.size) {
        ctx.feedback(`The ${st.name} need ${st.size} ${NAME[pick]} ball${st.size > 1 ? 's' : ''}. ${left ? `Only ${left} left.` : 'None left.'}`);
        render(); return;
      }
      fill[set] = pick;
    }
    history.push({fill});
    render();
  }

  function ballIcon(el) {
    const icon = s('svg', {class: 'ball-icon', viewBox: '-12 -12 24 24', 'aria-hidden': 'true'});
    icon.append(s('circle', {class: 'cell-ball', r: 10.5, fill: FILL[el]}), s('text', {class: 'ball-label', y: 3.6, 'font-size': el.length > 1 ? 9 : 10.5}, el));
    return icon;
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); pick = trayEls[0]; render(); },
    hint() {
      if (done) return;
      const {fill} = history.state;
      const wrong = Object.keys(fill).find(set => fill[set] !== level.answer[set]);
      if (wrong) { hinted = {set: wrong}; ctx.feedback('These balls belong somewhere else.'); render(); return; }
      const next = Object.keys(level.answer).find(set => !fill[set]);
      hinted = next ? {set: next} : null;
      if (next) { pick = level.answer[next]; ctx.feedback(`Try ${NAME[pick]} here.`); }
      render();
    },
  };
}
