import { c2d10 } from "./module/config.js";
import { RegularDie} from "./module/dice/C2D10RegularDie.js";
import { CrisisDie } from "./module/dice/C2D10CrisisDie.js";
import C2D10Item from "./module/C2D10Item.js";
import C2D10ItemSheet from "./module/sheets/C2D10ItemSheet.js";
import C2D10Actor from "./module/C2D10Actor.js";
import C2D10MainSheet from "./module/sheets/C2D10MainSheet.js";
import C2D10NPCSheet from "./module/sheets/C2D10NPCSheet.js";
import * as C2D10Utility from "./module/C2D10Utility.js";

/**
 * Loads HandleBars templates for use in the system.
 */
async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-info.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-bio.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-talents.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-skills.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-assets-tab.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-traits-tab.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-powers-tab.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-focus-tab.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/npc/npc-info.hbs",
    "systems/c2d10/templates/partials/sheet-tabs/npc/npc-skills.hbs",
    "systems/c2d10/templates/partials/list-items/asset-list-item.hbs",
    "systems/c2d10/templates/partials/list-items/trait-list-item.hbs",
    "systems/c2d10/templates/partials/list-items/variant-list-item.hbs",
    "systems/c2d10/templates/dialogs/add-focus-dialog.hbs",
    "systems/c2d10/templates/dialogs/roll-test-dialog.hbs"
  ];

  return loadTemplates(templatePaths);
}

/**
 * Register all system settings necessary.
 */
function registerSystemSettings() {
  // Whether or not to show fancy CSS effects in the system. Disabled by default for accessibility reasons.
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

  /**
   * Allow players to buy additional dice.
   */
  game.settings.register("c2d10", "bonusDice", {
    config: false,
    scope: "world",
    name: "SETTINGS.bonusDice.name",
    hint: "SETTINGS.bonusDice.label",
    type: Number,
    default: 0,
    onChange: value => $(".bonus-control-numbers").text(value)
  });
}

Hooks.once("ready", () => {
  /**
   * Add the necessary Keeper controls to the view, hide everything but Hero points for players.
   */
  const HP = C2D10Utility.getHeroPoints();
  const VP = C2D10Utility.getVillainPoints();
  const DC = C2D10Utility.getDC();
  const bonusDice = C2D10Utility.getDice();
  const hide = !game.users.current.isGM ? "hide" : "";

  $("body").append(`
  <div class="keeper-control-box">
    <div class="c2d10-villain-points">
      <div class="vp-control-numbers">
          ${VP}
      </div>
      <div class="keeper-controls ${hide}">
          <button class="vp-control vp-plus">+</button>
          <button class="vp-control vp-minus">-</button>
      </div>
    </div>
    <div class="c2d10-difficulty">
        <div class="dc-control-numbers">
            ${DC}
        </div>
        <div class="keeper-controls ${hide}">
            <button class="dc-control dc-plus">+</button>
            <button class="dc-control dc-minus">-</button>
        </div>
    </div>
    <div class="c2d10-bonus-dice">
        <div class="bonus-control-numbers">
            ${bonusDice}
        </div>
        <div class="keeper-controls ${hide}">
            <button class="bonus-control bonus-plus">+</button>
            <button class="bonus-control bonus-minus">-</button>
        </div>
    </div>
    <div class="c2d10-hero-points">
        <div class="hp-control-numbers">
            ${HP}
        </div>
        <div class="keeper-controls ${hide}">
            <button class="hp-control hp-plus">+</button>
            <button class="hp-control hp-minus ">-</button>
        </div>
    </div>
  </div>
  `);
  // Add click events for heropoints.
  $("body").on("click", ".hp-control", event => {
    const $self = $(event.currentTarget);
    const isIncrease = $self.hasClass("hp-plus");
    C2D10Utility.changeHeroPoints(isIncrease);
  });

  // Add click events for villainpoints.
  $("body").on("click", ".vp-control", event => {
    const $self = $(event.currentTarget);
    const isIncrease = $self.hasClass("vp-plus");
    C2D10Utility.changeVillainPoints(isIncrease);
  });

  // Add click events for difficulty.
  $("body").on("click", ".dc-control", event => {
    const $self = $(event.currentTarget);
    const isIncrease = $self.hasClass("dc-plus");
    C2D10Utility.changeDC(isIncrease);
  });

  // Add click events for difficulty.
  $("body").on("click", ".bonus-control", event => {
    const $self = $(event.currentTarget);
    const isIncrease = $self.hasClass("bonus-plus");
    const isPlayer = !game.users.current.isGM;
    C2D10Utility.buyDice(isIncrease, isPlayer);
  });
});

// Change the GM's tag to "Keeper".
Hooks.on("renderPlayerList", html => {
  const players = html.element.find(".player-name");

  for (let player of players) {
    const playerCharacterName = player.innerText;
    const playerName = playerCharacterName.substring(0, playerCharacterName.indexOf("[")).trim();
    const userId = game.users.find(x => x.name === playerName)?.id;
    const user = game.users.get(userId);
    if (user.isGM) {
      player.innerText = `${playerName} [Keeper]`;
    }
  }
});

