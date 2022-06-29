export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {

  }

  prepareDerivedData() {
    if (this.getFlag("c2d10", "locked") === undefined) {
      this.actor.setFlag("c2d10", "locked", true);
    }
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
