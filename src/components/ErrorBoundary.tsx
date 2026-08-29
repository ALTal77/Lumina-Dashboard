import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown) {
    console.error('Lumina dashboard crashed:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-surface flex items-center justify-center px-4"
          dir="ltr"
        >
          <div className="max-w-sm w-full text-center bg-page border border-border rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-danger-bg rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">
              ⚠️
            </div>
            <h1 className="text-lg font-black text-heading mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-muted mb-4 break-words">
              {this.state.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
