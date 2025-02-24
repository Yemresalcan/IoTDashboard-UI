import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueUnit',
  standalone: true
})
export class ValueUnitPipe implements PipeTransform {
  transform(value: number, unit: string, precision: number = 2): string {
    if (value === null || value === undefined) return '-';

    const formattedValue = value.toFixed(precision);
    
    // Birim formatlamaları
    switch (unit.toLowerCase()) {
      case '°c':
        return `${formattedValue}°C`;
      case 'bar':
        return `${formattedValue} bar`;
      case 'mm/s':
        return `${formattedValue} mm/s`;
      case 'db':
        return `${formattedValue} dB`;
      case 'rpm':
        return `${formattedValue} RPM`;
      case 'kw':
        return `${formattedValue} kW`;
      default:
        return `${formattedValue} ${unit}`;
    }
  }
} 