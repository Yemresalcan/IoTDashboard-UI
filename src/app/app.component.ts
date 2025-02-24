import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { DashboardService } from './features/dashboard/services/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode">
      <header class="app-header">
        <div class="logo">
          <mat-icon class="logo-icon">device_hub</mat-icon>
          <span>IoT Dashboard</span>
        </div>
        <nav class="main-nav">
          <a routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
          <a routerLink="/analytics" routerLinkActive="active">
            <mat-icon>analytics</mat-icon>
            Analiz
          </a>
          <a routerLink="/reports" routerLinkActive="active">
            <mat-icon>assessment</mat-icon>
            Raporlar
          </a>
          <a routerLink="/settings" routerLinkActive="active">
            <mat-icon>settings</mat-icon>
            Ayarlar
          </a>
        </nav>
        <div class="user-menu">
          <button mat-icon-button class="theme-toggle" (click)="toggleTheme()" [matTooltip]="isDarkMode ? 'Açık Tema' : 'Koyu Tema'">
            <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <button mat-icon-button class="notifications" [matMenuTriggerFor]="notificationMenu">
            <mat-icon [matBadge]="notifications.length" [matBadgeHidden]="notifications.length === 0" matBadgeColor="warn">
              notifications
            </mat-icon>
            <span style="position: absolute; top: 20px; right: 20px; font-size: 10px;">
              ({{ notifications.length }})
            </span>
          </button>
          <mat-menu #notificationMenu="matMenu" class="notification-menu">
            <div class="notification-header">
              <h3>Bildirimler</h3>
              <button mat-icon-button (click)="clearNotifications()">
                <mat-icon>clear_all</mat-icon>
              </button>
            </div>
            <div class="notification-list">
              <div *ngFor="let notification of notifications" class="notification-item" [ngClass]="notification.type">
                <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
                <div class="notification-content">
                  <p class="message">{{ notification.message }}</p>
                  <span class="time">{{ notification.timestamp | date:'HH:mm' }}</span>
                </div>
              </div>
              <div *ngIf="notifications.length === 0" class="no-notifications">
                Bildirim bulunmuyor
              </div>
            </div>
          </mat-menu>
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <span>Admin</span>
          </div>
        </div>
      </header>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f7fa;
      transition: all 0.3s ease;
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #3182ce;
    }

    .logo span {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .main-nav {
      display: flex;
      gap: 2rem;
    }

    .main-nav a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #606f7b;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .main-nav a:hover {
      background: #f1f5f9;
      color: #2c3e50;
    }

    .main-nav a.active {
      background: #e2e8f0;
      color: #2c3e50;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle,
    .notifications {
      color: #606f7b;
    }

    .notifications {
      position: relative;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #e53e3e;
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      line-height: 1;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .user-info:hover {
      background: #f1f5f9;
    }

    .user-info mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #606f7b;
    }

    .user-info span {
      color: #2c3e50;
      font-weight: 500;
    }

    .app-content {
      padding: 2rem;
    }

    .notification-menu {
      min-width: 300px;
      max-width: 350px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #e2e8f0;

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #2d3748;
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f7fafc;
      }

      &.success {
        mat-icon {
          color: #2f855a;
        }
      }

      &.error {
        mat-icon {
          color: #c53030;
        }
      }

      &.info {
        mat-icon {
          color: #2b6cb0;
        }
      }
    }

    .notification-content {
      flex: 1;

      .message {
        margin: 0;
        font-size: 0.875rem;
        color: #2d3748;
      }

      .time {
        font-size: 0.75rem;
        color: #718096;
      }
    }

    .no-notifications {
      padding: 1rem;
      text-align: center;
      color: #718096;
      font-size: 0.875rem;
    }

    // Dark theme styles
    .dark-theme {
      background-color: #1a1a1a;

      .app-header {
        background: #2d2d2d;
        color: #ffffff;
      }

      .logo span {
        color: #ffffff;
      }

      .main-nav a {
        color: #b3b3b3;
        
        &:hover {
          background: #3d3d3d;
          color: #ffffff;
        }
        
        &.active {
          background: #4d4d4d;
          color: #ffffff;
        }
      }

      .theme-toggle,
      .notifications {
        color: #b3b3b3;
      }

      .user-info {
        color: #ffffff;
        
        &:hover {
          background: #3d3d3d;
        }

        mat-icon {
          color: #b3b3b3;
        }

        span {
          color: #ffffff;
        }
      }

      .notification-item {
        background: #2d2d2d;
        border-color: #404040;

        &:hover {
          background: #3d3d3d;
        }

        .message {
          color: #ffffff;
        }

        .time {
          color: #b3b3b3;
        }
      }

      .no-notifications {
        color: #b3b3b3;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'IoT Dashboard';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }> = [];
  private subscription?: Subscription;
  isDarkMode = false;

  constructor(private dashboardService: DashboardService) {
    // Local storage'dan dark mode tercihini al
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.updateTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  private updateTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  ngOnInit() {
    console.log('AppComponent initialized');
    // E-posta bildirimlerini dinle
    this.subscription = this.dashboardService.getEmailNotifications().subscribe((data) => {
      console.log('Email notification received in AppComponent');
      const recipients = data.recipients.join(', ');
      const notification: {
        id: string;
        type: 'success' | 'error' | 'info';
        message: string;
        timestamp: Date;
      } = {
        id: Date.now().toString(),
        type: 'success' as const,
        message: `E-posta bildirimi gönderildi (Alıcılar: ${recipients})`,
        timestamp: new Date()
      };
      this.addNotification(notification);
      console.log('Notification added to list, current count:', this.notifications.length);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addNotification(notification: {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }) {
    console.log('Adding notification:', notification);
    this.notifications = [notification, ...this.notifications];
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }
    console.log('Current notifications:', this.notifications);
  }

  clearNotifications() {
    this.notifications = [];
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }
}
