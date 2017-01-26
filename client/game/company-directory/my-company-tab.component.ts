import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'my-company-tab',
    templateUrl: 'game/company-directory/my-company-tab.component.html',
    styleUrls: ['css/main.css']
})

export class MyCompanyTab implements OnInit {
    companyData: any;
    part: string;
    company: string;
    companyTaken: boolean;
    mission: string;
    financial: number;
    green: number;
    social: number;
    presets: any;
    defaultIndex: number;
    chartLabels: string[] = ['Financial','Green','Social'];
    
    @Input() setMode: boolean;
    @Output() profileSet = new EventEmitter();
    
    constructor(private ds: DataService, private gs: GameService) {}
    
    ngOnInit() {        
        this.companyData = this.ds.companyData;
        this.part = this.companyData.part;
        
        // Set default goals in set mode
        if (this.setMode) {
            this.presets = this.ds.gameData.profilePresets;
            this.defaultIndex = this.presets.findIndex(x => x.name === 'Custom');
            this.changePreset(this.defaultIndex);
        } else { // Get company data for display mode
            this.company = this.companyData.company;
            this.mission = this.companyData.mission;
            this.financial = this.companyData.financial;
            this.green = this.companyData.green;
            this.social = this.companyData.social;
        }
    }	
    
    // Constrain goal sliders to add up to 100%
    constrainGoals(changedGoal: string, stringValue: string) {
        let newValue = Number(stringValue);
        let sum, offset;

        switch(changedGoal) {
            case 'financial':
                sum = newValue + this.green + this.social;
                offset = sum - 100;

                this.financial = newValue;
                this.green -= offset;
                break;
            case 'green':
                sum = newValue + this.financial + this.social;
                offset = sum - 100;

                this.green = newValue;
                this.social -= offset;
                break;
            case 'social':
                sum = newValue + this.financial + this.green;
                offset = sum - 100;

                this.social = newValue;
                this.financial -= offset;
                break;
        }
    }
    
    // Change goal sliders to profile presets
    changePreset(i: number) {
        let preset = this.presets[i];
        this.financial = preset.financial;
        this.green = preset.green;
        this.social = preset.social;
    }
    
    invalidInput() {
        return this.company == undefined || this.company.trim() == '';
    }
    
    // Submit profile
    onSubmit() {
        // Save company data in database
        this.companyData.company = this.company;
        this.companyData.mission = this.mission;
        this.companyData.financial = this.financial;
        this.companyData.green = this.green;
        this.companyData.social = this.social;
        this.companyData.balance = this.ds.gameData.initialBalance;
        this.companyData.eventResolves = {};
        this.gs.createInventory();

        this.ds.socket.emit('company.set', this.companyData);
        
        // Go to display mode and start game 
        this.ds.socket.on('company.confirm', () => {
                this.setMode = false;
                this.ds.companyData = this.companyData;
                this.profileSet.emit();
        });
        
        // Display error message
        this.ds.socket.on('company.error', () => {
            this.company = '';
            this.companyTaken = true;
            setTimeout(() => {this.companyTaken = false}, 2000);
        });
    }
}