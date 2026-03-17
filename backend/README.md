# Monitoring Backend API

Backend API для системы онлайн-мониторинга инженерных параметров из InfluxDB.

⚠️ **WINDOWS ПОЛЬЗОВАТЕЛИ:** Читайте `README_WINDOWS.md` для быстрого старта!

## 🚀 Быстрый старт

### Для Windows (JSON база):

```bash
cd backend
npm install
copy .env.example .env
# Заполните .env
npm run migrate
npm run dev
```

📚 **Подробнее:** `QUICK_START_JSON.md`

### Для Linux/Mac (SQLite):

```bash
cd backend
npm install
cp .env.example .env
# Заполните .env
npm run migrate
npm run dev
```

📚 **Подробнее:** `SETUP.md`

Сервер запустится на `http://localhost:3001`

### 5. Production сборка

```bash
npm run build
npm start
```

## 📚 Документация API

### Авторизация

**POST** `/api/auth/login`
- Авторизация пользователя
- Body: `{ username, password }`
- Response: `{ token, user }`

**GET** `/api/auth/me`
- Получить информацию о текущем пользователе
- Headers: `Authorization: Bearer <token>`

### Пользователи (только admin)

**GET** `/api/users` - список пользователей

**POST** `/api/users` - создать пользователя

**PUT** `/api/users/:id` - обновить пользователя

**DELETE** `/api/users/:id` - удалить пользователя

### Станции

**GET** `/api/stations` - список станций

**POST** `/api/stations` - создать станцию (admin)

**PUT** `/api/stations/:id` - обновить станцию (admin)

**DELETE** `/api/stations/:id` - удалить станцию (admin)

### Метрики

**GET** `/api/metrics?stationId=1` - список метрик станции

**POST** `/api/metrics` - создать метрику (admin)

**PUT** `/api/metrics/:id` - обновить метрику (admin)

**DELETE** `/api/metrics/:id` - удалить метрику (admin)

### Данные из InfluxDB

**POST** `/api/data/query` - получить данные с фильтрами
```json
{
  "stationId": 1,
  "metricIds": [1, 2, 3],
  "timeRange": "1h",
  "frequency": "1m",
  "showMin": false,
  "showMax": false
}
```

### Экспорт

**POST** `/api/export/excel` - экспорт данных в Excel

### Логи

**GET** `/api/logs?level=error&limit=100` - получить логи системы

**POST** `/api/logs` - создать лог

## 🏗️ Структура проекта

```
backend/
├── src/
│   ├── config/          # Конфигурация (БД, InfluxDB)
│   ├── middleware/      # Middleware (auth, admin, validation)
│   ├── models/          # Модели данных
│   ├── controllers/     # Контроллеры API
│   ├── services/        # Бизнес-логика
│   ├── routes/          # Маршруты API
│   ├── types/           # TypeScript типы
│   ├── utils/           # Утилиты
│   ├── database/        # Миграции и seeds
│   ├── app.ts           # Express приложение
│   └── server.ts        # Точка входа
├── data/                # SQLite база данных
├── logs/                # Логи приложения
└── dist/                # Скомпилированный код
```

## 🔐 Безопасность

- Пароли хэшируются через bcrypt (10 rounds)
- JWT токены с истечением 24 часа
- CORS настроен для указанных доменов
- Валидация всех входных данных
- Role-based access control (admin/user)

## 📊 InfluxDB

Структура д��нных в InfluxDB:

- **Bucket:** telemetry
- **Measurement:** lab, ceh1, и т.д. (настраивается через станции)
- **Fields:** температура, влажность
- **Tags:** channel (AI1, AI2, AI3)

## 🔧 Разработка

### Добавление нового endpoint:

1. Создать контроллер в `src/controllers/`
2. Создать маршрут в `src/routes/`
3. Добавить middleware при необходимости
4. Зарегистрировать роут в `src/app.ts`

### Тестирование API:

Используйте Postman, Thunder Client или curl:

```bash
# Логин
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Получить станции
curl -X GET http://localhost:3001/api/stations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 TODO

- [ ] Базовая настройка (Этап 1) ✓
- [ ] База данных и модели (Этап 2)
- [ ] Авторизация JWT (Этап 3)
- [ ] CRUD пользователей (Этап 4)
- [ ] CRUD станций и метрик (Этап 5)
- [ ] Подключение к InfluxDB (Этап 6)
- [ ] Экспорт в Excel (Этап 7)
- [ ] Система логирования (Этап 8)
- [ ] Интеграция с фронтендом (Этап 9)
- [ ] Тестирование (Этап 10)

## 🚀 Деплой на VPS

```bash
# На VPS установить Node.js и PM2
npm install -g pm2

# Клонировать репозиторий
git clone <your-repo>
cd monitoring/backend

# Установить зависимости
npm install

# Настроить .env
nano .env

# Собрать проект
npm run build

# Запустить с PM2
pm2 start dist/server.js --name monitoring-api

# Настроить автозапуск
pm2 startup
pm2 save
```

## 📞 Поддержка

При возникновении проблем создайте issue в репозитории.