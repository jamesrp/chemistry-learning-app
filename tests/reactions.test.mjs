import test from 'node:test';
import assert from 'node:assert/strict';
import {REACTION_LEVELS} from '../dist/data/reaction-levels.js';
import {bondsOf} from '../dist/chem/elements.js';
import {MOLECULES, smallestBalance, check, equationOf, bestYield, benchOf} from '../dist/chem/reactions.js';

const expected = {
  hcl: 'H₂ + Cl₂ → 2HCl', water: '2H₂ + O₂ → 2H₂O', ammonia: 'N₂ + 3H₂ → 2NH₃', peroxide: '2H₂O₂ → 2H₂O + O₂',
  methane: 'CH₄ + 2O₂ → CO₂ + 2H₂O', co: '2CO + O₂ → 2CO₂', propane: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',
  photosynthesis: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', 'two-ways': '3H₂ + 2O₂ → 2H₂O + H₂O₂',
  'ethene-water': 'C₂H₄ + H₂O → C₂H₅OH', hydrazine: 'N₂H₄ + O₂ → N₂ + 2H₂O', steam: 'CH₄ + H₂O → CO + 3H₂',
  methanol: '2CH₃OH + 3O₂ → 2CO₂ + 4H₂O', respiration: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', ethanol: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
  ethane: '2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O',
};

test('each reaction balances, and the smallest balance is the textbook one', () => {
  for (const level of REACTION_LEVELS.filter(l => !l.most)) {
    const state = smallestBalance(level);
    assert.ok(state, level.id);
    assert.ok(check(level, state).ok, level.id);
    assert.equal(equationOf(level, state), expected[level.id], level.id);
  }
});

test('a doubled equation is balanced but not accepted', () => {
  const level = REACTION_LEVELS.find(l => l.id === 'water');
  const c = check(level, {broken: {H2: 4, O2: 2}, built: {H2O: 4}});
  assert.ok(c.empty); assert.equal(c.lowest, false); assert.equal(c.ok, false);
});

test('atoms left on the bench mean not solved', () => {
  const level = REACTION_LEVELS.find(l => l.id === 'water');
  const c = check(level, {broken: {H2: 2, O2: 2}, built: {H2O: 2}});
  assert.equal(c.empty, false);
  assert.deepEqual(benchOf(level, {broken: {H2: 2, O2: 2}, built: {H2O: 2}}), {H: 0, O: 2});
});

test('the plane: more than one balance counts', () => {
  const level = REACTION_LEVELS.find(l => l.id === 'two-ways');
  assert.ok(check(level, {broken: {H2: 3, O2: 2}, built: {H2O: 2, H2O2: 1}}).ok);
  assert.ok(check(level, {broken: {H2: 4, O2: 3}, built: {H2O: 2, H2O2: 2}}).empty);
  assert.ok(check(level, {broken: {H2: 5, O2: 3}, built: {H2O: 4, H2O2: 1}}).ok);
});

test('limited piles: the most each can make', () => {
  const best = Object.fromEntries(REACTION_LEVELS.filter(l => l.most).map(l => [l.id, bestYield(l)]));
  assert.deepEqual(best, {'pile-water': 4, 'pile-ammonia': 4, 'pile-co2': 2});
  const level = REACTION_LEVELS.find(l => l.id === 'pile-water');
  assert.ok(check(level, {broken: {H2: 4, O2: 2}, built: {H2O: 4}}).ok);
  assert.equal(check(level, {broken: {H2: 2, O2: 1}, built: {H2O: 2}}).ok, false, 'fewer than the most');
});

test('molecule drawings match their formulas', () => {
  const counts = {H2: {H: 2}, O2: {O: 2}, H2O: {H: 2, O: 1}, NH3: {N: 1, H: 3}, CH4: {C: 1, H: 4}, C3H8: {C: 3, H: 8}, CO2: {C: 1, O: 2}, H2O2: {H: 2, O: 2}, C6H12O6: {C: 6, H: 12, O: 6}};
  for (const [id, atoms] of Object.entries(counts)) assert.deepEqual(MOLECULES[id].atoms, atoms, id);
  for (const level of REACTION_LEVELS) for (const id of [...level.reactants, ...level.products]) assert.ok(MOLECULES[id], `${level.id}: ${id}`);
});

test('each molecule’s picture has the atoms its formula says, and every atom is bonded', async () => {
  const {atomsIn} = await import('./formula.mjs');
  for (const [id, m] of Object.entries(MOLECULES)) {
    assert.deepEqual(m.atoms, atomsIn(m.formula), id);
    if (id === 'C6H12O6') continue; // drawn without its C–H hydrogens
    const bonded = new Set(m.bonds.flatMap(([i, j]) => [i, j]));
    assert.equal(bonded.size, m.draw.length, id);
    if (id === 'CO') continue; // C≡O: carbon makes three bonds here, the one exception
    const load = m.draw.map(() => 0);
    for (const [i, j, o] of m.bonds) { load[i] += o; load[j] += o; }
    m.draw.forEach(([el], i) => assert.equal(load[i], bondsOf(el), `${id}: atom ${i} (${el})`));
  }
});
