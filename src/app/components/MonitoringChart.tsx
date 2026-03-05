import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonitoringChartProps {
  data: any[];
  visibleMetrics: string[];
}

export function MonitoringChart({ data, visibleMetrics }: MonitoringChartProps) {
  const temperatureMetrics = [
    { key: 't1', label: 'Т1', color: '#3B82F6', fullName: 'Температура слой 1' },
    { key: 't2', label: 'Т2', color: '#10B981', fullName: 'Температура слой 2' },
    { key: 't3', label: 'Т3', color: '#F59E0B', fullName: 'Температура слой 3' }
  ];

  const humidityMetric = {
    key: 'h1',
    label: 'Влажность',
    color: '#8B5CF6',
    fullName: 'Влажность'
  };

  // Проверяем, выбраны ли температурные метрики
  const hasTemperature = temperatureMetrics.some(metric => 
    visibleMetrics.includes(metric.fullName)
  );

  // Проверяем, выбрана ли влажность
  const hasHumidity = visibleMetrics.includes(humidityMetric.fullName);

  return (
    <div className="space-y-6">
      {/* График влажности (показывается первым, если выбран) */}
      {hasHumidity && (
        <div key="humidity-chart-container" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">График влажности</h2>
          
          <div className="w-full mb-6" style={{ height: '320px', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320} key="humidity-responsive">
              <LineChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  key="humidity-grid"
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB"
                />
                <XAxis 
                  key="humidity-xaxis"
                  dataKey="time" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  key="humidity-yaxis"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  key="humidity-tooltip"
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  key="humidity-line"
                  type="monotone"
                  dataKey={humidityMetric.key}
                  stroke={humidityMetric.color}
                  strokeWidth={2}
                  dot={false}
                  name={humidityMetric.label}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Легенда влажности */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div 
              className="w-8 h-0.5 rounded"
              style={{ backgroundColor: humidityMetric.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              {humidityMetric.label} (%)
            </span>
          </div>
        </div>
      )}

      {/* График температуры */}
      {hasTemperature && (
        <div key="temperature-chart-container" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">График температуры</h2>
          
          <div className="w-full mb-6" style={{ height: '320px', minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height={320} key="temperature-responsive">
              <LineChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  key="temperature-grid"
                  strokeDasharray="3 3" 
                  stroke="#E5E7EB"
                />
                <XAxis 
                  key="temperature-xaxis"
                  dataKey="time" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  key="temperature-yaxis"
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                />
                <Tooltip 
                  key="temperature-tooltip"
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {temperatureMetrics
                  .filter(metric => visibleMetrics.includes(metric.fullName))
                  .map((metric) => (
                    <Line
                      key={`temp-line-${metric.key}`}
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

          {/* Легенда температуры */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {temperatureMetrics
              .filter(metric => visibleMetrics.includes(metric.fullName))
              .map((metric) => (
                <div key={`legend-${metric.key}`} className="flex items-center gap-2">
                  <div 
                    className="w-8 h-0.5 rounded"
                    style={{ backgroundColor: metric.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {metric.label} - {metric.fullName}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Сообщение если ничего не выбрано */}
      {!hasTemperature && !hasHumidity && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300">Выберите метрики для отображения графика</p>
        </div>
      )}
    </div>
  );
}
