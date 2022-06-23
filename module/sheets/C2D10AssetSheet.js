export default class C2D10AssetSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 725,
      height: 600,
      classes: ["c2d10", "sheet", "asset"]
    });
  }

  get template() {
    return "systems/cd10/templates/sheets/asset-sheet.hbs";
  }
}
