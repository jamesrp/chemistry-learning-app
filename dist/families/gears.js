// Gear trains board: put gears from the tray on pegs. The crank always turns
// clockwise; gears that mesh with it turn too, opposite ways, faster when
// smaller. Each output asks for a direction and a speed; its target goes
// green when met. A ring of gears that can't all turn jams and shudders.
import levels from '../data/gears-levels.js';
import {TEETH, SIZES, evaluate, sizesOf, blockers, trayLeft, isFixedPeg, solveAll, hintMove, speedLabel} from '../phys/gears.js';
import {h, s, tappable, History, f, flash} from '../ui.js';

const U = 20, PERIOD = 8, BW = 54, BH = 26;
const CLOCK0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const gears = {
  id: 'gears',
  name: 'Gear trains',
  shelf: 'physics',
  levels,
  howTo: [
    'Tap a gear in the tray, then tap a peg to put it there. Tap a gear on the board to take it off. A gear that would overlap its neighbour won\'t go on.',
    'The crank always turns. Gears whose teeth meet turn opposite ways, and a small gear turns faster than a big one.',
    'Make each pointer gear turn the way its arrow shows, at its speed: ×2 is two turns for each turn of the crank, ×⅓ one turn for every three.',
    'Gears that can\'t all turn get stuck.',
  ],
  notes: {
    science: 'Gears whose teeth interlock turn opposite ways, and their teeth pass the meeting point at the same rate, so a gear with a third of the teeth turns three times as fast: speed goes inversely with the number of teeth. A gear between two others (an idler) reverses the direction and leaves the speed alone, whatever its size. Three gears that all mesh with each other can\'t turn at all: each pair must turn opposite ways, and three can\'t all be opposite. The tray\'s gears have 8, 16 and 24 teeth (the LEGO Technic sizes), all with the same size of tooth, so a gear\'s radius is proportional to its teeth, and two gears on pegs a distance d apart mesh exactly when their radii add up to d.',
    maths: 'Draw a dot for each gear and a line between two that mesh: the mesh graph. Turning directions are a 2-colouring of it (neighbours different), so the crank\'s part of the graph can turn exactly when it is bipartite, that is, when it has no cycle of odd length; a ring of three is the smallest, and an even ring turns freely. The speed along a path is a product t₁/t₂ · t₂/t₃ · … that telescopes to t_crank/t_output, so idlers cancel; around a ring the product is ±1, which is why only the sign can disagree and a jam is exactly an odd cycle. With one gear per axle the output\'s speed therefore depends only on its own size, and the puzzle is getting there with the right parity through pegs whose distances fix the sizes (r₁ + r₂ = d). The pegs sit at whole-number distances: along grid lines, or 5 across a 3 × 4 rectangle, and the 3-4-5 triangle is where the odd rings come from. The app checks every board by trying every placement, with exact fractions.',
    caution: 'Real gears mesh only when their teeth are the same size (the same pitch); the puzzle\'s gears all are. Speed is not free: the small output turns faster but with less turning force, and the board shows only speed. "Faster" here means more turns, not a faster rim: the rims of two meshing gears move together at the same rate, and the small one turns more often because its rim is shorter. That is the whole reason for the ratio, and worth saying aloud. Gears with two sizes on one axle (compound gears), which multiply ratios instead of cancelling, are left out of this build. A real jammed triangle shouldn\'t be forced: plastic teeth strip.',
    kitchen: 'LEGO Technic gears (8, 16, 24 and 40 teeth) on a Technic beam, or any snap-together gear set. Stick a tape flag on one tooth of each gear, turn the driving gear once, slowly, and count the other\'s turns: 8 driving 24 turns a third of the way round; 24 driving 8 turns three times. Put a third gear between them and see that the direction changes but the count doesn\'t. Then build three gears that all touch in a triangle and try, gently, to turn them. Keep the small pieces away from younger children.',
  },
  mount,
};

