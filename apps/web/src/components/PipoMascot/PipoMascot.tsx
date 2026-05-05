import { type CSSProperties } from 'react';
import styles from './PipoMascot.module.css';

export type PipoMascotVariant =
  | 'default'
  | 'hero'
  | 'book'
  | 'celebrate'
  | 'sad'
  | 'sleep'
  | 'focus'
  | 'face';

export type PipoMascotMotion =
  | 'none'
  | 'idle'
  | 'attention'
  | 'celebrate'
  | 'sad'
  | 'sleep'
  | 'focus'
  | 'pop';

type PipoMascotProps = {
  variant?: PipoMascotVariant;
  size?: number | string;
  animated?: boolean;
  motion?: PipoMascotMotion;
  className?: string;
  title?: string;
};

type PipoSource = {
  href: string;
  width: number;
  height: number;
};

const PIPO_SOURCES: Record<PipoMascotVariant, PipoSource> = {
  default: { href: '/assets/pipo-hero.png', width: 1254, height: 1254 },
  hero: { href: '/assets/pipo-hero.png', width: 1254, height: 1254 },
  book: { href: '/assets/pipo-book.png', width: 1254, height: 1254 },
  celebrate: { href: '/assets/pipo-celebrate.png', width: 1254, height: 1254 },
  focus: { href: '/assets/pipo-focus.png', width: 1254, height: 1254 },
  face: { href: '/assets/mitad.png', width: 3919, height: 3919 },
  sad: { href: '/assets/pipo-sad.png', width: 1254, height: 1254 },
  sleep: { href: '/assets/pipo-sleep.png', width: 1254, height: 1254 },
};

function getStyle(size: PipoMascotProps['size']): CSSProperties | undefined {
  if (!size) return undefined;
  return {
    '--pipo-size': typeof size === 'number' ? `${size}px` : size,
  } as CSSProperties;
}

export function PipoMascot({
  variant = 'default',
  size,
  animated = false,
  motion,
  className = '',
  title,
}: PipoMascotProps) {
  const source = PIPO_SOURCES[variant] ?? PIPO_SOURCES.default;
  const motionName = motion ?? (animated ? 'idle' : 'none');
  const rootClassName = [
    styles.root,
    motionName !== 'none' ? styles.motion : '',
    styles[`motion_${motionName}`],
    animated ? styles.animated : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span
      className={rootClassName}
      style={getStyle(size)}
      data-pipo-variant={variant}
      data-pipo-source={source.href}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${source.width} ${source.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title && <title>{title}</title>}
        <g className={styles.source}>
          <image
            className={styles.sourceImage}
            href={source.href}
            width={source.width}
            height={source.height}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </svg>
    </span>
  );
}

export default PipoMascot;
