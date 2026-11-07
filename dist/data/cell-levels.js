// Crystal cells levels. tray: the balls to place, per element; given: sets
// already filled (C corners, Ex/Ey/Ez edges, Fx/Fy/Fz face pairs, Z centre);
// target: how many atoms of each element the cube must hold. Every ball is
// used. apart: the salt rule, no two of the same ion side by side.
// tests/cells.test.mjs checks that each level has exactly one answer and
// that it is the stored structure.
export default [
  {id: 'polonium', tier: 'easy', tray: {Po: 8}, target: {Po: 1}, answer: {C: 'Po'},
   title: 'Polonium', detail: 'simple cubic, the only element that packs this way'},
  {id: 'sodium', tier: 'easy', tray: {Na: 9}, target: {Na: 2}, answer: {C: 'Na', Z: 'Na'},
   title: 'Sodium', detail: 'body-centred cubic, like iron and tungsten'},
  {id: 'copper', tier: 'easy', given: {C: 'Cu'}, tray: {Cu: 6}, target: {Cu: 4}, answer: {C: 'Cu', Fx: 'Cu', Fy: 'Cu', Fz: 'Cu'},
   title: 'Copper', detail: 'face-centred cubic, like aluminum, silver and gold'},
  {id: 'cscl', tier: 'easy', tray: {Cs: 1, Cl: 8}, target: {Cs: 1, Cl: 1}, answer: {C: 'Cl', Z: 'Cs'},
   title: 'CsCl', detail: 'caesium chloride: one of each in every cube'},
  {id: 'cu3au', tier: 'medium', tray: {Au: 8, Cu: 6}, target: {Au: 1, Cu: 3}, answer: {C: 'Au', Fx: 'Cu', Fy: 'Cu', Fz: 'Cu'},
   title: 'Cu₃Au', detail: 'an alloy of copper and gold: three copper atoms to one gold'},
  {id: 'reo3', tier: 'medium', tray: {Re: 8, O: 12}, target: {Re: 1, O: 3}, answer: {C: 'Re', Ex: 'O', Ey: 'O', Ez: 'O'},
   title: 'ReO₃', detail: 'rhenium trioxide, a red oxide that conducts like a metal'},
  {id: 'cu3n', tier: 'medium', tray: {N: 8, Cu: 12}, target: {N: 1, Cu: 3}, answer: {C: 'N', Ex: 'Cu', Ey: 'Cu', Ez: 'Cu'},
   title: 'Cu₃N', detail: 'copper nitride: the same shape as ReO₃, metal and non-metal swapped'},
  {id: 'ni3al', tier: 'medium', given: {Fz: 'Ni'}, tray: {Al: 8, Ni: 4}, target: {Al: 1, Ni: 3}, answer: {C: 'Al', Fx: 'Ni', Fy: 'Ni', Fz: 'Ni'},
   title: 'Ni₃Al', detail: 'the nickel alloy inside jet engines'},
  {id: 'nacl', tier: 'hard', apart: true, tray: {Na: 14, Cl: 13}, target: {Na: 4, Cl: 4}, answer: {C: 'Na', Fx: 'Na', Fy: 'Na', Fz: 'Na', Ex: 'Cl', Ey: 'Cl', Ez: 'Cl', Z: 'Cl'},
   title: 'NaCl', detail: 'table salt: 4 sodium and 4 chloride, and every spot filled'},
  {id: 'mgo', tier: 'hard', apart: true, tray: {Mg: 13, O: 14}, target: {Mg: 4, O: 4}, answer: {C: 'O', Fx: 'O', Fy: 'O', Fz: 'O', Ex: 'Mg', Ey: 'Mg', Ez: 'Mg', Z: 'Mg'},
   title: 'MgO', detail: 'magnesium oxide, the same checkerboard as salt'},
  {id: 'catio3', tier: 'hard', tray: {Ca: 8, Ti: 1, O: 6}, target: {Ca: 1, Ti: 1, O: 3}, answer: {C: 'Ca', Z: 'Ti', Fx: 'O', Fy: 'O', Fz: 'O'},
   title: 'CaTiO₃', detail: 'perovskite, a mineral that names a whole family of crystals'},
  {id: 'srtio3', tier: 'hard', tray: {Ti: 8, Sr: 1, O: 12}, target: {Sr: 1, Ti: 1, O: 3}, answer: {C: 'Ti', Z: 'Sr', Ex: 'O', Ey: 'O', Ez: 'O'},
   title: 'SrTiO₃', detail: 'a perovskite drawn from a titanium corner: oxygens on the edges now'},
];
