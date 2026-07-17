import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { AuthService } from '../../../services/auth.service';
import { Categoria } from '../../../core/models/categoria.model';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { FormularioCategoriaComponent } from '../components/formulario-categoria/formulario-categoria.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-categorias-lista',
  standalone: true,
  imports: [CommonModule, EstadoPipe, ModalComponent, ConfirmModalComponent, FormularioCategoriaComponent],
  template: `
    <div class="category-layout animate-fade-in">
      <div class="list-section full-width">
        <div class="list-header">
          <div>
            <h2>Categorías de Productos</h2>
            <p class="subtitle">Clasificación de productos dentro del inventario general.</p>
          </div>
          <div class="header-actions">
            <button *ngIf="isAdmin" (click)="abrirModalCrear()" class="btn-primary-link">
              <i class="bi bi-plus-circle"></i> Nueva Categoría
            </button>
          </div>
        </div>

        <div class="table-card">
          <div *ngIf="loading" class="loading-state">
            Cargando categorías...
          </div>

          <div *ngIf="!loading && categorias.length === 0" class="empty-state">
            No hay categorías registradas.
          </div>

          <table *ngIf="!loading && categorias.length > 0" class="category-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th class="actions-col" *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categorias; trackBy: trackByCategoriaId">
                <td>{{ c.id }}</td>
                <td class="bold-text">{{ c.nombre }}</td>
                <td>{{ c.descripcion || '-' }}</td>
                <td>
                  <span class="status-pill" [ngClass]="c.activa ? 'activo' : 'inactivo'">
                    {{ c.activa | estado }}
                  </span>
                </td>
                <td class="actions" *ngIf="isAdmin">
                  <button (click)="abrirModalEditar(c.id!)" class="action-btn edit" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button (click)="abrirModalEliminar(c.id!)" class="action-btn delete" title="Eliminar"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-modal
        [isOpen]="isFormModalOpen"
        [title]="selectedCategoriaId ? 'Editar Categoría' : 'Nueva Categoría'"
        width="500px"
        (close)="cerrarFormModal()"
      >
        <app-formulario-categoria
          *ngIf="isFormModalOpen"
          [esEdicion]="!!selectedCategoriaId"
          [categoriaId]="selectedCategoriaId"
          (guardado)="onCategoriaGuardada()"
          (cancelado)="cerrarFormModal()"
        ></app-formulario-categoria>
      </app-modal>

      <app-confirm-modal
        [isOpen]="isConfirmModalOpen"
        title="Eliminar Categoría"
        message="¿Está seguro de que desea eliminar esta categoría? Los productos asociados perderán su clasificación."
        confirmText="Eliminar"
        confirmStyle="delete"
        (confirm)="confirmarEliminacion()"
        (cancel)="isConfirmModalOpen = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .category-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .list-section.full-width {
      width: 100%;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
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

    .category-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .category-table th {
      background-color: #1e293b;
      padding: 1rem 1.5rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 2px solid #334155;
    }

    .category-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #334155;
      color: #f8fafc;
    }

    .category-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .category-table tbody tr:hover {
      background-color: rgba(51, 65, 85, 0.35);
    }

    .bold-text {
      font-weight: 600;
      color: #f8fafc;
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

    .cat-form {
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

    .textarea {
      resize: vertical;
      font-family: inherit;
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
export class CategoriasListaComponent implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];
  loading = true;
  isAdmin = false;

  isFormModalOpen = false;
  isConfirmModalOpen = false;
  selectedCategoriaId?: number;

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.loading = true;
    this.mantenimientoService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
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
    this.selectedCategoriaId = undefined;
    this.isFormModalOpen = true;
  }

  abrirModalEditar(id: number) {
    this.selectedCategoriaId = id;
    this.isFormModalOpen = true;
  }

  abrirModalEliminar(id: number) {
    this.selectedCategoriaId = id;
    this.isConfirmModalOpen = true;
  }

  cerrarFormModal() {
    this.isFormModalOpen = false;
  }

  onCategoriaGuardada() {
    this.isFormModalOpen = false;
    this.cargarCategorias();
  }

  confirmarEliminacion() {
    if (!this.selectedCategoriaId) return;

    this.mantenimientoService.eliminarCategoria(this.selectedCategoriaId).subscribe({
      next: () => {
        this.isConfirmModalOpen = false;
        this.cargarCategorias();
      },
      error: () => {
        this.isConfirmModalOpen = false;
        this.cargarCategorias();
      }
    });
  }

  trackByCategoriaId(index: number, c: any): number {
    return c.id;
  }
}
