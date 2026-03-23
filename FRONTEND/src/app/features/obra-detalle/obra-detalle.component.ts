import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MaestroStore } from '../../core/services/maestro.store';
import { ArchivoService } from '../../core/services/archivo.service';
import { EstadoFase, Fase, AgregarGastoPayload, ActualizarFaseCobroPayload } from '../../core/models/obra.model';
import { RegistrarGastoDialogComponent } from '../../shared/components/registrar-gasto-dialog/registrar-gasto-dialog.component';
import {
  CompletarFaseDialogComponent,
  CompletarFaseDialogData,
} from '../../shared/components/completar-fase-dialog/completar-fase-dialog.component';

@Component({
  selector: 'app-obra-detalle',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './obra-detalle.component.html',
  styleUrl: './obra-detalle.component.scss',
})
export class ObraDetalleComponent implements OnInit, OnDestroy {
  readonly store = inject(MaestroStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private archivoService = inject(ArchivoService);

  descargandoPDF = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.store.seleccionarObra(id);
    }
  }

  ngOnDestroy(): void {
    this.store.deseleccionarObra();
  }

  volver(): void {
    this.router.navigate(['/obras']);
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      en_progreso: 'En progreso',
      completada: 'Completada',
      cancelada: 'Cancelada',
      cobrada: 'Cobrada',
    };
    return labels[estado] || estado;
  }

  getEstadoIcon(estado: string): string {
    const icons: Record<string, string> = {
      pendiente: 'schedule',
      en_progreso: 'trending_up',
      completada: 'check_circle',
      cancelada: 'cancel',
      cobrada: 'paid',
    };
    return icons[estado] || 'info';
  }

  getSiguienteEstadoFase(actual: EstadoFase): EstadoFase | null {
    const flujo: Record<string, EstadoFase> = {
      pendiente: 'en_progreso',
      en_progreso: 'cobrada',
    };
    return flujo[actual] || null;
  }

  avanzarFase(fase: Fase): void {
    const siguiente = this.getSiguienteEstadoFase(fase.estado);
    if (!siguiente) return;

    const ref = this.dialog.open(CompletarFaseDialogComponent, {
      width: '95vw',
      maxWidth: '400px',
      hasBackdrop: true,
      autoFocus: false,
      panelClass: 'centered-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '150ms',
      data: {
        fase,
        siguienteEstado: siguiente,
      } satisfies CompletarFaseDialogData,
    });

    ref.afterClosed().subscribe((result: ActualizarFaseCobroPayload | null) => {
      if (result) {
        this.store.actualizarFaseCobro(fase.id, result);
      }
    });
  }

  getBotonFaseLabel(estado: EstadoFase): string {
    const labels: Record<string, string> = {
      pendiente: 'Iniciar',
      en_progreso: 'Marcar cobrada',
    };
    return labels[estado] || '';
  }

  getBotonFaseIcon(estado: EstadoFase): string {
    const icons: Record<string, string> = {
      pendiente: 'play_arrow',
      en_progreso: 'paid',
    };
    return icons[estado] || '';
  }

  abrirRegistrarGasto(): void {
    const ref = this.dialog.open(RegistrarGastoDialogComponent, {
      width: '95vw',
      maxWidth: '400px',
      hasBackdrop: true,
      autoFocus: 'first-tabbable',
      panelClass: 'centered-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '150ms',
    });

    ref.afterClosed().subscribe((result: AgregarGastoPayload | null) => {
      if (result) {
        this.store.agregarGasto(result);
      }
    });
  }

  descargarContratoPDF(): void {
    const obra = this.store.obraSeleccionada();
    if (!obra || this.descargandoPDF()) return;

    this.descargandoPDF.set(true);

    this.archivoService.descargarContratoPDF(obra.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hoja-obra-${obra.id}-${obra.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargandoPDF.set(false);
      },
      error: () => {
        this.descargandoPDF.set(false);
      },
    });
  }
}
