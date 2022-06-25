export default class C2D10Actor extends Actor {
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {

  }

  prepareDerivedData() {

  }

  async modifyResource(n, res) {
    const updateData = {};
    const currentValue = this.data.data[res];
    const max = res === "crisis" ? 10 : 5;

    if (currentValue === max && n > 0) {
      return;
    }

    const newValue = currentValue + n;

    if (newValue < 0) {
      return;
    }

    updateData[`data.${res}`] = newValue;

    await this.update(updateData);
  }
}
