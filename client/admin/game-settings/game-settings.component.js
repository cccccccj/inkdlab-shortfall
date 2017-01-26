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
var GameSettingsWindow = (function () {
    function GameSettingsWindow(ds) {
        this.ds = ds;
        this.totalRoundsOptions = [4, 8, 12];
        this.initialBalanceMin = 10000;
        this.initialBalanceStep = 1000;
        this.initialBalanceRoundTo = 1000;
        this.payOnAcceptOptions = [0, 25, 50, 75, 100];
    }
    GameSettingsWindow.prototype.ngOnInit = function () {
        this.setMode = this.ds.gameData.currentRound === 0;
    };
    GameSettingsWindow.prototype.onSave = function () {
        this.setMode = false;
        var setData = {
            totalRounds: this.ds.gameData.totalRounds,
            initialBalance: this.ds.gameData.initialBalance,
            payOnAccept: this.ds.gameData.payOnAccept
        };
        this.ds.socket.emit('settings.change', setData);
    };
    // Round initial balance value
    GameSettingsWindow.prototype.roundBalance = function () {
        this.ds.gameData.initialBalance = Math.round(this.ds.gameData.initialBalance / this.initialBalanceRoundTo) * this.initialBalanceRoundTo;
    };
    return GameSettingsWindow;
}());
GameSettingsWindow = __decorate([
    core_1.Component({
        selector: 'game-settings',
        templateUrl: 'admin/game-settings/game-settings.component.html',
        styleUrls: ['admin/game-settings/game-settings.component.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService])
], GameSettingsWindow);
exports.GameSettingsWindow = GameSettingsWindow;
//# sourceMappingURL=game-settings.component.js.map