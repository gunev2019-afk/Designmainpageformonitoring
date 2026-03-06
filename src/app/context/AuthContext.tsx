import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  username: string | null;
  userRole: UserRole | null;
  users: User[];
  createUser: (username: string, password: string, role: UserRole) => { success: boolean; message: string };
  deleteUser: (username: string) => boolean;
  updateUser: (username: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Инициализация пользователей с дефолтным администратором
const initializeUsers = (): User[] => {
  const savedUsers = localStorage.getItem('users');
  if (savedUsers) {
    return JSON.parse(savedUsers);
  }
  
  // Создаем дефолтного администратора
  const defaultUsers: User[] = [
    {
      username: 'admin',
      password: 'admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];
  
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initializeUsers);
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Проверяем сохраненную сессию в localStorage
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });

  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });

  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return localStorage.getItem('userRole') as UserRole | null;
  });

  // Синхронизация пользователей с localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // Сохраняем состояние авторизации в localStorage
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [isAuthenticated, username, userRole]);

  const login = (inputUsername: string, inputPassword: string): boolean => {
    const user = users.find(u => u.username === inputUsername && u.password === inputPassword);
    
    if (user) {
      setIsAuthenticated(true);
      setUsername(user.username);
      setUserRole(user.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  };

  const createUser = (username: string, password: string, role: UserRole): { success: boolean; message: string } => {
    // Проверка на существующего пользователя
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Пользователь с таким именем уже существует' };
    }

    // Валидация
    if (username.length < 3) {
      return { success: false, message: 'Имя пользователя должно быть не менее 3 символов' };
    }

    if (password.length < 4) {
      return { success: false, message: 'Пароль должен быть не менее 4 символов' };
    }

    const newUser: User = {
      username,
      password,
      role,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true, message: 'Пользователь успешно создан' };
  };

  const deleteUser = (username: string): boolean => {
    // Защита от удаления последнего админа
    const admins = users.filter(u => u.role === 'admin');
    const userToDelete = users.find(u => u.username === username);
    
    if (userToDelete?.role === 'admin' && admins.length === 1) {
      return false; // Нельзя удалить последнего админа
    }

    setUsers(prev => prev.filter(u => u.username !== username));
    return true;
  };

  const updateUser = (username: string, newPassword: string): boolean => {
    if (newPassword.length < 4) {
      return false;
    }

    setUsers(prev => prev.map(u => 
      u.username === username ? { ...u, password: newPassword } : u
    ));
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      username, 
      userRole,
      users,
      createUser,
      deleteUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}