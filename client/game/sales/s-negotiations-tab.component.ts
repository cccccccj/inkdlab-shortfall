import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 's-negotiations-tab',
    templateUrl: 'game/sales/s-negotiations-tab.component.html',
    styleUrls: ['css/main.css']
})

export class SaleNegotiationsTab implements OnInit {
    part: string;
    company: string;
    purchaseCompanies: string[];
    quantityStepValue: number;
    roundQuantityTo: number;
    greenScoreStepValue: number;
    roundGreenScoreTo: number;
    priceStepValue: number;
    priceDefaultValue: any;
    roundPriceTo: number;
    priceType: string;
    filterCompany: string = 'All';
    filterStatus: string = 'All';
    round: number;
    sales: any;
    payOnAccept: number;
    
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        
        this.greenScoreStepValue = this.ds.gameData.greenScoreStepValue;
        this.roundGreenScoreTo = this.ds.gameData.roundGreenScoreTo;
        
        this.priceStepValue = this.ds.gameData.priceStepValue;
        this.priceDefaultValue = this.ds.gameData.priceDefaultValue;
        this.roundPriceTo = this.ds.gameData.roundPriceTo;
        this.priceType = typeof this.priceDefaultValue;
                
        this.company = this.ds.companyData.company;
        this.part = this.ds.companyData.part;
        
        this.purchaseCompanies = this.gs.getPurchaseCompanies();
        
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
        
        // Get offer data for current round from database
        this.ds.socket.emit('negotiations.find', {query: {saleCompany: this.company, offerRound: this.round}, filter: {_id: 0}, event: 'sales.found'});
        
        this.ds.socket.on('sales.found', (data) => {
            this.sales = data;
            
            if (this.sales.length == 0) {
                this.onNewSale();
            }    
        });

        // Listen for new offers
        this.ds.socket.on('saleOffer.new', (offer) => {
            this.sales.push(offer);
        });

        // Listen for updates to offers
        this.ds.socket.on('saleOffer.updated', (data) => {
            this.updateSale(data);
        }); 
    }
    
    // Send new offer
    onSend(i: number) {
        let sale = this.sales[i];
        sale.saleNote = sale.saleNote.trim();
        sale.offerStatus = 'pending';
        
        // Insert offer in database
        this.ds.socket.emit('negotiation.insert', {offer: sale, toCompany: sale.purchaseCompany, event: 'purchaseOffer.new'});
    }
    
    // Rescind an offer
    onRescind(i: number) {
        let sale = this.sales[i];
        sale.offerStatus = 'rescinded';  
        
        // Update offer in database
        this.ds.socket.emit('negotiation.update', {id: sale.id, update: {offerStatus: sale.offerStatus}, toCompany: sale.purchaseCompany, event: 'purchaseOffer.updated'});
    }
    
    // Accept an offer
    onAccept(i: number) {
        let sale = this.sales[i];
        sale.saleNote = sale.saleNote.trim();
        sale.offerStatus = 'accepted';
        sale.dueRound = this.round + 1;
        sale.delivered = {
            status: 'Unfulfilled',
            quantity: 0,
            mechQuality: '-',
            greenScore: '-'
        };
        sale.shipmentRecord = [];
        sale.shippedQuantity = 0;
        
        // Update offer in database
        this.ds.socket.emit('negotiation.update', {id: sale.id, update: sale, toCompany: sale.purchaseCompany, event: 'purchaseOffer.updated'});
        
        // Send offer to orders tab
        this.ds.socket.emit('order.new', sale);
        
        // Create new transaction for 'on accept' payment
        if (this.payOnAccept > 0) {
            let newId = new Date().getTime() + this.company;
            let newNote = sale.quantity + ' ' + sale.part + ' units of Quality ' + sale.mechQuality + ' & Green Score ' + sale.greenScore + '% at $' + sale.price + '/unit';
            if (this.payOnAccept < 100) {
                newNote += ' - Partial payment';
            }
            let newTransaction = {
                id: newId,
                fromCompany: sale.purchaseCompany,
                toCompany: this.company,
                amount: sale.quantity * sale.price * this.payOnAccept/100,
                note: newNote,
                round: this.round,
                type: 'Order'
            }
            // Insert new transaction in database
            this.ds.socket.emit('transaction.insert', newTransaction);
        }
    }
    
    // Reject an offer
    onReject(i: number) {
        let sale = this.sales[i];
        sale.saleNote = sale.saleNote.trim();
        sale.offerStatus = 'rejected'; 
        
        // Update offer in database
        this.ds.socket.emit('negotiation.update', {id: sale.id, update: {offerStatus: sale.offerStatus, saleNote: sale.saleNote}, toCompany: sale.purchaseCompany, event: 'purchaseOffer.updated'});
    }
    
    // Delete unsent offer
    onDelete(i: number) {
        this.sales.splice(i, 1);   
    }
    
    // Add new offer row
    onNewSale() {
        let newId = new Date().getTime() + this.company;
        let newCompany = this.purchaseCompanies[0];
        let newSale = {
            id: newId,
            part: this.part,
            saleCompany: this.company,
            purchaseCompany: newCompany,
            offerBy: 'sale',
            quantity: this.quantityStepValue,
            price: this.priceStepValue,
            mechQuality: 'A',
            greenScore: this.greenScoreStepValue,
            saleNote: '',
            purchaseNote: '',
            offerStatus: 'unsent',
            offerRound: this.round
        }
        this.sales.push(newSale);
    }
    
    // Filter offers by company
    setFilterCompany(company: string) {
         if (this.filterCompany == 'All') {
                return true;
            } else {
                return (company == this.filterCompany);
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
    
     // Update an offer
    updateSale(data: any) {
        let id = data.id;
        let update = data.update;
        
        for (let sale of this.sales) {
            if(sale.id === id) {
                for (let key in update) {
                    sale[key] = update[key];
                }
                break;
            }
        }
    }
    
    // Round quantity value
    roundQuantity(i: number) {
        this.sales[i].quantity = Math.round(this.sales[i].quantity/this.roundQuantityTo)*this.roundQuantityTo;
    }
    
    // Round green score value
    roundGreenScore(i: number) {
        this.sales[i].greenScore = Math.round(this.sales[i].greenScore/this.roundGreenScoreTo)*this.roundGreenScoreTo;
    }
    
    // Round price value
    roundPrice(i: number) {
        this.sales[i].price = Math.round(this.sales[i].price/this.roundPriceTo)*this.roundPriceTo;
    }  
}