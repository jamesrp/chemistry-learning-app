// Charge jigsaw trays. A level with `target` is solved by its formula unit;
// a level with `all` is solved by finding every compound its tray can make.
// Each name starts with the compound's own name (tests check it), then says
// where you might meet it.
export const ION_LEVELS = [
  {id: 'nacl', tier: 'easy', tray: ['Na', 'Cl'], target: {Na: 1, Cl: 1}, name: 'sodium chloride (table salt)'},
  {id: 'mgo', tier: 'easy', tray: ['Mg', 'O'], target: {Mg: 1, O: 1}, name: 'magnesium oxide'},
  {id: 'cacl2', tier: 'easy', tray: ['Ca', 'Cl'], target: {Ca: 1, Cl: 2}, name: 'calcium chloride (melts ice on roads)'},
  {id: 'na2o', tier: 'easy', tray: ['Na', 'O'], target: {Na: 2, O: 1}, name: 'sodium oxide'},
  {id: 'kcl', tier: 'easy', tray: ['K', 'Cl'], target: {K: 1, Cl: 1}, name: 'potassium chloride (a salt with no sodium)'},
  {id: 'naf', tier: 'easy', tray: ['Na', 'F'], target: {Na: 1, F: 1}, name: 'sodium fluoride (in some toothpaste)'},
  {id: 'ki', tier: 'easy', tray: ['K', 'I'], target: {K: 1, I: 1}, name: 'potassium iodide (added to some table salt)'},
  {id: 'zno', tier: 'easy', tray: ['Zn', 'O'], target: {Zn: 1, O: 1}, name: 'zinc oxide (in white sunscreen)'},
  {id: 'caf2', tier: 'easy', tray: ['Ca', 'F'], target: {Ca: 1, F: 2}, name: 'calcium fluoride (the mineral fluorite)'},
  {id: 'al2o3', tier: 'medium', tray: ['Al', 'O'], target: {Al: 2, O: 3}, name: 'aluminum oxide (rubies and sapphires are mostly this)'},
  {id: 'ca3n2', tier: 'medium', tray: ['Ca', 'N'], target: {Ca: 3, N: 2}, name: 'calcium nitride'},
  {id: 'caoh2', tier: 'medium', tray: ['Ca', 'OH'], target: {Ca: 1, OH: 2}, name: 'calcium hydroxide (slaked lime)'},
  {id: 'caco3', tier: 'medium', tray: ['Ca', 'CO3'], target: {Ca: 1, CO3: 1}, name: 'calcium carbonate (chalk)'},
  {id: 'nahco3', tier: 'medium', tray: ['Na', 'HCO3'], target: {Na: 1, HCO3: 1}, name: 'sodium hydrogen carbonate (baking soda)'},
  {id: 'kno3', tier: 'medium', tray: ['K', 'NO3'], target: {K: 1, NO3: 1}, name: 'potassium nitrate (saltpeter, in fireworks)'},
  {id: 'mgso4', tier: 'medium', tray: ['Mg', 'SO4'], target: {Mg: 1, SO4: 1}, name: 'magnesium sulfate (Epsom salt)'},
  {id: 'cuso4', tier: 'medium', tray: ['Cu2', 'SO4'], target: {Cu2: 1, SO4: 1}, name: 'copper(II) sulfate (it grows blue crystals)'},
  {id: 'mgoh2', tier: 'medium', tray: ['Mg', 'OH'], target: {Mg: 1, OH: 2}, name: 'magnesium hydroxide (milk of magnesia)'},
  {id: 'na2co3', tier: 'medium', tray: ['Na', 'CO3'], target: {Na: 2, CO3: 1}, name: 'sodium carbonate (washing soda)'},
  {id: 'fe2o3', tier: 'medium', tray: ['Fe3', 'O'], target: {Fe3: 2, O: 3}, name: 'iron(III) oxide (rust)'},
  {id: 'cu2o', tier: 'medium', tray: ['Cu', 'O'], target: {Cu: 2, O: 1}, name: 'copper(I) oxide (a red powder)'},
  // Both ions are 3 long, so one of each is already neutral.
  {id: 'aln', tier: 'medium', tray: ['Al', 'N'], target: {Al: 1, N: 1}, name: 'aluminum nitride (a ceramic that carries heat away from computer chips)'},
  {id: 'nh42so4', tier: 'hard', tray: ['NH4', 'SO4'], target: {NH4: 2, SO4: 1}, name: 'ammonium sulfate'},
  {id: 'ca3po42', tier: 'hard', tray: ['Ca', 'PO4'], target: {Ca: 3, PO4: 2}, name: 'calcium phosphate (in bones)'},
  {id: 'al2so43', tier: 'hard', tray: ['Al', 'SO4'], target: {Al: 2, SO4: 3}, name: 'aluminum sulfate'},
  {id: 'alpo4', tier: 'hard', tray: ['Al', 'PO4'], target: {Al: 1, PO4: 1}, name: 'aluminum phosphate'},
  {id: 'aloh3', tier: 'hard', tray: ['Al', 'OH'], target: {Al: 1, OH: 3}, name: 'aluminum hydroxide (in some antacids)'},
  {id: 'nh43po4', tier: 'hard', tray: ['NH4', 'PO4'], target: {NH4: 3, PO4: 1}, name: 'ammonium phosphate'},
  {id: 'fe2so43', tier: 'hard', tray: ['Fe3', 'SO4'], target: {Fe3: 2, SO4: 3}, name: 'iron(III) sulfate'},
  {id: 'mix4', tier: 'hard', tray: ['Na', 'Mg', 'Cl', 'O'], all: true},
  {id: 'mix6', tier: 'hard', tray: ['K', 'Al', 'NO3', 'SO4', 'PO4'], all: true},
  // Two kinds of iron ion: the names tell them apart by their Roman numerals.
  {id: 'mix-iron', tier: 'hard', tray: ['Fe2', 'Fe3', 'O', 'Cl'], all: true},
  {id: 'mix-ammonium', tier: 'hard', tray: ['NH4', 'Mg', 'Cl', 'SO4', 'PO4'], all: true},
];
