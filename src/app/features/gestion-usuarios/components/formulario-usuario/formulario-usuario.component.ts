import { Component, OnInit, Input, Output, EventEmitter, inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { MantenimientoService } from '../../../../services/mantenimiento.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { Sucursal } from '../../../../core/models/sucursal.model';
import { CustomButtonComponent } from '../../../../shared/components/custom-button/custom-button.component';
import { AppSwal as Swal } from '../../../../shared/utils/swal-theme';

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomButtonComponent],
  template: `
    <div class="form-wrapper">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label for="nombre">Nombre Completo</label>
            <input type="text" id="nombre" formControlName="nombre" class="form-control" placeholder="Ej. Juan Pérez" />
            <div *ngIf="submitted && f['nombre'].errors" class="invalid-feedback">
              <span *ngIf="f['nombre'].errors['required']">El nombre es requerido.</span>
              <span *ngIf="f['nombre'].errors['maxlength']">Máximo 100 caracteres.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="correo">Correo Electrónico</label>
            <input type="email" id="correo" formControlName="correo" class="form-control" placeholder="ejemplo@sgi.com" />
            <div *ngIf="submitted && f['correo'].errors" class="invalid-feedback">
              <span *ngIf="f['correo'].errors['required']">El correo es requerido.</span>
              <span *ngIf="f['correo'].errors['email']">Ingrese un correo válido.</span>
              <span *ngIf="f['correo'].errors['maxlength']">Máximo 120 caracteres.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña <span *ngIf="esEdicion" class="optional-label">(Dejar en blanco para no cambiar)</span></label>
            <input type="password" id="password" formControlName="password" class="form-control" placeholder="Mínimo 8 caracteres" />
            <div *ngIf="submitted && f['password']?.errors" class="invalid-feedback">
              <span *ngIf="f['password']?.errors['required']">La contraseña es requerida.</span>
              <span *ngIf="f['password']?.errors['minlength']">La contraseña debe tener al menos 8 caracteres.</span>
            </div>
          </div>

          <div class="form-group">
            <label>Rol del Sistema</label>
            <div class="custom-select-wrapper" [class.open]="rolDropdownOpen">
              <button type="button" class="custom-select-trigger" #rolTriggerRef (click)="toggleRolDropdown($event)">
                <span class="trigger-content">
                  <span class="selected-name">{{ selectedRol?.label || 'Seleccione un rol' }}</span>
                </span>
                <span class="chevron" [class.rotated]="rolDropdownOpen">▾</span>
              </button>
              <div
                class="custom-dropdown-panel"
                *ngIf="rolDropdownOpen"
                [style.position]="'fixed'"
                [style.top.px]="rolDropdownTop"
                [style.left.px]="rolDropdownLeft"
                [style.width.px]="rolDropdownWidth"
              >
                <div class="dropdown-options">
                  <button
                    type="button"
                    class="option-item"
                    *ngFor="let r of roles"
                    (click)="seleccionarRol(r)"
                    [class.selected]="selectedRol?.id === r.id"
                  >
                    <span class="option-name">{{ r.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Sucursal (Opcional)</label>
            <div class="custom-select-wrapper" [class.open]="dropdownOpen">
              <button type="button" class="custom-select-trigger" #triggerRef (click)="toggleDropdown($event)">
                <span class="trigger-content">
                  <span *ngIf="!selectedSucursal" class="placeholder">Sin sucursal asignada</span>
                  <span *ngIf="selectedSucursal" class="selected-label">
                    <span class="selected-name">{{ selectedSucursal.nombre }}</span>
                    <span class="selected-district">{{ selectedSucursal.distrito }}</span>
                  </span>
                </span>
                <span class="chevron" [class.rotated]="dropdownOpen">▾</span>
              </button>

              <!-- Panel con position:fixed para escapar del overflow del modal -->
              <div
                class="custom-dropdown-panel"
                *ngIf="dropdownOpen"
                [style.position]="'fixed'"
                [style.top.px]="dropdownTop"
                [style.left.px]="dropdownLeft"
                [style.width.px]="dropdownWidth"
              >
                <div class="search-wrapper">
                  <span class="search-icon-inner">🔍</span>
                  <input
                    type="text"
                    class="dropdown-search"
                    placeholder="Buscar sucursal..."
                    [(ngModel)]="searchSucursal"
                    [ngModelOptions]="{standalone: true}"
                    (click)="$event.stopPropagation()"
                  />
                </div>
                <div class="dropdown-options">
                  <button type="button" class="option-item none-option" (click)="seleccionarSucursal(null)">
                    <span>Sin sucursal asignada</span>
                  </button>
                  <button
                    type="button"
                    class="option-item"
                    *ngFor="let s of sucursalesFiltradas"
                    (click)="seleccionarSucursal(s)"
                    [class.selected]="selectedSucursal?.id === s.id"
                  >
                    <span class="option-name">{{ s.nombre }}</span>
                    <span class="option-badge">{{ s.distrito }}</span>
                  </button>
                  <div *ngIf="sucursalesFiltradas.length === 0" class="no-results">
                    No se encontraron sucursales
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="activo" />
              Cuenta Activa
            </label>
          </div>
        </div>

        <div *ngIf="error" class="alert-error">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="loading">Cancelar</button>
          <div class="submit-btn-wrapper">
            <app-custom-button type="submit" [label]="esEdicion ? 'Actualizar' : 'Crear Usuario'" [loading]="loading"></app-custom-button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-wrapper {
      width: 100%;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.checkbox-group {
      flex-direction: row;
      align-items: center;
      padding-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #cbd5e1;
      cursor: pointer;
    }

    .form-group label {
      font-weight: 500;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .optional-label {
      font-size: 0.75rem;
      font-weight: normal;
      color: #64748b;
      margin-left: 0.25rem;
    }

    .form-control {
      padding: 0.6rem 0.8rem;
      border: 1px solid #334155;
      border-radius: 8px;
      font-size: 0.95rem;
      background-color: #0f172a;
      color: #f8fafc;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .alert-error {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      text-align: center;
      margin-top: 1rem;
    }



    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      border-top: 1px solid #334155;
      padding-top: 1.5rem;
    }

    .btn-cancel {
      padding: 0.6rem 1.25rem;
      background-color: #0f172a;
      color: #cbd5e1;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #334155;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background-color: #334155;
      color: white;
    }.submit-btn-wrapper {
      width: 150px;
    }

    /* Custom Dropdown */
    .custom-select-wrapper {
      position: relative;
    }

    .custom-select-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.8rem;
      border: 1px solid #334155;
      border-radius: 8px;
      background-color: #0f172a;
      cursor: pointer;
      text-align: left;
      font-size: 0.95rem;
      color: #f8fafc;
      transition: all 0.2s;
    }

    .custom-select-wrapper.open .custom-select-trigger {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .trigger-content { flex: 1; overflow: hidden; }

    .placeholder { color: #94a3b8; }

    .selected-label {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .selected-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .selected-district {
      font-size: 0.75rem;
      color: #64748b;
    }

    .chevron {
      font-size: 1rem;
      color: #94a3b8;
      transition: transform 0.2s;
      flex-shrink: 0;
      margin-left: 0.5rem;
    }

    .chevron.rotated { transform: rotate(180deg); }

    .custom-dropdown-panel {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 9999;
      overflow: hidden;
    }

    .search-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid #334155;
      background: #0f172a;
    }

    .search-icon-inner { font-size: 0.8rem; color: #94a3b8; }

    .dropdown-search {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.9rem;
      color: #f8fafc;
      outline: none;
    }

    .dropdown-options {
      max-height: 200px;
      overflow-y: auto;
    }

    .option-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 1rem;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      font-size: 0.9rem;
      color: #f8fafc;
      transition: background-color 0.15s;
    }

    .option-item:hover { background-color: #334155; }

    .option-item.selected { background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; }

    .option-item.none-option {
      font-style: italic;
      color: #94a3b8;
      font-size: 0.85rem;
      border-bottom: 1px solid #334155;
    }

    .option-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .option-badge {
      font-size: 0.72rem;
      font-weight: 600;
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      flex-shrink: 0;
      margin-left: 0.5rem;
    }

    .no-results {
      padding: 1.25rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.85rem;
    }
  `]
})
export class FormularioUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private mantenimientoService = inject(MantenimientoService);

  @Input() esEdicion = false;
  @Input() userId?: number;
  
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  userForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: [''],
    rolId: [2, Validators.required],
    sucursalId: [null],
    activo: [true]
  });

  loading = false;
  submitted = false;
  error = '';
  sucursales: Sucursal[] = [];
  dropdownOpen = false;
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownWidth = 0;
  searchSucursal = '';
  selectedSucursal: Sucursal | null = null;

  rolDropdownOpen = false;
  rolDropdownTop = 0;
  rolDropdownLeft = 0;
  rolDropdownWidth = 0;
  selectedRol: { id: number; label: string } | null = null;

  roles = [
    { id: 1, label: 'Administrador' },
    { id: 2, label: 'Gerente' },
    { id: 3, label: 'Jefe de Almacén' },
    { id: 4, label: 'Vendedor' }
  ];

  @ViewChild('triggerRef') triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('rolTriggerRef') rolTriggerRef!: ElementRef<HTMLButtonElement>;

  get sucursalesFiltradas(): Sucursal[] {
    if (!this.searchSucursal.trim()) return this.sucursales;
    const q = this.searchSucursal.toLowerCase();
    return this.sucursales.filter(s =>
      s.nombre.toLowerCase().includes(q) || s.distrito.toLowerCase().includes(q)
    );
  }

  get f() { return this.userForm.controls; }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    if (!this.dropdownOpen) {
      const rect = this.triggerRef.nativeElement.getBoundingClientRect();
      this.dropdownTop = rect.bottom + 6;
      this.dropdownLeft = rect.left;
      this.dropdownWidth = rect.width;
    }
    this.dropdownOpen = !this.dropdownOpen;
    this.rolDropdownOpen = false;
  }

  toggleRolDropdown(event: MouseEvent) {
    event.stopPropagation();
    if (!this.rolDropdownOpen) {
      const rect = this.rolTriggerRef.nativeElement.getBoundingClientRect();
      this.rolDropdownTop = rect.bottom + 6;
      this.rolDropdownLeft = rect.left;
      this.rolDropdownWidth = rect.width;
    }
    this.rolDropdownOpen = !this.rolDropdownOpen;
    this.dropdownOpen = false;
  }

  seleccionarRol(r: { id: number; label: string }) {
    this.selectedRol = r;
    this.userForm.patchValue({ rolId: r.id });
    this.rolDropdownOpen = false;
  }

  ngOnInit() {
    if (!this.esEdicion) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();

    // Inicializar rol seleccionado
    const rolInicial = this.userForm.get('rolId')?.value;
    this.selectedRol = this.roles.find(r => r.id === rolInicial) || this.roles[1];

    this.cargarSucursales();
    if (this.esEdicion && this.userId) {
      this.cargarUsuario(this.userId);
    }
  }

  cargarSucursales() {
    this.mantenimientoService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data.filter(s => s.activa);
        // Si viene en modo edición, sincronizar la selección visual
        const currentId = this.userForm.get('sucursalId')?.value;
        if (currentId) {
          this.selectedSucursal = this.sucursales.find(s => s.id === currentId) || null;
        }
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.dropdownOpen = false;
      this.rolDropdownOpen = false;
    }
  }

  seleccionarSucursal(s: Sucursal | null) {
    this.selectedSucursal = s;
    this.userForm.patchValue({ sucursalId: s?.id ?? null });
    this.dropdownOpen = false;
    this.searchSucursal = '';
  }

  cargarUsuario(id: number) {
    this.apiService.get<Usuario>(`usuarios/${id}`).subscribe({
      next: (usuario) => {
        this.userForm.patchValue(usuario);
      },
      error: () => {
        const mockUsuarios = [
          { id: 1, correo: 'admin@utp.edu.pe', nombre: 'Juan Pérez', rolId: 1, sucursalId: 1, activo: true },
          { id: 2, correo: 'mflores@utp.edu.pe', nombre: 'María Flores', rolId: 2, sucursalId: 1, activo: true },
          { id: 3, correo: 'jquispe@utp.edu.pe', nombre: 'Jorge Quispe', rolId: 2, sucursalId: 2, activo: false }
        ];
        const user = mockUsuarios.find(u => u.id === id);
        if (user) {
          this.userForm.patchValue(user);
        }
      }
    });
  }

  onCancel() {
    this.cancelado.emit();
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    
    if (this.userForm.invalid) return;

    this.loading = true;
    const userData: any = { ...this.userForm.value };
    
    if (this.esEdicion && (!userData.password || userData.password.trim() === '')) {
      userData.password = null;
    }

    const request$ = this.esEdicion && this.userId
      ? this.apiService.put<Usuario>(`usuarios/${this.userId}`, userData)
      : this.apiService.post<Usuario>('usuarios', userData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: '¡Operación exitosa!',
          text: this.esEdicion ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.guardado.emit();
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al guardar el usuario.';
      }
    });
  }
}
