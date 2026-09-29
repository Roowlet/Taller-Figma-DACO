import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { iconoDeArchivo } from '../../utils/archivo.util';

/** Acepta un File nativo o un objeto plano con solo el nombre (e.g. cargado desde la API). */
export type UploadedFileInfo = File | { name: string; size?: number };

/**
 * Tarjeta de un archivo ya adjunto: ícono por formato, nombre truncado con tooltip, peso y
 * acciones de reemplazar/quitar.
 *
 * Usarlo para mostrar el sustento PDF ya cargado de una solicitud; con `[readonly]` en modo consulta,
 * donde el adjunto se ve pero no se toca. Para elegir el archivo va `siaf-upload-side-nav`.
 *
 * Con `[error]` pasa al estado fallido del Figma (UI KIT, nodo 2612:9065): borde, ícono, nombre y
 * acciones en el tono de error, y el mensaje en lugar del peso. Mismos tokens que la tarjeta fallida
 * de `siaf-uploader`, para que la carga y el archivo adjunto se vean iguales cuando algo sale mal.
 *
 * @usar
 * - Para el documento de sustento ya adjunto en las solicitudes: cuenta contable, carga masiva, clase de ajuste, tipo
 *   de asiento, asiento de ajuste, evento, evento contable y apertura contable.
 * - Con `[readonly]` en modo consulta o en un detalle, donde el adjunto se ve pero no se reemplaza ni se quita.
 * - Para el Excel ya cargado de la carga masiva de eventos, con `(replace)` que vuelve a abrir el panel de carga.
 * - Con `[error]` cuando el archivo adjunto no se pudo cargar.
 * @evitar
 * - Para elegir o arrastrar el archivo: usar `siaf-upload-side-nav` (o `siaf-uploader` embebido); esta tarjeta solo
 *   muestra el que ya está adjunto.
 * - Para el aviso «No se han adjuntado archivos»: usar `message-box` en vez del bloque gris que hoy repiten a mano las
 *   solicitudes.
 * - Para el avance de una subida en curso: usar las tarjetas de progreso de `siaf-uploader`.
 * @teclado
 * - **Tab**: recorre «Reemplazar archivo» y «Quitar archivo»; con `readonly` la tarjeta no recibe foco.
 * - **Enter / Espacio**: ejecutan la acción del botón enfocado.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: las acciones son `<button>` nativos con `aria-label` («Reemplazar archivo»,
 *   «Quitar archivo»); los íconos son decorativos.
 * - **4.1.3 Mensajes de estado (AA)**: el mensaje de error va con `role="alert"` y se anuncia al aparecer.
 * - **1.4.1 Uso del color (A)**: el estado fallido, además del rojo, muestra el mensaje en lugar del peso.
 * - **Pendiente · 2.1.1 Teclado (A)**: un nombre largo se corta y el completo solo aparece con el mouse o una pulsación
 *   larga: el `siafTooltip` está en un texto que no recibe foco.
 * - **2.4.7 Foco visible (AA)**: los botones no definen estilo de foco; queda el anillo nativo del navegador.
 * - **1.4.11 Contraste no textual (AA)**: los íconos de acción van en `text-neutral-low` 5.01:1 y, si falló, en
 *   `text-feedback-danger` 9.84:1.
 * - **1.4.3 Contraste mínimo (AA)**: nombre `text-neutral-high` 16.29:1, peso `text-neutral-low` 5.01:1 y error
 *   `text-feedback-danger` 9.84:1.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada botón mide 24 × 24 px (`size-6`), justo el mínimo.
 */
@Component({
  selector: 'siaf-uploaded-file-card',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  template: `
    @if (file) {
      <div
        class="flex items-center gap-siaf-sm rounded-siaf-md border bg-surface p-siaf-md"
        [class.border-border]="!fallido"
        [class.border-[var(--sys-color-border-feedback-danger)]]="fallido"
      >
        <siaf-icon
          [name]="icono"
          [size]="32"
          class="shrink-0"
          [class.text-text-muted]="!fallido"
          [class.text-[var(--sys-color-text-feedback-danger)]]="fallido"
        />
        <div
          class="flex min-w-0 flex-1 flex-col leading-normal"
          [class.text-text]="!fallido"
          [class.text-[var(--sys-color-text-feedback-danger)]]="fallido"
        >
          <span class="truncate text-sm font-bold tracking-[-0.02px]" siafTooltip>{{ file.name }}</span>
          @if (fallido) {
            <span class="text-xs" role="alert">{{ error }}</span>
          } @else {
            <span class="text-xs text-text-muted">{{ formattedSize }}</span>
          }
        </div>
        @if (!readonly) {
          <div class="flex shrink-0 items-center gap-1">
            <button
              class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted"
              type="button"
              aria-label="Reemplazar archivo"
              (click)="replace.emit()"
            >
              <siaf-icon name="repeat" [size]="24" [class.text-text-muted]="!fallido" [class.text-[var(--sys-color-text-feedback-danger)]]="fallido" />
            </button>
            <button
              class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted"
              type="button"
              aria-label="Quitar archivo"
              (click)="removed.emit()"
            >
              <siaf-icon name="cancel" [size]="24" [class.text-text-muted]="!fallido" [class.text-[var(--sys-color-text-feedback-danger)]]="fallido" />
            </button>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadedFileCardComponent {
  @Input() file: UploadedFileInfo | null = null;
  @Input() readonly = false;
  /** Mensaje de error del archivo (ej. «No se pudo cargar el archivo»). Si trae texto, la tarjeta se muestra fallida. */
  @Input() error = '';

  @Output() replace = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();

  get fallido(): boolean {
    return this.error.trim().length > 0;
  }

  /** Ícono según el formato del archivo adjunto (mismo criterio que el uploader). */
  get icono(): string {
    return iconoDeArchivo(this.file?.name ?? '');
  }

  get formattedSize(): string {
    if (!this.file) return '';
    const bytes = this.file.size;
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1_048_576) return `${Math.round(bytes / 1024)}kb`;
    return `${(bytes / 1_048_576).toFixed(1)}MB`;
  }
}
