# ⚡ БЫСТРЫЙ СТАРТ

## 🎯 Что уже готово (Этап 1):

✅ Структура проекта создана
✅ TypeScript настроен
✅ Express сервер настроен
✅ SQLite конфигурация готова
✅ Система миграций готова
✅ Типы данных определены

---

## 🚀 Запуск за 3 минуты:

### 1️⃣ Установка (30 сек):

```bash
cd backend
npm install
```

### 2️⃣ Настройка .env (1 мин):

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

```env
# ОБЯЗАТЕЛЬНО ЗАПОЛНИТЬ:
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=ваш_токен_из_influxdb_ui
INFLUX_ORG=ваша_организация

# ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ:
JWT_SECRET=смените_на_случайную_строку_32_символа_минимум

# Остальное можно оставить по умолчанию
PORT=3001
NODE_ENV=development
DB_PATH=./data/monitoring.db
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Инициализация БД (30 сек):

```bash
npm run migrate
```

### 4️⃣ Запуск сервера (1 сек):

```bash
npm run dev
```

✅ **Готово!** Сервер работает на http://localhost:3001

---

## ✅ Проверка:

Откройте в браузере:

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

---

## 📦 Что установилось:

### База данных:
- ✅ SQLite в `./data/monitoring.db`
- ✅ 4 таблицы: users, stations, metrics, system_logs

### Начальные данные:
- ✅ **Админ:** `admin` / `admin123`
- ✅ **Юзер:** `user` / `user123`
- ✅ **Станции:** LOGO Лаборатория, LOGO Цех 1
- ✅ **Метрики:** Температура (3 слоя), Влажность

---

## 🎯 Следующие шаги:

Теперь переходим к **Этапу 2-3**: Создание API endpoints

1. **Авторизация** - `POST /api/auth/login`
2. **Пользователи** - CRUD endpoints
3. **Станции** - CRUD endpoints
4. **Метрики** - CRUD endpoints
5. **Данные из InfluxDB** - `POST /api/data/query`
6. **Экспорт** - `POST /api/export/excel`
7. **Логи** - `GET /api/logs`

---

## 🐛 Проблемы?

### "Переменная окружения не установлена"
➡️ Проверьте `.env` файл, все переменные заполнены?

### "EADDRINUSE: порт занят"
➡️ Измените `PORT=3002` в `.env`

### "Cannot find module"
➡️ Запустите `npm install` еще раз

### Ошибка при установке better-sqlite3
➡️ Установите build tools для вашей ОС

---

## 💡 Полезные команды:

```bash
# Разработка (автоперезагрузка при изменениях)
npm run dev

# Сборка TypeScript в JavaScript
npm run build

# Production запуск
npm start

# Пересоздать БД с начальными данными
npm run migrate reset

# Просмотр БД
sqlite3 data/monitoring.db "SELECT * FROM users;"
```

---

## 📚 Документация:

- **Подробная инструкция:** `SETUP.md`
- **README:** `README.md`
- **План разработки:** `../BACKEND_PLAN.md`
- **Структура проекта:** `../PROJECT_STRUCTURE.md`

---

**Готовы к следующему этапу?** ✅

Напишите мне и мы создадим API endpoints для авторизации! 🚀
