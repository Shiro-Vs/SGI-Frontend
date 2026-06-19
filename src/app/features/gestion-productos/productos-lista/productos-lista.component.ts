import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { AuthService } from '../../../services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, EstadoPipe],
  template: `
    <div class="product-list-container">
      <div class="list-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p class="subtitle">Lista general y administración del catálogo de productos.</p>
        </div>
        <div *ngIf="isAdmin">
          <a routerLink="nuevo" class="btn-primary-link">
            ➕ Nuevo Producto
          </a>
        </div>
      </div>

      <div class="filter-card">
        <form [formGroup]="searchForm" class="search-form">
          <div class="form-group-search">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              formControlName="nombre"
              placeholder="Buscar producto por nombre..."
              class="form-control-search"
            />
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
                <th>Estado</th>
                <th class="actions-col" *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of productos">
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
                  <span class="status-pill" [ngClass]="p.activo ? 'activo' : 'inactivo'">
                    {{ p.activo | estado }}
                  </span>
                </td>
                <td class="actions-cell" *ngIf="isAdmin">
                  <a [routerLink]="['editar', p.id]" class="action-btn edit" title="Editar">✏️</a>
                  <button (click)="eliminarProducto(p.id)" class="action-btn delete" title="Desactivar">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
      color: #0f172a;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #64748b;
    }

    .btn-primary-link {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.25rem;
      background-color: #4f46e5;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .btn-primary-link:hover {
      background-color: #4338ca;
    }

    .filter-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-control-search:focus {
      outline: none;
      border-color: #4f46e5;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
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
      background-color: #f8fafc;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .product-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .bold-text {
      font-weight: 600;
      color: #0f172a;
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
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: white;
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: none;
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
  `]
})
export class ProductosListaComponent implements OnInit {
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  loading = true;
  isAdmin = false;
  searchForm: FormGroup = this.fb.group({
    nombre: ['']
  });

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.cargarProductos();

    this.searchForm.get('nombre')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => {
      this.buscarProductos(val);
    });
  }

  cargarProductos() {
    this.loading = true;
    this.productoService.listarTodos().subscribe({
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

  buscarProductos(nombre: string) {
    if (!nombre.trim()) {
      this.cargarProductos();
      return;
    }
    this.loading = true;
    this.productoService.buscarPorNombre(nombre).subscribe({
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

  eliminarProducto(id: number | undefined) {
    if (!id || !confirm('¿Está seguro de desactivar este producto?')) return;

    this.productoService.desactivar(id).subscribe({
      next: () => {
        this.cargarProductos();
      }
    });
  }

  getCategoryName(p: Producto): string {
    if (p.categoria && typeof p.categoria === 'object') {
      return p.categoria.nombre;
    }
    return (p.categoria as string) || '-';
  }
}
