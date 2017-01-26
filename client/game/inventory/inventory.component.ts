import { Component } from '@angular/core';

@Component({
    selector: 'inventory',
    templateUrl: 'game/inventory/inventory.component.html',
    styleUrls: ['game/inventory/inventory.component.css']
})

export class InventoryWindow {
    activeTab: string = 'production';
            
    // Switch tabs
    changeTab(value: string) {
        if(this.activeTab != value) {
            this.activeTab = value;
        }
    }
}