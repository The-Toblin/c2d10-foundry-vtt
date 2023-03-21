import {c2d10} from "../config.js";
import { getDice } from "../C2D10Utility.js";
import { RegularDie} from "./C2D10RegularDie.js";
import { CrisisDie } from "./C2D10CrisisDie.js";
/**
 * Core dice roller file for handling all types of test.
 * Contains helper functions for resolving things necessary for tests.
 *
 * Exports the rollBasicTest function that allows performing C2D10 tests.
 * This utility file contains a number of internal helper functions saved as constants.
 * Only the final functions are exported for use, and are found at the end of this file.
 */


/**
 *  Counts hits, zeroes, determines messups and complications.
 * @param {object}    mainDice    An object holding all the
 * @param {object}    crisisDice
 * @param {number}    DC             a number, showing the DC for the test.
 * @returns {object}  evaluation results in an object.
 */
const _evaluateSuccesses = async (mainDice = false, crisisDice = false, DC = 0) => {
  const regTotal = mainDice ? mainDice.total : 0;
  const crisisTotal = crisisDice ? crisisDice.total : 0;
  const numOfHits = parseInt(regTotal + crisisTotal);
  const complication = crisisDice ? crisisDice.values.some(x => x === 0) : false;
  const mess = crisisDice ? crisisDice.values.some(x => x === 9) : false;
  const numOfZeroes = mainDice ? mainDice.values.filter(x => x === 0).length : 0;
  const pass = numOfHits >= DC ? "Pass!" : "Fail!";

  return {
    DC: DC,
    pass: pass,
    setbacks: numOfZeroes,
    hits: numOfHits,
    zeroes: numOfZeroes,
    mess: mess,
    complication: complication
  };
};

/**
 * Function to build the rendered list of rolls, marking dice accordingly.
 * @param {object}   mainDice     Object holding the rolled main dice.
 * @param {object}   crisisDice   Object holding the rolled crisis dice.
 * @returns {object}
 */
const _diceList = async (mainDice = false, crisisDice = false) => {
  const results = {
    0: '<li class="roll die d10 failure regular">X',
    7: '<li class="roll die d10 success regular">1',
    8: '<li class="roll die d10 success regular">1',
    9: '<li class="roll die d10 crit regular">2'
  };

  const crisisResults = {
    0: '<li class="roll die d10 complication crisis">X',
    7: '<li class="roll die d10 success crisis">1',
    8: '<li class="roll die d10 success crisis">1',
    9: '<li class="roll die d10 mess crisis">2'
  };

  let rolledList = [];

  let sortMain = [];
  let sortCrisis = [];

  if (mainDice) {
    sortMain = mainDice.values;
    sortMain.sort((a, b) => {
      if (a<b) return -1;
      return 1;
    });

    for (const value of sortMain) {
      rolledList.push(`${results[value] || `<li class="roll die d10 blank regular">${value}`}</li>`);
    }
  }

  if (crisisDice) {
    sortCrisis = crisisDice.values;
    sortCrisis.sort((a, b) => {
      if (a<b) return -1;
      return 1;
    });

    for (const value of sortCrisis) {
      rolledList.push(`${crisisResults[value] || `<li class="roll die d10 blank crisis">${value}`}</li>`);
    }
  }

  let renderList = "";

  const regTotal = mainDice ? mainDice.values.length : 0;
  const crisisTotal = crisisDice ? crisisDice.values.length : 0;
  if (mainDice) {
    renderList +=`
  <div class="c2d10-contentbox force-2px-padding">
    <h3>${game.i18n.localize("c2d10.chat.pool")} (${regTotal})</h3>
    <ol class="dice-rolls centered-list">`;

    for (let i = 0; i < rolledList.length; i++) {
      const content = rolledList[i];
      if (content.includes("regular")) renderList += content;
    }
  }
  renderList +=`
      </ol>
    </div>`;

  if (crisisDice) {
    renderList += `     
    <div class="c2d10-contentbox force-2px-padding">
      <h3>${game.i18n.localize("c2d10.chat.crisis")} (${crisisTotal})</h3>
      <ol class="dice-rolls centered-list">`;

    for (let i = 0; i < rolledList.length; i++) {
      const content = rolledList[i];
      if (content.includes("crisis")) renderList += content;
    }

    renderList +=`
      </ol>
    </div>`;
  }

  return renderList;
};

