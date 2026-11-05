// Laser bench levels. Each map row is a line of squares: '.' empty, '#' wall,
// 'L' a lamp and 'T' a target, whose direction and colour come from lamps and
// targets in reading order (R red, G green, B blue, Y yellow, W white). The
// tray says how many mirrors (m) and splitters (s) there are. answers lists
// every way to win, each as [row, column, piece] with the piece m/, m\, s/ or s\
// (a mirror or splitter and its slant); the first is the one the smoke test
// plays. tests/laser.test.mjs checks the lists against an exhaustive search.
export default [
  // One mirror, one turn.
  {id: 'turn', tier: 'easy', map: [
    'L.....',
    '......',
    '......',
    '.....T',
  ], lamps: [['E', 'R']], targets: ['R'], tray: {m: 1},
   answers: [[[0, 5, 'm\\']]]},
  // Two mirrors send the beam back; the walls leave one column that works.
  {id: 'back', tier: 'easy', map: [
    '......',
    'L.....',
    '......',
    '.#....',
    'T..#..',
  ], lamps: [['E', 'R']], targets: ['R'], tray: {m: 2},
   answers: [[[1, 2, 'm\\'], [4, 2, 'm/']]]},
  // Three mirrors to get round a wall.
  {id: 'round', tier: 'easy', map: [
    'L..#.T',
    '...#..',
    '......',
    '..#...',
    '......',
  ], lamps: [['E', 'R']], targets: ['R'], tray: {m: 3},
   answers: [[[0, 1, 'm\\'], [2, 1, 'm\\'], [2, 5, 'm/']], [[0, 1, 'm\\'], [4, 1, 'm\\'], [4, 5, 'm/']], [[0, 2, 'm\\'], [2, 2, 'm\\'], [2, 5, 'm/']]]},
  // Two lamps, two targets, three mirrors: the beams must cross, and the one going up has to take the row above.
  {id: 'cross', tier: 'easy', map: [
    'L.....',
    '.#.#..',
    '......',
    'T.....',
    '.....L',
    'T.....',
  ], lamps: [['E', 'R'], ['N', 'R']], targets: ['R', 'R'], tray: {m: 3},
   answers: [[[0, 2, 'm\\'], [3, 5, 'm\\'], [5, 2, 'm/']], [[0, 4, 'm\\'], [3, 5, 'm\\'], [5, 4, 'm/']]]},
  // A splitter and a mirror: either can come first.
  {id: 'fork', tier: 'medium', map: [
    'L.....',
    '......',
    '......',
    '.....T',
    '......',
    '.T....',
  ], lamps: [['E', 'R']], targets: ['R', 'R'], tray: {m: 1, s: 1},
   answers: [[[0, 1, 'm\\'], [3, 1, 's\\']], [[0, 1, 's\\'], [0, 5, 'm\\']]]},
  // Turn down, then split into two prongs either side of a wall.
  {id: 'prongs', tier: 'medium', map: [
    '......',
    'L.....',
    '......',
    '......',
    'T#T...',
    '......',
  ], lamps: [['E', 'R']], targets: ['R', 'R'], tray: {m: 2, s: 1},
   answers: [[[1, 2, 'm\\'], [2, 0, 'm/'], [2, 2, 's/']], [[1, 2, 'm\\'], [3, 0, 'm/'], [3, 2, 's/']]]},
  // The split has to happen on the one row that reaches both corners.
  {id: 'corner', tier: 'medium', map: [
    '......',
    '......',
    '......',
    '.....T',
    '..##..',
    '.L...T',
  ], lamps: [['N', 'R']], targets: ['R', 'R'], tray: {m: 2, s: 1},
   answers: [[[3, 1, 'm/'], [3, 4, 's\\'], [5, 4, 'm\\']]]},
  // Three targets from one lamp: two splitters in a row.
  {id: 'three', tier: 'medium', map: [
    '.....T.',
    '.......',
    '.......',
    '....#.T',
    '......T',
    '.L.....',
  ], lamps: [['N', 'R']], targets: ['R', 'R', 'R'], tray: {m: 1, s: 2},
   answers: [[[3, 5, 's/'], [4, 1, 'm/'], [4, 5, 's/']]]},
  // Two splitters on one row, facing opposite ways.
  {id: 'comb', tier: 'medium', map: [
    '.LT....',
    '.......',
    '...#..T',
    '.......',
    '.#.....',
    '...T...',
    '.......',
  ], lamps: [['S', 'R']], targets: ['R', 'R', 'R'], tray: {m: 2, s: 2},
   answers: [[[3, 1, 'm\\'], [3, 2, 's/'], [3, 3, 's\\'], [3, 6, 'm/']]]},
  // Red and green meet on a yellow target.
  {id: 'yellow', tier: 'hard', map: [
    '...#.T',
    'L.....',
    '.....L',
    '......',
    '......',
    '......',
  ], lamps: [['E', 'R'], ['W', 'G']], targets: ['Y'], tray: {m: 3}, fact: 'red + green = yellow',
   answers: [[[0, 4, 'm/'], [1, 5, 'm/'], [2, 4, 'm\\']]]},
  // Red is split: one half for the red target, one to meet green on yellow.
  {id: 'share', tier: 'hard', map: [
    '.L....',
    '.....T',
    '....T.',
    '......',
    '......',
    '...L..',
  ], lamps: [['S', 'R'], ['N', 'G']], targets: ['R', 'Y'], tray: {m: 2, s: 1},
   answers: [[[1, 1, 'm\\'], [1, 4, 's\\'], [2, 3, 'm/']]]},
  // A splitter where red and green cross sends yellow both ways.
  {id: 'both', tier: 'hard', map: [
    'L.....',
    '......',
    'L....T',
    '......',
    '......',
    '...T..',
  ], lamps: [['E', 'G'], ['E', 'R']], targets: ['Y', 'Y'], tray: {m: 1, s: 1}, fact: 'yellow both ways',
   answers: [[[0, 3, 'm\\'], [2, 3, 's\\']]]},
  // Three lamps, four mirrors, one white target.
  {id: 'white', tier: 'hard', map: [
    '..L....',
    '.......',
    '...T...',
    '......L',
    '.......',
    '..L....',
  ], lamps: [['S', 'R'], ['W', 'B'], ['N', 'G']], targets: ['W'], tray: {m: 4}, fact: 'red + green + blue = white',
   answers: [[[1, 2, 'm\\'], [1, 3, 'm\\'], [2, 2, 'm/'], [3, 3, 'm\\']]]},
  // Yellow both ways again: one way to a yellow target, the other to meet blue on white.
  {id: 'white-yellow', tier: 'hard', map: [
    '...L...',
    '.......',
    'L.....T',
    '.......',
    '.......',
    'L......',
    '..#T.#.',
  ], lamps: [['S', 'G'], ['E', 'R'], ['E', 'B']], targets: ['Y', 'W'], tray: {s: 1, m: 2}, fact: 'yellow + blue = white',
   answers: [[[2, 3, 's\\'], [5, 4, 'm\\'], [6, 4, 'm/']]]},
];
