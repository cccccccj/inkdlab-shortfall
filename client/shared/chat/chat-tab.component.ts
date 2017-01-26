import { Component, Input, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
  selector: 'chat-tab',
  templateUrl: 'shared/chat/chat-tab.component.html',
  styleUrls: ['css/main.css']
})

export class ChatTab implements OnInit {
    chats: any = [];
    photo: string;
    company: string;
    username: string;
    message: string = '';
    
    @Input() withCompany: string;
    
    @Input()
    set NewChat(data: any) {
        if (data) {
            this.chats.push(data);
        }
    }
    
//    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        this.photo = this.ds.userData.photo;
         
        if (this.ds.userData.type === 'Admin') {
            this.company = 'Admin';
            this.username = this.ds.userData.username;
        } else {
            this.company = this.ds.companyData.company;
            this.username = this.ds.companyData.username;
        }
                
        // Get chat data from database
        let chatQuery = {};
        if (this.withCompany == 'Public') {
            chatQuery = {toCompany: 'Public'}; 
        } else {
            chatQuery = {$or: [{fromCompany: this.company, toCompany: this.withCompany}, {fromCompany: this.withCompany, toCompany: this.company}]};
        }
        this.ds.socket.emit('chats.find', {query: chatQuery, options: {sort: {_id: 1}, limit: 50, fields: {_id: 0}}, event: this.withCompany + 'chats.found'});

        this.ds.socket.on(this.withCompany + 'chats.found', (chatData) => {
            if (chatData.length) {
                this.chats = chatData;
            }
        });
    }
    
    // Send new chat message
    onEnter() {
        let newMessage = this.message.trim();
        if (newMessage != '') {
            let currentTime = new Date().toISOString();
            let newChat = {
                username: this.username,
                photo: this.photo,
                fromCompany: this.company,
                toCompany: this.withCompany,
                message: newMessage,
                time: currentTime
            };
            this.ds.socket.emit('chat.send', newChat);
            
            this.chats.push(newChat);
            this.message = '';
        }
    }
}