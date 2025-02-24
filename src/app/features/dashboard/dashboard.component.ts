import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DashboardService } from './services/dashboard.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { ValueUnitPipe } from '../../shared/pipes/value-unit.pipe';
import { Router } from '@angular/router';
import { SensorCardComponent } from './components/sensor-card/sensor-card.component';
import { AlertsListComponent } from './components/alerts-list/alerts-list.component';
import { MachineStatusComponent } from './components/machine-status/machine-status.component';
import { SensorAnalysisComponent } from './components/sensor-analysis/sensor-analysis.component';
import { SensorTrendAnalysisComponent } from './components/sensor-trend-analysis/sensor-trend-analysis.component';
import { AnomalyDetailsDialogComponent } from './components/anomaly-details-dialog/anomaly-details-dialog.component';
import { SensorAnalysis, SensorData } from './models/sensor-analysis.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatTabsModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    CardComponent,
    TimeAgoPipe,
    ValueUnitPipe,
    SensorCardComponent,
    AlertsListComponent,
    MachineStatusComponent,
    SensorAnalysisComponent,
    SensorTrendAnalysisComponent,
    AnomalyDetailsDialogComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-left">
          <h1>Makine İzleme Paneli</h1>
          <div class="header-tabs">
            <div class="tab active">
              <mat-icon>precision_manufacturing</mat-icon>
              Makine Durumları
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button mat-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Yenile
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="machines-wrapper">
          <div class="machines-grid">
            <app-card *ngFor="let machine of machines" [elevated]="true" class="machine-card">
              <div class="machine-content">
                <!-- Makine Başlığı -->
                <div class="machine-header" [ngClass]="machine.status">
                  <div class="status-info">
                    <mat-icon>{{ getStatusIcon(machine.status) }}</mat-icon>
                    <h2>{{ machine.name }}</h2>
                  </div>
                  <span class="status-text">{{ getStatusText(machine.status) }}</span>
                </div>

                <!-- Kritik Sensörler -->
                <div class="critical-sensors">
                  <div class="sensor-grid">
                    <div *ngFor="let sensor of machine.sensors" class="sensor-item" [ngClass]="sensor.status">
                      <div class="sensor-header">
                        <mat-icon>{{ getSensorIcon(sensor.name) }}</mat-icon>
                        <span class="sensor-name">{{ sensor.name }}</span>
                      </div>
                      <div class="sensor-value">
                        {{ sensor.value | valueUnit:sensor.unit }}
                        <mat-icon class="trend-icon" [ngClass]="sensor.trend">
                          {{ getTrendIcon(sensor.trend) }}
                        </mat-icon>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Aksiyon Butonları -->
                <div class="machine-actions">
                  <button mat-button color="primary" (click)="navigateToAnalytics()">
                    <mat-icon>analytics</mat-icon>
                    Detaylı Analiz
                  </button>
                  <button mat-button color="info" (click)="showAnomalyDetails(machine)">
                    <mat-icon>bug_report</mat-icon>
                    Anomali Tespiti
                  </button>
                  <button mat-button [color]="machine.status === 'maintenance' ? 'warn' : 'accent'"
                          (click)="toggleMaintenanceMode(machine)">
                    <mat-icon>build</mat-icon>
                    {{ machine.status === 'maintenance' ? 'Bakımı Bitir' : 'Bakıma Al' }}
                  </button>
                </div>
              </div>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }

    .dashboard-header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .header-tabs {
      display: flex;
      gap: 1rem;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #64748b;

      &.active {
        background: #e2e8f0;
        color: #2c3e50;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .dashboard-content {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .machines-wrapper {
      height: 100%;
      padding: 1.5rem;
      overflow: auto;

      /* Modern scrollbar stili */
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
    }

    .machines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      height: fit-content;
    }

    .machine-card {
      background: white;
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
    }

    .machine-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .machine-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;

      &.operational {
        background: #f0fff4;
        color: #2f855a;
      }

      &.warning {
        background: #fffaf0;
        color: #c05621;
      }

      &.error {
        background: #fff5f5;
        color: #c53030;
      }

      &.maintenance {
        background: #ebf8ff;
        color: #2c5282;
      }

      .status-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .status-text {
        font-size: 0.875rem;
        font-weight: 500;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        background: rgba(255,255,255,0.5);
      }
    }

    .critical-sensors {
      flex: 1;
      margin: 1rem 0;
    }

    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .sensor-item {
      padding: 1rem;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;

      &:hover {
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

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
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
      }

      .sensor-name {
        font-size: 0.875rem;
        color: #4a5568;
        font-weight: 500;
      }
    }

    .sensor-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;

      .trend-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;

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

    .machine-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;

      button {
        flex: 1;
        padding: 0.5rem;
        
        mat-icon {
          margin-right: 0.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        padding: 1rem;
      }

      .machines-grid {
        grid-template-columns: 1fr;
      }

      .sensor-grid {
        grid-template-columns: 1fr;
      }

      .machine-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  machines: any[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData() {
    // Makine verilerini yükle
    this.subscriptions.push(
      this.dashboardService.getMachineData().subscribe(data => {
        const machineIndex = this.machines.findIndex(m => m.id === data.id);
        if (machineIndex === -1) {
          this.machines.push(data);
        } else {
          this.machines[machineIndex] = data;
        }
        this.machines = [...this.machines];
      })
    );
  }

  refreshData() {
    this.dashboardService.refreshData().subscribe();
  }

  private startAutoRefresh() {
    this.subscriptions.push(
      this.dashboardService.startAutoRefresh()
    );
  }

  acknowledgeAlert(alertId: string) {
    this.dashboardService.acknowledgeAlert(alertId).subscribe();
  }

  getAnalysisForMachine(machineId: string): Observable<SensorAnalysis> {
    return this.dashboardService.getAnalysis();
  }

  getSensorDataForMachine(machineId: string): Observable<SensorData[]> {
    return this.dashboardService.getSensorData();
  }

  onMachineChange(event: any) {
    // Makine değişikliği işlemleri
    console.log('Seçilen makine:', event.target.value);
    this.loadData();
  }

  toggleMaintenanceMode(machine: any) {
    machine.status = machine.status === 'maintenance' ? 'operational' : 'maintenance';
  }

  exportData() {
    // Veri dışa aktarma işlemleri
    console.log('Veriler dışa aktarılıyor...');
  }

  showSensorDetails(sensor: any) {
    // Sensör detay görüntüleme
    console.log('Sensör detayları:', sensor);
  }

  getUptime(): string {
    return '23s 14d'; // Gerçek uptime hesaplaması yapılmalı
  }

  getEfficiency(): number {
    return 0.92; // Gerçek verimlilik hesaplaması yapılmalı
  }

  getTotalEnergyConsumption(): number {
    return this.machines.reduce((acc: number, machine) => 
      acc + machine.sensors
        .filter((s: SensorData) => s.name === 'Enerji Tüketimi')
        .reduce((sum: number, s: SensorData) => sum + s.value, 0)
    , 0);
  }

  calculateOEE(): number {
    return 0.88; // Gerçek OEE hesaplaması yapılmalı
  }

  getQualityRate(): number {
    return 0.95; // Gerçek kalite oranı hesaplaması yapılmalı
  }

  getRangePosition(sensor: any): number {
    if (!sensor.normalRange) return 50;
    const range = sensor.normalRange.max - sensor.normalRange.min;
    const position = ((sensor.value - sensor.normalRange.min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  }

  getCriticalSensors(): SensorData[] {
    return this.machines.reduce((acc: SensorData[], machine) => 
      acc.concat(machine.sensors.filter((s: SensorData) => s.status === 'danger'))
    , []);
  }

  calculateDeviation(sensor: any): number {
    if (!sensor.normalRange) return 0;
    const range = sensor.normalRange.max - sensor.normalRange.min;
    const midPoint = (sensor.normalRange.max + sensor.normalRange.min) / 2;
    return Math.abs(sensor.value - midPoint) / range;
  }

  getHealthIndicators() {
    return [
      { label: 'Sensör Performansı', status: 'good', icon: 'check_circle' },
      { label: 'Bakım Durumu', status: 'moderate', icon: 'engineering' },
      { label: 'Sistem Yükü', status: 'good', icon: 'memory' },
      { label: 'Veri Kalitesi', status: 'good', icon: 'data_check' }
    ];
  }

  getPredictions() {
    return [
      {
        icon: 'warning',
        message: 'Motor sıcaklığı kritik seviyeye ulaşabilir',
        timeFrame: '2 saat içinde',
        severity: 'high'
      },
      {
        icon: 'build',
        message: 'Planlı bakım yaklaşıyor',
        timeFrame: '3 gün içinde',
        severity: 'medium'
      },
      {
        icon: 'trending_up',
        message: 'Enerji tüketimi artış trendinde',
        timeFrame: '24 saat içinde',
        severity: 'low'
      }
    ];
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'operational': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'maintenance': return 'build';
      default: return 'help';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'operational': return 'Çalışıyor';
      case 'warning': return 'Dikkat';
      case 'error': return 'Hata';
      case 'maintenance': return 'Bakımda';
      default: return 'Bilinmiyor';
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

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'stable': return 'trending_flat';
      default: return 'help';
    }
  }

  getStatusBarWidth(sensor: any): string {
    const score = this.calculateDeviationScore(sensor);
    return `${score * 100}%`;
  }

  getStatusDescription(sensor: any): string {
    const score = this.calculateDeviationScore(sensor);
    if (score >= 0.7) return 'Kritik Seviye';
    if (score >= 0.3) return 'Dikkat Gerekiyor';
    return 'Normal Seviye';
  }

  private calculateDeviationScore(sensor: any): number {
    if (!sensor.normalRange) return 0;
    const range = sensor.normalRange.max - sensor.normalRange.min;
    const deviation = Math.max(
      0,
      sensor.value - sensor.normalRange.max,
      sensor.normalRange.min - sensor.value
    );
    return Math.min(deviation / range, 1);
  }

  getPerformanceScore(): number {
    return 0.85; // Bu değer gerçek performans hesaplamasıyla değiştirilmeli
  }

  getActiveAlertCount(): number {
    return this.machines.reduce((acc: number, machine) => 
      acc + machine.alerts.filter((alert: { acknowledged: boolean }) => !alert.acknowledged).length
    , 0);
  }

  hasAlerts(): boolean {
    return this.getActiveAlertCount() > 0;
  }

  getAlertSummary(): string {
    const count = this.getActiveAlertCount();
    if (count === 0) return 'Aktif uyarı yok';
    return `${count} sensörde anomali`;
  }

  getHealthScore(): number {
    const totalScore = this.machines.reduce((acc: number, machine) => 
      acc + machine.sensors.reduce((sum: number, sensor: SensorData) => 
        sum + this.calculateDeviationScore(sensor)
      , 0)
    , 0);
    
    const totalSensors = this.machines.reduce((acc: number, machine) => 
      acc + machine.sensors.length
    , 0);
    
    return totalSensors > 0 ? 1 - (totalScore / totalSensors) : 1;
  }

  getHealthClass(): string {
    const score = this.getHealthScore();
    if (score >= 0.8) return 'healthy';
    if (score >= 0.6) return 'warning';
    return 'danger';
  }

  getHealthStatus(): string {
    const score = this.getHealthScore();
    if (score >= 0.8) return 'Sistem sağlıklı';
    if (score >= 0.6) return 'İyileştirme gerekli';
    return 'Acil müdahale gerekli';
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  getActiveAlerts(machine: any): any[] {
    return machine.alerts.filter((a: any) => !a.acknowledged);
  }

  showAnomalyDetails(machine: any) {
    const anomalyInfo = {
      title: `${machine.name} - Anomali Tespiti`,
      content: [
        {
          title: 'Sensör Durumları',
          items: machine.sensors.map((sensor: any) => ({
            name: sensor.name,
            value: `${sensor.value} ${sensor.unit}`,
            status: sensor.status,
            deviation: this.calculateDeviation(sensor),
            message: this.getAnomalyMessage(sensor)
          }))
        },
        {
          title: 'Genel Durum',
          score: this.calculateMachineHealthScore(machine),
          alerts: this.getActiveAlerts(machine)
        }
      ]
    };

    this.dialog.open(AnomalyDetailsDialogComponent, {
      data: anomalyInfo,
      width: '800px',
      maxHeight: '90vh'
    });

    // Mail gönderildiğinde snackbar göster ve bildirim zili için event gönder
    this.showNotification('E-posta bildirimi gönderildi', 'success');
    this.dashboardService.notifyEmailSent({
      recipients: environment.recipientEmails || ['operator@example.com', 'supervisor@example.com']
    });
  }

  getAnomalyMessage(sensor: any): string {
    if (sensor.status === 'danger') {
      return `Kritik seviyede sapma! Normal aralık: ${sensor.normalRange.min}-${sensor.normalRange.max} ${sensor.unit}`;
    } else if (sensor.status === 'warning') {
      return `Dikkat! Değer normal aralıktan sapmaya başladı.`;
    }
    return 'Normal çalışma aralığında';
  }

  calculateMachineHealthScore(machine: any): number {
    const totalDeviations = machine.sensors.reduce((acc: number, sensor: any) => 
      acc + this.calculateDeviation(sensor), 0);
    return 1 - (totalDeviations / machine.sensors.length);
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    };

    this.snackBar.open(message, 'Kapat', config);
  }
} 
