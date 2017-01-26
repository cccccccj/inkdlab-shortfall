import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
    selector: 'chat',
    templateUrl: 'shared/chat/chat.component.html',
    styleUrls: ['css/main.css']
})

export class ChatWindow implements OnInit {
    activeTab: string;
    otherCompanies: string[];
    chatCompanies: string[] = [];
    newChat: any = {};
    
    @Input() // Change active tab when a chat button is clicked
    set ActiveTab(company: string) {
        // Create new tab if needed
        if (this.activeTab !== company) {
            this.newTab(company);
        }
    }
    
    @Output() ActiveTabChange = new EventEmitter();
    
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        this.otherCompanies = this.ds.getCompanies();
        
        if (this.ds.userData.type !== 'Admin') {
            this.chatCompanies.push('Admin');
        }
        
        this.ds.socket.on('chat.received', (data) => {
            if (data.toCompany == 'Public') {
                this.newChat['Public'] = data;
            } else {
                let company = data.fromCompany;
                if (this.chatCompanies.indexOf(company) === -1) {
                    this.chatCompanies.push(company);
                } else {
                    this.newChat[company] = data;
                }
            }
        });
    }
    
    // Switch tabs
    changeTab(company: string) {
        if (this.activeTab != company) {
            this.activeTab = company;
            this.ActiveTabChange.emit(this.activeTab);
        }
    }
    
    // Close a private chat tab
    closeTab(company: string) {
        let index = this.chatCompanies.indexOf(company);
        
        if (this.activeTab == company) {
            this.activeTab = this.chatCompanies[index - 1];
            this.ActiveTabChange.emit(this.activeTab);
        }
        
        this.chatCompanies.splice(index, 1);
    }
    
    // Open a new private chat tab if not already open
    newTab(company: string) {
        if (this.chatCompanies.indexOf(company) === -1) {
            this.chatCompanies.push(company);
        } 
        this.activeTab = company;
    }
}