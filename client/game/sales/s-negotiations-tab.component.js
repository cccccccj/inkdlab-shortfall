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
var game_service_1 = require("game/game.service");
var SaleNegotiationsTab = (function () {
    function SaleNegotiationsTab(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.filterCompany = 'All';
        this.filterStatus = 'All';
    }
    SaleNegotiationsTab.prototype.ngOnInit = function () {
        var _this = this;
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        this.greenScoreStepValue = this.ds.gameData.greenScoreStepValue;
        this.roundGreenScoreTo = this.ds.gameData.roundGreenScoreTo;
        this.priceStepValue = this.ds.gameData.priceStepValue;
        this.priceDefaultValue = this.ds.gameData.priceDefaultValue;
        this.roundPriceTo = this.ds.gameData.roundPriceTo;
        this.priceType = typeof this.priceDefaultValue;
        this.company = this.ds.companyData.company;
        this.part = this.ds.companyData.part;
        this.purchaseCompanies = this.gs.getPurchaseCompanies();
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
        // Get offer data for current round from database
        this.ds.socket.emit('negotiations.find', { query: { saleCompany: this.company, offerRound: this.round }, filter: { _id: 0 }, event: 'sales.found' });
        this.ds.socket.on('sales.found', function (data) {
            _this.sales = data;
            if (_this.sales.length == 0) {
                _this.onNewSale();
            }
        });
        // Listen for new offers
        this.ds.socket.on('saleOffer.new', function (offer) {
            _this.sales.push(offer);
        });
        // Listen for updates to offers
        this.ds.socket.on('saleOffer.updated', function (data) {
            _this.updateSale(data);
        });
    };
    // Send new offer
    SaleNegotiationsTab.prototype.onSend = function (i) {
        var sale = this.sales[i];
        sale.saleNote = sale.saleNote.trim();
        sale.offerStatus = 'pending';
        // Insert offer in database
        this.ds.socket.emit('negotiation.insert', { offer: sale, toCompany: sale.purchaseCompany, event: 'purchaseOffer.new' });
    };
    // Rescind an offer
    SaleNegotiationsTab.prototype.onRescind = function (i) {
        var sale = this.sales[i];
        sale.offerStatus = 'rescinded';
        // Update offer in database
        this.ds.socket.emit('negotiation.update', { id: sale.id, update: { offerStatus: sale.offerStatus }, toCompany: sale.purchaseCompany, event: 'purchaseOffer.updated' });
    };
    // Accept an offer
    SaleNegotiationsTab.prototype.onAccept = function (i) {
        var sale = this.sales[i];
        sale.saleNote = sale.saleNote.trim();
        sale.offerStatus = 'accepted';
        sale.dueRound = this.round + 1;
        sale.delivered = {
            status: 'Unfulfilled',
            quantity: 0,
            mechQuality: '-',
            greenScore: '-'
        };
        sale.shipmentRecord = [];
        sale.shippedQuantity = 0;
        // Update offer in database
        this.ds.socket.emit('negotiation.update', { id: sale.id, update: sale, toCompany: sale.purchaseCompany, event: 'purchaseOffer.updated' });
        // Send offer to orders tab
        this.ds.socket.emit('order.new', sale);
        // Create new transaction for 'on accept' payment
        if (this.payOnAccept > 0) {
            var newId = new Date().getTime() + this.company;
            var newNote = sale.quantity + ' ' + sale.part + ' units of Quality ' + sale.mechQuality + ' & Green Score ' + sale.greenScore + '% at $' + sale.price + '/unit';
            if (this.payOnAccept < 100) {
                newNote += ' - Partial payment';
            }
            var newTransaction = {
                id: newId,
                fromCompany: sale.purchaseCompany,
                toCompany: this.company,
                amount: sale.quantity * sale.price * this.payOnAccept / 100,
                note: newNote,
                round: this.round,
                type: 'Order'
            };
            // Insert new transaction in database
            this.ds.socket.emit('transaction.insert', newTransaction);
        }
    };
    // Reject an offer
    SaleNegotiationsTab.prototype.onReject = function (i) {
        var sale = this.sales[i];
        sale.saleNote = sale.saleNote.trim();
        sale.offerStatus = 'rejected';
        // Update offer in database
        this.ds.socket.emit('negotiation.update', { id: sale.id, update: { offerStatus: sale.offerStatus, saleNote: sale.saleNote }, toCompany: sale.purchaseCompany, event: 'purchaseOffer.updated' });
    };
    // Delete unsent offer
    SaleNegotiationsTab.prototype.onDelete = function (i) {
        this.sales.splice(i, 1);
    };
    // Add new offer row
    SaleNegotiationsTab.prototype.onNewSale = function () {
        var newId = new Date().getTime() + this.company;
        var newCompany = this.purchaseCompanies[0];
        var newSale = {
            id: newId,
            part: this.part,
            saleCompany: this.company,
            purchaseCompany: newCompany,
            offerBy: 'sale',
            quantity: this.quantityStepValue,
            price: this.priceStepValue,
            mechQuality: 'A',
            greenScore: this.greenScoreStepValue,
            saleNote: '',
            purchaseNote: '',
            offerStatus: 'unsent',
            offerRound: this.round
        };
        this.sales.push(newSale);
    };
    // Filter offers by company
    SaleNegotiationsTab.prototype.setFilterCompany = function (company) {
        if (this.filterCompany == 'All') {
            return true;
        }
        else {
            return (company == this.filterCompany);
        }
    };
    // Filter offers by status
    SaleNegotiationsTab.prototype.setFilterStatus = function (status) {
        switch (this.filterStatus) {
            case 'All':
                return true;
            case 'Pending':
                return (status == 'unsent' || status == 'pending');
            case 'Accepted':
                return (status == 'accepted');
            case 'Rejected':
                return (status == 'rejected' || status == 'rescinded');
        }
    };
    // Update an offer
    SaleNegotiationsTab.prototype.updateSale = function (data) {
        var id = data.id;
        var update = data.update;
        for (var _i = 0, _a = this.sales; _i < _a.length; _i++) {
            var sale = _a[_i];
            if (sale.id === id) {
                for (var key in update) {
                    sale[key] = update[key];
                }
                break;
            }
        }
    };
    // Round quantity value
    SaleNegotiationsTab.prototype.roundQuantity = function (i) {
        this.sales[i].quantity = Math.round(this.sales[i].quantity / this.roundQuantityTo) * this.roundQuantityTo;
    };
    // Round green score value
    SaleNegotiationsTab.prototype.roundGreenScore = function (i) {
        this.sales[i].greenScore = Math.round(this.sales[i].greenScore / this.roundGreenScoreTo) * this.roundGreenScoreTo;
    };
    // Round price value
    SaleNegotiationsTab.prototype.roundPrice = function (i) {
        this.sales[i].price = Math.round(this.sales[i].price / this.roundPriceTo) * this.roundPriceTo;
    };
    return SaleNegotiationsTab;
}());
SaleNegotiationsTab = __decorate([
    core_1.Component({
        selector: 's-negotiations-tab',
        templateUrl: 'game/sales/s-negotiations-tab.component.html',
        styleUrls: ['css/main.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, game_service_1.GameService])
], SaleNegotiationsTab);
exports.SaleNegotiationsTab = SaleNegotiationsTab;
//# sourceMappingURL=s-negotiations-tab.component.js.map