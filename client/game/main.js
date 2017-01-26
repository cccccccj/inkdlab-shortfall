"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var game_module_1 = require("game/game.module");
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(game_module_1.GameModule)
    .then(function (success) { return console.log("Bootstrap success"); })
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.js.map