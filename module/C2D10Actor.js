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
    const newValue = currentValue + n;
    updateData[`data.${res}`] = newValue;

    await this.update(updateData);
  }
}
