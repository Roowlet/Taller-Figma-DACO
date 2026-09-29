import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { FocoDirective } from '../foco/foco.directive';
import { IconComponent } from '../icon/icon.component';
import { SidePanelAnimacion } from '../side-panel-animacion';
import { TextAreaControlComponent } from '../text-area-control/text-area-control.component';
import { UploaderComponent } from '../uploader/uploader.component';

/** Lo que entrega «Aceptar»: el detalle escrito (sin espacios de los extremos) y el sustento cargado. */
export interface AnnulmentRequest {
  detail: string;
  file: File;
}

let siguienteId = 0;

/**
 * Modal de confirmación de una solicitud de anulación: detalle obligatorio y sustento .pdf antes de un paso que no se
 * puede revertir. El detalle es `text-area-control` (obligatorio, hasta 1000 caracteres) y el sustento, `siaf-uploader`
 * compacto; «Aceptar» se habilita con los dos y emite `accepted` con el detalle y el archivo. Cada vez que se abre
 * empieza vacío.
 *
 * Hoy tiene 0 consumidores y se conserva a propósito: queda reservado para el flujo de anulación de
 * RAA que los MFD contemplan (`tipoAccion: 'anulacion'` ya existe en el catálogo) y que aún no se
 * construye. No borrarlo ni reutilizarlo como modal genérico.
 *
 * @usar
 * - Reservado para la solicitud de anulación de un registro de asiento de ajuste (RAA) aprobado, cuando se construya
 *   ese flujo: pide el detalle de anulación y el sustento antes de un paso que no se puede revertir.
 * - `accepted` trae `{ detail, file }` para enviar la solicitud; `closed`, al cancelar, con la X o con Escape.
 * - `uploadTitle` y `uploadDescription` para nombrar el sustento que pide cada caso.
 * @evitar
 * - Como confirmación genérica: usar `siaf-modal` (presets o `custom`).
 * - Para observar o rechazar con motivo: usar `siaf-request-approval-modals` o `siaf-modal` con `observe` / `reject`.
 * - Para adjuntar el sustento de una solicitud que no es de anulación: usar `siaf-upload-side-nav`.
 * @teclado
 * - **Tab / Shift + Tab**: al abrir, el foco entra en la X; recorren el detalle, «Elegir archivo», los botones de la
 *   tarjeta del archivo y Cancelar / Aceptar, y dan la vuelta sin salir del diálogo.
 * - **Escape**: cierra como la X (emite `closed`) y el foco vuelve al control que abrió el diálogo.
 * - **Enter / Espacio**: en «Elegir archivo» abren el diálogo de archivos del sistema; la X y Cancelar emiten `closed`,
 *   y Aceptar emite `accepted` cuando hay detalle y archivo.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"`, `aria-labelledby` al título y
 *   `aria-describedby` a la advertencia; la X se llama «Cerrar» (ícono con `label`).
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al control que
 *   lo abrió; Tab no sale hacia la página de atrás.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **3.3.2 Etiquetas o instrucciones (A)**: el detalle se ve siempre nombrado (dentro del campo o flotante) con
 *   asterisco y `aria-required`, y el sustento tiene su título, su explicación y los formatos que admite. Aceptar
 *   sigue deshabilitado hasta completar los dos.
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: de `text-area-control`: el contador «0/1000» va dentro del
 *   `<label>` del detalle y se suma a su nombre.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: de `siaf-uploader`: ni el avance ni el rechazo de un archivo se
 *   anuncian.
 * - **2.4.7 Foco visible (AA)**: la X muestra el anillo `border-states-focus` de 2 px; el detalle pasa al borde azul
 *   de 2 px y «Elegir archivo» pinta el contorno del kit.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del detalle vacío es `border-states-enabled` (2.44:1 en
 *   claro, 2.59:1 en oscuro).
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` y textos `text-neutral-medium` sobre
 *   `surface-highest`, que en claro es el blanco de la superficie (16.29:1 y 14.53:1).
 */
