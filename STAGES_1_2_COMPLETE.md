# ✅ ЭТАПЫ 1+2 ЗАВЕРШЕНЫ: Станции + InfluxDB интеграция

## 🎯 Что сделано

### Backend (Node.js + Express + TypeScript)

#### 1. API роуты для станций (`/backend/src/routes/stations.routes.ts`)
- ✅ `GET /api/stations` - Получить все станции
- ✅ `GET /api/stations/:id` - Получить станцию по ID
- ✅ `POST /api/stations` - Создать станцию (только admin)
- ✅ `PUT /api/stations/:id` - Обновить станцию (только admin)
- ✅ `DELETE /api/stations/:id` - Удалить станцию (только admin)

#### 2. API роуты для метрик (`/backend/src/routes/metrics.routes.ts`)
- ✅ `GET /api/metrics` - Получить все метрики (с фильтром по `?stationId=N`)
- ✅ `GET /api/metrics/:id` - Получить метрику по ID
- ✅ `POST /api/metrics` - Создать метрику (только admin)
- ✅ `PUT /api/metrics/:id` - Обновить метрику (только admin)
- ✅ `DELETE /api/metrics/:id` - Удалить метрику (только admin)

#### 3. InfluxDB сервис (`/backend/src/services/influxdb.service.ts`)
- ✅ Подключение к InfluxDB 2.x
- ✅ `queryInfluxData()` - Запрос исторических данных с агрегацией
- ✅ `queryCurrentValues()` - Запрос последних значений метрик
- ✅ `testInfluxConnection()` - Проверка подключения к InfluxDB
- ✅ Поддержка временных интервалов: 1h, 6h, 1d, 1w, 1m
- ✅ Поддержка частот: 1s, 10s, 1m, 5m, 15m, 1h

#### 4. API роуты для данных (`/backend/src/routes/data.routes.ts`)
- ✅ `GET /api/data/current/:stationId` - Текущие значения метрик
- ✅ `POST /api/data/history` - Исторические данные с фильтрами
- ✅ `GET /api/data/health` - Проверка подключения к InfluxDB

#### 5. База данных
- ✅ Таблицы `stations` и `metrics` уже добавлены в JSON DB
- ✅ Seed данные включают:
  - Станция "LOGO Лаборатория" (bucket: telemetry, measurement: lab)
  - Станция "LOGO Цех 1" (bucket: telemetry, measurement: ceh1)
  - Метрики: Температура AI1/AI2/AI3, Влажность AI1

---

### Frontend (React + TypeScript)

#### 1. API клиент (`/src/app/utils/api.ts`)
- ✅ Типы данных: `Station`, `Metric`, `TimeRange`, `DataFrequency`
- ✅ CRUD для станций: `getStations()`, `createStation()`, `updateStation()`, `deleteStation()`
- ✅ CRUD для метрик: `getMetrics()`, `createMetric()`, `updateMetric()`, `deleteMetric()`
- ✅ Данные из InfluxDB: `getCurrentValues()`, `getHistoryData()`, `checkInfluxHealth()`

#### 2. Страница управления станциями (`/src/app/pages/StationsPage.tsx`)
- ✅ Двухколоночный интерфейс:
  - **Левая колонка**: Список станций с кнопками создать/редактировать/удалить
  - **Правая колонка**: Метрики выбранной станции
- ✅ Диалоги создания/редактирования станций и метрик
- ✅ Настройка параметров метрик:
  - `show_in_chart` - показывать на графиках
  - `show_in_table` - показывать в таблице
  - `show_in_export` - доступно для экспорта
  - `is_active` - активность метрики
- ✅ Доступно только администраторам

#### 3. Главная страница (`/src/app/pages/HomePage.tsx`)
- ✅ Интеграция с реальным API вместо mock-данных
- ✅ Загрузка станций и метрик при старте
- ✅ Автообновление данных каждые 10 секунд
- ✅ Отображение текущих значений метрик
- ✅ Построение графиков на основе исторических данных
- ✅ Фильтрация по временным интервалам и частоте

