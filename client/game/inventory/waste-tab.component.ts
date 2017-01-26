import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'waste-tab',
    templateUrl: 'game/inventory/waste-tab.component.html',
    styleUrls: ['css/main.css']
})

export class WasteTab implements OnInit {
    
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {
    }
}