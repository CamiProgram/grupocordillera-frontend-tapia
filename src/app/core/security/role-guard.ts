import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si hay sesión activa
  if (!authService.tieneToken()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Extraemos el rol del token y lo pasamos a mayúsculas
  const rol = (authService.obtenerRol() || '').toUpperCase();
  
  // 3. Extraemos los roles de la ruta y los forzamos TODOS a mayúsculas para evitar choques
  const permitidosRaw = route.data['roles'] as Array<string>;
  const permitidos = permitidosRaw ? permitidosRaw.map(r => r.toUpperCase()) : [];

  // 4. Si la ruta es pública o el rol hace "match" perfecto, entra.
  if (permitidos.length === 0 || permitidos.includes(rol)) {
    return true;
  }

  // 5. ESCAPE DE EMERGENCIA: Si no tiene permiso, cerramos sesión para romper cualquier bucle
  console.error(`Acceso denegado. Tu rol es: ${rol}, y la ruta exige: ${permitidos}`);
  authService.cerrarSesion();
  router.navigate(['/login']);
  return false;
};