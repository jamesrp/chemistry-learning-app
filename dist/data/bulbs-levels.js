// Bulb boards, Easy to Hard. Posts are [row, col]; every part sits on the
// link between two neighbouring posts. A battery's `a` end is +. `want` is
// how a bulb should glow: bright, dim, faint or off. `budget` is the number
// of wires the player may lay; it is the fewest that solve the board, which
// tests/bulbs.test.mjs checks along with every other claim in a comment here.
const B = (a, b) => ({kind: 'battery', a, b});
const L = (a, b, want) => ({kind: 'bulb', a, b, want});
const W = (a, b) => ({kind: 'wire', a, b});
const S = (a, b) => ({kind: 'switch', a, b});
const T = (common, up, down) => ({kind: 'spdt', common, throws: [up, down]});

export const BULB_LEVELS = [
  // One bulb. One wire is not enough, and the middle link shorts the battery.
  {id: 'loop', tier: 'easy', rows: 2, cols: 3, budget: 4,
    name: 'A loop', detail: 'Current needs a way out and a way back.',
    solution: [[[0, 0], [0, 1]], [[0, 1], [0, 2]], [[1, 0], [1, 1]], [[1, 1], [1, 2]]],
    parts: [B([0, 0], [1, 0]), L([0, 2], [1, 2], 'bright')]},
  // Two bulbs in a row: both dim.
  {id: 'in-a-row', tier: 'easy', rows: 2, cols: 3, budget: 3,
    name: 'In series', detail: 'Two bulbs in a row share the battery: each gets a quarter of the power.',
    solution: [[[0, 0], [0, 1]], [[0, 2], [1, 2]], [[1, 0], [1, 1]]],
    parts: [B([0, 0], [1, 0]), L([0, 1], [0, 2], 'dim'), L([1, 1], [1, 2], 'dim')]},
  // Two bulbs side by side: both bright.
  // The middle link would short the battery again.
  {id: 'side-by-side', tier: 'easy', rows: 2, cols: 4, budget: 6,
    name: 'In parallel', detail: 'Side by side, each bulb has the whole battery to itself.',
    solution: [[[0, 0], [0, 1]], [[0, 1], [0, 2]], [[0, 2], [0, 3]], [[1, 0], [1, 1]], [[1, 1], [1, 2]], [[1, 2], [1, 3]]],
    parts: [B([0, 0], [1, 0]), L([0, 1], [1, 1], 'bright'), L([0, 3], [1, 3], 'bright')]},
  // Light one, leave the other dark.
  {id: 'one-of-two', tier: 'easy', rows: 3, cols: 3, budget: 4,
    name: 'One loop',
    solution: [[[1, 0], [1, 1]], [[1, 1], [1, 2]], [[2, 0], [2, 1]], [[2, 1], [2, 2]]],
    parts: [B([1, 0], [2, 0]), L([0, 1], [0, 2], 'off'), L([1, 2], [2, 2], 'bright')]},

  // A finished loop: put the second bulb out by adding wire around it.
  {id: 'put-it-out', tier: 'medium', rows: 3, cols: 3, budget: 3,
    name: 'Short circuit', detail: 'Current takes the wire instead of the bulb.',
    solution: [[[1, 1], [2, 1]], [[1, 2], [2, 2]], [[2, 1], [2, 2]]],
    parts: [B([0, 0], [1, 0]), W([0, 0], [0, 1]), L([0, 1], [0, 2], 'bright'), W([0, 2], [1, 2]), L([1, 2], [1, 1], 'off'), W([1, 1], [1, 0])]},
  // Bright, and two dim.
  {id: 'bright-and-dim', tier: 'medium', rows: 2, cols: 4, budget: 5,
    name: 'Series and parallel',
    solution: [[[0, 0], [0, 1]], [[0, 1], [0, 2]], [[0, 3], [1, 3]], [[1, 0], [1, 1]], [[1, 1], [1, 2]]],
    parts: [B([0, 0], [1, 0]), L([0, 1], [1, 1], 'bright'), L([0, 2], [0, 3], 'dim'), L([1, 2], [1, 3], 'dim')]},
  // Three bulbs, one dim and two faint: one bulb, then two side by side.
  {id: 'dim-and-faint', tier: 'medium', rows: 3, cols: 3, budget: 5,
    name: 'Shared current', detail: 'The two faint bulbs split what comes through the dim one.',
    solution: [[[0, 1], [1, 1]], [[0, 2], [1, 2]], [[1, 0], [1, 1]], [[1, 2], [2, 2]], [[2, 0], [2, 1]]],
    parts: [B([1, 0], [2, 0]), L([0, 1], [0, 2], 'faint'), L([1, 1], [1, 2], 'faint'), L([2, 1], [2, 2], 'dim')]},
  // Four bulbs: the outer two dark, the middle two dim.
  {id: 'middle-two', tier: 'medium', rows: 3, cols: 4, budget: 5,
    name: 'Two in series',
    solution: [[[1, 0], [1, 1]], [[1, 1], [1, 2]], [[1, 3], [2, 3]], [[2, 0], [2, 1]], [[2, 2], [2, 3]]],
    parts: [B([1, 0], [2, 0]), L([0, 1], [0, 2], 'off'), L([1, 2], [1, 3], 'dim'), L([2, 1], [2, 2], 'dim'), L([0, 3], [1, 3], 'off')]},

  // The bridge: four bulbs in a ring and one across the middle. Feed it at
  // the right two corners and the middle bulb stays dark though both its
  // ends are wired.
  {id: 'bridge', tier: 'hard', rows: 4, cols: 5, budget: 5,
    name: 'A balanced bridge', detail: 'Both ends of the middle bulb are at the same level, so no current crosses it.',
    solution: [[[0, 0], [0, 1]], [[0, 0], [1, 0]], [[1, 0], [2, 0]], [[2, 1], [3, 1]], [[3, 0], [3, 1]]],
    parts: [B([2, 0], [3, 0]),
      W([0, 2], [0, 1]), L([0, 1], [1, 1], 'dim'), W([0, 2], [0, 3]), L([0, 3], [1, 3], 'dim'),
      W([1, 1], [1, 2]), L([1, 2], [1, 3], 'off'),
      L([1, 1], [2, 1], 'dim'), W([2, 1], [2, 2]), L([1, 3], [2, 3], 'dim'), W([2, 3], [2, 2])],
    cut: [[[1, 2], [2, 2]], [[0, 2], [1, 2]]]},
  // Two bright, two dark.
  {id: 'two-and-two', tier: 'hard', rows: 3, cols: 4, budget: 6,
    name: 'Two loops',
    solution: [[[1, 0], [1, 1]], [[1, 1], [1, 2]], [[1, 2], [1, 3]], [[2, 0], [2, 1]], [[2, 1], [2, 2]], [[2, 2], [2, 3]]],
    parts: [B([1, 0], [2, 0]), L([0, 1], [1, 1], 'off'), L([0, 2], [0, 3], 'off'), L([1, 2], [2, 2], 'bright'), L([1, 3], [2, 3], 'bright')]},
  // Bright, dim, dim and dark.
  {id: 'three-glows', tier: 'hard', rows: 3, cols: 4, budget: 7,
    name: 'Three glows',
    solution: [[[0, 1], [1, 1]], [[0, 2], [0, 3]], [[1, 0], [1, 1]], [[1, 2], [1, 3]], [[1, 2], [2, 2]], [[2, 0], [2, 1]], [[2, 1], [2, 2]]],
    parts: [B([1, 0], [2, 0]), L([0, 1], [0, 2], 'dim'), L([1, 1], [1, 2], 'bright'), L([2, 2], [2, 3], 'off'), L([0, 3], [1, 3], 'dim')]},

  // Switches: the lamp lights only when both are on.
  {id: 'both', tier: 'hard', rows: 2, cols: 4, budget: 4,
    name: 'Both switches', detail: 'Switches in a row: either one breaks the loop.',
    solution: [[[0, 0], [0, 1]], [[0, 2], [0, 3]], [[1, 0], [1, 1]], [[1, 2], [1, 3]]],
    parts: [B([0, 0], [1, 0]), S([0, 1], [0, 2]), S([1, 1], [1, 2]), L([0, 3], [1, 3], 'off')],
    table: [
      {states: [0, 0], want: {3: 'off'}}, {states: [0, 1], want: {3: 'off'}},
      {states: [1, 0], want: {3: 'off'}}, {states: [1, 1], want: {3: 'bright'}}]},
  // Switches: the lamp lights when either is on.
  {id: 'either', tier: 'hard', rows: 3, cols: 3, budget: 5,
    name: 'Either switch', detail: 'Switches side by side: either one closes the loop.',
    solution: [[[0, 1], [1, 1]], [[0, 2], [1, 2]], [[1, 0], [1, 1]], [[1, 2], [2, 2]], [[2, 0], [2, 1]]],
    parts: [B([1, 0], [2, 0]), S([0, 1], [0, 2]), S([1, 1], [1, 2]), L([2, 2], [2, 1], 'off')],
    table: [
      {states: [0, 0], want: {3: 'off'}}, {states: [0, 1], want: {3: 'bright'}},
      {states: [1, 0], want: {3: 'bright'}}, {states: [1, 1], want: {3: 'bright'}}]},
  // The hallway light: two two-way switches, and either one changes the lamp.
  {id: 'hallway', tier: 'hard', rows: 4, cols: 5, budget: 4,
    name: 'Two-way switches', detail: 'This is how a hallway light with a switch at each end is wired.',
    solution: [[[0, 1], [0, 2]], [[0, 2], [0, 3]], [[2, 1], [2, 2]], [[2, 2], [2, 3]]],
    parts: [B([1, 0], [2, 0]), W([1, 0], [1, 1]), T([1, 1], [0, 1], [2, 1]), T([1, 3], [0, 3], [2, 3]), W([1, 3], [1, 4]), L([1, 4], [2, 4], 'off'),
      W([2, 4], [3, 4]), W([3, 4], [3, 3]), W([3, 3], [3, 2]), W([3, 2], [3, 1]), W([3, 1], [3, 0]), W([3, 0], [2, 0])],
    table: [
      {states: [0, 0], want: {5: 'bright'}}, {states: [0, 1], want: {5: 'off'}},
      {states: [1, 0], want: {5: 'off'}}, {states: [1, 1], want: {5: 'bright'}}]},
];
