import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * КОМПОНЕНТ ЗАЩИТЫ МАРШРУТОВ ДЛЯ АДМИНИСТРАТОРОВ
 * 
 * Проверяет, является ли текущий пользователь администратором.
 * Если нет - перенаправляет на главную страницу.
 */

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { userRole } = useAuth();

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
