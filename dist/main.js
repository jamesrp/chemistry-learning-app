// Chem Studio: the home screen (chemistry, materials and physics shelves), a play screen per level and the Grown-ups
// notes, routed by the address hash (#/bridges/3, #/grownups).
import {FAMILIES, familyById} from './families/index.js';
import {NOTES} from './notes.js';
import {isSolved, markSolved, clearProgress} from './storage.js';
import {h} from './ui.js';

const app = document.getElementById('app');
const TIERS = [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']];
const SHELVES = [['chemistry', 'Chemistry'], ['materials', 'Materials'], ['physics', 'Physics']];
const shelfOf = fam => fam.shelf || 'chemistry';
let current = null;

function route() {
  current = null;
  const [, a, b] = location.hash.split('/');
  const fam = familyById(a);
  if (a === 'grownups') return grownups();
  if (fam && fam.levels[Number(b) - 1]) return play(fam, Number(b) - 1);
  return home();
}

function home() {
  document.title = 'Chem Studio';
  const main = h('main', {class: 'shell home'}, h('h1', {class: 'app-title'}, 'Chem Studio'));
  for (const [shelf, label] of SHELVES) {
    const fams = FAMILIES.filter(fam => shelfOf(fam) === shelf);
    if (!fams.length) continue;
    main.append(h('h2', {class: 'shelf-title'}, label));
    for (const fam of fams) {
      const section = h('section', {class: 'family'}, h('h3', {}, fam.name));
      for (const [tier, tierLabel] of TIERS) {
        const levels = fam.levels.map((lv, i) => [lv, i]).filter(([lv]) => lv.tier === tier);
        if (!levels.length) continue;
        section.append(h('div', {class: 'tier'}, h('span', {class: 'tier-label'}, tierLabel),
          h('div', {class: 'tier-levels'}, levels.map(([lv, i]) => h('a', {
            class: `level ${isSolved(fam.id, lv.id) ? 'solved' : ''}`, href: `#/${fam.id}/${i + 1}`,
            'aria-label': `${fam.name} ${i + 1}${isSolved(fam.id, lv.id) ? ', solved' : ''}`,
          }, String(i + 1))))));
      }
      main.append(section);
    }
  }
  main.append(h('p', {class: 'foot'}, h('a', {href: '#/grownups'}, 'Grown-ups')));
  app.replaceChildren(main);
  window.scrollTo(0, 0);
}

function play(fam, index) {
  const level = fam.levels[index];
  document.title = `${fam.name} ${index + 1} · Chem Studio`;
  const board = h('section', {class: `board-panel fam-${fam.id}`});
  const feedback = h('p', {class: 'feedback', 'aria-live': 'polite'});
  const solvedStrip = h('div', {class: 'solved-strip', hidden: true});
  const undo = h('button', {type: 'button', class: 'tool', onclick: () => current?.undo()}, 'Undo');
  const restart = h('button', {type: 'button', class: 'tool', onclick: () => { solvedStrip.hidden = true; current?.restart(); }}, 'Restart');
  const hint = h('button', {type: 'button', class: 'tool hint', onclick: () => current?.hint()}, 'Hint');
  const how = h('button', {type: 'button', class: 'tool', 'aria-label': 'How to play', onclick: () => howTo(fam)}, '?');
  const top = h('header', {class: 'play-top'},
    h('a', {class: 'tool home-link', href: '#/', 'aria-label': 'All puzzles'}, '←'),
    h('span', {class: 'level-no', 'aria-label': `${fam.name}, puzzle ${index + 1}`}, String(index + 1)),
    h('span', {class: 'spacer'}), undo, restart, hint, how);
  app.replaceChildren(h('main', {class: 'shell play'}, top, board, feedback, solvedStrip));
  window.scrollTo(0, 0);

  const ctx = {
    changed({canUndo}) { undo.disabled = !canUndo; },
    feedback(text) { feedback.textContent = text || ''; feedback.classList.toggle('shown', Boolean(text)); },
    solved({title, detail}) {
      markSolved(fam.id, level.id);
      undo.disabled = true; hint.disabled = true;
      feedback.textContent = ''; feedback.classList.remove('shown');
      const next = index + 1 < fam.levels.length ? `#/${fam.id}/${index + 2}` : '#/';
      solvedStrip.replaceChildren(
        h('div', {class: 'solved-text'}, h('strong', {class: 'solved-title'}, title), detail ? h('span', {class: 'solved-detail'}, detail) : null),
        h('a', {class: 'primary next', href: next}, index + 1 < fam.levels.length ? 'Next' : 'Done'));
      solvedStrip.hidden = false;
      solvedStrip.querySelector('.next').focus({preventScroll: true});
    },
  };
  const wrapRestart = () => { hint.disabled = false; };
  restart.addEventListener('click', wrapRestart);
  current = fam.mount(board, level, ctx);
}

function howTo(fam) {
  const dialog = h('dialog', {class: 'howto', 'aria-label': 'How to play'},
    h('h2', {}, fam.name), ...fam.howTo.map(line => h('p', {}, line)),
    h('form', {method: 'dialog'}, h('button', {class: 'primary', type: 'submit'}, 'Done')));
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
}

function grownups() {
  document.title = 'Grown-ups · Chem Studio';
  const main = h('main', {class: 'shell notes'},
    h('header', {class: 'play-top'}, h('a', {class: 'tool home-link', href: '#/', 'aria-label': 'All puzzles'}, '←')),
    h('h1', {}, 'Grown-ups'));
  for (const [shelf, label] of SHELVES) {
    const fams = FAMILIES.filter(fam => shelfOf(fam) === shelf);
    if (!fams.length) continue;
    main.append(h('h2', {class: 'shelf-title'}, label));
    for (const fam of fams) {
      const n = fam.notes || NOTES[fam.id];
      main.append(h('section', {class: 'note'}, h('h2', {}, fam.name),
        h('h3', {}, shelf === 'physics' ? 'The physics' : shelf === 'materials' ? 'The science' : 'The chemistry'), h('p', {}, n.science || n.chemistry),
        h('h3', {}, 'The mathematics'), h('p', {}, n.maths),
        h('h3', {}, 'Careful'), h('p', {}, n.caution),
        h('h3', {}, 'At the kitchen table'), h('p', {}, n.kitchen),
        h('details', {}, h('summary', {}, 'How to play'), ...fam.howTo.map(line => h('p', {}, line)))));
    }
  }
  const clear = h('button', {type: 'button', class: 'secondary', onclick: () => {
    if (clear.dataset.armed) { clearProgress(); clear.textContent = 'Cleared'; clear.disabled = true; return; }
    clear.dataset.armed = '1'; clear.textContent = 'Tap again to clear all progress';
  }}, 'Clear progress');
  main.append(h('section', {class: 'note'}, h('h2', {}, 'Progress'), h('p', {}, 'Solved puzzles are kept in this browser only.'), clear));
  app.replaceChildren(main);
  window.scrollTo(0, 0);
}

addEventListener('hashchange', route);
route();
