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
var GameService = (function () {
    function GameService(ds) {
        this.ds = ds;
    }
    // Get the three components of part manufactured by player's company
    GameService.prototype.getComponentParts = function (part) {
        if (part === void 0) { part = this.ds.companyData.part; }
        switch (part) {
            case 'Car':
                return ['Chassis'];
            case 'Chassis':
                return ['Exhaust', 'Transmission', 'Engine'];
            case 'Exhaust':
                return ['Exhaust Pipe', 'Muffler', 'Catalytic Converter'];
            case 'Transmission':
                return ['Governor', 'Planetary Gear', 'Clutch'];
            case 'Engine':
                return ['Crankshaft', 'Spark Plug', 'Piston'];
        }
    };
    // Get the system that requires the part manufactured by player's company
    GameService.prototype.getPartSystem = function (part) {
        if (part === void 0) { part = this.ds.companyData.part; }
        switch (part) {
            case 'Chassis':
                return 'Car';
            case 'Exhaust':
            case 'Transmission':
            case 'Engine':
                return 'Chassis';
            case 'Exhaust Pipe':
            case 'Muffler':
            case 'Catalytic Converter':
                return 'Exhaust';
            case 'Governor':
            case 'Planetary Gear':
            case 'Clutch':
                return 'Transmission';
            case 'Crankshaft':
            case 'Spark Plug':
            case 'Piston':
                return 'Engine';
        }
    };
    // Get companies that sell to player's company as object of arrays
    GameService.prototype.getSaleCompanies = function (part) {
        if (part === void 0) { part = this.ds.companiesData.part; }
        var parts = this.getComponentParts(part);
        var saleCompanies = {};
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var p = parts_1[_i];
            saleCompanies[p] = [];
            for (var _a = 0, _b = this.ds.companiesData; _a < _b.length; _a++) {
                var c = _b[_a];
                if (c.part == p) {
                    saleCompanies[p].push(c.company);
                }
            }
        }
        return saleCompanies;
    };
    // Get companies that purchase from player's company as array
    GameService.prototype.getPurchaseCompanies = function (part) {
        if (part === void 0) { part = this.ds.companiesData.part; }
        var system = this.getPartSystem(part);
        var purchaseCompanies = [];
        for (var _i = 0, _a = this.ds.companiesData; _i < _a.length; _i++) {
            var c = _a[_i];
            if (c.part == system) {
                purchaseCompanies.push(c.company);
            }
        }
        return purchaseCompanies;
    };
    // Check whether all events of a certain type have been resolved in the current round
    GameService.prototype.allEventsResolved = function (type) {
        var round = this.ds.gameData.currentRound;
        var currentEvents = this.ds.gameData.events['round' + round];
        var resolved = true;
        for (var _i = 0, currentEvents_1 = currentEvents; _i < currentEvents_1.length; _i++) {
            var eventId = currentEvents_1[_i];
            if (this.ds.eventsData[eventId].resolveType === type && !this.ds.companyData.eventResolves['round' + round + eventId]) {
                resolved = false;
                break;
            }
        }
        return resolved;
    };
    // Create empty inventory for player's company
    GameService.prototype.createInventory = function () {
        var inventory = {};
        inventory[this.ds.companyData.part] = [];
        for (var _i = 0, _a = this.getComponentParts(); _i < _a.length; _i++) {
            var part = _a[_i];
            inventory[part] = [];
        }
        this.ds.companyData.inventory = inventory;
    };
    // Update a part inventory of player's company using part data
    GameService.prototype.updateInventory = function (part, mechQuality, greenScore, quantity) {
        var partInventory = this.ds.companyData.inventory[part];
        var index = partInventory.findIndex(function (x) { return (x.mechQuality == mechQuality) && (x.greenScore == greenScore); });
        if (index != -1) {
            partInventory[index].quantity += quantity;
            if (partInventory[index].quantity == 0) {
                partInventory.splice(index, 1);
            }
        }
        else {
            partInventory.push({ mechQuality: mechQuality, greenScore: greenScore, quantity: quantity });
        }
        // Update inventory in database
        this.ds.socket.emit('company.update', { query: { company: this.ds.companyData.company }, update: { $set: { inventory: this.ds.companyData.inventory } } });
    };
    // Update a part inventory of player's company using index
    GameService.prototype.updatePartInventory = function (part, index, quantity) {
        var partInventory = this.ds.companyData.inventory[part];
        partInventory[index].quantity += quantity;
        if (partInventory[index].quantity == 0) {
            partInventory.splice(index, 1);
        }
    };
    GameService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], GameService);
    return GameService;
}());
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map