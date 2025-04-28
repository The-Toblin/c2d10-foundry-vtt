import C2D10ActorSheet from "./C2D10ActorSheet.js";

/**
 * Override parent class with different settings and templates.
 */
export default class C2D10NPCSheet extends C2D10ActorSheet {
  static get defaultOptions() {
    return foundry.utils.foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/c2d10/templates/sheets/npc-sheet.hbs",
      classes: ["c2d10", "sheet"],
      height: 890,
      width: 700,
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
    return "systems/c2d10/templates/sheets/npc-sheet.hbs";
  }
}
