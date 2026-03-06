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
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
