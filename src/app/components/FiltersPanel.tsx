import React from 'react';
import { MapPin, Clock, Settings, Database, TrendingUp, TrendingDown } from 'lucide-react';
import { TimeRange, DataFrequency } from '../utils/api';

interface FiltersPanelProps {
  stations: string[];
  selectedStation: string;
  onStationChange: (station: string) => void;
  timeInterval: TimeRange;
  onTimeIntervalChange: (interval: TimeRange) => void;
  dataFrequency: DataFrequency;
  onDataFrequencyChange: (frequency: DataFrequency) => void;
  availableMetrics: string[];
  visibleMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  showMin: boolean;
  onShowMinChange: (show: boolean) => void;
  showMax: boolean;
  onShowMaxChange: (show: boolean) => void;
  onApplyFilters: () => void;
}

export function FiltersPanel({
  stations,
  selectedStation,
  onStationChange,
  timeInterval,
  onTimeIntervalChange,
  dataFrequency,
  onDataFrequencyChange,
  availableMetrics,
  visibleMetrics,
  onMetricsChange,
  showMin,
  onShowMinChange,
  showMax,
  onShowMaxChange,
  onApplyFilters
}: FiltersPanelProps) {
  const timeIntervals: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1 час' },
    { value: '6h', label: '6 часов' },
    { value: '1d', label: '1 день' },
    { value: '1w', label: '1 неделя' },
    { value: '1m', label: '1 месяц' },
  ];

  const frequencies: { value: DataFrequency; label: string }[] = [
    { value: '1s', label: '1 сек' },
    { value: '10s', label: '10 сек' },
    { value: '1m', label: '1 мин' },
    { value: '5m', label: '5 мин' },
    { value: '15m', label: '15 мин' },
    { value: '1h', label: '1 час' },
  ];

  // Фильтруем частоты в зависимости от выбранного интервала
  const getAvailableFrequencies = () => {
    if (timeInterval === '1w' || timeInterval === '1m') {
      return frequencies.filter(f => ['5m', '15m', '1h'].includes(f.value));
    }
    if (timeInterval === '1d') {
      return frequencies.filter(f => ['1m', '5m', '15m', '1h'].includes(f.value));
    }
    return frequencies;
  };

  const availableFrequencies = getAvailableFrequencies();

  const handleMetricToggle = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      onMetricsChange(visibleMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...visibleMetrics, metric]);
    }
  };

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-xl shadow-md p-6 space-y-6 border border-gray-100 dark:border-[#3f3f46] transition-colors duration-300">
      {/* Заголовок */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-[#3f3f46]">
        <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Фильтры</h2>
      </div>

      {/* Выбор станции */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-[#fafafa]">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Станция
        </label>
        <select
          value={selectedStation}
          onChange={(e) => onStationChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
        >
          {stations.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>

      {/* Временной интервал */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-[#fafafa]">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Временной интервал
        </label>
        <select
          value={timeInterval}
          onChange={(e) => onTimeIntervalChange(e.target.value as TimeRange)}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
        >
          {timeIntervals.map((interval) => (
            <option key={interval.value} value={interval.value}>
              {interval.label}
            </option>
          ))}
        </select>
      </div>

      {/* Частота данных */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-[#fafafa]">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Частота данных
        </label>
        <select
          value={dataFrequency}
          onChange={(e) => onDataFrequencyChange(e.target.value as DataFrequency)}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-[#3f3f46] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
        >
          {availableFrequencies.map((freq) => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
      </div>

      {/* Выбор метрик */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-[#fafafa]">
          Отображаемые метрики
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableMetrics.map((metric) => (
            <label
              key={metric}
              className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-[#18181b] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3f3f46] cursor-pointer transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={visibleMetrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-900 dark:text-white flex-1">
                {metric}
              </span>
            </label>
          ))}
          {availableMetrics.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-[#71717a] text-center py-4">
              Нет доступных метрик
            </div>
          )}
        </div>
      </div>

      {/* Опции Min/Max */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-[#fafafa]">
          Дополнительные параметры
        </label>
        <label className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-[#18181b] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3f3f46] cursor-pointer transition-colors duration-200">
          <input
            type="checkbox"
            checked={showMin}
            onChange={(e) => onShowMinChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <TrendingDown className="w-4 h-4 text-gray-600 dark:text-[#a1a1aa]" />
          <span className="text-sm text-gray-900 dark:text-white flex-1">
            Показать минимум
          </span>
        </label>
        <label className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-[#18181b] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3f3f46] cursor-pointer transition-colors duration-200">
          <input
            type="checkbox"
            checked={showMax}
            onChange={(e) => onShowMaxChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <TrendingUp className="w-4 h-4 text-gray-600 dark:text-[#a1a1aa]" />
          <span className="text-sm text-gray-900 dark:text-white flex-1">
            Показать максимум
          </span>
        </label>
      </div>

      {/* Кнопка применить */}
      <button
        onClick={onApplyFilters}
        className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        Применить фильтры
      </button>
    </div>
  );
}
