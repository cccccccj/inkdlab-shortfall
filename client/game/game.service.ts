import { Injectable } from '@angular/core';

import { DataService } from 'shared/data.service';

@Injectable()
export class GameService {
    currentEvents: any;
    
    constructor(private ds: DataService) {}
    
    // Get the three components of part manufactured by player's company
    getComponentParts(part: string = this.ds.companyData.part) {
        switch(part) {
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
    }
     
    // Get the system that requires the part manufactured by player's company
    getPartSystem(part: string = this.ds.companyData.part) {
        switch(part) {
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
    }
    
    // Get companies that sell to player's company as object of arrays
    getSaleCompanies(part: string = this.ds.companiesData.part) {
        let parts = this.getComponentParts(part);
        let saleCompanies = {};
        for (let p of parts) {
            saleCompanies[p] = [];
            for (let c of this.ds.companiesData) {
                if (c.part == p) {
                    saleCompanies[p].push(c.company);
                }
            }
        }
        return saleCompanies;
    }
    
    // Get companies that purchase from player's company as array
    getPurchaseCompanies(part: string = this.ds.companiesData.part) {
        let system = this.getPartSystem(part);
        let purchaseCompanies = [];
        for (let c of this.ds.companiesData) {
            if (c.part == system) {
                purchaseCompanies.push(c.company);
            }
        }
        return purchaseCompanies;
    }
    
    // Check whether all events of a certain type have been resolved in the current round
    allEventsResolved(type: string) {
        let round = this.ds.gameData.currentRound;
        let currentEvents = this.ds.gameData.events['round' + round];
        
        let resolved = true;
        for (let eventId of currentEvents) {
            if (this.ds.eventsData[eventId].resolveType === type && !this.ds.companyData.eventResolves['round' + round + eventId]) {
                resolved = false;
                break;
            }
        }
        return resolved;
    }
    
    // Create empty inventory for player's company
    createInventory() {
        let inventory = {};
        inventory[this.ds.companyData.part] = [];
        for (let part of this.getComponentParts()) {
            inventory[part] = [];
        }
        this.ds.companyData.inventory = inventory;
    }
    
    // Update a part inventory of player's company using part data
    updateInventory(part: string, mechQuality: string, greenScore: number, quantity: number) {
        let partInventory = this.ds.companyData.inventory[part];
        let index:number = partInventory.findIndex(x => (x.mechQuality == mechQuality) && (x.greenScore == greenScore));
        if (index != -1) {
            partInventory[index].quantity += quantity;
            if (partInventory[index].quantity == 0) {
                partInventory.splice(index, 1);
            }
        } else {
            partInventory.push({mechQuality: mechQuality, greenScore: greenScore, quantity: quantity});
        }
        
        // Update inventory in database
        this.ds.socket.emit('company.update', {query: {company: this.ds.companyData.company}, update: {$set: {inventory: this.ds.companyData.inventory}}});
    }
    
    // Update a part inventory of player's company using index
    updatePartInventory(part: string, index: number, quantity: number) {
        let partInventory = this.ds.companyData.inventory[part];
        partInventory[index].quantity += quantity;
        if (partInventory[index].quantity == 0) {
            partInventory.splice(index, 1);
        }
    }
}