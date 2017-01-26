"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var data_service_1 = require("shared/data.service");
var game_service_1 = require("game/game.service");
var ProductionTab = (function () {
    function ProductionTab(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.selectedIndex = {};
        this.production = {};
    }
    ProductionTab.prototype.ngOnInit = function () {
        var _this = this;
        this.parts = this.gs.getComponentParts();
        this.system = this.ds.companyData.part;
        this.inventory = this.ds.companyData.inventory;
        this.setDefaultProduction();
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        this.ds.socket.on('inventory.updated', function (data) {
            _this.ds.companyData.inventory[data.part] = data.newInventory;
        });
    };
    ProductionTab.prototype.setDefaultProduction = function () {
        this.production.mechQuality = '-';
        this.production.greenScore = '-';
        this.production.maxQuantity = 0;
        this.production.quantity = 0;
        this.production.cost = 0;
        this.production.waste = 0;
    };
    ProductionTab.prototype.selectRecord = function (part, index) {
        this.selectedIndex[part] = index;
        if (Object.keys(this.selectedIndex).length == this.parts.length) {
            this.calculateProduction();
        }
    };
    ProductionTab.prototype.calculateProduction = function () {
        var mechQualities = [];
        var greenScores = [];
        var quantities = [];
        for (var _i = 0, _a = this.parts; _i < _a.length; _i++) {
            var part = _a[_i];
            var record = this.inventory[part][this.selectedIndex[part]];
            mechQualities.push(record.mechQuality);
            greenScores.push(record.greenScore);
            quantities.push(record.quantity);
        }
        // ***** CHANGE PRODUCTION FORMULAE!!! ****
        this.production.mechQuality = mechQualities[Math.floor(Math.random() * mechQualities.length)];
        var greenAverage = greenScores.reduce(function (a, b) { return b += a; }) / greenScores.length;
        this.production.greenScore = Math.round(greenAverage / 10) * 10;
        this.production.maxQuantity = Math.min.apply(Math, quantities);
        this.production.quantity = this.production.maxQuantity;
        this.production.cost = Math.floor(Math.random() * 100);
        this.production.waste = Math.floor(Math.random() * 10) * this.production.quantity;
        // ***************************************
    };
    ProductionTab.prototype.onBuild = function () {
        var production = this.production;
        for (var _i = 0, _a = this.parts; _i < _a.length; _i++) {
            var part = _a[_i];
            this.gs.updatePartInventory(part, this.selectedIndex[part], -production.quantity);
        }
        this.gs.updateInventory(this.system, production.mechQuality, production.greenScore, +production.quantity);
        // ***** UPDATE BALANCE, LEDGER & WASTE ****
        var newId = new Date().getTime() + this.ds.companyData.company;
        var newNote = production.quantity + ' ' + this.system + ' units of Quality ' + production.mechQuality + ' & Green Score ' + production.greenScore + '% at $' + production.cost + '/unit';
        var newTransaction = {
            id: newId,
            fromCompany: this.ds.companyData.company,
            //            toCompany: purchase.saleCompany,
            amount: production.quantity * production.cost,
            note: newNote,
            round: this.ds.gameData.currentRound,
            type: 'Production'
        };
        // Insert new transaction in database
        this.ds.socket.emit('transaction.insert', newTransaction);
        this.setDefaultProduction();
        this.selectedIndex = {};
    };
    ProductionTab.prototype.roundQuantity = function () {
        this.production.quantity = Math.round(this.production.quantity / this.roundQuantityTo) * this.roundQuantityTo;
    };
    return ProductionTab;
}());
ProductionTab = __decorate([
    core_1.Component({
        selector: 'production-tab',
        templateUrl: 'game/inventory/production-tab.component.html',
        styleUrls: ['game/inventory/production-tab.component.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, game_service_1.GameService])
], ProductionTab);
exports.ProductionTab = ProductionTab;
//# sourceMappingURL=production-tab.component.js.map