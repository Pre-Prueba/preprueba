import { type CSSProperties } from 'react';
import styles from './PipoRigMascot.module.css';

export type PipoRigMotion =
  | 'none'
  | 'idle'
  | 'attention'
  | 'celebrate'
  | 'sleep'
  | 'focus'
  | 'talk'
  | 'pop';

type PipoRigMascotProps = {
  size?: number | string;
  motion?: PipoRigMotion;
  className?: string;
  title?: string;
};

function getStyle(size: PipoRigMascotProps['size']): CSSProperties | undefined {
  if (!size) return undefined;
  return {
    '--pipo-size': typeof size === 'number' ? `${size}px` : size,
  } as CSSProperties;
}

export function PipoRigMascot({
  size,
  motion = 'idle',
  className = '',
  title,
}: PipoRigMascotProps) {
  const rootClassName = [
    styles.root,
    motion !== 'none' ? styles.motion : '',
    styles[`motion_${motion}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span
      className={rootClassName}
      style={getStyle(size)}
      data-pipo-rig="hero"
      data-pipo-motion={motion}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      <svg className={styles.svg} viewBox="0 0 1254 1254" xmlns="http://www.w3.org/2000/svg">
        {title && <title>{title}</title>}
        <g className={styles.character}>
          <image
            className={styles.body}
            href="/assets/pipo-rig/pipo-rig-body.png"
            width="1254"
            height="1254"
            preserveAspectRatio="xMidYMid meet"
          />
          <g className={styles.face}>
            <image
              className={`${styles.eye} ${styles.eyeLeft}`}
              href="/assets/pipo-rig/pipo-rig-eye-left.png"
              x="420"
              y="505"
              width="178"
              height="174"
              preserveAspectRatio="xMidYMid meet"
            />
            <image
              className={`${styles.eye} ${styles.eyeRight}`}
              href="/assets/pipo-rig/pipo-rig-eye-right.png"
              x="656"
              y="505"
              width="178"
              height="174"
              preserveAspectRatio="xMidYMid meet"
            />
            <image
              className={styles.mouth}
              href="/assets/pipo-rig/pipo-rig-mouth.png"
              x="580"
              y="600"
              width="92"
              height="82"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </g>
      </svg>
    </span>
  );
}

export default PipoRigMascot;
