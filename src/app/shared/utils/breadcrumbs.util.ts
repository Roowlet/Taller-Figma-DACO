import { isDevMode } from '@angular/core';

import type { BreadcrumbItem } from '../components/breadcrumb/breadcrumb.component';
import { findProcessPathById } from './process-tree.util';

/**
 * Arma el breadcrumb de una página a partir del árbol de procesos.
 *
 * Antes cada pantalla repetía el mismo bloque a mano (21 lugares), con un
 * riesgo silencioso: si el `processId` no existe en el árbol,
 * `findProcessPathById` devuelve `[]` y el breadcrumb queda con solo
 * "Inicio" **sin que nada falle**. Acá eso se avisa por consola en
 * desarrollo, que es cuando se puede corregir.
 *
 * @param processId  Id de la hoja del árbol que representa esta página.
 * @param processRoute Ruta del módulo: la lleva el nodo de la hoja; los
 *   ancestros son agrupadores y apuntan a `/panel`.
 * @param hoja Último item, sin enlace (ej. "Solicitud de Clase de Ajuste").
 */
export function buildProcessBreadcrumbs(
  processId: string,
  processRoute: string,
  hoja?: string,
): BreadcrumbItem[] {
  const path = findProcessPathById(processId);

  if (isDevMode() && path.length === 0) {
    console.warn(
      `[breadcrumbs] El proceso "${processId}" no existe en el árbol del menú: ` +
        'el breadcrumb quedará incompleto. Revisá process-tree.util.ts.',
    );
  }

  return [
    { label: 'Inicio', href: '/panel' },
    ...path.map((node) => ({
      label: node.label,
      href: node.id === processId ? processRoute : '/panel',
    })),
    ...(hoja ? [{ label: hoja }] : []),
  ];
}

/**
 * Igual que `buildProcessBreadcrumbs` pero sin el "Inicio" inicial, para
 * las pantallas de consultas que arrancan directo en el path del proceso.
 */
export function buildProcessPath(processId: string, processRoute: string): BreadcrumbItem[] {
  return buildProcessBreadcrumbs(processId, processRoute).slice(1);
}
