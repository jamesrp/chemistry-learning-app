import test from 'node:test';
import assert from 'node:assert/strict';
import levels from '../dist/data/ring-levels.js';
import {patch, kekule, isKekule, formulaOf, hintBond} from '../dist/chem/rings.js';

test('each board: ways is the number of Kekulé structures, and find is no more than that', () => {
  for (const l of levels) {
    const p = patch(l.rings), sols = kekule(p, 2000);
    assert.equal(sols.length, l.ways, l.id);
    assert.ok(l.find >= 2 && l.find <= l.ways, l.id);
    for (const sol of sols.slice(0, 50)) assert.ok(isKekule(p, sol), l.id);
    assert.equal(new Set(sols.map(x => x.join(''))).size, sols.length, `${l.id}: all different`);
  }
});

test('formulas of the named molecules', () => {
  const want = {benzene: 'C₆H₆', naphthalene: 'C₁₀H₈', anthracene: 'C₁₄H₁₀', phenanthrene: 'C₁₄H₁₀', tetracene: 'C₁₈H₁₂', pyrene: 'C₁₆H₁₀',
    benzanthracene: 'C₁₈H₁₂', chrysene: 'C₁₈H₁₂', triphenylene: 'C₁₈H₁₂', perylene: 'C₂₀H₁₂', coronene: 'C₂₄H₁₂', ovalene: 'C₃₂H₁₄', circumcoronene: 'C₅₄H₁₈'};
  for (const l of levels) assert.equal(formulaOf(patch(l.rings)), want[l.id], l.id);
});

test('a row of n rings has n + 1 structures; MacMahon counts the hexagons', () => {
  for (let n = 1; n <= 6; n++) assert.equal(kekule(patch([...Array(n).keys()].map(q => [q, 0]))).length, n + 1);
  // MacMahon: the a × b × c hexagon has prod over i, j, k of (i + j + k - 1) / (i + j + k - 2) tilings.
  const macmahon = (a, b, c) => { let v = 1; for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) for (let k = 1; k <= c; k++) v *= (i + j + k - 1) / (i + j + k - 2); return Math.round(v); };
  assert.equal(macmahon(2, 2, 2), 20);
  assert.equal(macmahon(3, 3, 3), 980);
  // Three rings round one carbon (phenalenyl) has an odd number of carbons and no structure at all.
  const phenalenyl = patch([[0, 0], [1, 0], [0, 1]]);
  assert.equal(phenalenyl.carbons.length, 13);
  assert.equal(kekule(phenalenyl).length, 0);
});

test('the hint points toward a structure', () => {
  for (const l of levels) {
    const p = patch(l.rings), sols = kekule(p, 50), on = p.bonds.map(() => 0);
    const hint = hintBond(on, sols);
    assert.ok(hint && !hint.wrong && sols.some(sl => sl[hint.bond]), l.id);
  }
});

test('levels are well formed', () => {
  const ids = new Set();
  for (const l of levels) { assert.ok(!ids.has(l.id)); ids.add(l.id); }
  const order = levels.map(l => ['easy', 'medium', 'hard'].indexOf(l.tier));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});
