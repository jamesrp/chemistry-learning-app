# Metals, magnets, semiconductors and more: research and a shortlist

A third pass, November 6, 2026, for James. Jay loved all five chemistry puzzles and asked for more molecules and more ions (those are in the same pull request as this doc). This doc looks further: which ideas from materials chemistry (metals and their lattices, magnetism, semiconductors, crystal packing, electron shells) make good puzzles in the house style. James's limits: discrete and puzzle-like, as the current boards are; no calculus; algebra only as simple fractional ratios, like the overhang's twelfths and the charge rails' common multiples.

**Update, November 7:** Spin grids, Crystal cells, Ring patches and Electron swap are built (the next pull request). Crystal cells kept to filling one cube; the A, B, C layer stacking is left for later. Number 3 is still an idea.

**Update, November 9:** after Jay's first play, Crystal cells lost its ball tray (polonium had to go on the corners only because the tray held 8 balls, though one atom in the middle is the same crystal). Boards now ask for atoms per cube under one physical rule (metal atoms, or like ions, never side by side), accept the crystal drawn either way round, and show the cube among its neighbours. Structures that rule can't pin down (ReO₃, Cu₃N, the perovskites) were dropped. Electron swap was retired: its move was the same tap-the-line count as Valence bridges, and its explanation of ion charges now sits in Charge jigsaw's grown-up notes.

## The short answer

| Rank | Puzzle | Science | The move | Fit for Jay now |
|---|---|---|---|---|
| 1 | **Spin grids** (recommended first) | Magnetism: ferromagnets, antiferromagnets, frustration, spin ice | Tap an arrow to flip it up or down until the fewest neighbour pairs disagree | Strong |
| 2 | **Crystal cells** | Metal lattices (simple, body-centred, face-centred), close packing, salt crystals | Stack ball layers in A, B, C places; fill a cube's corners, edges, faces and centre to make a formula | Strong, and the one that uses fractions |
| 3 | **Diode boards** | Semiconductors: doped silicon, one-way current, LEDs, rectifiers | Place diodes on a Bulb board so the right bulbs light, whichever way the battery faces | Good; leans on the physics shelf |
| 4 | **Ring patches** (already started) | Aromatic rings, graphene, Kekulé structures | Place the double bonds on a patch of joined carbon rings, every way they can go | Strong; four boards are in this PR |
| 5 | **Electron swap** | Electron shells, and why ions have the charges they do | Move outer electrons from metal atoms to non-metal atoms until every atom has a full outer shell | Good, as the "why" behind Charge jigsaw |

**Build Spin grids first.** It answers James's magnetism question with the model physicists actually use (the Ising model), it plays like Square ice, which Jay liked most (tap, and a local rule lights up right away), and its surprise is felt on the board: on a triangle of antiferromagnetic arrows you cannot make every pair happy, however you try. It even ties back to Square ice: "spin ice" crystals follow the same two-in, two-out rule as the hydrogens in ice. A brute-force checker (or a min-cut for the plain ferromagnet boards) proves every level.

**Crystal cells is a close second** and the best answer to the metals-and-lattices question. It is also where James's "simple fractional ratios" fit naturally: a corner atom is shared by 8 cubes, an edge atom by 4 and a face atom by 2, so a cube holds 8 × ⅛ + 6 × ½ = 4 copper atoms, and calcium titanate's formula, CaTiO₃, falls out of 1 + 1 + 6 × ½. If James would rather stay on the chemistry shelf, build this one first instead.

## What made the current puzzles land, and what that rules out

From the November 4 and 6 reports (Jay loved all five; Square ice and Isomer hunt first) and from how the families are built:

- **Every tap changes the board, and a local count says whether it's right.** Square ice's two-close-hydrogens rule, Valence bridges' bond counts and Charge jigsaw's equal rails all do this. Each idea below has such a local rule.
- **Names matter.** Jay likes learning what the result is called, so each idea below ends in something with a real name: iron, copper, perovskite, silicon, naphthalene.
- **Find, don't predict.** Math Studio's playtests and the physics doc agree that placement and "find every one" beat "predict what happens". That rules out band-gap colour guessing, Curie-point heating and most of what makes metals shiny or bendy, which are real but are predictions or continuous quantities.

