/**
 * USERS ROUTES
 * Управление пользователями (только для администраторов)
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { findAll, findById, insert, update, remove } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Все роуты требуют авторизации и прав админа
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/users
 * Получить список всех пользователей
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const users = findAll('users');

    // Убираем password_hash из ответа
    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));

    res.json({
      success: true,
      data: {
        users: sanitizedUsers,
        total: sanitizedUsers.length,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

/**
 * GET /api/users/:id
 * Получить пользователя по ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Неверный ID',
      });
      return;
    }

    const user = findById('users', id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Пользователь не найден',
      });
      return;
    }

    // Убираем password_hash
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

/**
 * POST /api/users
 * Создать нового пользователя
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, password, role = 'user' } = req.body;

    // Валидация
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Укажите username и password',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Пароль должен быть минимум 6 символов',
      });
      return;
    }

    if (role !== 'admin' && role !== 'user') {
      res.status(400).json({
        success: false,
        error: 'Роль должна быть "admin" или "user"',
      });
      return;
    }

    // Проверяем что username не занят
    const existingUser = findAll('users').find((u) => u.username === username);

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Пользователь с таким username уже существует',
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
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

/**
 * PUT /api/users/:id
 * Обновить пользователя
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Неверный ID',
      });
      return;
    }

    const user = findById('users', id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Пользователь не найден',
      });
      return;
    }

    const { username, password, role } = req.body;
    const updates: any = {};

    // Обновляем username
    if (username) {
      // Проверяем что новый username не занят
      const existingUser = findAll('users').find(
        (u) => u.username === username && u.id !== id
      );

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Пользователь с таким username уже существует',
        });
        return;
      }

      updates.username = username;
    }

    // Обновляем пароль
    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Пароль должен быть минимум 6 символов',
        });
        return;
      }

      updates.password_hash = await bcrypt.hash(password, config.security.bcryptRounds);
    }

    // Обновляем роль
    if (role) {
      if (role !== 'admin' && role !== 'user') {
        res.status(400).json({
          success: false,
          error: 'Роль должна быть "admin" или "user"',
        });
        return;
      }

      updates.role = role;
    }

    // Обновляем пользователя
    const updatedUser = update('users', id, updates);

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          updated_at: updatedUser.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

/**
 * DELETE /api/users/:id
 * Удалить пользователя
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Неверный ID',
      });
      return;
    }

    // Нельзя удалить самого себя
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        error: 'Нельзя удалить самого себя',
      });
      return;
    }

    const deleted = remove('users', id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Пользователь не найден',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Пользователь удален',
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера',
    });
  }
});

export default router;
