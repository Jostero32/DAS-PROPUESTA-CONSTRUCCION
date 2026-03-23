import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ObraService } from '../../core/services/obra.service';
import {
  ReporteService,
  ResumenObra,
  GastosMensualesResponse,
} from '../../core/services/reporte.service';
import { ObraResumen } from '../../core/models/obra.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private obraService = inject(ObraService);
  private reporteService = inject(ReporteService);
  private router = inject(Router);

  // ─── State Signals ──────────────────────────────────────────────

  loading = signal(true);
  loadingCharts = signal(true);

  /** Conteos básicos */
  totalClientes = signal(0);
  totalObras = signal(0);
  totalFases = signal(0);

  /** Obras del maestro (para calcular KPIs agregados) */
  obras = signal<ObraResumen[]>([]);

  /** Resúmenes financieros por obra */
  resumenes = signal<ResumenObra[]>([]);

  /** Gastos mensuales del año actual */
  gastosMensuales = signal<GastosMensualesResponse | null>(null);

  // ─── KPIs computados ────────────────────────────────────────────

  /** Total gastado en todas las obras */
  totalGastado = computed(() =>
    this.resumenes().reduce((sum, r) => sum + r.gastos.total_gastado, 0),
  );

  /** Total presupuesto (mano de obra + anticipo) de obras activas */
  totalPresupuesto = computed(() =>
    this.resumenes().reduce((sum, r) => sum + r.presupuesto.total_contrato, 0),
  );

  /** Liquidez restante = presupuesto total − gastado total */
  liquidezRestante = computed(() =>
    this.totalPresupuesto() - this.totalGastado(),
  );

  /** Total por cobrar de todas las obras */
  totalPorCobrar = computed(() =>
    this.resumenes().reduce((sum, r) => sum + r.cobros.total_por_cobrar, 0),
  );

  /** Total cobrado de todas las obras */
  totalCobrado = computed(() =>
    this.resumenes().reduce((sum, r) => sum + r.cobros.total_cobrado, 0),
  );

  /** Ingreso neto global */
  ingresoNeto = computed(() =>
    this.totalCobrado() - this.totalGastado(),
  );

  // ─── Chart: Gastos Mensuales (Barras) ───────────────────────────

  barChartData = computed<ChartData<'bar'>>(() => {
    const gm = this.gastosMensuales();
    if (!gm) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: gm.meses.map((m) => m.mes_nombre.substring(0, 3)),
      datasets: [
        {
          label: 'Gastos ($)',
          data: gm.meses.map((m) => m.total),
          backgroundColor: '#3949ab',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
        },
      ],
    };
  });

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        cornerRadius: 8,
        padding: 10,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        callbacks: {
          label: (ctx) => ` $${(ctx.parsed.y ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (val) => '$' + Number(val).toLocaleString(),
        },
        border: { display: false },
      },
    },
  };

  // ─── Chart: Presupuesto vs Gastado (Dona) ──────────────────────

  doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const gastado = this.totalGastado();
    const restante = Math.max(0, this.totalPresupuesto() - gastado);
    return {
      labels: ['Gastado', 'Disponible'],
      datasets: [
        {
          data: [gastado, restante],
          backgroundColor: ['#e91e63', '#00897b'],
          borderWidth: 0,
          spacing: 2,
        },
      ],
    };
  });

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 13 },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
        },
      },
    },
  };

  // ─── Lifecycle ──────────────────────────────────────────────────

  ngOnInit(): void {
    this.cargarConteos();
    this.cargarReportes();
  }

  navigate(path: string): void {
    this.router.navigate(['/', path]);
  }

  // ─── Carga de datos ─────────────────────────────────────────────

  private cargarConteos(): void {
    // Conteos rápidos para las stat cards
    this.api.getAll('clientes').subscribe({
      next: (d) => this.totalClientes.set(d.length),
      error: () => this.totalClientes.set(0),
    });
  }

  private cargarReportes(): void {
    this.loading.set(true);
    this.loadingCharts.set(true);

    // 1. Cargar obras del maestro
    this.obraService.getMisObras().subscribe({
      next: (obras) => {
        this.obras.set(obras);
        this.totalObras.set(obras.length);

        // Contar fases totales de todas las obras
        const totalFases = obras.reduce((sum, o) => sum + (o.total_fases || 0), 0);
        this.totalFases.set(totalFases);

        this.loading.set(false);

        // 2. Cargar resúmenes financieros de obras activas
        const obrasActivas = obras.filter((o) => o.estado !== 'cancelada');
        if (obrasActivas.length > 0) {
          const resumenRequests = obrasActivas.map((o) =>
            this.reporteService.getResumenObra(o.id),
          );

          forkJoin(resumenRequests).subscribe({
            next: (resumenes) => {
              this.resumenes.set(resumenes);
              this.loadingCharts.set(false);
            },
            error: () => this.loadingCharts.set(false),
          });
        } else {
          this.loadingCharts.set(false);
        }

        // 3. Cargar gastos mensuales del año actual
        this.reporteService.getGastosMensuales().subscribe({
          next: (data) => this.gastosMensuales.set(data),
          error: () => {},
        });
      },
      error: () => {
        this.loading.set(false);
        this.loadingCharts.set(false);
      },
    });
  }
}
