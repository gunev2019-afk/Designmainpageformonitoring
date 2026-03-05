import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ExportPage } from './pages/ExportPage';
import { LogsPage } from './pages/LogsPage';

/**
 * ГЛАВНОЕ ПРИЛОЖЕНИЕ СИСТЕМЫ ОНЛАЙН-МОНИТОРИНГА
 * 
 * Система мониторинга инженерных параметров с данными из InfluxDB
 * в современном бело-синем стиле 2030 года.
 * 
 * Структура:
 * - / (Главная) - Графики и таблицы с данными мониторинга
 * - /export (Экспорт) - Страница экспорта данных в Excel
 * - /logs (Логи) - Системные логи и события
 * 
 * Технологии:
 * - React + TypeScript
 * - React Router для навигации
 * - Recharts для графиков
 * - XLSX для экспорта данных
 * - Tailwind CSS для стилей
 */

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Шапка с навигацией */}
          <Header />

          {/* Маршруты страниц */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
