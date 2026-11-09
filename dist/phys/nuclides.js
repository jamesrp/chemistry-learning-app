// Star forge: a corner of the chart of nuclides, and the moves that walk it.
//
// A nuclide is Z protons and N neutrons (mass number A = Z + N). Moves:
// - capture a proton (+p: Z+1), a neutron (+n: N+1) or a helium-4 nucleus
//   (+α: Z+2, N+2), when the level's tray offers it;
// - let an unstable nuclide decay by its own mode: β⁻ (a neutron becomes a
//   proton: Z+1, N-1), β⁺ (a proton becomes a neutron, by positron emission
//   or electron capture: Z-1, N+1) or α (Z-2, N-2).
// Only nuclides in the table exist; a move that lands anywhere else falls
// apart at once (lithium-5, the diproton) and isn't allowed. Beryllium-8 is
// fleeting: it splits into two helium-4 nuclei almost at once, so the only
// capture it allows is another helium-4 (the triple-alpha process).

export const ELEMENT = {
  1: ['H', 'hydrogen'], 2: ['He', 'helium'], 3: ['Li', 'lithium'], 4: ['Be', 'beryllium'], 5: ['B', 'boron'], 6: ['C', 'carbon'],
  7: ['N', 'nitrogen'], 8: ['O', 'oxygen'], 9: ['F', 'fluorine'], 10: ['Ne', 'neon'], 11: ['Na', 'sodium'], 12: ['Mg', 'magnesium'],
  13: ['Al', 'aluminium'], 14: ['Si', 'silicon'], 15: ['P', 'phosphorus'], 16: ['S', 'sulfur'], 17: ['Cl', 'chlorine'], 18: ['Ar', 'argon'],
  19: ['K', 'potassium'], 20: ['Ca', 'calcium'], 21: ['Sc', 'scandium'], 22: ['Ti', 'titanium'], 23: ['V', 'vanadium'], 24: ['Cr', 'chromium'],
  25: ['Mn', 'manganese'], 26: ['Fe', 'iron'], 27: ['Co', 'cobalt'], 28: ['Ni', 'nickel'], 29: ['Cu', 'copper'],
  81: ['Tl', 'thallium'], 82: ['Pb', 'lead'], 83: ['Bi', 'bismuth'], 84: ['Po', 'polonium'], 85: ['At', 'astatine'], 86: ['Rn', 'radon'],
  88: ['Ra', 'radium'], 89: ['Ac', 'actinium'], 90: ['Th', 'thorium'], 91: ['Pa', 'protactinium'], 92: ['U', 'uranium'],
};

