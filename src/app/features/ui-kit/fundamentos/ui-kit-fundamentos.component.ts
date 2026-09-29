import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FundamentoColorComponent } from './fundamento-color.component';
import { FundamentoEspaciadoComponent } from './fundamento-espaciado.component';
import { FundamentoIconosComponent } from './fundamento-iconos.component';
import { FundamentoRadiosBordesComponent } from './fundamento-radios-bordes.component';
import { FundamentoRevisionComponent } from './fundamento-revision.component';
import { FundamentoSombrasComponent } from './fundamento-sombras.component';
import { FundamentoTipografiaComponent } from './fundamento-tipografia.component';
import { SeccionFundamento } from './secciones';

/**
 * Fundamentos visuales del catálogo: una tarjeta por sección con su ancla (#color, #tipografia…).
 * Los datos salen de los tokens reales (`ui-kit.fundamentos.ts`, generado por `npm run ui-kit:manifest`).
 */
@Component({
  selector: 'siaf-ui-kit-fundamentos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FundamentoColorComponent,
    FundamentoEspaciadoComponent,
    FundamentoIconosComponent,
    FundamentoRadiosBordesComponent,
    FundamentoRevisionComponent,
    FundamentoSombrasComponent,
    FundamentoTipografiaComponent,
  ],
  template: `
    <div class="space-y-8">
      @for (s of secciones; track s.id) {
        <!-- scroll-margin = barras fijas del catálogo + 48 px, como las fichas: el índice sigue esta sección. -->
        <article class="scroll-mt-42 rounded-siaf-lg border border-border bg-surface shadow-siaf-sm lg:scroll-mt-28" [id]="s.id" data-fundamento data-seccion>
          <header class="border-b border-border px-6 py-5">
            <h3 class="text-base font-semibold text-text">{{ s.titulo }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-text-muted">{{ s.descripcion }}</p>
          </header>
          <div class="min-w-0 p-6">
            @switch (s.id) {
              @case ('color') {
                <siaf-ui-kit-fundamento-color />
              }
              @case ('tipografia') {
                <siaf-ui-kit-fundamento-tipografia />
              }
              @case ('espaciado') {
                <siaf-ui-kit-fundamento-espaciado />
              }
              @case ('radios-y-bordes') {
                <siaf-ui-kit-fundamento-radios-bordes />
              }
              @case ('sombras') {
                <siaf-ui-kit-fundamento-sombras />
              }
              @case ('iconos') {
                <siaf-ui-kit-fundamento-iconos />
              }
              @case ('revision-de-tokens') {
                <siaf-ui-kit-fundamento-revision />
              }
            }
          </div>
        </article>
      }
    </div>
  `,
})
export class UiKitFundamentosComponent {
  @Input({ required: true }) secciones: readonly SeccionFundamento[] = [];
}
