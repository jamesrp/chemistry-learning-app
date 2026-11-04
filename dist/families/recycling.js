// Atom recycling board: tap a reactant to break one molecule apart onto the
// bench; tap a product to build one from bench atoms. Atoms are never made
// or lost, so an empty bench is a balanced equation.
import {REACTION_LEVELS} from '../data/reaction-levels.js';
import {MOLECULES, benchOf, check, equationOf, missingAtoms, hasAtoms, bestYield, smallestBalance} from '../chem/reactions.js';
import {h, History, moleculeSVG, flash} from '../ui.js';

export const recycling = {
  id: 'recycling',
  name: 'Atom recycling',
  levels: REACTION_LEVELS,
  howTo: [
    'Tap a molecule on the left to break it apart. Its atoms land on the bench in the middle.',
    'Tap a molecule on the right to build one from bench atoms.',
    'Atoms are never made or lost. Use every atom on the bench, with the fewest molecules you can.',
  ],
  mount,
};

const ORDER = ['C', 'N', 'H', 'O', 'Cl'];

function mount(host, level, ctx) {
  const history = new History({broken: {}, built: {}});
  let done = false;
  const goal = level.most ? h('p', {class: 'puzzle-goal'}, `Build as many ${MOLECULES[level.most].formula} as you can.`) : null;
  const left = h('div', {class: 'side reactants'}), right = h('div', {class: 'side products'});
  const bench = h('div', {class: 'bench', 'aria-live': 'polite'});
  if (goal) host.append(goal);
  host.append(h('div', {class: 'reaction'}, left, h('div', {class: 'arrow', 'aria-hidden': 'true'}, '→'), bench, h('div', {class: 'arrow', 'aria-hidden': 'true'}, '→'), right));

  const cards = {};
  for (const id of level.reactants) left.append(cards[id] = card(id, () => breakOne(id)));
  for (const id of level.products) right.append(cards[id] = card(id, () => buildOne(id)));

  function card(id, onTap) {
    const m = MOLECULES[id];
    const b = h('button', {type: 'button', class: 'mol-card', 'aria-label': m.formula, onclick: onTap});
    b.append(moleculeSVG(m.draw, m.bonds, {r: 4.6, label: m.formula}), h('span', {class: 'mol-formula'}, m.formula), h('span', {class: 'mol-count'}));
    return b;
  }

  function render() {
    const st = history.state, atoms = benchOf(level, st);
    for (const id of level.reactants) {
      const n = st.broken[id] || 0, c = cards[id].querySelector('.mol-count');
      if (level.supply) {
        const rest = level.supply[id] - n;
        c.textContent = `${rest} left`;
        cards[id].disabled = done || rest === 0;
      } else { c.textContent = n ? `×${n}` : ''; cards[id].disabled = done; }
    }
    for (const id of level.products) {
      const n = st.built[id] || 0;
      cards[id].querySelector('.mol-count').textContent = n ? `×${n}` : '';
      cards[id].disabled = done;
      cards[id].classList.toggle('can', hasAtoms(atoms, MOLECULES[id].atoms));
    }
    bench.replaceChildren();
    const els = Object.keys(atoms).filter(el => atoms[el] > 0).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    for (const el of els) {
      const row = h('div', {class: 'bench-row', 'data-el': el, 'aria-label': `${atoms[el]} ${el}`});
      for (let k = 0; k < atoms[el]; k++) row.append(h('span', {class: `ball el-${el}`}, el));
      bench.append(row);
    }
    bench.classList.toggle('empty', !els.length);
    ctx.changed({canUndo: history.canUndo && !done});
    if (!done) judge();
  }

  function breakOne(id) {
    if (done) return;
    const st = structuredClone(history.state);
    if (level.supply && (st.broken[id] || 0) >= level.supply[id]) return;
    st.broken[id] = (st.broken[id] || 0) + 1;
    ctx.feedback(null);
    history.push(st); render();
  }
  function buildOne(id) {
    if (done) return;
    const st = structuredClone(history.state), atoms = benchOf(level, st), need = MOLECULES[id].atoms;
    if (!hasAtoms(atoms, need)) {
      flash(cards[id]);
      for (const el of missingAtoms(atoms, need)) flash(bench.querySelector(`[data-el="${el}"]`) || bench);
      return;
    }
    st.built[id] = (st.built[id] || 0) + 1;
    ctx.feedback(null);
    history.push(st); render();
  }

  function judge() {
    const st = history.state, c = check(level, st);
    if (c.ok) { done = true; render(); ctx.solved({title: equationOf(level, st), detail: level.most ? `${c.made} is the most this pile can make` : ''}); return; }
    if (!level.most && c.empty && c.used && !c.lowest) ctx.feedback('Balanced. Can you do it with fewer molecules?');
  }

  render();
  return {
    undo() { if (done) return; history.undo(); ctx.feedback(null); render(); },
    restart() { done = false; history.restart(); ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      const st = history.state;
      if (level.most) {
        ctx.feedback(`This pile can make ${bestYield(level)}. Break only what you need.`);
        return;
      }
      const target = smallestBalance(level);
      const parts = [...level.reactants.map(id => [id, target.broken[id], st.broken[id] || 0]), ...level.products.map(id => [id, target.built[id], st.built[id] || 0])];
      const next = parts.find(([, want, have]) => have < want) || parts[0];
      ctx.feedback(`Try ${next[1]} of ${MOLECULES[next[0]].formula}.`);
      flash(cards[next[0]]);
    },
  };
}
