import { Component, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { AdminService } from 'admin/admin.service';

@Component({
    selector: 'event-manager',
    templateUrl: 'admin/event-manager/event-manager.component.html',
    styleUrls: ['admin/event-manager/event-manager.component.css']
})

export class EventManagerWindow implements OnInit  {
    roundArray: number[] = [];
    selectedId: string = 'event1';
    adding: boolean[] = [];

    constructor(private ds: DataService) {}
    
    ngOnInit() {
        let totalRounds = this.ds.gameData.totalRounds
        for(let i = 0; i < totalRounds; i++) {
            this.roundArray[i] = i + 1;
            this.adding[i+1] = false;
        }
        
        if (!this.ds.gameData.events) {
            this.ds.gameData.events = {};
            this.setRandomEvents(1);
        }
    }  

    setRandomEvents(fromRound: number = this.ds.gameData.currentRound + 1) {
        let totalRounds: number = this.ds.gameData.totalRounds;
        let totalEvents: number = Object.keys(this.ds.eventsData).length;
        let takenEvents: string[] = [];

        for (let i = fromRound; i <= totalRounds; i++) {
            this.ds.gameData.events['round'+i] = [];
            let eventId: string;
            do {
                eventId = 'event' + Math.floor(Math.random() * totalEvents + 1);
                } while (takenEvents.indexOf(eventId) !== -1);
            takenEvents.push(eventId);

            this.ds.gameData.events['round'+i].push(eventId);
        }
        
        this.ds.socket.emit('events.update', this.ds.gameData.events);
    }
    
    otherEvents(round: number) {
        let roundEvents = this.ds.gameData.events['round'+round];
        let events = [];
        
        for (let id in this.ds.eventsData) {
            if (roundEvents.indexOf(id) === -1) {
                events.push(id);
            }
        }

        return events;
    }
    
    onDelete(eventId: string, round: number) {
        let index = this.ds.gameData.events['round'+round].indexOf(eventId);
        this.ds.gameData.events['round'+round].splice(index, 1);
        
        this.ds.socket.emit('events.update', this.ds.gameData.events);
    }
    
    onAdd(eventId: string, round: number) {
        this.ds.gameData.events['round'+round].push(eventId);
        this.adding[round] = false;
        
        this.ds.socket.emit('events.update', this.ds.gameData.events);
    }
    
    onSelect(eventId: string) {
        this.selectedId = eventId;
    }
}