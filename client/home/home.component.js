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
var HomeComponent = (function () {
    function HomeComponent() {
    }
    HomeComponent.prototype.ngOnInit = function () {
        // Get reference to login socket
        try {
            this.socket = io.connect('/home');
        }
        catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        this.socket.on('redirect', function (data) {
            sessionStorage.setItem('username', data.username);
            var href = data.type === 'Player' ? 'game.html' : 'admin.html';
            window.location.assign(href);
        });
    };
    // Switch tabs
    HomeComponent.prototype.changeTab = function (value) {
        if (this.activeTab != value) {
            this.activeTab = value;
        }
    };
    return HomeComponent;
}());
HomeComponent = __decorate([
    core_1.Component({
        selector: 'home-app',
        templateUrl: 'home/home.component.html',
        styleUrls: ['home/home.component.css'],
    })
], HomeComponent);
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map