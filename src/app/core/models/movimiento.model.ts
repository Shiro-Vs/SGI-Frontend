import { Producto } from './producto.model';
import { Sucursal } from './sucursal.model';
import { Usuario } from './usuario.model';

export interface Movimiento {
  id?: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  producto: Producto | string;
  cantidad: number;
  sucursalOrigen?: Sucursal | string;
  sucursalDestino?: Sucursal | string;
  usuario?: Usuario | string;
  observacion?: string;
  fecha?: string;
}
