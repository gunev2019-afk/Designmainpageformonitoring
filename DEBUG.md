# 🐛 Диагностика проблем

## Проблема 1: Сразу кидает на главную без авторизации

**Причина:** Токен сохраняется в localStorage браузера.

### Решение:

#### Способ 1: Очистить localStorage в консоли браузера

1. Откройте сайт (http://localhost:5173)
2. Нажмите **F12** (откроется DevTools)
3. Перейдите на вкладку **Console**
4. Введите и нажмите Enter:

```javascript
localStorage.clear()
location.reload()
```

#### Способ 2: Кнопка "Выйти"

1. В правом верхнем углу нажмите кнопку **"Выйти"**
2. Вас перенаправит на страницу входа

#### Способ 3: Очистка в настройках браузера

**Chrome/Edge:**
1. F12 → Application → Storage → Local Storage
2. Удалите все записи

**Firefox:**
1. F12 → Storage → Local Storage
2. Удалите все записи

---

## Проблема 2: На графиках ничего не отображается

### Шаг 1: Откройте консоль браузера

1. Нажмите **F12**
2. Перейдите на вкладку **Console**
3. Обновите страницу

Вы должны увидеть логи:
```
📊 Текущие значения: {1: 22.5, 2: 23.1, ...}
📥 Запрос данных: {stationId: 1, metricIds: [1,2,3], ...}
📈 Получены данные: {success: true, data: [...]}
✅ Данных получено: 50 записей
🔍 Первая запись: {timestamp: "...", metric_1: 22.5, ...}
```

### Шаг 2: Проверьте Network

1. F12 → Network
2. Обновите страницу
3. Найдите запрос `/api/data/history`
4. Кликните на него → Response

**Должно быть:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-03-17T12:30:00Z",
      "metric_1": 22.5,
      "metric_2": 23.1,
      ...
    }
  ]
}
```

**Если `data: []` (пустой массив):**
- ❌ В InfluxDB нет данных за выбранный период
- ❌ Неправильные параметры запроса (bucket, measurement, field, channel)

---

## Диагностика по логам:

### ❌ Если в консоли:
```
❌ Нет данных или ошибка: {success: false, error: "..."}
```

**Причина:** Backend не может получить данные из InfluxDB

**Проверьте:**
1. InfluxDB запущен: http://localhost:8086
2. Backend запущен: должно быть "🚀 Сервер запущен на порту 3001"
3. В backend логах ищите ошибки InfluxDB

---

### ❌ Если в консоли:
```
✅ Данных получено: 0 записей
```

**Причина:** InfluxDB вернул пустой результат

**Проверьте:**

#### 1. Есть ли данные в InfluxDB?

Откройте http://localhost:8086 → Data Explorer:

```flux
from(bucket: "telemetry")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "lab")
  |> filter(fn: (r) => r._field == "температура" or r._field == "влажность")
```

Если нет данных → нужно добавить данные в InfluxDB!

#### 2. Правильные ли параметры станции?

В Console браузера проверьте:
```
📥 Запрос данных: {stationId: 1, metricIds: [1, 2, 3], ...}
```

Затем в DevTools → Network → `/api/stations/1`:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bucket": "telemetry",
    "measurement": "lab",
    ...
  }
}
```

Проверьте что `bucket` и `measurement` совпадают с вашими данными в InfluxDB!

#### 3. Правильные ли параметры метрик?

Network → `/api/metrics`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "field": "температура",
      "channel": "AI1",
      ...
    }
  ]
}
```

Проверьте что `field` и `channel` совпадают с тегами в InfluxDB!

---

## 🎯 Быстрая проверка:

### 1. Backend работает?
```bash
curl http://localhost:3001/api/health
```

Должно быть: `{"success": true}`

### 2. InfluxDB работает?
```bash
curl http://localhost:8086/health
```

Должно быть: `{"status": "pass"}`

### 3. Есть станции?
```bash
curl http://localhost:3001/api/stations
```

### 4. Есть метрики?
```bash
curl http://localhost:3001/api/metrics
```

### 5. Есть данные?
```bash
curl "http://localhost:3001/api/data/history?stationId=1&metricIds=1,2,3&timeRange=1h&frequency=1m"
```

---

## 📝 Чек-лист:

- [ ] ✅ Backend запущен (npm run dev)
- [ ] ✅ InfluxDB запущен (http://localhost:8086)
- [ ] ✅ Создана станция с правильным bucket/measurement
- [ ] ✅ Созданы метрики с правильным field/channel
- [ ] ✅ В InfluxDB есть данные за последний час
- [ ] ✅ В консоли браузера видны логи "📊 Текущие значения"
- [ ] ✅ В консоли браузера видны логи "✅ Данных получено"

---

## 🆘 Если ничего не помогает:

Пришлите скриншоты:
1. Console в браузере (F12 → Console)
2. Network → `/api/data/history` → Response
3. Backend terminal (логи сервера)
4. InfluxDB Data Explorer с результатом запроса