// A gear outline of radius r (units) with 8r teeth, tooth 0 pointing along +x.
function gearPath(r) {
  const n = TEETH * r, R = r * U, tip = R + 4.4, root = R - 5, phi = (2 * Math.PI) / n, pts = [];
  const at = (rad, t) => `${f(rad * Math.cos(t))} ${f(rad * Math.sin(t))}`;
  for (let k = 0; k < n; k++) {
    const t = k * phi;
    pts.push(at(root, t - 0.33 * phi), at(tip, t - 0.15 * phi), at(tip, t + 0.15 * phi), at(root, t + 0.33 * phi));
  }
  return `M${pts.join('L')}Z`;
}
const PATHS = Object.fromEntries(SIZES.map(r => [r, gearPath(r)]));

// A curved arrow of radius rad around the origin, clockwise (dir 1) or not.
function turnArrow(rad, dir, cls) {
  const a0 = -Math.PI * 0.85, a1 = -Math.PI * 0.15, p = t => [rad * Math.cos(t), rad * Math.sin(t)];
  const [x0, y0] = p(dir > 0 ? a0 : a1), [x1, y1] = p(dir > 0 ? a1 : a0);
  const end = dir > 0 ? a1 : a0, tx = -Math.sin(end) * dir, ty = Math.cos(end) * dir, nx = Math.cos(end), ny = Math.sin(end), hs = Math.max(2.6, rad * 0.42);
  const head = [[x1 + tx * hs, y1 + ty * hs], [x1 + nx * hs * 0.75, y1 + ny * hs * 0.75], [x1 - nx * hs * 0.75, y1 - ny * hs * 0.75]];
  return s('g', {class: cls},
    s('path', {class: 'arrow-arc', d: `M${f(x0)} ${f(y0)}A${f(rad)} ${f(rad)} 0 0 ${dir > 0 ? 1 : 0} ${f(x1)} ${f(y1)}`}),
    s('path', {class: 'arrow-head', d: `M${head.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`}));
}

const outRadius = (level, o) => (level.fixed || []).find(g => g.peg === o.peg)?.r ?? (level.crank.r * o.speed[1]) / o.speed[0];
const SIDE = {n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0]};
function badgeCentre(level, o) {
  const [x, y] = level.pegs[o.peg], [dx, dy] = SIDE[o.side || 'n'];
  const reach = outRadius(level, o) * U + 7 + (dx ? BW / 2 : BH / 2);
  return [x * U + dx * reach, y * U + dy * reach];
}

