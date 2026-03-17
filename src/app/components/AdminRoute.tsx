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
  console.log('👨‍💼 AdminRoute: Проверка прав администратора');
  
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('❌ AdminRoute: Ошибка при вызове useAuth:', error);
    return <Navigate to="/" replace />;
  }
  
  const { userRole } = auth;

  if (userRole !== 'admin') {
    console.log('❌ AdminRoute: Доступ запрещен, роль:', userRole);
    return <Navigate to="/" replace />;
  }

  console.log('✅ AdminRoute: Доступ разрешен');
  return <>{children}</>;
}
