# 🏗️ СТРУКТУРА ПРОЕКТА

Система онлайн-мониторинга инженерных параметров из InfluxDB

---

## 📁 Структура файлов

```
monitoring-system/
│
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Конфигурация
│   │   ├── controllers/       # Контроллеры API
│   │   ├── middleware/        # Middleware (auth, validation)
│   │   ├── models/            # Модели данных
│   │   ├── routes/            # Роуты API
│   │   ├── services/          # Бизнес-логика
│   │   ├── types/             # TypeScript типы
│   │   ├── utils/             # Утилиты
│   │   ├── database/          # Миграции БД
│   │   ├── app.ts             # Express приложение
│   │   └── server.ts          # Точка входа
│   │
│   ├── data/                  # SQLite база данных
│   ├── logs/                  # Логи приложения
│   ├── .env                   # Переменные окружения (не в git)
│   ├── .env.example           # Пример переменных
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── README.md              # Документация backend
│   └── SETUP.md               # Инструкция по запуску
│
├── src/                       # Frontend (React + TypeScript)
│   ├── app/
│   │   ├── components/       # React компоненты
│   │   ├── pages/            # Страницы приложения
│   │   ├── context/          # React Context (Auth, Theme)
│   │   └── App.tsx           # Главный компонент
│   │
│   ├── imports/              # Импорты из Figma
│   └── styles/               # CSS стили
│
├── BACKEND_PLAN.md           # План разработки backend
├── PROJECT_STRUCTURE.md      # Этот файл
└── package.json              # Frontend зависимости
```

---

## 🔧 Технологии

### Backend:
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Язык:** TypeScript
- **База данных (приложение):** SQLite (better-sqlite3)
- **База данных (метрики):** InfluxDB v2.x
- **Авторизация:** JWT (jsonwebtoken)
- **Безопасность:** bcrypt
- **Экспорт:** ExcelJS
- **Логирование:** Winston

### Frontend:
- **Framework:** React 18
- **Язык:** TypeScript
- **Роутинг:** React Router v7
- **UI:** Tailwind CSS v4
- **Компоненты:** Radix UI
- **Графики:** Recharts
- **Иконки:** Lucide React

---

## 🚀 Запуск проекта

### Backend:

```bash
# Перейти в папку backend
cd backend

# Установить зависимости
npm install

# Настроить .env файл
cp .env.example .env
# Отредактируйте .env и заполните переменные

# Инициализировать базу данных
npm run migrate

# Запустить в режиме разработки
npm run dev
```

Backend запустится на `http://localhost:3001`

### Frontend:

```bash
# Установить зависимости (если еще не установлены)
npm install

# Запустить в режиме разработки
npm run dev
```

Frontend запустится на `http://localhost:5173`

---

## 📊 База данных

### SQLite (для приложения):

**Таблицы:**
- `users` - пользователи системы
- `stations` - станции мониторинга
- `metrics` - метрики станций
- `system_logs` - логи системы

**Начальные данные:**
- Администратор: `admin` / `admin123`
- Пользователь: `user` / `user123`
- 2 станции с метриками

### InfluxDB (для метрик):

**Структура:**
- **Bucket:** telemetry
- **Measurement:** lab, ceh1, и т.д.
- **Fields:** температура, влажность
- **Tags:** channel (AI1, AI2, AI3)

---

## 🔐 Авторизация

Система использует JWT токены:

1. Пользователь вводит логин/пароль на фронтенде
2. Фронтенд отправляет `POST /api/auth/login` на backend
3. Backend проверяет пароль (bcrypt)
4. Backend возвращает JWT токен
5. Фронтенд сохраняет токен в localStorage
6. Все запросы к API отправляются с заголовком `Authorization: Bearer <token>`

**Роли:**
- `admin` - полный доступ (включая управление пользователями и метриками)
- `user` - ограниченный доступ (просмотр данных и экспорт)

---

## 📡 API Endpoints

### Авторизация:
- `POST /api/auth/login` - авторизация
- `GET /api/auth/me` - получить текущего пользователя

### Пользователи (только admin):
- `GET /api/users` - список пользователей
- `POST /api/users` - создать пользователя
- `PUT /api/users/:id` - обновить пользователя
- `DELETE /api/users/:id` - удалить пользователя

### Станции:
- `GET /api/stations` - список станций
- `POST /api/stations` - создать станцию (admin)
- `PUT /api/stations/:id` - обновить станцию (admin)
- `DELETE /api/stations/:id` - удалить станцию (admin)

