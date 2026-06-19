import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
      [ngClass]="variantClass"
      class="btn-custom"
    >
      <span *ngIf="loading" class="spinner-btn"></span>
      <span *ngIf="!loading"><slot></slot>{{ label }}</span>
    </button>
  `,
  styles: [`
    .btn-custom {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      outline: none;
      width: 100%;
    }
    
    .btn-custom:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
    }

    .primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 12px -1px rgba(79, 70, 229, 0.3), 0 4px 6px -1px rgba(79, 70, 229, 0.15);
    }

    .secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .secondary:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .danger {
      background-color: #ef4444;
      color: white;
    }

    .danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .spinner-btn {
      width: 1.25rem;
      height: 1.25rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class CustomButtonComponent {
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;

  @Output() onClick = new EventEmitter<Event>();

  get variantClass(): string {
    return this.variant;
  }
}
