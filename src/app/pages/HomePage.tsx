import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { FiltersPanel } from '../components/FiltersPanel';
import { MonitoringChart } from '../components/MonitoringChart';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Station,
  Metric,
  TimeRange,
  DataFrequency,
  getStations,
  getMetrics,
  getCurrentValues,
  getHistoryData,
} from '../utils/api';

/**
 * ГЛАВНАЯ СТРАНИЦА СИСТЕМЫ ОНЛАЙН-МОНИТОРИНГА
 * Отображает графики и таблицы с данными из InfluxDB
 */

export function HomePage() {
  // Станции и метрики
  const [stations, setStations] = useState<Station[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Состояния фильтров
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [timeInterval, setTimeInterval] = useState<TimeRange>('1h');
  const [dataFrequency, setDataFrequency] = useState<DataFrequency>('1m');
  const [selectedMetricIds, setSelectedMetricIds] = useState<number[]>([]);
  const [showMin, setShowMin] = useState(false);
  const [showMax, setShowMax] = useState(false);

  // Данные
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentValues, setCurrentValues] = useState<{ [key: number]: number | null }>({});

  // Загрузка станций и метрик при монтировании
  useEffect(() => {
    loadInitialData();
  }, []);

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    if (selectedStation && selectedMetricIds.length > 0) {
      loadData();
    }
  }, [selectedStation, timeInterval, dataFrequency, selectedMetricIds]);

  // Автообновление каждые 10 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStation && selectedMetricIds.length > 0) {
        loadData(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedStation, selectedMetricIds, timeInterval, dataFrequency]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Загружаем станции
      const stationsResponse = await getStations();
      if (stationsResponse.success && stationsResponse.data) {
        const activeStations = stationsResponse.data.filter(s => s.is_active);
        setStations(activeStations);

        if (activeStations.length > 0) {
          setSelectedStation(activeStations[0]);
        }
      }

      // Загружаем метрики
      const metricsResponse = await getMetrics();
      if (metricsResponse.success && metricsResponse.data) {
        const activeMetrics = metricsResponse.data.filter(m => m.is_active);
        setMetrics(activeMetrics);

        // Автоматически выбираем метрики для графика
        const chartMetrics = activeMetrics.filter(m => m.show_in_chart).slice(0, 4);
        setSelectedMetricIds(chartMetrics.map(m => m.id));
      }
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Не удалось загрузить данные: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (silent = false) => {
    if (!selectedStation) return;

    try {
      if (!silent) setRefreshing(true);

      console.log('🏠 ========== loadData START ==========');
      console.log('🏠 selectedStation:', selectedStation);
      console.log('🏠 selectedMetricIds:', selectedMetricIds);

      // Загружаем текущие значения
      const currentResponse = await getCurrentValues(selectedStation.id);
      if (currentResponse.success && currentResponse.data) {
        console.log('📊 Текущие значения получены:', currentResponse.data.length, 'записей');
        console.log('📊 Первое текущее значение:', currentResponse.data[0]);
        setCurrentValues(currentResponse.data);
      }

      // Загружаем исторические данные
      if (selectedMetricIds.length > 0) {
        console.log('📥 ========== ЗАПРОС ИСТОРИЧЕСКИХ ДАННЫХ ==========');
        console.log('📥 Параметры:', {
          stationId: selectedStation.id,
          metricIds: selectedMetricIds,
          timeRange: timeInterval,
          frequency: dataFrequency,
        });
        
        const historyResponse = await getHistoryData({
          stationId: selectedStation.id,
          metricIds: selectedMetricIds,
          timeRange: timeInterval,
          frequency: dataFrequency,
        });

        console.log('📈 ========== ОТВЕТ С ИСТОРИЧЕСКИМИ ДАННЫМИ ==========');
        console.log('📈 Полный ответ:', historyResponse);
        
        if (historyResponse.success && historyResponse.data) {
          console.log('✅ Данных получено:', historyResponse.data.length, 'записей');
          console.log('🔍 Первая запись:', historyResponse.data[0]);
          console.log('🔍 Вторая запись:', historyResponse.data[1]);
          console.log('🔍 Последняя запись:', historyResponse.data[historyResponse.data.length - 1]);
          
          // Проверяем наличие metric_X полей
          if (historyResponse.data.length > 0) {
            const firstRecord = historyResponse.data[0];
            const metricKeys = Object.keys(firstRecord).filter(k => k.startsWith('metric_'));
            console.log('🔑 Найдены ключи метрик:', metricKeys);
            
            metricKeys.forEach(key => {
              console.log(`  - ${key}: ${firstRecord[key]}`);
            });
            
            if (metricKeys.length === 0) {
              console.error('❌ КРИТИЧНО: В данных НЕТ полей metric_X!');
              console.error('❌ Проверьте backend: /api/history должен возвращать metric_1, metric_2, и т.д.');
            }
          }
          
          setChartData(historyResponse.data);
        } else {
          console.error('❌ Нет данны�� или ошибка:', historyResponse);
        }
      } else {
        console.warn('⚠️ selectedMetricIds пуст, исторические данные не загружаются');
      }
      
      console.log('🏠 ========== loadData END ==========');
    } catch (error: any) {
      console.error('❌ Ошибка загрузки данных:', error);
      if (!silent) {
        toast.error('Не удалось загрузить данные: ' + (error.message || 'Неизвестная ошибка'));
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  // Обработчик изменения станции
  const handleStationChange = (stationName: string) => {
    const station = stations.find(s => s.display_name === stationName);
    if (station) {
      setSelectedStation(station);
      
      // Обновляем метрики для новой станции
      const stationMetrics = metrics.filter(m => 
        m.station_id === station.id && m.is_active && m.show_in_chart
      );
      setSelectedMetricIds(stationMetrics.slice(0, 4).map(m => m.id));
    }
  };

  // Обработчик изменения видимых метрик
  const handleMetricsChange = (metricNames: string[]) => {
    const selectedMetrics = metrics.filter(m => metricNames.includes(m.display_name));
    setSelectedMetricIds(selectedMetrics.map(m => m.id));
  };

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    loadData();
  };

  // Обработчик экспорта данных
  const handleExport = () => {
    toast.info('Функция экспорта доступна на странице "Экспорт"');
  };

  // Подготовка данных для компонентов
  const stationNames = stations.map(s => s.display_name);
  const availableMetrics = selectedStation
    ? metrics.filter(m => m.station_id === selectedStation.id && m.is_active)
    : [];
  const visibleMetricNames = metrics
    .filter(m => selectedMetricIds.includes(m.id))
    .map(m => m.display_name);

  console.log('🏠 HomePage render:', {
    stationsCount: stations.length,
    metricsCount: metrics.length,
    selectedStation: selectedStation?.display_name,
    availableMetricsCount: availableMetrics.length,
    selectedMetricIds,
    visibleMetricNames,
    chartDataLength: chartData.length
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-[#a1a1aa]">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Нет активных станций мониторинга
          </h2>
          <p className="text-gray-600 dark:text-[#a1a1aa] mb-6">
            Для начала работы необходимо создать станцию мониторинга и настроить метрики.
          </p>
          <Button onClick={() => window.location.href = '/stations'}>
            Перейти к настройке станций
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-[1920px] mx-auto p-6">
      {/* Заголовок с кнопкой обновления */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Мониторинг в реальном времени
          </h1>
          {selectedStation && (
            <p className="text-gray-600 dark:text-[#a1a1aa] mt-1">
              Станция: {selectedStation.display_name}
            </p>
          )}
        </div>
        <Button
          onClick={() => loadData()}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Левая колонка (70%) - График и Таблица */}
        <div className="flex-1 space-y-6" style={{ width: '70%' }}>
          {/* График */}
          <MonitoringChart
            data={chartData}
            visibleMetrics={visibleMetricNames}
            metrics={availableMetrics}
            timeRange={timeInterval}
          />

          {/* Таблица */}
          <DataTable
            data={chartData}
            visibleMetrics={visibleMetricNames}
            metrics={availableMetrics}
            showMin={showMin}
            showMax={showMax}
            currentValues={currentValues}
            onExport={handleExport}
            timeRange={timeInterval}
          />
        </div>

        {/* Правая колонка (30%) - Фильтры */}
        <aside className="flex-shrink-0" style={{ width: '30%' }}>
          <FiltersPanel
            stations={stationNames}
            selectedStation={selectedStation?.display_name || ''}
            onStationChange={handleStationChange}
            timeInterval={timeInterval}
            onTimeIntervalChange={setTimeInterval}
            dataFrequency={dataFrequency}
            onDataFrequencyChange={setDataFrequency}
            availableMetrics={availableMetrics.map(m => m.display_name)}
            visibleMetrics={visibleMetricNames}
            onMetricsChange={handleMetricsChange}
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