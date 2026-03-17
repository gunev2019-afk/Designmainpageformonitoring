import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ExportPage } from './pages/ExportPage';
import { LogsPage } from './pages/LogsPage';
import { UsersPage } from './pages/UsersPage';
import { MetricsPage } from './pages/MetricsPage';
import { StationsPage } from './pages/StationsPage';

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
 * - /stations (Станции) - Управление станциями мониторинга (только для администраторов)
 * 
 * Технологии:
 * - React + TypeScript
 * - React Router для навигации
 * - Recharts для графиков
 * - XLSX для экспорта данных
 * - Tailwind CSS для стилей
 */

function AppContent() {
  console.log('🚀 AppContent: Начало рендера');
  
  // КРИТИЧЕСКИ ВАЖНО: useAuth должен быть вызван внутри AuthProvider
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('❌ AppContent: Ошибка при вызове useAuth:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Ошибка инициализации</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }
  
  const { isAuthenticated, isLoading } = auth;

  console.log('🚀 AppContent render:', { isAuthenticated, isLoading });

  // Показываем загрузку пока проверяем токен
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-[#a1a1aa]">Загрузка...</p>
        </div>
      </div>
    );
  }

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

        {/* Страница управления станциями мониторинга (только для администраторов) */}
        <Route
          path="/stations"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <StationsPage />
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
  console.log('🚀 App: Инициализация главного компонента');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;