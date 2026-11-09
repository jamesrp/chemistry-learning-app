// Mystery molecule levels. Each gives a formula (the bag of atoms) and some
// clue cards (ir: infrared, c: carbon-13 NMR, h: proton NMR) read from the
// target molecule. Tests check that exactly one molecule from the bag shows
// those cards, so building anything that matches them is the answer.
export const MYSTERY_LEVELS = [
  // Easy: one card.
  {id: 'ether', tier: 'easy', formula: 'C₂H₆O', heavy: {C: 2, O: 1}, H: 6, cards: ['c'], target: ['dimethyl ether', 'COC 0-1 1-2']},
  {id: 'ethanol', tier: 'easy', formula: 'C₂H₆O', heavy: {C: 2, O: 1}, H: 6, cards: ['ir'], target: ['ethanol', 'CCO 0-1 1-2']},
  {id: 'chloropropane', tier: 'easy', formula: 'C₃H₇Cl', heavy: {C: 3, Cl: 1}, H: 7, cards: ['c'], target: ['2-chloropropane', 'CCCCl 0-1 1-2 1-3']},
  {id: 'dichloroethane', tier: 'easy', formula: 'C₂H₄Cl₂', heavy: {C: 2, Cl: 2}, H: 4, cards: ['c'], target: ['1,2-dichloroethane', 'CCClCl 0-1 0-2 1-3']},
  {id: 'neopentane', tier: 'easy', formula: 'C₅H₁₂', heavy: {C: 5}, H: 12, cards: ['c'], target: ['dimethylpropane (neopentane)', 'CCCCC 0-1 0-2 0-3 0-4']},
  {id: 'isopentane', tier: 'easy', formula: 'C₅H₁₂', heavy: {C: 5}, H: 12, cards: ['c'], target: ['methylbutane (isopentane)', 'CCCCC 0-1 1-2 2-3 1-4']},
  {id: 'dimethylbutane', tier: 'easy', formula: 'C₆H₁₄', heavy: {C: 6}, H: 14, cards: ['c'], target: ['2,3-dimethylbutane', 'CCCCCC 0-1 1-2 2-3 1-4 2-5']},
  // Medium: infrared and carbon-13 together.
  {id: 'tert-butanol', tier: 'medium', formula: 'C₄H₁₀O', heavy: {C: 4, O: 1}, H: 10, cards: ['ir', 'c'], target: ['2-methylpropan-2-ol (tert-butanol)', 'CCCCO 0-1 0-2 0-3 0-4']},
  {id: 'diethyl-ether', tier: 'medium', formula: 'C₄H₁₀O', heavy: {C: 4, O: 1}, H: 10, cards: ['ir', 'c'], target: ['diethyl ether', 'CCOCC 0-1 1-2 2-3 3-4']},
  {id: 'acetone', tier: 'medium', formula: 'C₃H₆O', heavy: {C: 3, O: 1}, H: 6, cards: ['ir', 'c'], target: ['propanone (acetone)', 'CCCO 0-1 0-2 0=3']},
  {id: 'propanal', tier: 'medium', formula: 'C₃H₆O', heavy: {C: 3, O: 1}, H: 6, cards: ['ir', 'c'], target: ['propanal', 'CCCO 0-1 0-2 1=3']},
  {id: 'acetic-acid', tier: 'medium', formula: 'C₂H₄O₂', heavy: {C: 2, O: 2}, H: 4, cards: ['ir', 'c'], target: ['acetic acid (in vinegar)', 'CCOO 0-1 1=2 1-3']},
  {id: 'methyl-formate', tier: 'medium', formula: 'C₂H₄O₂', heavy: {C: 2, O: 2}, H: 4, cards: ['ir', 'c'], target: ['methyl formate', 'COCO 0-1 1-2 2=3']},
  {id: 'trimethylamine', tier: 'medium', formula: 'C₃H₉N', heavy: {C: 3, N: 1}, H: 9, cards: ['ir', 'c'], target: ['trimethylamine (the smell of fish)', 'NCCC 0-1 0-2 0-3']},
  {id: 'methylpropene', tier: 'medium', formula: 'C₄H₈', heavy: {C: 4}, H: 8, cards: ['ir', 'c'], target: ['methylpropene', 'CCCC 0=1 1-2 1-3']},
  // Hard: proton NMR, where the n + 1 rule does the work.
  {id: 'dichloroethane-11', tier: 'hard', formula: 'C₂H₄Cl₂', heavy: {C: 2, Cl: 2}, H: 4, cards: ['h'], target: ['1,1-dichloroethane', 'CCClCl 0-1 1-2 1-3']},
  {id: 'methoxyethane', tier: 'hard', formula: 'C₃H₈O', heavy: {C: 3, O: 1}, H: 8, cards: ['h'], target: ['methoxyethane', 'CCOC 0-1 1-2 2-3']},
  {id: 'chloropropane-1', tier: 'hard', formula: 'C₃H₇Cl', heavy: {C: 3, Cl: 1}, H: 7, cards: ['h'], target: ['1-chloropropane', 'CCCCl 0-1 1-2 2-3']},
  {id: 'isopropylamine', tier: 'hard', formula: 'C₃H₉N', heavy: {C: 3, N: 1}, H: 9, cards: ['h'], target: ['isopropylamine', 'CCCN 0-1 1-2 1-3']},
  {id: 'butanone', tier: 'hard', formula: 'C₄H₈O', heavy: {C: 4, O: 1}, H: 8, cards: ['ir', 'h'], target: ['butanone', 'CCCCO 0-1 1-2 1=4 2-3']},
  {id: 'propanoic-acid', tier: 'hard', formula: 'C₃H₆O₂', heavy: {C: 3, O: 2}, H: 6, cards: ['ir', 'h'], target: ['propanoic acid', 'CCCOO 0-1 1-2 2=3 2-4']},
  {id: 'ethyl-acetate', tier: 'hard', formula: 'C₄H₈O₂', heavy: {C: 4, O: 2}, H: 8, cards: ['c', 'h'], target: ['ethyl acetate (nail-polish remover)', 'CCOOCC 0-1 1=2 1-3 3-4 4-5']},
  {id: 'methyl-propanoate', tier: 'hard', formula: 'C₄H₈O₂', heavy: {C: 4, O: 2}, H: 8, cards: ['c', 'h'], target: ['methyl propanoate', 'CCCOOC 0-1 1-2 2=3 2-4 4-5']},
];

