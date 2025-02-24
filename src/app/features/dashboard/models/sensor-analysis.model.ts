export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  trend: 'up' | 'down' | 'stable';
  normalRange: {
    min: number;
    max: number;
  };
  thresholds: {
    warning: number;
    danger: number;
  };
  chartData: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface SensorAnalysis {
  totalScore: number;
  alarmLevel: 'normal' | 'low' | 'medium' | 'high';
  sensors: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    range: {
      min: number;
      max: number;
    };
    isAnomaly: boolean;
    score: number;
    message: string;
    chartData: Array<{
      timestamp: Date;
      value: number;
    }>;
  }>;
} 