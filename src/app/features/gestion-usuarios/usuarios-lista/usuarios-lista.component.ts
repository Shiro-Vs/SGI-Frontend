import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Usuario } from '../../../core/models/usuario.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { FormularioUsuarioComponent } from '../components/formulario-usuario/formulario-usuario.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, EstadoPipe, ModalComponent, ConfirmModalComponent, FormularioUsuarioComponent],
  template: `
    <div class="user-list-container animate-fade-in">
      <div class="list-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p class="subtitle">Lista y administración de cuentas de usuario del sistema.</p>
        </div>
        <div class="header-actions">
          <button (click)="abrirModalCrear()" class="btn-primary-link">
            <i class="bi bi-plus-circle"></i> Nuevo Usuario
          </button>
        </div>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-state">
          Cargando usuarios...
        </div>

        <div *ngIf="!loading && usuarios.length === 0" class="empty-state">
          No hay usuarios registrados.
        </div>

        <table *ngIf="!loading && usuarios.length > 0" class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo</th>
              <th>Rol ID</th>
              <th>Sucursal ID</th>
              <th>Estado</th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of usuarios; trackBy: trackByUsuarioId">
              <td>{{ u.id }}</td>
              <td class="bold-text name-cell">
                <span class="avatar-role" [ngClass]="getRoleClass(u.rol || u.rolId)">{{ (u.nombre || '?').charAt(0) | uppercase }}</span>
                {{ u.nombre }}{{ u.apellido ? ' ' + u.apellido : '' }}
              </td>
              <td>{{ u.correo }}</td>
              <td><span class="role-badge" [ngClass]="getRoleClass(u.rol || u.rolId)">{{ u.rol || u.rolId }}</span></td>
              <td>{{ u.sucursal || u.sucursalId || '-' }}</td>
              <td>
                <span class="status-pill" [ngClass]="u.activo ? 'activo' : 'inactivo'">
                  {{ u.activo | estado }}
                </span>
              </td>
              <td class="actions">
                <a [routerLink]="[u.id]" class="action-btn view" title="Ver Detalle"><i class="bi bi-eye"></i></a>
                <button (click)="abrirModalEditar(u.id!)" class="action-btn edit" title="Editar"><i class="bi bi-pencil"></i></button>
                <button (click)="abrirModalEliminar(u.id!)" class="action-btn delete" title="Eliminar"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-modal
        [isOpen]="isFormModalOpen"
        [title]="selectedUserId ? 'Editar Usuario' : 'Nuevo Usuario'"
        width="450px"
        (close)="cerrarFormModal()"
      >
        <app-formulario-usuario
          *ngIf="isFormModalOpen"
          [esEdicion]="!!selectedUserId"
          [userId]="selectedUserId"
          (guardado)="onUsuarioGuardado()"
          (cancelado)="cerrarFormModal()"
        ></app-formulario-usuario>
      </app-modal>

      <app-confirm-modal
        [isOpen]="isConfirmModalOpen"
        title="Eliminar Usuario"
        message="¿Está seguro de que desea desactivar/eliminar esta cuenta de usuario? Esta acción no se puede deshacer de forma simple."
        confirmText="Eliminar"
        confirmStyle="delete"
        (confirm)="confirmarEliminacion()"
        (cancel)="isConfirmModalOpen = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .user-list-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .user-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .user-table th {
      background-color: #1e293b;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 2px solid #334155;
    }

    .user-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #334155;
      color: #f8fafc;
    }

    .user-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .user-table tbody tr:hover {
      background-color: rgba(51, 65, 85, 0.35);
    }

    .bold-text {
      font-weight: 600;
      color: #f8fafc;
    }

    .role-badge {
      font-size: 0.70rem;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .role-badge.admin {
      background-color: rgba(168, 85, 247, 0.2);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .role-badge.vendedor {
      background-color: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .role-badge.jefe-almacen {
      background-color: rgba(245, 158, 11, 0.2);
      color: #fcd34d;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .role-badge.default {
      background-color: rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .avatar-role {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .avatar-role.admin {
      background-color: rgba(168, 85, 247, 0.2);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .avatar-role.vendedor {
      background-color: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .avatar-role.jefe-almacen {
      background-color: rgba(245, 158, 11, 0.2);
      color: #fcd34d;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .avatar-role.default {
      background-color: rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.3);
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
      text-decoration: none;
      transition: all 0.2s;
    }

    .action-btn.view { color: #f8fafc; background-color: #0f172a; border: 1px solid #334155; }
    .action-btn.view:hover { background-color: #334155; }

    .action-btn.edit { color: #60a5fa; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
    .action-btn.edit:hover { background-color: rgba(59, 130, 246, 0.2); }

    .action-btn.delete { color: #f87171; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
    .action-btn.delete:hover { background-color: rgba(239, 68, 68, 0.2); }
  `]
})
export class UsuariosListaComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  
  usuarios: Usuario[] = [];
  loading = true;

  isFormModalOpen = false;
  isConfirmModalOpen = false;
  selectedUserId?: number;

  ngOnInit() {
    this.cargarUsuarios();
  }

  getRoleClass(role: any): string {
    if (!role) return 'default';
    const r = role.toString().toUpperCase();
    if (r === 'ADMIN' || r === '1') return 'admin';
    if (r === 'VENDEDOR' || r === '2') return 'vendedor';
    if (r === 'JEFE_ALMACEN' || r === '3') return 'jefe-almacen';
    return 'default';
  }

  cargarUsuarios() {
    this.loading = true;
    this.apiService.get<Usuario[]>('usuarios').subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('UsuariosListaComponent: failed loading usuarios! error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByUsuarioId(index: number, usuario: Usuario): number | undefined {
    return usuario.id;
  }

  abrirModalCrear() {
    this.selectedUserId = undefined;
    this.isFormModalOpen = true;
  }

  abrirModalEditar(id: number) {
    this.selectedUserId = id;
    this.isFormModalOpen = true;
  }

  abrirModalEliminar(id: number) {
    this.selectedUserId = id;
    this.isConfirmModalOpen = true;
  }

  cerrarFormModal() {
    this.isFormModalOpen = false;
  }

  onUsuarioGuardado() {
    this.isFormModalOpen = false;
    this.cargarUsuarios();
  }

  confirmarEliminacion() {
    if (!this.selectedUserId) return;
    
    this.apiService.delete(`usuarios/${this.selectedUserId}`).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== this.selectedUserId);
        this.isConfirmModalOpen = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== this.selectedUserId);
        this.isConfirmModalOpen = false;
        this.cdr.detectChanges();
      }
    });
  }
}
