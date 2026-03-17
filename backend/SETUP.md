# 🚀 ИНСТРУКЦИЯ ПО ЗАПУСКУ BACKEND

## ✅ ЭТАП 1: БАЗОВАЯ НАСТРОЙКА (ГОТОВО!)

Мы создали базовую структуру backend:

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts          ✅ Конфигурация окружения
│   │   └── database.ts     ✅ SQLite подключение и миграции
│   ├── types/
│   │   └── models.ts       ✅ TypeScript типы
│   ├── database/
│   │   └── migrate.ts      ✅ Скрипт миграции
│   ├── app.ts              ✅ Express приложение
│   └── server.ts           ✅ Точка входа
├── .env.example            ✅ Пример переменных окружения
├── .gitignore              ✅ Git ignore
├── package.json            ✅ Зависимости
├── tsconfig.json           ✅ TypeScript конфиг
└── README.md               ✅ Документация
```

---

## 📦 ШАГ 1: УСТАНОВКА ЗАВИСИМОСТЕЙ

```bash
cd backend
npm install
```

Это установит все необходимые пакеты:
- Express - веб-фреймворк
- TypeScript - типизация
- better-sqlite3 - SQLite база данных
- bcrypt - хэширование паролей
- jsonwebtoken - JWT токены
- @influxdata/influxdb-client - клиент InfluxDB
- cors - CORS middleware
- и другие...

---

## 🔧 ШАГ 2: НАСТРОЙКА ОКРУЖЕНИЯ

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Откройте `.env` и заполните переменные:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/monitoring.db

# InfluxDB - ВАЖНО! Заполните реальными данными
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=ваш_токен_influxdb_здесь
INFLUX_ORG=ваша_организация_здесь

# JWT - ВАЖНО! Смените секретный ключ
JWT_SECRET=смените_этот_ключ_на_случайную_строку_минимум_32_символа
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Как получить токен InfluxDB:

1. Откройте веб-интерфейс InfluxDB (обычно http://localhost:8086)
2. Войдите в систему
3. Перейдите в **Data → API Tokens**
4. Скопируйте существующий токен или создайте новый
5. Вставьте токен в `.env` файл

---

## 🗄️ ШАГ 3: ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ

Запустите миграцию для создания таблиц и начальных данных:

```bash
npm run migrate
```

Это создаст:
- SQLite базу данных в `./data/monitoring.db`
- Таблицы: users, stations, metrics, system_logs
- Начальные данные:
  - Администратор: `admin` / `admin123`
  - Пользователь: `user` / `user123`
  - Две станции: "LOGO Лаборатория", "LOGO Цех 1"
  - Метрики температуры и влажности

---

## 🚀 ШАГ 4: ЗАПУСК СЕРВЕРА

### Development режим (с автоперезагрузкой):

```bash
npm run dev
```

Сервер запустится на `http://localhost:3001`

### Production режим:

```bash
npm run build
npm start
```

---

## ✅ ПРОВЕРКА РАБОТЫ

### 1. Откройте браузер:

```
http://localhost:3001
```

Должны увидеть JSON ответ:

```json
{
  "success": true,
  "message": "Monitoring Backend API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    ...
  }
}
```

### 2. Health check:

```
http://localhost:3001/health
```

Ответ:

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 3. Проверка через curl:

```bash
curl http://localhost:3001
curl http://localhost:3001/health
```

---

## 🔍 ТЕСТИРОВАНИЕ БАЗЫ ДАННЫХ

Проверьте, что БД создана и заполнена:

```bash
# Установите sqlite3 если нужно
# macOS: brew install sqlite
# Ubuntu: sudo apt-get install sqlite3

# Просмотр данных
sqlite3 data/monitoring.db "SELECT * FROM users;"
sqlite3 data/monitoring.db "SELECT * FROM stations;"
sqlite3 data/monitoring.db "SELECT * FROM metrics;"
```

Должны увидеть:
- 2 пользователя (admin, user)
- 2 станции
- 4 метрики

---

## 📝 ЛОГИ

Логи сервера будут сохраняться в:
- Консоль (в development режиме)
- Файл `./logs/app.log` (будет создан автоматически)

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

### Ошибка: "Переменная окружения ... не установлена"

**Решение:** Проверьте файл `.env`, убедитесь что все переменные заполнены

### Ошибка: "EADDRINUSE: address already in use"

**Решение:** Порт 3001 уже занят. Измените `PORT` в `.env` на другой (например, 3002)

### Ошибка: "Cannot connect to InfluxDB"

**Решение:** 
1. Убедитесь что InfluxDB запущен
2. Проверьте `INFLUX_URL` в `.env`
3. Проверьте что токен действителен

### Ошибка при установке better-sqlite3

**Решение:** Установите build tools:
- Windows: `npm install --global windows-build-tools`
- macOS: Установите Xcode Command Line Tools
- Linux: `sudo apt-get install build-essential`

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

После успешного запуска сервера переходим к **ЭТАПУ 2**:

1. ✅ Базовая структура - ГОТОВО!
2. ⏳ База данных и модели - В ПРОЦЕССЕ
3. 📋 Авторизация JWT - СЛЕДУЮЩИЙ
4. 📋 CRUD пользователей
5. 📋 CRUD станций и метрик
6. 📋 Подключение к InfluxDB
7. 📋 Экспорт в Excel
8. 📋 Система логирования
9. 📋 Интеграция с фронтендом
10. 📋 Тестирование

---

## 📞 ПОМОЩЬ

Если что-то не работает:

1. Проверьте `.env` файл
2. Посмотрите логи в консоли
3. Убедитесь что все зависимости установлены
4. Проверьте версию Node.js (нужна v18+)

```bash
node --version  # должна быть >= 18.0.0
npm --version
```

---

## ✨ ГОТОВО!

Базовая структура backend готова! Сервер запущен и работает.

Можете проверить работу через браузер или Postman:
- `GET http://localhost:3001` - информация об API
- `GET http://localhost:3001/health` - health check

**Следующий шаг:** Создание моделей и контроллеров для авторизации (Этап 2-3) 🚀
