export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {

  }

  async prepareDerivedData() {

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

    const currentValue = !group ? this.system[type][res] : this.system[type][group][res];
    const max = res === "crisis" ? 10 : 5;

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
}
