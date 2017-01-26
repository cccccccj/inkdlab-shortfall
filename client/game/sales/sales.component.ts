import { Component } from '@angular/core';

@Component({
    selector: 'sales',
    templateUrl: 'game/sales/sales.component.html',
    styleUrls: ['css/main.css']
})

export class SalesWindow {
    activeTab: string = 'negotiations';
    
    // Switch tabs
    changeTab(value: string) {
        if(this.activeTab != value) {
            this.activeTab = value;
        }
    }
}