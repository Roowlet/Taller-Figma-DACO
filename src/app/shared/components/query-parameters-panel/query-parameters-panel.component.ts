import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';

import type { QueryReportParameterField, QueryReportParameters } from '../../types/query-report.types';
import { ButtonComponent } from '../../ui/button/button.component';
import { DateTimePickerComponent } from '../../ui/date-time-picker/date-time-picker.component';
import { FocoDirective } from '../../ui/foco/foco.directive';
import { IconComponent } from '../../ui/icon/icon.component';
import { SidePanelAnimacion } from '../../ui/side-panel-animacion';
import { TextFieldComponent } from '../../ui/text-field/text-field.component';

/** ¿El valor cuenta como ingresado? Una lista vacía o un texto vacío no. */
export function tieneValor(valor: string | string[] | undefined): boolean {
  return Array.isArray(valor) ? valor.length > 0 : !!valor;
}

let siguienteId = 0;

/**
 * Panel lateral «Parámetros de consulta» (Guía de Estructura de Pantallas, nodo 22402:15484): los campos que la
 * pantalla declara (fechas, selects y selects múltiples con «Seleccionar todo»), «Limpiar todo» y «Aplicar consulta»,
 * que se habilita cuando están los obligatorios y hay al menos un valor. Trabaja sobre un borrador: cerrar sin aplicar
 * no cambia la consulta, y al volver a abrirlo muestra los parámetros aplicados.
 *
 * @figma 22402:15484 Sidenav Parámetros de consulta
 * @usar
 * - Desde «Parámetros» de `siaf-query-report-page`, que le pasa los `fields` de su configuración y los valores
 *   aplicados.
 * - `select-multiple` para criterios con varias opciones (entidades, fuentes de financiamiento): la lista trae
 *   casillas y «Seleccionar todo».
 * @evitar
 * - Para refinar un resultado ya consultado (condiciones, agrupar): eso es «Filtros avanzados».
 * - Para elegir registros de un catálogo largo con búsqueda: usar `siaf-selection-side-nav`.
 * - Para filtrar una grilla con píldoras: usar `siaf-filter-pill`.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre los campos, «Limpiar todo» y «Aplicar consulta», y da la vuelta
 *   sin salir del panel.
 * - **Escape**: cierra el panel sin aplicar (emite `closed`) y el foco vuelve al botón que lo abrió; con una lista
 *   abierta, Escape cierra primero la lista.
 * - **Enter / Espacio**: en «Aplicar consulta», emite `applied` con los valores y cierra.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"` y `aria-labelledby` al título; la X
 *   se llama «Cerrar» más el título.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al botón que lo
 *   abrió.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **3.3.2 Etiquetas o instrucciones (A)**: cada campo lleva su etiqueta y el asterisco de obligatorio; «Aplicar
 *   consulta» queda deshabilitado hasta completarlos.
 * - **1.3.1 Información y relaciones (A)**: el título es un `h2` y los campos van en el orden en que se leen.
 * - **2.4.7 Foco visible (AA)**: la X muestra el contorno de 2 px `border-states-focus`; los campos y botones siguen su
 *   componente.
 */
