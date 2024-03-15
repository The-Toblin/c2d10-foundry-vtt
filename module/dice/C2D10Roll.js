import {c2d10} from "../config.js";
import { getDice } from "../C2D10Utility.js";
import { RegularDie} from "./C2D10RegularDie.js";
import { CrisisDie } from "./C2D10CrisisDie.js";
import { FatedDie } from "./C2D10FatedDie.js";
/**
 * Core dice roller file for handling all types of test.
 * Contains helper functions for resolving things necessary for tests.
 *
 * Exports the rollBasicTest function that allows performing C2D10 tests.
 * This utility file contains a number of internal helper functions saved as constants.
 * Only the final functions are exported for use, and are found at the end of this file.
 */

// TODO: Rework this entire file to account for new health system. Just log minimum damage and number of hits.
// Also rework for new global crisis

/**
 * Perform a test. Will open a dialog to choose the second pool item. Takes Crisis into account.
 * @param {string}  actorId             The actor's Id.
 * @param {string}  type                The type of item being rolled for as pool 1 (talent, skill, power, other).
 * @param {string}  group               The group the item belongs to (physical, mental etc).
 * @param {string}  pool1Name           The name of the item being rolled for.
 * @param {string}  pool1Level          The size of the rolled (Pool1) item.
 * @param {number}  damage              If the roll is an attack, we include the damage of the weapon being used.
 * @param {number}  hits                If the roll is an attack, we include the number of hits from the attacker.
 */
export async function rollTest(actorId,
  type,
  group,
  pool1Name,
  pool1Level,
  damage,
  hits) {

  const rollData = {};
  /*
  * Based on what was clicked on the sheet, there is an ideal pre-selected companion for the roll.
  * We will here determine the best pre-selected item for talent tests and skill tests,
  * but leave it set to "none" for anything else.
  */

  let preSelectedTalent;
  let preSelectedSkill;
  let attackSkillList = {};

  if (pool1Name === "economy") {
    // For acquisition tests, these are usually performed with a matching social talent, so we select the highest.
    const talentObject = game.actors.get(actorId).system.talents.social;
    preSelectedTalent = Object.keys(talentObject).reduce((a, b) => talentObject[a] > talentObject[b] ? a : b);

  }
  else if (type === "skills") {
    // For skill tests, the ideal pre-selected item is the highest talent in the matching group.
    const talentObject = game.actors.get(actorId).system.talents[group];
    preSelectedTalent = Object.keys(talentObject).reduce((a, b) => talentObject[a] > talentObject[b] ? a : b);

  }
  else if (type === "talents") {
    // For talent tests, these are usually performed solo, so pre-selecting itself is ideal.
    preSelectedTalent = pool1Name;

  }
  else if (type === "attack") {
    // For attacks, we select the highest physical talent automatically. We will also define a preselected pool 1 item,
    // which is a skill.
    const talentObject = game.actors.get(actorId).system.talents.physical;
    preSelectedTalent = Object.keys(talentObject).reduce((a, b) => talentObject[a] > talentObject[b] ? a : b);

    const physSkills = game.actors.get(actorId).system.skills.physical;
    const skillObject =
    {
      brawl: physSkills.brawl.rank,
      melee: physSkills.melee.rank,
      firearms: physSkills.firearms.rank
    };
    preSelectedSkill = Object.keys(skillObject).reduce((a, b) => skillObject[a] > skillObject[b] ? a : b);
    pool1Level = physSkills[preSelectedSkill].rank;

    // We also include the attack's damage here.
    rollData.damage = parseInt(damage) || parseInt(0);

    // Finally, we construct a reduced skill list with only attack skills.
    attackSkillList = {
      brawl: `${game.i18n.localize("c2d10.skills.brawl")} (${game.actors.get(actorId).system.skills.physical.brawl.rank})`,
      melee: `${game.i18n.localize("c2d10.skills.melee")} (${game.actors.get(actorId).system.skills.physical.melee.rank})`,
      firearms: `${game.i18n.localize("c2d10.skills.firearms")} (${game.actors.get(actorId).system.skills.physical.firearms.rank})`
    };

  } else if (type === "defense") {
    // For defenses, we select the highest physical talent automatically. We will also define a preselected pool 1 item,
    // which is a skill.
    const talentObject = game.actors.get(actorId).system.talents.physical;
    preSelectedTalent = Object.keys(talentObject).reduce((a, b) => talentObject[a] > talentObject[b] ? a : b);
    const skillObject = skills;
    preSelectedSkill = Object.keys(skillObject).reduce((a, b) => skillObject[a] > skillObject[b] ? a : b);

    // We also include the attack's damage here.
    rollData.damage = parseInt(damage) || parseInt(0);
    rollData.hits = parseInt(hits);

  } else {
    // In every other case, we preselect "None"
    preSelectedTalent = "None";

  }

  // We create a list of Powers available in the world so they can be selectable.
  rollData.worldPowers = [];
  for (const power of game.items) {
    if (power.type === "power") rollData.worldPowers.push({
      powerId: power.system.powerId,
      name: power.name
    });
  }

  /*
  * In order to create lists to choose our skills and talents from in the dialog,
  * we must create a custom list with the values of said skills and talents. Let's
  * do that first:
  */
  const lists = await _addValuesToList(actorId);

  // Then populate the needed rolldata
  rollData.talentsList = lists.talentsWithValues;
  rollData.skillList = type === "attack" ? attackSkillList : lists.skillsWithValues;
  rollData.type = type;
  rollData.talents = lists.talents;
  rollData.skills = lists.skills;
  rollData.pool1Level = parseInt(pool1Level);
  rollData.pool1Name = pool1Name;
  rollData.crisis = game.settings.get("c2d10", "campaignCrisis");
  rollData.id = actorId;
  rollData.preSelectedTalent = preSelectedTalent;
  rollData.preSelectedSkill = preSelectedSkill;
  rollData.isCombat = type === "attack" || type === "defense";

  // Create the dialog
  const dialogOptions = {
    classes: ["c2d10-dialog", "c2d10-test-roll"],
    top: 300,
    left: 400
  };

  new Dialog(
    {
      title: `Make ${pool1Name} test`,
      content: await renderTemplate("systems/c2d10/templates/dialogs/roll-test-dialog.hbs", rollData),
      buttons: {
        roll: {
          label: "Roll!",
          callback: html => {
            if (rollData.isCombat) {
              rollData.pool1Name = html.find("select#pool1name").val();
              rollData.pool1Level = rollData.pool1Name !== "None" && rollData.pool1Name !== "undefined" ? parseInt(rollData.skills[rollData.pool1Name]) : parseInt(0);
            }
            rollData.pool2Name = html.find("select#pool2name").val();
            rollData.pool2Level = rollData.pool2Name !== "None" && rollData.pool2Name !== "undefined" ? parseInt(rollData.talents[rollData.pool2Name]) : parseInt(0);

            rollData.crisis = parseInt(html.find("input#crisis").val());

            rollData.focus = html.find("input#focus")[0].checked;
            // Call the roll function
            _doRoll(rollData);}
        }
      }
    },
    dialogOptions
  ).render(true);
}

