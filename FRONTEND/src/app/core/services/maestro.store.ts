import { Injectable, inject, signal, computed } from '@angular/core';
import { ObraService } from './obra.service';
import { NotificationService } from './notification.service';
import {
  ObraResumen,
  ObraDetalle,
  Fase,
  Gasto,
  CreateObraPayload,
  UpdateObraPayload,
  EstadoObra,
  CreateFasePayload,
  ActualizarFaseCobroPayload,
  AgregarGastoPayload,
} from '../models/obra.model';

@Injectable({ providedIn: 'root' })
export class MaestroStore {
  private obraService = inject(ObraService);
  private notify = inject(NotificationService);

  // ─── State Signals ────────────────────────────────────────────

  /** Lista de obras del maestro con resumen */
  readonly obras = signal<ObraResumen[]>([]);

  /** Obra seleccionada con detalle completo (fases + gastos + métricas) */
  readonly obraSeleccionada = signal<ObraDetalle | null>(null);

  /** Indicador de carga global */
  readonly loading = signal(false);

  /** Error del último request (se limpia en cada operación nueva) */
  readonly error = signal<string | null>(null);

  // ─── Computed Signals (derivados, sin estado propio) ──────────

  /** Total de obras activas (no canceladas) */
  readonly obrasActivas = computed(() =>
    this.obras().filter((o) => o.estado !== 'cancelada'),
  );

  /** Conteo por estado */
  readonly conteosPorEstado = computed(() => {
    const obras = this.obras();
    return {
      pendiente: obras.filter((o) => o.estado === 'pendiente').length,
      en_progreso: obras.filter((o) => o.estado === 'en_progreso').length,
      completada: obras.filter((o) => o.estado === 'completada').length,
      cancelada: obras.filter((o) => o.estado === 'cancelada').length,
      total: obras.length,
    };
  });

  /** Resumen financiero de la obra seleccionada */
  readonly resumenFinanciero = computed(() => {
    const obra = this.obraSeleccionada();
    if (!obra) return null;
    return {
      presupuesto: Number(obra.presupuesto_mano_obra),
      anticipo: Number(obra.anticipo_materiales),
      cobrado: obra.monto_cobrado,
      pendiente: obra.monto_pendiente,
      gastado: obra.total_gastado,
      saldoAnticipo: obra.saldo_anticipo,
    };
  });

  /** Fases de la obra seleccionada (shortcut) */
  readonly fasesSeleccionada = computed(() =>
    this.obraSeleccionada()?.fases ?? [],
  );

  /** Gastos de la obra seleccionada (shortcut) */
  readonly gastosSeleccionada = computed(() =>
    this.obraSeleccionada()?.gastos ?? [],
  );

  /** Progreso de cobro de la obra seleccionada (%) */
  readonly progresoCobro = computed(() => {
    const obra = this.obraSeleccionada();
    if (!obra || obra.total_fases === 0) return 0;
    return Math.round((obra.fases_cobradas / obra.total_fases) * 100);
  });

  // ─── Actions: Obras ───────────────────────────────────────────

  /** Carga la lista de obras del maestro */
  cargarObras(): void {
    this.loading.set(true);
    this.error.set(null);

    this.obraService.getMisObras().subscribe({
      next: (obras) => {
        this.obras.set(obras);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar obras');
        this.loading.set(false);
        this.notify.error('No se pudieron cargar las obras');
        console.error(err);
      },
    });
  }

  /** Selecciona una obra y carga su detalle completo */
  seleccionarObra(obraId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.obraService.getObraDetalle(obraId).subscribe({
      next: (detalle) => {
        this.obraSeleccionada.set(detalle);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar detalle de obra');
        this.loading.set(false);
        this.notify.error('No se pudo cargar el detalle de la obra');
        console.error(err);
      },
    });
  }

  /** Limpia la obra seleccionada (navegar atrás) */
  deseleccionarObra(): void {
    this.obraSeleccionada.set(null);
  }

  /** Crea una obra nueva y refresca la lista */
  crearObra(data: CreateObraPayload): void {
    this.loading.set(true);
    this.error.set(null);

    this.obraService.crearObra(data).subscribe({
      next: () => {
        this.notify.success('Obra creada exitosamente');
        this.cargarObras();
      },
      error: (err) => {
        this.error.set('Error al crear obra');
        this.loading.set(false);
        this.notify.error('No se pudo crear la obra');
        console.error(err);
      },
    });
  }

