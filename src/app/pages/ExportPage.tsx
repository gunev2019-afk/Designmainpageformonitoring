import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { FiltersPanel } from '../components/FiltersPanel';

/**
 * СТРАНИЦА ЭКСПОРТА ДАННЫХ
 * Позволяет скачивать данные в формате Excel с применением фильтров
 */

export function ExportPage() {
  // Состояния фильтров
  const [selectedStation, setSelectedStation] = useState('LOGO Тверская');
  const [timeInterval, setTimeInterval] = useState('1 час');
  const [dataFrequency, setDataFrequency] = useState('1 мин');
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>([
    'Температура слой 1',
    'Температура слой 2',
    'Температура слой 3'
  ]);
  const [showMin, setShowMin] = useState(false);
  const [showMax, setShowMax] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Генерация mock данных для экспорта
  const generateExportData = () => {
    const data = [];
    const now = new Date();
    
    // Определяем количество точек на основе интервала
    let pointsCount = 60;
    if (timeInterval === '24 часа') pointsCount = 288; // каждые 5 минут
    if (timeInterval === '7 дней') pointsCount = 336; // каждый час
    
    for (let i = 0; i < pointsCount; i++) {
      const time = new Date(now.getTime() - (pointsCount - i - 1) * 60000);
      const row: any = {
        Время: time.toLocaleString('ru-RU')
      };
      
      if (visibleMetrics.includes('Температура слой 1')) {
        row['Температура слой 1 (°C)'] = (24 + Math.sin(i / 10) * 3 + Math.random() * 0.5).toFixed(1);
      }
      if (visibleMetrics.includes('Температура слой 2')) {
        row['Температура слой 2 (°C)'] = (26 + Math.cos(i / 8) * 2 + Math.random() * 0.5).toFixed(1);
      }
      if (visibleMetrics.includes('Температура слой 3')) {
        row['Температура слой 3 (°C)'] = (22 + Math.sin(i / 12) * 2.5 + Math.random() * 0.5).toFixed(1);
      }
      if (visibleMetrics.includes('Влажность')) {
        row['Влажность (%)'] = (45 + Math.sin(i / 15) * 10 + Math.random() * 2).toFixed(1);
      }
      
      data.push(row);
    }
    
    return data;
  };

  // Обработчик экспорта в Excel
  const handleExportToExcel = () => {
    setIsExporting(true);
    
    try {
      // Генерируем данные для экспорта
      const data = generateExportData();
      
      // Создаем worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Создаем workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Данные мониторинга');
      
      // Формируем имя файла с датой и временем
      const fileName = `Мониторинг_${selectedStation}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      // Скачиваем файл
      XLSX.writeFile(workbook, fileName);
      
      console.log('Экспорт выполнен:', {
        station: selectedStation,
        interval: timeInterval,
        frequency: dataFrequency,
        metrics: visibleMetrics,
        showMin: showMin,
        showMax: showMax,
        recordsCount: data.length
      });
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Произошла ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyFilters = () => {
    console.log('Фильтры обновлены для экспорта');
  };

  return (
    <main className="max-w-[1920px] mx-auto p-6">
      <div className="flex gap-6">
        {/* Левая колонка (70%) - Информация об экспорте */}
        <div className="flex-1 space-y-6" style={{ width: '70%' }}>
          {/* Карточка с информацией */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Экспорт данных</h1>
                <p className="text-gray-600 dark:text-gray-400">Скачайте данные мониторинга в формате Excel</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Текущие параметры экспорта:</h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  <li><span className="font-medium">Станция:</span> {selectedStation}</li>
                  <li><span className="font-medium">Временной интервал:</span> {timeInterval}</li>
                  <li><span className="font-medium">Частота данных:</span> {dataFrequency}</li>
                  <li><span className="font-medium">Выбранные метрики:</span> {visibleMetrics.length > 0 ? visibleMetrics.join(', ') : 'Не выбрано'}</li>
                  {showMin && <li><span className="font-medium">Включить столбец:</span> Минимум</li>}
                  {showMax && <li><span className="font-medium">Включить столбец:</span> Максимум</li>}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Формат файла:</h3>
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Данные будут экспортированы в формате Microsoft Excel (.xlsx).
                  Файл будет содержать все выбранные метрики за указанный временной период.
                </p>
              </div>
            </div>

            {/* Кнопка экспорта */}
            <button
              onClick={handleExportToExcel}
              disabled={isExporting || visibleMetrics.length === 0}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-6 h-6" />
              {isExporting ? 'Экспорт...' : 'Скачать Excel файл'}
            </button>

            {visibleMetrics.length === 0 && (
              <p className="text-center text-sm text-red-600 dark:text-red-400 mt-3">
                Выберите хотя бы одну метрику для экспорта
              </p>
            )}
          </div>

          {/* Дополнительная информация */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Инструкция по экспорту</h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">1</span>
                <p>Настройте фильтры в правой панели: выберите станцию, временной интервал и метрики</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">2</span>
                <p>При необходимости укажите минимальное и максимальное значения для фильтрации</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">3</span>
                <p>Нажмите кнопку "Применить фильтры" для обновления параметров экспорта</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">4</span>
                <p>Нажмите "Скачать Excel файл" для получения данных</p>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка (30%) - Фильтры */}
        <aside className="flex-shrink-0" style={{ width: '30%' }}>
          <FiltersPanel
            selectedStation={selectedStation}
            onStationChange={setSelectedStation}
            timeInterval={timeInterval}
            onTimeIntervalChange={setTimeInterval}
            dataFrequency={dataFrequency}
            onDataFrequencyChange={setDataFrequency}
            visibleMetrics={visibleMetrics}
            onMetricsChange={setVisibleMetrics}
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
