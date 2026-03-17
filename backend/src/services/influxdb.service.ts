/**
 * СЕРВИС ДЛЯ РАБОТЫ С INFLUXDB
 */

import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client';
import { config } from '../config/env';
import { TimeRange, DataFrequency } from '../types/models';

// Инициализация клиента InfluxDB
let influxClient: InfluxDB | null = null;

/**
 * Получить клиент InfluxDB
 */
function getInfluxClient(): InfluxDB {
  if (!influxClient) {
    influxClient = new InfluxDB({
      url: config.influxdb.url,
      token: config.influxdb.token,
    });
  }
  return influxClient;
}

/**
 * Преобразовать TimeRange в duration для Flux
 */
function timeRangeToFluxDuration(timeRange: TimeRange): string {
  const durations: Record<TimeRange, string> = {
    '1h': '-1h',
    '6h': '-6h',
    '1d': '-1d',
    '1w': '-7d',
    '1m': '-30d',
  };
  return durations[timeRange];
}

/**
 * Преобразовать DataFrequency в window duration для Flux
 */
function frequencyToFluxWindow(frequency: DataFrequency): string {
  const windows: Record<DataFrequency, string> = {
    '1s': '1s',
    '10s': '10s',
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
  };
  return windows[frequency];
}

/**
 * Интерфейс для запроса данных
 */
export interface InfluxQueryParams {
  bucket: string;
  measurement: string;
  field: string;
  channel: string;
  timeRange: TimeRange;
  frequency: DataFrequency;
}

/**
 * Интерфейс для точки данных
 */
export interface InfluxDataPoint {
  time: string;
  value: number;
  min?: number;
  max?: number;
}

/**
 * Запросить данные из InfluxDB
 */
export async function queryInfluxData(params: InfluxQueryParams): Promise<InfluxDataPoint[]> {
  const client = getInfluxClient();
  const queryApi = client.getQueryApi(config.influxdb.org);
  
  const duration = timeRangeToFluxDuration(params.timeRange);
  const window = frequencyToFluxWindow(params.frequency);
  
  // Формируем Flux запрос с агрегацией
  const fluxQuery = `
    from(bucket: "${params.bucket}")
      |> range(start: ${duration})
      |> filter(fn: (r) => r["_measurement"] == "${params.measurement}")
      |> filter(fn: (r) => r["_field"] == "${params.field}")
      |> filter(fn: (r) => r["channel"] == "${params.channel}")
      |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;
  
  const data: InfluxDataPoint[] = [];
  
  try {
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row: string[], tableMeta: FluxTableMetaData) {
          const o = tableMeta.toObject(row);
          data.push({
            time: o._time as string,
            value: parseFloat(o._value as string),
          });
        },
        error(error: Error) {
          console.error('❌ Ошибка запроса InfluxDB:', error);
          reject(error);
        },
        complete() {
          resolve();
        },
      });
    });
    
    return data;
  } catch (error) {
    console.error('❌ Ошибка при запросе данных из InfluxDB:', error);
    throw error;
  }
}

/**
 * Запросить текущие значения (последние данные)
 */
export async function queryCurrentValues(
  bucket: string,
  measurement: string,
  fields: { field: string; channel: string }[]
): Promise<Map<string, number>> {
  const client = getInfluxClient();
  const queryApi = client.getQueryApi(config.influxdb.org);
  
  const results = new Map<string, number>();
  
  for (const { field, channel } of fields) {
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
        |> filter(fn: (r) => r["_field"] == "${field}")
        |> filter(fn: (r) => r["channel"] == "${channel}")
        |> last()
    `;
    
    try {
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(fluxQuery, {
          next(row: string[], tableMeta: FluxTableMetaData) {
            const o = tableMeta.toObject(row);
            const key = `${field}_${channel}`;
            results.set(key, parseFloat(o._value as string));
          },
          error(error: Error) {
            console.error(`❌ Ошибка запроса текущего значения (${field}/${channel}):`, error);
            reject(error);
          },
          complete() {
            resolve();
          },
        });
      });
    } catch (error) {
      console.error(`❌ Ошибка при получении текущего значения (${field}/${channel}):`, error);
      // Продолжаем даже если один запрос упал
    }
  }
  
  return results;
}

/**
 * Проверить подключение к InfluxDB
 */
export async function testInfluxConnection(): Promise<boolean> {
  try {
    const client = getInfluxClient();
    const queryApi = client.getQueryApi(config.influxdb.org);
    
    // Простой запрос для проверки подключения
    const query = `buckets() |> limit(n:1)`;
    
    await queryApi.collectRows(query);
    
    console.log('✅ Подключение к InfluxDB успешно');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к InfluxDB:', error);
    return false;
  }
}