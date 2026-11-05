// Laser bench board: lamps, targets and walls on a square grid, and a tray
// of mirrors (later also half-silvered splitters). Tap a piece in the tray,
// then an empty square to put it there; tap a placed piece to flip it, and
// again to take it back. The beams redraw after every move, and each target
// shows the colour it receives inside a ring of the colour it wants.
import levels from '../data/laser-levels.js';
import {parse, trace, isLitRight, used, hint as hintFor, fromWitness, COLOUR_NAME, LETTER} from '../phys/laser.js';
import {h, s, tappable, History} from '../ui.js';

const S = 40, TR = 12.5;
const HUE = {R: '#e0412b', G: '#2e9e4c', B: '#2f68d8', Y: '#f4c430', M: '#c23fae', C: '#25b4c6', W: '#ffffff'};
const hue = mask => HUE[LETTER[mask]];
const PIECE = {m: 'mirror', s: 'splitter'};
const SIDE = {N: [0, -0.5], S: [0, 0.5], E: [0.5, 0], W: [-0.5, 0]};

export const laser = {
  id: 'laser',
  name: 'Laser bench',
  shelf: 'physics',
  levels,
  howTo: [
    'Tap a mirror in the tray, then tap an empty square to put it there. Tap a placed mirror to flip it the other way; tap it again to put it back in the tray.',
    'A mirror turns a beam through a right angle. A splitter (the pale glass) lets the beam go straight on and also turns a copy, so one lamp can reach two places.',
    'Light every target with exactly its colour. Coloured light adds: red and green make yellow, and red, green and blue together make white. A target shows what it gets inside a ring of what it wants.',
  ],
  notes: {
    science: 'A mirror reflects light so that the angle in equals the angle out; set at 45° across a square it turns a beam through a right angle. A half-silvered mirror (a beam splitter) reflects part of the light and lets the rest through, which is how one lamp lights two targets. Coloured lights add: red and green light together look yellow, and red, green and blue look white, because our eyes have three kinds of colour cell and a screen or a stage light only has to excite them in the right mix. Paint and ink work the other way (they take colours out), which is why mixing red and green paint gives a muddy brown instead.',
    maths: 'A beam is a path on the grid graph whose direction changes only at pieces; a mirror acts on the four directions as a reflection (/ swaps east with north and west with south, \\ swaps east with south and west with north), and a splitter is the sum of “go straight” and “reflect”. Colours are subsets of {red, green, blue}, and mixing is union, so the eight colours form a Boolean lattice; a target is right when its set of arriving colours is exactly its own. Every board is checked by an exhaustive search over all placements of the tray: it places pieces only on squares a beam already crosses, which loses nothing because in any answer the pieces can be put down in the order a beam first reaches them. A blind search over every placement agrees with it on the boards of up to three pieces. Each board’s full list of answers is stored and checked: the trays are tight (one fewer piece of any kind leaves no answer), Medium boards have one or two answers, and every Hard board has exactly one.',
    caution: 'The board simplifies on purpose. A splitter really sends half the light each way, so a target fed through two splitters gets a quarter; here a target only asks whether a colour arrives. Mirrors are silvered on both sides. And two beams from the same laser that are split and brought back together can interfere (that is how an interferometer works); the puzzle ignores it. Red, green and blue make white for human eyes, not because white light is “made of” exactly those three.',
    kitchen: 'A torch and a hand mirror: bounce the light onto a paper target across a dark room, then add a second mirror to go round a chair. Three torches with red, green and blue cellophane (two layers each) shone onto white paper make yellow, cyan, magenta and, where all three overlap, nearly white; shadows of a hand turn coloured. A magnifier on a phone screen showing white shows the red, green and blue dots. Skip laser pointers: they can damage eyes, even bounced off a mirror.',
  },
  mount,
};

