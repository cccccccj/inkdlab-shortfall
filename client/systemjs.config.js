/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    System.config({
        paths: {
            // paths serve as alias
            'npm:': 'node-modules/'
        },
        // map tells the System loader where to look for things
        map: {
            'home':                       'home',
            'game':                       'game',
            'admin':                      'admin',
            'shared':                     'shared',
            'setGame':                     'setGame',
            'gameLogin':                     'gameLogin',

            // angular bundles
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
            '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
            '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
            '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
            
            // other libraries
            'rxjs':                      'npm:rxjs',
            'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
            'ng2-charts':                 'npm:ng2-charts',
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            home: {
                main: './main.js',
                defaultExtension: 'js'
            },
            game: {
                main: './main.js',
                defaultExtension: 'js'
            },
            admin: {
                main: './main.js',
                defaultExtension: 'js'
            },
            shared: {
                main: './main.js',
                defaultExtension: 'js'
            },
            setGame: {
                main: './main.js',
                defaultExtension: 'js'
            },
            gameLogin: {
                main: './main.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: 'js'
            },
            'ng2-charts': {
                main: 'ng2-charts.js',
                defaultExtension: 'js'
            }
        }
    });
})(this);