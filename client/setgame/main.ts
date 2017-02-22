import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SetGameModule } from 'setGame/setGame.module';

platformBrowserDynamic().bootstrapModule(SetGameModule)
    .then(success => console.log(`Bootstrap success`))
    .catch(err => console.error(err));