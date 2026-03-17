import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, User, AlertCircle, Sun, Moon } from 'lucide-react';

/**
 * СТРАНИЦА АВТОРИЗАЦИИ
 * 
 * Форма входа в систему мониторинга.
 * Учетные данные: admin / admin
 */

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, setLightTheme, setDarkTheme } = useTheme();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Неверное имя пользователя или пароль');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] transition-colors duration-300 flex items-center justify-center p-4">
      {/* Переключатель темы в правом верхнем углу */}
      <div className="fixed top-6 right-6 flex items-center gap-1 bg-white dark:bg-[#27272a] rounded-lg p-1 shadow-lg border border-gray-200 dark:border-[#3f3f46] transition-colors duration-300">
        <button
          onClick={setLightTheme}
          className={`p-2 rounded-md transition-all duration-200 ${
            !isDarkMode 
              ? 'bg-gray-100 text-yellow-600 shadow-sm' 
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
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Темная тема"
        >
          <Moon className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-gray-900 dark:text-[#fafafa]">
            Система мониторинга
          </h1>
          <p className="text-gray-600 dark:text-[#a1a1aa] mt-2">
            Войдите в систему для продолжения
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-[#3f3f46]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Поле имени пользователя */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 dark:text-[#fafafa]">
                Имя пользователя
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#a1a1aa]" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa] placeholder:text-gray-400 dark:placeholder:text-[#71717a]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Поле пароля */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-[#fafafa]">
                Пароль
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#a1a1aa]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa] placeholder:text-gray-400 dark:placeholder:text-[#71717a]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Кнопка входа */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </div>

        {/* Футер */}
        <p className="text-center text-gray-500 dark:text-[#a1a1aa] mt-8">
          © 2026 Система онлайн-мониторинга
        </p>
      </div>
    </div>
  );
}