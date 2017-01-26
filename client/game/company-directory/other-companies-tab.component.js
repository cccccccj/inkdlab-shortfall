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
var OtherCompaniesTab = (function () {
    function OtherCompaniesTab(ds) {
        this.ds = ds;
        this.roundArray = [];
    }
    OtherCompaniesTab.prototype.ngOnInit = function () {
        var totalRounds = this.ds.gameData.totalRounds;
        for (var i = 0; i < totalRounds; i++) {
            this.roundArray[i] = i + 1;
        }
        this.onCompanyChange(0);
        this.onRoundChange('All');
    };
    OtherCompaniesTab.prototype.onRoundChange = function (value) {
        this.roundFilter = value;
        this.chartLabels = [];
        if (this.roundFilter == 'All') {
            this.chartLabels = this.roundArray.map(String);
            this.chartLabels.push('End');
        }
        else {
            this.chartLabels.push(this.roundFilter);
            this.chartLabels.push(String(Number(this.roundFilter) + 1));
        }
    };
    OtherCompaniesTab.prototype.onCompanyChange = function (index) {
        this.index = index;
        // random number for charts
        for (var a = [], i = 0; i <= 13; ++i)
            a[i] = i;
        for (var b = [], i = 0; i <= 13; ++i)
            b[i] = i;
        for (var c = [], i = 0; i <= 13; ++i)
            c[i] = i;
        function shuffle(array) {
            var tmp, current, top = array.length;
            if (top)
                while (--top) {
                    current = Math.floor(Math.random() * (top + 1));
                    tmp = array[current];
                    array[current] = array[top];
                    array[top] = tmp;
                }
            return array;
        }
        a = shuffle(a);
        b = shuffle(b);
        c = shuffle(c);
        // random number for charts
        this.financial = a;
        this.green = b;
        this.social = c;
        // Plotting data into chart
        this.chartData = [
            { data: this.financial, label: 'Financial' },
            { data: this.green, label: 'Green' },
            { data: this.social, label: 'Social' }
        ];
    };
    OtherCompaniesTab = __decorate([
        core_1.Component({
            selector: 'other-companies-tab',
            templateUrl: 'game/company-directory/other-companies-tab.component.html',
            styleUrls: ['css/main.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], OtherCompaniesTab);
    return OtherCompaniesTab;
}());
exports.OtherCompaniesTab = OtherCompaniesTab;
//# sourceMappingURL=other-companies-tab.component.js.map