/**
 *  Counts hits, zeroes, determines messups and complications.
 * @param {boolean}   isDefense     Boolean defining if this is a defense roll.
 * @param {boolean}   isAttack      Boolean defining if this is a attack roll.
 * @param {number}    attackerHits  The number of hits used as DC if it's an attack or defense.
 * @param {object}    mainDice      An object holding all the pool dice.
 * @param {object}    crisisDice    An object, holding all the crisis dice, if any.
 * @returns {object}                evaluation results in an object.
 */
const _evaluateHits = async (isDefense, isAttack, attackerHits, mainDice = false, crisisDice = false) => {

  // Define values used to resolve the roll. A number of values here are deprecated and not shown,
  // but are kept for legacy reasons.

  const regTotal = mainDice ? mainDice.total : 0;
  const crisisTotal = crisisDice ? crisisDice.total : 0;
  const numOfHits = parseInt(parseInt(regTotal) + parseInt(crisisTotal));
  const complication = crisisDice ? crisisDice.values.some(x => x === 0) : false;
  const mess = crisisDice ? crisisDice.values.some(x => x === 9) : false;
  const numOfZeroes = mainDice ? mainDice.values.filter(x => x === 0).length : 0;
  const fatedOutcome = false; // FindFated(mainDice, "fated").length > 0; Temporarily disabled because of a bug

  const successfulDefense = isDefense && parseInt(numOfHits) >= parseInt(attackerHits);

  return {
    setbacks: parseInt(numOfZeroes),
    fatedOutcome: fatedOutcome,
    hits: parseInt(numOfHits),
    zeroes: parseInt(numOfZeroes),
    mess: mess,
    complication: complication,
    successfulDefense: successfulDefense
  };
};

// TODO: Fix this function. Right now it never ends.
/**
 * Novelty function to find if any of the dice were Fated
 * @param {object}  mainDice  The Object holding the main dice of the roll
 * @param {string}  fated     A string holding the key to look for.
 */
