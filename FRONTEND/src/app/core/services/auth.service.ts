import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserInfo {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

interface LoginResponse {
  token: string;
  user: UserInfo;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<UserInfo | null>(this.loadUser());
  currentUser = this._user.asReadonly();

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('constructa_token', res.token);
          localStorage.setItem('constructa_user', JSON.stringify(res.user));
          this._user.set(res.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('constructa_token');
    localStorage.removeItem('constructa_user');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('constructa_token');
  }

  private loadUser(): UserInfo | null {
    const stored = localStorage.getItem('constructa_user');
    return stored ? JSON.parse(stored) : null;
  }
}