function mount(host, level, ctx) {
  const board = parse(level), {rows, cols} = board;
  const answers = level.answers.map(fromWitness);
  const history = new History({placed: {}});
  const kinds = ['m', 's'].filter(k => board.tray[k] > 0);
  let pick = kinds[0], done = false, hinted = null;

  const tray = h('div', {class: 'tray laser-tray'});
  const svg = s('svg', {class: 'board-svg laser', viewBox: `-3 -3 ${cols * S + 6} ${rows * S + 6}`, 'aria-label': 'Light bench'});
  host.append(tray, svg);
  const at = key => key.split(',').map(Number);
  const cx = c => c * S + S / 2, cy = r => r * S + S / 2;

  function render() {
    const {placed} = history.state, t = trace(board, placed), n = used(placed);
    // The tray: one chip per kind of piece, with how many are left.
    tray.replaceChildren(...kinds.map(k => {
      const left = board.tray[k] - n[k];
      const chip = h('button', {type: 'button', class: `chip piece-chip ${left ? '' : 'empty'}`, 'data-kind': k, 'aria-pressed': String(pick === k), 'aria-label': `${PIECE[k]}, ${left} left`,
        onclick: () => { pick = k; ctx.feedback(null); render(); }});
      chip.append(pieceIcon(k), h('span', {class: 'chip-n'}, `×${left}`));
      return chip;
    }));

    svg.replaceChildren();
    const grid = s('g', {class: 'bench'});
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const kind = board.cells[r * cols + c];
      grid.append(s('rect', {class: kind === 'wall' ? 'wall' : 'square', x: c * S, y: r * S, width: S, height: S}));
      if (kind === 'wall') grid.append(s('path', {class: 'hatch', d: `M${c * S + 8} ${r * S + S - 2}l${S - 10} ${-S + 10}M${c * S + 2} ${r * S + S - 8}l${S - 10} ${-S + 10}M${c * S + 20} ${r * S + S - 2}l${S - 22} ${-S + 22}M${c * S + 2} ${r * S + S - 20}l${S - 22} ${-S + 22}`}));
    }
    svg.append(grid);

    // Beams: an ink casing under every stretch first, then the light, so
    // crossings stay clean and yellow and white read on paper.
    const beams = s('g', {class: 'beams'}), runs = runsOf(t.halves);
    for (const run of runs) beams.append(s('line', {class: 'beam-case', ...run.at}));
    for (const run of runs) beams.append(s('line', {class: 'beam', stroke: hue(run.mask), ...run.at}));
    svg.append(beams);

    for (const [key, code] of Object.entries(placed)) svg.append(pieceAt(at(key), code, 'placed'));
    board.lamps.forEach(l => svg.append(lampAt(l)));
    board.targets.forEach((tg, i) => svg.append(targetAt(tg, t.got[i])));

    if (hinted) {
      const [r, c] = at(hinted.cell);
      svg.append(s('rect', {class: 'hint-mark', x: c * S + 2, y: r * S + 2, width: S - 4, height: S - 4, rx: 5}));
      if (hinted.code && !placed[hinted.cell]) svg.append(pieceAt([r, c], hinted.code, 'ghost'));
    }

    if (!done) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (board.cells[r * cols + c] !== 'empty') continue;
      const key = `${r},${c}`, code = placed[key];
      const label = code ? `${PIECE[code[0]]} ${code[1] === '/' ? 'leaning right' : 'leaning left'}; tap to ${code[1] === '/' ? 'flip it' : 'take it back'}` : `Empty square, row ${r + 1}, column ${c + 1}`;
      svg.append(tappable(s('rect', {class: 'cell-hit', 'data-cell': key, x: c * S, y: r * S, width: S, height: S}), label, () => tap(key)));
    }

    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && isLitRight(board, t.got)) { done = true; render(); ctx.solved({title: level.fact || factOf(n)}); }
  }

  function tap(key) {
    if (done) return;
    const placed = {...history.state.placed}, code = placed[key];
    hinted = null; ctx.feedback(null);
    if (code) {
      if (code[1] === '/') placed[key] = code[0] + '\\';
      else delete placed[key];
    } else {
      if (used(placed)[pick] >= board.tray[pick]) {
        const other = kinds.find(k => used(placed)[k] < board.tray[k]);
        ctx.feedback(other ? `No ${PIECE[pick]}s left. Tap the ${PIECE[other]}.` : 'The tray is empty.');
        render(); return;
      }
      placed[key] = pick + '/';
    }
    history.push({placed});
    render();
  }

  function pieceAt([r, c], code, cls) {
    const x = c * S, y = r * S, m = 6;
    const [x1, y1, x2, y2] = code[1] === '/' ? [x + m, y + S - m, x + S - m, y + m] : [x + m, y + m, x + S - m, y + S - m];
    const kind = code[0] === 'm' ? 'mirror' : 'splitter';
    return s('g', {class: `piece ${kind} ${cls}`, 'data-piece': `${r},${c}`},
      s('line', {class: 'piece-case', x1, y1, x2, y2}), s('line', {class: 'piece-face', x1, y1, x2, y2}));
  }

  function lampAt(l) {
    const x = cx(l.c), y = cy(l.r), [dx, dy] = SIDE[l.dir].map(v => v * 2);
    const g = s('g', {class: 'lamp', 'aria-label': `${COLOUR_NAME[l.mask]} lamp`, role: 'img'});
    const across = dx !== 0, nw = across ? 7 : 14, nh = across ? 14 : 7;
    g.append(s('rect', {class: 'lamp-nose', x: x + dx * 16.5 - nw / 2, y: y + dy * 16.5 - nh / 2, width: nw, height: nh, rx: 1.5}));
    g.append(s('rect', {class: 'lamp-body', x: x - 14, y: y - 14, width: 28, height: 28, rx: 7}));
    g.append(s('circle', {class: 'lamp-lens', cx: x + dx * 4, cy: y + dy * 4, r: 7, fill: hue(l.mask)}));
    return g;
  }

  function targetAt(tg, got) {
    const x = cx(tg.c), y = cy(tg.r), right = got === tg.want;
    const g = s('g', {class: `target ${right ? 'lit' : got ? 'wrong' : 'dark'}`, role: 'img',
      'aria-label': `Target wanting ${COLOUR_NAME[tg.want]}, ${got ? `getting ${COLOUR_NAME[got]}` : 'dark'}`});
    if (right) for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8, u = Math.cos(a), v = Math.sin(a);
      const ray = {x1: x + u * (TR + 3), y1: y + v * (TR + 3), x2: x + u * (TR + 7.5), y2: y + v * (TR + 7.5)};
      g.append(s('line', {class: 'ray-case', ...ray}), s('line', {class: 'ray', stroke: hue(got), ...ray}));
    }
    g.append(s('circle', {class: 'target-case', cx: x, cy: y, r: TR}));
    g.append(s('circle', {class: 'target-ring', cx: x, cy: y, r: TR, stroke: hue(tg.want)}));
    g.append(s('circle', {class: 'target-core', cx: x, cy: y, r: TR - 2.5, fill: got ? hue(got) : null}));
    return g;
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); pick = kinds[0]; render(); },
    hint() {
      if (done) return;
      hinted = hintFor(board, history.state.placed, answers);
      ctx.feedback(hinted && hinted.wrong ? (hinted.wrong === 'flip' ? 'Flip this one.' : 'This one is in the way.') : null);
      if (hinted && hinted.code) pick = hinted.code[0];
      render();
    },
  };
}

