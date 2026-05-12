import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.tieneToken()) {
    router.navigate(['/login']);
    return false;
  }

  const rol = authService.obtenerRol();
  const permitidos = route.data['roles'] as Array<string>;

  if (permitidos && permitidos.includes(rol!)) return true;

  rol === 'Cajero' || rol === 'Bodeguero' ? router.navigate(['/caja']) : router.navigate(['/dashboard']);
  return false;
};