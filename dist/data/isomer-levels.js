// Isomer hunt bags. `known` lists every molecule for the bag with its name;
// tests check it against the full enumeration (dist/chem/isomers.js), so the
// app's "that's all" check and its names agree.
export const ISOMER_LEVELS = [
  {id: 'c4h10', tier: 'easy', formula: 'C₄H₁₀', heavy: {C: 4}, H: 10, known: [
    ['butane', 'CCCC 0-1 1-2 2-3'], ['methylpropane (isobutane)', 'CCCC 0-1 0-2 0-3']]},
  {id: 'c2h6o', tier: 'easy', formula: 'C₂H₆O', heavy: {C: 2, O: 1}, H: 6, known: [
    ['ethanol', 'CCO 0-1 1-2'], ['dimethyl ether', 'COC 0-1 1-2']]},
  {id: 'c3h6', tier: 'easy', formula: 'C₃H₆', heavy: {C: 3}, H: 6, known: [
    ['propene', 'CCC 0=1 1-2'], ['cyclopropane', 'CCC 0-1 1-2 2-0']]},
  {id: 'c2h7n', tier: 'easy', formula: 'C₂H₇N', heavy: {C: 2, N: 1}, H: 7, known: [
    ['ethylamine', 'CCN 0-1 1-2'], ['dimethylamine', 'CNC 0-1 1-2']]},
  {id: 'c5h12', tier: 'medium', formula: 'C₅H₁₂', heavy: {C: 5}, H: 12, known: [
    ['pentane', 'CCCCC 0-1 1-2 2-3 3-4'], ['methylbutane (isopentane)', 'CCCCC 0-1 1-2 2-3 1-4'], ['dimethylpropane (neopentane)', 'CCCCC 0-1 0-2 0-3 0-4']]},
  {id: 'c3h8o', tier: 'medium', formula: 'C₃H₈O', heavy: {C: 3, O: 1}, H: 8, known: [
    ['propan-1-ol', 'CCCO 0-1 1-2 2-3'], ['propan-2-ol (rubbing alcohol)', 'CCCO 0-1 1-2 1-3'], ['methoxyethane', 'CCOC 0-1 1-2 2-3']]},
  {id: 'c3h9n', tier: 'medium', formula: 'C₃H₉N', heavy: {C: 3, N: 1}, H: 9, known: [
    ['propylamine', 'CCCN 0-1 1-2 2-3'], ['isopropylamine', 'CCCN 0-1 1-2 1-3'], ['ethylmethylamine', 'CCNC 0-1 1-2 2-3'], ['trimethylamine', 'NCCC 0-1 0-2 0-3']]},
  {id: 'c4h8', tier: 'hard', formula: 'C₄H₈', heavy: {C: 4}, H: 8, known: [
    ['but-1-ene', 'CCCC 0=1 1-2 2-3'], ['but-2-ene', 'CCCC 0-1 1=2 2-3'], ['methylpropene', 'CCCC 0=1 1-2 1-3'],
    ['cyclobutane', 'CCCC 0-1 1-2 2-3 3-0'], ['methylcyclopropane', 'CCCC 0-1 1-2 2-0 0-3']]},
  {id: 'c6h14', tier: 'hard', formula: 'C₆H₁₄', heavy: {C: 6}, H: 14, known: [
    ['hexane', 'CCCCCC 0-1 1-2 2-3 3-4 4-5'], ['2-methylpentane', 'CCCCCC 0-1 1-2 2-3 3-4 1-5'], ['3-methylpentane', 'CCCCCC 0-1 1-2 2-3 3-4 2-5'],
    ['2,2-dimethylbutane', 'CCCCCC 0-1 1-2 2-3 1-4 1-5'], ['2,3-dimethylbutane', 'CCCCCC 0-1 1-2 2-3 1-4 2-5']]},
];
