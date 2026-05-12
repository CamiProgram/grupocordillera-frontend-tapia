import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private logueado = new BehaviorSubject<boolean>(this.tieneToken());

  constructor(private http: HttpClient) {}

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((res: any) => {
        localStorage.setItem('token_cordillera', res.token);
        this.logueado.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token_cordillera');
    this.logueado.next(false);
  }

  tieneToken(): boolean { return !!localStorage.getItem('token_cordillera'); }

  obtenerRol(): string | null {
    const token = localStorage.getItem('token_cordillera');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.rol; 
    } catch { return null; }
  }

  estaLogueado() { return this.logueado.asObservable(); }
}