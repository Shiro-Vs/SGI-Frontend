import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal 
      [isOpen]="isOpen" 
      [title]="title" 
      width="450px" 
      (close)="onCancel()">
      
      <div class="confirm-content">
        <p>{{ message }}</p>
      </div>

      <div class="confirm-actions">
        <button class="btn-cancel" (click)="onCancel()">{{ cancelText }}</button>
        <button 
          class="btn-confirm" 
          [ngClass]="confirmStyle" 
          (click)="onConfirm()">
          {{ confirmText }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .confirm-content {
      font-size: 1rem;
      color: #cbd5e1;
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-cancel, .btn-confirm {
      padding: 0.6rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
    }

    .btn-cancel {
      background-color: #0f172a;
      color: #cbd5e1;
      border: 1px solid #334155;
    }

    .btn-cancel:hover {
      background-color: #334155;
      color: white;
    }

    .btn-confirm.delete {
      background-color: #ef4444;
      color: white;
    }

    .btn-confirm.delete:hover {
      background-color: #dc2626;
    }

    .btn-confirm.create {
      background-color: #10b981;
      color: white;
    }

    .btn-confirm.create:hover {
      background-color: #059669;
    }

    .btn-confirm.edit {
      background-color: #3b82f6;
      color: white;
    }

    .btn-confirm.edit:hover {
      background-color: #2563eb;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar Acción';
  @Input() message = '¿Está seguro de realizar esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() confirmStyle: 'delete' | 'create' | 'edit' = 'delete';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
