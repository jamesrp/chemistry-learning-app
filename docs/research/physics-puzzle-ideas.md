# Physics puzzles for the app: research and a shortlist

A first pass, November 5, 2026, for James. The reader is Jay: eight, strong and curious, and fresh from a first evening with Chem Studio, where Square ice and Isomer hunt went over best. The question is which physics ideas (circuits, light, levers, gears, balance and more) make good *puzzles* on a screen, in the same house style as the chemistry: one well-defined puzzle type per family, a real object with real rules, choices rather than procedure, and a surprise the player feels on the board rather than reads in a caption.

## The short answer

| Rank | Puzzle | Physics | The move | Fit for Jay now |
|---|---|---|---|---|
| 1 | **Bulb boards** (recommended first) | Closed circuits, short circuits, series and parallel, switches | Tap the gap between two posts to lay or lift a wire until the bulbs glow as shown | Strong |
| 2 | **Laser bench** | Reflection, splitting a beam, mixing coloured light, polarizing filters | Place mirrors and filters from a tray so the beam reaches every target | Strong |
| 3 | **Balance beams and mobiles** | Levers and torque, centre of mass | Hang weights from a tray on hooks until every beam is level | Strong, and the smallest build |
| 4 | **Gear trains** | Direction, speed ratio, idlers, jams | Put gears from a tray on pegs so the output turns the right way at the right speed | Good |
| 5 | **Overhang** (wild card) | Centre of mass, toppling | Slide blocks at a table edge to reach as far out as possible without the stack falling | Good, with the best "how is that standing up?" moment on the list |

