import test from 'node:test';
import assert from 'node:assert/strict';
import {MYSTERY_LEVELS, MYSTERY_NAMES} from '../dist/data/mystery-levels.js';
import {enumerate, canonical, parseMol, checkBuild} from '../dist/chem/isomers.js';
import {orbits, carbonPeaks, protonSignals, irBands, fingerprint, cardKey} from '../dist/chem/spectra.js';
import {atomsIn} from './formula.mjs';

const mol = t => parseMol(t);

test('every level: the target builds from the bag and is the only molecule with those cards', () => {
  for (const l of MYSTERY_LEVELS) {
    const t = mol(l.target[1]);
    assert.ok(checkBuild(t, l).ok, `${l.id}: target builds`);
    assert.deepEqual(atomsIn(l.formula), {...l.heavy, H: l.H}, `${l.id}: formula`);
    const fp = fingerprint(t, l.cards);
    const hits = enumerate(l).filter(m => fingerprint(m, l.cards) === fp);
    assert.equal(hits.length, 1, `${l.id}: ${hits.length} molecules show these cards`);
    assert.equal(canonical(hits[0]), canonical(t), l.id);
  }
});

test('the ramp: one card on easy, two on medium, the proton card on hard', () => {
  const tiers = MYSTERY_LEVELS.map(l => l.tier);
  assert.deepEqual([...new Set(tiers)], ['easy', 'medium', 'hard']);
  for (const l of MYSTERY_LEVELS) {
    if (l.tier === 'easy') assert.equal(l.cards.length, 1, l.id);
    if (l.tier !== 'hard') assert.ok(!l.cards.includes('h'), l.id);
    else assert.ok(l.cards.includes('h'), l.id);
  }
  assert.equal(new Set(MYSTERY_LEVELS.map(l => l.id)).size, MYSTERY_LEVELS.length);
});

test('named molecules parse and differ', () => {
  const keys = new Set();
  for (const [name, t] of MYSTERY_NAMES) {
    const m = mol(t);
    assert.ok(m.els.length > 0, name);
    const k = canonical(m);
    assert.ok(!keys.has(k), `${name} is listed twice`);
    keys.add(k);
  }
});

test('kinds of carbon are orbits of the symmetry group', () => {
  const kinds = t => carbonPeaks(mol(t)).length;
  assert.equal(kinds('CCCCC 0-1 0-2 0-3 0-4'), 2); // neopentane
  assert.equal(kinds('CCCCC 0-1 1-2 2-3 1-4'), 4); // isopentane
  assert.equal(kinds('CCCCC 0-1 1-2 2-3 3-4'), 3); // pentane
  assert.equal(kinds('CCCCCC 0-1 1-2 2-3 3-4 4-5 5-0'), 1); // cyclohexane
  assert.equal(kinds('COC 0-1 1-2'), 1); // dimethyl ether
  assert.equal(kinds('CCO 0-1 1-2'), 2); // ethanol
  assert.equal(orbits(mol('CCCCCC 0-1 1-2 2-3 1-4 2-5')).length, 2); // 2,3-dimethylbutane: methyls and middles
});

test('textbook proton spectra', () => {
  const key = t => cardKey(mol(t), 'h');
  // Ethyl acetate: CH3 next to C=O a singlet, CH2 a quartet, its CH3 a triplet.
  assert.equal(key('CCOOCC 0-1 1=2 1-3 3-4 4-5'), 'x2x4,plain3x1,plain3x3');
  // Ethanol: CH2 next to O split by the CH3 only; OH a single line.
  assert.equal(key('CCO 0-1 1-2'), 'oh1x1,x2x4,plain3x3');
  // 2-chloropropane: CH a septet, the two CH3 one doublet of 6 H.
  assert.equal(key('CCCCl 0-1 1-2 1-3'), 'x1x7,plain6x2');
  const s = protonSignals(mol('CCCO 0-1 1-2 2=3')); // propanal
  assert.equal(s[0].zone, 'ald');
});

test('infrared bands', () => {
  assert.deepEqual(irBands(mol('CCOO 0-1 1=2 1-3')), ['oh', 'co']);
  assert.deepEqual(irBands(mol('CCCN 0-1 1-2 2-3')), ['nh']);
  assert.deepEqual(irBands(mol('CCCN 0-1 1-2 2#3')), ['triple']);
  assert.deepEqual(irBands(mol('CCC 0-1 1=2')), ['cc']);
  assert.deepEqual(irBands(mol('COC 0-1 1-2')), []);
});
