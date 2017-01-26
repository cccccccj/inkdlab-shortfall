import { Component, OnInit } from '@angular/core';

//import * as io from 'shared/libraries/socket.io.js';
//import * as $ from 'shared/libraries/jquery-2.1.1.min.js';
var io = require('shared/libraries/socket.io.js');
var $ = require('shared/libraries/jquery-2.1.1.min.js');

import 'shared/libraries/jqueryUI/jquery-ui.min.js';
import 'shared/libraries/simone/simone.min.js';
import 'shared/libraries/simone/i18n/simone.min.custom.js';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@Component({
    selector: 'shortfall-app',
    templateUrl: 'game/game.component.html',
    styleUrls: ['game/game.component.css'],
})

export class GameComponent implements OnInit { 
    socket: any;
    setProfile: boolean = false;
    initialized: boolean = false;
    chatCompany: string = 'Public';
    windowReset: boolean = false;
    roundChange: boolean = false;
    roundTimer: boolean = false;
    timerMin: number;
    timerSec: number;
    timer: any;
    
    constructor(private ds: DataService, private gs: GameService) {
        // Detect chat button click from any window & go to appropriate chat tab
        ds.chatClicked$.subscribe(company => {
            this.chatCompany = company;

            if ($( '#chatWindow' ).window('minimized') == true) {
                $( '#chatWindow' ).window('restore');
            } else {
                $( '#chatWindow' ).window('moveToTop');
            } 
        });
    }
    
    ngOnInit() {
        // Get reference to game socket
        try {
            this.ds.socket = io.connect('/game');
        } catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        
        // Information Bar
        $( '#infoBar' ).taskbar({
            horizontalStick: 'top left',
            minimizeAll: false
        });
        
        // Taskbar buttons
        $( '#buttons' ).taskbar({
            toggleFullscreen: true,
            systemButtonsOrder: ['minimizeAll', 'toggleFullscreen']
        });
        
        // Current Event window
        $( '#eventWindow' ).window({
            taskbar: '#buttons',
            title: 'Current Event',
            closable: false,
            width: 450,
            height: 300,
            modal: true,
            position: {
                my: 'left bottom',
                at: 'left bottom'
            }
        });
        
        // Company Directory window
        $( '#directoryWindow' ).window({
            taskbar: '#infoBar',
            title: 'Company Directory',
            closable: false,
            width: 680,
            height: 650,
            minimizable: false,
            position: {
                my: 'center center',
                at: 'center center-15%'
            }
        });

        // Banking window
        $( '#bankingWindow' ).window({
            taskbar: '#buttons',
            title: 'Banking',
            closable: false,
            width: 470,
            minWidth: 200,
            height: 250,
            position: {
                my: 'left top',
                at: 'left top'
            }
        });

        // Purchasing window
        $( '#purchaseWindow' ).window({
            taskbar: '#buttons',
            title: 'Purchasing',
            closable: false,
            width: 1080,
            minWidth: 500,
            height: 300,
            position: {
                my: 'left center',
                at: 'left center-15%'
            }
        });

        // Sales window
        $( '#salesWindow' ).window({
            taskbar: '#buttons',
            title: 'Sales',
            closable: false,
            width: 940,
            minWidth: 500,
            height: 300,
            position: {
                my: 'left bottom',
                at: 'left bottom'
            }
        });
        
        // Inventory window
        $( '#inventoryWindow' ).window({
            taskbar: '#buttons',
            title: 'Inventory',
            closable: false,
            width: 940,
            minWidth: 500,
            height: 500,
            position: {
                my: 'right top',
                at: 'right top'
            }
        });

        // Chat window
        $( '#chatWindow' ).window({
            taskbar: '#buttons',
            title: 'Chat',
            closable: false,
            height: 600,
            width: 450,
            position: {
                my: 'right bottom',
                at: 'right bottom'
            }
        });
                
        // Get game and company data from database
        let username = sessionStorage.getItem('username');
        this.ds.socket.emit('game.start', username);
        
        this.ds.socket.on('gameData.found', (data) => {
            this.ds.gameData = data.gameData;
            this.ds.eventsData = data.eventsData;
            this.ds.companies = data.companiesData;
            this.ds.userData = data.userData;
            this.ds.companyData = data.companyData;
            
            // Force player to set company profile at start of game
            if (data.companyData.company === '') {
                this.setProfile = true;
                $( '#directoryWindow' ).window({modal: true});
            } else {   
                this.initialized = true;
                $( '#directoryWindow' ).window({minimizable: true});
                
                if (!this.gs.allEventsResolved('immediate')) {
                    $( '#eventWindow' ).window({
                        minimizable: false
                    });
                    $( '#eventWindow' ).window('restore');
                } 
            }
        });
        
        this.ds.socket.on('round.timer', (minutes) => {
            this.roundTimer = true;
            this.timerMin = minutes;
            this.timerSec = 0;
            
            this.timer = setInterval(() => {
                if (this.timerMin === 0 && this.timerSec === 0) {
                    clearInterval(this.timer);
                    this.roundTimer = false;
                } else if (this.timerSec === 0) {
                    this.timerSec = 59;
                    this.timerMin--;
                } else {
                    this.timerSec--;
                }
            }, 1000);
        });
        
        this.ds.socket.on('round.changed', () => {
            this.roundChange = true;
            if (this.gs.allEventsResolved('endOfRound')) {
                this.nextRound();
            } else {
                $( '#eventWindow' ).window({minimizable: false});
                $( '#eventWindow' ).window('restore');
                
            } 
        });
    }
    
    // Start game once player sets company profile
    startGame() {
        this.initialized = true;
        $( '#directoryWindow' ).window({minimizable: true});
        $( '#directoryWindow' ).window('minimize');
        setTimeout(() => {
            if (!this.gs.allEventsResolved('immediate')) {
                $( '#eventWindow' ).window({
                    minimizable: false,
                    modal: true
                });
            } else {
                $( '#eventWindow' ).window({
                    modal: true
                });
            }
            $( '#eventWindow' ).window('restore');
        }, 1500); 
    }
    
    // Change to next round
    nextRound() {
        this.windowReset = true;
        this.ds.gameData.currentRound++;
        setTimeout(() => {
            this.windowReset = false;
        }, 500); 
    }
    
    // Make events window minimizable after events are resolved
    minimizableEvents() {
        $( '#eventWindow' ).window({minimizable: true});
        
        if (this.roundChange) {
            this.nextRound();
        }
    }
}