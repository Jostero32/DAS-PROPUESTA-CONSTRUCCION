import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ArchivoService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/upload`;

  /** Sube un archivo al backend y devuelve la URL pública */
  subirArchivo(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('foto', file);

    return this.http
      .post<UploadResponse>(this.api, formData)
      .pipe(map((res) => res.url));
  }

  /** Descarga un PDF como blob (para contrato de obra) */
  descargarContratoPDF(obraId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/obras/${obraId}/contrato-pdf`, {
      responseType: 'blob',
    });
  }
}
