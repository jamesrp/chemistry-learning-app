// Ring patches: flat molecules of carbon rings joined edge to edge (the
// family of benzene, naphthalene and graphene). Each carbon has three or two
// carbon neighbours; one with two also holds a hydrogen. Every carbon makes
// four bonds, so with its three neighbours it needs exactly one double bond.
// A way to place the double bonds is a Kekulé structure, and in graph terms
// a perfect matching of the carbon skeleton.
//
// Rings are named by hexagon centres in axial coordinates: (q, r) sits at
// x = (q + r / 2) · W, y = 1.5 · r · R, so (1, 0), (0, 1) and (-1, 1) are
// three of a ring's six neighbours.

export const R = 26, W = R * Math.sqrt(3);

export function patch(centers) {
  const carbons = [], at = new Map(), bonds = [], seen = new Set(), rings = [];
  const place = (x, y) => {
    const key = `${Math.round(x)},${Math.round(y)}`;
    if (!at.has(key)) { at.set(key, carbons.length); carbons.push({x: +x.toFixed(2), y: +y.toFixed(2), rings: 0}); }
    return at.get(key);
  };
  for (const [q, r] of centers) {
    const cx = (q + r / 2) * W, cy = 1.5 * r * R;
    const ring = [0, 1, 2, 3, 4, 5].map(k => place(cx + R * Math.cos(Math.PI / 2 + k * Math.PI / 3), cy + R * Math.sin(Math.PI / 2 + k * Math.PI / 3)));
    rings.push({cx, cy, ring});
    ring.forEach((a, k) => {
      carbons[a].rings++;
      const b = ring[(k + 1) % 6], key = [a, b].sort((p, q2) => p - q2).join('-');
      if (!seen.has(key)) { seen.add(key); bonds.push([a, b]); }
    });
  }
  // A carbon on the rim with only two carbon neighbours holds a hydrogen.
  const degree = carbons.map(() => 0);
  for (const [a, b] of bonds) { degree[a]++; degree[b]++; }
  carbons.forEach((c, i) => { c.h = degree[i] === 2 ? 1 : 0; });
  return {carbons, bonds, rings};
}

// The molecular formula, C₁₄H₁₀.
export function formulaOf(p) {
  const sub = n => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
  const h = p.carbons.reduce((n, c) => n + c.h, 0);
  return `C${sub(p.carbons.length)}H${sub(h)}`;
}

// How many double bonds each carbon has, given a 0/1 per bond.
export function doubles(p, on) {
  const n = p.carbons.map(() => 0);
  p.bonds.forEach(([a, b], i) => { if (on[i]) { n[a]++; n[b]++; } });
  return n;
}
export const isKekule = (p, on) => doubles(p, on).every(n => n === 1);

// Every Kekulé structure (up to `limit`), each as a 0/1 per bond: match the
// lowest unmatched carbon with each free neighbour in turn.
export function kekule(p, limit = 5000) {
  const nb = p.carbons.map(() => []);
  p.bonds.forEach(([a, b], i) => { nb[a].push([b, i]); nb[b].push([a, i]); });
  const used = p.carbons.map(() => false), on = p.bonds.map(() => 0), out = [];
  const go = () => {
    if (out.length >= limit) return;
    const a = used.indexOf(false);
    if (a === -1) { out.push(on.slice()); return; }
    used[a] = true;
    for (const [b, i] of nb[a]) {
      if (used[b]) continue;
      used[b] = true; on[i] = 1;
      go();
      used[b] = false; on[i] = 0;
    }
    used[a] = false;
  };
  go();
  return out;
}

// A hint: a double bond that no unfound structure shares with the board
// (take it away), else a bond to make double toward the closest one.
export function hintBond(on, targets) {
  let best = null, dist = Infinity;
  for (const t of targets) {
    const d = t.reduce((n, v, i) => n + (v !== on[i] ? 1 : 0), 0);
    if (d > 0 && d < dist) { dist = d; best = t; }
  }
  if (!best) return null;
  const wrong = on.findIndex((v, i) => v && !best[i]);
  if (wrong >= 0) return {bond: wrong, wrong: true};
  return {bond: best.findIndex((v, i) => v && !on[i]), wrong: false};
}
