import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { AuthService } from '../../../services/auth.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { FormularioSucursalComponent } from '../components/formulario-sucursal/formulario-sucursal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sucursales-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoPipe, ModalComponent, ConfirmModalComponent, FormularioSucursalComponent],
  template: `
    <div class="sucursal-layout animate-fade-in">
      <!-- Tabla de Sucursales -->
      <div class="list-section full-width">
        <div class="list-header">
          <div>
            <h2>Sucursales (Locales)</h2>
            <p class="subtitle">Lista y locales físicos autorizados en el sistema.</p>
          </div>
          <div class="header-actions" *ngIf="isAdmin">
            <button (click)="abrirModalCrear()" class="btn-primary-link">
              <i class="bi bi-plus-circle"></i> Nueva Sucursal
            </button>
          </div>
        </div>

        <div class="table-card">
          <div *ngIf="loading" class="loading-state">
            Cargando sucursales...
          </div>

          <div *ngIf="!loading && sucursales.length === 0" class="empty-state">
            No hay sucursales registradas.
          </div>

          <table *ngIf="!loading && sucursales.length > 0" class="sucursal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Distrito</th>
                <th>Estado</th>
                <th class="actions-col" *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of sucursales; trackBy: trackBySucursalId">
                <td>{{ s.id }}</td>
                <td class="bold-text">{{ s.nombre }}</td>
                <td>{{ s.direccion }}</td>
                <td><span class="district-badge">{{ s.distrito }}</span></td>
                <td>
                  <span class="status-pill" [ngClass]="s.activa ? 'activo' : 'inactivo'">
                    {{ s.activa | estado }}
                  </span>
                </td>
                <td class="actions" *ngIf="isAdmin">
                  <button (click)="abrirModalEditar(s.id!)" class="action-btn edit" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button (click)="abrirModalEliminar(s.id!)" class="action-btn delete" title="Desactivar"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-modal
        [isOpen]="isFormModalOpen"
        [title]="selectedSucursalId ? 'Editar Sucursal' : 'Nueva Sucursal'"
        width="550px"
        (close)="cerrarFormModal()"
      >
        <app-formulario-sucursal
          *ngIf="isFormModalOpen"
          [esEdicion]="!!selectedSucursalId"
          [sucursalId]="selectedSucursalId"
          (guardado)="onSucursalGuardada()"
          (cancelado)="cerrarFormModal()"
        ></app-formulario-sucursal>
      </app-modal>

      <app-confirm-modal
        [isOpen]="isConfirmModalOpen"
        title="Desactivar Sucursal"
        message="¿Está seguro de que desea desactivar esta sucursal? No estará disponible para nuevas transacciones."
        confirmText="Desactivar"
        confirmStyle="delete"
        (confirm)="confirmarEliminacion()"
        (cancel)="isConfirmModalOpen = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .sucursal-layout {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .list-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #f8fafc;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #94a3b8;
    }

    .list-section {
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .list-section.full-width {
      flex: 1;
    }

    .btn-primary-link {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }

    .btn-primary-link:hover {
      background-color: #2563eb;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .table-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #94a3b8;
    }

    .sucursal-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .sucursal-table th {
      background-color: #1e293b;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 2px solid #334155;
    }

    .sucursal-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #334155;
      color: #f8fafc;
    }

    .sucursal-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .sucursal-table tbody tr:hover {
      background-color: rgba(51, 65, 85, 0.35);
    }

    .bold-text {
      font-weight: 600;
      color: #f8fafc;
    }

    .district-badge {
      font-size: 0.8rem;
      background-color: #334155;
      color: #cbd5e1;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .status-pill.activo {
      background-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .status-pill.inactivo {
      background-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .actions-col {
      width: 120px;
      text-align: center;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .action-btn.edit { color: #60a5fa; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
    .action-btn.edit:hover { background-color: rgba(59, 130, 246, 0.2); }

    .action-btn.delete { color: #f87171; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
    .action-btn.delete:hover { background-color: rgba(239, 68, 68, 0.2); }

    /* Form Styles */
    .form-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .form-card h3 {
      margin: 0;
      color: #0f172a;
      font-size: 1.15rem;
    }

    .suc-form {
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }

    .form-control {
      width: 100%;
      padding: 0.6rem 0.85rem;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9rem;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4f46e5;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .form-control.is-invalid {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.75rem;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500 !important;
      color: #334155 !important;
    }

    .checkbox-label input {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .alert-error {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: #ef4444;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      text-align: center;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
    }

    .btn-secondary-sm {
      padding: 0.5rem 1rem;
      background-color: white;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-weight: 600;
      font-size: 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary-sm:hover {
      background-color: #f8fafc;
      border-color: #94a3b8;
    }
  `]
})
export class SucursalesListaComponent implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  sucursales: Sucursal[] = [];
  loading = true;
  isAdmin = false;

  isFormModalOpen = false;
  isConfirmModalOpen = false;
  selectedSucursalId?: number;

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.loading = true;
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCrear() {
    this.selectedSucursalId = undefined;
    this.isFormModalOpen = true;
  }

  abrirModalEditar(id: number) {
    this.selectedSucursalId = id;
    this.isFormModalOpen = true;
  }

  abrirModalEliminar(id: number) {
    this.selectedSucursalId = id;
    this.isConfirmModalOpen = true;
  }

  cerrarFormModal() {
    this.isFormModalOpen = false;
  }

  onSucursalGuardada() {
    this.isFormModalOpen = false;
    this.cargarSucursales();
  }

  confirmarEliminacion() {
    if (!this.selectedSucursalId) return;

    this.mantenimientoService.desactivarSucursal(this.selectedSucursalId).subscribe({
      next: () => {
        this.isConfirmModalOpen = false;
        this.cargarSucursales();
      },
      error: () => {
        this.isConfirmModalOpen = false;
        this.cargarSucursales();
      }
    });
  }

  trackBySucursalId(index: number, s: any): number {
    return s.id;
  }
}
