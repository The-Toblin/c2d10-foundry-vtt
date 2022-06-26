import { c2d10 } from "./module/config.js";
import C2D10Item from "./module/C2D10Item.js";
import C2D10ItemSheet from "./module/sheets/C2D10ItemSheet.js";
import C2D10Actor from "./module/C2D10Actor.js";
import C2D10ActorSheet from "./module/sheets/C2D10ActorSheet.js";

/**
 * Loads HandleBars templates for use in the system.
 */
async function preloadHandlebarsTemplates() {
  const templatePaths= [
    "systems/c2d10/templates/partials/sheet-tabs/actor-info.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/actor-talents.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/actor-skills.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/actor-assets-tab.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/actor-traits-tab.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/actor-powers-tab.hbs",
    "systems/c2d10/templates/partials/cards/asset-card.hbs",
    "systems/c2d10/templates/partials/cards/trait-card.hbs"
  ];

  return loadTemplates(templatePaths);
}

/**
 * Register all system settings necessary.
 */
function registerSystemSettings() {
  // Whether or not to show fancy effects in the system.
  game.settings.register("c2d10", "showEffects", {
    config: true,
    scope: "client",
    name: "SETTINGS.showEffects.name",
    hint: "SETTINGS.showEffects.label",
    type: Boolean,
    default: false
  });
}

Hooks.once("init", function() {
  console.log("==== C2D10 | Initialising CD10 RPG System 2nd Edition ====");

  /* Setup Config */
  CONFIG.c2d10 = c2d10;
  CONFIG.Item.documentClass = C2D10Item;
  CONFIG.Actor.documentClass = C2D10Actor;

  /* Register Sheets */
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("c2d10", C2D10ItemSheet, {
    makeDefault: true,
    types: ["asset", "trait"],
    label: "C2D10 Item Sheet"
  });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("c2d10", C2D10ActorSheet, {
    types: ["actor"],
    makeDefault: true,
    label: "C2D10 Character Sheet"
  });

  /* Load Handlebars helpers and partials */
  preloadHandlebarsTemplates();

  /* Register all system settings for C2D10 */
  registerSystemSettings();

  Handlebars.registerHelper("dots", function(n, max) {
    /* Handlebars helper to render dots on sheets. */

    const full =
    `<div class="dot-container full">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-white-full.webp"/>
    </div>`;

    const empty =
    `<div class="dot-container empty">
      <img class="d10-dot-empty" src="/systems/c2d10/assets/d10-white-empty.webp"/>
    </div>`;

    const space =
    `<div class="space">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-white-full.webp"/>
    </div>`;

    const crisis =
    `<div class="dot-container full">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-crisis-full.webp"/>
    </div>`;

    let res = "";
    if (n > 0) {
      for (let i = 0; i < n; ++i) {
        if (i === 5) {
          res += space;
        }
        res += max === 10 ? crisis : full;
      }
    }

    for (let i = n; i < max; ++i) {
      if (i === 5) {
        res += space;
      }
      res += empty;
    }
    return res;
  });
});

