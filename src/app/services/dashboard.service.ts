import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ProductoDashboardDto {
  nombre: string;
  sku: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  sucursal: string;
}

export interface ProductoMovimientoDto {
  nombreProducto: string;
  cantidadMovimientos: number;
}

export interface DashboardResponse {
  totalUsuarios?: number;
  totalVendedores?: number;
  totalAlmaceneros?: number;
  totalSucursales?: number;
  totalEntradas?: number;
  totalSalidas?: number;
  totalTransferencias?: number;
  productosBajoStock: ProductoDashboardDto[];
  productosMasMovidos: ProductoMovimientoDto[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  obtenerResumen(): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>('dashboard');
  }
}
