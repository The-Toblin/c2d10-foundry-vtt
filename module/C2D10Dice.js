import {c2d10} from "./config.js";
import { getDice } from "./C2D10Utility.js";
/**
 * Core dice roller class for handling all types of test.
 * Contains helper functions for resolving things necessary for tests.
 *
 * Exports three functions for handling basic skill tests, strain and stress tests.
 */


/**
 *
 * @param {*} rolledResults
 * @param {*} DC
 * @param {*} crisis
 * @returns
 */
const evaluateSuccesses = async (rolledResults, DC, crisis = 0) => {
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
 *
 * @param {*} diceRolls
 * @param {*} crisis
 * @returns
 */
const diceList = async (diceRolls, crisis = 0) => {
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
 *
 * @param formula
 * @param diceRolls
 * @param evaluation
 * @param crisis
 */
const renderRoll = async (formula, diceRolls, evaluation, crisis) => {
  const listContents = await diceList(diceRolls, crisis);
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
 *  Setup, prepare and perform the roll.
 * @param {object} html     Form data from the dialog
 * @param {object} rollData The rolldata delivered from the sheet.
 */
const doRoll = async rollData => {
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

  const evaluation = await evaluateSuccesses(theRoll.terms[0].results, DC, crisis);
  const renderedRoll = await renderRoll(rollFormula, theRoll.terms[0].results, evaluation, crisis);

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

  ChatMessage.create(chatData);

  if (rollData.item === "strain" || rollData.item === "stress") {
    const actor = game.actors.get(rollData.id);
    try {
      await actor.resetHealth(evaluation.pass, rollData.item);
    } catch(err) {
      console.error("Updating actor failed!", err);
    }
  }

  if (bonusDice > 0) {
    game.settings.set("c2d10", "bonusDice", 0);
  }
};

const checkIfHealth = async name => {
  const health = ["strain", "stress"];

  for (const healthName of health) {
    if (healthName === name) return true;
  }
  return false;
};

const checkIfTalent = async (name, talents) => {
  const tal = Object.keys(talents);

  for (const talName of tal) {
    if (talName === name) return true;
  }
  return false;
};

/**
 *  Base test function. Performs a test with a talent or skill.
 * @param {object} rollData The provided rollData from the sheet.
 */
export const Test = async rollData => {

  if (await checkIfHealth(rollData.item)) {
    rollData.DC = rollData.item === "strain" ? rollData.strain : rollData.stress;
    rollData.pool = rollData.item === "strain" ? rollData.talents.endurance : rollData.talents.willpower;

    doRoll(rollData);
  } else if (await checkIfTalent(rollData.item, rollData.talents)) {
    rollData.pool = rollData.talents[rollData.item];
    rollData.talentsList = false;
    rollData.DC = game.settings.get("c2d10", "DC");

    doRoll(rollData);
  }
  else {
    rollData.talentsList = c2d10.allTalents;
    rollData.pool = rollData.skills[rollData.item];

    const dialogOptions = {
      classes: ["c2d10-dialog", "roll"],
      top: 300,
      left: 400
    };

    new Dialog(
      {
        title: `Make ${rollData.item} test`,
        content: await renderTemplate("systems/c2d10/templates/dialogs/roll-test-dialog.hbs", rollData),
        buttons: {
          roll: {
            label: "Roll!",
            callback: html => {
              rollData.pool = html.find("input#pool").val() <= 5 ? parseInt(html.find("input#pool").val()) : 5;
              rollData.crisis = html.find("input#crisis").val();
              rollData.parent = html.find("select#parent").val();
              rollData.DC = game.settings.get("c2d10", "DC");
              doRoll(rollData);}
          }
        }
      },
      dialogOptions
    ).render(true);
  }};
