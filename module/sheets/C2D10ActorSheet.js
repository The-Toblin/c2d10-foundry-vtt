import {healthTest, wealthTest, talentTest, skillTest, powerTest} from "../dice/C2D10Roll.js";

/**
 * Base Actor sheet. This holds all functions available to actor sheets and can be extended by
 * actor types for specific data.
 */

export default class C2D10ActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/actor-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 890,
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
    sheetData.assets = sheetData.items.filter(p => p.type === "asset" || p.type === "armor" || p.type === "weapon" );
    sheetData.virtues = sheetData.items.filter(p => p.type === "trait" && p.system.traitType === "virtue");
    sheetData.vices = sheetData.items.filter(p => p.type === "trait" && p.system.traitType === "vice");
    sheetData.powers = sheetData.items.filter(p => p.type === "power");
    sheetData.variants = sheetData.items.filter(p => p.type === "variant");

    /**
     * Set a flag to allow the traits tab to be shown if traits are present.
     */
    if (sheetData.vices || sheetData.virtues) sheetData.traits = true;

    /**
     * Create list objects to use for dialogs.
     */
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

    /**
     * Sort character's traits
     */
    sheetData.virtues.sort(function(a, b) {
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

    sheetData.vices.sort(function(a, b) {
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

    sheetData.powers.sort(function(a, b) {
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

    sheetData.variants.sort(function(a, b) {
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
   * Makes sure the listeners are active on the sheet. They monitor mouse-movements and clicks on the sheet
   * and trigger the necessary functions.
   * @param {html} html The sheet HTML.
   */
  activateListeners(html) {
    html.find(".dot-container").on("click contextmenu", this._onResourceChange.bind(this));
    html.find(".description").on("contextmenu", this._postDescription.bind(this));
    html.find(".power-description").on("contextmenu", this._postPowerDescription.bind(this));
    html.find(".edit-lock").click(this._toggleEditLock.bind(this));
    html.find(".delete-item").click(this._deleteItem.bind(this));
    html.find(".add-focus").click(this._addFocus.bind(this));
    html.find(".remove-focus").click(this._removeFocus.bind(this));
    html.find(".focus-edit").on("click contextmenu", this._editFocus.bind(this));
    html.find(".c2d10-health-test").click(this._doHealthTest.bind(this));
    html.find(".c2d10-wealth-test").click(this._doWealthTest.bind(this));
    html.find(".c2d10-talent-test").click(this._doTalentTest.bind(this));
    html.find(".c2d10-skill-test").click(this._doSkillTest.bind(this));
    html.find(".c2d10-power-test").click(this._doPowerTest.bind(this));

    new ContextMenu(html, ".asset", this.itemContextMenu);

    super.activateListeners(html);
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
            label: "Save!",
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
    updateData["system.skills.focus"] = currentArray;

    await this.actor.update(updateData);
  }

  async _deleteItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".asset-item").dataset.id;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  /**
   * Perform a health test.
   * @param {html} event html click event data, including dataset.
   */
  async _doHealthTest(event) {
    event.preventDefault();
    if (event.shiftKey) {
      this._postDescription(event);
      return;
    }

    const actorId = this.actor.id;
    const dataset = event.currentTarget.closest(".c2d10-test").dataset;
    const crisis = await this.actor.system.health.crisis;
    const stress = dataset.id === "stress";

    let poolObject = stress ? await this.actor.system.health.stress.value : await this.actor.system.health.strain.value;
    const pool = poolObject < 0 ? 1 : poolObject;

    await healthTest(crisis, pool, stress, actorId);
  }

  /**
   * Perform a wealth test.
   * @param {html} event html click event data, including dataset.
   */
  async _doWealthTest(event) {
    event.preventDefault();
    if (event.shiftKey) {
      this._postDescription(event);
      return;
    }
    const sys = this.getData().system;
    const actorId = this.actor.id;

    let pool = this.actor.health.mentalImpairment ? parseInt(sys.info.wealth - 2) : sys.info.wealth;
    if (pool < 0) pool = 1;
    await wealthTest(sys.health.crisis.mental, pool, actorId);
  }

  /**
   * Perform a Talent test.
   * @param {html} event html click event data, including dataset.
   */
  async _doTalentTest(event) {
    event.preventDefault();
    if (event.shiftKey) {
      this._postDescription(event);
      return;
    }
    const dataset = event.currentTarget.closest(".c2d10-test").dataset;
    const sys = this.getData().system;
    let pool = parseInt(sys.talents[dataset.group][dataset.id] * 2);
    const actorId = this.actor.id;
    const crisis = sys.health.crisis;

    if (dataset.group === "physical" && sys.health.physicalImpairment) {
      pool -= 2;

      if (pool < 1) pool = 1;
    }

    if (dataset.group !== "physical" && sys.health.mentalImpairment) {
      pool -= 2;

      if (pool < 1) pool = 1;
    }

    await talentTest(crisis, dataset.id, pool, actorId);
  }

  /**
   * Perform a Skill test.
   * @param {html} event html click event data, including dataset.
   */
  async _doSkillTest(event) {
    event.preventDefault();
    if (event.shiftKey) {
      this._postDescription(event);
      return;
    }
    const dataset = event.currentTarget.closest(".c2d10-test").dataset;
    const sys = this.getData().system;
    let pool = sys.skills[dataset.group][dataset.id];
    const talents = this.getData().talents;
    const actorId = this.actor.id;
    const crisis = sys.health.crisis;

    if (dataset.group === "physical" && sys.health.physicalImpairment) {
      pool -= 2;

      if (pool < 1) pool = 1;
    }

    if (dataset.group !== "physical" && sys.health.mentalImpairment) {
      pool -= 2;

      if (pool < 1) pool = 1;
    }

    await skillTest(crisis, dataset.id, pool, talents, actorId, dataset.group);
  }

  /**
   * Perform a test with a power
   * @param {html} event html click event data, including dataset.
   */
  async _doPowerTest(event) {
    event.preventDefault();

    if (event.shiftKey) {
      this._postPowerDescription(event);
      return;
    }
    const dataset = event.currentTarget.closest(".c2d10-test").dataset;
    const power = this.actor.items.get(dataset.id);
    const sys = this.actor.system;
    let pool = power.system.level;
    const talents = this.getData().talents;
    const actorId = this.actor.id;
    const crisis = sys.health.crisis;

    if (sys.health.mentalImpairment) {
      pool -= 2;

      if (pool < 1) pool = 1;
    }

    await powerTest(crisis, power.name, pool, talents, actorId);
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

  async _postPowerDescription(event) {
    event.preventDefault();
    const id = event.currentTarget.closest(".power-description").dataset.id;
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
}
