import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../core/models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private api = inject(ApiService);

  listarTodos(sucursalId?: number): Observable<Producto[]> {
    const params: any = {};
    if (sucursalId) params.sucursalId = sucursalId;
    return this.api.get<Producto[]>('productos', params);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.api.get<Producto>(`productos/${id}`);
  }

  buscarPorNombre(nombre: string, sucursalId?: number): Observable<Producto[]> {
    const params: any = { nombre };
    if (sucursalId) params.sucursalId = sucursalId;
    return this.api.get<Producto[]>('productos/buscar', params);
  }

  listarBajoStock(): Observable<Producto[]> {
    return this.api.get<Producto[]>('productos/bajo-stock');
  }

  crear(req: any): Observable<Producto> {
    return this.api.post<Producto>('productos', req);
  }

  actualizar(id: number, req: any): Observable<Producto> {
    return this.api.put<Producto>(`productos/${id}`, req);
  }

  desactivar(id: number): Observable<void> {
    return this.api.delete<void>(`productos/${id}`);
  }
}
