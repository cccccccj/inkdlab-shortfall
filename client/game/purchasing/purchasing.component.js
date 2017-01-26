"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var PurchasingWindow = (function () {
    function PurchasingWindow() {
        this.activeTab = 'negotiations';
    }
    // Switch tabs
    PurchasingWindow.prototype.changeTab = function (value) {
        if (this.activeTab != value) {
            this.activeTab = value;
        }
    };
    return PurchasingWindow;
}());
PurchasingWindow = __decorate([
    core_1.Component({
        selector: 'purchasing',
        templateUrl: 'game/purchasing/purchasing.component.html',
        styleUrls: ['css/main.css']
    })
], PurchasingWindow);
exports.PurchasingWindow = PurchasingWindow;
//# sourceMappingURL=purchasing.component.js.map