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
var SignupComponent = (function () {
    function SignupComponent() {
        this.name = '';
        this.email = '';
        this.username = '';
        this.password1 = '';
        this.password2 = '';
        this.type = 'Player';
        this.emailError = false;
        this.usernameError = false;
    }
    SignupComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.socket.on('signup.error', function (errorArray) {
            if (errorArray.indexOf('email') != -1) {
                _this.email = '';
                _this.emailError = true;
                setTimeout(function () { _this.emailError = false; }, 2000);
            }
            if (errorArray.indexOf('username') != -1) {
                _this.username = '';
                _this.usernameError = true;
                setTimeout(function () { _this.usernameError = false; }, 2000);
            }
        });
    };
    SignupComponent.prototype.onSignup = function () {
        var signupData = {
            name: this.name,
            email: this.email,
            username: this.username,
            password: this.password1,
            type: this.type
        };
        this.socket.emit('user.signup', signupData);
    };
    return SignupComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], SignupComponent.prototype, "socket", void 0);
SignupComponent = __decorate([
    core_1.Component({
        selector: 'signup',
        templateUrl: 'home/signup.component.html',
        styleUrls: ['home/signup.component.css'],
    })
], SignupComponent);
exports.SignupComponent = SignupComponent;
//# sourceMappingURL=signup.component.js.map