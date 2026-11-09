// Quark kitchen: building hadrons from quarks, the way the quark model of the
// 1960s does it (up, down and strange only).
//
// A quark is u, d or s; an antiquark is U, D or S (drawn ū, d̄, s̄). Each one
// carries a spin arrow, up (+1) or down (-1). A build is colourless, and so a
// real particle, when it is three quarks (red, green, blue), three antiquarks,
// or one quark with one antiquark (a colour and its anticolour).
//
// Spin, in halves: three arrows all the same way make 3/2, otherwise 1/2; a
// pair the same way makes 1, opposite ways 0. Three identical quarks must all
// point the same way (Pauli), so uuu, ddd and sss only come with spin 3/2.
// Charge is counted in thirds: u +2, d and s -1, antiquarks the opposite.

export const QUARKS = ['u', 'd', 's', 'U', 'D', 'S'];
export const CHARGE3 = {u: 2, d: -1, s: -1, U: -2, D: 1, S: 1};
export const GLYPH = {u: 'u', d: 'd', s: 's', U: 'ū', D: 'd̄', S: 's̄'};
export const QUARK_NAME = {u: 'up quark', d: 'down quark', s: 'strange quark', U: 'anti-up', D: 'anti-down', S: 'anti-strange'};
export const isAnti = q => q === q.toUpperCase();

// Names by flavour (sorted, quarks before antiquarks) and spin in halves.
const BARYONS = {
  1: {uud: ['proton', 'p'], udd: ['neutron', 'n'], uds: ['Lambda', 'Λ⁰'], uus: ['Sigma-plus', 'Σ⁺'], dds: ['Sigma-minus', 'Σ⁻'], uss: ['Xi-zero', 'Ξ⁰'], dss: ['Xi-minus', 'Ξ⁻']},
  3: {uuu: ['Delta-plus-plus', 'Δ⁺⁺'], uud: ['Delta-plus', 'Δ⁺'], udd: ['Delta-zero', 'Δ⁰'], ddd: ['Delta-minus', 'Δ⁻'],
    uus: ['Sigma-star-plus', 'Σ*⁺'], uds: ['Sigma-star-zero', 'Σ*⁰'], dds: ['Sigma-star-minus', 'Σ*⁻'],
    uss: ['Xi-star-zero', 'Ξ*⁰'], dss: ['Xi-star-minus', 'Ξ*⁻'], sss: ['Omega-minus', 'Ω⁻']},
};
const MESONS = {
  0: {uD: ['pion-plus', 'π⁺'], dU: ['pion-minus', 'π⁻'], uU: ['pion-zero', 'π⁰'], dD: ['pion-zero', 'π⁰'],
    uS: ['kaon-plus', 'K⁺'], dS: ['kaon-zero', 'K⁰'], sU: ['kaon-minus', 'K⁻'], sD: ['antikaon-zero', 'K̄⁰'], sS: ['eta', 'η']},
  2: {uD: ['rho-plus', 'ρ⁺'], dU: ['rho-minus', 'ρ⁻'], uU: ['rho-zero', 'ρ⁰'], dD: ['rho-zero', 'ρ⁰'],
    uS: ['K-star-plus', 'K*⁺'], dS: ['K-star-zero', 'K*⁰'], sU: ['K-star-minus', 'K*⁻'], sD: ['anti-K-star-zero', 'K̄*⁰'], sS: ['phi', 'φ']},
};
const ORDER = 'udsUDS';
export const flavourKey = qs => [...qs].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).join('');

export const chargeText = c => (c === 0 ? '0' : c > 0 ? `+${c}` : `−${-c}`);
const chargeSup = c => ({0: '⁰', 1: '⁺', 2: '⁺⁺', '-1': '⁻', '-2': '⁻⁻'})[c];
// Spin in halves as written: 1 -> ½, 3 -> 3/2, 0 -> 0, 2 -> 1.
export const spinText = h2 => (h2 === 1 ? '½' : h2 % 2 ? `${h2}/2` : String(h2 / 2));
export const thirdText = t => ({2: '+⅔', '-1': '−⅓', '-2': '−⅔', 1: '+⅓'})[t];

