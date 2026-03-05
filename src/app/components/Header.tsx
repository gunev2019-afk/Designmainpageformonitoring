import React from 'react';
import { Link, useLocation } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Header() {
  const location = useLocation();
  const { isDarkMode, setLightTheme, setDarkTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/export', label: 'Экспорт' },
    { path: '/logs', label: 'Логи' }
  ];

  const handleLogout = () => {
    console.log('Выход из системы');
    // TODO: Здесь должна быть логика выхода из системы
    alert('Выход из системы');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
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
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Правая часть: Переключатель темы и Выход */}
        <div className="ml-auto flex items-center gap-2">
          {/* Переключатель темной/светлой темы */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300">
            <button
              onClick={setLightTheme}
              className={`p-2 rounded-md transition-all duration-200 ${
                !isDarkMode 
                  ? 'bg-white text-yellow-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="Светлая тема"
            >
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={setDarkTheme}
              className={`p-2 rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-blue-400 shadow-sm' 
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
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Выход
          </button>
        </div>
      </div>
    </header>
  );
}
