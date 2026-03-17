/**
 * ТОЧКА ВХОДА СЕРВЕРА
 * Запуск Express сервера и инициализация БД
 */

import { createApp } from './app';
import { config, validateConfig } from './config/env';
import { initDatabase, seedDatabase, closeDatabase } from './config/database';

/**
 * Запуск сервера
 */
async function startServer() {
  try {
    console.log('🚀 Запуск Monitoring Backend API...\n');

    // 1. Валидация конфигурации
    validateConfig();
    console.log('');

    // 2. Инициализация базы данных
    initDatabase();
    console.log('');

    // 3. Заполнение начальными данными (если БД пустая)
    seedDatabase();
    console.log('');

    // 4. Создание Express приложения
    const app = createApp();

    // 5. Запуск сервера
    const server = app.listen(config.port, () => {
      console.log('✅ Сервер успешно запущен!\n');
      console.log(`   URL: http://localhost:${config.port}`);
      console.log(`   Окружение: ${config.nodeEnv}`);
      console.log(`   База данных: ${config.database.path}`);
      console.log(`   InfluxDB: ${config.influxdb.url}`);
      console.log('');
      console.log('📚 API Endpoints:');
      console.log(`   GET  /              - Информация об API`);
      console.log(`   GET  /health        - Health check`);
      console.log(`   POST /api/auth/login    - Авторизация ✅`);
      console.log(`   GET  /api/auth/me       - Текущий пользователь ✅`);
      console.log(`   POST /api/auth/logout   - Выход ✅`);
      console.log(`   GET  /api/users         - Список пользователей (admin) ✅`);
      console.log(`   POST /api/users         - Создать пользователя (admin) ✅`);
      console.log('');
      console.log('🔑 Учетные записи:');
      console.log('   admin / admin123 (администратор)');
      console.log('   user / user123 (пользователь)');
      console.log('');
      console.log('💡 Примеры запросов: см. API_EXAMPLES.md');
      console.log('💡 Для остановки сервера нажмите Ctrl+C');
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n⏳ Остановка сервера...');
      
      server.close(() => {
        console.log('🔒 HTTP сервер остановлен');
        closeDatabase();
        console.log('✅ Сервер успешно остановлен');
        process.exit(0);
      });

      // Принудительная остановка через 10 секунд
      setTimeout(() => {
        console.error('⚠️  Принудительная остановка сервера');
        process.exit(1);
      }, 10000);
    };

    // Обработка сигналов остановки
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Запускаем сервер
startServer();