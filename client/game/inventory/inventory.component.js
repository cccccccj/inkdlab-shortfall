"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var InventoryWindow = (function () {
    function InventoryWindow() {
        this.activeTab = 'production';
    }
    // Switch tabs
    InventoryWindow.prototype.changeTab = function (value) {
        if (this.activeTab != value) {
            this.activeTab = value;
        }
    };
    return InventoryWindow;
}());
InventoryWindow = __decorate([
    core_1.Component({
        selector: 'inventory',
        templateUrl: 'game/inventory/inventory.component.html',
        styleUrls: ['game/inventory/inventory.component.css']
    })
], InventoryWindow);
exports.InventoryWindow = InventoryWindow;
//# sourceMappingURL=inventory.component.js.map