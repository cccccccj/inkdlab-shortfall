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
var core_1 = require('@angular/core');
var data_service_1 = require('shared/data.service');
var BankingWindow = (function () {
    function BankingWindow(ds) {
        this.ds = ds;
        this.activeTab = 'transfer';
    }
    // Switch tabs
    BankingWindow.prototype.changeTab = function (value) {
        if (this.activeTab != value) {
            this.activeTab = value;
        }
    };
    // Update balance after new transaction
    BankingWindow.prototype.updateBalance = function (changeValue) {
        this.ds.companyData.balance += changeValue;
    };
    BankingWindow = __decorate([
        core_1.Component({
            selector: 'banking',
            templateUrl: 'game/banking/banking.component.html',
            styleUrls: ['css/main.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], BankingWindow);
    return BankingWindow;
}());
exports.BankingWindow = BankingWindow;
//# sourceMappingURL=banking.component.js.map