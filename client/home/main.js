"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var home_module_1 = require("home/home.module");
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(home_module_1.HomeModule)
    .then(function (success) { return console.log("Bootstrap success"); })
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.js.map