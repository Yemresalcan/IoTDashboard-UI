import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class SensorChartComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data!: Array<{ timestamp: Date; value: number }>;
  @Input() unit: string = '';
  @Input() thresholds?: { warning: number; danger: number };

  private chart?: Chart;

  ngOnInit() {
    this.initializeChart();
  }

  private initializeChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.data.map(item => 
      new Date(item.timestamp).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const values = this.data.map(item => item.value);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Değer (${this.unit})`,
            data: values,
            borderColor: '#3182ce',
            backgroundColor: 'rgba(49, 130, 206, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y} ${this.unit}`
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Zaman'
            },
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: this.unit
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    if (this.thresholds) {
      const warningLine = {
        label: 'Uyarı Eşiği',
        data: new Array(labels.length).fill(this.thresholds.warning),
        borderColor: '#c05621',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      };

      const dangerLine = {
        label: 'Tehlike Eşiği',
        data: new Array(labels.length).fill(this.thresholds.danger),
        borderColor: '#c53030',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      };

      config.data.datasets.push(warningLine, dangerLine);
    }

    this.chart = new Chart(ctx, config);
  }

  updateChart() {
    if (!this.chart) return;

    const labels = this.data.map(item => 
      new Date(item.timestamp).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const values = this.data.map(item => item.value);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;

    if (this.thresholds && this.chart.data.datasets.length > 1) {
      this.chart.data.datasets[1].data = new Array(labels.length).fill(this.thresholds.warning);
      this.chart.data.datasets[2].data = new Array(labels.length).fill(this.thresholds.danger);
    }

    this.chart.update();
  }
} 