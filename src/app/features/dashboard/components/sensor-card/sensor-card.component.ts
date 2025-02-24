import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ValueUnitPipe } from '../../../../shared/pipes/value-unit.pipe';

@Component({
  selector: 'app-sensor-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    CardComponent,
    ValueUnitPipe
  ],
  template: `
    <app-card [elevated]="true">
      <div class="sensor-card-content">
        <div class="sensor-header">
          <div class="sensor-info">
            <h3>{{ sensor.name }}</h3>
            <div class="sensor-value" [ngClass]="sensor.status">
              <span class="value">{{ sensor.value | valueUnit:sensor.unit }}</span>
              <mat-icon class="trend-icon" [ngClass]="sensor.trend">
                {{ getTrendIcon() }}
              </mat-icon>
            </div>
          </div>
          <div class="sensor-status" [ngClass]="sensor.status">
            <mat-icon>{{ getStatusIcon() }}</mat-icon>
            <span>{{ getStatusText() }}</span>
          </div>
        </div>

        <div class="range-info">
          <div class="range-label">Normal Çalışma Aralığı:</div>
          <div class="range-values">
            <span class="min">Min: {{ formatRangeValue('min') }}</span>
            <span class="max">Max: {{ formatRangeValue('max') }}</span>
          </div>
        </div>

        <div class="threshold-bars">
          <div class="threshold-bar">
            <div class="bar-label">
              <span>Sapma Oranı</span>
              <span class="score">{{ getDeviationScore() | percent:'1.0-0' }}</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getDeviationScore() * 100"
              [color]="getProgressBarColor()">
            </mat-progress-bar>
          </div>
        </div>

        <div class="anomaly-info" *ngIf="isAnomaly()">
          <mat-icon class="warning-icon">warning</mat-icon>
          <div class="anomaly-message">
            {{ getAnomalyMessage() }}
          </div>
        </div>

        <div class="mini-chart">
          <!-- TODO: Sensör verisi grafiği eklenecek -->
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .sensor-card-content {
      padding: 1rem;
    }

    .sensor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .sensor-info {
      h3 {
        margin: 0;
        font-size: 1rem;
        color: #4a5568;
      }
    }

    .sensor-value {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;

      .value {
        font-size: 1.5rem;
        font-weight: 600;
      }

      &.normal {
        color: #2f855a;
      }

      &.warning {
        color: #c05621;
      }

      &.danger {
        color: #c53030;
      }

      .trend-icon {
        &.up {
          color: #2f855a;
        }

        &.down {
          color: #c53030;
        }

        &.stable {
          color: #718096;
        }
      }
    }

    .sensor-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      font-size: 0.875rem;

      &.normal {
        background: #f0fff4;
        color: #2f855a;
      }

      &.warning {
        background: #fffaf0;
        color: #c05621;
      }

      &.danger {
        background: #fff5f5;
        color: #c53030;
      }
    }

    .range-info {
      margin: 1rem 0;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 4px;
    }

    .range-label {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .range-values {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #475569;
    }

    .anomaly-info {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fff5f5;
      border-radius: 4px;
      border: 1px solid #fed7d7;
    }

    .warning-icon {
      color: #c53030;
    }

    .anomaly-message {
      font-size: 0.875rem;
      color: #c53030;
      flex: 1;
    }

    .threshold-bars {
      margin: 1rem 0;
    }

    .threshold-bar {
      margin-bottom: 0.5rem;

      .bar-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;

        .score {
          font-weight: 500;
          &.warning { color: #c05621; }
          &.danger { color: #c53030; }
        }
      }
    }

    .mini-chart {
      height: 100px;
      background: #f7fafc;
      border-radius: 8px;
      margin-top: 1rem;
    }
  `]
})
export class SensorCardComponent {
  @Input() sensor!: {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'danger';
    trend: 'up' | 'down' | 'stable';
    normalRange?: {
      min: number;
      max: number;
    };
    thresholds: {
      warning: number;
      danger: number;
    };
    chartData: Array<{
      timestamp: Date;
      value: number;
    }>;
  };

  getTrendIcon(): string {
    switch (this.sensor.trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'help';
    }
  }

  getStatusIcon(): string {
    switch (this.sensor.status) {
      case 'normal':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      default:
        return 'help';
    }
  }

  getStatusText(): string {
    switch (this.sensor.status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Uyarı';
      case 'danger':
        return 'Tehlike';
      default:
        return 'Bilinmiyor';
    }
  }

  getDeviationScore(): number {
    if (!this.sensor.normalRange) return 0;
    
    const range = this.sensor.normalRange.max - this.sensor.normalRange.min;
    const deviation = Math.max(
      0,
      this.sensor.value - this.sensor.normalRange.max,
      this.sensor.normalRange.min - this.sensor.value
    );
    
    return Math.min(deviation / range, 1);
  }

  getProgressBarColor(): 'primary' | 'accent' | 'warn' {
    const score = this.getDeviationScore();
    if (score >= 0.7) return 'warn';
    if (score >= 0.3) return 'accent';
    return 'primary';
  }

  isAnomaly(): boolean {
    return this.getDeviationScore() >= 0.3;
  }

  getAnomalyMessage(): string {
    const score = this.getDeviationScore();
    const value = this.sensor.value;
    const unit = this.sensor.unit;
    
    if (score >= 0.7) {
      return `Kritik sapma tespit edildi! Mevcut değer (${value} ${unit}) normal aralığın çok dışında.`;
    } else if (score >= 0.3) {
      return `Anormal değer tespit edildi: ${value} ${unit}. Kontrol edilmeli.`;
    }
    return '';
  }

  formatRangeValue(type: 'min' | 'max'): string {
    if (!this.sensor.normalRange) return 'N/A';
    const value = this.sensor.normalRange[type];
    if (value === undefined) return 'N/A';
    return `${value} ${this.sensor.unit}`;
  }
} 