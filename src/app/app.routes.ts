import { Routes } from '@angular/router';

// 📌 Importación de Componentes de Autenticación y Operación
import { LoginComponent } from './features/auth/login/login'; 
import { VentaComponent } from './features/caja/venta/venta'; 

// 📌 Importación de Componentes de Administración (Estructura de Panel)
import { DashboardComponent } from './features/admin/dashboard/dashboard'; 
import { EstadisticasComponent } from './features/admin/estadisticas/estadisticas';
import { InventarioComponent } from './features/admin/inventario/inventario';
import { UsuariosComponent } from './features/admin/usuarios/usuarios'; // 🚀 IMPORTACIÓN AÑADIDA

// 📌 Importación del Escudo de Seguridad (Guardián de Roles)
import { roleGuard } from './core/security/role-guard'; 

export const routes: Routes = [
  // Redirección inicial por defecto al Login del sistema
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  // Ruta Pública: Formulario de Acceso Unificado
  { 
    path: 'login', 
    component: LoginComponent 
  },
  
  // Ruta Protegida: Punto de Venta y Operación de Supermercado (Escaneo e Impresión)
  { 
    path: 'caja', 
    component: VentaComponent,
    canActivate: [roleGuard],
    data: { roles: ['Cajero', 'Bodeguero', 'Gerente', 'Admin'] } 
  },

  // Ruta Protegida: Panel Gerencial y de Administración de Sistemas
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['Gerente', 'Admin'] },
    children: [
      // Al ingresar a /dashboard, se fuerza la carga automática del módulo de analíticas
      { 
        path: '', 
        redirectTo: 'estadisticas', 
        pathMatch: 'full' 
      },
      
      // Módulo 1: Vista de Métricas de Venta y Gráficos Financieros
      { 
        path: 'estadisticas', 
        component: EstadisticasComponent 
      },
      
      // Módulo 2: Mantenedor CRUD de Catálogo de Productos y Niveles de Stock
      { 
        path: 'inventario', 
        component: InventarioComponent 
      },
      
      // 🚀 Módulo 3: Mantenedor de Control de Usuarios CONECTADO
      { 
        path: 'usuarios', 
        component: UsuariosComponent 
      },
      
      // Módulos en desarrollo (Estructuras de rutas hijas temporales para evitar redirección forzada)
      { 
        path: 'ventas', 
        children: [] 
      },
      { 
        path: 'testing', 
        children: [] 
      }
    ]
  },

  // Ruta comodín de resguardo: Captura URLs inexistentes y redirige a la raíz de seguridad
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];