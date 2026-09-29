import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { SolicitudeFormCardComponent } from '../../../shared/components/solicitude-form-card/solicitude-form-card.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { AccordionComponent, AccordionItem } from '../../../shared/ui/accordion/accordion.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { CollapsibleCardComponent } from '../../../shared/ui/collapsible-card/collapsible-card.component';
import { DeskCardComponent, DeskCardTone } from '../../../shared/ui/desk-card/desk-card.component';
import { DocumentSummaryCardComponent } from '../../../shared/ui/document-summary-card/document-summary-card.component';
import { ExpansionPanelComponent } from '../../../shared/ui/expansion-panel/expansion-panel.component';
import { IconDropdownMenuItem } from '../../../shared/ui/icon-dropdown-menu/icon-dropdown-menu.component';
import { PopoverAction, PopoverComponent } from '../../../shared/ui/popover/popover.component';
import { ReportSummaryCardComponent } from '../../../shared/ui/report-summary-card/report-summary-card.component';
import { StepperCardComponent, StepperCardField } from '../../../shared/ui/stepper-card/stepper-card.component';
import { SummaryCardComponent, SummaryCardField } from '../../../shared/ui/summary-card/summary-card.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';
import { DATOS_RESUMEN_DE_MUESTRA } from './reporte-de-muestra';

