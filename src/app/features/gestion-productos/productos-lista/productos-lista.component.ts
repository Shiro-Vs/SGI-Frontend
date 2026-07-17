import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { AuthService } from '../../../services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ProductoFormularioComponent } from '../producto-formulario/producto-formulario.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoPipe, ModalComponent, ConfirmModalComponent, ProductoFormularioComponent],
  template: `
    <div class="product-list-container animate-fade-in">
      <div class="list-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p class="subtitle">Lista general y administración del catálogo de productos.</p>
        </div>
          <div class="header-actions">
            <button *ngIf="isAdmin" (click)="abrirModalCrear()" class="btn-primary-link">
              <i class="bi bi-plus-circle"></i> Nuevo Producto
            </button>
          </div>
      </div>

      <div class="filter-card">
        <form [formGroup]="searchForm" class="search-form">
          <div class="form-group-search">
            <span class="search-icon"><i class="bi bi-search"></i></span>
            <input
              type="text"
              formControlName="nombre"
              placeholder="Buscar producto por nombre..."
              class="form-control-search"
            />
          </div>
          <div class="form-group-filter" *ngIf="isAdmin || isGerente">
            <select formControlName="sucursalId" class="form-control-select">
              <option value="">Todas las sucursales</option>
              <option *ngFor="let s of sucursales" [value]="s.id">{{ s.nombre }}</option>
            </select>
          </div>
        </form>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-state">
          Cargando catálogo de productos...
        </div>

        <div *ngIf="!loading && productos.length === 0" class="empty-state">
          No se encontraron productos registrados.
        </div>

        <div class="table-responsive" *ngIf="!loading && productos.length > 0">
          <table class="product-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>U. Medida</th>
                <th>Mín/Máx</th>
                <th>{{ searchForm.value.sucursalId ? 'Stock Local' : 'Stock Total' }}</th>
                <th>Estado</th>
                <th class="actions-col" *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of productos; trackBy: trackByProductoId">
                <td class="bold-text code-font">{{ p.sku }}</td>
                <td class="bold-text">{{ p.nombre }}</td>
                <td>{{ p.descripcion || '-' }}</td>
                <td>
                  <span class="category-badge">{{ getCategoryName(p) }}</span>
                </td>
                <td>S/ {{ p.precioCompra | number:'1.2-2' }}</td>
                <td>S/ {{ p.precioVenta | number:'1.2-2' }}</td>
                <td>{{ p.unidadMedida }}</td>
                <td>
                  <span class="stock-range">
                    {{ p.stockMinimo }} / {{ p.stockMaximo }}
                  </span>
                </td>
                <td>
                  <span class="stock-actual-badge" *ngIf="p.stockActual !== undefined && p.stockActual !== null">
                    {{ p.stockActual }}
                  </span>
                  <span class="text-muted" *ngIf="p.stockActual === undefined || p.stockActual === null">Global</span>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="p.activo ? 'activo' : 'inactivo'">
                    {{ p.activo | estado }}
                  </span>
                </td>
                <td class="actions" *ngIf="isAdmin">
                  <button (click)="abrirModalEditar(p.id!)" class="action-btn edit" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button (click)="abrirModalEliminar(p.id!)" class="action-btn delete" title="Desactivar"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-modal
        [isOpen]="isFormModalOpen"
        [title]="selectedProductoId ? 'Editar Producto' : 'Nuevo Producto'"
        width="720px"
        (close)="cerrarFormModal()"
      >
        <app-producto-formulario
          *ngIf="isFormModalOpen"
          [esEdicion]="!!selectedProductoId"
          [productoId]="selectedProductoId"
          (guardado)="onProductoGuardado()"
          (cancelado)="cerrarFormModal()"
        ></app-producto-formulario>
      </app-modal>

      <app-confirm-modal
        [isOpen]="isConfirmModalOpen"
        title="Desactivar Producto"
        message="¿Está seguro de que desea desactivar este producto? Ya no aparecerá en el catálogo activo."
        confirmText="Desactivar"
        confirmStyle="delete"
        (confirm)="confirmarEliminacion()"
        (cancel)="isConfirmModalOpen = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .product-list-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .list-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #f8fafc;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .btn-primary-link {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }

    .btn-primary-link:hover {
      background-color: #2563eb;
    }

    .filter-card {
      margin-bottom: 0.5rem;
    }

    .search-form {
      display: flex;
      gap: 1rem;
    }

    .form-group-search {
      position: relative;
      flex: 1;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .form-control-search {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #f8fafc;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-control-search:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .form-group-filter {
      min-width: 250px;
    }

    .form-control-select {
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

    .form-control-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .table-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #94a3b8;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .product-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .product-table th {
      background-color: #1e293b;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 2px solid #334155;
      white-space: nowrap;
    }

    .product-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #334155;
      color: #f8fafc;
    }

    .product-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .product-table tbody tr:hover {
      background-color: rgba(51, 65, 85, 0.35);
    }

    .bold-text {
      font-weight: 600;
      color: #f8fafc;
    }

    .code-font {
      font-family: monospace;
      font-size: 0.95rem;
      letter-spacing: 0.05em;
    }

    .category-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      background-color: #e0e7ff;
      color: #4338ca;
      border-radius: 4px;
    }

    .stock-range {
      font-weight: 500;
      color: #475569;
    }

    .stock-actual-badge {
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      background-color: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 6px;
      display: inline-block;
      min-width: 2.5rem;
      text-align: center;
    }

    .text-muted {
      color: #64748b;
      font-size: 0.8rem;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .status-pill.activo {
      background-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .status-pill.inactivo {
      background-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .actions-col {
      width: 120px;
      text-align: center;
    }

    .actions {
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
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .action-btn.edit { color: #60a5fa; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
    .action-btn.edit:hover { background-color: rgba(59, 130, 246, 0.2); }

    .action-btn.delete { color: #f87171; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
    .action-btn.delete:hover { background-color: rgba(239, 68, 68, 0.2); }
  `]
})
export class ProductosListaComponent implements OnInit {
  private productoService = inject(ProductoService);
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  sucursales: any[] = [];
  loading = true;
  isAdmin = false;
  isGerente = false;
  isFormModalOpen = false;
  isConfirmModalOpen = false;
  selectedProductoId?: number;
  searchForm: FormGroup = this.fb.group({ nombre: [''], sucursalId: [''] });

