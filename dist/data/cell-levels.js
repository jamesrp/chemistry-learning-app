// Crystal cells levels. target: how many atoms of each element one cube
// holds. rule: 'metal' (no two atoms side by side) or 'salt' (no two of the
// same ion side by side). given: classes already filled (C corners, E
// edges, F faces, Z middle). answer: the crystal; a board also accepts it
// shifted by half a cube (corners and middle swap, edges and faces swap)
// unless a given pins it. tests/cells.test.mjs checks that every fill the
// board accepts is one of those.
export default [
  {id: 'polonium', tier: 'easy', rule: 'metal', target: {Po: 1}, answer: {C: 'Po'},
   title: 'Polonium', detail: 'simple cubic: one atom per cube, drawn on the corners or in the middle'},
  {id: 'sodium', tier: 'easy', rule: 'metal', target: {Na: 2}, answer: {C: 'Na', Z: 'Na'},
   title: 'Sodium', detail: 'body-centred cubic, like iron and tungsten'},
  {id: 'copper', tier: 'easy', rule: 'metal', target: {Cu: 4}, answer: {C: 'Cu', F: 'Cu'},
   title: 'Copper', detail: 'face-centred cubic, like aluminum, silver and gold'},
  {id: 'gold', tier: 'medium', rule: 'metal', given: {Z: 'Au'}, target: {Au: 4}, answer: {Z: 'Au', E: 'Au'},
   title: 'Gold', detail: 'face-centred like copper, drawn from an atom in the middle'},
  {id: 'cscl', tier: 'medium', rule: 'salt', target: {Cs: 1, Cl: 1}, answer: {C: 'Cl', Z: 'Cs'},
   title: 'CsCl', detail: 'caesium chloride: one of each in every cube'},
  {id: 'cuzn', tier: 'medium', rule: 'metal', target: {Cu: 1, Zn: 1}, answer: {C: 'Cu', Z: 'Zn'},
   title: 'CuZn', detail: 'beta brass, half copper and half zinc'},
  {id: 'cu3au', tier: 'medium', rule: 'metal', target: {Au: 1, Cu: 3}, answer: {C: 'Au', F: 'Cu'},
   title: 'Cu₃Au', detail: 'an alloy of copper and gold: three copper atoms to one gold'},
  {id: 'ni3al', tier: 'medium', rule: 'metal', given: {Z: 'Al'}, target: {Al: 1, Ni: 3}, answer: {Z: 'Al', E: 'Ni'},
   title: 'Ni₃Al', detail: 'the nickel alloy inside jet engines'},
  {id: 'nacl', tier: 'hard', rule: 'salt', target: {Na: 4, Cl: 4}, answer: {C: 'Na', F: 'Na', E: 'Cl', Z: 'Cl'},
   title: 'NaCl', detail: 'table salt: a 3D checkerboard of sodium and chloride'},
  {id: 'mgo', tier: 'hard', rule: 'salt', given: {Z: 'O'}, target: {Mg: 4, O: 4}, answer: {C: 'Mg', F: 'Mg', E: 'O', Z: 'O'},
   title: 'MgO', detail: 'magnesium oxide, the same checkerboard as salt'},
  {id: 'kcl', tier: 'hard', rule: 'salt', given: {F: 'K'}, target: {K: 4, Cl: 4}, answer: {C: 'K', F: 'K', E: 'Cl', Z: 'Cl'},
   title: 'KCl', detail: 'potassium chloride, a salt with no sodium'},
];
