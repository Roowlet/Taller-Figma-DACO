import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { ButtonComponent, ButtonVariant } from '../../../shared/ui/button/button.component';
import { ButtonGroupItem, ButtonsGroupComponent } from '../../../shared/ui/buttons-group/buttons-group.component';
import { CascadingMenuComponent, CascadingMenuGroup } from '../../../shared/ui/cascading-menu/cascading-menu.component';
import { IconDropdownMenuComponent, IconDropdownMenuItem } from '../../../shared/ui/icon-dropdown-menu/icon-dropdown-menu.component';
import { MenuComponent, MenuDensity, MenuItem, MenuLeading } from '../../../shared/ui/menu/menu.component';

/** Ejemplos en vivo de la categoría Botones y acciones. */
@Component({
  selector: 'ui-kit-ejemplos-acciones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, ButtonsGroupComponent, CascadingMenuComponent, IconDropdownMenuComponent, MenuComponent],
  template: `
    @switch (selector) {
      @case ('siaf-button') {
        <!-- Matriz del Figma: variante × tamaño, habilitado y deshabilitado. Hover, foco (Tab) y clic muestran sus estados. -->
        <div class="overflow-x-auto">
          <table class="border-separate border-spacing-x-4 border-spacing-y-3 text-left text-xs text-text-muted">
            <thead>
              <tr>
                <th class="font-bold uppercase tracking-widest">Variante</th>
                <th class="font-bold uppercase tracking-widest">Default (md)</th>
                <th class="font-bold uppercase tracking-widest">Small (sm)</th>
                <th class="font-bold uppercase tracking-widest">Deshabilitado</th>
              </tr>
            </thead>
            <tbody>
              @for (variante of variantesBoton; track variante) {
                <tr>
                  <td class="font-mono text-text">{{ variante }}</td>
                  <td><siaf-button [variant]="variante">Button</siaf-button></td>
                  <td><siaf-button [variant]="variante" size="sm">Button</siaf-button></td>
                  <td><siaf-button [variant]="variante" [disabled]="true">Button</siaf-button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Botones de ícono (Figma «Icon buttons»)</p>
        <div class="overflow-x-auto">
          <table class="border-separate border-spacing-x-4 border-spacing-y-3 text-left text-xs text-text-muted">
            <thead>
              <tr>
                <th class="font-bold uppercase tracking-widest">Variante</th>
                <th class="font-bold uppercase tracking-widest">Default</th>
                <th class="font-bold uppercase tracking-widest">Activado</th>
                <th class="font-bold uppercase tracking-widest">Deshabilitado</th>
                <th class="font-bold uppercase tracking-widest">Small</th>
                <th class="font-bold uppercase tracking-widest">Activado</th>
                <th class="font-bold uppercase tracking-widest">Deshabilitado</th>
              </tr>
            </thead>
            <tbody>
              @for (variante of variantesBotonIcono; track variante) {
                <tr>
                  <td class="font-mono text-text">{{ variante }}</td>
                  <td><siaf-button [variant]="variante" icon="add" [iconOnly]="true" ariaLabel="Agregar" /></td>
                  <td><siaf-button [variant]="variante" icon="add" [iconOnly]="true" [activated]="true" ariaLabel="Agregar (activado)" /></td>
                  <td><siaf-button [variant]="variante" icon="add" [iconOnly]="true" [disabled]="true" ariaLabel="Agregar (deshabilitado)" /></td>
                  <td><siaf-button [variant]="variante" size="sm" icon="add" [iconOnly]="true" ariaLabel="Agregar" /></td>
                  <td><siaf-button [variant]="variante" size="sm" icon="add" [iconOnly]="true" [activated]="true" ariaLabel="Agregar (activado)" /></td>
                  <td><siaf-button [variant]="variante" size="sm" icon="add" [iconOnly]="true" [disabled]="true" ariaLabel="Agregar (deshabilitado)" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
          <siaf-button variant="outline" icon="star_border" [iconOnly]="true" [activated]="favoritoActivo()" ariaLabel="Marcar como favorito" (click)="favoritoActivo.set(!favoritoActivo())" />
          <siaf-button variant="standard" icon="filter_list" [iconOnly]="true" [activated]="filtroActivo()" ariaLabel="Mostrar filtros" (click)="filtroActivo.set(!filtroActivo())" />
          <span aria-live="polite">Interruptores: favorito {{ favoritoActivo() ? 'activado' : 'no activado' }} · filtros {{ filtroActivo() ? 'visibles' : 'ocultos' }}</span>
        </div>

        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Con ícono, solo ícono y cargando</p>
        <div class="flex flex-wrap items-center gap-3">
          <siaf-button icon="add">Agregar</siaf-button>
          <siaf-button variant="outline" icon="file_download" iconPosition="end">Exportar</siaf-button>
          <siaf-button variant="text" size="sm" icon="filter_list">Filtrar</siaf-button>
          <siaf-button icon="search" [iconOnly]="true" ariaLabel="Buscar" />
          <siaf-button variant="outline" size="sm" icon="edit" [iconOnly]="true" ariaLabel="Editar" />
          <siaf-button [loading]="true">Grabando</siaf-button>
        </div>
        <p class="mt-3 text-xs text-text-muted">Los nombres anteriores siguen valiendo: accent / primary = filled, secondary = outline, ghost = text.</p>
      }
      @case ('siaf-buttons-group') {
        <div class="space-y-2 text-sm text-text">
          <siaf-buttons-group [items]="periodos" [value]="periodo()" ariaLabel="Periodo" (valueChange)="periodo.set($event)" />
          <p class="text-text-muted">Seleccionado: {{ periodo() }}</p>
          <p class="pt-4 text-[11px] font-bold uppercase tracking-widest text-text-muted">Solo íconos · selector de vista</p>
          <siaf-buttons-group [items]="vistas" [value]="vista()" [iconOnly]="true" ariaLabel="Vista del resultado" (valueChange)="vista.set($event)" />
          <p class="text-text-muted">Seleccionado: {{ vista() }}</p>
        </div>
      }
      @case ('siaf-menu') {
        <div class="flex flex-wrap items-start gap-x-6 gap-y-8 pb-24">
          @for (variante of variantesMenu; track variante.titulo) {
            <div>
              <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ variante.titulo }}</p>
              <siaf-menu
                [items]="variante.items"
                [leading]="variante.leading"
                [density]="variante.density"
                [submenuLeading]="variante.submenuLeading ?? null"
                [selectedValue]="radioMenu()"
                [selectedValues]="checksMenu()"
                (selectedValueChange)="radioMenu.set($event)"
                (selectedValuesChange)="checksMenu.set($event)"
                (selected)="eleccionMenu.set($event)"
              />
            </div>
          }
        </div>
        <p class="mt-3 text-xs text-text-muted" aria-live="polite">
          Última opción: {{ eleccionMenu() || 'ninguna' }} · radio: {{ radioMenu() }} · checkboxes: {{ checksMenu().join(', ') || 'ninguno' }}. Exportar abre su submenú al pasar el puntero, al pulsar o con →; ← o Escape lo cierra. Con Tab entra al menú y ↑ ↓ recorren las opciones.
        </p>
      }
      @case ('siaf-icon-dropdown-menu') {
        <div class="flex min-h-[220px] items-start gap-4">
          <siaf-icon-dropdown-menu icon="more_vert" ariaLabel="Más opciones" [items]="opcionesDropdown" />
          <siaf-icon-dropdown-menu icon="file_download" variant="accent" ariaLabel="Exportar" [items]="exportar" />
          <siaf-icon-dropdown-menu label="Exportar" icon="open_in_new" density="standard" [menuWidth]="200" [items]="formatosExportacion" />
        </div>
      }
      @case ('siaf-cascading-menu') {
        <div class="flex min-h-[220px] justify-end">
          <div class="relative">
            <siaf-cascading-menu [groups]="grupos" [open]="cascadaAbierta()" (closed)="cascadaAbierta.set(false)" (selected)="cascadaAbierta.set(false)">
              <siaf-button icon="add" (click)="cascadaAbierta.set(!cascadaAbierta())">Crear</siaf-button>
            </siaf-cascading-menu>
          </div>
        </div>
      }
    }
  `,
})
export class EjemplosAccionesComponent {
  static readonly selectores = ['siaf-button', 'siaf-buttons-group', 'siaf-menu', 'siaf-icon-dropdown-menu', 'siaf-cascading-menu'];
  @Input({ required: true }) selector!: string;

