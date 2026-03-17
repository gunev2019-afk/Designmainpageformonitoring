/**
 * API РОУТЫ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ИЗ INFLUXDB
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { findById, findWhere } from '../config/database';
import { Station, Metric, TimeRange, DataFrequency } from '../types/models';
import { queryInfluxData, queryCurrentValues, InfluxQueryParams } from '../services/influxdb.service';

const router = Router();

/**
 * GET /api/data/current/:stationId - Получить текущие значения метрик
 */
router.get('/current/:stationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stationId = parseInt(req.params.stationId, 10);
    
    if (isNaN(stationId)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID станции',
      });
    }
    
    // Получаем станцию
    const station = findById('stations', stationId) as Station | null;
    if (!station) {
      return res.status(404).json({
        success: false,
        error: 'Станция не найдена',
      });
    }
    
    if (!station.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Станция неактивна',
      });
    }
    
    // Получаем активные метрики для этой станции
    const metrics = findWhere('metrics', (m: Metric) => 
      m.station_id === stationId && m.is_active
    );
    
    if (metrics.length === 0) {
      return res.json({
        success: true,
        data: {},
        message: 'Нет активных метрик для этой станции',
      });
    }
    
    // Формируем список field/channel для запроса
    const fieldChannels = metrics.map(m => ({
      field: m.field,
      channel: m.channel,
    }));
    
    // Запрашиваем текущие значения
    const values = await queryCurrentValues(
      station.bucket,
      station.measurement,
      fieldChannels
    );
    
    // Форматируем результат
    const result: Record<number, number | null> = {};
    for (const metric of metrics) {
      const key = `${metric.field}_${metric.channel}`;
      result[metric.id] = values.get(key) ?? null;
    }
    
    res.json({
      success: true,
      data: result,
      metadata: {
        stationId,
        stationName: station.display_name,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении текущих значений:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении данных',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/data/history - Получить исторические данные
 * Body: {
 *   stationId: number,
 *   metricIds: number[],
 *   timeRange: TimeRange,
 *   frequency: DataFrequency
 * }
 */
router.post('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { stationId, metricIds, timeRange, frequency } = req.body;
    
    // Валидация
    if (!stationId || !metricIds || !Array.isArray(metricIds) || metricIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Неверные параметры запроса',
      });
    }
    
    if (!timeRange || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать timeRange и frequency',
      });
    }
    
    // Получаем станцию
    const station = findById('stations', stationId) as Station | null;
    if (!station) {
      return res.status(404).json({
        success: false,
        error: 'Станция не найдена',
      });
    }
    
    // Получаем метрики
    const metrics = metricIds
      .map(id => findById('metrics', id) as Metric | null)
      .filter(m => m !== null && m.station_id === stationId && m.is_active) as Metric[];
    
    if (metrics.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Не найдены активные метрики для запроса',
      });
    }
    
    // Запрашиваем данные для каждой метрики
    const results: Record<number, any[]> = {};
    const metricNames: Record<number, string> = {};
    
    for (const metric of metrics) {
      const params: InfluxQueryParams = {
        bucket: station.bucket,
        measurement: station.measurement,
        field: metric.field,
        channel: metric.channel,
        timeRange: timeRange as TimeRange,
        frequency: frequency as DataFrequency,
      };
      
      try {
        const data = await queryInfluxData(params);
        results[metric.id] = data;
        metricNames[metric.id] = metric.display_name;
      } catch (error) {
        console.error(`Ошибка при запросе метрики ${metric.id}:`, error);
        results[metric.id] = [];
      }
    }
    
    // Форматируем данные в удобный формат для графиков
    // Группируем по времени
    const timeMap = new Map<string, any>();
    
    for (const [metricId, dataPoints] of Object.entries(results)) {
      for (const point of dataPoints) {
        if (!timeMap.has(point.time)) {
          timeMap.set(point.time, { time: point.time, metrics: {} });
        }
        const timePoint = timeMap.get(point.time)!;
        timePoint.metrics[metricId] = {
          value: point.value,
          min: point.min,
          max: point.max,
        };
      }
    }
    
    // Преобразуем в массив и сортируем по времени
    const data = Array.from(timeMap.values()).sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    
    res.json({
      success: true,
      data,
      metadata: {
        stationId,
        stationName: station.display_name,
        metricNames,
        timeRange,
        frequency,
        totalPoints: data.length,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении исторических данных:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении данных',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/data/health - Проверить подключение к InfluxDB
 */
router.get('/health', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { testInfluxConnection } = await import('../services/influxdb.service');
    const isHealthy = await testInfluxConnection();
    
    res.json({
      success: isHealthy,
      message: isHealthy ? 'InfluxDB доступен' : 'InfluxDB недоступен',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при проверке подключения к InfluxDB',
    });
  }
});

export default router;
