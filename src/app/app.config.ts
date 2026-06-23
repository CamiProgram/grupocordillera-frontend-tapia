import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/security/auth-interceptor'; // O el nombre exacto que le diste al archivo

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Aquí registramos el interceptor de forma segura sin romper Zone.js
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};