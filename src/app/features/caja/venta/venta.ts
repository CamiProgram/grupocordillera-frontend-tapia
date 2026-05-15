import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ItemVenta {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss'
})
export class VentaComponent implements OnInit {
  ventaForm: FormGroup;
  carrito: ItemVenta[] = [];
  totalVenta: number = 0;
  mensajeError: string = '';
  cajeroNombre: string = 'Camilo Tapia'; 

  constructor(private fb: FormBuilder) {
    this.ventaForm = this.fb.group({
      codigoProducto: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  buscarProducto(): void {
    const codigo = this.ventaForm.get('codigoProducto')?.value;
    if (!codigo) return;

    // Simulación de respuesta del microservicio
    const productoEncontrado = {
      codigo: codigo,
      nombre: 'Producto Escaneado ' + codigo,
      precio: 1500,
      stock: 10
    };

    this.agregarAlCarrito(productoEncontrado);
    this.ventaForm.reset();
  }

  agregarAlCarrito(producto: any): void {
    const itemExistente = this.carrito.find(i => i.codigo === producto.codigo);

    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
      } else {
        this.mostrarError('Stock insuficiente');
      }
    } else {
      this.carrito.push({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        subtotal: producto.precio
      });
    }
    this.calcularTotal();
  }

  eliminarItem(index: number): void {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalVenta = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  finalizarVenta(): void {
    if (this.carrito.length === 0) return;
    alert('Venta procesada con éxito');
    this.carrito = [];
    this.totalVenta = 0;
  }

  private mostrarError(msj: string): void {
    this.mensajeError = msj;
    setTimeout(() => this.mensajeError = '', 3000);
  }
}