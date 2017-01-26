import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'p-negotiations-tab',
    templateUrl: 'game/purchasing/p-negotiations-tab.component.html',
    styleUrls: ['css/main.css']
})

export class PurchaseNegotiationsTab implements OnInit {
    company: string;
    parts: string[];
    saleCompanies: any;
    quantityStepValue: number;
    roundQuantityTo: number;
    greenScoreStepValue: number;
    roundGreenScoreTo: number;
    priceStepValue: number;
    priceDefaultValue: number | number[];
    priceType: string;
    roundPriceTo: number;
    filterPart: string = 'All';
    filterStatus: string = 'All';
    round: number;
    purchases: any;
    currentOffer: number;
    confirming: boolean = false;
    payOnAccept: number;
    
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        
        this.greenScoreStepValue = this.ds.gameData.greenScoreStepValue;
        this.roundGreenScoreTo = this.ds.gameData.roundGreenScoreTo;
        
        this.priceStepValue = this.ds.gameData.priceStepValue;
        this.priceDefaultValue = this.ds.gameData.priceDefaultValue;
        this.priceType = typeof this.priceDefaultValue;
        this.roundPriceTo = this.ds.gameData.roundPriceTo;
                
        this.company = this.ds.companyData.company;
        this.parts = this.gs.getComponentParts();
        
        this.saleCompanies = this.gs.getSaleCompanies();
        
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
             
        // Get offer data for current round from database
        this.ds.socket.emit('negotiations.find', {query: {purchaseCompany: this.company, offerRound: this.round}, filter: {_id: 0}, event: 'purchases.found'});
    
        this.ds.socket.on('purchases.found', (data) => {
            this.purchases = data;
            
            if (this.purchases.length == 0) {
                this.onNewPurchase();
            }      
        }); 

        // Listen for new offers
        this.ds.socket.on('purchaseOffer.new', (offer) => {
            this.purchases.push(offer);
        });

        // Listen for updates to offers
        this.ds.socket.on('purchaseOffer.updated', (data) => {
            let id = data.id;
            let update = data.update;
            for (let purchase of this.purchases) {
                if(purchase.id === id) {
                    for (let key in update) {
                        purchase[key] = update[key];
                    }
                    break;
                }
            }
        });
    }
    
    // Confirm before sending new offer
    onSend(i: number) {
        this.currentOffer = i;
        this.confirming = true;
    }
    
    onConfirm() {
        let purchase = this.purchases[this.currentOffer];
        purchase.purchaseNote = purchase.purchaseNote.trim();
            
        // Accept new offer
        if (purchase.offerBy == 'sale') {
            purchase.offerStatus = 'accepted';
            purchase.dueRound = this.round + 1;
            purchase.delivered = {
                status: 'Unfulfilled',
                quantity: 0,
                mechQuality: '-',
                greenScore: '-'
            };
            purchase.shipmentRecord = [];
            purchase.shippedQuantity = 0;

            // Update offer in database
            this.ds.socket.emit('negotiation.update', {id: purchase.id, update: purchase, toCompany: purchase.saleCompany, event: 'saleOffer.updated'});
            
            // Send offer to orders tab
            this.ds.socket.emit('order.new', purchase);
            
            // Create new transaction for 'on accept' payment
            if (this.payOnAccept > 0) {
                let newId = new Date().getTime() + this.company;
                let newNote = purchase.quantity + ' ' + purchase.part + ' units of Quality ' + purchase.mechQuality + ' & Green Score ' + purchase.greenScore + '% at $' + purchase.price + '/unit';
                if (this.payOnAccept < 100) {
                    newNote += ' - Partial payment';
                }
                let newTransaction = {
                    id: newId,
                    fromCompany: this.company,
                    toCompany: purchase.saleCompany,
                    amount: purchase.quantity * purchase.price * this.payOnAccept/100,
                    note: newNote,
                    round: this.round,
                    type: 'Order'
                }
                // Insert new transaction in database
                this.ds.socket.emit('transaction.insert', newTransaction);
            }
        } else { // Send new offer
            purchase.offerStatus = 'pending';
            
            // Insert offer in database
            this.ds.socket.emit('negotiation.insert', {offer: purchase, toCompany: purchase.saleCompany, event: 'saleOffer.new'});
        }
        
        this.confirming = false;
    }
    
    // Cancel new offer
    onCancel() {
        this.confirming = false;
    }
    
    // Rescind an offer
    onRescind(i: number) {
        let purchase = this.purchases[i];
        purchase.offerStatus = 'rescinded';
        
        // Update offer in database
        this.ds.socket.emit('negotiation.update', {id: purchase.id, update: {offerStatus: purchase.offerStatus}, toCompany: purchase.saleCompany, event: 'saleOffer.updated'});  
    }
    
    // Confirm before accepting an offer
    onAccept(i: number) {
        this.currentOffer = i;
        this.confirming = true;
    }
    
    // Reject an offer
    onReject(i: number) {
        let purchase = this.purchases[i];
        purchase.purchaseNote = purchase.purchaseNote.trim();
        purchase.offerStatus = 'rejected';
        
        // Update offer in database
        this.ds.socket.emit('negotiation.update', {id: purchase.id, update: {offerStatus: purchase.offerStatus, purchaseNote: purchase.purchaseNote}, toCompany: purchase.saleCompany, event: 'saleOffer.updated'});
    }
    
    // Delete unsent offer
    onDelete(i: number) {
        this.purchases.splice(i, 1);
    }

    // Add new offer row
    onNewPurchase() {
        let newId = new Date().getTime() + this.company;
        let newPart = this.parts[0];
    
        let newPurchase = {
            id: newId,
            part: newPart,
            saleCompany: this.saleCompanies[newPart][0],
            purchaseCompany: this.company,
            offerBy: 'purchase',
            quantity: this.quantityStepValue,
            price: this.priceStepValue,
            mechQuality: 'A',
            greenScore: this.greenScoreStepValue,
            saleNote: '',
            purchaseNote: '',
            offerStatus: 'unsent',
            offerRound: this.round
        };
        this.purchases.push(newPurchase);
    }
    
    // Filter offers by part
    setFilterPart(part: string) {
        if (this.filterPart == 'All') {
            return true;
        } else {
            return (part == this.filterPart);
        }
    }
    
    // Filter offers by status
    setFilterStatus(status: string) {
        switch(this.filterStatus) {
            case 'All':
                return true;
            case 'Pending':
                return (status == 'unsent' || status == 'pending');
            case 'Accepted':
                return (status == 'accepted');
            case 'Rejected':
                return (status == 'rejected' || status == 'rescinded');
        }
    }
    
    // Round quantity value
    roundQuantity(i: number) {
        this.purchases[i].quantity = Math.round(this.purchases[i].quantity/this.roundQuantityTo)*this.roundQuantityTo;
    }

    // Round green score value
    roundGreenScore(i: number) {
        this.purchases[i].greenScore = Math.round(this.purchases[i].greenScore/this.roundGreenScoreTo)*this.roundGreenScoreTo;
    }

    // Round price value
    roundPrice(i: number) {
        this.purchases[i].price = Math.round(this.purchases[i].price/this.roundPriceTo)*this.roundPriceTo;
    }

    // Change sale companies shown when part is changed
    changePart(i: number, part: string) {  
        this.purchases[i].part = part;
        this.purchases[i].saleCompany = this.saleCompanies[part][0];
    }
}