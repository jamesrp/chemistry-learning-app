// Ring patches board: a flat carbon molecule drawn with every line single.
// Tap a line to make it a double bond, tap again to make it single. Every
// carbon needs exactly one double bond; a carbon with one rings green, with
// two rings red. Find the number of ways the board asks for, each one a
// different Kekulé structure; found ones wait on the shelf.
import levels from '../data/ring-levels.js';
import {patch, doubles, isKekule, kekule, hintBond, formulaOf} from '../chem/rings.js';
import {h, s, tappable, History, bondLines, viewBoxAround, f, flash} from '../ui.js';

const CR = 6, HR = 4.2, HOUT = 13;

export const rings = {
  id: 'rings',
  name: 'Ring patches',
  levels,
  howTo: [
    'These molecules are rings of carbon atoms joined edge to edge. Every line starts as a single bond. Tap a line to make it a double bond, and tap again to make it single.',
    'Each carbon needs exactly one double bond: then it makes 4 bonds in all, counting its hydrogen if it has one. A carbon with one double bond turns green.',
    'There is more than one way to do it. Find as many different ways as the board asks for; each one you find goes on the shelf.',
  ],
  notes: {
    chemistry: 'Benzene’s two drawings are the start of a big family. Rings of carbon joined edge to edge are polycyclic aromatic hydrocarbons: naphthalene is the smell of mothballs, pyrene and coronene are found in soot and even in space, and a big enough flat patch is graphene, one layer of the graphite in a pencil. Each way of placing the double bonds is a Kekulé structure. The real molecule is none of them: its electrons are spread over all the rings, which is why every carbon–carbon bond in benzene is the same length. Chemists still use the number of Kekulé structures as a rough guide to how stable such a molecule is.',
    maths: 'A Kekulé structure is a perfect matching of the carbon skeleton: a set of edges that touches every vertex exactly once. The solver lists them all by matching the lowest unmatched carbon with each free neighbour in turn. A straight row of n rings has n + 1; the kinked rows and branched patches grow faster (chrysene 8, triphenylene 9, coronene 20, ovalene 50). For a hexagon-shaped patch of rings with sides a, b and c, the matchings are the lozenge tilings of a hexagon, and MacMahon’s formula counts them: sides 2, 2, 2 is coronene with 20, and sides 3, 3, 3 is circumcoronene with 980. Some patches have none at all, such as the one with three rings around a single carbon (phenalenyl), whose carbon count is odd.',
    caution: 'Double bonds don’t really sit in fixed places, and the drawings are bookkeeping for electrons that are shared across the rings. Several of these compounds (anthracene, benz[a]anthracene, chrysene and others) are found in smoke and tar and some cause cancer, so they belong on the screen, not the kitchen table.',
    kitchen: 'Draw a honeycomb patch on paper and colour the double bonds with a highlighter; then cut hexagons from card and tile a big one (a lozenge tiling) to see the same counting from another side. Rub pencil lead onto sticky tape and peel it apart a few times: that is roughly how graphene was first made, in 2004.',
  },
  mount,
};

