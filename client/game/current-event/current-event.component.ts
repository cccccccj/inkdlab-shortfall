import { Component, Output, EventEmitter, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'current-event',
    templateUrl: 'game/current-event/current-event.component.html',
    styleUrls: ['css/main.css']
})

export class CurrentEventWindow implements OnInit  {
    round: number;
    events: any;
    
    @Output() eventsResolved = new EventEmitter();
    
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {
        this.round = this.ds.gameData.currentRound;
        
        if (this.ds.gameData.events) {
            this.events = this.ds.gameData.events['round' + this.round];
        }
        
        if (this.gs.allEventsResolved('immediate')) {
            this.eventsResolved.emit();
        }
    }   
    
    onSelect(eventId: string, selectedOption: string) {      
        let key = 'round' + this.round + eventId;
        this.ds.companyData.eventResolves[key] = selectedOption;
        
        this.ds.socket.emit('company.update', {query: {company: this.ds.companyData.company}, update: {$set: {eventResolves: this.ds.companyData.eventResolves}}});
        
        let resolveType = this.ds.eventsData[eventId].resolveType;
        if (this.gs.allEventsResolved(resolveType)) {
            this.eventsResolved.emit();
        }
    }
}