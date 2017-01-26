import { Component } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'banking',
    templateUrl: 'game/banking/banking.component.html',
    styleUrls: ['css/main.css']
})

export class BankingWindow {
    activeTab: string = 'transfer';
            
    constructor(private ds: DataService) {}
    
    // Switch tabs
    changeTab(value: string) {
        if(this.activeTab != value) {
            this.activeTab = value;
        }
    }
    
    // Update balance after new transaction
    updateBalance(changeValue: number) {
        this.ds.companyData.balance += changeValue;
    }
}