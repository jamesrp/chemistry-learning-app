# Chemistry learning app

A chemistry and physics puzzle app with hands-on activities for a curious kid, a sibling of [Math Studio](https://github.com/jamesrp/small-math-adventure).

**Chem Studio** is a playable prototype: seventeen puzzle families and 304 levels on four shelves. Eight chemistry families (172 levels) come from `docs/research/puzzle-ideas.md`, `docs/research/materials-puzzle-ideas.md` and the November shortlist of new families (Mystery molecule); two materials families (27 levels, magnetism and metal lattices) come from `docs/research/materials-puzzle-ideas.md`; the five physics families (68 levels) come from `docs/research/physics-puzzle-ideas.md`; the two particles and nuclei families (37 levels) come from the same November shortlist. It follows Math Studio's way of working: plain JavaScript modules in `dist/` with no build step, the same paper-and-ink board look, almost no words on the board, rules behind **?** (How to play), and grown-up notes on their own page.

## Run it

Requires Node.js 22 or later. Nothing to install.

```sh
npm start
```

Open http://127.0.0.1:4188. The server also listens on the local network, so an iPad on the same Wi-Fi can open `http://<your-mac's-address>:4188`. `PORT=4200 npm start` picks another port. There is no offline support or home-screen install yet.

## Published copy

The app is published at https://jamesrp.github.io/chemistry-learning-app/. Every push to `main` runs the tests and republishes `dist/` through `.github/workflows/pages.yml`; a failing test stops the publish. To republish by hand, run the workflow from the Actions tab. Progress is kept in each browser, separately from a local copy.

## The puzzles

### Chemistry

| Family | Levels | The move | Solved when |
|---|---|---|---|
| **Valence bridges** (Lewis structures) | 41 | Tap between two atoms: single, double, triple, none | Every atom has its bond count (H 1, O 2, N 3, C 4, S 2, Cl 1) and the atoms form one molecule. Lone dots show what's left to bond; benzene and pyridine ask for both of their structures. The last four (naphthalene to pyrene) start with every line single and ask for every way to place the double bonds. |
| **Isomer hunt** | 17 | Place the bag's heavy atoms (C, N, O, Cl) on a lattice and bond them; hydrogens fill in (CH₃, OH) | Every distinct molecule is kept, and named as it is kept. Copies, bent or flipped, are refused; **That's all** checks the count. |
| **Mystery molecule** (infrared and NMR) | 23 | Build a molecule from the bag, as in Isomer hunt; its clue cards appear under the mystery's | Every card matches: infrared (which bonds), carbon-13 (one peak per kind of carbon) and, on Hard, proton (signal sizes and n + 1 splitting). Wrong builds go on a shelf with their names. Exactly one molecule in each bag fits the cards. |
| **Charge jigsaw** (ions) | 33 | Tap ions onto two rails; each rod is as long as its charge | The rails are the same length with the fewest ions (the formula unit), and the compound is named. Four Hard trays ask for every compound, one with both iron ions. |
| **Atom recycling** (balancing) | 19 | Break reactant molecules onto a bench; build products from bench atoms | The bench is empty with the smallest whole numbers, and the equation is said in words. Three piles ask for the most product a fixed supply can make. |
| **Square ice** (hydrogen bonds) | 12 | Tap near an oxygen to slide a hydrogen close to it | Every oxygen has exactly two close hydrogens. Edge hydrogens are given. |
| **Ring patches** (Kekulé structures) | 13 | Tap a ring bond to make it single or double | Every carbon has exactly one double bond. Each find is kept; boards from benzene (2 ways) to circumcoronene (980) ask for every way or for a few. |
| **Electron swap** (where ion charges come from) | 14 | Tap the line between a metal and a non-metal to move one outer electron across | Every metal has given all its outer electrons and every non-metal has eight. Each board has one answer, and the title names each compound made (up to three on one board). |

### Materials

| Family | Levels | The move | Solved when |
|---|---|---|---|
| **Spin grids** (magnetism) | 15 | Tap an arrow to flip it up or down; squares are pinned | Neighbours that want to match (or, on barred lines, to differ) do, with the fewest unhappy lines possible. Triangle and glass boards can't make every line happy; some ask for every best arrangement. |
| **Crystal cells** (unit cells) | 12 | Drop atoms from the tray onto corners, edges, faces and the middle of a cube | The tray is empty and the cell holds the right number of atoms: a corner counts ⅛, an edge ¼, a face ½, the middle 1. Salt boards keep the same element apart. |

### Physics

| Family | Levels | The move | Solved when |
|---|---|---|---|
| **Bulb boards** (circuits) | 14 | Tap a gap between two posts to lay a wire; tap a switch to flip it | Every bulb glows like its badge (bright, dim, faint or dark) within the wire budget. Brightness is the real power through identical bulbs, solved exactly. Includes a balanced bridge and the two-way hallway switch. |
| **Laser bench** (light and colour) | 14 | Place mirrors and splitters from the tray; tap to flip or take back | Every target is lit with its colour. Beams that meet add (red + green = yellow, all three = white). |
| **Balance beams** (levers and mobiles) | 14 | Hang the tray's weights on hooks | Every beam balances: weight × distance is equal on both sides. Hard levels are mobiles with uneven arms and a loose string. |
| **Gear trains** | 12 | Place gears from the tray on pegs | Each output turns the right way at the right speed. A ring of three meshing gears jams. |
| **Overhang** (block stacking) | 14 | Slide a block left or right; the blocks above ride along | The stack reaches the flag without tipping. Some levels star a block that must get there, using the blocks above as counterweights. |

### Particles and nuclei

| Family | Levels | The move | Solved when |
|---|---|---|---|
| **Quark kitchen** (the quark model) | 18 | Tap quarks and antiquarks into up to three slots; tap one to flip its spin arrow | The build is the particle the goal asks for (by charge, spin, quarks or antimatter). Three quarks or a quark and antiquark are colourless; three identical quarks must spin together. Hard levels fill in Gell-Mann's octet, decuplet and meson charts. |
| **Star forge** (the chart of nuclides) | 19 | Capture a proton, neutron or helium-4, or let the nucleus decay its own way (β⁻, β⁺, α) | The target nucleus is made in par moves. Lithium-5 and the like fall apart; beryllium-8 only lasts long enough to catch a helium-4. From the Sun's helium to supernova iron, and the thorium and uranium decay chains. |

Every family has Undo, Restart and a Hint. Solved levels are remembered in the browser. **Grown-ups** (bottom of the home screen) has, per family, the chemistry, the mathematics, a teaching caution and a kitchen-table activity (for physics, materials and particles, the science in place of the chemistry).

## Checks

```sh
npm test
```

`npm test` checks the content, not just the code: every Valence bridges board has exactly the structures it claims (one each, two for benzene and pyridine, and the Kekulé counts 3, 4, 5 and 6 for naphthalene, anthracene, phenanthrene and pyrene) and the atoms its formula says, and following hints from an empty board reaches a solution. Each isomer bag's named list matches a full enumeration and every molecule fits on its board. Every ion target is its formula unit, and its name starts with the compound's name (cation, then anion, with iron(II)/iron(III) and copper(I)/copper(II)). Each reaction's smallest balance is the textbook equation, every molecule picture has its formula's atoms and each atom its bond count, and the pile limits are right. Every ice board has exactly one solution, and the 3×3 domain-wall count is 7. Every ring patch has the Kekulé count it claims, matched against a perfect-matching count. Every electron swap board has exactly one answer, gives as many electrons as it takes, and makes the compounds its title names. Every Mystery molecule level is checked against a full enumeration of its bag: exactly one molecule shows its cards, and the spectra engine's symmetry counts and splittings match textbook cases (neopentane's two kinds of carbon, ethyl acetate's quartet and triplet).

The physics suites do the same. Every bulb board's wire budget is the fewest that work and its answer is the only one, and the powers it claims (the bridge's dark middle, ¼ in series, 4/9 and 1/9) are computed exactly. Every laser tray is tight and its answers match an exhaustive solver. Balance-beam answers are counted by a solver and an independent brute force. Gear levels' witnesses, solution counts and decoys (wrong way, wrong speed, jam) match an exhaustive search. Overhang's maximum reaches for 2 to 6 blocks are confirmed, and every stored solution is the shortest. In every physics family, following hints from a wrong start reaches a solution. Every Quark kitchen level's count of particles comes from trying every build its tray allows, with every spin, and the decuplet lands on the chart as a triangle. Every Star forge par is a breadth-first search of the chart, every decay lands on a nuclide in the table, and the uranium chain takes 8 alpha and 6 beta decays by 8 routes. For the materials families, every spin grid's best score and number of best arrangements come from trying every arrangement, and every crystal cell's atom count and answer come from a full search.