**Build Bulb boards first.** Electricity is what James named first, and the board is a grid of posts and taps very like Square ice, the family Jay liked most. Every rule is real (a bulb lights only when current goes through it, a wire across a bulb puts it out, two bulbs in a row glow dimmer), so the surprises are physics, felt on the board: the bulb that won't light with one wire, the bulb that goes dark when you add *more* wire, the bulb in the middle of a bridge that stays dark although it is connected at both ends. A small exact solver (Kirchhoff's laws on a few dozen nodes) checks every board, and the mathematics underneath (the graph Laplacian, and Kirchhoff's own matrix-tree theorem) is something a mathematician recognizes at once.

**Where it lives.** All five fit inside the existing app. Each is one family module plus one line in `dist/families/index.js`, the same seam the five chemistry families use. The one change worth making is a second shelf on the home screen, Chemistry and Physics, so ten families don't sit in one long list. Whether the app keeps the name Chem Studio is James's call (see Open questions).

## What made Square ice and Isomer hunt land

From James's report on November 4 (Jay played those two first and kept going) and from how they are built:

- **Every tap changes the board right away, and a local count tells you if it's right.** In Square ice each oxygen needs exactly two close hydrogens; the board shows the count, and forced moves spread from the fixed edges. The solve is local-to-global, with no waiting for an animation to find out.
- **The board says no, so the app doesn't have to.** In Isomer hunt the app refuses a duplicate molecule, and the lesson (a drawing is not the molecule) arrives with no explanation.
- **There is something to find, not something to predict.** Math Studio's playtests point the same way: children liked the click-around-to-solve families (cup swaps, Lantern Wires, the odd-pebble balance) and liked the "predict what happens" families (Mirror Couriers, Clockwork Gates) less.

So every physics family below is placement on a board with immediate feedback, and the shortlist leaves out ideas that are mostly prediction ("will it sink?", "which pendulum is faster?"), however good the physics.

**Overlap with Math Studio.** Three Math Studio families look physical but aren't these puzzles. Lantern Wires flips pairs of lanterns (linear algebra over F₂, not a circuit). Mirror Couriers predicts a billiard path (prediction, and less liked). Clockwork Gates is modular counting on a dial. The odd-pebble balance uses a scale to gather information, not to balance torques. Nothing here repeats them, and Laser bench deliberately turns Mirror Couriers' prediction into placement.

## What exists, and what to learn from it

| Thing | What you do | What works | What's weak |
|---|---|---|---|
| ThinkFun [Circuit Maze](https://legacy.thinkfun.com/products/circuit-maze/) (ages 8+) | Place path tokens (21 pieces in the box) around a two-part power source to light coloured LED beacons; 60 challenge cards | A real circuit you can hold; challenge cards from beginner to expert; a switch and blockers add constraints | Physically it's a routing puzzle: once a loop closes, the LED lights; nothing about brightness, shorts or parallel paths |
| ThinkFun [Laser Maze](https://legacy.thinkfun.com/products/laser-maze/) (ages 8+) | Place mirrors and beam splitters to send a laser to a target; 60 cards | Pure placement with a real beam; splitters make it branch | Only one kind of optics (mirrors); no colour or polarization |
| [PhET](https://phet.colorado.edu/) sims: Circuit Construction Kit DC, [Balancing Act](https://phet.colorado.edu/files/teachers-guide/balancing-act-guide.pdf), Bending Light, Color Vision, Energy Skate Park, Pendulum Lab | Build and measure | Accurate and free; Balancing Act has a game mode where you place bricks on a plank to balance it | Sandboxes first; the game modes are thin; lots of meters and labels |
| [Quantum Game](https://ed.quantum.ieee.org/?p=3424) (Piotr Migdał) | Place optical elements on a grid to route photons | Proof that real optics (splitters, polarizers) make deep grid puzzles; used in university courses | Quantum mechanics is too far for now; the classical half (polarizers, splitters) is the part to borrow |
| [Cogs](https://www.cogsgame.com/) (Lazy 8 Studios) | Slide tiles so gears connect from a driver to bells | Gears that visibly mesh and turn are satisfying | A sliding-tile puzzle with a gear skin; direction and ratio barely matter |
| [SolveMe Mobiles](https://apps.apple.com/us/app/id977720372) (EDC) | Find the weight of shapes on hanging mobiles | Good balance pictures; a real hanging-mobile feel | Arms are all equal length, so it is algebra with a mobile skin, not levers |
| Snap Circuits (Elenco), LEGO Technic gears | Hands-on kits | The best companions for two of the families below | Not puzzles by themselves |
| Bridge builders (Poly Bridge), The Incredible Machine, World of Goo, Angry Birds | Physics-engine sandboxes | Kids love them | Continuous simulation and trial and error, not a well-defined discrete puzzle with a checkable answer |

**Lessons for us.**

1. The good kid physics puzzles (Circuit Maze, Laser Maze, Balancing Act's game) are all placement from a fixed tray onto a board. That is the shape to copy.
2. Each of them uses one rule. There is room to go further with the *same* board: Circuit Maze never shows a short circuit or a dim bulb, Laser Maze never mixes colours. Those are where the surprises are.
3. Physics-engine games are fun but aren't puzzles in Math Studio's sense: no exact instance, no witness, no validator. Avoid continuous simulation; keep positions on a grid and answers exact.

## One teaching caution: how children picture circuits

Science-education research on simple circuits is old and consistent. The [Victorian curriculum's continuum page](https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/electriccircuit.aspx) (citing Osborne, Shipstone and others) lists four models children hold for a battery and a bulb: one wire is enough (the "unipolar" model); current comes from both ends and clashes in the bulb; current is used up by the bulb, so less comes back; and the scientific one, where the current is the same in both wires. It also notes that children treat current, voltage, energy and "electricity" as one thing, and it advises predict-observe-explain tasks and *against* quantitative Ohm's-law work at this age.

What this means for the app:

- Make the first levels refute the unipolar model on the board: a bulb with one wire stays dark, and only a complete loop lights it.
- Show current the same all the way round. If the board animates flow at all, the dots move at the same rate in both wires of a loop, so "used up" never appears.
- Keep brightness qualitative on the board (bright, dim, faint, off) and keep numbers (quarter power in series) to the grown-up notes, matching the page's advice.

## The ideas, one by one

Fit uses Math Studio's scale. **A**: an obvious tap-or-drag solve with checkable answers. **B**: a new mechanic, but the solve is clear and checkable. **C**: the substance lives off-screen. **Size** is a rough build guess, S/M/L.

### 1. Bulb boards (circuits). Fit A, size M

**The object.** A circuit as a graph: posts are nodes; a battery, identical bulbs and wires are edges. With an ideal battery and identical bulbs, Kirchhoff's laws give every bulb's current exactly; brightness is its power. A wire is a zero-resistance edge, which merges its two posts. The validator is a linear solve on a few dozen nodes, done in exact fractions.

**The move.** A grid of posts with the battery and the bulbs drawn in fixed places. Tap the gap between two posts to lay a wire, tap again to lift it. A wire budget, when shown, limits how many you may lay. Bulbs glow live as you go, so every tap changes the board.

**Win.** Every bulb glows as its target shows: lit or dark in the early groups, then bright, dim or faint. A wire straight across the battery (a short circuit) is never a win; the battery shows hot and the bulbs go out.

**What the board teaches without words.** I checked these with a small nodal solver:

| Board | What you see |
|---|---|
| One bulb, both ends wired to the battery | Bright (power 1) |
| One bulb, one wire | Dark: no loop |
| Two bulbs in a row | Both dim (each ¼) |
| Two bulbs side by side | Both bright (each 1) |
| One bulb, then two side by side | The first dimmer than alone (⁴⁄₉), the pair fainter (¹⁄₉ each) |
| A wire across a bulb | That bulb dark, the rest brighter |
| Four bulbs in a square bridge, a fifth across the middle | The middle bulb dark (0), the others dim (¼): balanced bridge |
| The same, one arm lengthened by an extra bulb | The middle bulb lights, faintly (¹⁄₁₆₉) |

**Ramp.**

- *Easy (loops):* light one bulb; light two; light one and keep its neighbour dark. The unipolar surprise arrives in the first level.
- *Medium (shorts and paths):* turn a bulb off by laying wire (a short across it), with a budget so the choice matters; light three bulbs with the fewest wires.
- *Hard (brightness):* match bright, dim and faint patterns. Some need series, some side by side; the balanced bridge level asks for the middle bulb dark while all four corners glow.
- *Later group (switches):* switches are edges that the board flips through all their states. Make the lamp light only when both switches are on (series), when either is (side by side), and the hallway light: two switches, each of which changes the lamp whatever the other says. That last one is real house wiring (two-way switches), and the solution is not obvious to most grown-ups.

**Hint.** Point at the bulb whose target can only be met one way (a bulb that must be dark with only one wire into it, a bulb that must be bright and so needs its own path to the battery).

**Why it's good.** Real decisions, live feedback, and a validator that is just physics. The mathematics is real: the circuit's equations are a graph Laplacian, Kirchhoff found the matrix-tree theorem while studying them (1847), and a balanced bridge is a symmetry argument a child can see.

**Hands-on.** A battery, two or three small bulbs or LEDs, and strips of kitchen foil. Following the Victorian page's advice, start without a bulb holder: ask Jay to light the bulb with one battery and one wire, and let him find the two contacts himself. Then two bulbs in a row (dim) and side by side (bright). Snap Circuits does the same with less fiddling. Keep a short across the battery to a second (it gets warm) and never go near mains.

### 2. Laser bench (light). Fit A, size M

**The object.** Light on a grid: a beam travels straight and a mirror at 45° turns it by 90° (angle in equals angle out). A half-silvered mirror passes half and reflects half. Coloured light adds (red and green make yellow on a white target; red, green and blue make white). A polarizing filter passes light lined up with it; two crossed filters block everything, but the share that gets through each filter follows Malus's law, cos² of the angle between them, so at 45° steps the factors are 1, ½ and 0.

**The move.** A lamp, targets, and a tray of pieces. Drag a mirror into an empty square and tap it to flip between its two slants; later trays add splitters, colour filters and polarizers. The beam redraws after every move.

**Win.** Every target lit, in the right colour where one is shown, and no beam on a blocked square.

**Ramp.**

- *Easy (mirrors):* one target, one or two mirrors, then two targets and a wall in the way.
- *Medium (splitters):* one lamp, two targets, so the beam must branch; a fixed number of pieces makes order and position matter.
- *Hard (colour):* red and green lamps, a yellow target. The surprise is felt: two beams make a colour neither lamp has, and it isn't the brown of mixed paint. Then a white target from three lamps.
- *Later group (polarizers):* light from a lamp through two crossed filters: dark. Add a third filter at 45° *between* them and light gets through (⅛ of the lamp's). Put the same three in another order and it's dark again, because filters don't commute. That is a famous physics surprise and an honest piece of linear algebra (projections), and it fits in a line of four slots.

**Simplification to note.** Keep polarizers and mirrors in separate groups: a real mirror can twist polarized light (it changes the phase between components), and the puzzle shouldn't pretend otherwise.

**Why it's good.** Placement with immediate feedback, a tradition that already works for eight-year-olds (Laser Maze), and two genuinely startling extensions (additive colour, the third polarizer) that need no words.

**Hands-on.** A torch and a hand mirror to bounce light onto a target across the room. Phone or tablet screens up close under a magnifier show the red, green and blue dots that make every colour. Two pairs of polarized sunglasses, or the sunglasses in front of a laptop screen (which is polarized), turned slowly until the screen goes black. Skip laser pointers with kids.

### 3. Balance beams and mobiles (levers). Fit A, size S

**The object.** A beam on a pivot balances when the turning effects match: weight times distance on the left equals weight times distance on the right. A mobile is a tree of beams; a lower beam acts on the one above as a single weight equal to everything it carries, hung at its string.

**The move.** Hooks at distances 1 to 4 on each side of every beam. Drag weights from a tray onto hooks, one per hook. Beams tilt live.

**Win.** Every weight from the tray is used and every beam is level.

**Ramp.**

- *Easy (one beam):* balance a 4 with ones; balance a 2 at 3 with a 3 at 2. The surprise is felt: one small weight far out holds up a big one close in.
- *Medium:* one beam, a tray that only works one way. A tray of 1, 2 and 3 on hooks 1 to 3 has exactly two answers, mirror images of each other (I checked by brute force).
- *Hard (mobiles):* two and three levels. The bottom beam must balance first, and its total then decides where it can hang. It is the same local-to-global solve as Square ice. A brute-force search over one two-beam layout (hooks 1 and 2, trays of five weights from 1 to 6) found exactly one tray with a single answer, four 1s and a 4, so unique levels exist but are rare. They should be searched for and checked by script, the way the ice boards are, and Hard can also accept every answer instead of insisting on one.

**Why it's good.** The smallest build here, a constraint puzzle Jay already likes the shape of, and an exact validator (integer sums). It reaches levers, seesaws, scales and centre of mass, and the same board can later hold a crowbar or wheelbarrow picture in the grown-up notes.

**Hands-on.** A ruler on a pencil with coins, then a coat-hanger mobile with paper clips or washers and string. Try to balance it from the top down, then from the bottom up, and notice which works.

### 4. Gear trains. Fit A, size M

**The object.** Gears on pegs. Two meshing gears turn opposite ways, and their speeds are in the inverse ratio of their teeth. A gear between two others (an idler) changes direction but not speed. A closed ring of an odd number of meshing gears can't turn at all. Two gears fixed on one axle turn together, so their ratios multiply.

**The move.** A crank gear, an output gear with a pointer, and a tray of gears (small, medium, large, say 8, 16 and 24 teeth, the LEGO Technic sizes). Drop a gear on a peg; it meshes with any neighbour whose edge it reaches. Turn the crank to test; meshed gears turn, and a jammed ring shudders and stops.

**Win.** The output turns the right way at the right speed (one turn for every two of the crank, say), and, in later groups, two outputs at once.

**Ramp.**

- *Easy:* make the output turn the same way as the crank (needs an idler).
- *Medium:* make it turn twice as fast, then three times; then twice as fast *and* the other way.
- *Hard:* six times as fast with only small and large gears, which needs a two-gear axle (3 × 2). A board with pegs in a triangle where the obvious placement jams.

**Why it's good.** Two clean mathematical ideas: direction is a two-colouring of the mesh graph, and a jam is an odd cycle (the graph isn't bipartite); speed is a product of fractions in which the idlers cancel. Both are felt at the crank. It is close to Math Studio's Clockwork Gates in name only: there you predict; here you build.

**Hands-on.** LEGO Technic gears on a baseplate with axles, or any snap-together gear set: put a tape flag on each gear and count turns. Then build three gears in a triangle and try to turn them.

### 5. Overhang (centre of mass). Fit B, size M

**The object.** A stack of identical blocks, one per layer, at a table edge. It stands if, for every block, the centre of mass of everything above it lies over that block (and over the table for the bottom one). Stacked from the top down, each block can stick out over the one below by ½, ¼, ⅙, ⅛ of a block, so the total reach is half the harmonic sum: ¾ for two blocks, ¹¹⁄₁₂ for three, ²⁵⁄₂₄ for four, which is more than a whole block. Because the harmonic series grows without bound, enough blocks reach any distance. With more than one block per layer (counterweights) you can do better still; Paterson, Peres, Thorup, Winkler and Zwick (2007) showed the best reach grows like the cube root of the number of blocks.

**The move.** Slide each block sideways in steps of a twelfth of its length. Release, and anything out of balance topples.

**Win.** The top of the stack reaches the flag. In the last levels, the flag is past the end of a whole block: the top block sits entirely beyond the table.

**Ramp.** Two blocks to ¾; three to ¹¹⁄₁₂; then the top block wholly past the edge. On a grid of twelfths, four blocks reach exactly one block length (the twelfths can't hold ²⁵⁄₂₄), and five reach ¹³⁄₁₂, so the "it's floating" level uses five blocks. I checked both with a small stability script. A Hard group allows two blocks in a layer for counterweighting; three blocks can then reach a full block, which a single-wide stack of three cannot.

**Why it's here.** The single best felt surprise on the list (a block hanging in the air past the table), a solving trick worth learning (build from the top down), and genuine research mathematics behind it. It's a wild card because the counterweight group needs a proper statics check (forces at each contact, a small linear program), which is more build than everything else here; the single-wide groups are simple.

**Hands-on.** Exactly the app's puzzle with books, Jenga blocks or playing cards at the table edge. Four or five books will put the top one past the edge.

### Also considered

| Idea | Physics | Puzzle version | Fit | Why not top 5 (yet) |
|---|---|---|---|---|
| **Pulley rigs** | Mechanical advantage | Thread a rope through fixed and moving pulleys so a small pull lifts a heavy load; the advantage is the number of rope strands holding the load | B, M | Good and real, but the routing choices are few; maybe a Hard group on the balance board later |
| **Coaster track** | Energy conservation | Lay track pieces so a frictionless car reaches the flag; no hill may be higher than the start, and a loop needs the start 2½ loop-radii up | B, M | Real and nice, but mostly one rule (heights); risks becoming prediction |
| **Pendulum rhythms** | Period depends on length, not weight | Set lengths so pendulums swing in a rhythm (four times the length, twice the period) | B, S | The surprise (weight doesn't matter) is a prediction; the hands-on with string and washers is better than the app |
| **Magnet grids** | Like poles repel | Simon Tatham's "Magnets" logic puzzle | B, S | Its row and column counts are invented rules on a physics skin, which the house style forbids |
| **Sink or float rafts** | Buoyancy, density | Build a raft from wood, foam and steel blocks that floats level | B, M | Mostly a weighted sum, and the bath-tub version is better |
| **String tunes** | Pitch and string length | Place bridges on a string to play a tune (half the length is an octave) | B, S | Lovely but it's ear training; a good grown-up note or companion |
| **Collision counts** | Elastic collisions | Count bounces between two blocks and a wall; with mass ratio 100 the count is 31, the start of π (Galperin) | C | Prediction, and the beautiful part is for grown-ups |
| **Physics-engine builders** | Structures, projectiles | Bridges, catapults | C | Continuous simulation, no exact instance or witness |

## How this maps onto the existing app

- **Same seam.** Each family is a module in `dist/families/`, its physics and checker in a DOM-free module (a `dist/phys/` folder beside `dist/chem/`), levels in `dist/data/`, and one line in `dist/families/index.js`. Tests and the jsdom smoke run already cover a family generically.
- **Home screen.** Add a shelf heading per science (Chemistry, Physics) in `home()`; a family declares which shelf it sits on. No other copy.
- **Board look.** Bulb boards reuse the Square ice grid drawing; Laser bench and gears are square grids too; beams and the overhang are side views on the same paper-and-ink style.
- **Each family, Math Studio style:** 8 to 15 instances over Easy, Medium and Hard, each with a solution witness, a first hint and the intended insight; an independent validator (exhaustive on these small boards); a short How to play; a grown-up note with the physics, the mathematics, a teaching caution and a kitchen-table activity.
- **Copy.** Symbols on the board, no objectives where the targets already show the goal. "Short circuit" and "balanced bridge" appear only in grown-up notes.

## Recommended first prototype: Bulb boards

A slice to put in front of Jay:

1. Twelve boards: four Easy (loops, including the one-wire bulb), four Medium (shorts and wire budgets), four Hard (bright, dim and faint patterns, including the balanced bridge).
2. Tap to lay and lift wires, bulbs that glow live, a hot battery on a short.
3. An exact solver (Kirchhoff in fractions) used both to light the board and to check every level: each target is reachable within its budget, and the Hard levels have the intended forced wires.
4. The foil-and-battery companion, with "no bulb holder" as the first step.

The switches group (including the hallway light) would follow if the first twelve land.

**What to watch for when Jay plays it:** whether he reads the glow levels apart (bright, dim, faint may need a clearer scale than glow alone); whether Easy is too easy, as it was in Math Studio and in Valence bridges, in which case start at the shorts; and whether he starts building circuits just to see what happens, which would argue for a free-build bench next to the puzzles.

## Open questions for James

- One app with a Physics shelf, or a separate app? The doc assumes one app with two shelves, which is the least build and keeps one preview link. If one app, is it time to rename Chem Studio (Science Studio, or something better)?
- Is the polarizer group too far for now? It's the most surprising thing on the list, and also the hardest to explain to a grown-up who hasn't seen it.
- Should brightness be shown only as glow, or also as a small number of rays around each bulb so the levels are unmistakable?

## Sources

- ThinkFun Circuit Maze: https://legacy.thinkfun.com/products/circuit-maze/
- ThinkFun Laser Maze: https://legacy.thinkfun.com/products/laser-maze/
- PhET simulations: https://phet.colorado.edu/ , Balancing Act teacher's guide: https://phet.colorado.edu/files/teachers-guide/balancing-act-guide.pdf
- Quantum Game, IEEE Quantum Education page: https://ed.quantum.ieee.org/?p=3424
- Cogs: https://www.cogsgame.com/
- SolveMe Mobiles (App Store): https://apps.apple.com/us/app/id977720372
- Children's models of simple circuits, Victorian curriculum continuum (the page says it is moving to a new site, so the link may go stale): https://www.education.vic.gov.au/school/teachers/teachingresources/discipline/science/continuum/Pages/electriccircuit.aspx
- Block-stacking problem: https://en.wikipedia.org/wiki/Block-stacking_problem , and M. Paterson, Y. Peres, M. Thorup, P. Winkler, U. Zwick, "Maximum overhang", arXiv:0707.0093: https://arxiv.org/abs/0707.0093
- Three-polarizer handout (York University): https://www.yorku.ca/~marko/PHYS1010/ThreePolarizers.pdf

Pages read for this doc: the Circuit Maze and Laser Maze product pages, the Victorian curriculum page, the block-stacking article and the Quantum Game page. The other links come from search results and were not read in full. Checked with small scripts here: the circuit brightness table, the overhang values on a grid of twelfths and twenty-fourths, and the balance-beam and mobile solution counts.

Stated from standard references rather than a page read here: Kirchhoff and the matrix-tree theorem (1847), Malus's law and the three-polarizer result, additive colour mixing, mirror phase shifts on polarized light, gear ratio and odd-ring jamming, the LEGO Technic tooth counts, the frictionless loop height of 2½ radii, Galperin's collision count, the two-way switch wiring, and the pendulum period rule. They should be checked against a source before they go into grown-up notes.
