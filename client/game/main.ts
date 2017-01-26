import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { GameModule } from 'game/game.module';

platformBrowserDynamic().bootstrapModule(GameModule)
    .then(success => console.log(`Bootstrap success`))
    .catch(err => console.error(err));