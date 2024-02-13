export default class C2D10ItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 700,
      height: 550,
      classes: ["c2d10", "item-sheet"]
    });
  }

  get template() {
    return `systems/c2d10/templates/sheets/${this.item.type}-sheet.hbs`;
  }

  getData() {
    const sheetData = super.getData();
    sheetData.config = CONFIG.c2d10;
    sheetData.system = this.item.system;
    sheetData.effects = this.item.getEmbeddedCollection("ActiveEffect").contents;

    /**
     * Create a list of powers in the world. Used for selecting parent powers
     * for variants.
     */
    sheetData.worldPowers = [];
    for (const power of game.items) {
      if (power.type === "power") sheetData.worldPowers.push({
        powerId: power.system.powerId,
        name: power.name
      });
    }

    /* Make system settings available for sheets to use for rendering */
    sheetData.showEffects = game.settings.get("c2d10", "showEffects");
    return sheetData;
  }

  activateListeners(html) {
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));
    html.find(".effect-control").click(this._onEffectControl.bind(this));

    super.activateListeners(html);
  }

  _onEffectControl(event) {
    event.preventDefault();
    const owner = this.item;
    const a = event.currentTarget;
    const tr = a.closest("tr");
    const activeEffect = tr.dataset.effectId ? owner.effects.get(tr.dataset.effectId) : null;

    switch (a.dataset.action) {
      case "create":
        return owner.createEmbeddedDocuments("ActiveEffect", [{
          label: "New Effect",
          icon: "icons/svg/aura.svg",
          origin: owner.uuid,
          disabled: true
        }]);
      case "edit":
        return activeEffect.sheet.render(true);
      case "delete":
        return activeEffect.delete();
    }
  }

  _onResourceChange(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const res = element.closest(".resource-row").dataset.id;

    if (event.type === "click") {
      this.item.modifyResource(1, res);
    } else {
      this.item.modifyResource(-1, res);
    }
  }
}
