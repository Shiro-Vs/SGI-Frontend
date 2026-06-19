import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <h1>SGI</h1>
          <span class="badge">v1.0</span>
        </div>
        <nav class="nav-menu">
          <!-- Todos ven Panel Principal -->
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="icon">📊</span>
            Panel Principal
          </a>

          <!-- ADMIN -->
          <ng-container *ngIf="role === 'ADMIN'">
            <a routerLink="/dashboard/usuarios" routerLinkActive="active" class="nav-item">
              <span class="icon">👥</span>
              Usuarios
            </a>
            <a routerLink="/dashboard/sucursales" routerLinkActive="active" class="nav-item">
              <span class="icon">🏢</span>
              Sucursales
            </a>
            <a routerLink="/dashboard/categorias" routerLinkActive="active" class="nav-item">
              <span class="icon">🏷️</span>
              Categorías
            </a>
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <span class="icon">📦</span>
              Productos
            </a>
            <a routerLink="/dashboard/movimientos/historial" routerLinkActive="active" class="nav-item">
              <span class="icon">🔄</span>
              Movimientos
            </a>
            <a routerLink="/dashboard/productos/bajo-stock" routerLinkActive="active" class="nav-item">
              <span class="icon">⚠️</span>
              Alertas (Stock Bajo)
            </a>
          </ng-container>

          <!-- JEFE_ALMACEN -->
          <ng-container *ngIf="role === 'JEFE_ALMACEN'">
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <span class="icon">📦</span>
              Productos
            </a>
            <a routerLink="/dashboard/productos/bajo-stock" routerLinkActive="active" class="nav-item">
              <span class="icon">⚠️</span>
              Stock Bajo
            </a>
            <a routerLink="/dashboard/movimientos/entrada" routerLinkActive="active" class="nav-item">
              <span class="icon">📥</span>
              Entradas
            </a>
            <a routerLink="/dashboard/movimientos/transferencia" routerLinkActive="active" class="nav-item">
              <span class="icon">🚚</span>
              Transferencias
            </a>
          </ng-container>

          <!-- VENDEDOR -->
          <ng-container *ngIf="role === 'VENDEDOR'">
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <span class="icon">📦</span>
              Productos
            </a>
            <a routerLink="/dashboard/movimientos/salida" routerLinkActive="active" class="nav-item">
              <span class="icon">📤</span>
              Registrar Salida
            </a>
          </ng-container>

          <!-- GERENTE -->
          <ng-container *ngIf="role === 'GERENTE'">
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              <span class="icon">📦</span>
              Ver Productos
            </a>
            <a routerLink="/dashboard/productos/bajo-stock" routerLinkActive="active" class="nav-item">
              <span class="icon">⚠️</span>
              Stock Bajo
            </a>
            <a routerLink="/dashboard/movimientos/historial" routerLinkActive="active" class="nav-item">
              <span class="icon">🔄</span>
              Historial Movimientos
            </a>
          </ng-container>
        </nav>
        <div class="user-profile">
          <div class="avatar">{{ currentUser?.nombre?.charAt(0) || 'U' }}</div>
          <div class="user-info">
            <span class="username">{{ currentUser?.nombre || 'Usuario SGI' }}</span>
            <span class="role">{{ getRoleLabel(role) }}</span>
          </div>
          <button (click)="logout()" class="logout-btn" title="Cerrar sesión">
            🚪
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <!-- Top Navbar -->
        <header class="navbar">
          <div class="navbar-title">
            <h2>Sistema de Gestión Interna</h2>
          </div>
          <div class="navbar-actions">
            <span class="notification-bell">🔔</span>
            <div class="status-indicator">
              <span class="dot online"></span>
              Servidor Conectado
            </div>
          </div>
        </header>

        <!-- Dynamic Content Router Outlet -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f8fafc;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background-color: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #1e293b;
      position: fixed;
      height: 100vh;
      z-index: 10;
    }

    .brand {
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid #1e293b;
    }

    .brand h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
      color: #6366f1;
      letter-spacing: -0.05em;
    }

    .badge {
      font-size: 0.7rem;
      background-color: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .nav-menu {
      flex: 1;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
    }

    .nav-item:hover {
      background-color: #1e293b;
      color: #f8fafc;
    }

    .nav-item.active {
      background-color: #4f46e5;
      color: white;
    }

    .nav-item .icon {
      font-size: 1.2rem;
    }

    .user-profile {
      padding: 1.25rem;
      border-top: 1px solid #1e293b;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background-color: #0b0f19;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #6366f1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .username {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role {
      font-size: 0.75rem;
      color: #64748b;
    }

    .logout-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background-color: #1e293b;
      color: #ef4444;
    }

    /* Main wrapper */
    .main-wrapper {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Navbar Styles */
    .navbar {
      height: 70px;
      background-color: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 5;
    }

    .navbar-title h2 {
      font-size: 1.15rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .notification-bell {
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
      transition: color 0.2s;
    }

    .notification-bell:hover {
      color: #4f46e5;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #64748b;
      background-color: #f1f5f9;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-weight: 500;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot.online {
      background-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
    }

    /* Content Area */
    .content {
      padding: 2rem;
      flex: 1;
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.getUser();
  role = this.authService.getRole();

  logout() {
    this.authService.logout();
  }

  getRoleLabel(role: string | null): string {
    if (!role) return 'Invitado';
    const labels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'GERENTE': 'Gerente',
      'JEFE_ALMACEN': 'Jefe de Almacén',
      'VENDEDOR': 'Vendedor'
    };
    return labels[role] || role;
  }
}
