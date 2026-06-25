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

  private readonly API_URL = 'http://localhost:8090/api/admin/usuarios';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private seguridadService: SeguridadService 
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private getHeaders() {
    const token = this.seguridadService.obtenerToken() || '';
    console.log('🔑 Token que Angular intenta enviar:', token ? token.substring(0, 15) + '...' : '¡ESTÁ VACÍO!');
    
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
        console.error('Error de conexión al cargar la tabla:', err);
        // Si hay error en la tabla, mostramos los falsos para que puedas seguir probando
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
    // 🚀 FIX: Aseguramos que el rol viaje siempre en MAYÚSCULAS para que Java lo acepte
    const payloadEnvio = {
      ...this.usuarioActual,
      rol: this.usuarioActual.rol.toUpperCase() 
    };

    if (this.modoEdicion && this.usuarioActual.id) {
      this.http.put<Usuario>(`${this.API_URL}/modificar/${this.usuarioActual.id}`, payloadEnvio, this.getHeaders()).subscribe({
        next: () => { 
          this.cerrarModal(); 
          this.cargarUsuarios(); 
          alert("✅ Usuario modificado con éxito");
        },
        error: (err) => { 
          console.error('Detalle del error PUT:', err);
          // 🚀 ALERTA MÁGICA: Nos mostrará el mensaje exacto que escupe Java
          alert("❌ Error del Servidor Java: " + (err.error?.error || err.message)); 
        }
      });
    } else {
      this.http.post<Usuario>(`${this.API_URL}/crear`, payloadEnvio, this.getHeaders()).subscribe({
        next: () => { 
          this.cerrarModal(); 
          this.cargarUsuarios(); 
          alert("✅ Usuario creado con éxito");
        },
        error: (err) => { 
          console.error('Detalle del error POST:', err);
          // 🚀 ALERTA MÁGICA: Nos mostrará el mensaje exacto que escupe Java
          alert("❌ Error del Servidor Java: " + (err.error?.error || err.message)); 
        }
      });
    }
  }
}