/**
 * JWT MIDDLEWARE
 * Проверка токенов и авторизация пользователей
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { findById } from '../config/database';

/**
 * Расширяем Express Request для добавления информации о пользователе
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: 'admin' | 'user';
      };
    }
  }
}

/**
 * Middleware для проверки JWT токена
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Токен не предоставлен',
        code: 'NO_TOKEN',
      });
      return;
    }

    // Проверяем токен
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        res.status(403).json({
          success: false,
          error: 'Недействительный токен',
          code: 'INVALID_TOKEN',
        });
        return;
      }

      // Проверяем что пользователь существует
      const payload = decoded as { id: number; username: string; role: 'admin' | 'user' };
      const user = findById('users', payload.id);

      if (!user) {
        res.status(403).json({
          success: false,
          error: 'Пользователь не найден',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      // Добавляем пользователя в request
      req.user = {
        id: payload.id,
        username: payload.username,
        role: payload.role,
      };

      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка аутентификации',
    });
  }
}

/**
 * Middleware для проверки роли ADMIN
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Требуется авторизация',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Требуются права администратора',
      code: 'FORBIDDEN',
    });
    return;
  }

  next();
}

/**
 * Middleware для проверки роли (admin или user)
 */
export function requireRole(...roles: Array<'admin' | 'user'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Требуется авторизация',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Недостаточно прав доступа',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}

/**
 * Опциональная аутентификация
 * Добавляет пользователя в request если токен валидный, но не требует его
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (!err) {
        const payload = decoded as { id: number; username: string; role: 'admin' | 'user' };
        const user = findById('users', payload.id);

        if (user) {
          req.user = {
            id: payload.id,
            username: payload.username,
            role: payload.role,
          };
        }
      }
      next();
    });
  } catch (error) {
    next();
  }
}
