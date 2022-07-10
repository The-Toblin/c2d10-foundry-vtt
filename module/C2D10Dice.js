import {c2d10} from "./config.js";
import { getDice } from "./C2D10Utility.js";
/**
 * Core dice roller file for handling all types of test.
 * Contains helper functions for resolving things necessary for tests.
 *
 * Exports the rollBasicTest function that allows performing C2D10 tests.
 * This utility file contains a number of internal helper functions saved as constants.
 * Only a single function is exported for use, and it is found at the end of this file.
 */


/**
 *  Counts successes, zeroes, determines messups and complications.
 * @param {object}    rolledResults  an array holding the rolled results from the dice roll.
 * @param {number}    DC             a number, showing the DC for the test.
 * @param {number}    crisis         a character's current crisis for the test.
 * @returns {object}  evaluation results in an object.
 */
const _evaluateSuccesses = async (rolledResults, DC, crisis = 0) => {
  let numOfSuccess = 0;
  let complication = false;
  let mess = false;
  let numOfZeroes = 0;

  for (let i = 0; i < rolledResults.length - crisis; i++) {
    if (rolledResults[i].result === 9) {
      numOfSuccess += 2;
    } else if (rolledResults[i].result > 6) {
      numOfSuccess += 1;
    } else if (rolledResults[i].result === 0) {
      numOfZeroes += 1;
    }
  }

  for (let i = rolledResults.length - crisis; i < rolledResults.length; i++) {
    if (rolledResults[i].result === 9) {
      numOfSuccess += 2;
      mess = true;
    } else if (rolledResults[i].result > 6) {
      numOfSuccess += 1;
    } else if (rolledResults[i].result === 0) {
      complication = true;
    }
  }

  const pass = numOfSuccess >= DC ? "Pass!" : "Fail!";

  return {
    DC: DC,
    pass: pass,
    setbacks: numOfZeroes,
    successes: numOfSuccess,
    zeroes: numOfZeroes,
    mess: mess,
    complication: complication
  };
};

/**
 * Function to build the rendered list of rolls, marking dice accordingly.
 * @param {Array} diceRolls  List of the rolled results.
 * @param {number} crisis     The character's current crisis.
 * @returns {object}
 */
const _diceList = async (diceRolls, crisis = 0) => {
  const results = {
    0: '<li class="roll die d10 failure">',
    7: '<li class="roll die d10 success">',
    8: '<li class="roll die d10 success">',
    9: '<li class="roll die d10 crit">'
  };

  const crisisResults = {
    0: '<li class="roll die d10 complication">',
    7: '<li class="roll die d10 success">',
    8: '<li class="roll die d10 success">',
    9: '<li class="roll die d10 mess">'
  };

  let rolledList = "";


  for (let i = 0; i < diceRolls.length - crisis; i++) {
    rolledList += `${results[diceRolls[i].result] || '<li class="roll die d10">'} ${diceRolls[i].result} </li>`;
  }

  for (let i = diceRolls.length - crisis; i < diceRolls.length; i++) {
    rolledList += `${crisisResults[diceRolls[i].result] || '<li class="roll die crisis d10">'} ${diceRolls[i].result} </li>`;
  }

  return rolledList;
};

/**
 * Build the rendered roll template for chat.
 * @param {string} formula      The rollformula, so it can be presented.
 * @param {string} listContents A rendered HTML string showing all dice rolls.
 * @param {object} evaluation   Evaluated roll object. Contains pass, DC, number of successes etc.
 * @param {number} crisis       A character's current crisis.
 */
const _renderRoll = async (formula, listContents, evaluation, crisis) => {
  let outcome = "";

  if (evaluation.pass === "Pass!") {
    if (evaluation.mess) {
      outcome = `
          <h2 class="align-center">
            Mess up!
          </h2>`;
    } else if (evaluation.complication) {
      outcome = `
          <h2 class="align-center">
            Pass with complication!
          </h2>`;
    } else {
      outcome = `
          <h2 class="align-center">
            ${evaluation.pass}
          </h2>`;
    }
  } else if (evaluation.pass === "Fail!") {
    if (evaluation.complication) {
      outcome = `
          <h2 class="align-center">
            Failure with complication!
          </h2>
          <h2 class="align-center">
            Setbacks: ${evaluation.zeroes}
          </h2>`;
    } else {
      outcome = `
          <h2 class="align-center">
            ${evaluation.pass}
          </h2>
          <h2 class="align-center">
            Setbacks: ${evaluation.zeroes}
          </h2>`;
    }
  }

  const renderedRoll =
      `<div class="dice-roll">
        <div class="dice-result">
          <div class="dice-formula">
            ${formula}
          </div>
          <div class="dice-tooltip expanded">
            <section class="tooltip-part">
              <div class="dice">
                <ol class="dice-rolls">
                  ${listContents}
                </ol>
              </div>
            </section>
          </div>
          <hr>
          <div class="flex-col flex-start">
            <div class="flex-row flex-between">
              <div class="stat-box">
                Successes
              </div>
              <div class="value-box">
                ${evaluation.successes}
              </div>
            </div>
            <div class="flex-row flex-between">
              <div class="stat-box">
                Excess
              </div>
              <div class="value-box">
                ${evaluation.successes - evaluation.DC}
              </div>
            </div>
            <div class="flex-row flex-between">
              <div class="stat-box">
                Crisis
              </div>
              <div class="value-box">
                ${crisis}
              </div>
            </div>
          </div>
        </div>
      </div>
        ${outcome}
      </div>`;
  return renderedRoll;
};

