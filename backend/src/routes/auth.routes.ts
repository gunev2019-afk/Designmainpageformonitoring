/**
 * AUTH ROUTES
 * Роуты для авторизации и регистрации
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { findOne, insert } from '../config/database';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/login
 * Авторизация пользователя
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Валидация
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Укажите username и password',
        code: 'MISSING_CREDENTIALS',
      });
      return;
    }

    // Ищем пользователя
    const user = findOne('users', (u) => u.username === username);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Неверный логин или пароль',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Неверный логин или пароль',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Генерируем JWT токен
    const signOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn,
    };
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      signOptions
    );

    // Возвращаем токен и информацию о пользователе
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

/**
 * POST /api/auth/register
 * Регистрация нового пользователя (только для админов)
 */
router.post('/register', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Проверяем что запрос от админа
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Только администраторы могут создавать пользователей',
        code: 'FORBIDDEN',
      });
      return;
    }

    const { username, password, role = 'user' } = req.body;

    // Валидация
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Укажите username и password',
        code: 'MISSING_FIELDS',
      });
      return;
    }

    // Проверяем минимальную длину пароля
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Пароль должен быть минимум 6 символов',
        code: 'PASSWORD_TOO_SHORT',
      });
      return;
    }

    // Проверяем что username не занят
    const existingUser = findOne('users', (u) => u.username === username);

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Пользователь с таким username уже существует',
        code: 'USERNAME_EXISTS',
      });
      return;
    }

    // Валидация роли
    if (role !== 'admin' && role !== 'user') {
      res.status(400).json({
        success: false,
        error: 'Роль должна быть "admin" или "user"',
        code: 'INVALID_ROLE',
      });
      return;
    }

    // Хешируем пароль
    const password_hash = await bcrypt.hash(password, config.security.bcryptRounds);

    // Создаем пользователя
    const newUser = insert('users', {
      username,
      password_hash,
      role,
    });

    // Возвращаем данные (без хеша пароля)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

/**
 * GET /api/auth/me
 * Получить информацию о текущем пользователе
 */
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

/**
 * POST /api/auth/logout
 * Вы��од (на клиенте просто уалить токен)
 */
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  // JWT tokens are stateless, so we just return success
  // Client should remove the token from storage
  res.json({
    success: true,
    message: 'Успешный выход',
  });
});

export default router;