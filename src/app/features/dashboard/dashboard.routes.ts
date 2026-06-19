import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardHomeComponent } from './dashboard-home.component';
import { roleGuard } from '../../core/guards/role.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHomeComponent
      },
      {
        path: 'usuarios',
        loadChildren: () => import('../gestion-usuarios/usuarios.routes').then(m => m.usuariosRoutes),
        canActivate: [roleGuard],
        data: { expectedRoles: ['ADMIN'] }
      },
      {
        path: 'productos',
        loadChildren: () => import('../gestion-productos/productos.routes').then(m => m.productosRoutes)
      },
      {
        path: 'movimientos',
        loadChildren: () => import('../gestion-movimientos/movimientos.routes').then(m => m.movimientosRoutes)
      },
      {
        path: 'categorias',
        loadChildren: () => import('../gestion-categorias/categorias.routes').then(m => m.categoriasRoutes)
      },
      {
        path: 'sucursales',
        loadChildren: () => import('../gestion-sucursales/sucursales.routes').then(m => m.sucursalesRoutes)
      }
    ]
  }
];
