import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService as SeguridadService } from '../../../../core/security/auth';

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
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  cargando: boolean = false;
  
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  productoActual: Producto = this.nuevoProductoVacio();

  // Categorías predefinidas para el select del formulario
  categoriasDisponibles: string[] = ['Abarrotes', 'Lácteos', 'Limpieza', 'Electrónica', 'Bebidas'];

  // Apunta al API Gateway que enrutará hacia gc_inventario_compras (8082)
  private readonly API_URL = 'http://localhost:8090/api/inventario/productos';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private seguridadService: SeguridadService 
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  private getHeaders() {
    const token = this.seguridadService.obtenerToken() || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  cargarProductos(): void {
    this.cargando = true;
    this.cdr.detectChanges(); 

    this.http.get<Producto[]>(this.API_URL, this.getHeaders()).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.productos = data;
        } else {
          this.cargarDatosMock(); 
        }
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error de conexión al cargar catálogo:', err);
        this.cargarDatosMock();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDatosMock(): void {
    this.productos = [
      { id: 1, codigoBarras: '780123456789', nombre: 'Leche Descremada', descripcion: 'Leche líquida 1L', marca: 'Colun', categoria: 'Lácteos', precio: 1200, stock: 50 },
      { id: 2, codigoBarras: '780987654321', nombre: 'Detergente Líquido', descripcion: 'Detergente 3L', marca: 'Omo', categoria: 'Limpieza', precio: 8500, stock: 15 }
    ];
  }

  nuevoProductoVacio(): Producto {
    return { codigoBarras: '', nombre: '', descripcion: '', marca: '', categoria: 'Abarrotes', precio: 0, stock: 0 };
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
      this.http.put<Producto>(`${this.API_URL}/${this.productoActual.id}`, this.productoActual, this.getHeaders()).subscribe({
        next: () => { 
          this.cerrarModal(); 
          this.cargarProductos(); 
          alert("✅ Producto actualizado con éxito");
        },
        error: (err) => { 
          console.error('Error al actualizar:', err);
          alert("❌ Error: " + (err.error?.error || err.message)); 
        }
      });
    } else {
      this.http.post<Producto>(this.API_URL, this.productoActual, this.getHeaders()).subscribe({
        next: () => { 
          this.cerrarModal(); 
          this.cargarProductos(); 
          alert("✅ Producto registrado con éxito");
        },
        error: (err) => { 
          console.error('Error al crear:', err);
          alert("❌ Error: " + (err.error?.error || err.message)); 
        }
      });
    }
  }
}