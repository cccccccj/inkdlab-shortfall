"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var setGame_module_1 = require("setGame/setGame.module");
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(setGame_module_1.SetGameModule)
    .then(function (success) { return console.log("Bootstrap success"); })
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.js.map