/**
 * Setup, prepare and perform the roll.
 * @param {object} rollData The rolldata delivered from the base function.
 */
const _doRoll = async rollData => {
  const messageTemplate = "systems/c2d10/templates/partials/chat-templates/roll.hbs";
  const parentLevel = rollData.parent ? rollData.talents[rollData.parent] : 0;
  const bonusDice = getDice();
  let pool = rollData.parent ? parseInt(rollData.pool + parentLevel + bonusDice) : rollData.pool + bonusDice;
  if (pool > 10) pool = 10;
  const crisis = rollData.crisis > pool ? pool : rollData.crisis;
  const targetNumber = 7;
  const rollFormula = `${pool}d10cs>=${targetNumber}`;
  const theRoll = new Roll(rollFormula);
  const DC = rollData.DC;


  // Execute the roll
  await theRoll.evaluate({async: true});

  // Turn 1-10 into 0-9.
  for (let i = 0; i < pool; i++) {
    theRoll.terms[0].results[i].result -= 1;
  }

  // Evaluate the roll
  const evaluation = await _evaluateSuccesses(theRoll.terms[0].results, DC, crisis);

  // Create a rendered HTML object holding the dice rolls to present in chat.
  const renderedList = await _diceList(theRoll.terms[0].results, crisis);

  // Render the actual chat message
  const renderedRoll = await _renderRoll(rollFormula, renderedList, evaluation, crisis);

  // Create the chat message object
  let templateContext = {
    DC: DC,
    skillName: rollData.item,
    skillLevel: rollData.pool,
    parentName: rollData.parent,
    parentLevel: parentLevel,
    crisis: crisis,
    successes: evaluation.successes,
    complication: evaluation.complication,
    roll: renderedRoll
  };

  let chatData = {
    speaker: ChatMessage.getSpeaker(),
    roll: theRoll,
    content: await renderTemplate(messageTemplate, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
  };

  // Post chat message to chat.
  ChatMessage.create(chatData);


  // If the roll was a strain or stress test, clear the respective stat.
  if (rollData.item === "strain" || rollData.item === "stress") {
    const actor = game.actors.get(rollData.id);
    try {
      await actor.resetHealth(evaluation.pass, rollData.item);
    } catch(err) {
      console.error("Updating actor failed!", err);
    }
  }

  // If bonus dice were used, clear the bonus tracker.
  if (bonusDice > 0) {
    game.settings.set("c2d10", "bonusDice", 0);
  }
};

/**
 * Perform a Wealth test, rolling just with Wealth and nothing else. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {number} pool    The Wealth rank to produce a pool of dice.
 */
export async function wealthTest(crisis, pool) {
  const rollData = {};

  rollData.crisis = crisis;
  rollData.item = "wealth";
  rollData.pool = pool;
  rollData.DC = rollData.DC = game.settings.get("c2d10", "DC");
  rollData.type = "wealth";
  _doRoll(rollData);

}

/**
 * Perform a Health test (Strain or Stress). Takes Crisis into account.
 * @param {number}  crisis    The character's current value in Crisis.
 * @param {boolean} strain    If it's Strain to roll for. If not, defaults to Stress.
 * @param {number}  pool      The value of the relevant Talent (Endurance or Willpower)
 * @param {number}  DC        The amount of Strain or Stress the character has, setting difficulty for the test.
 * @param {string}  actorId   The actor's Id, used to call the resethealth function.
 */
export async function healthTest(crisis, strain, pool, DC, actorId) {
  const rollData = {};

  rollData.crisis = crisis;
  rollData.item = strain ? "strain" : "stress";
  rollData.pool = pool;
  rollData.DC = DC;
  rollData.id = actorId;
  rollData.type = "health";
  _doRoll(rollData);

}

/**
 * Perform a blank Talent test, rolling just with the Talent and nothing else. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {string} item    The name of the item to roll for.
 * @param {number} pool    The Talent rank to produce a pool of dice.
 */
export async function talentTest(crisis, item, pool) {
  const rollData = {};
  rollData.crisis = crisis;
  rollData.item = item;
  rollData.pool = pool;
  rollData.DC = game.settings.get("c2d10", "DC");
  rollData.type = "talent";
  _doRoll(rollData);
}

/**
 * Perform a Skill test. Will open a dialog to choose parent Talent. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {string} item    The name of the item to roll for.
 * @param {number} pool    The Talent rank to produce a pool of dice.
 * @param {object} talents An object holding all the talents and ranks for the character.
 */
export async function skillTest(crisis, item, pool, talents) {
  const rollData = {};

  rollData.talentsList = c2d10.allTalents;
  rollData.pool = pool;
  rollData.item = item;
  rollData.crisis = crisis;
  rollData.DC = game.settings.get("c2d10", "DC");
  rollData.type = "skill";
  rollData.talents = talents;

  const dialogOptions = {
    classes: ["c2d10-dialog", "roll"],
    top: 300,
    left: 400
  };

  new Dialog(
    {
      title: `Make ${item} test`,
      content: await renderTemplate("systems/c2d10/templates/dialogs/roll-test-dialog.hbs", rollData),
      buttons: {
        roll: {
          label: "Roll!",
          callback: html => {
            rollData.pool = html.find("input#pool").val() <= 5 ? parseInt(html.find("input#pool").val()) : 5;
            rollData.crisis = html.find("input#crisis").val();
            rollData.parent = html.find("select#parent").val();
            _doRoll(rollData);}
        }
      }
    },
    dialogOptions
  ).render(true);
}
