// Gear trains levels. Pegs are integer points (x right, y down); the crank is
// the driver (radius in units: 1 = 8 teeth, 2 = 16, 3 = 24), turning
// clockwise. Each output asks for a direction (1 clockwise, -1 anticlockwise)
// and a speed [n, d], meaning n/d turns for each turn of the crank; `side`
// is where its target sits. `tray` counts the gears to place, by radius.
// `solution` is a witness ([peg, radius] placements) and `count` the number
// of all solving placements (tests check both). `decoys` are tempting
// placements and what each shows instead: the output turning the wrong way
// or at the wrong speed, a jam, or the output peg left with no room (tests
// check these too).
const out = (peg, dir, n, d, side) => ({peg, dir, speed: [n, d], side});
const SQUARE = [[0, 0], [3, 0], [3, 4], [7, 0], [7, 4]];
const LONG = [[0, 0], [3, 0], [3, 4], [7, 0], [7, 4], [10, 0], [10, 4]];
const LONG3 = [[0, 0], [3, 4], [7, 0], [7, 4], [10, 0], [10, 4]];
const BOX = [[0, 0], [3, 0], [5, 0], [8, 0], [0, 4], [3, 4], [5, 4], [8, 4]];
const BOX3 = [[0, 0], [5, 0], [8, 0], [0, 4], [3, 4], [5, 4], [8, 4]];

