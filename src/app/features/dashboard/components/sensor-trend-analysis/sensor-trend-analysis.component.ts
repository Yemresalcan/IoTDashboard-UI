import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ValueUnitPipe } from '../../../../shared/pipes/value-unit.pipe';
import { Chart } from 'chart.js';
import { SensorData } from '../../models/sensor-analysis.model';

@Component({
  selector: 'app-sensor-trend-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CardComponent,
    ValueUnitPipe
  ],
  template: `
    <app-card [elevated]="true">
      <div class="trend-analysis-content">
        <div class="header">
          <h2>Sensör Trend Analizi</h2>
          <div class="time-range-selector">
            <button mat-button [class.active]="selectedRange === '1h'" (click)="setTimeRange('1h')">1 Saat</button>
            <button mat-button [class.active]="selectedRange === '6h'" (click)="setTimeRange('6h')">6 Saat</button>
            <button mat-button [class.active]="selectedRange === '24h'" (click)="setTimeRange('24h')">24 Saat</button>
          </div>
        </div>

        <div class="trends-grid">
          <div class="trend-item" *ngFor="let sensor of sensorData">
            <div class="trend-header">
              <div class="sensor-info">
                <mat-icon>{{ getSensorIcon(sensor.name) }}</mat-icon>
                <h3>{{ sensor.name }}</h3>
              </div>
              <div class="trend-stats">
                <div class="stat-item">
                  <span class="label">Ortalama:</span>
                  <span class="value">{{ getAverage(sensor) | valueUnit:sensor.unit }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Sapma:</span>
                  <span class="value" [class]="getDeviationClass(sensor)">
                    {{ calculateDeviation(sensor) | percent:'1.0-1' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="chart-container">
              <canvas [id]="'trend-chart-' + sensor.id"></canvas>
            </div>

            <div class="trend-footer" *ngIf="sensor.status !== 'normal'">
              <mat-icon class="warning-icon">warning</mat-icon>
              <p class="anomaly-message">{{ getAnomalyMessage(sensor) }}</p>
            </div>
          </div>
        </div>

        <div class="analysis-summary">
          <h3>Analiz Özeti</h3>
          <div class="summary-stats">
            <div class="stat-box">
              <div class="stat-value">{{ getAnomalyCount() }}</div>
              <div class="stat-label">Toplam Anomali</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ getAverageDeviation() | percent:'1.0-1' }}</div>
              <div class="stat-label">Ortalama Sapma</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ getHealthScore() | percent:'1.0-1' }}</div>
              <div class="stat-label">Sağlık Skoru</div>
            </div>
          </div>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .trend-analysis-content {
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
      }
    }

    .time-range-selector {
      display: flex;
      gap: 0.5rem;

      button.active {
        background: #e2e8f0;
        color: #2c5282;
      }
    }

    .trends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .trend-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e2e8f0;
    }

    .trend-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .sensor-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      mat-icon {
        color: #4a5568;
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #2d3748;
      }
    }

    .trend-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .label {
        font-size: 0.75rem;
        color: #718096;
      }

      .value {
        font-weight: 500;
        color: #2d3748;

        &.normal { color: #2f855a; }
        &.warning { color: #c05621; }
        &.danger { color: #c53030; }
      }
    }

    .chart-container {
      height: 200px;
      margin: 1rem 0;
    }

    .trend-footer {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #fff5f5;
      border-radius: 4px;
      margin-top: 1rem;

      .warning-icon {
        color: #c53030;
      }

      .anomaly-message {
        margin: 0;
        font-size: 0.875rem;
        color: #c53030;
      }
    }

    .analysis-summary {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;

      h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #2d3748;
      }
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-box {
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      text-align: center;

      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #718096;
      }
    }

    @media (max-width: 768px) {
      .trends-grid {
        grid-template-columns: 1fr;
      }

      .trend-header {
        flex-direction: column;
        gap: 1rem;
      }

      .trend-stats {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class SensorTrendAnalysisComponent {
  @Input() sensorData!: SensorData[];
  selectedRange: '1h' | '6h' | '24h' = '1h';
  private charts: { [key: string]: Chart } = {};

  ngOnInit() {
    this.initializeCharts();
  }

  ngOnChanges() {
    this.updateCharts();
  }

  setTimeRange(range: '1h' | '6h' | '24h') {
    this.selectedRange = range;
    this.updateCharts();
  }

  private initializeCharts() {
    this.sensorData.forEach(sensor => {
      const ctx = document.getElementById(`trend-chart-${sensor.id}`) as HTMLCanvasElement;
      if (!ctx) return;

      this.charts[sensor.id] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: `${sensor.name} (${sensor.unit})`,
            data: [],
            borderColor: '#3182ce',
            backgroundColor: 'rgba(49, 130, 206, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    });
  }

  private updateCharts() {
    this.sensorData.forEach(sensor => {
      const chart = this.charts[sensor.id];
      if (!chart) return;

      const timeRange = this.getTimeRangeInMinutes();
      const filteredData = this.filterDataByTimeRange(sensor.chartData, timeRange);

      chart.data.labels = filteredData.map(d => 
        new Date(d.timestamp).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
      chart.data.datasets[0].data = filteredData.map(d => d.value);
      chart.update();
    });
  }

  private getTimeRangeInMinutes(): number {
    switch (this.selectedRange) {
      case '1h': return 60;
      case '6h': return 360;
      case '24h': return 1440;
      default: return 60;
    }
  }

  private filterDataByTimeRange(data: Array<{ timestamp: Date; value: number }>, minutes: number) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - minutes * 60000);
    return data.filter(d => new Date(d.timestamp) >= cutoff);
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

  getAverage(sensor: SensorData): number {
    const timeRange = this.getTimeRangeInMinutes();
    const filteredData = this.filterDataByTimeRange(sensor.chartData, timeRange);
    const sum = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    return filteredData.length > 0 ? sum / filteredData.length : 0;
  }

  calculateDeviation(sensor: SensorData): number {
    const range = sensor.normalRange.max - sensor.normalRange.min;
    const midPoint = (sensor.normalRange.max + sensor.normalRange.min) / 2;
    return Math.abs(sensor.value - midPoint) / range;
  }

  getDeviationClass(sensor: SensorData): string {
    if (sensor.status === 'danger') return 'danger';
    if (sensor.status === 'warning') return 'warning';
    return 'normal';
  }

  getAnomalyCount(): number {
    return this.sensorData.filter(s => s.status !== 'normal').length;
  }

  getAverageDeviation(): number {
    return this.sensorData.reduce((acc, sensor) => 
      acc + this.calculateDeviation(sensor), 0) / this.sensorData.length;
  }

  getHealthScore(): number {
    return 1 - this.getAverageDeviation();
  }

  getAnomalyMessage(sensor: SensorData): string {
    if (sensor.status === 'danger') {
      return `${sensor.name} kritik seviyede (${sensor.value} ${sensor.unit}). Acil müdahale gerekli!`;
    } else if (sensor.status === 'warning') {
      return `${sensor.name} değeri normal aralığın dışında (${sensor.value} ${sensor.unit}). Kontrol edilmeli.`;
    }
    return '';
  }
} 