// Per element: [stable mass numbers], {mass number: decay modes}.
const TABLE = {
  H: [[1, 2], {3: ['b-']}],
  He: [[3, 4], {6: ['b-'], 8: ['b-']}],
  Li: [[6, 7], {8: ['b-'], 9: ['b-']}],
  Be: [[9], {7: ['b+'], 8: ['a'], 10: ['b-'], 11: ['b-']}],
  B: [[10, 11], {8: ['b+'], 12: ['b-'], 13: ['b-']}],
  C: [[12, 13], {10: ['b+'], 11: ['b+'], 14: ['b-'], 15: ['b-'], 16: ['b-']}],
  N: [[14, 15], {12: ['b+'], 13: ['b+'], 16: ['b-'], 17: ['b-']}],
  O: [[16, 17, 18], {14: ['b+'], 15: ['b+'], 19: ['b-'], 20: ['b-']}],
  F: [[19], {17: ['b+'], 18: ['b+'], 20: ['b-'], 21: ['b-']}],
  Ne: [[20, 21, 22], {18: ['b+'], 19: ['b+'], 23: ['b-'], 24: ['b-']}],
  Na: [[23], {21: ['b+'], 22: ['b+'], 24: ['b-'], 25: ['b-']}],
  Mg: [[24, 25, 26], {22: ['b+'], 23: ['b+'], 27: ['b-'], 28: ['b-']}],
  Al: [[27], {25: ['b+'], 26: ['b+'], 28: ['b-'], 29: ['b-']}],
  Si: [[28, 29, 30], {26: ['b+'], 27: ['b+'], 31: ['b-'], 32: ['b-']}],
  P: [[31], {29: ['b+'], 30: ['b+'], 32: ['b-'], 33: ['b-']}],
  S: [[32, 33, 34, 36], {30: ['b+'], 31: ['b+'], 35: ['b-'], 37: ['b-']}],
  Cl: [[35, 37], {33: ['b+'], 34: ['b+'], 36: ['b-'], 38: ['b-']}],
  Ar: [[36, 38, 40], {34: ['b+'], 35: ['b+'], 37: ['b+'], 39: ['b-'], 41: ['b-']}],
  K: [[39, 41], {37: ['b+'], 38: ['b+'], 40: ['b-', 'b+'], 42: ['b-']}],
  Ca: [[40, 42, 43, 44, 46, 48], {38: ['b+'], 39: ['b+'], 41: ['b+'], 45: ['b-'], 47: ['b-'], 49: ['b-']}],
  Sc: [[45], {43: ['b+'], 44: ['b+'], 46: ['b-'], 47: ['b-'], 48: ['b-'], 49: ['b-']}],
  Ti: [[46, 47, 48, 49, 50], {44: ['b+'], 45: ['b+'], 51: ['b-']}],
  V: [[50, 51], {48: ['b+'], 49: ['b+'], 52: ['b-']}],
  Cr: [[50, 52, 53, 54], {48: ['b+'], 49: ['b+'], 51: ['b+'], 55: ['b-']}],
  Mn: [[55], {52: ['b+'], 53: ['b+'], 54: ['b+'], 56: ['b-']}],
  Fe: [[54, 56, 57, 58], {52: ['b+'], 53: ['b+'], 55: ['b+'], 59: ['b-'], 60: ['b-']}],
  Co: [[59], {55: ['b+'], 56: ['b+'], 57: ['b+'], 58: ['b+'], 60: ['b-']}],
  Ni: [[58, 60, 61, 62, 64], {56: ['b+'], 57: ['b+'], 59: ['b+'], 63: ['b-'], 65: ['b-']}],
  Cu: [[63, 65], {}],
  // The uranium-238 and thorium-232 decay chains.
  Tl: [[], {206: ['b-'], 208: ['b-'], 210: ['b-']}],
  Pb: [[206, 208], {210: ['b-'], 212: ['b-'], 214: ['b-']}],
  Bi: [[], {210: ['b-', 'a'], 212: ['b-', 'a'], 214: ['b-', 'a']}],
  Po: [[], {210: ['a'], 212: ['a'], 214: ['a'], 216: ['a'], 218: ['a', 'b-']}],
  At: [[], {218: ['a']}],
  Rn: [[], {220: ['a'], 222: ['a']}],
  Ra: [[], {224: ['a'], 226: ['a'], 228: ['b-']}],
  Ac: [[], {228: ['b-']}],
  Th: [[], {228: ['a'], 230: ['a'], 232: ['a'], 234: ['b-']}],
  Pa: [[], {234: ['b-']}],
  U: [[], {234: ['a'], 238: ['a']}],
};
const Z_OF = Object.fromEntries(Object.entries(ELEMENT).map(([z, [sym]]) => [sym, Number(z)]));

export const NUCLIDES = new Map();
for (const [sym, [stable, unstable]] of Object.entries(TABLE)) {
  const Z = Z_OF[sym];
  for (const A of stable) NUCLIDES.set(`${sym}-${A}`, {sym, Z, A, N: A - Z, modes: []});
  for (const [A, modes] of Object.entries(unstable)) NUCLIDES.set(`${sym}-${A}`, {sym, Z, A: Number(A), N: Number(A) - Z, modes});
}
// Nuclides that don't hold together even for an instant: the gaps at mass 5
// (helium-5, lithium-5) and two protons alone. Anything else off the table is
// real but outside this corner of the chart.
export const UNBOUND = new Set(['He-2', 'H-4', 'H-5', 'He-5', 'He-7', 'Li-4', 'Li-5', 'Be-5', 'Be-6', 'B-7', 'B-9', 'C-8']);
export const keyOf = (Z, A) => (ELEMENT[Z] ? `${ELEMENT[Z][0]}-${A}` : null);
export const nuclide = key => NUCLIDES.get(key) || null;
export const isFleeting = n => n.sym === 'Be' && n.A === 8;

