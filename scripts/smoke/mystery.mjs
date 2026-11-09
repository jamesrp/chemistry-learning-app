// Mystery molecule through the real board: on each level a wrong molecule
// from the same bag is built first (it lands on the tried shelf with its
// name, and the feedback says which card doesn't match), the board is
// cleared, a hint is read, and then the mystery itself is built and named.
import {MYSTERY_LEVELS} from '../../dist/data/mystery-levels.js';
import {enumerate, parseMol} from '../../dist/chem/isomers.js';
import {fingerprint} from '../../dist/chem/spectra.js';
import {triLattice} from '../../dist/chem/lattice.js';
import {nameOf} from '../../dist/families/mystery.js';

function embed(mol, lattice) {
  const n = mol.els.length, adj = lattice.points.map(() => new Set());
  for (const [a, b] of lattice.edges) { adj[a].add(b); adj[b].add(a); }
  const nb = mol.els.map(() => []);
  for (const [i, j] of mol.bonds) { nb[i].push(j); nb[j].push(i); }
  const at = new Array(n).fill(-1), used = new Set();
  const rec = i => {
    if (i === n) return true;
    for (let p = 0; p < lattice.points.length; p++) {
      if (used.has(p) || nb[i].some(j => j < i && !adj[p].has(at[j]))) continue;
      at[i] = p; used.add(p);
      if (rec(i + 1)) return true;
      used.delete(p);
    }
    return false;
  };
  return rec(0) ? at : null;
}

export default async function ({assert, go, $, $$, tap, tool, isSolvedShown, feedback}) {
  const lines = [];
  const build = (mol, lattice) => {
    const at = embed(mol, lattice);
    assert.ok(at, 'molecule fits the board');
    const edgeIndex = new Map(lattice.edges.map(([a, b], k) => [`${Math.min(a, b)},${Math.max(a, b)}`, k]));
    mol.els.forEach((el, i) => {
      tap($$('.el-chip').find(b => b.querySelector('.chip-el').textContent === el));
      tap($(`.mystery-board .place[data-i="${at[i]}"]`));
    });
    for (const [i, j, o] of mol.bonds) {
      const k = edgeIndex.get(`${Math.min(at[i], at[j])},${Math.max(at[i], at[j])}`);
      for (let t = 0; t < o; t++) tap($(`.mystery-board .hit[data-e="${k}"]`));
    }
  };
  for (const [k, level] of MYSTERY_LEVELS.entries()) {
    await go(`#/mystery/${k + 1}`);
    const n = Object.values(level.heavy).reduce((a, b) => a + b, 0), lattice = triLattice(n > 5 ? 5 : 4, 4, 30);
    const target = parseMol(level.target[1]), fp = fingerprint(target, level.cards);
    assert.equal($$('.spec-card').length, level.cards.length, `${level.id}: one card per clue`);
    // A wrong molecule, named if one is.
    const wrongs = enumerate(level).filter(m => fingerprint(m, level.cards) !== fp);
    const wrong = wrongs.find(m => nameOf(m) && embed(m, lattice)) || wrongs.find(m => embed(m, lattice));
    build(wrong, lattice);
    assert.equal(isSolvedShown(), false, `${level.id}: a wrong molecule doesn't solve`);
    assert.match(feedback(), /match\.$/, `${level.id}: says which card is off`);
    assert.ok($('.spec-card.miss'), `${level.id}: a card shows red`);
    assert.equal($$('.shelf.tried .shelf-item').length, 1, `${level.id}: wrong one kept on the shelf`);
    assert.equal($('.shelf.tried .shelf-name').textContent, nameOf(wrong) || 'no common name');
    tap($$('.actions .secondary').find(b => b.textContent === 'Clear board'));
    assert.equal($$('.mystery-board .place').length, lattice.points.length, `${level.id}: board cleared`);
    assert.equal($$('.shelf.tried .shelf-item').length, 1, `${level.id}: shelf kept after clearing`);
    tap(tool('Hint'));
    assert.ok(feedback().length > 10, `${level.id}: hint says something`);
    build(target, lattice);
    assert.ok(isSolvedShown(), `${level.id} solved`);
    assert.equal($$('.spec-card.match').length, level.cards.length);
    assert.equal($('.solved-title').textContent, level.target[0]);
    lines.push(`mystery/${level.id}: ${level.target[0]}, ${level.formula} (wrong try: ${nameOf(wrong) || 'unnamed'})`);
  }
  return lines;
}
