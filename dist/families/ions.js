// Charge jigsaw board: ions are rods as long as their charge. Positive ions
// sit on the top rail with a peg per charge, negative ions on the bottom rail
// with a notch per charge. Tap ions in the tray to add them and tap a rod to
// take it off. When the two rails are the same length every peg has a
// notch: the compound is neutral.
import {ION_LEVELS} from '../data/ion-levels.js';
import {IONS, ionName, checkCompound, allCompounds, compoundKey, compoundName} from '../chem/ions.js';
import {h, s, tappable, History, f, flash} from '../ui.js';

const U = 30, H = 34, PEG = 7;

export const ions = {
  id: 'ions',
  name: 'Charge jigsaw',
  levels: ION_LEVELS,
  howTo: [
    'Tap an ion to add it. Positive ions go on the top rail, negative ions on the bottom. Tap a rod on the rails to take it off.',
    'A rod is as long as its charge. When both rails are the same length, every + has a −: the compound is neutral.',
    'Use as few ions as you can. On boards with a Keep button, find every compound the tray can make, then tap That’s all.',
  ],
  mount,
};

function mount(host, level, ctx) {
  const history = new History({rods: [], kept: []});
  let done = false;
  const tray = h('div', {class: 'tray ion-tray'});
  const svg = s('svg', {class: 'board-svg ions', 'aria-label': 'Ion rails'});
  const keep = level.all ? h('button', {class: 'primary', type: 'button', onclick: doKeep}, 'Keep') : null;
  const all = level.all ? h('button', {class: 'secondary', type: 'button', onclick: doAll}, 'That’s all') : null;
  const shelf = h('div', {class: 'shelf'});
  host.append(tray, svg);
  if (level.all) host.append(h('div', {class: 'actions'}, keep, all), shelf);

  for (const id of level.tray) {
    const b = h('button', {type: 'button', class: `ion-button ${IONS[id].charge > 0 ? 'plus' : 'minus'}`, 'aria-label': `Add ${ionName(id)}`, onclick: () => add(id)});
    b.append(rodSVG(id), h('span', {class: 'ion-label'}, ionName(id)));
    tray.append(b);
  }

  const countsOf = rods => { const c = {}; for (const id of rods) c[id] = (c[id] || 0) + 1; return c; };

  function render() {
    const {rods, kept} = history.state;
    const top = rods.map((id, i) => [id, i]).filter(([id]) => IONS[id].charge > 0), bottom = rods.map((id, i) => [id, i]).filter(([id]) => IONS[id].charge < 0);
    const plus = top.reduce((n, [id]) => n + IONS[id].charge, 0), minus = bottom.reduce((n, [id]) => n - IONS[id].charge, 0);
    const width = Math.max(6, plus, minus) * U + 2 * U;
    svg.setAttribute('viewBox', `${-U} -12 ${width} ${2 * H + 30}`);
    svg.replaceChildren();
    const neutral = rods.length > 0 && plus === minus;
    svg.append(s('rect', {class: `rails ${neutral ? 'neutral' : ''}`, x: -U * 0.6, y: -8, width: width - U * 0.8, height: 2 * H + 22, rx: 10}));
    let x = 0;
    for (const [id, i] of top) { svg.append(rodAt(id, x, 0, i)); x += IONS[id].charge * U; }
    x = 0;
    for (const [id, i] of bottom) { svg.append(rodAt(id, x, H + 6, i)); x += -IONS[id].charge * U; }
    // Where the shorter rail ends, mark the open pegs or notches.
    if (plus !== minus && rods.length) {
      const from = Math.min(plus, minus) * U, to = Math.max(plus, minus) * U;
      svg.append(s('rect', {class: 'open-span', x: from, y: plus > minus ? H + 6 : 0, width: to - from, height: H, rx: 6}));
    }
    if (level.all) {
      keep.disabled = done || !neutral;
      all.disabled = done || !kept.length;
      shelf.replaceChildren(...kept.map(k => h('div', {class: 'shelf-item formula-item'}, k.formula, h('div', {class: 'shelf-name'}, k.name))));
    }
    ctx.changed({canUndo: history.canUndo && !done});
    if (!level.all && !done) check();
  }

  function rodAt(id, x, y, index) {
    const g = s('g', {class: `rod ${IONS[id].charge > 0 ? 'plus' : 'minus'}`, transform: `translate(${x} ${y})`});
    g.append(...rodShape(id));
    const w = Math.abs(IONS[id].charge) * U;
    // A long label on a short rod (HCO₃⁻ on a rod one charge long) shrinks to fit.
    const label = ionName(id), size = Math.max(9, Math.min(13, (w - 4) / (label.length * 0.58)));
    g.append(s('text', {class: 'rod-label', x: f(w / 2), y: f(H / 2 + 5), style: `font-size:${f(size)}px`}, label));
    return tappable(g, `Remove ${ionName(id)}`, () => remove(index));
  }

  function add(id) {
    if (done) return;
    ctx.feedback(null);
    history.push({...history.state, rods: [...history.state.rods, id]});
    render();
  }
  function remove(index) {
    if (done) return;
    ctx.feedback(null);
    history.push({...history.state, rods: history.state.rods.filter((_, i) => i !== index)});
    render();
  }

  function check() {
    const c = checkCompound(countsOf(history.state.rods));
    if (!c.neutral) return;
    if (!c.lowest) { ctx.feedback('Neutral. Can you do it with fewer ions?'); return; }
    if (c.ok) { done = true; ctx.solved({title: c.formula, detail: level.name}); }
  }

  function doKeep() {
    const counts = countsOf(history.state.rods), c = checkCompound(counts);
    if (!c.neutral) return;
    if (!c.twoKinds) { ctx.feedback('Use one kind of + ion and one kind of − ion.'); return; }
    if (!c.lowest) { ctx.feedback('Neutral. Can you do it with fewer ions?'); return; }
    const k = compoundKey(counts), dup = history.state.kept.findIndex(x => x.key === k);
    if (dup >= 0) { flash(shelf.children[dup]); ctx.feedback('You have that one.'); return; }
    ctx.feedback(null);
    history.push({rods: [], kept: [...history.state.kept, {key: k, formula: c.formula, name: compoundName(counts)}]});
    render();
  }
  function doAll() {
    const total = allCompounds(level.tray).length;
    if (history.state.kept.length < total) { ctx.feedback('There are more.'); return; }
    done = true; render();
    ctx.solved({title: history.state.kept.map(k => k.formula).join('  '), detail: `${total} compounds`});
  }

  render();
  return {
    undo() { if (done) return; history.undo(); ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      let goal;
      if (level.target) goal = level.target;
      else {
        const keptKeys = new Set(history.state.kept.map(k => k.key));
        goal = allCompounds(level.tray).find(c => !keptKeys.has(compoundKey(c)));
        if (!goal) { ctx.feedback('You have them all. Tap That’s all.'); return; }
      }
      const [cat, an] = Object.keys(goal).sort((a, b) => IONS[b].charge - IONS[a].charge);
      const p = IONS[cat].charge, q = -IONS[an].charge;
      ctx.feedback(`${ionName(cat)} is ${p} long and ${ionName(an)} is ${q} long. Both rails can reach ${p * goal[cat]}.`);
    },
  };
}

