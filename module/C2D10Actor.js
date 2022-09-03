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

  async modifyHealth(isIncrease, isCrit, res) {
    const system = this.system;
    const currentValue = system.health[res].value;
    const critical = system.health[res].critical;
    const total = parseInt(critical + currentValue);
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
      const updateData = [];
      const newValue = isIncrease ? critical + 1 : critical - 1;

      if (newValue < 0) return;

      /**
       * If we're reducing crit, convert to superficial.
       */
      if (!isIncrease) updateData[`system.health.${res}.value`] = superficial + 1;

      /**
       * If the tracker is full, convert a superficial to crit.
       */
      if (full && isIncrease) updateData[`system.health.${res}.value`] = superficial - 1;

      /**
       * Finally, update the crit tracker.
       */
      updateData[`system.health.${res}.critical`] = newValue;
      return updateData;
    }

    let updateData = [];
    const full = parseInt(currentValue + critical) >= max;
    console.log(full);

    if (isCrit) {
      updateData = handleCrit(isIncrease, res, critical, currentValue, max, full);
    } else if (full && isIncrease) {
      updateData = handleCrit(isIncrease, res, critical, currentValue, max, full);
    } else {
      const newValue = isIncrease ? currentValue + 1 : currentValue - 1;

      if (newValue < 0) return;
      updateData[`system.health.${res}.value`] = newValue;
    }

    if (typeof updateData !== "undefined") await this.update(updateData);
    console.log(updateData);
    console.log("Health:", system.health[res].value, "Crit:", system.health[res].critical);
  }
}
