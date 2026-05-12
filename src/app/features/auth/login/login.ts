import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // <-- AGREGADO RouterModule
import { AuthService } from '../../../core/security/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // <-- AGREGADO AQUÍ
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          const rol = this.authService.obtenerRol();
          if (rol === 'Cajero' || rol === 'Bodeguero') {
            this.router.navigate(['/caja']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Credenciales inválidas. Por favor, intente de nuevo.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}