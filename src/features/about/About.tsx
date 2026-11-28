import { Link } from 'react-router';
import { Card } from '../../components/ui/Card';
import { Formula } from '../../components/ui/Formula';
import { capacityUsers, lastOperationalUser, maximumTransferSeconds } from '../../config/domain';
import { mathModelConfig } from '../../config/model';
import { pages } from '../../config/pages';
import { authorshipNote } from '../../export/metadata';
import { rateTex } from '../integrals/integralTex';
import { responseTex } from '../optimization/optimizationTex';

const modules = pages.filter((page) => page.path !== '/acerca');

const technologies = [
  ['React y TypeScript', 'interfaz y verificación de tipos'],
  ['Vite y Tailwind CSS', 'compilación estática y estilos'],
  ['React Router', 'navegación sin servidor mediante rutas con «#»'],
  ['Recharts', 'gráficas interactivas'],
  ['KaTeX', 'expresiones matemáticas'],
  ['Lucide', 'iconografía'],
  ['Vitest y Playwright', 'pruebas automatizadas'],
] as const;

export function About() {
  return (
    <div className="about" aria-label="Información del proyecto">
      <header className="limits-lab__intro">
        <div>
          <p className="eyebrow">Proyecto educativo · modelo provisional</p>
          <h1>Acerca de ServerLab</h1>
          <p>
            ServerLab | Calculus Simulator es una aplicación web educativa para explorar cómo el
            cálculo permite analizar el rendimiento de un servidor web hipotético.
          </p>
        </div>
      </header>

      <div className="about-grid">
        <Card>
          <h2>Contexto académico</h2>
          <p>
            Producto aplicado del Proyecto de Investigación #4 de Cálculo I, III Cuatrimestre de
            2026, Universidad Latina de Costa Rica. Esta aplicación no constituye un aval
            institucional.
          </p>
          <p>{authorshipNote}</p>
        </Card>

        <Card>
          <h2>Relación con Ingeniería en Sistemas</h2>
          <p>
            Los límites describen el comportamiento cerca de la capacidad; las derivadas, la
            sensibilidad ante la carga; las integrales, el volumen de datos transferidos, y la
            optimización, la carga admisible bajo un objetivo de respuesta.
          </p>
        </Card>

        <Card className="about-wide">
          <h2>Módulos disponibles</h2>
          <ul className="about-modules">
            {modules.map((page) => (
              <li key={page.path}>
                <Link to={page.path}>{page.navigationLabel}</Link>
                <span>{page.description}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2>Modelo hipotético y provisional</h2>
          <Formula expression={responseTex} label="tiempo de respuesta" />
          <p>
            Tiempo de respuesta en ms para 0 ≤ n &lt; {capacityUsers}; la operación usa usuarios
            enteros de 0 a {lastOperationalUser}.
          </p>
          <Formula expression={rateTex} label="tasa de transferencia" />
          <p>Tasa en MB/s para 0 ≤ t ≤ {maximumTransferSeconds} s.</p>
          <p>
            Versión {mathModelConfig.version}. Los parámetros están pendientes de confirmación por
            el grupo.
          </p>
        </Card>

        <Card>
          <h2>Alcance y limitaciones</h2>
          <ul>
            <li>No mide, vigila ni administra infraestructura real.</li>
            <li>Los resultados no son mediciones ni pruebas de carga.</li>
            <li>No modela CPU, memoria, red, costos ni almacenamiento.</li>
            <li>No tiene servidor, cuentas ni base de datos; todo se calcula en el navegador.</li>
            <li>Se ha verificado principalmente en navegadores basados en Chromium.</li>
          </ul>
        </Card>

        <Card className="about-wide">
          <h2>Tecnologías utilizadas</h2>
          <dl className="about-technologies">
            {technologies.map(([name, use]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{use}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
