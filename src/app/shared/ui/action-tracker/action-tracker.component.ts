import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export type ActionTrackerVariant = 'default' | 'detail';
export type ActionTrackerTab = 'detail' | 'history';
export type ActionTrackerDetailType =
  | 'default'
  | 'rejection-explanation'
  | 'rejection-reason'
  | 'evaluation-comment'
  | 'acceptance-comment'
  | 'observation-comment';

export type ActionTrackerSummary = {
  /** Etiqueta del rol, ej: 'Elaborado por', 'Verificado por', 'Aprobado por' */
  label: string;
  /** Nombre del usuario. Vacío muestra el placeholder "No asignado aún". */
  actionBy: string;
  /** Fecha/hora. Vacío muestra "Fecha y hora no registradas". */
  date: string;
};

export type ActionTrackerHistoryRow = {
  iteration: string;
  process: string;
  reason: string;
  description: string;
  date: string;
  role: string;
  user: string;
};

const DETAIL_LABELS: Record<ActionTrackerDetailType, string> = {
  default: 'DESCRIPCION',
  'rejection-explanation': 'EXPLICACION RECHAZO',
  'rejection-reason': 'MOTIVO RECHAZO',
  'evaluation-comment': 'COMENTARIO EVALUACION',
  'acceptance-comment': 'COMENTARIO ACEPTACION',
  'observation-comment': 'COMENTARIO OBSERVACION'
};

/**
 * Trazabilidad de una solicitud: pestañas Detalle/Historial y tarjetas de quién hizo qué y cuándo.
 *
 * Es el componente canónico para mostrar el avance y los comentarios de un documento (lo usan 11
 * archivos). No usar `siaf-steps` para esto: sus pasos no muestran responsables ni comentarios.
 *
 * @usar
 * - Al pie de las pantallas de solicitud, para quién elaboró, verificó y aprobó y cuándo (`[showSummaryCards]="true"`
 *   y `[showTabs]="false"`): plan de cuentas, catálogo de ajustes, asiento de ajuste, apertura contable y
 *   Contabilización.
 * - Dentro de `siaf-account-history-panel` y `siaf-asiento-history-panel`, para cerrar el historial del registro con
 *   sus responsables.
 * - Con `summaryItems` reales: un `actionBy` o `date` vacío muestra «No asignado aún» o «Fecha y hora no registradas».
 * @evitar
 * - Para comentarios e iteraciones con pestañas Detalle / Historial: usar `siaf-detail-history-tabs`; las pestañas de
 *   este componente no cambian al pulsarlas y sus valores por defecto son de muestra.
 * - Para pasos numerados de un flujo: usar `siaf-steps`; para hitos con fecha, `siaf-timeline`.
 * - Para el historial de estados de un documento desde la bandeja: usar `siaf-document-history-panel`.
 * @teclado
 * - Tal como lo usa la app (solo tarjetas de responsables) no recibe foco: no es interactivo.
 * - **Tab** (con `showTabs` o `variant="detail"`): enfoca los botones Detalle e Historial.
 * - **Enter / Espacio**: no cambian de pestaña; la activa la fija el padre con `activeTab`.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: el historial es una `table` con `thead` y `th` bajo un `h3`; en las
 *   tarjetas cada etiqueta precede a su valor en el orden de lectura.
 * - **1.4.1 Uso del color (A)**: responsables, fechas y procesos van en texto; la pestaña activa además va en negrita
 *   y subrayada.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: en las tarjetas, etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1)
 *   y valores `text-neutral-high` 16.29:1 (16.53:1) cumplen; la pestaña activa usa la clase `text-brand-primary`
 *   (color de fondo de marca), que en oscuro no llega a 4.5:1: da 2.66:1 sobre la superficie y la franja es
 *   `surface-low`, más clara.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: las pestañas Detalle / Historial son `button` sin acción, sin
 *   `role="tab"` ni `aria-selected`: la activa solo se distingue a la vista.
 */
