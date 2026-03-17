import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * ЗАЩИЩЕННЫЙ МАРШРУТ
 * 
 * Компонент-обертка для защиты страниц, требующих авторизации.
 * Если пользователь не авторизован, перенаправляет на страницу входа.
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log('🛡️ ProtectedRoute: Начало рендера');
  
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('❌ ProtectedRoute: Ошибка при вызове useAuth:', error);
    return <Navigate to="/login" replace />;
  }
  
  const { isAuthenticated, isLoading } = auth;

  console.log('🛡️ ProtectedRoute:', { isAuthenticated, isLoading });

  // Ждем пока загрузится состояние авторизации
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-[#a1a1aa]">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ ProtectedRoute: Перенаправление на /login');
    return <Navigate to="/login" replace />;
  }

  console.log('🛡️ ProtectedRoute: Доступ разрешен');
  return <>{children}</>;
}