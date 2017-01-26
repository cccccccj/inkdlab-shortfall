import { Component } from '@angular/core';

@Component({
    selector: 'purchasing',
    templateUrl: 'game/purchasing/purchasing.component.html',
    styleUrls: ['css/main.css']
})

export class PurchasingWindow {
    activeTab: string = 'negotiations';
            
    // Switch tabs
    changeTab(value: string) {
        if(this.activeTab != value) {
            this.activeTab = value;
        }
    }
}