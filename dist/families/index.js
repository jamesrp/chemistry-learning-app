// Every puzzle family, in the order they appear on the home screen. A new
// family is its own module (levels, How to play lines, a mount function)
// plus one line here.
import {bridges} from './bridges.js';
import {isomers} from './isomers.js';
import {mystery} from './mystery.js';
import {ions} from './ions.js';
import {swap} from './swap.js';
import {recycling} from './recycling.js';
import {ice} from './ice.js';
import {rings} from './rings.js';
import {spins} from './spins.js';
import {cells} from './cells.js';
import {bulbs} from './bulbs.js';
import {laser} from './laser.js';
import {beams} from './beams.js';
import {gears} from './gears.js';
import {overhang} from './overhang.js';
import {quarks} from './quarks.js';
import {forge} from './forge.js';

// Chemistry first, then materials, then physics, then particles and nuclei; each family says which shelf it sits on.
export const FAMILIES = [bridges, isomers, mystery, ions, recycling, ice, rings, swap, spins, cells, bulbs, laser, beams, gears, overhang, quarks, forge];
export const familyById = id => FAMILIES.find(fam => fam.id === id);
