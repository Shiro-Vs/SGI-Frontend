import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MantenimientoService } from '../../../../services/mantenimiento.service';
import { CustomButtonComponent } from '../../../../shared/components/custom-button/custom-button.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomButtonComponent],
  template: `
    <div class="form-wrapper">
      <form [formGroup]="categoriaForm" (ngSubmit)="onSubmit()" class="cat-form">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            formControlName="nombre"
            placeholder="Ej. Abarrotes, Bebidas"
            class="form-control"
            [ngClass]="{ 'is-invalid': submitted && f['nombre'].errors }"
          />
          <div *ngIf="submitted && f['nombre'].errors" class="invalid-feedback">
            <span *ngIf="f['nombre'].errors['required']">El nombre es obligatorio.</span>
            <span *ngIf="f['nombre'].errors['maxlength']">Máximo 100 caracteres.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            formControlName="descripcion"
            placeholder="Detalle de los artículos de esta categoría..."
            class="form-control textarea"
            [ngClass]="{ 'is-invalid': submitted && f['descripcion'].errors }"
            rows="3"
          ></textarea>
          <div *ngIf="submitted && f['descripcion'].errors" class="invalid-feedback">
            <span *ngIf="f['descripcion'].errors['maxlength']">Máximo 255 caracteres.</span>
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="activa" />
            Categoría Activa
          </label>
        </div>

        <div *ngIf="error" class="alert-error">{{ error }}</div>

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
    .form-wrapper { width: 100%; }
    .cat-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-weight: 500; font-size: 0.85rem; color: #94a3b8; }
    .form-control {
      width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #334155;
      border-radius: 8px; font-size: 0.95rem; background-color: #0f172a; color: #f8fafc;
      box-sizing: border-box; transition: all 0.2s;
    }
    .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .form-control.is-invalid { border-color: #ef4444; background-color: rgba(239, 68, 68, 0.1); }
    .textarea { resize: vertical; font-family: inherit; }
    .invalid-feedback { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }
    .checkbox-group { flex-direction: row; align-items: center; padding-top: 0.5rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: #cbd5e1; cursor: pointer; }
    .checkbox-label input { width: 16px; height: 16px; cursor: pointer; }
    .alert-error {
      background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171;
      padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; text-align: center;
    }
    .form-actions {
      display: flex; justify-content: flex-end; align-items: center; gap: 1rem;
      margin-top: 1.5rem; border-top: 1px solid #334155; padding-top: 1.5rem;
    }
    .btn-cancel {
      padding: 0.6rem 1.25rem; background-color: #0f172a; color: #cbd5e1;
      border: 1px solid #334155; border-radius: 8px; font-weight: 600; font-size: 0.95rem;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background-color: #334155; color: white; }
    .submit-btn-wrapper { width: 150px; }
  `]
})
export class FormularioCategoriaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);

  @Input() esEdicion = false;
  @Input() categoriaId?: number;

  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  categoriaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(255)],
    activa: [true]
  });

  loading = false;
  submitted = false;
  error = '';

  get f() { return this.categoriaForm.controls; }

  ngOnInit() {
    if (this.esEdicion && this.categoriaId) {
      this.cargarCategoria(this.categoriaId);
    }
  }

  cargarCategoria(id: number) {
    this.mantenimientoService.listarCategorias().subscribe({
      next: (cats) => {
        const cat = cats.find(c => c.id === id);
        if (cat) this.categoriaForm.patchValue(cat);
      }
    });
  }

  onCancel() { this.cancelado.emit(); }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.categoriaForm.invalid) return;

    this.loading = true;
    const body = this.categoriaForm.value;

    const request$ = this.esEdicion && this.categoriaId
      ? this.mantenimientoService.actualizarCategoria(this.categoriaId, body)
      : this.mantenimientoService.crearCategoria(body);

    request$.subscribe({
      next: () => { 
        this.loading = false; 
        Swal.fire({
          title: '¡Operación exitosa!',
          text: this.esEdicion ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.guardado.emit();
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al guardar la categoría.';
        this.loading = false;
      }
    });
  }
}
