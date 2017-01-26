import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'game-settings',
    templateUrl: 'admin/game-settings/game-settings.component.html',
    styleUrls: ['admin/game-settings/game-settings.component.css']
})

export class GameSettingsWindow implements OnInit  {
    setMode: boolean;
    totalRoundsOptions: number[] = [4, 8, 12];
    initialBalanceMin: number = 10000;
    initialBalanceStep: number = 1000;
    initialBalanceRoundTo: number = 1000;
    payOnAcceptOptions: number[] = [0, 25, 50, 75, 100];
    
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        this.setMode = this.ds.gameData.currentRound === 0;
    }  
    
    onSave() {
        this.setMode = false;
        
        let setData = {
            totalRounds: this.ds.gameData.totalRounds,
            initialBalance: this.ds.gameData.initialBalance,
            payOnAccept: this.ds.gameData.payOnAccept
        }
        this.ds.socket.emit('settings.change', setData);
    }

    // Round initial balance value
    roundBalance() {
        this.ds.gameData.initialBalance = Math.round(this.ds.gameData.initialBalance/this.initialBalanceRoundTo)*this.initialBalanceRoundTo;
    }
}