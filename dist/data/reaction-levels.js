// Atom recycling reactions. A level with `most` gives a limited pile
// (`supply`) and is solved by building as many of that product as the pile allows.
export const REACTION_LEVELS = [
  {id: 'hcl', tier: 'easy', reactants: ['H2', 'Cl2'], products: ['HCl']},
  {id: 'water', tier: 'easy', reactants: ['H2', 'O2'], products: ['H2O']},
  {id: 'ammonia', tier: 'easy', reactants: ['N2', 'H2'], products: ['NH3']},
  {id: 'peroxide', tier: 'easy', reactants: ['H2O2'], products: ['H2O', 'O2']},
  {id: 'ethene-water', tier: 'easy', reactants: ['C2H4', 'H2O'], products: ['C2H5OH']},
  {id: 'methane', tier: 'medium', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O']},
  {id: 'co', tier: 'medium', reactants: ['CO', 'O2'], products: ['CO2']},
  {id: 'propane', tier: 'medium', reactants: ['C3H8', 'O2'], products: ['CO2', 'H2O']},
  {id: 'hydrazine', tier: 'medium', reactants: ['N2H4', 'O2'], products: ['N2', 'H2O']},
  {id: 'steam', tier: 'medium', reactants: ['CH4', 'H2O'], products: ['CO', 'H2']},
  {id: 'methanol', tier: 'medium', reactants: ['CH3OH', 'O2'], products: ['CO2', 'H2O']},
  {id: 'pile-water', tier: 'medium', reactants: ['H2', 'O2'], products: ['H2O'], supply: {H2: 5, O2: 2}, most: 'H2O'},
  {id: 'photosynthesis', tier: 'hard', reactants: ['CO2', 'H2O'], products: ['C6H12O6', 'O2']},
  // Breathing: what your cells do with sugar is photosynthesis run backwards.
  {id: 'respiration', tier: 'hard', reactants: ['C6H12O6', 'O2'], products: ['CO2', 'H2O']},
  {id: 'ethanol', tier: 'hard', reactants: ['C2H5OH', 'O2'], products: ['CO2', 'H2O']},
  {id: 'ethane', tier: 'hard', reactants: ['C2H6', 'O2'], products: ['CO2', 'H2O']},
  {id: 'pile-ammonia', tier: 'hard', reactants: ['N2', 'H2'], products: ['NH3'], supply: {N2: 3, H2: 7}, most: 'NH3'},
  {id: 'pile-co2', tier: 'hard', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'], supply: {CH4: 3, O2: 5}, most: 'CO2'},
  // Two products from the same pair: many balanced answers, and any one counts.
  {id: 'two-ways', tier: 'hard', reactants: ['H2', 'O2'], products: ['H2O', 'H2O2']},
];
