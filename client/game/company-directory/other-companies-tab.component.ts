import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'shared/data.service';

@Component({
    selector: 'other-companies-tab',
    templateUrl: 'game/company-directory/other-companies-tab.component.html',
    styleUrls: ['css/main.css']
})

export class OtherCompaniesTab implements OnInit {
    index: number;
    roundArray: number[] = [];
    roundFilter: string;
    financial: number[];
    green: number[];
	social: number[];
	chartData: any[];
    chartLabels: string[];
    allChartLabels: string[];
        
    constructor(private ds: DataService) {}
    
    ngOnInit() {
        let totalRounds = this.ds.gameData.totalRounds
        for(let i = 0; i < totalRounds; i++) {
            this.roundArray[i] = i + 1;
        }
        
        this.onCompanyChange(0);
        this.onRoundChange('All');
    }
    
    onRoundChange(value){
        this.roundFilter = value;
        
        this.chartLabels = [];
        if (this.roundFilter == 'All') {
            this.chartLabels = this.roundArray.map(String);
            this.chartLabels.push('End');
        } else {
            this.chartLabels.push(this.roundFilter);
            this.chartLabels.push(String(Number(this.roundFilter) + 1));
        }
    }
    
	onCompanyChange(index) {
        this.index = index;
        
        // random number for charts
    	for (var a=[],i=0;i<=13;++i) a[i]=i;
    	for (var b=[],i=0;i<=13;++i) b[i]=i;
    	for (var c=[],i=0;i<=13;++i) c[i]=i;
        function shuffle(array) {
            var tmp, current, top = array.length;
            if(top) while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
            return array;
        }
		a = shuffle(a);
		b = shuffle(b);
		c = shuffle(c);
        
        // random number for charts
        this.financial = a;
        this.green = b;
        this.social = c;
			
        // Plotting data into chart
        this.chartData = [
            {data: this.financial, label: 'Financial'},
            {data: this.green, label: 'Green'},
            {data: this.social, label: 'Social'}
        ];
    }
}