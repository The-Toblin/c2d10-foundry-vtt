export class C2D10HeroPoints {
  static getPoints() {
    return game.settings.get("c2d10", "heroPoints");
  }

  static async changePoints(isIncrease) {
    const currentValue = game.settings.get("c2d10", "heroPoints");
    const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

    if (newValue < 10 || newValue >= 0) {
      await game.settings.set("c2d10", "heroPoints", newValue);
    }
  }
}

export class C2D10VillainPoints {
  static getPoints() {
    return game.settings.get("c2d10", "villainPoints");
  }

  static async changePoints(isIncrease) {
    const currentValue = game.settings.get("c2d10", "villainPoints");
    const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

    if (newValue < 10 || newValue >= 0) {
      await game.settings.set("c2d10", "villainPoints", newValue);
    }
  }
}

export class C2D10Difficulty {
  static getDC() {
    return game.settings.get("c2d10", "DC");
  }

  static async changeDC(isIncrease) {
    const currentValue = game.settings.get("c2d10", "DC");
    const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

    if (newValue < 10 || newValue >= 0) {
      await game.settings.set("c2d10", "DC", newValue);
    }
  }
}
