import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { SidePanelAnimacion } from '../side-panel-animacion';
import { TextFieldComponent, TextFieldOption } from '../text-field/text-field.component';
import { UploaderComponent } from '../uploader/uploader.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { FocoDirective } from '../foco/foco.directive';

export type UploadSideNavVariant = 'default' | 'bulk-chart-accounts';

/**
 * Panel lateral animado de carga de archivos: envuelve `siaf-uploader` y confirma con Aceptar/Cancelar.
 *
 * Es la puerta de entrada normal a la carga en las request-pages (adjuntar el sustento .pdf); la
 * variante `bulk-chart-accounts` agrega los selects y el enlace de plantilla de la carga masiva.
 *
 * «Aceptar» confirma el archivo que terminó de cargar y sigue en su tarjeta: si se quita con su × o el panel se vuelve
 * a abrir (el uploader aparece vacío), queda deshabilitado hasta cargar otro.
 *
 * @usar
 * - Para adjuntar el documento de sustento (.pdf) desde la request-page: plan de cuentas, asiento de ajuste, catálogo de
 *   ajuste (tipo y clase), catálogo de eventos, eventos contables y apertura contable.
 * - Con `variant="bulk-chart-accounts"` en la carga masiva del plan de cuentas: tipo de plan, plan a reemplazar y
 *   enlace a la plantilla Excel (`templateHref`).
 * - Con `accept`, `acceptedLabel`, `title` y `description` propios para subir un Excel, como el archivo de eventos de
 *   la carga masiva (SCM).
 * - `confirmed` para adjuntar el archivo a la solicitud: `fileSelected` avisa apenas termina de cargar, antes de que
 *   el usuario acepte, y el archivo todavía se puede quitar o cancelar.
 * @evitar
 * - Para una carga embebida en la página, sin panel: usar `siaf-uploader` directo.
 * - Para mostrar un archivo ya adjunto: usar `siaf-uploaded-file-card`.
 * - Para elegir registros de un catálogo: usar `siaf-selection-side-nav`.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre, en carga masiva, los dos selects y el enlace de plantilla, el
 *   «elige archivo» de `siaf-uploader` y Cancelar / Aceptar, y da la vuelta sin salir del panel. Los selects siguen
 *   `siaf-input`.
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón que lo abrió; con la lista de un select
 *   abierta, Escape cierra solo la lista.
 * - **Enter / Espacio** en «elige archivo»: abre el selector de archivos del sistema (input de archivo nativo);
 *   arrastrar y soltar es solo con mouse.
 * - **Enter** en el enlace de plantilla: la descarga.
 * - **Enter / Espacio**: activan la X y Cancelar (emiten `closed`) y Aceptar (emite `confirmed` con el archivo;
 *   habilitado cuando hay un archivo cargado en su tarjeta y, en carga masiva, los selects obligatorios tienen valor).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"` y `aria-labelledby` al título; la X
 *   se llama «Cerrar».
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al botón que lo
 *   abrió; Tab no sale a la página de atrás.
 * - **2.1.1 Teclado (A)**: Escape cierra el panel como la X; arrastrar y soltar tiene alternativa: el input de archivo.
 * - **2.4.7 Foco visible (AA)**: «elige archivo» de `siaf-uploader` (variante `extended`, la de este panel) y el enlace
 *   de plantilla muestran un contorno azul de 2 px (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro) con el foco;
 *   la X y Cancelar quedan con el anillo nativo.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: el enlace «descárgalo aquí» y el «elige archivo» del uploader usan la
 *   clase `text-brand-primary`, que toma el fondo de marca: 8.79:1 en claro, pero 2.66:1 sobre la superficie en oscuro
 *   (el token de texto `--sys-color-text-brand-primary` da 10.15:1).
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: el avance («Subiendo...») y el rechazo del archivo en
 *   `siaf-uploader` no se anuncian (sin `role="status"` ni `aria-live`).
 * - **3.3.2 Etiquetas o instrucciones (A)**: en carga masiva los selects de `siaf-input` tienen etiqueta y marcan el
 *   obligatorio; el tipo admitido y el tamaño máximo se dicen en texto (`acceptedLabel`, `hint`).
 * - **2.5.8 Tamaño del objetivo (AA)**: la X y Cancelar miden 40 px.
 */
