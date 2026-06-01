import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React Error Boundary Caught]:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('bunker_room_id');
    localStorage.removeItem('bunker_player_id');
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 bg-tech-grid flex items-center justify-center p-6 scanline select-none relative">
          <div className="crt-overlay" />
          
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-2 border-red-500 rounded-2xl p-6 shadow-[0_0_35px_rgba(239,68,68,0.25)] relative z-10 text-center flex flex-col items-center">
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 animate-pulse mb-4">
              <ShieldAlert className="w-10 h-10 stroke-[1.5]" />
            </div>
            
            <h1 className="text-xl font-bold font-mono tracking-widest text-red-500 uppercase">
              TIZIMDA XATOLIK YUZ BERDI
            </h1>
            
            <p className="text-xs text-slate-400 font-mono tracking-wider mt-2 uppercase">
              TIZIMDA KUTILMAGAN XATOLIK. QAYTA ULANMOQDA...
            </p>

            <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-left w-full">
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Diagnostika Jurnali</span>
              <p className="text-[10px] font-mono text-red-400 break-words leading-relaxed">
                {this.state.errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-slate-950 font-bold font-mono text-xs uppercase tracking-widest rounded-xl transition shadow-[0_0_15px_rgba(239,68,68,0.3)] mt-6 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 animate-spin" /> TIZIMNI QAYTA YUKLASH
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
