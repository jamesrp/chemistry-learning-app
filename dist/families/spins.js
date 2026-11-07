// Spin grids board: arrows (electron spins) on a grid, joined by lines. Tap
// an arrow to flip it. A line is green when its two arrows are as it likes
// them (the same way, or opposite for a line with a bar) and red when not.
// Get down to the fewest red lines; some boards ask for every best way.
import levels from '../data/spin-levels.js';
import {parse, startSpins, unhappy, redCount, best, hintFlip, S} from '../chem/spins.js';
import {h, s, tappable, History, f, flash} from '../ui.js';

const R = 12.5;

export const spins = {
  id: 'spins',
  name: 'Spin grids',
  shelf: 'materials',
  levels,
  howTo: [
    'Each arrow is a tiny magnet that points up or down. Tap an arrow to flip it. Square arrows are pinned and can’t flip.',
    'A plain line wants its two arrows to point the same way. A line with a bar across it wants them to point opposite ways. A happy line is green and an unhappy one is red.',
    'Get the red lines down to the number the board asks for. Sometimes no way makes every line happy: then the fewest red lines is the answer.',
  ],
  notes: {
    science: 'In iron, nickel and cobalt each atom is a tiny magnet, because its electrons spin. Neighbouring spins in these metals like to point the same way, so they line up in patches called domains, and when most domains agree the lump is a magnet. In an antiferromagnet such as manganese oxide neighbours like to point opposite ways, the pulls cancel, and the lump isn’t magnetic from outside. Where a pinned region forces up on one side and down on the other, the boundary is a domain wall, and the material keeps it as short as it can. On a triangle, three arrows can’t all disagree with each other: that is frustration, and it happens in real crystals.',
    maths: 'This is the Ising model (Lenz and Ising, 1920s): each site is +1 or −1, each line contributes 1 to the energy when it is unhappy, and the boards ask for a ground state, an arrangement of least energy. Every board is checked by trying all 2ⁿ settings of its free arrows, which gives the fewest red lines and the number of ways to reach it; that number is on the board for the find-every-way levels. On a plain ferromagnet with pinned edges the least energy is a minimum cut, so the domain wall is a shortest path; on the triangle grid every triangle has at least one red line, and lines shared by two triangles make the counting the puzzle. Boards with both kinds of line are spin glasses, where finding the ground state is NP-hard in general (Barahona, 1982), though easy on boards this small.',
    caution: 'Real spins can point any way in space, not only up or down, and a real magnet’s energy has more terms than a count of unhappy neighbours. The up-or-down model is still the one physicists start from, and it gets domains, walls and frustration right.',
    kitchen: 'Stroke a sewing needle about 30 times in one direction with a fridge magnet: it becomes a magnet and picks up a staple. Float it on a slice of cork in a bowl of water and it turns to point north. Two bar magnets in your hands show happy and unhappy pairs: end to end they snap together one way and push apart the other.',
  },
  mount,
};

