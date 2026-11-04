// Small shared helpers for the boards: DOM and SVG building, undo history,
// a tappable SVG control, and the drawing of a molecule.

export function h(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  setAttrs(node, attrs);
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) node.append(k instanceof Node ? k : String(k));
  return node;
}
const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, ...kids) {
  const node = document.createElementNS(SVGNS, tag);
  setAttrs(node, attrs);
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) node.append(k instanceof Node ? k : String(k));
  return node;
}
function setAttrs(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
}

// Make an SVG element act like a button for touch, mouse and keyboard.
export function tappable(node, label, onTap) {
  node.setAttribute('role', 'button');
  node.setAttribute('tabindex', '0');
  node.setAttribute('aria-label', label);
  node.classList.add('tap');
  node.addEventListener('click', event => { event.preventDefault(); onTap(event); });
  node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onTap(event); } });
  return node;
}

// Undo history of plain-data states.
export class History {
  constructor(initial) { this.start = clone(initial); this.stack = [clone(initial)]; }
  get state() { return this.stack.at(-1); }
  push(next) { this.stack.push(clone(next)); }
  undo() { if (this.stack.length > 1) this.stack.pop(); return this.state; }
  restart() { this.stack = [clone(this.start)]; return this.state; }
  get canUndo() { return this.stack.length > 1; }
}
export const clone = value => JSON.parse(JSON.stringify(value));

// A viewBox around points, padded and never smaller than a minimum size, so
// a two-atom board doesn't fill the screen.
export function viewBoxAround(points, {pad = 14, minW = 110, minH = 64} = {}) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  if (x1 - x0 < minW) { const d = (minW - (x1 - x0)) / 2; x0 -= d; x1 += d; }
  if (y1 - y0 < minH) { const d = (minH - (y1 - y0)) / 2; y0 -= d; y1 += d; }
  return {box: `${f(x0)} ${f(y0)} ${f(x1 - x0)} ${f(y1 - y0)}`, w: x1 - x0, h: y1 - y0};
}
export const f = n => Number(n.toFixed(2));

// k parallel strokes between two points, each pulled back by `pull` from the ends.
export function bondLines(a, b, k, {pull = 0, gap = 2.6, cls = 'bond'} = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const out = [];
  for (let i = 0; i < k; i++) {
    const off = (i - (k - 1) / 2) * gap;
    out.push(s('line', {class: cls, x1: f(a[0] + ux * pull + nx * off), y1: f(a[1] + uy * pull + ny * off), x2: f(b[0] - ux * pull + nx * off), y2: f(b[1] - uy * pull + ny * off)}));
  }
  return out;
}

// An atom: a circle in the element's colour with its symbol, and optionally
// a hydrogen count as a condensed formula (CH₃).
export function atomGlyph(el, x, y, {r = 6, hydrogens = 0, cls = ''} = {}) {
  const g = s('g', {class: `atom el-${el} ${cls}`.trim(), transform: `translate(${f(x)} ${f(y)})`});
  g.append(s('circle', {class: 'atom-disc', r}));
  if (hydrogens > 0) {
    const t = s('text', {class: 'atom-label', y: f(r * 0.32), 'font-size': f(r * 0.82)});
    t.append(el, s('tspan', {class: 'atom-h'}, 'H'), hydrogens > 1 ? s('tspan', {class: 'atom-hn', 'font-size': f(r * 0.6), dy: f(r * 0.22)}, String(hydrogens)) : '');
    g.append(t);
  } else {
    g.append(s('text', {class: 'atom-label', y: f(r * 0.36), 'font-size': f(r * (el.length > 1 ? 0.95 : 1.1))}, el));
  }
  return g;
}

// A small, non-interactive drawing of a molecule: atoms [[el, x, y], ...] and
// bonds [[i, j, order], ...], with optional hydrogen counts per atom.
export function moleculeSVG(atoms, bonds, {r = 5, hydrogens = null, cls = 'mini', label = ''} = {}) {
  const vb = viewBoxAround(atoms.map(([, x, y]) => [x, y]), {pad: r + 3, minW: 0, minH: 0});
  const svg = s('svg', {class: cls, viewBox: vb.box, role: 'img', 'aria-label': label, width: f(vb.w * 2.4), height: f(vb.h * 2.4)});
  for (const [i, j, o] of bonds) svg.append(...bondLines([atoms[i][1], atoms[i][2]], [atoms[j][1], atoms[j][2]], o, {pull: r * 0.9, gap: r * 0.42}));
  atoms.forEach(([el, x, y], i) => svg.append(atomGlyph(el, x, y, {r, hydrogens: hydrogens ? hydrogens[i] : 0})));
  return svg;
}

// Briefly mark an element (a duplicate, a missing atom).
export function flash(node) {
  if (!node) return;
  node.classList.remove('flash');
  void node.getBoundingClientRect();
  node.classList.add('flash');
  setTimeout(() => node.classList.remove('flash'), 1300);
}

