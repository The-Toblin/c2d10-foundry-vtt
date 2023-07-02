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
 *  A function to provide an attack button on weapon cards, only for the owner.
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
  const damageType = card.damageType === "Critical";

  console.log(damageType);

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
    damageType);
}

/**
 *
 * @param event
 */
function onDefend(event) {
  const card = event.currentTarget.closest(".c2d10-chat-roll-message").dataset;

  const attacker = game.actors.get(card.ownerId);

  const defender = game.users.current.character;
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
  const damageType = card.damageType === "Critical";
  const hits = card.hits;

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
    damageType,
    hits);
}


/**
 * This function scans all open chat-messages matching the "card" class.
 * If the user is not the owner of the message, it will hide all buttons from it.
 *
 * @param {*} message       Unused
 * @param {object} html     HTML data for the message, passed from the Hook.
 * @param {*} data          Unused
 */
export const hideChatActionButtons = function(message, html, data) {
  const chatCard = html.find(".c2d10-card");
  if (chatCard.length > 0) {
    let actor = game.actors.get(chatCard.attr("data-owner-id"));

    if ((actor && !actor.isOwner)) {
      const buttons = chatCard.find(".button-box");
      buttons.each((i, btn) => {
        btn.style.display = "none";
      });
    }
  }
};
