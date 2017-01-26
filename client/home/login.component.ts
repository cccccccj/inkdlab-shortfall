import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'login',
    templateUrl: 'home/login.component.html',
    styleUrls: ['home/login.component.css'],
})

export class LoginComponent implements OnInit {
    username: string = '';
    password: string = '';
    type: string = 'Player';
    usernameError: boolean = false;
    passwordError: boolean = false;
    
    @Input() socket: any;
    
    ngOnInit() {
        this.socket.on('login.error', (error) => {
            if (error === 'username') {
                this.username = '';
                this.usernameError = true;
                setTimeout(() => {this.usernameError = false}, 2000);
            }
            if (error === 'password') {
                this.password = '';
                this.passwordError = true;
                setTimeout(() => {this.passwordError = false}, 2000);
            }
        });
    }
    
    onLogin() {
        let loginData = {
            username: this.username,
            password: this.password,
            type: this.type
        }
        this.socket.emit('user.login', loginData);
    }
}