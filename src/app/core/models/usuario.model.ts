export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  correo: string;
  activo: boolean;
  rolId?: number;
  rol?: string;
  sucursalId?: number;
  sucursal?: string;
  fechaRegistro?: string;
  fechaCreacion?: string;
}