#### 4. Панель фильтров (`/src/app/components/FiltersPanel.tsx`)
- ✅ Выбор станции из списка активных станций
- ✅ Временные интервалы: 1 час, 6 часов, 1 день, 1 неделя, 1 месяц
- ✅ Частота данных: 1 сек, 10 сек, 1 мин, 5 мин, 15 мин, 1 час
- ✅ Выбор видимых метрик (чекбоксы)
- ✅ Опции Min/Max для дополнительной аналитики

#### 5. Роутинг
- ✅ Добавлен маршрут `/stations` (только для админов)
- ✅ Обновлен Header: добавлена вкладка "Станции"

---

## 🚀 Как запустить

### 1. Настройка Backend

#### Проверьте файл `.env` в папке `/backend`:

```env
# Сервер
PORT=3001
NODE_ENV=development

# InfluxDB (ОБЯЗАТЕЛЬНО ЗАПОЛНИТЕ!)
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=ваш_токен_influxdb_здесь
INFLUX_ORG=ваша_организация

# JWT
JWT_SECRET=your-secret-key-min-32-chars-long-please-change-this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# База данных
DB_PATH=./data/monitoring.json
```

#### Запустите backend:

```bash
cd backend
npm run dev
```

Backend должен запуститься на `http://localhost:3001`

### 2. Запустите Frontend

```bash
npm run dev
```

Frontend должен запуститься на `http://localhost:5173`

---

## 🧪 Тестирование

### Шаг 1: Авторизация
1. Откройте `http://localhost:5173/login`
2. Войдите как **admin / admin123**

### Шаг 2: Управление станциями
1. Перейдите на вкладку **"Станции"** (доступно только админу)
2. Вы должны увидеть 2 предустановленные станции:
   - **LOGO Лаборатория** (bucket: telemetry, measurement: lab)
   - **LOGO Цех 1** (bucket: telemetry, measurement: ceh1)

### Шаг 3: Просмотр и редактирование метрик
1. Выберите станцию "LOGO Лаборатория"
2. В правой колонке увидите метрики:
   - Температура слой 1 (Field: температура, Channel: AI1)
   - Температура слой 2 (Field: температура, Channel: AI2)
   - Температура слой 3 (Field: температура, Channel: AI3)
   - Влажность (Field: влажность, Channel: AI1)
3. Попробуйте:
   - ✏️ **Изменить метрику**: нажмите "Изменить"
   - ➕ **Создать метрику**: нажмите "Добавить"
   - 🗑️ **Удалить метрику**: нажмите "Удалить"

### Шаг 4: Создание новой станции
1. Нажмите "Добавить" в левой колонке
2. Заполните форму:
   - **Название**: Моя станция
   - **Bucket**: telemetry
   - **Measurement**: mylab
   - **Активна**: ✅
3. Нажмите "Сохранить"
4. Добавьте метрики для новой станции

### Шаг 5: Главная страница - мониторинг
1. Перейдите на вкладку **"Главная"**
2. Проверьте что:
   - ✅ Данные загружаются из InfluxDB
   - ✅ Отображаются текущие значения метрик
   - ✅ Графики строятся на основе исторических данных
   - ✅ Работает автообновление каждые 10 секунд

### Шаг 6: Фильтры
1. В правой панели попробуйте:
   - Изменить **временной интервал** (1 час → 1 день)
   - Изменить **частоту данных** (1 мин → 5 мин)
   - Включить/выключить **метрики** (чекбоксы)
   - Включить опции **Показать минимум** / **Показать максимум**
2. Нажмите "Применить фильтры"

---

## 📊 Структура данных InfluxDB

Убедитесь что ваш InfluxDB содержит данные в формате:

```
Bucket: telemetry
Measurement: lab
Tags:
  - channel: AI1 | AI2 | AI3
Fields:
  - температура: <float>
  - влажность: <float>
```

Пример Flux запроса:

