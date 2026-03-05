import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * СТРАНИЦА ЛОГОВ СИСТЕМЫ
 * Отображает системные события, ошибки и предупреждения
 */

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  station: string;
  message: string;
  details?: string;
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Генерация mock данных для логов
  useEffect(() => {
    const mockLogs: LogEntry[] = [];
    const stations = ['LOGO Тверская', 'LOGO Арбат', 'LOGO Нагатинская набережная'];
    const levels: Array<'info' | 'warning' | 'error' | 'success'> = ['info', 'warning', 'error', 'success'];
    const messages = [
      'Система мониторинга запущена',
      'Успешное подключение к InfluxDB',
      'Получены данные от датчиков',
      'Высокая температура на слое 2',
      'Потеря связи с датчиком',
      'Восстановление соединения с датчиком',
      'Превышен лимит значений влажности',
      'Успешное сохранение данных',
      'Ошибка чтения данных с датчика',
      'Запущен процесс калибровки',
      'Завершена калибровка датчиков',
      'Предупреждение: низкий уровень заряда батареи'
    ];

    for (let i = 0; i < 50; i++) {
      const now = new Date();
      mockLogs.push({
        id: `log-${i}`,
        timestamp: new Date(now.getTime() - i * 5 * 60000), // каждые 5 минут
        level: levels[Math.floor(Math.random() * levels.length)],
        station: stations[Math.floor(Math.random() * stations.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        details: Math.random() > 0.7 ? 'Дополнительная информация о событии' : undefined
      });
    }

    setLogs(mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, []);

  // Фильтрация логов
  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterStation !== 'all' && log.station !== filterStation) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Получение иконки для типа лога
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  // Получение цвета для типа лога
  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 shadow-sm';
      case 'warning':
        return 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30 shadow-sm';
      case 'success':
        return 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 shadow-sm';
      default:
        return 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-sm';
    }
  };

  // Статистика логов
  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length,
    success: logs.filter(l => l.level === 'success').length
  };

  return (
    <main className="max-w-[1920px] mx-auto p-6">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Логи системы</h1>
          <p className="text-gray-600 dark:text-gray-400">Системные события, ошибки и предупреждения мониторинга</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-colors duration-300">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего событий</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
            <div className="text-sm text-red-600 dark:text-red-400 mb-1">Ошибки</div>
            <div className="text-2xl font-semibold text-red-900 dark:text-red-300">{stats.errors}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Предупреждения</div>
            <div className="text-2xl font-semibold text-yellow-900 dark:text-yellow-300">{stats.warnings}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Информация</div>
            <div className="text-2xl font-semibold text-blue-900 dark:text-blue-300">{stats.info}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Успешно</div>
            <div className="text-2xl font-semibold text-green-900 dark:text-green-300">{stats.success}</div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <div className="flex items-center gap-4">
            {/* Поиск */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по логам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Фильтр по типу */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все типы</option>
                <option value="error">Ошибки</option>
                <option value="warning">Предупреждения</option>
                <option value="info">Информация</option>
                <option value="success">Успешно</option>
              </select>
            </div>

            {/* Фильтр по станции */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <select
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все станции</option>
                <option value="LOGO Тверская">LOGO Тверская</option>
                <option value="LOGO Арбат">LOGO Арбат</option>
                <option value="LOGO Нагатинская набережная">LOGO Нагатинская набережная</option>
              </select>
            </div>
          </div>
        </div>

        {/* Список логов */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Info className="w-12 h-12 mx-auto mb-3 text-gray-500 dark:text-gray-500" />
                <p>Логи не найдены</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${getLogColor(log.level)}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Иконка */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.level)}
                    </div>

                    {/* Содержимое */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{log.message}</h3>
                        <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {log.timestamp.toLocaleString('ru-RU')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{log.station}</span>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="capitalize">{log.level}</span>
                      </div>
                      {log.details && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredLogs.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Показано {filteredLogs.length} из {logs.length} событий
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
