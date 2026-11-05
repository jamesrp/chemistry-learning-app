// Bulb boards: tap the dashed gap between two posts to lay a wire, tap it
// again to lift it. Bulbs glow live with the power that really reaches them
// (identical bulbs, one battery), and each bulb's badge shows how it should
// glow. On switch boards, tap a switch (or a row of the card) to try every
// setting; each row of the card turns green when the lamp does what it shows.
import {BULB_LEVELS} from '../data/bulbs-levels.js';
import {layout, evaluate, rowsMet, isSolved, switchesOf, bulbsOf, hintMove, postId} from '../phys/bulbs.js';
import {h, s, tappable, History, f, flash} from '../ui.js';

const S = 40, POST = 3.2, BULB_R = 8.6, BADGE_R = 4.8;

export const bulbs = {
  id: 'bulbs',
  name: 'Bulb boards',
  shelf: 'physics',
  levels: BULB_LEVELS,
  howTo: [
    'Tap a dashed gap between two posts to lay a wire. Tap the wire to take it away. You have only the wires shown above the board.',
    'Make every bulb glow like the little badge beside it: bright, dim, faint or dark.',
    'On boards with switches, tap a switch to flip it. Each row of the card shows the switches and how the lamp should glow then; make every row come true.',
  ],
  notes: {
    science: 'A bulb lights only when current flows through it, so it needs a complete loop from the battery’s + end back to its − end. With identical bulbs and one battery, two bulbs in a row (in series) share the battery’s voltage and each gets a quarter of the power of a bulb alone; two side by side (in parallel) each get the full voltage and glow as brightly as one alone. A wire around a bulb carries the current instead of the bulb (a short circuit across it), and a wire straight from + to − shorts the battery. A balanced bridge keeps both ends of its middle bulb at the same voltage, so no current crosses it. The last boards use real household switch wiring: two two-way switches let either end of a hallway turn the light on or off.',
    maths: 'The circuit is a graph with the bulbs as edges of resistance 1. Kirchhoff’s laws make the post voltages the solution of a linear system given by the graph Laplacian, which the app solves exactly in fractions (power is the square of the voltage across a bulb). Kirchhoff found the matrix-tree theorem, which counts spanning trees with a determinant of the same Laplacian, while studying these networks in 1847. Every board’s wire count is the fewest that work, and a solver checks that exactly one set of that many wires solves it.',
    caution: 'Children often believe one wire is enough, that current is used up by the bulb, or that currents from both ends clash in the bulb. The first boards are built to show the first one fail. Current is the same all the way round a loop. Brightness here is a model: real bulbs change resistance as they heat, so “a quarter of the power” is close but not exact in a real torch bulb.',
    kitchen: 'One AA battery, a small torch bulb and two strips of kitchen foil. Start without a bulb holder: can Jay light the bulb with one strip? (He needs both contacts on the bulb.) Then two bulbs in a row and side by side. Snap Circuits does the same with less fiddling. Don’t hold a wire straight across a battery for more than a moment, because it gets hot, and keep everything away from wall sockets.',
  },
  mount,
};

