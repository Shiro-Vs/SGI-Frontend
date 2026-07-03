import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../../services/movimiento.service';
import { Movimiento } from '../../../core/models/movimiento.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movimientos-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="movement-history-container">
      <div class="list-header">
        <div>
          <h2>Historial de Movimientos</h2>
          <p class="subtitle">Consulte todas las transacciones de stock (Entradas, Salidas y Transferencias) realizadas en el sistema.</p>
        </div>
        <div class="header-actions">
           <button routerLink="../entrada" class="btn btn-success">+ Entrada</button>
           <button routerLink="../salida" class="btn btn-danger">- Salida</button>
           <button routerLink="../transferencia" class="btn btn-primary">➔ Transferencia</button>
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
                <th>Sucursal</th>
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
                <td>
                  <span *ngIf="m.tipo === 'TRANSFERENCIA'" class="transfer-branch">{{ m.sucursalOrigen }} <span class="arrow">➔</span> {{ m.sucursalDestino }}</span>
                  <span *ngIf="m.tipo === 'ENTRADA'">{{ m.sucursalDestino }}</span>
                  <span *ngIf="m.tipo === 'SALIDA'">{{ m.sucursalOrigen }}</span>
                </td>
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
      color: #f8fafc;
    }

    .list-header {
      display: flex;
      justify-content: space-between; /* Alinea los textos a la izq y botones a la der */
      align-items: center;
    }

    /* NUEVO: Estilos para los botones */
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      color: white;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-success { background-color: #10b981; }
    .btn-danger { background-color: #ef4444; }
    .btn-primary { background-color: #3b82f6; }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #94a3b8;
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
      background-color: #1e293b;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 2px solid #334155;
      white-space: nowrap;
    }

    .movement-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #334155;
      color: #f8fafc;
    }

    .bold-text {
      font-weight: 600;
      color: #f8fafc;
    }

    .sku-text {
      color: #94a3b8;
      font-family: monospace;
      font-size: 0.85rem;
    }

    .quantity-col {
      color: #60a5fa;
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
      background-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .type-badge.salida {
      background-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .type-badge.transferencia {
      background-color: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .user-badge {
      font-size: 0.8rem;
      background-color: #0f172a;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .obs-text {
      font-style: italic;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .transfer-branch {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .arrow {
      color: #64748b;
      font-size: 0.8rem;
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
