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
    if (currentValue === 5 && n > 0) {
      return;
    }
    const newValue = currentValue + n;
    updateData[`data.${res}`] = newValue;

    await this.update(updateData);
  }
}
