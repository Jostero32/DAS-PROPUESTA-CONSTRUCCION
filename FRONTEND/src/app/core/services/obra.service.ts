import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ObraResumen,
  ObraDetalle,
  Obra,
  Fase,
  Gasto,
  CreateObraPayload,
  UpdateObraPayload,
  CambiarEstadoPayload,
  CreateFasePayload,
  ActualizarFaseCobroPayload,
  AgregarGastoPayload,
} from '../models/obra.model';

@Injectable({ providedIn: 'root' })
export class ObraService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/obras`;

  // ─── Obras ──────────────────────────────────────────────────

  /** GET /obras → mis obras con resumen (fases cobradas, total gastado) */
  getMisObras(): Observable<ObraResumen[]> {
    return this.http.get<ObraResumen[]>(this.api);
  }

  /** GET /obras/:id → detalle completo con fases, gastos y métricas */
  getObraDetalle(obraId: number): Observable<ObraDetalle> {
    return this.http.get<ObraDetalle>(`${this.api}/${obraId}`);
  }

  /** POST /obras → crear obra (usuario_id se asigna en el backend desde JWT) */
  crearObra(data: CreateObraPayload): Observable<Obra> {
    return this.http.post<Obra>(this.api, data);
  }

  /** PUT /obras/:id → actualizar obra */
  actualizarObra(obraId: number, data: UpdateObraPayload): Observable<Obra> {
    return this.http.put<Obra>(`${this.api}/${obraId}`, data);
  }

  /** PATCH /obras/:id/estado → cambiar solo el estado */
  cambiarEstado(obraId: number, data: CambiarEstadoPayload): Observable<Obra> {
    return this.http.patch<Obra>(`${this.api}/${obraId}/estado`, data);
  }

  /** DELETE /obras/:id → eliminar obra (falla si tiene fases cobradas) */
  eliminarObra(obraId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${obraId}`);
  }

  // ─── Fases de una Obra ────────────────────────────────────────

  /** GET /obras/:id/fases → fases ordenadas por campo 'orden' */
  getFasesDeObra(obraId: number): Observable<Fase[]> {
    return this.http.get<Fase[]>(`${this.api}/${obraId}/fases`);
  }

  /** POST /obras/:id/fases → agregar fase a la obra */
  agregarFase(obraId: number, data: CreateFasePayload): Observable<Fase> {
    return this.http.post<Fase>(`${this.api}/${obraId}/fases`, data);
  }

  /** PATCH /obras/:id/fases/:faseId → actualizar estado/evidencia (flujo de cobro) */
  actualizarFaseCobro(obraId: number, faseId: number, data: ActualizarFaseCobroPayload): Observable<Fase> {
    return this.http.patch<Fase>(`${this.api}/${obraId}/fases/${faseId}`, data);
  }

  // ─── Gastos de una Obra ───────────────────────────────────────

  /** GET /obras/:id/gastos → gastos ordenados por fecha desc */
  getGastosDeObra(obraId: number): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.api}/${obraId}/gastos`);
  }

  /** POST /obras/:id/gastos → registrar gasto en la obra */
  agregarGasto(obraId: number, data: AgregarGastoPayload): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.api}/${obraId}/gastos`, data);
  }
}
