import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { AuthService } from '../../../services/auth.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-sucursales-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoPipe, CustomButtonComponent],
  template: `
    <div class="sucursal-layout">
      <!-- Tabla de Sucursales -->
      <div class="list-section" [ngClass]="{ 'full-width': !isAdmin }">
        <div class="list-header">
          <div>
            <h2>Sucursales (Locales)</h2>
            <p class="subtitle">Lista y locales físicos autorizados en el sistema.</p>
          </div>
        </div>

        <div class="table-card">
          <div *ngIf="loading" class="loading-state">
            Cargando sucursales...
          </div>

          <div *ngIf="!loading && sucursales.length === 0" class="empty-state">
            No hay sucursales registradas.
          </div>

          <table *ngIf="!loading && sucursales.length > 0" class="sucursal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Distrito</th>
                <th>Estado</th>
                <th class="actions-col" *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of sucursales">
                <td>{{ s.id }}</td>
                <td class="bold-text">{{ s.nombre }}</td>
                <td>{{ s.direccion }}</td>
                <td><span class="district-badge">{{ s.distrito }}</span></td>
                <td>
                  <span class="status-pill" [ngClass]="s.activa ? 'activo' : 'inactivo'">
                    {{ s.activa | estado }}
                  </span>
                </td>
                <td class="actions-cell" *ngIf="isAdmin">
                  <button (click)="cargarEdicion(s)" class="action-btn edit" title="Editar">✏️</button>
                  <button (click)="desactivarSucursal(s.id)" class="action-btn delete" title="Desactivar">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Formulario Lateral (Solo ADMIN) -->
      <div class="form-section" *ngIf="isAdmin">
        <div class="form-card">
          <h3>{{ esEdicion ? 'Editar Sucursal' : 'Nueva Sucursal' }}</h3>
          <p class="subtitle">Complete la información para guardar el local.</p>
          
          <form [formGroup]="sucursalForm" (ngSubmit)="onSubmit()" class="suc-form">
            
            <div class="form-group">
              <label for="nombre">Nombre del Local</label>
              <input
                type="text"
                id="nombre"
                formControlName="nombre"
                placeholder="Ej. Minimarket SGI Lince"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['nombre'].errors }"
              />
              <div *ngIf="submitted && f['nombre'].errors" class="invalid-feedback">
                El nombre es obligatorio.
              </div>
            </div>

            <div class="form-group">
              <label for="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                formControlName="direccion"
                placeholder="Dirección física"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['direccion'].errors }"
              />
              <div *ngIf="submitted && f['direccion'].errors" class="invalid-feedback">
                La dirección es obligatoria.
              </div>
            </div>

            <div class="form-group">
              <label for="distrito">Distrito</label>
              <input
                type="text"
                id="distrito"
                formControlName="distrito"
                placeholder="Ej. Lince, San Isidro"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['distrito'].errors }"
              />
              <div *ngIf="submitted && f['distrito'].errors" class="invalid-feedback">
                El distrito es obligatorio.
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="activa" />
                Sucursal Activa
              </label>
            </div>

            <div *ngIf="error" class="alert-error">
              {{ error }}
            </div>

            <div class="form-actions">
              <button
                type="button"
                *ngIf="esEdicion"
                (click)="cancelarEdicion()"
                class="btn-secondary-sm"
              >
                Cancelar
              </button>
              <app-custom-button
                type="submit"
                [label]="esEdicion ? 'Actualizar' : 'Crear'"
                [loading]="formLoading"
              ></app-custom-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sucursal-layout {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .list-section {
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .list-section.full-width {
      flex: 1;
    }

    .form-section {
      flex: 1.5;
      position: sticky;
      top: 90px;
    }

    .list-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.85rem;
      color: #64748b;
    }

    .table-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }

    .sucursal-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .sucursal-table th {
      background-color: #f8fafc;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }

    .sucursal-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .bold-text {
      font-weight: 600;
      color: #0f172a;
    }

    .district-badge {
      font-size: 0.8rem;
      background-color: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .status-pill.activo {
      background-color: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .status-pill.inactivo {
      background-color: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .actions-col {
      width: 100px;
      text-align: center;
    }

    .actions-cell {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background-color: white;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background-color: #f1f5f9;
    }

    .action-btn.edit:hover {
      color: #f59e0b;
      border-color: #f59e0b;
    }

    .action-btn.delete:hover {
      color: #ef4444;
      border-color: #ef4444;
    }

    /* Form Styles */
    .form-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .form-card h3 {
      margin: 0;
      color: #0f172a;
      font-size: 1.15rem;
    }

    .suc-form {
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }

    .form-control {
      width: 100%;
      padding: 0.6rem 0.85rem;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9rem;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4f46e5;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .form-control.is-invalid {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.75rem;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500 !important;
      color: #334155 !important;
    }

    .checkbox-label input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .alert-error {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: #ef4444;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      text-align: center;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
    }

    .btn-secondary-sm {
      padding: 0.5rem 1rem;
      background-color: white;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-weight: 600;
      font-size: 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary-sm:hover {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }
  `]
})
export class SucursalesListaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  sucursales: Sucursal[] = [];
  loading = true;
  isAdmin = false;

  sucursalForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    distrito: ['', Validators.required],
    activa: [true]
  });

  esEdicion = false;
  editingId?: number;
  formLoading = false;
  submitted = false;
  error = '';

  get f() {
    return this.sucursalForm.controls;
  }

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.loading = true;
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.sucursalForm.invalid) {
      return;
    }

    this.formLoading = true;
    const body = this.sucursalForm.value;

    if (this.esEdicion && this.editingId) {
      this.mantenimientoService.actualizarSucursal(this.editingId, body).subscribe({
        next: () => {
          this.formLoading = false;
          this.cancelarEdicion();
          this.cargarSucursales();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar la sucursal.';
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.mantenimientoService.crearSucursal(body).subscribe({
        next: () => {
          this.formLoading = false;
          this.sucursalForm.reset({ activa: true });
          this.submitted = false;
          this.cargarSucursales();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear la sucursal.';
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cargarEdicion(s: Sucursal) {
    this.esEdicion = true;
    this.editingId = s.id;
    this.sucursalForm.patchValue({
      nombre: s.nombre,
      direccion: s.direccion,
      distrito: s.distrito,
      activa: s.activa
    });
    this.cdr.detectChanges();
  }

  cancelarEdicion() {
    this.esEdicion = false;
    this.editingId = undefined;
    this.sucursalForm.reset({ activa: true });
    this.submitted = false;
    this.error = '';
    this.cdr.detectChanges();
  }

  desactivarSucursal(id: number | undefined) {
    if (!id || !confirm('¿Está seguro de desactivar esta sucursal?')) return;

    this.mantenimientoService.desactivarSucursal(id).subscribe({
      next: () => {
        this.cargarSucursales();
      }
    });
  }
}
