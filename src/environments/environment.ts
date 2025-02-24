export const environment = {
  production: false,
  apiUrl: 'http://localhost:5005',

  recipientEmails: ['yunusemresalcan@gmail.com'],
  
  settings: {
    theme: {
      darkMode: false,
      primaryColor: '#3182ce',
      accentColor: '#805ad5'
    },
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate', // 'immediate', 'hourly', 'daily'
        recipients: ['yunusemresalcan@gmail.com']
      },
      push: {
        enabled: true,
        sound: true,
        desktop: true
      },
      alerts: {
        criticalOnly: false,
        minSeverity: 'low' // 'low', 'medium', 'high'
      }
    },
    display: {
      language: 'tr',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: '24h',
      refreshInterval: 30, // saniye
      chartPeriod: '1h' // '1h', '6h', '24h'
    },
    system: {
      autoRefresh: true,
      dataRetentionDays: 30,
      maxAlertsToShow: 50,
      logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    }
  }
}; 