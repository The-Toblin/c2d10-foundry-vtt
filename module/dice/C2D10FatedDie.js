import {CeleniaDie} from "./C2D10BaseDie.js";
/**
 * Extend the Celenia base die to show custom CD10 icons on it.
 * @extends {CeleniaDie}
 */
export class FatedDie extends CeleniaDie {

  /** @override */
  static DENOMINATION = "a";

  /** @override */

  roll() {
    const roll = {result: undefined, active: true, success: false, count: 0};
    roll.result = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);

    if (roll.result === 10) {
      roll.result = 0;
    }

    if (roll.result === 1) {
      console.log("=== C2D10: Fated Die resulted in 1, Changing to 0 ===");
      roll.result = 0;
    }

    if (roll.result > 6) {
      roll.success = true;
      roll.count = 1;
    }

    if (roll.result === 9) {
      roll.count += 1;
    }
    this.results.push(roll);
    return roll;
  }

  /** @override */
  getResultLabel(result) {
    return {
      0: '<img src="systems/c2d10/assets/roll-fumble.webp" />',
      1: '<img src="systems/c2d10/assets/roll-fumble.webp" />',
      2: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      3: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      4: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      5: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      6: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      7: '<img src="systems/c2d10/assets/roll-hit.webp" />',
      8: '<img src="systems/c2d10/assets/roll-hit.webp" />',
      9: '<img src="systems/c2d10/assets/roll-crit.webp" />'
    }[result.result];
  }
}
