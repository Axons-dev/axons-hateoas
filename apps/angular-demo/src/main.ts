import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { appConfigProviders } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    ...appConfigProviders,
  ],
}).catch((error) => console.error(error));
