import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 's-orders-tab',
    templateUrl: 'game/sales/s-orders-tab.component.html',
    styleUrls: ['css/main.css']
})

export class SaleOrdersTab implements OnInit {
    company: string;
    part: string;
    purchaseCompanies: string[];
    quantityStepValue: number;
    roundQuantityTo: number;
    greenScoreStepValue: number;
    roundGreenScoreTo: number;
    filterCompany: string = 'All';
    filterStatus: string = 'All';
    round: number;
    saleOrders: any;
    shipQuantity: number[] = [];
    shipMechQuality: string[] = [];
    shipGreenScore: number[] = [];
    hideDetails: boolean[] = [];
    payOnAccept: number;
                
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {        
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        
        this.greenScoreStepValue = this.ds.gameData.greenScoreStepValue;
        this.roundGreenScoreTo = this.ds.gameData.roundGreenScoreTo;
                
        this.company = this.ds.companyData.company;
        this.part = this.ds.companyData.part;
        
        this.purchaseCompanies = this.gs.getPurchaseCompanies();
        
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
        
        // Get orders from database
        this.ds.socket.emit('negotiations.find', {query: {saleCompany: this.company, offerStatus: 'accepted'}, filter: {_id: 0}, event: 'saleOrders.found'});
        
        this.ds.socket.on('saleOrders.found', (data) => {
            this.saleOrders = data;
            
            for(let i = 0; i < this.saleOrders.length; i++) {
                let order = this.saleOrders[i];                
                this.shipQuantity[i] = order.quantity - order.delivered.quantity - order.shippedQuantity;
                this.shipMechQuality[i] = order.mechQuality;
                this.shipGreenScore[i] = order.greenScore;
                this.hideDetails[i] = true;
            }
        });
        
        // Listen for new orders
        this.ds.socket.on('saleOrder.new', (data) => {
            this.saleOrders.push(data);
            
            this.shipQuantity.push(data.quantity - data.delivered.quantity - data.shippedQuantity);
            this.shipMechQuality.push(data.mechQuality);
            this.shipGreenScore.push(data.greenScore);
            this.hideDetails.push(true);
        });

        // Listen for updates to orders
        this.ds.socket.on('saleOrder.updated', (data) => {
            let update = data.update;
            let order = this.saleOrders.find(x => x.id == data.id);
            for (let key in update) {
                order[key] = update[key];
            }            
        });
    }
    
    // Ship an order
    onShip(i: number) {
        let orderUpdate = {};
        // Create new shipment record
        let newId = new Date().getTime() + this.company;
        let shipment = {
            id: newId,
            round: this.round,
            quantity: this.shipQuantity[i],
            mechQuality: this.shipMechQuality[i],
            greenScore: this.shipGreenScore[i],
            status: ''
        }
        
        let order = this.saleOrders[i];
        let delivered = order.delivered;
        // If shipment is on time
        if (order.dueRound == this.round) {
            shipment.status = 'delivered';
            
            delivered.quantity += shipment.quantity;
            if (delivered.quantity == order.quantity) {
                delivered.status = 'Fulfilled';
                delivered.round = this.round;
                
                // Create new transaction for 'on delivery' payment
                if (this.payOnAccept < 100) {
                    let newId = new Date().getTime() + this.company;
                    let newNote = order.quantity + ' ' + order.part + ' units of Quality ' + order.mechQuality + ' & Green Score ' + order.greenScore + '% at $' + order.price + '/unit';
                    if (this.payOnAccept > 0) {
                        newNote += ' - Partial payment';
                    }
                    let newTransaction = {
                        id: newId,
                        fromCompany: order.purchaseCompany,
                        toCompany: this.company,
                        amount: order.quantity * order.price * (100 - this.payOnAccept)/100,
                        note: newNote,
                        round: this.round,
                        type: 'Order'
                    }
                    // Insert new transaction in database
                    this.ds.socket.emit('transaction.insert', newTransaction);
                }
            } else {
                delivered.status = 'Partially fulfilled';
            }
                        
            if (delivered.mechQuality == '-') {
                delivered.mechQuality = [];
            }
            if (delivered.mechQuality.indexOf(shipment.mechQuality) == -1) {
                delivered.mechQuality.push(shipment.mechQuality);
            } 
            
            if (delivered.greenScore == '-') {
                delivered.greenScore = [];
            }
            if (delivered.greenScore.indexOf(shipment.greenScore) == -1) {
                delivered.greenScore.push(shipment.greenScore);
            } 
            
            this.ds.socket.emit('inventory.update', {company: order.purchaseCompany, part: order.part, mechQuality: shipment.mechQuality, greenScore: shipment.greenScore, quantity: +shipment.quantity});
            
        } else { // If shipment is early or late
            shipment.status = 'shipped';
            
            order.shippedQuantity += shipment.quantity;
        }
        
        order.shipmentRecord.push(shipment);
        
        this.gs.updateInventory(order.part, shipment.mechQuality, shipment.greenScore, -shipment.quantity);
            
        this.ds.socket.emit('negotiation.update', {id: order.id, update: {delivered: order.delivered, shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity}, toCompany: order.purchaseCompany, event: 'purchaseOrder.updated'});
    }

    // Cancel early or late shipment
    onCancel(i: number, j: number) {
        let order = this.saleOrders[i];
        let shipment = order.shipmentRecord[j];
        
        shipment.status = 'canceled';
        order.shippedQuantity -= shipment.quantity;
        
        this.gs.updateInventory(order.part, shipment.mechQuality, shipment.greenScore, +shipment.quantity);
        
        this.ds.socket.emit('negotiation.update', {id: order.id, update: {shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity}, toCompany: order.purchaseCompany, event: 'purchaseOrder.updated'});
    }
    
    // Filter orders by company
    setFilterCompany(company: string) {
         if (this.filterCompany == 'All') {
                return true;
            } else {
                return (company == this.filterCompany);
            }
    }
    
    // Filter orders by status
    setFilterStatus(status: string, dueRound: number) {
        switch(this.filterStatus) {
            case 'All':
                return true;
            case 'Pending':
                return (status != 'Fulfilled' && dueRound >= this.round);
            case 'Overdue':
                return (status != 'Fulfilled' && dueRound < this.round);
            case 'Fulfilled':
                return (status == 'Fulfilled');
        }
    }
    
    // Show or hide non-essential subrows
    toggleDetails(i: number) {
        this.hideDetails[i] = !this.hideDetails[i];
    }

    // Round quantity value
    roundQuantity(i: number) {
        this.shipQuantity[i] = Math.round(this.shipQuantity[i]/this.roundQuantityTo)*this.roundQuantityTo;
    }

    // Round green score value
    roundGreenScore(i: number) {
        this.shipGreenScore[i] = Math.round(this.shipGreenScore[i]/this.roundGreenScoreTo)*this.roundGreenScoreTo;
    }
}