function mount(host, level, ctx) {
  const board = parse(level), start = startSpins(board);
  const history = new History({spins: start, found: []});
  let solutions = null, hinted = null, done = false;
  const xs = board.sites.map(p => p.x), ys = board.sites.map(p => p.y);
  const pad = R + 8, x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  const goal = h('p', {class: 'puzzle-goal spin-goal'});
  const svg = s('svg', {class: 'board-svg spins', viewBox: `${f(x0)} ${f(y0)} ${f(Math.max(...xs) - x0 + pad)} ${f(Math.max(...ys) - y0 + pad)}`, 'aria-label': 'Spin grid'});
  const shelf = h('div', {class: 'shelf', hidden: !level.findAll});
  host.append(goal, svg, shelf);

  function render() {
    const {spins, found} = history.state, red = redCount(board, spins);
    const aim = level.goal === 0 ? 'Make every line green.' : `Aim for ${level.goal} red line${level.goal > 1 ? 's' : ''}.`;
    goal.replaceChildren(h('span', {class: `red-now ${red <= level.goal ? 'met' : ''}`}, `Red lines: ${red}`), ' ',
      level.findAll ? `Find all ${level.ways} ways with ${level.goal}.` : aim);
    svg.replaceChildren();
    for (const l of board.lines) {
      const a = board.sites[l.a], b = board.sites[l.b], bad = unhappy(l, spins);
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const g = s('g', {class: `spin-line ${bad ? 'red' : 'green'} ${l.anti ? 'anti' : ''}`});
      g.append(s('line', {class: 'spin-bond', x1: f(a.x + ux * R), y1: f(a.y + uy * R), x2: f(b.x - ux * R), y2: f(b.y - uy * R)}));
      if (l.anti) {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        g.append(s('line', {class: 'anti-bar', x1: f(mx - uy * 5), y1: f(my + ux * 5), x2: f(mx + uy * 5), y2: f(my - ux * 5)}));
      }
      svg.append(g);
    }
    board.sites.forEach((p, i) => svg.append(arrowAt(p, spins[i], i)));
    shelf.replaceChildren(...found.map(miniOf));
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && red <= level.goal) check(spins);
  }

  function arrowAt(p, up, i) {
    const g = s('g', {class: `spin ${up ? 'up' : 'down'} ${p.pin ? 'pinned' : ''} ${hinted === i ? 'hinted' : ''}`, transform: `translate(${f(p.x)} ${f(p.y)})`, 'data-site': i});
    g.append(p.pin ? s('rect', {class: 'spin-disc', x: -R, y: -R, width: 2 * R, height: 2 * R, rx: 3.5}) : s('circle', {class: 'spin-disc', r: R}));
    const d = up ? 'M0 7.5V-6M-4.6 -1.6L0 -7L4.6 -1.6' : 'M0 -7.5V6M-4.6 1.6L0 7L4.6 1.6';
    g.append(s('path', {class: 'spin-arrow', d}));
    if (!p.pin && !done) {
      const hit = s('circle', {class: 'spin-hit', r: R + 6, 'data-site': i});
      tappable(hit, `Arrow pointing ${up ? 'up' : 'down'}; tap to flip`, () => tap(i));
      g.append(hit);
    }
    return g;
  }

  function miniOf(st) {
    const mini = s('svg', {class: 'mini spin-mini', viewBox: svg.getAttribute('viewBox'), role: 'img', 'aria-label': 'Found arrangement'});
    for (const l of board.lines) {
      const a = board.sites[l.a], b = board.sites[l.b];
      mini.append(s('line', {class: `spin-bond ${unhappy(l, st) ? 'red' : 'green'}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y}));
    }
    board.sites.forEach((p, i) => mini.append(s('g', {class: `spin ${st[i] ? 'up' : 'down'}`, transform: `translate(${f(p.x)} ${f(p.y)})`},
      s('circle', {class: 'spin-disc', r: R}), s('path', {class: 'spin-arrow', d: st[i] ? 'M0 7.5V-6M-4.6 -1.6L0 -7L4.6 -1.6' : 'M0 -7.5V6M-4.6 1.6L0 7L4.6 1.6'}))));
    return h('div', {class: 'shelf-item'}, mini);
  }

  function tap(i) {
    if (done) return;
    const spins = history.state.spins.slice();
    spins[i] ^= 1;
    hinted = null; ctx.feedback(null);
    history.push({...history.state, spins});
    render();
  }

  function check(spinsNow) {
    if (!level.findAll) { done = true; render(); ctx.solved({title: level.title, detail: level.detail}); return; }
    const {found} = history.state, key = spinsNow.join('');
    const at = found.findIndex(st => st.join('') === key);
    if (at >= 0) { flash(shelf.children[at]); ctx.feedback('Already found. There is another way.'); return; }
    const nextFound = [...found, spinsNow];
    if (nextFound.length >= level.ways) {
      history.push({spins: spinsNow, found: nextFound}); done = true; render();
      ctx.solved({title: level.title, detail: level.detail});
      return;
    }
    // Keep this one on the shelf and start again from the first arrows.
    setTimeout(() => { if (done || history.state.spins.join('') !== key) return; history.push({spins: start, found: nextFound}); render(); ctx.feedback('One more way.'); }, 700);
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      solutions ||= best(board).states;
      const {spins, found} = history.state;
      const left = solutions.filter(st => !found.some(o => o.join('') === st.join('')));
      hinted = hintFlip(board, spins, left.length ? left : solutions);
      ctx.feedback(hinted === null ? null : 'Try flipping this one.');
      render();
    },
  };
}