function mount(host, level, ctx) {
  const {posts, gaps} = layout(level);
  const sw = switchesOf(level), lamps = bulbsOf(level);
  const history = new History({wires: [], states: sw.map(() => 0)});
  const solution = (level.solution || []).map(([a, b]) => gaps.findIndex(([p, q]) => same(p, a) && same(q, b) || same(p, b) && same(q, a)));
  let done = false, hinted = null;

  const badgeAt = level.table ? new Map() : badgeCells(level);
  const xs = posts.map(([, c]) => c * S), ys = posts.map(([r]) => r * S);
  for (const [x, y] of badgeAt.values()) { xs.push(x); ys.push(y); }
  const pad = 24, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  const svg = s('svg', {class: 'board-svg bulbs', viewBox: `${x0} ${y0} ${Math.max(...xs) - x0 + pad} ${Math.max(...ys) - y0 + pad}`, 'aria-label': 'Circuit board'});
  const wireTray = h('div', {class: 'wire-tray', 'aria-label': 'Wires left'});
  const card = level.table ? h('div', {class: 'switch-card'}) : null;
  host.append(wireTray, svg);
  if (card) host.append(card);

  const P = ([r, c]) => [c * S, r * S];

  function render() {
    const {wires, states} = history.state;
    const e = evaluate(level, wires, states);
    const met = rowsMet(level, wires);
    svg.replaceChildren();
    // Gaps and laid wires.
    gaps.forEach(([a, b], g) => {
      const [ax, ay] = P(a), [bx, by] = P(b), on = wires.includes(g);
      const grp = s('g', {class: `gap${on ? ' laid' : ''}${hinted && hinted.gap === g ? ' hinted' : ''}`});
      grp.append(s('line', {class: on ? 'wire laid' : 'slot', x1: ax, y1: ay, x2: bx, y2: by}));
      if (!done) {
        const hit = s('line', {class: 'hit', 'data-gap': g, x1: ax, y1: ay, x2: bx, y2: by});
        tappable(hit, on ? 'Wire; tap to take it away' : 'Gap; tap to lay a wire', () => tapGap(g));
        grp.append(hit);
      }
      svg.append(grp);
    });
    // Parts.
    level.parts.forEach((part, i) => {
      if (part.kind === 'wire') { const [ax, ay] = P(part.a), [bx, by] = P(part.b); svg.append(s('line', {class: 'wire fixed', x1: ax, y1: ay, x2: bx, y2: by})); }
      if (part.kind === 'battery') svg.append(battery(part, e.short));
      if (part.kind === 'bulb') svg.append(bulb(part, i, e.bright.get(i), level.table ? null : part.want));
      if (part.kind === 'switch' || part.kind === 'spdt') svg.append(switchGlyph(part, i, states[sw.indexOf(i)]));
    });
    for (const p of posts) { const [x, y] = P(p); svg.append(s('circle', {class: 'post', cx: x, cy: y, r: POST})); }
    // Wires left.
    wireTray.replaceChildren(...Array.from({length: level.budget}, (_, k) => s('svg', {class: `wire-piece${k < wires.length ? ' used' : ''}`, viewBox: '0 0 30 10', 'aria-hidden': 'true'}, s('line', {x1: 3, y1: 5, x2: 27, y2: 5}))));
    wireTray.setAttribute('aria-label', `${level.budget - wires.length} of ${level.budget} wires left`);
    if (card) renderCard(states, met);
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && e.short) ctx.feedback('That joins + straight to −, so no current goes through the bulbs.');
    if (!done && isSolved(level, wires)) { done = true; render(); ctx.solved({title: level.name, detail: level.detail}); }
  }

  function battery(part, short) {
    const [ax, ay] = P(part.a), [bx, by] = P(part.b), mx = (ax + bx) / 2, my = (ay + by) / 2;
    const ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    const g = s('g', {class: `battery${short ? ' hot' : ''}`});
    g.append(s('line', {class: 'wire fixed', x1: ax, y1: ay, x2: bx, y2: by}));
    // A cell drawn along the link, its + nub toward the a end.
    const cell = s('g', {transform: `translate(${f(mx)} ${f(my)}) rotate(${f(ang)})`});
    cell.append(s('rect', {class: 'cell-body', x: -11, y: -7.5, width: 22, height: 15, rx: 3}),
      s('rect', {class: 'cell-nub', x: -14.5, y: -3.5, width: 3.5, height: 7, rx: 1}),
      s('rect', {class: 'cell-band', x: -11, y: -7.5, width: 7, height: 15, rx: 2}));
    g.append(cell);
    // + and − labels beside the two ends, upright.
    const nx = -(by - ay) / S, ny = (bx - ax) / S;
    for (const [t, x, y] of [['+', ax + (bx - ax) * 0.18, ay + (by - ay) * 0.18], ['−', ax + (bx - ax) * 0.82, ay + (by - ay) * 0.82]]) {
      g.append(s('text', {class: 'cell-sign', x: f(x - nx * 14), y: f(y - ny * 14 + 3.4), 'font-size': 10}, t));
    }
    g.setAttribute('aria-label', short ? 'Battery, shorted' : 'Battery');
    return g;
  }

  function bulb(part, i, glow, want) {
    const [ax, ay] = P(part.a), [bx, by] = P(part.b), mx = (ax + bx) / 2, my = (ay + by) / 2;
    const g = s('g', {class: `bulb glow-${glow}${want && glow === want ? ' met' : ''}`, 'data-bulb': i, role: 'img', 'aria-label': `Bulb, ${glow}${want ? `, should be ${want}` : ''}`});
    g.append(s('line', {class: 'wire fixed', x1: ax, y1: ay, x2: bx, y2: by}));
    g.append(...rays(mx, my, glow, BULB_R));
    g.append(s('circle', {class: 'bulb-glass', cx: f(mx), cy: f(my), r: BULB_R}));
    // Filament: a little loop across the glass, along the link.
    const ux = (bx - ax) / S, uy = (by - ay) / S;
    g.append(s('path', {class: 'filament', d: `M${f(mx - ux * 5)} ${f(my - uy * 5)} Q${f(mx - uy * 4)} ${f(my + ux * 4)} ${f(mx + ux * 5)} ${f(my + uy * 5)}`}));
    if (want) {
      // The badge hangs off its bulb by a short tag line, so it is clear whose it is.
      const [tx, ty] = badgeAt.get(i), d = Math.hypot(tx - mx, ty - my), dx = (tx - mx) / d, dy = (ty - my) / d;
      g.append(s('line', {class: 'tag', x1: f(mx + dx * (BULB_R + 1)), y1: f(my + dy * (BULB_R + 1)), x2: f(tx - dx * (BADGE_R + 0.5)), y2: f(ty - dy * (BADGE_R + 0.5))}));
      g.append(badge(tx, ty, want, glow === want));
    }
    return g;
  }

  function badge(x, y, want, ok) {
    const g = s('g', {class: `badge glow-${want}${ok ? ' met' : ''}`});
    g.append(...rays(x, y, want, BADGE_R, 0.45, 0));
    g.append(s('circle', {class: 'badge-disc', cx: f(x), cy: f(y), r: BADGE_R}));
    return g;
  }

  function switchGlyph(part, i, state) {
    const g = s('g', {class: `switch${part.kind === 'spdt' ? ' two-way' : ''}${state ? ' on' : ''}`, 'data-switch': i});
    let a, b, tip;
    if (part.kind === 'switch') {
      [a, b] = [P(part.a), P(part.b)];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
      // Closed: the lever lies on the contact. Open: raised by 35 degrees.
      const t = state ? 0 : -0.62, L0 = len - 8;
      tip = [a[0] + L0 * (ux * Math.cos(t) - uy * Math.sin(t)), a[1] + L0 * (uy * Math.cos(t) + ux * Math.sin(t))];
      g.append(s('circle', {class: 'contact', cx: b[0] - ux * 8, cy: b[1] - uy * 8, r: 2.2}), s('line', {class: 'wire fixed', x1: b[0] - ux * 8, y1: b[1] - uy * 8, x2: b[0], y2: b[1]}));
      g.append(s('line', {class: 'lever', x1: a[0], y1: a[1], x2: f(tip[0]), y2: f(tip[1])}));
    } else {
      a = P(part.common);
      for (const t of part.throws) { const [tx, ty] = P(t), ux = (tx - a[0]) / S, uy = (ty - a[1]) / S; g.append(s('circle', {class: 'contact', cx: tx - ux * 9, cy: ty - uy * 9, r: 2.2}), s('line', {class: 'wire fixed', x1: tx - ux * 9, y1: ty - uy * 9, x2: tx, y2: ty})); }
      const [tx, ty] = P(part.throws[state]), ux = (tx - a[0]) / S, uy = (ty - a[1]) / S;
      g.append(s('line', {class: 'lever', x1: a[0], y1: a[1], x2: tx - ux * 9, y2: ty - uy * 9}));
    }
    // Switches stay live after the board is solved, to play with.
    const box = part.kind === 'switch' ? [a, P(part.b)] : [P(part.throws[0]), P(part.throws[1])];
    const hit = s('line', {class: 'hit switch-hit', 'data-switch': i, x1: box[0][0], y1: box[0][1], x2: box[1][0], y2: box[1][1]});
    tappable(hit, `Switch, ${part.kind === 'spdt' ? (state ? 'down' : 'up') : state ? 'on' : 'off'}; tap to flip it`, () => flip(i));
    g.append(hit);
    return g;
  }

  function renderCard(states, met) {
    card.replaceChildren(...level.table.map((row, k) => {
      const now = row.states.every((v, j) => v === states[j]);
      const icons = row.states.map((v, j) => miniSwitch(level.parts[sw[j]].kind, v));
      const want = Object.values(row.want)[0];
      const btn = h('button', {type: 'button', class: `card-row${met[k] ? ' met' : ''}${now ? ' now' : ''}`, 'aria-label': `Row ${k + 1}${met[k] ? ', done' : ''}`, onclick: () => setStates(row.states)},
        ...icons, h('span', {class: 'card-arrow', 'aria-hidden': 'true'}, '→'),
        s('svg', {class: 'card-badge', viewBox: '-9 -9 18 18', 'aria-hidden': 'true'}, ...rays(0, 0, want, BADGE_R, 0.45, 0), s('circle', {class: `badge-disc glow-${want}`, cx: 0, cy: 0, r: BADGE_R})));
      return btn;
    }));
  }

  function tapGap(g) {
    if (done) return;
    const {wires, states} = history.state;
    hinted = null; ctx.feedback(null);
    if (wires.includes(g)) { history.push({wires: wires.filter(x => x !== g), states}); render(); return; }
    if (wires.length >= level.budget) { flash(wireTray); return; }
    history.push({wires: [...wires, g].sort((x, y) => x - y), states}); render();
  }
  function flip(i) {
    const {wires, states} = history.state, k = sw.indexOf(i), next = states.slice();
    next[k] = 1 - next[k];
    hinted = null; ctx.feedback(null);
    history.push({wires, states: next}); render();
  }
  function setStates(states) {
    hinted = null; ctx.feedback(null);
    history.push({wires: history.state.wires, states: [...states]}); render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      hinted = hintMove(history.state.wires, [solution]);
      ctx.feedback(null);
      render();
    },
  };
}

