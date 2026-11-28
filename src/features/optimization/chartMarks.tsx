import type { MarkedPoint } from './optimizationFigures';

/** Cada punto usa una forma distinta para no depender sólo del color. */
export function PointShape({
  role,
  cx,
  cy,
}: {
  role: MarkedPoint['role'];
  cx?: number;
  cy?: number;
}) {
  if (cx === undefined || cy === undefined) return null;
  const className = `opt-point opt-point--${role}`;
  if (role === 'intersection')
    return (
      <circle
        className={className}
        cx={cx}
        cy={cy}
        r={8}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2.5}
      />
    );
  if (role === 'maximum')
    return (
      <circle
        className={className}
        cx={cx}
        cy={cy}
        r={5}
        fill="#22c55e"
        stroke="#f1f5f9"
        strokeWidth={1.5}
      />
    );
  if (role === 'next')
    return (
      <rect
        className={className}
        x={cx - 5}
        y={cy - 5}
        width={10}
        height={10}
        fill="#ef4444"
        stroke="#f1f5f9"
        strokeWidth={1.5}
      />
    );
  return (
    <path
      className={className}
      d={`M ${cx} ${cy - 8} L ${cx + 8} ${cy} L ${cx} ${cy + 8} L ${cx - 8} ${cy} Z`}
      fill="#8b5cf6"
      stroke="#f1f5f9"
      strokeWidth={1.5}
    />
  );
}

export function HatchPattern({ id }: { id: string }) {
  return (
    <defs>
      <pattern
        id={id}
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="10" height="10" fill="rgba(239,68,68,0.08)" />
        <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239,68,68,0.35)" strokeWidth="2" />
      </pattern>
    </defs>
  );
}
