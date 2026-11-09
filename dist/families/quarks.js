// Quark kitchen board: up to three slots and a tray of quarks and antiquarks.
// Tap a quark in the tray to put it in the next slot; tap a quark in a slot to
// flip its spin arrow. Colours are given out as a real hadron needs them (red,
// green and blue, or a colour and its anticolour). The board reads out the
// charge, the spin and what the build makes, and the goal says which
// particle, or how many, to find.
import levels from '../data/quark-levels.js';
import {identify, meets, answers, chartPos, GLYPH, CHARGE3, QUARK_NAME, QUARKS, isAnti, chargeText, spinText, thirdText, fermion} from '../phys/quarks.js';
import {h, s, tappable, History, f, flash} from '../ui.js';

const COLOURS = ['red', 'green', 'blue'];
const SLOT = 84, R = 27;

export const quarks = {
  id: 'quarks',
  name: 'Quark kitchen',
  shelf: 'particles',
  levels,
  howTo: [
    'Protons, neutrons and their cousins are made of quarks. Tap a quark in the tray to put it in; Clear empties the board.',
    'Three quarks make a particle, and so does one quark with one antiquark (the ones with a bar on top). Any other mix can’t hold together.',
    'Each quark spins. Tap one to flip its arrow. Three arrows the same way make spin 3/2, and one flipped makes spin ½. For a pair, the same way makes spin 1 and opposite ways make spin 0.',
    'Charges are in thirds: up is +⅔, down and strange are −⅓, and antiquarks are the opposite. They always add up to a whole number.',
  ],
  notes: {
    science: 'Protons and neutrons are not the smallest things: each is three quarks. In the 1960s Murray Gell-Mann and George Zweig saw that the zoo of particles found in cosmic rays and accelerators fell into neat patterns if they were made of three kinds of quark (up, down, strange) with charges of +⅔ and −⅓. Quarks carry a second kind of charge, called colour (red, green, blue, nothing to do with real colour), and only colourless groups can exist on their own: three quarks with one of each colour (baryons, like the proton) or a quark with an antiquark of the matching anticolour (mesons, like the pion). The ten spin-3/2 baryons make a triangle on Gell-Mann’s chart; when he drew it, the bottom corner was empty, and he predicted a particle of three strange quarks with charge −1. The Omega-minus was found at Brookhaven in 1964. Everything with an odd number of quarks is a fermion (spin ½, 3/2: two can’t share a state), and everything with an even number is a boson (spin 0, 1).',
    maths: 'Charge is additive, counted in thirds so it stays whole-number arithmetic: uud is 2 + 2 − 1 = 3 thirds. Spin here uses the simple rule of adding arrows: n arrows of ½ give n/2 when all agree, and one fewer whole step for each flipped arrow, down to ½ or 0. The real rule (adding angular momentum in quantum mechanics) gives exactly these totals for two or three spin-½ quarks. Three identical quarks with spin ½ are forbidden because their combined state would have to be symmetric under swapping and antisymmetric at the same time, which is why uuu, ddd and sss only come as spin 3/2. Each level is checked by trying every build the tray allows, with every spin, and counting the different particles that meet the goal. The charts place each particle across by charge and down by how many strange quarks it holds.',
    caution: 'Quarks are never seen alone, and the masses, which are most of what makes physics hard, are left out. Two particles share uds with spin ½ (the Lambda and the Sigma-zero), and the app names only the Lambda. Neutral pairs like uū and dd̄ mix in nature: the real pion-zero is part of each, and the eta here (ss̄) is really a mixture too. There are three more quarks (charm, bottom, top) that the app leaves out.',
    kitchen: 'Make quarks from coloured sweets or Lego: red, green and blue for quarks, and pale or striped ones for antiquarks. Stick tiny paper flags on them for up and down spin. Count out the charges with fractions of a pizza, three slices to a whole.',
  },
  mount,
};