// Each bulb's badge goes in the middle of a grid cell beside it: the side
// whose cell has no other bulb or battery on its edges, and never a cell that
// already holds a badge. Below a flat bulb or right of an upright one if both
// are free. Returns bulb part index -> [x, y].
function badgeCells(level) {
  const cellsOf = ({a: [r1, c1], b: [r2, c2]}) => r1 === r2 ? [[r1, Math.min(c1, c2)], [r1 - 1, Math.min(c1, c2)]] : [[Math.min(r1, r2), c1], [Math.min(r1, r2), c1 - 1]];
  const bodies = level.parts.map((p, i) => [p, i]).filter(([p]) => p.kind === 'bulb' || p.kind === 'battery');
  const crowd = new Map();
  for (const [p, i] of bodies) for (const [r, c] of cellsOf(p)) crowd.set(`${r},${c}`, [...(crowd.get(`${r},${c}`) || []), i]);
  const inside = ([r, c]) => r >= 0 && c >= 0 && r < level.rows - 1 && c < level.cols - 1;
  const taken = new Set(), out = new Map();
  for (const [p, i] of bodies.filter(([p]) => p.kind === 'bulb')) {
    const score = cell => (crowd.get(`${cell}`) || []).filter(j => j !== i).length * 2 + (inside(cell) ? 0 : 1);
    const [r, c] = cellsOf(p).filter(cell => !taken.has(`${cell}`)).sort((x, y) => score(x) - score(y))[0];
    taken.add(`${r},${c}`);
    out.set(i, [(c + 0.5) * S, (r + 0.5) * S]);
  }
  return out;
}

