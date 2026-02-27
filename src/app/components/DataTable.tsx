import React from 'react';
import { Download } from 'lucide-react';

interface DataTableProps {
  data: any[];
  visibleMetrics: string[];
  onExport: () => void;
}

export function DataTable({ data, visibleMetrics, onExport }: DataTableProps) {
  const columns = [
    { key: 'time', label: 'Время' },
    { key: 't1', label: 'Температура слой 1', metricName: 'Температура слой 1' },
    { key: 't2', label: 'Температура слой 2', metricName: 'Температура слой 2' },
    { key: 't3', label: 'Температура слой 3', metricName: 'Температура слой 3' }
  ];

  const visibleColumns = columns.filter(
    col => col.key === 'time' || visibleMetrics.includes(col.metricName!)
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Таблица данных</h2>
      
      {/* Таблица */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-gray-700"
                  >
                    {col.key === 'time' 
                      ? row[col.key] 
                      : `${row[col.key]?.toFixed(1) || '—'} °C`
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Кнопка экспорт */}
      <div className="flex justify-end">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Экспорт
        </button>
      </div>

      {/* Комментарий для разработчика */}
      {/* 
        TODO для разработчика:
        - Данные таблицы приходят из backend API (InfluxDB)
        - Кнопка "Экспорт" должна сохранять данные с учетом всех текущих фильтров:
          * Выбранная станция
          * Временной интервал (или ручной диапазон)
          * Частота точек данных
          * Выбранные метрики
        - Формат экспорта: CSV или Excel (определяется на backend)
      */}
    </div>
  );
}
