import type { ReactNode } from 'react';
import { Badge } from './Badge';
import type { DevelopmentStatus } from '../../config/pages';

interface PageHeaderProps {
  title: string;
  description: string;
  status: DevelopmentStatus;
  children?: ReactNode;
}

export function PageHeader({ title, description, status, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">ServerLab · Calculus Simulator</p>
        <h1>{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      <div className="page-header__meta">
        <Badge tone={status === 'Base preparada' ? 'green' : 'amber'}>{status}</Badge>
        {children}
      </div>
    </header>
  );
}
