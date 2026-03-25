import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
 
import { ClarityIcons } from '@cds/core/icon';
import { cogIcon } from '@cds/core/icon/shapes/cog.js';
import { provideAnimations } from '@angular/platform-browser/animations';
 
ClarityIcons.addIcons(cogIcon);
 
 
bootstrapApplication(AppComponent, {
  providers: [provideAnimations(), ...appConfig.providers]
}).catch(err => console.error(err));