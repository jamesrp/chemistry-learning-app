// Count the atoms in a written formula: "(CH₃)₂CO" -> {C: 3, H: 6, O: 1}.
// Subscripts may be Unicode (₂) or plain digits; groups nest in brackets.
const SUB = '₀₁₂₃₄₅₆₇₈₉';
export function atomsIn(formula) {
  const text = formula.replace(/[₀-₉]/g, d => String(SUB.indexOf(d)));
  let i = 0;
  function group() {
    const out = {};
    while (i < text.length && text[i] !== ')') {
      let part;
      if (text[i] === '(') { i++; part = group(); i++; } else {
        const m = /^[A-Z][a-z]?/.exec(text.slice(i));
        if (!m) throw new Error(`Can't read ${formula} at ${i}`);
        part = {[m[0]]: 1}; i += m[0].length;
      }
      const n = /^\d+/.exec(text.slice(i)); const k = n ? Number(n[0]) : 1; if (n) i += n[0].length;
      for (const [el, c] of Object.entries(part)) out[el] = (out[el] || 0) + c * k;
    }
    return out;
  }
  return group();
}
