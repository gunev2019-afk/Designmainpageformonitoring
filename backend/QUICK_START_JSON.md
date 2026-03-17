# ⚡ БЫСТРЫЙ СТАРТ (JSON версия)

## 🎯 Что изменилось?

Для быстрого тестирования на Windows мы **временно** используем JSON базу данных вместо SQLite.

✅ **Плюсы:**
- Не требует компиляции native модулей
- Работает сразу без Build Tools
- Легко просматривать данные (обычный JSON файл)
- Подходит для разработки и тестирования

⚠️ **Минусы:**
- Данные хранятся в памяти и файле (медленнее чем SQLite)
- Не подходит для production
- Нет транзакций и сложных запросов

💡 **На production используйте SQLite или PostgreSQL!**

---

## 🚀 Запуск за 2 минуты:

### 1️⃣ Установка (1 мин):

```bash
cd backend

# Удалите старый node_modules если были ошибки
rmdir /s /q node_modules  # Windows
# или rm -rf node_modules  # Linux/Mac

npm install
```

Теперь установка пройдет **БЕЗ ОШИБОК!** (мы убрали better-sqlite3)

### 2️⃣ Настройка .env (30 сек):

```bash
# Если еще не создали
copy .env.example .env    # Windows
# или cp .env.example .env  # Linux/Mac
```

Откройте `.env` и заполните:

```env
# ОБЯЗАТЕЛЬНО ЗАПОЛНИТЬ:
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=ваш_токен_из_influxdb_ui
INFLUX_ORG=ваша_организация

# ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ:
JWT_SECRET=смените_на_случайную_строку_32_символа_минимум

# Остальное по умолчанию
PORT=3001
NODE_ENV=development
DB_PATH=./data/monitoring.db  # Будет создан .json вместо .db
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Инициализация БД (10 сек):

```bash
npm run migrate
```

Будет создан файл `./data/monitoring.json` с начальными данными.

### 4️⃣ Запуск сервера (1 сек):

```bash
npm run dev
```

✅ **Готово!** Сервер работает на http://localhost:3001

---

## ✅ Проверка:

### 1. Откройте браузер:

**http://localhost:3001**

Должны увидеть:

```json
{
  "success": true,
  "message": "Monitoring Backend API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### 2. Health check:

**http://localhost:3001/health**

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-03-17T12:00:00.000Z"
}
```

### 3. Просмотр данных в БД:

Откройте файл `./backend/data/monitoring.json` в любом редакторе!

```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password_hash": "...",
      "role": "admin",
      ...
    }
  ],
  "stations": [...],
  "metrics": [...],
  "system_logs": [...]
}
```

---

## 📊 Что установилось:

### База данных:
- ✅ JSON файл в `./data/monitoring.json`
- ✅ 4 "таблицы": users, stations, metrics, system_logs

### Начальные данные:
- ✅ **Админ:** `admin` / `admin123`
- ✅ **Юзер:** `user` / `user123`
- ✅ **Станции:** LOGO Лаборатория, LOGO Цех 1
- ✅ **Метрики:** Температура (3 слоя), Влажность

---

## 💾 Как работает JSON БД?

```typescript
// Чтение
const users = findAll('users');
const user = findById('users', 1);

// Создание
const newUser = insert('users', {
  username: 'test',
  password_hash: '...',
  role: 'user'
});

// Обновление
update('users', 1, { username: 'newname' });

// Удаление
remove('users', 1);

// Поиск
const admin = findOne('users', u => u.role === 'admin');
const activeStations = findWhere('stations', s => s.is_active);
```

---

## 🔄 Переход на SQLite позже:

Когда будете готовы к production:

1. Установите Build Tools for Visual Studio
2. Измените `package.json`:
   ```json
   "dependencies": {
     "better-sqlite3": "^9.2.2",
     ...
   }
   ```
3. Запустите `npm install`
4. Замените импорты с `jsondb` на `better-sqlite3`
5. Готово!

Или просто разверните на Linux VPS где SQLite работает из коробки! 😉

---

## 🐛 Проблемы?

### "Cannot find module"
➡️ Запустите `npm install` еще раз

### "EADDRINUSE: порт занят"
➡️ Измените `PORT=3002` в `.env`

### "Переменная окружения не установлена"
➡️ Проверьте `.env` файл

### Данные не сохраняются
➡️ Это нормально! JSON БД сохраняется при каждом изменении.
   Проверьте файл `./data/monitoring.json`

---

## 💡 Полезные команды:

```bash
# Разработка (автоперезагрузка)
npm run dev

# Просмотр данных БД
cat data/monitoring.json         # Linux/Mac
type data\monitoring.json        # Windows

# Пересоздать БД с начальными данными
npm run migrate reset

# Production сборка
npm run build
npm start
```

---

## 🎯 Что дальше?

Теперь backend работает! Следующие этапы:

1. ✅ **Базовая структура** - ГОТОВО!
2. ⏳ **Авторизация JWT** - создаем `/api/auth/login`
3. 📋 **CRUD endpoints** - пользователи, станции, метрики
4. 📋 **InfluxDB интеграция** - получение данных
5. 📋 **Экспорт в Excel**
6. 📋 **Интеграция с фронтендом**

---

**Готовы продолжать?** Напишите когда сервер запустится! 🚀

---

## 📝 Заметка для production:

На VPS (Linux) можете сразу использовать нормальный SQLite:
- Установите `better-sqlite3` через npm
- Замените jsondb на SQLite
- Все будет работать без проблем!

**Для тестирования JSON БД более чем достаточно!** ✅
