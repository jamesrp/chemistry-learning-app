// Placeholder until the Overhang board lands.
export const overhang = {
  id: 'overhang',
  name: 'Overhang',
  shelf: 'physics',
  levels: [],
  howTo: [],
  notes: {science: '', maths: '', caution: '', kitchen: ''},
  mount() { return {undo() {}, restart() {}, hint() {}}; },
};
