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
var SaleOrdersTab = (function () {
    function SaleOrdersTab(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.filterCompany = 'All';
        this.filterStatus = 'All';
        this.shipQuantity = [];
        this.shipMechQuality = [];
        this.shipGreenScore = [];
        this.hideDetails = [];
    }
    SaleOrdersTab.prototype.ngOnInit = function () {
        var _this = this;
        this.quantityStepValue = this.ds.gameData.quantityStepValue;
        this.roundQuantityTo = this.ds.gameData.roundQuantityTo;
        this.greenScoreStepValue = this.ds.gameData.greenScoreStepValue;
        this.roundGreenScoreTo = this.ds.gameData.roundGreenScoreTo;
        this.company = this.ds.companyData.company;
        this.part = this.ds.companyData.part;
        this.purchaseCompanies = this.gs.getPurchaseCompanies();
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
        // Get orders from database
        this.ds.socket.emit('negotiations.find', { query: { saleCompany: this.company, offerStatus: 'accepted' }, filter: { _id: 0 }, event: 'saleOrders.found' });
        this.ds.socket.on('saleOrders.found', function (data) {
            _this.saleOrders = data;
            for (var i = 0; i < _this.saleOrders.length; i++) {
                var order = _this.saleOrders[i];
                _this.shipQuantity[i] = order.quantity - order.delivered.quantity - order.shippedQuantity;
                _this.shipMechQuality[i] = order.mechQuality;
                _this.shipGreenScore[i] = order.greenScore;
                _this.hideDetails[i] = true;
            }
        });
        // Listen for new orders
        this.ds.socket.on('saleOrder.new', function (data) {
            _this.saleOrders.push(data);
            _this.shipQuantity.push(data.quantity - data.delivered.quantity - data.shippedQuantity);
            _this.shipMechQuality.push(data.mechQuality);
            _this.shipGreenScore.push(data.greenScore);
            _this.hideDetails.push(true);
        });
        // Listen for updates to orders
        this.ds.socket.on('saleOrder.updated', function (data) {
            var update = data.update;
            var order = _this.saleOrders.find(function (x) { return x.id == data.id; });
            for (var key in update) {
                order[key] = update[key];
            }
        });
    };
    // Ship an order
    SaleOrdersTab.prototype.onShip = function (i) {
        var orderUpdate = {};
        // Create new shipment record
        var newId = new Date().getTime() + this.company;
        var shipment = {
            id: newId,
            round: this.round,
            quantity: this.shipQuantity[i],
            mechQuality: this.shipMechQuality[i],
            greenScore: this.shipGreenScore[i],
            status: ''
        };
        var order = this.saleOrders[i];
        var delivered = order.delivered;
        // If shipment is on time
        if (order.dueRound == this.round) {
            shipment.status = 'delivered';
            delivered.quantity += shipment.quantity;
            if (delivered.quantity == order.quantity) {
                delivered.status = 'Fulfilled';
                delivered.round = this.round;
                // Create new transaction for 'on delivery' payment
                if (this.payOnAccept < 100) {
                    var newId_1 = new Date().getTime() + this.company;
                    var newNote = order.quantity + ' ' + order.part + ' units of Quality ' + order.mechQuality + ' & Green Score ' + order.greenScore + '% at $' + order.price + '/unit';
                    if (this.payOnAccept > 0) {
                        newNote += ' - Partial payment';
                    }
                    var newTransaction = {
                        id: newId_1,
                        fromCompany: order.purchaseCompany,
                        toCompany: this.company,
                        amount: order.quantity * order.price * (100 - this.payOnAccept) / 100,
                        note: newNote,
                        round: this.round,
                        type: 'Order'
                    };
                    // Insert new transaction in database
                    this.ds.socket.emit('transaction.insert', newTransaction);
                }
            }
            else {
                delivered.status = 'Partially fulfilled';
            }
            if (delivered.mechQuality == '-') {
                delivered.mechQuality = [];
            }
            if (delivered.mechQuality.indexOf(shipment.mechQuality) == -1) {
                delivered.mechQuality.push(shipment.mechQuality);
            }
            if (delivered.greenScore == '-') {
                delivered.greenScore = [];
            }
            if (delivered.greenScore.indexOf(shipment.greenScore) == -1) {
                delivered.greenScore.push(shipment.greenScore);
            }
            this.ds.socket.emit('inventory.update', { company: order.purchaseCompany, part: order.part, mechQuality: shipment.mechQuality, greenScore: shipment.greenScore, quantity: +shipment.quantity });
        }
        else {
            shipment.status = 'shipped';
            order.shippedQuantity += shipment.quantity;
        }
        order.shipmentRecord.push(shipment);
        this.gs.updateInventory(order.part, shipment.mechQuality, shipment.greenScore, -shipment.quantity);
        this.ds.socket.emit('negotiation.update', { id: order.id, update: { delivered: order.delivered, shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity }, toCompany: order.purchaseCompany, event: 'purchaseOrder.updated' });
    };
    // Cancel early or late shipment
    SaleOrdersTab.prototype.onCancel = function (i, j) {
        var order = this.saleOrders[i];
        var shipment = order.shipmentRecord[j];
        shipment.status = 'canceled';
        order.shippedQuantity -= shipment.quantity;
        this.gs.updateInventory(order.part, shipment.mechQuality, shipment.greenScore, +shipment.quantity);
        this.ds.socket.emit('negotiation.update', { id: order.id, update: { shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity }, toCompany: order.purchaseCompany, event: 'purchaseOrder.updated' });
    };
    // Filter orders by company
    SaleOrdersTab.prototype.setFilterCompany = function (company) {
        if (this.filterCompany == 'All') {
            return true;
        }
        else {
            return (company == this.filterCompany);
        }
    };
    // Filter orders by status
    SaleOrdersTab.prototype.setFilterStatus = function (status, dueRound) {
        switch (this.filterStatus) {
            case 'All':
                return true;
            case 'Pending':
                return (status != 'Fulfilled' && dueRound >= this.round);
            case 'Overdue':
                return (status != 'Fulfilled' && dueRound < this.round);
            case 'Fulfilled':
                return (status == 'Fulfilled');
        }
    };
    // Show or hide non-essential subrows
    SaleOrdersTab.prototype.toggleDetails = function (i) {
        this.hideDetails[i] = !this.hideDetails[i];
    };
    // Round quantity value
    SaleOrdersTab.prototype.roundQuantity = function (i) {
        this.shipQuantity[i] = Math.round(this.shipQuantity[i] / this.roundQuantityTo) * this.roundQuantityTo;
    };
    // Round green score value
    SaleOrdersTab.prototype.roundGreenScore = function (i) {
        this.shipGreenScore[i] = Math.round(this.shipGreenScore[i] / this.roundGreenScoreTo) * this.roundGreenScoreTo;
    };
    SaleOrdersTab = __decorate([
        core_1.Component({
            selector: 's-orders-tab',
            templateUrl: 'game/sales/s-orders-tab.component.html',
            styleUrls: ['css/main.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, game_service_1.GameService])
    ], SaleOrdersTab);
    return SaleOrdersTab;
}());
exports.SaleOrdersTab = SaleOrdersTab;
//# sourceMappingURL=s-orders-tab.component.js.map