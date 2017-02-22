import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { gameLoginModule } from 'gameLogin/gameLogin.module';

platformBrowserDynamic().bootstrapModule(gameLoginModule)
    .then(success => console.log(`Bootstrap success`))
    .catch(err => console.error(err));