### Метрики:
- `GET /api/metrics?stationId=1` - метрики станции
- `POST /api/metrics` - создать метрику (admin)
- `PUT /api/metrics/:id` - обновить метрику (admin)
- `DELETE /api/metrics/:id` - удалить метрику (admin)

### Данные:
- `POST /api/data/query` - получить данные из InfluxDB

### Экспорт:
- `POST /api/export/excel` - экспорт в Excel

### Логи:
- `GET /api/logs` - получить логи
- `POST /api/logs` - создать лог

---

## 🎯 Этапы разработки

- [x] **Этап 1:** Базовая настройка backend ✅
- [ ] **Этап 2:** База данных и модели
- [ ] **Этап 3:** Авторизация JWT
- [ ] **Этап 4:** CRUD пользователей
- [ ] **Этап 5:** CRUD станций и метрик
- [ ] **Этап 6:** Подключение к InfluxDB
- [ ] **Этап 7:** Экспорт в Excel
- [ ] **Этап 8:** Система логирования
- [ ] **Этап 9:** Интеграция с фронтендом
- [ ] **Этап 10:** Тестирование и деплой

---

## 🌐 Деплой на VPS

### Требования:
- Ubuntu 20.04+ или CentOS 7+
- Node.js v18+
- InfluxDB v2.x
- Nginx (для reverse proxy)
- PM2 (для управления процессами)

### Шаги деплоя:

1. **Клонировать репозиторий:**
```bash
git clone <your-repo-url>
cd monitoring-system
```

2. **Установить зависимости:**
```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ..
npm install
npm run build
```

3. **Настроить .env:**
```bash
cd backend
cp .env.example .env
nano .env  # Заполнить production данные
```

4. **Запустить backend с PM2:**
```bash
pm2 start dist/server.js --name monitoring-api
pm2 save
pm2 startup
```

5. **Настроить Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/monitoring-system/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Настроить SSL (Let's Encrypt):**
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📝 Полезные команды

### Backend:
```bash
cd backend

# Разработка
npm run dev

# Сборка
npm run build

# Production
npm start

# Миграция БД
npm run migrate

# Сброс БД (осторожно!)
npm run migrate reset
```

### Frontend:
```bash
# Разработка
npm run dev

# Сборка
npm run build

# Preview production build
npm run preview
```

### PM2 (production):
```bash
pm2 list                    # Список процессов
pm2 logs monitoring-api     # Логи
pm2 restart monitoring-api  # Перезапуск
pm2 stop monitoring-api     # Остановка
pm2 delete monitoring-api   # Удаление
```

---

## 🔍 Мониторинг

### Логи backend:
```bash
tail -f backend/logs/app.log
```

### Логи PM2:
```bash
pm2 logs monitoring-api
```

### Статус системы:
```bash
# Backend health check
curl http://localhost:3001/health

# InfluxDB health
curl http://localhost:8086/health
```

---

## 🐛 Troubleshooting

### Backend не запускается:
1. Проверьте `.env` файл
2. Убедитесь что порт 3001 свободен
3. Проверьте что InfluxDB запущен

### Frontend не подключается к backend:
1. Проверьте CORS настройки в backend `.env`
2. Убедитесь что backend запущен
3. Проверьте URL API в frontend

### InfluxDB ошибки:
1. Проверьте токен в `.env`
2. Убедитесь что bucket существует
3. Проверьте права доступа токена

---

## 📚 Документация

- **Backend API:** см. `/backend/README.md`
- **План разработки:** см. `/BACKEND_PLAN.md`
- **Инструкция по запуску:** см. `/backend/SETUP.md`

---

## 🤝 Git Workflow

```bash
# Создать ветку для новой фичи
git checkout -b feature/название-фичи

# Коммит изменений
git add .
git commit -m "Описание изменений"

# Пуш в репозиторий
git push origin feature/название-фичи

# После ревью - merge в main
```

---

## ⚡ Production Checklist

Перед деплоем на production убедитесь:

- [ ] `.env` файлы правильно настроены
- [ ] `JWT_SECRET` изменен на случайную строку
- [ ] `NODE_ENV=production`
- [ ] HTTPS настроен
- [ ] Firewall настроен (открыты нужные порты)
- [ ] Backup базы данных настроен
- [ ] Мониторинг логов настроен
- [ ] PM2 автозапуск настроен
- [ ] Nginx reverse proxy настроен

---

Проект готов к разработке! 🚀
