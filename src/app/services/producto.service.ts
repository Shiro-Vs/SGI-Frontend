import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../core/models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private api = inject(ApiService);

  listarTodos(): Observable<Producto[]> {
    return this.api.get<Producto[]>('productos');
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.api.get<Producto>(`productos/${id}`);
  }

  buscarPorNombre(nombre: string): Observable<Producto[]> {
    return this.api.get<Producto[]>('productos/buscar', { nombre });
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