@Component({
  selector: 'siaf-action-tracker',
  standalone: true,
  imports: [NgClass, TooltipDirective],
  template: `
    <section class="flex w-full flex-col items-start gap-siaf-md">
      @if (variant === 'detail' || showTabs) {
        <div class="w-full overflow-hidden rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)]">
          <div class="flex min-h-10 w-full items-start border-b-2 border-[var(--sys-color-divider-strong)]">
            <button
              class="flex min-h-10 items-center justify-center px-siaf-md py-siaf-xs text-sm"
              type="button"
              [ngClass]="tabClass('detail')"
            >
              Detalle
            </button>
            <button
              class="flex min-h-10 items-center justify-center px-siaf-md py-siaf-xs text-sm"
              type="button"
              [ngClass]="tabClass('history')"
            >
              Historial
            </button>
          </div>

          @if (activeTab === 'detail') {
            <div class="flex w-full flex-col gap-siaf-xxs rounded-b-siaf-md bg-surface px-siaf-xl py-siaf-md max-sm:px-siaf-md">
              <div class="flex min-h-[54px] w-full flex-col gap-siaf-xxs">
                <span class="sm:truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted" siafTooltip>
                  {{ detailLabel }}
                </span>
                <p class="m-0 text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)]">
                  {{ description }}
                </p>
              </div>
            </div>
          } @else {
            <div class="w-full rounded-b-siaf-md bg-surface">
              <div class="px-siaf-xl pt-siaf-md max-sm:px-siaf-md">
                <h3 class="m-0 text-base font-bold uppercase leading-none tracking-[0.02px] text-text">
                  Historial de comentarios y detalles
                </h3>
              </div>

              <div class="siaf-table-scroll w-full px-siaf-xl py-siaf-md max-sm:px-siaf-md">
                <table class="min-w-[1040px] border-collapse text-left text-sm text-[var(--sys-color-text-neutral-medium)]">
                  <thead>
                    <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                      <th class="w-[122px] rounded-l-siaf-sm border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Iteracion</th>
                      <th class="w-[120px] border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Proceso</th>
                      <th class="w-[198px] border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Comentario / motivo</th>
                      <th class="min-w-[200px] border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Descripcion</th>
                      <th class="w-[120px] border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Fecha</th>
                      <th class="w-[110px] border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Rol</th>
                      <th class="w-[140px] rounded-r-siaf-sm border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of historyRows; track row.iteration + row.process + row.date) {
                      <tr>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.iteration }}</td>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.process }}</td>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.reason }}</td>
                        <td class="border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.description }}</td>
                        <td class="whitespace-pre-line border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.date }}</td>
                        <td class="whitespace-pre-line border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.role }}</td>
                        <td class="whitespace-pre-line border-b border-border px-siaf-md py-siaf-sm align-top">{{ row.user }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      @if (showSummaryCards) {
        <div class="w-full rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
          <div class="flex w-full flex-wrap items-start gap-siaf-lg">
            @for (item of summaryItems; track item.label) {
              <div class="flex min-w-[164px] flex-1 flex-col gap-siaf-xs">
                <div class="flex flex-col gap-siaf-xxs">
                  <span class="sm:truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted" siafTooltip>
                    {{ item.label }}
                  </span>
                  @if (item.actionBy) {
                    <strong class="min-w-0 text-sm font-bold leading-normal tracking-[-0.02px] text-text">
                      {{ item.actionBy }}
                    </strong>
                  } @else {
                    <span class="min-w-0 text-sm leading-normal tracking-[0.025px] text-text">
                      No asignado aún
                    </span>
                  }
                </div>

                <div class="flex flex-col gap-siaf-xxs">
                  <span class="sm:truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted" siafTooltip>
                    FECHA
                  </span>
                  @if (item.date) {
                    <strong class="whitespace-pre-line text-sm font-bold leading-normal tracking-[-0.02px] text-text">
                      {{ item.date }}
                    </strong>
                  } @else {
                    <span class="min-w-0 text-sm leading-normal tracking-[0.025px] text-text">
                      Fecha y hora no registradas
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionTrackerComponent {
  @Input() variant: ActionTrackerVariant = 'default';
  @Input() activeTab: ActionTrackerTab = 'detail';
  @Input() detailType: ActionTrackerDetailType = 'default';
  @Input() description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  @Input() showTabs = false;
  @Input() showSummaryCards = true;
  @Input() summaryItems: ActionTrackerSummary[] = [];
  @Input() historyRows: ActionTrackerHistoryRow[] = [
    {
      iteration: '1',
      process: 'Aceptar Solicitud',
      reason: 'Comentario de Determinacion de la Aceptacion',
      description: '',
      date: '30/08/2023\n08:00:59',
      role: 'Aprobador\nDPSP - MEF',
      user: 'Ricardo John\nDoe Bustamante'
    },
    {
      iteration: '2',
      process: 'Validar Solicitud',
      reason: 'Comentario de Evaluacion',
      description: 'Se valido la informacion registrada.',
      date: '18/08/2023\n08:00:59',
      role: 'Evaluador DPT',
      user: 'Karim Lucano Lara'
    },
    {
      iteration: '1',
      process: 'Observar Solicitud',
      reason: 'Comentario de la Observacion',
      description: 'La informacion registrada se encuentra incompleta.',
      date: '14/08/2023\n08:00:59',
      role: 'Evaluador DPT',
      user: 'Karim Lucano Lara'
    }
  ];

  get detailLabel(): string {
    return DETAIL_LABELS[this.detailType];
  }

  tabClass(tab: ActionTrackerTab): string {
    return this.activeTab === tab
      ? 'border-b-2 border-brand-primary font-bold tracking-[-0.02px] text-brand-primary'
      : 'font-medium tracking-[0.025px] text-text-muted';
  }
}
