"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var gameLogin_module_1 = require("gameLogin/gameLogin.module");
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(gameLogin_module_1.gameLoginModule)
    .then(function (success) { return console.log("Bootstrap success"); })
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.js.map