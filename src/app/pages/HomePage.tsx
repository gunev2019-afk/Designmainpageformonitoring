import React, { useState, useEffect } from 'react';
import { FiltersPanel } from '../components/FiltersPanel';
import { MonitoringChart } from '../components/MonitoringChart';
import { DataTable } from '../components/DataTable';

/**
 * ГЛАВНАЯ СТРАНИЦА СИСТЕМЫ ОНЛАЙН-МОНИТОРИНГА
 * Отображает графики и таблицы с данными из InfluxDB
 */

export function HomePage() {
  // Состояния фильтров
  const [selectedStation, setSelectedStation] = useState('LOGO Тверская');
  const [timeInterval, setTimeInterval] = useState('1 час');
  const [dataFrequency, setDataFrequency] = useState('1 мин');
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>([
    'Температура слой 1',
    'Температура слой 2',
    'Температура слой 3'
  ]);
  const [showMin, setShowMin] = useState(false);
  const [showMax, setShowMax] = useState(false);

  // Mock данные для демонстрации - генерируем больше записей
  const generateMockData = () => {
    const data = [];
    const now = new Date();
    // Генерируем 100 записей для демонстрации скроллинга
    for (let i = 0; i < 100; i++) {
      const time = new Date(now.getTime() - (99 - i) * 60000);
      data.push({
        time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        t1: 24 + Math.sin(i / 10) * 3 + Math.random() * 0.5,
        t2: 26 + Math.cos(i / 8) * 2 + Math.random() * 0.5,
        t3: 22 + Math.sin(i / 12) * 2.5 + Math.random() * 0.5,
        h1: 45 + Math.sin(i / 15) * 10 + Math.random() * 2
      });
    }
    return data;
  };

  const [chartData, setChartData] = useState(generateMockData());

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    console.log('Применены фильтры:', {
      station: selectedStation,
      interval: timeInterval,
      frequency: dataFrequency,
      metrics: visibleMetrics,
      showMin: showMin,
      showMax: showMax
    });
    
    // TODO: Здесь должен быть запрос к backend API
    setChartData(generateMockData());
  };

  // Эффект для автоматического обновления при изменении фильтров
  useEffect(() => {
    setChartData(generateMockData());
  }, [selectedStation, timeInterval, dataFrequency]);

  // Обработчик экспорта данных
  const handleExport = () => {
    console.log('Экспорт данных');
    alert('Экспорт данных запущен. Файл скоро будет загружен.');
  };

  return (
    <main className="max-w-[1920px] mx-auto p-6">
      <div className="flex gap-6">
        {/* Левая колонка (70%) - График и Таблица */}
        <div className="flex-1 space-y-6" style={{ width: '70%' }}>
          {/* График */}
          <MonitoringChart
            data={chartData}
            visibleMetrics={visibleMetrics}
          />

          {/* Таблица */}
          <DataTable
            data={chartData}
            visibleMetrics={visibleMetrics}
            showMin={showMin}
            showMax={showMax}
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
            showMin={showMin}
            onShowMinChange={setShowMin}
            showMax={showMax}
            onShowMaxChange={setShowMax}
            onApplyFilters={handleApplyFilters}
          />
        </aside>
      </div>
    </main>
  );
}
