"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var data_service_1 = require("shared/data.service");
var LedgerTab = (function () {
    function LedgerTab(ds) {
        this.ds = ds;
        this.filterCompany = 'All';
        this.filterType = 'All';
        this.balanceChange = new core_1.EventEmitter();
    }
    LedgerTab.prototype.ngOnInit = function () {
        var _this = this;
        this.company = this.ds.companyData.company;
        this.otherCompanies = this.ds.getCompanies();
        // Get transaction data from database
        this.ds.socket.emit('transactions.find', { query: { $or: [{ fromCompany: this.company }, { toCompany: this.company }] }, options: { fields: { _id: 0 }, sort: { id: -1 } }, event: 'transactions.found' });
        this.ds.socket.on('transactions.found', function (data) {
            _this.transactions = data;
        });
        // Listen for new transactions and update balance
        this.ds.socket.on('transaction.new', function (data) {
            _this.transactions.unshift(data);
            if (data.fromCompany == _this.company) {
                _this.balanceChange.emit(-data.amount);
            }
            else {
                _this.balanceChange.emit(+data.amount);
            }
        });
    };
    // Filter transactions by company
    LedgerTab.prototype.setFilterCompany = function (transaction) {
        if (this.filterCompany == 'All') {
            return true;
        }
        else {
            return (transaction.fromCompany == this.filterCompany || transaction.toCompany == this.filterCompany);
        }
    };
    // Filter transactions by type
    LedgerTab.prototype.setFilterType = function (transaction) {
        switch (this.filterType) {
            case 'All':
                return true;
            case 'Sale':
                return (transaction.type == 'Order' && transaction.toCompany == this.company);
            case 'Purchase':
                return (transaction.type == 'Order' && transaction.fromCompany == this.company);
            case 'Production':
                return (transaction.type == 'Production');
            case 'Transfer':
                return (transaction.type == 'Transfer');
        }
    };
    return LedgerTab;
}());
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], LedgerTab.prototype, "balanceChange", void 0);
LedgerTab = __decorate([
    core_1.Component({
        selector: 'ledger-tab',
        templateUrl: 'game/banking/ledger-tab.component.html',
        styleUrls: ['css/main.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService])
], LedgerTab);
exports.LedgerTab = LedgerTab;
//# sourceMappingURL=ledger-tab.component.js.map