/** Ejemplos en vivo de la categoría Superficies: todas las tarjetas y contenedores. */
@Component({
  selector: 'ui-kit-ejemplos-superficies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccordionComponent, CollapsibleCardComponent, DeskCardComponent, ExpansionPanelComponent, ButtonComponent, CardComponent, DocumentSummaryCardComponent, PopoverComponent,
    ReportSummaryCardComponent, SolicitudeFormCardComponent,
    SolicitudeInfoCardComponent, StepperCardComponent, SummaryCardComponent, TextFieldComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-card') {
        <siaf-card title="Comisión de inventario" description="Órgano que conduce la toma de inventario">
          <p class="text-sm text-text-muted">El contenido de la tarjeta va proyectado.</p>
        </siaf-card>
      }
      @case ('siaf-solicitude-form-card') {
        <siaf-solicitude-form-card title="Datos generales">
          <div class="grid gap-4 sm:grid-cols-2">
            <siaf-input label="Entidad" value="Ministerio de Economía y Finanzas" />
            <siaf-input label="Año fiscal" value="2026" />
          </div>
        </siaf-solicitude-form-card>
      }
      @case ('siaf-solicitude-info-card') {
        <siaf-solicitude-info-card [fields]="datos" />
      }
      @case ('siaf-summary-card') {
        <siaf-summary-card [fields]="resumen" [showIndicator]="true" [bordered]="true" [showClose]="true" />
      }
      @case ('siaf-report-summary-card') {
        <siaf-report-summary-card
          label="Entidad"
          icon="account_balance_wallet"
          title="MINCETUR"
          description="Ministerio de Comercio Exterior y Turismo · Pliego 035"
          [fields]="datosResumenReporte"
        />
      }
      @case ('siaf-document-summary-card') {
        <siaf-document-summary-card documentNumber="PAA-SRAA-00012-2026-MEF-DGCP" contableNumber="AA-001-2026-12" status="Aprobado" />
      }
      @case ('siaf-stepper-card') {
        <div class="grid gap-4 sm:grid-cols-2">
          <siaf-stepper-card [fields]="camposPaso" [selected]="pasoElegido() === 1" (selectedChange)="pasoElegido.set(1)" />
          <siaf-stepper-card [fields]="camposPaso" [selected]="pasoElegido() === 2" (selectedChange)="pasoElegido.set(2)" />
        </div>
      }
      @case ('siaf-desk-card') {
        <!-- Sobre el fondo del Panel: las tarjetas son de color superficie y en la ficha no se distinguirían. -->
        <div class="flex flex-col gap-siaf-md rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">
          <siaf-desk-card variant="featured" title="Bandeja de Documentos" icon="inbox" tone="accent" [value]="12" />
          <siaf-desk-card
            variant="featured"
            title="Procesos"
            icon="picture_in_picture"
            tone="primary"
            [interactive]="true"
            (activated)="procesosPulsada.set(procesosPulsada() + 1)"
          />
          <div class="grid gap-siaf-md xl:grid-cols-2">
            @for (contador of contadoresPanel; track contador.title) {
              <siaf-desk-card variant="counter" [title]="contador.title" [icon]="contador.icon" [tone]="contador.tone" [value]="contador.value" />
            }
          </div>
          <siaf-desk-card variant="shortcut" title="Consulta y Reportes" icon="content_paste_search" tone="success" />
          <siaf-desk-card variant="shortcut" title="Crear documento" icon="add" tone="accent" />
        </div>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">
          Solo «Procesos» es interactiva, como en el Panel.@if (procesosPulsada()) { Emitió «activated» {{ procesosPulsada() }} {{ procesosPulsada() === 1 ? 'vez' : 'veces' }}. }
        </p>
      }
      @case ('siaf-accordion') {
        <siaf-accordion [items]="preguntas" openId="p1" />
      }
      @case ('siaf-expansion-panel') {
        <div class="flex max-w-[376px] flex-col gap-siaf-lg">
          @for (panel of panelesExpansion(); track panel.id) {
            <siaf-expansion-panel
              [title]="panel.titulo"
              [expanded]="panel.abierto"
              [actions]="accionesPanel"
              (action)="$event === 'eliminar' && quitarPanel(panel.id)"
            >
              {{ panel.cuerpo }}
            </siaf-expansion-panel>
          } @empty {
            <siaf-button variant="secondary" size="sm" (click)="reiniciarPaneles()">Restaurar paneles</siaf-button>
          }
        </div>
        <p class="mt-2 text-xs text-text-muted">El menú ⋮ tiene «Eliminar», que quita el panel del ejemplo.</p>
      }
      @case ('siaf-collapsible-card') {
        <div class="flex flex-col gap-siaf-md">
          @for (tarjeta of tarjetasColapsables(); track tarjeta.id) {
            <siaf-collapsible-card [expanded]="tarjeta.abierta" (closed)="quitarTarjeta(tarjeta.id)">
              <div card-info class="flex flex-col gap-0.5 leading-[normal]">
                <span class="text-sm font-bold text-[var(--sys-color-text-neutral-high)]">{{ tarjeta.titulo }}</span>
                <span class="text-xs text-[var(--sys-color-text-neutral-low)]">{{ tarjeta.subtitulo }}</span>
              </div>
              <dl class="m-0 grid gap-siaf-md p-siaf-lg sm:grid-cols-3">
                @for (campo of tarjeta.campos; track campo.label) {
                  <div class="flex flex-col gap-siaf-xxs">
                    <dt class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ campo.label }}</dt>
                    <dd class="m-0 text-sm text-text">{{ campo.value }}</dd>
                  </div>
                }
              </dl>
            </siaf-collapsible-card>
          } @empty {
            <siaf-button variant="secondary" size="sm" (click)="reiniciarTarjetas()">Restaurar tarjetas</siaf-button>
          }
        </div>
        <p class="mt-2 text-xs text-text-muted">La X quita la tarjeta del ejemplo: en la app, el padre decide qué hacer con «closed».</p>
      }
      @case ('siaf-popover') {
        <div class="flex flex-wrap gap-x-6 gap-y-2">
          @for (tipo of tiposPopover; track tipo.id) {
            <div class="min-h-[230px] w-[268px] max-w-full">
              <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ tipo.nombre }}</p>
              <siaf-popover
                align="start"
                [open]="popoversAbiertos().has(tipo.id)"
                [title]="tipo.titulo"
                text="Lorem ipsum dolor sit amet consectetur. Nulla lectus suspendisse ullamcorper netus amet sociis amet."
                [actions]="tipo.acciones"
                ariaLabel="Detalle"
                (closed)="alternarPopover(tipo.id, false)"
                (action)="accionPopover.set($event); alternarPopover(tipo.id, false)"
              >
                <siaf-button popover-trigger variant="secondary" size="sm" (click)="alternarPopover(tipo.id, !popoversAbiertos().has(tipo.id))">
                  {{ popoversAbiertos().has(tipo.id) ? 'Cerrar' : 'Abrir' }}
                </siaf-button>
              </siaf-popover>
            </div>
          }
        </div>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">
          Se cierra con Escape o pulsando fuera.@if (accionPopover()) { Última acción: «{{ accionPopover() }}». }
        </p>
      }
    }
  `,
})
export class EjemplosSuperficiesComponent {
  static readonly selectores = [
    'siaf-card', 'siaf-solicitude-form-card', 'siaf-solicitude-info-card', 'siaf-summary-card', 'siaf-report-summary-card',
    'siaf-document-summary-card', 'siaf-stepper-card', 'siaf-desk-card', 'siaf-accordion', 'siaf-expansion-panel', 'siaf-collapsible-card', 'siaf-popover',
  ];
  @Input({ required: true }) selector!: string;

  readonly datos: SolicitudeInfoField[] = [
    { label: 'Número', value: 'PCC-SCC-00001-2026-MEF-DGCP' },
    { label: 'Entidad', value: 'Ministerio de Economía y Finanzas' },
    { label: 'Año fiscal', value: '2026' },
  ];

  readonly datosResumenReporte = DATOS_RESUMEN_DE_MUESTRA;

  readonly resumen: SummaryCardField[] = [
    { label: 'Código', value: '1101.01' },
    { label: 'Denominación', value: 'Caja M/N' },
    { label: 'Nivel', value: 5 },
  ];

  readonly camposPaso: StepperCardField[] = [
    { label: 'Etapa', value: 'Devengado', weight: 'bold' },
    { label: 'Responsable', value: 'Juan Carlos Pérez' },
  ];
  readonly pasoElegido = signal(1);

  readonly contadoresPanel: { title: string; icon: string; tone: DeskCardTone; value: number }[] = [
    { title: 'Recibidos', icon: 'description', tone: 'success', value: 3 },
    { title: 'Enviados', icon: 'send', tone: 'accent', value: 7 },
    { title: 'Borradores', icon: 'edit_note', tone: 'warning', value: 2 },
    { title: 'Notificaciones', icon: 'notifications', tone: 'neutral', value: 0 },
  ];
  readonly procesosPulsada = signal(0);

  readonly preguntas: AccordionItem[] = [
    { id: 'p1', title: '¿Qué es un evento contable?', content: 'La configuración de asientos que el motor aplica a un evento del catálogo.' },
    { id: 'p2', title: '¿Quién lo aprueba?', content: 'El aprobador de la DGCP, tras la verificación del creador.' },
  ];

  /** Los tres tipos empiezan abiertos para compararlos; pulsar fuera los cierra, como en la app. */
  readonly popoversAbiertos = signal(new Set(['full', 'titulo', 'acciones']));
  readonly accionPopover = signal('');

  readonly accionesPanel: IconDropdownMenuItem[] = [{ label: 'Eliminar', value: 'eliminar', icon: 'delete' }];
  private readonly panelesIniciales = [
    { id: 'p1', titulo: 'head panel', cuerpo: 'body panel', abierto: false },
    { id: 'p2', titulo: 'head panel', cuerpo: 'body panel', abierto: true },
  ];
  readonly panelesExpansion = signal(this.panelesIniciales);
  quitarPanel(id: string): void {
    this.panelesExpansion.update((lista) => lista.filter((p) => p.id !== id));
  }
  reiniciarPaneles(): void {
    this.panelesExpansion.set(this.panelesIniciales);
  }

  private readonly tarjetasIniciales = [
    {
      id: 't1', titulo: 'PAA-SRAA-00012-2026-MEF-DGCP', subtitulo: 'Registro de asiento de ajuste · Elaborado', abierta: false,
      campos: [{ label: 'Entidad', value: '0001 - MEF' }, { label: 'Fecha', value: '15/01/2026' }, { label: 'Monto', value: 'S/ 12,500.00' }],
    },
    {
      id: 't2', titulo: 'PCC-SCC-00031-2026-MEF-DGCP', subtitulo: 'Solicitud de cuenta contable · Verificado', abierta: true,
      campos: [{ label: 'Cuenta', value: '1101.01 - Caja M/N' }, { label: 'Naturaleza', value: 'Deudora' }, { label: 'Vigencia', value: '01/01/2026' }],
    },
  ];
  readonly tarjetasColapsables = signal(this.tarjetasIniciales);
  quitarTarjeta(id: string): void {
    this.tarjetasColapsables.update((lista) => lista.filter((t) => t.id !== id));
  }
  reiniciarTarjetas(): void {
    this.tarjetasColapsables.set(this.tarjetasIniciales);
  }

  alternarPopover(id: string, abrir: boolean): void {
    this.popoversAbiertos.update((abiertos) => {
      const siguiente = new Set(abiertos);
      if (abrir) siguiente.add(id);
      else siguiente.delete(id);
      return siguiente;
    });
  }
  readonly tiposPopover: { id: string; nombre: string; titulo: string; acciones: PopoverAction[] }[] = [
    { id: 'full', nombre: 'Full', titulo: 'TooltipyTex', acciones: [{ label: 'Button' }, { label: 'Button', value: 'Button 2' }] },
    { id: 'titulo', nombre: 'Title + Content', titulo: 'TooltipyTex', acciones: [] },
    { id: 'acciones', nombre: 'Content + Actions', titulo: '', acciones: [{ label: 'Button' }, { label: 'Button', value: 'Button 2' }] },
  ];
}
