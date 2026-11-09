// Crystal cells board: a cube of 27 spots, shown as its bottom, middle and
// top layers, beside a picture of the cube with its neighbours (a 2 × 2 × 2
// block, so a corner atom shows sitting in 8 cubes at once). Pick an atom
// and tap a spot: every spot like it fills too (all 8 corners, all 12 edges,
// all 6 faces), because the crystal is cubic. Tap a filled spot to empty it.
// Under the cube, each element's count adds the shares: a corner ⅛, an edge
// ¼, a face ½, the middle 1.
import levels from '../data/cell-levels.js';
import {SPOTS, CLASSES, classById, tally, sumText, isSolved, clashes, elementsOf, solveAll} from '../chem/cells.js';
import {h, s, tappable, History, f} from '../ui.js';

const P = 30, R = 10.5, GAP = 26, PANEL = 2 * P + 2 * R + 6;
const FILL = {Po: '#c4b2d6', Na: '#e2ddcc', Cu: '#d9925f', Cs: '#d2bd8f', Cl: '#9cc08f', Au: '#efc76e', Zn: '#b7c2cc',
  O: '#e7a28f', Ni: '#bccab3', Al: '#d3dbe2', Mg: '#ece6d2', K: '#e6d8c4'};
const NAME = {Po: 'polonium', Na: 'sodium', Cu: 'copper', Cs: 'caesium', Cl: 'chloride', Au: 'gold', Zn: 'zinc', O: 'oxygen',
  Ni: 'nickel', Al: 'aluminum', Mg: 'magnesium', K: 'potassium'};
const LAYERS = ['Bottom', 'Middle', 'Top'];
const RULE = {metal: 'No two atoms side by side.', salt: 'No two of the same ion side by side.'};

export const cells = {
  id: 'cells',
  name: 'Crystal cells',
  shelf: 'materials',
  levels,
  howTo: [
    'A crystal is one small cube repeated in every direction. Pick an atom, then tap a spot in the cube: every spot like it fills too, because every corner of the cube is alike, every edge is alike and every face is alike.',
    'Neighbouring cubes share what sits on their walls. A corner atom sits in 8 cubes at once, so only ⅛ of it belongs to this one; an edge atom counts ¼, a face atom ½ and the one in the middle 1. The picture shows the cube with its neighbours.',
    'Make the cube hold the atoms the board asks for. Metal atoms can’t sit side by side: they would overlap. In salts, two of the same ion can’t sit side by side, because like charges push apart.',
  ],
  notes: {
    science: 'A metal is atoms packed like oranges in a crate, held together by a shared sea of electrons. How they pack is the metal’s lattice. Polonium is the only element that packs as plain cubes. Sodium, iron and tungsten are body-centred, with one atom in the middle of each cube of eight. Copper, aluminum, silver and gold are face-centred, which is the closest any spheres can pack (the same as a greengrocer’s stack of oranges). Iron changes from body-centred to face-centred when it is heated past about 900 °C, which is part of how steel is hardened. Alloys can order themselves the same ways: beta brass is body-centred with copper and zinc taking turns, and Cu₃Au and Ni₃Al are face-centred with one metal on the corners. Salts pack two kinds of ion: in table salt each sodium sits among six chlorides and each chloride among six sodiums, a 3D checkerboard.',
    maths: 'The cube is a unit cell, and the crystal is the cell translated by whole steps in three directions. A point on a corner lies in 8 cells, on an edge in 4 and on a face in 2, so it counts 1/8, 1/4 or 1/2 for each. The crystals here are cubic, so the cube’s symmetries split the 27 spots into 4 classes: corners worth 8 × 1/8 = 1 atom, edges 12 × 1/4 = 3, faces 6 × 1/2 = 3 and the middle 1. Which cube you call the cell is a choice: translating by half the body diagonal swaps corners with the middle and edges with faces and leaves the crystal unchanged. That is why polonium drawn on the corners and polonium drawn in the middle are the same answer, and the board accepts both. A count alone doesn’t fix the crystal (corners and faces make 4, and so do corners and edges), so each board has one physical rule: metal atoms are all about the same size and never sit half a cube apart, and like ions never do. Every board is checked by trying all fills of the 4 classes: each accepts only its crystal, or its crystal shifted, and a given atom pins the shift.',
    caution: 'The balls are drawn small so the inside shows; in a real metal the atoms touch. Only cubic cells appear here; magnesium, zinc and titanium pack in a hexagonal pattern that this board can’t show, and crystals such as perovskite, where a count and the side-by-side rule allow two different crystals, are left out. Some of these structures are the textbook ideal: real Cu₃Au, for example, only orders this neatly when cooled slowly.',
    kitchen: 'Stack marbles, oranges or ping-pong balls in a square tray: a square layer, then a second layer in the dips, then a third. Count how many balls touch each one. Build a cube from 8 sugar cubes and push a marble into the hole in the middle where they meet: it touches all 8, which is the ⅛ share. Grow salt crystals from a strong salt solution on a saucer and look at them with a magnifier: they are tiny cubes, because the cell is a cube.',
  },
  mount,
};