// What a build makes. build: [{q, up}] in slot order. Returns
// {ok: true, particle} or {ok: false, why} (why is a sentence for the board).
export function identify(build) {
  const qs = build.map(b => b.q), n = qs.length;
  if (n === 0) return {ok: false, why: 'Tap a quark to put it in.'};
  const anti = qs.filter(isAnti).length, plain = n - anti;
  const charge3 = qs.reduce((a, q) => a + CHARGE3[q], 0);
  const ups = build.filter(b => b.up).length;
  if (n === 1) return {ok: false, why: 'A quark is never seen alone. Add more.'};
  if (n === 2) {
    if (anti !== 1) return {ok: false, why: anti ? 'Two antiquarks aren’t colourless. Add a third, or swap one for a quark.' : 'Two quarks aren’t colourless yet. Add a third quark, or swap one for an antiquark.'};
    const spin = ups === 1 ? 0 : 2;
    const key = flavourKey(qs), [name, sym] = MESONS[spin][key];
    return {ok: true, particle: {key: name, name, sym, kind: 'meson', spin, charge: charge3 / 3, flavour: key, strangeness: strangeness(qs)}};
  }
  if (anti !== 0 && plain !== 0) return {ok: false, why: 'A quark and an antiquark are already colourless. Three need to be all quarks or all antiquarks.'};
  const spin = ups === 0 || ups === 3 ? 3 : 1;
  const base = flavourKey(qs.map(q => q.toLowerCase()));
  if (base[0] === base[1] && base[1] === base[2] && spin !== 3) {
    return {ok: false, why: `Three ${QUARK_NAME[base[0]].replace(' quark', '')} quarks must all spin the same way.`};
  }
  let [name, sym] = BARYONS[spin][base];
  if (anti) {
    // The antiparticle: same name with anti, a bar over the letter, the charge flipped.
    name = name === 'proton' || name === 'neutron' ? `anti${name}` : `anti-${name}`;
    const base = sym.replace(/[⁺⁻⁰]+$/, '');
    sym = base[0] + '\u0304' + base.slice(1) + (name === 'antiproton' || name === 'antineutron' ? '' : chargeSup(charge3 / 3));
  }
  return {ok: true, particle: {key: name, name, sym, kind: anti ? 'antibaryon' : 'baryon', spin, charge: charge3 / 3, flavour: flavourKey(qs), strangeness: strangeness(qs)}};
}

export const fermion = p => p.kind !== 'meson';
// Strangeness: each s̄ counts +1 and each s counts -1 (a historical sign).
function strangeness(qs) { return qs.filter(q => q === 'S').length - qs.filter(q => q === 's').length; }

// Does a particle meet a level's goal? want: {kind, charge, spin, strange},
// where strange is how many s or s̄ it holds.
export function meets(p, want) {
  if (want.kind && p.kind !== want.kind) return false;
  if (want.charge !== undefined && p.charge !== want.charge) return false;
  if (want.spin !== undefined && p.spin !== want.spin) return false;
  if (want.strange !== undefined && [...p.flavour].filter(q => q === 's' || q === 'S').length !== want.strange) return false;
  return true;
}

// Every build a tray allows (2 or 3 tokens, each spin), and what it makes.
// Builds are taken as multisets with spin patterns, so each recipe shows once.
export function allBuilds(tray) {
  const tokens = QUARKS.flatMap(q => Array(tray[q] || 0).fill(q));
  const out = [], seen = new Set();
  const pick = (start, chosen) => {
    if (chosen.length >= 2) {
      for (let mask = 0; mask < 1 << chosen.length; mask++) {
        const build = chosen.map((q, i) => ({q, up: !!(mask >> i & 1)}));
        const sig = build.map(b => b.q + (b.up ? '+' : '-')).sort().join(',');
        if (seen.has(sig)) continue;
        seen.add(sig);
        out.push({build, result: identify(build)});
      }
    }
    if (chosen.length === 3) return;
    for (let i = start; i < tokens.length; i++) {
      if (i > start && tokens[i] === tokens[i - 1]) continue;
      pick(i + 1, [...chosen, tokens[i]]);
    }
  };
  pick(0, []);
  return out;
}

// The distinct particles a level wants, each with one recipe (all arrows up
// first, so a recipe needs the fewest flips).
export function answers(level) {
  const found = new Map();
  for (const {build, result} of allBuilds(level.tray)) {
    if (!result.ok || !meets(result.particle, level.want)) continue;
    const p = result.particle, flips = build.filter(b => !b.up).length;
    if (!found.has(p.key) || flips < found.get(p.key).build.filter(b => !b.up).length) found.set(p.key, {particle: p, build});
  }
  return [...found.values()];
}

// Where a particle sits on Gell-Mann's chart: across by charge, down by
// strangeness, each row shifted half a step so the rows make a triangle.
export const chartPos = p => ({x: p.charge - p.strangeness / 2, y: -p.strangeness});
