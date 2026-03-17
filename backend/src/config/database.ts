/**
 * КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ
 * Временно используем JSON базу для быстрого тестирования
 * 
 * ⚠️ Это обертка над jsondb.ts для совместимости
 * На production используйте SQLite или PostgreSQL
 */

import {
  getDatabase as getJsonDatabase,
  closeDatabase as closeJsonDatabase,
  initDatabase as initJsonDatabase,
  seedDatabase as seedJsonDatabase,
  resetDatabase as resetJsonDatabase,
  saveDatabase,
  findById,
  findAll,
  findOne,
  findWhere,
  insert,
  update,
  remove,
  getNextId,
} from './jsondb';

/**
 * Получить подключение к базе данных
 */
export function getDatabase(): any {
  return getJsonDatabase();
}

/**
 * Закрыть подключение к БД
 */
export function closeDatabase(): void {
  closeJsonDatabase();
}

/**
 * Инициализация базы данных
 */
export function initDatabase(): void {
  initJsonDatabase();
}

/**
 * Заполнение базы данных начальными данными
 */
export function seedDatabase(): void {
  seedJsonDatabase();
}

/**
 * Сброс базы данных
 */
export function resetDatabase(): void {
  resetJsonDatabase();
}

/**
 * Миграция базы данных
 */
export function migrateDatabase(): void {
  console.log('🔄 Запуск миграций...');
  console.log('ℹ️  JSON база не требует миграций');
  console.log('✅ Миграции применены');
}

// Экспортируем утилиты для работы с данными
export {
  saveDatabase,
  findById,
  findAll,
  findOne,
  findWhere,
  insert,
  update,
  remove,
  getNextId,
};
