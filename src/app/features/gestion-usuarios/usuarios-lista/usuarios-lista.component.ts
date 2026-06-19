import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Usuario } from '../../../core/models/usuario.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, EstadoPipe],
  template: `
    <div class="user-list-container">
      <div class="list-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p class="subtitle">Lista y administración de cuentas de usuario del sistema.</p>
        </div>
        <div>
          <a routerLink="nuevo" class="btn-primary-link">
            ➕ Nuevo Usuario
          </a>
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
            <tr *ngFor="let u of usuarios">
              <td>{{ u.id }}</td>
              <td class="bold-text">{{ u.nombre }} {{ u.apellido }}</td>
              <td>{{ u.correo }}</td>
              <td><span class="role-badge">{{ u.rolId }}</span></td>
              <td>{{ u.sucursalId || '-' }}</td>
              <td>
                <span class="status-pill" [ngClass]="u.activo ? 'activo' : 'inactivo'">
                  {{ u.activo | estado }}
                </span>
              </td>
              <td class="actions-cell">
                <a [routerLink]="[u.id]" class="action-btn view" title="Ver Detalle">👁️</a>
                <a [routerLink]="['editar', u.id]" class="action-btn edit" title="Editar">✏️</a>
                <button (click)="eliminarUsuario(u.id)" class="action-btn delete" title="Eliminar">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
      color: #0f172a;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #64748b;
    }

    .btn-primary-link {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.25rem;
      background-color: #4f46e5;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .btn-primary-link:hover {
      background-color: #4338ca;
    }

    .table-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }

    .user-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .user-table th {
      background-color: #f8fafc;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }

    .user-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .bold-text {
      font-weight: 600;
      color: #0f172a;
    }

    .role-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      background-color: #f1f5f9;
      color: #475569;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .status-pill.activo {
      background-color: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .status-pill.inactivo {
      background-color: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .actions-col {
      width: 120px;
      text-align: center;
    }

    .actions-cell {
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
      border: 1px solid #e2e8f0;
      background-color: white;
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background-color: #f1f5f9;
    }

    .action-btn.view:hover {
      color: #3b82f6;
      border-color: #3b82f6;
    }

    .action-btn.edit:hover {
      color: #f59e0b;
      border-color: #f59e0b;
    }

    .action-btn.delete:hover {
      color: #ef4444;
      border-color: #ef4444;
    }
  `]
})
export class UsuariosListaComponent implements OnInit {
  private apiService = inject(ApiService);
  
  usuarios: Usuario[] = [];
  loading = true;

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.apiService.get<Usuario[]>('usuarios').subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        // En caso de que falle porque no hay backend real corriendo aún, cargamos datos mock
        this.usuarios = [
          { id: 1, correo: 'admin@utp.edu.pe', nombre: 'Juan', apellido: 'Pérez', rolId: 1, sucursalId: 1, activo: true },
          { id: 2, correo: 'mflores@utp.edu.pe', nombre: 'María', apellido: 'Flores', rolId: 2, sucursalId: 1, activo: true },
          { id: 3, correo: 'jquispe@utp.edu.pe', nombre: 'Jorge', apellido: 'Quispe', rolId: 2, sucursalId: 2, activo: false }
        ];
        this.loading = false;
      }
    });
  }

  eliminarUsuario(id: number | undefined) {
    if (!id || !confirm('¿Está seguro de eliminar este usuario?')) return;
    
    this.apiService.delete(`usuarios/${id}`).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
      },
      error: () => {
        // Mock fallback en caso de error
        this.usuarios = this.usuarios.filter(u => u.id !== id);
      }
    });
  }
}
