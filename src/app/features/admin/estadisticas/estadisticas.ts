import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService as SeguridadService } from '../../../core/security/auth';
import Chart from 'chart.js/auto';

// 🚀 Estructura de datos que esperamos recibir del BFF
export interface DashboardData {
  kpis: {
    totalRecaudado: number;
    boletasEmitidas: number;
    productoEstrella: string;
    stockCritico: number;
  };
  ventasSemana: {
    labels: string[];
    data: number[];
  };
  analiticaComunas: Array<{
    nombre: string;
    total: number;
    masVendido: string;
    menosVendido: string;
  }>;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.scss'
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('graficoVentas') graficoVentas!: ElementRef;
  @ViewChild('graficoComunas') graficoComunas!: ElementRef;

  // Instancias de Chart.js para destruirlas al actualizar
  chartVentasInstance: any;
  chartComunasInstance: any;

  cargando: boolean = true;
  errorMensaje: string = '';

  // KPIs inicializados en 0
  totalRecaudado: number = 0;
  boletasEmitidas: number = 0;
  productoEstrella: string = '-';
  stockCritico: number = 0;

  // Tabla de Datos por Comuna
  analiticaComunas: any[] = [];
  
  // Datos temporales de gráficos
  labelsVentas: string[] = [];
  dataVentas: number[] = [];

  // Apunta al API Gateway que enrutará a gc_bff_reportes
  private readonly API_URL = 'http://localhost:8090/api/v1/dashboard/global';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private seguridadService: SeguridadService
  ) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  ngAfterViewInit(): void {
    // Los gráficos se dibujarán una vez lleguen los datos de la API
  }

  private getHeaders() {
    const token = this.seguridadService.obtenerToken() || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  cargarDatosDashboard(): void {
    this.cargando = true;
    this.errorMensaje = '';

    this.http.get<DashboardData>(this.API_URL, this.getHeaders()).subscribe({
      next: (res) => {
        // 1. Asignar KPIs
        this.totalRecaudado = res.kpis.totalRecaudado;
        this.boletasEmitidas = res.kpis.boletasEmitidas;
        this.productoEstrella = res.kpis.productoEstrella;
        this.stockCritico = res.kpis.stockCritico;

        // 2. Asignar Datos de Tabla
        this.analiticaComunas = res.analiticaComunas;

        // 3. Asignar Datos de Gráficos
        this.labelsVentas = res.ventasSemana.labels;
        this.dataVentas = res.ventasSemana.data;

        this.cargando = false;
        this.cdr.detectChanges();

        // 4. Renderizar Gráficos con datos reales
        this.renderizarGraficoVentas();
        this.renderizarGraficoComunas();
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.cargando = false;
        // Manejo del error 429 del Rate Limiting (Bucket4j)
        if (err.status === 429) {
          this.errorMensaje = 'Demasiadas solicitudes. Intente nuevamente en un minuto.';
        } else {
          this.errorMensaje = 'No se pudo conectar con el motor analítico.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  renderizarGraficoVentas(): void {
    if (this.chartVentasInstance) {
      this.chartVentasInstance.destroy(); // Evita superposición
    }

    if (!this.graficoVentas) return;

    this.chartVentasInstance = new Chart(this.graficoVentas.nativeElement, {
      type: 'line',
      data: {
        labels: this.labelsVentas,
        datasets: [{
          label: 'Ingresos Diarios ($)',
          data: this.dataVentas,
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
    if (this.chartComunasInstance) {
      this.chartComunasInstance.destroy();
    }

    if (!this.graficoComunas) return;

    this.chartComunasInstance = new Chart(this.graficoComunas.nativeElement, {
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