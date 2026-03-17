# 📋 ЧТО СМОТРЕТЬ В КОНСОЛИ БРАУЗЕРА

## 🔍 Откройте консоль:
1. Нажмите **F12**
2. Вкладка **Console**
3. **Обновите страницу** (F5 или Ctrl+R)

---

## ✅ ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ (когда все работает):

### 1. Проверка авторизации:
```
🔐 AuthContext: Инициализация проверки токена...
🔐 AuthContext: Токен в localStorage: ЕСТЬ
🔐 AuthContext: Проверяем валидность токена...
🔐 AuthContext: Ответ getCurrentUser: {success: true, data: {...}}
✅ AuthContext: Токен валидный, пользователь: admin
🔐 AuthContext: Завершение инициализации, isLoading = false
```

### 2. ProtectedRoute:
```
🛡️ ProtectedRoute: {isAuthenticated: true, isLoading: false}
🛡️ ProtectedRoute: Доступ разрешен
```

### 3. HomePage:
```
🏠 HomePage render: {
  stationsCount: 1,
  metricsCount: 3,
  selectedStation: "Лаборатория 1",
  availableMetricsCount: 3,
  selectedMetricIds: [1, 2, 3],
  visibleMetricNames: ["Температура канал 1", "Температура канал 2", "Влажность"],
  chartDataLength: 50
}
```

### 4. Загрузка данных:
```
📊 Текущие значения: {1: 22.5, 2: 23.1, 3: 45.2}
📥 Запрос данных: {stationId: 1, metricIds: [1, 2, 3], timeRange: "1h", frequency: "1m"}
📈 Получены данные: {success: true, data: [...]}
✅ Данных получено: 50 записей
🔍 Первая запись: {timestamp: "2026-03-17T12:30:00Z", metric_1: 22.5, metric_2: 23.1, metric_3: 45.2}
```

### 5. MonitoringChart:
```
📊 MonitoringChart render: {
  dataLength: 50,
  visibleMetrics: ["Температура канал 1", "Температура канал 2", "Влажность"],
  metricsCount: 3,
  visibleMetricObjects: 3,
  firstDataPoint: {timestamp: "...", metric_1: 22.5, ...}
}
🌡️ Температурных метрик: 2
💧 Влажностных метрик: 1
```

---

## ❌ ПРОБЛЕМЫ И ЧТО ДЕЛАТЬ:

### ❌ Проблема 1: НЕТ ТОКЕНА
```
🔐 AuthContext: Токен в localStorage: НЕТ
ℹ️ AuthContext: Токена нет, пользователь не авторизован
🛡️ ProtectedRoute: {isAuthenticated: false, isLoading: false}
🛡️ ProtectedRoute: Перенаправление на /login
```

**✅ РЕШЕНИЕ:** Это ПРАВИЛЬНО! Вы должны увидеть страницу входа.

---

### ❌ Проблема 2: ТОКЕН НЕВАЛИДНЫЙ
```
🔐 AuthContext: Токен в localStorage: ЕСТЬ
🔐 AuthContext: Проверяем валидность токена...
❌ AuthContext: Токен невалидный, удаляем
🛡️ ProtectedRoute: Перенаправление на /login
```

**✅ РЕШЕНИЕ:**
```javascript
localStorage.clear()
location.reload()
```

---

### ❌ Проблема 3: BACKEND НЕ РАБОТАЕТ
```
🔐 AuthContext: Проверяем валидность токена...
❌ AuthContext: Ошибка проверки токена: Error: ...
```

**✅ РЕШЕНИЕ:**
1. Проверьте backend: `cd backend && npm run dev`
2. Должно быть: "🚀 Сервер запущен на порту 3001"

---

### ❌ Проблема 4: НЕТ СТАНЦИЙ
```
🏠 HomePage render: {stationsCount: 0, ...}
```

**✅ РЕШЕНИЕ:**
Перейдите в **Станции** → **Создать станцию**

---

### ❌ Проблема 5: НЕТ МЕТРИК
```
🏠 HomePage render: {
  stationsCount: 1,
  metricsCount: 0,
  availableMetricsCount: 0,
  ...
}
```

**✅ РЕШЕНИЕ:**
Перейдите в **Станции** → выберите станцию → **Добавить метрику**

---

### ❌ Проблема 6: ДАННЫХ НЕТ (InfluxDB пустой)
```
✅ Данных получено: 0 записей
📊 MonitoringChart render: {dataLength: 0, ...}
```

**✅ РЕШЕНИЕ:**
1. Откройте http://localhost:8086 → Data Explorer
2. Выполните запрос:
```flux
from(bucket: "telemetry")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "lab")
  |> limit(n: 10)
```

**Если пусто** → Нужно добавить данные в InfluxDB!

**Если есть данные** → Проверьте параметры станции:
- Network → `/api/stations/1` → Response
- `bucket` и `measurement` должны совпадать!

---

### ❌ Проблема 7: МЕТРИКИ НЕ ВЫБРАНЫ
```
🏠 HomePage render: {
  selectedMetricIds: [],
  visibleMetricNames: [],
  chartDataLength: 0
}
```

**✅ РЕШЕНИЕ:**
В правой панели **"Фильтры"**:
1. Отметьте галочками метрики
2. Нажмите **"Применить фильтры"**

---

### ❌ Проблема 8: ДАННЫЕ ЕСТЬ, НО ГРАФИК ПУСТОЙ
```
✅ Данных получено: 50 записей
🔍 Первая запись: {timestamp: "...", metric_1: 22.5, ...}
📊 MonitoringChart render: {dataLength: 50, visibleMetricObjects: 0}
🌡️ Температурных метрик: 0
💧 Влажностных метрик: 0
```

**✅ РЕШЕНИЕ:**
Проблема с фильтрацией метрик. Проверьте:
```
🏠 HomePage render: {
  availableMetricsCount: ..., // должно быть > 0
  visibleMetricNames: [...], // должен быть массив
}
```

Если `availableMetricsCount: 0`:
- Метрики не привязаны к станции
- Проверьте Станции → Метрики → station_id

---

## 🎯 БЫСТРАЯ ДИАГНОСТИКА:

### Шаг 1: Авторизация работает?
Ищите: `✅ AuthContext: Токен валидный, пользователь: admin`

### Шаг 2: Есть станции?
Ищите: `stationsCount: 1` (или больше)

### Шаг 3: Есть метрики?
Ищите: `metricsCount: 3` (или больше)

### Шаг 4: Метрики выбраны?
Ищите: `selectedMetricIds: [1, 2, 3]`

### Шаг 5: Данные загружены?
Ищите: `✅ Данных получено: 50 записей`

### Шаг 6: Гр��фик отображается?
Ищите: `🌡️ Температурных метрик: 2` (или больше)

---

## 🆘 Если логов вообще НЕТ:

1. Откройте Network → Disable cache ✅
2. Обновите страницу (Ctrl+Shift+R)
3. Смотрите Console снова

---

**Пришлите скриншот ВСЕЙ консоли если не понятно!**
