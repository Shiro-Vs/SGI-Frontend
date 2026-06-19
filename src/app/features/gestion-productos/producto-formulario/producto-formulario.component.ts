import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoService } from '../../../services/producto.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { Categoria } from '../../../core/models/categoria.model';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-producto-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CustomButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <p class="subtitle">Complete la información para registrar o modificar el producto en el catálogo.</p>
      </div>

      <div class="form-card">
        <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            
            <!-- SKU -->
            <div class="form-group">
              <label for="sku">SKU (Código Único)</label>
              <input
                type="text"
                id="sku"
                formControlName="sku"
                placeholder="Ej. BEB-001"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['sku'].errors }"
              />
              <div *ngIf="submitted && f['sku'].errors" class="invalid-feedback">
                <span *ngIf="f['sku'].errors['required']">El SKU es requerido.</span>
                <span *ngIf="f['sku'].errors['maxlength']">Máximo 30 caracteres.</span>
              </div>
            </div>

            <!-- Nombre -->
            <div class="form-group">
              <label for="nombre">Nombre Comercial</label>
              <input
                type="text"
                id="nombre"
                formControlName="nombre"
                placeholder="Nombre del producto"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['nombre'].errors }"
              />
              <div *ngIf="submitted && f['nombre'].errors" class="invalid-feedback">
                <span *ngIf="f['nombre'].errors['required']">El nombre es requerido.</span>
                <span *ngIf="f['nombre'].errors['maxlength']">Máximo 120 caracteres.</span>
              </div>
            </div>

            <!-- Categoría -->
            <div class="form-group">
              <label for="categoriaId">Categoría</label>
              <select
                id="categoriaId"
                formControlName="categoriaId"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['categoriaId'].errors }"
              >
                <option value="">Seleccione una categoría</option>
                <option *ngFor="let cat of categorias" [value]="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
              <div *ngIf="submitted && f['categoriaId'].errors" class="invalid-feedback">
                La categoría es obligatoria.
              </div>
            </div>

            <!-- Unidad de Medida -->
            <div class="form-group">
              <label for="unidadMedida">Unidad de Medida</label>
              <input
                type="text"
                id="unidadMedida"
                formControlName="unidadMedida"
                placeholder="Ej. Unidad, Litro, Bolsa, Lata"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['unidadMedida'].errors }"
              />
              <div *ngIf="submitted && f['unidadMedida'].errors" class="invalid-feedback">
                La unidad de medida es requerida.
              </div>
            </div>

            <!-- Precio de Compra -->
            <div class="form-group">
              <label for="precioCompra">Precio de Compra (S/)</label>
              <input
                type="number"
                step="0.01"
                id="precioCompra"
                formControlName="precioCompra"
                placeholder="0.00"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['precioCompra'].errors }"
              />
              <div *ngIf="submitted && f['precioCompra'].errors" class="invalid-feedback">
                <span *ngIf="f['precioCompra'].errors['required']">El precio de compra es requerido.</span>
                <span *ngIf="f['precioCompra'].errors['min']">Debe ser mayor a 0.01.</span>
              </div>
            </div>

            <!-- Precio de Venta -->
            <div class="form-group">
              <label for="precioVenta">Precio de Venta (S/)</label>
              <input
                type="number"
                step="0.01"
                id="precioVenta"
                formControlName="precioVenta"
                placeholder="0.00"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['precioVenta'].errors }"
              />
              <div *ngIf="submitted && f['precioVenta'].errors" class="invalid-feedback">
                <span *ngIf="f['precioVenta'].errors['required']">El precio de venta es requerido.</span>
                <span *ngIf="f['precioVenta'].errors['min']">Debe ser mayor a 0.01.</span>
              </div>
            </div>

            <!-- Stock Mínimo -->
            <div class="form-group">
              <label for="stockMinimo">Stock Mínimo</label>
              <input
                type="number"
                id="stockMinimo"
                formControlName="stockMinimo"
                placeholder="0"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['stockMinimo'].errors }"
              />
              <div *ngIf="submitted && f['stockMinimo'].errors" class="invalid-feedback">
                <span *ngIf="f['stockMinimo'].errors['required']">El stock mínimo es requerido.</span>
                <span *ngIf="f['stockMinimo'].errors['min']">No puede ser negativo.</span>
              </div>
            </div>

            <!-- Stock Máximo -->
            <div class="form-group">
              <label for="stockMaximo">Stock Máximo</label>
              <input
                type="number"
                id="stockMaximo"
                formControlName="stockMaximo"
                placeholder="0"
                class="form-control"
                [ngClass]="{ 'is-invalid': submitted && f['stockMaximo'].errors }"
              />
              <div *ngIf="submitted && f['stockMaximo'].errors" class="invalid-feedback">
                <span *ngIf="f['stockMaximo'].errors['required']">El stock máximo es requerido.</span>
                <span *ngIf="f['stockMaximo'].errors['min']">No puede ser negativo.</span>
              </div>
            </div>

            <!-- Descripción (Toma 2 columnas) -->
            <div class="form-group col-span-2">
              <label for="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                formControlName="descripcion"
                placeholder="Detalles sobre el producto..."
                class="form-control textarea"
                rows="3"
              ></textarea>
            </div>

            <!-- Activo (Solo visible en edición) -->
            <div class="form-group col-span-2 checkbox-group" *ngIf="esEdicion">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="activo" />
                Producto Activo en Catálogo
              </label>
            </div>
          </div>

          <div *ngIf="error" class="alert-error">
            {{ error }}
          </div>

          <div class="form-actions">
            <a routerLink="/dashboard/productos" class="btn-secondary">
              Cancelar
            </a>
            <app-custom-button
              type="submit"
              [label]="esEdicion ? 'Actualizar Producto' : 'Guardar Producto'"
              [loading]="loading"
            ></app-custom-button>
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

    .textarea {
      resize: vertical;
      font-family: inherit;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      padding: 0.5rem 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500 !important;
      color: #334155 !important;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
      cursor: pointer;
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
export class ProductoFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private mantenimientoService = inject(MantenimientoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productoForm: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    categoriaId: ['', Validators.required],
    unidadMedida: ['', Validators.required],
    precioCompra: ['', [Validators.required, Validators.min(0.01)]],
    precioVenta: ['', [Validators.required, Validators.min(0.01)]],
    stockMinimo: ['', [Validators.required, Validators.min(0)]],
    stockMaximo: ['', [Validators.required, Validators.min(0)]],
    descripcion: [''],
    activo: [true]
  });

  esEdicion = false;
  productoId?: number;
  categorias: Categoria[] = [];
  loading = false;
  submitted = false;
  error = '';

  get f() {
    return this.productoForm.controls;
  }

  ngOnInit() {
    this.cargarCategorias();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.productoId = +idParam;
      this.cargarProducto(this.productoId);
    }
  }

  cargarCategorias() {
    this.mantenimientoService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data.filter(c => c.activa);
      }
    });
  }

  cargarProducto(id: number) {
    this.loading = true;
    this.productoService.obtenerPorId(id).subscribe({
      next: (prod) => {
        let catId = '';
        if (prod.categoriaId) {
          catId = prod.categoriaId.toString();
        } else if (prod.categoria && typeof prod.categoria === 'object') {
          catId = prod.categoria.id?.toString() || '';
        }
        
        this.productoForm.patchValue({
          sku: prod.sku,
          nombre: prod.nombre,
          categoriaId: catId,
          unidadMedida: prod.unidadMedida,
          precioCompra: prod.precioCompra,
          precioVenta: prod.precioVenta,
          stockMinimo: prod.stockMinimo,
          stockMaximo: prod.stockMaximo,
          descripcion: prod.descripcion,
          activo: prod.activo
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la información del producto.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.productoForm.invalid) {
      return;
    }

    this.loading = true;
    const formVal = this.productoForm.value;
    const body = {
      ...formVal,
      categoriaId: +formVal.categoriaId
    };

    if (this.esEdicion && this.productoId) {
      this.productoService.actualizar(this.productoId, body).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/productos']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar el producto.';
          this.loading = false;
        }
      });
    } else {
      this.productoService.crear(body).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/productos']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear el producto.';
          this.loading = false;
        }
      });
    }
  }
}
