# Chemistry puzzles for an app: research and a shortlist

A first pass, November 3, 2026, for James. The reader is Jay: eight, already knows the periodic table, protons, neutrons and electrons, and a little about acids and bases. The question is which chemistry ideas make good *puzzles* on a screen, in the house style of [Math Studio](https://github.com/jamesrp/small-math-adventure): solve a well-defined instance of one puzzle type, by interacting with a real object, with almost no words on the board.

## The short answer

| Rank | Puzzle | Chemistry | The move | Fit for Jay now |
|---|---|---|---|---|
| 1 | **Valence bridges** (recommended first) | Lewis structures, single/double/triple bonds, lone pairs | Draw 1 to 3 bonds between atoms until every atom has its full count | Strong |
| 2 | **Isomer hunt** | Same formula, different molecule; constitutional isomers | Build molecules from a fixed bag of atoms; the app merges duplicates; say when you have them all | Strong, once 1 lands |
| 3 | **Charge jigsaw** | Ions, ionic compounds, formulas like CaCl₂ and Al₂O₃ | Snap + and − ion tiles into a neutral cluster | Strong |
| 4 | **Atom recycling** | Conservation of atoms, balancing equations, limiting reagent | Pull reactant molecules apart and rebuild them as products, leaving no atom over | Good, after 1 |
| 5 | **Square ice** (wild card) | Hydrogen bonds, the ice rules | Tap each hydrogen to sit near one oxygen or the other until every oxygen has exactly two | Good as a pure puzzle; the chemistry is a grown-up note |

**Build Valence bridges first.** It is the concept James named first, it has the cleanest rules and win condition of anything here, it accepts many right answers (which is itself chemistry: resonance and isomers), and puzzles 2 and 4 reuse its board and validator. It is also close to Math Studio's shared graph board, which already draws double bridges for Bridge Courier's Islands group.

Electron orbitals, which James also suggested, rank lower as a *puzzle*: filling them follows a procedure with no real choices once the rules are known. A better use of them is below (an "electron hotel" whose payoff is that the shape of the periodic table falls out).

## What exists, and what to learn from it

| Thing | What you do | What works | What's weak |
|---|---|---|---|
| [PhET](https://phet.colorado.edu/en/simulations/filter?subjects=chemistry) sims: Build a Molecule, Balancing Chemical Equations, Molecule Shapes, Build an Atom, Acid-Base Solutions | Drag atoms and electrons; the balancing and atom sims have short game modes | Accurate, free, well researched; balancing uses visible atom counters on a scale | Simulations first, games second; levels are thin and repeat; lots of labels |
| [SpaceChem](https://store.steampowered.com/app/92800) and [Opus Magnum](https://store.steampowered.com/app/558990) (Zachtronics) | Program machines that bond and unbond atoms to turn inputs into products | The best proof that bonding rules (H makes 1 bond, O 2, N 3, C 4) make deep puzzles | Programming puzzles for adults; the chemistry is a skin |
| Atomix (1990; [GNOME remake](https://flathub.org/apps/org.gnome.atomix)) | Slide atoms on a grid until they form the pictured molecule | Simple, physical, satisfying | The chemistry is only the picture; any shapes would do |
| [Covalence](https://www.boardgamequest.com/covalence-review/) (Genius Games) | Cooperative deduction: build a hidden C, H, N, O molecule from clues ("two carbons") | Real valence rules on the tiles; a good clue-and-build loop | Repetitive for builders; hardest levels need strong deducers |
| [Ion](https://geniusgames.org/pages/science-games) (Genius Games) | Card drafting: collect ion sets whose charges cancel | Neutral formulas as a set-collection goal | A card game; the puzzle is shallow |
| [Happy Atoms](https://a2zscience.com/products/happy-atoms-2d-interactive-chemistry-puzzles) (Thames & Kosmos) | Snap physical atoms together, scan them with the app to identify the molecule | Hands-on first; holes on each atom show its valence | The app is an encyclopedia, not a puzzle |
| Chemtrix ([App Store](https://apps.apple.com/us/app/id1439593064)) | Arcade molecule building, with a falling-atoms mode | Real bonding rules | Arcade pressure instead of thinking |
| Chemical Valence ([Albion College](https://campustechnology.com/articles/2014/07/30/albion-college-app-teaches-chemistry-bonding.aspx)) | Move valence electrons into bonds or lone pairs; 2D turns into 3D | The closest thing to a Lewis-structure puzzle | Five levels for a college course, with reflection questions |
| [ChemisTree](https://udspace.udel.edu/handle/19716/34251) (J. Chem. Educ. 2024) | Build orbital diagrams with LEGO tiles under Aufbau, Pauli and Hund | Hands-on; a measured gain (51% to 63% on a post-test) | Classroom activity for high school; procedural |
| [Minecraft Education chemistry](https://screenwiseapp.com/guides/best-chemistry-games-for-kids) | Element constructor from p/n/e; compound creator from recipes | Kids already like it; Build-an-atom is genuinely good | Compounds are recipes to look up, not structures to work out |
| Toca Lab: Elements, Little Alchemy 2 | Play with element characters; combine "fire + water" | Charming, no text, no fail state | [Not chemistry](https://www.engadget.com/2014-01-07-toca-lab-offers-completely-unscientific-unrealistic-fun.html); Little Alchemy teaches wrong ideas about elements |

**Lessons for us.**

1. The best chemistry puzzles use valence as a hard constraint on a graph (SpaceChem, Covalence, Happy Atoms' holes). That is the object to build around.
2. Kid apps either drop real chemistry (Toca, Little Alchemy) or become textbooks with games bolted on (ChemCaper, most "learn chemistry" apps). Nothing we found sits where Math Studio sits: a real object, a real rule, many short puzzles with a ramp.
3. Recipe-style crafting (Minecraft compounds, Little Alchemy) teaches lookup, not reasoning. Avoid it.
4. PhET's balancing game shows that visible atom counts make conservation obvious; its weakness is that you press +/− on coefficients instead of handling atoms. Atom recycling fixes that.

## One teaching caution: the octet rule

Chemistry-education research is fairly consistent that the octet rule, taught as an *explanation* ("atoms want a full shell"), becomes a sticky misconception. [Taber's work on "octet thinking"](https://science-education-research.com/?p=31247) describes learners who treat ionic bonds as electron transfer events and covalent bonds as "sharing" with no force behind them. A Finnish follow-up ([Joki and Aksela, summarized by the RSC](https://edu.rsc.org/education-research/avoiding-bonding-misconceptions/3009377.article)) found students' understanding of bonding *regressed* after teachers leaned on the octet rule.

What this means for the app:

- On the board, a bond count is just a rule of the puzzle ("hydrogen makes one bond"), the way a tile shape is in Tile Garden. No "atoms want" language anywhere, which the no-narration copy rules already forbid.
- In grown-up notes, explain bonding electrostatically: nuclei attract shared electrons; ions attract each other in a lattice. Call the octet rule what it is, a reliable rule of thumb for C, N, O and F with known exceptions.
- Put an honest exception in the Hard tier at some point (O₂ is drawn with a double bond but is really magnetic, with two unpaired electrons; boron in BF₃ stops at six). Jay will enjoy the rule breaking once he owns the rule.

## The ideas, one by one

Fit uses Math Studio's scale. **A**: an obvious tap-or-drag solve with checkable answers. **B**: a new mechanic, but the solve is clear and checkable. **C**: the substance lives off-screen (lab work, discussion). **Size** is a rough build guess, S/M/L.

### 1. Valence bridges (Lewis structures, covalent bonds). Fit A, size M

**The object.** A molecule as a multigraph: atoms are vertices, bonds are edges of multiplicity 1, 2 or 3, and each element fixes the vertex's degree (H 1, O 2, N 3, C 4; later halogens 1, S 2). A Lewis structure is exactly an assignment of bond multiplicities that meets every degree. It is the logic puzzle [Hashiwokakero](https://en.wikipedia.org/wiki/Hashiwokakero) ("Bridges") with chemistry's numbers and up to three bridges.

**The move.** Atoms sit at fixed places. Tap the gap between two neighbours to cycle 0, 1, 2, 3 bonds. Each atom shows its outer electrons as dots around it; a bond uses one dot from each end, so dots visibly pair off and leftover pairs become lone pairs.

**Win.** Every atom's count is met and the molecule is one connected piece. Accept every valid structure.

**Ramp.**

- *Easy:* single bonds only, positions given: H₂O, NH₃, CH₄, HCl, H₂O₂.
- *Medium:* double and triple bonds where a choice matters: O₂, N₂, CO₂ (O=C=O, not O≡C–O), HCN, ethene, ethyne, formaldehyde.
- *Hard:* rings and longer chains where a wrong early bond strands an atom: benzene (two answers, the two Kekulé structures; finding the second is the lesson in resonance), cyclohexane, acetic acid, glycine, caffeine's ring skeleton.
- *Later group:* lone pairs made explicit, then ions with a charged atom (NH₄⁺, OH⁻, CO₃²⁻), which brings in formal charge.

**Hint.** Point at the atom whose count can only be met one way (a hydrogen with one neighbour, a carbon whose other neighbours are full), which is the Hashi solving technique.

**Why it's good.** Real decisions, a local-to-global solve, a clean validator (degrees plus connectivity), and a single concept that carries into isomers, reactions and shapes. A chemist recognizes it as the real thing, and a mathematician recognizes degree-constrained multigraphs.

**Hands-on.** Marshmallows or gumdrops and toothpicks, with a rule card: hydrogen gets one toothpick, oxygen two, nitrogen three, carbon four, and a double bond is two toothpicks. A molecular model kit (Molymod or similar) has the holes built in. Build the screen's molecule, then try to build "CH₅" and find out why it can't be done.

### 2. Isomer hunt (same atoms, different molecules). Fit B, size M

**The object.** All connected degree-respecting multigraphs on a fixed multiset of atoms, up to isomorphism. For the alkanes CₙH₂ₙ₊₂ these are trees with maximum degree 4, which Cayley counted in 1875; Pólya's enumeration theorem grew from this question. [Counts](https://en.wikipedia.org/wiki/Alkane#Isomerism): C₄H₁₀ 2, C₅H₁₂ 3, C₆H₁₄ 5, C₇H₁₆ 9, C₈H₁₈ 18.

**The move.** A bag of atoms. Drag them onto the board and draw bonds as in Valence bridges, with free placement. Press keep; the molecule goes into a collection. If it is the same as one already kept (same graph, drawn bent or flipped), the two flash together and the new one is refused.

**Win.** The player says "that's all" and the app checks. Following the house rule for "find every one" puzzles, do not show a slot per answer, because knowing you have them all is the mathematics.

**Ramp.** C₂H₆O (ethanol and dimethyl ether, two very different substances: a drink and a gas), C₃H₆ (propene and a ring), C₄H₁₀, C₅H₁₂, C₃H₈O (3), C₆H₁₄ (5). Stereoisomers (cis/trans, mirror images) are a later group; Math Studio's Tetra family already makes the mirror-image point with tetrahedra.

**Why it's good.** The deep lesson, that a drawing is not the molecule and bending a chain doesn't make a new one, is learned by having the app refuse a duplicate. Canonical labelling for small trees and graphs is easy to implement exactly.

**Hands-on.** The same toothpick kit: build pentane, then try to make "another" by bending it; then find the two real others.

### 3. Charge jigsaw (ions and ionic compounds). Fit A, size S to M

**The object.** Ions as integers: Na⁺ is +1, Ca²⁺ +2, Al³⁺ +3, Cl⁻ −1, O²⁻ −2, N³⁻ −3, then polyatomic ions (OH⁻, SO₄²⁻, NH₄⁺, PO₄³⁻). A neutral formula is the smallest positive integer combination that sums to zero, so Al₂O₃ is lcm(3, 2) = 6 split both ways.

**The move.** Ion tiles whose charge is drawn as tabs (+) and slots (−), the old "criss-cross" teaching shapes. Drag tiles into a tray; tabs and slots click together. A cluster with no open tab or slot is neutral.

**Win.** Build the target compound with the fewest ions (its formula unit), or, in a second group, build every neutral compound possible from a given tray of ion types.

**Ramp.** NaCl, MgO, CaCl₂, Na₂O, Al₂O₃, Ca₃N₂, then polyatomics (Ca(OH)₂, (NH₄)₂SO₄, Ca₃(PO₄)₂). A Hard group lays ions on a grid so that every + touches only −, which builds the NaCl checkerboard and hints at crystal lattices.

**Ionic vs covalent.** The app can't show the difference well; a kitchen experiment can. That is the companion, and it settles the question in a way Jay will remember.

**Hands-on.** A conductivity tester: a 9 V battery, an LED and two wires dipped in water. Salt water lights it; sugar water and pure water don't. Salt is made of ions; sugar is a covalent molecule. Then grow salt crystals on a string and look at the cubes under a magnifier.

### 4. Atom recycling (balancing equations). Fit B, size M

**The object.** A reaction conserves atoms. Balancing finds the smallest positive integers in the kernel of the reaction's element-by-species matrix. Usually the kernel is one line; sometimes it is a plane (H₂ + O₂ → H₂O + H₂O₂ has many balanced versions), a nice Hard surprise.

**The move.** Reactant molecules on the left, outlines of the product molecules on the right. Add another copy of any molecule, then break bonds and drag atoms across to fill product outlines. Atoms are never created or destroyed; a counter per element shows what's left on the bench.

**Win.** Every atom is in a product and every product is complete. That is a balanced equation, read off at the end: 2H₂ + O₂ → 2H₂O.

**Ramp.** H₂ + Cl₂ → HCl; H₂ + O₂ → H₂O; N₂ + H₂ → NH₃; methane burning; photosynthesis (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂). A limiting-reagent group gives a fixed pile of molecules and asks for as many water molecules as possible, which is stoichiometry as a puzzle.

**Why after 1.** It reuses the bond board and makes "a reaction is breaking and making bonds" literal. A fewest-bonds-broken star (where a count exists, like Plume's scores) adds an optimization and points at reaction energy in the grown-up notes.

**Hands-on.** LEGO bricks in atom colours: build two H₂ and one O₂, take them apart, rebuild as water, check nothing is left. Then baking soda and vinegar in a bag that puffs up, to make "the atoms go somewhere" concrete.

### 5. Square ice (hydrogen bonds). Fit A, size S

**The object.** In ice, each oxygen has two hydrogens close and two far (the Bernal–Fowler ice rules). On a square grid, with a hydrogen on every edge sitting near one end or the other, the rule "every oxygen has exactly two near hydrogens" is the six-vertex model. Pauling estimated ice's leftover entropy from it in 1935, Lieb solved the square case exactly in 1967 (W = (4/3)^(3/2)), and with domain-wall boundaries its states correspond to alternating-sign matrices, which Kuperberg used to count ASMs (1, 2, 7, 42, 429, …). A 2015 *Nature* paper [reported square ice between graphene sheets](https://www.nature.com/articles/nature14295), though the authors later said they could not reproduce it and suspected salt contamination, so a grown-up note should call it disputed.

**The move.** Tap a hydrogen to slide it toward the other oxygen.

**Win.** Every oxygen has two near hydrogens. Boundary hydrogens are fixed, which makes each board a real puzzle with forced moves; a Hard group asks for a second, different solution.

**Why it's here.** It is a pure tap puzzle of the kind Jay already likes, and the mathematics is the best of anything on this list. The chemistry (hydrogen bonds, why ice floats) mostly lives in the grown-up note and the hands-on, so it's a wild card rather than a core lesson. Claims need care: the square model is a model, not real ice, which is three-dimensional.

**Hands-on.** Freeze water in a full, capped plastic bottle (it bulges or splits); float an ice cube in water and in cooking oil.

### Also considered

| Idea | Chemistry | Puzzle version | Fit | Why not top 5 (yet) |
|---|---|---|---|---|
| **Decay paths** | Isotopes, α and β decay | Move a nucleus on the chart of nuclides (protons up, neutrons across) with α (−2, −2), β⁻ (+1, −1), β⁺ (−1, +1) until it is stable; fewest steps. U-238 to Pb-206 is 8 α and 6 β. | B, M | Strong, and it builds on what Jay already knows about protons and neutrons, but it's nuclear physics more than chemistry. A good sixth. Companion: coin-flip half-life. |
| **Electron hotel** (orbitals) | Shells, subshells, Aufbau, Pauli, Hund | Fill electrons into boxes; the payoff group stacks the boxes and the periodic table's shape (2, 8, 8, 18, 18, 32) appears | B, M | Once the rules are known there is no choice to make, so it's a procedure, not a puzzle. Worth it as a short exploration that explains the table Jay knows. Cr and Cu exceptions belong in grown-up notes. |
| **Shape spreader** (VSEPR) | Molecular shape | Drag 2 to 6 electron groups on a sphere until they are as far apart as possible (a tiny Thomson problem); then name the molecule's shape | B, L | Needs a good 3D control on an iPad. Companion is excellent: balloons tied together snap into linear, triangle, tetrahedron. |
| **Covalence-style deduction** | Molecule structure | A hidden molecule; ask for clues ("has a double bond", "two carbons"), build a guess, get feedback | B, M | Fun as a later mode on the Valence bridges board; needs the board first. |
| **Proton relay** (acids and bases) | Brønsted acids give H⁺, bases take it; neutralization | Pass H⁺ tokens between molecules until everything is neutral, or mix acid and base cups to hit neutral (a water-jug cousin) | B, M | The puzzle is thin unless it turns into the jug puzzle. The hands-on is the real lesson: red cabbage indicator, then neutralize vinegar drop by drop with baking soda water and watch the colour turn. |
| **Polarity tug** | Electronegativity, partial charges | Predict which end is δ− | C | A prediction, which children have liked least in Math Studio. Better as an explanation inside Valence bridges' Hard notes. |
| **Oxidation states** | Electron bookkeeping | Assign numbers so they sum to the charge | B | Rote at Jay's level; leave for later. |
| **Reaction prediction** | What happens when A meets B | Choose the products | C | Needs memorized chemistry, not reasoning. Skip. |

## How this maps onto Math Studio's way of working

- **Engine reuse.** Valence bridges, Isomer hunt and Atom recycling share one board: atoms as nodes, bonds as edges with multiplicity. Math Studio's `dist/graph-board.js` already draws curved parallel edges (Islands' double bridges), so the chem app could start from a copy of it, or the two apps could share it.
- **Each puzzle family, Math Studio style:** a spec, 8 to 12 instances over Easy, Medium and Hard with a solution witness, a first hint and the intended insight, an independent validator, and a few-second How to play demo on a board that isn't a puzzle.
- **Copy.** Element letters and dots on the board; no puzzle names, no "Build water!" objectives when the outline already shows the target. Formula and molecule name appear at the solve, because naming what you built is information the child doesn't have yet.
- **Data.** Real molecules from public sources (PubChem names and formulas) so every target is a real substance. Validators check structures by graph rules, not by lookup.

## Recommended first prototype: Valence bridges

A small slice, enough to put in front of Jay:

1. Twelve puzzles: four Easy (H₂O, NH₃, CH₄, H₂O₂), four Medium (O₂, CO₂, HCN, ethene), four Hard (benzene with both answers, acetic acid, a longer chain with one forced triple bond, glycine).
2. The tap-to-cycle bond move, dots that pair off, and a check that every atom's count is met and the molecule is connected.
3. A validator that enumerates all valid bond assignments per puzzle (small boards make this exhaustive), so "accept every valid solution" is checked, and Hard puzzles really have the intended forced moves.
4. The toothpick-and-marshmallow companion, with a one-page rule card for the kitchen table.

**What to watch for when Jay plays it:** whether the dots help or clutter (they could be a toggle); whether Easy is too easy (likely, given the Tile Garden lesson, so be ready to start at Medium); and whether he wants to free-build, which would argue for doing Isomer hunt next.

## Open questions for James

- Should the chem app live as its own app, or as a region inside Math Studio's library? The doc assumes its own app that copies Math Studio's look and family seam.
- Is a story layer wanted (like the Lantern Road), or puzzles only to start? Puzzles only is assumed.
- How far toward high-school chemistry should the Hard tiers go? Formal charge and resonance are reachable for a strong eight-year-old through the puzzle alone; orbitals as wave functions are not.

## Sources

- PhET chemistry simulations: https://phet.colorado.edu/en/simulations/filter?subjects=chemistry
- Zachtronics, SpaceChem and Opus Magnum on Steam: https://store.steampowered.com/app/92800 , https://store.steampowered.com/app/558990
- Atomix (GNOME): https://flathub.org/apps/org.gnome.atomix
- Covalence review, Board Game Quest: https://www.boardgamequest.com/covalence-review/
- Genius Games science games (Ion, Covalence): https://geniusgames.org/pages/science-games
- Happy Atoms 2D: https://a2zscience.com/products/happy-atoms-2d-interactive-chemistry-puzzles
- Chemtrix: https://apps.apple.com/us/app/id1439593064
- Chemical Valence, Campus Technology (2014): https://campustechnology.com/articles/2014/07/30/albion-college-app-teaches-chemistry-bonding.aspx
- ChemisTree, J. Chem. Educ. (2024), University of Delaware record: https://udspace.udel.edu/handle/19716/34251
- Best chemistry games for kids (Minecraft Education, Toca Lab, Little Alchemy, Elements, ChemCaper): https://screenwiseapp.com/guides/best-chemistry-games-for-kids
- Engadget on Toca Lab: https://www.engadget.com/2014-01-07-toca-lab-offers-completely-unscientific-unrealistic-fun.html
- K. S. Taber, learners' "octet thinking": https://science-education-research.com/?p=31247
- Joki and Aksela on bonding regression after the octet rule (RSC Education summary): https://edu.rsc.org/education-research/avoiding-bonding-misconceptions/3009377.article
- Hashiwokakero: https://en.wikipedia.org/wiki/Hashiwokakero
- Alkane isomer counts: https://en.wikipedia.org/wiki/Alkane#Isomerism
- Square ice in graphene nanocapillaries, Nature (2015), with the later reproducibility caveat: https://www.nature.com/articles/nature14295

Facts stated from standard references rather than a page read for this doc: Cayley's and Pólya's role in counting isomers, the six-vertex model's history (Pauling 1935, Lieb 1967, Kuperberg's ASM proof), the U-238 decay chain counts, the VSEPR shapes, and the list of PhET simulation names (the PhET filter page renders in a browser, so it wasn't read here). They should be checked against a source before they go into grown-up notes.
