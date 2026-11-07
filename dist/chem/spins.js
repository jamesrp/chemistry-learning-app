// Spin grids: the Ising model. Each site holds a tiny magnet (an electron
// spin) that points up or down. Each line joins two neighbours and is happy
// when they agree (a ferromagnet line, as in iron) or, for an "opposite"
// line, when they disagree (an antiferromagnet, as in manganese oxide). The
// energy is the number of unhappy (red) lines; a board asks for the fewest.
//
// A board's map is rows of characters: U or D a pinned arrow, u or d a free
// arrow and its starting way, a space for no site. On a square grid a site
// joins its right and lower neighbours; on a triangle grid (grid: 'tri') row
// r is shifted half a step per row, so a site also joins the one below left.
// kind: 'f' every line likes matching arrows, 'a' every line likes opposite
// ones, 'mixed' reads `anti` ('1' for an opposite line) in line order.

export const S = 40;
const H = Math.sqrt(3) / 2;

export function parse(level) {
  const sites = [], at = new Map();
  level.map.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === ' ') return;
    const tri = level.grid === 'tri';
    at.set(`${r},${c}`, sites.length);
    sites.push({r, c, x: tri ? (c + r / 2) * S : c * S, y: tri ? r * H * S : r * S, pin: ch === 'U' || ch === 'D', start: ch === 'U' || ch === 'u' ? 1 : 0});
  }));
  const steps = level.grid === 'tri' ? [[0, 1], [1, 0], [1, -1]] : [[0, 1], [1, 0]];
  const lines = [];
  sites.forEach((p, i) => {
    for (const [dr, dc] of steps) {
      const j = at.get(`${p.r + dr},${p.c + dc}`);
      if (j !== undefined) lines.push({a: i, b: j});
    }
  });
  lines.forEach((l, k) => { l.anti = level.kind === 'a' || (level.kind === 'mixed' && level.anti[k] === '1'); });
  return {sites, lines};
}

export const startSpins = board => board.sites.map(p => p.start);
export const unhappy = (line, spins) => (spins[line.a] === spins[line.b]) === line.anti;
export const redCount = (board, spins) => board.lines.reduce((n, l) => n + (unhappy(l, spins) ? 1 : 0), 0);

// Every way to set the free arrows, by brute force (boards keep to about 20
// free arrows): the fewest red lines and every arrangement that reaches it.
export function best(board, limit = 5000) {
  const free = board.sites.map((p, i) => (p.pin ? -1 : i)).filter(i => i >= 0);
  const spins = startSpins(board), n = free.length;
  // For each free site, the lines it touches, so a flip updates the count.
  const touching = board.sites.map(() => []);
  board.lines.forEach(l => { touching[l.a].push(l); touching[l.b].push(l); });
  for (const i of free) spins[i] = 0;
  let red = redCount(board, spins), min = Infinity, states = [];
  const record = () => {
    if (red < min) { min = red; states = []; }
    if (red === min && states.length < limit) states.push(spins.slice());
  };
  record();
  // Gray code: step k flips the free site at the lowest set bit of k.
  for (let k = 1; k < 2 ** n; k++) {
    const i = free[Math.log2(k & -k)];
    for (const l of touching[i]) if (unhappy(l, spins)) red--;
    spins[i] ^= 1;
    for (const l of touching[i]) if (unhappy(l, spins)) red++;
    record();
  }
  return {min, states};
}

// The closest best arrangement to the board as it stands, and a free arrow
// that differs from it (the hint).
export function hintFlip(board, spins, states) {
  let pick = null, dist = Infinity;
  for (const st of states) {
    const d = st.reduce((n, v, i) => n + (v !== spins[i] ? 1 : 0), 0);
    if (d > 0 && d < dist) { dist = d; pick = st; }
  }
  if (!pick) return null;
  return board.sites.findIndex((p, i) => !p.pin && pick[i] !== spins[i]);
}
