import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { UiKitCopiarComponent } from './ui-kit-copiar.component';

/** Radios de esquina y grosores de borde. */
@Component({
  selector: 'siaf-ui-kit-fundamento-radios-bordes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiKitCopiarComponent],
  template: `
    <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Radios</h4>
    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      @for (r of radios; track r.token) {
        <li class="min-w-0 rounded-siaf-md border border-border p-3" [attr.data-radio]="r.escala">
          <div class="mb-2 h-16 border-2 border-brand-primary bg-[var(--sys-color-bg-surfaces-surface-low)]" [style.border-radius]="'var(' + r.token + ')'"></div>
          <p class="px-1 font-mono text-[12px] font-semibold text-text">{{ r.escala }} · {{ r.escritorio }}</p>
          @for (u of r.utilidades; track u) {
            <siaf-ui-kit-copiar class="block" [texto]="u" />
          }
          <siaf-ui-kit-copiar class="block" [texto]="r.token" [copia]="'var(' + r.token + ')'" />
        </li>
      }
    </ul>

    <h4 class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Bordes</h4>
    <ul class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      @for (b of bordes; track b.token) {
        <li class="min-w-0 rounded-siaf-md border border-border p-3" [attr.data-borde]="b.escala">
          <div class="mb-3 mt-2 border-solid border-brand-primary" [style.border-top-width]="b.escritorio"></div>
          <p class="px-1 font-mono text-[12px] font-semibold text-text">{{ b.escala }} · {{ b.escritorio }}</p>
          <siaf-ui-kit-copiar class="block" [texto]="b.token" [copia]="'var(' + b.token + ')'" />
        </li>
      }
    </ul>
  `,
})
export class FundamentoRadiosBordesComponent {
  readonly radios = FUNDAMENTOS_UI_KIT.radios;
  readonly bordes = FUNDAMENTOS_UI_KIT.bordes;
}
