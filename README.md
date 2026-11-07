# Chemistry learning app

A chemistry and physics puzzle app with hands-on activities for a curious kid, a sibling of [Math Studio](https://github.com/jamesrp/small-math-adventure).

**Chem Studio** is a playable prototype: ten puzzle families and 190 levels on two shelves. The five chemistry families (122 levels) come from `docs/research/puzzle-ideas.md`; the five physics families (68 levels) come from `docs/research/physics-puzzle-ideas.md`. Ideas for what comes next (magnetism, metal lattices, semiconductors) are in `docs/research/materials-puzzle-ideas.md`. It follows Math Studio's way of working: plain JavaScript modules in `dist/` with no build step, the same paper-and-ink board look, almost no words on the board, rules behind **?** (How to play), and grown-up notes on their own page.

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
| **Charge jigsaw** (ions) | 33 | Tap ions onto two rails; each rod is as long as its charge | The rails are the same length with the fewest ions (the formula unit), and the compound is named. Four Hard trays ask for every compound, one with both iron ions. |
| **Atom recycling** (balancing) | 19 | Break reactant molecules onto a bench; build products from bench atoms | The bench is empty with the smallest whole numbers, and the equation is said in words. Three piles ask for the most product a fixed supply can make. |
| **Square ice** (hydrogen bonds) | 12 | Tap near an oxygen to slide a hydrogen close to it | Every oxygen has exactly two close hydrogens. Edge hydrogens are given. |

### Physics

| Family | Levels | The move | Solved when |
|---|---|---|---|
| **Bulb boards** (circuits) | 14 | Tap a gap between two posts to lay a wire; tap a switch to flip it | Every bulb glows like its badge (bright, dim, faint or dark) within the wire budget. Brightness is the real power through identical bulbs, solved exactly. Includes a balanced bridge and the two-way hallway switch. |
| **Laser bench** (light and colour) | 14 | Place mirrors and splitters from the tray; tap to flip or take back | Every target is lit with its colour. Beams that meet add (red + green = yellow, all three = white). |
| **Balance beams** (levers and mobiles) | 14 | Hang the tray's weights on hooks | Every beam balances: weight × distance is equal on both sides. Hard levels are mobiles with uneven arms and a loose string. |
| **Gear trains** | 12 | Place gears from the tray on pegs | Each output turns the right way at the right speed. A ring of three meshing gears jams. |
| **Overhang** (block stacking) | 14 | Slide a block left or right; the blocks above ride along | The stack reaches the flag without tipping. Some levels star a block that must get there, using the blocks above as counterweights. |

Every family has Undo, Restart and a Hint. Solved levels are remembered in the browser. **Grown-ups** (bottom of the home screen) has, per family, the chemistry, the mathematics, a teaching caution and a kitchen-table activity (for physics, the science in place of the chemistry).

## Checks

```sh
npm test
```

`npm test` checks the content, not just the code: every Valence bridges board has exactly the structures it claims (one each, two for benzene and pyridine, and the Kekulé counts 3, 4, 5 and 6 for naphthalene, anthracene, phenanthrene and pyrene) and the atoms its formula says, and following hints from an empty board reaches a solution. Each isomer bag's named list matches a full enumeration and every molecule fits on its board. Every ion target is its formula unit, and its name starts with the compound's name (cation, then anion, with iron(II)/iron(III) and copper(I)/copper(II)). Each reaction's smallest balance is the textbook equation, every molecule picture has its formula's atoms and each atom its bond count, and the pile limits are right. Every ice board has exactly one solution, and the 3×3 domain-wall count is 7.

The physics suites do the same. Every bulb board's wire budget is the fewest that work and its answer is the only one, and the powers it claims (the bridge's dark middle, ¼ in series, 4/9 and 1/9) are computed exactly. Every laser tray is tight and its answers match an exhaustive solver. Balance-beam answers are counted by a solver and an independent brute force. Gear levels' witnesses, solution counts and decoys (wrong way, wrong speed, jam) match an exhaustive search. Overhang's maximum reaches for 2 to 6 blocks are confirmed, and every stored solution is the shortest. In every physics family, following hints from a wrong start reaches a solution.

`scripts/dom-smoke.mjs` plays all 190 levels through the real interface in jsdom, tapping what a child would tap. It also checks undo, hints, refused duplicates, "fewer" nudges, the home and Grown-ups pages, and How to play. jsdom isn't a dependency:

```sh
npm install --no-save jsdom
node scripts/dom-smoke.mjs
```

Square ice boards are generated by `node scripts/make-ice.mjs`, which is seeded and rewrites `dist/data/ice-levels.js`. `scripts/make-beams.mjs` and `scripts/make-overhang.mjs` re-solve their families' levels and rewrite the stored answers. Each physics family's play-through lives in `scripts/smoke/<family>.mjs`.

## Files

| Path | What |
|---|---|
| `dist/chem/` | The chemistry and its checkers, with no DOM: bonds and the bridges solver, isomer canonical forms and enumeration, ions and formulas, reactions and balancing, the ice rules and solver |
| `dist/phys/` | The physics and its solvers, with no DOM: exact circuit solving, beam tracing and colour mixing, turning sums, gear meshing and speeds, stack stability |
| `dist/data/` | Levels for each family |
| `dist/families/` | One board per family; `index.js` lists them |
| `dist/styles/` | Each physics family's look |
| `dist/main.js`, `dist/ui.js`, `dist/style.css` | Home, play screen, Grown-ups, shared drawing helpers, the look |
| `dist/notes.js` | Grown-up notes |
| `tests/` | `node --test` suites |
