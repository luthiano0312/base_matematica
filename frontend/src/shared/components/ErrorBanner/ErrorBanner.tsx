import { AlertCircle } from 'lucide-react';
import './ErrorBanner.css';

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorBanner({ message, onRetry, retryLabel = 'Tentar novamente' }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={18} className="error-banner-icon" aria-hidden="true" />
      <span className="error-banner-message">{message}</span>
      {onRetry && (
        <button type="button" className="error-banner-retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
