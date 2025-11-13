import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
          <Card className="max-w-2xl w-full p-6 bg-white dark:bg-slate-800 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Something went wrong
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              An error occurred while rendering the application. Please check the console for details.
            </p>
            {this.state.error && (
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Error:
                </h2>
                <pre className="text-xs bg-gray-100 dark:bg-slate-700 p-3 rounded overflow-auto text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            {this.state.errorInfo && (
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Component Stack:
                </h2>
                <pre className="text-xs bg-gray-100 dark:bg-slate-700 p-3 rounded overflow-auto text-gray-600 dark:text-gray-400">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

