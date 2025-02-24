import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-machine-status',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    TimeAgoPipe,
    CardComponent
  ],
  template: `
    <div class="machine-status-content">
      <div class="status-indicator">
        <div class="status-light" [ngClass]="machine.status">
          <mat-icon>{{ getStatusIcon() }}</mat-icon>
        </div>
        <div class="status-details">
          <div class="status-header">
            <span class="status-text">{{ getStatusText() }}</span>
            <span class="last-update">{{ machine.lastUpdate | timeAgo }}</span>
          </div>
          <div class="alert-counts">
            <span class="alert-count high" *ngIf="getAlertCount('high')">
              {{ getAlertCount('high') }} Kritik
            </span>
            <span class="alert-count medium" *ngIf="getAlertCount('medium')">
              {{ getAlertCount('medium') }} Orta
            </span>
            <span class="alert-count low" *ngIf="getAlertCount('low')">
              {{ getAlertCount('low') }} Düşük
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .machine-status-content {
      background: #f8fafc;
      border-radius: 8px;
      padding: 0.75rem;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-light {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-light.operational {
      background: #c6f6d5;
      color: #2f855a;
    }

    .status-light.warning {
      background: #feebc8;
      color: #c05621;
    }

    .status-light.error {
      background: #fed7d7;
      color: #c53030;
    }

    .status-light.maintenance {
      background: #e2e8f0;
      color: #2d3748;
    }

    .status-details {
      flex: 1;
      min-width: 0;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .status-text {
      font-weight: 500;
      color: #2d3748;
    }

    .last-update {
      font-size: 0.75rem;
      color: #718096;
    }

    .alert-counts {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .alert-count {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .alert-count.high {
      background: #fff5f5;
      color: #c53030;
    }

    .alert-count.medium {
      background: #fffaf0;
      color: #c05621;
    }

    .alert-count.low {
      background: #f0fff4;
      color: #2f855a;
    }
  `]
})
export class MachineStatusComponent {
  @Input() machine!: {
    id: string;
    name: string;
    status: 'operational' | 'warning' | 'error' | 'maintenance';
    lastUpdate: Date;
    alerts: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
      timestamp: Date;
      acknowledged: boolean;
    }>;
  };

  getStatusIcon(): string {
    switch (this.machine.status) {
      case 'operational':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'maintenance':
        return 'build';
      default:
        return 'help';
    }
  }

  getStatusText(): string {
    switch (this.machine.status) {
      case 'operational':
        return 'Çalışıyor';
      case 'warning':
        return 'Dikkat';
      case 'error':
        return 'Hata';
      case 'maintenance':
        return 'Bakımda';
      default:
        return 'Bilinmiyor';
    }
  }

  getAlertCount(severity: 'low' | 'medium' | 'high'): number {
    return this.machine.alerts.filter(
      alert => alert.severity === severity && !alert.acknowledged
    ).length;
  }
} 