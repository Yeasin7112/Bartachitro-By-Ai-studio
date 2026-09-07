import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  title?: string;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 bg-slate-900 text-slate-100 font-bengali-body">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-bengali-display text-white">
              {this.props.title || this.props.fallbackTitle || 'সাময়িক ত্রুটি ঘটেছে'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। নিচের বোতামে ক্লিক করে পুনরায় চেষ্টা করুন অথবা হোমপেজে ফিরে যান।
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-300 bg-red-950/30 p-2.5 rounded text-left overflow-x-auto border border-red-900/40 max-h-24">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                পুনরায় লোড করুন
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                হোমপেজ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
