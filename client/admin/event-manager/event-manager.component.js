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
var EventManagerWindow = (function () {
    function EventManagerWindow(ds) {
        this.ds = ds;
        this.roundArray = [];
        this.selectedId = 'event1';
        this.adding = [];
    }
    EventManagerWindow.prototype.ngOnInit = function () {
        var totalRounds = this.ds.gameData.totalRounds;
        for (var i = 0; i < totalRounds; i++) {
            this.roundArray[i] = i + 1;
            this.adding[i + 1] = false;
        }
        if (!this.ds.gameData.events) {
            this.ds.gameData.events = {};
            this.setRandomEvents(1);
        }
    };
    EventManagerWindow.prototype.setRandomEvents = function (fromRound) {
        if (fromRound === void 0) { fromRound = this.ds.gameData.currentRound + 1; }
        var totalRounds = this.ds.gameData.totalRounds;
        var totalEvents = Object.keys(this.ds.eventsData).length;
        var takenEvents = [];
        for (var i = fromRound; i <= totalRounds; i++) {
            this.ds.gameData.events['round' + i] = [];
            var eventId = void 0;
            do {
                eventId = 'event' + Math.floor(Math.random() * totalEvents + 1);
            } while (takenEvents.indexOf(eventId) !== -1);
            takenEvents.push(eventId);
            this.ds.gameData.events['round' + i].push(eventId);
        }
        this.ds.socket.emit('events.update', this.ds.gameData.events);
    };
    EventManagerWindow.prototype.otherEvents = function (round) {
        var roundEvents = this.ds.gameData.events['round' + round];
        var events = [];
        for (var id in this.ds.eventsData) {
            if (roundEvents.indexOf(id) === -1) {
                events.push(id);
            }
        }
        return events;
    };
    EventManagerWindow.prototype.onDelete = function (eventId, round) {
        var index = this.ds.gameData.events['round' + round].indexOf(eventId);
        this.ds.gameData.events['round' + round].splice(index, 1);
        this.ds.socket.emit('events.update', this.ds.gameData.events);
    };
    EventManagerWindow.prototype.onAdd = function (eventId, round) {
        this.ds.gameData.events['round' + round].push(eventId);
        this.adding[round] = false;
        this.ds.socket.emit('events.update', this.ds.gameData.events);
    };
    EventManagerWindow.prototype.onSelect = function (eventId) {
        this.selectedId = eventId;
    };
    return EventManagerWindow;
}());
EventManagerWindow = __decorate([
    core_1.Component({
        selector: 'event-manager',
        templateUrl: 'admin/event-manager/event-manager.component.html',
        styleUrls: ['admin/event-manager/event-manager.component.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService])
], EventManagerWindow);
exports.EventManagerWindow = EventManagerWindow;
//# sourceMappingURL=event-manager.component.js.map