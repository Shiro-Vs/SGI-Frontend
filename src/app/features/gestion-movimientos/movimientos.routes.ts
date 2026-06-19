import { Routes } from '@angular/router';
import { MovimientosHistorialComponent } from './movimientos-historial/movimientos-historial.component';
import { MovimientoEntradaComponent } from './movimiento-entrada/movimiento-entrada.component';
import { MovimientoSalidaComponent } from './movimiento-salida/movimiento-salida.component';
import { MovimientoTransferenciaComponent } from './movimiento-transferencia/movimiento-transferencia.component';
import { roleGuard } from '../../core/guards/role.guard';

export const movimientosRoutes: Routes = [
  {
    path: 'historial',
    component: MovimientosHistorialComponent,
    canActivate: [roleGuard],
    data: { expectedRoles: ['ADMIN', 'GERENTE', 'JEFE_ALMACEN'] }
  },
  {
    path: 'entrada',
    component: MovimientoEntradaComponent,
    canActivate: [roleGuard],
    data: { expectedRoles: ['ADMIN', 'JEFE_ALMACEN'] }
  },
  {
    path: 'salida',
    component: MovimientoSalidaComponent,
    canActivate: [roleGuard],
    data: { expectedRoles: ['ADMIN', 'VENDEDOR'] }
  },
  {
    path: 'transferencia',
    component: MovimientoTransferenciaComponent,
    canActivate: [roleGuard],
    data: { expectedRoles: ['ADMIN', 'JEFE_ALMACEN'] }
  },
  {
    path: '',
    redirectTo: 'historial',
    pathMatch: 'full'
  }
];
