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
var PurchaseOrdersTab = (function () {
    function PurchaseOrdersTab(ds, gs) {
        this.ds = ds;
        this.gs = gs;
        this.filterPart = 'All';
        this.filterStatus = 'All';
        this.hideDetails = [];
    }
    PurchaseOrdersTab.prototype.ngOnInit = function () {
        var _this = this;
        this.company = this.ds.companyData.company;
        this.parts = this.gs.getComponentParts();
        this.round = this.ds.gameData.currentRound;
        this.payOnAccept = this.ds.gameData.payOnAccept;
        // Get orders from database
        this.ds.socket.emit('negotiations.find', { query: { purchaseCompany: this.company, offerStatus: 'accepted' }, filter: { _id: 0 }, event: 'purchaseOrders.found' });
        this.ds.socket.on('purchaseOrders.found', function (data) {
            _this.purchaseOrders = data;
            for (var i = 0; i < _this.purchaseOrders.length; i++) {
                _this.hideDetails[i] = true;
                var order = _this.purchaseOrders[i];
                var shipmentRecord = order.shipmentRecord;
                for (var j = 0; j < shipmentRecord.length; j++) {
                    if (shipmentRecord[j].status == 'shipped' && order.dueRound == _this.round) {
                        _this.onAccept(i, j);
                    }
                }
            }
            //******** AUTOMATICALLY ACCEPT PENDING EARLY SHIPMENTS IF THEY ARE DUE THIS ROUND ****
        });
        // Listen for new orders
        this.ds.socket.on('purchaseOrder.new', function (data) {
            _this.purchaseOrders.push(data);
            _this.hideDetails.push(true);
        });
        // Listen for updates to orders
        this.ds.socket.on('purchaseOrder.updated', function (data) {
            var update = data.update;
            var order = _this.purchaseOrders.find(function (x) { return x.id == data.id; });
            for (var key in update) {
                order[key] = update[key];
            }
        });
    };
    // Accept an early or late shipment
    PurchaseOrdersTab.prototype.onAccept = function (i, j) {
        var order = this.purchaseOrders[i];
        var delivered = order.delivered;
        var shipment = order.shipmentRecord[j];
        shipment.status = 'accepted';
        delivered.quantity += shipment.quantity;
        order.shippedQuantity -= shipment.quantity;
        if (delivered.quantity == order.quantity) {
            delivered.status = 'Fulfilled';
            delivered.round = this.round;
            // Create new transaction for 'on delivery' payment
            if (this.payOnAccept < 100) {
                var newId = new Date().getTime() + this.company;
                var newNote = order.quantity + ' ' + order.part + ' units of Quality ' + order.mechQuality + ' & Green Score ' + order.greenScore + '% at $' + order.price + '/unit';
                if (this.payOnAccept > 0) {
                    newNote += ' - Partial payment';
                }
                var newTransaction = {
                    id: newId,
                    fromCompany: this.company,
                    toCompany: order.saleCompany,
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
        this.gs.updateInventory(order.part, shipment.mechQuality, shipment.greenScore, +shipment.quantity);
        this.ds.socket.emit('negotiation.update', { id: order.id, update: { delivered: order.delivered, shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity }, toCompany: order.saleCompany, event: 'saleOrder.updated', shipmentIndex: j });
    };
    // Refuse an early or late shipment
    PurchaseOrdersTab.prototype.onRefuse = function (i, j) {
        var order = this.purchaseOrders[i];
        var shipment = order.shipmentRecord[j];
        shipment.status = 'refused';
        order.shippedQuantity -= shipment.quantity;
        this.ds.socket.emit('inventory.update', { company: order.saleCompany, part: order.part, mechQuality: shipment.mechQuality, greenScore: shipment.greenScore, quantity: +shipment.quantity });
        this.ds.socket.emit('negotiation.update', { id: order.id, update: { shipmentRecord: order.shipmentRecord, shippedQuantity: order.shippedQuantity }, toCompany: order.saleCompany, event: 'saleOrder.updated' });
    };
    // Filter orders by part
    PurchaseOrdersTab.prototype.setFilterPart = function (part) {
        if (this.filterPart == 'All') {
            return true;
        }
        else {
            return (part == this.filterPart);
        }
    };
    // Filter orders by status
    PurchaseOrdersTab.prototype.setFilterStatus = function (status, dueRound) {
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
    PurchaseOrdersTab.prototype.toggleDetails = function (i) {
        this.hideDetails[i] = !this.hideDetails[i];
    };
    return PurchaseOrdersTab;
}());
PurchaseOrdersTab = __decorate([
    core_1.Component({
        selector: 'p-orders-tab',
        templateUrl: 'game/purchasing/p-orders-tab.component.html',
        styleUrls: ['css/main.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, game_service_1.GameService])
], PurchaseOrdersTab);
exports.PurchaseOrdersTab = PurchaseOrdersTab;
//# sourceMappingURL=p-orders-tab.component.js.map