@Component({
  selector: 'siaf-upload-side-nav',
  standalone: true,
  imports: [FocoDirective, ButtonComponent, IconComponent, TextFieldComponent, UploaderComponent, TooltipDirective],
  template: `
    @if (anim.visible()) {
      <section class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" [class.cerrando]="anim.cerrando()" aria-modal="true" role="dialog" aria-labelledby="upload-side-nav-title" (click)="closePanel()">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden rounded-siaf-md bg-surface shadow-siaf-lg" [siafFoco]="open" (siafFocoEscape)="closePanel()" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 id="upload-side-nav-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">{{ title }}</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar" (click)="closePanel()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg-surface px-siaf-xl py-siaf-md">
            <div class="flex flex-col gap-siaf-lg">
              @if (variant === 'bulk-chart-accounts') {
                <section class="flex flex-col gap-siaf-md">
                  <h3 class="m-0 min-h-10 text-sm font-bold uppercase leading-10 text-text">Dato general de aplicacion</h3>
                  <div class="flex flex-col gap-2.5">
                    <siaf-input
                      label="Tipo de plan contable"
                      type="select"
                      [required]="true"
                      [options]="planTypeOptions"
                      [value]="planTypeValue"
                      (valueChange)="onPlanTypeChanged($event)"
                    />
                    <siaf-input
                      label="Plan contable actual por reemplazar"
                      type="select"
                      [required]="replacementPlanRequired"
                      [options]="replacementPlanOptions"
                      [value]="replacementPlanValue"
                      [disabled]="!replacementPlanRequired"
                      (valueChange)="onReplacementPlanChanged($event)"
                    />
                  </div>
                </section>
              }

              @if (variant === 'bulk-chart-accounts' && templateHref) {
                <p class="m-0 text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">
                  Sube un archivo Excel en el formato correcto.<br />
                  Si no lo tienes,
                  <a
                    class="font-bold text-brand-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                    [href]="templateHref"
                    [attr.download]="templateDownloadName || null"
                  >
                    descárgalo aquí.
                  </a>
                </p>
              } @else {
                <p class="m-0 text-sm leading-normal text-text">{{ description }}</p>
              }

              <siaf-uploader
                [accept]="accept"
                [hint]="hint"
                [maxSizeMb]="maxSizeMb"
                (fileSelected)="onFileSelected($event)"
                (fileRemoved)="onFileRemoved($event)"
              />

              <p class="m-0 truncate text-sm text-text" siafTooltip>{{ acceptedLabel }}</p>
            </div>
          </div>

          <div class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
            <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" (click)="closePanel()">
              Cancelar
            </button>
            <siaf-button variant="primary" size="md" [disabled]="confirmDisabled" (click)="confirmUpload()">
              Aceptar
            </siaf-button>
          </div>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadSideNavComponent implements OnChanges {
  /** Render animado del panel (entrada/salida por la derecha, 300ms). */
  readonly anim = new SidePanelAnimacion();

  ngOnChanges(changes: SimpleChanges): void {
    if (!('open' in changes)) return;
    this.anim.actualizar(this.open);
    // Al abrir, el uploader se crea vacío: «Aceptar» no puede seguir con el archivo de la vez anterior.
    if (this.open) this.archivos.set([]);
  }

  @Input() open = false;
  @Input() variant: UploadSideNavVariant = 'default';
  @Input() title = 'Cargar Documento de Sustento';
  @Input() description = 'Sube un archivo .PDF en el formato correcto.';
  @Input() accept = '.pdf';
  @Input() acceptedLabel = 'Solo admite archivos .pdf';
  @Input() hint = 'Se permiten archivos de 10 MB como máximo';
  @Input() maxSizeMb = 10;
  @Input() templateHref = '';
  @Input() templateDownloadName = '';
  @Input() planTypeOptions: TextFieldOption[] = [];
  @Input() replacementPlanOptions: TextFieldOption[] = [];
  @Input() planTypeValue = '';
  @Input() replacementPlanValue = '';
  @Input() replacementPlanRequired = false;

  @Output() closed = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() confirmed = new EventEmitter<File>();
  @Output() planTypeValueChange = new EventEmitter<string>();
  @Output() replacementPlanValueChange = new EventEmitter<string>();

  /** Archivos que terminaron de cargar y siguen en su tarjeta, en el orden en que terminaron. */
  private readonly archivos = signal<File[]>([]);
  /** El que confirma «Aceptar»: el primero que terminó de cargar y no se quitó. */
  readonly selectedFile = computed(() => this.archivos()[0] ?? null);

  get confirmDisabled(): boolean {
    if (!this.selectedFile()) {
      return true;
    }

    if (this.variant !== 'bulk-chart-accounts') {
      return false;
    }

    if (!this.planTypeValue) {
      return true;
    }

    return this.replacementPlanRequired && !this.replacementPlanValue;
  }

  closePanel(): void {
    this.closed.emit();
  }

  onFileSelected(file: File): void {
    this.archivos.update((lista) => (lista.includes(file) ? lista : [...lista, file]));
    this.fileSelected.emit(file);
  }

  /** Quitado con la × de su tarjeta: deja de contar para «Aceptar». */
  onFileRemoved(file: File): void {
    this.archivos.update((lista) => lista.filter((archivo) => archivo !== file));
  }

  onPlanTypeChanged(value: string | number | string[]): void {
    this.planTypeValueChange.emit(this.textValue(value));
  }

  onReplacementPlanChanged(value: string | number | string[]): void {
    this.replacementPlanValueChange.emit(this.textValue(value));
  }

  confirmUpload(): void {
    const archivo = this.selectedFile();
    if (this.confirmDisabled || !archivo) {
      return;
    }

    this.confirmed.emit(archivo);
  }

  private textValue(value: string | number | string[]): string {
    return Array.isArray(value) ? value[0] ?? '' : String(value ?? '');
  }
}
