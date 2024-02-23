export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  async prepareBaseData() {
    this.system.extras = {};
    const talents = this.system.talents;
    const skills = this.system.skills;

    // Set up variables to be used by health trackers
    this.system.extras.maxstrain = talents.physical.endurance;
    this.system.extras.maxstress = talents.mental.willpower
    > talents.social.poise ? talents.mental.willpower : talents.social.poise;

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

    // If a weapon is equipped, determine its damage and send it to the display.
    if (wep) {
      this.system.extras.equippedWeapon = {
        name: wep.name,
        damage: wep.system.damage
      };
    }

    // If an armor is equipped, determine its protection and send it to the display.
    if (arm) {
      this.system.extras.equippedArmor = {
        name: arm.name,
        protection: arm.system.protection
      };
      super.prepareBaseData();
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

  /**
   * Set the sheet to be unlocked on character creation. Also ensures the lock flag is set.
   */
  _onCreate() {
    this.setFlag("c2d10", "locked", false);
  }

  /**
   * A function to modify resources (talents, skills, powers etc) on an actor
   * @param {number} n     The number to modify the resource by
   * @param {string} type  The type of the resource (talent, skills, economy etc)
   * @param {string} group The group the resource belongs to (physical, mental etc)
   * @param {string} res   The resource to modify
   */
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

  /**
   *  This function toggles a health box on a health tracker.
   * @param {string} group  A string holding the group of the value to act upon.
   * @param {string} id     The name (or id) of the tracker to update.
   */
  async modifyHealth(group, id) {
    const updateData = {};
    const system = this.system;

    const newValue = !system.trackers[group][id];

    updateData[`system.trackers.${group}.${id}`] = newValue;

    await this.update(updateData);
  }

  /**
   * Function to toggle consequences on or off on an Actor.
   * @param {string} consequence A string holding the id/name of the consequence to act upon.
   */
  async toggleConsequence(consequence) {
    const updateData = {};
    const systemData = this.system.consequences;

    const newValue = !systemData[consequence].ticked;

    // Clear the description if a consequence is disabled
    if (!newValue) updateData[`system.consequences.${consequence}.description`] = "";

    updateData[`system.consequences.${consequence}.ticked`] = newValue;

    await this.update(updateData);
  }
}
