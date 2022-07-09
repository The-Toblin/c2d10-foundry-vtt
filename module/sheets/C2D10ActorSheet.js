import {Test as Roll} from "../C2D10Dice.js";

/**
 * Base Actor sheet. This holds all functions available to actor sheets and can be extended by
 * actor types for specific data.
 */

export default class C2D10ActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/actor-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 990,
      width: 895,
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
    sheetData.system = sheetData.data.data;
    sheetData.items = this.actor.items;

    /* Assets */
    sheetData.assets = sheetData.items.filter(p => p.type === "asset");
    sheetData.traits = sheetData.items.filter(p => p.type === "trait");
    sheetData.variants = sheetData.items.filter(p => p.type === "variant");

    sheetData.talents = {};
    for (const entry of Object.entries(sheetData.system.talents.physical)) {
      sheetData.talents[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(sheetData.system.talents.social)) {
      sheetData.talents[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(sheetData.system.talents.mental)) {
      sheetData.talents[entry[0]] = entry[1];
    }

    sheetData.skills = {};
    for (const entry of Object.entries(sheetData.system.skills.physical)) {
      sheetData.skills[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(sheetData.system.skills.social)) {
      sheetData.skills[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(sheetData.system.skills.mental)) {
      sheetData.skills[entry[0]] = entry[1];
    }

    /* Make system settings available for sheets to use for rendering */
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
    // TODO: Reimplement this functionality at some point.
    /* {
      name: game.i18n.localize("c2d10.sheet.description"),
      icon: '<i class="fas fa-sticky-note"></i>',
      callback: element => {
        const itemId = element.closest(".asset-item")[0].dataset.id;
        const item = this.actor.items.get(itemId);

        item.roll();
      }
    },*/
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
   * Makes sure the listeners are active on the sheet. They monitor mouse-movements and clicks on the sheet
   * and trigger the necessary functions.
   * @param {html} html The sheet HTML.
   */
  activateListeners(html) {
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));
    html.find(".edit-lock").click(this._toggleEditLock.bind(this));
    html.find(".delete-item").click(this._deleteItem.bind(this));
    html.find(".add-focus").click(this._addFocus.bind(this));
    html.find(".remove-focus").click(this._removeFocus.bind(this));
    html.find(".edit-focus").click(this._editFocus.bind(this));
    html.find(".c2d10-test").click(this._basicTest.bind(this));

    new ContextMenu(html, ".asset", this.itemContextMenu);

    super.activateListeners(html);
  }

  /**
   * Function to increase or decrease a resource on the sheet. Allows modification of health resources
   * in spite of sheet lock. Otherwise prevents editing if the sheet is locked.
   * @param {object} event The clicked event-data.
   */
  _onResourceChange(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const type = element.closest(".resource-row").dataset.type;
    const group = element.closest(".resource-row").dataset.group;
    const res = element.closest(".resource-row").dataset.id;
    const pass = element.closest(".resource-row").dataset.pass;

    if (pass || !this.actor.getFlag("c2d10", "locked")) {
      if (event.type === "click") {
        this.actor.modifyResource(1, type, group, res);
      } else {
        this.actor.modifyResource(-1, type, group, res);
      }
    } else {
      ui.notifications.error("Unlock your sheet before attempting to edit it!");
    }
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
            callback: html => { this._doAddFocus(html);

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
    updateData["data.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _removeFocus(event) {
    event.preventDefault();
    const name = event.currentTarget.closest(".focus").dataset.name;
    const currentArray = this.getData().system.skills.focus;

    currentArray.splice(currentArray.findIndex(v => v.name === name), 1);

    const updateData = {};
    updateData["data.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _editFocus(event) {
    event.preventDefault();

    const name = event.currentTarget.closest(".focus").dataset.name;
    const parent = event.currentTarget.closest(".focus").dataset.parent;
    const dialogData = this.getData().system.skills.focus;
    dialogData.focusContent = {name, parent};

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
            label: "Edit!",
            callback: html => { this._doEditFocus(html, dialogData.focusContent);

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
    const newParent= html.find("select#focus-skill").val();
    const index = currentArray.findIndex(p => p.name === focusContent.name);
    currentArray[index] = {
      name: newName,
      parent: newParent
    };

    const updateData = {};
    updateData["data.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _deleteItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".asset-item").dataset.id;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _basicTest(event) {
    event.preventDefault();
    const dataset = event.currentTarget.closest(".c2d10-test").dataset;
    const rollData = {
      crisis: this.getData().system.health.crisis,
      strain: this.getData().system.health.strain,
      stress: this.getData().system.health.stress,
      talents: this.getData().talents,
      skills: this.getData().skills,
      item: dataset.id,
      id: this.actor.id
    };

    Roll.Test(rollData);
  }
}
