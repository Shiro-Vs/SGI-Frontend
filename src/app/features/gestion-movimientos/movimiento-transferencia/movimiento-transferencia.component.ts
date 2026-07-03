import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MovimientoService } from '../../../services/movimiento.service';
import { ProductoService } from '../../../services/producto.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { AuthService } from '../../../services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import Swal from 'sweetalert2';

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
            <a routerLink="/movimientos/historial" class="btn-secondary" [class.disabled]="loading">
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
      color: #3b82f6;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .form-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
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
      color: #94a3b8;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      font-size: 0.95rem;
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
      background-color: rgba(239, 68, 68, 0.1);
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
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
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
      border-top: 1px solid #334155;
      padding-top: 1.5rem;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.25rem;
      background-color: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-secondary:hover:not(.disabled) {
      background-color: #334155;
      border-color: #475569;
    }

    .btn-secondary:hover:not(.disabled) {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-secondary.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `]
})
export class MovimientoTransferenciaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private movimientoService = inject(MovimientoService);
  private productoService = inject(ProductoService);
  private mantenimientoService = inject(MantenimientoService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

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

    const user = this.authService.getUser();
    if (user && user.rol === 'JEFE_ALMACEN' && user.sucursalId) {
      this.transferenciaForm.patchValue({ sucursalOrigenId: user.sucursalId });
      this.transferenciaForm.get('sucursalOrigenId')?.disable();
    }
  }

  cargarProductos() {
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos = data.filter(p => p.activo);
        this.cdr.detectChanges();
      }
    });
  }

  cargarSucursales() {
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(s => s.activa);
        this.cdr.detectChanges();
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
    
    // Usar getRawValue() para incluir campos deshabilitados (como sucursalOrigenId bloqueado para jefe de almacén)
    const formValues = this.transferenciaForm.getRawValue();
    
    const body = {
      productoId: +formValues.productoId,
      sucursalOrigenId: +formValues.sucursalOrigenId,
      sucursalDestinoId: +formValues.sucursalDestinoId,
      cantidad: +formValues.cantidad,
      observacion: formValues.observacion
    };

    this.movimientoService.registrarTransferencia(body).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();

        Swal.fire({
          title: '¡Operación exitosa!',
          text: 'Transferencia registrada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/movimientos/historial']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges(); // <-- ESTO APAGA EL SPINNER EN CASO DE ERROR

        // Extraemos el mensaje exacto que tu backend mandó (ej. "Stock insuficiente...")
        const mensajeError = err.error?.message || 'No se pudo realizar la transferencia. Verifique el stock disponible.';
        
        // Mostramos el error en pantalla con SweetAlert
        Swal.fire({
          title: 'Operación denegada',
          text: mensajeError,
          icon: 'warning',
          confirmButtonText: 'Entendido'
        }).then(() => {
          this.router.navigate(['/movimientos/historial']);
        });
      }
    });
  }
}
