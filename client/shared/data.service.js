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
var Subject_1 = require('rxjs/Subject');
var DataService = (function () {
    function DataService() {
        // Subject & observable for chat button click
        this.chatClickedSource = new Subject_1.Subject();
        this.chatClicked$ = this.chatClickedSource.asObservable();
    }
    Object.defineProperty(DataService.prototype, "companies", {
        // Set data of companies
        set: function (data) {
            this.companiesData = data;
            // Sort companies alphabetically
            this.companiesData.sort(function (a, b) {
                var al = a.company.toLowerCase();
                var bl = b.company.toLowerCase();
                return (al > bl) ? 1 : ((bl > al) ? -1 : 0);
            });
            // Set chat status of companies
            this.intitiateChatStatus();
        },
        enumerable: true,
        configurable: true
    });
    // Set initial chat status of other companies and admin and listen for changes
    DataService.prototype.intitiateChatStatus = function () {
        var _this = this;
        this.chatStatus = {};
        // Set status of companies
        for (var _i = 0, _a = this.companiesData; _i < _a.length; _i++) {
            var c = _a[_i];
            if (c.player == 'human') {
                this.chatStatus[c.company] = c.online ? 'online' : 'offline';
            }
            else {
                this.chatStatus[c.company] = 'computer';
            }
        }
        // Update chat status if a company comes online or goes offline
        this.socket.on('company.statusChange', function (data) {
            _this.chatStatus[data.company] = data.status;
        });
        // Set status of admin
        this.chatStatus['Admin'] = this.gameData.adminOnline ? 'online' : 'offline';
        // Update chat status if admin comes online or goes offline
        this.socket.on('admin.statusChange', function (data) {
            _this.chatStatus['Admin'] = data.status;
        });
    };
    // Update observable when chat button is clicked
    DataService.prototype.onChat = function (company) {
        this.chatClickedSource.next(company);
    };
    // Get companies other than player's company as array
    DataService.prototype.getCompanies = function () {
        var companies = [];
        for (var _i = 0, _a = this.companiesData; _i < _a.length; _i++) {
            var c = _a[_i];
            companies.push(c.company);
        }
        return companies;
    };
    DataService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map