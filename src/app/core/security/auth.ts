import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // AJUSTA ESTA URL AL PUERTO DE TU API GATEWAY (Ej: 8080 o el que use Spring Boot)
  private apiUrl = 'http://localhost:8080/api/auth/login'; 
  
  private logueado = new BehaviorSubject<boolean>(this.tieneToken());

  constructor(private http: HttpClient) {}

  login(credenciales: any): Observable<any> {
    // AHORA SÍ: Hacemos la petición HTTP POST real a tu backend en Java
    return this.http.post<any>(this.apiUrl, credenciales).pipe(
      tap((res: any) => {
        // Asumiendo que tu backend responde con un JSON que tiene la propiedad "token"
        localStorage.setItem('token_cordillera', res.token);
        // Si tu backend manda el rol, también deberías guardarlo aquí
        if(res.rol) localStorage.setItem('rol_cordillera', res.rol);
        this.logueado.next(true);
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
    // Lee el rol que te mandó el backend, si no hay, por defecto asume Cajero para evitar errores
    return localStorage.getItem('rol_cordillera') || 'Cajero'; 
  }

  estaLogueado() {
    return this.logueado.asObservable();
  }
}