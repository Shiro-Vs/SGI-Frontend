import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../../services/movimiento.service';
import { Movimiento } from '../../../core/models/movimiento.model';

@Component({
  selector: 'app-movimientos-historial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="movement-history-container">
      <div class="list-header">
        <div>
          <h2>Historial de Movimientos</h2>
          <p class="subtitle">Consulte todas las transacciones de stock (Entradas, Salidas y Transferencias) realizadas en el sistema.</p>
        </div>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-state">
          Consultando historial de transacciones...
        </div>

        <div *ngIf="!loading && movimientos.length === 0" class="empty-state">
          No hay transacciones registradas en el historial.
        </div>

        <div class="table-responsive" *ngIf="!loading && movimientos.length > 0">
          <table class="movement-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha / Hora</th>
                <th>Tipo</th>
                <th>Producto (SKU)</th>
                <th>Cantidad</th>
                <th>Sucursal Origen</th>
                <th>Sucursal Destino</th>
                <th>Usuario</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of movimientos">
                <td>{{ m.id }}</td>
                <td class="bold-text">{{ m.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="type-badge" [ngClass]="m.tipo.toLowerCase()">
                    {{ m.tipo }}
                  </span>
                </td>
                <td class="bold-text">
                  {{ getProductoLabel(m) }} 
                  <span class="sku-text" *ngIf="m.skuProducto">({{ m.skuProducto }})</span>
                </td>
                <td class="bold-text quantity-col">{{ m.cantidad }}</td>
                <td>{{ m.sucursalOrigen || '-' }}</td>
                <td>{{ m.sucursalDestino || '-' }}</td>
                <td><span class="user-badge">👤 {{ m.usuario || '-' }}</span></td>
                <td><span class="obs-text">{{ m.observacion || '-' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movement-history-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      font-size: 1rem;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .movement-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .movement-table th {
      background-color: #f8fafc;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .movement-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .bold-text {
      font-weight: 600;
      color: #0f172a;
    }

    .sku-text {
      color: #64748b;
      font-family: monospace;
      font-size: 0.85rem;
    }

    .quantity-col {
      color: #4f46e5;
    }

    .type-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      display: inline-block;
    }

    .type-badge.entrada {
      background-color: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .type-badge.salida {
      background-color: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }

    .type-badge.transferencia {
      background-color: rgba(59, 130, 246, 0.1);
      color: #2563eb;
    }

    .user-badge {
      font-size: 0.8rem;
      background-color: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .obs-text {
      font-style: italic;
      font-size: 0.85rem;
      color: #64748b;
    }
  `]
})
export class MovimientosHistorialComponent implements OnInit {
  private movimientoService = inject(MovimientoService);
  private cdr = inject(ChangeDetectorRef);
  movimientos: any[] = [];
  loading = true;

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    this.movimientoService.listarTodos().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getProductoLabel(m: any): string {
    if (m.producto && typeof m.producto === 'object') {
      return m.producto.nombre;
    }
    return m.producto || '-';
  }
}
