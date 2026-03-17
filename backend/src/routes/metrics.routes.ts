/**
 * API РОУТЫ ДЛЯ МЕТРИК
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.middleware';
import { findAll, findById, findWhere, insert, update, remove } from '../config/database';
import { CreateMetricDTO, UpdateMetricDTO, Metric } from '../types/models';

const router = Router();

/**
 * GET /api/metrics - Получить все метрики
 * Query параметры:
 * - stationId: фильтр по станции
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { stationId } = req.query;
    
    let metrics: Metric[];
    
    if (stationId) {
      const id = parseInt(stationId as string, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID станции',
        });
      }
      metrics = findWhere('metrics', (m: Metric) => m.station_id === id);
    } else {
      metrics = findAll('metrics') as Metric[];
    }
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Ошибка при получении метрик:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении метрик',
    });
  }
});

/**
 * GET /api/metrics/:id - Получить метрику по ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID метрики',
      });
    }
    
    const metric = findById('metrics', id) as Metric | null;
    
    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Метрика не найдена',
      });
    }
    
    res.json({
      success: true,
      data: metric,
    });
  } catch (error) {
    console.error('Ошибка при получении метрики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении метрики',
    });
  }
});

/**
 * POST /api/metrics - Создать новую метрику (только для админа)
 */
router.post(
  '/',
  authenticateToken,
  [
    body('station_id').isInt().withMessage('ID станции должен быть числом'),
    body('display_name').notEmpty().withMessage('Название метрики обязательно'),
    body('field').notEmpty().withMessage('Field обязателен'),
    body('channel').notEmpty().withMessage('Channel обязателен'),
    body('unit').notEmpty().withMessage('Единица измерения обязательна'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Проверка прав доступа
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Доступ запрещен. Требуются права администратора.',
        });
      }
      
      // Валидация
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Ошибка валидации',
          details: errors.array(),
        });
      }
      
      const metricData: CreateMetricDTO = req.body;
      
      // Проверяем что станция существует
      const station = findById('stations', metricData.station_id);
      if (!station) {
        return res.status(400).json({
          success: false,
          error: 'Станция не найдена',
        });
      }
      
      // Создаем метрику
      const newMetric = insert('metrics', {
        station_id: metricData.station_id,
        display_name: metricData.display_name,
        field: metricData.field,
        channel: metricData.channel,
        unit: metricData.unit,
        show_in_chart: metricData.show_in_chart !== undefined ? metricData.show_in_chart : true,
        show_in_table: metricData.show_in_table !== undefined ? metricData.show_in_table : true,
        show_in_export: metricData.show_in_export !== undefined ? metricData.show_in_export : true,
        is_active: metricData.is_active !== undefined ? metricData.is_active : true,
      });
      
      res.status(201).json({
        success: true,
        data: newMetric,
        message: 'Метрика успешно создана',
      });
    } catch (error) {
      console.error('Ошибка при создании метрики:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при создании метрики',
      });
    }
  }
);

/**
 * PUT /api/metrics/:id - Обновить метрику (только для админа)
 */
router.put(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Проверка прав доступа
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Доступ запрещен. Требуются права администратора.',
        });
      }
      
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Неверный ID метрики',
        });
      }
      
      const metric = findById('metrics', id);
      if (!metric) {
        return res.status(404).json({
          success: false,
          error: 'Метрика не найдена',
        });
      }
      
      const updateData: UpdateMetricDTO = req.body;
      
      // Если меняется station_id, проверяем что станция существует
      if (updateData.station_id) {
        const station = findById('stations', updateData.station_id);
        if (!station) {
          return res.status(400).json({
            success: false,
            error: 'Станция не найдена',
          });
        }
      }
      
      // Обновляем метрику
      const updatedMetric = update('metrics', id, updateData);
      
      res.json({
        success: true,
        data: updatedMetric,
        message: 'Метрика успешно обновлена',
      });
    } catch (error) {
      console.error('Ошибка при обновлении метрики:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при обновлении метрики',
      });
    }
  }
);

/**
 * DELETE /api/metrics/:id - Удалить метрику (только для админа)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Проверка прав доступа
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуются права администратора.',
      });
    }
    
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID метрики',
      });
    }
    
    const metric = findById('metrics', id);
    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Метрика не найдена',
      });
    }
    
    // Удаляем метрику
    const deleted = remove('metrics', id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Ошибка при удалении метрики',
      });
    }
    
    res.json({
      success: true,
      message: 'Метрика успешно удалена',
    });
  } catch (error) {
    console.error('Ошибка при удалении метрики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении метрики',
    });
  }
});

export default router;