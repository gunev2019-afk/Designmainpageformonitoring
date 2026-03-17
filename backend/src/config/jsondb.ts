/**
 * ПРОСТАЯ JSON БАЗА ДАННЫХ
 * Для быстрого тестирования без компиляции native модулей
 * 
 * ⚠️ Это временное решение для разработки!
 * На production используйте SQLite или PostgreSQL
 */

import fs from 'fs';
import path from 'path';
import { config } from './env';

interface Database {
  users: any[];
  stations: any[];
  metrics: any[];
  system_logs: any[];
  _meta: {
    version: number;
    created_at: string;
    updated_at: string;
  };
}

let db: Database | null = null;
const dbPath = config.database.path.replace('.db', '.json');

/**
 * Получить базу данных
 */
export function getDatabase(): Database {
  if (!db) {
    loadDatabase();
  }
  return db!;
}

/**
 * Загрузить базу из файла
 */
function loadDatabase(): void {
  try {
    // Создаем директорию если её нет
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Загружаем данные из файла
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      db = JSON.parse(data);
      console.log(`✅ База данных загружена: ${dbPath}`);
    } else {
      // Создаем новую пустую базу
      db = {
        users: [],
        stations: [],
        metrics: [],
        system_logs: [],
        _meta: {
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      saveDatabase();
      console.log(`✅ Создана новая база данных: ${dbPath}`);
    }
  } catch (error) {
    console.error('❌ Ошибка при загрузке базы данных:', error);
    throw error;
  }
}

/**
 * Сохранить базу в файл
 */
export function saveDatabase(): void {
  if (!db) return;

  try {
    db._meta.updated_at = new Date().toISOString();
    const data = JSON.stringify(db, null, 2);
    fs.writeFileSync(dbPath, data, 'utf-8');
  } catch (error) {
    console.error('❌ Ошибка при сохранении базы данных:', error);
    throw error;
  }
}

/**
 * Закрыть базу данных
 */
export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db = null;
    console.log('🔒 База данных закрыта');
  }
}

/**
 * Инициализация базы данных
 */
export function initDatabase(): void {
  console.log('🔨 Инициализация JSON базы данных...');
  
  const database = getDatabase();
  
  // Проверяем что таблицы существуют
  if (!database.users) database.users = [];
  if (!database.stations) database.stations = [];
  if (!database.metrics) database.metrics = [];
  if (!database.system_logs) database.system_logs = [];
  
  saveDatabase();
  
  console.log('✅ База данных инициализирована');
  console.log(`   📁 Файл: ${dbPath}`);
}

/**
 * Заполнение начальными данными
 */
