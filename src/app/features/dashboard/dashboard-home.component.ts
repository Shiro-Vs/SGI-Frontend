import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardResponse } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-home">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-info">
          <h1>{{ saludo }}, {{ userName }}! <span class="wave">👋</span></h1>
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

        <!-- CHARTS GRID -->
        <div class="charts-grid" *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE' || userRol === 'JEFE_ALMACEN' || userRol === 'VENDEDOR'">
          
          <div class="chart-card" *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE' || userRol === 'JEFE_ALMACEN'">
            <div class="card-header">
              <h2><i class="bi bi-pie-chart-fill text-primary"></i> 
                <span *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE'">Distribución Global</span>
                <span *ngIf="userRol === 'JEFE_ALMACEN'">Entradas vs Transferencias</span>
              </h2>
            </div>
            <div class="card-body chart-container">
              <canvas id="doughnutChart"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-header">
              <h2><i class="bi bi-bar-chart-fill text-primary"></i> 
                <span *ngIf="userRol === 'ADMIN' || userRol === 'GERENTE'">Productos Más Vendidos</span>
                <span *ngIf="userRol === 'VENDEDOR' || userRol === 'JEFE_ALMACEN'">Niveles de Stock</span>
              </h2>
            </div>
            <div class="card-body chart-container">
              <canvas id="barChart"></canvas>
            </div>
          </div>

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

        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .welcome-info .wave {
      display: inline-block;
      animation: wave 2s ease-in-out infinite;
      transform-origin: 70% 70%;
    }

    @keyframes wave {
      0%, 60%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(14deg); }
      20% { transform: rotate(-8deg); }
      40% { transform: rotate(-4deg); }
      50% { transform: rotate(10deg); }
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
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1.25rem;
    }

    .col-span-full {
      grid-column: 1 / -1;
    }

    .stat-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
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

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1.8fr;
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .chart-container {
      position: relative;
      height: 240px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.5rem;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .details-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .table-responsive {
      width: 100%;
      overflow-x: auto;
      margin-top: 1rem;
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

    .dashboard-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .dashboard-table tbody tr:hover {
      background-color: rgba(51, 65, 85, 0.35);
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
  saludo = this.getSaludoPorHora();

  barChart: any;
  doughnutChart: any;

  private getSaludoPorHora(): string {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  }

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
        
        // Timeout para que Angular pinte los <canvas> primero
        setTimeout(() => this.initCharts(), 150);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initCharts() {
    if (!this.data) return;

    if (this.barChart) this.barChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', 'Inter', sans-serif";
    Chart.defaults.borderColor = 'rgba(51, 65, 85, 0.5)';

    // 1. Doughnut Chart
    const doughnutCanvas = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (doughnutCanvas) {
      let labels: string[] = [];
      let chartData: number[] = [];
      let backgroundColors: string[] = [];

      if (this.userRol === 'ADMIN' || this.userRol === 'GERENTE') {
        labels = ['Entradas', 'Salidas', 'Transferencias'];
        chartData = [this.data.totalEntradas || 0, this.data.totalSalidas || 0, this.data.totalTransferencias || 0];
        backgroundColors = ['#34d399', '#fb923c', '#818cf8'];
      } else if (this.userRol === 'JEFE_ALMACEN') {
        labels = ['Entradas', 'Transferencias Enviadas'];
        chartData = [this.data.totalEntradas || 0, this.data.totalTransferencias || 0];
        backgroundColors = ['#34d399', '#818cf8'];
      }

      if (chartData.some(d => d > 0)) {
        this.doughnutChart = new Chart(doughnutCanvas, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: chartData,
              backgroundColor: backgroundColors,
              borderWidth: 0,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { padding: 20, color: '#e2e8f0', usePointStyle: true } }
            },
            cutout: '75%'
          }
        });
      } else {
         doughnutCanvas.parentElement!.innerHTML = '<div class="empty-state"><i class="bi bi-pie-chart text-muted"></i><p>Sin datos para graficar</p></div>';
      }
    }

    // 2. Bar Chart
    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (barCanvas && this.data.productosMasMovidos && this.data.productosMasMovidos.length > 0) {
      const labels = this.data.productosMasMovidos.map((p: any) => p.nombreProducto);
      const chartData = this.data.productosMasMovidos.map((p: any) => p.cantidadMovimientos);
      
      let labelText = 'Ventas Totales';
      let bgColor = 'rgba(59, 130, 246, 0.7)';
      let borderColor = '#3b82f6'; 

      if (this.userRol === 'VENDEDOR') {
        labelText = 'Stock Disponible';
        bgColor = 'rgba(16, 185, 129, 0.7)';
        borderColor = '#34d399';
      } else if (this.userRol === 'JEFE_ALMACEN') {
        labelText = 'Stock Crítico';
        bgColor = 'rgba(249, 115, 22, 0.7)';
        borderColor = '#fb923c';
      }

      this.barChart = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: labelText,
            data: chartData,
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleColor: '#fff',
              bodyColor: '#cbd5e1',
              padding: 10,
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { color: 'rgba(51, 65, 85, 0.3)' },
              ticks: { color: '#94a3b8', stepSize: 1 }
            },
            x: { 
              grid: { display: false },
              ticks: { 
                color: '#94a3b8', 
                maxRotation: 45, 
                minRotation: 45,
                callback: function(value, index, values) {
                  const label = labels[index];
                  // Truncate long labels
                  return label.length > 15 ? label.substring(0, 15) + '...' : label;
                }
              }
            }
          }
        }
      });
    } else if (barCanvas) {
       barCanvas.parentElement!.innerHTML = '<div class="empty-state"><i class="bi bi-bar-chart text-muted"></i><p>Sin datos para graficar</p></div>';
    }
  }
}
