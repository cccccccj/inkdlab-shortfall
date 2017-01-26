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
//import * as io from 'shared/libraries/socket.io.js';
//import * as $ from 'shared/libraries/jquery-2.1.1.min.js';
var io = require('shared/libraries/socket.io.js');
var $ = require('shared/libraries/jquery-2.1.1.min.js');
require("shared/libraries/jqueryUI/jquery-ui.min.js");
require("shared/libraries/simone/simone.min.js");
require("shared/libraries/simone/i18n/simone.min.custom.js");
var data_service_1 = require("shared/data.service");
var game_service_1 = require("game/game.service");
var GameComponent = (function () {
    function GameComponent(ds, gs) {
        var _this = this;
        this.ds = ds;
        this.gs = gs;
        this.setProfile = false;
        this.initialized = false;
        this.chatCompany = 'Public';
        this.windowReset = false;
        this.roundChange = false;
        this.roundTimer = false;
        // Detect chat button click from any window & go to appropriate chat tab
        ds.chatClicked$.subscribe(function (company) {
            _this.chatCompany = company;
            if ($('#chatWindow').window('minimized') == true) {
                $('#chatWindow').window('restore');
            }
            else {
                $('#chatWindow').window('moveToTop');
            }
        });
    }
    GameComponent.prototype.ngOnInit = function () {
        var _this = this;
        // Get reference to game socket
        try {
            this.ds.socket = io.connect('/game');
        }
        catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        // Information Bar
        $('#infoBar').taskbar({
            horizontalStick: 'top left',
            minimizeAll: false
        });
        // Taskbar buttons
        $('#buttons').taskbar({
            toggleFullscreen: true,
            systemButtonsOrder: ['minimizeAll', 'toggleFullscreen']
        });
        // Current Event window
        $('#eventWindow').window({
            taskbar: '#buttons',
            title: 'Current Event',
            closable: false,
            width: 450,
            height: 300,
            modal: true,
            position: {
                my: 'left bottom',
                at: 'left bottom'
            }
        });
        // Company Directory window
        $('#directoryWindow').window({
            taskbar: '#infoBar',
            title: 'Company Directory',
            closable: false,
            width: 680,
            height: 650,
            minimizable: false,
            position: {
                my: 'center center',
                at: 'center center-15%'
            }
        });
        // Banking window
        $('#bankingWindow').window({
            taskbar: '#buttons',
            title: 'Banking',
            closable: false,
            width: 470,
            minWidth: 200,
            height: 250,
            position: {
                my: 'left top',
                at: 'left top'
            }
        });
        // Purchasing window
        $('#purchaseWindow').window({
            taskbar: '#buttons',
            title: 'Purchasing',
            closable: false,
            width: 1080,
            minWidth: 500,
            height: 300,
            position: {
                my: 'left center',
                at: 'left center-15%'
            }
        });
        // Sales window
        $('#salesWindow').window({
            taskbar: '#buttons',
            title: 'Sales',
            closable: false,
            width: 940,
            minWidth: 500,
            height: 300,
            position: {
                my: 'left bottom',
                at: 'left bottom'
            }
        });
        // Inventory window
        $('#inventoryWindow').window({
            taskbar: '#buttons',
            title: 'Inventory',
            closable: false,
            width: 940,
            minWidth: 500,
            height: 500,
            position: {
                my: 'right top',
                at: 'right top'
            }
        });
        // Chat window
        $('#chatWindow').window({
            taskbar: '#buttons',
            title: 'Chat',
            closable: false,
            height: 600,
            width: 450,
            position: {
                my: 'right bottom',
                at: 'right bottom'
            }
        });
        // Get game and company data from database
        var username = sessionStorage.getItem('username');
        this.ds.socket.emit('game.start', username);
        this.ds.socket.on('gameData.found', function (data) {
            _this.ds.gameData = data.gameData;
            _this.ds.eventsData = data.eventsData;
            _this.ds.companies = data.companiesData;
            _this.ds.userData = data.userData;
            _this.ds.companyData = data.companyData;
            // Force player to set company profile at start of game
            if (data.companyData.company === '') {
                _this.setProfile = true;
                $('#directoryWindow').window({ modal: true });
            }
            else {
                _this.initialized = true;
                $('#directoryWindow').window({ minimizable: true });
                if (!_this.gs.allEventsResolved('immediate')) {
                    $('#eventWindow').window({
                        minimizable: false
                    });
                    $('#eventWindow').window('restore');
                }
            }
        });
        this.ds.socket.on('round.timer', function (minutes) {
            _this.roundTimer = true;
            _this.timerMin = minutes;
            _this.timerSec = 0;
            _this.timer = setInterval(function () {
                if (_this.timerMin === 0 && _this.timerSec === 0) {
                    clearInterval(_this.timer);
                    _this.roundTimer = false;
                }
                else if (_this.timerSec === 0) {
                    _this.timerSec = 59;
                    _this.timerMin--;
                }
                else {
                    _this.timerSec--;
                }
            }, 1000);
        });
        this.ds.socket.on('round.changed', function () {
            _this.roundChange = true;
            if (_this.gs.allEventsResolved('endOfRound')) {
                _this.nextRound();
            }
            else {
                $('#eventWindow').window({ minimizable: false });
                $('#eventWindow').window('restore');
            }
        });
    };
    // Start game once player sets company profile
    GameComponent.prototype.startGame = function () {
        var _this = this;
        this.initialized = true;
        $('#directoryWindow').window({ minimizable: true });
        $('#directoryWindow').window('minimize');
        setTimeout(function () {
            if (!_this.gs.allEventsResolved('immediate')) {
                $('#eventWindow').window({
                    minimizable: false,
                    modal: true
                });
            }
            else {
                $('#eventWindow').window({
                    modal: true
                });
            }
            $('#eventWindow').window('restore');
        }, 1500);
    };
    // Change to next round
    GameComponent.prototype.nextRound = function () {
        var _this = this;
        this.windowReset = true;
        this.ds.gameData.currentRound++;
        setTimeout(function () {
            _this.windowReset = false;
        }, 500);
    };
    // Make events window minimizable after events are resolved
    GameComponent.prototype.minimizableEvents = function () {
        $('#eventWindow').window({ minimizable: true });
        if (this.roundChange) {
            this.nextRound();
        }
    };
    return GameComponent;
}());
GameComponent = __decorate([
    core_1.Component({
        selector: 'shortfall-app',
        templateUrl: 'game/game.component.html',
        styleUrls: ['game/game.component.css'],
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, game_service_1.GameService])
], GameComponent);
exports.GameComponent = GameComponent;
//# sourceMappingURL=game.component.js.map