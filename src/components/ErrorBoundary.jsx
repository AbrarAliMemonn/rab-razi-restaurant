import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-4">
            🍗
          </div>
          <h1 className="text-xl font-black text-white mb-2">Rab Razi Restaurant</h1>
          <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
            Application refresh hone me masla pesh aya. Niche diye gaye button par click karein taake page dobara reload ho sake.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg transition-all"
            >
              Reload Page 🔄
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all"
            >
              Clear Cache & Reload 🧹
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