  /** Actualiza una obra y refresca donde corresponda */
  actualizarObra(obraId: number, data: UpdateObraPayload): void {
    this.loading.set(true);
    this.error.set(null);

    this.obraService.actualizarObra(obraId, data).subscribe({
      next: () => {
        this.notify.success('Obra actualizada');
        this.cargarObras();
        if (this.obraSeleccionada()?.id === obraId) {
          this.seleccionarObra(obraId);
        }
      },
      error: (err) => {
        this.error.set('Error al actualizar obra');
        this.loading.set(false);
        this.notify.error('No se pudo actualizar la obra');
        console.error(err);
      },
    });
  }

  /** Cambia el estado de una obra */
  cambiarEstadoObra(obraId: number, estado: EstadoObra): void {
    this.obraService.cambiarEstado(obraId, { estado }).subscribe({
      next: (obraActualizada) => {
        // Actualizar en la lista sin recargar todo
        this.obras.update((obras) =>
          obras.map((o) => (o.id === obraId ? { ...o, estado: obraActualizada.estado } : o)),
        );
        // Si es la obra seleccionada, refrescar detalle
        if (this.obraSeleccionada()?.id === obraId) {
          this.obraSeleccionada.update((obra) =>
            obra ? { ...obra, estado: obraActualizada.estado } : null,
          );
        }
        this.notify.success(`Estado cambiado a: ${estado.replace('_', ' ')}`);
      },
      error: () => this.notify.error('No se pudo cambiar el estado'),
    });
  }

  /** Elimina una obra */
  eliminarObra(obraId: number): void {
    this.obraService.eliminarObra(obraId).subscribe({
      next: () => {
        this.obras.update((obras) => obras.filter((o) => o.id !== obraId));
        if (this.obraSeleccionada()?.id === obraId) {
          this.obraSeleccionada.set(null);
        }
        this.notify.success('Obra eliminada');
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo eliminar la obra';
        this.notify.error(msg);
      },
    });
  }

  // ─── Actions: Fases ───────────────────────────────────────────

  /** Agrega una fase a la obra seleccionada */
  agregarFase(data: CreateFasePayload): void {
    const obra = this.obraSeleccionada();
    if (!obra) return;

    this.obraService.agregarFase(obra.id, data).subscribe({
      next: (nuevaFase) => {
        this.obraSeleccionada.update((o) =>
          o ? {
            ...o,
            fases: [...o.fases, nuevaFase].sort((a, b) => a.orden - b.orden),
            total_fases: o.total_fases + 1,
            monto_pendiente: o.monto_pendiente + Number(nuevaFase.monto_a_cobrar),
          } : null,
        );
        this.notify.success('Fase agregada');
      },
      error: () => this.notify.error('No se pudo agregar la fase'),
    });
  }

  /** Actualiza estado/evidencia de una fase (flujo de cobro) */
  actualizarFaseCobro(faseId: number, data: ActualizarFaseCobroPayload): void {
    const obra = this.obraSeleccionada();
    if (!obra) return;

    this.obraService.actualizarFaseCobro(obra.id, faseId, data).subscribe({
      next: (faseActualizada) => {
        // Recalcular métricas localmente
        const fasesActualizadas = obra.fases.map((f) =>
          f.id === faseId ? faseActualizada : f,
        );
        const cobradas = fasesActualizadas.filter((f) => f.estado === 'cobrada');
        const noCobradas = fasesActualizadas.filter((f) => f.estado !== 'cobrada');

        this.obraSeleccionada.update((o) =>
          o ? {
            ...o,
            fases: fasesActualizadas,
            fases_cobradas: cobradas.length,
            monto_cobrado: cobradas.reduce((s, f) => s + Number(f.monto_a_cobrar), 0),
            monto_pendiente: noCobradas.reduce((s, f) => s + Number(f.monto_a_cobrar), 0),
          } : null,
        );
        this.notify.success('Fase actualizada');
      },
      error: () => this.notify.error('No se pudo actualizar la fase'),
    });
  }

  // ─── Actions: Gastos ──────────────────────────────────────────

  /** Registra un gasto en la obra seleccionada */
  agregarGasto(data: AgregarGastoPayload): void {
    const obra = this.obraSeleccionada();
    if (!obra) return;

    this.obraService.agregarGasto(obra.id, data).subscribe({
      next: (nuevoGasto) => {
        // Insertar ordenado por fecha desc y recalcular totales
        const gastosActualizados = [nuevoGasto, ...obra.gastos]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const totalGastado = gastosActualizados.reduce((s, g) => s + Number(g.monto), 0);

        this.obraSeleccionada.update((o) =>
          o ? {
            ...o,
            gastos: gastosActualizados,
            total_gastado: totalGastado,
            saldo_anticipo: Number(o.anticipo_materiales) - totalGastado,
          } : null,
        );
        this.notify.success('Gasto registrado');
      },
      error: () => this.notify.error('No se pudo registrar el gasto'),
    });
  }
}
