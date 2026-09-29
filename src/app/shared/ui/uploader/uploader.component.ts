import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, OnDestroy, Output, signal
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { archivoCoincideConAccept, iconoDeArchivo } from '../../utils/archivo.util';

export type UploadState = 'uploading' | 'done' | 'failed';

export interface UploadItem {
  id: string;
  file: File;
  state: UploadState;
  progress: number;
  remainingSeconds: number;
  sizeLabel: string;
  timer: ReturnType<typeof setInterval> | null;
  /** Motivo del fallo (tipo o tamaño). Si está presente, el archivo fue
   *  rechazado en validación y reintentar no tiene sentido. */
  error?: string;
}

/**
 * Zona de drag & drop con tarjetas de progreso, que valida cada archivo contra `accept` y `maxSizeMb`.
 *
 * Dos variantes: `extended` (por defecto: ícono de nube, texto y `hint`) y `compact`, una sola fila
 * de 48 px con el botón «Elegir archivo» y «o soltar archivo», para formularios con poco alto.
 * Ambas aceptan soltar archivos y muestran las mismas tarjetas de progreso debajo.
 *
 * Rara vez se usa suelto: vive dentro de `siaf-upload-side-nav`, que es el panel de carga que usan las
 * request-pages y la puerta de entrada normal. Ir directo a él solo para una carga embebida en página.
 *
 * @usar
 * - Dentro de `siaf-upload-side-nav`, el panel que abren las solicitudes para adjuntar el sustento .pdf: es su uso
 *   normal.
 * - Suelto solo para una carga embebida en la página; `compact` (una fila de 48 px) cuando el formulario tiene poco alto,
 *   como el sustento de `siaf-annulment-modal`.
 * - `fileSelected` cuando un archivo termina de cargar y `fileRemoved` cuando se quita con su ×, para que el padre sepa
 *   si todavía tiene archivo.
 * - Con el `accept` y el `maxSizeMb` de cada caso (.pdf para el sustento, .xlsx para las cargas masivas): también
 *   valida lo que se suelta.
 * @evitar
 * - Para mostrar un archivo ya adjunto o guardado: usar `siaf-uploaded-file-card`.
 * - Para el flujo de adjuntar en una solicitud: usar `siaf-upload-side-nav`, que ya trae título, Aceptar y Cancelar.
 * - Para mostrar el avance real de una subida al servidor: el progreso es simulado con un temporizador.
 * @teclado
 * - **Tab**: enfoca el selector de archivos (el `input type="file"` oculto dentro de «elige archivo» o «Elegir
 *   archivo») y después los botones de cada tarjeta (Pausar, Reintentar, Cancelar).
 * - **Enter / Espacio**: en el selector abren el diálogo de archivos del sistema; en los botones, ejecutan la acción.
 * @accesibilidad
 * - **2.1.1 Teclado (A)**: soltar archivos es opcional; el `input type="file"` nativo permite elegirlos con teclado.
 * - **2.4.7 Foco visible (AA)**: el `input type="file"` va oculto con `sr-only`, así que «elige archivo» (`extended`)
 *   y «Elegir archivo» (`compact`) pintan un contorno azul de 2 px (`border-states-focus`, 5.35:1 claro / 10.15:1
 *   oscuro) cuando el selector recibe el foco con teclado. Los botones de las tarjetas conservan el anillo nativo.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: ni el progreso, ni la carga terminada, ni el motivo de un rechazo se
 *   anuncian: no hay `role="status"`, `role="alert"` ni `aria-live`, y la barra es un `div` sin `role="progressbar"`.
 * - **3.3.1 Identificación de errores (A)**: un archivo de tipo o tamaño inválido queda en una tarjeta roja con el
 *   motivo en texto («Solo se admiten archivos .pdf»).
 * - **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: la ayuda (`hint`) no se asocia al selector y `compact` no la
 *   muestra.
 * - **4.1.2 Nombre, función y valor (A)**: el selector se nombra con el texto de su `label`; los botones de cada
 *   tarjeta tienen `aria-label` (Pausar, Reintentar, Cancelar) y los íconos son decorativos.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: «elige archivo» usa la clase `text-brand-primary`, que pinta con
 *   `bg-brand-primary`: 8.79:1 en claro, pero 2.66:1 en oscuro. El resto cumple: texto `text-neutral-high` 16.29:1,
 *   ayuda y peso `text-neutral-low` 5.01:1 y error `text-feedback-danger` 9.84:1.
 * - **2.5.8 Tamaño del objetivo (AA)**: los botones de las tarjetas miden 24 × 24 px (`size-6`).
 */
