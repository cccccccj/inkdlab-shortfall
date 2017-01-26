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
var game_service_1 = require("game/game.service");
var CurrentEventWindow = (function () {
    function CurrentEventWindow(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.eventsResolved = new core_1.EventEmitter();
    }
    CurrentEventWindow.prototype.ngOnInit = function () {
        this.round = this.ds.gameData.currentRound;
        if (this.ds.gameData.events) {
            this.events = this.ds.gameData.events['round' + this.round];
        }
        if (this.gs.allEventsResolved('immediate')) {
            this.eventsResolved.emit();
        }
    };
    CurrentEventWindow.prototype.onSelect = function (eventId, selectedOption) {
        var key = 'round' + this.round + eventId;
        this.ds.companyData.eventResolves[key] = selectedOption;
        this.ds.socket.emit('company.update', { query: { company: this.ds.companyData.company }, update: { $set: { eventResolves: this.ds.companyData.eventResolves } } });
        var resolveType = this.ds.eventsData[eventId].resolveType;
        if (this.gs.allEventsResolved(resolveType)) {
            this.eventsResolved.emit();
        }
    };
    return CurrentEventWindow;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], CurrentEventWindow.prototype, "eventsResolved", void 0);
CurrentEventWindow = __decorate([
    core_1.Component({
        selector: 'current-event',
        templateUrl: 'game/current-event/current-event.component.html',
        styleUrls: ['css/main.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, game_service_1.GameService])
], CurrentEventWindow);
exports.CurrentEventWindow = CurrentEventWindow;
//# sourceMappingURL=current-event.component.js.map