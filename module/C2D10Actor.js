export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {

  }

  async prepareDerivedData() {
    const maxStrain = parseInt(this.system.talents.physical.endurance + 3);
    const maxStress = parseInt(this.system.talents.mental.willpower + this.system.talents.mental.reason);

    const updateData = [];
    updateData["system.health.strain.max"] = maxStrain;
    updateData["system.health.stress.max"] = maxStress;
    updateData["system.health.crisis.max"] = 10;

    await this.update(updateData);
  }

  async resetHealth(pass, res) {
    const updateData = {};
    updateData[`system.health.${res}`] = 0;

    if (pass === "Fail!") {
      this.modifyResource(1, "health", null, "crisis");
    }
    await this.update(updateData);
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

  async modifyHealth(n, res) {
    const updateData = {};
    const system = this.system;

    console.log("Triggered:", n, res);
    const currentValue = system.health[res].value;
    const max = this.system.health[res].max;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = currentValue + n;

    if (newValue < 0) {
      return;
    }

    updateData[`system.health.${res}.value`] = newValue;
    await this.update(updateData);
  }
}
