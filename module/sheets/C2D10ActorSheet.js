/**
 * Base Actor sheet. This holds all functions available to actor sheets and is extended by
 * actor types for specific data.
 */

export default class C2D10ActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/actor-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 950,
      width: 780,
      tabs: [
        {
        }
      ]
    });
  }

  constructor(actor, options) {
    super(actor, options);
    this.actor.setFlag("c2d10", "locked", true);
  }

  getData() {
    const sheetData = super.getData();
    sheetData.config = CONFIG.cd10;
    sheetData.data = sheetData.data.data;

    /* Make system settings available for sheets to use for rendering */
    sheetData.showEffects = game.settings.get("c2d10", "showEffects");
    return sheetData;
  }


  // Define which template to be used by this actor type.
  get template() {
    return "systems/c2d10/templates/sheets/actor-sheet.hbs";
  }

  /**
   * Makes sure the listeners are active on the sheet. They monitor mouse-movements and clicks on the sheet
   * and trigger the necessary functions.
   * @param {html} html The sheet HTML.
   */
  activateListeners(html) {
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));
    html.find(".edit-lock").click(this._toggleEditLock.bind(this));

    super.activateListeners(html);
  }

  /**
   * Function to increase or decrease a resource on the sheet.
   * @param {object} event The clicked event-data.
   */
  _onResourceChange(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const res = element.closest(".resource-row").dataset.id;
    const pass = element.closest(".resource-row").dataset.pass;

    if (pass || !this.actor.getFlag("c2d10", "locked")) {
      if (event.type === "click") {
        this.actor.modifyResource(1, res);
      } else {
        this.actor.modifyResource(-1, res);
      }
    } else {
      ui.notifications.error("Unlock your sheet before attempting to edit it!");
    }
  }

  _toggleEditLock(event) {
    event.preventDefault();
    const setFlag = !this.actor.getFlag("c2d10", "locked");
    this.actor.setFlag("c2d10", "locked", setFlag);
  }
}
