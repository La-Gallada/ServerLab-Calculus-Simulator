import type { LucideIcon } from 'lucide-react';
import {
  Download,
  Gauge,
  Infinity as InfinityIcon,
  Sigma,
  Target,
  TrendingUp,
  Info,
} from 'lucide-react';

export type DevelopmentStatus = 'Base preparada' | 'Planificado';

export interface AppPage {
  path: string;
  title: string;
  navigationLabel: string;
  description: string;
  status: DevelopmentStatus;
  icon: LucideIcon;
  assetPath?: string;
}

export const pages: AppPage[] = [
  {
    path: '/',
    title: 'Dashboard',
    navigationLabel: 'Dashboard',
    description:
      'Punto de partida para explorar el modelo hipotético y sus futuras visualizaciones.',
    status: 'Base preparada',
    icon: Gauge,
    assetPath: '/assets/icons/icon-dashboard.png',
  },
  {
    path: '/limites',
    title: 'Límites',
    navigationLabel: 'Límites',
    description:
      'Análisis visual del comportamiento del modelo cerca de su capacidad de referencia.',
    status: 'Planificado',
    icon: InfinityIcon,
    assetPath: '/assets/icons/icon-limits.png',
  },
  {
    path: '/derivadas',
    title: 'Derivadas',
    navigationLabel: 'Derivadas',
    description: 'Estudio de la tasa de cambio del tiempo de respuesta en el modelo continuo.',
    status: 'Planificado',
    icon: TrendingUp,
    assetPath: '/assets/icons/icon-derivatives.png',
  },
  {
    path: '/integrales',
    title: 'Integrales',
    navigationLabel: 'Integrales',
    description: 'Preparación para representar tasas de transferencia y datos acumulados.',
    status: 'Planificado',
    icon: Sigma,
    assetPath: '/assets/icons/icon-integrals.png',
  },
  {
    path: '/optimizacion',
    title: 'Optimización',
    navigationLabel: 'Optimización',
    description: 'Espacio para relacionar un umbral de respuesta con una carga admisible.',
    status: 'Planificado',
    icon: Target,
    assetPath: '/assets/icons/icon-optimization.png',
  },
  {
    path: '/exportaciones',
    title: 'Exportaciones',
    navigationLabel: 'Exportaciones',
    description: 'Catálogo de figuras académicas descargables como PNG, SVG o CSV.',
    status: 'Base preparada',
    icon: Download,
  },
  {
    path: '/acerca',
    title: 'Acerca de ServerLab',
    navigationLabel: 'Acerca de',
    description: 'Contexto académico, alcance y supuestos de esta simulación educativa.',
    status: 'Base preparada',
    icon: Info,
  },
];
