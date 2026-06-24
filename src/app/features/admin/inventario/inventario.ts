import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Producto {
  id?: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss'
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  cargando: boolean = false;
  
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  productoActual: Producto = this.nuevoProductoVacio();

  private readonly API_URL = 'http://localhost:8090/api/inventario/productos';

  // 🚀 INYECTAMOS ChangeDetectorRef PARA FORZAR LA ACTUALIZACIÓN VISUAL
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.cdr.detectChanges(); // Forzamos mostrar el spinner

    this.http.get<Producto[]>(this.API_URL).subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.detectChanges(); // 🚀 MAGIA: Obligamos a Angular a dibujar la tabla inmediatamente
      },
      error: (err) => {
        console.error('Error de conexión con la base de datos real:', err);
        this.cargando = false;
        this.cdr.detectChanges(); // Forzamos quitar el spinner aunque falle
        alert('Error conectando con la base de datos. Revise si el backend está encendido.');
      }
    });
  }

  nuevoProductoVacio(): Producto {
    return { codigoBarras: '', nombre: '', descripcion: '', marca: '', categoria: '', precio: 0, stock: 0 };
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.productoActual = this.nuevoProductoVacio();
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(producto: Producto): void {
    this.modoEdicion = true;
    this.productoActual = { ...producto };
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  guardarProducto(): void {
    if (this.modoEdicion && this.productoActual.id) {
      this.http.put<Producto>(`${this.API_URL}/${this.productoActual.id}`, this.productoActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (err) => console.error('Error actualizando', err)
      });
    } else {
      this.http.post<Producto>(this.API_URL, this.productoActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (err) => console.error('Error creando', err)
      });
    }
  }
}