import React, { useState, useEffect } from 'react';
import { Settings, Plus, Pencil, Trash2, Database, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

/**
 * СТРАНИЦА МЕТРИКИ ДЛЯ АДМИНИСТРАТОРА
 * 
 * Позволяет управлять станциями и метриками для InfluxDB:
 * - Добавление/редактирование/удаление станций
 * - Привязка станций к bucket и measurement из InfluxDB
 * - Добавление/редактирование/удаление метрик станций
 * - Привязка метрик к _field и channel из InfluxDB
 * 
 * DEV MODE КОММЕНТАРИИ:
 * - bucket, measurement, field и channel используются для построения запросов к InfluxDB
 * - На главной странице пользователь выбирает станцию по display name, а backend подставляет реальный measurement
 * - Метрики подтягиваются динамически в зависимости от выбранной станции
 * - Для графика и таблицы backend использует настройки метрик из админки
 */

// Типы данных
interface Station {
  id: string;
  displayName: string;
  bucket: string;
  measurement: string;
  isActive: boolean;
}

interface Metric {
  id: string;
  stationId: string;
  displayName: string;
  field: string;
  channel: string;
  unit: string;
  showInChart: boolean;
  showInTable: boolean;
  showInExport: boolean;
  isActive: boolean;
}

type ActiveSection = 'stations' | 'metrics';

const STORAGE_KEY_STATIONS = 'influx_stations';
const STORAGE_KEY_METRICS = 'influx_metrics';

export function MetricsPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('stations');
  
  // Станции
  const [stations, setStations] = useState<Station[]>([]);
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  
  // Метрики
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  
  // Сообщения
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedStations = localStorage.getItem(STORAGE_KEY_STATIONS);
    const savedMetrics = localStorage.getItem(STORAGE_KEY_METRICS);
    
    if (savedStations) {
      setStations(JSON.parse(savedStations));
    } else {
      // Инициализация с примерами
      const initialStations: Station[] = [
        {
          id: '1',
          displayName: 'LOGO Лаборатория',
          bucket: 'telemetry',
          measurement: 'lab',
          isActive: true
        },
        {
          id: '2',
          displayName: 'LOGO Цех 1',
          bucket: 'telemetry',
          measurement: 'ceh1',
          isActive: true
        }
      ];
      setStations(initialStations);
      localStorage.setItem(STORAGE_KEY_STATIONS, JSON.stringify(initialStations));
    }
    
    if (savedMetrics) {
      setMetrics(JSON.parse(savedMetrics));
    } else {
      // Инициализация с примерами
      const initialMetrics: Metric[] = [
        {
          id: '1',
          stationId: '1',
          displayName: 'Температура слой 1',
          field: 'температура',
          channel: 'AI1',
          unit: '°C',
          showInChart: true,
          showInTable: true,
          showInExport: true,
          isActive: true
        },
        {
          id: '2',
          stationId: '1',
          displayName: 'Температура слой 2',
          field: 'температура',
          channel: 'AI2',
          unit: '°C',
          showInChart: true,
          showInTable: true,
          showInExport: true,
          isActive: true
        },
        {
          id: '3',
          stationId: '1',
          displayName: 'Температура слой 3',
          field: 'температура',
          channel: 'AI3',
          unit: '°C',
          showInChart: true,
          showInTable: true,
          showInExport: true,
          isActive: true
        },
        {
          id: '4',
          stationId: '1',
          displayName: 'Влажность',
          field: 'влажность',
          channel: 'AI1',
          unit: '%',
          showInChart: true,
          showInTable: true,
          showInExport: true,
          isActive: false
        }
      ];
      setMetrics(initialMetrics);
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(initialMetrics));
    }
  }, []);

  // Сохранение станций в localStorage
  const saveStations = (newStations: Station[]) => {
    setStations(newStations);
    localStorage.setItem(STORAGE_KEY_STATIONS, JSON.stringify(newStations));
  };

  // Сохранение метрик в localStorage
  const saveMetrics = (newMetrics: Metric[]) => {
    setMetrics(newMetrics);
    localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(newMetrics));
  };

  // Показать сообщение
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // === СТАНЦИИ ===
  
  const handleAddStation = () => {
    setEditingStation(null);
    setIsStationDialogOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setIsStationDialogOpen(true);
  };

  const handleDeleteStation = (id: string) => {
    const station = stations.find(s => s.id === id);
    if (!station) return;
    
    if (window.confirm(`Вы уверены, что хотите удалить станцию "${station.displayName}"? Все связанные метрики также будут удалены.`)) {
      const newStations = stations.filter(s => s.id !== id);
      const newMetrics = metrics.filter(m => m.stationId !== id);
      saveStations(newStations);
      saveMetrics(newMetrics);
      showMessage('success', 'Станция успешно удалена');
    }
  };

  const handleSaveStation = (data: Omit<Station, 'id'>) => {
    if (editingStation) {
      // Редактирование
      const newStations = stations.map(s => 
        s.id === editingStation.id ? { ...data, id: editingStation.id } : s
      );
      saveStations(newStations);
      showMessage('success', 'Станция успешно обновлена');
    } else {
      // Создание
      const newStation: Station = {
        ...data,
        id: Date.now().toString()
      };
      saveStations([...stations, newStation]);
      showMessage('success', 'Станция успешно добавлена');
    }
    setIsStationDialogOpen(false);
  };

  // === МЕТРИКИ ===
  
  const handleAddMetric = () => {
    if (!selectedStationId) {
      showMessage('error', 'Выберите станцию для добавления метрики');
      return;
    }
    setEditingMetric(null);
    setIsMetricDialogOpen(true);
  };

  const handleEditMetric = (metric: Metric) => {
    setEditingMetric(metric);
    setIsMetricDialogOpen(true);
  };

  const handleDeleteMetric = (id: string) => {
    const metric = metrics.find(m => m.id === id);
    if (!metric) return;
    
    if (window.confirm(`Вы уверены, что хотите удалить метрику "${metric.displayName}"?`)) {
      const newMetrics = metrics.filter(m => m.id !== id);
      saveMetrics(newMetrics);
      showMessage('success', 'Метрика успешно удалена');
    }
  };

  const handleSaveMetric = (data: Omit<Metric, 'id'>) => {
    if (editingMetric) {
      // Редактирование
      const newMetrics = metrics.map(m => 
        m.id === editingMetric.id ? { ...data, id: editingMetric.id } : m
      );
      saveMetrics(newMetrics);
      showMessage('success', 'Метрика успешно обновлена');
    } else {
      // Создание
      const newMetric: Metric = {
        ...data,
        id: Date.now().toString()
      };
      saveMetrics([...metrics, newMetric]);
      showMessage('success', 'Метрика успешно добавлена');
    }
    setIsMetricDialogOpen(false);
  };

  // Фильтрация метрик по выбранной станции
  const filteredMetrics = selectedStationId 
    ? metrics.filter(m => m.stationId === selectedStationId)
    : [];

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-gray-900 dark:text-[#fafafa]">
              Управление метриками
            </h1>
          </div>
          <p className="text-gray-600 dark:text-[#a1a1aa]">
            Настройка станций и метрик для мониторинга данных из InfluxDB
          </p>
        </div>

        {/* Сообщения */}
        {message && (
          <div className={`mb-6 flex items-center gap-2 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' 
              : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p className={message.type === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-red-700 dark:text-red-400'
            }>
              {message.text}
            </p>
          </div>
        )}

        {/* Переключатель секций */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeSection === 'stations' ? 'default' : 'outline'}
            onClick={() => setActiveSection('stations')}
            className={activeSection === 'stations' 
              ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-[#fafafa] border-gray-300 dark:border-[#3f3f46] hover:bg-gray-100 dark:hover:bg-[#3f3f46]'
            }
          >
            <Database className="w-4 h-4 mr-2" />
            Станции
          </Button>
          <Button
            variant={activeSection === 'metrics' ? 'default' : 'outline'}
            onClick={() => setActiveSection('metrics')}
            className={activeSection === 'metrics' 
              ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-[#fafafa] border-gray-300 dark:border-[#3f3f46] hover:bg-gray-100 dark:hover:bg-[#3f3f46]'
            }
          >
            <Activity className="w-4 h-4 mr-2" />
            Метрики станций
          </Button>
        </div>

        {/* СЕКЦИЯ СТАНЦИЙ */}
        {activeSection === 'stations' && (
          <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3f3f46] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-[#fafafa]">Станции</h2>
                  <p className="text-gray-500 dark:text-[#a1a1aa]">Управление станциями мониторинга</p>
                </div>
              </div>
              <Button
                onClick={handleAddStation}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить станцию
              </Button>
            </div>

            {/* Таблица станций */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#3f3f46]">
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Отображаемое название</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Bucket</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Measurement</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Статус</th>
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station) => (
                    <tr key={station.id} className="border-b border-gray-100 dark:border-[#3f3f46] hover:bg-gray-50 dark:hover:bg-[#3f3f46]/50">
                      <td className="py-3 px-4 text-gray-600 dark:text-[#a1a1aa]">{station.id}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-[#fafafa] font-medium">{station.displayName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-[#a1a1aa] font-mono text-sm">{station.bucket}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-[#a1a1aa] font-mono text-sm">{station.measurement}</td>
                      <td className="py-3 px-4">
                        {station.isActive ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded text-sm">
                            Активна
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-[#3f3f46] text-gray-600 dark:text-[#a1a1aa] rounded text-sm">
                            Неактивна
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStation(station)}
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStation(station.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-[#a1a1aa]">
                        Нет станций. Добавьте первую станцию.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* СЕКЦИЯ МЕТРИК */}
        {activeSection === 'metrics' && (
          <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3f3f46] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-[#fafafa]">Метрики станций</h2>
                  <p className="text-gray-500 dark:text-[#a1a1aa]">Управление метриками для каждой станции</p>
                </div>
              </div>
            </div>

            {/* Выбор станции и кнопка добавления */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label className="text-gray-700 dark:text-[#fafafa] mb-2 block">
                  Выберите станцию
                </Label>
                <Select value={selectedStationId} onValueChange={setSelectedStationId}>
                  <SelectTrigger className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]">
                    <SelectValue placeholder="Выберите станцию" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddMetric}
                  disabled={!selectedStationId}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить метрику
                </Button>
              </div>
            </div>

            {/* Таблица метрик */}
            {selectedStationId ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#3f3f46]">
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Название на сайте</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Field</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Channel</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Единица</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Где отображать</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Статус</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-[#fafafa] font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMetrics.map((metric) => (
                      <tr key={metric.id} className="border-b border-gray-100 dark:border-[#3f3f46] hover:bg-gray-50 dark:hover:bg-[#3f3f46]/50">
                        <td className="py-3 px-4 text-gray-900 dark:text-[#fafafa] font-medium">{metric.displayName}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-[#a1a1aa] font-mono text-sm">{metric.field}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-[#a1a1aa] font-mono text-sm">{metric.channel}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-[#a1a1aa]">{metric.unit}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {metric.showInChart && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                                График
                              </span>
                            )}
                            {metric.showInTable && (
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded text-xs">
                                Таблица
                              </span>
                            )}
                            {metric.showInExport && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs">
                                Экспорт
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {metric.isActive ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded text-sm">
                              Активна
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-[#3f3f46] text-gray-600 dark:text-[#a1a1aa] rounded text-sm">
                              Неактивна
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMetric(metric)}
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMetric(metric.id)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMetrics.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-[#a1a1aa]">
                          Нет метрик для выбранной станции. Добавьте первую метрику.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-[#a1a1aa]">
                Выберите станцию для просмотра и управления метриками
              </div>
            )}
          </div>
        )}

        {/* Информационная панель */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-900 dark:text-blue-400 mb-3 font-medium">
            Связь с главной страницей
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Список станций на главной странице берется из секции "Станции"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>При выборе станции на главной отображаются только те метрики, которые привязаны к этой станции</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Каждая метрика знает, какой _field и какой channel использовать в запросе к InfluxDB</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Bucket общий, но может задаваться на уровне станции</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Название станции и название метрики на сайте могут отличаться от технических значений в InfluxDB</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Диалог добавления/редактирования станции */}
      <StationDialog
        open={isStationDialogOpen}
        onOpenChange={setIsStationDialogOpen}
        station={editingStation}
        onSave={handleSaveStation}
      />

      {/* Диалог добавления/редактирования метрики */}
      <MetricDialog
        open={isMetricDialogOpen}
        onOpenChange={setIsMetricDialogOpen}
        metric={editingMetric}
        stationId={selectedStationId}
        stations={stations}
        onSave={handleSaveMetric}
      />
    </div>
  );
}

// === ДИАЛОГ СТАНЦИИ ===

interface StationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: Station | null;
  onSave: (data: Omit<Station, 'id'>) => void;
}

function StationDialog({ open, onOpenChange, station, onSave }: StationDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [bucket, setBucket] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (station) {
      setDisplayName(station.displayName);
      setBucket(station.bucket);
      setMeasurement(station.measurement);
      setIsActive(station.isActive);
    } else {
      setDisplayName('');
      setBucket('');
      setMeasurement('');
      setIsActive(true);
    }
  }, [station, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName,
      bucket,
      measurement,
      isActive
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#27272a] border-gray-200 dark:border-[#3f3f46] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-[#fafafa]">
            {station ? 'Редактировать станцию' : 'Добавить станцию'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-[#a1a1aa]">
            Заполните информацию о станции мониторинга
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-gray-700 dark:text-[#fafafa]">
              Отображаемое название станции
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="LOGO Лаборатория"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bucket" className="text-gray-700 dark:text-[#fafafa]">
              Bucket
            </Label>
            <Input
              id="bucket"
              type="text"
              placeholder="telemetry"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa] font-mono"
              required
            />
            <p className="text-gray-500 dark:text-[#a1a1aa] text-sm">
              Bucket в InfluxDB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="measurement" className="text-gray-700 dark:text-[#fafafa]">
              Measurement
            </Label>
            <Input
              id="measurement"
              type="text"
              placeholder="lab"
              value={measurement}
              onChange={(e) => setMeasurement(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa] font-mono"
              required
            />
            <p className="text-gray-500 dark:text-[#a1a1aa] text-sm">
              Это реальное значение _measurement в InfluxDB
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="isActive" className="text-gray-700 dark:text-[#fafafa]">
              Активна
            </Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-700 dark:text-[#fafafa] border-gray-300 dark:border-[#3f3f46] hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// === ДИАЛОГ МЕТРИКИ ===

interface MetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: Metric | null;
  stationId: string;
  stations: Station[];
  onSave: (data: Omit<Metric, 'id'>) => void;
}

function MetricDialog({ open, onOpenChange, metric, stationId, stations, onSave }: MetricDialogProps) {
  const [selectedStationId, setSelectedStationId] = useState(stationId);
  const [displayName, setDisplayName] = useState('');
  const [field, setField] = useState('');
  const [channel, setChannel] = useState('');
  const [unit, setUnit] = useState('');
  const [showInChart, setShowInChart] = useState(true);
  const [showInTable, setShowInTable] = useState(true);
  const [showInExport, setShowInExport] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (metric) {
      setSelectedStationId(metric.stationId);
      setDisplayName(metric.displayName);
      setField(metric.field);
      setChannel(metric.channel);
      setUnit(metric.unit);
      setShowInChart(metric.showInChart);
      setShowInTable(metric.showInTable);
      setShowInExport(metric.showInExport);
      setIsActive(metric.isActive);
    } else {
      setSelectedStationId(stationId);
      setDisplayName('');
      setField('');
      setChannel('');
      setUnit('');
      setShowInChart(true);
      setShowInTable(true);
      setShowInExport(true);
      setIsActive(true);
    }
  }, [metric, stationId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      stationId: selectedStationId,
      displayName,
      field,
      channel,
      unit,
      showInChart,
      showInTable,
      showInExport,
      isActive
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#27272a] border-gray-200 dark:border-[#3f3f46] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-[#fafafa]">
            {metric ? 'Редактировать метрику' : 'Добавить метрику'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-[#a1a1aa]">
            Заполните информацию о метрике станции
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stationId" className="text-gray-700 dark:text-[#fafafa]">
              Станция
            </Label>
            <Select value={selectedStationId} onValueChange={setSelectedStationId}>
              <SelectTrigger className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-gray-700 dark:text-[#fafafa]">
              Название метрики на сайте
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Температура слой 1"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field" className="text-gray-700 dark:text-[#fafafa]">
              _field
            </Label>
            <Input
              id="field"
              type="text"
              placeholder="температура"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa] font-mono"
              required
            />
            <p className="text-gray-500 dark:text-[#a1a1aa] text-sm">
              _field — это реальное значение поля в InfluxDB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel" className="text-gray-700 dark:text-[#fafafa]">
              channel
            </Label>
            <Input
              id="channel"
              type="text"
              placeholder="AI1"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa] font-mono"
              required
            />
            <p className="text-gray-500 dark:text-[#a1a1aa] text-sm">
              channel — это тег или канал, например AI1, AI2, AI3
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-gray-700 dark:text-[#fafafa]">
              Единица измерения
            </Label>
            <Input
              id="unit"
              type="text"
              placeholder="°C"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-[#fafafa]">
              Отображать в:
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showInChart" className="text-gray-600 dark:text-[#a1a1aa] font-normal">
                  График
                </Label>
                <Switch
                  id="showInChart"
                  checked={showInChart}
                  onCheckedChange={setShowInChart}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showInTable" className="text-gray-600 dark:text-[#a1a1aa] font-normal">
                  Таблица
                </Label>
                <Switch
                  id="showInTable"
                  checked={showInTable}
                  onCheckedChange={setShowInTable}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showInExport" className="text-gray-600 dark:text-[#a1a1aa] font-normal">
                  Экспорт
                </Label>
                <Switch
                  id="showInExport"
                  checked={showInExport}
                  onCheckedChange={setShowInExport}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="isActive" className="text-gray-700 dark:text-[#fafafa]">
              Активна
            </Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-700 dark:text-[#fafafa] border-gray-300 dark:border-[#3f3f46] hover:bg-gray-100 dark:hover:bg-[#3f3f46]"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