// A rod: a rounded block a charge long. A positive rod has pegs along its
// bottom; a negative rod has notches along its top.
function rodShape(id) {
  const q = Math.abs(IONS[id].charge), w = q * U, plus = IONS[id].charge > 0;
  let d = `M4 0 H${w - 4} Q${w} 0 ${w} 4 V${H - 4} Q${w} ${H} ${w - 4} ${H}`;
  if (plus) {
    for (let k = q - 1; k >= 0; k--) { const c = k * U + U / 2; d += ` H${c + PEG} A${PEG} ${PEG} 0 0 1 ${c - PEG} ${H}`; }
    d += ` H4 Q0 ${H} 0 ${H - 4} V4 Q0 0 4 0 Z`;
  } else {
    d = `M4 0`;
    for (let k = 0; k < q; k++) { const c = k * U + U / 2; d += ` H${c - PEG} A${PEG} ${PEG} 0 0 0 ${c + PEG} 0`; }
    d += ` H${w - 4} Q${w} 0 ${w} 4 V${H - 4} Q${w} ${H} ${w - 4} ${H} H4 Q0 ${H} 0 ${H - 4} V4 Q0 0 4 0 Z`;
  }
  return [s('path', {class: 'rod-body', d})];
}
function rodSVG(id) {
  const w = Math.abs(IONS[id].charge) * U;
  return s('svg', {class: 'rod-icon', viewBox: `-2 -2 ${w + 4} ${H + PEG + 4}`, width: f((w + 4) * 0.9), height: f((H + PEG + 4) * 0.9), 'aria-hidden': 'true'},
    s('g', {class: `rod ${IONS[id].charge > 0 ? 'plus' : 'minus'}`}, ...rodShape(id)));
}
