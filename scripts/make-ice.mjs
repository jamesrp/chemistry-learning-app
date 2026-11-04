// Builds the Square ice boards in dist/data/ice-levels.js: for each size, a
// random ice arrangement (seeded), then the fewest givens (all edge hydrogens
// plus some inside ones) that leave exactly one solution. Run it to rebuild (it is seeded, so it rebuilds the same boards):
//   node scripts/make-ice.mjs
import {writeFileSync} from 'node:fs';
import {links, solveAll} from '../dist/chem/ice.js';

function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; }; }
const shuffle = (list, rand) => { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list; };

// A random ice arrangement: start from every hydrogen close to its right or
// lower oxygen (each oxygen then has its left and top hydrogens close), then
// reverse many random loops of arrows. Read a close hydrogen as an arrow
// pointing at its oxygen; reversing a loop that follows the arrows keeps two
// arrows in and two out at every oxygen. "Outside" is one extra stop, so a
// path in from one edge and out at another counts as a loop.
function randomIce(rows, cols, rand) {
  const L = links(rows, cols), OUT = rows * cols, id = e => (e ? e[0] * cols + e[1] : OUT);
  const values = L.map(() => 1);
  for (let step = 0; step < 400 * L.length; step++) {
    let at = Math.floor(rand() * (OUT + 1));
    const path = [], seen = new Map([[at, 0]]);
    for (;;) {
      // Arrows leaving `at`: links whose far end (from the hydrogen's oxygen) is `at`.
      const outs = [];
      L.forEach((l, i) => { const from = values[i] === 1 ? id(l.a) : id(l.b), to = values[i] === 1 ? id(l.b) : id(l.a); if (from === at && to !== at) outs.push([i, to]); });
      if (!outs.length) break;
      const [i, to] = outs[Math.floor(rand() * outs.length)];
      path.push(i);
      if (seen.has(to)) { for (const j of path.slice(seen.get(to))) values[j] = 1 - values[j]; break; }
      seen.set(to, path.length); at = to;
    }
  }
  return values;
}

function makeBoard(rows, cols, seed, {extraGivens = 0} = {}) {
  const rand = rng(seed), L = links(rows, cols), sol = randomIce(rows, cols, rand);
  const edge = L.map(l => !l.a || !l.b), fixed = L.map((l, i) => (edge[i] ? sol[i] : null));
  const inner = shuffle(L.map((_, i) => i).filter(i => !edge[i]), rand);
  // Add inside givens until the board has one solution, then drop any that
  // aren't needed.
  for (const i of inner) { if (solveAll(rows, cols, fixed, 2).length === 1) break; fixed[i] = sol[i]; }
  for (const i of inner) {
    if (fixed[i] === null) continue;
    const keep = fixed[i]; fixed[i] = null;
    if (solveAll(rows, cols, fixed, 2).length !== 1) fixed[i] = keep;
  }
  for (const i of inner) { if (extraGivens <= 0) break; if (fixed[i] === null) { fixed[i] = sol[i]; extraGivens--; } }
  return {rows, cols, fixed, solution: sol};
}

const specs = [
  ['ice-1', 'easy', 2, 2, 11, 1], ['ice-2', 'easy', 2, 3, 12, 1], ['ice-3', 'easy', 3, 3, 13, 2], ['ice-4', 'easy', 3, 3, 14, 1],
  ['ice-5', 'medium', 3, 4, 21, 1], ['ice-6', 'medium', 4, 4, 22, 0], ['ice-7', 'medium', 4, 4, 23, 0], ['ice-8', 'medium', 4, 5, 24, 0],
  ['ice-9', 'hard', 5, 5, 31, 0], ['ice-10', 'hard', 5, 5, 32, 0], ['ice-11', 'hard', 5, 6, 33, 0], ['ice-12', 'hard', 6, 6, 34, 0],
];
const levels = specs.map(([id, tier, rows, cols, seed, extra]) => {
  const b = makeBoard(rows, cols, seed, {extraGivens: extra});
  return {id, tier, rows, cols, fixed: b.fixed.map(v => (v === null ? '.' : String(v))).join(''), solution: b.solution.join('')};
});
writeFileSync(new URL('../dist/data/ice-levels.js', import.meta.url), '// Built by scripts/make-ice.mjs; fixed: one character per link (. free, 0 or 1 fixed).\nexport default ' + JSON.stringify(levels, null, 1) + ';\n');
for (const l of levels) console.log(l.id, `${l.rows}x${l.cols}`, 'free', [...l.fixed].filter(c => c === '.').length, 'of', l.fixed.length);