// Join the half-square stretches of beam into straight runs of one colour,
// so a long beam is one line. A horizontal half is numbered 2c (west half of
// column c) or 2c + 1 (east half); vertical halves likewise by row.
function runsOf(halves) {
  const across = new Map(), down = new Map();
  for (const [key, mask] of halves) {
    const [r, c, side] = key.split(','), R = Number(r), C = Number(c);
    if (side === 'E' || side === 'W') across.set(`${R},${2 * C + (side === 'E' ? 1 : 0)}`, mask);
    else down.set(`${C},${2 * R + (side === 'S' ? 1 : 0)}`, mask);
  }
  const out = [];
  for (const [map, flat] of [[across, true], [down, false]]) {
    for (const key of [...map.keys()].sort((a, b) => { const [p, q] = a.split(',').map(Number), [u, v] = b.split(',').map(Number); return p - u || q - v; })) {
      const [line, k] = key.split(',').map(Number), mask = map.get(key);
      if (map.get(`${line},${k - 1}`) === mask) continue;
      let end = k;
      while (map.get(`${line},${end + 1}`) === mask) end++;
      const a = k * S / 2, b = (end + 1) * S / 2, mid = line * S + S / 2;
      out.push({mask, at: flat ? {x1: a, y1: mid, x2: b, y2: mid} : {x1: mid, y1: a, x2: mid, y2: b}});
    }
  }
  return out;
}

function pieceIcon(k) {
  const icon = s('svg', {class: 'piece-icon', viewBox: '0 0 40 40', 'aria-hidden': 'true'});
  icon.append(s('g', {class: `piece ${k === 'm' ? 'mirror' : 'splitter'}`}, s('line', {class: 'piece-case', x1: 7, y1: 33, x2: 33, y2: 7}), s('line', {class: 'piece-face', x1: 7, y1: 33, x2: 33, y2: 7})));
  return icon;
}

function factOf(n) {
  const parts = [];
  if (n.m) parts.push(`${n.m} mirror${n.m > 1 ? 's' : ''}`);
  if (n.s) parts.push(`${n.s} splitter${n.s > 1 ? 's' : ''}`);
  return parts.join(', ');
}
