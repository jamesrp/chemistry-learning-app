// Mystery molecule board: the formula's atoms in a bag, a lattice to build
// on (as in Isomer hunt), and the mystery molecule's clue cards. Build a
// whole molecule and its own cards appear under the mystery's; a card turns
// green when the two read the same. When every card matches, the molecule is
// named. Whole molecules that don't match go on a shelf, with their names.
import {MYSTERY_LEVELS, MYSTERY_NAMES} from '../data/mystery-levels.js';
import {ISOMER_LEVELS} from '../data/isomer-levels.js';
import {checkBuild, canonical, hydrogensOn, parseMol} from '../chem/isomers.js';
import {carbonPeaks, protonSignals, irBands, cardKey, IR_BANDS, IR_LABEL} from '../chem/spectra.js';
import {triLattice} from '../chem/lattice.js';
import {bondsOf, sub} from '../chem/elements.js';
import {h, s, tappable, History, viewBoxAround, bondLines, atomGlyph, f, flash} from '../ui.js';

const R = 8.6, STEP = 30;
const NAMES = new Map();
for (const lv of ISOMER_LEVELS) for (const [name, t] of lv.known) NAMES.set(canonical(parseMol(t)), name);
for (const [name, t] of MYSTERY_NAMES) NAMES.set(canonical(parseMol(t)), name);
for (const lv of MYSTERY_LEVELS) NAMES.set(canonical(parseMol(lv.target[1])), lv.target[0]);
export const nameOf = mol => NAMES.get(canonical(mol)) || '';

const CARD_TITLE = {ir: 'Infrared', c: 'Carbon-13', h: 'Proton'};
// What one mark on each card means, under its title.
const CARD_SUB = {ir: 'a dip for each kind of bond', c: 'a line for each kind of carbon', h: 'a signal for each kind of hydrogen'};

export const mystery = {
  id: 'mystery',
  name: 'Mystery molecule',
  levels: MYSTERY_LEVELS,
  howTo: [
    'Somewhere in the bag is one mystery molecule. The cards are its clues, read the way a chemist reads a real sample.',
    'Build a molecule from every atom in the bag, as in Isomer hunt. Its own cards appear under the mystery’s. A card turns green when they match.',
    'Infrared: each dip is a kind of bond (O–H, N–H, C≡, C=O, C=C). No dip means the molecule has none of that bond.',
    'Carbon-13: one line for each kind of carbon. Its zone says what that carbon is bonded to: a double bond (C=O, C=C), an O, N or Cl, or only carbons and hydrogens. Carbons that a flip or turn of the molecule swaps are the same kind and share a line, so count the lines in each zone. Where a line sits inside its zone doesn’t matter.',
    'Proton: one signal for each kind of hydrogen, with how many H it stands for. A signal split into n + 1 lines sits next to n hydrogens on the neighbouring carbons.',
  ],
  notes: {
    chemistry: 'Chemists rarely see a molecule. They work it out from how it answers light and magnets. In infrared light each kind of bond vibrates at its own pitch, so an O–H, a C=O or a C=C shows as a dip in the spectrum. In a strong magnet, carbon-13 nuclei and hydrogen nuclei ring at frequencies that depend on their neighbours: one peak for each kind of carbon, one signal for each kind of hydrogen. A hydrogen signal is split by the hydrogens on the next carbon over: n neighbours give n + 1 lines, with heights from Pascal’s triangle. So ethyl acetate’s CH₂ next to its CH₃ is a quartet, and the CH₃ a triplet. Methyl propanoate has the same atoms and the same carbon peaks, and only the proton card tells the two apart.',
    maths: 'Two carbons are the same kind when an automorphism of the molecule’s graph carries one to the other, so the carbon-13 card counts orbits of the automorphism group on the carbons: neopentane has 5 carbons in 2 orbits. The app finds the orbits exactly by searching for every automorphism. The n + 1 lines come from each neighbouring hydrogen spin being up or down: with n of them, the number pointing up is 0 to n, and the line heights are the binomial coefficients. Every level is checked against a full enumeration of the bag: exactly one molecule shows its cards (the C₄H₈O₂ bag makes 122 molecules).',
    caution: 'These are textbook spectra, simplified. Peaks sit in zones, not at exact positions. Real signals overlap, big multiplets look like smudges, an O–H usually shows as one broad line that doesn’t split its neighbours (that is the rule used here), and hydrogens next to a C=O are counted as plain. Carbon-13 peaks are drawn the same height, which real ones are not.',
    kitchen: 'A rainbow from a CD or a glass of water shows white light split into colours; a spectrum is the same idea for light we can’t see. With a toothpick model, count the kinds of carbon in neopentane by turning it in your hand: which carbons can trade places?',
  },
  mount,
};

