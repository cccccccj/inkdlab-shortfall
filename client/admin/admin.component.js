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
//import * as io from 'shared/libraries/socket.io.js';
//import * as $ from 'shared/libraries/jquery-2.1.1.min.js';
var io = require('shared/libraries/socket.io.js');
var $ = require('shared/libraries/jquery-2.1.1.min.js');
require('shared/libraries/jqueryUI/jquery-ui.min.js');
require('shared/libraries/simone/simone.min.js');
require('shared/libraries/simone/i18n/simone.min.custom.js');
var data_service_1 = require('shared/data.service');
var AdminComponent = (function () {
    function AdminComponent(ds) {
        this.ds = ds;
        this.initialized = false;
        this.chatCompany = 'Public';
    }
    AdminComponent.prototype.ngOnInit = function () {
        var _this = this;
        // Get reference to game socket
        try {
            this.ds.socket = io.connect('/admin');
        }
        catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        // Taskbar buttons
        $('#buttons').taskbar({
            toggleFullscreen: true,
            systemButtonsOrder: ['minimizeAll', 'toggleFullscreen']
        });
        // Round Manager window 
        $('#roundWindow').window({
            title: 'Round Manager',
            closable: false,
            height: 300,
            width: 500,
            position: {
                my: 'left top',
                at: 'left top'
            }
        });
        // Event Manager window 
        $('#eventWindow').window({
            title: 'Event Manager',
            closable: false,
            height: 400,
            width: 500,
            position: {
                my: 'left bottom',
                at: 'left bottom'
            }
        });
        // Game Settings window 
        $('#settingsWindow').window({
            title: 'Game Settings',
            closable: false,
            height: 300,
            width: 300,
            position: {
                my: 'right top',
                at: 'right top'
            }
        });
        // Chat window
        $('#chatWindow').window({
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
        this.ds.socket.emit('admin.start', username);
        this.ds.socket.on('adminData.found', function (data) {
            _this.ds.gameData = data.gameData;
            _this.ds.userData = data.userData;
            _this.ds.eventsData = data.eventsData;
            _this.ds.companies = data.companiesData;
            _this.initialized = true;
        });
        this.ds.socket.on('round.changed', function () {
            _this.ds.gameData.currentRound++;
            //            this.roundChange = true;
            //            setTimeout(() => {
            //                this.roundChange = false;
            //            }, 500);   
        });
    };
    // Go to appropriate chat tab when a chat button is clickeds
    AdminComponent.prototype.goChat = function (company) {
        this.chatCompany = company;
        if ($('#chatWindow').window('minimized') == true) {
            $('#chatWindow').window('restore');
        }
        else {
            $('#chatWindow').window('moveToTop');
        }
    };
    AdminComponent = __decorate([
        core_1.Component({
            selector: 'admin-app',
            templateUrl: 'admin/admin.component.html',
            styleUrls: ['admin/admin.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], AdminComponent);
    return AdminComponent;
}());
exports.AdminComponent = AdminComponent;
//# sourceMappingURL=admin.component.js.map