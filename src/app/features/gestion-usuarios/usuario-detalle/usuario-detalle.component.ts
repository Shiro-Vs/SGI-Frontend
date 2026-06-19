import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Usuario } from '../../../core/models/usuario.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, EstadoPipe],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <a routerLink="/dashboard/usuarios" class="back-link">← Volver a la lista</a>
        <h2>Detalle del Usuario</h2>
      </div>

      <div *ngIf="loading" class="loading-state">
        Cargando información del usuario...
      </div>

      <div *ngIf="!loading && usuario" class="detail-card">
        <div class="user-avatar">
          {{ usuario.nombre.charAt(0) }}{{ usuario.apellido.charAt(0) }}
        </div>
        
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Nombre completo</span>
            <span class="value">{{ usuario.nombre }} {{ usuario.apellido }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Correo electrónico</span>
            <span class="value">{{ usuario.correo }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Rol ID</span>
            <span class="value"><span class="role-badge">{{ usuario.rolId }}</span></span>
          </div>

          <div class="detail-item">
            <span class="label">Sucursal ID</span>
            <span class="value">{{ usuario.sucursalId || '-' }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Estado de la cuenta</span>
            <span class="value">
              <span class="status-pill" [ngClass]="usuario.activo ? 'activo' : 'inactivo'">
                {{ usuario.activo | estado }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .back-link {
      font-size: 0.9rem;
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
      width: fit-content;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .detail-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
    }

    .loading-state {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }

    .detail-card {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #6366f1;
      color: white;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.2);
    }

    .details-grid {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      border-top: 1px solid #f1f5f9;
      padding-top: 1.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f8fafc;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item .label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }

    .detail-item .value {
      font-size: 0.95rem;
      color: #0f172a;
      font-weight: 600;
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
  `]
})
export class UsuarioDetalleComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  
  usuario?: Usuario;
  loading = true;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarUsuario(+idParam);
    }
  }

  cargarUsuario(id: number) {
    this.loading = true;
    this.apiService.get<Usuario>(`usuarios/${id}`).subscribe({
      next: (data) => {
        this.usuario = data;
        this.loading = false;
      },
      error: () => {
        // Fallback mock
        const mockUsuarios = [
          { id: 1, correo: 'admin@utp.edu.pe', nombre: 'Juan', apellido: 'Pérez', rolId: 1, sucursalId: 1, activo: true },
          { id: 2, correo: 'mflores@utp.edu.pe', nombre: 'María', apellido: 'Flores', rolId: 2, sucursalId: 1, activo: true },
          { id: 3, correo: 'jquispe@utp.edu.pe', nombre: 'Jorge', apellido: 'Quispe', rolId: 2, sucursalId: 2, activo: false }
        ];
        this.usuario = mockUsuarios.find(u => u.id === id);
        this.loading = false;
      }
    });
  }
}
