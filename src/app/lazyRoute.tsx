import { createElement, lazy, useState, type ComponentType } from 'react';

/**
 * Pantalla descargada al visitarla. `preload` permite tenerla disponible antes,
 * en cuyo caso se muestra sin estado de carga.
 */
export function lazyRoute(load: () => Promise<ComponentType>) {
  let loaded: ComponentType | null = null;
  let pending: Promise<ComponentType> | null = null;
  const preload = () =>
    (pending ??= load().then(
      (component) => (loaded = component),
      (error: unknown) => {
        pending = null;
        throw error;
      },
    ));
  const Deferred = lazy(() => preload().then((component) => ({ default: component })));

  function Route() {
    // El tipo se fija al montar para que la pantalla no se reinicie al terminar la carga.
    const [component] = useState<ComponentType>(() => loaded ?? Deferred);
    return createElement(component);
  }

  return { Route, preload };
}
