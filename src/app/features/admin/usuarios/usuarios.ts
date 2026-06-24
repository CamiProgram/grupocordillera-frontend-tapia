import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  rol: string;
  password?: string;
  fechaCreacion?: string;
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

  rolesDisponibles: string[] = ['Cajero', 'Bodeguero', 'Gerente', 'Admin'];

  private readonly API_URL = 'http://localhost:8090/api/usuarios';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.cdr.detectChanges(); 

    this.http.get<Usuario[]>(this.API_URL).subscribe({
      next: (data) => {
        // 🚀 MAGIA AQUÍ: Si el backend responde pero no hay usuarios, mostramos la maqueta
        if (data && data.length > 0) {
          this.usuarios = data;
        } else {
          console.warn('La base de datos respondió, pero está vacía. Cargando maqueta visual...');
          this.cargarDatosMock();
        }
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error de conexión. Cargando maqueta visual...', err);
        this.cargarDatosMock();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Función para inyectar los datos de prueba y ver los colores
  cargarDatosMock(): void {
    this.usuarios = [
      { id: 1, nombre: 'Camilo Tapia', correo: 'camilotapia282@gmail.com', rol: 'Admin', fechaCreacion: '2026-01-15' },
      { id: 2, nombre: 'Juan Pérez', correo: 'juan.perez@grupocordillera.cl', rol: 'Cajero', fechaCreacion: '2026-03-22' },
      { id: 3, nombre: 'María González', correo: 'm.gonzalez@grupocordillera.cl', rol: 'Bodeguero', fechaCreacion: '2026-05-10' },
      { id: 4, nombre: 'Roberto Soto', correo: 'r.soto@grupocordillera.cl', rol: 'Gerente', fechaCreacion: '2026-06-01' }
    ];
  }

  nuevoUsuarioVacio(): Usuario {
    return { nombre: '', correo: '', rol: 'Cajero', password: '' };
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
      this.http.put<Usuario>(`${this.API_URL}/${this.usuarioActual.id}`, this.usuarioActual).subscribe({
        next: () => { this.cerrarModal(); this.cargarUsuarios(); },
        error: () => { this.cerrarModal(); this.cargarUsuarios(); }
      });
    } else {
      this.http.post<Usuario>(this.API_URL, this.usuarioActual).subscribe({
        next: () => { this.cerrarModal(); this.cargarUsuarios(); },
        error: () => { this.cerrarModal(); this.cargarUsuarios(); }
      });
    }
  }
}