function mount(host, level, ctx) {
  const given = level.given || {}, els = elementsOf(level);
  const history = new History({fill: {...given}});
  let pick = els.find(el => !Object.values(given).includes(el)) || els[0], done = false, hinted = null, solutions = null;
  const goal = h('p', {class: 'puzzle-goal'}, RULE[level.rule]);
  const tray = h('div', {class: 'tray cell-tray', hidden: els.length < 2});
  const block = s('svg', {class: 'cell-block', role: 'img', 'aria-label': 'The cube and its neighbours'});
  const layers = s('svg', {class: 'board-svg cells', viewBox: `-4 -4 ${3 * PANEL + 2 * GAP + 8} ${PANEL + 26}`, 'aria-label': 'Cube layers'});
  const counts = h('div', {class: 'cell-counts'});
  host.append(goal, tray, h('div', {class: 'cell-views'}, block, layers), counts);

  const spotXY = p => [p.z * (PANEL + GAP) + R + 3 + p.x * P, R + 3 + (2 - p.y) * P];

  function render() {
    const {fill} = history.state, {atoms, parts} = tally(fill), clash = clashes(level, fill);
    tray.replaceChildren(...els.map(el => {
      const chip = h('button', {type: 'button', class: 'chip cell-chip', 'data-el': el, 'aria-pressed': String(pick === el),
        'aria-label': NAME[el], onclick: () => { pick = el; ctx.feedback(null); render(); }});
      chip.append(ballIcon(el));
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
      const [x, y] = spotXY(p), el = fill[p.cls], c = classById(p.cls), fixed = Boolean(given[p.cls]);
      const g = s('g', {class: `spot ${el ? 'filled' : 'open'} ${fixed ? 'fixed' : ''} ${clash.has(i) ? 'clash' : ''} ${hinted === p.cls ? 'hinted' : ''}`,
        transform: `translate(${x} ${y})`, 'data-spot': i, 'data-class': p.cls});
      if (el) g.append(s('circle', {class: 'cell-ball', r: R, fill: FILL[el]}), s('text', {class: 'ball-label', y: 3.6, 'font-size': el.length > 1 ? 9 : 10.5}, el));
      else g.append(s('circle', {class: 'spot-ring', r: R - 1.5}), s('text', {class: 'spot-frac', y: 3.5, 'font-size': 10}, c.frac));
      if (!fixed && !done) {
        const hit = s('circle', {class: 'spot-hit', r: R + 3, 'data-spot': i});
        tappable(hit, el ? `${NAME[el]} on the ${c.name}; tap to take it away` : `Empty spot on the ${c.name}, worth ${c.frac}`, () => tap(p.cls));
        g.append(hit);
      }
      layers.append(g);
    });

    drawBlock(fill);
    counts.replaceChildren(...els.map(el => {
      const have = atoms[el] || 0, need = level.target[el];
      return h('div', {class: `cell-count ${have === need ? 'met' : ''}`, 'data-el': el},
        ballIcon(el), h('span', {class: 'count-sum'}, sumText(parts[el], have)), h('span', {class: 'count-want'}, `want ${need}`));
    }));
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && isSolved(level, fill)) { done = true; render(); ctx.solved({title: level.title, detail: level.detail}); }
  }

  // The cube and its 7 neighbours as a 2 × 2 × 2 block, drawn oblique: x
  // across, y back and up a little, z up. Coordinates are in half cubes
  // (0 to 4); this cube is the front-left-bottom one (0 to 2). Its atoms are
  // drawn solid, the neighbours' faint, back to front.
  function drawBlock(fill) {
    const H = 17, DX = 0.6, DY = 0.34, at = (x, y, z) => [f(x * H + y * H * DX), f(-z * H - y * H * DY)];
    const mine = (...q) => q.every(v => v <= 2);
    block.setAttribute('viewBox', `-9 ${f(-4 * H * (1 + DY) - 9)} ${f(4 * H * (1 + DX) + 18)} ${f(4 * H * (1 + DY) + 18)}`);
    block.replaceChildren();
    const lines = [];
    for (const a of [0, 2, 4]) for (const b of [0, 2, 4]) for (const t of [0, 2]) {
      lines.push([[t, a, b], [t + 2, a, b]], [[a, t, b], [a, t + 2, b]], [[a, b, t], [a, b, t + 2]]);
    }
    const homeLines = [];
    for (const [p, q] of lines) {
      const home = mine(...p) && mine(...q), [x1, y1] = at(...p), [x2, y2] = at(...q);
      const line = s('line', {class: home ? 'block-edge home' : 'block-edge', x1, y1, x2, y2});
      if (home) homeLines.push(line); else block.append(line);
    }
    const pts = [];
    for (let x = 0; x <= 4; x++) for (let y = 0; y <= 4; y++) for (let z = 0; z <= 4; z++) pts.push([x, y, z]);
    pts.sort((p, q) => q[1] - p[1] || p[2] - q[2] || p[0] - q[0]);
    let homeDrawn = false;
    for (const [x, y, z] of pts) {
      // The home cube's edges go in once the balls behind it are drawn.
      if (!homeDrawn && y <= 2) { block.append(...homeLines); homeDrawn = true; }
      const el = fill[classOfHalf(x, y, z)], [cx, cy] = at(x, y, z);
      if (el) block.append(s('circle', {class: `block-ball ${mine(x, y, z) ? 'home' : 'far'}`, cx, cy, r: mine(x, y, z) ? 4.6 : 3.6, fill: FILL[el]}));
      else if (mine(x, y, z)) block.append(s('circle', {class: 'block-dot', cx, cy, r: 1.3}));
    }
  }
  // A point in half cubes has the class of the matching spot in this cube.
  const classOfHalf = (...q) => 'CEFZ'[q.filter(v => v % 2 === 1).length];

  function tap(cls) {
    if (done) return;
    const fill = {...history.state.fill};
    hinted = null; ctx.feedback(null);
    if (fill[cls]) delete fill[cls];
    else fill[cls] = pick;
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
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); pick = els.find(el => !Object.values(given).includes(el)) || els[0]; render(); },
    hint() {
      if (done) return;
      const {fill} = history.state;
      // Aim at the accepted answer closest to what is on the board.
      solutions ||= solveAll(level);
      const score = sol => CLASSES.reduce((n, c) => n + (fill[c.id] ? (fill[c.id] === sol[c.id] ? 1 : -1) : 0), 0);
      const best = solutions.reduce((a, b) => (score(b) > score(a) ? b : a));
      const wrong = CLASSES.find(c => fill[c.id] && fill[c.id] !== best[c.id]);
      if (wrong) { hinted = wrong.id; ctx.feedback('These atoms belong somewhere else.'); render(); return; }
      const next = CLASSES.find(c => best[c.id] && !fill[c.id]);
      hinted = next ? next.id : null;
      if (next) { pick = best[next.id]; ctx.feedback(`Try ${NAME[pick]} here.`); }
      render();
    },
  };
}
