import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Interfaces de respuesta (match con backend) ─────────────────

export interface ResumenObra {
  obra_id: number;
  obra_nombre: string;
  estado: string;
  presupuesto: {
    mano_de_obra: number;
    anticipo_materiales: number;
    total_contrato: number;
  };
  gastos: {
    total_gastado: number;
    cantidad_gastos: number;
    saldo_anticipo: number;
  };
  cobros: {
    total_cobrado: number;
    total_por_cobrar: number;
    fases_cobradas: number;
    fases_pendientes: number;
    fases_en_progreso: number;
    fases_total: number;
    progreso_porcentaje: number;
  };
  balance: {
    ingreso_neto: number;
    rentabilidad_porcentaje: number;
  };
}

export interface GastoMensualItem {
  anio: number;
  mes: number;
  mes_nombre: string;
  total: number;
  cantidad: number;
}

export interface GastosMensualesResponse {
  anio: number;
  total_anual: number;
  cantidad_anual: number;
  meses: GastoMensualItem[];
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/reportes`;

  /** GET /reportes/resumen-obra/:obraId */
  getResumenObra(obraId: number): Observable<ResumenObra> {
    return this.http.get<ResumenObra>(`${this.api}/resumen-obra/${obraId}`);
  }

  /** GET /reportes/gastos-mensuales?anio=YYYY */
  getGastosMensuales(anio?: number): Observable<GastosMensualesResponse> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    return this.http.get<GastosMensualesResponse>(`${this.api}/gastos-mensuales`, { params });
  }
}
