import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { appVersion, nonEndorsementNotice, teamName } from '../../config/authorship';
import { pages } from '../../config/pages';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigation = useNavigationType();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const page = pages.find((item) => item.path === pathname);
    document.title =
      pathname === '/'
        ? 'ServerLab | Calculus Simulator'
        : `${page?.title ?? 'Ruta no encontrada'} · ServerLab`;
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    // Al seguir un enlace se empieza arriba; atrás y adelante conservan la posición.
    if (navigation !== 'POP') document.documentElement.scrollTop = 0;
    main.current?.focus({ preventScroll: true });
  }, [pathname, navigation]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      document.querySelector<HTMLButtonElement>('.app-header__menu')?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  return (
    <div className="app-shell">
      {/* Es un botón porque las rutas usan el fragmento de la dirección. */}
      <button type="button" className="skip-link" onClick={() => main.current?.focus()}>
        Saltar al contenido
      </button>
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {isMenuOpen && (
        <button
          aria-label="Cerrar menú"
          className="app-shell__backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div className="app-shell__body">
        <Header onMenuOpen={() => setIsMenuOpen(true)} />
        <main id="main-content" ref={main} tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <span>
            Desarrollado por el {teamName} · Universidad Latina de Costa Rica ·{' '}
            {nonEndorsementNotice}
          </span>
          <span>
            Proyecto de Investigación de Cálculo I · Ingeniería en Sistemas · III Cuatrimestre, 2026
            · Modelo hipotético · v{appVersion}
          </span>
        </footer>
      </div>
    </div>
  );
}
