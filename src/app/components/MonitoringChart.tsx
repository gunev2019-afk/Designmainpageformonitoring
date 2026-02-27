import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonitoringChartProps {
  data: any[];
  visibleMetrics: string[];
  onMetricToggle: (metric: string) => void;
}

export function MonitoringChart({ data, visibleMetrics, onMetricToggle }: MonitoringChartProps) {
  const metrics = [
    { key: 't1', label: 'Т1', color: '#3B82F6', fullName: 'Температура слой 1' },
    { key: 't2', label: 'Т2', color: '#10B981', fullName: 'Температура слой 2' },
    { key: 't3', label: 'Т3', color: '#F59E0B', fullName: 'Температура слой 3' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">График мониторинга</h2>
      
      {/* График */}
      <div className="w-full mb-6" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="time" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {metrics.map((metric) => 
              visibleMetrics.includes(metric.fullName) && (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  name={metric.label}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Легенда с чекбоксами */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
        {metrics.map((metric) => (
          <label
            key={metric.key}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={visibleMetrics.includes(metric.fullName)}
              onChange={() => onMetricToggle(metric.fullName)}
              className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
              style={{ accentColor: metric.color }}
            />
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-0.5 rounded"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {metric.label} - {metric.fullName}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Комментарий для разработчика */}
      {/* 
        TODO для разработчика:
        - Данные графика приходят из backend API (InfluxDB)
        - Список метрик должен быть динамическим и зависеть от выбранной станции
        - Формат данных: [{time: "12:00", t1: 25.5, t2: 26.1, t3: 24.8}, ...]
        - В будущем метрики могут быть любыми: влажность, давление, CPU и т.д.
      */}
    </div>
  );
}