/**
 * Returns the current HeroPoint Value.
 */
export function getHeroPoints() {
  return game.settings.get("c2d10", "heroPoints");
}

/**
 * Returns the current VillainPoint Value.
 */
export function getVillainPoints() {
  return game.settings.get("c2d10", "villainPoints");
}

/**
 * Returns the the current game DC.
 */
export function getDC() {
  return game.settings.get("c2d10", "DC");
}

/**
 * Returns the the current game DC.
 */
export function getCrisis() {
  return game.settings.get("c2d10", "campaignCrisis");
}

/**
 * Returns the current Bonus Dice Value.
 */
export function getDice() {
  return game.settings.get("c2d10", "bonusDice");
}

/**
 * Modifies the current Hero Points
 * @param {boolean} isIncrease Whether or not it is an increase or decrease.
 */
export function changeHeroPoints(isIncrease) {
  const currentValue = game.settings.get("c2d10", "heroPoints");
  const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

  if (newValue <= 10 && newValue >= 0) {
    game.settings.set("c2d10", "heroPoints", newValue);
  }
}

/**
 * Modifies the current Villain Points
 * @param {boolean} isIncrease Whether or not it is an increase or decrease.
 */
export function changeVillainPoints(isIncrease) {
  const currentValue = game.settings.get("c2d10", "villainPoints");
  const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

  if (newValue <= 20 && newValue >= 0) {
    game.settings.set("c2d10", "villainPoints", newValue);
  }
}

/**
 * Modifies the current Difficulty
 * @param {boolean} isIncrease Whether or not it is an increase or decrease.
 */
export function changeDC(isIncrease) {
  const currentValue = game.settings.get("c2d10", "DC");
  const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

  if (newValue <= 10 && newValue >= 0) {
    game.settings.set("c2d10", "DC", newValue);
  }
}

/**
 * Modifies the current Crisis
 * @param {boolean} isIncrease Whether or not it is an increase or decrease.
 */
export function changeCrisis(isIncrease) {
  const currentValue = game.settings.get("c2d10", "campaignCrisis");
  const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

  if (newValue <= 10 && newValue >= 0) {
    game.settings.set("c2d10", "campaignCrisis", newValue);
  }
}

/**
 * Modifies the current Bonus Die amount
 * @param {boolean} isIncrease Whether or not it is an increase or decrease.
 * @param {boolean} isPlayer  Whether to modify heropoints or villainpoints.
 */
export async function buyDice(isIncrease, isPlayer) {
  const currentValue = getDice();
  const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

  if (newValue <= 5 && newValue >= 0) {
    await game.settings.set("c2d10", "bonusDice", newValue);
  }

  /* // TODO: Convert this to work with sockets so players can buy dice.
  const max = isPlayer ? 10 : 20;
  let cost = isIncrease ? parseInt(currentValue + 1) : currentValue;
  if (!isIncrease) cost *= -1;
  const target = isPlayer ? "heroPoints" : "villainPoints";
  const currentNarrativePoints = isPlayer ? getHeroPoints() : getVillainPoints();
  const newPoints = currentNarrativePoints - cost;

  If (newPoints <= max && newPoints >= 0) {
    if (newValue <= 5 && newValue >= 0) {
      await game.settings.set("c2d10", "bonusDice", newValue);
      await game.settings.set("c2d10", target, newPoints );
    }
  } else {
    const pointName = isPlayer ? "hero points" : "villain points";
    ui.notifications.error(`You do not have enough ${pointName} to buy extra dice!`);
  }
  */
}
