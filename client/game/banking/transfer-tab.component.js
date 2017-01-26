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
var TransferTab = (function () {
    function TransferTab(ds) {
        this.ds = ds;
        this.note = '';
        this.confirming = false;
        this.confirmation = false;
    }
    TransferTab.prototype.ngOnInit = function () {
        this.stepValue = this.ds.gameData.transferStepValue;
        this.transferAmount = this.stepValue;
        this.roundTransferTo = this.ds.gameData.roundTransferTo;
        this.company = this.ds.companyData.company;
        this.balance = this.ds.companyData.balance;
        this.otherCompanies = this.ds.getCompanies();
        this.transferCompany = this.otherCompanies[0];
    };
    // Confirm money transfer
    TransferTab.prototype.onTransfer = function () {
        this.confirming = true;
    };
    // Cancel money transfer
    TransferTab.prototype.onCancel = function () {
        this.confirming = false;
    };
    // Insert new transaction in database
    TransferTab.prototype.onConfirm = function () {
        var _this = this;
        var newId = new Date().getTime() + this.company;
        var newTransaction = {
            id: newId,
            fromCompany: this.company,
            toCompany: this.transferCompany,
            amount: this.transferAmount,
            note: this.note.trim(),
            round: this.ds.gameData.currentRound,
            type: 'Transfer'
        };
        this.ds.socket.emit('transaction.insert', newTransaction);
        // ----- Check if transaction was succesful? ----////
        // --------------------------------------------//
        this.note = '';
        this.confirmation = true;
        setTimeout(function () { _this.confirmation = false; _this.confirming = false; _this.transferAmount = _this.stepValue; }, 1000);
    };
    // Round transfer amount
    TransferTab.prototype.roundAmount = function () {
        if (this.transferAmount < 0) {
            this.transferAmount = 0;
        }
        else {
            this.transferAmount = Math.round(this.transferAmount / this.roundTransferTo) * this.roundTransferTo;
        }
    };
    return TransferTab;
}());
TransferTab = __decorate([
    core_1.Component({
        selector: 'transfer-tab',
        templateUrl: 'game/banking/transfer-tab.component.html',
        styleUrls: ['css/main.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService])
], TransferTab);
exports.TransferTab = TransferTab;
//# sourceMappingURL=transfer-tab.component.js.map