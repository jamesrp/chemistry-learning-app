// Plays every level of Chem Studio through its real DOM in jsdom, tapping
// the controls a child would tap and following each level's checked
// solution, plus undo, hints, duplicates and the home and Grown-ups pages.
// jsdom is not a dependency of the app: npm install --no-save jsdom, then
// node scripts/dom-smoke.mjs. It checks behaviour, not layout or looks.
import {JSDOM} from 'jsdom';
import assert from 'node:assert/strict';
const APP = new URL('../dist/', import.meta.url).href;
const dom = new JSDOM('<!doctype html><body><div id="app"></div></body>', {url: 'http://localhost/', pretendToBeVisual: true});
const w = dom.window;
w.scrollTo = () => {};
Object.assign(globalThis, {window: w, document: w.document, location: w.location, localStorage: w.localStorage, Node: w.Node, HTMLElement: w.HTMLElement});
globalThis.addEventListener = w.addEventListener.bind(w);
const errors = [];
w.addEventListener('error', e => errors.push(e.message));
process.on('unhandledRejection', e => errors.push(String(e)));

const tick = (ms = 5) => new Promise(r => setTimeout(r, ms));
const go = async hash => { w.location.hash = hash; await tick(20); };
const $ = sel => w.document.querySelector(sel), $$ = sel => [...w.document.querySelectorAll(sel)];
const tap = node => { assert.ok(node, 'missing control'); node.dispatchEvent(new w.MouseEvent('click', {bubbles: true, cancelable: true})); };
const solvedStrip = () => $('.solved-strip');
const isSolvedShown = () => solvedStrip() && !solvedStrip().hidden;
const feedback = () => $('.feedback').textContent;
let played = 0;
const results = [];

await import(APP + 'main.js');
await tick(20);
// Home
assert.equal($$('.family').length, (await import(APP + 'families/index.js')).FAMILIES.length);
const {FAMILIES} = await import(APP + 'families/index.js');
assert.equal($$('.level').length, FAMILIES.reduce((n, f) => n + f.levels.length, 0));

// ---- Valence bridges
const {BRIDGE_LEVELS} = await import(APP + 'data/bridges-levels.js');
const B = await import(APP + 'chem/bridges.js');
for (const [i, level] of BRIDGE_LEVELS.entries()) {
  await go(`#/bridges/${i + 1}`);
  const sols = B.solveAll(level), lo = B.minOrder(level), bondsAtStart = $$('.bridges .bond').length;
  // Ring boards start with every line single, so a line takes (order - lo) taps.
  const play = sol => sol.forEach((o, e) => { for (let t = lo; t < o; t++) tap($(`.bridges .hit[data-e="${e}"]`)); });
  // Undo check on first edge.
  tap($(`.bridges .hit[data-e="0"]`));
  assert.notEqual($$('.bridges .bond').length, bondsAtStart, 'tapping a line changes its bond');
  tap($$('.tool').find(b => b.textContent === 'Undo'));
  assert.equal($$('.bridges .bond').length, bondsAtStart, 'undo removes it');
  tap($$('.tool').find(b => b.textContent === 'Hint'));
  assert.ok($('.edge.hinted'), `${level.id}: hint marks an edge`);
  for (const [k, sol] of sols.entries()) {
    play(sol);
    if (level.findAll && k < sols.length - 1) {
      assert.equal(isSolvedShown(), false);
      await tick(800);
      assert.equal($$('.shelf .shelf-item').length, k + 1);
      // The same one again is refused.
      if (k === 0) {
        const taps = sols[0].reduce((a, b) => a + b - lo, 0);
        play(sols[0]);
        assert.match(feedback(), /Already found/);
        for (let t = 0; t < taps; t++) tap($$('.tool').find(b => b.textContent === 'Undo'));
        assert.equal($$('.bridges .bond').length, bondsAtStart);
        assert.equal($$('.shelf .shelf-item').length, 1, 'undo keeps what was found');
      }
    }
  }
  assert.ok(isSolvedShown(), `${level.id} solved`);
  assert.equal($('.solved-title').textContent, level.formula);
  played++; results.push(`bridges/${level.id}`);
}

