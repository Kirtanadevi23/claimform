import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { ClarityIcons } from '@cds/core/icon';
import { cogIcon } from '@cds/core/icon/shapes/cog.js'; 

ClarityIcons.addIcons(cogIcon);
 
 
bootstrapApplication(AppComponent, {
  providers: [...appConfig.providers, provideHttpClient()]
}).catch(err => console.error(err));