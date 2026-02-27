import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FiltersPanel } from './components/FiltersPanel';
import { MonitoringChart } from './components/MonitoringChart';
import { DataTable } from './components/DataTable';

/**
 * ГЛАВНАЯ СТРАНИЦА СИСТЕМЫ ОНЛАЙН-МОНИТОРИНГА ИНЖЕНЕРНЫХ ПАРАМЕТРОВ
 * 
 * Данные приходят из InfluxDB через backend API.
 * 
 * Архитектура:
 * - Header: навигация по системе
 * - Левая колонка (70%): График + Таблица данных
 * - Правая колонка (30%): Панель фильтров
 * 
 * Фильтры влияют на отображаемые данные:
 * - Станция → определяет доступные метрики
 * - Временной интервал → влияет на доступные частоты выборки
 * - Частота точек данных → определяет детализацию данных
 * - Отображаемые данные → чекбоксы метрик (график + таблица)
 */

function App() {
  // Состояния для навигации
  const [activeTab, setActiveTab] = useState('home');

  // Состояния фильтров
  const [selectedStation, setSelectedStation] = useState('LOGO Тверская');
  const [timeInterval, setTimeInterval] = useState('1 час');
  const [dataFrequency, setDataFrequency] = useState('1 мин');
  const [visibleMetrics, setVisibleMetrics] = useState([
    'Температура слой 1',
    'Температура слой 2',
    'Температура слой 3'
  ]);

  // Mock данные для демонстрации
  // В реальном приложении данные загружаются из API
  const generateMockData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const time = new Date(now.getTime() - (59 - i) * 60000);
      data.push({
        time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        t1: 24 + Math.sin(i / 10) * 3 + Math.random() * 0.5,
        t2: 26 + Math.cos(i / 8) * 2 + Math.random() * 0.5,
        t3: 22 + Math.sin(i / 12) * 2.5 + Math.random() * 0.5
      });
    }
    return data;
  };

  const [chartData, setChartData] = useState(generateMockData());

  // Эффект для "обновления" данных при изменении фильтров
  // В реальном приложении здесь будет API-запрос
  useEffect(() => {
    console.log('Фильтры изменены:', {
      station: selectedStation,
      interval: timeInterval,
      frequency: dataFrequency,
      metrics: visibleMetrics
    });
    
    // TODO: Здесь должен быть запрос к backend API:
    // fetchMonitoringData({
    //   station: selectedStation,
    //   interval: timeInterval,
    //   frequency: dataFrequency,
    //   metrics: visibleMetrics
    // }).then(data => setChartData(data));
    
    setChartData(generateMockData());
  }, [selectedStation, timeInterval, dataFrequency]);

  // Обработчик экспорта данных
  const handleExport = () => {
    console.log('Экспорт данных с параметрами:', {
      station: selectedStation,
      interval: timeInterval,
      frequency: dataFrequency,
      metrics: visibleMetrics
    });
    
    // TODO: Здесь должен быть запрос к backend API для экспорта:
    // exportMonitoringData({
    //   station: selectedStation,
    //   interval: timeInterval,
    //   frequency: dataFrequency,
    //   metrics: visibleMetrics,
    //   format: 'csv' // или 'excel'
    // });
    
    alert('Экспорт данных запущен. Файл скоро будет загружен.');
  };

  // Обработчик переключения видимости метрик
  const handleMetricToggle = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      // Должна остаться хотя бы одна метрика
      if (visibleMetrics.length > 1) {
        setVisibleMetrics(visibleMetrics.filter(m => m !== metric));
      }
    } else {
      setVisibleMetrics([...visibleMetrics, metric]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Основной контент */}
      <main className="max-w-[1920px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Левая колонка (70%) - График и Таблица */}
          <div className="flex-1 space-y-6" style={{ width: '70%' }}>
            {/* График */}
            <MonitoringChart
              data={chartData}
              visibleMetrics={visibleMetrics}
              onMetricToggle={handleMetricToggle}
            />

            {/* Таблица */}
            <DataTable
              data={chartData.slice(-10)} // Показываем последние 10 записей
              visibleMetrics={visibleMetrics}
              onExport={handleExport}
            />
          </div>

          {/* Правая колонка (30%) - Фильтры */}
          <aside className="flex-shrink-0" style={{ width: '30%' }}>
            <FiltersPanel
              selectedStation={selectedStation}
              onStationChange={setSelectedStation}
              timeInterval={timeInterval}
              onTimeIntervalChange={setTimeInterval}
              dataFrequency={dataFrequency}
              onDataFrequencyChange={setDataFrequency}
              visibleMetrics={visibleMetrics}
              onMetricsChange={setVisibleMetrics}
            />
          </aside>
        </div>
      </main>

      {/* 
        ═══════════════════════════════════════════════════════════
        КОММЕНТАРИИ ДЛЯ РАЗРАБОТЧИКА
        ═══════════════════════════════════════════════════════════
        
        1. BACKEND API ИНТЕГРАЦИЯ:
           - Все данные графика и таблицы приходят из InfluxDB
           - API endpoint: GET /api/monitoring/data
           - Параметры запроса:
             * station: string - выбранная станция
             * interval: string - временной интервал
             * frequency: string - частота точек данных
             * metrics: string[] - массив выбранных метрик
           
        2. ДИНАМИЧЕСКИЕ МЕТРИКИ:
           - Смена станции должна менять доступный список метрик
           - API endpoint: GET /api/monitoring/metrics?station={station}
           - Разные станции могут иметь разные датчики:
             * Температура (слои 1-3)
             * Влажность
             * Давление
             * CPU/память (для серверных станций)
             * И т.д.
        
        3. ВАЛИДАЦИЯ ЧАСТОТЫ:
           - Выбранный временной интервал влияет на доступные значения частоты
           - Нельзя позволять слишком частую выборку для длинных интервалов
           - Пример: интервал "24 часа" + частота "1 сек" = перегрузка
           - Валидация должна быть и на frontend, и на backend
        
        4. ЭКСПОРТ ДАННЫХ:
           - Кнопка "Экспорт" сохраняет данные с учётом всех фильтров
           - API endpoint: POST /api/monitoring/export
           - Параметры:
             * station: string
             * interval: string (или custom: {from, to})
             * frequency: string
             * metrics: string[]
             * format: 'csv' | 'excel'
           - Возвращает файл для скачивания
        
        5. ПРОИЗВОДИТЕЛЬНОСТЬ:
           - Для больших интервалов времени использовать пагинацию таблицы
           - График может агрегировать данные для оптимизации
           - Кэширование данных на frontend (React Query, SWR)
        
        ═══════════════════════════════════════════════════════════
      */}
    </div>
  );
}

export default App;
