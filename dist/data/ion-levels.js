// Charge jigsaw trays. A level with `target` is solved by its formula unit;
// a level with `all` is solved by finding every compound its tray can make.
export const ION_LEVELS = [
  {id: 'nacl', tier: 'easy', tray: ['Na', 'Cl'], target: {Na: 1, Cl: 1}, name: 'sodium chloride (table salt)'},
  {id: 'mgo', tier: 'easy', tray: ['Mg', 'O'], target: {Mg: 1, O: 1}, name: 'magnesium oxide'},
  {id: 'cacl2', tier: 'easy', tray: ['Ca', 'Cl'], target: {Ca: 1, Cl: 2}, name: 'calcium chloride (melts ice on roads)'},
  {id: 'na2o', tier: 'easy', tray: ['Na', 'O'], target: {Na: 2, O: 1}, name: 'sodium oxide'},
  {id: 'al2o3', tier: 'medium', tray: ['Al', 'O'], target: {Al: 2, O: 3}, name: 'aluminum oxide (rubies and sapphires are mostly this)'},
  {id: 'ca3n2', tier: 'medium', tray: ['Ca', 'N'], target: {Ca: 3, N: 2}, name: 'calcium nitride'},
  {id: 'caoh2', tier: 'medium', tray: ['Ca', 'OH'], target: {Ca: 1, OH: 2}, name: 'calcium hydroxide (slaked lime)'},
  {id: 'caco3', tier: 'medium', tray: ['Ca', 'CO3'], target: {Ca: 1, CO3: 1}, name: 'calcium carbonate (chalk)'},
  {id: 'nh42so4', tier: 'hard', tray: ['NH4', 'SO4'], target: {NH4: 2, SO4: 1}, name: 'ammonium sulfate'},
  {id: 'ca3po42', tier: 'hard', tray: ['Ca', 'PO4'], target: {Ca: 3, PO4: 2}, name: 'calcium phosphate (in bones)'},
  {id: 'al2so43', tier: 'hard', tray: ['Al', 'SO4'], target: {Al: 2, SO4: 3}, name: 'aluminum sulfate'},
  {id: 'mix4', tier: 'hard', tray: ['Na', 'Mg', 'Cl', 'O'], all: true},
  {id: 'mix6', tier: 'hard', tray: ['K', 'Al', 'NO3', 'SO4', 'PO4'], all: true},
];