  ngOnInit() {
    const rol = this.authService.getRole();
    this.isAdmin = rol === 'ADMIN';
    this.isGerente = rol === 'GERENTE';
    
    if (this.isAdmin || this.isGerente) {
      this.cargarSucursales();
    }

    this.cargarProductos();

    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(val => {
      this.buscarProductos(val.nombre, val.sucursalId ? Number(val.sucursalId) : undefined);
    });
  }

  cargarSucursales() {
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      }
    });
  }

  cargarProductos() {
    this.loading = true;
    const sucursalId = this.searchForm.value.sucursalId ? Number(this.searchForm.value.sucursalId) : undefined;
    
    this.productoService.listarTodos(sucursalId).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscarProductos(nombre: string, sucursalId?: number) {
    if (!nombre?.trim() && !sucursalId) {
      this.cargarProductos();
      return;
    }
    this.loading = true;
    
    if (nombre?.trim()) {
      this.productoService.buscarPorNombre(nombre, sucursalId).subscribe({
        next: (data) => { this.productos = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.productoService.listarTodos(sucursalId).subscribe({
        next: (data) => { this.productos = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
    }
  }

  abrirModalCrear() {
    this.selectedProductoId = undefined;
    this.isFormModalOpen = true;
  }

  abrirModalEditar(id: number) {
    this.selectedProductoId = id;
    this.isFormModalOpen = true;
  }

  abrirModalEliminar(id: number) {
    this.selectedProductoId = id;
    this.isConfirmModalOpen = true;
  }

  cerrarFormModal() { this.isFormModalOpen = false; }

  onProductoGuardado() {
    this.isFormModalOpen = false;
    this.cargarProductos();
  }

  confirmarEliminacion() {
    if (!this.selectedProductoId) return;
    this.productoService.desactivar(this.selectedProductoId).subscribe({
      next: () => { this.isConfirmModalOpen = false; this.cargarProductos(); },
      error: () => { this.isConfirmModalOpen = false; this.cargarProductos(); }
    });
  }

  getCategoryName(p: Producto): string {
    if (p.categoria && typeof p.categoria === 'object') return p.categoria.nombre;
    return (p.categoria as string) || '-';
  }

  trackByProductoId(index: number, p: Producto): number | undefined {
    return p.id;
  }
}
