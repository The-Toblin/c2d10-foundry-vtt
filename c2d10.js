"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_js_1 = require("./module/config.js");
var C2D10RegularDie_js_1 = require("./module/dice/C2D10RegularDie.js");
var C2D10CrisisDie_js_1 = require("./module/dice/C2D10CrisisDie.js");
var C2D10FatedDie_js_1 = require("./module/dice/C2D10FatedDie.js");
var Chat = require("./module/chat.js");
var C2D10Item_js_1 = require("./module/C2D10Item.js");
var C2D10ItemSheet_js_1 = require("./module/sheets/C2D10ItemSheet.js");
var C2D10Actor_js_1 = require("./module/C2D10Actor.js");
var C2D10ActorSheet_js_1 = require("./module/sheets/C2D10ActorSheet.js");
var C2D10NPCSheet_js_1 = require("./module/sheets/C2D10NPCSheet.js");
var C2D10Utility = require("./module/C2D10Utility.js");
/** Migration scripts */
var C2D10Migrate_js_1 = require("./module/migration/C2D10Migrate.js");
/**
 * Loads HandleBars templates for use in the system.
 */
function preloadHandlebarsTemplates() {
    return __awaiter(this, void 0, void 0, function () {
        var templatePaths;
        return __generator(this, function (_a) {
            templatePaths = [
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-bio.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-consequences.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-talents.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-skills.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-assets-tab.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-cybernetics-tab.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-traits-tab.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-powers-tab.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/mainactor/actor-focus-tab.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/npc/npc-info.hbs",
                "systems/c2d10/templates/partials/sheet-tabs/npc/npc-skills.hbs",
                "systems/c2d10/templates/partials/list-items/asset-list-item.hbs",
                "systems/c2d10/templates/partials/list-items/cybernetics-list-item.hbs",
                "systems/c2d10/templates/partials/list-items/equipment-list-item.hbs",
                "systems/c2d10/templates/partials/list-items/variant-list-item.hbs",
                "systems/c2d10/templates/cards/weapon-card.hbs",
                "systems/c2d10/templates/cards/variant-card.hbs",
                "systems/c2d10/templates/dialogs/add-focus-dialog.hbs",
                "systems/c2d10/templates/dialogs/roll-test-dialog.hbs"
            ];
            return [2 /*return*/, loadTemplates(templatePaths)];
        });
    });
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
        onChange: function (value) { return $(".hp-control-numbers").text(value); }
    });
    game.settings.register("c2d10", "villainPoints", {
        config: false,
        scope: "world",
        name: "SETTINGS.villainPoints.name",
        hint: "SETTINGS.villainPoints.label",
        type: Number,
        default: 0,
        onChange: function (value) { return $(".vp-control-numbers").text(value); }
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
        onChange: function (value) { return $(".dc-control-numbers").text(value); }
    });
    /**
     * Add setting for tracking global campaign Crisis.
     */
    game.settings.register("c2d10", "campaignCrisis", {
        config: false,
        scope: "world",
        name: "SETTINGS.crisis.name",
        hint: "SETTINGS.crisis.label",
        type: Number,
        default: 0,
        onChange: function (value) { return $(".crisis-control-numbers").text(value); }
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
        onChange: function (value) { return $(".bonus-control-numbers").text(value); }
    });
    /* Store version number for migration purposes. */
    game.settings.register("c2d10", "systemMigrationVersion", {
        config: false,
        scope: "world",
        type: String,
        default: ""
    });
}
Hooks.once("ready", function () {
    /**
     * Add the necessary Keeper controls to the view, hide the buttons for players.
     */
    var HP = C2D10Utility.getHeroPoints();
    var VP = C2D10Utility.getVillainPoints();
    var crisis = C2D10Utility.getCrisis();
    var bonusDice = C2D10Utility.getDice();
    var hide = !game.users.current.isGM ? "hide" : "";
    $("body").append("\n  <div class=\"keeper-control-box\">\n    <div class=\"c2d10-villain-points\">\n      <div class=\"vp-control-numbers\">\n          ".concat(VP, "\n      </div>\n      <div class=\"keeper-controls ").concat(hide, "\">\n          <button class=\"vp-control vp-plus\">+</button>\n          <button class=\"vp-control vp-minus\">-</button>\n      </div>\n    </div>\n    <div class=\"c2d10-crisis\">\n        <div class=\"crisis-control-numbers\">\n            ").concat(crisis, "\n        </div>\n        <div class=\"keeper-controls ").concat(hide, "\">\n            <button class=\"crisis-control crisis-plus\">+</button>\n            <button class=\"crisis-control crisis-minus\">-</button>\n        </div>\n    </div>\n    <div class=\"c2d10-bonus-dice\">\n        <div class=\"bonus-control-numbers\">\n            ").concat(bonusDice, "\n        </div>\n        <div class=\"keeper-controls ").concat(hide, "\">\n            <button class=\"bonus-control bonus-plus\">+</button>\n            <button class=\"bonus-control bonus-minus\">-</button>\n        </div>\n    </div>\n    <div class=\"c2d10-hero-points\">\n        <div class=\"hp-control-numbers\">\n            ").concat(HP, "\n        </div>\n        <div class=\"keeper-controls ").concat(hide, "\">\n            <button class=\"hp-control hp-plus\">+</button>\n            <button class=\"hp-control hp-minus \">-</button>\n        </div>\n    </div>\n  </div>\n  "));
    // Add click events for heropoints.
    $("body").on("click", ".hp-control", function (event) {
        var $self = $(event.currentTarget);
        var isIncrease = $self.hasClass("hp-plus");
        C2D10Utility.changeHeroPoints(isIncrease);
    });
    // Add click events for villainpoints.
    $("body").on("click", ".vp-control", function (event) {
        var $self = $(event.currentTarget);
        var isIncrease = $self.hasClass("vp-plus");
        C2D10Utility.changeVillainPoints(isIncrease);
    });
    // Add click events for difficulty.
    $("body").on("click", ".dc-control", function (event) {
        var $self = $(event.currentTarget);
        var isIncrease = $self.hasClass("dc-plus");
        C2D10Utility.changeDC(isIncrease);
    });
    // Add click events for campaign crisis.
    $("body").on("click", ".crisis-control", function (event) {
        var $self = $(event.currentTarget);
        var isIncrease = $self.hasClass("crisis-plus");
        C2D10Utility.changeCrisis(isIncrease);
    });
    // Add click events for bonus dice.
    $("body").on("click", ".bonus-control", function (event) {
        var $self = $(event.currentTarget);
        var isIncrease = $self.hasClass("bonus-plus");
        var isPlayer = !game.users.current.isGM;
        C2D10Utility.buyDice(isIncrease, isPlayer);
    });
});
// Change the GM's tag to "Keeper".
Hooks.on("renderPlayerList", function (html) {
    var _a;
    var players = html.element.find(".player-name");
    var _loop_1 = function (player) {
        var playerCharacterName = player.innerText;
        var playerName = playerCharacterName.substring(0, playerCharacterName.indexOf("[")).trim();
        var userId = (_a = game.users.find(function (x) { return x.name === playerName; })) === null || _a === void 0 ? void 0 : _a.id;
        var user = game.users.get(userId);
        if (user.isGM) {
            player.innerText = "".concat(playerName, " [Keeper]");
        }
    };
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var player = players_1[_i];
        _loop_1(player);
    }
});
// Modify the pause icon
Hooks.on("renderPause", function (_app, html, options) {
    html.find('img[src="icons/svg/clockwork.svg"]').attr("src", "systems/c2d10/assets/cd10-logo-circle.webp");
});
// Add listeners for chat message buttons
Hooks.on("renderChatLog", function (app, html, data) { return Chat.addChatListeners(html); });
Hooks.on("renderChatMessage", function (app, html, data) { return Chat.hideChatActionButtons(app, html, data); });
// Initialize system specific functions, such as classes, sheets and set up DiceSoNice presets
Hooks.once("init", function () {
    console.log("==== C2D10 | Initialising CD10 RPG System 2nd Edition ====");
    CONFIG.Dice.terms.r = C2D10RegularDie_js_1.RegularDie;
    CONFIG.Dice.terms.s = C2D10CrisisDie_js_1.CrisisDie;
    CONFIG.Dice.terms.a = C2D10FatedDie_js_1.FatedDie;
    /* Setup Config */
    CONFIG.c2d10 = config_js_1.c2d10;
    CONFIG.Item.documentClass = C2D10Item_js_1.default;
    CONFIG.Actor.documentClass = C2D10Actor_js_1.default;
    /* Register Sheets */
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("c2d10", C2D10ItemSheet_js_1.default, {
        makeDefault: true,
        types: ["armor", "asset", "cybernetics", "power", "trait", "variant", "weapon"],
        label: "C2D10 Item Sheet"
    });
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("c2d10", C2D10ActorSheet_js_1.default, {
        types: ["actor"],
        makeDefault: true,
        label: "C2D10 Character Sheet"
    });
    Actors.registerSheet("c2d10", C2D10NPCSheet_js_1.default, {
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
    Handlebars.registerHelper("concat", function () {
        var outStr = "";
        for (var arg in arguments) {
            if (typeof arguments[arg] != "object") {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });
    /**
     * Handlebars helper for rendering resource dots
     */
    Handlebars.registerHelper("dots", function (value, max, content) {
        var fulldie = value > 5 ? "d10-yellow.webp" : "d10-white-full.webp";
        var full = "<div class=\"dot-container full\">\n      <img class=\"d10-dot-full\" src=\"/systems/c2d10/assets/".concat(fulldie, "\"/>\n    </div>");
        var empty = "<div class=\"dot-container empty\">\n      <img class=\"d10-dot-full\" src=\"/systems/c2d10/assets/d10-white-empty.webp\"/>\n    </div>";
        var space = "<div class=\"space\">\n      <img class=\"d10-dot-full\" src=\"/systems/c2d10/assets/d10-white-full.webp\"/>\n    </div>";
        var res = "";
        value = value > 5 ? 5 : value; // Prevent rendering of excess points, even though it *can* happen due to traits and such.
        if (value > 0) {
            for (var i = 0; i < value; ++i) {
                if (i === 5) {
                    res += space;
                }
                res += full;
            }
        }
        for (var i = value; i < max; ++i) {
            if (i === 5) {
                res += space;
            }
            res += empty;
        }
        return res;
    });
});
// Add DiceSoNice presets
Hooks.once("diceSoNiceReady", function (dice3d) {
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
    dice3d.addColorset({
        name: "fated",
        description: "C2D10 Fated Dice",
        category: "C2D10",
        foreground: "#fff",
        background: "#000",
        texture: "none",
        edge: "#d9ff00",
        material: "glass",
        font: "Arial Black",
        fontScale: {
            d6: 1.1,
            da: 2.5
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
        colorset: "crisis",
        fontScale: 0.5,
        system: "c2d10"
    }, "d10");
    dice3d.addDicePreset({
        type: "da",
        labels: [
            "systems/c2d10/assets/roll-fumble.webp",
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
        colorset: "fated",
        fontScale: 0.5,
        system: "c2d10"
    }, "d10");
});
// If the logged in player is a Keeper, handle system migration.
Hooks.once("ready", function () { return __awaiter(void 0, void 0, void 0, function () {
    var currentVersion, NEEDS_MIGRATION_VERSION, needsMigration, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!game.user.isGM) {
                    return [2 /*return*/];
                }
                console.log("==== C2D10 | Checking versions ====");
                currentVersion = game.settings.get("c2d10", "systemMigrationVersion");
                NEEDS_MIGRATION_VERSION = "0.612";
                needsMigration = !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
                if (!needsMigration) return [3 /*break*/, 5];
                console.log("==== C2D10 | System out of date! Migration needed! ====");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, C2D10Migrate_js_1.migrate)(currentVersion)];
            case 2:
                _a.sent();
                console.log("==== C2D10 | All migrations finished successfully. Updating settings version to", game.system.version, "from", currentVersion, "====");
                game.settings.set("c2d10", "systemMigrationVersion", game.system.version);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.error("MIGRATION FAILED!", err_1);
                return [3 /*break*/, 4];
            case 4: return [3 /*break*/, 6];
            case 5:
                console.log("==== C2D10 | System up to date! Migration not needed. ====");
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); });
