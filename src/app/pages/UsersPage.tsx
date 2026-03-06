import React, { useState } from 'react';
import { useAuth, User, UserRole } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Trash2, 
  Shield, 
  User as UserIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

/**
 * СТРАНИЦА УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ
 * 
 * Доступна только для администраторов.
 * Позволяет создавать, просматривать и удалять пользователей.
 */

export function UsersPage() {
  const { users, createUser, deleteUser, username: currentUsername } = useAuth();
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = createUser(newUsername, newPassword, newRole);
    
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    if (result.success) {
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      
      // Скрыть сообщение через 3 секунды
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteUser = (username: string) => {
    if (username === currentUsername) {
      setMessage({
        type: 'error',
        text: 'Невозможно удалить текущего пользователя'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
      const success = deleteUser(username);
      
      if (success) {
        setMessage({
          type: 'success',
          text: 'Пользователь успешно удален'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Невозможно удалить последнего администратора'
        });
      }
      
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-gray-900 dark:text-[#fafafa]">
              Управление пользователями
            </h1>
          </div>
          <p className="text-gray-600 dark:text-[#a1a1aa]">
            Создание и управление учетными записями пользователей системы
          </p>
        </div>

        {/* Сообщения */}
        {message && (
          <div className={`mb-6 flex items-center gap-2 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' 
              : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p className={message.type === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-red-700 dark:text-red-400'
            }>
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Форма создания нового пользователя */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3f3f46] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-gray-900 dark:text-[#fafafa]">
                Создать нового пользователя
              </h2>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Имя пользователя */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-[#fafafa]">
                  Имя пользователя
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]"
                  required
                />
                <p className="text-gray-500 dark:text-[#a1a1aa]">
                  Минимум 3 символа
                </p>
              </div>

              {/* Пароль */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-[#fafafa]">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Введите пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]"
                  required
                />
                <p className="text-gray-500 dark:text-[#a1a1aa]">
                  Минимум 4 символа
                </p>
              </div>

              {/* Роль */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 dark:text-[#fafafa]">
                  Роль
                </Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger className="bg-gray-50 dark:bg-[#18181b] border-gray-300 dark:border-[#3f3f46] text-gray-900 dark:text-[#fafafa]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Пользователь</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-gray-500 dark:text-[#a1a1aa]">
                  Пользователи не имеют доступа к управлению пользователями
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Создать пользователя
              </Button>
            </form>
          </div>

          {/* Список пользователей */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#3f3f46] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-gray-900 dark:text-[#fafafa]">
                Список пользователей
              </h2>
              <span className="ml-auto px-3 py-1 bg-gray-100 dark:bg-[#3f3f46] rounded-full text-gray-700 dark:text-[#fafafa]">
                {users.length}
              </span>
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-[#3f3f46] transition-colors duration-200"
                >
                  {/* Иконка пользователя */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-500/20`}>
                    {user.role === 'admin' ? (
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>

                  {/* Информация о пользователе */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 dark:text-[#fafafa] font-medium">
                        {user.username}
                      </p>
                      {user.username === currentUsername && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                          Вы
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-[#a1a1aa]">
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'} • {formatDate(user.createdAt)}
                    </p>
                  </div>

                  {/* Кнопка удаления */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.username)}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0"
                    disabled={user.username === currentUsername}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Информационная панель */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-900 dark:text-blue-400 mb-2">
            Информация о ролях
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Администратор:</strong> Полный доступ к системе, включая управление пользователями</span>
            </li>
            <li className="flex items-start gap-2">
              <UserIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Пользователь:</strong> Доступ к мониторингу, экспорту и логам. Без доступа к управлению пользователями</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}