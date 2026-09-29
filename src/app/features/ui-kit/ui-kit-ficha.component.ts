import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Input, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MessageBoxComponent } from '../../shared/ui/message-box/message-box.component';
import { StatusTagComponent } from '../../shared/ui/status-tag/status-tag.component';
import { TabItem, TabsComponent } from '../../shared/ui/tabs/tabs.component';
import { TemaApp } from '../../shared/utils/tema.util';
import { UiKitCopiarComponent } from './fundamentos/ui-kit-copiar.component';
import { UiKitMarcoComponent } from './ui-kit-marco.component';
import { FichaVista } from './ui-kit.vista';

/** Cuántas entradas se muestran antes de "Ver todas". */
const ENTRADAS_VISIBLES = 6;

const CAPA: Record<FichaVista['capa'], string> = {
  ui: 'Design system',
  components: 'Transversal',
  layout: 'Armazón',
};

export type PestanaFicha = 'uso' | 'desarrollo' | 'especificaciones' | 'accesibilidad';

const PESTANAS: TabItem[] = [
  { id: 'uso', label: 'Uso' },
  { id: 'desarrollo', label: 'Desarrollo' },
  { id: 'especificaciones', label: 'Especificaciones' },
  { id: 'accesibilidad', label: 'Accesibilidad' },
];

/**
 * Ficha de un componente en el catálogo, con pestañas como en Lightning:
 * - **Uso**: cuándo usarlo y cuándo no (`@usar` / `@evitar` del JSDoc) y el ejemplo en vivo.
 * - **Desarrollo**: fragmento de uso, entradas y eventos.
 * - **Especificaciones**: nodos del Figma (`@figma`), componentes que pinta por dentro y los que lo usan (la composición
 *   en los dos sentidos), y tokens que usa, con su valor.
 * - **Accesibilidad**: roles y atributos ARIA de la plantilla, teclado (`@teclado`) y notas (`@accesibilidad`).
 */