// Rays around a glowing disc: long for bright, short for dim, none for faint
// or off. Badges turn theirs by an eighth so they fall between a bulb's.
function rays(x, y, glow, r, scale = 1, turn = Math.PI / 8) {
  const len = {bright: 7, dim: 3.6}[glow];
  if (!len) return [];
  return Array.from({length: 8}, (_, k) => {
    const t = k * Math.PI / 4 + turn, c = Math.cos(t), sn = Math.sin(t), r0 = r + 2 * scale, r1 = r + (2 + len) * scale;
    return s('line', {class: 'ray', x1: f(x + c * r0), y1: f(y + sn * r0), x2: f(x + c * r1), y2: f(y + sn * r1)});
  });
}

function miniSwitch(kind, v) {
  const svg = s('svg', {class: 'card-switch', viewBox: '0 0 26 18', 'aria-hidden': 'true'});
  if (kind === 'spdt') {
    svg.append(s('circle', {class: 'contact', cx: 22, cy: 3, r: 2}), s('circle', {class: 'contact', cx: 22, cy: 15, r: 2}),
      s('line', {class: 'lever', x1: 3, y1: 9, x2: 21, y2: v ? 14.5 : 3.5}));
  } else {
    svg.append(s('circle', {class: 'contact', cx: 22, cy: 12, r: 2}),
      s('line', {class: 'lever', x1: 3, y1: 12, x2: v ? 21 : 18.5, y2: v ? 12 : 2}));
  }
  return svg;
}

const same = (p, q) => p[0] === q[0] && p[1] === q[1];
