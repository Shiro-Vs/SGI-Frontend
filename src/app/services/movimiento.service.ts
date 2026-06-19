import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Movimiento } from '../core/models/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private api = inject(ApiService);

  listarTodos(): Observable<Movimiento[]> {
    return this.api.get<Movimiento[]>('movimientos');
  }

  listarPorSucursal(sucursalId: number, desde: string, hasta: string): Observable<Movimiento[]> {
    return this.api.get<Movimiento[]>(`movimientos/sucursal/${sucursalId}`, { desde, hasta });
  }

  registrarEntrada(req: { productoId: number; sucursalId: number; cantidad: number; observacion?: string }): Observable<Movimiento> {
    return this.api.post<Movimiento>('movimientos/entrada', req);
  }

  registrarSalida(req: { productoId: number; sucursalId: number; cantidad: number; observacion?: string }): Observable<Movimiento> {
    return this.api.post<Movimiento>('movimientos/salida', req);
  }

  registrarTransferencia(req: { productoId: number; sucursalOrigenId: number; sucursalDestinoId: number; cantidad: number; observacion?: string }): Observable<Movimiento> {
    return this.api.post<Movimiento>('movimientos/transferencia', req);
  }
}