@Component({
  selector: 'siaf-annulment-modal',
  standalone: true,
  imports: [ButtonComponent, FocoDirective, IconComponent, TextAreaControlComponent, UploaderComponent],
  template: `
    @if (anim.visible()) {
      <div class="siaf-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-siaf-md" [class.cerrando]="anim.cerrando()" role="presentation">
        <section
          class="relative flex max-h-[calc(100vh-32px)] w-full max-w-[500px] flex-col gap-siaf-lg overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-lg pb-siaf-lg pt-12 shadow-siaf-lg"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-labelledby]="idTitulo"
          [attr.aria-describedby]="idDescripcion"
          [siafFoco]="open"
          (siafFocoEscape)="closed.emit()"
        >
          <button
            class="absolute right-siaf-lg top-siaf-lg grid size-6 place-items-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
            type="button"
            (click)="closed.emit()"
          >
            <siaf-icon name="close" [size]="20" label="Cerrar" [decorative]="false" />
          </button>

          <div class="flex flex-col items-center gap-siaf-md px-0 text-center sm:px-siaf-lg">
            <h2 class="w-full text-base font-medium text-[var(--sys-color-text-neutral-high)]" [id]="idTitulo">Confirmación de solicitud de anulación</h2>
            <p class="w-full text-sm font-normal tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]" [id]="idDescripcion">
              Está a punto de solicitar la anulación de este documento. Una vez enviada la solicitud, no podrá revertir este proceso. ¿Desea continuar?
            </p>
          </div>

          <div class="flex flex-col gap-siaf-lg px-0 sm:px-siaf-lg">
            <text-area-control
              placeholder="Detalle de anulación"
              [required]="true"
              [maxlength]="1000"
              [value]="detalle()"
              (valueChange)="detalle.set($event)"
            />

            <section class="flex flex-col gap-siaf-md" data-sustento>
              <div class="flex flex-col gap-0.5 text-sm">
                <h3 class="font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-high)]">{{ uploadTitle }}</h3>
                <p class="font-normal tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]">{{ uploadDescription }}</p>
              </div>

              <siaf-uploader
                variant="compact"
                accept=".pdf"
                [maxSizeMb]="10"
                (fileSelected)="archivo.set($event)"
                (fileRemoved)="quitarArchivo($event)"
              />

              <p class="text-sm tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]">Solo admite archivos .pdf de hasta 10 MB</p>
            </section>
          </div>

          <footer class="flex flex-col-reverse justify-end gap-siaf-xs sm:flex-row">
            <siaf-button variant="secondary" (click)="closed.emit()">Cancelar</siaf-button>
            <siaf-button variant="filled" [disabled]="!puedeAceptar()" (click)="aceptar()">Aceptar</siaf-button>
          </footer>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnulmentModalComponent implements OnChanges {
  /** Render animado del modal (entra desde arriba, sale en reverso). */
  readonly anim = new SidePanelAnimacion();

  @Input() open = false;
  /** Título de la sección del sustento. */
  @Input() uploadTitle = 'Sustento de la anulación';
  /** Explicación bajo el título: qué documento se adjunta. */
  @Input() uploadDescription = 'Adjunte el documento que respalda la solicitud.';
  /** X, Cancelar o Escape. */
  @Output() closed = new EventEmitter<void>();
  /** Aceptar, con el detalle y el sustento cargado. */
  @Output() accepted = new EventEmitter<AnnulmentRequest>();

  readonly detalle = signal('');
  /** Último archivo que terminó de cargar y sigue en su tarjeta. */
  readonly archivo = signal<File | null>(null);
  readonly puedeAceptar = computed(() => !!this.detalle().trim() && !!this.archivo());

  readonly idTitulo = `siaf-anulacion-titulo-${++siguienteId}`;
  readonly idDescripcion = `siaf-anulacion-descripcion-${siguienteId}`;

  ngOnChanges(changes: SimpleChanges): void {
    if (!('open' in changes)) return;
    this.anim.actualizar(this.open);
    // Al abrir empieza vacío; el uploader se crea de nuevo con el diálogo, sin tarjetas.
    if (this.open) {
      this.detalle.set('');
      this.archivo.set(null);
    }
  }

  quitarArchivo(archivo: File): void {
    if (this.archivo() === archivo) this.archivo.set(null);
  }

  aceptar(): void {
    const archivo = this.archivo();
    if (!this.puedeAceptar() || !archivo) return;
    this.accepted.emit({ detail: this.detalle().trim(), file: archivo });
  }
}
