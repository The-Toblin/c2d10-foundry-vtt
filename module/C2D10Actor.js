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
    this.system.extras.maxstress = talents.mental.willpower > talents.social.poise ? talents.mental.willpower : talents.social.poise;

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


      this.system.extras.equippedWeapon = {
        name: wep.name,
        damage: wep.system.damage
      };
    }

    // If an armor is equipped, determine its defense type and send it to the display.
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

  _onCreate() {
    this.setFlag("c2d10", "locked", false);
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

  async modifyHealth(group, id) {
    const updateData = {};
    const system = this.system;

    const newValue = !system.trackers[group][id];

    updateData[`system.trackers.${group}.${id}`] = newValue;

    await this.update(updateData);
  }

  async toggleConsequence(consequence) {
    const updateData = {};
    const systemData = this.system.consequences;

    const newValue = !systemData[consequence].ticked;

    updateData[`system.consequences.${consequence}.ticked`] = newValue;

    await this.update(updateData);
  }
}
