# ПЛАН РАЗРАБОТКИ БЭКЕНДА ДЛЯ СИСТЕМЫ ОНЛАЙН-МОНИТОРИНГА

## 📋 АНАЛИЗ ТРЕБОВАНИЙ

### Функциональные возможности:
1. **Авторизация** - JWT токены, роли (admin/user)
2. **InfluxDB интеграция** - чтение данных с фильтрацией и агрегацией
3. **CRUD станций** - управление measurement'ами из InfluxDB
4. **CRUD метрик** - управление field + channel для каждой станции
5. **CRUD пользователей** - только для администраторов
6. **Экспорт в Excel** - на основе фильтров
7. **Логи системы** - запись и чтение событий

### Текущее состояние фронтенда:
- React + TypeScript
- Данные хранятся в localStorage (станции, метрики, пользователи)
- Mock данные для графиков и таблиц
- Фильтры: станция, временной интервал, частота данных, метрики, min/max

---

## 🏗️ АРХИТЕКТУРА БЭКЕНДА

### Технологический стек:

**Backend:**
- **Runtime:** Node.js v18+
- **Framework:** Express.js (быстрая разработка, большая экосистема)
- **Язык:** TypeScript (согласованность с фронтендом)
- **База данных для приложения:** SQLite (легкая настройка) или PostgreSQL (для продакшена)
- **База данных метрик:** InfluxDB v2.x
- **Авторизация:** JWT (jsonwebtoken)
- **Безопасность паролей:** bcrypt
- **Валидация:** express-validator или zod
- **Экспорт Excel:** exceljs
- **Логирование:** winston
- **CORS:** cors middleware

**DevOps:**
- **Process Manager:** PM2 (для продакшена)
- **Environment:** dotenv
- **API документация:** Swagger/OpenAPI (опционально)

### Структура проекта:

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Конфигурация SQLite/PostgreSQL
│   │   ├── influxdb.ts          # Конфигурация InfluxDB
│   │   └── env.ts               # Переменные окружения
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT middleware
│   │   ├── admin.ts             # Проверка роли admin
│   │   ├── validation.ts        # Валидация запросов
│   │   └── errorHandler.ts     # Обработка ошибок
│   │
│   ├── models/
│   │   ├── User.ts              # Модель пользователя
│   │   ├── Station.ts           # Модель станции
│   │   ├── Metric.ts            # Модель метрики
│   │   └── Log.ts               # Модель лога
│   │
│   ├── controllers/
│   │   ├── authController.ts    # Логин/регистрация
│   │   ├── userController.ts    # CRUD пользователей
│   │   ├── stationController.ts # CRUD станций
│   │   ├── metricController.ts  # CRUD метрик
│   │   ├── dataController.ts    # Получение данных из InfluxDB
│   │   ├── exportController.ts  # Экспорт в Excel
│   │   └── logController.ts     # Логи системы
│   │
│   ├── services/
│   │   ├── influxService.ts     # Работа с InfluxDB
│   │   ├── excelService.ts      # Генерация Excel
│   │   └── logService.ts        # Запись логов
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── station.routes.ts
│   │   ├── metric.routes.ts
│   │   ├── data.routes.ts
│   │   ├── export.routes.ts
│   │   └── log.routes.ts
│   │
│   ├── types/
│   │   ├── express.d.ts         # Расширение типов Express
│   │   └── models.ts            # Общие типы
│   │
│   ├── utils/
│   │   ├── logger.ts            # Winston logger
│   │   ├── jwt.ts               # JWT утилиты
│   │   └── validation.ts        # Валидаторы
│   │
│   ├── database/
│   │   ├── migrations/          # Миграции БД
│   │   └── seeds/               # Начальные данные
│   │
│   ├── app.ts                   # Express приложение
│   └── server.ts                # Запуск сервера
│
├── .env.example
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ СТРУКТУРА БАЗЫ ДАННЫХ

### SQLite/PostgreSQL (для приложения):

**Таблица: users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Таблица: stations**
```sql
CREATE TABLE stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name VARCHAR(100) NOT NULL,
  bucket VARCHAR(100) NOT NULL,
  measurement VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Таблица: metrics**
```sql
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id INTEGER NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  field VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  unit VARCHAR(20),
  show_in_chart BOOLEAN DEFAULT TRUE,
  show_in_table BOOLEAN DEFAULT TRUE,
  show_in_export BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);
