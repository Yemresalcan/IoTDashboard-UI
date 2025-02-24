import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { Observable } from 'rxjs';
import { CardComponent } from '../../shared/components/card/card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ValueUnitPipe } from '../../shared/pipes/value-unit.pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CardComponent,
    ValueUnitPipe,
    TimeAgoPipe
  ],
  template: `
    <div class="analytics-container">
      <div class="analytics-header">
        <h1>Sensör Analizi ve Tahminler</h1>
        <div class="header-actions">
          <button mat-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Yenile
          </button>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Performans Özeti -->
        <app-card title="Performans Özeti" [elevated]="true">
          <div class="performance-summary">
            <div class="stat-box" *ngIf="analysis$ | async as analysis">
              <div class="stat-value" [ngClass]="getHealthClass(analysis.totalScore)">
                {{ (1 - analysis.totalScore) | percent:'1.0-1' }}
              </div>
              <div class="stat-label">Sistem Sağlığı</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">98.5%</div>
              <div class="stat-label">Çalışma Süresi</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">85%</div>
              <div class="stat-label">Verimlilik</div>
            </div>
          </div>
        </app-card>

        <!-- Tahminsel Analiz -->
        <app-card title="Tahminsel Analiz" [elevated]="true">
          <div class="prediction-content">
            <div class="prediction-header">
              <h3>Sonraki 24 Saat Tahminleri</h3>
            </div>
            <div class="predictions-list" *ngIf="analysis$ | async as analysis">
              <div class="prediction-item" *ngFor="let sensor of analysis.sensors">
                <div class="sensor-info">
                  <mat-icon>{{ getSensorIcon(sensor.name) }}</mat-icon>
                  <span class="sensor-name">{{ sensor.name }}</span>
                </div>
                <div class="prediction-details">
                  <div class="current-value">
                    Mevcut: {{ sensor.value | valueUnit:sensor.unit }}
                  </div>
                  <div class="predicted-value">
                    Tahmini: {{ getPredictedValue(sensor) | valueUnit:sensor.unit }}
                  </div>
                  <div class="trend" [ngClass]="getPredictionTrend(sensor)">
                    <mat-icon>{{ getTrendIcon(sensor) }}</mat-icon>
                    {{ getTrendText(sensor) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Bakım Önerileri -->
        <app-card title="Bakım Önerileri" [elevated]="true">
          <div class="maintenance-content">
            <div class="maintenance-header">
              <h3>Planlı Bakım Tavsiyeleri</h3>
            </div>
            <div class="maintenance-list" *ngIf="analysis$ | async as analysis">
              <div class="maintenance-item" *ngFor="let sensor of analysis.sensors">
                <div class="maintenance-info">
                  <mat-icon>build</mat-icon>
                  <div class="info-details">
                    <span class="component">{{ sensor.name }}</span>
                    <span class="schedule">{{ getMaintenanceSchedule(sensor) }}</span>
                  </div>
                </div>
                <div class="maintenance-status" [ngClass]="getMaintenanceStatus(sensor)">
                  {{ getMaintenanceStatusText(sensor) }}
                </div>
              </div>
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 2rem;
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #2c3e50;
      }
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .performance-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 1rem;
    }

    .stat-box {
      text-align: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;

      .stat-value {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 0.5rem;

        &.healthy { color: #2f855a; }
        &.warning { color: #c05621; }
        &.danger { color: #c53030; }
      }

      .stat-label {
        color: #64748b;
        font-size: 0.875rem;
      }
    }

    .prediction-content,
    .maintenance-content {
      padding: 1rem;
    }

    .predictions-list,
    .maintenance-list {
      display: grid;
      gap: 1rem;
    }

    .prediction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;

      .sensor-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        mat-icon {
          color: #4a5568;
        }

        .sensor-name {
          font-weight: 500;
          color: #2d3748;
        }
      }

      .prediction-details {
        text-align: right;

        .current-value,
        .predicted-value {
          color: #4a5568;
          font-size: 0.875rem;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          margin-top: 0.25rem;

          &.up {
            color: #2f855a;
          }

          &.down {
            color: #c53030;
          }

          &.stable {
            color: #718096;
          }

          mat-icon {
            font-size: 1rem;
            width: 1rem;
            height: 1rem;
          }
        }
      }
    }

    .maintenance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;

      .maintenance-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        mat-icon {
          color: #4a5568;
        }

        .info-details {
          display: flex;
          flex-direction: column;

          .component {
            font-weight: 500;
            color: #2d3748;
          }

          .schedule {
            font-size: 0.875rem;
            color: #718096;
          }
        }
      }

      .maintenance-status {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;

        &.ok {
          background: #f0fff4;
          color: #2f855a;
        }

        &.soon {
          background: #fffaf0;
          color: #c05621;
        }

        &.overdue {
          background: #fff5f5;
          color: #c53030;
        }
      }
    }

    @media (max-width: 768px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .performance-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  analysis$ = this.dashboardService.getAnalysis();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.dashboardService.refreshData().subscribe();
  }

  getHealthClass(score: number): string {
    if (score >= 0.7) return 'danger';
    if (score >= 0.3) return 'warning';
    return 'healthy';
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

  getPredictedValue(sensor: any): number {
    if (!sensor.chartData || sensor.chartData.length === 0) return sensor.value;
    const lastPrediction = sensor.chartData[sensor.chartData.length - 1];
    return lastPrediction.value;
  }

  getPredictionTrend(sensor: any): string {
    const currentValue = sensor.value;
    const predictedValue = this.getPredictedValue(sensor);
    const difference = predictedValue - currentValue;
    const threshold = (sensor.range.max - sensor.range.min) * 0.05;

    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'up' : 'down';
  }

  getTrendIcon(sensor: any): string {
    const trend = this.getPredictionTrend(sensor);
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getTrendText(sensor: any): string {
    const trend = this.getPredictionTrend(sensor);
    switch (trend) {
      case 'up': return 'Yükseliş';
      case 'down': return 'Düşüş';
      default: return 'Stabil';
    }
  }

  getMaintenanceSchedule(sensor: any): string {
    const score = sensor.score;
    if (score >= 0.7) return 'Acil bakım gerekli';
    if (score >= 0.5) return 'Gelecek hafta bakım öneriliyor';
    if (score >= 0.3) return 'İki hafta içinde bakım öneriliyor';
    return 'Rutin bakım: 30 gün';
  }

  getMaintenanceStatus(sensor: any): string {
    const score = sensor.score;
    if (score >= 0.7) return 'overdue';
    if (score >= 0.3) return 'soon';
    return 'ok';
  }

  getMaintenanceStatusText(sensor: any): string {
    const score = sensor.score;
    if (score >= 0.7) return 'Gecikmiş';
    if (score >= 0.3) return 'Yakında';
    return 'Normal';
  }
} 