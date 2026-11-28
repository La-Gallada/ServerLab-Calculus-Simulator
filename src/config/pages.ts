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

export interface AppPage {
  path: string;
  title: string;
  navigationLabel: string;
  description: string;
  icon: LucideIcon;
}

export const pages: AppPage[] = [
  {
    path: '/',
    title: 'Dashboard',
    navigationLabel: 'Dashboard',
    description:
      'Resumen interactivo del tiempo de respuesta, la transferencia y la carga admisible.',
    icon: Gauge,
  },
  {
    path: '/limites',
    title: 'Límites',
    navigationLabel: 'Límites',
    description:
      'Análisis visual del comportamiento del modelo cerca de su capacidad de referencia.',
    icon: InfinityIcon,
  },
  {
    path: '/derivadas',
    title: 'Derivadas',
    navigationLabel: 'Derivadas',
    description: 'Estudio de la tasa de cambio del tiempo de respuesta en el modelo continuo.',
    icon: TrendingUp,
  },
  {
    path: '/integrales',
    title: 'Integrales',
    navigationLabel: 'Integrales',
    description: 'Tasa de transferencia, área bajo la curva y datos acumulados.',
    icon: Sigma,
  },
  {
    path: '/optimizacion',
    title: 'Optimización',
    navigationLabel: 'Optimización',
    description: 'Máxima carga que cumple un tiempo de respuesta.',
    icon: Target,
  },
  {
    path: '/exportaciones',
    title: 'Exportaciones',
    navigationLabel: 'Exportaciones',
    description: 'Catálogo de figuras académicas descargables como PNG, SVG o CSV.',
    icon: Download,
  },
  {
    path: '/acerca',
    title: 'Acerca de ServerLab',
    navigationLabel: 'Acerca de',
    description: 'Contexto académico, alcance y supuestos de esta simulación educativa.',
    icon: Info,
  },
];
