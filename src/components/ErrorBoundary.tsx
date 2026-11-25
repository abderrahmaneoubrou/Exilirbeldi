import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Une erreur inattendue est survenue.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#171C18] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#F2F0EA] border border-[#E4E2DA] rounded-xl p-8 text-center">
            <h1 className="font-display text-2xl font-medium text-[#171C18]">
              Interruption momentanée
            </h1>
            <p className="mt-3 text-sm text-[#545A55] leading-relaxed">
              Une opération n&apos;a pas pu aboutir correctement. Vous pouvez recharger la boutique pour reprendre votre navigation.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2.5 min-h-[42px] text-sm font-medium bg-[#2D4732] text-[#FAF9F6] rounded-md hover:bg-[#223726] transition-colors cursor-pointer"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