function mount(host, level, ctx) {
  const p = patch(level.rings), formula = formulaOf(p), all = level.find === level.ways;
  const blank = p.bonds.map(() => 0);
  const history = new History({on: blank, found: []});
  let solutions = null, hinted = null, done = false;
  // Hydrogens point out from the ring a rim carbon belongs to.
  const centreOf = i => {
    const rs = p.rings.filter(rg => rg.ring.includes(i));
    return [rs.reduce((a, rg) => a + rg.cx, 0) / rs.length, rs.reduce((a, rg) => a + rg.cy, 0) / rs.length];
  };
  const hydrogens = p.carbons.map((c, i) => {
    if (!c.h) return null;
    const [cx, cy] = centreOf(i), d = Math.hypot(c.x - cx, c.y - cy);
    return [c.x + (c.x - cx) / d * HOUT, c.y + (c.y - cy) / d * HOUT];
  });
  const pts = [...p.carbons.map(c => [c.x, c.y]), ...hydrogens.filter(Boolean)];
  const vb = viewBoxAround(pts, {pad: 10});
  const goal = h('p', {class: 'puzzle-goal'});
  const svg = s('svg', {class: 'board-svg rings', viewBox: vb.box, 'aria-label': `${level.name} board`});
  const shelf = h('div', {class: 'shelf'});
  host.append(goal, svg, shelf);

  function render() {
    const {on, found} = history.state, n = doubles(p, on);
    goal.replaceChildren(all ? `Find all ${level.ways} ways to place the double bonds.` : `Find ${level.find} of the ${level.ways} ways to place the double bonds.`,
      ' ', h('span', {class: 'found-count'}, `Found ${found.length}`));
    svg.replaceChildren();
    hydrogens.forEach((hp, i) => {
      if (!hp) return;
      const c = p.carbons[i];
      svg.append(s('line', {class: 'ch-bond', x1: c.x, y1: c.y, x2: f(hp[0]), y2: f(hp[1])}), s('circle', {class: 'ring-h', cx: f(hp[0]), cy: f(hp[1]), r: HR}));
    });
    p.bonds.forEach(([a, b], i) => {
      const A = [p.carbons[a].x, p.carbons[a].y], B = [p.carbons[b].x, p.carbons[b].y];
      const g = s('g', {class: `ring-bond ${on[i] ? 'double' : 'single'} ${hinted && hinted.bond === i ? 'hinted' : ''}`});
      g.append(...bondLines(A, B, on[i] ? 2 : 1, {pull: CR - 1, gap: 3.6}));
      if (!done) {
        // The tap line stops short of the carbons, so crowded boards hit the right bond.
        const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), k = (CR + 2) / len;
        const hit = s('line', {class: 'hit', 'data-b': i, x1: f(A[0] + dx * k), y1: f(A[1] + dy * k), x2: f(B[0] - dx * k), y2: f(B[1] - dy * k)});
        tappable(hit, `${on[i] ? 'Double' : 'Single'} bond; tap to make it ${on[i] ? 'single' : 'double'}`, () => tap(i));
        g.append(hit);
      }
      svg.append(g);
    });
    p.carbons.forEach((c, i) => svg.append(s('circle', {class: `ring-c ${n[i] === 1 ? 'full' : n[i] > 1 ? 'over' : ''}`, cx: c.x, cy: c.y, r: CR})));
    shelf.replaceChildren(...found.map(miniOf));
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && isKekule(p, on)) check(on);
  }

  function miniOf(on) {
    const mini = s('svg', {class: 'mini', viewBox: vb.box, role: 'img', 'aria-label': 'Found structure'});
    p.bonds.forEach(([a, b], i) => mini.append(...bondLines([p.carbons[a].x, p.carbons[a].y], [p.carbons[b].x, p.carbons[b].y], on[i] ? 2 : 1, {gap: 5})));
    return h('div', {class: 'shelf-item'}, mini);
  }

  function tap(i) {
    if (done) return;
    const on = history.state.on.slice();
    on[i] ^= 1;
    hinted = null; ctx.feedback(null);
    history.push({...history.state, on});
    render();
  }

  function check(on) {
    const {found} = history.state, key = on.join('');
    const at = found.findIndex(o => o.join('') === key);
    if (at >= 0) { flash(shelf.children[at]); ctx.feedback('Already found. Try another way.'); return; }
    const nextFound = [...found, on];
    if (nextFound.length >= level.find) {
      history.push({on, found: nextFound}); done = true; render();
      ctx.solved({title: level.name, detail: `${formula}${level.also ? `, ${level.also}` : ''}: ${all ? (level.ways === 2 ? 'both ways' : `all ${level.ways} ways`) : `${level.ways} ways in all`}`});
      return;
    }
    // Keep this one on the shelf and start again with every bond single.
    setTimeout(() => { if (done || history.state.on.join('') !== key) return; history.push({on: blank, found: nextFound}); render(); ctx.feedback('One more way.'); }, 700);
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      solutions ||= kekule(p, 1000);
      const {on, found} = history.state;
      const left = solutions.filter(sol => !found.some(o => o.join('') === sol.join('')));
      hinted = hintBond(on, left);
      ctx.feedback(hinted && hinted.wrong ? 'Make this one single again.' : null);
      render();
    },
  };
}
