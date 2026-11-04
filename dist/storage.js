// Progress: which levels are solved, kept in this browser only.
const KEY = 'chem-studio:v1';
let cache = null;

function read() {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { cache = {}; }
  if (!cache.solved || typeof cache.solved !== 'object') cache.solved = {};
  return cache;
}
function write() { try { localStorage.setItem(KEY, JSON.stringify(read())); } catch { /* private mode: progress lasts this visit */ } }

export const isSolved = (family, level) => Boolean(read().solved[`${family}/${level}`]);
export function markSolved(family, level) { read().solved[`${family}/${level}`] = true; write(); }
export function clearProgress() { cache = {solved: {}}; write(); }
