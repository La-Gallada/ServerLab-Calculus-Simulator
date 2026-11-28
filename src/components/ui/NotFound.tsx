import { Home, RouteOff } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from './Card';

export function NotFound() {
  return (
    <div className="page-content">
      <Card className="not-found">
        <RouteOff aria-hidden="true" size={40} />
        <h1>Ruta no encontrada</h1>
        <p>Esta dirección no corresponde a una sección disponible de ServerLab.</p>
        <Link className="text-link" to="/">
          <Home aria-hidden="true" size={18} /> Ir al Dashboard
        </Link>
      </Card>
    </div>
  );
}
