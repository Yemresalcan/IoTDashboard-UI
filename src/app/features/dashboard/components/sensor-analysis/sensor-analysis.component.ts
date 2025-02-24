import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ValueUnitPipe } from '../../../../shared/pipes/value-unit.pipe';

@Component({
  selector: 'app-sensor-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    CardComponent,
    ValueUnitPipe
  ],
  template: `
    <app-card [elevated]="true" title="Sensör Analizi">
      <div class="analysis-content">
        <!-- Genel Durum -->
        <div class="overall-status">
          <div class="status-header">
            <mat-icon [ngClass]="getOverallStatusClass()">
              {{ getOverallStatusIcon() }}
            </mat-icon>
            <div class="status-info">
              <h3>Genel Durum</h3>
              <p>Toplam Anomali Skoru: {{ analysis.totalScore | percent:'1.1-1' }}</p>
              <p class="alarm-level">Alarm Seviyesi: 
                <span [ngClass]="analysis.alarmLevel">{{ getAlarmLevelText() }}</span>
              </p>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Sensör Detayları -->
        <div class="sensor-details">
          <h3>Sensör Durumları</h3>
          <div class="sensors-grid">
            <div class="sensor-item" *ngFor="let sensor of analysis.sensors" 
                 [ngClass]="getSensorStatusClass(sensor)">
              <div class="sensor-header">
                <mat-icon>{{ getSensorIcon(sensor.name) }}</mat-icon>
                <span class="sensor-name">{{ sensor.name }}</span>
              </div>
              <div class="sensor-body">
                <p class="value">{{ sensor.value | valueUnit:sensor.unit }}</p>
                <div class="range-info">
                  <small>Normal Aralık: 
                    {{ sensor.range.min | valueUnit:sensor.unit }} - 
                    {{ sensor.range.max | valueUnit:sensor.unit }}
                  </small>
                </div>
                <div class="status-info" *ngIf="sensor.isAnomaly">
                  <p class="anomaly-score">
                    Sapma: {{ sensor.score | percent:'1.1-1' }}
                  </p>
                  <p class="anomaly-message">{{ sensor.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .analysis-content {
      padding: 1rem;
    }

    .overall-status {
      margin-bottom: 1rem;
    }

    .status-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;

      mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;

        &.normal { color: #2f855a; }
        &.warning { color: #c05621; }
        &.danger { color: #c53030; }
      }
    }

    .status-info {
      h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      p {
        margin: 0.5rem 0;
        color: #4a5568;
      }

      .alarm-level span {
        font-weight: 500;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;

        &.normal {
          background: #f0fff4;
          color: #2f855a;
        }

        &.low {
          background: #fffaf0;
          color: #c05621;
        }

        &.medium {
          background: #fff5f5;
          color: #e53e3e;
        }

        &.high {
          background: #742a2a;
          color: white;
        }
      }
    }

    .sensor-details {
      margin-top: 1rem;

      h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #2d3748;
      }
    }

    .sensors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .sensor-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e2e8f0;

      &.normal {
        border-left: 4px solid #2f855a;
      }

      &.warning {
        border-left: 4px solid #c05621;
      }

      &.danger {
        border-left: 4px solid #c53030;
      }
    }

    .sensor-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      mat-icon {
        color: #4a5568;
      }

      .sensor-name {
        font-weight: 500;
        color: #2d3748;
      }
    }

    .sensor-body {
      .value {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0.5rem 0;
        color: #2d3748;
      }

      .range-info {
        color: #718096;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .status-info {
        background: #fff5f5;
        border-radius: 4px;
        padding: 0.5rem;
        margin-top: 0.5rem;

        .anomaly-score {
          color: #c53030;
          font-weight: 500;
          margin: 0;
        }

        .anomaly-message {
          color: #742a2a;
          font-size: 0.875rem;
          margin: 0.25rem 0 0;
        }
      }
    }
  `]
})
export class SensorAnalysisComponent {
  @Input() analysis!: {
    totalScore: number;
    alarmLevel: 'normal' | 'low' | 'medium' | 'high';
    sensors: Array<{
      name: string;
      value: number;
      unit: string;
      range: {
        min: number;
        max: number;
      };
      isAnomaly: boolean;
      score: number;
      message: string;
    }>;
  };

  getOverallStatusIcon(): string {
    switch (this.analysis.alarmLevel) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'check_circle';
    }
  }

  getOverallStatusClass(): string {
    switch (this.analysis.alarmLevel) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'warning';
      default:
        return 'normal';
    }
  }

  getAlarmLevelText(): string {
    switch (this.analysis.alarmLevel) {
      case 'high':
        return 'Kritik';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Normal';
    }
  }

  getSensorIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'Sıcaklık': 'thermostat',
      'Basınç': 'speed',
      'Titreşim': 'vibration',
      'Gürültü': 'volume_up',
      'Motor Hızı': 'settings',
      'Enerji Tüketimi': 'bolt'
    };
    return icons[name] || 'sensors';
  }

  getSensorStatusClass(sensor: any): string {
    if (!sensor.isAnomaly) return 'normal';
    if (sensor.score >= 0.7) return 'danger';
    if (sensor.score >= 0.3) return 'warning';
    return 'normal';
  }
} 