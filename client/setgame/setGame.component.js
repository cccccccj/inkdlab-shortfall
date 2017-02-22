"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
//import * as io from 'shared/libraries/socket.io.js';
var io = require('shared/libraries/socket.io.js');
var SetGameComponent = (function () {
    function SetGameComponent() {
        this.gameName = '';
        this.password1 = '';
        this.gameType = 'Existing';
        this.passwordError = false;
        this.gameNameError = false;
    }
    SetGameComponent.prototype.ngOnInit = function () {
        var _this = this;
        try {
            this.socket = io.connect('http://localhost:8080/setGame');
        }
        catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        this.socket.on('setGame.error', function (error) {
            if (error === 'gameName') {
                _this.gameName = '';
                _this.gameNameError = true;
                setTimeout(function () { _this.passwordError = false; }, 2000);
            }
            if (error === 'password') {
                _this.password1 = '';
                _this.passwordError = true;
                setTimeout(function () { _this.passwordError = false; }, 2000);
            }
        });
        this.socket.on('redirect', function (data) {
            var href = 'admin.html';
            window.location.assign(href);
        });
    };
    SetGameComponent.prototype.setGame = function () {
        var setGameData = {
            gameName: this.gameName,
            password: this.password1,
            gameType: this.gameType
        };
        this.socket.emit('gamesData.setGame', setGameData);
    };
    return SetGameComponent;
}());
SetGameComponent = __decorate([
    core_1.Component({
        selector: 'setGame-app',
        templateUrl: 'setGame/setGame.component.html',
        styleUrls: ['../css/main.css'],
    })
], SetGameComponent);
exports.SetGameComponent = SetGameComponent;
//# sourceMappingURL=setGame.component.js.map