import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/http/auth.interceptor';
import { errorInterceptor } from './app/core/http/error.interceptor';
import { AuthService } from './app/core/auth/auth.service';
import { mockBackendInterceptor } from './app/mock/mock-backend.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    // El backend simulado va al final: recibe la petición ya con el token del usuario, como la recibiría el servidor.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, mockBackendInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.initFromStorage(),
      deps: [AuthService],
      multi: true,
    },
  ]
}).catch((error: unknown) => console.error(error));
