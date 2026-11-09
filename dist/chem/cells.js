// Crystal cells: a cubic unit cell as 27 spots, x, y and z each 0, 1 or 2.
// A crystal is the cube repeated in every direction, so a spot on a corner
// is shared by the 8 cubes that meet there and counts as ⅛ of an atom for
// this cube; an edge spot is shared by 4 (¼), a face spot by 2 (½), and the
// centre belongs to this cube alone. The crystals here are cubic: every
// corner looks alike, every edge alike and every face alike, so the spots
// fall into 4 classes, each filled with one kind of atom or left empty.
// Corners hold 8 × ⅛ = 1 atom, edges 12 × ¼ = 3, faces 6 × ½ = 3, the
// centre 1.
//
// Shifting the cube by half its body diagonal turns corners into the centre
// and edges into faces, and the crystal doesn't change (polonium drawn on
// the corners is polonium drawn in the middle). So a board accepts every
// fill that meets its counts and its rule, and tests/cells.test.mjs checks
// those fills are all one crystal, its answer or the answer shifted.

export const CLASSES = [
  {id: 'C', size: 8, frac: '⅛', atoms: 1, name: 'corners'},
  {id: 'E', size: 12, frac: '¼', atoms: 3, name: 'edges'},
  {id: 'F', size: 6, frac: '½', atoms: 3, name: 'faces'},
  {id: 'Z', size: 1, frac: '1', atoms: 1, name: 'middle'},
];
export const classById = id => CLASSES.find(c => c.id === id);
// The half-diagonal shift: same crystal, other drawing.
export const SHIFT = {C: 'Z', Z: 'C', E: 'F', F: 'E'};
export const shifted = fill => Object.fromEntries(Object.entries(fill).map(([c, el]) => [SHIFT[c], el]));

// A spot's class: how many of its coordinates sit in the middle (1).
export function classOf([x, y, z]) {
  return 'CEFZ'[[x, y, z].filter(v => v === 1).length];
}

export const SPOTS = [];
for (let z = 0; z < 3; z++) for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) SPOTS.push({x, y, z, cls: classOf([x, y, z])});

// fill: {classId: element}. Atoms per element, and the parts of each sum.
export function tally(fill) {
  const atoms = {}, parts = {};
  for (const c of CLASSES) {
    const el = fill[c.id];
    if (!el) continue;
    atoms[el] = (atoms[el] || 0) + c.atoms;
    (parts[el] ||= []).push(c);
  }
  return {atoms, parts};
}

// "8 × ⅛ + 6 × ½ = 4": one element's sum, biggest share first.
export function sumText(parts = [], atoms = 0) {
  const terms = [...parts].sort((a, b) => a.size - b.size).map(c => (c.size === 1 ? '1' : `${c.size} × ${c.frac}`));
  return terms.length ? `${terms.join(' + ')} = ${atoms}` : '0';
}

export const elementsOf = level => Object.keys(level.target);

// Side by side: spots one step apart along a grid line. Within the cube that
// joins corners to edges, edges to faces and faces to the middle; the
// repeated crystal adds no other pairs. The rule: on metal boards no two
// atoms may be side by side (they would overlap); on salt boards no two of
// the same ion. Returns the spots that break it.
const NEXT = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export function clashes(level, fill) {
  const at = new Map(SPOTS.map((p, i) => [`${p.x},${p.y},${p.z}`, i])), out = new Set();
  SPOTS.forEach((p, i) => {
    const el = fill[p.cls];
    if (!el) return;
    for (const [dx, dy, dz] of NEXT) {
      const j = at.get(`${p.x + dx},${p.y + dy},${p.z + dz}`);
      if (j === undefined) continue;
      const other = fill[SPOTS[j].cls];
      if (other && (level.rule === 'metal' || other === el)) { out.add(i); out.add(j); }
    }
  });
  return out;
}

// Solved: the cube holds exactly the target atoms, and the rule holds.
export function isSolved(level, fill) {
  const {atoms} = tally(fill);
  const els = new Set([...Object.keys(atoms), ...Object.keys(level.target)]);
  if (![...els].every(el => (atoms[el] || 0) === (level.target[el] || 0))) return false;
  return clashes(level, fill).size === 0;
}

// Every fill of the free classes that solves the level.
export function solveAll(level) {
  const els = elementsOf(level), given = level.given || {}, free = CLASSES.filter(c => !given[c.id]), out = [];
  const go = (k, fill) => {
    if (k === free.length) { if (isSolved(level, fill)) out.push({...fill}); return; }
    for (const el of [null, ...els]) {
      const next = {...fill};
      if (el) next[free[k].id] = el;
      go(k + 1, next);
    }
  };
  go(0, {...given});
  return out;
}

export const sameFill = (a, b) => CLASSES.every(c => (a[c.id] || null) === (b[c.id] || null));
