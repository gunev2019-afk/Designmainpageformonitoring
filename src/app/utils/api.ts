/**
 * API CLIENT
 * Клиент для работы с Backend API
 */

// Базовый URL API (можно вынести в env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Типы данных
 */
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
  };
}

/**
 * API Error класс
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Получить сохраненный токен
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Сохранить токен
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Удалить токен
 */
export function removeToken(): void {
  localStorage.removeItem('token');
}

/**
 * Базовая функция для выполнения запросов
 */
async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Добавляем токен если есть
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Ошибка запроса',
        response.status,
        data.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Ошибка сети или парсинга
    throw new ApiError(
      'Ошибка подключения к серверу',
      0
    );
  }
}

/**
 * ========================================
 * АВТОРИЗАЦИЯ
 * ========================================
 */

/**
 * Авторизация пользователя
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetchApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // Сохраняем токен
  if (response.success && response.data.token) {
    setToken(response.data.token);
  }

  return response;
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  return fetchApi('/api/auth/me');
}

/**
 * Выход из системы
 */
export async function logout(): Promise<ApiResponse> {
  try {
    const response = await fetchApi('/api/auth/logout', {
      method: 'POST',
    });
    return response;
  } finally {
    // Всегда удаляем токен
    removeToken();
  }
}

/**
 * ========================================
 * ПОЛЬЗОВАТЕЛИ
 * ========================================
 */

/**
 * Получить список всех пользователей (только admin)
 */
export async function getUsers(): Promise<UsersListResponse> {
  return fetchApi('/api/users');
}

/**
 * Получить пользователя по ID (только admin)
 */
export async function getUserById(id: number): Promise<ApiResponse<{ user: User }>> {
  return fetchApi(`/api/users/${id}`);
}

/**
 * Создать нового пользователя (только admin)
 */
export async function createUser(
  username: string,
  password: string,
  role: 'admin' | 'user' = 'user'
): Promise<ApiResponse<{ user: User }>> {
  return fetchApi('/api/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  });
}

/**
 * Обновить пользователя (только admin)
 */
export async function updateUser(
  id: number,
  data: {
    username?: string;
    password?: string;
    role?: 'admin' | 'user';
  }
): Promise<ApiResponse<{ user: User }>> {
  return fetchApi(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Удалить пользователя (только admin)
 */
export async function deleteUser(id: number): Promise<ApiResponse> {
  return fetchApi(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * ========================================
 * УТИЛИТЫ
 * ========================================
 */

/**
 * Проверить доступность API
 */
export async function checkHealth(): Promise<ApiResponse> {
  return fetchApi('/health');
}

/**
 * Проверить валидность токена
 */
export async function validateToken(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}
