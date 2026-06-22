import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Apuntamos a la raíz del API Gateway (Puerto 8090)
  private readonly API_URL = 'http://localhost:8090'; 

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    // Concatenamos la ruta exacta aquí para que el Gateway sepa a dónde enrutar internamente
    return this.http.post<any>(`${this.API_URL}/api/auth/login`, credentials).pipe(
      tap(response => {
        // Capturamos el token sin importar si Spring Boot lo llama 'token', 'jwt' o 'accessToken'
        const tokenStr = response?.token || response?.jwt || response?.accessToken;
        if (tokenStr) {
          this.guardarToken(tokenStr);
        }
      })
    );
  }

  guardarToken(token: string): void {
    sessionStorage.setItem('jwt_token', token);
  }

  obtenerToken(): string | null {
    return sessionStorage.getItem('jwt_token');
  }

  tieneToken(): boolean {
    return !!this.obtenerToken();
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('jwt_token');
  }

  obtenerRol(): string {
    const token = this.obtenerToken();
    if (!token) return '';
    
    try {
      const payload = token.split('.')[1];
      const decodedPayload = window.atob(payload);
      const json = JSON.parse(decodedPayload);
      
      // Muestra en consola exactamente qué datos trae tu token
      //console.log('DEBUG TOKEN PAYLOAD:', json);
      
      // Dependiendo de tu Spring Security, el rol puede venir en 'rol' o en 'authorities'
      return json.rol || json.role || ''; 
    } catch (error) {
      console.error('Error al decodificar el token de seguridad', error);
      return '';
    }
  }
}