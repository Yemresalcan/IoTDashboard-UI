import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-anomaly-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    <div class="anomaly-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <!-- Sensör Durumları -->
        <div class="section">
          <h3>{{ data.content[0].title }}</h3>
          <div class="sensors-grid">
            <div class="sensor-item" *ngFor="let sensor of data.content[0].items"
                 [ngClass]="sensor.status">
              <div class="sensor-header">
                <mat-icon>{{ getSensorIcon(sensor.name) }}</mat-icon>
                <span class="sensor-name">{{ sensor.name }}</span>
              </div>
              <div class="sensor-details">
                <div class="value">{{ sensor.value }}</div>
                <div class="deviation">
                  Sapma: {{ sensor.deviation | percent:'1.1-1' }}
                </div>
                <div class="message">{{ sensor.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Genel Durum -->
        <div class="section">
          <h3>{{ data.content[1].title }}</h3>
          <div class="health-score" [ngClass]="getHealthClass(data.content[1].score)">
            <div class="score-value">
              {{ data.content[1].score | percent:'1.1-1' }}
            </div>
            <div class="score-label">Sağlık Skoru</div>
          </div>

          <!-- Aktif Uyarılar -->
          <div class="alerts-section" *ngIf="data.content[1].alerts.length > 0">
            <h4>Aktif Uyarılar</h4>
            <div class="alert-item" *ngFor="let alert of data.content[1].alerts"
                 [ngClass]="alert.severity">
              <mat-icon>{{ getAlertIcon(alert.severity) }}</mat-icon>
              <div class="alert-content">
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-time">{{ alert.timestamp | date:'medium' }}</div>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Kapat</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .anomaly-dialog {
      padding: 1rem;
      max-width: 800px;
    }

    .section {
      margin: 1rem 0;

      h3 {
        margin: 0 0 1rem;
        color: #2d3748;
        font-size: 1.1rem;
      }
    }

    .sensors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .sensor-item {
      padding: 1rem;
      border-radius: 8px;
      background: white;
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

    .sensor-details {
      .value {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
      }

      .deviation {
        font-size: 0.875rem;
        color: #718096;
      }

      .message {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #4a5568;
      }
    }

    .health-score {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;

      &.healthy {
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

      .score-value {
        font-size: 2rem;
        font-weight: 600;
      }

      .score-label {
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    }

    .alerts-section {
      margin-top: 1rem;

      h4 {
        margin: 0 0 0.5rem;
        color: #4a5568;
        font-size: 1rem;
      }
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      margin: 0.5rem 0;
      border-radius: 4px;

      &.high {
        background: #fff5f5;
        color: #c53030;
      }

      &.medium {
        background: #fffaf0;
        color: #c05621;
      }

      &.low {
        background: #f0fff4;
        color: #2f855a;
      }
    }

    .alert-content {
      flex: 1;

      .alert-message {
        font-weight: 500;
      }

      .alert-time {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        opacity: 0.8;
      }
    }
  `]
})
export class AnomalyDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AnomalyDetailsDialogComponent>
  ) {}

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

  getHealthClass(score: number): string {
    if (score >= 0.8) return 'healthy';
    if (score >= 0.6) return 'warning';
    return 'danger';
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'help';
    }
  }

  close() {
    this.dialogRef.close();
  }
} 