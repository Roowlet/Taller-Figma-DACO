import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { DEFAULT_PROCESS_TREE, ProcessMenuNode } from '../../utils/process-tree.util';
import { SelectOption, SelectOptionsComponent } from '../../ui/select-options/select-options.component';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';
import { FocoDirective } from '../../ui/foco/foco.directive';

export type CreateDocumentVariant = 'sidepanel' | 'dropdown';

export type CreateDocumentField = {
  placeholder: string;
  type?: 'search' | 'select';
  value?: string;
  required?: boolean;
  options?: string[];
  disabled?: boolean;
};

export type CreateDocumentSelection = {
  placeholder: string;
  value: string;
};

export type CreateDocumentAccepted = {
  processId?: string;
  processLabel?: string;
  document?: string;
  actionType?: string;
  route?: string;
};

export type CreateDocumentOption = {
  label: string;
  route?: string;
  actionTypes?: string[];
};

export type CreateDocumentProcessOption = {
  id: string;
  label: string;
  route?: string;
  documents: string[];
  documentOptions?: CreateDocumentOption[];
  actionTypes: string[];
};

// Las opciones del buscador salen del arbol de procesos para no duplicar catalogos a mano.
const CREATE_DOCUMENT_PROCESSES: CreateDocumentProcessOption[] = collectProcessOptions(DEFAULT_PROCESS_TREE);

/**
 * Formulario «Crear documento»: pide proceso, documento y tipo de acción y emite `accepted` con esa selección y la ruta
 * de la solicitud a abrir. La variante `sidepanel` (panel del shell) busca el proceso entre `processOptions`, que
 * por defecto salen del árbol `DEFAULT_PROCESS_TREE`; `dropdown` (popover) solo pide documento y tipo de acción.
 * Con `fields` el padre controla los campos y recibe cada cambio por `fieldValueChange`.
 *
 * @usar
 * - Desde «Crear» del sidebar o del menú móvil: el shell lo abre como `sidepanel` con las opciones que arma de los tipos
 *   de documento del API.
 * - En la bandeja, como popover del botón «Crear documento» de `siaf-documents-records-page` (`dropdown` con `fields`
 *   controlados para Documento y Tipo de acción).
 * @evitar
 * - Pintar otro `sidepanel` en una página: pedir el del shell con `ShellNavigationService.openCreateDocument()`.
 * - Para los campos de la solicitud misma: usar `siaf-input` dentro de `siaf-solicitude-page-layout`.
 * - Para elegir un registro de un catálogo con columnas: usar `siaf-selection-side-nav`.
 * - Copiar a mano la lista de procesos: sale de `DEFAULT_PROCESS_TREE` o de `processOptions`.
 * @teclado
 * - **Tab**: recorre el buscador de procesos (en `sidepanel`), Documento, Tipo de acción y Cancelar / Aceptar;
 *   Documento y Tipo de acción siguen deshabilitados hasta elegir el campo anterior.
 * - **Enter / Espacio** en Documento o Tipo de acción: abre o cierra sus opciones; al abrir, el foco entra en la
 *   opción elegida, que sigue `siaf-select-options` (flechas, Inicio, Fin, Enter o Espacio). Escape o salir con Tab
 *   las cierra y el foco vuelve al campo.
 * - **Flecha abajo** en el buscador de procesos: entra a la lista (si estaba cerrada, primero la abre);
 *   **flechas arriba / abajo** la recorren y **Enter** elige el proceso (el foco vuelve al buscador).
 * - **Escape**: en el buscador cierra la lista; en un proceso, cierra la lista y vuelve al buscador.
 * - **Enter / Espacio** en Cancelar y Aceptar: emiten `canceled` y `accepted`.
 * @accesibilidad
 * - **2.1.1 Teclado (A)**: el buscador es un `combobox` con `aria-expanded`: flecha abajo entra a la lista de procesos,
 *   las flechas la recorren y Enter elige; la lista ya no se cierra al pasar del buscador a ella.
 * - **2.4.7 Foco visible (AA)**: Documento, Tipo de acción y el buscador muestran el borde azul de 2 px
 *   (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro) al recibir el foco, también si ya tienen valor.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, las opciones de Documento y Tipo de acción reciben el foco al abrir y
 *   al elegir, cerrar con Escape o salir con Tab vuelve al campo; al elegir un proceso el foco vuelve al buscador.
 * - **4.1.2 Nombre, función y valor (A)**: el buscador es un `combobox` con `aria-expanded` y `aria-controls` hacia
 *   la lista `role="listbox"` «Procesos», y el proceso elegido lleva `aria-selected`. Documento y Tipo de acción
 *   publican `aria-expanded` y `aria-haspopup="listbox"`.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde de los campos en reposo es `border-states-enabled`
 *   (2.44:1 / 2.59:1); el de foco, `border-states-focus` (5.35:1 / 10.15:1), sí cumple.
 * - **3.3.2 Etiquetas o instrucciones (A)**: cada campo muestra su nombre (en el placeholder o como etiqueta flotante)
 *   con asterisco en los obligatorios; no llevan `aria-required`.
 * - **1.3.1 Información y relaciones (A)**: sección con `aria-label="Crear documento"` (fijo aunque cambie `title`) y
 *   título `h2`; cada campo va dentro de su `<label>`.
 * - **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` (14.53:1 / 12.87:1) y placeholder `text-neutral-low`
 *   (5.01:1 / 8.86:1) sobre el `bg-surface` de los campos.
 */