@Component({
  selector: 'siaf-query-parameters-panel',
  standalone: true,
  imports: [ButtonComponent, DateTimePickerComponent, FocoDirective, IconComponent, TextFieldComponent],
  template: `
    @if (anim.visible()) {
      <section
        class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]"
        [class.cerrando]="anim.cerrando()"
        aria-modal="true"
        role="dialog"
        [attr.aria-labelledby]="idTitulo"
        (click)="cerrar()"
      >
        <aside
          class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden border-l border-[var(--sys-color-divider-default)] bg-surface shadow-siaf-elevation-8"
          [siafFoco]="open"
          (siafFocoEscape)="cerrar()"
          (click)="$event.stopPropagation()"
        >
          <!-- Sin líneas entre título, contenido y botones, como el resto de los side panels. -->
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text" [id]="idTitulo">{{ title }}</h2>
            <button
              class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              type="button"
              [attr.aria-label]="'Cerrar ' + title"
              (click)="cerrar()"
            >
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-siaf-md pb-siaf-md pt-siaf-sm">
            <div class="flex flex-col gap-siaf-lg">
              @for (campo of fields; track campo.key) {
                @switch (campo.type) {
                  @case ('date') {
                    <siaf-date-time-picker
                      [attr.data-parametro]="campo.key"
                      [label]="campo.label"
                      [required]="!!campo.required"
                      [defaultToToday]="false"
                      [fullWidth]="true"
                      [value]="texto(campo.key)"
                      (valueChange)="cambiar(campo.key, $event)"
                    />
                  }
                  @case ('select') {
                    <siaf-input
                      type="select"
                      [attr.data-parametro]="campo.key"
                      [label]="campo.label"
                      [required]="!!campo.required"
                      [autoSuccess]="false"
                      [options]="campo.options ?? []"
                      [value]="texto(campo.key)"
                      (valueChange)="cambiar(campo.key, $event)"
                    />
                  }
                  @case ('select-multiple') {
                    <siaf-input
                      type="select-multiple"
                      selectAllLabel="Seleccionar todo"
                      [attr.data-parametro]="campo.key"
                      [label]="campo.label"
                      [required]="!!campo.required"
                      [autoSuccess]="false"
                      [options]="campo.options ?? []"
                      [value]="lista(campo.key)"
                      (valueChange)="cambiar(campo.key, $event)"
                    />
                  }
                }
              }
            </div>
          </div>

          <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
            <siaf-button variant="outline" (click)="limpiar()">Limpiar todo</siaf-button>
            <siaf-button variant="filled" [disabled]="!completo()" (click)="aplicar()">Aplicar consulta</siaf-button>
          </footer>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryParametersPanelComponent implements OnChanges {
  @Input() open = false;
  @Input() title = 'Parámetros de consulta';
  @Input() fields: readonly QueryReportParameterField[] = [];
  /** Parámetros aplicados: el borrador parte de ellos cada vez que se abre. */
  @Input() values: QueryReportParameters | null = null;

  @Output() closed = new EventEmitter<void>();
  /** Valores ingresados, sin los campos vacíos. */
  @Output() applied = new EventEmitter<QueryReportParameters>();

  readonly anim = new SidePanelAnimacion();
  readonly idTitulo = `siaf-parametros-consulta-${++siguienteId}`;

  private readonly borrador = signal<QueryReportParameters>({});
  private readonly campos = signal<readonly QueryReportParameterField[]>([]);

  readonly hayValores = computed(() => Object.values(this.borrador()).some((v) => tieneValor(v)));
  readonly completo = computed(() => this.hayValores() && this.campos().every((c) => !c.required || tieneValor(this.borrador()[c.key])));

  ngOnChanges(changes: SimpleChanges): void {
    if ('fields' in changes) this.campos.set(this.fields);
    if ('open' in changes) {
      if (this.open) this.borrador.set({ ...(this.values ?? {}) });
      this.anim.actualizar(this.open);
    }
  }

  texto(clave: string): string {
    const valor = this.borrador()[clave];
    return typeof valor === 'string' ? valor : '';
  }

  lista(clave: string): string[] {
    const valor = this.borrador()[clave];
    return Array.isArray(valor) ? valor : [];
  }

  cambiar(clave: string, valor: string | number | string[]): void {
    this.borrador.update((actual) => ({ ...actual, [clave]: Array.isArray(valor) ? valor : String(valor) }));
  }

  limpiar(): void {
    this.borrador.set({});
  }

  aplicar(): void {
    if (!this.completo()) return;
    const valores = Object.fromEntries(Object.entries(this.borrador()).filter(([, v]) => tieneValor(v)));
    this.applied.emit(valores);
  }

  cerrar(): void {
    this.closed.emit();
  }
}
