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
  {id: 'c3h7cl', tier: 'easy', formula: 'C₃H₇Cl', heavy: {C: 3, Cl: 1}, H: 7, known: [
    ['1-chloropropane', 'CCCCl 0-1 1-2 2-3'], ['2-chloropropane', 'CCCCl 0-1 1-2 1-3']]},
  {id: 'c2h4cl2', tier: 'easy', formula: 'C₂H₄Cl₂', heavy: {C: 2, Cl: 2}, H: 4, known: [
    ['1,1-dichloroethane', 'CCClCl 0-1 1-2 1-3'], ['1,2-dichloroethane', 'CCClCl 0-1 0-2 1-3']]},
  {id: 'c2h4o', tier: 'medium', formula: 'C₂H₄O', heavy: {C: 2, O: 1}, H: 4, known: [
    ['acetaldehyde', 'CCO 0-1 1=2'], ['ethylene oxide', 'CCO 0-1 1-2 2-0'], ['ethenol (vinyl alcohol: it soon turns into acetaldehyde)', 'CCO 0=1 1-2']]},
  {id: 'c3h4', tier: 'medium', formula: 'C₃H₄', heavy: {C: 3}, H: 4, known: [
    ['propyne', 'CCC 0#1 1-2'], ['propadiene (allene)', 'CCC 0=1 1=2'], ['cyclopropene', 'CCC 0=1 1-2 2-0']]},
  {id: 'c4h9cl', tier: 'medium', formula: 'C₄H₉Cl', heavy: {C: 4, Cl: 1}, H: 9, known: [
    ['1-chlorobutane', 'CCCCCl 0-1 1-2 2-3 3-4'], ['2-chlorobutane', 'CCCCCl 0-1 1-2 2-3 1-4'],
    ['1-chloro-2-methylpropane', 'CCCCCl 0-1 1-2 1-3 0-4'], ['2-chloro-2-methylpropane', 'CCCCCl 0-1 0-2 0-3 0-4']]},
  {id: 'c3h6cl2', tier: 'medium', formula: 'C₃H₆Cl₂', heavy: {C: 3, Cl: 2}, H: 6, known: [
    ['1,1-dichloropropane', 'CCCClCl 0-1 1-2 0-3 0-4'], ['1,2-dichloropropane', 'CCCClCl 0-1 1-2 0-3 1-4'],
    ['1,3-dichloropropane', 'CCCClCl 0-1 1-2 0-3 2-4'], ['2,2-dichloropropane', 'CCCClCl 0-1 1-2 1-3 1-4']]},
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
  {id: 'c4h10o', tier: 'hard', formula: 'C₄H₁₀O', heavy: {C: 4, O: 1}, H: 10, known: [
    ['butan-1-ol', 'CCCCO 0-1 1-2 2-3 3-4'], ['butan-2-ol', 'CCCCO 0-1 1-2 2-3 1-4'],
    ['2-methylpropan-1-ol (isobutanol)', 'CCCCO 0-1 1-2 1-3 0-4'], ['2-methylpropan-2-ol (tert-butanol)', 'CCCCO 0-1 0-2 0-3 0-4'],
    ['diethyl ether', 'CCOCC 0-1 1-2 2-3 3-4'], ['1-methoxypropane', 'CCCOC 0-1 1-2 2-3 3-4'], ['2-methoxypropane', 'CCCOC 0-1 1-2 1-3 3-4']]},
  {id: 'c7h16', tier: 'hard', formula: 'C₇H₁₆', heavy: {C: 7}, H: 16, known: [
    ['heptane', 'CCCCCCC 0-1 1-2 2-3 3-4 4-5 5-6'], ['2-methylhexane', 'CCCCCCC 0-1 1-2 2-3 3-4 4-5 1-6'], ['3-methylhexane', 'CCCCCCC 0-1 1-2 2-3 3-4 4-5 2-6'],
    ['2,2-dimethylpentane', 'CCCCCCC 0-1 1-2 2-3 3-4 1-5 1-6'], ['2,3-dimethylpentane', 'CCCCCCC 0-1 1-2 2-3 3-4 1-5 2-6'], ['2,4-dimethylpentane', 'CCCCCCC 0-1 1-2 2-3 3-4 1-5 3-6'],
    ['3,3-dimethylpentane', 'CCCCCCC 0-1 1-2 2-3 3-4 2-5 2-6'], ['3-ethylpentane', 'CCCCCCC 0-1 1-2 2-3 3-4 2-5 5-6'], ['2,2,3-trimethylbutane', 'CCCCCCC 0-1 1-2 2-3 1-4 1-5 2-6']]},
];
