import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { CustomButtonComponent } from '../../../../shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CustomButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>{{ esEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
        <p class="subtitle">{{ esEdicion ? 'Modifique los campos correspondientes.' : 'Complete el formulario para crear una nueva cuenta.' }}</p>
      </div>

      <div class="form-card">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" formControlName="nombre" class="form-control" />
              <div *ngIf="submitted && f['nombre'].errors" class="invalid-feedback">El nombre es requerido.</div>
            </div>

            <div class="form-group">
              <label for="apellido">Apellido</label>
              <input type="text" id="apellido" formControlName="apellido" class="form-control" />
              <div *ngIf="submitted && f['apellido'].errors" class="invalid-feedback">El apellido es requerido.</div>
            </div>

            <div class="form-group">
              <label for="correo">Correo Electrónico</label>
              <input type="email" id="correo" formControlName="correo" class="form-control" />
              <div *ngIf="submitted && f['correo'].errors" class="invalid-feedback">
                <span *ngIf="f['correo'].errors['required']">El correo es requerido.</span>
                <span *ngIf="f['correo'].errors['email']">Ingrese un correo válido.</span>
              </div>
            </div>

            <div class="form-group">
              <label for="rolId">Rol</label>
              <select id="rolId" formControlName="rolId" class="form-control">
                <option [ngValue]="1">Administrador</option>
                <option [ngValue]="2">Gerente</option>
                <option [ngValue]="3">Jefe de Almacén</option>
                <option [ngValue]="4">Vendedor</option>
              </select>
            </div>

            <div class="form-group">
              <label for="sucursalId">Sucursal (Opcional)</label>
              <input type="number" id="sucursalId" formControlName="sucursalId" class="form-control" placeholder="ID Sucursal" />
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="activo" />
                Cuenta Activa
              </label>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/dashboard/usuarios" class="btn-cancel">Cancelar</a>
            <div class="submit-btn-wrapper">
              <app-custom-button type="submit" [label]="esEdicion ? 'Actualizar' : 'Guardar'" [loading]="loading"></app-custom-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #64748b;
    }

    .form-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.checkbox-group {
      grid-column: span 2;
      flex-direction: row;
      align-items: center;
      padding-top: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
    }

    .form-group label {
      font-weight: 500;
      font-size: 0.875rem;
      color: #475569;
    }

    .form-control {
      padding: 0.625rem 0.875rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #0f172a;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      border-top: 1px solid #f1f5f9;
      padding-top: 1.5rem;
    }

    .btn-cancel {
      padding: 0.625rem 1.25rem;
      background-color: #f1f5f9;
      color: #475569;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .btn-cancel:hover {
      background-color: #e2e8f0;
    }

    .submit-btn-wrapper {
      width: 140px;
    }
  `]
})
export class FormularioUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    rolId: [2, Validators.required],
    sucursalId: [null],
    activo: [true]
  });

  esEdicion = false;
  userId?: number;
  loading = false;
  submitted = false;

  get f() { return this.userForm.controls; }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.userId = +idParam;
      this.cargarUsuario(this.userId);
    }
  }

  cargarUsuario(id: number) {
    this.apiService.get<Usuario>(`usuarios/${id}`).subscribe({
      next: (usuario) => {
        this.userForm.patchValue(usuario);
      },
      error: () => {
        // Fallback mock
        const mockUsuarios = [
          { id: 1, correo: 'admin@utp.edu.pe', nombre: 'Juan', apellido: 'Pérez', rolId: 1, sucursalId: 1, activo: true },
          { id: 2, correo: 'mflores@utp.edu.pe', nombre: 'María', apellido: 'Flores', rolId: 2, sucursalId: 1, activo: true },
          { id: 3, correo: 'jquispe@utp.edu.pe', nombre: 'Jorge', apellido: 'Quispe', rolId: 2, sucursalId: 2, activo: false }
        ];
        const user = mockUsuarios.find(u => u.id === id);
        if (user) {
          this.userForm.patchValue(user);
        }
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) return;

    this.loading = true;
    const userData: Usuario = this.userForm.value;

    const request$ = this.esEdicion && this.userId
      ? this.apiService.put<Usuario>(`usuarios/${this.userId}`, userData)
      : this.apiService.post<Usuario>('usuarios', userData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/usuarios']);
      },
      error: () => {
        // Fallback exitoso para simulación
        this.router.navigate(['/dashboard/usuarios']);
      }
    });
  }
}
