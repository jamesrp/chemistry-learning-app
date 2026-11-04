// A triangular lattice of places, for building molecules freely: every place
// has up to six neighbours, so rings of three and four fit, and bonds drawn
// between neighbours never cross.
export function triLattice(cols, rows, step = 24) {
  const points = [], index = new Map();
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    index.set(`${r},${c}`, points.length);
    points.push({r, c, x: c * step + (r % 2 ? step / 2 : 0), y: r * step * Math.sqrt(3) / 2});
  }
  const edges = [];
  const add = (a, b) => { if (a !== undefined && b !== undefined) edges.push([a, b]); };
  for (const p of points) {
    const i = index.get(`${p.r},${p.c}`);
    add(i, index.get(`${p.r},${p.c + 1}`));
    const below = p.r % 2 ? [p.c, p.c + 1] : [p.c - 1, p.c];
    for (const c of below) add(i, index.get(`${p.r + 1},${c}`));
  }
  return {points, edges, step};
}
