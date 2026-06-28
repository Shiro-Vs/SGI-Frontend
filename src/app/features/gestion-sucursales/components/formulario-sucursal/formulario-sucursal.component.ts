import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MantenimientoService } from '../../../../services/mantenimiento.service';
import { Sucursal } from '../../../../core/models/sucursal.model';
import { CustomButtonComponent } from '../../../../shared/components/custom-button/custom-button.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomButtonComponent],
  template: `
    <div class="form-wrapper">
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
            <span *ngIf="f['nombre'].errors['required']">El nombre es obligatorio.</span>
            <span *ngIf="f['nombre'].errors['maxlength']">Máximo 100 caracteres.</span>
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
            <span *ngIf="f['direccion'].errors['required']">La dirección es obligatoria.</span>
            <span *ngIf="f['direccion'].errors['maxlength']">Máximo 200 caracteres.</span>
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
            <span *ngIf="f['distrito'].errors['required']">El distrito es obligatorio.</span>
            <span *ngIf="f['distrito'].errors['maxlength']">Máximo 100 caracteres.</span>
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
          <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="loading">Cancelar</button>
          <div class="submit-btn-wrapper">
            <app-custom-button type="submit" [label]="esEdicion ? 'Actualizar' : 'Crear'" [loading]="loading"></app-custom-button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-wrapper {
      width: 100%;
    }

    .suc-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      font-size: 0.85rem;
      color: #475569;
    }

    .form-control {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid #334155;
      border-radius: 8px;
      font-size: 0.95rem;
      background-color: #0f172a;
      color: #f8fafc;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .form-control.is-invalid {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      padding-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #cbd5e1;
      cursor: pointer;
    }

    .checkbox-label input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .alert-error {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      text-align: center;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
      border-top: 1px solid #334155;
      padding-top: 1.5rem;
    }

    .btn-cancel {
      padding: 0.6rem 1.25rem;
      background-color: #0f172a;
      color: #cbd5e1;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #334155;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background-color: #334155;
      color: white;
    }

    .submit-btn-wrapper {
      width: 150px;
    }
  `]
})
export class FormularioSucursalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);

  @Input() esEdicion = false;
  @Input() sucursalId?: number;
  
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  sucursalForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    distrito: ['', [Validators.required, Validators.maxLength(100)]],
    activa: [true]
  });

  loading = false;
  submitted = false;
  error = '';

  get f() { return this.sucursalForm.controls; }

  ngOnInit() {
    if (this.esEdicion && this.sucursalId) {
      this.cargarSucursal(this.sucursalId);
    }
  }

  cargarSucursal(id: number) {
    this.mantenimientoService.listarSucursales().subscribe({
      next: (sucursales) => {
        const sucursal = sucursales.find(s => s.id === id);
        if (sucursal) {
          this.sucursalForm.patchValue(sucursal);
        }
      }
    });
  }

  onCancel() {
    this.cancelado.emit();
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.sucursalForm.invalid) return;

    this.loading = true;
    const body = this.sucursalForm.value;

    const request$ = this.esEdicion && this.sucursalId
      ? this.mantenimientoService.actualizarSucursal(this.sucursalId, body)
      : this.mantenimientoService.crearSucursal(body);

    request$.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: '¡Operación exitosa!',
          text: this.esEdicion ? 'Sucursal actualizada correctamente.' : 'Sucursal creada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.guardado.emit();
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al guardar la sucursal.';
        this.loading = false;
      }
    });
  }
}
