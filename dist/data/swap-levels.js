// Electron swap levels: rows of atoms ("." empty). A metal and a non-metal
// side by side are joined by a line. Each board has exactly one way to move
// the electrons (tests/swap.test.mjs), and the title is what it makes.
import {fromGrid} from '../chem/swap.js';

export default [
  {id: 'nacl', tier: 'easy', ...fromGrid(['Na Cl'])},
  {id: 'mgo', tier: 'easy', ...fromGrid(['Mg O'])},
  {id: 'mgcl2', tier: 'easy', ...fromGrid(['Cl Mg Cl'])},
  {id: 'na2o', tier: 'easy', ...fromGrid(['Na O Na'])},
  {id: 'alcl3', tier: 'medium', ...fromGrid(['. Cl .', 'Cl Al Cl'])},
  {id: 'li3n', tier: 'medium', ...fromGrid(['. Li .', 'Li N Li'])},
  {id: 'al2o3', tier: 'medium', ...fromGrid(['O Al O Al O'])},
  {id: 'mg3n2', tier: 'medium', ...fromGrid(['Mg N Mg N Mg'])},
  {id: 'calcium', tier: 'medium', ...fromGrid(['Cl Ca Cl', 'Ca . Ca', 'N Ca N'])},
  {id: 'lithium-calcium', tier: 'medium', ...fromGrid(['Cl . Cl', 'Li Cl Ca', 'Cl Li .'])},
  {id: 'oxides', tier: 'hard', ...fromGrid(['Al O Al', 'O Na O', 'Na O .'])},
  {id: 'alumina', tier: 'hard', ...fromGrid(['Al O Al O', 'O . O .', 'Al O Al O'])},
  {id: 'three-salts', tier: 'hard', ...fromGrid(['Ca Cl Li', 'Cl Li Cl', 'Li N Li'])},
  {id: 'magnesium', tier: 'hard', ...fromGrid(['. . N Mg', 'Mg Cl Mg Na', 'Cl Mg N Cl'])},
];
