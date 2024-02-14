import { rollTest } from "../dice/C2D10Roll.js";

/**
 * Base Actor sheet. This holds all functions available to actor sheets and can be extended by
 * actor types for specific data.
 */

export default class C2D10ActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/actor-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 895,
      width: 910,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "info"
        }
      ]
    });
  }

  getData() {
    const sheetData = super.getData();
    sheetData.config = CONFIG.c2d10;
    sheetData.items = this.actor.items;
    sheetData.system = this.actor.system;

    /**
     * Items
     */
    sheetData.assets = sheetData.system.extras.assets;
    sheetData.equipment = sheetData.system.extras.equipment;

    /**
     * Traits
     */
    sheetData.virtues = sheetData.system.extras.virtues;
    sheetData.vices = sheetData.system.extras.vices;

    /**
     * Powers
     */
    sheetData.powers = sheetData.system.extras.powers;
    sheetData.variants = sheetData.system.extras.variants;

    /**
     * Equipment
     */
    sheetData.equippedWeapon = sheetData.system.extras.equippedWeapon;
    sheetData.equippedArmor = sheetData.system.extras.equippedArmor;

    /**
     * Talents
     */
    sheetData.talents = sheetData.system.extras.talents;

    /**
     * Skills
     */
    sheetData.skills = sheetData.system.extras.skills;

    /**
     * Set a flag to allow the traits tab to be shown if traits are present.
     */
    if (sheetData.vices || sheetData.virtues) sheetData.traits = true;

    /**
     * Make system settings available for sheets to use for rendering
     */
    sheetData.showEffects = game.settings.get("c2d10", "showEffects");
    sheetData.locked = this.actor.getFlag("c2d10", "locked");
    return sheetData;
  }

  // Define which template to be used by this actor type.
  get template() {
    return "systems/c2d10/templates/sheets/actor-sheet.hbs";
  }

  /**
   * Generic item context menu. Edit, post and remove.
   */
  itemContextMenu = [
    {
      name: game.i18n.localize("c2d10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const itemId = element.closest(".asset-item")[0].dataset.id;
        const item = this.actor.items.get(itemId);

        item.sheet.render(true);
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        const itemId = element.closest(".asset-item")[0].dataset.id;
        this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      }
    }
  ];

  /**
   * Equipment item context menu. Edit, equip/unequip, post and remove.
   */
  equipmentContextMenu = [
    {
      name: game.i18n.localize("c2d10.sheet.equip"),
      icon: '<i class="fas fa-toolbox"></i>',
      callback: element => {
        const itemId = element.closest(".equipment-item")[0].dataset.id;
        const item = this.actor.items.get(itemId);

        item.equipItem();
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const itemId = element.closest(".equipment-item")[0].dataset.id;
        const item = this.actor.items.get(itemId);

        item.sheet.render(true);
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        const itemId = element.closest(".equipment-item")[0].dataset.id;
        const item = this.actor.items.get(itemId);

        if (this.actor.system.equipment[item.type] === itemId) {
          item.equipItem(true);
        }
        this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      }
    }
  ];


  /**
   * Makes sure the listeners are active on the sheet. They monitor mouse-movements and clicks on the sheet
   * and trigger the necessary functions.
   * @param {html} html The sheet HTML.
   */
  activateListeners(html) {
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));
    html.find(".health-container").on("click contextmenu", this._onModifyHealth.bind(this));
    html.find(".c2d10-consequence-box").on("click contextmenu", this._onToggleConsequence.bind(this));
    html.find(".description").on("contextmenu", this._postDescription.bind(this));
    html.find(".item-description").on("contextmenu", this._postItemDescription.bind(this));
    html.find(".edit-lock").click(this._toggleEditLock.bind(this));
    html.find(".delete-item").click(this._deleteItem.bind(this));
    html.find(".add-focus").click(this._addFocus.bind(this));
    html.find(".remove-focus").click(this._removeFocus.bind(this));
    html.find(".focus-edit").on("click contextmenu", this._editFocus.bind(this));
    html.find(".c2d10-health-test").click(this._doRollTest.bind(this));
    html.find(".c2d10-economy-test").click(this._doRollTest.bind(this));
    html.find(".c2d10-talent-test").click(this._doRollTest.bind(this));
    html.find(".c2d10-skill-test").click(this._doRollTest.bind(this));
    html.find(".c2d10-power-test").click(this._doRollTest.bind(this));
    html.find(".c2d10-attack-weapon").click(this._doPostEquipmentCard.bind(this));
    // Html.find(".asset").click(this._onClickItem.bind(this));
    html.find(".equipment").click(this._onClickItem.bind(this));
    html.find(".quantity-asset").click(this._modifyQuantity.bind(this));
    html.find(".c2d10-toggle-effect").click(this._onToggleEffect.bind(this));

    // Ugly hack to make the sheet update when switching tabs, since active effects don't trigger a sheet update.
    html.find(".sheet-tabs").click(this._onNavClick.bind(this));

    new ContextMenu(html, ".asset", this.itemContextMenu);
    new ContextMenu(html, ".equipment", this.equipmentContextMenu);

    super.activateListeners(html);
  }

  _onNavClick(event) {
    event.preventDefault();
    this.render(true);
  }

  _modifyQuantity(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest(".asset-item").dataset.id;
    const item = this.actor.items.get(itemId);

    const modifier = element.className.includes("increase") ? 1 : -1;
    const quantity = item.system.quantity + modifier;

    const updateData = {
      "system.quantity": quantity
    };

    if (quantity >= 0) item.update(updateData);
  }

  /**
   * Render the item sheet when clicking an item
   * @param {object} event The clicked event-data.
   */
  _onClickItem(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest(".asset-item").dataset.id;
    const item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  /**
   * Function to increase or decrease a resource on the sheet. Allows modification of health resources
   * in spite of sheet lock. Otherwise prevents editing if the sheet is locked.
   *
   *  Left click increases an attribute and right click, or shift-left click (for chromebook support)
   * reduces it.
   * @param {object} event The clicked event-data.
   */
  _onResourceChange(event) {
    event.preventDefault();
    const element = event.currentTarget;

    if (element.closest(".power-resource-row") !== null && !this.actor.getFlag("c2d10", "locked")) {
      const dataset = element.closest(".power-resource-row").dataset;
      const item = this.actor.items.get(dataset.id);
      const res = dataset.res;

      if (event.type === "click" && !event.shiftKey) {
        item.modifyResource(1, res);
      } else if (event.type === "contextmenu" || event.shiftKey) {
        item.modifyResource(-1, res);
      }

      return;
    } else if (element.closest(".power-resource-row") !== null && this.actor.getFlag("c2d10", "locked")) {
      ui.notifications.error("Unlock your sheet before attempting to edit it!");
      return;
    }

    const type = element.closest(".resource-row").dataset.type;
    const group = element.closest(".resource-row").dataset.group;
    const res = element.closest(".resource-row").dataset.id;
    const pass = element.closest(".resource-row").dataset.pass;

    if (type === "health") {
      if (event.type === "click" && !event.shiftKey) {
        this.actor.modifyHealth(true, event.ctrlKey, res);
      } else if (event.type === "contextmenu" || event.shiftKey) {
        this.actor.modifyHealth(false, event.ctrlKey, res);
      }
    }

    else if (pass || !this.actor.getFlag("c2d10", "locked")) {
      if (event.type === "click" && !event.shiftKey) {
        this.actor.modifyResource(1, type, group, res);
      } else if (event.type === "contextmenu" || event.shiftKey) {
        this.actor.modifyResource(-1, type, group, res);
      }
    } else {
      ui.notifications.error("Unlock your sheet before attempting to edit it!");
    }
  }

  _onModifyHealth(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.closest(".health-container").dataset;

    this.actor.modifyHealth(dataset.group, dataset.id);
  }

  /**
   * Locks or unlocks the sheet for editing, using a flag on the actor.
   * @param {object} event Eventdata from the click.
   */
  _toggleEditLock(event) {
    event.preventDefault();
    const setFlag = !this.actor.getFlag("c2d10", "locked");
    this.actor.setFlag("c2d10", "locked", setFlag);
  }

  /**
   * Adds a focus to the character.
   * @param {object} event Eventdata from the click.
   */
  async _addFocus(event) {
    if (event) event.preventDefault();

    const dialogOptions = {
      classes: ["c2d10-dialog", "addFocus"],
      top: 300,
      left: 400
    };
    new Dialog(
      {
        title: "Add a focus",
        content: await renderTemplate("systems/c2d10/templates/dialogs/add-focus-dialog.hbs", this.getData()),
        buttons: {
          roll: {
            label: "Add!",
            callback: html => {
              this._doAddFocus(html);

            }
          }
        }
      },
      dialogOptions
    ).render(true);
  }

  async _doAddFocus(html) {
    const currentArray = this.getData().system.skills.focus;
    currentArray.push({
      name: html.find("input#focus-name").val(),
      parent: html.find("select#focus-skill").val()
    });

    const updateData = {};
    updateData["system.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _removeFocus(event) {
    event.preventDefault();
    const name = event.currentTarget.closest(".focus").dataset.name;
    const currentArray = this.getData().system.skills.focus;

    currentArray.splice(currentArray.findIndex(v => v.name === name), 1);

    const updateData = {};
    updateData["system.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _editFocus(event) {
    event.preventDefault();
    const dataset = event.currentTarget.closest(".focusdata").dataset;
    const name = dataset.name;
    const parent = dataset.parent;
    const dialogData = this.getData();
    dialogData.focusContent = { name, parent };

    const dialogOptions = {
      classes: ["c2d10-dialog", "editFocus"],
      top: 300,
      left: 400
    };
    new Dialog(
      {
        title: "Edit a focus",
        content: await renderTemplate("systems/c2d10/templates/dialogs/add-focus-dialog.hbs", dialogData),
        buttons: {
          roll: {
            label: "Save!",
            callback: html => {
              this._doEditFocus(html, dialogData.focusContent);

            }
          }
        }
      },
      dialogOptions
    ).render(true);
  }

  async _doEditFocus(html, focusContent) {
    const currentArray = this.getData().system.skills.focus;
    const newName = html.find("input#focus-name").val();
    const newParent = html.find("select#focus-skill").val();
    const index = currentArray.findIndex(p => p.name === focusContent.name);
    currentArray[index] = {
      name: newName,
      parent: newParent
    };

    const updateData = {};
    updateData["system.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _deleteItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".asset-item").dataset.id;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  /**
   * Perform a test or contest.
   * @param {html} event html click event data, including dataset.
   */
  async _doRollTest(event) {
    event.preventDefault();

    // If the shiftkey is held down, post the description to chat instead of rolling.
    if (event.shiftKey) {
      this._postDescription(event);
      return;
    }

    // Extract the dataset from the HTML data and establish a few constants we'll need.
    const dataset = event.currentTarget.closest(".c2d10-test").dataset;
    const sys = this.getData().system;
    const actorId = this.actor.id;

    /**
     * A test (or roll) in C2D10 requires two (or rarely three) pools,
     * the impairment status of the actor performing the roll,
     * the character's current number of crisis dice.
     *
     * The function in the roll class takes the actorId, the type, group and id (name in clear text) of
     * the primary pool item, that item's pool value (number of D10), and the character's impairment.
     *
     * So we'll first need to establish those values and deliver them to the function.
     *
     * The ActorId was already set above. The rest we can derive either from the actor's system
     * data or from the dataset.
     */


    const type = dataset.type;
    const group = dataset.group;
    const id = dataset.id;
    const physicalImpairment = sys.health.physicalImpairment;
    const mentalImpairment = sys.health.mentalImpairment;
    const crisis = sys.health.crisis;
    let damage = 0;
    let damageType = true;
    let pool = null;
    let name = null; // This is just to get around the fact that we use itemId to fetch power data.

    // First, if this is an acquisition roll, set the pool to the economy value.
    if (id === "economy") {
      pool = sys[type][id] > 1 ? sys[type][id] : 1;
      name = id;

    // If not, check if it's a health test and determine the value of the pool.
    } else if (type === "health") {
      pool = sys[type][id].value > 1 ? sys[type][id].value : 1;
      name = id;

    // If it's a power test, we fetch the pool value from the power item.
    } else if (type === "powers") {
      pool = this.actor.items.get(id).system.level;
      name = this.actor.items.get(id).name;

    // Check for attacks
    } else if (type === "attack") {
      let item = this.actor.items.get(id);
      item.showDescription();
      name = item.name;

      damageType = this.actor.system.extras.equippedWeapon.damageType === "Critical";
      damage = this.actor.system.extras.equippedWeapon.damage;

      // Finally, the remaining option is either a talent or skill test, both of which are handled identically.
    } else {
      pool = sys[type][group][id];
      name = id;
    }

    // Perform the roll
    await rollTest(actorId, type, group, name, pool, physicalImpairment, mentalImpairment, crisis, damage, damageType);
  }

  async _doPostEquipmentCard(event) {
    event.preventDefault();
    // Commenting the following out for the time being. Apparently I posted the description twice by accident.
    // const id = event.currentTarget.closest(".equipment-item").dataset.id;
    // const item = this.actor.items.get(id);
    // item.showDescription();
    this._doRollTest(event);
  }

  async _postDescription(event) {
    event.preventDefault();
    const id = event.currentTarget.closest(".description").dataset.id;
    const messageTemplate = "systems/c2d10/templates/partials/chat-templates/description.hbs";
    const messageContext = {
      description: game.i18n.localize(`c2d10.descriptions.${id}`),
      title: id
    };
    const chatData = {
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(messageTemplate, messageContext)
    };

    ChatMessage.create(chatData);
  }

  async _postItemDescription(event) {
    event.preventDefault();
    const id = event.currentTarget.closest(".item-description").dataset.id;
    const item = this.actor.items.get(id);
    const messageTemplate = "systems/c2d10/templates/partials/chat-templates/description.hbs";
    const messageContext = {
      description: item.system.description,
      title: item.name
    };
    const chatData = {
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(messageTemplate, messageContext)
    };

    ChatMessage.create(chatData);
  }

  async _onToggleEffect(event) {
    event.preventDefault();
    const owner = this.actor;
    const a = event.currentTarget;
    const tr = a.closest("tr");
    const item = tr.dataset.id ? owner.items.get(tr.dataset.id) : null;

    item.toggleEffects();

    this.render(true); // Ugly hack to update the sheet with new data, since active effects don't do this inherently.
  }

  async _onToggleConsequence(event) {
    event.preventDefault();
    const dataset = event.currentTarget.closest(".c2d10-consequence-box").dataset;

    await this.actor.toggleConsequence(dataset.id);
  }
}
