import { Routes } from '@angular/router';

// Importación de Componentes
import { LoginComponent } from './features/auth/login/login'; 
import { VentaComponent } from './features/caja/venta/venta'; 
import { Dashboard } from './features/admin/dashboard/dashboard'; // Asegúrate de que el nombre coincida con tu exportación

// Importación del Escudo de Seguridad
import { roleGuard } from './core/security/role-guard'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Ruta Pública
  { 
    path: 'login', 
    component: LoginComponent 
  },
  
  // Ruta Protegida: Operación de Supermercado
  { 
    path: 'caja', 
    component: VentaComponent,
    canActivate: [roleGuard],
    data: { roles: ['Cajero', 'Bodeguero', 'Gerente', 'Admin'] } // Todos los roles operativos y superiores
  },

  // Ruta Protegida: Panel Gerencial
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [roleGuard],
    data: { roles: ['Gerente', 'Admin'] } // Acceso estricto solo para jefaturas
  },

  // Ruta comodín (Si escriben una URL que no existe, los manda al login)
  { path: '**', redirectTo: 'login' }
];