@Component({
  selector: 'siaf-uploader',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  template: `
    <!-- Zona de drop — siempre visible -->
    @if (variant === 'extended') {
      <div
        class="relative flex w-full flex-col items-center justify-center gap-siaf-sm rounded-siaf-md border p-siaf-lg transition"
        [class.border-dashed]="!isDragOver()"
        [class.border-border]="!isDragOver()"
        [class.bg-surface]="!isDragOver()"
        [class.border-solid]="isDragOver()"
        [class.border-[var(--sys-color-border-states-hover)]]="isDragOver()"
        [class.bg-[var(--sys-color-bg-states-light-hover)]]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <siaf-icon name="backup" [size]="42" class="text-brand-primary" />
        <div class="flex flex-col items-center gap-siaf-xs">
          <p class="text-sm text-text">
            Arrastrar o
            <label class="cursor-pointer rounded-siaf-sm font-bold text-brand-primary has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--sys-color-border-states-focus)]">
              elige archivo
              <input class="sr-only" type="file" [accept]="accept" [multiple]="multiple" (change)="onFileInput($event)" />
            </label>
            del computador
          </p>
          <p class="text-center text-xs text-text-muted">{{ hint }}</p>
        </div>
      </div>
    } @else {
      <!-- Compacta (Figma UI KIT, nodo 1419:435 «extend=False»): botón a la izquierda y el texto ocupa el resto. -->
      <div
        class="relative flex w-full items-center gap-siaf-sm rounded-siaf-md border px-siaf-sm py-siaf-xs transition"
        [class.border-dashed]="!isDragOver()"
        [class.border-border]="!isDragOver()"
        [class.bg-[var(--sys-color-bg-surfaces-surface-highest)]]="!isDragOver()"
        [class.border-solid]="isDragOver()"
        [class.border-[var(--sys-color-border-states-hover)]]="isDragOver()"
        [class.bg-[var(--sys-color-bg-states-light-hover)]]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <label
          class="inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-states-light-enabled)] px-siaf-md py-siaf-xxs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--sys-color-border-states-focus)]"
        >
          <siaf-icon name="file_upload" [size]="20" />
          Elegir archivo
          <input class="sr-only" type="file" [accept]="accept" [multiple]="multiple" (change)="onFileInput($event)" />
        </label>
        <span class="min-w-0 flex-1 truncate text-sm tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)]">o soltar archivo</span>
      </div>
    }

    <!-- Tarjetas de progreso — debajo de la zona de drop -->
    @for (item of uploads(); track item.id) {
      <div
        class="flex w-full flex-col gap-siaf-xs rounded-siaf-md border bg-surface p-siaf-md"
        [class.border-border]="item.state !== 'failed'"
        [class.border-[var(--sys-color-border-feedback-danger)]]="item.state === 'failed'"
      >
        <!-- Fila principal -->
        <div class="flex items-center gap-siaf-sm">

          <!-- Ícono de archivo (done/failed) -->
          @if (item.state !== 'uploading') {
            <siaf-icon
              [name]="iconoDe(item.file.name)"
              [size]="32"
              class="shrink-0"
              [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
              [class.text-text-muted]="item.state === 'done'"
            />
          }

          <!-- Texto -->
          <div
            class="flex min-w-0 flex-1 flex-col leading-normal"
            [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
            [class.text-text]="item.state !== 'failed'"
          >
            <span class="truncate text-sm font-bold" siafTooltip>
              {{ item.state === 'uploading' ? 'Subiendo...' : item.file.name }}
            </span>
            <span
              class="text-xs"
              [class.text-text-muted]="item.state !== 'failed'"
              [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
            >
              @if (item.state === 'uploading') {
                {{ item.progress }}% &bull; Quedan {{ item.remainingSeconds }}s
              } @else if (item.state === 'done') {
                {{ item.sizeLabel }}
              } @else {
                {{ item.error ?? 'No se pudo cargar el archivo' }}
              }
            </span>
          </div>

          <!-- Acciones -->
          <div class="flex shrink-0 items-center gap-1">
            @if (item.state === 'uploading') {
              <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Pausar" (click)="pauseItem(item)">
                <siaf-icon name="pause_circle" [size]="24" class="text-text-muted" />
              </button>
            } @else if (!item.error) {
              <!-- Sin botón de reintentar cuando el archivo fue rechazado por
                   validación: reintentar el mismo archivo inválido nunca va a
                   funcionar (hay que elegir otro). -->
              <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Reintentar" (click)="retryItem(item)">
                <siaf-icon
                  name="repeat"
                  [size]="24"
                  [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
                  [class.text-text-muted]="item.state === 'done'"
                />
              </button>
            }
            <button class="inline-flex size-6 items-center justify-center rounded-siaf-sm transition hover:bg-surface-muted" type="button" aria-label="Cancelar" (click)="removeItem(item)">
              <siaf-icon
                name="cancel"
                [size]="24"
                [class.text-[var(--sys-color-text-feedback-danger)]]="item.state === 'failed'"
                [class.text-text-muted]="item.state !== 'failed'"
              />
            </button>
          </div>
        </div>

        <!-- Barra de progreso -->
        @if (item.state === 'uploading') {
          <div class="relative h-2 w-full overflow-hidden rounded-full bg-[var(--sys-color-bg-surfaces-surface-high)]">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-brand-primary transition-all duration-300"
              [style.width.%]="item.progress"
            ></div>
          </div>
        }
      </div>
    }
  `,
  styles: `:host { display: flex; flex-direction: column; gap: var(--spacing-siaf-md); width: 100%; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploaderComponent implements OnDestroy {
  @Input() variant: 'extended' | 'compact' = 'extended';
  @Input() accept = '.pdf';
  @Input() hint = 'Se permiten archivos de 10 MB como máximo';
  @Input() maxSizeMb = 10;
  @Input() multiple = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() allDone = new EventEmitter<File[]>();
  /** Archivo que se quitó con la × de su tarjeta: el padre deja de contar con él. */
  @Output() fileRemoved = new EventEmitter<File>();

  readonly isDragOver = signal(false);
  readonly uploads = signal<UploadItem[]>([]);

  /** Ícono por formato para las tarjetas de progreso (usado desde el template). */
  iconoDe(nombre: string): string {
    return iconoDeArchivo(nombre);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    files.forEach((f) => this.addUpload(f));
  }

  onFileInput(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    files.forEach((f) => this.addUpload(f));
    (event.target as HTMLInputElement).value = '';
  }

  pauseItem(item: UploadItem): void {
    if (item.timer) {
      clearInterval(item.timer);
      item.timer = null;
    }
  }

  retryItem(item: UploadItem): void {
    // Defensa en profundidad: aunque el botón no se renderiza para archivos
    // rechazados en validación, nunca reintentar uno inválido.
    const error = this.validarArchivo(item.file);
    if (error) {
      item.error = error;
      item.state = 'failed';
      this.uploads.update((l) => [...l]);
      return;
    }
    this.startTimer(item);
  }

  removeItem(item: UploadItem): void {
    if (item.timer) clearInterval(item.timer);
    this.uploads.update((list) => list.filter((u) => u.id !== item.id));
    this.fileRemoved.emit(item.file);
  }

  ngOnDestroy(): void {
    this.uploads().forEach((u) => { if (u.timer) clearInterval(u.timer); });
  }

  private addUpload(file: File): void {
    // El `accept` del <input> es solo un filtro del diálogo del sistema: no
    // frena el drag & drop ni al usuario que elige "Todos los archivos". La
    // validación real va acá, contra el mismo `accept` configurado (Contabilidad
    // usa .pdf; carga masiva de plan de cuentas, .xlsx).
    const error = this.validarArchivo(file);

    const item: UploadItem = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      state: error ? 'failed' : 'uploading',
      progress: 0,
      remainingSeconds: 30,
      sizeLabel: this.formatSize(file.size),
      timer: null,
      error,
    };
    this.uploads.update((list) => [...list, item]);
    if (item.state === 'uploading') this.startTimer(item);
  }

  /** Devuelve el motivo de rechazo, o undefined si el archivo es válido. */
  private validarArchivo(file: File): string | undefined {
    if (!archivoCoincideConAccept(file, this.accept)) {
      return `Solo se admiten archivos ${this.accept}`;
    }

    if (file.size > this.maxSizeMb * 1024 * 1024) {
      return `El archivo supera los ${this.maxSizeMb} MB permitidos`;
    }

    return undefined;
  }

  private startTimer(item: UploadItem): void {
    if (item.timer) clearInterval(item.timer);
    item.state = 'uploading';
    item.timer = setInterval(() => {
      if (item.progress >= 100) {
        clearInterval(item.timer!);
        item.timer = null;
        item.state = 'done';
        this.uploads.update((l) => [...l]);
        this.fileSelected.emit(item.file);
        const done = this.uploads().filter((u) => u.state === 'done').map((u) => u.file);
        if (this.uploads().every((u) => u.state !== 'uploading')) this.allDone.emit(done);
        return;
      }
      item.progress = Math.min(Math.round(item.progress + Math.random() * 8 + 2), 100);
      item.remainingSeconds = Math.max(0, Math.round((100 - item.progress) / 4));
      this.uploads.update((l) => [...l]);
    }, 300);
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)}kb`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  }
}