function mount(host, level, ctx) {
  const nHeavy = Object.values(level.heavy).reduce((a, b) => a + b, 0);
  const lattice = triLattice(nHeavy > 5 ? 5 : 4, 4, STEP);
  const P = lattice.points, elements = Object.keys(level.heavy);
  const target = parseMol(level.target[1]);
  const blank = () => ({at: P.map(() => null), bonds: lattice.edges.map(() => 0), pick: elements[0]});
  const history = new History({...blank(), tried: []});
  let done = false, hints = 0;

  const cardsBox = h('div', {class: 'spec-cards'});
  const tray = h('div', {class: 'tray'});
  const vb = viewBoxAround(P.map(p => [p.x, p.y]), {pad: 14});
  const svg = s('svg', {class: 'board-svg isomers mystery-board', viewBox: vb.box, 'aria-label': 'Building board'});
  const clear = h('button', {class: 'secondary', type: 'button', onclick: doClear}, 'Clear board');
  const shelf = h('div', {class: 'shelf tried'});
  host.append(cardsBox, tray, svg, h('div', {class: 'actions'}, clear), shelf);

  function molOf(state) {
    const idx = [], map = new Map();
    state.at.forEach((el, i) => { if (el) { map.set(i, idx.length); idx.push(i); } });
    const bonds = [];
    lattice.edges.forEach(([a, b], i) => { if (state.bonds[i] && map.has(a) && map.has(b)) bonds.push([map.get(a), map.get(b), state.bonds[i]]); });
    return {mol: {els: idx.map(i => state.at[i]), bonds}, idx};
  }
  const left = state => Object.fromEntries(elements.map(el => [el, level.heavy[el] - state.at.filter(x => x === el).length]));

  function render() {
    const st = history.state, {mol, idx} = molOf(st), hs = hydrogensOn(mol), build = checkBuild(mol, level), rest = left(st);
    const whole = build.ok;
    // Clue cards: the mystery's, and under it the build's when it is whole.
    cardsBox.replaceChildren(...level.cards.map(card => {
      const match = whole && cardKey(mol, card) === cardKey(target, card);
      return h('div', {class: `spec-card ${whole ? (match ? 'match' : 'miss') : ''}`, 'data-card': card},
        h('div', {class: 'spec-title'}, CARD_TITLE[card], h('span', {class: 'spec-sub'}, CARD_SUB[card])),
        h('div', {class: 'spec-row'}, h('span', {class: 'spec-who'}, '?'), drawCard(card, target)),
        h('div', {class: 'spec-row yours'}, h('span', {class: 'spec-who'}, 'you'), whole ? drawCard(card, mol) : drawCard(card, null)));
    }));
    tray.replaceChildren(...elements.map(el => h('button', {
      type: 'button', class: `chip el-chip el-${el}`, 'aria-pressed': String(st.pick === el), 'aria-label': `${el}, ${rest[el]} left`,
      onclick: () => { if (!done) { history.push({...history.state, pick: el}); render(); } },
    }, h('span', {class: 'chip-el'}, el), h('span', {class: 'chip-n'}, `×${rest[el]}`))),
    h('span', {class: `chip h-chip ${mol.els.length && build.hydrogens === level.H ? 'match' : ''}`, 'aria-label': `Hydrogens: ${mol.els.length ? build.hydrogens : 0} of ${level.H}`},
      h('span', {class: 'chip-el'}, 'H'), h('span', {class: 'chip-n'}, sub(level.H)), mol.els.length ? h('span', {class: 'h-now'}, String(build.hydrogens)) : null));

    svg.replaceChildren();
    lattice.edges.forEach(([a, b], i) => {
      if (!st.at[a] || !st.at[b]) return;
      const pa = [P[a].x, P[a].y], pb = [P[b].x, P[b].y], o = st.bonds[i];
      const g = s('g', {class: 'edge'});
      if (!o) g.append(s('line', {class: 'slot', x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1]}));
      g.append(...bondLines(pa, pb, o, {pull: R + 0.5, gap: 2.8}));
      g.append(tappable(s('line', {class: 'hit', 'data-e': i, x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1]}), `Bond ${st.at[a]} to ${st.at[b]}`, () => tapBond(i)));
      svg.append(g);
    });
    P.forEach((p, i) => {
      if (st.at[i]) {
        const k = idx.indexOf(i), hn = hs[k];
        const g = atomGlyph(st.at[i], p.x, p.y, {r: R, hydrogens: Math.max(0, hn), cls: hn < 0 ? 'over' : ''});
        g.setAttribute('data-i', i);
        svg.append(tappable(g, `${st.at[i]} atom; tap to take back`, () => tapPlace(i)));
      } else {
        const g = s('g', {class: 'place', 'data-i': i, transform: `translate(${f(p.x)} ${f(p.y)})`});
        g.append(s('circle', {class: 'place-hit', r: R + 1}), s('circle', {class: 'place-dot', r: 1.8}));
        svg.append(tappable(g, 'Empty place', () => tapPlace(i)));
      }
    });
    shelf.replaceChildren(...st.tried.map(t => h('div', {class: 'shelf-item'}, miniOf(t.draw, t.bonds, t.hs), h('div', {class: 'shelf-name'}, t.name || 'no common name'))));
    ctx.changed({canUndo: history.canUndo && !done});
  }

  // After each change: a whole molecule either is the mystery or goes on the shelf.
  function settle(st) {
    const {mol, idx} = molOf(st);
    if (!checkBuild(mol, level).ok) { ctx.feedback(null); return st; }
    const key = canonical(mol), name = nameOf(mol);
    if (level.cards.every(c => cardKey(mol, c) === cardKey(target, c))) {
      done = true;
      return st;
    }
    const miss = level.cards.filter(c => cardKey(mol, c) !== cardKey(target, c)).map(c => CARD_TITLE[c].toLowerCase());
    ctx.feedback(`${name ? `That’s ${name}.` : 'That molecule has no common name.'} Its ${miss.join(' and ')} card${miss.length > 1 ? 's don’t' : ' doesn’t'} match.`);
    if (!st.tried.some(t => t.key === key)) st.tried = [...st.tried, {key, name, draw: idx.map(i => [st.at[i], P[i].x, P[i].y]), bonds: mol.bonds, hs: hydrogensOn(mol)}];
    return st;
  }

  function commit(st) {
    st = settle(st);
    history.push(st); render();
    if (done) ctx.solved({title: level.target[0], detail: level.formula});
  }

  function tapPlace(i) {
    if (done) return;
    const st = structuredClone(history.state), rest = left(st);
    if (st.at[i]) {
      st.at[i] = null;
      lattice.edges.forEach(([a, b], e) => { if (a === i || b === i) st.bonds[e] = 0; });
    } else {
      const el = rest[st.pick] > 0 ? st.pick : elements.find(x => rest[x] > 0);
      if (!el) { flash(tray); return; }
      st.at[i] = el;
      if (left(st)[el] === 0) st.pick = elements.find(x => left(st)[x] > 0) || st.pick;
    }
    commit(st);
  }
  function tapBond(i) {
    if (done) return;
    const st = structuredClone(history.state), [a, b] = lattice.edges[i];
    st.bonds[i] = (st.bonds[i] + 1) % (Math.min(3, bondsOf(st.at[a]), bondsOf(st.at[b])) + 1);
    commit(st);
  }
  function doClear() {
    if (done) return;
    const st = {...structuredClone(history.state), ...blank()};
    ctx.feedback(null);
    history.push(st); render();
  }

  function clueHint() {
    const card = level.cards[0];
    if (card === 'c') {
      const peaks = carbonPeaks(target), n = z => peaks.filter(p => p === z).length;
      const parts = [['co', 'in a C=O'], ['cc', 'in a C=C'], ['x', 'bonded to O, N or Cl'], ['plain', 'bonded only to C and H']].filter(([z]) => n(z)).map(([z, t]) => `${n(z)} ${t}`);
      const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
      return `The mystery has ${peaks.length} kind${peaks.length > 1 ? 's' : ''} of carbon: ${list}. Carbons that a flip or turn swaps count as one kind, so more symmetry means fewer lines.`;
    }
    if (card === 'ir') {
      const has = irBands(target), list = IR_BANDS.filter(b => has.includes(b)).map(b => IR_LABEL[b]);
      return list.length ? `The mystery has ${list.join(' and ')} and none of the other bonds on the card.` : 'The mystery has none of the bonds on the card: no O–H, N–H, C=O or C=C.';
    }
    const sig = protonSignals(target), big = sig.reduce((a, b) => (b.n > a.n ? b : a));
    return `The mystery has ${sig.length} kind${sig.length > 1 ? 's' : ''} of hydrogen. Its biggest signal is ${big.n} H with ${big.lines} line${big.lines > 1 ? 's' : ''}: ${big.lines - 1} hydrogen${big.lines === 2 ? '' : 's'} on the carbons next door.`;
  }

  render();
  return {
    undo() { if (done) return; history.undo(); ctx.feedback(null); render(); },
    restart() { done = false; hints = 0; history.restart(); ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      hints++;
      if (hints === 1) { ctx.feedback(clueHint()); return; }
      const hs = hydrogensOn(target);
      const parts = target.els.map((el, i) => el + (hs[i] ? 'H' + (hs[i] > 1 ? sub(hs[i]) : '') : ''));
      ctx.feedback(`Try one with ${target.bonds.map(([i, j, o]) => `${parts[i]}${['', '–', '=', '≡'][o]}${parts[j]}`).join(', ')}.`);
    },
  };
}

