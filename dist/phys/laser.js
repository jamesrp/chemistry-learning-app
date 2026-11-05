// Laser bench: light on a square grid. A lamp sends a beam in one direction;
// it travels cell to cell in a straight line and stops at a wall, a target,
// a lamp or the edge. A mirror set at 45° turns it through 90° (angle in
// equals angle out); a half-silvered splitter sends one beam straight on and
// one turned, as a mirror would. Beams cross without effect. Colours add:
// a target receives the union of the colours that reach it (red + green =
// yellow, all three = white), and it is lit right when that is exactly its
// colour.
//
// Colours are bit masks: red 1, green 2, blue 4. A board is parsed from a
// level: `map` rows of '.' empty, '#' wall, 'L' lamp, 'T' target, '/' or '\'
// a fixed mirror, 'S' or 'Z' a fixed splitter set / or \. Lamps and targets
// take their direction and colour from `lamps` and `targets`, in reading
// order. A placed piece is a code: 'm/', 'm\', 's/', 's\'. Placements are an
// object from 'r,c' to code.

export const MASK = {R: 1, G: 2, B: 4, Y: 3, M: 5, C: 6, W: 7};
export const LETTER = ['', 'R', 'G', 'Y', 'B', 'M', 'C', 'W'];
export const COLOUR_NAME = ['dark', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
export const DIRS = {N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1]};
const DIR_OF = ([dr, dc]) => (dr === -1 ? 'N' : dr === 1 ? 'S' : dc === 1 ? 'E' : 'W');
const SIDE_BACK = {N: 'S', S: 'N', E: 'W', W: 'E'};

// '/' turns east to north and south to west: (dr, dc) -> (-dc, -dr).
// '\' turns east to south and north to west: (dr, dc) -> (dc, dr).
export const reflect = ([dr, dc], slant) => (slant === '/' ? [0 - dc || 0, 0 - dr || 0] : [dc, dr]);

export function parse(level) {
  const rows = level.map.length, cols = level.map[0].length;
  const cells = [], lamps = [], targets = [], fixed = {};
  let li = 0, ti = 0;
  level.map.forEach((line, r) => [...line].forEach((ch, c) => {
    if (ch === 'L') { const [dir, colour] = level.lamps[li++]; lamps.push({r, c, dir, mask: MASK[colour]}); cells.push('lamp'); }
    else if (ch === 'T') { targets.push({r, c, want: MASK[level.targets[ti++]]}); cells.push('target'); }
    else if (ch === '#') cells.push('wall');
    else if (ch === '/' || ch === '\\') { fixed[`${r},${c}`] = 'm' + ch; cells.push('fixed'); }
    else if (ch === 'S' || ch === 'Z') { fixed[`${r},${c}`] = 's' + (ch === 'S' ? '/' : '\\'); cells.push('fixed'); }
    else cells.push('empty');
  }));
  if (li !== level.lamps.length || ti !== level.targets.length) throw new Error(`${level.id}: lamps or targets do not match the map`);
  return {rows, cols, cells, lamps, targets, fixed, tray: {m: level.tray.m || 0, s: level.tray.s || 0}};
}

export const kindAt = (board, r, c) => board.cells[r * board.cols + c];
export const isEmpty = (board, r, c) => kindAt(board, r, c) === 'empty';

