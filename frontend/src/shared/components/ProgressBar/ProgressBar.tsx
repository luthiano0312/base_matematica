import './ProgressBar.css';

type ProgressBarProps = {
  now: number;
  min?: number;
  max?: number;
  ariaLabel?: string;
};

export function ProgressBar({ now, min = 0, max = 100, ariaLabel = 'Progresso' }: ProgressBarProps) {
  const percent = ((now - min) / (max - min)) * 100;

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={now}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <div
        className="progress-bar__fill"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
