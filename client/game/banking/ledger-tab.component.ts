import { Component, Output, EventEmitter, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'ledger-tab',
    templateUrl: 'game/banking/ledger-tab.component.html',
    styleUrls: ['css/main.css']
})

export class LedgerTab implements OnInit {
    company: string;
    transactions: any;
    otherCompanies: string[];
    filterCompany: string = 'All';
    filterType: string = 'All';
    
    @Output() balanceChange = new EventEmitter();
    
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        this.company = this.ds.companyData.company;
        
        this.otherCompanies = this.ds.getCompanies();
                
        // Get transaction data from database
        this.ds.socket.emit('transactions.find', {query: {$or: [{fromCompany: this.company}, {toCompany: this.company}]}, options: {fields: {_id: 0}, sort: {id: -1}}, event: 'transactions.found'});
                    
        this.ds.socket.on('transactions.found', (data) => {
            this.transactions = data;
        });
        
        // Listen for new transactions and update balance
        this.ds.socket.on('transaction.new', (data) => {
            this.transactions.unshift(data);
            
            if (data.fromCompany == this.company) {
                this.balanceChange.emit(-data.amount);
            } else {
                this.balanceChange.emit(+data.amount);
            }
        });
    }
    
    // Filter transactions by company
    setFilterCompany(transaction: any) {
        if (this.filterCompany == 'All') {
            return true;
        } else {
            return (transaction.fromCompany == this.filterCompany || transaction.toCompany == this.filterCompany);
        }
    }
    
    // Filter transactions by type
    setFilterType(transaction: any) {
        switch(this.filterType) {
            case 'All':
                return true;
            case 'Sale':
                return (transaction.type == 'Order' && transaction.toCompany == this.company);
            case 'Purchase':
                return (transaction.type == 'Order' && transaction.fromCompany == this.company);
            case 'Production':
                return (transaction.type == 'Production');
            case 'Transfer':
                return (transaction.type == 'Transfer');
        }
    }
}