## The ideas, one by one

Fit is A (strong), B (good) or C (weak). Size is how much there is to build: S, M or L.

### 1. Spin grids (magnetism). Fit A, size M

**The concept.** In iron, nickel and cobalt, each atom is a tiny magnet (an electron spin). Neighbouring spins in a ferromagnet like to point the same way, so they line up into domains and the lump becomes a magnet. In an antiferromagnet (manganese oxide, MnO) neighbours like to point opposite ways and the lump shows no outside pull. The simplest honest model, the Ising model (Lenz and Ising, 1920s), keeps exactly that: each site is up or down, and each neighbour pair is happy or unhappy. The energy is the number of unhappy pairs, nothing else.

**The board.** A grid of arrows on the Square ice paper. Tap an arrow to flip it. Every neighbour pair has a short line between them, green when happy and red when unhappy. The goal on each board is printed as a small red-line budget: "at most 4". Some arrows are pinned (drawn with a nail), like the magnets at a material's edge.

- Ferromagnet boards: lines want matching arrows. With the left edge pinned up and the right edge pinned down there must be a wall somewhere, and the puzzle is to make the wall as short as possible. On a 4 × 4 board that is 4 red lines, and there are exactly 3 ways (checked by brute force here).
- Antiferromagnet boards: lines want opposite arrows. On a square grid the answer is a checkerboard (2 ways on an open 4 × 4 board).
- **Frustration** (the surprise): on a triangular grid of antiferromagnet lines, every triangle has at least one red line, however you flip. A single triangle has 6 best answers, each with 1 red line. A patch of 8 triangles needs at least 4 red lines (each inner line is shared by two triangles), and the board shows Jay why before anyone says the word.
- **Spin ice**: arrows on the edges of the Square ice grid instead of on sites, and each crossing must have two arrows in and two out. That is the same rule Jay already knows from Square ice, which is the point: in crystals such as holmium titanate the magnetic spins obey Pauling's ice rule. One small group of boards here, reusing the Square ice solver.

**Why it's honest.** Up/down spins with a count of unhappy pairs is the textbook Ising model, and its minimum-energy states are the ground states physicists compute. Frustration on triangles (Wannier, 1950) and spin ice (Harris and Bramwell, 1997) are real, named results. The only simplification is that real spins can point any way, not just up or down; the grown-up note says so.

