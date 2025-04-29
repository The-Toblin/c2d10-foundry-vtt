/**
 * Extend the basic Die to show custom CD10 icons on a d10.
 * @extends {Die}
 */

interface TermData {
  number?: any;
  faces?: any;
  modifiers?: string[];
  results?: object[];
  options?: object;
}

export class CeleniaDie extends foundry.dice.terms.Die {
  constructor(termData: TermData = {}) {
    super({
      ...termData,
      faces: 10
    });
  }

  async roll(): Promise<Result> {
    const baseResult = await super.roll({ faces: 10, number: 1 });
    baseResult.evaluate();

    if (diceroll.result === 10) {
      diceroll.result = 0;
    }

    if (diceroll.result > 6) {
      diceroll.success = true;
      diceroll.count = 1;
    }

    if (diceroll.result === 9) {
      diceroll.count += 1;
    }
    this.results.push(diceroll);
    return diceroll;
  }
}
