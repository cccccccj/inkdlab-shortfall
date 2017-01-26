import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'transfer-tab',
    templateUrl: 'game/banking/transfer-tab.component.html',
    styleUrls: ['css/main.css']
})

export class TransferTab implements OnInit {
    company: string;
    balance: number;
    stepValue: number;
    transferAmount: number;
    roundTransferTo: number;
    otherCompanies: string[];
    transferCompany: string;
    note: string = '';
    confirming: boolean = false;
    confirmation: boolean = false;
        
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        this.stepValue = this.ds.gameData.transferStepValue;
        this.transferAmount = this.stepValue;
        this.roundTransferTo = this.ds.gameData.roundTransferTo;
                
        this.company = this.ds.companyData.company;
        this.balance = this.ds.companyData.balance;
        
        this.otherCompanies = this.ds.getCompanies();
        this.transferCompany = this.otherCompanies[0];
    }
    
    // Confirm money transfer
    onTransfer() {
        this.confirming = true;
    }
    
    // Cancel money transfer
    onCancel() {
        this.confirming = false;
    }
    
    // Insert new transaction in database
    onConfirm() {
        let newId = new Date().getTime() + this.company;
        let newTransaction = {
            id: newId,
            fromCompany: this.company,
            toCompany: this.transferCompany,
            amount: this.transferAmount,
            note: this.note.trim(),
            round: this.ds.gameData.currentRound,
            type: 'Transfer'
        }
        
        this.ds.socket.emit('transaction.insert', newTransaction);
        
        // ----- Check if transaction was succesful? ----////
        
        // --------------------------------------------//
                
        this.note = '';
        this.confirmation = true;
        setTimeout(() => {this.confirmation = false; this.confirming = false; this.transferAmount = this.stepValue;}, 1000);
    }
    
    // Round transfer amount
    roundAmount() {
        if (this.transferAmount < 0) {
            this.transferAmount = 0;
        } else {
            this.transferAmount = Math.round(this.transferAmount/this.roundTransferTo)*this.roundTransferTo;
        }
    }
}