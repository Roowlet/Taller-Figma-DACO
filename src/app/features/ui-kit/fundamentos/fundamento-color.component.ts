import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { ButtonGroupItem, ButtonsGroupComponent } from '../../../shared/ui/buttons-group/buttons-group.component';
import { ExpansionPanelComponent } from '../../../shared/ui/expansion-panel/expansion-panel.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';
import { TooltipDirective } from '../../../shared/ui/tooltip/tooltip.directive';
import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { GrupoColor } from '../ui-kit.model';
import { UiKitCopiarComponent } from './ui-kit-copiar.component';

type FiltroColor = 'todos' | 'sin-oscuro' | 'fuera-de-figma';

/** Color: tokens semánticos con su valor claro y oscuro, y la paleta tonal de la que salen. */
@Component({
  selector: 'siaf-ui-kit-fundamento-color',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonsGroupComponent, ExpansionPanelComponent, IconComponent, TextFieldComponent, TooltipDirective, UiKitCopiarComponent],
  template: `
    <div class="mb-4 flex flex-col gap-3">
      <div class="w-full md:max-w-sm">
        <siaf-input label="Filtrar tokens de color" leadingIcon="search" [clearable]="true" [autoSuccess]="false" [value]="busqueda()" (valueChange)="busqueda.set('' + $event)" />
      </div>
      <!-- pr-px: el grupo solapa los bordes con margen negativo y sin ese píxel asomaría una barra de desplazamiento. -->
      <div class="min-w-0 overflow-x-auto pr-px">
        <siaf-buttons-group [items]="filtros" [value]="filtro()" (valueChange)="filtro.set($any($event))" />
      </div>
    </div>
    <p class="mb-4 text-xs text-text-muted" data-color-total>
      {{ total() }} de {{ totalTokens }} tokens · la muestra izquierda es el tema claro y la derecha el oscuro. Al pulsar un nombre se copia su
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">var()</code>.
    </p>

    <div class="space-y-6">
      @for (grupo of grupos(); track grupo.id) {
        <section [attr.data-grupo-color]="grupo.id">
          <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">
            {{ grupo.titulo }} <span class="font-normal">· {{ grupo.tokens.length }}</span>
          </h4>
          <ul class="grid gap-x-4 xl:grid-cols-2">
            @for (t of grupo.tokens; track t.nombre) {
              <li class="flex min-w-0 items-start gap-3 border-b border-border py-2" [attr.data-token]="t.nombre">
                <div class="grid shrink-0 grid-cols-2 overflow-hidden rounded-siaf-sm border border-border">
                  @for (muestra of [{ tema: 'Claro', valor: t.claro, fondo: superficie.claro }, { tema: 'Oscuro', valor: t.oscuro, fondo: superficie.oscuro }]; track muestra.tema) {
                    <!-- Cada muestra va sobre la superficie de su tema: los colores con alfa se ven como en ese tema. -->
                    <div class="ui-kit-damero size-9" [attr.data-muestra]="muestra.tema" [style.background-color]="muestra.fondo">
                      @if (muestra.valor) {
                        <div class="size-full" [style.background-color]="muestra.valor" [attr.title]="muestra.tema + ': ' + muestra.valor"></div>
                      }
                    </div>
                  }
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-x-1">
                    <siaf-ui-kit-copiar [texto]="t.nombre" [copia]="'var(' + t.nombre + ')'" />
                    @if (t.sinOscuro) {
                      <span class="inline-flex text-[var(--sys-color-icon-feedback-light-warning)]" data-indicador="igual-en-oscuro" siafTooltip="Igual en oscuro: el tema oscuro no lo cambia" tabindex="0" aria-label="Igual en oscuro">
                        <siaf-icon name="dark_mode" [size]="16" />
                      </span>
                    }
                    @if (t.soloOscuro) {
                      <span class="inline-flex text-[var(--sys-color-icon-feedback-light-info)]" data-indicador="solo-en-oscuro" siafTooltip="Solo en oscuro: en claro depende del respaldo del var()" tabindex="0" aria-label="Solo en oscuro">
                        <siaf-icon name="nightlight" [size]="16" />
                      </span>
                    }
                    @if (t.manual) {
                      <span class="inline-flex text-text-muted" data-indicador="fuera-de-figma" siafTooltip="Fuera de Figma: definido a mano en los CSS del proyecto" tabindex="0" aria-label="Fuera de Figma">
                        <siaf-icon name="edit_note" [size]="16" />
                      </span>
                    }
                  </div>
                  <p class="flex flex-wrap gap-x-3 px-1 font-mono text-[11px] text-text-muted">
                    <span>{{ t.claro ?? '—' }}</span>
                    <span>{{ t.oscuro ?? '—' }}</span>
                    @for (u of t.utilidades; track u) {
                      <siaf-ui-kit-copiar class="-my-0.5" [texto]="u" />
                    }
                  </p>
                </div>
              </li>
            }
          </ul>
        </section>
      } @empty {
        <p class="text-sm text-text-muted">Ningún token coincide con el filtro.</p>
      }
    </div>

    <div class="mt-8">
      <siaf-expansion-panel [title]="'Paleta tonal · ' + paleta.length + ' familias'">
        <p class="mb-4 text-sm text-text-muted">
          La fuente de los tokens semánticos, tal como sale del Figma. No cambia con el tema: en los componentes se usa el token semántico, nunca el tono directo.
        </p>
        <div class="space-y-3">
          @for (familia of paleta; track familia.familia) {
            <div class="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)] md:items-center" [attr.data-familia]="familia.familia">
              <p class="font-mono text-[12px] font-semibold text-text">{{ familia.familia }}</p>
              <div class="grid grid-cols-5 gap-1 sm:grid-cols-10">
                @for (tono of familia.tonos; track tono.variable) {
                  <button
                    class="ui-kit-damero group overflow-hidden rounded-siaf-sm border border-border text-left"
                    type="button"
                    [attr.aria-label]="'Copiar ' + tono.variable + ' (' + tono.valor + ')'"
                    [attr.title]="tono.variable + ' · ' + tono.valor"
                    (click)="copiarTono(tono.variable)"
                  >
                    <span class="block h-8" [style.background-color]="tono.valor"></span>
                    <span class="block bg-surface px-1 py-0.5 font-mono text-[10px] leading-[normal] text-text-muted">{{ tono.tono }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </siaf-expansion-panel>
    </div>
  `,
  styles: `
    /* Damero bajo la muestra: deja ver la transparencia de los colores con alfa. */
    .ui-kit-damero {
      background-color: var(--sys-color-bg-surfaces-surface);
      background-image:
        linear-gradient(45deg, var(--sys-color-divider-default) 25%, transparent 25%),
        linear-gradient(-45deg, var(--sys-color-divider-default) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, var(--sys-color-divider-default) 75%),
        linear-gradient(-45deg, transparent 75%, var(--sys-color-divider-default) 75%);
      background-size: 12px 12px;
      background-position: 0 0, 0 6px, 6px -6px, -6px 0;
    }
  `,
})
export class FundamentoColorComponent {
  readonly paleta = FUNDAMENTOS_UI_KIT.paleta;
  readonly superficie = FUNDAMENTOS_UI_KIT.superficie;
  readonly totalTokens = FUNDAMENTOS_UI_KIT.colores.reduce((n, g) => n + g.tokens.length, 0);

  readonly busqueda = signal('');
  readonly filtro = signal<FiltroColor>('todos');
  readonly filtros: ButtonGroupItem[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Igual en oscuro', value: 'sin-oscuro' },
    { label: 'Fuera de Figma', value: 'fuera-de-figma' },
  ];

  readonly grupos = computed<GrupoColor[]>(() => {
    const q = this.busqueda().trim().toLowerCase();
    const filtro = this.filtro();
    return FUNDAMENTOS_UI_KIT.colores
      .map((g) => ({
        ...g,
        tokens: g.tokens.filter(
          (t) =>
            (!q || t.nombre.includes(q) || t.utilidades.some((u) => u.includes(q)) || `${t.claro} ${t.oscuro}`.toLowerCase().includes(q)) &&
            (filtro === 'todos' || (filtro === 'sin-oscuro' ? t.sinOscuro : t.manual)),
        ),
      }))
      .filter((g) => g.tokens.length);
  });
  readonly total = computed(() => this.grupos().reduce((n, g) => n + g.tokens.length, 0));

  copiarTono(variable: string): void {
    navigator.clipboard?.writeText(`var(${variable})`).catch(() => undefined);
  }
}