```

**Таблица: system_logs**
```sql
CREATE TABLE system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level VARCHAR(20) NOT NULL CHECK(level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  user_id INTEGER,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### InfluxDB (для метрик):

**Bucket:** telemetry

**Measurements:** lab, ceh1, etc. (настраиваются через станции)

**Структура данных:**
```
measurement: lab
tags:
  - channel: AI1, AI2, AI3, etc.
fields:
  - температура: float
  - влажность: float
timestamp: RFC3339
```

---

## 🔌 API ENDPOINTS

### 1️⃣ Авторизация

**POST /api/auth/login**
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**POST /api/auth/register** (только для admin)
```json
Request:
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}

Response:
{
  "success": true,
  "message": "Пользователь создан"
}
```

**GET /api/auth/me** (проверка токена)
```json
Response:
{
  "id": 1,
  "username": "admin",
  "role": "admin"
}
```

---

### 2️⃣ Пользователи (только admin)

**GET /api/users** - получить всех пользователей

**POST /api/users** - создать пользователя

**PUT /api/users/:id** - обновить пользователя

**DELETE /api/users/:id** - удалить пользователя

---

### 3️⃣ Станции

**GET /api/stations** - получить все станции
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "displayName": "LOGO Лаборатория",
      "bucket": "telemetry",
      "measurement": "lab",
      "isActive": true
    }
  ]
}
```

**POST /api/stations** - создать станцию (admin)

**PUT /api/stations/:id** - обновить станцию (admin)

**DELETE /api/stations/:id** - удалить станцию (admin)

---

### 4️⃣ Метрики

**GET /api/metrics?stationId=1** - получить метрики станции
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stationId": 1,
      "displayName": "Температура слой 1",
      "field": "температура",
      "channel": "AI1",
      "unit": "°C",
      "showInChart": true,
      "showInTable": true,
      "showInExport": true,
      "isActive": true
    }
  ]
}
```

**POST /api/metrics** - создать метрику (admin)

**PUT /api/metrics/:id** - обновить метрику (admin)

**DELETE /api/metrics/:id** - удалить метрику (admin)

---

### 5️⃣ Данные из InfluxDB

**POST /api/data/query** - получить данные с фильтрами
```json
Request:
{
  "stationId": 1,
  "metricIds": [1, 2, 3],
  "timeRange": "1h",           // 1h, 6h, 1d, 1w, 1m
  "frequency": "1m",           // 1s, 10s, 1m, 5m, 15m, 1h
  "showMin": false,
  "showMax": false
}

Response:
{
  "success": true,
  "data": [
    {
      "time": "2024-01-15T10:00:00Z",
      "metrics": {
        "1": {
          "value": 24.5,
          "min": 24.2,    // если showMin: true
          "max": 24.8     // если showMax: true
        },
        "2": {
          "value": 26.3,
          "min": 26.1,
          "max": 26.5
        }
      }
    }
  ]
}
```

**Логика агрегации:**
- Если frequency = "1m", группируем данные по минутам
- Для каждой группы вычисляем mean (среднее), min, max
- Возвращаем только запрошенные поля

---

### 6️⃣ Экспорт

**POST /api/export/excel** - экспорт в Excel
```json
Request:
{
  "stationId": 1,
  "metricIds": [1, 2, 3],
  "timeRange": "1d",
  "frequency": "1m"
}

Response: (binary file download)
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="export_2024-01-15.xlsx"
```

---

### 7️⃣ Логи

**GET /api/logs?level=error&limit=100** - получить логи
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "level": "error",
      "message": "Ошибка подключения к InfluxDB",
      "username": "admin",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**POST /api/logs** - создать лог
```json
Request:
{
  "level": "info",
  "message": "Пользователь вошел в систему"
}
```

---

## 📝 ПОЭТАПНЫЙ ПЛАН РЕАЛИЗАЦИИ

### ✅ ЭТАП 1: Настройка базового окружения (День 1)

**Цель:** Создать базовую структуру проекта и настроить окружение

**Задачи:**
1. Инициализировать Node.js проект
   ```bash
   mkdir monitoring-backend
   cd monitoring-backend
   npm init -y
   ```

2. Установить зависимости
   ```bash
   npm install express typescript ts-node @types/node @types/express
   npm install cors dotenv bcrypt jsonwebtoken
   npm install @influxdata/influxdb-client exceljs winston
   npm install better-sqlite3
   npm install -D @types/cors @types/bcrypt @types/jsonwebtoken @types/better-sqlite3 nodemon
   ```

