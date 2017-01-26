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
var OnlineStatus = (function () {
    function OnlineStatus(ds) {
        this.ds = ds;
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], OnlineStatus.prototype, "company", void 0);
    OnlineStatus = __decorate([
        core_1.Component({
            selector: 'online-status',
            templateUrl: 'shared/chat/online-status.component.html',
            styleUrls: ['shared/chat/online-status.component.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], OnlineStatus);
    return OnlineStatus;
}());
exports.OnlineStatus = OnlineStatus;
//# sourceMappingURL=online-status.component.js.map