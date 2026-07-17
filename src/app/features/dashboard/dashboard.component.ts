import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

const SECTION_TITLES: Record<string, string> = {
  home: 'Resumen',
  usuarios: 'Gestión de Usuarios',
  sucursales: 'Gestión de Sucursales',
  categorias: 'Gestión de Categorías',
  productos: 'Gestión de Productos',
  movimientos: 'Movimientos de Stock'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="brand">
          <div class="brand-logo">
            <h1>SGI</h1>
            <span class="badge">v1.0</span>
          </div>
          <button class="toggle-sidebar-btn" (click)="toggleSidebar()" title="Alternar menú">
            <i class="bi bi-list"></i>
          </button>
        </div>
        <nav class="nav-menu">
          <!-- Todos ven Panel Principal -->
          <a routerLink="/dashboard/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Resumen">
            <span class="icon"><i class="bi bi-graph-up"></i></span>
            <span class="nav-text">Resumen</span>
          </a>

          <!-- ADMIN -->
          <ng-container *ngIf="role === 'ADMIN'">
            <a routerLink="/dashboard/usuarios" routerLinkActive="active" class="nav-item" title="Usuarios">
              <span class="icon"><i class="bi bi-people"></i></span>
              <span class="nav-text">Usuarios</span>
            </a>
            <a routerLink="/dashboard/sucursales" routerLinkActive="active" class="nav-item" title="Sucursales">
              <span class="icon"><i class="bi bi-building"></i></span>
              <span class="nav-text">Sucursales</span>
            </a>
            <a routerLink="/dashboard/categorias" routerLinkActive="active" class="nav-item" title="Categorías">
              <span class="icon"><i class="bi bi-tags"></i></span>
              <span class="nav-text">Categorías</span>
            </a>
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Productos">
              <span class="icon"><i class="bi bi-box-seam"></i></span>
              <span class="nav-text">Productos</span>
            </a>
            <a routerLink="/dashboard/movimientos/historial" routerLinkActive="active" class="nav-item" title="Movimientos">
              <span class="icon"><i class="bi bi-arrow-left-right"></i></span>
              <span class="nav-text">Movimientos</span>
            </a>
            <a routerLink="/dashboard/productos/bajo-stock" routerLinkActive="active" class="nav-item" title="Alertas (Stock Bajo)">
              <span class="icon"><i class="bi bi-exclamation-triangle"></i></span>
              <span class="nav-text">Alertas (Stock Bajo)</span>
            </a>
          </ng-container>

          <!-- JEFE_ALMACEN -->
          <ng-container *ngIf="role === 'JEFE_ALMACEN'">
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Productos">
              <span class="icon"><i class="bi bi-box-seam"></i></span>
              <span class="nav-text">Productos</span>
            </a>
            <a routerLink="/dashboard/productos/bajo-stock" routerLinkActive="active" class="nav-item" title="Stock Bajo">
              <span class="icon"><i class="bi bi-exclamation-triangle"></i></span>
              <span class="nav-text">Stock Bajo</span>
            </a>
            <a routerLink="/dashboard/movimientos/entrada" routerLinkActive="active" class="nav-item" title="Entrada de Stock">
              <span class="icon"><i class="bi bi-box-arrow-in-down"></i></span>
              <span class="nav-text">Entrada de Stock</span>
            </a>
            <a routerLink="/dashboard/movimientos/transferencia" routerLinkActive="active" class="nav-item" title="Transferencias">
              <span class="icon"><i class="bi bi-truck"></i></span>
              <span class="nav-text">Transferencias</span>
            </a>
          </ng-container>

          <!-- VENDEDOR -->
          <ng-container *ngIf="role === 'VENDEDOR'">
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Productos">
              <span class="icon"><i class="bi bi-box-seam"></i></span>
              <span class="nav-text">Productos</span>
            </a>
            <a routerLink="/dashboard/movimientos/salida" routerLinkActive="active" class="nav-item" title="Salida (Ventas)">
              <span class="icon"><i class="bi bi-box-arrow-up"></i></span>
              <span class="nav-text">Salida (Ventas)</span>
            </a>
          </ng-container>

          <!-- GERENTE -->
          <ng-container *ngIf="role === 'GERENTE'">
            <a routerLink="/dashboard/productos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Ver Productos">
              <span class="icon"><i class="bi bi-box-seam"></i></span>
              <span class="nav-text">Ver Productos</span>
            </a>
            <a routerLink="/dashboard/productos/bajo-stock" routerLinkActive="active" class="nav-item" title="Stock Bajo">
              <span class="icon"><i class="bi bi-exclamation-triangle"></i></span>
              <span class="nav-text">Stock Bajo</span>
            </a>
            <a routerLink="/dashboard/movimientos/historial" routerLinkActive="active" class="nav-item" title="Historial Movimientos">
              <span class="icon"><i class="bi bi-arrow-left-right"></i></span>
              <span class="nav-text">Historial Movimientos</span>
            </a>
          </ng-container>
        </nav>
        <div class="user-profile">
          <div class="avatar" [title]="currentUser?.nombre">{{ currentUser?.nombre?.charAt(0) || 'U' }}</div>
          <div class="user-info">
            <span class="username">{{ currentUser?.nombre || 'Usuario SGI' }}</span>
            <span class="role">{{ getRoleLabel(role) }}</span>
          </div>
          <button (click)="logout()" class="logout-btn" title="Cerrar sesión">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper" [class.collapsed]="isSidebarCollapsed">
        <!-- Top Navbar -->
        <header class="navbar">
          <div class="navbar-title">
            <h2>{{ pageTitle }}</h2>
          </div>
          <div class="navbar-actions">
            <div class="status-indicator">
              <span class="dot online"></span>
              En línea
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
      height: 100vh;
      background-color: #0b1121;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    .sidebar {
      width: 260px;
      background-color: #0f172a;
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      z-index: 10;
      position: fixed;
      height: 100vh;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .brand {
      height: 70px;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sidebar.collapsed .brand {
      padding: 0;
      justify-content: center;
    }

    .sidebar.collapsed .brand-logo {
      display: none;
    }

    .brand h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
      color: #3b82f6;
      letter-spacing: -0.05em;
    }

    .badge {
      font-size: 0.7rem;
      background-color: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
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
      overflow-x: hidden;
    }

    .sidebar.collapsed .nav-menu {
      padding: 1.5rem 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      font-size: 0.95rem;
      font-weight: 500;
      gap: 0.75rem;
      white-space: nowrap;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem 0;
    }

    .sidebar.collapsed .nav-text {
      display: none;
    }

    .nav-item:hover {
      background-color: #1e293b;
      color: white;
    }

    .nav-item.active {
      background-color: #1e293b;
      color: white;
      border-left: 4px solid #3b82f6;
    }

    .sidebar.collapsed .nav-item.active {
      border-left: none;
      background-color: #1e293b;
      position: relative;
    }

    .sidebar.collapsed .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10%;
      height: 80%;
      width: 4px;
      background-color: #3b82f6;
      border-radius: 0 4px 4px 0;
    }

    .nav-item .icon {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-profile {
      padding: 1.25rem;
      border-top: 1px solid #1e293b;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background-color: #0b0f19;
      white-space: nowrap;
    }

    .sidebar.collapsed .user-profile {
      flex-direction: column;
      padding: 1.25rem 0.5rem;
      gap: 1rem;
    }

    .sidebar.collapsed .user-info {
      display: none;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
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
      color: white;
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

    .main-wrapper {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-wrapper.collapsed {
      margin-left: 80px;
    }

    .navbar {
      height: 70px;
      background-color: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 5;
    }

    .navbar-title {
      display: flex;
      align-items: center;
    }
    
    .toggle-sidebar-btn {
      background: none;
      border: none;
      color: #cbd5e1;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      transition: color 0.2s;
    }

    .toggle-sidebar-btn:hover {
      color: #3b82f6;
    }

    .navbar-title h2 {
      font-size: 1.15rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #cbd5e1;
      background-color: #1e293b;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-weight: 500;
      border: 1px solid #334155;
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
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  currentUser = this.authService.getUser();
  role = this.authService.getRole();
  isSidebarCollapsed = false;
  pageTitle = 'Sistema de Gestión Interna';

  constructor() {
    this.updatePageTitle(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => this.updatePageTitle(event.urlAfterRedirects));
  }

  private updatePageTitle(url: string) {
    const section = url.split('/').filter(Boolean)[1] || 'home';
    this.pageTitle = SECTION_TITLES[section] || 'Sistema de Gestión Interna';
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

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
