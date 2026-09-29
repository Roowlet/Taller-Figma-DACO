import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

/**
 * Esqueleto de pagina autenticada NO formulario.
 *
 * Renderiza el breadcrumb, deja al consumidor inyectar el header
 * (slot `[pageHeader]`) y el cuerpo principal (slot default).
 * Pensado para las pantallas de "Consultas y reportes …", listados
 * simples y otras vistas que no necesitan el ciclo de un
 * `siaf-solicitude-page-layout` (estados de documento, acciones de
 * verificacion/aprobacion, etc.).
 *
 * Ejemplo:
 *
 *   <siaf-page-shell [breadcrumbs]="breadcrumbs">
 *     <siaf-page-header pageHeader title="..." />
 *     <siaf-empty-state ... />
 *   </siaf-page-shell>
 *
 * @usar
 * - Para las pantallas «Consultas y reportes» de cada proceso (plan de cuentas, asiento de ajuste, catálogo de tipos de
 *   asiento, contabilización y libros contables): breadcrumb, `siaf-page-header` en `[pageHeader]` y el resultado o
 *   `siaf-empty-state` en el cuerpo.
 * - Para listados simples y vistas de solo lectura que no tienen el ciclo de una solicitud.
 * @evitar
 * - Para solicitudes con estados y acciones del flujo: usar `siaf-solicitude-page-layout`.
 * - Para la pantalla Documentos / Registros de un proceso: usar `siaf-documents-records-page`, que ya trae breadcrumb,
 *   título y pestañas.
 * - Sin `siaf-page-header` en `[pageHeader]`: la página queda sin `h1`.
 * - Dentro de otro contenedor con alto propio: fija su alto a la ventana menos el navbar (`100vh - 56px`).
 * @teclado
 * - No recibe foco: no es interactivo. El breadcrumb y el contenido proyectado siguen su componente.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: pinta el breadcrumb (`siaf-breadcrumb`, un `nav` con
 *   `aria-label="Ruta de navegación"`) y no trae encabezado propio: el `h1` lo pone el `siaf-page-header` proyectado en
 *   `[pageHeader]`. No agrega landmarks: vive dentro del `main` del shell.
 * - **2.4.3 Orden del foco (A)**: el DOM sigue el orden visual: breadcrumb, encabezado con sus acciones y cuerpo.
 */
@Component({
  selector: 'siaf-page-shell',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `
    <div class="flex h-[calc(100vh-56px)] min-h-0 w-full flex-col bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <div class="border-b border-[var(--sys-color-divider-default)] bg-surface">
        <siaf-breadcrumb [items]="breadcrumbs" [homeHref]="homeHref" />
        <ng-content select="[pageHeader]" />
      </div>
      <div class="flex min-h-0 flex-1 flex-col p-siaf-md">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageShellComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() homeHref = '/panel';
}
