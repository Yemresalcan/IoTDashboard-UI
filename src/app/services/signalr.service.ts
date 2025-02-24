import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from './environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

// Veri Modelleri
export interface SensorData {
  machineId: string;
  timestamp: string;
  sensors: {
    [key: string]: {
      value: number;
      unit: string;
    }
  };
}

export interface AnomalyAlert {
  machineId: string;
  timestamp: string;
  isAnomaly: boolean;
  score: number;
  alarmLevel: string;
  messages: string[];
  sensorData: {
    [key: string]: {
      value: number;
      unit: string;
    }
  };
}

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private hubConnection!: signalR.HubConnection;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private sensorData = new BehaviorSubject<SensorData | null>(null);
  private anomalyAlert = new BehaviorSubject<AnomalyAlert | null>(null);
  private handlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    console.log('🔄 SignalR bağlantısı başlatılıyor...', environment.apiUrl);
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Debug)
      .withAutomaticReconnect()
      .build();

    // Bağlantı durumu değişikliklerini dinle
    this.hubConnection.onreconnecting((error) => {
      console.log('🔄 SignalR: Yeniden bağlanmaya çalışılıyor...', error);
      this.ngZone.run(() => this.connectionStatus.next(false));
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('✅ SignalR: Yeniden bağlantı başarılı!', connectionId);
      this.ngZone.run(() => this.connectionStatus.next(true));
    });

    this.hubConnection.onclose((error) => {
      console.log('❌ SignalR: Bağlantı kapandı', error);
      this.ngZone.run(() => this.connectionStatus.next(false));
    });

    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('ℹ️ SignalR: Zaten bağlı durumda.');
      return;
    }

    try {
      // Önce backend'in çalışıp çalışmadığını kontrol et
      try {
        const response = await fetch(`${environment.apiUrl}/`);
        console.log('🔍 Backend durumu:', response.status === 200 ? '✅ Çalışıyor' : '❌ Hata');
      } catch (error) {
        console.error('❌ Backend erişilemez durumda:', error);
        this.ngZone.run(() => this.connectionStatus.next(false));
        setTimeout(() => this.startConnection(), 3000);
        return;
      }

      console.log('🔄 SignalR bağlantısı başlatılıyor...');
      await this.hubConnection.start();
      console.log('✅ SignalR Bağlantısı başarılı!');
      this.ngZone.run(() => this.connectionStatus.next(true));
      this.registerHubEvents();
    } catch (err) {
      console.error('❌ SignalR Bağlantı hatası:', err);
      this.ngZone.run(() => this.connectionStatus.next(false));
      setTimeout(() => {
        console.log('🔄 SignalR: Yeniden bağlanmaya çalışılıyor...');
        this.startConnection();
      }, 3000);
    }
  }

  private registerHubEvents(): void {
    this.hubConnection.on('ReceiveSensorData', (data: SensorData) => {
      console.log('📡 Yeni Sensör Verisi:', {
        machineId: data.machineId,
        timestamp: data.timestamp,
        sensors: Object.entries(data.sensors).map(([key, value]) => ({
          name: key,
          value: value.value,
          unit: value.unit
        }))
      });
      this.ngZone.run(() => this.sensorData.next(data));
    });

    this.hubConnection.on('ReceiveAnomalyAlert', (alert: AnomalyAlert) => {
      console.log('⚠️ Yeni Anomali Uyarısı:', {
        machineId: alert.machineId,
        timestamp: alert.timestamp,
        score: alert.score,
        messages: alert.messages,
        sensorData: Object.entries(alert.sensorData).map(([key, value]) => ({
          name: key,
          value: value.value,
          unit: value.unit
        }))
      });
      this.ngZone.run(() => this.anomalyAlert.next(alert));
    });
  }

  public on(eventName: string, callback: (data: any) => void) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
      this.hubConnection.on(eventName, (data: any) => {
        const callbacks = this.handlers.get(eventName);
        if (callbacks) {
          callbacks.forEach(cb => this.ngZone.run(() => cb(data)));
        }
      });
    }

    const callbacks = this.handlers.get(eventName);
    if (callbacks) {
      callbacks.push(callback);
    }
  }

  public off(eventName: string, callback: (data: any) => void) {
    const callbacks = this.handlers.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.handlers.delete(eventName);
        this.hubConnection.off(eventName);
      }
    }
  }

  // === Public API ===
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  getSensorData(): Observable<SensorData | null> {
    return this.sensorData.asObservable();
  }

  getAnomalyAlerts(): Observable<AnomalyAlert | null> {
    return this.anomalyAlert.asObservable();
  }

  async sendTestSensorData(): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${environment.apiUrl}/test/sensor-data`, {}).pipe(
        catchError(error => {
          console.error('[HTTP] Hata:', error.message);
          return throwError(() => new Error('Test verisi gönderilemedi'));
        })
      )
    );
  }

  async sendTestAnomalyAlert(): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${environment.apiUrl}/test/anomaly-alert`, {}).pipe(
        catchError(error => {
          console.error('[HTTP] Hata:', error.message);
          return throwError(() => new Error('Test uyarısı gönderilemedi'));
        })
      )
    );
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}