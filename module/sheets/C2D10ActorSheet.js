/**
 * Base Actor sheet. This holds all functions available to actor sheets and is extended by
 * actor types for specific data.
 */

export default class C2D10ActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/actor-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 910,
      width: 780,
      tabs: [
        {
        }
      ]
    });
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

    super.activateListeners(html);
  }

  /**
   * Simple function to increase or decrese wounds. Triggers an actor-resident function to validate.
   * @param {object} event The clicked event-data.
   */
  _onResourceChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const res = element.closest(".resource-row").dataset.id;


    if (event.type === "click") {
      this.actor.modifyResource(1, res);
    } else {
      this.actor.modifyResource(-1, res);
    }

    const chatData = {
      speaker: ChatMessage.getSpeaker(),
      content: `${ChatMessage.getSpeaker().alias} modified ${res.replace(/^\w/, c => c.toUpperCase())}`
    };

    /* Print results to chatlog. */
    // ChatMessage.create(chatData);
  }
}
