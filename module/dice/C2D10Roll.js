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
 * @param isAttack
 * @param {object}    mainDice    An object holding all the pool dice
 * @param {object}    crisisDice  An object, holding all the crisis dice, if any.
 * @param {boolean}   isDefense    If this was an attack, this is true
 * @param {number}    hits        If this was an attack, set the DC to enemy hits instead.
 * @returns {object}              evaluation results in an object.
 */
const _evaluateHits = async (isDefense, isAttack, hits, mainDice = false, crisisDice = false) => {

  // Define values used to resolve the roll. A number of values here are deprecated and not shown, but are kept
  // for legacy reasons.
  const regTotal = mainDice ? mainDice.total : 0;
  const crisisTotal = crisisDice ? crisisDice.total : 0;
  const numOfHits = parseInt(regTotal + crisisTotal);
  const complication = crisisDice ? crisisDice.values.some(x => x === 0) : false;
  const mess = crisisDice ? crisisDice.values.some(x => x === 9) : false;
  const numOfZeroes = mainDice ? mainDice.values.filter(x => x === 0).length : 0;
  let DC = 2;

  if (isAttack) {
    DC = 0;
  } else if (isDefense) {
    DC = hits;
  }
  else {
    DC = game.settings.get("c2d10", "DC");
  }

  return {
    DC: DC,
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

  let combinedPool = parseInt(rollData.pool1Level + rollData.pool2Level + bonusDice);

  crisis = rollData.crisis >= combinedPool ? combinedPool : rollData.crisis;
  if (rollData.focus) combinedPool += 1;
  if (rollData.trait !== 0) combinedPool += rollData.trait;

  if (combinedPool < 1 ) {
    combinedPool = 1;
  }

  const rollablePool = combinedPool - crisis > 0 ? parseInt(combinedPool - crisis) : 0;
  let rollFormula = "";

  if (rollablePool > 0) rollFormula += `${rollablePool}dr`;
  if (rollablePool > 0 && crisis > 0) {
    rollFormula += ` + ${crisis}ds`;
  } else if (crisis > 0) {
    rollFormula += `${crisis}ds`;
  }

  const theRoll = new Roll(rollFormula);
  // Execute the roll
  await theRoll.evaluate({async: true});

  const mainDice = theRoll.dice.filter(function(term) {return term instanceof RegularDie;})[0];
  const crisisDice = theRoll.dice.filter(function(term) {return term instanceof CrisisDie;})[0];

  // If the roll was an attack, we attach a defend box to the message, by providing a boolean to the template.
  const isAttack = rollData.type === "attack";
  const isDefense = rollData.type === "defense";
  const damageType = rollData.damageType ? "Critical" : "Superficial";

  // Evaluate the roll
  const evaluation = await _evaluateHits(isDefense, isAttack, rollData.hits, mainDice, crisisDice);

  // Create a rendered HTML object holding the dice rolls to present in chat.
  const renderedList = await _diceList(mainDice, crisisDice);

  // Render the actual chat message
  const renderedRoll = await _renderRoll(renderedList, evaluation, crisis);

  // Create the chat message object
  let templateContext = {
    name: game.actors.get(rollData.id).name,
    DC: evaluation.DC,
    pool1Name: rollData.pool1Name,
    pool1Level: rollData.pool1Level,
    pool2Name: rollData.pool2Name,
    pool2Level: rollData.pool2Level,
    crisis: crisis,
    hits: evaluation.hits,
    complication: evaluation.complication,
    roll: renderedRoll,
    attack: isAttack,
    defense: isDefense,
    damage: rollData.damage,
    damageType: damageType
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
 * Perform a test. Will open a dialog to choose the second pool item. Takes Crisis into account.
 * @param {string}  actorId             The actor's Id.
 * @param {object}  talents             An object holding all the actor's talents and levels.
 * @param {object}  skills              An object holding all the actor's skills and levels.
 * @param {string}  type                The type of item being rolled for as pool 1 (talent, skill, power, other).
 * @param {string}  group               The group the item belongs to (physical, mental etc).
 * @param {string}  pool1Name           The name of the item being rolled for.
 * @param {string}  pool1Level          The size of the rolled (Pool1) item.
 * @param {boolean} physicalImpairment  A boolean showing if the character is physically impaired.
 * @param {boolean} mentalImpairment    A boolean showing if the character is mentally or socially impaired.
 * @param {number}  crisis              The character's current number of Crisis Dice.
 * @param {number}  damage              If the roll is an attack, we include the damage of the weapon being used.
 * @param {boolean} damageType          If the roll is an attack, we include the damage type of it. True for Critical.
 * @param {number}  hits                If the roll is an attack, we include the number of hits from the attacker.
 */
export async function rollTest(actorId,
  talents,
  skills,
  type,
  group,
  pool1Name,
  pool1Level,
  physicalImpairment,
  mentalImpairment,
  crisis,
  damage,
  damageType,
  hits) {

  const rollData = {};
  /*
  * Based on what was clicked on the sheet, there is an ideal pre-selected companion for the roll.
  * We will here determine the best pre-selected item for talent tests and skill tests,
  * but leave it set to "none" for anything else.
  */

  let preSelectedTalent;
  let preSelectedSkill;

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
      brawl: physSkills.brawl,
      melee: physSkills.melee,
      firearms: physSkills.firearms
    };
    preSelectedSkill = Object.keys(skillObject).reduce((a, b) => skillObject[a] > skillObject[b] ? a : b);

    // We also include the attack's damage and type here.
    rollData.damage = damage || 0;
    rollData.damageType = damageType || null;
    rollData.hits = hits;

  } else if (type === "defense") {
    // For defenses, we select the highest physical talent automatically. We will also define a preselected pool 1 item,
    // which is a skill.
    const talentObject = game.actors.get(actorId).system.talents.physical;
    preSelectedTalent = Object.keys(talentObject).reduce((a, b) => talentObject[a] > talentObject[b] ? a : b);
    const skillObject = skills;
    preSelectedSkill = Object.keys(skillObject).reduce((a, b) => skillObject[a] > skillObject[b] ? a : b);

    // We also include the attack's damage and type here.
    rollData.damage = damage || 0;
    rollData.damageType = damageType;
    rollData.hits = hits;

  } else {
    // In every other case, we preselect "None"
    preSelectedTalent = "None";

  }

  rollData.worldPowers = [];
  for (const power of game.items) {
    if (power.type === "power") rollData.worldPowers.push({
      powerId: power.system.powerId,
      name: power.name
    });
  }

  // Populate the needed rolldata
  rollData.talentsList = c2d10.allTalents;
  rollData.skillList = type === "attack" ? {brawl: "c2d10.skills.brawl", melee: "c2d10.skills.melee", firearms: "c2d10.skills.firearms"} : c2d10.allSkills;
  rollData.type = type;
  rollData.talents = talents;
  rollData.skills = skills;
  rollData.pool1Level = pool1Level;
  rollData.pool1Name = pool1Name;
  rollData.crisis = type !== "health" ? parseInt(crisis) : 0;
  rollData.physicalImpairment = physicalImpairment;
  rollData.mentalImpairment = mentalImpairment;
  rollData.trait = 0;
  rollData.id = actorId;
  rollData.preSelectedTalent = preSelectedTalent;
  rollData.preSelectedSkill = preSelectedSkill;
  rollData.isCombat = type === "attack" || type === "defense";

  // Create the dialog
  const dialogOptions = {
    classes: ["c2d10-dialog", "roll"],
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
              rollData.pool1Level = rollData.pool1Name !== "None" && rollData.pool1Name !== "undefined" ? rollData.skills[rollData.pool1Name] : 0;
            }
            rollData.pool2Name = html.find("select#pool2name").val();
            rollData.pool2Level = rollData.pool2Name !== "None" && rollData.pool2Name !== "undefined" ? rollData.talents[rollData.pool2Name] : 0;

            rollData.crisis = parseInt(html.find("input#crisis").val());

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