const SPECIAL = {'H-1': 'hydrogen-1 (a proton)', 'H-2': 'deuterium (hydrogen-2)', 'H-3': 'tritium (hydrogen-3)', 'He-4': 'helium-4 (an alpha particle)'};
export const nameOf = key => SPECIAL[key] || (() => { const [sym, A] = key.split('-'); return `${ELEMENT[Z_OF[sym]][1]}-${A}`; })();
export const shortName = key => { const [sym, A] = key.split('-'); return `${ELEMENT[Z_OF[sym]][1]}-${A}`; };
// Where a move would land, as Z and A, whether or not anything lives there.
export const STEP = {p: [1, 1], n: [0, 1], a: [2, 4], 'b-': [1, 0], 'b+': [-1, 0], 'a-decay': [-2, -4]};
export function landing(key, move) {
  const n = nuclide(key), [dz, da] = STEP[move];
  const Z = n.Z + dz, A = n.A + da;
  return {Z, A, key: keyOf(Z, A)};
}

// The moves open from a nuclide: captures from the tray, and its own decays.
// Each is {move, to} where to is the landing key, or null if it falls apart.
export function moves(key, tray) {
  const n = nuclide(key), out = [];
  for (const m of tray) {
    if (isFleeting(n) && m !== 'a') continue;
    const l = landing(key, m);
    out.push({move: m, to: l.key && NUCLIDES.has(l.key) ? l.key : null});
  }
  for (const mode of n.modes) {
    const m = mode === 'a' ? 'a-decay' : mode, l = landing(key, m);
    out.push({move: m, to: l.key && NUCLIDES.has(l.key) ? l.key : null});
  }
  return out;
}

// Shortest number of moves from one nuclide to another, and the first moves
// that start a shortest path (for hints). Infinity if it can't be done.
export function distances(target, tray) {
  // Backwards search: dist[k] = moves from k to the target.
  const pred = new Map();
  for (const k of NUCLIDES.keys()) for (const {to} of moves(k, tray)) if (to) { if (!pred.has(to)) pred.set(to, []); pred.get(to).push(k); }
  const dist = new Map([[target, 0]]), queue = [target];
  while (queue.length) {
    const k = queue.shift();
    for (const p of pred.get(k) || []) if (!dist.has(p)) { dist.set(p, dist.get(k) + 1); queue.push(p); }
  }
  return dist;
}
export const par = (start, target, tray) => distances(target, tray).get(start) ?? Infinity;
export function bestMoves(from, target, tray) {
  const dist = distances(target, tray), d = dist.get(from);
  if (d === undefined) return [];
  return moves(from, tray).filter(m => m.to && dist.get(m.to) === d - 1);
}
// Every shortest path, as lists of keys (for the chart window and the tests).
export function shortestPaths(start, target, tray, limit = 200) {
  const dist = distances(target, tray), out = [];
  const walk = (k, path) => {
    if (out.length >= limit) return;
    if (k === target) { out.push(path); return; }
    for (const m of moves(k, tray)) if (m.to && dist.get(m.to) === dist.get(k) - 1) walk(m.to, [...path, m.to]);
  };
  if (dist.has(start)) walk(start, [start]);
  return out;
}