// Follow every beam. Returns:
//   halves: Map 'r,c,side' -> colour mask, the half-cell stretches of beam
//           from a cell's centre to the middle of one of its sides;
//   got:    the colour each target receives, by target index;
//   hit:    Set of 'r,c' of pieces (placed or fixed) a beam reaches;
//   path:   Set of 'r,c' of empty cells a beam crosses (where a piece could go).
export function trace(board, placed = {}) {
  const halves = new Map(), got = board.targets.map(() => 0), hit = new Set(), path = new Set();
  const targetAt = new Map(board.targets.map((t, i) => [`${t.r},${t.c}`, i]));
  const mark = (r, c, side, mask) => { const k = `${r},${c},${side}`; halves.set(k, (halves.get(k) || 0) | mask); };
  for (const lamp of board.lamps) {
    const seen = new Set(), stack = [[lamp.r, lamp.c, DIRS[lamp.dir]]];
    while (stack.length) {
      const [r, c, d] = stack.pop(), key = `${r},${c},${d}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const out = DIR_OF(d);
      mark(r, c, out, lamp.mask);
      const nr = r + d[0], nc = c + d[1];
      if (nr < 0 || nc < 0 || nr >= board.rows || nc >= board.cols) continue;
      const kind = kindAt(board, nr, nc), here = `${nr},${nc}`;
      if (kind === 'wall' || kind === 'lamp') continue;
      mark(nr, nc, SIDE_BACK[out], lamp.mask);
      if (kind === 'target') { got[targetAt.get(here)] |= lamp.mask; continue; }
      const piece = board.fixed[here] || placed[here];
      if (!piece) { path.add(here); stack.push([nr, nc, d]); continue; }
      hit.add(here);
      if (piece[0] === 's') stack.push([nr, nc, d]);
      stack.push([nr, nc, reflect(d, piece[1])]);
    }
  }
  return {halves, got, hit, path};
}

export const isLitRight = (board, got) => board.targets.every((t, i) => got[i] === t.want);
export const solved = (board, placed) => isLitRight(board, trace(board, placed).got);

export function used(placed) {
  const n = {m: 0, s: 0};
  for (const code of Object.values(placed)) n[code[0]]++;
  return n;
}

const keyOf = placed => Object.keys(placed).sort().map(k => `${k}${placed[k]}`).join(' ');

// Every way to win with the tray, counted as sets of placements in which
// every placed piece is reached by a beam (a piece no beam reaches changes
// nothing, so it is never part of an answer). The search only puts pieces on
// cells a beam already crosses. That misses nothing: in any answer, take the
// pieces in the order a beam first reaches them; the way to each runs only
// through earlier pieces, so with just those placed it is already lit.
export function solveAll(board, tray = board.tray, {limit = Infinity} = {}) {
  const out = [], seen = new Set();
  const rec = (placed, left) => {
    if (out.length >= limit) return;
    const k = keyOf(placed);
    if (seen.has(k)) return;
    seen.add(k);
    const t = trace(board, placed);
    if (Object.keys(placed).some(p => !t.hit.has(p))) return;
    if (isLitRight(board, t.got)) out.push({...placed});
    for (const cell of t.path) for (const kind of ['m', 's']) {
      if (!left[kind]) continue;
      for (const slant of ['/', '\\']) rec({...placed, [cell]: kind + slant}, {...left, [kind]: left[kind] - 1});
    }
  };
  rec({}, {...tray});
  return out;
}

// The order a beam reaches the pieces of an answer (breadth first, by steps
// from the lamps), so a hint can name a piece whose cell is already lit.
export function reachOrder(board, placed) {
  const order = [], seenPiece = new Set();
  const queue = board.lamps.map(l => [l.r, l.c, DIRS[l.dir]]), seen = new Set();
  while (queue.length) {
    const [r, c, d] = queue.shift(), key = `${r},${c},${d}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nc < 0 || nr >= board.rows || nc >= board.cols) continue;
    const kind = kindAt(board, nr, nc), here = `${nr},${nc}`;
    if (kind === 'wall' || kind === 'lamp' || kind === 'target') continue;
    const piece = board.fixed[here] || placed[here];
    if (!piece) { queue.push([nr, nc, d]); continue; }
    if (placed[here] && !seenPiece.has(here)) { seenPiece.add(here); order.push(here); }
    if (piece[0] === 's') queue.push([nr, nc, d]);
    queue.push([nr, nc, reflect(d, piece[1])]);
  }
  return order;
}

// A hint against the answers: the answer that agrees most with what is on
// the board. A placed piece that is not in it (or is turned the wrong way)
// is wrong; otherwise the next piece of it, in the order the beam reaches
// them, so its cell is already lit.
//   {cell, wrong: 'flip' | 'move'}  or  {cell, code}  or  null when solved.
export function hint(board, placed, answers) {
  if (!answers.length) return null;
  const score = a => Object.entries(placed).filter(([k, v]) => a[k] === v).length * 4
    + Object.keys(placed).filter(k => a[k]).length - Object.keys(a).length * 0.01;
  const best = answers.reduce((x, y) => (score(y) > score(x) ? y : x));
  const wrongCell = Object.keys(placed).sort(byCell).find(k => best[k] !== placed[k]);
  if (wrongCell) return {cell: wrongCell, wrong: best[wrongCell] && best[wrongCell][0] === placed[wrongCell][0] ? 'flip' : 'move'};
  const next = reachOrder(board, best).find(k => !placed[k]);
  return next ? {cell: next, code: best[next]} : null;
}
const byCell = (a, b) => { const [ar, ac] = a.split(',').map(Number), [br, bc] = b.split(',').map(Number); return ar - br || ac - bc; };

export const fromWitness = solution => Object.fromEntries(solution.map(([r, c, code]) => [`${r},${c}`, code]));
