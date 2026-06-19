import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../core/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private api = inject(ApiService);

  listarTodos(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('usuarios');
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`usuarios/${id}`);
  }

  crear(req: any): Observable<Usuario> {
    return this.api.post<Usuario>('auth/register', req);
  }

  actualizar(id: number, req: any): Observable<Usuario> {
    return this.api.put<Usuario>(`usuarios/${id}`, req);
  }

  desactivar(id: number): Observable<void> {
    return this.api.delete<void>(`usuarios/${id}`);
  }
}
