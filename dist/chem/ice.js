// Square ice: oxygens on a grid, a hydrogen on every link between neighbours
// (and on the links that leave the grid at the edges). Each hydrogen sits
// close to one end. The ice rule: every oxygen has exactly two hydrogens
// close (that pair and the oxygen are one water molecule) and two far (held
// by hydrogen bonds). This is the six-vertex model.
//
// Links: horizontal h[r][c] joins (r, c-1) and (r, c) for c = 0..cols, where
// c = 0 and c = cols leave the grid; vertical v[r][c] joins (r-1, c) and
// (r, c) for r = 0..rows. A link's value is 0 when its hydrogen is close to
// the first end (left or top), 1 when close to the second, and -1 when unset.
export function links(rows, cols) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) out.push({kind: 'h', r, c, a: c > 0 ? [r, c - 1] : null, b: c < cols ? [r, c] : null});
  for (let r = 0; r <= rows; r++) for (let c = 0; c < cols; c++) out.push({kind: 'v', r, c, a: r > 0 ? [r - 1, c] : null, b: r < rows ? [r, c] : null});
  return out;
}

// For each oxygen: how many hydrogens are close, far, and unset.
export function counts(rows, cols, values) {
  const L = links(rows, cols), near = [], far = [], open = [];
  for (let i = 0; i < rows * cols; i++) { near.push(0); far.push(0); open.push(0); }
  const id = ([r, c]) => r * cols + c;
  L.forEach((l, i) => {
    const v = values[i];
    for (const [end, side] of [[l.a, 0], [l.b, 1]]) {
      if (!end) continue;
      if (v === -1) open[id(end)]++;
      else if (v === side) near[id(end)]++;
      else far[id(end)]++;
    }
  });
  return {near, far, open};
}

export function solved(rows, cols, values) {
  if (values.some(v => v === -1)) return false;
  return counts(rows, cols, values).near.every(n => n === 2);
}

// Every completion of the fixed values (null entries are free), up to
// `limit`. Each oxygen with two close (or two far) hydrogens forces the rest
// of its hydrogens; the search branches only when nothing is forced.
export function solveAll(rows, cols, fixed, limit = 1000) {
  const L = links(rows, cols), n = L.length, O = rows * cols;
  const id = ([r, c]) => r * cols + c;
  const ends = L.map(l => [l.a ? id(l.a) : -1, l.b ? id(l.b) : -1]);
  const around = Array.from({length: O}, () => []);
  ends.forEach(([a, b], i) => { if (a >= 0) around[a].push([i, 0]); if (b >= 0) around[b].push([i, 1]); });
  const values = new Array(n).fill(-1), near = new Array(O).fill(0), far = new Array(O).fill(0), trail = [], out = [];
  const set = (i, v) => {
    values[i] = v; trail.push(i);
    const [a, b] = ends[i];
    if (a >= 0) { if (v === 0) near[a]++; else far[a]++; }
    if (b >= 0) { if (v === 1) near[b]++; else far[b]++; }
    return !((a >= 0 && (near[a] > 2 || far[a] > 2)) || (b >= 0 && (near[b] > 2 || far[b] > 2)));
  };
  const undoTo = mark => {
    while (trail.length > mark) {
      const i = trail.pop(), v = values[i], [a, b] = ends[i];
      if (a >= 0) { if (v === 0) near[a]--; else far[a]--; }
      if (b >= 0) { if (v === 1) near[b]--; else far[b]--; }
      values[i] = -1;
    }
  };
  const propagate = queue => {
    while (queue.length) {
      const o = queue.pop();
      const fill = near[o] === 2 ? 'far' : far[o] === 2 ? 'near' : null;
      if (!fill) continue;
      for (const [i, side] of around[o]) {
        if (values[i] !== -1) continue;
        const v = fill === 'near' ? side : 1 - side;
        if (!set(i, v)) return false;
        for (const e of ends[i]) if (e >= 0) queue.push(e);
      }
    }
    return true;
  };
  for (let i = 0; i < n; i++) if (fixed[i] !== null && fixed[i] !== undefined) if (!set(i, fixed[i])) return out;
  if (!propagate([...Array(O).keys()])) return out;
  const go = () => {
    if (out.length >= limit) return;
    const i = values.indexOf(-1);
    if (i === -1) { out.push(values.slice()); return; }
    for (const v of [0, 1]) {
      const mark = trail.length;
      if (set(i, v) && propagate(ends[i].filter(e => e >= 0))) go();
      undoTo(mark);
      if (out.length >= limit) return;
    }
  };
  go();
  return out;
}

// Can the board be finished by forced moves alone (no guessing)?
export function forcedOnly(rows, cols, fixed) {
  const values = fixed.map(v => (v === null ? -1 : v));
  for (;;) {
    let moved = false;
    const {near, far} = counts(rows, cols, values), L = links(rows, cols);
    L.forEach((l, i) => {
      if (values[i] !== -1 || moved) return;
      for (const [end, side] of [[l.a, 0], [l.b, 1]]) {
        if (!end) continue;
        const o = end[0] * cols + end[1];
        if (near[o] === 2) { values[i] = 1 - side; moved = true; return; }
        if (far[o] === 2) { values[i] = side; moved = true; return; }
      }
    });
    if (!moved) return !values.includes(-1);
  }
}
