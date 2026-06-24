import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.scss'
})
export class EstadisticasComponent implements AfterViewInit {
  @ViewChild('graficoVentas') graficoVentas!: ElementRef;
  @ViewChild('graficoComunas') graficoComunas!: ElementRef; // 🚀 Nuevo gráfico

  // KPIs
  totalRecaudado: number = 572900;
  boletasEmitidas: number = 142;
  productoEstrella: string = 'Galleta Fruna';
  stockCritico: number = 3;

  // 🚀 Tabla de Datos por Comuna
  analiticaComunas = [
    { nombre: 'Pedro Aguirre Cerda', total: 320500, masVendido: 'Galleta Fruna (180 un)', menosVendido: 'Detergente Líquido (2 un)' },
    { nombre: 'Santiago Centro', total: 150000, masVendido: 'Aceite de Oliva (45 un)', menosVendido: 'Café Premium (1 un)' },
    { nombre: 'Providencia', total: 102400, masVendido: 'Café Premium (30 un)', menosVendido: 'Arroz Integral (4 un)' }
  ];

  ngAfterViewInit(): void {
    this.renderizarGraficoVentas();
    this.renderizarGraficoComunas();
  }

  renderizarGraficoVentas(): void {
    new Chart(this.graficoVentas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [{
          label: 'Ingresos Diarios ($)',
          data: [120000, 190000, 150000, 220000, 300000, 450000, 380000],
          borderColor: '#3366ff',
          backgroundColor: 'rgba(51, 102, 255, 0.15)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  renderizarGraficoComunas(): void {
    new Chart(this.graficoComunas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.analiticaComunas.map(c => c.nombre),
        datasets: [{
          label: 'Recaudación por Comuna ($)',
          data: this.analiticaComunas.map(c => c.total),
          backgroundColor: ['#00d68f', '#3366ff', '#ffaa00'],
          borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
}