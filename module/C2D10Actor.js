export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  async prepareBaseData() {
    this.system.extras = {};

    // Derive health values.
    const maxStrain = parseInt(this.system.talents.physical.endurance + 3);
    const maxStress = parseInt(this.system.talents.mental.willpower + this.system.talents.social.poise);

    this.system.health.strain.max = maxStrain;
    this.system.health.stress.max = maxStress;

    // Calculate current Crisis based on critical damage, and cap the value at 5.
    const crisisValue = parseInt(this.system.health.strain.critical + this.system.health.stress.critical);
    this.system.health.crisis = crisisValue <= 5 ? crisisValue : 5;

    // Combine the two types of damage and inverse them in order to show a reduction bar on tokens.
    const strainValue = parseInt(this.system.health.strain.superficial + this.system.health.strain.critical);
    const stressValue = parseInt(this.system.health.stress.superficial + this.system.health.stress.critical);

    this.system.health.strain.value = parseInt(maxStrain - strainValue);
    this.system.health.stress.value = parseInt(maxStress - stressValue);

    // Check if any health tracker has reached max, and if so, apply the impairment for that class.
    this.system.health.physicalImpairment = strainValue === maxStrain;
    this.system.health.mentalImpairment = stressValue === maxStress;

    // Set up different objects, handy for other classes and displaying on the sheet
    this.system.extras.assets = this.items.filter(p => p.type === "asset");
    this.system.extras.equipment = this.items.filter(p => p.type === "armor" || p.type === "weapon");
    this.system.extras.virtues = this.items.filter(p => p.type === "trait" && p.system.traitType === "virtue");
    this.system.extras.vices = this.items.filter(p => p.type === "trait" && p.system.traitType === "vice");
    this.system.extras.powers = this.items.filter(p => p.type === "power");
    this.system.extras.variants = this.items.filter(p => p.type === "variant");

    /**
     * Set up equipped weapon and armor objects to display on the sheet
     */
    let wep = this.items.get(this.system.equipment.weapon);
    let arm = this.items.get(this.system.equipment.armor);

    // If a weapon is equipped, determine its damage type and send it to the display.
    if (wep) {
      let wepDamage = wep.system.critical > 0 ? wep.system.critical : wep.system.superficial;
      let wepType = wep.system.critical > 0 ? "Critical" : "Superficial";

      this.system.extras.equippedWeapon = {
        name: wep.name,
        damage: wepDamage,
        damageType: wepType
      };
    }

    // If an armor is equipped, determine its defense type and send it to the display.
    if (arm) {
      let armProt = arm.system.deflection > 0 ? arm.system.deflection : arm.system.ablation;
      let armProtType= arm.system.deflection > 0 ? "Deflection" : "Ablation";

      this.system.extras.equippedArmor = {
        name: arm.name,
        protection: armProt,
        protectionType: armProtType
      };
      super.prepareBaseData();
    }

    /**
     * Create list objects to use for dialogs.
     */
    this.system.extras.talents = {};
    for (const entry of Object.entries(this.system.talents.physical)) {
      this.system.extras.talents[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(this.system.talents.social)) {
      this.system.extras.talents[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(this.system.talents.mental)) {
      this.system.extras.talents[entry[0]] = entry[1];
    }

    /**
     * Create list objects to use for dialogs.
     */
    this.system.extras.skills = {};
    for (const entry of Object.entries(this.system.skills.physical)) {
      this.system.extras.skills[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(this.system.skills.social)) {
      this.system.extras.skills[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(this.system.skills.mental)) {
      this.system.extras.skills[entry[0]] = entry[1];
    }

    /**
     * Sort character's traits
     */
    this.system.extras.virtues.sort(function(a, b) {
      let nameA = a.name.toUpperCase(); // Ignore upper and lowercase
      let nameB = b.name.toUpperCase(); // Ignore upper and lowercase
      if (nameA < nameB) {
        return -1; // NameA comes first
      }
      if (nameA > nameB) {
        return 1; // NameB comes first
      }
      return 0;  // Names must be equal
    });

    this.system.extras.vices.sort(function(a, b) {
      let nameA = a.name.toUpperCase(); // Ignore upper and lowercase
      let nameB = b.name.toUpperCase(); // Ignore upper and lowercase
      if (nameA < nameB) {
        return -1; // NameA comes first
      }
      if (nameA > nameB) {
        return 1; // NameB comes first
      }
      return 0;  // Names must be equal
    });

    this.system.extras.powers.sort(function(a, b) {
      let nameA = a.name.toUpperCase(); // Ignore upper and lowercase
      let nameB = b.name.toUpperCase(); // Ignore upper and lowercase
      if (nameA < nameB) {
        return -1; // NameA comes first
      }
      if (nameA > nameB) {
        return 1; // NameB comes first
      }
      return 0;  // Names must be equal
    });

    this.system.extras.variants.sort(function(a, b) {
      let nameA = a.name.toUpperCase(); // Ignore upper and lowercase
      let nameB = b.name.toUpperCase(); // Ignore upper and lowercase
      if (nameA < nameB) {
        return -1; // NameA comes first
      }
      if (nameA > nameB) {
        return 1; // NameB comes first
      }
      return 0;  // Names must be equal
    });
  }

  async modifyResource(n, type, group, res) {
    const updateData = {};
    const system = this.system;
    const currentValue = !group ? system[type][res] : system[type][group][res];
    const max = 5;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = currentValue + n;

    if (newValue < 0) {
      return;
    }

    if (!group) {
      updateData[`system.${type}.${res}`] = newValue;
    } else {
      updateData[`system.${type}.${group}.${res}`] = newValue;
    }

    await this.update(updateData);
  }

  async modifyHealth(isIncrease, isCrit, res) {
    const system = this.system;
    const currentSuperficial = system.health[res].superficial;
    const superficial = system.health[res].superficial;
    const critical = system.health[res].critical;
    const total = parseInt(superficial + critical);
    const max = system.health[res].max;

    /**
     * If the tracker is maxed out with critical damage, and we're not reducing, do nothing
     */
    if (critical === max && isIncrease) {
      return;
    }

    /**
     * Function for handling complex critical damage conversions.
     * @param {boolean} isIncrease    Whether to increase or not.
     * @param {string}  res           Name of the resource.
     * @param {number}  critical      The critical damage the character currently has.
     * @param {number}  superficial   The superficial damage the character currently has.
     * @param {number}  max           Max health on the tracker.
     * @param {boolean} full          If the tracker is full, convert superficial to crit.
     */
    function handleCrit(isIncrease, res, critical, superficial, max, full = false) {
      const updateData = {};
      const newValue = isIncrease ? critical + 1 : critical - 1;

      if (newValue < 0) return;

      /**
       * If we're reducing crit, convert to superficial.
       */
      if (!isIncrease) updateData[`system.health.${res}.superficial`] = superficial + 1;

      /**
       * If the tracker is full, convert a superficial to crit.
       */
      if (full && isIncrease) updateData[`system.health.${res}.superficial`] = superficial - 1;

      /**
       * Finally, update the crit tracker.
       */
      updateData[`system.health.${res}.critical`] = newValue;
      return updateData;
    }

    let updateData = {};
    const full = total >= max;

    if (isCrit) {
      updateData = handleCrit(isIncrease, res, critical, currentSuperficial, max, full);
    } else if (full && isIncrease) {
      updateData = handleCrit(isIncrease, res, critical, currentSuperficial, max, full);
    } else {
      const newValue = isIncrease ? currentSuperficial + 1 : currentSuperficial - 1;

      if (newValue < 0) return;
      updateData[`system.health.${res}.superficial`] = newValue;
    }

    if (typeof updateData !== "undefined") await this.update(updateData);
  }
}
