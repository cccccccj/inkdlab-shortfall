import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'round-manager',
    templateUrl: 'admin/round-manager/round-manager.component.html',
    styleUrls: ['../css/main.css']
})

export class RoundManagerWindow implements OnInit  {
    timer: number;
    timerStep: number;
    
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        this.timer = this.ds.gameData.timerDefaultValue;
        this.timerStep = this.ds.gameData.timerStepValue;
    }  
    
    nextRound(minutes: number) {
        this.ds.socket.emit('round.change', minutes);
    }
}