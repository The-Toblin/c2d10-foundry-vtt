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
      height: "auto",
      width: "auto",
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "info"
        }
      ]
    });
  }

  async getData() {
    const sheetData = super.getData();
    sheetData.config = CONFIG.c2d10;
    sheetData.items = this.actor.items;
    sheetData.system = this.actor.system;

    sheetData.skills = {};
    for (const entry of Object.entries(sheetData.system.skills.physical)) {
      sheetData.skills[entry[0]] = entry[1].rank;
    }
    for (const entry of Object.entries(sheetData.system.skills.social)) {
      sheetData.skills[entry[0]] = entry[1].rank;
    }
    for (const entry of Object.entries(sheetData.system.skills.mental)) {
      sheetData.skills[entry[0]] = entry[1].rank;
    }

    if (!sheetData.system.focus) {
      sheetData.system.focus = await this.actor.getFocuses();

      sheetData.system.focus.sort(function(a, b) {
        let nameA = a.focusDescription.toUpperCase(); // Ignore upper and lowercase
        let nameB = b.focusDescription.toUpperCase(); // Ignore upper and lowercase
        if (nameA < nameB) {
          return -1; // NameA comes first
        }
        if (nameA > nameB) {
          return 1; // NameB comes first
        }
        return 0;  // Names must be equal
      });

      sheetData.system.focus.sort(function(a, b) {
        let nameA = a.name.toUpperCase(); // Ignore upper and lowercase
        let nameB = b.name.toUpperCase(); // Ignore upper and lowercase
        if (nameA < nameB) {
          return -1; // NameA comes first
        }
        if (nameA > nameB) {
          return 1; // NameB comes first
        }
        return 0;  // Names must be equal
      });
    }

    /**
     * Items
     */
    sheetData.assets = sheetData.system.extras.assets;
    sheetData.equipment = sheetData.system.extras.equipment;

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
     * Cybernetics
     */
    sheetData.cybernetics = sheetData.system.extras.cybernetics;

    /**
     * Talents
     */
    sheetData.talents = sheetData.system.extras.talents;

    /**
     * Skills
     */
    sheetData.skills = sheetData.system.extras.skills;

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
      name: game.i18n.localize("c2d10.sheet.equip"),
      icon: '<i class="fas fa-toolbox"></i>',
      callback: element => {
        const itemId = element[0].dataset.id;
        const item = this.actor.items.get(itemId);

        if (typeof item === "object") {
          item.equipItem();
        } else {
          ui.notifications.error("Not an equippable item!");
        }
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const itemId = element[0].dataset.id;
        const item = this.actor.items.get(itemId);

        if (typeof item === "object") {
          this._showItemSheet(null, item);
        } else {
          ui.notifications.error("Not an editable item!");
        }
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.postDescription"),
      icon: '<i class="fas fa-book"></i>',
      callback: element => {
        console.log(element);
        const itemId = element[0].dataset.id;
        const item = this.actor.items.get(itemId);

        console.log("Your itemId is:", itemId);

        if (typeof item === "object") {
          item.showDescription();
        } else {
          this._postDescription(itemId);
        }
      }
    },
    {
      name: game.i18n.localize("c2d10.sheet.remove"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        const itemId = element[0].dataset.id;
        const item = this.actor.items.get(itemId);

        if (typeof item === "object") {
          if (this.actor.system.equipment[item.type] === itemId) {
            item.equipItem(true);
          }
          this.actor.deleteEmbeddedDocuments("Item", [itemId]);

        } else {
          ui.notifications.error("This item cannot be removed!");
        }
      }
    }
  ];

  /**
   * Makes sure the listeners are active on the sheet. They monitor mouse-movements and clicks on the sheet
   * and trigger the necessary functions.
   * @param {html} html The sheet HTML.
   */
  activateListeners(html) {
    html.find(".c2d10-clickable-item").on("click", this._onClickItem.bind(this));
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));
    html.find(".health-container").on("click contextmenu", this._onModifyHealth.bind(this));
    html.find(".c2d10-consequence-clickbox").on("click contextmenu", this._onToggleConsequence.bind(this));
    html.find(".edit-lock").click(this._toggleEditLock.bind(this));
    html.find(".delete-item").click(this._deleteItem.bind(this));
    html.find(".add-focus").click(this._addFocus.bind(this));
    html.find(".add-trait").click(this._addTrait.bind(this));
    html.find(".remove-trait").click(this._removeTrait.bind(this));
    html.find(".remove-focus").click(this._removeFocus.bind(this));
    html.find(".c2d10-do-roll").on("click contextmenu", this._doRollTest.bind(this));
    html.find(".quantity-asset").click(this._modifyQuantity.bind(this));
    html.find(".c2d10-toggle-effect").click(this._onToggleEffect.bind(this));
    html.find(".c2d10-button-collapsible").click(this._onToggleCollapsible.bind(this));

    new ContextMenu(html, ".c2d10-clickable-item", this.itemContextMenu);

    super.activateListeners(html);
  }

  // === GENERAL CLICK INTERACTION WITH THE SHEET ===
  /**
   * Handle clicking on a label or item on the sheet
   * @param {object}  event       The clicked event-data.
   */
  _onClickItem(event) {
    event.preventDefault();
    const classList = event.currentTarget.classList;
    const itemId = classList.contains("c2d10-clickable-item") ? event.currentTarget.closest(".c2d10-sheet-item").dataset.id : null;

    if (itemId === null) {
      console.error("No valid ItemID provided!");
      return;
    } else {
      console.log("Your ItemID is:", itemId);
    }

    if (classList.contains("c2d10-equipment-item") || classList.contains("c2d10-variant-item") || classList.contains("c2d10-asset-item")) {
      const item = this.actor.items.get(itemId);
      this._showItemSheet(event, item);

    } else {
      this._postDescription(event, itemId);
    }
  }

  _showItemSheet(event, item) {
    item.sheet.render(true);
  }

  async _postDescription(event = null, itemId = null) {
    if (event !== null) event.preventDefault();
    let newId = itemId;

    if (itemId === null) {
      const classList = event.currentTarget.classList;
      newId = classList.contains("c2d10-sheet-item") ? event.currentTarget.closest(".c2d10-sheet-item").dataset.id : null;

      if (newId === null) {
        console.error("No valid ItemID provided!");
        return;
      } else {
        console.log("Your ItemID is:", newId);
      }
    }

    const messageTemplate = "systems/c2d10/templates/partials/chat-templates/description.hbs";
    const messageContext = {
      description: game.i18n.localize(`c2d10.descriptions.${newId}`),
      title: newId
    };

    const chatData = {
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(messageTemplate, messageContext)
    };

    ChatMessage.create(chatData);
  }

  async _deleteItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".c2d10-asset-item").dataset.id;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  _modifyQuantity(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest(".c2d10-asset-item").dataset.id;
    const item = this.actor.items.get(itemId);

    const modifier = element.className.includes("increase") ? 1 : -1;
    const quantity = item.system.quantity + modifier;

    const updateData = {
      "system.quantity": quantity
    };

    if (quantity >= 0) item.update(updateData);
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
              this.actor.addFocus(html.find("input#focus-name").val(), html.find("select#focus-skill").val());
            }
          }
        }
      },
      dialogOptions
    ).render(true);
  }

  async _removeFocus(event) {
    event.preventDefault();
    const dataset = event.currentTarget.closest(".focusdata").dataset;
    this.actor.removeFocus(dataset.parent, dataset.name);
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

  async _addTrait(event) {
    if (event) event.preventDefault();

    await this.actor.addTrait(false, 0);
  }

  async _removeTrait(event) {
    if (event) event.preventDefault();

    await this.actor.addTrait(true, event.currentTarget.closest(".remove-trait").dataset.id);

  }


  /**
   * Perform a test or contest.
   * @param {html} event html click event data, including dataset.
   */
  async _doRollTest(event) {
    event.preventDefault();

    // If the shiftkey is held down or it's a right click, handle it as an item click and call the _onClickItem instead.
    if (event.shiftKey || event.button === 2) {
      this._onClickItem(event);
      return;
    }

    // Extract the dataset from the HTML data and establish a few constants we'll need.
    const dataset = event.currentTarget.closest(".c2d10-do-roll").dataset;
    const sys = this.getData().system;
    const actorId = this.actor.id;

    /**
     * A test (or roll) in C2D10 requires two (or rarely three) pools.
     *
     * The function in the roll class takes the actorId, the type, group and id (name in clear text) of
     * the primary pool item and that item's pool value (number of D10).
     *
     * So we'll first need to establish those values and deliver them to the function.
     *
     * The ActorId was already set above. The rest we can derive either from the actor's system
     * data or from the dataset.
     */


    const type = dataset.type;
    const group = dataset.group;
    const id = dataset.id;
    let damage = 0;
    let pool = null;
    let name = null; // This is just to get around the fact that we use itemId to fetch power data.

    // First, if this is an acquisition roll, set the pool to the economy value.
    if (id === "economy") {
      pool = sys.info[id] > 1 ? sys.info[id] : 1;
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

      damage = this.actor.system.extras.equippedWeapon.damage;

      // Skills need an extra touch, because of the data structure using "rank".
    } else if (type === "skills") {
      pool = sys[type][group][id].rank;
      name = id;

      // Finally, the remaining option is either a talent or skill test, both of which are handled identically.
    } else {
      pool = sys[type][group][id];
      name = id;
    }

    // Perform the roll
    await rollTest(actorId, type, group, name, pool, damage);
  }

  async _doPostEquipmentCard(event) {
    event.preventDefault();
    // Commenting the following out for the time being. Apparently I posted the description twice by accident.
    // const id = event.currentTarget.closest(".equipment-item").dataset.id;
    // const item = this.actor.items.get(id);
    // item.showDescription();
    this._doRollTest(event);
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

  _onToggleCollapsible(event) {
    event.preventDefault();

    const buttonClass = event.currentTarget;
    const content = buttonClass.nextElementSibling;

    if (content.style.display === "flex") {

      content.style.display = "none";
      buttonClass.textContent = "Open Power";

    } else {
      content.style.display = "flex";
      buttonClass.textContent = "Close Power";
    }
  }
}
