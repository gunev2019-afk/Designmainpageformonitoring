import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, setLightTheme, setDarkTheme } = useTheme();
  const { logout, username, userRole } = useAuth();

  const baseNavItems = [
    { path: '/', label: 'Главная' },
    { path: '/export', label: 'Экспорт' },
    { path: '/logs', label: 'Логи' }
  ];

  // Добавляем вкладки для администраторов
  const navItems = userRole === 'admin' 
    ? [...baseNavItems, { path: '/stations', label: 'Станции' }, { path: '/users', label: 'Пользователи' }]
    : baseNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-[#27272a] border-b border-gray-200 dark:border-[#3f3f46] shadow-sm transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Логотип компании */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center transition-colors duration-300">
          <span className="text-white font-bold text-xl">M</span>
        </div>

        {/* Навигация */}
        <nav className="flex gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
                  : 'text-gray-700 dark:text-[#fafafa] hover:bg-gray-100 dark:hover:bg-[#3f3f46]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Правая часть: Имя пользователя, Переключатель темы и Выход */}
        <div className="ml-auto flex items-center gap-4">
          {/* Имя пользователя с ролью */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#3f3f46] rounded-lg transition-colors duration-300">
            <User className="w-4 h-4 text-gray-600 dark:text-[#a1a1aa]" />
            <span className="text-gray-700 dark:text-[#fafafa] font-medium">{username}</span>
            {userRole === 'admin' && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                Админ
              </span>
            )}
          </div>

          {/* Переключатель темной/светлой темы */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#3f3f46] rounded-lg p-1 transition-colors duration-300">
            <button
              onClick={setLightTheme}
              className={`p-2 rounded-md transition-all duration-200 ${
                !isDarkMode 
                  ? 'bg-white text-yellow-600 shadow-sm' 
                  : 'text-[#a1a1aa] hover:text-[#fafafa]'
              }`}
              title="Светлая тема"
            >
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={setDarkTheme}
              className={`p-2 rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-[#18181b] text-blue-400 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Темная тема"
            >
              <Moon className="w-5 h-5" />
            </button>
          </div>

          {/* Кнопка "Выход" */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 dark:text-[#fafafa] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            title="Выйти из системы"
          >
            <LogOut className="w-5 h-5" />
            <span>Выход</span>
          </button>
        </div>
      </div>
    </header>
  );
}