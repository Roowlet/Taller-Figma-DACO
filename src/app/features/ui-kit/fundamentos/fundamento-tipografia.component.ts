import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { UiKitCopiarComponent } from './ui-kit-copiar.component';

/** Tipografía: familia, escala de tamaños por pantalla, pesos e interlineados. */
@Component({
  selector: 'siaf-ui-kit-fundamento-tipografia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiKitCopiarComponent],
  template: `
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-siaf-md border border-border p-4">
        <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Familia</h4>
        <p class="text-4xl font-semibold leading-tight text-text">Aa Bb Cc 0123</p>
        <siaf-ui-kit-copiar class="mt-2 block" texto="--sys-typography-font-family-base" copia="var(--sys-typography-font-family-base)" />
        <p class="px-1 font-mono text-[11px] text-text-muted">{{ tipografia.familia }}</p>
      </div>
      <div class="rounded-siaf-md border border-border p-4">
        <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Pesos</h4>
        <ul class="space-y-1">
          @for (p of tipografia.pesos; track p.token) {
            <li class="flex flex-wrap items-baseline justify-between gap-2" [attr.data-peso]="p.valor">
              <span class="text-lg text-text" [style.font-weight]="p.valor">{{ p.nombre }} · {{ p.valor }}</span>
              <siaf-ui-kit-copiar [texto]="p.token" [copia]="'var(' + p.token + ')'" />
            </li>
          }
        </ul>
      </div>
    </div>

    <h4 class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Escala de tamaños</h4>
    <p class="mb-3 text-xs text-text-muted">
      La muestra usa el tamaño de la pantalla actual. Escritorio: más de 1023 px; tablet: hasta 1023 px; móvil: hasta 767 px.
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">text-sm</code> (14 px) equivale a Body 2 y
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">text-xs</code> (12 px) a Caption 1.
    </p>
    <div class="overflow-x-auto rounded-siaf-md border border-border">
      <table class="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr class="border-b border-border text-[11px] font-bold uppercase tracking-widest text-text-muted">
            <th class="px-3 py-2 font-bold">Rol y muestra</th>
            <th class="px-3 py-2 font-bold">Token</th>
            <th class="px-3 py-2 text-right font-bold">Escritorio</th>
            <th class="px-3 py-2 text-right font-bold">Tablet</th>
            <th class="px-3 py-2 text-right font-bold">Móvil</th>
          </tr>
        </thead>
        <tbody>
          @for (t of tipografia.tamanos; track t.token) {
            <tr class="border-b border-border last:border-b-0" [attr.data-tamano]="t.token">
              <td class="px-3 py-2">
                <span class="block truncate leading-tight text-text" [style.font-size]="'var(' + t.token + ')'">{{ t.rol }}</span>
              </td>
              <td class="px-3 py-2"><siaf-ui-kit-copiar [envolver]="false" [texto]="t.token" [copia]="'var(' + t.token + ')'" /></td>
              <td class="px-3 py-2 text-right font-mono text-[12px] text-text">{{ t.escritorio }}</td>
              <td class="px-3 py-2 text-right font-mono text-[12px] text-text-muted">{{ t.tablet }}</td>
              <td class="px-3 py-2 text-right font-mono text-[12px] text-text-muted">{{ t.movil }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      <div class="rounded-siaf-md border border-border p-4">
        <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Interlineados</h4>
        <ul class="space-y-3">
          @for (l of tipografia.interlineados; track l.token) {
            <li>
              <p class="text-sm text-text" [style.line-height]="l.valor">{{ l.nombre }} · {{ l.valor }}: la línea siguiente muestra la separación entre renglones de un párrafo largo.</p>
              <siaf-ui-kit-copiar [texto]="l.token" [copia]="'var(' + l.token + ')'" />
            </li>
          }
        </ul>
      </div>
      <div class="rounded-siaf-md border border-border p-4">
        <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Monoespaciada</h4>
        <p class="text-base text-text" [style.font-family]="'var(--sys-typography-font-family-monospace)'">PPC-SPC-0001-2026-MEF-DGCP</p>
        <siaf-ui-kit-copiar class="mt-2 block" texto="--sys-typography-font-family-monospace" copia="var(--sys-typography-font-family-monospace)" />
        <p class="px-1 font-mono text-[11px] text-text-muted">{{ tipografia.monospace }}</p>
      </div>
    </div>
  `,
})
export class FundamentoTipografiaComponent {
  readonly tipografia = FUNDAMENTOS_UI_KIT.tipografia;
}
