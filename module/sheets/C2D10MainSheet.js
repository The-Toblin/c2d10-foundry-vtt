import C2D10ActorSheet from "./C2D10ActorSheet.js";

/**
 * Override parent class with different settings and templates.
 */
export default class C2D10MainSheet extends C2D10ActorSheet {
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

  getData() {
    const sheetData = super.getData();
    sheetData.config = CONFIG.c2d10;
    sheetData.items = this.actor.items;
    sheetData.system = this.actor.system;

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

    /**
     * Sort character focus.
     */
    sheetData.system.skills.focus.sort(function(a, b) {
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

    sheetData.system.skills.focus.sort(function(a, b) {
      let nameA = a.parent.toUpperCase(); // Ignore upper and lowercase
      let nameB = b.parent.toUpperCase(); // Ignore upper and lowercase
      if (nameA < nameB) {
        return -1; // NameA comes first
      }
      if (nameA > nameB) {
        return 1; // NameB comes first
      }
      return 0;  // Names must be equal
    });

    sheetData.focus = sheetData.system.skills.focus;

    return sheetData;
  }
}
