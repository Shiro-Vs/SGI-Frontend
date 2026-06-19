import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../core/models/categoria.model';
import { Sucursal } from '../core/models/sucursal.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private api = inject(ApiService);

  // Categorías
  listarCategorias(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('categorias');
  }

  obtenerCategoria(id: number): Observable<Categoria> {
    return this.api.get<Categoria>(`categorias/${id}`);
  }

  crearCategoria(req: any): Observable<Categoria> {
    return this.api.post<Categoria>('categorias', req);
  }

  actualizarCategoria(id: number, req: any): Observable<Categoria> {
    return this.api.put<Categoria>(`categorias/${id}`, req);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.api.delete<void>(`categorias/${id}`);
  }

  // Sucursales
  listarSucursales(): Observable<Sucursal[]> {
    return this.api.get<Sucursal[]>('sucursales');
  }

  obtenerSucursal(id: number): Observable<Sucursal> {
    return this.api.get<Sucursal>(`sucursales/${id}`);
  }

  crearSucursal(req: any): Observable<Sucursal> {
    return this.api.post<Sucursal>('sucursales', req);
  }

  actualizarSucursal(id: number, req: any): Observable<Sucursal> {
    return this.api.put<Sucursal>(`sucursales/${id}`, req);
  }

  desactivarSucursal(id: number): Observable<void> {
    return this.api.delete<void>(`sucursales/${id}`);
  }
}
