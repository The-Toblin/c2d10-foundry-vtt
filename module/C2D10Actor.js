export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
    super.prepareBaseData();
  }

  async prepareDerivedData() {
    // Derive health values.
    const maxStrain = parseInt(this.system.talents.physical.endurance + 3);
    const maxStress = parseInt(this.system.talents.mental.willpower + this.system.talents.social.poise);

    this.system.health.strain.max = maxStrain;
    this.system.health.stress.max = maxStress;

    const crisisValue = parseInt(this.system.health.strain.critical + this.system.health.stress.critical);
    this.system.health.crisis = crisisValue <= 5 ? crisisValue : 5;

    // Combine the two types of damage and inverse them in order to show a reduction bar on tokens.
    const strainValue = parseInt(this.system.health.strain.superficial + this.system.health.strain.critical);
    const stressValue = parseInt(this.system.health.stress.superficial + this.system.health.stress.critical);

    this.system.health.strain.value = parseInt(maxStrain - strainValue);
    this.system.health.stress.value = parseInt(maxStress - stressValue);

    this.system.health.physicalImpairment = strainValue === maxStrain;
    this.system.health.mentalImpairment = stressValue === maxStress;

  }

  /**
   * Returns the character's current strain values.
   * @returns {Promise/object} Returns an object, holding three keys: value, crit, max.
   */
  async getStrain() {

    return {
      value: system.health.strain.value,
      superficial: system.health.strain.superficial,
      crit: system.health.strain.critical,
      max: system.health.strain.max
    };
  }

  /**
   * Returns the character's current stress values.
   * @returns {Promise/object} Returns an object, holding three keys: value, crit, max.
   */
  async getStress() {

    return {
      value: system.health.stress.value,
      superficial: system.health.stress.superficial,
      crit: system.health.stress.critical,
      max: system.health.stress.max
    };
  }

  /**
   * Returns the character's current crisis values.
   * @returns {number} The character's current crisis, based on strain and stress.
   */
  async getCrisis() {

    return system.health.crisis;
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
      const updateData = [];
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

    let updateData = [];
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
