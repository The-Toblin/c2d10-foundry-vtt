/**
 * Extend the basic Die to show custom CD10 icons on a d10.
 * @extends {Die}
 */
export class CeleniaDie extends foundry.dice.terms.Die {
    constructor(termData = {}) {
        termData.faces = 10;
        super(termData);
    }
    roll() {
        const roll = { result: undefined, active: true, success: false, count: 0 };
        roll.result = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);
        if (roll.result === 10) {
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
}
