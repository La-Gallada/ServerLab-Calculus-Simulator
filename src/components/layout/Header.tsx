import { Menu, Radio } from 'lucide-react';
import { useLocation } from 'react-router';
import { pages } from '../../config/pages';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const location = useLocation();
  const page = pages.find((item) => item.path === location.pathname);

  return (
    <header className="app-header">
      <Button
        aria-label="Abrir menú"
        className="app-header__menu"
        onClick={onMenuOpen}
        variant="ghost"
      >
        <Menu aria-hidden="true" />
      </Button>
      <div>
        <p className="app-header__kicker">Analiza · Calcula · Optimiza</p>
        <p className="app-header__title">{page?.title ?? 'ServerLab'}</p>
      </div>
      <div className="app-header__status">
        <Radio aria-hidden="true" size={17} />
        <span>Entorno académico</span>
      </div>
    </header>
  );
}
