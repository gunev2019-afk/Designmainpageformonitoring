# 🎯 Следующие шаги развития системы

## ✅ Готово (Этапы 1+2)

- [x] Backend API для станций и метрик
- [x] Backend InfluxDB интеграция
- [x] Frontend страница управления станциями
- [x] Frontend API клиент
- [x] Базовая интеграция HomePage с API

---

## 🔧 Текущие ограничения

### 1. Компоненты нуждаются в обновлении

**MonitoringChart.tsx** и **DataTable.tsx** используют hardcoded метрики.

**Что нужно сделать:**
- Обновить MonitoringChart для работы с динамическими метриками
- Обновить DataTable для отображения реальных данных
- Добавить маппинг metricId → данные из API

**Приоритет:** 🔴 Высокий (необходимо для полноценной работы)

---

## 📋 План дальнейшей разработки

### ЭТАП 3: Улучшение главной страницы 📊

**Задачи:**

1. **Обновить MonitoringChart**
   - Динамическое построение графиков на основе выбранных метрик
   - Использовать данные из `getHistoryData()`
   - Поддержка множественных графиков
   - Разные цвета для разных метрик

2. **Обновить DataTable**
   - Отображение данных из API
   - Колонки на основе выбранных метрик
   - Форматирование чисел (единицы измерения)
   - Пагинация для больших объемов данных

3. **Карточки с текущими значениями**
   - Создать компонент MetricCard
   - Показывать текущее значение каждой метрики
   - Индикаторы статуса (норма/тревога)
   - Иконки в зависимости от типа метрики

4. **Улучшение UX**
   - Skeleton loaders при загрузке
   - Пустые состояния (empty states)
   - Error states с retry кнопками
   - Красивые анимации переходов

**Время:** ~3-4 часа

---

### ЭТАП 4: Страница экспорта 📥

**Задачи:**

1. **Backend API**
   - POST `/api/export/csv` - генерация CSV
   - POST `/api/export/excel` - генерация Excel (с exceljs)
   - Фильтры: временной диапазон, станции, метрики

2. **Frontend страница**
   - Форма выбора параметров экспорта
   - Preview данных перед экспортом
   - Прогресс бар загрузки
   - Скачивание файла

3. **Дополнительно**
   - Шаблоны экспорта (сохраненные настройки)
   - Планировщик экспорта (еженедельно/ежемесячно)
   - Email отправка файлов

**Время:** ~2-3 часа

---

### ЭТАП 5: Страница логов 📝

**Задачи:**

1. **Backend API**
   - GET `/api/logs` - получение логов
   - Фильтрация: level, user, дата
   - Пагинация
   - Автоматическое логирование событий:
     - Вход/выход пользователей
     - Создание/изменение/удаление данных
     - Ошибки системы

2. **Frontend страница**
   - Таблица логов с фильтрами
   - Цветовая индикация уровней (info/warning/error)
   - Поиск по тексту
   - Детальный просмотр лога

**Время:** ~2 часа

---

### ЭТАП 6: Настройки и алерты ⚙️

**Задачи:**

1. **Пороговые значения**
   - Таблица `thresholds` в БД
   - Настройка min/max для каждой метрики
   - Статусы: норма/предупреждение/критично

2. **Уведомления**
   - Email при превышении порогов
   - Browser notifications
   - История алертов

3. **Настройки системы**
   - Интервалы обновления данных
   - Тайм-зоны
   - Форматы дат/чисел
   - Тема по умолчанию

**Время:** ~4-5 часов

---

## 🚀 Быстрый старт: Обновление компонентов

### Пример обновления MonitoringChart:

```tsx
// Вместо hardcoded метрик, используем пропсы
interface MonitoringChartProps {
  data: DataPoint[];
  metrics: Metric[];
  selectedMetricIds: number[];
}

export function MonitoringChart({ data, metrics, selectedMetricIds }: MonitoringChartProps) {
  // Получаем метрики для отображения
  const visibleMetrics = metrics.filter(m => selectedMetricIds.includes(m.id));
  
  // Цвета для графиков
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        {visibleMetrics.map((metric, index) => (
          <Line
            key={metric.id}
            type="monotone"
            dataKey={`metrics.${metric.id}.value`}
            name={metric.display_name}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## 📊 Приоритеты

### 🔴 Критично (сделать первым):
1. Обновить MonitoringChart и DataTable
2. Тестирование с реальными данными InfluxDB

### 🟡 Важно (следующим):
3. Страница экспорта
4. Улучшение UX (loaders, errors)

### 🟢 Желательно (потом):
5. Страница логов
6. Настройки и алерты

---

## 🧪 Тестирование

### Для тестирования системы нужно:

1. **Запущенный InfluxDB 2.x** с данными:
   ```
   Bucket: telemetry
   Measurement: lab
   Fields: температура, влажность
   Tags: channel (AI1, AI2, AI3)
   ```

2. **Backend с правильным .env**:
   - INFLUX_URL
   - INFLUX_TOKEN
   - INFLUX_ORG

3. **Тестовые данные**:
   - Создайте станцию через UI
   - Добавьте метрики
   - Проверьте что данные подтягиваются

---

## 💡 Полезные команды

### Backend:
```bash
cd backend
npm run dev          # Запуск в dev режиме
npm run build        # Компиляция TypeScript
npm run start        # Запуск production
npm run check        # Проверка настроек
```

### Frontend:
```bash
npm run dev          # Запуск Vite dev server
npm run build        # Сборка для production
```

### Тестирование API:
```bash
# Получить станции
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/api/stations

# Получить текущие значения
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/api/data/current/1

# Проверить InfluxDB
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/api/data/health
```

---

## 📚 Документация

- [STAGES_1_2_COMPLETE.md](./STAGES_1_2_COMPLETE.md) - Полное описание этапов 1+2
- [QUICK_START_STAGES_1_2.md](./QUICK_START_STAGES_1_2.md) - Быстрый старт
- [backend/API_EXAMPLES.md](./backend/API_EXAMPLES.md) - Примеры API запросов

---

## 🎉 Заключение

Система мониторинга имеет солидный фундамент:
- ✅ Полноценный backend на Express + TypeScript
- ✅ Интеграция с InfluxDB 2.x
- ✅ Управление станциями и метриками
- ✅ Авторизация и роли пользователей
- ✅ Современный UI на React + Tailwind

**Следующий логический шаг:** Обновить компоненты графиков и таблиц для работы с реальными данными.

**Приятной разработки! 🚀**
