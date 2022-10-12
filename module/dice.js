/**
 * Extend the basic Die to show custom CD10 icons on a d10.
 * @extends {Die}
 */
export class CeleniaDie extends Die {
  constructor(termData) {
    termData.faces = 10;
    super(termData);
  }

  /** @override */
  static DENOMINATION = "r";

  /** @override */
  static getResultLabel(result) {
    return {
      1: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      2: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      3: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      4: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      5: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      6: '<img src="systems/c2d10/assets/roll-miss.webp" />',
      7: '<img src="systems/c2d10/assets/roll-hit.webp" />',
      8: '<img src="systems/c2d10/assets/roll-hit.webp" />',
      9: '<img src="systems/c2d10/assets/roll-crit.webp" />',
      10: '<img src="systems/c2d10/assets/roll-fumble.webp" />'
    }[result];
  }
}

/**
 * Extend the basic Die to show custom Crisis icons on a d10.
 * @extends {Die}
 */
export class CrisisDie extends Die {
  constructor(termData) {
    termData.faces = 10;
    super(termData);
  }

  /** @override */
  static DENOMINATION = "c";

  /** @override */
  static getResultLabel(result) {
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
    }[result];
  }
}