```flux
from(bucket: "telemetry")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "lab")
  |> filter(fn: (r) => r["_field"] == "температура")
  |> filter(fn: (r) => r["channel"] == "AI1")
  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
```

---

## ✅ API Endpoints (для тестирования)

### Станции

```bash
# Получить все станции
GET http://localhost:3001/api/stations
Authorization: Bearer <ваш_токен>

# Создать станцию (admin only)
POST http://localhost:3001/api/stations
Content-Type: application/json
Authorization: Bearer <ваш_токен>
{
  "display_name": "Тестовая станция",
  "bucket": "telemetry",
  "measurement": "test",
  "is_active": true
}
```

### Метрики

```bash
# Получить метрики станции
GET http://localhost:3001/api/metrics?stationId=1
Authorization: Bearer <ваш_токен>

# Создать метрику (admin only)
POST http://localhost:3001/api/metrics
Content-Type: application/json
Authorization: Bearer <ваш_токен>
{
  "station_id": 1,
  "display_name": "Новая метрика",
  "field": "температура",
  "channel": "AI4",
  "unit": "°C",
  "show_in_chart": true,
  "show_in_table": true,
  "show_in_export": true,
  "is_active": true
}
```

### Данные из InfluxDB

```bash
# Текущие значения
GET http://localhost:3001/api/data/current/1
Authorization: Bearer <ваш_токен>

# Исторические данные
POST http://localhost:3001/api/data/history
Content-Type: application/json
Authorization: Bearer <ваш_токен>
{
  "stationId": 1,
  "metricIds": [1, 2, 3],
  "timeRange": "1h",
  "frequency": "1m"
}

# Проверка InfluxDB
GET http://localhost:3001/api/data/health
Authorization: Bearer <ваш_токен>
```

---

## 🎨 UI Компоненты

Используемые UI компоненты из shadcn/ui:
- ✅ Button
- ✅ Card
- ✅ Dialog
- ✅ Input
- ✅ Label
- ✅ Switch
- ✅ Badge
- ✅ Select (native)

Иконки из lucide-react:
- ✅ Server, Activity, Database, Edit2, Trash2, PlusCircle
- ✅ MapPin, Clock, Settings, TrendingUp, TrendingDown
- ✅ RefreshCw

---

## 🐛 Возможные проблемы

### Backend не запускается
1. Проверьте `.env` файл - все обязательные переменные заполнены?
2. Проверьте `INFLUX_TOKEN` - корректный ли токен?
3. Запустите `npm run check` для диагностики

### Frontend не показывает данные
1. Откройте DevTools Console - есть ли ошибки?
2. Проверьте что backend запущен на порту 3001
3. Проверьте что вы авторизованы (токен в localStorage)

### InfluxDB недоступен
1. Проверьте что InfluxDB запущен
2. Проверьте URL в `.env`: `INFLUX_URL=http://localhost:8086`
3. Проверьте токен доступа
4. Используйте endpoint `/api/data/health` для диагностики

### Нет данных на графиках
1. Убедитесь что в InfluxDB есть данные за выбранный период
2. Проверьте что bucket/measurement/field/channel совпадают
3. Попробуйте выбрать больший временной интервал (например, 1 день)

---

## 📝 Следующие этапы

### ✅ Готово:
- [x] Этап 1: Управление станциями и метриками
- [x] Этап 2: InfluxDB интеграция

### 🔜 Далее:
- [ ] Этап 3: Улучшение главной страницы (графики, карточки, индикаторы)
- [ ] Этап 4: Страница экспорта (CSV/Excel)
- [ ] Этап 5: Страница логов
- [ ] Этап 6: Настройки и алерты

---

## 🎉 Готово!

Система мониторинга теперь имеет:
- ✅ Полнофункциональное управление станциями и метриками
- ✅ Интеграцию с InfluxDB 2.x
- ✅ Реальные данные вместо mock-данных
- ✅ Автообновление в реальном времени
- ✅ Гибкую систему фильтров

**Приятной работы! 🚀**
