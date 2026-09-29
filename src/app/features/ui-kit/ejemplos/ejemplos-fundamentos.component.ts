import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DividerComponent, DividerVariant } from '../../../shared/ui/divider/divider.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ReadonlyFieldComponent } from '../../../shared/ui/readonly-field/readonly-field.component';
import { TooltipDirective } from '../../../shared/ui/tooltip/tooltip.directive';

/**
 * Ejemplos en vivo de la categoría Fundamentos. `siafTooltip` suma un bloque «Uso en consultas»
 * que copia el marcado de los resultados de consulta (ícono de criterios y tabla), con datos de muestra.
 */
@Component({
  selector: 'ui-kit-ejemplos-fundamentos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, DividerComponent, IconComponent, ReadonlyFieldComponent, TooltipDirective],
  template: `
    @switch (selector) {
      @case ('siaf-icon') {
        <div class="flex flex-wrap items-center gap-4 text-text">
          @for (icono of iconos; track icono) {
            <siaf-icon [name]="icono" [size]="24" />
          }
          <siaf-icon name="star" variant="outlined" [size]="32" />
          <siaf-icon name="favorite" variant="round" [size]="32" />
        </div>
      }
      @case ('siaf-divider') {
        <div class="grid gap-6 sm:grid-cols-3">
          @for (tipo of variantesDivider; track tipo) {
            <div class="min-w-0">
              <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ tipo }}</p>
              <div class="overflow-hidden rounded-siaf-md border border-border bg-surface text-sm text-text">
                <p class="m-0 px-4 py-3">Cuenta 1101.01 · Caja M/N</p>
                <siaf-divider [variant]="tipo" />
                <p class="m-0 px-4 py-3">Cuenta 1101.02 · Caja M/E</p>
              </div>
            </div>
          }
        </div>
        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Vertical</p>
        <div class="flex h-14 items-center gap-4 text-sm text-text">
          <span>Izquierda</span>
          <siaf-divider orientation="vertical" />
          <span>Centro</span>
          <siaf-divider orientation="vertical" variant="middle-inset" />
          <span>Derecha</span>
        </div>
      }
      @case ('[siafTooltip]') {
        <div class="grid gap-6 pt-8 text-sm text-text sm:grid-cols-2">
          <div class="max-w-[240px]">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Texto truncado</p>
            <p class="truncate" siafTooltip>Dirección General de Contabilidad Pública — Ministerio de Economía y Finanzas</p>
            <p class="mt-2 text-xs text-text-muted">Sin texto: aparece solo si el contenido está cortado.</p>
          </div>
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Ayuda contextual</p>
            <div class="flex items-center gap-4">
              <siaf-button variant="secondary" siafTooltip="Guarda el documento sin enviarlo">Grabar</siaf-button>
              <span class="inline-flex text-text-muted" siafTooltip="Criterios de búsqueda ingresados" aria-label="Criterios de búsqueda ingresados" tabindex="0">
                <siaf-icon name="info" [size]="18" />
              </span>
            </div>
            <p class="mt-2 text-xs text-text-muted">Con texto: aparece siempre al pasar el puntero o al enfocar.</p>
          </div>
        </div>

        <p class="mb-2 mt-8 text-[11px] font-bold uppercase tracking-widest text-text-muted">Uso en consultas</p>
        <section class="flex flex-col gap-siaf-lg rounded-siaf-md border border-border bg-surface p-siaf-lg">
          <div class="flex flex-col gap-siaf-md">
            <div class="flex items-center gap-siaf-xs">
              <h3 class="m-0 text-sm font-bold uppercase tracking-wide text-[var(--sys-color-text-neutral-medium)]">Datos de plan contable</h3>
              <span
                class="inline-flex size-5 cursor-help items-center justify-center text-[var(--sys-color-text-neutral-low)]"
                siafTooltip="Criterios de búsqueda ingresados"
                aria-label="Criterios de búsqueda ingresados"
                tabindex="0"
              >
                <siaf-icon name="info" [size]="18" />
              </span>
            </div>
            <div class="grid gap-siaf-md sm:grid-cols-2 lg:grid-cols-4">
              @for (criterio of criteriosConsulta; track criterio.caption) {
                <readonly-field [caption]="criterio.caption" [value]="criterio.value" />
              }
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] table-fixed border-collapse text-left text-sm">
              <thead>
                <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                  <th class="w-[120px] rounded-l-siaf-sm px-siaf-md py-siaf-sm">Código</th>
                  <th class="px-siaf-md py-siaf-sm">Nombre</th>
                  <th class="w-[120px] px-siaf-md py-siaf-sm">Naturaleza</th>
                  <th class="w-[100px] rounded-r-siaf-sm px-siaf-md py-siaf-sm">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (cuenta of cuentasConsulta; track cuenta.codigo) {
                  <tr class="h-12 border-b border-[var(--sys-color-divider-default)]">
                    <td class="px-siaf-md py-siaf-sm font-medium text-text">{{ cuenta.codigo }}</td>
                    <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">
                      <span class="block truncate" siafTooltip>{{ cuenta.nombre }}</span>
                    </td>
                    <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ cuenta.naturaleza }}</td>
                    <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ cuenta.estado }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
        <p class="mt-2 text-xs text-text-muted">
          El ícono de criterios lleva texto, <code class="font-mono">aria-label</code> y <code class="font-mono">tabindex="0"</code> para
          abrirse también con el teclado. En la tabla, el nombre cortado muestra el texto completo.
        </p>
      }
    }
  `,
})
export class EjemplosFundamentosComponent {
  static readonly selectores = ['siaf-icon', 'siaf-divider', '[siafTooltip]'];
  @Input({ required: true }) selector!: string;

  readonly variantesDivider: DividerVariant[] = ['full-width', 'inset', 'middle-inset'];

  readonly iconos = ['home', 'search', 'add', 'edit', 'delete', 'filter_list', 'description', 'check_circle', 'warning'];

  readonly criteriosConsulta = [
    { caption: 'Plan contable', value: 'Plan Contable Gubernamental 2026' },
    { caption: 'Naturaleza', value: 'Deudora' },
    { caption: 'Tipo de elemento', value: 'Activo' },
    { caption: 'Estado de vigencia', value: 'Vigente' },
  ];

  readonly cuentasConsulta = [
    { codigo: '1101.01', nombre: 'Caja M/N', naturaleza: 'Deudora', estado: 'Vigente' },
    { codigo: '1101.0301', nombre: 'Depósitos en cuentas corrientes en instituciones financieras — recursos ordinarios', naturaleza: 'Deudora', estado: 'Vigente' },
    { codigo: '1205.9801', nombre: 'Otras cuentas por cobrar diversas — anticipos a proveedores y contratistas pendientes de rendición', naturaleza: 'Deudora', estado: 'Vigente' },
  ];
}
