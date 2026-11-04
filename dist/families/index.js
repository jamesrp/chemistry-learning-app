// Every puzzle family, in the order they appear on the home screen. A new
// family is its own module (levels, How to play lines, a mount function)
// plus one line here.
import {bridges} from './bridges.js';
import {isomers} from './isomers.js';
import {ions} from './ions.js';
import {recycling} from './recycling.js';
import {ice} from './ice.js';

export const FAMILIES = [bridges, isomers, ions, recycling, ice];
export const familyById = id => FAMILIES.find(fam => fam.id === id);
