interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 32, color = 'var(--color-carrot)' }: SpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid var(--color-platinum)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
      role="status"
      aria-label="Cargando..."
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
