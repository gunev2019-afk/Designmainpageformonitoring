import React, { useState } from 'react';
import { MapPin, Clock, Settings, Database } from 'lucide-react';

interface FiltersPanelProps {
  selectedStation: string;
  onStationChange: (station: string) => void;
  timeInterval: string;
  onTimeIntervalChange: (interval: string) => void;
  dataFrequency: string;
  onDataFrequencyChange: (frequency: string) => void;
  visibleMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export function FiltersPanel({
  selectedStation,
  onStationChange,
  timeInterval,
  onTimeIntervalChange,
  dataFrequency,
  onDataFrequencyChange,
  visibleMetrics,
  onMetricsChange
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
    // Логика: для длинных интервалов отключаем частые выборки
    if (timeInterval === '24 часа' || timeInterval === '7 дней') {
      return allFrequencies.slice(2); // только 1 мин, 5 мин, 1 час
    }
    if (timeInterval === '6 часов') {
      return allFrequencies.slice(1); // без 1 сек
    }
    return allFrequencies;
  };

  const availableFrequencies = getAvailableFrequencies();

  // Метрики - динамический список (зависит от станции)
  // В будущем можно расширить разными параметрами для разных станций
  const availableMetrics = [
    'Температура слой 1',
    'Температура слой 2',
    'Температура слой 3'
  ];

  const handleMetricToggle = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      onMetricsChange(visibleMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...visibleMetrics, metric]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Фильтры</h2>

      {/* Блок: Станция */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Станция</h3>
        </div>
        <select
          value={selectedStation}
          onChange={(e) => onStationChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {stations.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Выбор станции влияет на доступные метрики
        </p>
      </div>

      {/* Блок: Временной интервал */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Временной интервал</h3>
        </div>
        <select
          value={timeInterval}
          onChange={(e) => onTimeIntervalChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {timeIntervals.map((interval) => (
            <option key={interval} value={interval}>
              {interval}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCustomInterval(!showCustomInterval)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showCustomInterval ? '− Скрыть ручной интервал' : '+ Ручной интервал'}
        </button>
        {showCustomInterval && (
          <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs text-gray-600 block mb-1">От:</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">До:</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Блок: Частота точек данных */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Частота точек данных</h3>
        </div>
        <select
          value={dataFrequency}
          onChange={(e) => onDataFrequencyChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {availableFrequencies.map((freq) => (
            <option key={freq} value={freq}>
              {freq}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Доступные частоты зависят от выбранного интервала времени
        </p>
      </div>

      {/* Блок: Отображаемые данные */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Отображаемые данные</h3>
        </div>
        <div className="space-y-2">
          {availableMetrics.map((metric) => (
            <label
              key={metric}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={visibleMetrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{metric}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Выбор влияет на график и таблицу
        </p>
      </div>

      {/* Комментарии для разработчика */}
      {/* 
        TODO для разработчика:
        - При смене станции нужно загружать доступный список метрик с backend API
        - Список метрик должен быть динамическим и зависеть от выбранной станции
        - В будущем могут быть метрики: влажность, давление, CPU, память и т.д.
        - Частота точек данных должна валидироваться на backend во избежание перегрузки
      */}
    </div>
  );
}
