interface ProgressBarProps {
  value: number; // 0-100
  height?: number;
  variant?: 'blue' | 'orange' | 'success';
  animated?: boolean;
}

const gradients: Record<string, string> = {
  blue:    'linear-gradient(90deg, var(--pp-blue) 0%, var(--pp-blue-dark) 100%)',
  orange:  'linear-gradient(90deg, var(--pp-orange) 0%, var(--pp-amber-dark) 100%)',
  success: 'linear-gradient(90deg, var(--success) 0%, var(--success) 100%)',
};

export function ProgressBar({ value, height = 8, variant = 'blue', animated = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      style={{
        width: '100%',
        height,
        background: 'var(--bg-2)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso"
    >
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          background: gradients[variant],
          borderRadius: 'var(--radius-full)',
          transition: animated ? 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
    </div>
  );
}
