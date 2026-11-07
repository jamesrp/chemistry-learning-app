// Electron swap board: metal and non-metal atoms side by side, each drawn
// with its outer electrons as dots. Tap the line between a metal and a
// non-metal to move one outer electron across it, from the metal; tap again
// to move another, and once the line holds as many as it can, a tap sends
// them all back. Every atom is finished when its metal has given all its
// outer electrons or its non-metal has eight: then they are ions.
import levels from '../data/swap-levels.js';
import {OUTER, isMetal, status, isSolved, solveAll, products, chargeText, capOf} from '../chem/swap.js';
import {h, s, tappable, History, viewBoxAround, f} from '../ui.js';

const R = 14, DOT = 2.1, RING = R + 5.5;
const METAL = {Li: '#d9d6e8', Na: '#e2ddcc', K: '#e6d8c4', Mg: '#ece6d2', Ca: '#f3eedf', Al: '#d3dbe2'};

export const swap = {
  id: 'swap',
  name: 'Electron swap',
  levels,
  howTo: [
    'Each atom shows its outer electrons as dots. Metals (sodium, magnesium, aluminum…) have a few to give away. Non-metals (chlorine, oxygen, nitrogen…) want eight.',
    'Tap the line between a metal and a non-metal to move one electron across. Tap again to move another. A tap on a full line sends its electrons back.',
    'An atom is finished when a metal has none left or a non-metal has eight: then it is an ion, with a charge. Finish every atom.',
  ],
  notes: {
    chemistry: 'Charge jigsaw takes the charges of ions as given; this shows where they come from. Electrons sit in shells around the nucleus, and the outer shell decides how an atom reacts. Sodium has one outer electron and chlorine is one short of eight, so sodium hands one over and both end with a full outer shell, as Na⁺ and Cl⁻. Magnesium gives two (Mg²⁺), aluminum three (Al³⁺); oxygen takes two (O²⁻) and nitrogen three (N³⁻). Count the electrons on a finished board and you have the formula: two aluminums give six, three oxygens take six, so aluminum oxide is Al₂O₃. Some boards make more than one compound, and the title lists each.',
    maths: 'Each line carries a whole number from 0 up to the smaller of what its two atoms can give or take, and every atom’s lines must add up exactly to its number. That is a flow in a bipartite graph with fixed supplies and demands, and the boards are built so it is a logic puzzle like Valence bridges: the solver tries every flow and each board has exactly one. A board can only work when the electrons given equal the electrons taken, which is the formula unit’s least common multiple again (Al₂O₃: 2 × 3 = 3 × 2 = 6).',
    caution: '“Atoms want a full shell” is a rule of thumb, not a reason. Pulling electrons off sodium costs energy; it is the strong attraction between the ions packed in a crystal that pays for it. Real salts aren’t pairs of atoms either: every ion in a crystal touches several of the other kind. The board shows which atom gave to which only so the counting can be seen.',
    kitchen: 'Draw Bohr pictures with coins: a 1p (or a penny) for each outer electron round a paper circle. Slide the coins from sodium to chlorine, magnesium to oxygen, and count the charges left behind. Then dissolve salt in water and test it with the LED tester from Charge jigsaw: the ions carry the current.',
  },
  mount,
};

// "a", "a and b", "a, b and c".
const listText = xs => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

