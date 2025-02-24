import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription, Subject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { SignalRService, SensorData as SignalRSensorData } from '../../../services/signalr.service';
import { environment } from '../../../services/environment';
import { SensorData, SensorAnalysis } from '../models/sensor-analysis.model';

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  category: 'maintenance' | 'system' | 'performance' | 'anomaly';
}

export interface MachineData {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'error' | 'maintenance';
  lastUpdate: Date;
  sensors: SensorData[];
  alerts: Alert[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService implements OnDestroy {
  private apiUrl = environment.apiUrl;
  private refreshInterval = 30000;
  private refreshSubscription?: Subscription;
  private lastSensorValues: { [key: string]: number } = {};

  private sensorDataSubject = new BehaviorSubject<SensorData[]>([]);
  private machineDataSubject = new BehaviorSubject<MachineData>({
    id: 'MACHINE-003',
    name: 'Ana Üretim Hattı',
    status: 'operational',
    lastUpdate: new Date(),
    sensors: [],
    alerts: []
  });
  private analysisSubject = new BehaviorSubject<SensorAnalysis>({
    totalScore: 0,
    alarmLevel: 'normal',
    sensors: []
  });

  private emailNotifications = new Subject<any>();

  constructor(
    private http: HttpClient,
    private signalRService: SignalRService
  ) {
    this.setupSignalRListeners();
  }

  private setupSignalRListeners() {
    this.signalRService.getSensorData().subscribe(data => {
      if (data) {
        const sensors: SensorData[] = [];
        for (const [key, value] of Object.entries(data.sensors)) {
          const lastValue = this.lastSensorValues[key] || value.value;
          const trend: 'up' | 'down' | 'stable' = 
            value.value > lastValue ? 'up' : 
            value.value < lastValue ? 'down' : 'stable';
          
          this.lastSensorValues[key] = value.value;

          // Eşik değerlerini sensöre göre ayarla
          const thresholds = this.getSensorThresholds(key, value.unit);
          
          sensors.push({
            id: key,
            name: this.getSensorName(key),
            value: value.value,
            unit: value.unit,
            status: this.calculateStatus(value.value, thresholds),
            trend,
            normalRange: this.getSensorNormalRange(key, value.unit),
            thresholds,
            chartData: [{
              timestamp: new Date(data.timestamp),
              value: value.value
            }]
          });
        }

        // Mevcut sensör verilerini güncelle
        const currentSensors = this.sensorDataSubject.value;
        const updatedSensors = sensors.map(newSensor => {
          const existingSensor = currentSensors.find(s => s.id === newSensor.id);
          if (existingSensor) {
            return {
              ...newSensor,
              chartData: [
                ...existingSensor.chartData,
                ...newSensor.chartData
              ].slice(-50)
            };
          }
          return newSensor;
        });

        this.sensorDataSubject.next(updatedSensors);
        
        // Makine durumunu güncelle
        const machineStatus = this.calculateMachineStatus(updatedSensors);
        const currentMachine = this.machineDataSubject.value;
        
        // Test için örnek bakım alertleri oluştur
        const testAlerts: Alert[] = [
          {
            id: 'alert-1',
            severity: 'high',
            message: 'Acil bakım gerekiyor: Motor arızası tespit edildi',
            timestamp: new Date(),
            acknowledged: false,
            category: 'maintenance'
          },
          {
            id: 'alert-2',
            severity: 'medium',
            message: 'Planlı bakım zamanı yaklaşıyor: Yağ değişimi gerekli',
            timestamp: new Date(),
            acknowledged: false,
            category: 'maintenance'
          },
          {
            id: 'alert-3',
            severity: 'low',
            message: 'Rutin bakım hatırlatması: Filtre kontrolü yapılmalı',
            timestamp: new Date(),
            acknowledged: false,
            category: 'maintenance'
          }
        ];

        const updatedMachine = {
          ...currentMachine,
          id: data.machineId,
          name: this.getMachineName(data.machineId),
          status: machineStatus,
          lastUpdate: new Date(data.timestamp),
          sensors: updatedSensors,
          alerts: currentMachine ? [...testAlerts, ...currentMachine.alerts] : testAlerts
        };

        this.machineDataSubject.next(updatedMachine);

        // Analiz verilerini güncelle
        this.updateAnalysis(updatedSensors);
      }
    });

    this.signalRService.on('ReceiveAnomalyAlert', (alert: any) => {
      console.log('Anomali uyarısı alındı:', alert);
      
      // E-posta bildirimi gönder
      this.sendEmailNotification(alert);
      
      // Bildirim zili için event gönder
      this.notifyEmailSent({
        recipients: ['operator@example.com', 'supervisor@example.com']
      });
      console.log('Bildirim eventi gönderildi (SignalR)');
    });
  }

  private getAlertSeverity(score: number): 'low' | 'medium' | 'high' {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'low';
    return 'low';
  }

  private getSensorName(key: string): string {
    const names: { [key: string]: string } = {
      sicaklik: 'Sıcaklık',
      basinc: 'Basınç',
      titresim: 'Titreşim',
      gurultu: 'Gürültü',
      motor_hizi: 'Motor Hızı',
      enerji_tuketimi: 'Enerji Tüketimi'
    };
    return names[key] || key;
  }

  private getSensorThresholds(key: string, unit: string): { warning: number; danger: number } {
    const normalRanges: { [key: string]: { min: number; max: number; unit: string } } = {
      sicaklik: { min: 20, max: 80, unit: 'C' },
      basinc: { min: 0.8, max: 1.2, unit: 'bar' },
      titresim: { min: 0, max: 5.0, unit: 'mm/s' },
      gurultu: { min: 60, max: 100, unit: 'dB' },
      motor_hizi: { min: 1000, max: 3000, unit: 'rpm' },
      enerji_tuketimi: { min: 100, max: 500, unit: 'kW' }
    };

    const range = normalRanges[key];
    if (!range) return { warning: 0, danger: 0 };

    const rangeSize = range.max - range.min;
    return {
      warning: range.max + (rangeSize * 0.3),
      danger: range.max + (rangeSize * 0.7)
    };
  }

  private calculateStatus(value: number, thresholds: { warning: number; danger: number }): 'normal' | 'warning' | 'danger' {
    const score = this.calculateDeviationScore(value, thresholds);
    if (score >= 0.7) return 'danger';
    if (score >= 0.3) return 'warning';
    return 'normal';
  }

  private calculateDeviationScore(value: number, thresholds: { warning: number; danger: number }): number {
    const range = thresholds.danger - thresholds.warning;
    const deviation = Math.max(0, value - thresholds.warning);
    return Math.min(deviation / range, 1);
  }

  private calculateMachineStatus(sensors: SensorData[]): 'operational' | 'warning' | 'error' | 'maintenance' {
    const hasDanger = sensors.some(s => s.status === 'danger');
    const hasWarning = sensors.some(s => s.status === 'warning');
    
    if (hasDanger) return 'error';
    if (hasWarning) return 'warning';
    return 'operational';
  }

  private updateAnalysis(sensors: SensorData[]) {
    const totalScore = sensors.reduce((acc, sensor) => acc + this.calculateDeviationScore(sensor.value, sensor.thresholds), 0) / sensors.length;
    
    const updatedAnalysis: SensorAnalysis = {
      totalScore,
      alarmLevel: this.calculateAlarmLevel(totalScore),
      sensors: sensors.map(sensor => ({
        id: sensor.id,
        name: sensor.name,
        value: sensor.value,
        unit: sensor.unit,
        range: sensor.normalRange,
        isAnomaly: sensor.status !== 'normal',
        score: this.calculateDeviationScore(sensor.value, sensor.thresholds),
        message: this.getAnomalyMessage(sensor.name, sensor.value, this.calculateDeviationScore(sensor.value, sensor.thresholds), sensor.unit),
        chartData: sensor.chartData
      }))
    };

    this.analysisSubject.next(updatedAnalysis);
  }

  private calculateAlarmLevel(score: number): 'normal' | 'low' | 'medium' | 'high' {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'low';
    return 'normal';
  }

  private getAnomalyMessage(sensorName: string, value: number, score: number, unit: string): string {
    if (!score || score < 0.3) return '';

    if (score >= 0.7) {
      return `${sensorName} kritik seviyede (${value} ${unit}). Acil müdahale gerekli!`;
    } else if (score >= 0.5) {
      return `${sensorName} değeri normal aralığın dışında (${value} ${unit}). Kontrol edilmeli.`;
    } else {
      return `${sensorName} değerinde sapma tespit edildi (${value} ${unit}).`;
    }
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getSensorData(): Observable<SensorData[]> {
    return this.sensorDataSubject.asObservable();
  }

  getMachineData(): Observable<MachineData> {
    return this.machineDataSubject.asObservable();
  }

  getAnalysis(): Observable<SensorAnalysis> {
    return this.analysisSubject.asObservable();
  }

  refreshData(): Observable<void> {
    return new Observable(subscriber => {
      this.signalRService.sendTestSensorData()
        .then(() => {
          subscriber.next();
          subscriber.complete();
        })
        .catch(error => {
          subscriber.error(error);
        });
    });
  }

  setRefreshInterval(seconds: number) {
    this.refreshInterval = seconds * 1000;
    this.startAutoRefresh();
  }

  startAutoRefresh(): Subscription {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    return interval(this.refreshInterval).subscribe(() => {
      this.refreshData().subscribe();
    });
  }

  acknowledgeAlert(alertId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {}).pipe(
      tap(() => {
        const currentMachine = this.machineDataSubject.value;
        const updatedAlerts = currentMachine.alerts.map(alert => {
          if (alert.id === alertId) {
            // Python servisine e-posta bildirimi gönder
            this.sendEmailNotification(alert);
            // Bildirim zili için event gönder
            this.notifyEmailSent({
              recipients: ['operator@example.com', 'supervisor@example.com']
            });
            return { ...alert, acknowledged: true };
          }
          return alert;
        });
        this.machineDataSubject.next({
          ...currentMachine,
          alerts: updatedAlerts
        });
      })
    );
  }

  private sendEmailNotification(alert: any): void {
    const emailData = {
      alert_level: alert.severity,
      anomaly_score: this.getAnomalyScore(alert.severity),
      timestamp: alert.timestamp,
      messages: [alert.message],
      type_info: {
        action: this.getActionMessage(alert.severity)
      }
    };

    this.http.post(`${this.apiUrl}/notification/send-email`, emailData)
      .subscribe(
        () => {
          console.log('E-posta bildirimi gönderildi');
          // E-posta başarıyla gönderildiğinde bildirim gönder
          this.notifyEmailSent({
            recipients: ['operator@example.com', 'supervisor@example.com']
          });
          console.log('Bildirim eventi gönderildi');
        },
        error => console.error('E-posta gönderimi hatası:', error)
      );
  }

  private getAnomalyScore(severity: 'low' | 'medium' | 'high'): number {
    const scores = {
      high: 0.9,
      medium: 0.7,
      low: 0.4
    };
    return scores[severity];
  }

  private getActionMessage(severity: 'low' | 'medium' | 'high'): string {
    const actions = {
      high: 'Acil müdahale gerekli! Lütfen makineyi kontrol edin ve gerekli önlemleri alın.',
      medium: 'Yakın zamanda kontrol edilmeli. Performans düşüşü yaşanabilir.',
      low: 'Rutin kontrol sırasında incelenebilir.'
    };
    return actions[severity];
  }

  private getSensorNormalRange(key: string, unit: string): { min: number; max: number } {
    const normalRanges: { [key: string]: { min: number; max: number; unit: string } } = {
      sicaklik: { min: 20, max: 80, unit: 'C' },
      basinc: { min: 0.8, max: 1.2, unit: 'bar' },
      titresim: { min: 0, max: 5.0, unit: 'mm/s' },
      gurultu: { min: 60, max: 100, unit: 'dB' },
      motor_hizi: { min: 1000, max: 3000, unit: 'rpm' },
      enerji_tuketimi: { min: 100, max: 500, unit: 'kW' }
    };

    const range = normalRanges[key];
    if (!range) return { min: 0, max: 0 };

    return {
      min: range.min,
      max: range.max
    };
  }

  private getMachineName(machineId: string): string {
    const names: { [key: string]: string } = {
      'MACHINE-001': 'Paketleme Hattı',
      'MACHINE-002': 'Ana Üretim Hattı',
      'MACHINE-003': 'İkincil Hat'
    };
    return names[machineId] || machineId;
  }

  getEmailNotifications(): Observable<any> {
    console.log('getEmailNotifications called');
    return this.emailNotifications.asObservable();
  }

  notifyEmailSent(data: { recipients: string[] }) {
    console.log('notifyEmailSent called');
    this.emailNotifications.next(data);
  }
} 