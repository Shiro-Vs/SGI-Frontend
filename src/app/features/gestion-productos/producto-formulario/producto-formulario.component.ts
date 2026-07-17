import { Component, OnInit, Input, Output, EventEmitter, inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { Categoria } from '../../../core/models/categoria.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import { AppSwal as Swal } from '../../../shared/utils/swal-theme';

@Component({
  selector: 'app-producto-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomButtonComponent],
  template: `
    <div class="form-wrapper">
      <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <!-- SKU -->
          <div class="form-group">
            <label for="sku">SKU (Código Único)</label>
            <input type="text" id="sku" formControlName="sku" placeholder="Ej. BEB-001" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['sku'].errors }" />
            <div *ngIf="submitted && f['sku'].errors" class="invalid-feedback">
              <span *ngIf="f['sku'].errors['required']">El SKU es requerido.</span>
              <span *ngIf="f['sku'].errors['maxlength']">Máximo 30 caracteres.</span>
            </div>
          </div>

          <!-- Nombre -->
          <div class="form-group">
            <label for="nombre">Nombre Comercial</label>
            <input type="text" id="nombre" formControlName="nombre" placeholder="Nombre del producto" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['nombre'].errors }" />
            <div *ngIf="submitted && f['nombre'].errors" class="invalid-feedback">
              <span *ngIf="f['nombre'].errors['required']">El nombre es requerido.</span>
              <span *ngIf="f['nombre'].errors['maxlength']">Máximo 120 caracteres.</span>
            </div>
          </div>

          <!-- Categoría -->
          <div class="form-group">
            <label>Categoría</label>
            <div class="custom-select-wrapper" [class.open]="catDropdownOpen" [class.is-invalid-wrapper]="submitted && f['categoriaId'].errors">
              <button type="button" class="custom-select-trigger" #catTriggerRef (click)="toggleCatDropdown($event)">
                <span class="trigger-content">
                  <span *ngIf="!selectedCategoria" class="placeholder">Seleccione una categoría</span>
                  <span *ngIf="selectedCategoria" class="selected-name">{{ selectedCategoria.nombre }}</span>
                </span>
                <span class="chevron" [class.rotated]="catDropdownOpen">▾</span>
              </button>
              <div
                class="custom-dropdown-panel"
                *ngIf="catDropdownOpen"
                [style.position]="'fixed'"
                [style.top.px]="catDropdownTop"
                [style.left.px]="catDropdownLeft"
                [style.width.px]="catDropdownWidth"
              >
                <div class="dropdown-options">
                  <button
                    type="button"
                    class="option-item"
                    *ngFor="let cat of categorias"
                    (click)="seleccionarCategoria(cat)"
                    [class.selected]="selectedCategoria?.id === cat.id"
                  >
                    <span class="option-name">{{ cat.nombre }}</span>
                  </button>
                  <div *ngIf="categorias.length === 0" class="no-results">Sin categorías disponibles</div>
                </div>
              </div>
            </div>
            <div *ngIf="submitted && f['categoriaId'].errors" class="invalid-feedback">La categoría es obligatoria.</div>
          </div>

          <!-- Sucursal -->
          <div class="form-group">
            <label>Sucursal</label>
            <div class="custom-select-wrapper" [class.open]="sucDropdownOpen" [class.is-invalid-wrapper]="submitted && f['sucursalId'].errors">
              <button type="button" class="custom-select-trigger" #sucTriggerRef (click)="toggleSucDropdown($event)">
                <span class="trigger-content">
                  <span *ngIf="!selectedSucursal" class="placeholder">Seleccione una sucursal</span>
                  <span *ngIf="selectedSucursal" class="selected-name">{{ selectedSucursal.nombre }}</span>
                </span>
                <span class="chevron" [class.rotated]="sucDropdownOpen">▾</span>
              </button>
              <div
                class="custom-dropdown-panel"
                *ngIf="sucDropdownOpen"
                [style.position]="'fixed'"
                [style.top.px]="sucDropdownTop"
                [style.left.px]="sucDropdownLeft"
                [style.width.px]="sucDropdownWidth"
              >
                <div class="dropdown-options">
                  <button
                    type="button"
                    class="option-item"
                    *ngFor="let suc of sucursales"
                    (click)="seleccionarSucursal(suc)"
                    [class.selected]="selectedSucursal?.id === suc.id"
                  >
                    <span class="option-name">{{ suc.nombre }}</span>
                  </button>
                  <div *ngIf="sucursales.length === 0" class="no-results">Sin sucursales disponibles</div>
                </div>
              </div>
            </div>
            <div *ngIf="submitted && f['sucursalId'].errors" class="invalid-feedback">La sucursal es obligatoria.</div>
          </div>

          <!-- Unidad de Medida -->
          <div class="form-group">
            <label for="unidadMedida">Unidad de Medida</label>
            <input type="text" id="unidadMedida" formControlName="unidadMedida" placeholder="Ej. Unidad, Litro, Bolsa" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['unidadMedida'].errors }" />
            <div *ngIf="submitted && f['unidadMedida'].errors" class="invalid-feedback">
              <span *ngIf="f['unidadMedida'].errors['required']">La unidad de medida es requerida.</span>
              <span *ngIf="f['unidadMedida'].errors['maxlength']">Máximo 50 caracteres.</span>
            </div>
          </div>

          <!-- Precio Compra -->
          <div class="form-group">
            <label for="precioCompra">Precio de Compra (S/)</label>
            <input type="number" step="0.01" id="precioCompra" formControlName="precioCompra" placeholder="0.00" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['precioCompra'].errors }" />
            <div *ngIf="submitted && f['precioCompra'].errors" class="invalid-feedback">
              <span *ngIf="f['precioCompra'].errors['required']">El precio de compra es requerido.</span>
              <span *ngIf="f['precioCompra'].errors['min']">Debe ser mayor a 0.01.</span>
            </div>
          </div>

          <!-- Precio Venta -->
          <div class="form-group">
            <label for="precioVenta">Precio de Venta (S/)</label>
            <input type="number" step="0.01" id="precioVenta" formControlName="precioVenta" placeholder="0.00" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['precioVenta'].errors }" />
            <div *ngIf="submitted && f['precioVenta'].errors" class="invalid-feedback">
              <span *ngIf="f['precioVenta'].errors['required']">El precio de venta es requerido.</span>
              <span *ngIf="f['precioVenta'].errors['min']">Debe ser mayor a 0.01.</span>
            </div>
          </div>

          <!-- Stock Mínimo -->
          <div class="form-group">
            <label for="stockMinimo">Stock Mínimo</label>
            <input type="number" id="stockMinimo" formControlName="stockMinimo" placeholder="0" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['stockMinimo'].errors }" />
            <div *ngIf="submitted && f['stockMinimo'].errors" class="invalid-feedback">
              <span *ngIf="f['stockMinimo'].errors['required']">El stock mínimo es requerido.</span>
              <span *ngIf="f['stockMinimo'].errors['min']">No puede ser negativo.</span>
            </div>
          </div>

          <!-- Stock Máximo -->
          <div class="form-group">
            <label for="stockMaximo">Stock Máximo</label>
            <input type="number" id="stockMaximo" formControlName="stockMaximo" placeholder="0" class="form-control" [ngClass]="{ 'is-invalid': submitted && f['stockMaximo'].errors }" />
            <div *ngIf="submitted && f['stockMaximo'].errors" class="invalid-feedback">
              <span *ngIf="f['stockMaximo'].errors['required']">El stock máximo es requerido.</span>
              <span *ngIf="f['stockMaximo'].errors['min']">No puede ser negativo.</span>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-group col-span-2">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" formControlName="descripcion" placeholder="Detalles sobre el producto..." class="form-control textarea" [ngClass]="{ 'is-invalid': submitted && f['descripcion'].errors }" rows="2"></textarea>
            <div *ngIf="submitted && f['descripcion'].errors" class="invalid-feedback">
              <span *ngIf="f['descripcion'].errors['maxlength']">Máximo 255 caracteres.</span>
            </div>
          </div>

          <!-- Activo -->
          <div class="form-group col-span-2 checkbox-group" *ngIf="esEdicion">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="activo" />
              Producto Activo en Catálogo
            </label>
          </div>
        </div>

        <div *ngIf="error" class="alert-error">{{ error }}</div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="loading">Cancelar</button>
          <app-custom-button type="submit" [label]="esEdicion ? 'Actualizar Producto' : 'Guardar Producto'" [loading]="loading"></app-custom-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-wrapper { width: 100%; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .col-span-2 { grid-column: span 2; }

    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }

    .form-group label { font-size: 0.85rem; font-weight: 600; color: #94a3b8; }

    .form-control {
      width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #334155;
      border-radius: 8px; font-size: 0.9rem; background-color: #0f172a; color: #f8fafc;
      box-sizing: border-box; transition: all 0.2s;
    }

    .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .form-control.is-invalid { border-color: #ef4444; background-color: rgba(239, 68, 68, 0.1); }
    .invalid-feedback { color: #ef4444; font-size: 0.75rem; }
    .textarea { resize: vertical; font-family: inherit; }

    .checkbox-group { flex-direction: row; align-items: center; padding: 0.5rem 0; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 500 !important; color: #cbd5e1 !important; }
    .checkbox-label input { width: 18px; height: 18px; cursor: pointer; }

    .alert-error {
      background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171;
      padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; margin-top: 1.5rem; text-align: center;
    }

    .form-actions {
      display: flex; justify-content: flex-end; align-items: center; gap: 1rem;
      margin-top: 1.5rem; border-top: 1px solid #334155; padding-top: 1.5rem;
    }

    .btn-cancel {
      padding: 0.6rem 1.25rem; background-color: #0f172a; color: #cbd5e1;
      border: 1px solid #334155; border-radius: 8px; font-weight: 600; font-size: 0.9rem;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background-color: #334155; color: white; }

    /* Custom Dropdown */
    .custom-select-wrapper { position: relative; }

    .custom-select-trigger {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 0.8rem; border: 1px solid #334155; border-radius: 8px;
      background-color: #0f172a; cursor: pointer; text-align: left; font-size: 0.9rem;
      color: #f8fafc; box-sizing: border-box; transition: all 0.2s;
    }

    .custom-select-wrapper.open .custom-select-trigger,
    .custom-select-trigger:focus {
      outline: none; border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }

    .is-invalid-wrapper .custom-select-trigger { border-color: #ef4444; background-color: rgba(239, 68, 68, 0.1); }

    .trigger-content { flex: 1; overflow: hidden; }
    .placeholder { color: #64748b; }
    .selected-name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #f8fafc; }

    .chevron { font-size: 1rem; color: #64748b; transition: transform 0.2s; flex-shrink: 0; margin-left: 0.5rem; }
    .chevron.rotated { transform: rotate(180deg); }

    .custom-dropdown-panel {
      background: #1e293b; border: 1px solid #334155; border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 9999; overflow: hidden;
    }

    .dropdown-options { max-height: 200px; overflow-y: auto; }

    .option-item {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 0.65rem 1rem; border: none; background: transparent;
      cursor: pointer; text-align: left; font-size: 0.9rem; color: #f8fafc;
      transition: background-color 0.15s;
    }
    .option-item:hover { background-color: #334155; }
    .option-item.selected { background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .option-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .no-results { padding: 1.25rem; text-align: center; color: #94a3b8; font-size: 0.85rem; }
  `]
})
export class ProductoFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private mantenimientoService = inject(MantenimientoService);

  @Input() esEdicion = false;
  @Input() productoId?: number;

  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  productoForm: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    categoriaId: ['', Validators.required],
    sucursalId: ['', Validators.required],
    unidadMedida: ['', [Validators.required, Validators.maxLength(50)]],
    precioCompra: ['', [Validators.required, Validators.min(0.01)]],
    precioVenta: ['', [Validators.required, Validators.min(0.01)]],
    stockMinimo: ['', [Validators.required, Validators.min(0)]],
    stockMaximo: ['', [Validators.required, Validators.min(0)]],
    descripcion: ['', Validators.maxLength(255)],
    activo: [true]
  });

  categorias: Categoria[] = [];
  loading = false;
  submitted = false;
  error = '';
  catDropdownOpen = false;
  catDropdownTop = 0;
  catDropdownLeft = 0;
  catDropdownWidth = 0;
  selectedCategoria: Categoria | null = null;

  sucursales: Sucursal[] = [];
  sucDropdownOpen = false;
  sucDropdownTop = 0;
  sucDropdownLeft = 0;
  sucDropdownWidth = 0;
  selectedSucursal: Sucursal | null = null;

  @ViewChild('catTriggerRef') catTriggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('sucTriggerRef') sucTriggerRef!: ElementRef<HTMLButtonElement>;

  get f() {
    return this.productoForm.controls;
  }

  ngOnInit() {
    this.cargarCategorias();
    this.cargarSucursales();
    if (this.esEdicion && this.productoId) {
      this.cargarProducto(this.productoId);
    }
  }

  cargarCategorias() {
    this.mantenimientoService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data.filter(c => c.activa);
        // Sincronizar si ya hay un valor (modo edición)
        const currentId = this.productoForm.get('categoriaId')?.value;
        if (currentId) {
          this.selectedCategoria = this.categorias.find(c => c.id === +currentId) || null;
        }
      }
    });
  }

  cargarSucursales() {
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(s => s.activa);
        const currentId = this.productoForm.get('sucursalId')?.value;
        if (currentId) {
          this.selectedSucursal = this.sucursales.find(s => s.id === +currentId) || null;
        }
      }
    });
  }

  toggleCatDropdown(event: MouseEvent) {
    event.stopPropagation();
    if (!this.catDropdownOpen) {
      const rect = this.catTriggerRef.nativeElement.getBoundingClientRect();
      this.catDropdownTop = rect.bottom + 6;
      this.catDropdownLeft = rect.left;
      this.catDropdownWidth = rect.width;
    }
    this.catDropdownOpen = !this.catDropdownOpen;
    this.sucDropdownOpen = false;
  }

  seleccionarCategoria(cat: Categoria) {
    this.selectedCategoria = cat;
    this.productoForm.patchValue({ categoriaId: cat.id });
    this.catDropdownOpen = false;
  }

  toggleSucDropdown(event: MouseEvent) {
    event.stopPropagation();
    if (!this.sucDropdownOpen) {
      const rect = this.sucTriggerRef.nativeElement.getBoundingClientRect();
      this.sucDropdownTop = rect.bottom + 6;
      this.sucDropdownLeft = rect.left;
      this.sucDropdownWidth = rect.width;
    }
    this.sucDropdownOpen = !this.sucDropdownOpen;
    this.catDropdownOpen = false;
  }

  seleccionarSucursal(suc: Sucursal) {
    this.selectedSucursal = suc;
    this.productoForm.patchValue({ sucursalId: suc.id });
    this.sucDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.catDropdownOpen = false;
      this.sucDropdownOpen = false;
    }
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

        let sucId = '';
        if (prod.sucursalId) {
          sucId = prod.sucursalId.toString();
        }
        
        this.productoForm.patchValue({
          sku: prod.sku,
          nombre: prod.nombre,
          categoriaId: catId,
          sucursalId: sucId,
          unidadMedida: prod.unidadMedida,
          precioCompra: prod.precioCompra,
          precioVenta: prod.precioVenta,
          stockMinimo: prod.stockMinimo,
          stockMaximo: prod.stockMaximo,
          descripcion: prod.descripcion,
          activo: prod.activo
        });
        // Sincronizar el dropdown visual
        if (catId) {
          this.selectedCategoria = this.categorias.find(c => c.id === +catId) || null;
        }
        if (sucId) {
          this.selectedSucursal = this.sucursales.find(s => s.id === +sucId) || null;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la información del producto.';
        this.loading = false;
      }
    });
  }

  onCancel() { this.cancelado.emit(); }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.productoForm.invalid) return;

    this.loading = true;
    const formVal = this.productoForm.value;
    const body = { ...formVal, categoriaId: +formVal.categoriaId, sucursalId: +formVal.sucursalId };

    if (this.esEdicion && this.productoId) {
      this.productoService.actualizar(this.productoId, body).subscribe({
        next: () => { 
          this.loading = false;
          Swal.fire({
            title: '¡Operación exitosa!',
            text: 'Producto actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.guardado.emit();
          });
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar el producto.';
          this.loading = false;
        }
      });
    } else {
      this.productoService.crear(body).subscribe({
        next: () => { 
          this.loading = false;
          Swal.fire({
            title: '¡Operación exitosa!',
            text: 'Producto creado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.guardado.emit();
          });
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear el producto.';
          this.loading = false;
        }
      });
    }
  }
}
