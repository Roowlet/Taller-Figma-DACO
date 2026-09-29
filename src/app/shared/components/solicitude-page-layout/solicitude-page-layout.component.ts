import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';
import { SolicitudeHeaderComponent, SolicitudeHeaderRole, SolicitudeHeaderState } from '../solicitude-header/solicitude-header.component';

/**
 * Armazón de las pantallas de solicitud: breadcrumb y `siaf-solicitude-header` en una cabecera que queda fija bajo el
 * navbar en escritorio, y debajo el contenido proyectado (las tarjetas del formulario).
 * Reenvía al header `role`, `state`, los textos, `loading` y los deshabilitados de Grabar y Verificar, y re-emite sus
 * eventos (`saved`, `verified`, `approved`…); con `customActions`, lo proyectado en `[actions]` pasa al header.
 *
 * @usar
 * - En toda request-page con ciclo de documento: plan de cuentas (solicitud y carga masiva), asiento de ajuste,
 *   catálogo de ajuste (tipo y clase), catálogo de eventos (SCE y SCM), eventos contables y apertura contable.
 * - En los formularios de Admin (usuarios, entidades, unidades ejecutoras, dependencias, perfiles, procedimientos,
 *   sistemas funcionales, correlativos) con `role="creator"` y `state` en `new` o `edit`.
 * - Con `customActions` en detalles con acciones propias («Reprocesar» en contabilización) y con `showButtonGroup` en
 *   false cuando los botones van en la tarjeta.
 * @evitar
 * - Para consultas, reportes y listados sin ciclo de documento: usar `siaf-page-shell` con `siaf-page-header`.
 * - Para la pantalla Documentos / Registros de un proceso: usar `siaf-documents-records-page`.
 * - Rearmar a mano el breadcrumb y `siaf-solicitude-header` en la página: se pierden la cabecera fija y el reenvío de
 *   eventos.
 * - Repetir Grabar o Verificar dentro del contenido cuando la matriz de `role` y `state` ya los resuelve en el header.
 * @teclado
 * - No agrega teclado propio: Tab recorre el breadcrumb, Regresar y los botones de `siaf-solicitude-header` y después
 *   el contenido proyectado; cada control sigue su componente.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: breadcrumb (`nav` con `aria-label="Ruta de navegación"`) y el `h1` del
 *   header arriba; las tarjetas proyectadas siguen con `h2` (`siaf-solicitude-form-card`). No agrega landmarks: vive
 *   dentro del `main` del shell.
 * - **2.4.3 Orden del foco (A)**: el DOM sigue el orden visual: breadcrumb, Regresar, acciones del header y contenido.
 * - **Pendiente · 2.4.11 Foco no oculto (AA)**: en escritorio la cabecera es `sticky` bajo el navbar y no hay
 *   `scroll-padding`: al volver con Shift + Tab, un campo puede quedar tapado. En móvil, `pb-24` solo evita que la
 *   barra fija del header tape el final del contenido.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: con `loading` el esqueleto del header no se anuncia (hereda de
 *   `siaf-solicitude-header`).
 */
@Component({
  selector: 'siaf-solicitude-page-layout',
  standalone: true,
  imports: [BreadcrumbComponent, SolicitudeHeaderComponent],
  template: `
    <section
      class="min-w-0"
      [class.lg:pl-[364px]]="trayMenuOpen"
      [class.lg:pl-[434px]]="floatingPanelOpen"
    >
      <!--
        Cabecera fija en escritorio: los botones de acción (Grabar, Editar,
        Verificar, Aprobar) quedan siempre a la vista sin volver al tope.
        top-14 = alto del navbar, que ya es sticky. El z-10 la deja por
        debajo del navbar (z-30) y de los overlays de procesos/bandeja (z-20).
        En móvil no se fija: la cabecera se apila y se comería el viewport.
      -->
      <section class="border-b border-[var(--sys-color-divider-default)] bg-surface lg:sticky lg:top-14 lg:z-10">
        <siaf-breadcrumb class="block" [items]="breadcrumbs" />
        <siaf-solicitude-header
          [role]="role"
          [state]="state"
          [heading]="heading"
          [secondaryText]="secondaryText"
          [showReturn]="showReturn"
          [showTag]="showTag"
          [customActions]="customActions"
          [showButtonGroup]="showButtonGroup"
          [saveDisabled]="saveDisabled"
          [verifyDisabled]="verifyDisabled"
          [loading]="loading"
          (returned)="returned.emit()"
          (canceled)="canceled.emit()"
          (saved)="saved.emit()"
          (edited)="edited.emit()"
          (verified)="verified.emit()"
          (deleted)="deleted.emit()"
          (approved)="approved.emit()"
          (observed)="observed.emit()"
          (rejected)="rejected.emit()"
        >
          <ng-content select="[actions]" ngProjectAs="[actions]" />
        </siaf-solicitude-header>
      </section>

      <section class="flex flex-col gap-siaf-md p-siaf-md pb-24 lg:pb-siaf-md">
        <ng-content />
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudePageLayoutComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() role: SolicitudeHeaderRole = 'creator';
  @Input() state: SolicitudeHeaderState = 'new';
  @Input() heading = '';
  @Input() secondaryText = '';
  @Input() showReturn = true;
  @Input() showTag = true;
  /** Reemplaza los botones estándar del header por el slot proyectado `[actions]`. */
  @Input() customActions = false;
  /** Apaga el grupo de botones estándar del header (para páginas con botones a nivel de card). */
  @Input() showButtonGroup = true;
  @Input() saveDisabled = false;
  @Input() verifyDisabled = false;
  @Input() trayMenuOpen = false;
  @Input() floatingPanelOpen = false;
  @Input() loading = false;

  @Output() returned = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
  @Output() approved = new EventEmitter<void>();
  @Output() observed = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();
}