function mount(host, level, ctx) {
  const all = answers(level), many = level.find > 1;
  const history = new History({build: [], found: []});
  let done = false, hints = 0;
  const goal = h('p', {class: 'puzzle-goal quark-goal'});
  const tray = h('div', {class: 'tray quark-tray'});
  const svg = s('svg', {class: 'board-svg quark-board', viewBox: `0 0 ${SLOT * 3} 112`, 'aria-label': 'Quark slots'});
  const status = h('p', {class: 'quark-status', 'aria-live': 'polite'});
  const clear = h('button', {class: 'secondary', type: 'button', onclick: doClear}, 'Clear');
  const shelf = level.chart ? h('div', {class: 'quark-chart-box'}) : h('div', {class: 'shelf quark-shelf'});
  host.append(goal, tray, svg, status, h('div', {class: 'actions'}, clear), shelf);

  const left = st => Object.fromEntries(QUARKS.map(q => [q, (level.tray[q] || 0) - st.build.filter(b => b.q === q).length]));
  // Colours: quarks take red, green, blue in turn, antiquarks the anticolours.
  const coloursOf = build => { let a = 0, b = 0; return build.map(x => (isAnti(x.q) ? COLOURS[b++] : COLOURS[a++])); };

  function render() {
    const st = history.state, rest = left(st), res = identify(st.build);
    goal.replaceChildren(level.goal, many ? ' ' : '', many ? h('span', {class: 'found-count'}, `Found ${st.found.length} of ${level.find}`) : '');
    tray.replaceChildren(...QUARKS.filter(q => level.tray[q]).map(q => h('button', {
      type: 'button', class: `chip q-chip ${isAnti(q) ? 'anti' : ''}`, 'data-q': q, disabled: done || rest[q] <= 0 || st.build.length >= 3,
      'aria-label': `${QUARK_NAME[q]}, charge ${thirdText(CHARGE3[q])}, ${rest[q]} left`,
      onclick: () => add(q),
    }, h('span', {class: 'chip-el'}, GLYPH[q]), h('span', {class: 'chip-n'}, `×${rest[q]}`))));
    svg.replaceChildren();
    const cols = coloursOf(st.build);
    for (let k = 0; k < 3; k++) {
      const cx = SLOT * k + SLOT / 2, cy = 46, b = st.build[k];
      if (!b) { svg.append(s('circle', {class: 'q-slot', cx, cy, r: R})); continue; }
      const g = s('g', {class: `quark ${isAnti(b.q) ? 'anti' : ''} c-${cols[k]} ${b.up ? 'up' : 'down'}`, 'data-slot': k});
      g.append(s('circle', {class: 'q-disc', cx, cy, r: R}));
      g.append(s('text', {class: 'q-letter', x: cx - 7, y: cy + 8}, GLYPH[b.q]));
      const ay = b.up ? -1 : 1, ax = cx + 13;
      g.append(s('path', {class: 'q-arrow', d: `M${ax} ${cy - 13 * ay} L${ax} ${cy + 13 * ay} M${ax - 5} ${cy + 7 * ay} L${ax} ${cy + 13 * ay} L${ax + 5} ${cy + 7 * ay}`}));
      g.append(s('text', {class: 'q-charge', x: cx, y: cy + R + 17}, thirdText(CHARGE3[b.q])));
      svg.append(done ? g : tappable(g, `${QUARK_NAME[b.q]}, ${cols[k]}, spin ${b.up ? 'up' : 'down'}; tap to flip`, () => flip(k)));
    }
    const sum = st.build.reduce((a, b) => a + CHARGE3[b.q], 0);
    const lines = [];
    if (st.build.length) lines.push(h('span', {class: 'q-sum'}, `Charge ${st.build.map(b => thirdText(CHARGE3[b.q])).join(' ')} = ${sum % 3 ? (thirdText(sum) || `${sum > 0 ? '+' : '−'}${Math.abs(sum)}/3`) : chargeText(sum / 3)}`));
    if (res.ok) {
      const p = res.particle;
      lines.push(h('span', {class: 'q-made'}, `${cap(p.name)} (${p.sym}): spin ${spinText(p.spin)}, a ${fermion(p) ? 'fermion' : 'boson'}`));
    } else lines.push(h('span', {class: 'q-why'}, res.why));
    status.replaceChildren(...lines);
    if (level.chart) shelf.replaceChildren(chart(st.found));
    else shelf.replaceChildren(...st.found.map(key => { const p = all.find(a => a.particle.key === key).particle; return h('div', {class: 'shelf-item quark-item'}, h('div', {class: 'quark-sym'}, p.sym), h('div', {class: 'shelf-name'}, p.name)); }));
    ctx.changed({canUndo: history.canUndo && !done});
  }

  function chart(found) {
    const pts = all.map(a => ({p: a.particle, ...chartPos(a.particle)}));
    // Two particles in one place (pion-zero and eta) sit side by side.
    pts.forEach((pt, i) => { const twin = pts.findIndex((q, j) => j < i && q.x === pt.x && q.y === pt.y); if (twin >= 0) { pts[twin].x -= 0.22; pt.x += 0.22; } });
    const X = 52, Y = 46, xs = pts.map(p => p.x * X), ys = pts.map(p => p.y * Y), pad = 24;
    const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) - x0 + pad, hh = Math.max(...ys) - y0 + pad;
    const c = s('svg', {class: 'quark-chart', viewBox: `${f(x0)} ${f(y0)} ${f(w)} ${f(hh)}`, role: 'img', 'aria-label': `${level.title}: ${found.length} of ${level.find} found`});
    pts.forEach(pt => {
      const got = found.includes(pt.p.key), g = s('g', {class: `chart-spot ${got ? 'found' : ''}`});
      g.append(s('circle', {cx: f(pt.x * X), cy: f(pt.y * Y), r: 18}), s('text', {x: f(pt.x * X), y: f(pt.y * Y + 5)}, got ? pt.p.sym : '?'));
      c.append(g);
    });
    return c;
  }

  function settle(st) {
    const res = identify(st.build);
    if (!res.ok) { ctx.feedback(null); return st; }
    const p = res.particle;
    if (!meets(p, level.want)) { ctx.feedback(`That’s the ${p.name} (${p.sym}), ${whyNot(p)}.`); return st; }
    if (st.found.includes(p.key)) {
      ctx.feedback(p.name === 'pion-zero' ? 'Already found: uū and dd̄ both make the pion-zero. The real one is a mix of the two.' : `Already found the ${p.name}. Try another.`);
      return st;
    }
    const found = [...st.found, p.key];
    if (found.length >= level.find) {
      done = true;
      return {...st, found};
    }
    ctx.feedback(`Found the ${p.name} (${p.sym}). ${level.find - found.length} to go.`);
    return {build: [], found};
  }
  function whyNot(p) {
    const w = level.want, out = [];
    if (w.kind && p.kind !== w.kind) out.push(w.kind === 'meson' ? 'but the goal is a quark and antiquark pair' : w.kind === 'antibaryon' ? 'but the goal is antimatter' : 'but the goal is three quarks');
    else if (w.charge !== undefined && p.charge !== w.charge) out.push(`but its charge is ${chargeText(p.charge)}`);
    else if (w.spin !== undefined && p.spin !== w.spin) out.push(`but its spin is ${spinText(p.spin)}`);
    else out.push('but it has no strange quark');
    return out.join('');
  }

  function commit(st) {
    st = settle(st);
    history.push(st); render();
    if (done) {
      const last = all.find(a => a.particle.key === st.found.at(-1)).particle;
      ctx.solved(many
        ? {title: level.title || `All ${level.find}`, detail: all.map(a => a.particle.sym).join(' ')}
        : {title: `${cap(last.name)} (${last.sym})`, detail: `${[...last.flavour].map(q => GLYPH[q]).join(' ')}: charge ${chargeText(last.charge)}, spin ${spinText(last.spin)}, a ${fermion(last) ? 'fermion' : 'boson'}`});
    }
  }
  function add(q) {
    if (done) return;
    const st = history.state;
    if (left(st)[q] <= 0 || st.build.length >= 3) { flash(tray); return; }
    commit({...st, build: [...st.build, {q, up: true}]});
  }
  function flip(k) {
    if (done) return;
    const st = history.state;
    commit({...st, build: st.build.map((b, i) => (i === k ? {...b, up: !b.up} : b))});
  }
  function doClear() {
    if (done || !history.state.build.length) return;
    ctx.feedback(null);
    history.push({...history.state, build: []}); render();
  }

  render();
  return {
    undo() { if (done) return; history.undo(); ctx.feedback(null); render(); },
    restart() { done = false; hints = 0; history.restart(); ctx.feedback(null); render(); },
    hint() {
      if (done) return;
      hints++;
      const w = level.want;
      if (hints === 1) {
        ctx.feedback(w.spin !== undefined && w.charge === undefined
          ? (w.kind === 'meson' ? 'A pair with both arrows the same way has spin 1; opposite ways, spin 0.' : 'Three arrows the same way make spin 3/2; flip one to make spin ½.')
          : 'Add the charges: up is +⅔, down and strange are −⅓, and an antiquark is the opposite of its quark.');
        return;
      }
      const next = all.find(a => !history.state.found.includes(a.particle.key));
      const recipe = next.build.map(b => `${GLYPH[b.q]}${b.up ? '↑' : '↓'}`).join(' ');
      ctx.feedback(`Try ${recipe}.`);
    },
  };
}

const cap = t => t[0].toUpperCase() + t.slice(1);
