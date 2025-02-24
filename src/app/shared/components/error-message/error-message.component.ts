import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="error-container" [class.card]="asCard">
      <mat-icon class="error-icon">error</mat-icon>
      <div class="error-content">
        <h3 *ngIf="title">{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="error-actions" *ngIf="showRetry || customAction">
          <button mat-button color="primary" *ngIf="showRetry" (click)="onRetry.emit()">
            <mat-icon>refresh</mat-icon>
            Tekrar Dene
          </button>
          <button mat-button color="accent" *ngIf="customAction" (click)="onCustomAction.emit()">
            {{ customActionText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      color: #e53e3e;
    }

    .error-container.card {
      background: #fff5f5;
      border-radius: 8px;
      border: 1px solid #fed7d7;
    }

    .error-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .error-content {
      flex: 1;
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() title?: string;
  @Input() message: string = 'Bir hata oluştu.';
  @Input() showRetry: boolean = false;
  @Input() customAction: boolean = false;
  @Input() customActionText: string = '';
  @Input() asCard: boolean = true;

  @Output() onRetry = new EventEmitter<void>();
  @Output() onCustomAction = new EventEmitter<void>();
} 