// ---- Isomer hunt
const {ISOMER_LEVELS} = await import(APP + 'data/isomer-levels.js');
const I = await import(APP + 'chem/isomers.js');
const {triLattice} = await import(APP + 'chem/lattice.js');
function embed(mol, lattice, skip = 0) {
  const n = mol.els.length, adj = lattice.points.map(() => new Set());
  for (const [a, b] of lattice.edges) { adj[a].add(b); adj[b].add(a); }
  const nb = mol.els.map(() => []);
  for (const [i, j] of mol.bonds) { nb[i].push(j); nb[j].push(i); }
  const at = new Array(n).fill(-1), used = new Set();
  let found = 0, out = null;
  const rec = i => {
    if (i === n) { if (found++ === skip) { out = at.slice(); return true; } return false; }
    for (let p = 0; p < lattice.points.length; p++) {
      if (used.has(p) || nb[i].some(j => j < i && !adj[p].has(at[j]))) continue;
      at[i] = p; used.add(p);
      if (rec(i + 1)) return true;
      used.delete(p);
    }
    return false;
  };
  rec(0);
  return out;
}
async function buildMol(mol, lattice, skip = 0) {
  const at = embed(mol, lattice, skip);
  const edgeIndex = new Map(lattice.edges.map(([a, b], k) => [`${Math.min(a, b)},${Math.max(a, b)}`, k]));
  mol.els.forEach((el, i) => {
    tap($$('.el-chip').find(b => b.querySelector('.chip-el').textContent === el));
    tap($(`.isomers .place[data-i="${at[i]}"]`));
  });
  for (const [i, j, o] of mol.bonds) {
    const k = edgeIndex.get(`${Math.min(at[i], at[j])},${Math.max(at[i], at[j])}`);
    for (let t = 0; t < o; t++) tap($(`.isomers .hit[data-e="${k}"]`));
  }
}
for (const [i, level] of ISOMER_LEVELS.entries()) {
  await go(`#/isomers/${i + 1}`);
  const n = Object.values(level.heavy).reduce((a, b) => a + b, 0), lattice = triLattice(n > 5 ? 5 : 4, 4, 30);
  const keep = () => $$('.actions .primary')[0], all = () => $$('.actions .secondary')[0];
  for (const [k, [, text]] of level.known.entries()) {
    await buildMol(I.parseMol(text), lattice);
    assert.equal(keep().disabled, false, `${level.id}: keep enabled for ${text}`);
    tap(keep());
    assert.equal($$('.shelf .shelf-item').length, k + 1, `${level.id}: kept`);
    assert.equal($$('.shelf .shelf-name').at(-1).textContent, level.known[k][0], `${level.id}: named as soon as it is kept`);
    if (k === 0) {
      tap(all()); assert.equal(feedback(), 'There are more.');
      // The same molecule placed differently is refused.
      await buildMol(I.parseMol(text), lattice, 3);
      tap(keep()); assert.match(feedback(), /You have that one/);
      assert.equal($$('.shelf .shelf-item').length, 1);
      tap($$('.tool').find(b => b.textContent === 'Hint')); assert.match(feedback(), /^Try one with/);
      // Clear the board by undoing the duplicate build.
      while ($$('.isomers .atom').length) tap($$('.tool').find(b => b.textContent === 'Undo'));
    }
  }
  tap(all());
  assert.ok(isSolvedShown(), `${level.id} solved`);
  assert.equal($$('.shelf-name').filter(x => x.textContent).length, level.known.length, 'names shown');
  played++; results.push(`isomers/${level.id}`);
}

// ---- Charge jigsaw
const {ION_LEVELS} = await import(APP + 'data/ion-levels.js');
const C = await import(APP + 'chem/ions.js');
const addIon = id => tap($$('.ion-button').find(b => b.getAttribute('aria-label') === `Add ${C.ionName(id)}`));
for (const [i, level] of ION_LEVELS.entries()) {
  await go(`#/ions/${i + 1}`);
  if (level.target) {
    if (level.id === 'cacl2') {
      addIon('Ca'); addIon('Ca'); for (let k = 0; k < 4; k++) addIon('Cl');
      assert.match(feedback(), /fewer/); assert.equal(isSolvedShown(), false);
      tap($$('.tool').find(b => b.textContent === 'Restart'));
    }
    tap($$('.tool').find(b => b.textContent === 'Hint')); assert.match(feedback(), /long/);
    for (const [id, n] of Object.entries(level.target)) for (let k = 0; k < n; k++) addIon(id);
  } else {
    const keep = () => $$('.actions .primary')[0];
    for (const c of C.allCompounds(level.tray)) {
      for (const [id, n] of Object.entries(c)) for (let k = 0; k < n; k++) addIon(id);
      tap(keep());
    }
    assert.equal($$('.shelf .shelf-item').length, C.allCompounds(level.tray).length);
    assert.deepEqual($$('.shelf .shelf-name').map(x => x.textContent), C.allCompounds(level.tray).map(C.compoundName), `${level.id}: each kept compound is named`);
    tap($$('.actions .secondary')[0]);
  }
  assert.ok(isSolvedShown(), `${level.id} solved`);
  played++; results.push(`ions/${level.id}`);
}
// Tapping a rod removes it.
await go('#/ions/1'); addIon('Na'); assert.equal($$('.ions .rod').length, 1); tap($('.ions .rod')); assert.equal($$('.ions .rod').length, 0);

