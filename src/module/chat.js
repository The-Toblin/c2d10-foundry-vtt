import { rollTest } from "./dice/C2D10Roll.js";

/**
 *  A function that adds listeners to the chatlog. Used for interactive chat messages.
 * @param {object} html The HTML content for the function
 */
export function addChatListeners(html) {
  html.on("click", "button.attack", onAttack);
  html.on("click", "button.defend", onDefend);
}

/**
 * A function to provide an attack button on weapon cards, only for the owner.
 * @param {object} event    The Eventdata from the click.
 */
function onAttack(event) {
  const card = event.currentTarget.closest(".weapon").dataset;

  const attacker = game.actors.get(card.ownerId);
  const weapon = attacker.items.get(card.itemId);

  const extras = attacker.system.extras;

  const actorId = attacker.id;
  const talents = extras.talents;
  const skills = extras.skills;
  const type ="attack";
  const group ="physical";
  const pool1Name = weapon.name;
  const pool1Level = 0;
  const physicalImpairment = attacker.system.health.physicalImpairment;
  const mentalImpairment = attacker.system.health.mentalImpairment;
  const crisis = attacker.system.health.crisis;
  const damage = card.weaponDamage;

  rollTest(actorId,
    talents,
    skills,
    type,
    group,
    pool1Name,
    pool1Level,
    physicalImpairment,
    mentalImpairment,
    crisis,
    damage);
}

/**
 * Rolling for defense requires us to get some data for the defender
 * and check if its an NPC or a player defending.
 * @param {object}  event HTML click event data.
 */
async function onDefend(event) {
  // Get the data from the chat card.
  const card = event.currentTarget.closest(".c2d10-chat-roll-message").dataset;
  const attacker = game.actors.get(card.ownerId);

  // Get the defender. If this is a player, it picks the character for the current player.
  // Otherwise, open a dialog for the Keeper to select an NPC.
  if (game.users.current.isGM) {
    await _keeperDefender(card, attacker);
  } else if (!game.users.current.isGM) {
    await _userDefender(card, attacker);
  } else {
    ui.notifications.error("Something went horribly wrong!");
  }
}

/**
 * In case the defender is an NPC and the user is a Keeper, we need to display
 * a dialog to pick the NPC to use for defense, unless a token is selected.
 * @param {object}  card      Dataset info from the weapon card.
 * @param {object}  attacker  The attacker's actor. (Unused atm)
 */
async function _keeperDefender(card, attacker) {

  if (canvas.tokens.controlled.length > 0) {
    ui.notifications.info(`Rolling defense roll for ${canvas.tokens.controlled[0].actor.name}'s token.`);
    _doRoll(card, attacker, canvas.tokens.controlled[0].actor);

  } else {
    ui.notifications.info("You do not have a selected token. Opening selection dialog.");
    const actors = {};

    const npcs = game.actors;
    for (const val of npcs) {
      const name = val.name.length > 0 ? val.name : "Nameless";
      if (val.system.info.species) {
        const species = val.system.info.species ? `(${val.system.info.species})` : "";
        actors[val.id] = `${name} ${species}`;
      } else {
        actors[val.id] = `${name}`;
      }
    }

    // Create the dialog
    const dialogOptions = {
      classes: ["c2d10-dialog", "c2d10-npc"],
      top: 300,
      left: 400
    };

    new Dialog(
      {
        title: "Choose NPC",
        content: await renderTemplate("systems/c2d10/templates/dialogs/npc-picker.hbs", actors),
        buttons: {
          defend: {
            label: "Defend",
            callback: html => {
              const theActor = game.actors.get(html.find("select#character").val());
              _doRoll(card, attacker, theActor);
            }
          }
        }
      },
      dialogOptions
    ).render(true);
  }
}

/**
 * If there's a player who clicks defend, we'll use their controlled actor.
 * @param {object}  card      Dataset info from the weapon card.
 * @param {object}  attacker  The attacker's actor. (Unused atm)
 */
async function _userDefender(card, attacker) {
  const defender = game.users.current.character;
  _doRoll(card, attacker, defender);
}

/**
 * Once we've established who the defender is, perform the roll.
 * @param {object}  card      Dataset info from the weapon card.
 * @param {object}  attacker  The attacker's actor. (Unused atm)
 * @param {object}  defender  The defender's actor, or token actor.
 */
function _doRoll(card, attacker, defender) {
  // Populate the necessary data to perform a roll.
  const extras = defender.system.extras;
  const actorId = defender.id;
  const talents = extras.talents;
  const skills = extras.skills;
  const type ="defense";
  const group ="physical";
  const pool1Name = "Defence";
  const pool1Level = 0;
  const physicalImpairment = defender.system.health.physicalImpairment;
  const mentalImpairment = defender.system.health.mentalImpairment;
  const crisis = defender.system.health.crisis;
  const damage = card.weaponDamage;
  const hits = card.hits;

  // Perform the roll.
  rollTest(actorId,
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
    hits);
}

/**
 * This function scans all open chat-messages matching the "card" class.
 * If the user is not the owner of the message, it will hide all buttons from it.
 *
 * @param {*}       message Unused
 * @param {object}  html    HTML data for the message, passed from the Hook.
 * @param {*}       data    Unused
 */
export const hideChatActionButtons = function(message, html, data) {
  const chatCard = html.find(".c2d10-card");
  if (chatCard.length > 0) {
    let actor = game.actors.get(chatCard.attr("data-owner-id"));

    if ((actor && !actor.isOwner)) {
      const buttons = chatCard.find(".c2d10-interactables-attack-box");
      buttons.each((i, btn) => {
        btn.style.display = "none";
      });
    }
  }
};