@Component({
  selector: 'siaf-ui-kit-ficha',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, MessageBoxComponent, NgComponentOutlet, NgTemplateOutlet, StatusTagComponent, TabsComponent, UiKitCopiarComponent, UiKitMarcoComponent],
  template: `
    <!-- En una sola línea: los saltos de la plantilla dejarían un espacio antes de la puntuación que sigue a un código. -->
    <!-- Un código que nombra otra ficha es un enlace a ella (el catálogo lo desplaza sin salir de /ui-kit). -->
    <ng-template #texto let-segmentos>@for (s of segmentos; track $index) {@switch (s.tipo) {@case ('codigo') {@if (s.enlace) {<a class="rounded-siaf-sm text-[var(--sys-color-text-brand-primary)] underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]" [href]="'#' + s.enlace" data-enlace-ficha><code class="rounded-siaf-sm bg-surface-muted px-1 py-0.5 font-mono text-[12px] [overflow-wrap:anywhere]">{{ s.texto }}</code></a>} @else {<code class="rounded-siaf-sm bg-surface-muted px-1 py-0.5 font-mono text-[12px] text-text [overflow-wrap:anywhere]">{{ s.texto }}</code>}} @case ('negrita') {<strong class="font-semibold text-text">{{ s.texto }}</strong>} @default {<ng-container>{{ s.texto }}</ng-container>}}}</ng-template>
    <ng-template #bloquesTpl let-bloques>
      <div class="space-y-2 text-sm leading-relaxed text-text-muted">
        @for (bloque of bloques; track $index) {
          @switch (bloque.tipo) {
            @case ('parrafo') {
              <p><ng-container *ngTemplateOutlet="texto; context: { $implicit: bloque.segmentos }" /></p>
            }
            @case ('lista') {
              <ul class="space-y-1 pl-5" [class.list-decimal]="bloque.ordenada" [class.list-disc]="!bloque.ordenada">
                @for (item of bloque.items; track $index) {
                  <li><ng-container *ngTemplateOutlet="texto; context: { $implicit: item }" /></li>
                }
              </ul>
            }
            @case ('codigo') {
              <pre class="overflow-x-auto rounded-siaf-md bg-surface-muted p-3 font-mono text-[12px] leading-relaxed text-text">{{ bloque.texto }}</pre>
            }
          }
        }
      </div>
    </ng-template>
    <ng-template #titulo let-texto let-cantidad="cantidad">
      <h4 class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">
        {{ texto }}@if (cantidad !== undefined) {<span class="font-normal"> · {{ cantidad }}</span>}
      </h4>
    </ng-template>

    @let f = ficha();
    <!-- scroll-margin = barras fijas + 48 px (encabezado; en móvil, también la franja): el índice sigue esta sección. -->
    <article class="scroll-mt-42 rounded-siaf-lg border border-border bg-surface shadow-siaf-sm lg:scroll-mt-28" [id]="f.id" data-seccion>
      <header class="px-6 pt-6">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-mono text-base font-semibold text-text">{{ f.nombre }}</h3>
          <siaf-status-tag>{{ capa() }}</siaf-status-tag>
          @if (f.tipo === 'directiva') {
            <siaf-status-tag tone="info">Directiva</siaf-status-tag>
          }
          @if (f.usaSesion) {
            <siaf-status-tag tone="info" icon="lock">Requiere sesión</siaf-status-tag>
          }
          @if (f.usaSesion && f.ejemplo) {
            <siaf-status-tag icon="science">Ejemplo con datos de muestra</siaf-status-tag>
          }
          @if (f.sinUso) {
            <siaf-status-tag tone="warning" icon="block">Sin uso en la app</siaf-status-tag>
          }
        </div>
        @if (f.nombre !== f.selector) {
          <p class="mt-2 text-xs text-text-muted">
            Se usa como atributo sobre cualquier elemento. Su selector en el código es
            <code class="rounded-siaf-sm bg-surface-muted px-1 py-0.5 font-mono text-[12px] text-text">{{ f.selector }}</code>:
            los corchetes solo declaran que es un atributo y no se escriben.
          </p>
        }
        @if (f.sinUso) {
          <p class="mt-2 text-xs text-text-muted">
            Ninguna pantalla lo usa todavía. Antes de adoptarlo, revisa si su familia ya tiene un componente en uso junto a esta ficha.
          </p>
        }
        <div class="mt-3">
          @if (f.bloques.length) {
            <ng-container *ngTemplateOutlet="bloquesTpl; context: { $implicit: f.bloques }" />
          } @else {
            <p class="text-sm italic text-text-muted">Sin descripción en el código: falta el comentario JSDoc sobre la clase.</p>
          }
        </div>
      </header>

      <siaf-tabs
        class="mt-4 px-6"
        [tabs]="pestanas"
        [border]="false"
        [activeId]="pestana()"
        [idBase]="f.id + '-doc'"
        [ariaLabel]="'Documentación de ' + f.nombre"
        (activeIdChange)="pestana.set($any($event))"
      />

      <div class="p-6" role="tabpanel" [attr.aria-labelledby]="f.id + '-doc-' + pestana()" [attr.data-pestana]="pestana()">
        @switch (pestana()) {
          @case ('uso') {
            <div class="space-y-5">
              @if (f.bloquesUsar.length || f.bloquesEvitar.length) {
                <div class="grid gap-4 md:grid-cols-2">
                  <section class="rounded-siaf-md border border-border p-4" data-ficha-usar>
                    <h4 class="mb-2 flex items-center gap-2 text-sm font-semibold text-text">
                      <siaf-icon class="text-[var(--sys-color-text-feedback-success)]" name="check_circle" [size]="20" />
                      Cuándo usarlo
                    </h4>
                    @if (f.bloquesUsar.length) {
                      <ng-container *ngTemplateOutlet="bloquesTpl; context: { $implicit: f.bloquesUsar }" />
                    } @else {
                      <p class="text-sm italic text-text-muted">Sin documentar (&#64;usar).</p>
                    }
                  </section>
                  <section class="rounded-siaf-md border border-border p-4" data-ficha-evitar>
                    <h4 class="mb-2 flex items-center gap-2 text-sm font-semibold text-text">
                      <siaf-icon class="text-[var(--sys-color-text-feedback-danger)]" name="block" [size]="20" />
                      Cuándo no
                    </h4>
                    @if (f.bloquesEvitar.length) {
                      <ng-container *ngTemplateOutlet="bloquesTpl; context: { $implicit: f.bloquesEvitar }" />
                    } @else {
                      <p class="text-sm italic text-text-muted">Sin documentar (&#64;evitar).</p>
                    }
                  </section>
                </div>
              } @else {
                <message-box text="Todavía no tiene guía de uso. Se documenta en el JSDoc del componente con @usar y @evitar." />
              }

              <section class="min-w-0">
                <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Ejemplo' }" />
                @if (f.ejemplo && f.responsive; as vista) {
                  <div class="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-siaf-md border border-dashed border-border bg-[var(--sys-color-bg-surfaces-surface-low)] p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <siaf-ui-kit-marco etiqueta="Escritorio" [selector]="f.selector" [ancho]="1280" [alto]="vista.altoEscritorio" [tema]="tema()" />
                    <div class="min-w-0">
                      <siaf-ui-kit-marco etiqueta="Móvil" [selector]="f.selector" [ancho]="375" [alto]="vista.altoMovil" [tema]="tema()" />
                    </div>
                  </div>
                  @if (vista.nota) {
                    <p class="mt-2 text-xs text-text-muted">{{ vista.nota }}</p>
                  }
                } @else if (f.ejemplo; as ejemplo) {
                  <div class="rounded-siaf-md border border-dashed border-border bg-[var(--sys-color-bg-surfaces-surface-low)] p-4">
                    <ng-container *ngComponentOutlet="ejemplo; inputs: { selector: f.selector }" />
                  </div>
                } @else {
                  <message-box [text]="f.motivoSinEjemplo ?? ''" />
                }
              </section>
            </div>
          }

          @case ('desarrollo') {
            <div class="grid gap-6 xl:grid-cols-2">
              <div class="min-w-0 space-y-5">
                <section>
                  <div class="mb-2 flex items-center justify-between">
                    <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Código' }" />
                    <siaf-button
                      variant="ghost"
                      size="sm"
                      [icon]="copiado() ? 'check' : 'content_copy'"
                      [iconOnly]="true"
                      [ariaLabel]="copiado() ? 'Copiado' : 'Copiar el fragmento de uso'"
                      (click)="copiar()"
                    />
                  </div>
                  <pre class="overflow-x-auto rounded-siaf-md bg-surface-muted p-3 font-mono text-[12px] leading-relaxed text-text"><code>{{ f.snippetImport }}
{{ f.snippetUso }}</code></pre>
                  <p class="mt-1 truncate font-mono text-[11px] text-text-muted" [title]="f.archivo">{{ f.archivo }}</p>
                </section>

                @if (f.eventos.length) {
                  <section>
                    <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Eventos', cantidad: f.eventos.length }" />
                    <ul class="divide-y divide-border rounded-siaf-md border border-border">
                      @for (ev of f.eventos; track ev.nombre) {
                        <li class="px-3 py-2">
                          <div class="flex flex-wrap items-baseline gap-x-2">
                            <code class="font-mono text-[13px] font-semibold text-text">({{ ev.nombre }})</code>
                            <code class="break-all font-mono text-[12px] text-text-muted">{{ ev.tipo }}</code>
                          </div>
                          @if (ev.descripcion) {
                            <p class="mt-1 text-xs text-text-muted">{{ ev.descripcion }}</p>
                          }
                        </li>
                      }
                    </ul>
                  </section>
                }
              </div>

              <section class="min-w-0">
                <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Entradas', cantidad: f.entradas.length }" />
                @if (f.entradas.length) {
                  <ul class="divide-y divide-border rounded-siaf-md border border-border">
                    @for (e of entradasVisibles(); track e.nombre) {
                      <li class="px-3 py-2">
                        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <code class="font-mono text-[13px] font-semibold text-text">{{ e.nombre }}</code>
                          @if (e.requerida) {
                            <span class="text-[11px] font-semibold uppercase text-[var(--sys-color-text-brand-primary)]">obligatoria</span>
                          }
                          <code class="break-all font-mono text-[12px] text-text-muted">{{ e.tipo }}</code>
                          @if (e.porDefecto !== null) {
                            <span class="font-mono text-[12px] text-text-muted">= {{ e.porDefecto }}</span>
                          }
                        </div>
                        @if (e.descripcion) {
                          <p class="mt-1 text-xs text-text-muted">{{ e.descripcion }}</p>
                        }
                      </li>
                    }
                  </ul>
                  @if (f.entradas.length > limite) {
                    <siaf-button class="mt-2 inline-block" variant="ghost" size="sm" [icon]="todas() ? 'expand_less' : 'expand_more'" (click)="todas.set(!todas())">
                      {{ todas() ? 'Ver menos' : 'Ver las ' + f.entradas.length + ' entradas' }}
                    </siaf-button>
                  }
                } @else {
                  <p class="text-sm text-text-muted">No recibe entradas.</p>
                }
              </section>
            </div>
          }

          @case ('especificaciones') {
            <div class="space-y-5">
              <section data-ficha-figma>
                <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Figma' }" />
                @if (f.enlacesFigma.length) {
                  <ul class="space-y-1">
                    @for (n of f.enlacesFigma; track n.nodo) {
                      <li>
                        <a class="inline-flex items-center gap-1 text-sm text-[var(--sys-color-text-brand-primary)] hover:underline" [href]="n.url" target="_blank" rel="noopener noreferrer">
                          <siaf-icon name="open_in_new" [size]="16" />
                          Nodo {{ n.nodo }}@if (n.nombre) {<span> · {{ n.nombre }}</span>}
                        </a>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="text-sm italic text-text-muted">Sin nodo del Figma documentado. Se agrega con &#64;figma 1234:567 Nombre en el JSDoc.</p>
                }
              </section>

              <!-- Composición en los dos sentidos: lo que pinta por dentro y quién lo pinta. -->
              <div class="grid gap-5 md:grid-cols-2">
                <section data-ficha-usa>
                  <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Componentes que usa por dentro', cantidad: f.componentesUsados.length }" />
                  @if (f.componentesUsados.length) {
                    <ul class="flex flex-wrap gap-2">
                      @for (c of f.componentesUsados; track c.selector) {
                        <li>
                          <a class="inline-flex rounded-siaf-sm bg-surface-muted px-2 py-1 font-mono text-[12px] text-text hover:underline" [href]="'#' + c.id">{{ c.nombre }}</a>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="text-sm text-text-muted">No pinta otros componentes del catálogo.</p>
                  }
                </section>
                <section data-ficha-lo-usan>
                  <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Lo usan', cantidad: f.usadoPor.length }" />
                  @if (f.usadoPor.length) {
                    <ul class="flex flex-wrap gap-2">
                      @for (u of f.usadoPor; track u.selector) {
                        <li>
                          @if (u.enCatalogo) {
                            <a class="inline-flex rounded-siaf-sm bg-surface-muted px-2 py-1 font-mono text-[12px] text-text hover:underline" [href]="'#' + u.id">{{ u.nombre }}</a>
                          } @else {
                            <!-- Oculto en el catálogo (armazón de la app): no hay ficha a la que llevar. -->
                            <span class="inline-flex rounded-siaf-sm border border-dashed border-border px-2 py-1 font-mono text-[12px] text-text-muted" title="Oculto en el catálogo">{{ u.nombre }}</span>
                          }
                        </li>
                      }
                    </ul>
                    <p class="mt-2 text-xs text-text-muted" data-lo-usan-nota>Cuenta solo componentes del catálogo: las pantallas que lo usan no aparecen aquí.</p>
                  } @else if (f.sinUso) {
                    <p class="text-sm text-text-muted">Ningún componente del catálogo lo pinta por dentro y ninguna pantalla lo usa todavía.</p>
                  } @else {
                    <p class="text-sm text-text-muted">Ningún componente del catálogo lo pinta por dentro: lo usan directamente las pantallas.</p>
                  }
                </section>
              </div>

              <section data-ficha-tokens>
                <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Tokens que usa', cantidad: f.tokensConValor.length }" />
                  <a class="text-xs text-[var(--sys-color-text-brand-primary)] hover:underline" href="#color">Ver todos en Fundamentos</a>
                </div>
                @if (f.tokensConValor.length) {
                  <div class="overflow-x-auto rounded-siaf-md border border-border">
                    <table class="w-full min-w-[560px] border-collapse text-left">
                      <thead>
                        <tr class="border-b border-border text-[11px] font-bold uppercase tracking-widest text-text-muted">
                          <th class="px-3 py-2 font-bold">Token</th>
                          <th class="px-3 py-2 font-bold">Cómo lo usa</th>
                          <th class="px-3 py-2 font-bold">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (t of f.tokensConValor; track t.token) {
                          <tr class="border-b border-border last:border-b-0" [attr.data-token-usado]="t.token">
                            <td class="px-3 py-2"><siaf-ui-kit-copiar [envolver]="false" [texto]="t.token" [copia]="'var(' + t.token + ')'" /></td>
                            <td class="px-3 py-2 font-mono text-[11px] text-text-muted">{{ t.via.join(' · ') }}</td>
                            <td class="px-3 py-2">
                              @switch (t.valor?.tipo) {
                                @case ('color') {
                                  <span class="inline-flex items-center gap-2">
                                    <span class="inline-grid grid-cols-2 overflow-hidden rounded-siaf-sm border border-border">
                                      <span class="size-5" [style.background-color]="t.valor!.claro" [attr.title]="'Claro: ' + t.valor!.claro"></span>
                                      <span class="size-5" [style.background-color]="t.valor!.oscuro" [attr.title]="'Oscuro: ' + t.valor!.oscuro"></span>
                                    </span>
                                    <span class="font-mono text-[11px] text-text-muted">{{ t.valor!.claro }} · {{ t.valor!.oscuro }}</span>
                                  </span>
                                }
                                @case ('medida') {
                                  <span class="font-mono text-[12px] text-text">{{ t.valor!.claro }}</span>
                                }
                                @case ('sombra') {
                                  <span class="inline-block h-5 w-10 rounded-siaf-sm bg-surface" [style.box-shadow]="t.valor!.claro" [attr.title]="t.valor!.claro"></span>
                                }
                                @default {
                                  <a class="font-mono text-[11px] text-[var(--sys-color-text-brand-primary)] hover:underline" [href]="'#' + t.seccion">ver</a>
                                }
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="text-sm text-text-muted">No usa tokens --sys-* directamente{{ f.componentesUsados.length ? ': su aspecto viene de los componentes que pinta.' : '.' }}</p>
                }
              </section>
            </div>
          }

          @case ('accesibilidad') {
            <div class="grid gap-5 md:grid-cols-2">
              <section data-ficha-aria>
                <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Roles y atributos ARIA' }" />
                @if (f.aria.roles.length || f.aria.atributos.length) {
                  <ul class="flex flex-wrap gap-2">
                    @for (r of f.aria.roles; track r) {
                      <li><code class="inline-flex rounded-siaf-sm bg-surface-muted px-2 py-1 font-mono text-[12px] text-text">role="{{ r }}"</code></li>
                    }
                    @for (a of f.aria.atributos; track a) {
                      <li><code class="inline-flex rounded-siaf-sm bg-surface-muted px-2 py-1 font-mono text-[12px] text-text">{{ a }}</code></li>
                    }
                  </ul>
                  <p class="mt-2 text-xs text-text-muted">Leídos de la plantilla y del código del componente.</p>
                } @else {
                  <p class="text-sm text-text-muted">La plantilla no declara roles ni atributos ARIA{{ f.componentesUsados.length ? ': los aportan los componentes que pinta.' : '.' }}</p>
                }
              </section>
              <section data-ficha-teclado>
                <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Teclado' }" />
                @if (f.bloquesTeclado.length) {
                  <ng-container *ngTemplateOutlet="bloquesTpl; context: { $implicit: f.bloquesTeclado }" />
                } @else {
                  <p class="text-sm italic text-text-muted">Sin documentar (&#64;teclado).</p>
                }
              </section>
              <section class="md:col-span-2" data-ficha-notas>
                <ng-container *ngTemplateOutlet="titulo; context: { $implicit: 'Notas' }" />
                @if (f.bloquesAccesibilidad.length) {
                  <ng-container *ngTemplateOutlet="bloquesTpl; context: { $implicit: f.bloquesAccesibilidad }" />
                } @else {
                  <p class="text-sm italic text-text-muted">Sin documentar (&#64;accesibilidad).</p>
                }
              </section>
            </div>
          }
        }
      </div>
    </article>
  `,
})
export class UiKitFichaComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly ficha = signal<FichaVista>(null as unknown as FichaVista);
  /** Tema del catálogo: los marcos lo pasan a su iframe para seguirlo. */
  readonly tema = signal<TemaApp>('light');
  @Input() set temaActual(valor: TemaApp) {
    this.tema.set(valor);
  }
  @Input({ required: true }) set datos(valor: FichaVista) {
    this.ficha.set(valor);
  }

  readonly pestanas = PESTANAS;
  readonly pestana = signal<PestanaFicha>('uso');
  readonly limite = ENTRADAS_VISIBLES;
  readonly todas = signal(false);
  readonly copiado = signal(false);
  readonly capa = computed(() => CAPA[this.ficha().capa]);
  readonly entradasVisibles = computed(() => (this.todas() ? this.ficha().entradas : this.ficha().entradas.slice(0, this.limite)));

  async copiar(): Promise<void> {
    const f = this.ficha();
    try {
      await navigator.clipboard.writeText(`${f.snippetImport}\n${f.snippetUso}`);
      this.copiado.set(true);
      const t = setTimeout(() => this.copiado.set(false), 1500);
      this.destroyRef.onDestroy(() => clearTimeout(t));
    } catch {
      // Sin permiso de portapapeles (iframe o navegador antiguo): el fragmento sigue visible para copiarlo a mano.
    }
  }
}
