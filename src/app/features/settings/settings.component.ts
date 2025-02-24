import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="settings-container">
      <h1>Ayarlar</h1>
      
      <mat-tab-group>
        <!-- Tema Ayarları -->
        <mat-tab label="Tema">
          <mat-card>
            <mat-card-content>
              <div class="settings-section">
                <h2>Tema Ayarları</h2>
                
                <div class="setting-item">
                  <mat-slide-toggle [(ngModel)]="settings.theme.darkMode" (change)="onThemeChange()">
                    Koyu Tema
                  </mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <label>Ana Renk</label>
                  <input type="color" [(ngModel)]="settings.theme.primaryColor" (change)="onColorChange()">
                </div>

                <div class="setting-item">
                  <label>Vurgu Rengi</label>
                  <input type="color" [(ngModel)]="settings.theme.accentColor" (change)="onColorChange()">
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Bildirim Ayarları -->
        <mat-tab label="Bildirimler">
          <mat-card>
            <mat-card-content>
              <div class="settings-section">
                <h2>E-posta Bildirimleri</h2>
                
                <div class="setting-item">
                  <mat-slide-toggle [(ngModel)]="settings.notifications.email.enabled">
                    E-posta Bildirimleri Aktif
                  </mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Bildirim Sıklığı</mat-label>
                    <mat-select [(ngModel)]="settings.notifications.email.frequency">
                      <mat-option value="immediate">Anında</mat-option>
                      <mat-option value="hourly">Saatlik</mat-option>
                      <mat-option value="daily">Günlük</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Alıcı E-posta Adresleri</mat-label>
                    <input matInput [(ngModel)]="settings.notifications.email.recipients[0]">
                  </mat-form-field>
                </div>
              </div>

              <div class="settings-section">
                <h2>Uygulama Bildirimleri</h2>
                
                <div class="setting-item">
                  <mat-slide-toggle [(ngModel)]="settings.notifications.push.enabled">
                    Anlık Bildirimler Aktif
                  </mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <mat-slide-toggle [(ngModel)]="settings.notifications.push.sound">
                    Bildirim Sesi
                  </mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <mat-slide-toggle [(ngModel)]="settings.notifications.push.desktop">
                    Masaüstü Bildirimleri
                  </mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Görünüm Ayarları -->
        <mat-tab label="Görünüm">
          <mat-card>
            <mat-card-content>
              <div class="settings-section">
                <h2>Görünüm Ayarları</h2>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Dil</mat-label>
                    <mat-select [(ngModel)]="settings.display.language">
                      <mat-option value="tr">Türkçe</mat-option>
                      <mat-option value="en">English</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Tarih Formatı</mat-label>
                    <mat-select [(ngModel)]="settings.display.dateFormat">
                      <mat-option value="DD.MM.YYYY">31.12.2023</mat-option>
                      <mat-option value="YYYY-MM-DD">2023-12-31</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Saat Formatı</mat-label>
                    <mat-select [(ngModel)]="settings.display.timeFormat">
                      <mat-option value="24h">24 Saat</mat-option>
                      <mat-option value="12h">12 Saat</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Yenileme Aralığı (saniye)</mat-label>
                    <input matInput type="number" [(ngModel)]="settings.display.refreshInterval" min="5" max="300">
                  </mat-form-field>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Sistem Ayarları -->
        <mat-tab label="Sistem">
          <mat-card>
            <mat-card-content>
              <div class="settings-section">
                <h2>Sistem Ayarları</h2>

                <div class="setting-item">
                  <mat-slide-toggle [(ngModel)]="settings.system.autoRefresh">
                    Otomatik Yenileme
                  </mat-slide-toggle>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Veri Saklama Süresi (gün)</mat-label>
                    <input matInput type="number" [(ngModel)]="settings.system.dataRetentionDays" min="1" max="90">
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Maksimum Uyarı Sayısı</mat-label>
                    <input matInput type="number" [(ngModel)]="settings.system.maxAlertsToShow" min="10" max="100">
                  </mat-form-field>
                </div>

                <div class="setting-item">
                  <mat-form-field>
                    <mat-label>Log Seviyesi</mat-label>
                    <mat-select [(ngModel)]="settings.system.logLevel">
                      <mat-option value="debug">Debug</mat-option>
                      <mat-option value="info">Info</mat-option>
                      <mat-option value="warn">Warning</mat-option>
                      <mat-option value="error">Error</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>

      <div class="settings-actions">
        <button mat-raised-button color="primary" (click)="saveSettings()">
          <mat-icon>save</mat-icon>
          Ayarları Kaydet
        </button>
        <button mat-button (click)="resetSettings()">
          <mat-icon>restore</mat-icon>
          Varsayılana Döndür
        </button>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      color: #2d3748;
    }

    .settings-section {
      margin: 1.5rem 0;

      h2 {
        color: #4a5568;
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }

    .setting-item {
      margin: 1rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;

      mat-form-field {
        width: 100%;
      }

      label {
        min-width: 120px;
        color: #4a5568;
      }
    }

    .settings-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    mat-card {
      margin: 1rem 0;
      padding: 1rem;
    }

    :host ::ng-deep {
      .mat-tab-body-content {
        padding: 1rem 0;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings = environment.settings;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Kaydedilmiş ayarları localStorage'dan yükle
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }
  }

  onThemeChange() {
    document.body.classList.toggle('dark-theme', this.settings.theme.darkMode);
  }

  onColorChange() {
    // Renk değişikliklerini CSS değişkenlerine uygula
    document.documentElement.style.setProperty('--primary-color', this.settings.theme.primaryColor);
    document.documentElement.style.setProperty('--accent-color', this.settings.theme.accentColor);
  }

  saveSettings() {
    // Ayarları localStorage'a kaydet
    localStorage.setItem('appSettings', JSON.stringify(this.settings));
    
    this.snackBar.open('Ayarlar kaydedildi', 'Tamam', {
      duration: 3000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  resetSettings() {
    // Ayarları varsayılana döndür
    this.settings = JSON.parse(JSON.stringify(environment.settings));
    localStorage.removeItem('appSettings');
    
    this.snackBar.open('Ayarlar varsayılana döndürüldü', 'Tamam', {
      duration: 3000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });

    this.onThemeChange();
    this.onColorChange();
  }
} 