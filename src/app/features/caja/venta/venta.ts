import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/security/auth';

import { 
  ScannerQRCodeConfig, 
  ScannerQRCodeResult, 
  NgxScannerQrcodeComponent 
} from 'ngx-scanner-qrcode';

export interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  precio: number;
  stock: number;
}

export interface DetalleVenta {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxScannerQrcodeComponent],
  templateUrl: './venta.html',
  styleUrl: './venta.scss'
})
export class VentaComponent implements OnInit, OnDestroy {
  @ViewChild('codigoInput') codigoInput!: ElementRef;
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;

  public configScanner: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: 'environment' 
      }
    },
    canvasStyles: [
      { lineWidth: 4, strokeStyle: '#4f46e5' }, 
      { font: '20px Inter', fillStyle: '#4f46e5' }
    ]
  };

  // Estados
  codigoBarras: string = '';
  terminoBusqueda: string = '';
  carrito: DetalleVenta[] = [];
  total: number = 0;
  cargando: boolean = false;
  mensajeError: string = '';
  
  // 🚀 CATÁLOGO DESDE LA BASE DE DATOS
  productosDesdeAPI: Producto[] = [];
  productosFiltrados: Producto[] = [];
  
  // Control de Cámara
  camaraActiva: boolean = false;
  
  // Contexto de Negocio
  nombreCajero: string = 'OPERADOR';
  sucursalActual: string = 'Sucursal Pedro Aguirre Cerda';
  comunaActual: string = 'Pedro Aguirre Cerda';
  regionActual: string = 'Región Metropolitana';

  private readonly API_GATEWAY = 'http://localhost:8090';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const rol = this.authService.obtenerRol();
    this.nombreCajero = rol ? rol.toUpperCase() : 'CAJERO';
    
    // 🚀 INICIAMOS LA DESCARGA DEL INVENTARIO AL ABRIR LA CAJA
    this.cargarProductos();
    this.enfocarInput();
  }

  ngOnDestroy(): void {
    if (this.scanner && this.scanner.isStart) {
      this.scanner.stop();
    }
  }

  // ==========================================
  // 🌐 CONEXIÓN REAL CON GC_INVENTARIO_COMPRAS
  // ==========================================
  cargarProductos(): void {
    this.http.get<Producto[]>(`${this.API_GATEWAY}/api/inventario/productos`).subscribe({
      next: (data) => {
        this.productosDesdeAPI = data;
        console.log('📦 Catálogo sincronizado desde DB PostgreSQL:', this.productosDesdeAPI);
      },
      error: (err) => {
        console.error('❌ Error sincronizando inventario a través del Gateway:', err);
        this.mensajeError = 'Error de conexión con el servidor de inventario.';
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  enfocarInput(): void {
    setTimeout(() => {
      if (this.codigoInput) this.codigoInput.nativeElement.focus();
    }, 150);
  }

  onCodigoBarrasChange(valor: string): void {
    this.codigoBarras = valor.replace(/[^0-9]/g, '');
  }

  filtrarProductos(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      this.productosFiltrados = [];
      return;
    }
    // Ahora filtramos sobre la data real de la API
    this.productosFiltrados = this.productosDesdeAPI.filter(p => 
      p.nombre.toLowerCase().includes(termino) || p.codigoBarras.includes(termino)
    );
  }

  seleccionarProducto(producto: Producto): void {
    this.agregarAlCarrito(producto);
    this.terminoBusqueda = '';
    this.productosFiltrados = [];
    this.enfocarInput();
  }

  buscarProducto(): void {
    if (!this.codigoBarras.trim()) return;
    this.procesarCodigo(this.codigoBarras.trim());
  }

  toggleCamara(): void {
    if (!this.scanner) return;

    if (this.camaraActiva) {
      this.camaraActiva = false;
      this.scanner.stop();
      this.enfocarInput();
    } else {
      this.camaraActiva = true;
      setTimeout(() => {
        this.scanner.start();
      }, 150); 
    }
  }

  public onEventScan(event: ScannerQRCodeResult[] | any): void {
    if (!event) return;
    
    let codigoLeido = '';
    if (Array.isArray(event) && event.length > 0) {
      codigoLeido = event[0].value;
    } else if (event.value) {
      codigoLeido = event.value;
    }
    
    if (codigoLeido) {
      setTimeout(() => {
        const codigoLimpio = codigoLeido.replace(/[^0-9]/g, '');
        this.procesarCodigo(codigoLimpio);
        
        this.camaraActiva = false;
        if (this.scanner && this.scanner.isStart) {
          this.scanner.stop();
        }
        this.enfocarInput();
      }, 300); 
    }
  }

  private procesarCodigo(codigo: string): void {
    this.cargando = true;
    this.mensajeError = '';

    // Búsqueda en el catálogo real
    const prod = this.productosDesdeAPI.find(p => p.codigoBarras === codigo);

    if (prod) {
      this.agregarAlCarrito(prod);
    } else {
      this.mensajeError = `Código [${codigo}] no existe en la base de datos.`;
      setTimeout(() => this.mensajeError = '', 4000);
    }

    this.cargando = false;
    this.codigoBarras = '';
    this.enfocarInput();
  }

  agregarAlCarrito(producto: Producto): void {
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      this.carrito.push({ producto, cantidad: 1, subtotal: producto.precio });
    }
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.total = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  modificarCantidad(index: number, operacion: 'sumar' | 'restar'): void {
    const item = this.carrito[index];
    if (operacion === 'sumar') {
      item.cantidad++;
    } else if (operacion === 'restar' && item.cantidad > 1) {
      item.cantidad--;
    }
    item.subtotal = item.cantidad * item.producto.precio;
    this.calcularTotal();
    this.enfocarInput();
  }

  eliminarLinea(index: number): void {
    this.carrito.splice(index, 1);
    this.calcularTotal();
    this.enfocarInput();
  }

  cancelarVenta(): void {
    if (this.carrito.length === 0) return;
    if (confirm('¿Confirma la anulación completa de la transacción en curso?')) {
      this.carrito = [];
      this.total = 0;
      this.enfocarInput();
    }
  }

  // ==========================================
  // 🚀 CONEXIÓN REAL CON GC_VENTAS (Aislado)
  // ==========================================
  procesarPago(): void {
    if (this.carrito.length === 0) return;
    this.cargando = true;

    const payloadVenta = {
      total: this.total,
      sucursal: this.sucursalActual,
      comuna: this.comunaActual,
      region: this.regionActual,
      detalles: this.carrito.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.subtotal
      }))
    };

    // 🚀 APUNTANDO DIRECTO AL MICROSERVICIO (SIN GATEWAY)
    this.http.post(`http://localhost:8092/api/ventas/registrar`, payloadVenta).subscribe({
      next: () => {
        alert('BOLETA ELECTRÓNICA EMITIDA CON ÉXITO');
        this.carrito = [];
        this.total = 0;
        this.cargando = false;
        this.enfocarInput();
      },
      error: (err) => {
        console.error('Fallo en Ventas Directo:', err);
        // Si falla, avisamos exactamente qué código HTTP devolvió el servidor
        alert(`Error al registrar venta (Cód: ${err.status}). Verifique la consola para detalles.`);
        this.cargando = false;
        this.enfocarInput();
      }
    });
  }

  cerrarSesion(): void {
    if (this.scanner && this.scanner.isStart) {
      this.scanner.stop();
    }
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}