Hooks.on("renderPause", (_app, html, options) => {
  html.find('img[src="icons/svg/clockwork.svg"]').attr("src", "systems/c2d10/assets/cd10-logo-circle.webp");
});

Hooks.once("init", function() {
  console.log("==== C2D10 | Initialising CD10 RPG System 2nd Edition ====");

  CONFIG.Dice.terms.r = RegularDie;
  CONFIG.Dice.terms.s = CrisisDie;

  /* Setup Config */
  CONFIG.c2d10 = c2d10;
  CONFIG.Item.documentClass = C2D10Item;
  CONFIG.Actor.documentClass = C2D10Actor;

  /* Register Sheets */
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("c2d10", C2D10ItemSheet, {
    makeDefault: true,
    types: ["armor", "asset", "power", "trait", "variant", "weapon"],
    label: "C2D10 Item Sheet"
  });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("c2d10", C2D10MainSheet, {
    types: ["actor"],
    makeDefault: true,
    label: "C2D10 Character Sheet"
  });

  Actors.registerSheet("c2d10", C2D10NPCSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "C2D10 NPC Sheet"
  });

  /* Load Handlebars helpers and partials */
  preloadHandlebarsTemplates();

  /* Register all system settings for C2D10 */
  registerSystemSettings();

  /**
   * Concat handlebars helper for building localization strings from variables
   */
  // FIXME: Retire this helper and recode for using Foundry's built in concat helper.
  Handlebars.registerHelper("concat", function() {
    let outStr = "";

    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  /**
   * Handlebars helper for rendering resource dots
   */
  Handlebars.registerHelper("dots", function(value, max, content) {
    const full =
    `<div class="dot-container full">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-white-full.webp"/>
    </div>`;
    const empty =
    `<div class="dot-container empty">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-white-empty.webp"/>
    </div>`;

    let res = "";
    if (value > 0) {
      for (let i = 0; i < value; ++i) {
        if (i === 5) {
          res += space;
        }
        res += full;
      }
    }

    for (let i = value; i < max; ++i) {
      if (i === 5) {
        res += space;
      }
      res += empty;
    }
    return res;
  });

  Handlebars.registerHelper("healthdots", function(superficial, critical, max, context, content) {
    const critdie =
    `<div class="dot-container full">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-red.webp"/>
    </div>`;
    const full =
    `<div class="dot-container full">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-yellow.webp"/>
    </div>`;
    const empty =
    `<div class="dot-container empty">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-white-empty.webp"/>
    </div>`;

    const space =
    `<div class="space">
      <img class="d10-dot-full" src="/systems/c2d10/assets/d10-white-full.webp"/>
    </div>`;

    let result = "";
    let res = [];
    const maximum = parseInt(critical + superficial);

    if (critical > 0) {
      for (let i = 0; i < critical; ++i) {
        res.push(critdie);
      }
    }

    if (superficial > 0) {
      for (let i = 0; i < superficial; ++i) {
        res.push(full);
      }
    }

    for (let i = maximum; i < max; ++i) {
      res.push(empty);
    }

    for (let i = 0; i < res.length; i++) {
      const element = res[i];

      if (i === 5) {
        result += space;
        result += element;
      } else {
        result += element;
      }
    }
    return result;
  });
});

// Add DiceSoNice presets
Hooks.once("diceSoNiceReady", dice3d => {
  dice3d.addSystem({ id: "c2d10", name: "Celenia 2" }, true);

  dice3d.addColorset({
    name: "main",
    description: "C2D10 Regular Dice",
    category: "C2D10",
    foreground: "#fff",
    background: "#3d0030",
    texture: "none",
    edge: "#8a006c",
    material: "plastic",
    font: "Arial Black",
    fontScale: {
      d6: 1.1,
      df: 2.5
    }
  }, "default");

  dice3d.addColorset({
    name: "crisis",
    description: "C2D10 Crisis Dice",
    category: "C2D10",
    foreground: "#000",
    background: "#860000",
    texture: "none",
    edge: "#bd0000",
    material: "plastic",
    font: "Arial Black",
    fontScale: {
      d6: 1.1,
      df: 2.5
    }
  }, "default");

  dice3d.addDicePreset({
    type: "dr",
    labels: [
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-hit.webp",
      "systems/c2d10/assets/roll-hit.webp",
      "systems/c2d10/assets/roll-crit.webp",
      "systems/c2d10/assets/roll-fumble.webp"
    ],
    valueMap: {
      0:1,
      1:2,
      2:3,
      3:4,
      4:5,
      5:6,
      6:7,
      7:8,
      8:9,
      9:10
    },
    colorset: "main",
    fontScale: 0.5,
    system: "c2d10"
  }, "d10");

  dice3d.addDicePreset({
    type: "ds",
    labels: [
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/roll-miss.webp",
      "systems/c2d10/assets/crisis-hit.webp",
      "systems/c2d10/assets/crisis-hit.webp",
      "systems/c2d10/assets/crisis-crit.webp",
      "systems/c2d10/assets/crisis-fumble.webp"
    ],
    valueMap: {
      0:1,
      1:2,
      2:3,
      3:4,
      4:5,
      5:6,
      6:7,
      7:8,
      8:9,
      9:10
    },
    colorset: "crisis",
    fontScale: 0.5,
    system: "c2d10"
  }, "d10");
});
