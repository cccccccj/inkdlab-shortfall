import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ChartsModule } from 'ng2-charts';

import { GameComponent } from 'game/game.component';

import { CompanyDirectoryWindow } from 'game/company-directory/company-directory.component';
import { CurrentEventWindow } from 'game/current-event/current-event.component';
import { BankingWindow } from 'game/banking/banking.component';
import { SalesWindow } from 'game/sales/sales.component';
import { PurchasingWindow } from 'game/purchasing/purchasing.component';
import { InventoryWindow } from 'game/inventory/inventory.component';
import { ChatWindow } from 'shared/chat/chat.component';

import { MyCompanyTab } from 'game/company-directory/my-company-tab.component';
import { OtherCompaniesTab } from 'game/company-directory/other-companies-tab.component';
import { TransferTab } from 'game/banking/transfer-tab.component';
import { LedgerTab } from 'game/banking/ledger-tab.component';
import { PurchaseNegotiationsTab } from 'game/purchasing/p-negotiations-tab.component';
import { PurchaseOrdersTab } from 'game/purchasing/p-orders-tab.component';
import { SaleNegotiationsTab } from 'game/sales/s-negotiations-tab.component';
import { SaleOrdersTab } from 'game/sales/s-orders-tab.component';
import { ProductionTab } from 'game/inventory/production-tab.component';
import { WasteTab } from 'game/inventory/waste-tab.component';
import { ChatTab } from 'shared/chat/chat-tab.component';

import { ChatButton } from 'shared/chat/chat-button.component';
import { OnlineStatus } from 'shared/chat/online-status.component';

import { DataService } from 'shared/data.service';
import { GameService } from 'game/game.service';

@NgModule({
  imports: [ BrowserModule, FormsModule, ChartsModule ],
  declarations: [ 
      GameComponent,
      CompanyDirectoryWindow, 
      CurrentEventWindow,
      BankingWindow, 
      SalesWindow,
      PurchasingWindow,
      InventoryWindow,
      ChatWindow,
      MyCompanyTab,
      OtherCompaniesTab,
      TransferTab,
      LedgerTab,
      PurchaseNegotiationsTab, 
      PurchaseOrdersTab, 
      SaleNegotiationsTab, 
      SaleOrdersTab,
      ProductionTab,
      WasteTab,
      ChatTab,
      ChatButton,
      OnlineStatus
    ],
  providers: [ DataService, GameService ],
  bootstrap: [ GameComponent ]
})

export class GameModule { }