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
var LoginComponent = (function () {
    function LoginComponent() {
        this.username = '';
        this.password = '';
        this.type = 'Player';
        this.usernameError = false;
        this.passwordError = false;
    }
    LoginComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.socket.on('login.error', function (error) {
            if (error === 'username') {
                _this.username = '';
                _this.usernameError = true;
                setTimeout(function () { _this.usernameError = false; }, 2000);
            }
            if (error === 'password') {
                _this.password = '';
                _this.passwordError = true;
                setTimeout(function () { _this.passwordError = false; }, 2000);
            }
        });
    };
    LoginComponent.prototype.onLogin = function () {
        var loginData = {
            username: this.username,
            password: this.password,
            type: this.type
        };
        this.socket.emit('user.login', loginData);
    };
    return LoginComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], LoginComponent.prototype, "socket", void 0);
LoginComponent = __decorate([
    core_1.Component({
        selector: 'login',
        templateUrl: 'home/login.component.html',
        styleUrls: ['home/login.component.css'],
    })
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map