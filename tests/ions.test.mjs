import test from 'node:test';
import assert from 'node:assert/strict';
import {ION_LEVELS} from '../dist/data/ion-levels.js';
import {IONS, formulaUnit, formulaOfIons, checkCompound, allCompounds, totalCharge, compoundKey} from '../dist/chem/ions.js';

test('every target is its tray’s formula unit, neutral and in lowest terms', () => {
  for (const level of ION_LEVELS.filter(l => l.target)) {
    const [c, a] = level.tray;
    assert.deepEqual(formulaUnit(c, a), level.target, level.id);
    assert.equal(totalCharge(level.target), 0);
    assert.ok(checkCompound(level.target).ok, level.id);
  }
});

test('formulas are written the usual way', () => {
  assert.equal(formulaOfIons({Na: 1, Cl: 1}), 'NaCl');
  assert.equal(formulaOfIons({Cl: 2, Ca: 1}), 'CaCl₂');
  assert.equal(formulaOfIons({Al: 2, O: 3}), 'Al₂O₃');
  assert.equal(formulaOfIons({Ca: 1, OH: 2}), 'Ca(OH)₂');
  assert.equal(formulaOfIons({NH4: 2, SO4: 1}), '(NH₄)₂SO₄');
  assert.equal(formulaOfIons({Ca: 3, PO4: 2}), 'Ca₃(PO₄)₂');
  assert.equal(formulaOfIons({Al: 2, SO4: 3}), 'Al₂(SO₄)₃');
});

test('a neutral build that is a multiple, or a mix of three kinds, is not a compound here', () => {
  const double = checkCompound({Ca: 2, Cl: 4});
  assert.ok(double.neutral); assert.equal(double.lowest, false); assert.equal(double.ok, false);
  const mix = checkCompound({Na: 1, Mg: 1, Cl: 3});
  assert.ok(mix.neutral); assert.equal(mix.twoKinds, false); assert.equal(mix.ok, false);
  assert.equal(checkCompound({Na: 1}).neutral, false);
});

test('find-all trays: every cation with every anion, all different', () => {
  for (const level of ION_LEVELS.filter(l => l.all)) {
    const all = allCompounds(level.tray), plus = level.tray.filter(id => IONS[id].charge > 0).length, minus = level.tray.length - plus;
    assert.equal(all.length, plus * minus, level.id);
    assert.equal(new Set(all.map(compoundKey)).size, all.length);
    for (const c of all) assert.ok(checkCompound(c).ok);
  }
});
