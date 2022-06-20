export default class C2D10ItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 725,
      height: 600,
      classes: ["c2d10", "sheet", "item"]
    });
  }

  get template() {
    return `systems/cd10/templates/sheets/${this.item.data.type}-sheet.hbs`;
  }
}
