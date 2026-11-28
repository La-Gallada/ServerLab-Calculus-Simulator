import { Component, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

/**
 * Una pantalla diferida puede fallar si se pierde la conexión o si se publicó una
 * versión nueva y los archivos anteriores ya no existen.
 */
export class RouteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Card className="route-error">
        <div role="alert">
          <h1>No fue posible mostrar esta sección</h1>
          <p>
            Revise su conexión y recargue la página. También puede ocurrir justo después de publicar
            una versión nueva.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Recargar la página</Button>
        <Link className="text-link" to="/">
          Ir al Dashboard
        </Link>
      </Card>
    );
  }
}
