export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  async prepareBaseData() {
    this.system.extras = {};
    const talents = this.system.talents;
    // Const skills = this.system.skills;

    // Set up variables to be used by health trackers
    this.system.extras.maxstrain = talents.physical.endurance;
    this.system.extras.maxstress = talents.mental.willpower
    > talents.social.poise ? talents.mental.willpower : talents.social.poise;

    // Set up different objects, handy for other classes and displaying on the sheet
    this.system.extras.assets = this.items.filter(p => p.type === "asset");
    this.system.extras.equipment = this.items.filter(p => p.type === "armor" || p.type === "weapon");
    this.system.extras.cybernetics = this.items.filter(p => p.type === "cybernetics");
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

    /**
     * Add an easy-to-parse list of focuses for use on sheets
     */
    this.system.focus = [];
    for (const group in this.system.skills) {
      for (const skill in this.system.skills[group]) {
        if (this.system.skills[group][skill].hasFocus) {
          let name = skill;
          for (const focus in this.system.skills[group][skill].focus) {
            let focusDescription = this.system.skills[group][skill].focus[focus];
            this.system.focus.push({focusDescription, name});
          }
        }
      }
    }
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
    let currentValue = 0;
    if (type === "skills") {
      currentValue = system[type][group][res].rank;
    } else if (type === "economy") {
      currentValue = parseInt(system.info.economy);
    } else {
      currentValue = !group ? system[type][res] : system[type][group][res];
    }
    const max = 5;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = parseInt(currentValue + n);

    if (newValue < 0) {
      return;
    }

    if (!group) {
      updateData[`system.${type}.${res}`] = newValue;
    } else if (type === "skills") {
      updateData[`system.${type}.${group}.${res}.rank`] = newValue;
    } else if (type === "economy") {
      updateData["system.info.economy"] = newValue;
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

  async addTrait(isDelete, id) {
    const updateData = {};

    if (isDelete && id !== 0) {
      updateData[`system.traits.-=${id}`] = null;

      await this.update(updateData);

    } else if (id === 0) {id = foundry.utils.randomID();

      updateData[`system.traits.${id}`] = {
        traitID: id,
        description: ""
      };

      await this.update(updateData);

    }
  }

  _findSkillGroup(match) {
    for (const skill in this.system.skills.physical) {
      if (skill === match) return "physical";
    }

    for (const skill in this.system.skills.social) {
      if (skill === match) return "social";
    }

    for (const skill in this.system.skills.mental) {
      if (skill === match) return "mental";
    }
    return "error";
  }

  async addFocus(name, parent) {
    const group = this._findSkillGroup(parent);
    const updateData = {};
    const currentArray = this.system.skills[group][parent].focus;
    currentArray.push(name);

    updateData[`system.skills.${group}.${parent}.focus`] = currentArray;
    updateData[`system.skills.${group}.${parent}.hasFocus`] = true;

    await this.update(updateData);
  }

  async removeFocus(parent, name) {
    const group = this._findSkillGroup(parent);
    const updateData = {};
    const currentArray = this.system.skills[group][parent].focus;

    const index = currentArray.indexOf(name);
    if (index > -1) currentArray.splice(index, 1);

    const hasFocus = currentArray.length > 0;

    updateData[`system.skills.${group}.${parent}.focus`] = currentArray;
    updateData[`system.skills.${group}.${parent}.hasFocus`] = hasFocus;

    await this.update(updateData);
  }
}
