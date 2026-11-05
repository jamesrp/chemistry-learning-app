// Balance beams levels, written by scripts/make-beams.mjs (do not edit by hand).
// answers: how many arrangements solve it; mirror: the two are mirror images.
export default [
  {"id":"two-three","tier":"easy","beams":[{"n":4}],"fixed":[[0,-3,2]],"tray":[3],"answers":1,"mirror":false,"solution":{"placed":{"0:2":3},"hang":{}}},
  {"id":"four-ones","tier":"easy","beams":[{"n":4}],"fixed":[[0,-2,4]],"tray":[1,1,1],"answers":1,"mirror":false,"solution":{"placed":{"0:4":1,"0:3":1,"0:1":1},"hang":{}}},
  {"id":"one-four","tier":"easy","beams":[{"n":4}],"fixed":[],"tray":[1,1,4],"answers":2,"mirror":true,"solution":{"placed":{"0:3":1,"0:-1":4,"0:1":1},"hang":{}}},
  {"id":"same-side","tier":"easy","beams":[{"n":4}],"fixed":[[0,-2,5]],"tray":[2,3],"answers":1,"mirror":false,"solution":{"placed":{"0:4":3,"0:-1":2},"hang":{}}},
  {"id":"one-two-three","tier":"medium","beams":[{"n":3}],"fixed":[],"tray":[1,2,3],"answers":2,"mirror":true,"solution":{"placed":{"0:-3":1,"0:3":2,"0:-1":3},"hang":{}}},
  {"id":"three-four-seven","tier":"medium","beams":[{"n":4}],"fixed":[],"tray":[3,4,7],"answers":2,"mirror":true,"solution":{"placed":{"0:4":4,"0:-3":3,"0:-1":7},"hang":{}}},
  {"id":"nine-alone","tier":"medium","beams":[{"n":3}],"fixed":[],"tray":[2,5,6,9],"answers":2,"mirror":true,"solution":{"placed":{"0:-3":6,"0:3":9,"0:-2":2,"0:-1":5},"hang":{}}},
  {"id":"two-eights","tier":"medium","beams":[{"n":4}],"fixed":[],"tray":[1,7,8,8],"answers":2,"mirror":true,"solution":{"placed":{"0:-4":1,"0:4":7,"0:-2":8,"0:-1":8},"hang":{}}},
  {"id":"five-of-six","tier":"medium","beams":[{"n":3}],"fixed":[],"tray":[5,6,7,8,8],"answers":2,"mirror":true,"solution":{"placed":{"0:-3":5,"0:3":7,"0:-2":8,"0:2":8,"0:-1":6},"hang":{}}},
  {"id":"mobile-pair","tier":"hard","beams":[{"n":3},{"l":1,"r":2,"parent":[0,-2]}],"fixed":[[0,1,2]],"tray":[2,4,5],"answers":1,"mirror":false,"solution":{"placed":{"1:2":2,"1:-1":4,"0:2":5},"hang":{}}},
  {"id":"mobile-three","tier":"hard","beams":[{"n":3},{"l":1,"r":2,"parent":[0,-2]}],"fixed":[[0,1,2]],"tray":[1,2,4,6],"answers":1,"mirror":false,"solution":{"placed":{"1:2":1,"1:-1":4,"1:1":2,"0:2":6},"hang":{}}},
  {"id":"move-the-string","tier":"hard","beams":[{"n":3},{"l":1,"r":2,"parent":[0,-3],"free":true}],"fixed":[[0,1,2]],"tray":[2,3,4,8],"answers":1,"mirror":false,"solution":{"placed":{"1:2":2,"1:-1":4,"0:-2":3,"0:-1":8},"hang":{"1":2}}},
  {"id":"chain","tier":"hard","beams":[{"n":3},{"l":1,"r":2,"parent":[0,-2]},{"l":1,"r":2,"parent":[1,2]}],"fixed":[[0,1,2]],"tray":[1,2,6,8],"answers":1,"mirror":false,"solution":{"placed":{"2:2":1,"2:-1":2,"1:-1":6,"0:2":8},"hang":{}}},
  {"id":"fork","tier":"hard","beams":[{"n":3},{"l":1,"r":2,"parent":[0,-3]},{"l":2,"r":1,"parent":[0,2]}],"fixed":[],"tray":[2,3,4,4,8],"answers":1,"mirror":false,"solution":{"placed":{"2:-2":4,"2:1":8,"1:2":2,"1:-1":4,"0:-2":3},"hang":{}}},
];
