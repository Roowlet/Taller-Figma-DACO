import { ChangeDetectionStrategy, Component, DestroyRef, Input, inject, signal } from '@angular/core';

import { AlertComponent, AlertTone } from '../../../shared/ui/alert/alert.component';
import { BadgeColor, BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptySectionComponent } from '../../../shared/ui/empty-section/empty-section.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { FlowStatus, FlowStatusTagComponent } from '../../../shared/ui/flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';
import { LoaderOverlayComponent } from '../../../shared/ui/loader-overlay/loader-overlay.component';
import { LoadingProgressComponent } from '../../../shared/ui/loading-progress/loading-progress.component';
import { MessageBoxComponent } from '../../../shared/ui/message-box/message-box.component';
import { ProgressCircularComponent } from '../../../shared/ui/progress-circular/progress-circular.component';
import { RecordStatus, RecordStatusTagComponent } from '../../../shared/ui/record-status-tag/record-status-tag.component';
import { SnackbarComponent, SnackbarTone } from '../../../shared/ui/snackbar/snackbar.component';
import { StatusTagAppearance, StatusTagComponent, StatusTagSize, StatusTagTone } from '../../../shared/ui/status-tag/status-tag.component';
import { TagComponent, TagSize, TagVariant } from '../../../shared/ui/tag/tag.component';

/** Un estado del Figma que se fija con inputs; hover y foco se ven al pasar el puntero o llegar con Tab. */
interface EstadoTag {
  nombre: string;
  selected?: boolean;
  dragged?: boolean;
  disabled?: boolean;
}

const ESTADOS_TAG: EstadoTag[] = [
  { nombre: 'Sin elegir' },
  { nombre: 'Elegido', selected: true },
  { nombre: 'Arrastrado', dragged: true },
  { nombre: 'Arrastrado y elegido', selected: true, dragged: true },
  { nombre: 'Deshabilitado', disabled: true },
  { nombre: 'Deshabilitado y elegido', selected: true, disabled: true },
];