// ---- Atom recycling
const {REACTION_LEVELS} = await import(APP + 'data/reaction-levels.js');
const R = await import(APP + 'chem/reactions.js');
function bestState(level) {
  let best = null;
  const rec = (k, broken) => {
    if (k < level.reactants.length) { for (let n = 0; n <= level.supply[level.reactants[k]]; n++) rec(k + 1, {...broken, [level.reactants[k]]: n}); return; }
    const recP = (q, built) => {
      if (q === level.products.length) { if (R.check(level, {broken, built}).ok && !best) best = {broken, built}; return; }
      for (let n = 0; n <= 20; n++) recP(q + 1, {...built, [level.products[q]]: n});
    };
    recP(0, {});
  };
  rec(0, {});
  return best;
}
for (const [i, level] of REACTION_LEVELS.entries()) {
  await go(`#/recycling/${i + 1}`);
  const state = level.most ? bestState(level) : R.smallestBalance(level);
  const rcards = $$('.reactants .mol-card'), pcards = $$('.products .mol-card');
  // Building with an empty bench does nothing.
  tap(pcards[0]); assert.equal($$('.ball').length, 0);
  tap($$('.tool').find(b => b.textContent === 'Hint')); assert.ok(feedback().length > 0);
  level.reactants.forEach((id, k) => { for (let t = 0; t < (state.broken[id] || 0); t++) tap(rcards[k]); });
  level.products.forEach((id, k) => { for (let t = 0; t < (state.built[id] || 0); t++) tap(pcards[k]); });
  assert.ok(isSolvedShown(), `${level.id} solved`);
  played++; results.push(`recycling/${level.id}: ${$('.solved-title').textContent}`);
}

// ---- Square ice
const {default: ICE} = await import(APP + 'data/ice-levels.js');
for (const [i, level] of ICE.entries()) {
  await go(`#/ice/${i + 1}`);
  tap($$('.tool').find(b => b.textContent === 'Hint')); assert.ok($('.link.hinted'), `${level.id}: hint marks a hydrogen`);
  [...level.fixed].forEach((c, k) => {
    if (c !== '.') return;
    tap($(`.ice .hit[data-link="${k}"][data-side="${level.solution[k]}"]`));
  });
  assert.ok(isSolvedShown(), `${level.id} solved`);
  played++; results.push(`ice/${level.id}`);
}
// Tap twice returns a hydrogen to the middle.
await go('#/ice/1');
{ const k = [...ICE[0].fixed].indexOf('.'); tap($(`.ice .hit[data-link="${k}"][data-side="0"]`)); tap($(`.ice .hit[data-link="${k}"][data-side="0"]`)); assert.ok($$('.ice .slot').length >= 1); }

// Newer families: each plays its own levels from scripts/smoke/<id>.mjs,
// which gets these helpers and returns one line per level played.
const tool = name => $$('.tool').find(b => b.textContent === name || b.getAttribute('aria-label') === name);
const T = {w, assert, go, tick, $, $$, tap, tool, isSolvedShown, feedback};
for (const id of ['mystery', 'rings', 'swap', 'spins', 'cells', 'bulbs', 'laser', 'beams', 'gears', 'overhang', 'quarks']) {
  let mod;
  try { mod = await import(new URL(`./smoke/${id}.mjs`, import.meta.url).href); } catch (e) { if (e.code === 'ERR_MODULE_NOT_FOUND' && String(e.message).includes(`smoke/${id}.mjs`)) continue; throw e; }
  const lines = await mod.default(T);
  played += lines.length; results.push(...lines);
}

// Home shows solved levels; Grown-ups renders; How to play opens.
await go('#/');
assert.equal($$('.level.solved').length, played);
await go('#/grownups');
assert.equal($$('.note').length, (await import(APP + 'families/index.js')).FAMILIES.length + 1);
await go('#/bridges/1');
tap($$('.tool').find(b => b.getAttribute('aria-label') === 'How to play'));
assert.ok($('dialog.howto'));

assert.deepEqual(errors, []);
console.log(`played ${played} levels through the app:\n` + results.join('\n'));
