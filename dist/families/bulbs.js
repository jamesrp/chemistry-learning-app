// Placeholder until the Bulb boards board lands.
export const bulbs = {
  id: 'bulbs',
  name: 'Bulb boards',
  shelf: 'physics',
  levels: [],
  howTo: [],
  notes: {science: '', maths: '', caution: '', kitchen: ''},
  mount() { return {undo() {}, restart() {}, hint() {}}; },
};
