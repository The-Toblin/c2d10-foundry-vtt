import { c2d10 } from "./module/config.js";
import C2D10Item from "./module/C2D10Item.js";
import C2D10ItemSheet from "./module/sheets/C2D10ItemSheet.js";
import C2D10Actor from "./module/C2D10Actor.js";
import C2D10ActorSheet from "./module/sheets/C2D10ActorSheet.js";

/**
 * Loads HandleBars templates for use in the system.
 */
async function preloadHandlebarsTemplates() {
  const templatePaths= [];

  return loadTemplates(templatePaths);
}

/**
 * Register all system settings necessary.
 */
function registerSystemSettings() {

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

  Handlebars.registerHelper("dots", function(n) {
    /* Handlebars helper to render dots on sheets. */

    const max = 5;
    let res = "";
    if (n > 0) {
      for (let i = 0; i < n; ++i) {
        res +=
      `<div class="dot-container full">
        <i class="fas fa-diamond"></i>
      </div>`;
      }
    }

    for (let i = n; i < max; ++i) {
      res +=
        `<div class="dot-container empty">
          <i class="far fa-diamond"></i>
        </div>`;
    }

    return res;
  });
});

