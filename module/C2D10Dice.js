import {c2d10} from "./config.js";
import { getDice } from "./C2D10Utility.js";
import { CeleniaDie, CrisisDie } from "./dice.js";
/**
 * Core dice roller file for handling all types of test.
 * Contains helper functions for resolving things necessary for tests.
 *
 * Exports the rollBasicTest function that allows performing C2D10 tests.
 * This utility file contains a number of internal helper functions saved as constants.
 * Only a single function is exported for use, and it is found at the end of this file.
 */


/**
 *  Counts hits, zeroes, determines messups and complications.
 * @param {object}    mainDice    An object holding all the
 * @param {object}    crisisDice
 * @param {number}    DC             a number, showing the DC for the test.
 * @returns {object}  evaluation results in an object.
 */
const _evaluateSuccesses = async (mainDice, crisisDice, DC) => {
  let numOfHits = 0;
  let complication = false;
  let mess = false;
  let numOfZeroes = 0;

  for (let i = 0; i < mainDice.results.length; i++) {
    if (mainDice.results[i].result === 9) {
      numOfHits += 2;
    } else if (mainDice.results[i].result > 6) {
      numOfHits += 1;
    } else if (mainDice.results[i].result === 0) {
      numOfZeroes += 1;
    }
  }

  if (typeof crisisDice !== "undefined") {
    for (let i = 0; i < crisisDice.results.length; i++) {
      if (crisisDice.results[i].result === 9) {
        numOfHits += 2;
        mess = true;
      } else if (crisisDice.results[i].result > 6) {
        numOfHits += 1;
      } else if (crisisDice.results[i].result === 0) {
        complication = true;
      }
    }
  }

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
const _diceList = async (mainDice, crisisDice) => {
  const results = {
    0: '<li class="roll die d10 failure regular">',
    7: '<li class="roll die d10 success regular">',
    8: '<li class="roll die d10 success regular">',
    9: '<li class="roll die d10 crit regular">'
  };

  const crisisResults = {
    0: '<li class="roll die d10 complication crisis">',
    7: '<li class="roll die d10 success crisis">',
    8: '<li class="roll die d10 success crisis">',
    9: '<li class="roll die d10 mess crisis">'
  };

  let rolledList = "";


  for (let i = 0; i < mainDice.results.length; i++) {
    rolledList += `${results[mainDice.results[i].result] || '<li class="roll die d10 blank regular">'} ${mainDice.results[i].result} </li>`;
  }

  if (typeof crisisDice !== "undefined") {
    for (let i = 0; i < crisisDice.results.length; i++) {
      rolledList += `${crisisResults[crisisDice.results[i].result] || '<li class="roll die d10 blank crisis">'} ${crisisDice.results[i].result} </li>`;
    }
  }

  /* Sort the list of rolls according to results, starting from zeroes and up.
  * Finally, split the array in two and sort crisis dice for themselves at the end,
  * if crisis is greater than 0.
  */
  const re = /<li class="roll die d10 [a-z]{4,12} (crisis|regular)"> [0-9] <\/li>/g;
  const reArray = rolledList.match(re);

  reArray.sort(function(a, b) {
    const re = /> [0-9] </g;
    if (a.match(re) < b.match(re)) {
      return -1;
    }
    if (a.match(re) > b.match(re)) {
      return 1;
    }
    return 0;
  });

  let sortedList = "";

  sortedList +=`
  <div class="c2d10-contentbox force-2px-padding">
    <h3>${game.i18n.localize("c2d10.chat.pool")}</h3>
    <ol class="dice-rolls centered-list">`;

  for (let i = 0; i < reArray.length; i++) {
    const content = reArray[i];
    if (content.includes("regular")) sortedList += content;
  }

  sortedList +=`
      </ol>
    </div>`;

  if (typeof crisisDice !== "undefined") {

    sortedList += `     
    <div class="c2d10-contentbox force-2px-padding">
      <h3>${game.i18n.localize("c2d10.chat.crisis")}</h3>
      <ol class="dice-rolls centered-list">`;

    for (let i = 0; i < reArray.length; i++) {
      const content = reArray[i];
      if (content.includes("crisis")) sortedList += content;
    }

    sortedList +=`
      </ol>
    </div>`;
  }

  return sortedList;
};

/**
 * Build the rendered roll template for chat.
 * @param {string} formula      The rollformula, so it can be presented.
 * @param {string} listContents A rendered HTML string showing all dice rolls.
 * @param {object} evaluation   Evaluated roll object. Contains pass, DC, number of hits etc.
 * @param {number} crisis       A character's current crisis.
 */
const _renderRoll = async (formula, listContents, evaluation, crisis) => {
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

  const pool = fullPool - crisis > 0 ? parseInt(fullPool - crisis) : crisis;

  const targetNumber = 7;
  let rollFormula = `${pool}drcs>=${targetNumber}`;

  if (crisis > 0) rollFormula += ` + ${crisis}dccs>=${targetNumber}`;
  const theRoll = new Roll(rollFormula);
  const DC = rollData.DC;

  // Execute the roll
  await theRoll.evaluate({async: true});

  // Turn 1-10 into 0-9.
  const mainDice = theRoll.dice.filter(function(term) {return term instanceof CeleniaDie;})[0];
  const crisisDice = theRoll.dice.filter(function(term) {return term instanceof CrisisDie;})[0];

  for (let i = 0; i < mainDice.results.length; i++) {
    mainDice.results[i].result -= 1;
  }

  if (crisis) {
    for (let i = 0; i < crisisDice.results.length; i++) {
      crisisDice.results[i].result -= 1;
    }
  }

  // Evaluate the roll
  const evaluation = await _evaluateSuccesses(mainDice, crisisDice, DC);

  // Create a rendered HTML object holding the dice rolls to present in chat.
  const renderedList = await _diceList(mainDice, crisisDice);

  // Render the actual chat message
  const renderedRoll = await _renderRoll(rollFormula, renderedList, evaluation, crisis);

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
 * Perform a Wealth test, rolling just with Wealth and nothing else. Takes Crisis into account.
 * @param {number} crisis  The character's current value in Crisis.
 * @param {number} pool    The Wealth rank to produce a pool of dice.
 * @param {string} actorId The actor's Id.
 */
export async function wealthTest(crisis, pool, actorId) {
  const rollData = {};

  rollData.crisis = crisis;
  rollData.item = "wealth";
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
