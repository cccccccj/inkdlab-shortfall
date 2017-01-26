"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var admin_component_1 = require("admin/admin.component");
var round_manager_component_1 = require("admin/round-manager/round-manager.component");
var event_manager_component_1 = require("admin/event-manager/event-manager.component");
var game_settings_component_1 = require("admin/game-settings/game-settings.component");
var chat_component_1 = require("shared/chat/chat.component");
var chat_tab_component_1 = require("shared/chat/chat-tab.component");
var chat_button_component_1 = require("shared/chat/chat-button.component");
var online_status_component_1 = require("shared/chat/online-status.component");
var data_service_1 = require("shared/data.service");
var AdminModule = (function () {
    function AdminModule() {
    }
    return AdminModule;
}());
AdminModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, forms_1.FormsModule],
        declarations: [
            admin_component_1.AdminComponent,
            round_manager_component_1.RoundManagerWindow,
            event_manager_component_1.EventManagerWindow,
            game_settings_component_1.GameSettingsWindow,
            chat_component_1.ChatWindow,
            chat_tab_component_1.ChatTab,
            chat_button_component_1.ChatButton,
            online_status_component_1.OnlineStatus
        ],
        providers: [data_service_1.DataService],
        bootstrap: [admin_component_1.AdminComponent]
    })
], AdminModule);
exports.AdminModule = AdminModule;
//# sourceMappingURL=admin.module.js.map