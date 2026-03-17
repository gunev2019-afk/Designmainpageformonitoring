import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../utils/api';

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  username: string | null;
  userRole: UserRole | null;
  userId: number | null;
  users: User[];
  loadUsers: () => Promise<void>;
  createUser: (username: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: number) => Promise<boolean>;
  updateUser: (userId: number, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔐 AuthProvider: Инициализация');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка токена при загрузке
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 AuthContext: Инициализация проверки токена...');
      const token = api.getToken();
      console.log('🔐 AuthContext: Токен в localStorage:', token ? 'ЕСТЬ' : 'НЕТ');
      
      if (token) {
        try {
          // Проверяем валидность токена
          console.log('🔐 AuthContext: Проверяем валидность токена...');
          const response = await api.getCurrentUser();
          console.log('🔐 AuthContext: Ответ getCurrentUser:', response);
          
          if (response.success && response.data?.user) {
            const user = response.data.user;
            console.log('✅ AuthContext: Токен валидный, пользователь:', user.username);
            setIsAuthenticated(true);
            setUsername(user.username);
            setUserRole(user.role);
            setUserId(user.id);
          } else {
            // Токен невалидный
            console.log('❌ AuthContext: Токен невалидный, удаляем');
            api.removeToken();
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Ошибка проверки токена
          console.log('❌ AuthContext: Ошибка проверки токена:', error);
          api.removeToken();
          setIsAuthenticated(false);
        }
      } else {
        console.log('ℹ️ AuthContext: Токена нет, пользователь не авторизован');
        setIsAuthenticated(false);
      }
      
      console.log('🔐 AuthContext: Завершение инициализации, isLoading = false');
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Авторизация
   */
  const login = async (inputUsername: string, inputPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login(inputUsername, inputPassword);
      
      if (response.success && response.data) {
        const { user } = response.data;
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserRole(user.role);
        setUserId(user.id);
        return { success: true };
      }
      
      return { success: false, error: 'Ошибка авторизации' };
    } catch (error) {
      if (error instanceof api.ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Ошибка подключения к серверу' };
    }
  };

  /**
   * Выход
   */
  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      // Игнорируем ошибки при выходе
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
      setUserRole(null);
      setUserId(null);
      setUsers([]);
    }
  };

  /**
   * Загрузка списка пользователей (только для админов)
   */
  const loadUsers = async (): Promise<void> => {
    if (userRole !== 'admin') {
      return;
    }

    try {
      const response = await api.getUsers();
      
      if (response.success && response.data?.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  /**
   * Создать пользователя
   */
  const createUser = async (
    username: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; message: string }> => {
    if (userRole !== 'admin') {
      return { success: false, message: 'Недостаточно прав' };
    }

    try {
      const response = await api.createUser(username, password, role);
      
      if (response.success) {
        // Перезагружаем список пользователей
        await loadUsers();
        return { success: true, message: 'Пользователь успешно создан' };
      }
      
      return { success: false, message: response.error || 'Ошибка создания пользователя' };
    } catch (error) {
      if (error instanceof api.ApiError) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Ошибка подключения к серверу' };
    }
  };

  /**
   * Удалить пользователя
   */
  const deleteUser = async (targetUserId: number): Promise<boolean> => {
    if (userRole !== 'admin') {
      return false;
    }

    // Нельзя удалить самого себя
    if (targetUserId === userId) {
      return false;
    }

    try {
      const response = await api.deleteUser(targetUserId);
      
      if (response.success) {
        // Перезагружаем список пользователей
        await loadUsers();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      return false;
    }
  };

  /**
   * Обновить пользователя
   */
  const updateUser = async (targetUserId: number, newPassword: string): Promise<boolean> => {
    if (userRole !== 'admin') {
      return false;
    }

    if (newPassword.length < 6) {
      return false;
    }

    try {
      const response = await api.updateUser(targetUserId, { password: newPassword });
      
      if (response.success) {
        // Перезагружаем список пользователей
        await loadUsers();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      username, 
      userRole,
      userId,
      users,
      loadUsers,
      createUser,
      deleteUser,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth вызван вне AuthProvider!');
    console.error('Проверьте структуру компонентов в App.tsx');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}