  readonly variantesBoton: ButtonVariant[] = ['filled', 'outline', 'text'];
  /** En los botones de ícono el Figma llama «standard» a la variante sin borde. */
  readonly variantesBotonIcono: ButtonVariant[] = ['filled', 'outline', 'standard'];
  readonly favoritoActivo = signal(false);
  readonly filtroActivo = signal(true);

  readonly periodos: ButtonGroupItem[] = [
    { label: 'Día', value: 'dia' },
    { label: 'Mes', value: 'mes' },
    { label: 'Año', value: 'anio' },
  ];
  readonly periodo = signal('mes');
  readonly vistas: ButtonGroupItem[] = [
    { label: 'Vista de datos', value: 'datos', icon: 'info' },
    { label: 'Vista de gráficas', value: 'graficas', icon: 'insert_chart' },
  ];
  readonly vista = signal('datos');

  private readonly opcionesMenu: MenuItem[] = [
    { label: 'Ver detalle', value: 'ver', icon: 'visibility' },
    { label: 'Editar', value: 'editar', icon: 'edit' },
    {
      label: 'Exportar',
      value: 'exportar',
      icon: 'download',
      children: [
        { label: 'Excel (.xlsx)', value: 'exportar-excel', icon: 'table_view' },
        { label: 'PDF', value: 'exportar-pdf', icon: 'picture_as_pdf' },
        { label: 'CSV', value: 'exportar-csv', icon: 'description' },
      ],
    },
    { label: 'Duplicar', value: 'duplicar', icon: 'content_copy' },
    { label: 'Historial', value: 'historial', icon: 'history', divider: true },
    { label: 'Anular', value: 'anular', icon: 'block', disabled: true },
  ];
  /** Sin divisor; con submenú en Exportar. Radio y checkbox usan la versión sin hijos. */
  private readonly opcionesSinDivisor: MenuItem[] = this.opcionesMenu.map(({ divider, ...o }) => o);
  private readonly opcionesSimples: MenuItem[] = this.opcionesSinDivisor.map(({ children, ...o }) => o);
  /** Las combinaciones del Figma: leading none/icon/radio/checkbox, trailing none/icon, standard y compact. */
  /** Dos niveles como categorías: cada opción abre su nivel 2, que va solo con texto. */
  private readonly categoriasMenu: MenuItem[] = [
    {
      label: 'Clasificación', value: 'clasificacion', icon: 'category',
      children: [
        { label: '1.1.- Con afectación presupuestal', value: 'c-11' },
        { label: '1.2.- Sin afectación presupuestal', value: 'c-12' },
      ],
    },
    {
      label: 'Registro', value: 'registro', icon: 'edit_note',
      children: [
        { label: '2.1.- Devengado', value: 'r-21' },
        { label: '2.2.- Girado', value: 'r-22' },
        { label: '2.3.- Pagado', value: 'r-23' },
      ],
    },
    {
      label: 'Ajuste', value: 'ajuste', icon: 'tune',
      children: [
        { label: '3.1.- Reclasificación', value: 'a-31' },
        { label: '3.2.- Corrección de errores', value: 'a-32' },
      ],
    },
  ];
  readonly variantesMenu: { titulo: string; items: MenuItem[]; leading: MenuLeading; density: MenuDensity; submenuLeading?: 'none' | 'icon' }[] = [
    { titulo: 'Leading none · Standard', items: this.opcionesSinDivisor, leading: 'none', density: 'standard' },
    { titulo: 'Icon + trailing · Standard', items: this.opcionesMenu, leading: 'icon', density: 'standard' },
    { titulo: 'Icon + trailing · Compact', items: this.opcionesMenu, leading: 'icon', density: 'compact' },
    { titulo: 'Radio · Compact', items: this.opcionesSimples, leading: 'radio', density: 'compact' },
    { titulo: 'Checkbox · Compact', items: this.opcionesSimples, leading: 'checkbox', density: 'compact' },
    { titulo: 'Dos niveles · nivel 2 sin ícono', items: this.categoriasMenu.map(({ icon, ...o }) => o), leading: 'none', density: 'standard' },
    { titulo: 'Icon · nivel 2 sin ícono', items: this.categoriasMenu, leading: 'icon', density: 'standard', submenuLeading: 'none' },
  ];
  readonly eleccionMenu = signal('');
  readonly radioMenu = signal('ver');
  readonly checksMenu = signal<string[]>(['editar']);