function mount(host, level, ctx) {
  const kinds = SIZES.filter(r => level.tray[r] !== undefined);
  const history = new History({placed: level.pegs.map(() => 0)});
  let done = false, hinted = null, pick = kinds[0], sols = null;
  const tray = h('div', {class: 'tray gear-tray'});
  const svg = s('svg', {class: 'board-svg gears', viewBox: viewBox(level), 'aria-label': 'Gear board'});
  host.append(tray, svg);
  const isOutput = i => level.outputs.some(o => o.peg === i);

  function render() {
    const {placed} = history.state, sizes = sizesOf(level, placed), ev = evaluate(level, sizes), left = trayLeft(level, placed);
    if (!left[pick]) pick = kinds.find(r => left[r] > 0) ?? pick;
    tray.replaceChildren(...kinds.map(r => {
      const b = h('button', {type: 'button', class: `chip gear-chip size-${r} ${hinted && hinted.r === r ? 'hinted' : ''}`, 'data-r': r,
        'aria-pressed': String(pick === r && left[r] > 0), 'aria-label': `${TEETH * r}-tooth gear, ${left[r]} left`, disabled: !left[r],
        onclick: () => { pick = r; render(); }}, chipIcon(r), h('span', {class: 'pips', 'aria-hidden': 'true'}, ...Array.from({length: Math.max(0, left[r])}, () => h('span', {class: 'pip'}))));
      return b;
    }));

    svg.replaceChildren();
    const alpha = phases(level, sizes, ev), t = (now() - CLOCK0) / 1000;
    const pegLayer = s('g', {class: 'pegs'}), gearLayer = s('g', {class: 'gear-layer'}), hitLayer = s('g', {class: 'hits'}), badgeLayer = s('g', {class: 'targets'});
    level.pegs.forEach(([x, y], i) => {
      pegLayer.append(s('circle', {class: `peg ${isOutput(i) && !sizes[i] ? 'out-peg' : ''}`, cx: x * U, cy: y * U, r: isOutput(i) && !sizes[i] ? 7 : 3.2}));
      if (sizes[i]) gearLayer.append(gearNode(i, sizes[i], ev, alpha[i], t));
      else if (!isFixedPeg(level, i) && !done) {
        const hit = s('circle', {class: 'peg-hit', 'data-peg': i, cx: x * U, cy: y * U, r: 0.92 * U});
        tappable(hit, `Peg ${i + 1}, empty${isOutput(i) ? ', pointer peg' : ''}`, () => tapPeg(i));
        hitLayer.append(hit);
      }
      if (hinted && hinted.peg === i) hitLayer.append(s('circle', {class: 'hint-ring', cx: x * U, cy: y * U, r: hinted.kind === 'place' ? hinted.r * U : sizes[i] * U + 6}));
    });
    level.outputs.forEach((o, k) => badgeLayer.append(badge(o, ev.outputs[k])));
    svg.append(pegLayer, gearLayer, hitLayer, badgeLayer);
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && ev.solved) {
      done = true; hinted = null; render();
      const o = level.outputs;
      ctx.solved(o.length === 1 ? {title: speedLabel(o[0].speed), detail: turnsLine(o[0].speed)} : {title: o.map(x => speedLabel(x.speed)).join(' and ')});
    }
  }

  function gearNode(i, r, ev, alpha, t) {
    const [x, y] = level.pegs[i], kind = i === level.crank.peg ? 'crank' : isFixedPeg(level, i) ? 'fixed' : 'placed';
    const v = ev.speed[i], inGroup = v !== null, turning = inGroup && !ev.jammed && v[0] !== 0;
    const state = ev.jammed && inGroup ? 'jammed' : turning ? 'turning' : 'still';
    const spin = s('g', {class: 'spin'}, s('path', {class: 'gear-body', d: PATHS[r]}));
    const R = r * U;
    if (kind === 'crank') spin.append(s('line', {class: 'handle', x1: 0, y1: 0, x2: f(R * 0.62), y2: 0}), s('circle', {class: 'knob', cx: f(R * 0.62), cy: 0, r: f(Math.min(4.6, R * 0.21))}));
    else if (isOutput(i)) spin.append(s('path', {class: 'pointer', d: `M-3 -3.4L${f(R - 3)} -1.2L${f(R + 1)} 0L${f(R - 3)} 1.2L-3 3.4Z`}));
    else spin.append(s('circle', {class: 'mark', cx: f(R - 8.5), cy: 0, r: 2.6}));
    spin.append(s('circle', {class: 'hub', r: kind === 'placed' ? 3.4 : 4.4}));
    if (turning) {
      const dur = (PERIOD * v[1]) / Math.abs(v[0]);
      spin.setAttribute('style', `animation-duration:${f(dur)}s;animation-delay:-${f(t % dur)}s;animation-direction:${v[0] > 0 ? 'normal' : 'reverse'}`);
      spin.classList.add('on');
    }
    const shake = s('g', {class: 'shake'}, spin);
    const g = s('g', {class: `gear ${kind} size-${r} ${state} ${isOutput(i) ? 'output' : ''}`, 'data-peg': i, transform: `translate(${x * U} ${y * U})`},
      s('g', {transform: `rotate(${f(alpha)})`}, shake));
    if (turning) g.append(turnArrow(Math.max(7, R * 0.42), Math.sign(v[0]), 'turn-arrow'));
    if (kind === 'placed' && !done) tappable(g, `${TEETH * r}-tooth gear, ${state}; tap to take it off`, () => tapGear(i));
    return g;
  }

  function badge(o, st) {
    const [cx, cy] = badgeCentre(level, o);
    return s('g', {class: `target ${st.dirOk ? 'dir-ok' : ''} ${st.speedOk ? 'speed-ok' : ''} ${st.ok ? 'ok' : ''}`, transform: `translate(${f(cx)} ${f(cy)})`,
      role: 'img', 'aria-label': `Wanted: ${o.dir > 0 ? 'clockwise' : 'anticlockwise'}, ${speedLabel(o.speed)}${st.ok ? ', done' : ''}`},
      s('rect', {class: 'target-box', x: -BW / 2, y: -BH / 2, width: BW, height: BH, rx: 8}),
      s('g', {transform: `translate(${-BW / 2 + 13} 1)`}, turnArrow(7, o.dir, 'target-arrow')),
      s('text', {class: 'target-speed', x: 10, y: 5.4, 'font-size': 15}, speedLabel(o.speed)));
  }

  function tapPeg(i) {
    if (done) return;
    const {placed} = history.state, left = trayLeft(level, placed);
    if (!left[pick]) { flash(tray); return; }
    const block = blockers(level, sizesOf(level, placed), i, pick);
    if (block.length) {
      for (const j of [i, ...block]) {
        const node = svg.querySelector(`.gear[data-peg="${j}"]`) || svg.querySelector(`.peg-hit[data-peg="${j}"]`);
        if (!node) continue;
        node.classList.remove('refused'); void node.getBoundingClientRect?.(); node.classList.add('refused');
        setTimeout(() => node.classList.remove('refused'), 900);
      }
      ctx.feedback('Too big to fit here.');
      return;
    }
    const next = placed.slice(); next[i] = pick;
    hinted = null; ctx.feedback(null);
    history.push({placed: next}); render();
  }

  function tapGear(i) {
    if (done) return;
    const next = history.state.placed.slice(); next[i] = 0;
    hinted = null; ctx.feedback(null);
    history.push({placed: next}); render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      sols ||= solveAll(level);
      const m = hintMove(level, history.state.placed, sols);
      if (!m) return;
      hinted = m;
      if (m.kind === 'place') { pick = m.r; ctx.feedback(null); } else ctx.feedback('This gear is in the way.');
      render();
    },
  };
}

