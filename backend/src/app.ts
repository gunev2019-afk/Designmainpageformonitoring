/**
 * EXPRESS ПРИЛОЖЕНИЕ
 * Конфигурация и настройка Express сервера
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';

// Импорт роутов
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';

/**
 * Создание и настройка Express приложения
 */
export function createApp(): Express {
  const app = express();

  // ===== MIDDLEWARE =====

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // Парсинг JSON
  app.use(express.json());

  // Парсинг URL-encoded данных
  app.use(express.urlencoded({ extended: true }));

  // Логирование запросов в development режиме
  if (config.isDevelopment) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // ===== ROUTES =====

  // Главная страница API
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Monitoring Backend API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        stations: '/api/stations',
        metrics: '/api/metrics',
        data: '/api/data',
        export: '/api/export',
        logs: '/api/logs',
      },
    });
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // API роуты (будут добавлены позже)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  // app.use('/api/stations', stationRoutes);
  // app.use('/api/metrics', metricRoutes);
  // app.use('/api/data', dataRoutes);
  // app.use('/api/export', exportRoutes);
  // app.use('/api/logs', logRoutes);

  // ===== ERROR HANDLING =====

  // 404 - Not Found
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint не найден',
      path: req.path,
    });
  });

  // Global Error Handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Ошибка:', err);

    res.status(500).json({
      success: false,
      error: config.isDevelopment ? err.message : 'Внутренняя ошибка сервера',
      ...(config.isDevelopment && { stack: err.stack }),
    });
  });

  return app;
}