// Names for molecules a child may build on the way, so a wrong guess still
// teaches a name. Not every molecule a bag can make has a common name.
export const MYSTERY_NAMES = [
  ['propanone (acetone)', 'CCCO 0-1 0-2 0=3'], ['propanal', 'CCCO 0-1 0-2 1=3'], ['prop-2-en-1-ol (allyl alcohol)', 'CCCO 0=1 0-2 2-3'],
  ['prop-1-en-2-ol', 'CCCO 0=1 0-2 0-3'], ['prop-1-en-1-ol', 'CCCO 0=1 0-2 1-3'], ['methoxyethene (methyl vinyl ether)', 'CCCO 0=1 0-3 2-3'],
  ['cyclopropanol', 'CCCO 0-1 0-2 0-3 1-2'], ['methyloxirane (propylene oxide)', 'CCCO 0-1 0-2 0-3 1-3'], ['oxetane', 'CCCO 0-1 0-2 1-3 2-3'],
  ['acetic acid (in vinegar)', 'CCOO 0-1 1=2 1-3'], ['methyl formate', 'COCO 0-1 1-2 2=3'], ['glycolaldehyde', 'CCOO 0-1 0=2 1-3'], ['ethene-1,2-diol', 'CCOO 0=1 0-2 1-3'],
  ['propanoic acid', 'CCCOO 0-1 1-2 2=3 2-4'], ['methyl acetate', 'CCOOC 0-1 1=2 1-3 3-4'], ['ethyl formate', 'CCOCO 0-1 1-2 2-3 3=4'],
  ['hydroxyacetone', 'CCCOO 0-1 1-2 1=3 2-4'], ['lactaldehyde', 'CCCOO 0-1 1-2 2=3 1-4'],
  ['butanone', 'CCCCO 0-1 1-2 1=4 2-3'], ['butanal', 'CCCCO 0-1 1-2 2-3 3=4'], ['2-methylpropanal', 'CCCCO 0-1 0-2 0-3 3=4'],
  ['oxolane (tetrahydrofuran)', 'CCCCO 0-1 1-2 2-3 3-4 4-0'], ['ethoxyethene (ethyl vinyl ether)', 'CCOCC 0-1 1-2 2-3 3=4'], ['but-3-en-1-ol', 'CCCCO 0=1 1-2 2-3 3-4'],
  ['but-3-en-2-ol', 'CCCCO 0=1 1-2 2-3 2-4'], ['cyclobutanol', 'CCCCO 0-1 1-2 2-3 3-0 0-4'],
  ['ethyl acetate (nail-polish remover)', 'CCOOCC 0-1 1=2 1-3 3-4 4-5'], ['methyl propanoate', 'CCCOOC 0-1 1-2 2=3 2-4 4-5'],
  ['butanoic acid (the smell of old butter)', 'CCCCOO 0-1 1-2 2-3 3=4 3-5'], ['2-methylpropanoic acid', 'CCCCOO 0-1 0-2 0-3 3=4 3-5'],
  ['propyl formate', 'CCCOCO 0-1 1-2 2-3 3-4 4=5'], ['isopropyl formate', 'CCCOCO 0-1 0-2 0-3 3-4 4=5'], ['1,4-dioxane', 'COCCOC 0-1 1-2 2-3 3-4 4-5 5-0'],
];
