import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'signup',
    templateUrl: 'home/signup.component.html',
    styleUrls: ['home/signup.component.css'],
})

export class SignupComponent implements OnInit { 
    name: string = '';
    email: string = ''; 
    username: string = ''; 
    password1: string = ''; 
    password2: string = '';
    type: string = 'Player';
    emailError: boolean = false;
    usernameError: boolean = false;
    
    @Input() socket: any;
    
    ngOnInit () {
        this.socket.on('signup.error', (errorArray) => {
            if(errorArray.indexOf('email') != -1) {
                this.email = '';
                this.emailError = true;
                setTimeout(() => {this.emailError = false}, 2000);
            }
            if(errorArray.indexOf('username') != -1) {
                this.username = '';
                this.usernameError = true;
                setTimeout(() => {this.usernameError = false}, 2000);
            }
        });
    }
    
    onSignup() {
        let signupData = {
            name: this.name,
            email: this.email,
            username: this.username,
            password: this.password1,
            type: this.type
        };
        this.socket.emit('user.signup', signupData);
    }
}