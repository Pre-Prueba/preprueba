import { Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import s from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error }: { error?: Error }) {
  const navigate = useNavigate();

  return (
    <div className={s.container}>
      <div className={s.card}>
        <AlertTriangle size={48} className={s.icon} />
        <h1 className={s.title}>Algo salió mal</h1>
        <p className={s.desc}>
          Lo sentimos, ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        {error?.message && (
          <pre className={s.code}>{error.message}</pre>
        )}
        <div className={s.actions}>
          <button className={s.btnPrimary} onClick={() => window.location.reload()}>
            <RotateCcw size={16} />
            Reintentar
          </button>
          <button className={s.btnSecondary} onClick={() => navigate('/dashboard')}>
            <Home size={16} />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
