import { Component, OnInit } from '@angular/core';

//import * as io from 'shared/libraries/socket.io.js';
//import * as $ from 'shared/libraries/jquery-2.1.1.min.js';
var io = require('shared/libraries/socket.io.js');
var $ = require('shared/libraries/jquery-2.1.1.min.js');
import 'shared/libraries/jqueryUI/jquery-ui.min.js';
import 'shared/libraries/simone/simone.min.js';
import 'shared/libraries/simone/i18n/simone.min.custom.js';

import { RoundManagerWindow } from 'admin/round-manager/round-manager.component';
import { EventManagerWindow } from 'admin/event-manager/event-manager.component';
import { GameSettingsWindow } from 'admin/game-settings/game-settings.component';
import { ChatWindow } from 'shared/chat/chat.component';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'admin-app',
    templateUrl: 'admin/admin.component.html',
    styleUrls: ['admin/admin.component.css'],
})

export class AdminComponent implements OnInit { 
    socket: any;
    initialized: boolean = false;
    chatCompany: string = 'Public';
    
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        // Get reference to game socket
        try {
            this.ds.socket = io.connect('http://localhost:8080/admin');
        } catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        
        // Taskbar buttons
        $( '#buttons' ).taskbar({
            toggleFullscreen: true,
            systemButtonsOrder: ['minimizeAll', 'toggleFullscreen']
        });

        // Round Manager window 
        $( '#roundWindow' ).window({
            title: 'Round Manager',
            closable: false,
            height: 300,
            width: 500,
            position: {
                my: 'left top',
                at: 'left top'
            }
        });
        
        // Event Manager window 
        $( '#eventWindow' ).window({
            title: 'Event Manager',
            closable: false,
            height: 400,
            width: 500,
            position: {
                my: 'left bottom',
                at: 'left bottom'
            }
        });
        
        // Game Settings window 
        $( '#settingsWindow' ).window({
            title: 'Game Settings',
            closable: false,
            height: 300,
            width: 300,
            position: {
                my: 'right top',
                at: 'right top'
            }
        });
        
        // Chat window
        $( '#chatWindow' ).window({
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
        this.ds.socket.emit('admin.start', username);
        
        this.ds.socket.on('adminData.found', (data) => {
            this.ds.gameData = data.gameData;
            this.ds.userData = data.userData;
            this.ds.eventsData = data.eventsData;
            this.ds.companies = data.companiesData;
                          
    
            this.initialized = true;
        });
        
        this.ds.socket.on('round.changed', () => {
            this.ds.gameData.currentRound++;
//            this.roundChange = true;
//            setTimeout(() => {
//                this.roundChange = false;
//            }, 500);   
        });
    }
    
    // Go to appropriate chat tab when a chat button is clickeds
    goChat(company: string) {
        this.chatCompany = company;
        
        if ($( '#chatWindow' ).window('minimized') == true) {
            $( '#chatWindow' ).window('restore');
        } else {
            $( '#chatWindow' ).window('moveToTop');
        } 
    }
}