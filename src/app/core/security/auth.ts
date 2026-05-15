import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Apuntamos al nuevo puerto 8091 configurado en el docker-compose
  private apiUrl = 'http://localhost:8091/api/auth/login'; 
  
  private logueado = new BehaviorSubject<boolean>(this.tieneToken());

  constructor(private http: HttpClient) {}

  login(credenciales: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credenciales).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem('token_cordillera', res.token);
        }
        if (res.rol) {
          localStorage.setItem('rol_cordillera', res.rol);
        }
        this.logueado.next(true);
      }),
      catchError(error => {
        console.error('Error devuelto por el backend:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token_cordillera');
    localStorage.removeItem('rol_cordillera');
    this.logueado.next(false);
  }

  tieneToken(): boolean {
    return !!localStorage.getItem('token_cordillera');
  }

  obtenerRol(): string | null {
    return localStorage.getItem('rol_cordillera'); 
  }

  estaLogueado() {
    return this.logueado.asObservable();
  }
}