@Component({
  selector: 'siaf-create-document',
  standalone: true,
  imports: [FocoDirective, ButtonComponent, IconComponent, NgClass, SelectOptionsComponent, TooltipDirective],
  template: `
    <section
      class="flex flex-col items-start bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))]"
      [ngClass]="variantClass"
      aria-label="Crear documento"
    >
      <header class="flex w-full items-center gap-siaf-xs p-siaf-md">
        <h2 class="m-0 min-h-6 text-base font-bold uppercase leading-none tracking-[0.02px] text-text">
          {{ title }}
        </h2>
      </header>

      <div
        class="flex w-full items-start"
        [ngClass]="variant === 'sidepanel' ? 'min-h-0 flex-1' : 'bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))]'"
      >
        <div
          class="flex min-w-0 flex-1 flex-col px-siaf-md"
          [ngClass]="variant === 'sidepanel' ? 'h-full py-siaf-xs' : 'pb-siaf-xs'"
        >
          <div class="flex w-full flex-col gap-siaf-lg">
            @for (field of resolvedFields; track field.placeholder) {
              <label class="relative block h-10 w-full">
                @if (isFieldFloating(field)) {
                  <span
                    class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal"
                    [class.text-[var(--sys-color-text-neutral-activated)]]="focusedField === field.placeholder"
                    [class.text-[var(--sys-color-text-neutral-low)]]="focusedField !== field.placeholder"
                  >
                    {{ field.placeholder }}@if (field.required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
                  </span>
                }

                @if (field.type === 'select') {
                  <div class="relative">
                    <button
                      class="flex min-h-10 w-full items-center rounded-siaf-md bg-surface py-siaf-xs pl-siaf-md pr-siaf-sm text-left text-sm font-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)] outline-none transition focus:border-2 focus:border-[var(--sys-color-border-states-focus)] disabled:cursor-not-allowed disabled:border disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
                      [ngClass]="fieldControlClass(field)"
                      type="button"
                      [disabled]="field.disabled"
                      [attr.aria-expanded]="openedSelectField === field.placeholder"
                      aria-haspopup="listbox"
                      (click)="toggleSelect(field)"
                    >
                      <span class="min-w-0 flex-1 truncate" siafTooltip [class.text-[var(--sys-color-text-neutral-low)]]="!field.value">
                        {{ field.value || field.placeholder }}@if (!field.value && field.required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
                      </span>
                      <siaf-icon class="shrink-0 text-text transition" [class.rotate-180]="openedSelectField === field.placeholder" name="expand_more" [size]="24" />
                    </button>

                    @if (openedSelectField === field.placeholder) {
                      <button class="fixed inset-0 z-40 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closeSelect()"></button>
                      <div class="absolute left-0 right-0 top-[calc(100%+4px)] z-50" siafFoco [siafFocoAtrapar]="false" (siafFocoEscape)="closeSelect()" (siafFocoSalida)="closeSelect()">
                        <siaf-select-options
                          [options]="fieldOptions(field)"
                          [selectedValue]="field.value || ''"
                          (selected)="onOptionSelected(field, $event)"
                        />
                      </div>
                    }
                  </div>
                } @else {
                  <div class="relative">
                    <input
                      class="min-h-10 w-full rounded-siaf-md bg-surface px-siaf-md py-siaf-xs text-sm font-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)] outline-none transition placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:border disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
                      [ngClass]="fieldControlClass(field)"
                      type="search"
                      autocomplete="off"
                      [placeholder]="isFieldFloating(field) ? '' : optionPlaceholder(field)"
                      [value]="field.value || ''"
                      [disabled]="field.disabled"
                      role="combobox"
                      aria-autocomplete="list"
                      [attr.aria-expanded]="showProcessResults(field)"
                      [attr.aria-controls]="showProcessResults(field) ? idResultados : null"
                      (focus)="onSearchFocus(field)"
                      (blur)="onSearchBlur($event)"
                      (input)="onSearchInput(field, $event)"
                      (keydown.arrowDown)="enfocarProceso($event, 0)"
                      (keydown.escape)="cerrarResultadosConEscape($event)"
                    />

                    @if (showProcessResults(field)) {
                      <div
                        class="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-72 overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] py-siaf-xs shadow-siaf-elevation-1"
                        role="listbox"
                        aria-label="Procesos"
                        [id]="idResultados"
                        (focusout)="alSalirDeResultados($event)"
                      >
                        @for (process of filteredProcessOptions; track process.id) {
                          <button
                            class="flex min-h-10 w-full items-center px-siaf-md py-siaf-xs text-left text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sys-color-border-states-focus)]"
                            type="button"
                            role="option"
                            [attr.aria-selected]="process.id === selectedProcess?.id"
                            (mousedown)="$event.preventDefault()"
                            (click)="selectProcess(process, $event)"
                            (keydown.arrowDown)="enfocarProceso($event, 1)"
                            (keydown.arrowUp)="enfocarProceso($event, -1)"
                            (keydown.escape)="volverAlBuscador($event)"
                          >
                            <span class="min-w-0 flex-1 truncate" siafTooltip>{{ process.label }}</span>
                          </button>
                        } @empty {
                          <span class="block px-siaf-md py-siaf-xs text-sm text-[var(--sys-color-text-neutral-low)]">
                            No se encontraron procesos
                          </span>
                        }
                      </div>
                    }
                  </div>
                }
              </label>
            }

            <div class="flex h-10 w-full items-start justify-end gap-siaf-sm">
              <siaf-button variant="secondary" size="md" (click)="canceled.emit()">Cancelar</siaf-button>
              <siaf-button variant="accent" size="md" [disabled]="resolvedAcceptDisabled" (click)="accept()">Aceptar</siaf-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDocumentComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() variant: CreateDocumentVariant = 'sidepanel';
  @Input() title = 'Crear documento';
  @Input() acceptDisabled = false;
  @Input() fields: CreateDocumentField[] = [];
  @Input() processOptions: CreateDocumentProcessOption[] = CREATE_DOCUMENT_PROCESSES;
  focusedField = '';
  openedSelectField = '';
  processResultsOpen = false;
  private readonly internalValues = new Map<string, string>();

  @Output() canceled = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<CreateDocumentAccepted>();
  @Output() fieldSelected = new EventEmitter<string>();
  @Output() fieldValueChange = new EventEmitter<CreateDocumentSelection>();

  get resolvedFields(): CreateDocumentField[] {
    if (this.fields.length > 0) {
      return this.fields;
    }

    // Si no llegan campos externos, el componente arma el flujo base de Crear documento.
    return this.variant === 'dropdown'
      ? [
          {
            placeholder: 'Documento',
            type: 'select',
            required: true,
            value: this.internalValues.get('Documento') || '',
            options: this.defaultProcessDocuments
          },
          {
            placeholder: 'Tipo de acci\u00f3n',
            type: 'select',
            required: true,
            value: this.internalValues.get('Tipo de acci\u00f3n') || '',
            options: this.defaultProcessActionTypes,
            disabled: this.defaultProcessActionTypes.length === 0
          }
        ]
      : [
          {
            placeholder: 'Buscar proceso o procedimiento',
            type: 'search',
            required: true,
            value: this.internalValues.get('Buscar proceso o procedimiento') || ''
          },
          {
            placeholder: 'Documento',
            type: 'select',
            required: true,
            value: this.internalValues.get('Documento') || '',
            options: this.selectedProcessDocuments,
            disabled: !this.selectedProcessDocuments.length
          },
          {
            placeholder: 'Tipo de acci\u00f3n',
            type: 'select',
            required: true,
            value: this.internalValues.get('Tipo de acci\u00f3n') || '',
            options: this.selectedProcessActionTypes,
            disabled: !this.selectedProcessActionTypes.length
          }
        ];
  }

  get selectedProcess(): CreateDocumentProcessOption | null {
    const selectedProcessId = this.internalValues.get('processId');
    return this.processOptions.find((process) => process.id === selectedProcessId) || null;
  }

  get filteredProcessOptions(): CreateDocumentProcessOption[] {
    const query = this.normalize(this.internalValues.get('Buscar proceso o procedimiento') || '');

    if (!query) {
      return this.processOptions;
    }

    return this.processOptions.filter((process) => this.normalize(process.label).includes(query));
  }

  get resolvedAcceptDisabled(): boolean {
    return this.acceptDisabled || this.resolvedFields.some((field) => field.required && !field.value);
  }

  get variantClass(): string {
    return this.variant === 'dropdown'
      ? 'w-full max-w-[360px] rounded-siaf-md py-siaf-xs shadow-siaf-elevation-1'
      : 'h-[calc(100vh-56px)] w-screen border-r border-[var(--sys-color-divider-default)] shadow-siaf-elevation-1 lg:max-w-[370px]';
  }

  toggleSelect(field: CreateDocumentField): void {
    if (field.disabled) {
      return;
    }

    this.fieldSelected.emit(field.placeholder);
    this.openedSelectField = this.openedSelectField === field.placeholder ? '' : field.placeholder;
    this.focusedField = this.openedSelectField;
    this.processResultsOpen = false;
  }

  closeSelect(): void {
    this.openedSelectField = '';
    this.focusedField = '';
    this.cdr.markForCheck();
  }

  onOptionSelected(field: CreateDocumentField, value: string): void {
    this.openedSelectField = '';
    this.focusedField = '';

    if (this.fields.length === 0) {
      this.internalValues.set(field.placeholder, value);

      if (field.placeholder === 'Documento') {
        this.internalValues.delete('Tipo de acci\u00f3n');
      }
    }

    this.fieldValueChange.emit({
      placeholder: field.placeholder,
      value
    });
  }

  onSearchFocus(field: CreateDocumentField): void {
    this.focusedField = field.placeholder;
    this.openedSelectField = '';
    this.processResultsOpen = this.isProcessSearchField(field);
  }

  onSearchBlur(event?: FocusEvent): void {
    // Pasar a la lista de procesos (con flecha abajo) no la cierra.
    if (this.estaEnResultados(event?.relatedTarget)) return;
    this.focusedField = '';
    this.closeProcessResults();
  }

  readonly idResultados = `siaf-create-document-procesos-${Math.random().toString(36).slice(2)}`;

  /** Flecha abajo desde el buscador entra a la lista; en la lista, flechas arriba y abajo recorren los procesos. */
  enfocarProceso(event: Event, paso: 0 | 1 | -1): void {
    const origen = event.target as HTMLElement;
    if (paso === 0 && !this.processResultsOpen) {
      // Con la lista cerrada (después de Escape), flecha abajo la vuelve a abrir sin mover el foco.
      event.preventDefault();
      this.processResultsOpen = true;
      this.cdr.markForCheck();
      return;
    }
    const lista = paso === 0 ? origen.parentElement?.querySelector<HTMLElement>('[role="listbox"]') : origen.closest<HTMLElement>('[role="listbox"]');
    const opciones = Array.from(lista?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    if (!opciones.length) return;
    event.preventDefault();
    const actual = opciones.indexOf(origen);
    const destino = paso === 0 ? 0 : (actual + paso + opciones.length) % opciones.length;
    opciones[destino].focus();
  }

  /** Escape en el buscador cierra la lista abierta y lo marca como atendido (el popover que lo contiene no se cierra). */
  cerrarResultadosConEscape(event: Event): void {
    if (!this.processResultsOpen) return;
    event.preventDefault();
    this.closeProcessResults();
  }

  /** Escape en un proceso cierra la lista y el foco vuelve al buscador. */
  volverAlBuscador(event: Event): void {
    event.preventDefault();
    // Primero el foco: al enfocarse, el buscador vuelve a abrir la lista.
    this.buscadorDe(event)?.focus();
    this.closeProcessResults();
  }

  /** La lista se cierra cuando el foco sale de ella hacia un control que no es el buscador. */
  alSalirDeResultados(event: FocusEvent): void {
    const lista = event.currentTarget as HTMLElement;
    const destino = event.relatedTarget as Node | null;
    if (destino && (lista.contains(destino) || lista.parentElement?.querySelector('input') === destino)) return;
    this.focusedField = '';
    this.closeProcessResults();
  }

  private estaEnResultados(destino: EventTarget | null | undefined): boolean {
    return destino instanceof HTMLElement && !!destino.closest('[role="listbox"]');
  }

  private buscadorDe(event?: Event): HTMLInputElement | null {
    const origen = event?.target instanceof HTMLElement ? event.target : null;
    return origen?.closest('[role="listbox"]')?.parentElement?.querySelector<HTMLInputElement>('input') ?? null;
  }

  onSearchInput(field: CreateDocumentField, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (this.fields.length === 0) {
      this.internalValues.set(field.placeholder, value);
      // Cambiar de proceso invalida documento y tipo de accion seleccionados previamente.
      this.internalValues.delete('processId');
      this.internalValues.delete('Documento');
      this.internalValues.delete('Tipo de acci\u00f3n');
      this.processResultsOpen = true;
      this.cdr.markForCheck();
    }

    this.fieldValueChange.emit({
      placeholder: field.placeholder,
      value
    });
  }

  selectProcess(process: CreateDocumentProcessOption, event?: Event): void {
    // El foco vuelve al buscador, que ahora muestra el proceso elegido y conserva su borde de foco.
    const buscador = this.buscadorDe(event);
    buscador?.focus();
    this.internalValues.set('processId', process.id);
    this.internalValues.set('Buscar proceso o procedimiento', process.label);
    this.internalValues.delete('Documento');
    this.internalValues.delete('Tipo de acci\u00f3n');
    this.processResultsOpen = false;
    if (!buscador) this.focusedField = '';
    this.cdr.markForCheck();

    this.fieldValueChange.emit({
      placeholder: 'Buscar proceso o procedimiento',
      value: process.label
    });
  }

  accept(): void {
    const selectedProcess = this.selectedProcess || this.defaultProcess;
    const document = this.internalValues.get('Documento') || this.externalFieldValue('Documento');
    const documentOption = this.findDocumentOption(selectedProcess, document);

    this.accepted.emit({
      processId: selectedProcess?.id,
      processLabel: this.internalValues.get('Buscar proceso o procedimiento') || selectedProcess?.label,
      document,
      actionType: this.internalValues.get('Tipo de acci\u00f3n') || this.externalFieldValue('Tipo de acción'),
      route: documentOption?.route || selectedProcess?.route
    });
  }

  closeProcessResults(): void {
    this.processResultsOpen = false;
    this.cdr.markForCheck();
  }

  showProcessResults(field: CreateDocumentField): boolean {
    return this.processResultsOpen && this.isProcessSearchField(field);
  }

  fieldOptions(field: CreateDocumentField): SelectOption[] {
    const options = field.options || [];
    const normalizedOptions = field.value && !options.includes(field.value) ? [...options, field.value] : options;

    return normalizedOptions.map((option) => ({
      label: option,
      value: option
    }));
  }

  optionPlaceholder(field: CreateDocumentField): string {
    return `${field.placeholder}${field.required ? ' *' : ''}`;
  }

  isFieldFloating(field: CreateDocumentField): boolean {
    return this.focusedField === field.placeholder || this.openedSelectField === field.placeholder || Boolean(field.value);
  }

  isFieldSuccess(field: CreateDocumentField): boolean {
    return Boolean(field.value) && this.focusedField !== field.placeholder;
  }

  fieldControlClass(field: CreateDocumentField): string {
    if (field.disabled) {
      return 'border border-[var(--sys-color-border-states-disabled)]';
    }

    if (this.focusedField === field.placeholder || this.openedSelectField === field.placeholder) {
      return 'border-2 border-[var(--sys-color-border-states-focus)]';
    }

    if (this.isFieldSuccess(field)) {
      return 'border-2 border-[var(--sys-color-border-feedback-success)]';
    }

    return 'border border-[var(--sys-color-border-states-enabled)] hover:border-2 hover:border-[var(--sys-color-border-states-hover)]';
  }

  private isProcessSearchField(field: CreateDocumentField): boolean {
    return this.fields.length === 0 && field.placeholder === 'Buscar proceso o procedimiento';
  }

  private get defaultProcess(): CreateDocumentProcessOption | null {
    return this.processOptions.find((process) => this.documentLabels(process).length > 0 && this.actionTypesForProcess(process).length > 0) || this.processOptions[0] || null;
  }

  private get defaultProcessDocuments(): string[] {
    return this.documentLabels(this.defaultProcess);
  }

  private get defaultProcessActionTypes(): string[] {
    return this.actionTypesForProcess(this.defaultProcess);
  }

  private get selectedProcessDocuments(): string[] {
    return this.documentLabels(this.selectedProcess);
  }

  private get selectedProcessActionTypes(): string[] {
    return this.actionTypesForProcess(this.selectedProcess);
  }

  private documentLabels(process: CreateDocumentProcessOption | null): string[] {
    if (!process) {
      return [];
    }

    return process.documentOptions?.map((document) => document.label) || process.documents;
  }

  private actionTypesForProcess(process: CreateDocumentProcessOption | null): string[] {
    if (!process) {
      return [];
    }

    const selectedDocument = this.internalValues.get('Documento') || this.externalFieldValue('Documento');

    if (process.documentOptions?.length && !selectedDocument) {
      return [];
    }

    const documentOption = this.findDocumentOption(process, selectedDocument);

    return documentOption?.actionTypes || process.actionTypes;
  }

  private findDocumentOption(process: CreateDocumentProcessOption | null | undefined, document: string): CreateDocumentOption | undefined {
    return process?.documentOptions?.find((option) => option.label === document);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private externalFieldValue(placeholder: string): string {
    return this.fields.find((field) => field.placeholder === placeholder)?.value || '';
  }
}

function collectProcessOptions(nodes: ProcessMenuNode[]): CreateDocumentProcessOption[] {
  return nodes.flatMap((node) => {
    const children = node.children ? collectProcessOptions(node.children) : [];

    if (node.children?.length) {
      return children;
    }

    // Solo los nodos hoja aparecen como resultados; los que tienen metadata habilitan el flujo completo.
    return [
      ...children,
      {
        id: node.id,
        label: node.label,
        route: node.createRoute,
        documents: node.documentOptions || [],
        documentOptions: node.documentCreateOptions,
        actionTypes: node.actionTypeOptions || []
      }
    ];
  });
}
