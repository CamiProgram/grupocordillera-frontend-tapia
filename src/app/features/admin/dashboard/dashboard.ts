import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/security/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  nombreAdmin: string = 'ADMINISTRADOR';
  sidebarAbierta: boolean = true; // 🚀 Nueva variable de estado

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const rol = this.authService.obtenerRol();
    if (rol) {
      this.nombreAdmin = rol.toUpperCase();
    }
  }

  // 🚀 FUNCIÓN PARA EL BOTÓN HAMBURGUESA
  toggleSidebar(): void {
    this.sidebarAbierta = !this.sidebarAbierta;
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}