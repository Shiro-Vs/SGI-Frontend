import { Routes } from '@angular/router';
import { ProductosListaComponent } from './productos-lista/productos-lista.component';
import { ProductosBajoStockComponent } from './productos-bajo-stock/productos-bajo-stock.component';
import { roleGuard } from '../../core/guards/role.guard';

export const productosRoutes: Routes = [
  {
    path: '',
    component: ProductosListaComponent
  },
  {
    path: 'bajo-stock',
    component: ProductosBajoStockComponent,
    canActivate: [roleGuard],
    data: { expectedRoles: ['ADMIN', 'GERENTE', 'JEFE_ALMACEN'] }
  }
];

