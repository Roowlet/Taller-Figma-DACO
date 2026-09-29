import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StatusTagComponent } from '../../../shared/ui/status-tag/status-tag.component';
import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { UiKitCopiarComponent } from './ui-kit-copiar.component';

/** Sombras: cada elevación sobre la superficie del tema claro y del oscuro. */
@Component({
  selector: 'siaf-ui-kit-fundamento-sombras',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusTagComponent, UiKitCopiarComponent],
  template: `
    <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      @for (s of sombras; track s.token) {
        <li class="min-w-0 overflow-hidden rounded-siaf-md border border-border" [attr.data-sombra]="s.nombre">
          <div class="grid grid-cols-2">
            <div class="flex h-24 items-center justify-center" [style.background-color]="superficie.claro">
              <span class="block size-12 rounded-siaf-md" [style.background-color]="superficie.claro" [style.box-shadow]="s.claro"></span>
            </div>
            <div class="flex h-24 items-center justify-center" [style.background-color]="superficie.oscuro">
              <span class="block size-12 rounded-siaf-md" [style.background-color]="superficie.oscuro" [style.box-shadow]="s.oscuro ?? s.claro"></span>
            </div>
          </div>
          <div class="space-y-1 px-2 py-2">
            <p class="px-1 font-mono text-[12px] font-semibold text-text">{{ s.nombre }}</p>
            @for (u of s.utilidades; track u) {
              <siaf-ui-kit-copiar class="block" [texto]="u" />
            }
            <siaf-ui-kit-copiar class="block" [texto]="s.token" [copia]="'var(' + s.token + ')'" />
            @if (!s.oscuro) {
              <siaf-status-tag tone="warning" icon="dark_mode">Igual en oscuro</siaf-status-tag>
            }
          </div>
        </li>
      }
    </ul>
  `,
})
export class FundamentoSombrasComponent {
  readonly sombras = FUNDAMENTOS_UI_KIT.sombras;
  readonly superficie = FUNDAMENTOS_UI_KIT.superficie;
}
