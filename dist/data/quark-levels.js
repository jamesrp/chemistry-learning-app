// Quark kitchen levels. tray: how many of each quark the board offers (u, d,
// s; U, D, S are the antiquarks ū, d̄, s̄). want: what the goal asks for
// (kind, charge in whole units, spin in halves, strange = how many s or s̄).
// find: how many different particles meet it; tests check this against every
// build the tray allows. chart: lay found ones out on Gell-Mann's chart.
export default [
  // Easy: one particle, from just the quarks it needs.
  {id: 'proton', tier: 'easy', tray: {u: 2, d: 1}, want: {kind: 'baryon', charge: 1, spin: 1}, find: 1, goal: 'Make a particle with charge +1 and spin ½.'},
  {id: 'neutron', tier: 'easy', tray: {u: 1, d: 2}, want: {kind: 'baryon', charge: 0, spin: 1}, find: 1, goal: 'Make a particle with charge 0 and spin ½.'},
  {id: 'delta-plus-plus', tier: 'easy', tray: {u: 3}, want: {kind: 'baryon', charge: 2}, find: 1, goal: 'Make a particle from three up quarks.'},
  {id: 'pion-plus', tier: 'easy', tray: {u: 1, D: 1}, want: {kind: 'meson', spin: 0}, find: 1, goal: 'Make a particle with spin 0 from an up quark and an anti-down.'},
  {id: 'rho-plus', tier: 'easy', tray: {u: 1, D: 1}, want: {kind: 'meson', spin: 2}, find: 1, goal: 'The same two, but make spin 1.'},
  {id: 'delta-minus', tier: 'easy', tray: {d: 3}, want: {kind: 'baryon', charge: -1}, find: 1, goal: 'Make a particle from three down quarks.'},
  {id: 'antiproton', tier: 'easy', tray: {U: 2, D: 1}, want: {kind: 'antibaryon', charge: -1, spin: 1}, find: 1, goal: 'Make antimatter: charge −1 and spin ½.'},
  // Medium: strange quarks, spare quarks in the tray, and finding more than one.
  {id: 'omega-minus', tier: 'medium', tray: {s: 3}, want: {kind: 'baryon'}, find: 1, goal: 'Put three strange quarks together.'},
  {id: 'kaon-plus', tier: 'medium', tray: {u: 1, d: 1, S: 1}, want: {kind: 'meson', charge: 1, spin: 0}, find: 1, goal: 'Make a particle with charge +1 and spin 0.'},
  {id: 'lambda', tier: 'medium', tray: {u: 1, d: 1, s: 1}, want: {kind: 'baryon', charge: 0, spin: 1}, find: 1, goal: 'Make a particle with charge 0 and spin ½.'},
  {id: 'sigma-plus', tier: 'medium', tray: {u: 2, d: 1, s: 1}, want: {kind: 'baryon', charge: 1, spin: 1, strange: 1}, find: 1, goal: 'Make a particle with charge +1 and spin ½ that has a strange quark in it.'},
  {id: 'charge-minus', tier: 'medium', tray: {d: 3, s: 1}, want: {kind: 'baryon', charge: -1, spin: 3}, find: 2, title: 'Delta-minus and Sigma-star-minus', goal: 'Find both particles with charge −1 and spin 3/2.'},
  {id: 'neutral-half', tier: 'medium', tray: {u: 1, d: 2, s: 2}, want: {kind: 'baryon', charge: 0, spin: 1}, find: 3, title: 'Neutron, Lambda and Xi-zero', goal: 'Find all 3 particles of three quarks with charge 0 and spin ½.'},
  {id: 'plus-mesons', tier: 'medium', tray: {u: 1, d: 1, s: 1, U: 1, D: 1, S: 1}, want: {kind: 'meson', charge: 1}, find: 4, title: 'Pion, rho, kaon and K-star', goal: 'Find all 4 quark and antiquark pairs with charge +1.'},
  // Hard: whole families, laid out the way Gell-Mann drew them.
  {id: 'octet', tier: 'hard', tray: {u: 2, d: 2, s: 2}, want: {kind: 'baryon', spin: 1}, find: 7, chart: true, title: 'The baryon octet', goal: 'Find all 7 particles of three quarks with spin ½.'},
  {id: 'decuplet', tier: 'hard', tray: {u: 3, d: 3, s: 3}, want: {kind: 'baryon', spin: 3}, find: 10, chart: true, title: 'The baryon decuplet', goal: 'Find all 10 particles of three quarks with spin 3/2.'},
  {id: 'kaons', tier: 'hard', tray: {u: 1, d: 1, s: 1, U: 1, D: 1, S: 1}, want: {kind: 'meson', spin: 0, strange: 1}, find: 4, chart: true, title: 'The four kaons', goal: 'Find all 4 pairs with spin 0 that hold one strange quark or antiquark.'},
  {id: 'meson-octet', tier: 'hard', tray: {u: 1, d: 1, s: 1, U: 1, D: 1, S: 1}, want: {kind: 'meson', spin: 0}, find: 8, chart: true, title: 'The spin-0 mesons', goal: 'Find all 8 quark and antiquark pairs with spin 0.'},
];
