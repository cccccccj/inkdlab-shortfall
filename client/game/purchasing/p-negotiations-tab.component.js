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
var core_1 = require('@angular/core');
var data_service_1 = require('shared/data.service');
var game_service_1 = require('game/game.service');
var PurchaseNegotiationsTab = (function () {
    function PurchaseNegotiationsTab(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.filterPart = 'All';
        this.filterStatus = 'All';
        this.confirming = false;
    }
    PurchaseNegotiationsTab.prototype.ngOnInit = function () {
        var _this = this;
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        this.greenScoreStepValue = this.ds.gameData.greenScoreStepValue;
        this.roundGreenScoreTo = this.ds.gameData.roundGreenScoreTo;
        this.priceStepValue = this.ds.gameData.priceStepValue;
        this.priceDefaultValue = this.ds.gameData.priceDefaultValue;
        this.priceType = typeof this.priceDefaultValue;
        this.roundPriceTo = this.ds.gameData.roundPriceTo;
        this.company = this.ds.companyData.company;
        this.parts = this.gs.getComponentParts();
        this.saleCompanies = this.gs.getSaleCompanies();
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
        // Get offer data for current round from database
        this.ds.socket.emit('negotiations.find', { query: { purchaseCompany: this.company, offerRound: this.round }, filter: { _id: 0 }, event: 'purchases.found' });
        this.ds.socket.on('purchases.found', function (data) {
            _this.purchases = data;
            if (_this.purchases.length == 0) {
                _this.onNewPurchase();
            }
        });
        // Listen for new offers
        this.ds.socket.on('purchaseOffer.new', function (offer) {
            _this.purchases.push(offer);
        });
        // Listen for updates to offers
        this.ds.socket.on('purchaseOffer.updated', function (data) {
            var id = data.id;
            var update = data.update;
            for (var _i = 0, _a = _this.purchases; _i < _a.length; _i++) {
                var purchase = _a[_i];
                if (purchase.id === id) {
                    for (var key in update) {
                        purchase[key] = update[key];
                    }
                    break;
                }
            }
        });
    };
    // Confirm before sending new offer
    PurchaseNegotiationsTab.prototype.onSend = function (i) {
        this.currentOffer = i;
        this.confirming = true;
    };
    PurchaseNegotiationsTab.prototype.onConfirm = function () {
        var purchase = this.purchases[this.currentOffer];
        purchase.purchaseNote = purchase.purchaseNote.trim();
        // Accept new offer
        if (purchase.offerBy == 'sale') {
            purchase.offerStatus = 'accepted';
            purchase.dueRound = this.round + 1;
            purchase.delivered = {
                status: 'Unfulfilled',
                quantity: 0,
                mechQuality: '-',
                greenScore: '-'
            };
            purchase.shipmentRecord = [];
            purchase.shippedQuantity = 0;
            // Update offer in database
            this.ds.socket.emit('negotiation.update', { id: purchase.id, update: purchase, toCompany: purchase.saleCompany, event: 'saleOffer.updated' });
            // Send offer to orders tab
            this.ds.socket.emit('order.new', purchase);
            // Create new transaction for 'on accept' payment
            if (this.payOnAccept > 0) {
                var newId = new Date().getTime() + this.company;
                var newNote = purchase.quantity + ' ' + purchase.part + ' units of Quality ' + purchase.mechQuality + ' & Green Score ' + purchase.greenScore + '% at $' + purchase.price + '/unit';
                if (this.payOnAccept < 100) {
                    newNote += ' - Partial payment';
                }
                var newTransaction = {
                    id: newId,
                    fromCompany: this.company,
                    toCompany: purchase.saleCompany,
                    amount: purchase.quantity * purchase.price * this.payOnAccept / 100,
                    note: newNote,
                    round: this.round,
                    type: 'Order'
                };
                // Insert new transaction in database
                this.ds.socket.emit('transaction.insert', newTransaction);
            }
        }
        else {
            purchase.offerStatus = 'pending';
            // Insert offer in database
            this.ds.socket.emit('negotiation.insert', { offer: purchase, toCompany: purchase.saleCompany, event: 'saleOffer.new' });
        }
        this.confirming = false;
    };
    // Cancel new offer
    PurchaseNegotiationsTab.prototype.onCancel = function () {
        this.confirming = false;
    };
    // Rescind an offer
    PurchaseNegotiationsTab.prototype.onRescind = function (i) {
        var purchase = this.purchases[i];
        purchase.offerStatus = 'rescinded';
        // Update offer in database
        this.ds.socket.emit('negotiation.update', { id: purchase.id, update: { offerStatus: purchase.offerStatus }, toCompany: purchase.saleCompany, event: 'saleOffer.updated' });
    };
    // Confirm before accepting an offer
    PurchaseNegotiationsTab.prototype.onAccept = function (i) {
        this.currentOffer = i;
        this.confirming = true;
    };
    // Reject an offer
    PurchaseNegotiationsTab.prototype.onReject = function (i) {
        var purchase = this.purchases[i];
        purchase.purchaseNote = purchase.purchaseNote.trim();
        purchase.offerStatus = 'rejected';
        // Update offer in database
        this.ds.socket.emit('negotiation.update', { id: purchase.id, update: { offerStatus: purchase.offerStatus, purchaseNote: purchase.purchaseNote }, toCompany: purchase.saleCompany, event: 'saleOffer.updated' });
    };
    // Delete unsent offer
    PurchaseNegotiationsTab.prototype.onDelete = function (i) {
        this.purchases.splice(i, 1);
    };
    // Add new offer row
    PurchaseNegotiationsTab.prototype.onNewPurchase = function () {
        var newId = new Date().getTime() + this.company;
        var newPart = this.parts[0];
        var newPurchase = {
            id: newId,
            part: newPart,
            saleCompany: this.saleCompanies[newPart][0],
            purchaseCompany: this.company,
            offerBy: 'purchase',
            quantity: this.quantityStepValue,
            price: this.priceStepValue,
            mechQuality: 'A',
            greenScore: this.greenScoreStepValue,
            saleNote: '',
            purchaseNote: '',
            offerStatus: 'unsent',
            offerRound: this.round
        };
        this.purchases.push(newPurchase);
    };
    // Filter offers by part
    PurchaseNegotiationsTab.prototype.setFilterPart = function (part) {
        if (this.filterPart == 'All') {
            return true;
        }
        else {
            return (part == this.filterPart);
        }
    };
    // Filter offers by status
    PurchaseNegotiationsTab.prototype.setFilterStatus = function (status) {
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
    // Round quantity value
    PurchaseNegotiationsTab.prototype.roundQuantity = function (i) {
        this.purchases[i].quantity = Math.round(this.purchases[i].quantity / this.roundQuantityTo) * this.roundQuantityTo;
    };
    // Round green score value
    PurchaseNegotiationsTab.prototype.roundGreenScore = function (i) {
        this.purchases[i].greenScore = Math.round(this.purchases[i].greenScore / this.roundGreenScoreTo) * this.roundGreenScoreTo;
    };
    // Round price value
    PurchaseNegotiationsTab.prototype.roundPrice = function (i) {
        this.purchases[i].price = Math.round(this.purchases[i].price / this.roundPriceTo) * this.roundPriceTo;
    };
    // Change sale companies shown when part is changed
    PurchaseNegotiationsTab.prototype.changePart = function (i, part) {
        this.purchases[i].part = part;
        this.purchases[i].saleCompany = this.saleCompanies[part][0];
    };
    PurchaseNegotiationsTab = __decorate([
        core_1.Component({
            selector: 'p-negotiations-tab',
            templateUrl: 'game/purchasing/p-negotiations-tab.component.html',
            styleUrls: ['css/main.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, game_service_1.GameService])
    ], PurchaseNegotiationsTab);
    return PurchaseNegotiationsTab;
}());
exports.PurchaseNegotiationsTab = PurchaseNegotiationsTab;
//# sourceMappingURL=p-negotiations-tab.component.js.map