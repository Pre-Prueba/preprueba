interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({
  value,
  color = 'var(--color-carrot)',
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      style={{
        width: '100%',
        height,
        background: 'var(--color-platinum)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          background: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}
