import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getAll<T = any>(path: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${path}`);
  }

  getById<T = any>(path: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.base}/${path}/${id}`);
  }

  create<T = any>(path: string, data: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.base}/${path}`, data);
  }

  update<T = any>(path: string, id: number, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.base}/${path}/${id}`, data);
  }

  remove(path: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${path}/${id}`);
  }
}
