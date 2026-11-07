// Crystal cells: a cubic unit cell as 27 spots, x, y and z each 0, 1 or 2.
// A crystal is the cube repeated in every direction, so a spot on a corner
// is shared by the 8 cubes that meet there and counts as ⅛ of an atom for
// this cube; an edge spot is shared by 4 (¼), a face spot by 2 (½), and the
// centre belongs to this cube alone. Repeating also means all 8 corners hold
// the same atom, opposite faces match and the 4 parallel edges match, so the
// spots fall into 8 sets: corners, 3 sets of edges, 3 pairs of faces and the
// centre. Each set holds exactly one atom's worth, which is the surprise
// behind the fractions: 8 × ⅛ = 4 × ¼ = 2 × ½ = 1.

export const SETS = [
  {id: 'C', size: 8, frac: '⅛', name: 'corners'},
  {id: 'Ex', size: 4, frac: '¼', name: 'edges'}, {id: 'Ey', size: 4, frac: '¼', name: 'edges'}, {id: 'Ez', size: 4, frac: '¼', name: 'edges'},
  {id: 'Fx', size: 2, frac: '½', name: 'faces'}, {id: 'Fy', size: 2, frac: '½', name: 'faces'}, {id: 'Fz', size: 2, frac: '½', name: 'faces'},
  {id: 'Z', size: 1, frac: '1', name: 'centre'},
];
export const setById = id => SETS.find(st => st.id === id);

// Which set a spot belongs to: count its coordinates equal to 1 (the middle).
export function setOf([x, y, z]) {
  const mid = [x, y, z].map(v => v === 1), n = mid.filter(Boolean).length;
  if (n === 0) return 'C';
  if (n === 3) return 'Z';
  // An edge runs along the one axis where the spot is in the middle; a face
  // faces the one axis where it isn't.
  return n === 1 ? `E${'xyz'[mid.indexOf(true)]}` : `F${'xyz'[mid.indexOf(false)]}`;
}

export const SPOTS = [];
for (let z = 0; z < 3; z++) for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) SPOTS.push({x, y, z, set: setOf([x, y, z])});

// fill: {setId: element}. Balls used and atoms counted, per element.
export function tally(fill) {
  const balls = {}, atoms = {}, parts = {};
  for (const st of SETS) {
    const el = fill[st.id];
    if (!el) continue;
    balls[el] = (balls[el] || 0) + st.size;
    atoms[el] = (atoms[el] || 0) + 1;
    (parts[el] ||= {})[st.size] = (parts[el][st.size] || 0) + st.size;
  }
  return {balls, atoms, parts};
}

// "8 × ⅛ + 6 × ½ = 4": the sum for one element, biggest share first.
export function sumText(parts, atoms) {
  const frac = {8: '⅛', 4: '¼', 2: '½', 1: '1'};
  const terms = [1, 2, 4, 8].filter(size => parts && parts[size]).map(size => `${parts[size]} × ${frac[size]}`);
  return terms.length ? `${terms.join(' + ')} = ${atoms}` : '0';
}

export const elementsOf = level => [...new Set([...Object.keys(level.target), ...Object.keys(level.tray)])];
export const ballsLeft = (level, fill) => {
  const {balls} = tally(fill), given = tally(level.given || {}).balls, left = {};
  for (const el of Object.keys(level.tray)) left[el] = level.tray[el] - ((balls[el] || 0) - (given[el] || 0));
  return left;
};

// The salt rule (levels with apart: true): ions of the same kind repel, so
// no two of them sit side by side along a line of the grid. Returns the
// spots that break it.
const NEXT = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export function clashes(fill) {
  const at = new Map(SPOTS.map((p, i) => [`${p.x},${p.y},${p.z}`, i])), out = new Set();
  SPOTS.forEach((p, i) => {
    const el = fill[p.set];
    if (!el) return;
    for (const [dx, dy, dz] of NEXT) {
      const j = at.get(`${p.x + dx},${p.y + dy},${p.z + dz}`);
      if (j !== undefined && fill[SPOTS[j].set] === el) { out.add(i); out.add(j); }
    }
  });
  return out;
}

// Solved: every ball in the tray placed, the cube holds the target, and on
// salt levels no two of the same ion touch.
export function isSolved(level, fill) {
  const left = ballsLeft(level, fill), {atoms} = tally(fill);
  if (Object.values(left).some(n => n !== 0)) return false;
  if (level.apart && clashes(fill).size) return false;
  const els = new Set([...Object.keys(atoms), ...Object.keys(level.target)]);
  return [...els].every(el => (atoms[el] || 0) === (level.target[el] || 0));
}

// Every way to fill the free sets that solves the level.
export function solveAll(level) {
  const els = elementsOf(level), given = level.given || {}, free = SETS.filter(st => !given[st.id]), out = [];
  const go = (k, fill) => {
    if (k === free.length) { if (isSolved(level, fill)) out.push({...fill}); return; }
    for (const el of [null, ...els]) {
      const next = {...fill};
      if (el) next[free[k].id] = el;
      // Prune: never more balls of an element than the tray holds.
      if (el && ballsLeft(level, next)[el] < 0) continue;
      go(k + 1, next);
    }
  };
  go(0, {...given});
  return out;
}
