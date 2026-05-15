import { Routes } from '@angular/router';
// Quitamos el ".component" del final de la ruta
import { LoginComponent } from './features/auth/login/login'; 
import { VentaComponent } from './features/caja/venta/venta'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'caja', component: VentaComponent }
];