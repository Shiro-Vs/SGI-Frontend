import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // URL base apuntando al backend Spring Boot
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private tokenKey = 'sgi_token';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.loadSession();
  }

  login(credentials: { correo: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          const userData = {
            usuarioId: response.usuarioId,
            nombre: response.nombre,
            correo: response.correo,
            rol: response.rol,
            sucursalId: response.sucursalId
          };
          localStorage.setItem('sgi_user', JSON.stringify(userData));
          this.userSubject.next(userData);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('sgi_user');
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const user = this.userSubject.value;
    return user ? user.rol : null;
  }

  getUser(): any {
    return this.userSubject.value;
  }

  private loadSession(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('sgi_user');
    if (token && userStr) {
      try {
        this.userSubject.next(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    } else if (token) {
      this.userSubject.next({ nombre: 'Usuario SGI', correo: '', rol: 'ADMIN' });
    }
  }
}
