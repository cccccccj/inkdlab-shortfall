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
var CompanyDirectoryWindow = (function () {
    function CompanyDirectoryWindow() {
        this.activeTab = 'myCompany';
        this.profileSet = new core_1.EventEmitter();
    }
    CompanyDirectoryWindow.prototype.ngOnInit = function () {
        this.setMode = this.setProfile;
    };
    // Switch tabs
    CompanyDirectoryWindow.prototype.changeTab = function (value) {
        if (this.activeTab != value) {
            this.activeTab = value;
        }
    };
    // Propagate set event
    CompanyDirectoryWindow.prototype.onSet = function () {
        this.setMode = false;
        this.profileSet.emit();
    };
    return CompanyDirectoryWindow;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], CompanyDirectoryWindow.prototype, "setProfile", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], CompanyDirectoryWindow.prototype, "profileSet", void 0);
CompanyDirectoryWindow = __decorate([
    core_1.Component({
        selector: 'company-directory',
        templateUrl: 'game/company-directory/company-directory.component.html',
        styleUrls: ['css/main.css']
    })
], CompanyDirectoryWindow);
exports.CompanyDirectoryWindow = CompanyDirectoryWindow;
//# sourceMappingURL=company-directory.component.js.map