import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'production-tab',
    templateUrl: 'game/inventory/production-tab.component.html',
    styleUrls: ['game/inventory/production-tab.component.css']
})

export class ProductionTab implements OnInit {
    parts: string[];
    system: string;
    inventory: any;
    selectedIndex: any = {};
    production: any = {};
    quantityStepValue: number;
    roundQuantityTo: number;
    
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {
        this.parts = this.gs.getComponentParts();
        this.system = this.ds.companyData.part;
        this.inventory = this.ds.companyData.inventory;
        
        this.setDefaultProduction();
        
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        
        this.ds.socket.on('inventory.updated', (data) => {
            this.ds.companyData.inventory[data.part] = data.newInventory;
        })
    }
    
    setDefaultProduction() {
        this.production.mechQuality = '-';
        this.production.greenScore = '-';
        this.production.maxQuantity = 0;
        this.production.quantity = 0;
        this.production.cost = 0;
        this.production.waste = 0;
    }
    
    selectRecord(part: string, index: number) {
        this.selectedIndex[part] = index;
        
        if (Object.keys(this.selectedIndex).length == this.parts.length) {
            this.calculateProduction();
        }
    }
    
    calculateProduction() {
        let mechQualities = [];
        let greenScores = [];
        let quantities = [];
        
        for (let part of this.parts) {
            let record = this.inventory[part][this.selectedIndex[part]];
            mechQualities.push(record.mechQuality);
            greenScores.push(record.greenScore);
            quantities.push(record.quantity);
        }
        
        // ***** CHANGE PRODUCTION FORMULAE!!! ****
        this.production.mechQuality = mechQualities[Math.floor(Math.random()*mechQualities.length)];
        
        let greenAverage = greenScores.reduce((a, b) => b += a)/greenScores.length;
        this.production.greenScore = Math.round(greenAverage/10)*10;
        
        this.production.maxQuantity = Math.min(...quantities);
        this.production.quantity = this.production.maxQuantity;
        
        this.production.cost = Math.floor(Math.random()*100);
        
        this.production.waste = Math.floor(Math.random()*10)*this.production.quantity;
        // ***************************************
    }
    
    onBuild() {
        let production = this.production;
        for (let part of this.parts) {
            this.gs.updatePartInventory(part, this.selectedIndex[part], -production.quantity);
        }
        
        this.gs.updateInventory(this.system, production.mechQuality, production.greenScore, +production.quantity);
        
        // ***** UPDATE BALANCE, LEDGER & WASTE ****
        let newId = new Date().getTime() + this.ds.companyData.company;
        let newNote = production.quantity + ' ' + this.system + ' units of Quality ' + production.mechQuality + ' & Green Score ' + production.greenScore + '% at $' + production.cost + '/unit';
        let newTransaction = {
            id: newId,
            fromCompany: this.ds.companyData.company,
//            toCompany: purchase.saleCompany,
            amount: production.quantity * production.cost,
            note: newNote,
            round: this.ds.gameData.currentRound,
            type: 'Production'
        }
        // Insert new transaction in database
        this.ds.socket.emit('transaction.insert', newTransaction);
        
        this.setDefaultProduction();
        this.selectedIndex = {};
    }
    
    roundQuantity() {
        this.production.quantity = Math.round(this.production.quantity/this.roundQuantityTo)*this.roundQuantityTo;
    }
}