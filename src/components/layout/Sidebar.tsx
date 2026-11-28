import { X } from 'lucide-react';
import { NavLink } from 'react-router';
import { teamName } from '../../config/authorship';
import { pages } from '../../config/pages';
import { Button } from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Navegación principal">
      <div className="sidebar__brand">
        <img
          src="/assets/branding/serverlab-logo-full-336.webp"
          width={168}
          height={168}
          alt="ServerLab Calculus Simulator"
        />
        <Button
          aria-label="Cerrar menú"
          className="sidebar__close"
          onClick={onClose}
          variant="ghost"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      <nav>
        <ul className="sidebar__nav">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <li key={page.path}>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                  end={page.path === '/'}
                  onClick={onClose}
                  to={page.path}
                >
                  <Icon aria-hidden="true" size={20} />
                  <span>{page.navigationLabel}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="sidebar__course">{teamName} · Proyecto de Investigación de Cálculo I</p>
    </aside>
  );
}
