import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.elevated]="elevated">
      <div class="card-header" *ngIf="title">
        <h2>{{ title }}</h2>
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      <div class="card-actions" *ngIf="hasActions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      height: 100%;
      border: 1px solid #e0e0e0;
      transition: box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .card.elevated {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .card.elevated:hover {
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: #2c3e50;
    }

    .card-content {
      flex: 1;
      height: 100%;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() elevated: boolean = false;
  @Input() hasActions: boolean = false;
} 