  readonly opcionesDropdown: IconDropdownMenuItem[] = [
    { label: 'Duplicar', value: 'duplicar' },
    { label: 'Ver historial', value: 'historial', divider: true },
    { label: 'Eliminar', value: 'eliminar' },
  ];

  readonly exportar: IconDropdownMenuItem[] = [
    { label: 'Excel', value: 'xlsx' },
    { label: 'PDF', value: 'pdf' },
  ];

  /** «Opciones de tabla» del resultado de Consultas y reportes (Figma 22402:16485). */
  readonly formatosExportacion: IconDropdownMenuItem[] = [
    { label: 'Excel', value: 'excel', icon: 'table_view' },
    { label: 'CSV', value: 'csv', icon: 'table_chart' },
    { label: 'PDF', value: 'pdf', icon: 'picture_as_pdf' },
  ];

  readonly grupos: CascadingMenuGroup[] = [
    { id: 'plan', label: 'Plan de cuentas', options: [{ id: 'scc', label: 'Solicitud de cuenta contable' }, { id: 'scmpc', label: 'Carga masiva del plan' }] },
    { id: 'ajuste', label: 'Asientos de ajuste', options: [{ id: 'sraa', label: 'Registro de asiento de ajuste' }] },
  ];
  readonly cascadaAbierta = signal(false);
}
