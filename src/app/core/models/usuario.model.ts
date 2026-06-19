export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  rolId: number;
  sucursalId?: number;
  fechaRegistro?: string;
}