/**
 * Build the rendered roll template for chat.
 * @param {string} listContents A rendered HTML string showing all dice rolls.
 * @param {object} evaluation   Evaluated roll object. Contains pass, DC, number of hits etc.
 */
const _renderRoll = async (listContents, evaluation) => {
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
          </h2>`;
      if (evaluation.zeroes > 0) outcome += `<h2 class="align-center">Setbacks: ${evaluation.zeroes}</h2>`;
    } else {
      outcome = `
          <h2 class="align-center">
            ${evaluation.pass}
          </h2>`;
      if (evaluation.zeroes > 0) outcome += `<h2 class="align-center">Setbacks: ${evaluation.zeroes}</h2>`;
    }
  }


  const renderedRoll =
  `<div class="dice-roll">
    <div class="dice-result">
        <div class="dice-tooltip expanded align-center">
            <section class="tooltip-part">
                <div class="dice">
                    ${listContents}
                </div>
            </section>
        </div>
        <div class="flex-col flex-start c2d10-contentbox">
            <div class="flex-row flex-between">
                <div class="stat-box">
                    Hits
                </div>
                <div class="value-box">
                    ${evaluation.hits}
                </div>
            </div>
            <div class="flex-row flex-between">
                <div class="stat-box">
                    Excess
                </div>
                <div class="value-box">
                    ${evaluation.hits - evaluation.DC}
                </div>
            </div>
        </div>
        <div class="flex-col flex-start c2d10-contentbox">
          ${outcome}
        </div>
    </div>
  </div>`;

  return renderedRoll;
};

/**
 * Setup, prepare and perform the roll.
 * @param {object} rollData The rolldata delivered from the base function.
 */
const _doRoll = async rollData => {
  let crisis = false;
  const messageTemplate = "systems/c2d10/templates/partials/chat-templates/roll.hbs";
  const bonusDice = getDice();
  const parentLevel = rollData.parent ? rollData.talents[rollData.parent] : 0;
  let fullPool = rollData.parent ? parseInt(rollData.pool + parentLevel + bonusDice) : rollData.pool + bonusDice;
  crisis = rollData.crisis >= fullPool ? fullPool : rollData.crisis;
  if (rollData.focus) fullPool += 1;
  if (rollData.trait > 0) fullPool += rollData.trait;

  const pool = fullPool - crisis > 0 ? parseInt(fullPool - crisis) : 0;
  let rollFormula = "";

  if (pool > 0) rollFormula += `${pool}dr`;
  if (pool > 0 && crisis > 0) {
    rollFormula += ` + ${crisis}ds`;
  } else if (crisis > 0) {
    rollFormula += `${crisis}ds`;
  }

  const theRoll = new Roll(rollFormula);
  const DC = rollData.DC;

  // Execute the roll
  await theRoll.evaluate({async: true});

  const mainDice = theRoll.dice.filter(function(term) {return term instanceof RegularDie;})[0];
  const crisisDice = theRoll.dice.filter(function(term) {return term instanceof CrisisDie;})[0];

  // Evaluate the roll
  const evaluation = await _evaluateSuccesses(mainDice, crisisDice, DC);

  // Create a rendered HTML object holding the dice rolls to present in chat.
  const renderedList = await _diceList(mainDice, crisisDice);

  // Render the actual chat message
  const renderedRoll = await _renderRoll(renderedList, evaluation, crisis);

  // Create the chat message object
  let templateContext = {
    name: game.actors.get(rollData.id).name,
    DC: DC,
    skillName: rollData.item,
    skillLevel: rollData.pool,
    parentName: rollData.parent,
    parentLevel: parentLevel,
    crisis: crisis,
    hits: evaluation.hits,
    complication: evaluation.complication,
    roll: renderedRoll
  };

  let chatData = {
    speaker: ChatMessage.getSpeaker(),
    roll: theRoll,
    content: await renderTemplate(messageTemplate, templateContext),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    sound: CONFIG.sounds.dice
  };

  // Post chat message to chat.
  ChatMessage.create(chatData);

  // If bonus dice were used, clear the bonus tracker.
  if (bonusDice > 0) {
    game.settings.set("c2d10", "bonusDice", 0);
  }
};

/**
 * Perform an acquisition test, rolling just with Economy and nothing else. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {number} pool    The Economy rank to produce a pool of dice.
 * @param {string} actorId The actor's Id.
 */
export async function economyTest(crisis, pool, actorId) {
  const rollData = {};

  rollData.crisis = crisis;
  rollData.item = "economy";
  rollData.pool = pool;
  rollData.id = actorId;
  rollData.DC = rollData.DC = game.settings.get("c2d10", "DC");

  _doRoll(rollData);

}

/**
 * Perform a blank Talent test, rolling just with the Talent and nothing else. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {string} item    The name of the item to roll for.
 * @param {number} pool    The Talent rank to produce a pool of dice. For blank talent tests it to be 2x the talent.
 * @param {string} actorId The actor's Id.
 */
export async function talentTest(crisis, item, pool, actorId) {
  const rollData = {};
  rollData.crisis = crisis;
  rollData.item = item;
  rollData.pool = pool;
  rollData.id = actorId;
  rollData.DC = game.settings.get("c2d10", "DC");

  _doRoll(rollData);
}

/**
 * Perform a Skill test. Will open a dialog to choose parent Talent. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {string} item    The name of the item to roll for.
 * @param {number} pool    The Talent rank to produce a pool of dice.
 * @param {object} talents An object holding all the talents and ranks for the character.
 * @param {string} actorId The actor's Id.
 * @param {string} group   The group the skill belongs to.
 */
export async function skillTest(crisis, item, pool, talents, actorId, group) {
  const rollData = {};

  // Determine which talent is highest in the group, so we can preselect it when opening the dialog.
  const talentObject = game.actors.get(actorId).system.talents[group];
  const highest = Object.keys(talentObject).reduce((a, b) => talentObject[a] > talentObject[b] ? a : b);

  // Populate the needed rolldata
  rollData.talentsList = c2d10.allTalents;
  rollData.pool = parseInt(pool);
  rollData.item = item;
  rollData.crisis = parseInt(crisis);
  rollData.trait = 0;
  rollData.id = actorId;
  rollData.DC = game.settings.get("c2d10", "DC");
  rollData.talents = talents;
  rollData.highest = highest;

  // Create the dialog
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
            rollData.pool = parseInt(html.find("input#pool").val() <= 5 ? parseInt(html.find("input#pool").val()) : 5);
            rollData.crisis = parseInt(html.find("input#crisis").val());
            rollData.parent = html.find("select#parent").val();
            rollData.focus = html.find("input#focus")[0].checked;
            rollData.trait = parseInt(html.find("input#trait").val());
            // Call the roll function
            _doRoll(rollData);}
        }
      }
    },
    dialogOptions
  ).render(true);

}

/**
 * Perform a Power test. Will open a dialog to choose parent Talent. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {string} item    The name of the item to roll for.
 * @param {number} pool    The Talent rank to produce a pool of dice.
 * @param {object} talents An object holding all the talents and ranks for the character.
 * @param {string} actorId The actor's Id.
 */
export async function powerTest(crisis, item, pool, talents, actorId) {
  const rollData = {};

  // Populate the needed rolldata
  rollData.talentsList = c2d10.allTalents;
  rollData.pool = pool;
  rollData.item = item;
  rollData.crisis = crisis;
  rollData.trait = 0;
  rollData.id = actorId;
  rollData.DC = game.settings.get("c2d10", "DC");
  rollData.talents = talents;

  // Create the dialog
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
            rollData.pool = parseInt(html.find("input#pool").val() <= 5 ? parseInt(html.find("input#pool").val()) : 5);
            rollData.crisis = parseInt(html.find("input#crisis").val());
            rollData.parent = html.find("select#parent").val();
            rollData.focus = html.find("input#focus")[0].checked;
            rollData.trait = parseInt(html.find("input#trait").val());
            // Call the roll function
            _doRoll(rollData);}
        }
      }
    },
    dialogOptions
  ).render(true);
}

/**
 * Perform a Health test. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {number} pool    The health ranks to produce a pool of dice.
 * @param {boolean} stress The health (strain or stress) for rolling. True indicates stress, false equals strain.
 * @param {string} actorId The actor's Id.
 */
export async function healthTest(crisis, pool, stress, actorId) {
  const rollData = {};

  rollData.crisis = crisis;
  rollData.item = stress ? "stress" : "strain";
  rollData.pool = pool;
  rollData.id = actorId;
  rollData.DC = rollData.DC = game.settings.get("c2d10", "DC");

  _doRoll(rollData);

}
