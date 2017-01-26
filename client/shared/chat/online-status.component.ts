import { Component, Input } from '@angular/core';

import { DataService } from 'shared/data.service';

@Component({
  selector: 'online-status',
  templateUrl: 'shared/chat/online-status.component.html',
  styleUrls: ['shared/chat/online-status.component.css']
})

export class OnlineStatus {
    @Input() company: string;

    constructor(private ds: DataService) {}
}