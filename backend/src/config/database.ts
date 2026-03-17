/**
 * КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ SQLITE
 * Подключение к БД и создание таблиц
 */

import Database from 'better-sqlite3';
import { config } from './env';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Получить подключение к базе данных
 */
export function getDatabase(): Database.Database {
  if (!db) {
    // Создаем директорию для БД если её нет
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Создана директория для БД: ${dbDir}`);
    }

    // Подключаемся к БД
    db = new Database(config.database.path, {
      verbose: config.isDevelopment ? console.log : undefined,
    });

    // Включаем внешние ключи
    db.pragma('foreign_keys = ON');

    console.log(`✅ Подключение к SQLite: ${config.database.path}`);
  }

  return db;
}

/**
 * Закрыть подключение к БД
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('🔒 Подключение к БД закрыто');
  }
}

/**
 * Инициализация базы данных
 * Создание всех таблиц
 */
export function initDatabase(): void {
  const database = getDatabase();

  console.log('🔨 Инициализация базы данных...');

  // Таблица пользователей
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'user')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✓ Таблица users');

  // Таблица станций
  database.exec(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name VARCHAR(100) NOT NULL,
      bucket VARCHAR(100) NOT NULL,
      measurement VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✓ Таблица stations');

  // Таблица метрик
  database.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      field VARCHAR(100) NOT NULL,
      channel VARCHAR(50) NOT NULL,
      unit VARCHAR(20),
      show_in_chart BOOLEAN DEFAULT 1,
      show_in_table BOOLEAN DEFAULT 1,
      show_in_export BOOLEAN DEFAULT 1,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
    )
  `);
  console.log('  ✓ Таблица metrics');

  // Таблица логов
  database.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level VARCHAR(20) NOT NULL CHECK(level IN ('info', 'warning', 'error')),
      message TEXT NOT NULL,
      user_id INTEGER,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('  ✓ Таблица system_logs');

  // Создаем индексы для оптимизации
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_metrics_station_id ON metrics(station_id);
    CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON system_logs(created_at);
  `);
  console.log('  ✓ Индексы созданы');

  console.log('✅ База данных инициализирована');
}

/**
 * Заполнение базы данных начальными данными
 */
export function seedDatabase(): void {
  const database = getDatabase();

  console.log('🌱 Заполнение базы данных начальными данными...');

  // Проверяем, есть ли уже данные
  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count > 0) {
    console.log('ℹ️  База данных уже содержит данные, пропускаем seed');
    return;
  }

  // Хэшируем пароли (используем bcrypt в реальном коде)
  const bcrypt = require('bcrypt');
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);

  // Добавляем пользователей
  database.exec(`
    INSERT INTO users (username, password_hash, role) VALUES
      ('admin', '${adminPasswordHash}', 'admin'),
      ('user', '${userPasswordHash}', 'user')
  `);
  console.log('  ✓ Пользователи: admin/admin123, user/user123');

  // Добавляем станции
  database.exec(`
    INSERT INTO stations (display_name, bucket, measurement, is_active) VALUES
      ('LOGO Лаборатория', 'telemetry', 'lab', 1),
      ('LOGO Цех 1', 'telemetry', 'ceh1', 1)
  `);
  console.log('  ✓ Станции: LOGO Лаборатория, LOGO Цех 1');

  // Добавляем метрики для лаборатории (station_id = 1)
  database.exec(`
    INSERT INTO metrics (station_id, display_name, field, channel, unit, show_in_chart, show_in_table, show_in_export, is_active) VALUES
      (1, 'Температура слой 1', 'температура', 'AI1', '°C', 1, 1, 1, 1),
      (1, 'Температура слой 2', 'температура', 'AI2', '°C', 1, 1, 1, 1),
      (1, 'Температура слой 3', 'температура', 'AI3', '°C', 1, 1, 1, 1),
      (1, 'Влажность', 'влажность', 'AI1', '%', 1, 1, 1, 1)
  `);
  console.log('  ✓ Метрики для станции "LOGO Лаборатория"');

  // Добавляем тестовый лог
  database.exec(`
    INSERT INTO system_logs (level, message, user_id) VALUES
      ('info', 'Система инициализирована', 1)
  `);
  console.log('  ✓ Системные логи');

  console.log('✅ База данных заполнена начальными данными');
}

/**
 * Сброс базы данных (удаление всех таблиц)
 * ОСТОРОЖНО! Удаляет все данные
 */
export function resetDatabase(): void {
  const database = getDatabase();

  console.log('⚠️  ВНИМАНИЕ: Удаление всех данных...');

  database.exec(`
    DROP TABLE IF EXISTS system_logs;
    DROP TABLE IF EXISTS metrics;
    DROP TABLE IF EXISTS stations;
    DROP TABLE IF EXISTS users;
  `);

  console.log('✅ База данных очищена');
}

/**
 * Миграция базы данных (если нужно обновить структуру)
 */
export function migrateDatabase(): void {
  console.log('🔄 Запуск миграций...');
  
  // Проверяем текущую версию БД
  const database = getDatabase();
  
  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const currentVersion = database.prepare('SELECT MAX(version) as version FROM db_version').get() as { version: number | null };
    const version = currentVersion?.version || 0;

    console.log(`  Текущая версия БД: ${version}`);

    // Здесь можно добавить миграции при необходимости
    // if (version < 1) { ... }

    console.log('✅ Миграции применены');
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
    throw error;
  }
}
