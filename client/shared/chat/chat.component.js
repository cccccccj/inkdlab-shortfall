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
var ChatWindow = (function () {
    function ChatWindow(ds) {
        this.ds = ds;
        this.chatCompanies = [];
        this.newChat = {};
        this.ActiveTabChange = new core_1.EventEmitter();
    }
    Object.defineProperty(ChatWindow.prototype, "ActiveTab", {
        set: function (company) {
            // Create new tab if needed
            if (this.activeTab !== company) {
                this.newTab(company);
            }
        },
        enumerable: true,
        configurable: true
    });
    ChatWindow.prototype.ngOnInit = function () {
        var _this = this;
        this.otherCompanies = this.ds.getCompanies();
        if (this.ds.userData.type !== 'Admin') {
            this.chatCompanies.push('Admin');
        }
        this.ds.socket.on('chat.received', function (data) {
            if (data.toCompany == 'Public') {
                _this.newChat['Public'] = data;
            }
            else {
                var company = data.fromCompany;
                if (_this.chatCompanies.indexOf(company) === -1) {
                    _this.chatCompanies.push(company);
                }
                else {
                    _this.newChat[company] = data;
                }
            }
        });
    };
    // Switch tabs
    ChatWindow.prototype.changeTab = function (company) {
        if (this.activeTab != company) {
            this.activeTab = company;
            this.ActiveTabChange.emit(this.activeTab);
        }
    };
    // Close a private chat tab
    ChatWindow.prototype.closeTab = function (company) {
        var index = this.chatCompanies.indexOf(company);
        if (this.activeTab == company) {
            this.activeTab = this.chatCompanies[index - 1];
            this.ActiveTabChange.emit(this.activeTab);
        }
        this.chatCompanies.splice(index, 1);
    };
    // Open a new private chat tab if not already open
    ChatWindow.prototype.newTab = function (company) {
        if (this.chatCompanies.indexOf(company) === -1) {
            this.chatCompanies.push(company);
        }
        this.activeTab = company;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], ChatWindow.prototype, "ActiveTab", null);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ChatWindow.prototype, "ActiveTabChange", void 0);
    ChatWindow = __decorate([
        core_1.Component({
            selector: 'chat',
            templateUrl: 'shared/chat/chat.component.html',
            styleUrls: ['css/main.css']
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], ChatWindow);
    return ChatWindow;
}());
exports.ChatWindow = ChatWindow;
//# sourceMappingURL=chat.component.js.map