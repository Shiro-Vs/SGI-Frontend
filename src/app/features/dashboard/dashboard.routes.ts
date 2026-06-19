import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardHomeComponent } from './dashboard-home.component';

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
        loadChildren: () => import('../gestion-usuarios/usuarios.routes').then(m => m.usuariosRoutes)
      }
    ]
  }
];
