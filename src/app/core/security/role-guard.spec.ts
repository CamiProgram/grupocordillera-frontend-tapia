import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { roleGuard } from './role-guard';
import { AuthService } from './auth';

describe('roleGuard', () => {
  // 1. Declaramos variables para nuestros servicios simulados (Mocks)
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  beforeEach(() => {
    // 2. Creamos los Mocks indicando qué métodos van a utilizarse dentro del Guard
    mockAuthService = jasmine.createSpyObj('AuthService', ['tieneToken', 'obtenerRol']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // 3. Configuramos el módulo de pruebas inyectando nuestros Mocks
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // Test de prueba extra: Verifica que si no hay token, redirija al login
  it('debería redirigir al login si no tiene token', () => {
    mockAuthService.tieneToken.and.returnValue(false);
    
    // Ejecutamos el guard con parámetros nulos simulados
    const result = TestBed.runInInjectionContext(() => roleGuard({} as any, {} as any));
    
    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});