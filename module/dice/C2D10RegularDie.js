import {CeleniaDie} from "./C2D10BaseDie.js";
/**
 * Extend the Celenia base die to show custom CD10 icons on it.
 * @extends {CeleniaDie}
 */
export class RegularDie extends CeleniaDie {

  /** @override */
  static DENOMINATION = "r";

  /** @override */
  getResultLabel(result) {
    return {
      0: '<img src="systems/c2d10/assets/roll-fumble.webp"/>',
      1: '<img src="systems/c2d10/assets/roll-miss.webp"/>',
      2: '<img src="systems/c2d10/assets/roll-miss.webp"/>',
      3: '<img src="systems/c2d10/assets/roll-miss.webp"/>',
      4: '<img src="systems/c2d10/assets/roll-miss.webp"/>',
      5: '<img src="systems/c2d10/assets/roll-miss.webp"/>',
      6: '<img src="systems/c2d10/assets/roll-miss.webp"/>',
      7: '<img src="systems/c2d10/assets/roll-hit.webp"/>',
      8: '<img src="systems/c2d10/assets/roll-hit.webp"/>',
      9: '<img src="systems/c2d10/assets/roll-crit.webp"/>'
    }[result.result];
  }
}
