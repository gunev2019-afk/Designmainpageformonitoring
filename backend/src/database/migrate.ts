/**
 * СКРИПТ МИГРАЦИИ БАЗЫ ДАННЫХ
 * Запуск: npm run migrate
 */

import { initDatabase, seedDatabase, resetDatabase } from '../config/database';
import { validateConfig } from '../config/env';

// Получаем аргумент команды
const command = process.argv[2];

console.log('🔨 Миграция базы данных\n');

try {
  // Проверка конфигурации
  validateConfig();
  console.log('');

  switch (command) {
    case 'reset':
      console.log('⚠️  ВНИМАНИЕ: Сброс базы данных!\n');
      resetDatabase();
      console.log('');
      initDatabase();
      console.log('');
      seedDatabase();
      break;

    case 'seed':
      seedDatabase();
      break;

    default:
      initDatabase();
      console.log('');
      seedDatabase();
      break;
  }

  console.log('\n✅ Миграция завершена успешно!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Ошибка при миграции:', error);
  process.exit(1);
}
