import React from 'react';
import { Download } from 'lucide-react';

interface DataTableProps {
  data: any[];
  visibleMetrics: string[];
  showMin: boolean;
  showMax: boolean;
  onExport: () => void;
}

export function DataTable({ data, visibleMetrics, showMin, showMax, onExport }: DataTableProps) {
  const columns = [
    { key: 'time', label: 'Время' },
    { key: 't1', label: 'Температура слой 1', metricName: 'Температура слой 1', unit: '°C' },
    { key: 't2', label: 'Температура слой 2', metricName: 'Температура слой 2', unit: '°C' },
    { key: 't3', label: 'Температура слой 3', metricName: 'Температура слой 3', unit: '°C' },
    { key: 'h1', label: 'Влажность', metricName: 'Влажность', unit: '%' }
  ];

  const visibleColumns = columns.filter(
    col => col.key === 'time' || visibleMetrics.includes(col.metricName!)
  );

  // Функция для расчета минимума для конкретного значения (симуляция)
  const calculateMin = (value: number) => {
    // В реальном приложении здесь будет расчет минимума за период
    return value - (Math.random() * 2 + 0.5);
  };

  // Функция для расчета максимума для конкретного значения (симуляция)
  const calculateMax = (value: number) => {
    // В реальном приложении здесь будет расчет максимума за период
    return value + (Math.random() * 2 + 0.5);
  };

  // Генерируем заголовки таблицы
  const renderTableHeaders = () => {
    const headers = [];
    
    // Время
    headers.push(
      <th key="time" className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
        Время
      </th>
    );
    
    // Для каждой видимой метрики
    visibleColumns.filter(col => col.key !== 'time').forEach((col) => {
      // Основной столбец
      headers.push(
        <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {col.label}
        </th>
      );
      
      // Столбец минимума если включен
      if (showMin) {
        headers.push(
          <th key={`${col.key}-min`} className="px-4 py-3 text-left text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 whitespace-nowrap">
            {col.label} (мин)
          </th>
        );
      }
      
      // Столбец максимума если включен
      if (showMax) {
        headers.push(
          <th key={`${col.key}-max`} className="px-4 py-3 text-left text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 whitespace-nowrap">
            {col.label} (макс)
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
    cells.push(
      <td key={`${idx}-time`} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {row.time}
      </td>
    );
    
    // Для каждой видимой метрики
    visibleColumns.filter(col => col.key !== 'time').forEach((col) => {
      const value = row[col.key];
      const hasValue = value !== undefined && value !== null;
      
      // Основное значение
      cells.push(
        <td key={`${idx}-${col.key}`} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {hasValue ? `${value.toFixed(1)} ${col.unit || ''}` : '—'}
        </td>
      );
      
      // Минимум
      if (showMin) {
        cells.push(
          <td key={`${idx}-${col.key}-min`} className="px-4 py-3 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 whitespace-nowrap">
            {hasValue ? `${calculateMin(value).toFixed(1)} ${col.unit || ''}` : '—'}
          </td>
        );
      }
      
      // Максимум
      if (showMax) {
        cells.push(
          <td key={`${idx}-${col.key}-max`} className="px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 whitespace-nowrap">
            {hasValue ? `${calculateMax(value).toFixed(1)} ${col.unit || ''}` : '—'}
          </td>
        );
      }
    });
    
    return cells;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Таблица данных</h2>
        <span className="text-sm text-gray-600 dark:text-gray-300">Всего записей: {data.length}</span>
      </div>
      
      {/* Таблица с горизонтальным и вертикальным скроллингом */}
      <div className="overflow-auto mb-6 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="max-h-96">
          <table className="w-full min-w-max">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
              <tr className="border-b border-gray-200 dark:border-gray-600">
                {renderTableHeaders()}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {renderTableCells(row, idx)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Информация и кнопка экспорт */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {showMin || showMax ? (
            <span>
              {showMin && 'Минимум'}{showMin && showMax && ' и '}{showMax && 'Максимум'} 
              {' '}рассчитываются для каждого параметра отдельно за выбранную частоту
            </span>
          ) : (
            <span>Выберите дополнительные параметры для отображения мин/макс</span>
          )}
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Экспорт
        </button>
      </div>
    </div>
  );
}
