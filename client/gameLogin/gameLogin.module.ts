import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { gameLoginComponent } from 'gameLogin/gameLogin.component';

@NgModule({
    imports: [ BrowserModule, FormsModule ],
    declarations: [
        gameLoginComponent
    ],
    bootstrap: [ gameLoginComponent ]
})

export class gameLoginModule { }