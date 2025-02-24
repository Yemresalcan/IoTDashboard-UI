import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return 'şimdi';

    const intervals = {
      yıl: 31536000,
      ay: 2592000,
      hafta: 604800,
      gün: 86400,
      saat: 3600,
      dakika: 60,
      saniye: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? '' : ''} önce`;
      }
    }

    return 'şimdi';
  }
} 