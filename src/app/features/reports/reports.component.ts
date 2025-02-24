import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CardComponent } from '../../shared/components/card/card.component';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

// Veri tipleri
interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  category: 'maintenance' | 'system' | 'performance';
}

interface ChartDataPoint {
  timestamp: Date;
  value: number;
}

interface Sensor {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  trend: 'up' | 'down' | 'stable';
  normalRange: {
    min: number;
    max: number;
  };
  thresholds: {
    warning: number;
    danger: number;
  };
  chartData: ChartDataPoint[];
  isAnomaly?: boolean;
  score?: number;
}

interface MachineData {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'error' | 'maintenance';
  lastUpdate: Date;
  sensors: Sensor[];
  alerts: Alert[];
  performance?: {
    oee: number;
    uptime: number;
    efficiency: number;
  };
}

interface AnalysisData {
  totalScore: number;
  alarmLevel: 'normal' | 'low' | 'medium' | 'high';
  sensors: Sensor[];
}

// Chart.js bileşenlerini kaydet
Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    CardComponent
  ],
  template: `
    <div class="reports-container">
      <div class="reports-header">
        <h1>Raporlar & Analizler</h1>
        <div class="header-actions">
          <button mat-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Yenile
          </button>
          <button mat-button color="accent" (click)="exportData()">
            <mat-icon>download</mat-icon>
            Dışa Aktar
          </button>
        </div>
      </div>

      <div class="metrics-summary">
        <app-card [elevated]="true">
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-value">{{ getOEE() | percent:'1.1-1' }}</div>
              <div class="metric-label">OEE</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ getUptime() | percent:'1.1-1' }}</div>
              <div class="metric-label">Çalışma Süresi</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ getEfficiency() | percent:'1.1-1' }}</div>
              <div class="metric-label">Verimlilik</div>
            </div>
          </div>
        </app-card>
      </div>

      <mat-tab-group (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Enerji Tüketimi">
          <app-card [elevated]="true">
            <canvas #energyChart></canvas>
          </app-card>
        </mat-tab>

        <mat-tab label="Bakım Analizi">
          <app-card [elevated]="true">
            <canvas #maintenanceChart></canvas>
          </app-card>
        </mat-tab>

        <mat-tab label="Sensör Performansı">
          <app-card [elevated]="true">
            <canvas #sensorChart></canvas>
          </app-card>
        </mat-tab>

        <mat-tab label="Anomali Dağılımı">
          <app-card [elevated]="true">
            <canvas #anomalyChart></canvas>
          </app-card>
        </mat-tab>

        <mat-tab label="Trend Analizi">
          <app-card [elevated]="true">
            <canvas #trendChart></canvas>
          </app-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
    }

    .reports-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #2d3748;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }
    }

    .metrics-summary {
      margin-bottom: 2rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      padding: 1rem;
    }

    .metric-item {
      text-align: center;

      .metric-value {
        font-size: 2rem;
        font-weight: 600;
        color: #2d3748;
      }

      .metric-label {
        margin-top: 0.5rem;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    mat-tab-group {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    canvas {
      width: 100% !important;
      height: 400px !important;
    }

    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('energyChart') energyChart!: ElementRef;
  @ViewChild('maintenanceChart') maintenanceChart!: ElementRef;
  @ViewChild('sensorChart') sensorChart!: ElementRef;
  @ViewChild('anomalyChart') anomalyChart!: ElementRef;
  @ViewChild('trendChart') trendChart!: ElementRef;

  private charts: { [key: string]: Chart } = {};
  private subscriptions: Subscription[] = [];
  private sensorData: Sensor[] = [];
  private machineData: MachineData | null = null;
  private analysisData: AnalysisData | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.subscribeToData();
    this.refreshData();
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  private subscribeToData() {
    this.subscriptions.push(
      this.dashboardService.getSensorData().subscribe(data => {
        this.sensorData = data.map(sensor => ({
          ...sensor,
          isAnomaly: false,
          score: 0
        }));
        this.updateCharts();
      })
    );

    this.subscriptions.push(
      this.dashboardService.getMachineData().subscribe(data => {
        this.machineData = {
          ...data,
          alerts: data.alerts.map(alert => ({
            ...alert,
            category: this.determineAlertCategory(alert)
          })),
          performance: {
            oee: 0.85,
            uptime: 0.98,
            efficiency: 0.90
          }
        };
        this.updateCharts();
      })
    );

    this.subscriptions.push(
      this.dashboardService.getAnalysis().subscribe(data => {
        this.analysisData = {
          totalScore: data.totalScore,
          alarmLevel: data.alarmLevel,
          sensors: data.sensors.map(sensor => ({
            ...sensor,
            status: this.calculateSensorStatus(sensor.score),
            trend: 'stable',
            normalRange: sensor.range,
            thresholds: {
              warning: sensor.range.min + (sensor.range.max - sensor.range.min) * 0.7,
              danger: sensor.range.min + (sensor.range.max - sensor.range.min) * 0.9
            }
          }))
        };
        this.updateCharts();
      })
    );
  }

  private initializeCharts() {
    setTimeout(() => {
      // Enerji tüketimi grafiği
      this.charts['energy'] = new Chart(this.energyChart.nativeElement, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Enerji Tüketimi (kWh)',
            data: [],
            borderColor: '#3182ce',
            backgroundColor: 'rgba(49, 130, 206, 0.1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Bakım analizi grafiği
      this.charts['maintenance'] = new Chart(this.maintenanceChart.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Kritik Arızalar', 'Orta Seviye Arızalar', 'Düşük Seviye Arızalar'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: [
              '#e53e3e',  // Kırmızı - Kritik
              '#d69e2e',  // Turuncu - Orta
              '#38a169'   // Yeşil - Düşük
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            title: {
              display: true,
              text: 'Bakım ve Arıza Dağılımı',
              font: {
                size: 16
              }
            }
          }
        }
      });

      // Sensör performans analizi grafiği
      this.charts['sensor'] = new Chart(this.sensorChart.nativeElement, {
        type: 'radar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Mevcut Performans',
              data: [],
              borderColor: '#3182ce',
              backgroundColor: 'rgba(49, 130, 206, 0.2)',
              fill: true
            },
            {
              label: 'Hedef Performans',
              data: [],
              borderColor: '#38a169',
              backgroundColor: 'rgba(56, 161, 105, 0.2)',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              beginAtZero: true
            }
          }
        }
      });

      // Anomali dağılımı grafiği
      this.charts['anomaly'] = new Chart(this.anomalyChart.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Normal', 'Düşük Risk', 'Orta Risk', 'Yüksek Risk'],
          datasets: [{
            data: [0, 0, 0, 0],
            backgroundColor: [
              '#38a169',
              '#4299e1',
              '#d69e2e',
              '#e53e3e'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });

      // Trend analizi grafiği
      this.charts['trend'] = new Chart(this.trendChart.nativeElement, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Sıcaklık (°C)',
              data: [],
              borderColor: '#e53e3e',
              backgroundColor: 'rgba(229, 62, 62, 0.1)',
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'Basınç (bar)',
              data: [],
              borderColor: '#3182ce',
              backgroundColor: 'rgba(49, 130, 206, 0.1)',
              fill: true,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Sıcaklık (°C)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Basınç (bar)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });

      // İlk veri güncellemesini tetikle
      this.updateCharts();
    }, 0);
  }

  onTabChange(event: any) {
    // Tab değiştiğinde grafikleri güncelle
    Object.values(this.charts).forEach(chart => chart.update());
  }

  refreshData() {
    this.dashboardService.refreshData().subscribe();
  }

  private updateCharts() {
    if (!this.machineData || !this.sensorData || !this.analysisData) return;

    // Enerji tüketimi grafiğini güncelle
    if (this.charts['energy']) {
      const energyData = this.sensorData
        .filter(sensor => sensor.name === 'Enerji Tüketimi')
        .map(sensor => sensor.chartData)
        .flat();

      this.charts['energy'].data.labels = energyData.map(d => 
        new Date(d.timestamp).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
      this.charts['energy'].data.datasets[0].data = energyData.map(d => d.value);
      this.charts['energy'].update();
    }

    // Bakım analizi grafiğini güncelle
    if (this.charts['maintenance'] && this.machineData) {
      console.log('Mevcut alertler:', this.machineData.alerts);
      
      const maintenanceAlerts = this.machineData.alerts.filter(alert => alert.category === 'maintenance');
      console.log('Bakım alertleri:', maintenanceAlerts);
      
      const maintenanceData = {
        high: maintenanceAlerts.filter(a => a.severity === 'high').length,
        medium: maintenanceAlerts.filter(a => a.severity === 'medium').length,
        low: maintenanceAlerts.filter(a => a.severity === 'low').length
      };
      
      console.log('Bakım verileri:', maintenanceData);

      this.charts['maintenance'].data.datasets[0].data = [
        maintenanceData.high,
        maintenanceData.medium,
        maintenanceData.low
      ];
      
      // Grafik boyutlarını güncelle
      this.charts['maintenance'].options = {
        ...this.charts['maintenance'].options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Bakım ve Arıza Dağılımı',
            font: {
              size: 16
            }
          }
        }
      };

      this.charts['maintenance'].update();
    }

    // Sensör performans analizi grafiğini güncelle
    if (this.charts['sensor'] && this.analysisData) {
      const sensorPerformance = this.analysisData.sensors.map(sensor => ({
        name: sensor.name,
        currentValue: (1 - (sensor.score ?? 0)) * 100,
        targetValue: 90
      }));

      this.charts['sensor'].data.labels = sensorPerformance.map(s => s.name);
      this.charts['sensor'].data.datasets[0].data = sensorPerformance.map(s => s.currentValue);
      this.charts['sensor'].data.datasets[1].data = sensorPerformance.map(s => s.targetValue);
      this.charts['sensor'].update();
    }

    // Anomali dağılımı grafiğini güncelle
    if (this.charts['anomaly'] && this.analysisData) {
      const anomalyDistribution = {
        'Normal': this.analysisData.sensors.filter(s => !s.isAnomaly).length,
        'Düşük Risk': this.analysisData.sensors.filter(s => s.isAnomaly && (s.score ?? 0) < 0.3).length,
        'Orta Risk': this.analysisData.sensors.filter(s => s.isAnomaly && (s.score ?? 0) >= 0.3 && (s.score ?? 0) < 0.7).length,
        'Yüksek Risk': this.analysisData.sensors.filter(s => s.isAnomaly && (s.score ?? 0) >= 0.7).length
      };

      this.charts['anomaly'].data.datasets[0].data = Object.values(anomalyDistribution);
      this.charts['anomaly'].update();
    }

    // Trend analizi grafiğini güncelle
    if (this.charts['trend']) {
      const temperatureSensor = this.sensorData.find(s => s.name === 'Sıcaklık');
      const pressureSensor = this.sensorData.find(s => s.name === 'Basınç');

      if (temperatureSensor && pressureSensor) {
        this.charts['trend'].data.labels = temperatureSensor.chartData.map((d: ChartDataPoint) =>
          new Date(d.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        );
        this.charts['trend'].data.datasets[0].data = temperatureSensor.chartData.map((d: ChartDataPoint) => d.value);
        this.charts['trend'].data.datasets[1].data = pressureSensor.chartData.map((d: ChartDataPoint) => d.value);
        this.charts['trend'].update();
      }
    }
  }

  exportData() {
    // CSV formatında dışa aktarma
    const data = {
      metrics: {
        oee: this.getOEE(),
        uptime: this.getUptime(),
        efficiency: this.getEfficiency()
      }
    };
    
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rapor.csv';
    link.click();
  }

  private convertToCSV(data: any): string {
    const headers = ['Metrik', 'Değer'];
    const rows = [
      ['OEE', data.metrics.oee],
      ['Çalışma Süresi', data.metrics.uptime],
      ['Verimlilik', data.metrics.efficiency]
    ];

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  getOEE(): number {
    return this.machineData?.performance?.oee ?? 0.85;
  }

  getUptime(): number {
    return this.machineData?.performance?.uptime ?? 0.98;
  }

  getEfficiency(): number {
    return this.machineData?.performance?.efficiency ?? 0.92;
  }

  private calculateSensorStatus(score: number): 'normal' | 'warning' | 'danger' {
    if (score >= 0.7) return 'danger';
    if (score >= 0.3) return 'warning';
    return 'normal';
  }

  private determineAlertCategory(alert: { severity: string; message: string }): 'maintenance' | 'system' | 'performance' {
    const message = alert.message.toLowerCase();
    if (message.includes('bakım') || message.includes('onarım') || message.includes('arıza')) {
      return 'maintenance';
    }
    if (message.includes('performans') || message.includes('verimlilik') || message.includes('kapasite')) {
      return 'performance';
    }
    return 'system';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
} 