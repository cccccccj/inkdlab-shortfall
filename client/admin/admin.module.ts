import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AdminComponent } from 'admin/admin.component';

import { RoundManagerWindow } from 'admin/round-manager/round-manager.component';
import { EventManagerWindow } from 'admin/event-manager/event-manager.component';
import { GameSettingsWindow } from 'admin/game-settings/game-settings.component';
import { ChatWindow } from 'shared/chat/chat.component';

import { ChatTab } from 'shared/chat/chat-tab.component';

import { DataService } from 'shared/data.service';

@NgModule({
  imports: [ BrowserModule, FormsModule ],
  declarations: [ 
      AdminComponent,
      RoundManagerWindow,
      EventManagerWindow,
      GameSettingsWindow,
      ChatWindow, 
      ChatTab, 
      OnlineStatus
    ],
  providers: [ DataService ],
  bootstrap: [ AdminComponent ]
})

export class AdminModule { }