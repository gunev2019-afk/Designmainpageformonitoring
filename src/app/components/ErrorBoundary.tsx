import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * КОМПОНЕНТ ДЛЯ ПЕРЕХВАТА ОШИБОК
 * Предотвращает крэш всего приложения при ошибках рендеринга
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🔥 ErrorBoundary перехватил ошибку:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔥 Ошибка в компоненте:', error);
    console.error('🔥 Информация об ошибке:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#18181b] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Произошла ошибка
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {this.state.error?.message || 'Неизвестная ошибка'}
            </p>
            <button
              onClick={() => {
                console.log('🔄 Перезагрузка приложения...');
                window.location.reload();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Перезагрузить приложение
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
