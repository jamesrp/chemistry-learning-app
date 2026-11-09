// Star forge levels: start and target nuclides, the captures the tray offers
// (p: proton, n: neutron, a: helium-4), and par, the fewest moves (captures
// plus decays) that make the target. Tests check every par by a full search
// of the chart. about: what the result is, shown when it is made.
export default [
  // Easy: short recipes from the Sun and the first stars.
  {id: 'deuterium', tier: 'easy', start: 'H-1', target: 'H-2', tray: ['n'], par: 1, about: 'Heavy hydrogen: one proton and one neutron.'},
  {id: 'helium-3', tier: 'easy', start: 'H-1', target: 'He-3', tray: ['p', 'n'], par: 2, about: 'Light helium, made in the Sun on the way to helium-4.'},
  {id: 'carbon', tier: 'easy', start: 'He-4', target: 'C-12', tray: ['a'], par: 2, about: 'Three helium-4 nuclei: the triple-alpha process in red giant stars.'},
  {id: 'lithium-7', tier: 'easy', start: 'He-3', target: 'Li-7', tray: ['a'], par: 2, about: 'Made in the first minutes after the Big Bang, partly as beryllium-7.'},
  {id: 'neon', tier: 'easy', start: 'C-12', target: 'Ne-20', tray: ['a'], par: 2, about: 'Helium burning in heavy stars, after the carbon is made.'},
  {id: 'helium-4', tier: 'easy', start: 'H-1', target: 'He-4', tray: ['p', 'n'], par: 3, about: 'The alpha particle: what the Sun makes from hydrogen.'},
  // Medium: decays as moves, longer ladders, and a chain of decays.
  {id: 'oxygen-18', tier: 'medium', start: 'N-14', target: 'O-18', tray: ['a'], par: 2, about: 'Helium burning turns the nitrogen-14 from the CNO cycle into oxygen-18.'},
  {id: 'nitrogen-14', tier: 'medium', start: 'C-12', target: 'N-14', tray: ['p'], par: 3, about: 'Most of the air you breathe. Big stars make it in the CNO cycle.'},
  {id: 'silicon', tier: 'medium', start: 'O-16', target: 'Si-28', tray: ['a'], par: 3, about: 'The silicon in sand and rocks, made by burning in heavy stars.'},
  {id: 'calcium', tier: 'medium', start: 'Si-28', target: 'Ca-40', tray: ['a'], par: 3, about: 'The calcium in your bones, from the last weeks of a heavy star.'},
  {id: 'tritium-trick', tier: 'medium', start: 'H-1', target: 'Li-7', tray: ['p', 'n', 'a'], par: 3, about: 'Tritium plus helium-4, one of the Big Bang’s recipes.'},
  {id: 'cobalt', tier: 'medium', start: 'Fe-56', target: 'Co-59', tray: ['n'], par: 4, about: 'The slow neutron process in old giant stars builds past iron this way.'},
  {id: 'thorium-chain', tier: 'medium', start: 'Th-232', target: 'Pb-208', tray: [], par: 10, about: 'The thorium chain: 6 alpha and 4 beta decays end at lead-208.'},
  // Hard: the CNO cycle, choices of path, and the uranium chain.
  {id: 'cno', tier: 'hard', start: 'C-12', target: 'N-15', tray: ['p'], par: 5, about: 'The CNO cycle: one more proton turns nitrogen-15 into carbon-12 and helium-4, and round it goes.'},
  {id: 'aluminium', tier: 'hard', start: 'Ne-20', target: 'Al-27', tray: ['p', 'n', 'a'], par: 4, about: 'The only stable aluminium: made by burning neon and magnesium.'},
  {id: 'hydrogen-to-carbon', tier: 'hard', start: 'H-1', target: 'C-12', tray: ['p', 'n', 'a'], par: 5, about: 'From the simplest nucleus to the carbon in every living thing.'},
  {id: 'nickel', tier: 'hard', start: 'Fe-56', target: 'Ni-60', tray: ['n'], par: 6, about: 'Neutron after neutron, with beta decays between, builds heavier nuclei.'},
  {id: 'iron', tier: 'hard', start: 'Ca-40', target: 'Fe-56', tray: ['a'], par: 6, about: 'Supernovas make nickel-56, which decays to iron-56: the iron in your blood.'},
  {id: 'uranium-chain', tier: 'hard', start: 'U-238', target: 'Pb-206', tray: [], par: 14, about: 'The uranium chain: 8 alpha and 6 beta decays. Geologists date rocks by it.'},
];
