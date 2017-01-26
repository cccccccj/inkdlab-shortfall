import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DataService {
    socket: any;
    gameData: any;
    userData: any;
    eventsData: any;
    companyData: any;
    companiesData: any;
    chatStatus: any; 
    
    // Subject & observable for chat button click
    private chatClickedSource = new Subject<string>();
    chatClicked$ = this.chatClickedSource.asObservable();

    // Set data of companies
    set companies(data: any) {
        this.companiesData = data;
        // Sort companies alphabetically
        this.companiesData.sort((a, b) => {
            let al = a.company.toLowerCase();
            let bl = b.company.toLowerCase();
            return (al > bl) ? 1 : ((bl > al) ? -1 : 0);
        });
        // Set chat status of companies
        this.intitiateChatStatus();
    }
        
    // Set initial chat status of other companies and admin and listen for changes
    intitiateChatStatus() {
        this.chatStatus = {};
        
        // Set status of companies
        for (let c of this.companiesData) {
            if(c.player == 'human') {
                this.chatStatus[c.company] = c.online? 'online': 'offline';
            } else {
                this.chatStatus[c.company] = 'computer';
            }
        }
                
        // Update chat status if a company comes online or goes offline
        this.socket.on('company.statusChange', (data) => {
            this.chatStatus[data.company] = data.status;
        });
        
        // Set status of admin
        this.chatStatus['Admin'] = this.gameData.adminOnline? 'online': 'offline';
        
        // Update chat status if admin comes online or goes offline
        this.socket.on('admin.statusChange', (data) => {
            this.chatStatus['Admin'] = data.status;
        });
    }
    
    // Update observable when chat button is clicked
    onChat(company: string) {
        this.chatClickedSource.next(company);   
    }
    
    // Get companies other than player's company as array
    getCompanies() {
        let companies = [];   
        for (let c of this.companiesData) {
            companies.push(c.company);
        }
        return companies;
    }
}