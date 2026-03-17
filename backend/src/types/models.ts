/**
 * ТИПЫ ДАННЫХ ДЛЯ МОДЕЛЕЙ
 * Общие TypeScript типы используемые в приложении
 */

// Роли пользователей
export type UserRole = 'admin' | 'user';

// Уровни логов
export type LogLevel = 'info' | 'warning' | 'error';

// Временные интервалы
export type TimeRange = '1h' | '6h' | '1d' | '1w' | '1m';

// Частота данных
export type DataFrequency = '1s' | '10s' | '1m' | '5m' | '15m' | '1h';

/**
 * МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ
 */
export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Пользователь без пароля (для ответов API)
export interface UserPublic {
  id: number;
  username: string;
  role: UserRole;
  created_at: string;
}

// Данные для создания пользователя
export interface CreateUserDTO {
  username: string;
  password: string;
  role: UserRole;
}

// Данные для обновления пользователя
export interface UpdateUserDTO {
  username?: string;
  password?: string;
  role?: UserRole;
}

/**
 * МОДЕЛЬ СТАНЦИИ
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

// Данные для создания/обновления станции
export interface CreateStationDTO {
  display_name: string;
  bucket: string;
  measurement: string;
  is_active?: boolean;
}

export interface UpdateStationDTO {
  display_name?: string;
  bucket?: string;
  measurement?: string;
  is_active?: boolean;
}

/**
 * МОДЕЛЬ МЕТРИКИ
 */
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

// Данные для создания/обновления метрики
export interface CreateMetricDTO {
  station_id: number;
  display_name: string;
  field: string;
  channel: string;
  unit: string;
  show_in_chart?: boolean;
  show_in_table?: boolean;
  show_in_export?: boolean;
  is_active?: boolean;
}

export interface UpdateMetricDTO {
  station_id?: number;
  display_name?: string;
  field?: string;
  channel?: string;
  unit?: string;
  show_in_chart?: boolean;
  show_in_table?: boolean;
  show_in_export?: boolean;
  is_active?: boolean;
}

/**
 * МОДЕЛЬ ЛОГА
 */
export interface SystemLog {
  id: number;
  level: LogLevel;
  message: string;
  user_id: number | null;
  metadata: string | null;
  created_at: string;
}

// Данные для создания лога
export interface CreateLogDTO {
  level: LogLevel;
  message: string;
  user_id?: number;
  metadata?: Record<string, any>;
}

/**
 * ЗАПРОС ДАННЫХ ИЗ INFLUXDB
 */
export interface DataQueryRequest {
  stationId: number;
  metricIds: number[];
  timeRange: TimeRange;
  frequency: DataFrequency;
  showMin?: boolean;
  showMax?: boolean;
}

/**
 * ОТВЕТ С ДАННЫМИ ИЗ INFLUXDB
 */
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

export interface DataQueryResponse {
  success: boolean;
  data: DataPoint[];
  metadata?: {
    stationName: string;
    metricNames: { [key: number]: string };
    timeRange: TimeRange;
    frequency: DataFrequency;
  };
}

/**
 * ЗАПРОС ЭКСПОРТА
 */
export interface ExportRequest {
  stationId: number;
  metricIds: number[];
  timeRange: TimeRange;
  frequency: DataFrequency;
}

/**
 * JWT PAYLOAD
 */
export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * СТАНДАРТНЫЙ ОТВЕТ API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * ОТВЕТ АВТОРИЗАЦИИ
 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserPublic;
}

/**
 * РАСШИРЕНИЕ REQUEST EXPRESS
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
