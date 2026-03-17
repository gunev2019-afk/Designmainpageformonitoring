/**
 * Конфигурация приложения
 */
export const config = {
  // Сервер
  port: parseInt(getEnvVar('PORT', '3001'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',

  // База данных SQLite
  database: {
    path: getEnvVar('DB_PATH', './data/monitoring.db'),
  },

  // InfluxDB
  influxdb: {
    url: getEnvVar('INFLUX_URL', 'http://localhost:8086'),
    token: getEnvVar('INFLUX_TOKEN'),
    org: getEnvVar('INFLUX_ORG'),
    defaultBucket: 'telemetry', // можно добавить в .env при необходимости
  },

  // JWT
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
  },

  // CORS
  cors: {
    origin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  },

  // Логирование
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    file: getEnvVar('LOG_FILE', './logs/app.log'),
  },

  // Безопасность
  security: {
    bcryptRounds: 10,
    maxRequestsPerMinute: 100,
  },
} as const;