import { Component, Input, OnInit } from '@angular/core';

//import * as io from 'shared/libraries/socket.io.js';
var io = require('shared/libraries/socket.io.js');

@Component({
    selector: 'setGame-app',
    templateUrl: 'setGame/setGame.component.html',
    styleUrls: ['../css/main.css'],
})

export class SetGameComponent implements OnInit { 
    socket: any;
    gameName: string = '';
    password1: string = ''; 
    gameType: string = 'Existing';
    passwordError: boolean = false;
	gameNameError: boolean = false;

            
    ngOnInit () {
        
        try {
            this.socket = io.connect('http://localhost:8080/setGame');
        } catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
 
        this.socket.on('setGame.error', (error) => {
        	if (error === 'gameName') {
                this.gameName = '';
                this.gameNameError = true;
                setTimeout(() => {this.passwordError = false}, 2000);
            }
			if (error === 'password') {
                this.password1 = '';
                this.passwordError = true;
                setTimeout(() => {this.passwordError = false}, 2000);
            }
        });
        this.socket.on('redirect', (data) => {
            
            let href = 'admin.html';
            window.location.assign(href);
        });
    }
    
    setGame() {
    	
        	let setGameData = {
            	gameName: this.gameName,
            	password: this.password1,
            	gameType: this.gameType
        	};
        	this.socket.emit('gamesData.setGame', setGameData);

        
    }
}