3. Создать tsconfig.json
4. Создать структуру папок
5. Настроить .env файл
6. Создать базовый Express сервер

**Результат:** Запущенный сервер на localhost:3001

---

### ✅ ЭТАП 2: База данных и модели (День 1-2)

**Цель:** Настроить SQLite и создать модели

**Задачи:**
1. Создать database.ts для подключения к SQLite
2. Создать миграции для таблиц (users, stations, metrics, logs)
3. Создать seed данные (admin пользователь, тестовые станции)
4. Создать модели с TypeScript типами

**Результат:** Рабочая база данных с начальными данными

---

### ✅ ЭТАП 3: Авторизация (День 2)

**Цель:** Реализовать JWT авторизацию

**Задачи:**
1. Создать auth middleware для проверки токенов
2. Создать admin middleware для проверки роли
3. Реализовать POST /api/auth/login
4. Реализовать GET /api/auth/me
5. Добавить хэширование паролей через bcrypt

**Результат:** Работающая авторизация с ролями

---

### ✅ ЭТАП 4: CRUD пользователей (День 3)

**Цель:** API для управления пользователями

**Задачи:**
1. GET /api/users (только admin)
2. POST /api/users (только admin)
3. PUT /api/users/:id (только admin)
4. DELETE /api/users/:id (только admin)
5. Добавить валидацию данных
6. Логирование действий

**Результат:** Полное управление пользователями

---

### ✅ ЭТАП 5: CRUD станций и метрик (День 3-4)

**Цель:** API для управления станциями и метриками

**Задачи:**
1. Станции:
   - GET /api/stations
   - POST /api/stations (admin)
   - PUT /api/stations/:id (admin)
   - DELETE /api/stations/:id (admin)

2. Метрики:
   - GET /api/metrics?stationId=1
   - POST /api/metrics (admin)
   - PUT /api/metrics/:id (admin)
   - DELETE /api/metrics/:id (admin)

3. Валидация связей (нельзя удалить станцию с метриками)

**Результат:** Управление конфигурацией системы

---

### ✅ ЭТАП 6: Подключение к InfluxDB (День 4-5)

**Цель:** Интеграция с InfluxDB для получения данных

**Задачи:**
1. Настроить подключение к InfluxDB
2. Создать influxService.ts
3. Реализовать построение Flux запросов
4. Добавить агрегацию данных (mean, min, max)
5. Реализовать POST /api/data/query
6. Оптимизация запросов по времени

**Пример Flux запроса:**
```flux
from(bucket: "telemetry")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "lab")
  |> filter(fn: (r) => r._field == "температура")
  |> filter(fn: (r) => r.channel == "AI1")
  |> aggregateWindow(every: 1m, fn: mean)
```

**Результат:** Получение реальных данных из InfluxDB

---

### ✅ ЭТАП 7: Экспорт в Excel (День 5)

**Цель:** Генерация Excel файлов

**Задачи:**
1. Создать excelService.ts
2. Реализовать POST /api/export/excel
3. Форматирование данных (заголовки, стили)
4. Добавить метаданные (дата экспорта, фильтры)

**Структура Excel:**
```
| Время              | Температура слой 1 | Температура слой 2 | Влажность |
|--------------------|--------------------|--------------------|-----------|
| 15.01.2024 10:00   | 24.5 °C           | 26.3 °C           | 45.2 %    |
| 15.01.2024 10:01   | 24.6 °C           | 26.4 °C           | 45.5 %    |
```

**Результат:** Скачивание Excel файлов

---

### ✅ ЭТАП 8: Система логирования (День 6)

**Цель:** Логи системы

**Задачи:**
1. Настроить Winston logger
2. Создать logService.ts
3. Реализовать GET /api/logs
4. Автоматическое логирование ошибок
5. Логирование действий пользователей

**Типы логов:**
- info: вход пользователя, изменение настроек
- warning: неудачная попытка входа
- error: ошибки подключения, ошибки запросов

**Результат:** Полная система логирования

---

### ✅ ЭТАП 9: Интеграция с фронтендом (День 6-7)

**Цель:** Подключить фронтенд к бэкенду

**Задачи:**
1. Настроить CORS
2. Создать API клиент на фронтенде (axios/fetch)
3. Заменить localStorage на API запросы
4. Обновить AuthContext для работы с JWT
5. Обновить все страницы для загрузки данных с бэкенда
6. Добавить обработку ошибок и loading состояния

