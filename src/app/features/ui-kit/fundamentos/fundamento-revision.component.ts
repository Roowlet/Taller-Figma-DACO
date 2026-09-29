import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AlertComponent } from '../../../shared/ui/alert/alert.component';
import { StatusTagComponent } from '../../../shared/ui/status-tag/status-tag.component';
import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { UiKitCopiarComponent } from './ui-kit-copiar.component';

/** Revisión de tokens: variables usadas que no existen y colores que el tema oscuro no cambia. */
@Component({
  selector: 'siaf-ui-kit-fundamento-revision',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, StatusTagComponent, UiKitCopiarComponent],
  template: `
    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      @for (dato of resumen; track dato.etiqueta) {
        <div class="rounded-siaf-md border border-border px-4 py-2">
          <p class="text-xl font-bold text-text">{{ dato.valor }}</p>
          <p class="text-xs text-text-muted">{{ dato.etiqueta }}</p>
        </div>
      }
    </div>

    <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Variables usadas sin definir</h4>
    @if (sinDefinir.length) {
      <siaf-alert
        class="mb-3 block"
        tone="warning"
        title="Estas variables no existen en ningún CSS"
        description="Donde el var() no trae respaldo, la propiedad queda sin valor (por ejemplo, un texto sin color propio). Hay que reemplazarlas por el token que corresponda."
      />
      <ul class="divide-y divide-border rounded-siaf-md border border-border">
        @for (v of sinDefinir; track v.nombre) {
          <li class="px-3 py-2" [attr.data-sin-definir]="v.nombre">
            <div class="flex flex-wrap items-center gap-2">
              <siaf-ui-kit-copiar [texto]="v.nombre" />
              <span class="text-xs text-text-muted">{{ v.archivos.length }} {{ v.archivos.length === 1 ? 'archivo' : 'archivos' }}</span>
              @if (v.sinRespaldo) {
                <siaf-status-tag tone="danger" icon="error_outline">Sin respaldo</siaf-status-tag>
              }
            </div>
            <ul class="mt-1 space-y-0.5 pl-1">
              @for (archivo of v.archivos; track archivo) {
                <li class="truncate font-mono text-[11px] text-text-muted" [attr.title]="archivo">{{ archivo }}</li>
              }
            </ul>
          </li>
        }
      </ul>
    } @else {
      <p class="text-sm text-text-muted">Todas las variables --sys-* que usa la app están definidas.</p>
    }

    <p class="mt-4 text-xs text-text-muted">
      Los colores que el tema oscuro no cambia se ven con el filtro «Igual en oscuro» de la sección Color. Algunos son a propósito (el blanco de
      marca, las capas sobre marca); los que pintan fondos o textos sobre la superficie conviene revisarlos.
    </p>
  `,
})
export class FundamentoRevisionComponent {
  readonly sinDefinir = FUNDAMENTOS_UI_KIT.sinDefinir;
  private readonly colores = FUNDAMENTOS_UI_KIT.colores.flatMap((g) => g.tokens);
  readonly resumen = [
    { valor: this.sinDefinir.length, etiqueta: 'variables usadas sin definir' },
    { valor: this.colores.filter((t) => t.sinOscuro).length, etiqueta: 'colores iguales en tema oscuro' },
    { valor: this.colores.filter((t) => t.manual).length, etiqueta: 'colores definidos fuera de Figma' },
  ];
}