// Starting angles (degrees) so that meshing teeth interlock: each gear in the
// crank's group is set from the gear that reached it first.
function phases(level, sizes, ev) {
  const alpha = sizes.map(() => 0), order = [level.crank.peg], pitch = Math.PI / 4;
  const rad = sizes.map(() => 0);
  for (let k = 0; k < order.length; k++) {
    const i = order[k];
    for (const j of ev.adj[i]) {
      if (ev.parent[j] !== i || order.includes(j)) continue;
      const [px, py] = level.pegs[i], [qx, qy] = level.pegs[j], psi = Math.atan2(qy - py, qx - px);
      const x0 = (rad[i] - psi) * sizes[i];
      rad[j] = psi + Math.PI - (x0 + pitch / 2) / sizes[j];
      order.push(j);
    }
  }
  return rad.map(a => ((a * 180) / Math.PI) % 360);
}

function viewBox(level) {
  const pts = [], fixedR = sizesOf(level, null), maxTray = Math.max(...SIZES.filter(r => level.tray[r] !== undefined));
  level.pegs.forEach(([x, y], i) => {
    let r = fixedR[i];
    if (!r) for (let q = maxTray; q >= 1 && !r; q--) if (!blockers(level, fixedR, i, q).length) r = q;
    const e = (r || 0) * U + 6;
    pts.push([x * U - e, y * U - e], [x * U + e, y * U + e]);
  });
  for (const o of level.outputs) { const [cx, cy] = badgeCentre(level, o); pts.push([cx - BW / 2, cy - BH / 2], [cx + BW / 2, cy + BH / 2]); }
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), pad = 4;
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  return `${f(x0)} ${f(y0)} ${f(Math.max(...xs) + pad - x0)} ${f(Math.max(...ys) + pad - y0)}`;
}

function chipIcon(r) {
  const e = r * U + 5;
  return s('svg', {class: 'chip-gear', viewBox: `${-e} ${-e} ${2 * e} ${2 * e}`, width: 14 + 9 * r, height: 14 + 9 * r, 'aria-hidden': 'true'},
    s('path', {class: 'gear-body', d: PATHS[r]}), s('circle', {class: 'hub', r: 4.4}));
}

function turnsLine([n, d]) {
  if (d === 1) return n === 1 ? 'one turn for each turn of the crank' : `${n} turns for each turn of the crank`;
  return n === 1 ? `one turn for every ${d} of the crank` : `${n} turns for every ${d} of the crank`;
}
