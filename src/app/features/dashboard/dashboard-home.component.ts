import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-home">
      <div class="welcome-banner">
        <h1>¡Bienvenido al Sistema de Gestión Interna!</h1>
        <p>Aquí tienes un resumen de la actividad reciente de tu plataforma.</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>Usuarios Activos</h3>
            <p class="stat-number">128</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔒</div>
          <div class="stat-info">
            <h3>Roles Definidos</h3>
            <p class="stat-number">4</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <h3>Conexiones Hoy</h3>
            <p class="stat-number">342</p>
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

    .welcome-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.2);
    }

    .welcome-banner h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.85rem;
      font-weight: 700;
    }

    .welcome-banner p {
      margin: 0;
      color: #e0e7ff;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .stat-icon {
      font-size: 2rem;
      background-color: #f1f5f9;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
    }

    .stat-number {
      margin: 0.25rem 0 0 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }
  `]
})
export class DashboardHomeComponent {}