function mount(host, level, ctx) {
  const board = {atoms: level.atoms, links: level.links};
  const history = new History({flow: board.links.map(() => 0)});
  let solution = null, hinted = null, done = false;
  const xy = board.atoms.map(([, x, y]) => [x, y]);
  const vb = viewBoxAround(xy, {pad: RING + 16});
  const svg = s('svg', {class: 'board-svg swap', viewBox: vb.box, 'aria-label': 'Atoms board'});
  host.append(svg);

  function render() {
    const {flow} = history.state, st = status(board, flow);
    svg.replaceChildren();
    board.links.forEach(([a, b], k) => {
      const A = xy[a], B = xy[b], dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const n = flow[k], g = s('g', {class: `swap-link ${n ? 'moving' : ''} ${hinted === k ? 'hinted' : ''}`});
      const p1 = [A[0] + ux * (RING + 2), A[1] + uy * (RING + 2)], p2 = [B[0] - ux * (RING + 2), B[1] - uy * (RING + 2)];
      g.append(s('line', {class: n ? 'swap-line' : 'slot', x1: f(p1[0]), y1: f(p1[1]), x2: f(p2[0]), y2: f(p2[1])}));
      if (n) {
        // An arrowhead toward the non-metal, and the electrons on their way.
        const tip = p2, back = [tip[0] - ux * 6, tip[1] - uy * 6];
        g.append(s('path', {class: 'swap-arrow', d: `M${f(back[0] - uy * 4)} ${f(back[1] + ux * 4)}L${f(tip[0])} ${f(tip[1])}L${f(back[0] + uy * 4)} ${f(back[1] - ux * 4)}`}));
        const mid = len / 2;
        for (let e = 0; e < n; e++) {
          const t = mid + (e - (n - 1) / 2) * 6.5;
          g.append(s('circle', {class: 'electron moving', cx: f(A[0] + ux * t), cy: f(A[1] + uy * t), r: DOT + 0.4}));
        }
      }
      if (!done) {
        const hit = s('line', {class: 'hit', 'data-link': k, x1: f(p1[0]), y1: f(p1[1]), x2: f(p2[0]), y2: f(p2[1])});
        tappable(hit, `${board.atoms[a][0]} to ${board.atoms[b][0]}, ${n} electron${n === 1 ? '' : 's'} moved; tap to move ${n >= capOf(board, k) ? 'them back' : 'one more'}`, () => tap(k));
        g.append(hit);
      }
      svg.append(g);
    });
    board.atoms.forEach(([el, x, y], i) => {
      const a = st[i], metal = isMetal(el);
      const g = s('g', {class: `atom swap-atom ${metal ? 'metal' : `el-${el}`} ${a.full ? 'full' : ''} ${a.over ? 'over' : ''}`, transform: `translate(${x} ${y})`, 'data-atom': i});
      g.append(s('circle', {class: 'atom-disc', r: R, fill: metal ? METAL[el] : null}));
      g.append(s('text', {class: 'atom-label', y: 4.6, 'font-size': el.length > 1 ? 12 : 14}, el));
      // Outer electrons: a metal's that are left; a non-metal's own and the ones it took.
      const own = metal ? Math.max(0, OUTER[el] - a.n) : OUTER[el], got = metal ? 0 : a.n;
      for (let e = 0; e < Math.min(8, own + got); e++) {
        const t = -Math.PI / 2 + (Math.floor(e / 2) * Math.PI) / 2 + (e % 2 ? 0.28 : -0.28);
        g.append(s('circle', {class: `electron ${e >= own ? 'moving' : ''}`, cx: f(Math.cos(t) * RING), cy: f(Math.sin(t) * RING), r: DOT}));
      }
      if (a.n) g.append(s('text', {class: 'ion-charge', x: R + 2, y: -R + 3}, chargeText(el, a.n)));
      svg.append(g);
    });
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done && isSolved(board, flow)) {
      done = true; render();
      const made = products(board, flow);
      ctx.solved({title: made.map(p => p.formula).join(' + '), detail: listText(made.map(p => p.name))});
    }
  }

  function tap(k) {
    if (done) return;
    const flow = history.state.flow.slice();
    flow[k] = flow[k] >= capOf(board, k) ? 0 : flow[k] + 1;
    hinted = null; ctx.feedback(null);
    history.push({flow});
    render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); hinted = null; ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); hinted = null; ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      solution ||= solveAll(board, 1)[0];
      const {flow} = history.state;
      const over = flow.findIndex((v, k) => v > solution[k]);
      const under = flow.findIndex((v, k) => v < solution[k]);
      hinted = over >= 0 ? over : under >= 0 ? under : null;
      ctx.feedback(over >= 0 ? 'Too many electrons on this line.' : null);
      render();
    },
  };
}
