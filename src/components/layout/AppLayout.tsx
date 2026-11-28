import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app-shell">
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
        <main id="main-content">{children}</main>
        <footer className="app-footer">
          <span>ServerLab v0.1 · Universidad Latina de Costa Rica</span>
          <span>Modelo hipotético · Cálculo I</span>
        </footer>
      </div>
    </div>
  );
}