/** Ejemplos en vivo de la categoría Estado y feedback. */
@Component({
  selector: 'ui-kit-ejemplos-feedback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AlertComponent, BadgeComponent, IconComponent, ButtonComponent, EmptySectionComponent, EmptyStateComponent, FlowStatusTagComponent,
    LoaderComponent, LoaderOverlayComponent, LoadingProgressComponent, ProgressCircularComponent, MessageBoxComponent, RecordStatusTagComponent,
    SnackbarComponent, StatusTagComponent, TagComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-alert') {
        <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Estados (tone)</p>
        <div class="flex flex-col gap-3">
          @for (alerta of alertas; track alerta.tone) {
            <siaf-alert [tone]="alerta.tone" [title]="alerta.titulo" [description]="alerta.descripcion" />
          }
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Con acción de cerrar (showClose)</p>
        <div class="flex flex-col gap-3">
          @for (alerta of alertas; track alerta.tone) {
            <siaf-alert [tone]="alerta.tone" [title]="alerta.titulo" [description]="alerta.descripcion" [showClose]="true" (closed)="cierresAlerta.set(cierresAlerta() + 1)" />
          }
        </div>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">«Cerrar» pulsado {{ cierresAlerta() }} {{ cierresAlerta() === 1 ? 'vez' : 'veces' }}; quien retira el aviso es el padre.</p>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Sin título, sin ícono y texto largo</p>
        <div class="flex flex-col gap-3">
          <siaf-alert tone="info" description="Sin título: la descripción queda centrada con el ícono." />
          <siaf-alert tone="success" title="Sin ícono" description="Con leadingIcon en false el texto empieza en el borde del aviso." [leadingIcon]="false" />
          <siaf-alert tone="warning" description="Sin título ni ícono." [leadingIcon]="false" />
          <siaf-alert
            tone="error"
            title="No se pudo grabar la solicitud"
            description="El servidor rechazó el documento porque dos cuentas del asiento repiten el mismo código. Corrige las cuentas marcadas y vuelve a grabar; si el error continúa, comunícate con la mesa de ayuda."
            [showClose]="true"
          />
        </div>
      }
      @case ('message-box') {
        <message-box text="Este documento no admite cambios en su estado actual." />
      }
      @case ('siaf-badge') {
        <div class="grid gap-6 sm:grid-cols-2">
          @for (color of coloresBadge; track color) {
            <div>
              <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ color }}</p>
              <div class="flex items-center gap-6">
                <siaf-badge [color]="color" />
                <siaf-badge [color]="color" size="small" />
                <siaf-badge [color]="color" label="3" />
                <siaf-badge [color]="color" size="small" label="3" />
                <siaf-badge [color]="color" [label]="88" />
                <siaf-badge [color]="color" [label]="128" [max]="99" />
              </div>
            </div>
          }
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">En el borde final de un ícono</p>
        <div class="flex items-center gap-8 text-text">
          <span class="relative inline-flex">
            <siaf-icon name="notifications" [size]="24" />
            <siaf-badge class="absolute -right-1 -top-1" label="3" ariaLabel="3 notificaciones sin leer" />
          </span>
          <span class="relative inline-flex">
            <siaf-icon name="mail" [size]="24" />
            <siaf-badge class="absolute -right-0.5 -top-0.5" size="small" color="primary" ariaLabel="Mensajes nuevos" />
          </span>
        </div>
      }
      @case ('siaf-tag') {
        <!-- Figma «Input», «Choice», «Filter» y «Action tags»: los estados de cada familia, en standard y small. -->
        <div class="flex flex-col gap-3">
          @for (variante of variantesTag; track variante.valor) {
            <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ variante.titulo }}</p>
            @for (tamano of tamanosTag; track tamano.valor) {
              <div class="flex items-start gap-2" [attr.data-ejemplo-variante]="variante.valor" [attr.data-ejemplo-tamano]="tamano.valor">
                <span class="w-28 shrink-0 text-xs text-text-muted" [class]="tamano.valor === 'small' ? 'pt-1' : 'pt-2'">{{ tamano.titulo }}</span>
                <div class="flex min-w-0 flex-wrap items-center gap-2">
                  @for (estado of variante.estados; track estado.nombre) {
                    <siaf-tag
                      [variant]="variante.valor"
                      [size]="tamano.valor"
                      [icon]="variante.icono"
                      [removable]="variante.quitable"
                      [removeLabel]="'Quitar ' + estado.nombre"
                      [selected]="!!estado.selected"
                      [dragged]="!!estado.dragged"
                      [disabled]="!!estado.disabled"
                    >{{ estado.nombre }}</siaf-tag>
                  }
                </div>
              </div>
            }
          }
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Interactivo · hover y foco</p>
        <div class="flex flex-wrap items-center gap-2">
          @for (opcion of opcionesTag; track opcion) {
            <siaf-tag variant="choice" icon="account_circle" [selected]="elegidasTag().includes(opcion)" (selectedChange)="elegirTag(opcion, $event)">{{ opcion }}</siaf-tag>
          }
          <siaf-tag [selected]="true" [removable]="true" removeLabel="Quitar Valor" (removed)="quitadosTag.set(quitadosTag() + 1)">Valor</siaf-tag>
          <siaf-tag variant="action" icon="check" (clicked)="accionesTag.set(accionesTag() + 1)">Acción</siaf-tag>
        </div>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">
          × pulsada {{ quitadosTag() }} {{ quitadosTag() === 1 ? 'vez' : 'veces' }} (quien quita el tag es el padre) y «Acción», {{ accionesTag() }}
          {{ accionesTag() === 1 ? 'vez' : 'veces' }}.
        </p>
      }
      @case ('siaf-status-tag') {
        <!-- Figma «Semántica» (19358:721): los cinco tonos en los tres estilos, cada uno en standard y small. -->
        <div class="flex flex-col gap-3">
          @for (apariencia of aparienciasEstado; track apariencia.valor) {
            <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ apariencia.titulo }}</p>
            @for (tamano of tamanosEstado; track tamano.valor) {
              <div class="flex flex-wrap items-center gap-2" [attr.data-ejemplo-tamano]="tamano.valor">
                <span class="w-28 shrink-0 text-xs text-text-muted">{{ tamano.titulo }}</span>
                @for (tono of tonosEstado; track tono.valor) {
                  <siaf-status-tag
                    [tone]="tono.valor"
                    [appearance]="apariencia.valor"
                    [size]="tamano.valor"
                    [icon]="apariencia.valor === 'outline' ? tono.icono : ''"
                  >{{ tono.nombre }}</siaf-status-tag>
                }
              </div>
            }
          }
        </div>
      }
      @case ('siaf-flow-status-tag') {
        <div class="flex flex-wrap items-center gap-2">
          @for (estado of estadosFlujo; track estado) {
            <siaf-flow-status-tag [status]="estado" />
          }
          <siaf-flow-status-tag status="Aprobado" size="standard" />
        </div>
      }
      @case ('siaf-record-status-tag') {
        <div class="flex flex-wrap items-center gap-2">
          @for (estado of estadosRegistro; track estado) {
            <siaf-record-status-tag [status]="estado" />
          }
          <siaf-record-status-tag status="Eliminado" size="standard" />
        </div>
      }
      @case ('siaf-snackbar') {
        <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Tipos (tone)</p>
        <div class="flex flex-col gap-3">
          @for (tipo of tiposSnackbar; track tipo.tone) {
            <siaf-snackbar [tone]="tipo.tone" [message]="tipo.mensaje" />
          }
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Con acción, sin cerrar y textos predefinidos</p>
        <div class="flex flex-col gap-3">
          <siaf-snackbar tone="neutral" message="Se eliminó el registro 1101.01." actionLabel="Deshacer" (action)="accionesSnackbar.set(accionesSnackbar() + 1)" />
          <siaf-snackbar variant="changes-saved" [dismissible]="false" />
          <siaf-snackbar variant="creation-verified" requestType="Solicitud de cuenta contable" requestNumber="0001" [dismissible]="false" />
        </div>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">«Deshacer» pulsado {{ accionesSnackbar() }} {{ accionesSnackbar() === 1 ? 'vez' : 'veces' }}.</p>
      }
      @case ('siaf-loader') {
        <div class="flex items-center gap-8">
          <siaf-loader tone="brand" label="Cargando" />
          <siaf-loader tone="brand" [size]="48" label="Cargando" />
        </div>
      }
      @case ('siaf-loader-overlay') {
        <siaf-button variant="secondary" (click)="mostrarCapa()">Mostrar capa de carga</siaf-button>
        <siaf-loader-overlay [open]="capaAbierta()" label="Grabando" message="Grabando la solicitud…" />
      }
      @case ('siaf-loading-progress') {
        <div class="flex flex-wrap items-center gap-8">
          <siaf-loading-progress variant="spinner" [size]="32" />
          <div class="w-48"><siaf-loading-progress variant="bar" [value]="60" /></div>
        </div>
      }
      @case ('siaf-progress-circular') {
        <div class="flex flex-wrap items-center gap-8">
          <siaf-progress-circular label="Label" [value]="0" />
          <siaf-progress-circular label="Label" [value]="50" />
          <siaf-progress-circular label="Label" [value]="100" />
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Interactivo · etiqueta larga y tamaños</p>
        <div class="flex flex-wrap items-center gap-8">
          <siaf-progress-circular label="Procedimientos completados" [value]="avanceCircular()" />
          <siaf-progress-circular [value]="avanceCircular()" [size]="96" />
          <div class="flex flex-col gap-2">
            <siaf-button size="sm" variant="secondary" [disabled]="avanceCircular() >= 100" (click)="avanceCircular.set(avanceCircular() + 10)">Avanzar 10 %</siaf-button>
            <siaf-button size="sm" variant="secondary" [disabled]="avanceCircular() <= 0" (click)="avanceCircular.set(avanceCircular() - 10)">Retroceder 10 %</siaf-button>
          </div>
        </div>
      }
      @case ('empty-section') {
        <empty-section title="Cuenta contable" />
      }
      @case ('siaf-empty-state') {
        <siaf-empty-state illustration="no-results" title="Sin resultados" description="Ajusta los filtros para ver documentos." />
      }
    }
  `,
})
export class EjemplosFeedbackComponent {
  static readonly selectores = [
    'siaf-alert', 'message-box', 'siaf-badge', 'siaf-tag', 'siaf-status-tag', 'siaf-flow-status-tag', 'siaf-record-status-tag', 'siaf-snackbar',
    'siaf-loader', 'siaf-loader-overlay', 'siaf-loading-progress', 'siaf-progress-circular', 'empty-section', 'siaf-empty-state',
  ];
  @Input({ required: true }) selector!: string;

  private readonly destroyRef = inject(DestroyRef);

  /** Los cinco estados del Figma «Alerts», en su orden. */
  readonly alertas: { tone: AlertTone; titulo: string; descripcion: string }[] = [
    { tone: 'neutral', titulo: 'Sin cambios pendientes', descripcion: 'El documento no tiene modificaciones por grabar.' },
    { tone: 'success', titulo: 'Validación exitosa', descripcion: 'El código 1101.01 está disponible en el plan de cuentas.' },
    { tone: 'info', titulo: 'Informativo', descripcion: 'El documento quedó en estado Elaborado.' },
    { tone: 'warning', titulo: 'No se puede modificar la vigencia', descripcion: 'La cuenta tiene movimientos en el periodo.' },
    { tone: 'error', titulo: 'No se pudo cargar el documento', descripcion: 'Vuelve a intentarlo en unos minutos.' },
  ];
  readonly cierresAlerta = signal(0);
  /** Uno por tono del Figma «flow tags»: gris, azul, verde, amarillo y rojo. */
  readonly estadosFlujo: FlowStatus[] = ['Elaborado', 'Verificado', 'Aprobado', 'Observado', 'Rechazado'];
  /** Abierto y Cerrado («Period tags»), En Proceso y Validado («status items tags») y tres de los que no están en el Figma. */
  readonly estadosRegistro: RecordStatus[] = ['Abierto', 'Cerrado', 'En Proceso', 'Validado', 'Activo', 'Inactivo', 'Anulado'];
  /** Con el nombre del color, como la sección «Semántica» del Figma: cada pantalla pone el texto de su estado. */
  readonly tonosEstado: { valor: StatusTagTone; nombre: string; icono: string }[] = [
    { valor: 'default', nombre: 'Gris', icono: 'pending' },
    { valor: 'info', nombre: 'Azul', icono: 'send' },
    { valor: 'success', nombre: 'Verde', icono: 'check_circle' },
    { valor: 'warning', nombre: 'Amarillo', icono: 'warning' },
    { valor: 'danger', nombre: 'Rojo', icono: 'fact_check' },
  ];
  readonly tamanosEstado: { valor: StatusTagSize; titulo: string }[] = [
    { valor: 'standard', titulo: 'standard · 32 px' },
    { valor: 'small', titulo: 'small · 24 px' },
  ];
  /** Las cuatro familias del Figma con sus estados: Choice no tiene arrastre y Action no se elige. */
  readonly variantesTag: { valor: TagVariant; titulo: string; icono: string; quitable: boolean; estados: EstadoTag[] }[] = [
    { valor: 'input', titulo: 'input · Input tags', icono: '', quitable: true, estados: ESTADOS_TAG },
    { valor: 'choice', titulo: 'choice · Choice tags', icono: 'account_circle', quitable: false, estados: ESTADOS_TAG.filter((e) => !e.dragged) },
    { valor: 'filter', titulo: 'filter · Filter tags', icono: '', quitable: false, estados: ESTADOS_TAG },
    { valor: 'action', titulo: 'action · Action tags', icono: 'check', quitable: false, estados: [{ nombre: 'Habilitado' }, { nombre: 'Deshabilitado', disabled: true }] },
  ];
  readonly tamanosTag: { valor: TagSize; titulo: string }[] = [
    { valor: 'standard', titulo: 'standard · 32 px' },
    { valor: 'small', titulo: 'small · 24 px' },
  ];
  readonly opcionesTag = ['Opción 1', 'Opción 2', 'Opción 3'];
  readonly elegidasTag = signal<string[]>(['Opción 1']);
  readonly quitadosTag = signal(0);
  readonly accionesTag = signal(0);
  readonly aparienciasEstado: { valor: StatusTagAppearance; titulo: string }[] = [
    { valor: 'solid', titulo: 'solid · flow tags' },
    { valor: 'soft', titulo: 'soft · period, expediente y conciliación' },
    { valor: 'outline', titulo: 'outline con ícono · status items' },
  ];
  readonly capaAbierta = signal(false);
  readonly avanceCircular = signal(80);
  readonly coloresBadge: BadgeColor[] = ['accent', 'primary'];
  readonly accionesSnackbar = signal(0);
  readonly tiposSnackbar: { tone: SnackbarTone; mensaje: string }[] = [
    { tone: 'neutral', mensaje: 'Alert danger information' },
    { tone: 'info', mensaje: 'Alert danger information' },
    { tone: 'success', mensaje: 'Alert danger information' },
    { tone: 'warning', mensaje: 'Alert danger information' },
    { tone: 'error', mensaje: 'Alert danger information' },
  ];

  elegirTag(opcion: string, elegida: boolean): void {
    this.elegidasTag.update((actuales) => (elegida ? [...actuales, opcion] : actuales.filter((o) => o !== opcion)));
  }

  /** La capa bloquea la pantalla: se cierra sola a los dos segundos. */
  mostrarCapa(): void {
    this.capaAbierta.set(true);
    const t = setTimeout(() => this.capaAbierta.set(false), 2000);
    this.destroyRef.onDestroy(() => clearTimeout(t));
  }
}
