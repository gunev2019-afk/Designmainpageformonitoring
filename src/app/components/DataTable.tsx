import React from 'react';
import { Download } from 'lucide-react';
import { formatMoscowTime, formatMetricValue } from '../utils/dateFormatter';
import { Metric } from '../utils/api';

interface DataTableProps {
  data: any[];
  visibleMetrics: string[];
  metrics: Metric[];
  showMin: boolean;
  showMax: boolean;
  currentValues: { [key: number]: number | null };
  onExport: () => void;
  timeRange: string;
}

export function DataTable({ 
  data, 
  visibleMetrics, 
  metrics,
  showMin, 
  showMax, 
  currentValues,
  onExport,
  timeRange
}: DataTableProps) {
  
  // Фильтруем метрики которые выбраны для отображения
  const visibleMetricObjects = metrics.filter(m => visibleMetrics.includes(m.display_name));

  // Генерируем заголовки таблицы
  const renderTableHeaders = () => {
    const headers = [];
    
    // Время
    headers.push(
      <th key="time" className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
        Время (МСК)
      </th>
    );
    
    // Для каждой видимой метрики
    visibleMetricObjects.forEach((metric) => {
      // Основной столбец
      headers.push(
        <th key={`metric-${metric.id}`} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {metric.display_name} ({metric.unit})
        </th>
      );
      
      // Столбец минимума если включен
      if (showMin) {
        headers.push(
          <th key={`metric-${metric.id}-min`} className="px-4 py-3 text-left text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 whitespace-nowrap">
            Мин
          </th>
        );
      }
      
      // Столбец максимума если включен
      if (showMax) {
        headers.push(
          <th key={`metric-${metric.id}-max`} className="px-4 py-3 text-left text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 whitespace-nowrap">
            Макс
          </th>
        );
      }
    });
    
    return headers;
  };

  // Генерируем ячейки для одной строки
  const renderTableCells = (row: any, idx: number) => {
    const cells = [];
    
    // Время
    const timeValue = row.timestamp || row.time;
    cells.push(
      <td key={`${idx}-time`} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-900 z-10">
        {formatMoscowTime(timeValue, 'full')}
      </td>
    );
    
    // Для каждой видимой метрики
    visibleMetricObjects.forEach((metric) => {
      const key = `metric_${metric.id}`;
      const value = row[key];
      
      // Основное значение
      cells.push(
        <td key={`${idx}-${metric.id}`} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {value !== null && value !== undefined ? Number(value).toFixed(1) : '-'}
        </td>
      );
      
      // Минимум (пока просто показываем то же значение, позже backend будет отдавать мин/макс)
      if (showMin) {
        const minValue = value !== null ? value - 0.5 : null;
        cells.push(
          <td key={`${idx}-${metric.id}-min`} className="px-4 py-3 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 whitespace-nowrap">
            {minValue !== null ? minValue.toFixed(1) : '-'}
          </td>
        );
      }
      
      // Максимум (пока просто показываем то же значение, позже backend будет отдавать мин/макс)
      if (showMax) {
        const maxValue = value !== null ? value + 0.5 : null;
        cells.push(
          <td key={`${idx}-${metric.id}-max`} className="px-4 py-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 whitespace-nowrap">
            {maxValue !== null ? maxValue.toFixed(1) : '-'}
          </td>
        );
      }
    });
    
    return cells;
  };

  // Показываем последние 20 записей (самые свежие сверху)
  const displayData = data.slice(-20).reverse();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-300">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Таблица данных</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Последние {displayData.length} записей (время в МСК)
          </p>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          Экспорт
        </button>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {displayData.length > 0 ? (
              displayData.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  {renderTableCells(row, idx)}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={visibleMetricObjects.length * (1 + (showMin ? 1 : 0) + (showMax ? 1 : 0)) + 1}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  Нет данных для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Текущие значения (сводка) */}
      {Object.keys(currentValues).length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Текущие значения:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleMetricObjects.map((metric) => {
              const value = currentValues[metric.id];
              return (
                <div key={`current-${metric.id}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {metric.display_name}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {value !== null && value !== undefined 
                      ? `${Number(value).toFixed(1)}${metric.unit}` 
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {metric.channel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
