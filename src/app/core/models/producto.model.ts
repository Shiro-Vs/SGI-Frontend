import { Categoria } from './categoria.model';

export interface Producto {
  id?: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  unidadMedida: string;
  stockMinimo: number;
  stockMaximo: number;
  activo: boolean;
  categoriaId?: number;
  categoria?: Categoria | string;
  sucursalId?: number;
  sucursal?: string;
  stockActual?: number;
}
