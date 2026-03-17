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
 * Типы для станций и метрик
 */
export interface Station {
  id: number;
  display_name: string;
  bucket: string;
  measurement: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: number;
  station_id: number;
  display_name: string;
  field: string;
  channel: string;
  unit: string;
  show_in_chart: boolean;
  show_in_table: boolean;
  show_in_export: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TimeRange = '1h' | '6h' | '1d' | '1w' | '1m';
export type DataFrequency = '1s' | '10s' | '1m' | '5m' | '15m' | '1h';

export interface DataPoint {
  time: string;
  metrics: {
    [metricId: number]: {
      value: number;
      min?: number;
      max?: number;
    };
  };
}

export interface HistoryDataRequest {
  stationId: number;
  metricIds: number[];
  timeRange: TimeRange;
  frequency: DataFrequency;
}

export interface HistoryDataResponse {
  success: boolean;
  data: DataPoint[];
  metadata?: {
    stationId: number;
    stationName: string;
    metricNames: { [key: number]: string };
    timeRange: TimeRange;
    frequency: DataFrequency;
    totalPoints: number;
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
 * СТАНЦИИ
 * ========================================
 */

/**
 * Получить список всех станций
 */
export async function getStations(): Promise<ApiResponse<Station[]>> {
  return fetchApi('/api/stations');
}

/**
 * Получить станцию по ID
 */
export async function getStationById(id: number): Promise<ApiResponse<Station>> {
  return fetchApi(`/api/stations/${id}`);
}

/**
 * Создать новую станцию (только admin)
 */
export async function createStation(data: {
  display_name: string;
  bucket: string;
  measurement: string;
  is_active?: boolean;
}): Promise<ApiResponse<Station>> {
  return fetchApi('/api/stations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Обновить станцию (только admin)
 */
export async function updateStation(
  id: number,
  data: {
    display_name?: string;
    bucket?: string;
    measurement?: string;
    is_active?: boolean;
  }
): Promise<ApiResponse<Station>> {
  return fetchApi(`/api/stations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Удалить станцию (только admin)
 */
export async function deleteStation(id: number): Promise<ApiResponse> {
  return fetchApi(`/api/stations/${id}`, {
    method: 'DELETE',
  });
}

/**
 * ========================================
 * МЕТРИКИ
 * ========================================
 */

/**
 * Получить список всех метрик или по станции
 */
export async function getMetrics(stationId?: number): Promise<ApiResponse<Metric[]>> {
  const query = stationId ? `?stationId=${stationId}` : '';
  return fetchApi(`/api/metrics${query}`);
}

/**
 * Получить метрику по ID
 */
export async function getMetricById(id: number): Promise<ApiResponse<Metric>> {
  return fetchApi(`/api/metrics/${id}`);
}

/**
 * Создать новую метрику (только admin)
 */
export async function createMetric(data: {
  station_id: number;
  display_name: string;
  field: string;
  channel: string;
  unit: string;
  show_in_chart?: boolean;
  show_in_table?: boolean;
  show_in_export?: boolean;
  is_active?: boolean;
}): Promise<ApiResponse<Metric>> {
  return fetchApi('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Обновить метрику (только admin)
 */
export async function updateMetric(
  id: number,
  data: Partial<Omit<Metric, 'id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<Metric>> {
  return fetchApi(`/api/metrics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Удалить метрику (только admin)
 */
export async function deleteMetric(id: number): Promise<ApiResponse> {
  return fetchApi(`/api/metrics/${id}`, {
    method: 'DELETE',
  });
}

/**
 * ========================================
 * ДАННЫЕ ИЗ INFLUXDB
 * ========================================
 */

/**
 * Получить текущие значения метрик для станции
 */
export async function getCurrentValues(stationId: number): Promise<ApiResponse<{
  [metricId: number]: number | null;
}>> {
  return fetchApi(`/api/data/current/${stationId}`);
}

/**
 * Получить исторические данные
 */
export async function getHistoryData(
  request: HistoryDataRequest
): Promise<HistoryDataResponse> {
  return fetchApi('/api/data/history', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Проверить подключение к InfluxDB
 */
export async function checkInfluxHealth(): Promise<ApiResponse> {
  return fetchApi('/api/data/health');
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