**Ladder.** Easy: small ferromagnets with a few pinned arrows, budget 0 or 1. Medium: pinned edges that force a wall, shortest-wall boards, and antiferromagnet checkerboards with a defect. Hard: triangular frustration, mixed boards where some lines are ferro and some antiferro (a "spin glass", where the fewest red lines is genuinely hard to find), and the spin-ice group. A "find every best answer" variant (like benzene's two structures) fits the frustrated boards.

**Checker.** Boards up to about 20 free arrows are brute-forced (a million states, quick). Pure ferromagnets with pinned edges are a minimum cut, so larger boards are still exact. The mathematics James will recognize: minimum cuts and max-flow for ferromagnets, and for planar mixed boards the ground state is a minimum-weight perfect matching on the frustrated faces (Barahona, 1982).

**Kitchen table.** A sewing needle stroked 30 times one way with a fridge magnet becomes a magnet (it picks up a staple, and floated on a cork it points north). Iron filings in a zip bag over a magnet show the field. Two bar magnets show "happy" and "unhappy" pairs with your hands.

### 2. Crystal cells (metals, close packing and salts). Fit A, size M

**The concept.** A metal is atoms packed like oranges in a crate, held by a shared sea of electrons. How they pack names the metal's lattice. Close-packed layers of balls can sit in three places, call them A, B and C, and a layer can never sit right on top of the same letter. ABAB… is hexagonal close packing (magnesium, zinc, titanium); ABCABC… is face-centred cubic (copper, aluminum, gold, silver, nickel). Iron, sodium and tungsten are body-centred cubic instead, which is not close-packed: one ball in the middle of a cube of eight.

**Group one: Stacking.** A side view of a crate. Tap to drop a layer of balls into the A, B or C dimples. Targets show a pattern seen through the side or from the top ("make copper", "make magnesium", "make one that repeats every 6 layers"). The local rule is the dimple rule: a layer can't repeat the letter below it, and the board refuses it. Hard levels are the real polytypes of silicon carbide, which repeat every 4 or 6 layers (4H and 6H). The counting question behind it, "how many different ways can n layers stack?", is a three-colouring of a path, which James will enjoy.

**Group two: Cell count (the fractions).** A cube drawn as three 3 × 3 layers (bottom, middle, top), so there's no 3D control to fiddle with. Its 27 spots are 8 corners, 12 edge midpoints, 6 face centres and 1 centre. An atom on a corner is shared by the 8 cubes that meet there, so it counts as ⅛ of an atom for this cube; an edge atom counts ¼, a face atom ½ and the centre 1. The tray holds atoms; the goal is a formula or a metal.

| Target | Fill | Count (checked here) |
|---|---|---|
| Polonium (simple cubic, the only element that does this) | corners | 8 × ⅛ = 1 |
| Iron, sodium, tungsten (body-centred) | corners + centre | 1 + 1 = 2 |
| Copper, aluminum, gold (face-centred) | corners + faces | 1 + 3 = 4 |
| Caesium chloride, CsCl | Cl on corners, Cs in the centre | 1 : 1 |
| Table salt, NaCl | Na on corners and faces, Cl on edges and centre | 4 : 4 |
| Perovskite, CaTiO₃ | Ca corners, Ti centre, O faces | 1 : 1 : 3 |
| Rhenium trioxide, ReO₃ | Re corners, O edges | 1 : 3 |
| Cu₃Au (an alloy) | Au corners, Cu faces | 3 : 1 |

The rule that makes it a puzzle rather than arithmetic is the one real crystals obey: the cube repeats, so all 8 corners hold the same atom, opposite faces match, and the four parallel edges match. That leaves 8 choices to make (corners, 3 face pairs, 3 edge sets, centre), each worth exactly one atom, which is the lovely surprise behind the fractions: eight eighths make one. Hard levels add the salt rule from Charge jigsaw (a + ion's nearest neighbours must be − ions), so table salt becomes a 3D checkerboard the board forces.

**Why it's honest.** These are the real structures and the real counting rule from any crystallography course. The simplifications: balls are hard spheres, and the board shows only cubic cells (no hexagonal cell count).

**Ladder.** Easy: simple, body-centred and face-centred metals; stack copper and magnesium. Medium: CsCl, NaCl, Cu₃Au; "which metal is this?" from a filled cube. Hard: perovskite and ReO₃ with the neighbour rule; silicon carbide polytypes.

**Kitchen table.** Stack marbles, oranges or ping-pong balls in a square tray: one layer, then the dimples of the second, then see that the third layer has two choices (over the first layer, or over the holes). That choice is copper versus magnesium. Grow salt crystals and look at the cubes.

### 3. Diode boards (semiconductors). Fit B, size M

**The concept.** Silicon has 4 outer electrons and bonds to 4 neighbours, like carbon in diamond (Valence bridges' rule, in a crystal). Swap one silicon for phosphorus (5 outer electrons) and there's one electron left over that can wander: n-type. Swap in boron (3 outer electrons) and there's one bond short, a "hole" that wanders: p-type. Where p meets n you get a diode, which lets current through one way only. An LED is a diode that glows.

**The board.** Two parts.

- A short intro group on a silicon grid drawn as Lewis dots (each Si with four shared pairs). Tap an atom to swap it for P or B; spare electrons and holes appear as dots and gaps. Goals like "make 3 spare electrons and 1 hole" are honest electron counting, and they set up the words n-type and p-type. This group alone is thin as a puzzle, so it stays small.
- The puzzle is on the Bulb boards: diodes join the tray. A diode only lets current through in its arrow's direction, and an LED is a bulb that only lights one way. Goals: light these bulbs and not those; light the bulb whichever way the battery faces (a flip button on the battery), which is the four-diode bridge rectifier inside most mains chargers; diode "or" and "and" gates, the oldest logic circuits.

**Why it's honest.** The dopant electron counting is exactly how textbooks introduce n- and p-type silicon, and an ideal diode (on one way, off the other) is the standard first model. The cautions: real diodes need a little push (about 0.6 V for silicon) before they conduct, and holes are a bookkeeping idea, not particles; both go in grown-up notes.

**Ladder.** Easy: one diode, light the bulb (or keep it dark). Medium: two bulbs, one lit each way the battery faces. Hard: the bridge rectifier; diode gates.

**Checker.** The Bulb board solver is exact; ideal diodes add a small case split (each diode on or off, keep the cases that are consistent), at most 2⁶ cases on these boards.

**Kitchen table.** An LED and a coin battery: it lights one way round and not the other. A red, a green and a blue LED side by side for the colour of light.

**Shelf.** It spans both shelves. It could sit on Physics as Bulb boards' next group, with the silicon intro on Chemistry.

### 4. Ring patches (carbon sheets). Fit A, size S. Already started

**The concept.** Benzene's two drawings are the start of a big family. Join rings edge to edge and the double bonds can be placed in more ways: naphthalene (mothballs) 3, anthracene 4, phenanthrene 5, pyrene 6. Each way is a Kekulé structure, and chemists use the count as a rough guide to how stable such a molecule is. Keep joining and you reach graphene, a single sheet of graphite (pencil lead). Fold a sheet into a ball and you get buckminsterfullerene, C₆₀.

**What's built.** Four Hard Valence bridges boards in this pull request: the rings start with every line single and the puzzle is to find every way to place the double bonds (the solver confirms 3, 4, 5 and 6).

**What's next.** Triphenylene (9), coronene (a hexagon of 7 rings, 20), and one big "how many?" board where Jay counts rather than draws. Behind it is mathematics James will know: each answer is a perfect matching of the carbon graph, and for a hexagon-shaped patch the matchings are lozenge tilings, counted by MacMahon's formula. C₆₀ has 12,500.

**Why it's honest.** Kekulé structures are standard organic chemistry; graphene and fullerenes are real (Nobel prizes in 2010 and 1996).

**Ladder.** Already Hard in Valence bridges; a later Medium group could ask for one structure only.

### 5. Electron swap (shells and ion charges). Fit B, size M

**The concept.** Charge jigsaw takes the charges as given. This answers why: atoms have electrons in shells (2, then 8, then 8 for the light elements), and an atom with a full outer shell is stable. Sodium has 1 outer electron to give away; chlorine is 1 short. Hand it over and you have Na⁺ and Cl⁻. Magnesium gives 2, aluminum 3, oxygen takes 2, nitrogen takes 3.

**The board.** Bohr pictures (a nucleus and rings of dots). Drag an outer electron from one atom to another. An atom glows when its outer shell is full or empty. Goal: every atom glows. Mg with two Cl, Al₂O₃ (two aluminum atoms give 3 each, three oxygens take 2 each), calcium nitride. Hard: "how few atoms can you use?" for a given pair, which is Charge jigsaw's formula unit found the other way.

**Why it's honest.** It's the standard picture of ionic bonding. The caution, as with the octet rule in the first research doc: "full shells are happy" is a rule of thumb, not a reason, and the energy story (it costs energy to remove electrons; the attraction of the ions in the crystal pays for it) belongs in grown-up notes.

**Why fifth.** Once the rule is known there are few real choices on small boards, so it risks being a procedure. Its best use may be a short warm-up group in front of Charge jigsaw rather than a family of its own.

### Also considered

| Idea | Science | Puzzle version | Fit | Why not top 5 (yet) |
|---|---|---|---|---|
| **Polymer dominoes** | Condensation polymers (nylon, polyester) | Join monomers whose ends match (amine with acid), each link frees a water | B, S | Nice names (nylon), but thin as a puzzle: a domino chain with one rule |
| **Electron sea** | Why metals conduct, bend and shine | Any | C | Real but continuous; no discrete local rule |
| **LED colours** | Band gap sets the colour | Match materials to colours | C | Prediction from a table, and the numbers are continuous |
| **Batteries** | Redox, electrons flowing from zinc to copper | Stack lemon or coin cells in series on Bulb boards | B, S | A good Bulb boards group (cells add up), less a chemistry family |
| **Snowflake symmetry** | Ice's hexagonal crystal | Fold-and-cut six-fold flakes | B | Lovely craft, little puzzle; the Square ice note covers ice |
| **Mirror molecules** | Chirality | Find which molecules have a mirror twin | B, M | Needs a 3D view; a good later Isomer hunt mode |
| **Radius ratios** | How many ions fit around another | Coins of two sizes around a centre | C | Continuous ratios, not simple fractions |
| **Superconductors, magnets that float** | Real and exciting | Any | C | No honest discrete rule at Jay's level |

## How this maps onto the existing app

- **Same seam.** Each family is a module in `dist/families/`, its checker in `dist/chem/` (or `dist/phys/`), levels in `dist/data/`, one line in `dist/families/index.js`; the tests and jsdom smoke cover it as for the others.
- **Spin grids** reuses the Square ice board drawing, its tap target and its pinned-edge idea; the checker is new but small. Spin ice reuses the Square ice solver.
- **Crystal cells** is new drawing (balls in a crate, three 3 × 3 layers) on the same paper look. The fraction display can use the overhang's fraction glyphs (⅛, ¼, ½).
- **Diode boards** extends `dist/phys/bulbs.js` with a diode element; the Bulb boards UI gains a battery flip.
- **Ring patches** is already on the Valence bridges board.
- **Names on the board.** Each solved level shows its real name (iron, copper, perovskite, silicon), the way Charge jigsaw and Isomer hunt now do.

## Recommended next build: Spin grids

A slice to put in front of Jay:

1. Twelve boards: four Easy (small ferromagnets with pins), four Medium (forced walls and checkerboards), four Hard (triangles that can't all be happy, one mixed board, one "find every best answer").
2. Tap to flip, lines that go green or red at once, a red-line budget shown as a number.
3. A brute-force checker for every board (fewest red lines, number of best answers), with min-cut as a second check on the ferromagnet boards.
4. The needle-and-cork compass as the kitchen activity.

The spin-ice group follows if it lands, because it connects back to Square ice.

**What to watch for:** whether a budget ("at most 4 red") reads well or whether he'd rather just "make as few red as you can"; whether he finds the frustrated triangle surprising or annoying; and whether he wants to free-play the grid to watch domains form, which would argue for a sandbox mode.

## Open questions for James

- Spin grids first (closest to Square ice, answers magnetism) or Crystal cells first (stays on the chemistry shelf, answers metals and uses the fractions)?
- Should magnetism and semiconductors sit on the Physics shelf, the Chemistry shelf, or a third "Materials" shelf?
- Is "8 × ⅛ = 1" the kind of fraction you had in mind, or too much number on a board? The cell counts can also be shown only after solving.

## Sources

No new pages were read for this doc; it builds on the two earlier research docs. Checked with small scripts here: the Ising ground states quoted above (4 × 4 wall: 4 red lines, 3 ways; single antiferromagnetic triangle: 1 red line, 6 ways; 8-triangle patch: 4 red lines; open 4 × 4 antiferromagnet: 2 checkerboards), every unit-cell count in the table, and the Kekulé counts of the four ring boards (the Valence bridges solver, in `tests/bridges.test.mjs`).

Stated from standard references rather than a page read here, and to be checked before they go into grown-up notes: the Ising model's history (Lenz, Ising), Wannier's triangular antiferromagnet (1950), spin ice in holmium and dysprosium titanates (Harris, Bramwell and others, 1997), Barahona's matching result (1982), the lattices of the named metals and of polonium, silicon carbide's 4H and 6H polytypes, the perovskite, ReO₃ and Cu₃Au structures, n- and p-type doping and the silicon diode's 0.6 V, the bridge rectifier, the Kekulé counts of triphenylene (9), coronene (20) and C₆₀ (12,500), MacMahon's formula, and the 2010 (graphene) and 1996 (fullerenes) Nobel prizes.
