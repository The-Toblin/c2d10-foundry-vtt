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
    updateData[`data.health.${res}`] = 0;

    if (pass === "Fail!") {
      this.modifyResource(1, "health", null, "crisis");
    }
    await this.update(updateData);
  }

  async modifyResource(n, type, group, res) {
    const updateData = {};
    const system = this.data.data;

    const currentValue = !group ? system[type][res] : system[type][group][res];
    const max = res === "crisis" ? 10 : 5;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = currentValue + n;

    if (newValue < 0) {
      return;
    }

    if (!group) {
      updateData[`data.${type}.${res}`] = newValue;
    } else {
      updateData[`data.${type}.${group}.${res}`] = newValue;
    }
    await this.update(updateData);
  }
}
