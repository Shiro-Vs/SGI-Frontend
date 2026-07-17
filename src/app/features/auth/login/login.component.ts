import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomButtonComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>SGI</h2>
          <p>Sistema de Gestión Interna</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              formControlName="correo"
              placeholder="Ingrese su correo electrónico"
              class="form-control"
              [ngClass]="{ 'is-invalid': submitted && f['correo'].errors }"
            />
            <div *ngIf="submitted && f['correo'].errors" class="invalid-feedback">
              <span *ngIf="f['correo'].errors['required']">El correo es requerido.</span>
              <span *ngIf="f['correo'].errors['email']">Ingrese un correo válido.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="Ingrese su contraseña"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['password'].errors }"
              />
              <button
                type="button"
                class="toggle-password-btn"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                tabindex="-1"
              >
                <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
            <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
              La contraseña es requerida.
            </div>
          </div>

          <div *ngIf="error" class="alert-error">
            {{ error }}
          </div>

          <app-custom-button
            type="submit"
            label="Iniciar Sesión"
            [loading]="loading"
          ></app-custom-button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      font-family: 'Outfit', 'Inter', sans-serif;
      padding: 1rem;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h2 {
      font-size: 2.5rem;
      color: #6366f1;
      margin: 0;
      font-weight: 800;
      letter-spacing: -0.05em;
    }

    .login-header p {
      color: #94a3b8;
      margin: 0.5rem 0 0 0;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: white;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: all 0.2s ease-in-out;
    }

    .form-control:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .form-control.is-invalid {
      border-color: #ef4444;
    }

    .password-wrapper {
      position: relative;
    }

    .password-wrapper .form-control {
      padding-right: 2.75rem;
    }

    .toggle-password-btn {
      position: absolute;
      top: 50%;
      right: 0.75rem;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .toggle-password-btn:hover {
      color: #cbd5e1;
    }

    .invalid-feedback {
      color: #f87171;
      font-size: 0.75rem;
      margin-top: 0.35rem;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = false;
  submitted = false;
  error = '';
  showPassword = false;

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login({
      correo: this.f['correo'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error = 'Credenciales incorrectas o error en el servidor.';
        this.loading = false;
      }
    });
  }
}
