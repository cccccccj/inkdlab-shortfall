import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'company-directory',
    templateUrl: 'game/company-directory/company-directory.component.html',
    styleUrls: ['css/main.css']
})

export class CompanyDirectoryWindow implements OnInit {
    activeTab: string = 'myCompany';
    setMode: boolean;

    @Input() setProfile: boolean;
    @Output() profileSet = new EventEmitter();
    
    ngOnInit() {
        this.setMode = this.setProfile;
    }
    
    // Switch tabs
    changeTab(value: string) {
        if(this.activeTab != value) {
            this.activeTab = value;
        }
    }
    
    // Propagate set event
    onSet() {
        this.setMode = false;
        this.profileSet.emit();
    }
}