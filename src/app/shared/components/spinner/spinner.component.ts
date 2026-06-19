import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [ngClass]="{ 'full-screen': fullScreen }">
      <div class="spinner" [style.width]="size" [style.height]="size"></div>
      <p *ngIf="message" class="spinner-msg">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .full-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(255, 255, 255, 0.85);
      z-index: 9999;
    }

    .spinner {
      border: 4px solid rgba(99, 102, 241, 0.15);
      border-radius: 50%;
      border-top-color: #4f46e5;
      animation: spin 1s ease-in-out infinite;
    }

    .spinner-msg {
      margin-top: 1rem;
      font-size: 0.95rem;
      color: #4f46e5;
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  @Input() size: string = '40px';
  @Input() message: string = '';
  @Input() fullScreen: boolean = false;
}
