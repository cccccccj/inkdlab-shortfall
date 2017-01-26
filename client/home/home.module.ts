import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from 'home/home.component';

import { LoginComponent } from 'home/login.component';
import { SignupComponent } from 'home/signup.component';

@NgModule({
    imports: [ BrowserModule, FormsModule ],
    declarations: [
        HomeComponent,
        LoginComponent,
        SignupComponent
    ],
    bootstrap: [ HomeComponent ]
})

export class HomeModule { }