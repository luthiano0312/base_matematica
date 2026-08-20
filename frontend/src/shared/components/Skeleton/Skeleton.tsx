import { cx } from '../../utils/cx';
import './Skeleton.css';

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
};

/** Retângulo pulsante genérico para estados de carregamento (specs do admin). */
export function Skeleton({ width = '100%', height = 16, radius = 8, className }: SkeletonProps) {
  return (
    <div
      className={cx('skeleton', className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
