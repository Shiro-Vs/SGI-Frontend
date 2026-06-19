import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MovimientoService } from '../../../services/movimiento.service';
import { ProductoService } from '../../../services/producto.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { Producto } from '../../../core/models/producto.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-movimiento-transferencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CustomButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>Registrar Transferencia de Stock</h2>
        <p class="subtitle">Transfiere mercadería de una sucursal origen a otra sucursal de destino.</p>
      </div>

      <div class="form-card">
        <form [formGroup]="transferenciaForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            
            <!-- Producto -->
            <div class="form-group col-span-2">
              <label for="productoId">Producto a Transferir</label>
              <select
                id="productoId"
                formControlName="productoId"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['productoId'].errors }"
              >
                <option value="">Seleccione un producto</option>
                <option *ngFor="let prod of productos" [value]="prod.id">
                  {{ prod.nombre }} (SKU: {{ prod.sku }})
                </option>
              </select>
              <div *ngIf="submitted && f['productoId'].errors" class="invalid-feedback">
                El producto es obligatorio.
              </div>
            </div>

            <!-- Sucursal Origen -->
            <div class="form-group">
              <label for="sucursalOrigenId">Sucursal de Origen</label>
              <select
                id="sucursalOrigenId"
                formControlName="sucursalOrigenId"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['sucursalOrigenId'].errors }"
              >
                <option value="">Seleccione origen</option>
                <option *ngFor="let suc of sucursales" [value]="suc.id">
                  {{ suc.nombre }}
                </option>
              </select>
              <div *ngIf="submitted && f['sucursalOrigenId'].errors" class="invalid-feedback">
                La sucursal de origen es obligatoria.
              </div>
            </div>

            <!-- Sucursal Destino -->
            <div class="form-group">
              <label for="sucursalDestinoId">Sucursal de Destino</label>
              <select
                id="sucursalDestinoId"
                formControlName="sucursalDestinoId"
                class="form-control"
                [ngClass]="{ 'is-invalid': (submitted && f['sucursalDestinoId'].errors) || (submitted && transferenciaForm.errors?.['sameBranches']) }"
              >
                <option value="">Seleccione destino</option>
                <option *ngFor="let suc of sucursales" [value]="suc.id">
                  {{ suc.nombre }}
                </option>
              </select>
              <div *ngIf="submitted && f['sucursalDestinoId'].errors" class="invalid-feedback">
                La sucursal de destino es obligatoria.
              </div>
              <div *ngIf="submitted && transferenciaForm.errors?.['sameBranches']" class="invalid-feedback">
                La sucursal de destino debe ser diferente a la de origen.
              </div>
            </div>

            <!-- Cantidad -->
            <div class="form-group col-span-2">
              <label for="cantidad">Cantidad a Transferir</label>
              <input
                type="number"
                id="cantidad"
                formControlName="cantidad"
                placeholder="Ej. 25"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['cantidad'].errors }"
              />
              <div *ngIf="submitted && f['cantidad'].errors" class="invalid-feedback">
                <span *ngIf="f['cantidad'].errors['required']">La cantidad es obligatoria.</span>
                <span *ngIf="f['cantidad'].errors['min']">Debe ser mayor a 0.</span>
              </div>
            </div>

            <!-- Observación -->
            <div class="form-group col-span-2">
              <label for="observacion">Observación</label>
              <textarea
                id="observacion"
                formControlName="observacion"
                placeholder="Ej. Reabastecimiento de urgencia, traslado por inventario..."
                class="form-control textarea"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div *ngIf="error" class="alert-error">
            {{ error }}
          </div>

          <div class="form-actions">
            <a routerLink="/dashboard" class="btn-secondary">
              Cancelar
            </a>
            <app-custom-button
              type="submit"
              label="Registrar Transferencia"
              [loading]="loading"
            ></app-custom-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 650px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #2563eb;
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

    .col-span-2 {
      grid-column: span 2;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .form-control.is-invalid {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.75rem;
    }

    .textarea {
      resize: vertical;
      font-family: inherit;
    }

    .alert-error {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: #ef4444;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-top: 1.5rem;
      text-align: center;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 1.5rem;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.25rem;
      background-color: white;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }
  `]
})
export class MovimientoTransferenciaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movimientoService = inject(MovimientoService);
  private productoService = inject(ProductoService);
  private mantenimientoService = inject(MantenimientoService);
  private router = inject(Router);

  transferenciaForm: FormGroup = this.fb.group({
    productoId: ['', Validators.required],
    sucursalOrigenId: ['', Validators.required],
    sucursalDestinoId: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(1)]],
    observacion: ['']
  }, { validators: this.branchDifferenceValidator });

  productos: Producto[] = [];
  sucursales: Sucursal[] = [];
  loading = false;
  submitted = false;
  error = '';

  get f() {
    return this.transferenciaForm.controls;
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarSucursales();
  }

  cargarProductos() {
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos = data.filter(p => p.activo);
      }
    });
  }

  cargarSucursales() {
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(s => s.activa);
      }
    });
  }

  branchDifferenceValidator(group: FormGroup) {
    const origin = group.get('sucursalOrigenId')?.value;
    const dest = group.get('sucursalDestinoId')?.value;
    if (origin && dest && origin === dest) {
      return { sameBranches: true };
    }
    return null;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.transferenciaForm.invalid) {
      return;
    }

    this.loading = true;
    const body = {
      productoId: +this.f['productoId'].value,
      sucursalOrigenId: +this.f['sucursalOrigenId'].value,
      sucursalDestinoId: +this.f['sucursalDestinoId'].value,
      cantidad: +this.f['cantidad'].value,
      observacion: this.f['observacion'].value
    };

    this.movimientoService.registrarTransferencia(body).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/productos']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar la transferencia. Verifique si la sucursal de origen tiene stock suficiente.';
        this.loading = false;
      }
    });
  }
}
