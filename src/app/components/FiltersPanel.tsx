import React, { useState } from 'react';
import { MapPin, Clock, Settings, Database, TrendingUp, TrendingDown } from 'lucide-react';

interface FiltersPanelProps {
  selectedStation: string;
  onStationChange: (station: string) => void;
  timeInterval: string;
  onTimeIntervalChange: (interval: string) => void;
  dataFrequency: string;
  onDataFrequencyChange: (frequency: string) => void;
  visibleMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  showMin: boolean;
  onShowMinChange: (show: boolean) => void;
  showMax: boolean;
  onShowMaxChange: (show: boolean) => void;
  onApplyFilters: () => void;
}

export function FiltersPanel({
  selectedStation,
  onStationChange,
  timeInterval,
  onTimeIntervalChange,
  dataFrequency,
  onDataFrequencyChange,
  visibleMetrics,
  onMetricsChange,
  showMin,
  onShowMinChange,
  showMax,
  onShowMaxChange,
  onApplyFilters
}: FiltersPanelProps) {
  const [showCustomInterval, setShowCustomInterval] = useState(false);

  const stations = [
    'LOGO Тверская',
    'LOGO Арбат',
    'LOGO Нагатинская набережная'
  ];

  const timeIntervals = [
    '5 минут',
    '15 минут',
    '30 минут',
    '1 час',
    '6 часов',
    '24 часа',
    '7 дней'
  ];

  // Частоты зависят от выбранного интервала
  const getAvailableFrequencies = () => {
    const allFrequencies = ['1 сек', '10 сек', '1 мин', '5 мин', '1 час'];
    if (timeInterval === '24 часа' || timeInterval === '7 дней') {
      return allFrequencies.slice(2);
    }
    if (timeInterval === '6 часов') {
      return allFrequencies.slice(1);
    }
    return allFrequencies;
  };

  const availableFrequencies = getAvailableFrequencies();

  // Метрики с включенной влажностью
  const availableMetrics = [
    'Температура слой 1',
    'Температура слой 2',
    'Температура слой 3',
    'Влажность'
  ];

  const handleMetricToggle = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      onMetricsChange(visibleMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...visibleMetrics, metric]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6 transition-colors duration-300">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Фильтры</h2>

      {/* Блок: Станция */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Станция</h3>
        </div>
        <select
          value={selectedStation}
          onChange={(e) => onStationChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {stations.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Выбор станции влияет на доступные метрики
        </p>
      </div>

      {/* Блок: Временной интервал */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Временной интервал</h3>
        </div>
        <select
          value={timeInterval}
          onChange={(e) => onTimeIntervalChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {timeIntervals.map((interval) => (
            <option key={interval} value={interval}>
              {interval}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCustomInterval(!showCustomInterval)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          {showCustomInterval ? '− Скрыть ручной интервал' : '+ Ручной интервал'}
        </button>
        {showCustomInterval && (
          <div className="space-y-2 mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300 block mb-1">От:</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300 block mb-1">До:</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Блок: Частота точек данных */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Частота точек данных</h3>
        </div>
        <select
          value={dataFrequency}
          onChange={(e) => onDataFrequencyChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {availableFrequencies.map((freq) => (
            <option key={freq} value={freq}>
              {freq}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Доступные частоты зависят от выбранного интервала времени
        </p>
      </div>

      {/* Блок: Отображаемые данные */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Отображаемые данные</h3>
        </div>
        <div className="space-y-2">
          {availableMetrics.map((metric) => (
            <label
              key={metric}
              className="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-100 border border-transparent dark:bg-gray-700/50 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={visibleMetrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">{metric}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Выбор влияет на график и таблицу. Влажность отображается на отдельном графике.
        </p>
      </div>

      {/* Блок: Дополнительные параметры */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Дополнительные параметры</h3>
        </div>
        
        <div className="space-y-2">
          {/* Минимум */}
          <label className="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-100 border border-transparent dark:bg-gray-700/50 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={showMin}
              onChange={(e) => onShowMinChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-200">Минимум</span>
            </div>
          </label>

          {/* Максимум */}
          <label className="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-100 border border-transparent dark:bg-gray-700/50 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={showMax}
              onChange={(e) => onShowMaxChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-200">Максимум</span>
            </div>
          </label>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300">
          Добавляет столбцы мин/макс для каждого параметра
        </p>
      </div>

      {/* Кнопка применить фильтры */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onApplyFilters}
          className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Применить фильтры
        </button>
      </div>
    </div>
  );
}
