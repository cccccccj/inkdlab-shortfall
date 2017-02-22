import { Component, Input, OnInit } from '@angular/core';

//import * as io from 'shared/libraries/socket.io.js';
var io = require('shared/libraries/socket.io.js');

@Component({
    selector: 'gameLogin-app',
    templateUrl: 'gameLogin/gameLogin.component.html',
    styleUrls: ['css/main.css'],
})

export class gameLoginComponent implements OnInit { 
    socket: any;
    gameName: string = '';
    password1: string = ''; 
    password2: string = '';
    gameNameError: boolean;
    passwordError: boolean = false;
    name: string;
            
    ngOnInit () {
        
        try {
            this.socket = io.connect('http://localhost:8080/gameLogin');
        } catch (e) {
            alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }
 
        this.socket.on('gameLogin.error', (error) => {
        	if (error === 'gameName') {
                this.gameName = '';
                this.gameNameError = true;
                setTimeout(() => {this.gameNameError = false}, 2000);
            }
			if (error === 'password') {
                this.password1 = '';
                this.passwordError = true;
                setTimeout(() => {this.passwordError = false}, 2000);
            }
        });
        
        this.socket.on('redirect', (data) => {
      
            let href = 'game.html';
            window.location.assign(href);
        });
    }
    
    gameLogin() {
        let gameLoginData = {
            gameName: this.gameName,
            password: this.password1,
        };
        this.socket.emit('gamesData.gameLogin', gameLoginData);
    }
}