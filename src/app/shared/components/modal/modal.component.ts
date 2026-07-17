import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-container" [style.max-width]="width" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="btn-close" (click)="closeModal()" aria-label="Cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(11, 17, 33, 0.7); /* Dark sleek slate overlay */
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: overlayFadeIn 0.15s ease-out;
    }

    .modal-container {
      background-color: #1e293b;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      border: 1px solid #334155;
      animation: modalPopIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalPopIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #334155;
      background-color: #0f172a;
      border-radius: 16px 16px 0 0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      color: #f8fafc;
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .btn-close:hover {
      background-color: #334155;
      color: #f8fafc;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      overflow-x: visible;
      border-radius: 0 0 16px 16px;
      background-color: #1e293b;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() width = '600px';

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    this.closeModal();
  }
}
