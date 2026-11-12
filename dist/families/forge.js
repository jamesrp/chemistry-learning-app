// Star forge board: a corner of the chart of nuclides, with protons going up
// and neutrons going across. A marker sits on the starting nuclide. Capture a
// proton, a neutron or a helium-4 from the tray, or let the nuclide decay its
// own way, to walk to the target in par moves. Squares are coloured by how
// each nuclide lives: stable, or decaying by β⁻, β⁺ or α.
import levels from '../data/forge-levels.js';
import {nuclide, nameOf, shortName, moves, landing, distances, bestMoves, shortestPaths, isFleeting, UNBOUND, NUCLIDES, ELEMENT, why, whyUnbound} from '../phys/nuclides.js';
import {h, s, History, f, flash} from '../ui.js';

const S = 22;
const CAPTURE = {p: '+ proton', n: '+ neutron', a: '+ helium-4'};
const DECAY = {'b-': 'β⁻ decay', 'b+': 'β⁺ decay', 'a-decay': 'α decay'};

export const forge = {
  id: 'forge',
  name: 'Star forge',
  shelf: 'particles',
  levels,
  howTo: [
    'Every square is a nucleus: up means more protons (a new element), across means more neutrons (the same element, heavier).',
    'Tap + proton, + neutron or + helium-4 to stick one on. Tap a decay button to let an unstable nucleus change by itself.',
    'β⁻ turns a neutron into a proton (up and left). β⁺ turns a proton into a neutron (down and right). α throws out a helium-4 (down and left, two each way).',
    'A move that lands where nothing can live, like lithium-5, isn’t allowed. Make the target in the number of moves the board shows.',
    'Why do some nuclei last and others don’t? Protons all push each other apart. Protons and neutrons both hold their neighbours with a short-range glue, the strong force, and neutrons add glue without adding push. Small nuclei last best with equal numbers (the dashed line); bigger ones need extra neutrons. Under the chart, each square you stand on says why it lasts or decays.',
  ],
  notes: {
    science: 'Almost every atom heavier than hydrogen and helium was built inside a star. The Sun joins protons into helium-4. Red giants join three helium-4 nuclei into carbon-12, jumping over the gaps at mass 5 and mass 8, where nothing lasts (beryllium-8 splits in a split second, so the third helium-4 has to arrive almost at once). Heavier stars go on adding helium-4 to make oxygen, neon, magnesium, silicon, sulfur, argon and calcium, then make nickel-56, which decays to iron-56. Past iron, nuclei grow by catching neutrons and letting beta decays turn some into protons. Going the other way, uranium-238 and thorium-232 fall apart through long chains of alpha and beta decays and end as lead. The chart in this game is the real chart of nuclides, cut down to the squares the levels use.',
    maths: 'Each move changes (protons, neutrons) by a fixed step: proton capture (1, 0), neutron capture (0, 1), helium-4 capture (2, 2), β⁻ (1, −1), β⁺ (−1, 1) and α (−2, −2). A level is a shortest-path problem on the graph whose vertices are the nuclides in the table and whose edges are the allowed moves, and par is found by breadth-first search. Several levels have more than one shortest path (Calcium-40 to iron-56 has 10), and the decay chains branch and join again. A neat check: in the uranium chain, the 8 alpha decays take away 16 protons and 16 neutrons, and the 6 beta decays turn 6 neutrons into protons, which takes uranium (92 protons) to lead (82) and 146 neutrons to 124.',
    caution: 'The game leaves out time and energy, which decide what really happens: some decays take a split second and some take billions of years, and stars only fuse at millions of degrees. Squares near the edge of the chart that the game doesn’t need are left off, so a move can land off the map even where a real nucleus exists. Uranium, thorium and their daughters are radioactive and belong on the screen.',
    kitchen: 'Make nuclei from two colours of dried peas or Lego bricks (protons and neutrons) and count them against a printed periodic table: the proton count is the element. Ask a museum or a school for a cloud chamber demonstration, where alpha and beta particles leave real trails.',
  },
  mount,
};