export default [
  // Easy: one idler turns the output the crank's way; two turn it back.
  // Any size of idler leaves the speed alone.
  {id: 'same-way', tier: 'easy', pegs: [[0, 0], [3, 0], [5, 0], [4, 3], [8, 0]], crank: {peg: 0, r: 2}, fixed: [{peg: 4, r: 2}],
    outputs: [out(4, 1, 1, 1, 'n')], tray: {1: 2, 3: 1}, solution: [[3, 3]], count: 1,
    decoys: [{placed: [[1, 1], [2, 1]], shows: 'wrong-way'}]},
  // The output's size sets its speed: ×2 needs half the crank's teeth.
  {id: 'twice', tier: 'easy', pegs: SQUARE, crank: {peg: 0, r: 2}, fixed: [],
    outputs: [out(4, 1, 2, 1, 'e')], tray: {1: 2, 3: 1}, solution: [[2, 3], [4, 1]], count: 2,
    decoys: [{placed: [[1, 1], [3, 3], [4, 1]], shows: 'wrong-way'}, {placed: [[1, 1], [2, 3]], shows: 'jam'}]},
  // Slower: a third needs three times the crank's teeth.
  {id: 'a-third', tier: 'easy', pegs: [[0, 0], [3, 0], [6, 0], [3, 4], [6, 4]], crank: {peg: 0, r: 1}, fixed: [],
    outputs: [out(4, 1, 1, 3, 'e')], tray: {1: 1, 2: 1, 3: 1}, solution: [[1, 2], [4, 3]], count: 1,
    decoys: [{placed: [[1, 2], [2, 1], [4, 3]], shows: 'jam'}]},

  // Medium: ×3 from a big crank; the near corner is a ring of three.
  {id: 'three-times', tier: 'medium', pegs: BOX3, crank: {peg: 0, r: 3}, fixed: [],
    outputs: [out(6, -1, 3, 1, 's')], tray: {1: 2, 2: 2, 3: 1}, solution: [[1, 2], [5, 2], [6, 1]], count: 3,
    decoys: [{placed: [[3, 1], [4, 2]], shows: 'jam'}]},
  // Twice as fast and the other way: the short way round turns it wrong.
  {id: 'other-way', tier: 'medium', pegs: SQUARE, crank: {peg: 0, r: 2}, fixed: [],
    outputs: [out(4, -1, 2, 1, 'e')], tray: {1: 2, 2: 1, 3: 2}, solution: [[1, 1], [3, 3], [4, 1]], count: 2,
    decoys: [{placed: [[2, 3], [4, 1]], shows: 'wrong-way'}, {placed: [[1, 1], [2, 3], [4, 1]], shows: 'jam'}]},
  // A third, the other way. A big gear in the middle doesn't
  // slow the output: only the output's own size does.
  {id: 'third-back', tier: 'medium', pegs: [[0, 0], [3, 0], [8, 0], [0, 4], [3, 4], [5, 4], [8, 4]], crank: {peg: 0, r: 1}, fixed: [],
    outputs: [out(6, -1, 1, 3, 'e')], tray: {1: 1, 2: 3, 3: 1}, solution: [[1, 2], [4, 2], [6, 3]], count: 3,
    decoys: [{placed: [[1, 2], [2, 3], [6, 1]], shows: 'wrong-speed'}]},
  // The bottom road leaves no room at the output; go over the top.
  {id: 'long-way', tier: 'medium', pegs: LONG, crank: {peg: 0, r: 2}, fixed: [],
    outputs: [out(5, 1, 1, 1, 'n')], tray: {1: 2, 2: 2, 3: 2}, solution: [[2, 3], [4, 1], [6, 2], [5, 2]], count: 2,
    decoys: [{placed: [[1, 1], [3, 3]], shows: 'blocked'}]},
  // The straight road turns it the crank's way; the diagonal turns it back.
  // The corner is a ring of three (a 3-4-5 triangle) that jams.
  {id: 'diagonal', tier: 'medium', pegs: [[0, 0], [4, 0], [4, 3], [8, 0], [8, 3], [0, 3], [11, 3]], crank: {peg: 0, r: 2}, fixed: [],
    outputs: [out(6, -1, 1, 1, 'e')], tray: {1: 2, 2: 3, 3: 1}, solution: [[2, 3], [4, 1], [6, 2]], count: 2,
    decoys: [{placed: [[1, 2], [3, 2], [4, 1], [6, 2]], shows: 'wrong-way'}, {placed: [[5, 1], [2, 3]], shows: 'jam'}]},

  // Hard: two outputs sharing a train. Rings of three wait at the end.
  {id: 'both-ways', tier: 'hard', pegs: LONG3, crank: {peg: 0, r: 3}, fixed: [],
    outputs: [out(4, 1, 3, 1, 'n'), out(5, -1, 3, 1, 's')], tray: {1: 2, 2: 3, 3: 1}, solution: [[1, 2], [3, 2], [2, 2], [4, 1], [5, 1]], count: 1,
    decoys: [{placed: [[1, 2], [3, 2], [4, 3], [5, 1]], shows: 'jam'}]},
  {id: 'all-round', tier: 'hard', pegs: LONG, crank: {peg: 0, r: 2}, fixed: [],
    outputs: [out(3, -1, 2, 1, 'n'), out(6, -1, 1, 1, 's')], tray: {1: 2, 2: 2, 3: 1}, solution: [[2, 3], [4, 1], [6, 2], [5, 2], [3, 1]], count: 1,
    decoys: [{placed: [[1, 1], [3, 3], [4, 1], [6, 2]], shows: 'jam'}]},
  // The ring of three at the corner jams; the second output must go round.
  {id: 'corner-ring', tier: 'hard', pegs: BOX3, crank: {peg: 0, r: 3}, fixed: [],
    outputs: [out(3, -1, 3, 1, 's'), out(6, -1, 3, 1, 's')], tray: {1: 2, 2: 3}, solution: [[3, 1], [1, 2], [5, 2], [6, 1]], count: 1,
    decoys: [{placed: [[3, 1], [4, 2]], shows: 'jam'}]},
  {id: 'two-corners', tier: 'hard', pegs: BOX, crank: {peg: 0, r: 1}, fixed: [],
    outputs: [out(3, 1, 1, 1, 'e'), out(4, -1, 1, 1, 's')], tray: {1: 2, 2: 2, 3: 1}, solution: [[1, 2], [5, 2], [4, 1], [7, 3], [3, 1]], count: 1,
    decoys: [{placed: [[1, 2], [4, 3]], shows: 'jam'}]},
];
