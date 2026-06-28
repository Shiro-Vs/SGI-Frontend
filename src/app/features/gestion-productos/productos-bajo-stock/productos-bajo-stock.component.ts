import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';

@Component({
  selector: 'app-productos-bajo-stock',
  standalone: true,
  imports: [CommonModule, EstadoPipe],
  template: `
    <div class="product-list-container">
      <div class="list-header">
        <div>
          <h2>Alerta de Stock Bajo</h2>
          <p class="subtitle">Productos cuya existencia actual está por debajo del límite mínimo establecido.</p>
        </div>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-state">
          Consultando productos con stock crítico...
        </div>

        <div *ngIf="!loading && productos.length === 0" class="empty-state success-state">
          🎉 ¡Excelente! No hay productos con bajo stock en este momento.
        </div>

        <div class="table-responsive" *ngIf="!loading && productos.length > 0">
          <table class="product-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>U. Medida</th>
                <th>P. Venta</th>
                <th class="text-danger">Stock Mínimo</th>
                <th>Stock Máximo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of productos">
                <td class="bold-text code-font">{{ p.sku }}</td>
                <td class="bold-text">{{ p.nombre }}</td>
                <td>
                  <span class="category-badge">{{ getCategoryName(p) }}</span>
                </td>
                <td>{{ p.unidadMedida }}</td>
                <td>S/ {{ p.precioVenta | number:'1.2-2' }}</td>
                <td class="bold-text text-danger">{{ p.stockMinimo }}</td>
                <td>{{ p.stockMaximo }}</td>
                <td>
                  <span class="status-pill" [ngClass]="p.activo ? 'activo' : 'inactivo'">
                    {{ p.activo | estado }}
                  </span>
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

    .text-danger {
      color: #f87171 !important;
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
      font-size: 1rem;
    }

    .success-state {
      color: #34d399;
      font-weight: 500;
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      margin: 2rem;
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

    .bold-text {
      font-weight: 600;
      color: #f8fafc;
    }

    .code-font {
      font-family: monospace;
      font-size: 0.95rem;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    .category-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      background-color: #0f172a;
      color: #cbd5e1;
      border: 1px solid #334155;
      border-radius: 4px;
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
  `]
})
export class ProductosBajoStockComponent implements OnInit {
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);
  productos: Producto[] = [];
  loading = true;

  ngOnInit() {
    this.cargarProductosBajoStock();
  }

  cargarProductosBajoStock() {
    this.loading = true;
    this.productoService.listarBajoStock().subscribe({
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

  getCategoryName(p: Producto): string {
    if (p.categoria && typeof p.categoria === 'object') {
      return p.categoria.nombre;
    }
    return (p.categoria as string) || '-';
  }
}
