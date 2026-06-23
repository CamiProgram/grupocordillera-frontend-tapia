import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../core/security/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  showPwd: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.maxLength(30), 
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/) 
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(4),
        Validators.maxLength(20)
      ]]
    });
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.loginForm.get(campo);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  esCampoValido(campo: string): boolean {
    const control = this.loginForm.get(campo);
    return !!(control && control.valid && (control.touched || control.dirty));
  }

  get errorEmail(): string {
    const f = this.loginForm.get('email');
    if (f?.hasError('required')) return 'El correo es obligatorio.';
    if (f?.hasError('maxlength')) return 'Máximo 30 caracteres.';
    if (f?.hasError('pattern')) return 'Ingrese un correo válido.';
    return '';
  }

  get errorPassword(): string {
    const f = this.loginForm.get('password');
    if (f?.hasError('required')) return 'La contraseña es obligatoria.';
    if (f?.hasError('minlength')) return 'Mínimo 4 caracteres.';
    if (f?.hasError('maxlength')) return 'Máximo 20 caracteres.';
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPwd = !this.showPwd;
  }

  onSubmit(): void {
    // 1. Forzamos a Angular a leer los valores actuales para evitar el bug del autocompletado
    this.loginForm.updateValueAndValidity();

    // 2. Revisamos si hay errores y marcamos todo para mostrar el feedback visual
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor, corrija los errores marcados en rojo.';
      return;
    }

    // 3. Prevenimos múltiples clics
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // 4. Llamada al backend
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const rol = (this.authService.obtenerRol() || '').toUpperCase();
        
        if (rol === 'GERENTE' || rol === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else if (rol === 'CAJERO' || rol === 'BODEGUERO') {
          this.router.navigate(['/caja']);
        } else {
          this.router.navigate(['/caja']); // Fallback por defecto
        }
      },
      error: (err) => {
        this.loading = false;
        // Capturamos el mensaje del backend si existe, si no, uno genérico
        this.errorMessage = err.error || 'Credenciales incorrectas o usuario no encontrado.';
        console.error('Detalles del error HTTP:', err);
      }
    });
  }
}