import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService as SeguridadService } from '../../../core/security/auth';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol: string;
  password?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando: boolean = false;
  
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  usuarioActual: Usuario = this.nuevoUsuarioVacio();

  rolesDisponibles: string[] = ['Cajero', 'Bodeguero', 'Gerente', 'ADMIN'];

  // 🚀 ACTUALIZADO: Puerto 8090 donde el API Gateway está realmente escuchando
  private readonly API_URL = 'http://localhost:8090/api/admin/usuarios';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private seguridadService: SeguridadService 
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Prepara el Token exigido por el Controlador Java
  private getHeaders() {
    const token = this.seguridadService.obtenerToken() || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.cdr.detectChanges(); 

    this.http.get<Usuario[]>(this.API_URL, this.getHeaders()).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.usuarios = data;
        } else {
          this.cargarDatosMock(); 
        }
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error de conexión real, cargando maqueta:', err);
        this.cargarDatosMock();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDatosMock(): void {
    this.usuarios = [
      { id: 1, nombre: 'Camilo Tapia', email: 'camilotapia282@gmail.com', rol: 'ADMIN' },
      { id: 2, nombre: 'Juan Pérez', email: 'juan@grupocordillera.cl', rol: 'Cajero' }
    ];
  }

  nuevoUsuarioVacio(): Usuario {
    return { nombre: '', email: '', rol: 'Cajero', password: '' };
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.usuarioActual = this.nuevoUsuarioVacio();
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioActual = { ...usuario, password: '' }; 
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  guardarUsuario(): void {
    if (this.modoEdicion && this.usuarioActual.id) {
      this.http.put<Usuario>(`${this.API_URL}/modificar/${this.usuarioActual.id}`, this.usuarioActual, this.getHeaders()).subscribe({
        next: () => { this.cerrarModal(); this.cargarUsuarios(); },
        error: (err) => { console.error('Error al modificar', err); this.cerrarModal(); this.cargarUsuarios(); }
      });
    } else {
      this.http.post<Usuario>(`${this.API_URL}/crear`, this.usuarioActual, this.getHeaders()).subscribe({
        next: () => { this.cerrarModal(); this.cargarUsuarios(); },
        error: (err) => { console.error('Error al crear', err); this.cerrarModal(); this.cargarUsuarios(); }
      });
    }
  }
}