import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatChartTime, formatTooltipTime, formatMetricValue } from '../utils/dateFormatter';
import { Metric } from '../utils/api';

interface MonitoringChartProps {
  data: any[];
  visibleMetrics: string[];
  metrics: Metric[];
  timeRange: string;
}

/**
 * Кастомный Tooltip с московским временем
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {formatTooltipTime(label)} (МСК)
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value !== null ? Number(entry.value).toFixed(1) : '-'}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MonitoringChart({ data, visibleMetrics, metrics, timeRange }: MonitoringChartProps) {
  // Группируем метрики по типу (температура/влажность)
  const visibleMetricObjects = metrics.filter(m => visibleMetrics.includes(m.display_name));
  
  console.log('📊 MonitoringChart render:', {
    dataLength: data.length,
    visibleMetrics,
    metricsCount: metrics.length,
    visibleMetricObjects: visibleMetricObjects.length,
    firstDataPoint: data[0]
  });
  
  const temperatureMetrics = visibleMetricObjects.filter(m => 
    m.unit === '°C' || m.field.toLowerCase().includes('температ') || m.field.toLowerCase().includes('temp')
  );
  
  const humidityMetrics = visibleMetricObjects.filter(m => 
    m.unit === '%' || m.field.toLowerCase().includes('влажн') || m.field.toLowerCase().includes('humid')
  );
  
  console.log('🌡️ Температурных метрик:', temperatureMetrics.length);
  console.log('💧 Влажностных метрик:', humidityMetrics.length);
  
  // Цвета для графиков
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EF4444', // red-500
    '#06B6D4', // cyan-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
  ];

  // Форматируем данные для отображения
  const formattedData = data.map(item => {
    const formatted: any = {
      time: item.timestamp || item.time,
      rawTime: item.timestamp || item.time,
    };
    
    // Добавляем значения метрик
    visibleMetricObjects.forEach((metric) => {
      const key = `metric_${metric.id}`;
      formatted[key] = item[key] !== undefined ? item[key] : null;
    });
    
    return formatted;
  });

  return (
    <div className="space-y-6">
      {/* График температуры */}
      {temperatureMetrics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            График температуры
          </h2>
          
          <div className="w-full mb-6" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={formattedData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB"
                  className="dark:opacity-20"
                />
                <XAxis 
                  dataKey="rawTime"
                  tickFormatter={(value) => formatChartTime(value, timeRange)}
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  className="dark:stroke-gray-400"
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  label={{ 
                    value: '°C', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fontSize: '14px', fill: '#6B7280' } 
                  }}
                  domain={[-30, 50]}
                  ticks={[-30, -20, -10, 0, 10, 20, 30, 40, 50]}
                  className="dark:stroke-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                {temperatureMetrics.map((metric, index) => (
                  <Line
                    key={`temp-${metric.id}`}
                    type="monotone"
                    dataKey={`metric_${metric.id}`}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    name={`${metric.display_name} (${metric.unit})`}
                    unit={metric.unit}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Легенда температуры */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {temperatureMetrics.map((metric, index) => (
              <div key={`legend-temp-${metric.id}`} className="flex items-center gap-2">
                <div 
                  className="w-8 h-0.5 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {metric.display_name} ({metric.channel})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* График влажности */}
      {humidityMetrics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            График влажности
          </h2>
          
          <div className="w-full mb-6" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={formattedData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB"
                  className="dark:opacity-20"
                />
                <XAxis 
                  dataKey="rawTime"
                  tickFormatter={(value) => formatChartTime(value, timeRange)}
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  className="dark:stroke-gray-400"
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  label={{ 
                    value: '%', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fontSize: '14px', fill: '#6B7280' } 
                  }}
                  domain={[0, 100]}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  className="dark:stroke-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                {humidityMetrics.map((metric, index) => (
                  <Line
                    key={`humidity-${metric.id}`}
                    type="monotone"
                    dataKey={`metric_${metric.id}`}
                    stroke={colors[(temperatureMetrics.length + index) % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    name={`${metric.display_name} (${metric.unit})`}
                    unit={metric.unit}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Легенда влажности */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {humidityMetrics.map((metric, index) => (
              <div key={`legend-humidity-${metric.id}`} className="flex items-center gap-2">
                <div 
                  className="w-8 h-0.5 rounded"
                  style={{ backgroundColor: colors[(temperatureMetrics.length + index) % colors.length] }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {metric.display_name} ({metric.channel})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Сообщение если ничего не выбрано */}
      {temperatureMetrics.length === 0 && humidityMetrics.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300">
            Выберите метрики для отображения графика
          </p>
        </div>
      )}
    </div>
  );
}