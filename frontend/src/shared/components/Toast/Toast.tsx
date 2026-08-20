import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cx } from '../../utils/cx';
import './Toast.css';

type ToastType = 'success' | 'error';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

/**
 * Toast de sucesso/erro usado nos modais e listagens do admin
 * (Spec_Modal_Confirmacao_Exclusao — casos de sucesso/falha).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const value = useRef<ToastContextValue>({
    success: (message) => show('success', message),
    error: (message) => show('error', message),
  });

  return (
    <ToastContext.Provider value={value.current}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cx('toast', `toast--${toast.type}`)}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} aria-hidden="true" />
      ) : (
        <AlertCircle size={18} aria-hidden="true" />
      )}
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  }
  return context;
}
