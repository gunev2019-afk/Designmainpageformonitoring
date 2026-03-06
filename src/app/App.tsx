import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ExportPage } from './pages/ExportPage';
import { LogsPage } from './pages/LogsPage';
import { UsersPage } from './pages/UsersPage';
import { MetricsPage } from './pages/MetricsPage';

/**
 * ГЛАВНОЕ ПРИЛОЖЕНИЕ СИСТЕМЫ ОНЛАЙН-МОНИТОРИНГА
 * 
 * Система мониторинга инженерных параметров с данными из InfluxDB
 * в современном бело-синем стиле 2030 года.
 * 
 * Структура:
 * - /login (Вход) - Страница авторизации (admin/admin)
 * - / (Главная) - Графики и таблицы с данными мониторинга
 * - /export (Экспорт) - Страница экспорта данных в Excel
 * - /logs (Логи) - Системные логи и события
 * - /users (Пользователи) - Управление пользователями (только для администраторов)
 * - /metrics (Метрики) - Дополнительные метрики и аналитика
 * 
 * Технологии:
 * - React + TypeScript
 * - React Router для навигации
 * - Recharts для графиков
 * - XLSX для экспорта данных
 * - Tailwind CSS для стилей
 */

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] transition-colors duration-300">
      {/* Шапка с навигацией (показываем только для авторизованных пользователей) */}
      {isAuthenticated && <Header />}

      {/* Маршруты страниц */}
      <Routes>
        {/* Страница входа */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } 
        />

        {/* Защищенные страницы */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/export"
          element={
            <ProtectedRoute>
              <ExportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <LogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/metrics"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MetricsPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* Страница управления пользователями (только для администраторов) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* Перенаправление на главную для неизвестных маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;