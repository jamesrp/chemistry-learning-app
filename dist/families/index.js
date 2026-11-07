// Every puzzle family, in the order they appear on the home screen. A new
// family is its own module (levels, How to play lines, a mount function)
// plus one line here.
import {bridges} from './bridges.js';
import {isomers} from './isomers.js';
import {ions} from './ions.js';
import {recycling} from './recycling.js';
import {ice} from './ice.js';
import {spins} from './spins.js';
import {bulbs} from './bulbs.js';
import {laser} from './laser.js';
import {beams} from './beams.js';
import {gears} from './gears.js';
import {overhang} from './overhang.js';

// Chemistry first, then materials, then physics; each family says which shelf it sits on.
export const FAMILIES = [bridges, isomers, ions, recycling, ice, spins, bulbs, laser, beams, gears, overhang];
export const familyById = id => FAMILIES.find(fam => fam.id === id);
