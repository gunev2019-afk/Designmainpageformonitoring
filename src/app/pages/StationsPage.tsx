import React, { useState, useEffect } from 'react';
import { PlusCircle, Server, Edit2, Trash2, Activity, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Station,
  Metric,
  getStations,
  getMetrics,
  createStation,
  updateStation,
  deleteStation,
  createMetric,
  updateMetric,
  deleteMetric,
} from '../utils/api';

/**
 * СТРАНИЦА УПРАВЛЕНИЯ СТАНЦИЯМИ И МЕТРИКАМИ
 * 
 * Только для администраторов
 */
export function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  // Диалоги
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);

  // Форма станции
  const [stationForm, setStationForm] = useState({
    display_name: '',
    bucket: '',
    measurement: '',
    is_active: true,
  });

  // Форма метрики
  const [metricForm, setMetricForm] = useState({
    station_id: 0,
    display_name: '',
    field: '',
    channel: '',
    unit: '',
    show_in_chart: true,
    show_in_table: true,
    show_in_export: true,
    is_active: true,
  });

  // Загрузка данных
  useEffect(() => {
    loadStations();
    loadMetrics();
  }, []);

  const loadStations = async () => {
    try {
      const response = await getStations();
      if (response.success && response.data) {
        setStations(response.data);
        if (response.data.length > 0 && !selectedStation) {
          setSelectedStation(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки станций:', error);
      toast.error('Не удалось загрузить станции');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await getMetrics();
      if (response.success && response.data) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки метрик:', error);
    }
  };

  // Станции
  const handleCreateStation = () => {
    setEditingStation(null);
    setStationForm({
      display_name: '',
      bucket: 'telemetry',
      measurement: '',
      is_active: true,
    });
    setIsStationDialogOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setStationForm({
      display_name: station.display_name,
      bucket: station.bucket,
      measurement: station.measurement,
      is_active: station.is_active,
    });
    setIsStationDialogOpen(true);
  };

  const handleSaveStation = async () => {
    try {
      if (editingStation) {
        await updateStation(editingStation.id, stationForm);
        toast.success('Станция обновлена');
      } else {
        await createStation(stationForm);
        toast.success('Станция создана');
      }
      setIsStationDialogOpen(false);
      loadStations();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения станции');
    }
  };

  const handleDeleteStation = async (station: Station) => {
    if (!confirm(`Удалить станцию "${station.display_name}"? Все связанные метрики также будут удалены.`)) {
      return;
    }

    try {
      await deleteStation(station.id);
      toast.success('Станция удалена');
      if (selectedStation?.id === station.id) {
        setSelectedStation(stations[0] || null);
      }
      loadStations();
      loadMetrics();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления станции');
    }
  };

  // Метрики
  const handleCreateMetric = () => {
    if (!selectedStation) {
      toast.error('Выберите станцию');
      return;
    }

    setEditingMetric(null);
    setMetricForm({
      station_id: selectedStation.id,
      display_name: '',
      field: '',
      channel: '',
      unit: '',
      show_in_chart: true,
      show_in_table: true,
      show_in_export: true,
      is_active: true,
    });
    setIsMetricDialogOpen(true);
  };

  const handleEditMetric = (metric: Metric) => {
    setEditingMetric(metric);
    setMetricForm({
      station_id: metric.station_id,
      display_name: metric.display_name,
      field: metric.field,
      channel: metric.channel,
      unit: metric.unit,
      show_in_chart: metric.show_in_chart,
      show_in_table: metric.show_in_table,
      show_in_export: metric.show_in_export,
      is_active: metric.is_active,
    });
    setIsMetricDialogOpen(true);
  };

  const handleSaveMetric = async () => {
    try {
      if (editingMetric) {
        await updateMetric(editingMetric.id, metricForm);
        toast.success('Метрика обновлена');
      } else {
        await createMetric(metricForm);
        toast.success('Метрика создана');
      }
      setIsMetricDialogOpen(false);
      loadMetrics();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения метрики');
    }
  };

  const handleDeleteMetric = async (metric: Metric) => {
    if (!confirm(`Удалить метрику "${metric.display_name}"?`)) {
      return;
    }

    try {
      await deleteMetric(metric.id);
      toast.success('Метрика удалена');
      loadMetrics();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления метрики');
    }
  };

  // Фильтрация метрик по выбранной станции
  const filteredMetrics = selectedStation
    ? metrics.filter(m => m.station_id === selectedStation.id)
    : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-[#a1a1aa]">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Управление станциями и метриками
        </h1>
        <p className="text-gray-600 dark:text-[#a1a1aa]">
          Настройка станций мониторинга и их метрик для отображения данных из InfluxDB
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка: Станции */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Станции мониторинга
              </CardTitle>
              <CardDescription>
                Список всех станций ({stations.length})
              </CardDescription>
            </div>
            <Button onClick={handleCreateStation} size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedStation?.id === station.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-[#27272a] hover:border-gray-300 dark:hover:border-[#3f3f46]'
                  }`}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {station.display_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-[#a1a1aa]">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {station.bucket}
                        </span>
                        <span>→</span>
                        <span>{station.measurement}</span>
                      </div>
                    </div>
                    <Badge variant={station.is_active ? 'default' : 'secondary'}>
                      {station.is_active ? 'Активна' : 'Отключена'}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStation(station);
                      }}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStation(station);
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}

              {stations.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-[#71717a]">
                  Нет станций. Создайте первую станцию.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Правая колонка: Метрики */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Метрики
                {selectedStation && ` - ${selectedStation.display_name}`}
              </CardTitle>
              <CardDescription>
                Метрики выбранной станции ({filteredMetrics.length})
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateMetric}
              size="sm"
              disabled={!selectedStation}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-[#27272a]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {metric.display_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-[#a1a1aa]">
                        <span>Field: {metric.field}</span>
                        <span>•</span>
                        <span>Channel: {metric.channel}</span>
                        <span>•</span>
                        <span>Unit: {metric.unit}</span>
                      </div>
                    </div>
                    <Badge variant={metric.is_active ? 'default' : 'secondary'}>
                      {metric.is_active ? 'Активна' : 'Отключена'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    {metric.show_in_chart && (
                      <Badge variant="outline">График</Badge>
                    )}
                    {metric.show_in_table && (
                      <Badge variant="outline">Таблица</Badge>
                    )}
                    {metric.show_in_export && (
                      <Badge variant="outline">Экспорт</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMetric(metric)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMetric(metric)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}

              {selectedStation && filteredMetrics.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-[#71717a]">
                  Нет метрик для этой станции. Создайте первую метрику.
                </div>
              )}

              {!selectedStation && (
                <div className="text-center py-8 text-gray-500 dark:text-[#71717a]">
                  Выберите станцию для просмотра метрик
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Диалог создания/редактирования станции */}
      <Dialog open={isStationDialogOpen} onOpenChange={setIsStationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStation ? 'Редактировать станцию' : 'Создать станцию'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о станции мониторинга
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="station-name">Название станции</Label>
              <Input
                id="station-name"
                value={stationForm.display_name}
                onChange={(e) =>
                  setStationForm({ ...stationForm, display_name: e.target.value })
                }
                placeholder="LOGO Лаборатория"
              />
            </div>
            <div>
              <Label htmlFor="station-bucket">Bucket (InfluxDB)</Label>
              <Input
                id="station-bucket"
                value={stationForm.bucket}
                onChange={(e) =>
                  setStationForm({ ...stationForm, bucket: e.target.value })
                }
                placeholder="telemetry"
              />
            </div>
            <div>
              <Label htmlFor="station-measurement">Measurement (InfluxDB)</Label>
              <Input
                id="station-measurement"
                value={stationForm.measurement}
                onChange={(e) =>
                  setStationForm({ ...stationForm, measurement: e.target.value })
                }
                placeholder="lab"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="station-active"
                checked={stationForm.is_active}
                onCheckedChange={(checked) =>
                  setStationForm({ ...stationForm, is_active: checked })
                }
              />
              <Label htmlFor="station-active">Активна</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStationDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveStation}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог создания/редактирования метрики */}
      <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Редактировать метрику' : 'Создать метрику'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о метрике
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="metric-name">Название метрики</Label>
              <Input
                id="metric-name"
                value={metricForm.display_name}
                onChange={(e) =>
                  setMetricForm({ ...metricForm, display_name: e.target.value })
                }
                placeholder="Температура слой 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metric-field">Field (InfluxDB)</Label>
                <Input
                  id="metric-field"
                  value={metricForm.field}
                  onChange={(e) =>
                    setMetricForm({ ...metricForm, field: e.target.value })
                  }
                  placeholder="температура"
                />
              </div>
              <div>
                <Label htmlFor="metric-channel">Channel (Tag)</Label>
                <Input
                  id="metric-channel"
                  value={metricForm.channel}
                  onChange={(e) =>
                    setMetricForm({ ...metricForm, channel: e.target.value })
                  }
                  placeholder="AI1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="metric-unit">Единица измерения</Label>
              <Input
                id="metric-unit"
                value={metricForm.unit}
                onChange={(e) =>
                  setMetricForm({ ...metricForm, unit: e.target.value })
                }
                placeholder="°C"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="metric-chart"
                  checked={metricForm.show_in_chart}
                  onCheckedChange={(checked) =>
                    setMetricForm({ ...metricForm, show_in_chart: checked })
                  }
                />
                <Label htmlFor="metric-chart">Показывать на графиках</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="metric-table"
                  checked={metricForm.show_in_table}
                  onCheckedChange={(checked) =>
                    setMetricForm({ ...metricForm, show_in_table: checked })
                  }
                />
                <Label htmlFor="metric-table">Показывать в таблице</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="metric-export"
                  checked={metricForm.show_in_export}
                  onCheckedChange={(checked) =>
                    setMetricForm({ ...metricForm, show_in_export: checked })
                  }
                />
                <Label htmlFor="metric-export">Доступно для экспорта</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="metric-active"
                  checked={metricForm.is_active}
                  onCheckedChange={(checked) =>
                    setMetricForm({ ...metricForm, is_active: checked })
                  }
                />
                <Label htmlFor="metric-active">Активна</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMetricDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveMetric}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
