// Builds the Balance beams levels in dist/data/beams-levels.js. Each level
// below is an authored layout (beams, arms, where lower beams hang, any fixed
// weights) with a tray that the search found to have exactly one answer, or
// exactly two that are mirror images of each other. This script re-solves
// every level, refuses any whose count changed, and writes the answers in.
//   node scripts/make-beams.mjs              rebuild the levels file
//   node scripts/make-beams.mjs search <id> [k0 k1 lo hi]
//                                           list every tray of k0..k1 weights
//                                           from lo..hi with a single answer
//                                           (up to mirror) on that level's layout
import {writeFileSync} from 'node:fs';
import {solveAll, mirrorOf, symmetric, hooksOf} from '../dist/phys/beams.js';

const one = n => [{n}];
const LEVELS = [
  // Easy: one beam. A small weight far out holds up a big one close in.
  {id: 'two-three', tier: 'easy', beams: one(4), fixed: [[0, -3, 2]], tray: [3]},
  {id: 'four-ones', tier: 'easy', beams: one(4), fixed: [[0, -2, 4]], tray: [1, 1, 1]},
  {id: 'one-four', tier: 'easy', beams: one(4), fixed: [], tray: [1, 1, 4]},
  {id: 'same-side', tier: 'easy', beams: one(4), fixed: [[0, -2, 5]], tray: [2, 3]},
  // Medium: one beam, a tray that works only one way and its mirror image.
  {id: 'one-two-three', tier: 'medium', beams: one(3), fixed: [], tray: [1, 2, 3]},
  {id: 'three-four-seven', tier: 'medium', beams: one(4), fixed: [], tray: [3, 4, 7]},
  {id: 'nine-alone', tier: 'medium', beams: one(3), fixed: [], tray: [2, 5, 6, 9]},
  {id: 'two-eights', tier: 'medium', beams: one(4), fixed: [], tray: [1, 7, 8, 8]},
  {id: 'five-of-six', tier: 'medium', beams: one(3), fixed: [], tray: [5, 6, 7, 8, 8]},
  // Hard: mobiles. A lower beam balances first; its total then pulls on the beam above.
  {id: 'mobile-pair', tier: 'hard', beams: [{n: 3}, {l: 1, r: 2, parent: [0, -2]}], fixed: [[0, 1, 2]], tray: [2, 4, 5]},
  {id: 'mobile-three', tier: 'hard', beams: [{n: 3}, {l: 1, r: 2, parent: [0, -2]}], fixed: [[0, 1, 2]], tray: [1, 2, 4, 6]},
  {id: 'move-the-string', tier: 'hard', beams: [{n: 3}, {l: 1, r: 2, parent: [0, -3], free: true}], fixed: [[0, 1, 2]], tray: [2, 3, 4, 8]},
  {id: 'chain', tier: 'hard', beams: [{n: 3}, {l: 1, r: 2, parent: [0, -2]}, {l: 1, r: 2, parent: [1, 2]}], fixed: [[0, 1, 2]], tray: [1, 2, 6, 8]},
  {id: 'fork', tier: 'hard', beams: [{n: 3}, {l: 1, r: 2, parent: [0, -3]}, {l: 2, r: 1, parent: [0, 2]}], fixed: [], tray: [2, 3, 4, 4, 8]},
];

// One answer, or two mirror images; every beam carries a tray weight.
export function claimOf(level) {
  const sols = solveAll(level, {limit: 3});
  const mirror = sols.length === 2 && mirrorOf(level, sols[0], sols[1]);
  const ok = sols.length === 1 || mirror;
  const loaded = sols.length > 0 && level.beams.every((_, b) => Object.values(hooksOf(level, sols[0], b)).some(x => x.w !== undefined && !x.fixed));
  return {ok: ok && loaded, sols, mirror};
}

function* multisets(k, lo, hi, start = lo) { if (k === 0) { yield []; return; } for (let w = start; w <= hi; w++) for (const r of multisets(k - 1, lo, hi, w)) yield [w, ...r]; }

if (process.argv[2] === 'search') {
  const base = LEVELS.find(l => l.id === process.argv[3]);
  const [k0 = 3, k1 = 5, lo = 1, hi = 9] = process.argv.slice(4).map(Number);
  for (let k = k0; k <= k1; k++) for (const tray of multisets(k, lo, hi)) if (claimOf({...base, tray}).ok) console.log(tray.join(' '));
} else {
  const out = LEVELS.map(level => {
    const {ok, sols, mirror} = claimOf(level);
    if (!ok) throw new Error(`${level.id}: ${sols.length} answers`);
    if (mirror !== symmetric(level)) throw new Error(`${level.id}: mirror claim`);
    return {...level, answers: sols.length, mirror, solution: sols[0]};
  });
  const body = out.map(l => '  ' + JSON.stringify(l)).join(',\n');
  writeFileSync(new URL('../dist/data/beams-levels.js', import.meta.url),
    `// Balance beams levels, written by scripts/make-beams.mjs (do not edit by hand).\n// answers: how many arrangements solve it; mirror: the two are mirror images.\nexport default [\n${body},\n];\n`);
  console.log(out.map(l => `${l.tier} ${l.id}: ${l.answers}${l.mirror ? ' (mirror pair)' : ''}`).join('\n'));
}
