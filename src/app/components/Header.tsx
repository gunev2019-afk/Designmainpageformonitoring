import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'home', label: 'Главная' },
    { id: 'logs', label: 'Логи' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Логотип компании (5% ширины) */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">M</span>
        </div>

        {/* Навигация */}
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Кнопка "Выход" в правом краю */}
        <div className="ml-auto">
          <button
            onClick={() => onTabChange('logout')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'logout'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Выход
          </button>
        </div>
      </div>
    </header>
  );
}