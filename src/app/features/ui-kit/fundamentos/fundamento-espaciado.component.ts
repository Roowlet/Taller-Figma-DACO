import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { UiKitCopiarComponent } from './ui-kit-copiar.component';

/** Espaciado: escala base de gap y padding, y los espaciados de contenedores del Figma. */
@Component({
  selector: 'siaf-ui-kit-fundamento-espaciado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiKitCopiarComponent],
  template: `
    <p class="mb-3 text-xs text-text-muted">
      Las utilidades <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">*-siaf-*</code> de Tailwind usan la escala de gap:
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">p-siaf-md</code>, <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">gap-siaf-md</code>,
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">mt-siaf-md</code>… Las dos escalas coinciden salvo en xxl.
    </p>
    <div class="overflow-x-auto rounded-siaf-md border border-border">
      <table class="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr class="border-b border-border text-[11px] font-bold uppercase tracking-widest text-text-muted">
            <th class="px-3 py-2 font-bold">Escala</th>
            <th class="px-3 py-2 font-bold">Muestra</th>
            <th class="px-3 py-2 font-bold">Utilidad</th>
            <th class="px-3 py-2 font-bold">Gap</th>
            <th class="px-3 py-2 font-bold">Padding</th>
          </tr>
        </thead>
        <tbody>
          @for (g of espaciado.gap; track g.token; let i = $index) {
            <tr class="border-b border-border last:border-b-0" [attr.data-escala]="g.escala">
              <td class="px-3 py-2 font-mono text-[12px] font-semibold text-text">{{ g.escala }}</td>
              <td class="px-3 py-2">
                <span class="block h-3 rounded-siaf-sm bg-brand-primary" [style.width]="'var(' + g.token + ')'" [attr.title]="g.escritorio"></span>
              </td>
              <td class="px-3 py-2">
                @for (u of g.utilidades; track u) {
                  <siaf-ui-kit-copiar [envolver]="false" [texto]="u" [copia]="u.replace('*', 'p')" />
                }
              </td>
              <td class="px-3 py-2">
                <siaf-ui-kit-copiar [envolver]="false" [texto]="g.token" [copia]="'var(' + g.token + ')'" />
                <span class="px-1 font-mono text-[12px] text-text-muted">{{ g.escritorio }}</span>
              </td>
              <td class="px-3 py-2">
                @if (espaciado.padding[i]; as p) {
                  <siaf-ui-kit-copiar [envolver]="false" [texto]="p.token" [copia]="'var(' + p.token + ')'" />
                  <span class="px-1 font-mono text-[12px]" [class.text-text-muted]="p.escritorio === g.escritorio" [class.font-semibold]="p.escritorio !== g.escritorio">{{ p.escritorio }}</span>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <h4 class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Contenedores del Figma</h4>
    <p class="mb-3 text-xs text-text-muted">
      Espaciados con nombre de uso (contenedor, cabecera y cuerpo de contenido, fila, sección). Todavía no tienen alias
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">--sys-*</code>: si una pantalla los necesita, se agrega el alias en styles.css.
    </p>
    <div class="overflow-x-auto rounded-siaf-md border border-border">
      <table class="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr class="border-b border-border text-[11px] font-bold uppercase tracking-widest text-text-muted">
            <th class="px-3 py-2 font-bold">Token del Figma</th>
            <th class="px-3 py-2 text-right font-bold">Escritorio</th>
            <th class="px-3 py-2 text-right font-bold">Tablet</th>
            <th class="px-3 py-2 text-right font-bold">Móvil</th>
          </tr>
        </thead>
        <tbody>
          @for (c of espaciado.contenedores; track c.token) {
            <tr class="border-b border-border last:border-b-0">
              <td class="px-3 py-2"><siaf-ui-kit-copiar [envolver]="false" [texto]="c.escala" [copia]="'var(' + c.token + ')'" /></td>
              <td class="px-3 py-2 text-right font-mono text-[12px] text-text">{{ c.escritorio }}</td>
              <td class="px-3 py-2 text-right font-mono text-[12px]" [class.text-text-muted]="c.tablet === c.escritorio" [class.font-semibold]="c.tablet !== c.escritorio">{{ c.tablet }}</td>
              <td class="px-3 py-2 text-right font-mono text-[12px]" [class.text-text-muted]="c.movil === c.escritorio" [class.font-semibold]="c.movil !== c.escritorio">{{ c.movil }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class FundamentoEspaciadoComponent {
  readonly espaciado = FUNDAMENTOS_UI_KIT.espaciado;
}
