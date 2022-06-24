export default class C2D10AssetSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 700,
      height: 460,
      classes: ["c2d10", "sheet", "asset"]
    });
  }

  get template() {
    return "systems/c2d10/templates/sheets/asset-sheet.hbs";
  }

  getData() {
    const sheetData = super.getData();
    sheetData.config = CONFIG.cd10;
    sheetData.data = sheetData.data.data;

    /* Make system settings available for sheets to use for rendering */
    sheetData.showEffects = game.settings.get("c2d10", "showEffects");
    return sheetData;
  }

  activateListeners(html) {
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));

    super.activateListeners(html);
  }

  _onResourceChange(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const res = element.closest(".resource-row").dataset.id;
    const pass = element.closest(".resource-row").dataset.pass;

    if (event.type === "click") {
      this.item.modifyResource(1, res);
    } else {
      this.item.modifyResource(-1, res);
    }
  }
}