**Изменения на фронтенде:**
- `AuthContext.tsx` - работа с JWT токенами
- `HomePage.tsx` - загрузка данных из InfluxDB
- `MetricsPage.tsx` - CRUD через API
- `UsersPage.tsx` - CRUD через API
- `ExportPage.tsx` - вызов API экспорта
- `LogsPage.tsx` - загрузка логов

**Результат:** Полностью интегрированное приложение

---

### ✅ ЭТАП 10: Тестирование и оптимизация (День 7)

**Цель:** Проверка и оптимизация

**Задачи:**
1. Тестирование всех API endpoints
2. Проверка безопасности (SQL injection, XSS)
3. Оптимизация запросов к InfluxDB
4. Добавление rate limiting
5. Настройка production окружения

**Результат:** Готовое к продакшену приложение

---

## 🔐 БЕЗОПАСНОСТЬ

1. **Пароли**: хэширование через bcrypt (salt rounds = 10)
2. **JWT**: подписанные токены, срок жизни 24 часа
3. **CORS**: whitelist доменов
4. **Валидация**: проверка всех входных данных
5. **SQL Injection**: использование prepared statements
6. **Rate Limiting**: ограничение запросов (100 req/min)
7. **HTTPS**: для продакшена обязательно

---

## 📊 ОПТИМИЗАЦИЯ InfluxDB

**Проблема:** Большие объемы данных могут замедлить систему

**Решения:**

1. **Агрегация по времени:**
   - 1 час → частота 1 мин (60 точек)
   - 1 день → частота 15 мин (96 точек)
   - 1 неделя → частота 1 час (168 точек)
   - 1 м��сяц → частота 6 часов (120 точек)

2. **Downsampling задачи в InfluxDB:**
   - Создать отдельные buckets для агрегированных данных
   - telemetry_hourly, telemetry_daily

3. **Кэширование:**
   - Redis для часто запрашиваемых данных
   - Кэш на 5 минут для "живых" данных

---

## 🚀 ДЕПЛОЙ

### Development:
```bash
npm run dev
```

### Production:
```bash
# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name monitoring-api

# Nginx reverse proxy
location /api {
  proxy_pass http://localhost:3001;
}
```

---

## 📋 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/monitoring.db

# InfluxDB
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your_influxdb_token
INFLUX_ORG=your_org

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logs
LOG_LEVEL=info
```

---

## 🎯 ИТОГОВЫЙ ЧЕКЛИСТ

### Backend готов когда:
- [ ] Все API endpoints работают
- [ ] Авторизация с JWT токенами
- [ ] Роли admin/user разграничены
- [ ] Подключение к InfluxDB работает
- [ ] Агрегация данных по времени
- [ ] Экспорт в Excel
- [ ] Система логирования
- [ ] CORS настроен
- [ ] Валидация данных
- [ ] Обработка ошибок
- [ ] Production конфигурация

### Frontend готов когда:
- [ ] Авторизация через API
- [ ] Данные загружаются из InfluxDB
- [ ] Станции и метрики из БД
- [ ] Пользователи из БД
- [ ] Экспорт работает
- [ ] Логи отображаются
- [ ] Loading состояния
- [ ] Обработка ошибок

---

## 💡 РЕКОМЕНДАЦИИ

1. **Начните с этапа 1-3** - базовая структура и авторизация
2. **Тестируйте каждый этап** - Postman/Thunder Client
3. **Используйте TypeScript** - для согласованности типов
4. **Документируйте API** - комментарии или Swagger
5. **Версионируйте API** - /api/v1/...
6. **Мониторинг** - логи в файлы, метрики сервера

---

## ❓ ВОПРОСЫ ДЛЯ УТОЧНЕНИЯ

Перед началом разработки:

1. **InfluxDB:**
   - Уже есть настроенный InfluxDB сервер?
   - Какая версия InfluxDB? (1.x или 2.x)
   - Есть ли доступ к токену и организации?
   - Какова структура данных в InfluxDB сейчас?

2. **Окружение:**
   - Где будет деплоиться бэкенд? (VPS, облако, локальный сервер)
   - Какая ОС на сервере?
   - Нужна ли Docker контейнеризация?

3. **База данных:**
   - SQLite достаточно или нужен PostgreSQL?
   - Ожидаемое количество пользователей?

4. **Безопасность:**
   - Нужен ли HTTPS сразу?
   - Двухфакторная авторизация?

---

Давайте обсудим план и начнем с этапа 1! 🚀
