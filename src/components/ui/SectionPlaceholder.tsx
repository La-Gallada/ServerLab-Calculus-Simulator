import { ArrowRight, BookOpenCheck, Construction, Home, RouteOff } from 'lucide-react';
import { Link } from 'react-router';
import type { AppPage } from '../../config/pages';
import { modelMetadata } from '../../config/model';
import { Card } from './Card';
import { PageHeader } from './PageHeader';

interface SectionPlaceholderProps {
  page?: AppPage;
  variant?: 'not-found';
}

export function SectionPlaceholder({ page, variant }: SectionPlaceholderProps) {
  if (variant === 'not-found') {
    return (
      <div className="page-content">
        <PageHeader
          title="Ruta no encontrada"
          description="Esta dirección no corresponde a una sección disponible de ServerLab."
          status="Planificado"
        />
        <Card className="placeholder-card">
          <RouteOff aria-hidden="true" className="placeholder-card__icon" />
          <h2>Volvamos al simulador</h2>
          <p>La navegación usa rutas estáticas compatibles con una publicación futura.</p>
          <Link className="text-link" to="/">
            <Home aria-hidden="true" size={18} /> Ir al Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  const Icon = page.icon;
  const isReady = page.status === 'Base preparada';

  return (
    <div className="page-content">
      <PageHeader title={page.title} description={page.description} status={page.status} />
      <Card className="placeholder-card">
        <div className="placeholder-card__visual" aria-hidden="true">
          {page.assetPath ? (
            <img alt="" src={page.assetPath} />
          ) : (
            <Icon size={56} strokeWidth={1.5} />
          )}
        </div>
        <div>
          <p className="eyebrow">M01 · Arquitectura</p>
          <h2>{isReady ? 'Estructura inicial disponible' : 'Módulo planificado'}</h2>
          <p>
            {isReady
              ? 'La navegación, los componentes base y el sistema visual ya están listos para recibir contenido verificable.'
              : 'La interfaz de este módulo se construirá en su hito correspondiente, con contenido académico y resultados calculados por el motor central.'}
          </p>
        </div>
        <div className="placeholder-card__notice">
          {isReady ? <BookOpenCheck aria-hidden="true" /> : <Construction aria-hidden="true" />}
          <span>
            Modelo {modelMetadata.status} · versión {modelMetadata.version}
          </span>
        </div>
        {page.path !== '/' && (
          <Link className="text-link" to="/">
            Consultar el estado general <ArrowRight aria-hidden="true" size={18} />
          </Link>
        )}
      </Card>
    </div>
  );
}
