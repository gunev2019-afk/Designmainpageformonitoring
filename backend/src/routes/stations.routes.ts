/**
 * API РОУТЫ ДЛЯ СТАНЦИЙ МОНИТОРИНГА
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { findAll, findById, insert, update, remove } from '../config/database';
import { CreateStationDTO, UpdateStationDTO, Station } from '../types/models';

const router = Router();

/**
 * GET /api/stations - Получить все станции
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stations = findAll('stations') as Station[];
    
    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error('Ошибка при получении станций:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении станций',
    });
  }
});

/**
 * GET /api/stations/:id - Получить станцию по ID
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID станции',
      });
    }
    
    const station = findById('stations', id) as Station | null;
    
    if (!station) {
      return res.status(404).json({
        success: false,
        error: 'Станция не найдена',
      });
    }
    
    res.json({
      success: true,
      data: station,
    });
  } catch (error) {
    console.error('Ошибка при получении станции:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении станции',
    });
  }
});

/**
 * POST /api/stations - Создать новую станцию (только для админа)
 */
router.post(
  '/',
  authMiddleware,
  [
    body('display_name').notEmpty().withMessage('Название станции обязательно'),
    body('bucket').notEmpty().withMessage('Bucket обязателен'),
    body('measurement').notEmpty().withMessage('Measurement обязателен'),
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
      
      const stationData: CreateStationDTO = req.body;
      
      // Создаем станцию
      const newStation = insert('stations', {
        display_name: stationData.display_name,
        bucket: stationData.bucket,
        measurement: stationData.measurement,
        is_active: stationData.is_active !== undefined ? stationData.is_active : true,
      });
      
      res.status(201).json({
        success: true,
        data: newStation,
        message: 'Станция успешно создана',
      });
    } catch (error) {
      console.error('Ошибка при создании станции:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при создании станции',
      });
    }
  }
);

/**
 * PUT /api/stations/:id - Обновить станцию (только для админа)
 */
router.put(
  '/:id',
  authMiddleware,
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
          error: 'Неверный ID станции',
        });
      }
      
      const station = findById('stations', id);
      if (!station) {
        return res.status(404).json({
          success: false,
          error: 'Станция не найдена',
        });
      }
      
      const updateData: UpdateStationDTO = req.body;
      
      // Обновляем станцию
      const updatedStation = update('stations', id, updateData);
      
      res.json({
        success: true,
        data: updatedStation,
        message: 'Станция успешно обновлена',
      });
    } catch (error) {
      console.error('Ошибка при обновлении станции:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при обновлении станции',
      });
    }
  }
);

/**
 * DELETE /api/stations/:id - Удалить станцию (только для админа)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
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
        error: 'Неверный ID станции',
      });
    }
    
    const station = findById('stations', id);
    if (!station) {
      return res.status(404).json({
        success: false,
        error: 'Станция не найдена',
      });
    }
    
    // Удаляем станцию
    const deleted = remove('stations', id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Ошибка при удалении станции',
      });
    }
    
    res.json({
      success: true,
      message: 'Станция успешно удалена',
    });
  } catch (error) {
    console.error('Ошибка при удалении станции:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при удалении станции',
    });
  }
});

export default router;
