/**
 * УТИЛИТЫ ДЛЯ ФОРМАТИРОВАНИЯ ДАТЫ И ВРЕМЕНИ
 * Все даты отображаются в московском времени (UTC+3)
 */

/**
 * Форматирует ISO дату в московское время
 * @param isoString - ISO строка даты
 * @param format - формат вывода: 'short' (HH:MM), 'full' (DD.MM HH:MM), 'datetime' (DD.MM.YYYY HH:MM:SS)
 * @returns отформатированная строка
 */
export function formatMoscowTime(isoString: string, format: 'short' | 'full' | 'datetime' = 'short'): string {
  const date = new Date(isoString);
  
  // Получаем московское время (UTC+3)
  const moscowDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  
  const day = moscowDate.getUTCDate().toString().padStart(2, '0');
  const month = (moscowDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = moscowDate.getUTCFullYear();
  const hours = moscowDate.getUTCHours().toString().padStart(2, '0');
  const minutes = moscowDate.getUTCMinutes().toString().padStart(2, '0');
  const seconds = moscowDate.getUTCSeconds().toString().padStart(2, '0');
  
  switch (format) {
    case 'short':
      return `${hours}:${minutes}`;
    case 'full':
      return `${day}.${month} ${hours}:${minutes}`;
    case 'datetime':
      return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    default:
      return `${hours}:${minutes}`;
  }
}

/**
 * Форматирует timestamp для оси X графика
 * В зависимости от временного диапазона выбирает подходящий формат
 */
export function formatChartTime(isoString: string, timeRange: string): string {
  // Для коротких периодов (< 1 дня) - только время
  if (['1h', '3h', '6h', '12h'].includes(timeRange)) {
    return formatMoscowTime(isoString, 'short');
  }
  
  // Для средних периодов (1-7 дней) - дата и время
  if (['1d', '3d', '7d'].includes(timeRange)) {
    return formatMoscowTime(isoString, 'full');
  }
  
  // Для длинных периодов (> 7 дней) - только дата
  const date = new Date(isoString);
  const moscowDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  const day = moscowDate.getUTCDate().toString().padStart(2, '0');
  const month = (moscowDate.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

/**
 * Форматирует tooltip с полной информацией о времени
 */
export function formatTooltipTime(isoString: string): string {
  return formatMoscowTime(isoString, 'datetime');
}

/**
 * Получает текущее московское время
 */
export function getMoscowNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + (3 * 60 * 60 * 1000));
}

/**
 * Форматирует значение метрики с единицами измерения
 */
export function formatMetricValue(value: number | null, unit: string): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  // Округляем до 1 знака после запятой
  const rounded = Math.round(value * 10) / 10;
  
  return `${rounded}${unit}`;
}
