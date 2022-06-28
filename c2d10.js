import { c2d10 } from "./module/config.js";
import C2D10Item from "./module/C2D10Item.js";
import C2D10ItemSheet from "./module/sheets/C2D10ItemSheet.js";
import C2D10Actor from "./module/C2D10Actor.js";
import C2D10ActorSheet from "./module/sheets/C2D10ActorSheet.js";
import { C2D10HeroPoints, C2D10VillainPoints, C2D10Difficulty } from "./module/C2D10Utility.js";

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
    "systems/c2d10/templates/partials/sheet-tabs/actor-focus-tab.hbs",
    "systems/c2d10/templates/partials/list-items/asset-list-item.hbs",
    "systems/c2d10/templates/partials/list-items/trait-list-item.hbs",
    "systems/c2d10/templates/partials/list-items/variant-list-item.hbs",
    "systems/c2d10/templates/partials/add-focus-dialog.hbs"
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

  /**
   * Tracking Narrative Points
   */
  game.settings.register("c2d10", "heroPoints", {
    config: false,
    scope: "world",
    name: "SETTINGS.heroPoints.name",
    hint: "SETTINGS.heroPoints.label",
    type: Number,
    default: 0,
    restricted: false,
    onChange: value => $(".hp-control-numbers").text(value)
  });
  game.settings.register("c2d10", "villainPoints", {
    config: false,
    scope: "world",
    name: "SETTINGS.villainPoints.name",
    hint: "SETTINGS.villainPoints.label",
    type: Number,
    default: 0,
    onChange: value => $(".vp-control-numbers").text(value)
  });

  /**
   * Add setting for tracking global DC.
   */
  game.settings.register("c2d10", "DC", {
    config: false,
    scope: "world",
    name: "SETTINGS.DC.name",
    hint: "SETTINGS.DC.label",
    type: Number,
    default: 2,
    onChange: value => $(".dc-control-numbers").text(value)
  });
}

Hooks.once("ready", () => {

  let HP = C2D10HeroPoints.getPoints();
  let VP = C2D10VillainPoints.getPoints();
  let DC = C2D10Difficulty.getDC();
  const hide = !game.users.current.isGM ? "hide" : "";

  // FIXME: Create a single variable with variable inputs for vp, dc and hp to save space. Use string interpolation.

  $("body").append(`<div class="c2d10-hero-points"><div class="hp-control-numbers">${HP}</div><div class="keeper-controls ${hide}"><button class="hp-control hp-plus">+</button><button class="hp-control hp-minus ">-</button></div></div>`);
  $("body").append(`<div class="c2d10-villain-points ${hide}"><div class="vp-control-numbers">${VP}</div><div class="keeper-controls"><button class="vp-control vp-plus">+</button><button class="vp-control vp-minus">-</button></div></div>`);
  $("body").append(`<div class="c2d10-difficulty ${hide}"><div class="dc-control-numbers">${DC}</div><div class="keeper-controls"><button class="dc-control dc-plus">+</button><button class="dc-control dc-minus">-</button></div></div>`);

  // Add click events for heropoints.
  $("body").on("click", ".hp-control", event => {
    const $self = $(event.currentTarget);
    if ($self.hasClass("hp-plus")) {
      C2D10HeroPoints.changePoints(true);
    } else {
      C2D10HeroPoints.changePoints(false);
    }
  });

  // Add click events for villainpoints.
  $("body").on("click", ".vp-control", event => {
    const $self = $(event.currentTarget);
    if ($self.hasClass("vp-plus")) {
      C2D10VillainPoints.changePoints(true);
    } else {
      C2D10VillainPoints.changePoints(false);
    }
  });

  // Add click events for difficulty.
  $("body").on("click", ".dc-control", event => {
    const $self = $(event.currentTarget);
    if ($self.hasClass("dc-plus")) {
      C2D10Difficulty.changeDC(true);
    } else {
      C2D10Difficulty.changeDC(false);
    }
  });
});

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
    types: ["asset", "trait", "variant"],
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

  Handlebars.registerHelper("concat", function() {
    let outStr = "";

    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

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

