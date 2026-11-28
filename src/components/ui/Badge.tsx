import type { HTMLAttributes } from 'react';

type BadgeTone = 'cyan' | 'violet' | 'green' | 'amber';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className = '', tone = 'cyan', ...props }: BadgeProps) {
  return <span className={`badge badge--${tone} ${className}`} {...props} />;
}
