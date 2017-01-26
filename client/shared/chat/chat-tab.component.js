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
var ChatTab = (function () {
    //    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    function ChatTab(ds) {
        this.ds = ds;
        this.chats = [];
        this.message = '';
    }
    Object.defineProperty(ChatTab.prototype, "NewChat", {
        set: function (data) {
            if (data) {
                this.chats.push(data);
            }
        },
        enumerable: true,
        configurable: true
    });
    ChatTab.prototype.ngOnInit = function () {
        var _this = this;
        this.photo = this.ds.userData.photo;
        if (this.ds.userData.type === 'Admin') {
            this.company = 'Admin';
            this.username = this.ds.userData.username;
        }
        else {
            this.company = this.ds.companyData.company;
            this.username = this.ds.companyData.username;
        }
        // Get chat data from database
        var chatQuery = {};
        if (this.withCompany == 'Public') {
            chatQuery = { toCompany: 'Public' };
        }
        else {
            chatQuery = { $or: [{ fromCompany: this.company, toCompany: this.withCompany }, { fromCompany: this.withCompany, toCompany: this.company }] };
        }
        this.ds.socket.emit('chats.find', { query: chatQuery, options: { sort: { _id: 1 }, limit: 50, fields: { _id: 0 } }, event: this.withCompany + 'chats.found' });
        this.ds.socket.on(this.withCompany + 'chats.found', function (chatData) {
            if (chatData.length) {
                _this.chats = chatData;
            }
        });
    };
    // Send new chat message
    ChatTab.prototype.onEnter = function () {
        var newMessage = this.message.trim();
        if (newMessage != '') {
            var currentTime = new Date().toISOString();
            var newChat = {
                username: this.username,
                photo: this.photo,
                fromCompany: this.company,
                toCompany: this.withCompany,
                message: newMessage,
                time: currentTime
            };
            this.ds.socket.emit('chat.send', newChat);
            this.chats.push(newChat);
            this.message = '';
        }
    };
    return ChatTab;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ChatTab.prototype, "withCompany", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], ChatTab.prototype, "NewChat", null);
ChatTab = __decorate([
    core_1.Component({
        selector: 'chat-tab',
        templateUrl: 'shared/chat/chat-tab.component.html',
        styleUrls: ['css/main.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService])
], ChatTab);
exports.ChatTab = ChatTab;
//# sourceMappingURL=chat-tab.component.js.map