`scripts/dom-smoke.mjs` plays all 304 levels through the real interface in jsdom, tapping what a child would tap. It also checks undo, hints, refused duplicates, "fewer" nudges, the home and Grown-ups pages, and How to play. jsdom isn't a dependency:

```sh
npm install --no-save jsdom
node scripts/dom-smoke.mjs
```

Square ice boards are generated by `node scripts/make-ice.mjs`, which is seeded and rewrites `dist/data/ice-levels.js`. `scripts/make-beams.mjs` and `scripts/make-overhang.mjs` re-solve their families' levels and rewrite the stored answers. Each newer family's play-through lives in `scripts/smoke/<family>.mjs`.

## Files

| Path | What |
|---|---|
| `dist/chem/` | The chemistry and its checkers, with no DOM: bonds and the bridges solver, isomer canonical forms and enumeration, ions and formulas, reactions and balancing, the ice rules and solver, ring patches, electron swaps, spins, unit cells, and the infrared and NMR spectra |
| `dist/phys/` | The physics and its solvers, with no DOM: exact circuit solving, beam tracing and colour mixing, turning sums, gear meshing and speeds, stack stability, the quark model and the chart of nuclides |
| `dist/data/` | Levels for each family |
| `dist/families/` | One board per family; `index.js` lists them |
| `dist/styles/` | Each newer family's look |
| `dist/main.js`, `dist/ui.js`, `dist/style.css` | Home, play screen, Grown-ups, shared drawing helpers, the look |
| `dist/notes.js` | Grown-up notes |
| `tests/` | `node --test` suites |
