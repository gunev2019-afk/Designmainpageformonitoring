/**
 * КОНФИГУРАЦИЯ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
 * Загрузка и валидация переменных из .env файла
 */

import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

/**
 * Получить переменную окружения с проверкой
 */
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`Переменная окружения ${name} не установлена`);
  }
  
  return value;
}

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
    secret: getEnvVar('JWT_SECRET') as string,
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '24h') as string,
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
};

/**
 * Валидация конфигурации при запуске
 */
export function validateConfig(): void {
  console.log('🔍 Проверка конфигурации...');

  // Проверяем критические переменные
  const requiredVars = [
    'INFLUX_URL',
    'INFLUX_TOKEN',
    'INFLUX_ORG',
    'JWT_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Отсутствуют обязательные переменные окружения:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n💡 Создайте файл .env на основе .env.example');
    process.exit(1);
  }

  // Проверяем JWT secret
  if (config.jwt.secret.length < 32) {
    console.warn('⚠️  JWT_SECRET слишком короткий! Используйте минимум 32 символа.');
  }

  // Проверяем порт
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    console.error('❌ Неверный порт:', config.port);
    process.exit(1);
  }

  console.log('✅ Конфигурация валидна');
  console.log(`   Окружение: ${config.nodeEnv}`);
  console.log(`   Порт: ${config.port}`);
  console.log(`   InfluxDB: ${config.influxdb.url}`);
  console.log(`   CORS: ${config.cors.origin}`);
}