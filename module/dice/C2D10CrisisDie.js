import {CeleniaDie} from "./C2D10BaseDie.js";
/**
 * Extend the Celenia base die to show custom CD10 icons on it.
 * @extends {CeleniaDie}
 */
export class CrisisDie extends CeleniaDie {

  /** @override */
  static DENOMINATION = "s";

  /** @override */
  getResultLabel(result) {
    return {
      1: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      2: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      3: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      4: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      5: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      6: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      7: '<img src="systems/c2d10/assets/crisis-hit.webp" />',
      8: '<img src="systems/c2d10/assets/crisis-hit.webp" />',
      9: '<img src="systems/c2d10/assets/crisis-crit.webp" />',
      10: '<img src="systems/c2d10/assets/crisis-fumble.webp" />'
    }[result.result];
  }
}
