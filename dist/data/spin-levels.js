// Spin grids levels. map: U/D a pinned arrow, u/d a free arrow and how it
// starts, a space for no site. grid 'sq' or 'tri'; kind 'f' (every line likes
// matching arrows), 'a' (opposite) or 'mixed' with `anti` per line. goal is
// the fewest red lines possible and ways the number of arrangements that
// reach it; tests/spins.test.mjs checks both by brute force. findAll boards
// ask for every one of those arrangements.
export default [
  {id: 'line-up', tier: 'easy', grid: 'sq', kind: 'f', map: ['Uud', 'ddu', 'udU'], goal: 0, ways: 1,
   title: 'A magnet', detail: 'every arrow lines up, as the spins do in iron'},
  {id: 'wall', tier: 'easy', grid: 'sq', kind: 'f', map: ['UudD', 'UduD', 'UduD'], goal: 3, ways: 3,
   title: 'A domain wall', detail: 'up on one side, down on the other, and the shortest wall between'},
  {id: 'checker', tier: 'easy', grid: 'sq', kind: 'a', map: ['uuu', 'uUu', 'uuu'], goal: 0, ways: 1,
   title: 'An antiferromagnet', detail: 'every neighbour points the other way, as in manganese oxide'},
  {id: 'corner-wall', tier: 'easy', grid: 'sq', kind: 'f', map: ['Uudd', 'Udud', 'UduD'], goal: 2, ways: 1,
   title: 'A corner domain', detail: 'one pinned arrow holds a small patch of its own'},
  {id: 'diagonal', tier: 'medium', grid: 'sq', kind: 'f', map: ['Uuuu', 'uuud', 'uddd', 'dddD'], goal: 2, ways: 2,
   title: 'A domain wall', detail: 'the shortest wall cuts across the corner'},
  {id: 'long-wall', tier: 'medium', grid: 'sq', kind: 'f', map: ['UuddD', 'UdudD', 'UuddD', 'UdudD'], goal: 4, ways: 4,
   title: 'A domain wall', detail: 'four red lines, wherever the wall goes'},
  {id: 'islands', tier: 'medium', grid: 'sq', kind: 'f', map: ['Uuuud', 'uuDuu', 'uuuuu', 'uUuuD'], goal: 4, ways: 1,
   title: 'Magnetic domains', detail: 'the lone down arrow stays a tiny island'},
  {id: 'two-checkers', tier: 'medium', grid: 'sq', kind: 'a', map: ['Uuuuu', 'uuuuu', 'uuuuu', 'uuuuU'], goal: 2, ways: 2,
   title: 'Two antiferromagnet domains', detail: 'the two pinned arrows want different checkerboards'},
  {id: 'triangle-all', tier: 'medium', grid: 'tri', kind: 'a', map: ['uu', 'u '], goal: 1, ways: 6, findAll: true,
   title: 'A frustrated triangle', detail: 'all 6 best ways, each with one red line'},
  {id: 'tri-wall', tier: 'hard', grid: 'tri', kind: 'f', map: ['Uddu', 'udu ', 'du  ', 'D   '], goal: 2, ways: 2,
   title: 'A wall in a triangle crystal', detail: 'the pinned down arrow keeps a corner'},
  {id: 'pinned-hexagon', tier: 'hard', grid: 'tri', kind: 'a', map: [' Uu', 'uuu', 'uD '], goal: 3, ways: 2,
   title: 'Frustration', detail: 'six triangles, and three red lines is the best you can do'},
  {id: 'strip', tier: 'hard', grid: 'tri', kind: 'a', map: [' uuuu', 'uuuu '], goal: 3, ways: 2,
   title: 'Frustration', detail: 'six triangles share their lines, so three red lines are enough'},
  {id: 'hexagon-all', tier: 'hard', grid: 'tri', kind: 'a', map: [' uu', 'uuu', 'uu '], goal: 3, ways: 4, findAll: true,
   title: 'Frustration', detail: 'all 4 best ways: the middle arrow can’t please everyone'},
  {id: 'glass', tier: 'hard', grid: 'sq', kind: 'mixed', map: ['Uuud', 'uuuu', 'dddd', 'dudD'], anti: '001101001111111011010000', goal: 3, ways: 1,
   title: 'A spin glass', detail: 'matching and opposite lines mixed, with one best answer'},
  {id: 'big-glass', tier: 'hard', grid: 'sq', kind: 'mixed', map: ['Ududd', 'duudd', 'ddudd', 'ddddD'], anti: '0000110011100110010001011011100', goal: 4, ways: 1,
   title: 'A spin glass', detail: 'the hardest kind of magnet to settle'},
];
