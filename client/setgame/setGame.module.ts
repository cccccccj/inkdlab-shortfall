import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { SetGameComponent } from 'setGame/setGame.component';

@NgModule({
    imports: [ BrowserModule, FormsModule ],
    declarations: [
        SetGameComponent
    ],
    bootstrap: [ SetGameComponent ]
})

export class SetGameModule { }