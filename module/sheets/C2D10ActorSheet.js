/**
 * Base Actor sheet. This holds all functions available to actor sheets and is extended by
 * actor types for specific data.
 */

export default class C2D10ActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/actor-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 750,
      width: 750,
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
   * Define ContextMenus
   */

  /**
   * Skill context menu. Allows level up, editing, removing and posting to chat.
   */
  itemSkillContextMenu = [
    {
      name: game.i18n.localize("c2d10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);

        item.sheet.render(true);
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.description"),
      icon: '<i class="fas fa-sticky-note"></i>',
      callback: element => {
        const itemId = element.data("item-id");
        const item = this.actor.items.get(itemId);

        item.showDescription();
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
      }
    }
  ];

  /**
   * Makes sure the listeners are active on the sheet. They monitor mouse-movements and clicks on the sheet
   * and trigger the necessary functions.
   * @param {html} html The sheet HTML.
   */
  activateListeners(html) {

    /**
     * Context Menu Listeners
     */
    new ContextMenu(html, ".skill-item", this.itemSkillContextMenu);
    super.activateListeners(html);
  }
}
