import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardResponse } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-home">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-info">
          <h1>¡Hola, {{ userName }}!</h1>
          <p>Bienvenido al Sistema de Gestión Interna. Aquí tienes el resumen de tu sucursal y actividades.</p>
        </div>
        <div class="role-badge">
          <span>Rol: {{ userRol }}</span>
          <span *ngIf="userSucursal"> | Sucursal: {{ userSucursal }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando panel de control...</p>
      </div>

      <div *ngIf="!loading && data" class="dashboard-content animate-fade-in">
        
        <!-- GRID DE TARJETAS (STATS CARDS) -->
        <div class="stats-grid">
          
          <!-- ADMIN/GERENTE CARDS -->
          <ng-container *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE'">
            <div class="stat-card blue-grad">
              <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
              <div class="stat-info">
                <h3>Total Usuarios</h3>
                <p class="stat-number">{{ data.totalUsuarios }}</p>
                <span class="stat-sub">{{ data.totalVendedores }} Vendedores / {{ data.totalAlmaceneros }} Almaceneros</span>
              </div>
            </div>
            
            <div class="stat-card purple-grad">
              <div class="stat-icon"><i class="bi bi-building"></i></div>
              <div class="stat-info">
                <h3>Sucursales</h3>
                <p class="stat-number">{{ data.totalSucursales }}</p>
                <span class="stat-sub">Sucursales registradas</span>
              </div>
            </div>
            
            <div class="stat-card emerald-grad">
              <div class="stat-icon"><i class="bi bi-box-arrow-in-down"></i></div>
              <div class="stat-info">
                <h3>Entradas de Stock</h3>
                <p class="stat-number">{{ data.totalEntradas }}</p>
                <span class="stat-sub">Ingresos globales</span>
              </div>
            </div>

            <div class="stat-card orange-grad">
              <div class="stat-icon"><i class="bi bi-box-arrow-up"></i></div>
              <div class="stat-info">
                <h3>Salidas (Ventas)</h3>
                <p class="stat-number">{{ data.totalSalidas }}</p>
                <span class="stat-sub">Ventas globales</span>
              </div>
            </div>

            <div class="stat-card indigo-grad">
              <div class="stat-icon"><i class="bi bi-arrow-left-right"></i></div>
              <div class="stat-info">
                <h3>Transferencias</h3>
                <p class="stat-number">{{ data.totalTransferencias }}</p>
                <span class="stat-sub">Flujo entre locales</span>
              </div>
            </div>
          </ng-container>

          <!-- VENDEDOR CARDS -->
          <ng-container *ngIf="userRol === 'VENDEDOR'">
            <div class="stat-card orange-grad col-span-full">
              <div class="stat-icon"><i class="bi bi-cash-stack"></i></div>
              <div class="stat-info">
                <h3>Mis Ventas Registradas</h3>
                <p class="stat-number">{{ data.totalSalidas }}</p>
                <span class="stat-sub">Salidas registradas desde tu sucursal asignada</span>
              </div>
            </div>
          </ng-container>

          <!-- JEFE_ALMACEN CARDS -->
          <ng-container *ngIf="userRol === 'JEFE_ALMACEN'">
            <div class="stat-card emerald-grad">
              <div class="stat-icon"><i class="bi bi-box-arrow-in-down"></i></div>
              <div class="stat-info">
                <h3>Entradas de Stock</h3>
                <p class="stat-number">{{ data.totalEntradas }}</p>
                <span class="stat-sub">Mercadería ingresada a tu almacén</span>
              </div>
            </div>

            <div class="stat-card indigo-grad">
              <div class="stat-icon"><i class="bi bi-arrow-left-right"></i></div>
              <div class="stat-info">
                <h3>Transferencias Enviadas</h3>
                <p class="stat-number">{{ data.totalTransferencias }}</p>
                <span class="stat-sub">Despachos a otras sucursales</span>
              </div>
            </div>
          </ng-container>

        </div>

        <!-- SECCIÓN DE DETALLES Y TABLAS -->
        <div class="details-grid">
          
          <!-- Lista de Stock Bajo -->
          <div class="details-card stock-critico-card">
            <div class="card-header">
              <h2><i class="bi bi-exclamation-triangle-fill text-warning"></i> Alerta de Stock Crítico</h2>
              <span class="badge badge-error" *ngIf="data.productosBajoStock?.length > 0">
                {{ data.productosBajoStock.length }} Alertas
              </span>
            </div>
            
            <div class="card-body">
              <div class="table-responsive" *ngIf="data.productosBajoStock?.length > 0; else stockOk">
                <table class="dashboard-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>SKU</th>
                      <th>Sucursal</th>
                      <th>Stock</th>
                      <th>Límite</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of data.productosBajoStock">
                      <td><span class="prod-name">{{ item.nombre }}</span></td>
                      <td><code>{{ item.sku }}</code></td>
                      <td>{{ item.sucursal }}</td>
                      <td><span class="stock-num text-danger font-bold">{{ item.stockActual }}</span></td>
                      <td><span class="stock-limit text-muted">{{ item.stockMinimo }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #stockOk>
                <div class="empty-state">
                  <i class="bi bi-check-circle-fill text-success"></i>
                  <p>¡Buen trabajo! Todo el stock está por encima de los límites mínimos.</p>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Top de Productos (Más Movidos / Mayor Stock / Menor Stock) -->
          <div class="details-card top-productos-card">
            <div class="card-header">
              <h2 *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE'">
                <i class="bi bi-bar-chart-fill text-primary"></i> Productos con Más Movimientos
              </h2>
              <h2 *ngIf="userRol === 'VENDEDOR'">
                <i class="bi bi-box-seam-fill text-primary"></i> Productos Disponibles (Mayor Stock)
              </h2>
              <h2 *ngIf="userRol === 'JEFE_ALMACEN'">
                <i class="bi bi-arrow-down-up text-primary"></i> Productos Críticos en Almacén (Menor Stock)
              </h2>
            </div>
            
            <div class="card-body">
              <div class="table-responsive" *ngIf="data.productosMasMovidos?.length > 0; else noMovimientos">
                <table class="dashboard-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-right">
                        <span *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE'">Total Movimientos</span>
                        <span *ngIf="userRol === 'VENDEDOR' || userRol === 'JEFE_ALMACEN'">Existencia</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of data.productosMasMovidos">
                      <td><span class="prod-name">{{ item.nombreProducto }}</span></td>
                      <td class="text-right font-bold">
                        <span [ngClass]="{'text-success': userRol === 'VENDEDOR', 'text-warning': userRol === 'JEFE_ALMACEN'}">
                          {{ item.cantidadMovimientos }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noMovimientos>
                <div class="empty-state">
                  <i class="bi bi-inbox text-muted"></i>
                  <p>No hay información disponible para este módulo todavía.</p>
                </div>
              </ng-template>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Welcome Banner */
    .welcome-banner {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
      color: white;
      padding: 2rem;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .welcome-info h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .welcome-info p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .role-badge {
      background-color: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 0.6rem 1.2rem;
      border-radius: 9999px;
      color: #60a5fa;
      font-weight: 600;
      font-size: 0.85rem;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 0;
      gap: 1rem;
      color: #94a3b8;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(59, 130, 246, 0.1);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s infinite linear;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
    }

    .col-span-full {
      grid-column: 1 / -1;
    }

    .stat-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: transform 0.2s, border-color 0.2s;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: #475569;
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    /* Color gradients for card icons/borders */
    .blue-grad .stat-icon { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .purple-grad .stat-icon { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .emerald-grad .stat-icon { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .orange-grad .stat-icon { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
    .indigo-grad .stat-icon { background: rgba(79, 70, 229, 0.15); color: #818cf8; }

    .stat-info {
      flex-grow: 1;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .stat-number {
      margin: 0.2rem 0;
      font-size: 2rem;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1;
    }

    .stat-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .details-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #334155;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .badge-error {
      background-color: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .card-body {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    /* Dashboard Table */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .dashboard-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .dashboard-table th {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #334155;
    }

    .dashboard-table td {
      padding: 0.75rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      font-size: 0.85rem;
      color: #cbd5e1;
      vertical-align: middle;
    }

    .dashboard-table tr:last-child td {
      border-bottom: none;
    }

    .prod-name {
      font-weight: 600;
      color: #f8fafc;
    }

    code {
      background-color: #0f172a;
      color: #e2e8f0;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .text-danger { color: #f87171; }
    .text-success { color: #34d399; }
    .text-warning { color: #fb923c; }
    .text-muted { color: #64748b; }

    /* Empty/Success States */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      gap: 0.75rem;
      flex-grow: 1;
    }

    .empty-state i {
      font-size: 2.5rem;
    }

    .empty-state p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.9rem;
      max-width: 260px;
      line-height: 1.4;
    }

    /* Fade-in Animation */
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  userName = '';
  userRol = '';
  userSucursal = '';
  loading = true;
  data: DashboardResponse | null = null;

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.nombre || 'Usuario';
      this.userRol = user.rol || '';
      this.userSucursal = user.sucursalNombre || '';
    }

    this.cargarDashboard();
  }

  cargarDashboard() {
    this.loading = true;
    this.dashboardService.obtenerResumen().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
