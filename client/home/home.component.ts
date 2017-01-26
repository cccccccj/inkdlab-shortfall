import { Component, OnInit } from '@angular/core';

//import * as io from 'shared/libraries/socket.io.js';
var io = require('shared/libraries/socket.io.js');

@Component({
    selector: 'home-app',
    templateUrl: 'home/home.component.html',
    styleUrls: ['home/home.component.css'],
})

export class HomeComponent implements OnInit { 
    socket: any;
    activeTab: string;
    
    ngOnInit() {
        // Get reference to login socket
        try {
            this.socket = io.connect('http://localhost:8080/home');
        } catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
        
        this.socket.on('redirect', (data) => {
            sessionStorage.setItem('username', data.username);
            let href = data.type === 'Player'? 'game.html': 'admin.html';
            window.location.assign(href);
        });
    }
    
    // Switch tabs
    changeTab(value: string) {
        if(this.activeTab != value) {
            this.activeTab = value;
        }
    }
}