function findFated(mainDice, fated) {
  let result = [];
  /**
   * Subfunction to traverse the subobjects
   * @param {object}  mainDice  The Object holding the main dice of the roll
   * @param {string}  fated     A string holding the key to look for.
   */
  function recursivelyFindProp(mainDice, fated) {
    Object.keys(mainDice).forEach(function(key) {
      if (typeof mainDice[key] === "object" && mainDice[key] !== null) {
        recursivelyFindProp(mainDice[key], fated);
      } else if (key === fated) result.push(mainDice[key]);
    });
  }
  recursivelyFindProp(mainDice, fated);
  return result;
}

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

  const actor = game.actors.get(rollData.id);
  // Check if the character is FATED, if so, change the rollformula
  const fated = !!game.actors.get(rollData.id).getFlag("c2d10", "fated");

  rollData.crisis = game.settings.get("c2d10", "campaignCrisis");

  const messageTemplate = "systems/c2d10/templates/partials/chat-templates/roll.hbs";
  const bonusDice = getDice();

  let combinedPool = parseInt(rollData.pool1Level + rollData.pool2Level + bonusDice);

  const crisis = rollData.crisis >= combinedPool ? combinedPool : rollData.crisis;
  if (rollData.focus) combinedPool += 1;

  if (combinedPool < 1 ) {
    combinedPool = 1;
  }

  const rollablePool = combinedPool - crisis > 0 ? parseInt(combinedPool - crisis) : 0;
  let rollFormula = "";

  if (rollablePool > 0) rollFormula = fated ? `${rollablePool}da` : `${rollablePool}dr`;
  if (rollablePool > 0 && crisis > 0) {
    rollFormula += ` + ${crisis}ds`;
  } else if (crisis > 0) {
    rollFormula += `${crisis}ds`;
  }

  const theRoll = new Roll(rollFormula);
  // Execute the roll
  await theRoll.evaluate();

  // Construct lists of dice, taking into account any FATED characters
  const mainDice = fated ? theRoll.dice.filter(function(term) {return term instanceof FatedDie;})[0]
    :theRoll.dice.filter(function(term) {return term instanceof RegularDie;})[0];
  const crisisDice = theRoll.dice.filter(function(term) {return term instanceof CrisisDie;})[0];

  // If the roll was an attack, we attach a defend box to the message, by providing a boolean to the template.
  const isAttack = rollData.type === "attack";
  const isDefense = rollData.type === "defense";

  // Evaluate the roll
  const evaluation = await _evaluateHits(isDefense, isAttack, rollData.hits, mainDice, crisisDice);

  // Create a rendered HTML object holding the dice rolls to present in chat.
  const renderedList = await _diceList(mainDice, crisisDice);

  // Render the actual chat message
  const renderedRoll = await _renderRoll(renderedList, evaluation, crisis);

  // Create the chat message object
  let templateContext = {
    name: game.actors.get(rollData.id).name,
    pool1Name: rollData.pool1Name,
    pool1Level: rollData.pool1Level,
    pool2Name: rollData.pool2Name,
    pool2Level: rollData.pool2Level,
    crisis: crisis,
    hits: evaluation.hits,
    complication: evaluation.complication,
    roll: renderedRoll,
    fatedOutcome: evaluation.fatedOutcome,
    attack: isAttack,
    defense: isDefense,
    damage: parseInt(rollData.damage + (evaluation.DC - evaluation.hits)),
    successfulDefense: evaluation.successfulDefense
  };

  let chatData = {
    speaker: ChatMessage.getSpeaker(),
    roll: theRoll,
    content: await renderTemplate(messageTemplate, templateContext),
    // Type: 0, Temporarily reverting this change. DiceSoNice does not recognize the 0. Will update when DSN fixes it.
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
 * This function will add the skill values to the lists of skills and talents,
 * so that the user can see in the dialog what their value is without having to
 * visit their sheet.
 * @param {string}  actorId The Actor's ID
 */
async function _addValuesToList(actorId) {

  const actor = game.actors.get(actorId);
  const actorTalents = actor.system.talents;
  const actorSkills = actor.system.skills;

  /**
   * Create list objects to use for dialogs.
   */
  const talents = {};
  for (const entry of Object.entries(actorTalents.physical)) {
    talents[entry[0]] = entry[1];
  }
  for (const entry of Object.entries(actorTalents.social)) {
    talents[entry[0]] = entry[1];
  }
  for (const entry of Object.entries(actorTalents.mental)) {
    talents[entry[0]] = entry[1];
  }

  /**
   * Create list objects to use for dialogs.
   */
  const skills = {};
  for (const entry of Object.entries(actorSkills.physical)) {
    skills[entry[0]] = entry[1].rank;
  }
  for (const entry of Object.entries(actorSkills.social)) {
    skills[entry[0]] = entry[1].rank;
  }
  for (const entry of Object.entries(actorSkills.mental)) {
    skills[entry[0]] = entry[1].rank;
  }

  const newTalentsList = {};
  for (const val in c2d10.allTalents) {
    newTalentsList[val] = `${game.i18n.localize(c2d10.allTalents[val])} (${talents[val]})`;
  }

  const newSkillsList = {};
  for (const val in c2d10.allSkills) {
    newSkillsList[val] = `${game.i18n.localize(c2d10.allSkills[val])} (${skills[val]})`;
  }

  return {
    talents: talents,
    skills: skills,
    talentsWithValues: newTalentsList,
    skillsWithValues: newSkillsList
  };
}