// Why a nuclide lives or decays, in a sentence a child can follow. The idea
// underneath: protons all push each other apart, while protons and neutrons
// both hold their neighbours with the strong force, a short-range glue.
// Neutrons add glue without adding push. Small nuclei hold best with equal
// numbers; big ones need extra neutrons. Shells fill at 2, 8, 20, 28, 50, 82
// and 126 (the magic numbers), and a full shell holds extra tight.
const WHY_SPECIAL = {
  'H-1': 'A single proton: there’s nothing to fall apart.',
  'H-2': 'One proton and one neutron, only just held together. Two protons alone, or two neutrons alone, don’t hold at all.',
  'He-3': 'Two protons held by one neutron. It lasts, but helium-4 holds much tighter.',
  'He-4': 'Two protons and two neutrons fill the first shell, like the full shell of electrons in a noble gas. That makes helium-4 one of the tightest nuclei there is.',
  'Be-8': 'Two helium-4s side by side. Each helium-4 holds itself so tightly that the two are better off apart, so it splits almost at once.',
  'C-12': 'Three helium-4s stuck together, with glue to spare, so it lasts for ever.',
  'O-16': 'Four helium-4s, and its 8 protons and 8 neutrons each fill a shell, so it holds very tight.',
  'Ca-40': 'Its 20 protons and 20 neutrons each fill a shell. It is the heaviest nucleus that lasts with equal numbers of each.',
  'Fe-56': 'One of the most tightly held nuclei of all. Building past iron costs energy instead of giving it, which is why big stars stop at iron.',
  'Pb-206': 'Its 82 protons fill a shell, so lead holds. The uranium chain stops here.',
  'Pb-208': 'Its 82 protons and 126 neutrons both fill a shell, so it holds very tight. The thorium chain stops here.',
};
const WHY_MODE = {
  'b-': 'Too many neutrons for its protons, so a neutron turns into a proton (β⁻ decay).',
  'b+': 'Too many protons for its neutrons, so a proton turns into a neutron (β⁺ decay).',
  a: 'So many protons that their push wins: it throws out a helium-4 to get smaller (α decay).',
};
export function why(key) {
  const n = nuclide(key);
  if (WHY_SPECIAL[key]) return WHY_SPECIAL[key];
  if (n.modes.length > 1) {
    const both = n.modes.includes('b+')
      ? 'Its protons and its neutrons are both odd numbers, and odd ones pair up badly, so it can go two ways: a neutron turns into a proton (β⁻), or a proton into a neutron (β⁺).'
      : 'Too big, and with too many neutrons too, so it can go two ways: a neutron turns into a proton (β⁻), or it throws out a helium-4 (α).';
    return both;
  }
  if (n.modes.length) return WHY_MODE[n.modes[0]];
  if (n.N === n.Z) return 'Equal protons and neutrons: just right for a small nucleus, so the glue wins.';
  if (n.Z <= 20) return 'Protons and neutrons nearly balanced, so the glue wins and it lasts.';
  return 'A few more neutrons than protons. Bigger nuclei need them: neutrons add glue without adding push.';
}
// Why nothing lives on a square in UNBOUND.
const WHY_UNBOUND = {
  'He-2': 'Two protons push each other apart, and with no neutron to help there isn’t enough glue.',
  'H-4': 'One proton can’t hold on to three neutrons: the extra one drops off.',
  'H-5': 'One proton can’t hold on to four neutrons: the extra ones drop off.',
  'He-5': 'Helium-4’s first shell is full, so a fifth piece has no room and drops off.',
  'Li-5': 'Helium-4’s first shell is full, so a fifth piece has no room and drops off.',
  'He-7': 'Too many neutrons for two protons to hold: one drops off.',
  'B-9': 'It is beryllium-8 with a proton stuck on, and it falls apart even faster.',
};
export const whyUnbound = key => WHY_UNBOUND[key] || 'Far too many protons for its neutrons: their push wins and a proton flies off.';

export const MODE_TEXT = {
  'b-': 'β⁻ decay: a neutron turns into a proton, and an electron flies out',
  'b+': 'β⁺ decay: a proton turns into a neutron, and a positron flies out (or an electron is caught)',
  a: 'α decay: it throws out a helium-4 nucleus',
};
