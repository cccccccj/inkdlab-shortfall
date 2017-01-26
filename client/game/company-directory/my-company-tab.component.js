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
var game_service_1 = require('game/game.service');
var MyCompanyTab = (function () {
    function MyCompanyTab(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.chartLabels = ['Financial', 'Green', 'Social'];
        this.profileSet = new core_1.EventEmitter();
    }
    MyCompanyTab.prototype.ngOnInit = function () {
        this.companyData = this.ds.companyData;
        this.part = this.companyData.part;
        // Set default goals in set mode
        if (this.setMode) {
            this.presets = this.ds.gameData.profilePresets;
            this.defaultIndex = this.presets.findIndex(function (x) { return x.name === 'Custom'; });
            this.changePreset(this.defaultIndex);
        }
        else {
            this.company = this.companyData.company;
            this.mission = this.companyData.mission;
            this.financial = this.companyData.financial;
            this.green = this.companyData.green;
            this.social = this.companyData.social;
        }
    };
    // Constrain goal sliders to add up to 100%
    MyCompanyTab.prototype.constrainGoals = function (changedGoal, stringValue) {
        var newValue = Number(stringValue);
        var sum, offset;
        switch (changedGoal) {
            case 'financial':
                sum = newValue + this.green + this.social;
                offset = sum - 100;
                this.financial = newValue;
                this.green -= offset;
                break;
            case 'green':
                sum = newValue + this.financial + this.social;
                offset = sum - 100;
                this.green = newValue;
                this.social -= offset;
                break;
            case 'social':
                sum = newValue + this.financial + this.green;
                offset = sum - 100;
                this.social = newValue;
                this.financial -= offset;
                break;
        }
    };
    // Change goal sliders to profile presets
    MyCompanyTab.prototype.changePreset = function (i) {
        var preset = this.presets[i];
        this.financial = preset.financial;
        this.green = preset.green;
        this.social = preset.social;
    };
    MyCompanyTab.prototype.invalidInput = function () {
        return this.company == undefined || this.company.trim() == '';
    };
    // Submit profile
    MyCompanyTab.prototype.onSubmit = function () {
        var _this = this;
        // Save company data in database
        this.companyData.company = this.company;
        this.companyData.mission = this.mission;
        this.companyData.financial = this.financial;
        this.companyData.green = this.green;
        this.companyData.social = this.social;
        this.companyData.balance = this.ds.gameData.initialBalance;
        this.companyData.eventResolves = {};
        this.gs.createInventory();
        this.ds.socket.emit('company.set', this.companyData);
        // Go to display mode and start game 
        this.ds.socket.on('company.confirm', function () {
            _this.setMode = false;
            _this.ds.companyData = _this.companyData;
            _this.profileSet.emit();
        });
        // Display error message
        this.ds.socket.on('company.error', function () {
            _this.company = '';
            _this.companyTaken = true;
            setTimeout(function () { _this.companyTaken = false; }, 2000);
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], MyCompanyTab.prototype, "setMode", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], MyCompanyTab.prototype, "profileSet", void 0);
    MyCompanyTab = __decorate([
        core_1.Component({
            selector: 'my-company-tab',
            templateUrl: 'game/company-directory/my-company-tab.component.html',
            styleUrls: ['css/main.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, game_service_1.GameService])
    ], MyCompanyTab);
    return MyCompanyTab;
}());
exports.MyCompanyTab = MyCompanyTab;
//# sourceMappingURL=my-company-tab.component.js.map