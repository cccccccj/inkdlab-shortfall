import { Component, Input } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
  selector: 'chat-button',
  templateUrl: 'shared/chat/chat-button.component.html',
  styleUrls: ['shared/chat/chat-button.component.css']
})

export class ChatButton {
    @Input() company: string;
     
    constructor(private ds: DataService) {}
    
    // Chat with company
    onClick() {
        this.ds.onChat(this.company);
    }
}