export function seedDatabase(): void {
  const database = getDatabase();
  
  console.log('🌱 Заполнение базы данных начальными данными...');
  
  // Проверяем, есть ли уже данные
  if (database.users.length > 0) {
    console.log('ℹ️  База данных уже содержит данные, пропускаем seed');
    return;
  }
  
  const bcrypt = require('bcrypt');
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);
  
  // Добавляем пользователей
  database.users = [
    {
      id: 1,
      username: 'admin',
      password_hash: adminPasswordHash,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      username: 'user',
      password_hash: userPasswordHash,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  console.log('  ✓ Пользователи: admin/admin123, user/user123');
  
  // Добавляем станции
  database.stations = [
    {
      id: 1,
      display_name: 'LOGO Лаборатория',
      bucket: 'telemetry',
      measurement: 'lab',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      display_name: 'LOGO Цех 1',
      bucket: 'telemetry',
      measurement: 'ceh1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  console.log('  ✓ Станции: LOGO Лаборатория, LOGO Цех 1');
  
  // Добавляем метрики
  database.metrics = [
    {
      id: 1,
      station_id: 1,
      display_name: 'Температура слой 1',
      field: 'температура',
      channel: 'AI1',
      unit: '°C',
      show_in_chart: true,
      show_in_table: true,
      show_in_export: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      station_id: 1,
      display_name: 'Температура слой 2',
      field: 'температура',
      channel: 'AI2',
      unit: '°C',
      show_in_chart: true,
      show_in_table: true,
      show_in_export: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      station_id: 1,
      display_name: 'Температура слой 3',
      field: 'температура',
      channel: 'AI3',
      unit: '°C',
      show_in_chart: true,
      show_in_table: true,
      show_in_export: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      station_id: 1,
      display_name: 'Влажность',
      field: 'влажность',
      channel: 'AI1',
      unit: '%',
      show_in_chart: true,
      show_in_table: true,
      show_in_export: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  console.log('  ✓ Метрики для станции "LOGO Лаборатория"');
  
  // Добавляем системный лог
  database.system_logs = [
    {
      id: 1,
      level: 'info',
      message: 'Система инициализирована',
      user_id: 1,
      metadata: null,
      created_at: new Date().toISOString(),
    },
  ];
  console.log('  ✓ Системные логи');
  
  saveDatabase();
  
  console.log('✅ База данных заполнена начальными данными');
}

/**
 * Сброс базы данных
 */
export function resetDatabase(): void {
  console.log('⚠️  ВНИМАНИЕ: Удаление всех данных...');
  
  db = {
    users: [],
    stations: [],
    metrics: [],
    system_logs: [],
    _meta: {
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  
  saveDatabase();
  console.log('✅ База данных очищена');
}

/**
 * УТИЛИТЫ ДЛЯ РАБОТЫ С ДАННЫМИ
 */

/**
 * Получить следующий ID для таблицы
 */
export function getNextId(table: keyof Omit<Database, '_meta'>): number {
  const database = getDatabase();
  const items = database[table] as any[];
  
  if (items.length === 0) return 1;
  
  const maxId = Math.max(...items.map((item: any) => item.id || 0));
  return maxId + 1;
}

/**
 * Найти запись по ID
 */
export function findById(table: keyof Omit<Database, '_meta'>, id: number): any | null {
  const database = getDatabase();
  const items = database[table] as any[];
  return items.find((item: any) => item.id === id) || null;
}

/**
 * Найти все записи
 */
export function findAll(table: keyof Omit<Database, '_meta'>): any[] {
  const database = getDatabase();
  return [...(database[table] as any[])];
}

/**
 * Найти запись по условию
 */
export function findOne(
  table: keyof Omit<Database, '_meta'>,
  predicate: (item: any) => boolean
): any | null {
  const database = getDatabase();
  const items = database[table] as any[];
  return items.find(predicate) || null;
}

/**
 * Найти все записи по условию
 */
export function findWhere(
  table: keyof Omit<Database, '_meta'>,
  predicate: (item: any) => boolean
): any[] {
  const database = getDatabase();
  const items = database[table] as any[];
  return items.filter(predicate);
}

/**
 * Создать запись
 */
export function insert(table: keyof Omit<Database, '_meta'>, data: any): any {
  const database = getDatabase();
  const items = database[table] as any[];
  
  const newItem = {
    id: getNextId(table),
    ...data,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
  
  items.push(newItem);
  saveDatabase();
  
  return newItem;
}

/**
 * Обновить запись
 */
export function update(
  table: keyof Omit<Database, '_meta'>,
  id: number,
  data: any
): any | null {
  const database = getDatabase();
  const items = database[table] as any[];
  const index = items.findIndex((item: any) => item.id === id);
  
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...data,
    id, // ID не меняем
    updated_at: new Date().toISOString(),
  };
  
  saveDatabase();
  
  return items[index];
}

/**
 * Удалить запись
 */
export function remove(table: keyof Omit<Database, '_meta'>, id: number): boolean {
  const database = getDatabase();
  const items = database[table] as any[];
  const index = items.findIndex((item: any) => item.id === id);
  
  if (index === -1) return false;
  
  items.splice(index, 1);
  saveDatabase();
  
  return true;
}