function mount(host, level, ctx) {
  const tray = level.tray, target = level.target, dist = distances(target, tray);
  const base = new Set([level.start, target, ...shortestPaths(level.start, target, tray).flat()]);
  const history = new History({trail: [level.start]});
  let done = false, hinted = null;
  const goal = h('p', {class: 'puzzle-goal forge-goal'});
  const svg = s('svg', {class: 'board-svg forge-chart', 'aria-label': 'Chart of nuclides'});
  const keyBox = h('div', {class: 'forge-key'});
  const now = h('p', {class: 'forge-now'});
  const buttons = h('div', {class: 'forge-moves'});
  host.append(goal, svg, keyBox, now, buttons);

  function render() {
    const {trail} = history.state, here = trail.at(-1), n = nuclide(here), used = trail.length - 1;
    goal.replaceChildren(`Make ${nameOf(target)} from ${nameOf(level.start)} in ${level.par} move${level.par > 1 ? 's' : ''}.`, ' ',
      h('span', {class: `found-count ${used > level.par ? 'over' : ''}`}, `Moves: ${used}`));
    drawChart(trail);
    now.replaceChildren(h('strong', {}, cap(nameOf(here))), `: ${n.Z} proton${n.Z > 1 ? 's' : ''}, ${n.N} neutron${n.N === 1 ? '' : 's'}. `,
      n.modes.length ? '' : 'Stable. ', why(here), isFleeting(n) ? ' Only another helium-4 can catch it in time.' : '');
    const open = moves(here, tray);
    buttons.replaceChildren(
      ...tray.map(m => h('button', {type: 'button', class: `chip forge-move capture ${hinted === m ? 'hinted' : ''}`, 'data-move': m,
        disabled: done || !open.some(o => o.move === m), onclick: () => step(m)}, CAPTURE[m])),
      ...n.modes.map(mode => { const m = mode === 'a' ? 'a-decay' : mode; return h('button', {type: 'button', class: `chip forge-move decay ${hinted === m ? 'hinted' : ''}`, 'data-move': m,
        disabled: done, onclick: () => step(m)}, DECAY[m]); }));
    ctx.changed({canUndo: history.canUndo && !done});
  }

  function drawChart(trail) {
    const keys = new Set([...base, ...trail]);
    const shown = [...keys].map(nuclide);
    const z0 = Math.min(...shown.map(n => n.Z)) - 1, z1 = Math.max(...shown.map(n => n.Z)) + 1;
    const n0 = Math.min(...shown.map(n => n.N)) - 1, n1 = Math.max(...shown.map(n => n.N)) + 1;
    const x = N => (N - n0) * S, y = Z => (z1 - Z) * S;
    svg.setAttribute('viewBox', `-30 -4 ${f((n1 - n0 + 1) * S + 34)} ${f((z1 - z0 + 1) * S + 22)}`);
    svg.replaceChildren();
    const kinds = new Set();
    // Element names down the side, neutron counts along the bottom.
    for (let Z = Math.max(1, z0); Z <= z1; Z++) if (ELEMENT[Z]) svg.append(s('text', {class: 'forge-axis', x: -6, y: f(y(Z) + S / 2 + 4)}, ELEMENT[Z][0]));
    for (let N = Math.max(0, n0); N <= n1; N++) if ((N - n0) % 2 === 0) svg.append(s('text', {class: 'forge-axis', x: f(x(N) + S / 2), y: f((z1 - z0 + 1) * S + 14)}, String(N)));
    for (const nu of NUCLIDES.values()) {
      if (nu.Z < z0 || nu.Z > z1 || nu.N < n0 || nu.N > n1) continue;
      const key = `${nu.sym}-${nu.A}`, kind = kindOf(nu);
      kinds.add(kind);
      const g = s('g', {class: `nuc ${kind} ${key === target ? 'goal' : ''} ${key === trail.at(-1) ? 'here' : ''}`, 'data-key': key});
      g.append(s('rect', {x: f(x(nu.N) + 1), y: f(y(nu.Z) + 1), width: S - 2, height: S - 2, rx: 3}));
      g.append(s('text', {class: 'nuc-a', x: f(x(nu.N) + S / 2), y: f(y(nu.Z) + 8.5)}, String(nu.A)));
      g.append(s('text', {class: 'nuc-sym', x: f(x(nu.N) + S / 2), y: f(y(nu.Z) + 17.5)}, nu.sym));
      svg.append(g);
    }
    // Equal protons and neutrons: where the small stable nuclei sit.
    const lo = Math.max(z0, n0), hi = Math.min(z1, n1);
    if (hi > lo) svg.append(s('line', {class: 'forge-balance', x1: f(x(lo - 0.5) + S / 2), y1: f(y(lo - 0.5) + S / 2), x2: f(x(hi + 0.5) + S / 2), y2: f(y(hi + 0.5) + S / 2)},
      s('title', {}, 'Equal protons and neutrons')));
    const pts = trail.map(k => { const nu = nuclide(k); return `${f(x(nu.N) + S / 2)},${f(y(nu.Z) + S / 2)}`; });
    if (pts.length > 1) svg.append(s('polyline', {class: 'forge-trail', points: pts.join(' ')}));
    const hn = nuclide(trail.at(-1));
    svg.append(s('circle', {class: 'forge-marker', cx: f(x(hn.N) + S / 2), cy: f(y(hn.Z) + S / 2), r: S / 2 + 1}));
    keyBox.replaceChildren(...KEY.filter(([k]) => kinds.has(k)).map(([k, label]) => h('span', {class: `forge-key-item ${k}`}, h('span', {class: 'forge-swatch'}), label)),
      lo < hi ? h('span', {class: 'forge-key-item balance'}, h('span', {class: 'forge-swatch'}), 'protons = neutrons') : '');
  }

  function step(m) {
    if (done) return;
    const here = history.state.trail.at(-1), mv = moves(here, tray).find(o => o.move === m);
    if (!mv) return;
    hinted = null;
    if (!mv.to) {
      const l = landing(here, m), where = l.key ? shortName(l.key) : 'that square';
      ctx.feedback(l.key && UNBOUND.has(l.key) ? `Nothing lives at ${where}: it falls apart at once. ${whyUnbound(l.key)} Try another way.` : `${cap(where)} is off this corner of the chart. Try another way.`);
      flash(buttons);
      return;
    }
    const trail = [...history.state.trail, mv.to], used = trail.length - 1;
    history.push({trail});
    if (mv.to === target && used <= level.par) {
      done = true; ctx.feedback(null); render();
      ctx.solved({title: cap(nameOf(target)), detail: level.about});
      return;
    }
    const left = dist.get(mv.to);
    if (mv.to === target) ctx.feedback(`That’s ${nameOf(target)} in ${used} moves. It can be done in ${level.par}: undo or start again.`);
    else if (left === undefined) ctx.feedback(`From ${shortName(mv.to)} there’s no way to ${shortName(target)} with these moves. Undo.`);
    else if (used + left > level.par) ctx.feedback(`From ${shortName(mv.to)} it takes ${left} more, which is over ${level.par}. Undo and try another way.`);
    else ctx.feedback(null);
    render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; hinted = null; history.restart(); ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      const {trail} = history.state, here = trail.at(-1), left = dist.get(here);
      if (left === undefined || trail.length - 1 + left > level.par) { ctx.feedback(`From here it can’t be done in ${level.par}. Undo back a step or two.`); return; }
      const best = bestMoves(here, target, tray)[0];
      hinted = best.move;
      ctx.feedback(`Try ${(CAPTURE[best.move] || DECAY[best.move]).replace('+ ', 'catching a ')}: that makes ${shortName(best.to)}.`);
      render();
    },
  };
}

const cap = t => t[0].toUpperCase() + t.slice(1);
const kindOf = nu => (!nu.modes.length ? 'stable' : isFleeting(nu) ? 'fleeting' : nu.modes[0] === 'a' ? 'alpha' : nu.modes[0] === 'b-' ? 'beta-minus' : 'beta-plus');
const KEY = [['stable', 'lasts'], ['beta-minus', 'β⁻: too many neutrons'], ['beta-plus', 'β⁺: too many protons'], ['alpha', 'α: too big'], ['fleeting', 'splits at once']];
