import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'p-orders-tab',
    templateUrl: 'game/purchasing/p-orders-tab.component.html',
    styleUrls: ['css/main.css']
})

export class PurchaseOrdersTab implements OnInit {
    company: string;
    parts: string[];
    filterPart: string = 'All';
    filterStatus: string = 'All';
    round: number;
    purchaseOrders: any;
    hideDetails: boolean[] = [];
    payOnAccept: number;
           
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {
        this.company = this.ds.companyData.company;
        this.parts = this.gs.getComponentParts();
        
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
                
        // Get orders from database
        this.ds.socket.emit('negotiations.find', {query: {purchaseCompany: this.company, offerStatus: 'accepted'}, filter: {_id: 0}, event: 'purchaseOrders.found'});
        
        this.ds.socket.on('purchaseOrders.found', (data) => {
            this.purchaseOrders = data;
        
            for(let i = 0; i < this.purchaseOrders.length; i++) {
                this.hideDetails[i] = true;
                
                let order = this.purchaseOrders[j];
                let shipmentRecord = order.shipmentRecord;
                for (let j = 0; j < shipmentRecord.length; j++) {
                    if (shipmentRecord[j].status == 'shipped' && order.dueRound == this.round) {
                        this.onAccept(i, j);
                    }
                }
            }
            
            //******** AUTOMATICALLY ACCEPT PENDING EARLY SHIPMENTS IF THEY ARE DUE THIS ROUND ****
        });
        
        // Listen for new orders
        this.ds.socket.on('purchaseOrder.new', (data) => {
            this.purchaseOrders.push(data);
            
            this.hideDetails.push(true);
        });
        
        // Listen for updates to orders
        this.ds.socket.on('purchaseOrder.updated', (data) => {
            let update = data.update;
            let order = this.purchaseOrders.find(x => x.id == data.id);
            for (let key in update) {
                order[key] = update[key];
            }
        });
    }

    // Accept an early or late shipment
    onAccept(i: number, j: number) {
        let order = this.purchaseOrders[i];
        let delivered = order.delivered;
        let shipment = order.shipmentRecord[j];
        
        shipment.status = 'accepted';
            
        delivered.quantity += shipment.quantity;
        order.shippedQuantity -= shipment.quantity;
        
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
                    fromCompany: this.company,
                    toCompany: order.saleCompany,
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
        
        this.gs.updateInventory(order.part, shipment.mechQuality, shipment.greenScore, +shipment.quantity);
        
        this.ds.socket.emit('negotiation.update', {id: order.id, update: {delivered: order.delivered, shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity}, toCompany: order.saleCompany, event: 'saleOrder.updated', shipmentIndex: j});
    }

    // Refuse an early or late shipment
    onRefuse(i: number, j: number) {
        let order = this.purchaseOrders[i];
        let shipment = order.shipmentRecord[j];
        
        shipment.status = 'refused';
            
        order.shippedQuantity -= shipment.quantity;
        
        this.ds.socket.emit('inventory.update', {company: order.saleCompany, part: order.part, mechQuality: shipment.mechQuality, greenScore: shipment.greenScore, quantity: +shipment.quantity});
        
        this.ds.socket.emit('negotiation.update', {id: order.id, update: {shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity}, toCompany: order.saleCompany, event: 'saleOrder.updated'});
    }
    
    // Filter orders by part
    setFilterPart(part: string) {
        if (this.filterPart == 'All') {
            return true;
        } else {
            return (part == this.filterPart);
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
}