// Isomer hunt board: a bag of atoms and a lattice of places. Put the heavy
// atoms on places, join neighbours with bonds, and each atom's spare bonds
// fill with hydrogens (shown as CH₃, OH). Keep each whole molecule; the
// shelf refuses one you already have, however it's drawn. Say when you
// have them all.
import {ISOMER_LEVELS} from '../data/isomer-levels.js';
import {checkBuild, canonical, hydrogensOn, parseMol} from '../chem/isomers.js';
import {triLattice} from '../chem/lattice.js';
import {bondsOf, sub} from '../chem/elements.js';
import {h, s, tappable, History, viewBoxAround, bondLines, atomGlyph, f, flash} from '../ui.js';

const R = 8.6, STEP = 30;

export const isomers = {
  id: 'isomers',
  name: 'Isomer hunt',
  levels: ISOMER_LEVELS,
  howTo: [
    'Use every atom in the bag. Tap a place to put an atom there; tap the atom to take it back.',
    'Tap between two atoms to bond them (again for a double bond). Spare bonds fill with hydrogens, shown as CH₃ or OH.',
    'When the hydrogens match the bag, tap Keep. A molecule you already have is refused, even bent or flipped.',
    'Tap That’s all when you think you have every one.',
  ],
  mount,
};

function mount(host, level, ctx) {
  const lattice = triLattice(level.heavy.C + (level.heavy.O || 0) + (level.heavy.N || 0) > 5 ? 5 : 4, 4, STEP);
  const P = lattice.points;
  const elements = Object.keys(level.heavy);
  const empty = () => ({at: P.map(() => null), bonds: lattice.edges.map(() => 0), kept: [], pick: elements[0]});
  const history = new History(empty());
  let done = false, total = null;

  const tray = h('div', {class: 'tray'});
  const vb = viewBoxAround(P.map(p => [p.x, p.y]), {pad: 14});
  const svg = s('svg', {class: 'board-svg isomers', viewBox: vb.box, 'aria-label': 'Building board'});
  const keep = h('button', {class: 'primary', type: 'button', onclick: doKeep}, 'Keep');
  const all = h('button', {class: 'secondary', type: 'button', onclick: doAll}, 'That’s all');
  const shelf = h('div', {class: 'shelf'});
  host.append(tray, svg, h('div', {class: 'actions'}, keep, all), shelf);

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
    // The bag: heavy atoms left to place, and the hydrogens to match.
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
    keep.disabled = done || !build.ok;
    all.disabled = done || !st.kept.length;
    shelf.replaceChildren(...st.kept.map(k => keptItem(k)));
    ctx.changed({canUndo: history.canUndo && !done});
  }

  function keptItem(k) {
    const item = h('div', {class: 'shelf-item'});
    item.append(miniOf(k.draw, k.bonds, k.hs));
    if (done) item.append(h('div', {class: 'shelf-name'}, nameOf(k.key)));
    return item;
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
    ctx.feedback(null);
    history.push(st); render();
  }
  function tapBond(i) {
    if (done) return;
    const st = structuredClone(history.state), [a, b] = lattice.edges[i];
    st.bonds[i] = (st.bonds[i] + 1) % (Math.min(3, bondsOf(st.at[a]), bondsOf(st.at[b])) + 1);
    ctx.feedback(null);
    history.push(st); render();
  }
  function doKeep() {
    const st = structuredClone(history.state), {mol, idx} = molOf(st);
    if (!checkBuild(mol, level).ok) return;
    const k = canonical(mol), dup = st.kept.findIndex(x => x.key === k);
    if (dup >= 0) { flash(shelf.children[dup]); ctx.feedback('You have that one. Bending or flipping it doesn’t make a new molecule.'); return; }
    st.kept.push({key: k, draw: idx.map(i => [st.at[i], P[i].x, P[i].y]), bonds: mol.bonds, hs: hydrogensOn(mol)});
    st.at = P.map(() => null); st.bonds = lattice.edges.map(() => 0); st.pick = elements[0];
    ctx.feedback(null);
    history.push(st); render();
  }
  function doAll() {
    // The named list is the full list: tests check it against enumerate().
    total ??= level.known.length;
    const n = history.state.kept.length;
    if (n < total) { ctx.feedback('There are more.'); return; }
    done = true; render();
    ctx.solved({title: level.formula, detail: `${total} molecules`});
  }
  function nameOf(k) {
    const hit = level.known.find(([, t]) => canonical(parseMol(t)) === k);
    return hit ? hit[0] : '';
  }

  render();
  return {
    undo() { if (done) return; history.undo(); ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      // Point at a molecule not yet kept: show its skeleton as a faint picture.
      const keptKeys = new Set(history.state.kept.map(k => k.key));
      const next = level.known.find(([, t]) => !keptKeys.has(canonical(parseMol(t))));
      if (!next) { ctx.feedback('You have them all. Tap That’s all.'); return; }
      const mol = parseMol(next[1]), hs = hydrogensOn(mol);
      const parts = mol.els.map((el, i) => el + (hs[i] ? 'H' + (hs[i] > 1 ? sub(hs[i]) : '') : ''));
      const shape = mol.bonds.map(([i, j, o]) => `${parts[i]}${['', '–', '=', '≡'][o]}${parts[j]}`).join(', ');
      ctx.feedback(`Try one with ${shape}.`);
    },
  };
}

function miniOf(draw, bonds, hs) {
  const vb = viewBoxAround(draw.map(([, x, y]) => [x, y]), {pad: R + 3, minW: 0, minH: 0});
  const svg = s('svg', {class: 'mini', viewBox: vb.box, role: 'img', 'aria-label': 'Kept molecule'});
  for (const [i, j, o] of bonds) svg.append(...bondLines([draw[i][1], draw[i][2]], [draw[j][1], draw[j][2]], o, {pull: R + 0.5, gap: 2.8}));
  draw.forEach(([el, x, y], i) => svg.append(atomGlyph(el, x, y, {r: R, hydrogens: Math.max(0, hs[i])})));
  return svg;
}