// --- Drawing the cards. Each is a strip 320 wide, high frequencies on the left
// as chemists draw them.
const W = 320, HT = 44;
const IR_X = {oh: 38, nh: 88, triple: 150, co: 214, cc: 262};
const C_ZONE = {co: [0, 60], cc: [60, 125], x: [125, 225], plain: [225, 320]};
const C_LABEL = {co: 'C=O', cc: 'C=C', x: 'bonded to O, N, Cl', plain: 'only C and H'};
const H_ZONE = {ald: [0, 44], cc: [44, 104], oh: [104, 146], x: [146, 208], plain: [208, 320]};
const H_LABEL = {ald: 'H–C=O', cc: 'C=C', oh: 'O–H N–H', x: 'near O, N, Cl', plain: 'only C and H'};

function drawCard(card, mol) {
  const svg = s('svg', {class: `spec spec-${card}`, viewBox: `0 0 ${W} ${HT}`, role: 'img', 'aria-label': mol ? describe(card, mol) : 'Not a whole molecule yet'});
  const base = HT - 12;
  if (card === 'ir') {
    const has = mol ? irBands(mol) : [];
    let d = `M0 6`;
    for (const b of IR_BANDS) {
      const x = IR_X[b];
      if (!has.includes(b)) continue;
      d += b === 'oh' ? ` L${x - 22} 6 C${x - 14} 32 ${x + 14} 32 ${x + 22} 6` : ` L${x - 6} 6 L${x} 30 L${x + 6} 6`;
    }
    d += ` L${W} 6`;
    if (mol) svg.append(s('path', {class: 'ir-trace', d}));
    for (const b of IR_BANDS) svg.append(s('text', {class: 'spec-label', x: IR_X[b], y: HT - 1}, IR_LABEL[b]));
    return svg;
  }
  const zones = card === 'c' ? C_ZONE : H_ZONE, labels = card === 'c' ? C_LABEL : H_LABEL;
  for (const [z, [a, b]] of Object.entries(zones)) {
    svg.append(s('rect', {class: 'spec-zone', x: a + 1, y: 2, width: b - a - 2, height: base - 2, rx: 3}));
    svg.append(s('text', {class: 'spec-label', x: (a + b) / 2, y: HT - 1}, labels[z]));
  }
  svg.append(s('line', {class: 'spec-base', x1: 0, y1: base, x2: W, y2: base}));
  if (!mol) return svg;
  if (card === 'c') {
    const peaks = carbonPeaks(mol);
    for (const [z, [a, b]] of Object.entries(zones)) {
      const here = peaks.filter(p => p === z);
      here.forEach((_, k) => { const x = a + (b - a) * (k + 1) / (here.length + 1); svg.append(s('line', {class: 'peak', x1: f(x), y1: base, x2: f(x), y2: 7})); });
    }
    return svg;
  }
  const sig = protonSignals(mol);
  for (const [z, [a, b]] of Object.entries(zones)) {
    const here = sig.filter(p => p.zone === z);
    here.forEach((p, k) => {
      const cx = a + (b - a) * (k + 1) / (here.length + 1);
      const room = (b - a) / (here.length + 1) - 6, gap = Math.min(3.2, room / Math.max(1, p.lines - 1));
      const row = pascal(p.lines - 1), top = Math.max(...row);
      if (z === 'oh') svg.append(s('path', {class: 'peak broad', d: `M${f(cx - 8)} ${base} Q${f(cx)} ${base - 34} ${f(cx + 8)} ${base}`}));
      else row.forEach((v, q) => { const x = cx + (q - (p.lines - 1) / 2) * gap; svg.append(s('line', {class: 'peak', x1: f(x), y1: base, x2: f(x), y2: f(base - 4 - 20 * v / top)})); });
      svg.append(s('text', {class: 'peak-n', x: f(cx), y: 8}, `${p.n}H`));
    });
  }
  return svg;
}
function pascal(n) { let row = [1]; for (let i = 0; i < n; i++) row = [1, ...row.slice(1).map((v, k) => v + row[k]), 1]; return n === 0 ? [1] : row; }

function describe(card, mol) {
  if (card === 'ir') { const b = irBands(mol); return b.length ? `Infrared bands: ${b.map(x => IR_LABEL[x]).join(', ')}` : 'No infrared bands on the card'; }
  if (card === 'c') { const p = carbonPeaks(mol); return `${p.length} carbon peaks: ${p.map(z => C_LABEL[z]).join(', ')}`; }
  return protonSignals(mol).map(p => `${p.n} H, ${p.lines} line${p.lines > 1 ? 's' : ''}, ${H_LABEL[p.zone]}`).join('; ');
}

function miniOf(draw, bonds, hs) {
  const vb = viewBoxAround(draw.map(([, x, y]) => [x, y]), {pad: R + 3, minW: 0, minH: 0});
  const svg = s('svg', {class: 'mini', viewBox: vb.box, role: 'img', 'aria-label': 'Tried molecule'});
  for (const [i, j, o] of bonds) svg.append(...bondLines([draw[i][1], draw[i][2]], [draw[j][1], draw[j][2]], o, {pull: R + 0.5, gap: 2.8}));
  draw.forEach(([el, x, y], i) => svg.append(atomGlyph(el, x, y, {r: R, hydrogens: Math.max(0, hs[i])})));
  return svg;
}
