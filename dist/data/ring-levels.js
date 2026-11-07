// Ring patches levels. rings: hexagon centres (see dist/chem/rings.js);
// ways: how many Kekulé structures the molecule has; find: how many of them
// the board asks for (all of them when find equals ways). The counts are
// checked against a full enumeration in tests/rings.test.mjs.
export default [
  {id: 'benzene', tier: 'easy', name: 'Benzene', rings: [[0, 0]], ways: 2, find: 2},
  {id: 'naphthalene', tier: 'easy', name: 'Naphthalene', also: 'mothballs', rings: [[0, 0], [1, 0]], ways: 3, find: 3},
  {id: 'anthracene', tier: 'easy', name: 'Anthracene', rings: [[0, 0], [1, 0], [2, 0]], ways: 4, find: 4},
  {id: 'phenanthrene', tier: 'easy', name: 'Phenanthrene', rings: [[0, 0], [1, 0], [1, 1]], ways: 5, find: 5},
  {id: 'tetracene', tier: 'medium', name: 'Tetracene', rings: [[0, 0], [1, 0], [2, 0], [3, 0]], ways: 5, find: 5},
  {id: 'pyrene', tier: 'medium', name: 'Pyrene', rings: [[0, 0], [1, 0], [0, 1], [1, 1]], ways: 6, find: 6},
  {id: 'benzanthracene', tier: 'medium', name: 'Benz[a]anthracene', rings: [[0, 0], [1, 0], [2, 0], [2, 1]], ways: 7, find: 4},
  {id: 'chrysene', tier: 'medium', name: 'Chrysene', rings: [[0, 0], [1, 0], [1, 1], [2, 1]], ways: 8, find: 4},
  {id: 'triphenylene', tier: 'hard', name: 'Triphenylene', rings: [[0, 0], [1, 0], [-1, 1], [0, -1]], ways: 9, find: 4},
  {id: 'perylene', tier: 'hard', name: 'Perylene', rings: [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]], ways: 9, find: 4},
  {id: 'coronene', tier: 'hard', name: 'Coronene', rings: [[0, 0], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]], ways: 20, find: 5},
  {id: 'ovalene', tier: 'hard', name: 'Ovalene', rings: [[0, 0], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1], [2, -1], [2, 0], [1, 1]], ways: 50, find: 3},
  {id: 'circumcoronene', tier: 'hard', name: 'Circumcoronene', also: 'a flake of graphene', ways: 980, find: 2,
   rings: [[-2, 0], [-2, 1], [-2, 2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [0, -2], [0, -1], [0, 0], [0, 1], [0, 2], [1, -2], [1, -1], [1, 0], [1, 1], [2, -2], [2, -1], [2, 0]]},
];
