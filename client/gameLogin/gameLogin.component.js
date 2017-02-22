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
var gameLoginComponent = (function () {
    function gameLoginComponent() {
        this.gameName = '';
        this.password1 = '';
        this.password2 = '';
        this.passwordError = false;
    }
    gameLoginComponent.prototype.ngOnInit = function () {
        var _this = this;
        try {
            this.socket = io.connect('http://localhost:8080/gameLogin');
        }
        catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        this.socket.on('gameLogin.error', function (error) {
            if (error === 'gameName') {
                _this.gameName = '';
                _this.gameNameError = true;
                setTimeout(function () { _this.gameNameError = false; }, 2000);
            }
            if (error === 'password') {
                _this.password1 = '';
                _this.passwordError = true;
                setTimeout(function () { _this.passwordError = false; }, 2000);
            }
        });
        this.socket.on('redirect', function (data) {
            var href = 'game.html';
            window.location.assign(href);
        });
    };
    gameLoginComponent.prototype.gameLogin = function () {
        var gameLoginData = {
            gameName: this.gameName,
            password: this.password1,
        };
        this.socket.emit('gamesData.gameLogin', gameLoginData);
    };
    return gameLoginComponent;
}());
gameLoginComponent = __decorate([
    core_1.Component({
        selector: 'gameLogin-app',
        templateUrl: 'gameLogin/gameLogin.component.html',
        styleUrls: ['css/main.css'],
    })
], gameLoginComponent);
exports.gameLoginComponent = gameLoginComponent;
//# sourceMappingURL=gameLogin.component.js.map