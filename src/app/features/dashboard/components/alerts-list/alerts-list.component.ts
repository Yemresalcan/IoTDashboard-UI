import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-alerts-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    CardComponent,
    TimeAgoPipe
  ],
  template: `
    <app-card
      title="Aktif Uyarılar"
      [elevated]="true"
      [hasActions]="true">
      <div class="alerts-content">
        <!-- Filtre Seçenekleri -->
        <div class="filter-options">
          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>Kategori</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilters()">
              <mat-option value="all">Tümü</mat-option>
              <mat-option value="maintenance">Bakım</mat-option>
              <mat-option value="system">Sistem</mat-option>
              <mat-option value="performance">Performans</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>Önem Derecesi</mat-label>
            <mat-select [(ngModel)]="selectedSeverity" (selectionChange)="applyFilters()">
              <mat-option value="all">Tümü</mat-option>
              <mat-option value="high">Kritik</mat-option>
              <mat-option value="medium">Orta</mat-option>
              <mat-option value="low">Düşük</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>Zaman</mat-label>
            <mat-select [(ngModel)]="selectedTimeRange" (selectionChange)="applyFilters()">
              <mat-option value="all">Tümü</mat-option>
              <mat-option value="1h">Son 1 Saat</mat-option>
              <mat-option value="6h">Son 6 Saat</mat-option>
              <mat-option value="24h">Son 24 Saat</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Aktif Filtreler -->
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <mat-chip-listbox>
            <mat-chip *ngIf="selectedCategory !== 'all'" (removed)="clearCategoryFilter()">
              {{ getCategoryText(selectedCategory) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip *ngIf="selectedSeverity !== 'all'" (removed)="clearSeverityFilter()">
              {{ getSeverityText(selectedSeverity) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip *ngIf="selectedTimeRange !== 'all'" (removed)="clearTimeFilter()">
              {{ getTimeRangeText(selectedTimeRange) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-listbox>
        </div>

        <div class="alerts-grid" *ngIf="filteredAlerts.length > 0">
          <div
            class="alert-item"
            *ngFor="let alert of filteredAlerts"
            [ngClass]="alert.severity">
            <div class="alert-icon">
              <mat-icon>{{ getAlertIcon(alert.severity) }}</mat-icon>
            </div>
            <div class="alert-details">
              <p class="alert-message">{{ alert.message }}</p>
              <span class="alert-time">{{ alert.timestamp | timeAgo }}</span>
              <span class="alert-category">{{ getCategoryText(alert.category) }}</span>
            </div>
            <button
              mat-icon-button
              color="primary"
              [matTooltip]="'Onayla'"
              (click)="acknowledgeAlert(alert.id)">
              <mat-icon>done</mat-icon>
            </button>
          </div>
        </div>

        <div class="no-alerts" *ngIf="filteredAlerts.length === 0">
          <mat-icon>check_circle</mat-icon>
          <p>Aktif uyarı bulunmuyor</p>
        </div>
      </div>

      <div actions>
        <button mat-button color="primary" (click)="clearAllFilters()">
          <mat-icon>clear_all</mat-icon>
          Filtreleri Temizle
        </button>
        <button mat-button color="accent" (click)="acknowledgeAll()">
          <mat-icon>done_all</mat-icon>
          Tümünü Onayla
        </button>
      </div>
    </app-card>
  `,
  styles: [`
    .alerts-content {
      min-height: 200px;
    }

    .filter-options {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      min-width: 150px;
      flex: 1;
    }

    .active-filters {
      margin-bottom: 1rem;
    }

    .alerts-grid {
      display: grid;
      gap: 1rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(4px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      &.high {
        border-left: 4px solid #c53030;
        .alert-icon {
          color: #c53030;
        }
      }

      &.medium {
        border-left: 4px solid #c05621;
        .alert-icon {
          color: #c05621;
        }
      }

      &.low {
        border-left: 4px solid #2f855a;
        .alert-icon {
          color: #2f855a;
        }
      }
    }

    .alert-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f7fafc;
    }

    .alert-details {
      flex: 1;

      .alert-message {
        margin: 0;
        font-size: 0.875rem;
        color: #2d3748;
      }

      .alert-time {
        font-size: 0.75rem;
        color: #718096;
        margin-right: 0.5rem;
      }

      .alert-category {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background: #f7fafc;
        color: #4a5568;
      }
    }

    .no-alerts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #a0aec0;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
        font-size: 1rem;
      }
    }

    @media (max-width: 768px) {
      .filter-options {
        flex-direction: column;
      }

      .filter-select {
        width: 100%;
      }
    }
  `]
})
export class AlertsListComponent {
  @Input() alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
    category: 'maintenance' | 'system' | 'performance';
  }> = [];

  @Output() onAcknowledge = new EventEmitter<string>();

  selectedCategory: string = 'all';
  selectedSeverity: string = 'all';
  selectedTimeRange: string = 'all';

  get filteredAlerts() {
    return this.alerts
      .filter(alert => !alert.acknowledged)
      .filter(alert => this.filterByCategory(alert))
      .filter(alert => this.filterBySeverity(alert))
      .filter(alert => this.filterByTime(alert))
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  private filterByCategory(alert: any): boolean {
    return this.selectedCategory === 'all' || alert.category === this.selectedCategory;
  }

  private filterBySeverity(alert: any): boolean {
    return this.selectedSeverity === 'all' || alert.severity === this.selectedSeverity;
  }

  private filterByTime(alert: any): boolean {
    if (this.selectedTimeRange === 'all') return true;
    
    const now = new Date();
    const alertTime = new Date(alert.timestamp);
    const hoursDiff = (now.getTime() - alertTime.getTime()) / (1000 * 60 * 60);

    switch (this.selectedTimeRange) {
      case '1h': return hoursDiff <= 1;
      case '6h': return hoursDiff <= 6;
      case '24h': return hoursDiff <= 24;
      default: return true;
    }
  }

  getAlertIcon(severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'help';
    }
  }

  getCategoryText(category: string): string {
    const categories: { [key: string]: string } = {
      maintenance: 'Bakım',
      system: 'Sistem',
      performance: 'Performans'
    };
    return categories[category] || category;
  }

  getSeverityText(severity: string): string {
    const severities: { [key: string]: string } = {
      high: 'Kritik',
      medium: 'Orta',
      low: 'Düşük'
    };
    return severities[severity] || severity;
  }

  getTimeRangeText(timeRange: string): string {
    const ranges: { [key: string]: string } = {
      '1h': 'Son 1 Saat',
      '6h': 'Son 6 Saat',
      '24h': 'Son 24 Saat'
    };
    return ranges[timeRange] || timeRange;
  }

  hasActiveFilters(): boolean {
    return this.selectedCategory !== 'all' || 
           this.selectedSeverity !== 'all' || 
           this.selectedTimeRange !== 'all';
  }

  clearCategoryFilter() {
    this.selectedCategory = 'all';
    this.applyFilters();
  }

  clearSeverityFilter() {
    this.selectedSeverity = 'all';
    this.applyFilters();
  }

  clearTimeFilter() {
    this.selectedTimeRange = 'all';
    this.applyFilters();
  }

  clearAllFilters() {
    this.selectedCategory = 'all';
    this.selectedSeverity = 'all';
    this.selectedTimeRange = 'all';
    this.applyFilters();
  }

  applyFilters() {
    // Filtreleme otomatik olarak getter üzerinden yapılıyor
  }

  acknowledgeAlert(alertId: string) {
    this.onAcknowledge.emit(alertId);
  }

  acknowledgeAll() {
    this.filteredAlerts.forEach(alert => {
      this.onAcknowledge.emit(alert.id);
    });
  }
} 