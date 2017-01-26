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
var ng2_charts_1 = require("ng2-charts");
var game_component_1 = require("game/game.component");
var company_directory_component_1 = require("game/company-directory/company-directory.component");
var current_event_component_1 = require("game/current-event/current-event.component");
var banking_component_1 = require("game/banking/banking.component");
var sales_component_1 = require("game/sales/sales.component");
var purchasing_component_1 = require("game/purchasing/purchasing.component");
var inventory_component_1 = require("game/inventory/inventory.component");
var chat_component_1 = require("shared/chat/chat.component");
var my_company_tab_component_1 = require("game/company-directory/my-company-tab.component");
var other_companies_tab_component_1 = require("game/company-directory/other-companies-tab.component");
var transfer_tab_component_1 = require("game/banking/transfer-tab.component");
var ledger_tab_component_1 = require("game/banking/ledger-tab.component");
var p_negotiations_tab_component_1 = require("game/purchasing/p-negotiations-tab.component");
var p_orders_tab_component_1 = require("game/purchasing/p-orders-tab.component");
var s_negotiations_tab_component_1 = require("game/sales/s-negotiations-tab.component");
var s_orders_tab_component_1 = require("game/sales/s-orders-tab.component");
var production_tab_component_1 = require("game/inventory/production-tab.component");
var waste_tab_component_1 = require("game/inventory/waste-tab.component");
var chat_tab_component_1 = require("shared/chat/chat-tab.component");
var chat_button_component_1 = require("shared/chat/chat-button.component");
var online_status_component_1 = require("shared/chat/online-status.component");
var data_service_1 = require("shared/data.service");
var game_service_1 = require("game/game.service");
var GameModule = (function () {
    function GameModule() {
    }
    return GameModule;
}());
GameModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, ng2_charts_1.ChartsModule],
        declarations: [
            game_component_1.GameComponent,
            company_directory_component_1.CompanyDirectoryWindow,
            current_event_component_1.CurrentEventWindow,
            banking_component_1.BankingWindow,
            sales_component_1.SalesWindow,
            purchasing_component_1.PurchasingWindow,
            inventory_component_1.InventoryWindow,
            chat_component_1.ChatWindow,
            my_company_tab_component_1.MyCompanyTab,
            other_companies_tab_component_1.OtherCompaniesTab,
            transfer_tab_component_1.TransferTab,
            ledger_tab_component_1.LedgerTab,
            p_negotiations_tab_component_1.PurchaseNegotiationsTab,
            p_orders_tab_component_1.PurchaseOrdersTab,
            s_negotiations_tab_component_1.SaleNegotiationsTab,
            s_orders_tab_component_1.SaleOrdersTab,
            production_tab_component_1.ProductionTab,
            waste_tab_component_1.WasteTab,
            chat_tab_component_1.ChatTab,
            chat_button_component_1.ChatButton,
            online_status_component_1.OnlineStatus
        ],
        providers: [data_service_1.DataService, game_service_1.GameService],
        bootstrap: [game_component_1.GameComponent]
    })
], GameModule);
exports.GameModule = GameModule;
//# sourceMappingURL=game.module.js.map