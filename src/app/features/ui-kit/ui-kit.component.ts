import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, NgZone, afterNextRender, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { FocoDirective } from '../../shared/ui/foco/foco.directive';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import { TemaApp, aplicarTema, leerTemaGuardado } from '../../shared/utils/tema.util';
import { filtrarSecciones } from './fundamentos/secciones';
import { UiKitFundamentosComponent } from './fundamentos/ui-kit-fundamentos.component';
import { UiKitFichaComponent } from './ui-kit-ficha.component';
import { MANIFIESTO_UI_KIT } from './ui-kit.manifest';
import { PosicionSeccion, agrupar, filtrar, seccionEnLectura } from './ui-kit.vista';

/**
 * Distancia entre el borde inferior de las barras fijas y la línea de lectura: una sección cuenta como la que se lee
 * cuando su borde superior la cruza. Supera en 32 px el `scroll-margin` de las secciones (barras + 48 px), así la que
 * se abre desde el índice queda marcada aunque el navegador la deje unos píxeles más abajo.
 */
const MARGEN_LECTURA = 80;

/** Sin eventos de scroll durante este tiempo, termina el desplazamiento que pidió el índice. */
const FIN_DESPLAZAMIENTO_MS = 150;

/** Espacio que se deja arriba y abajo del enlace activo antes de desplazar la lista del índice. */
const HOLGURA_INDICE = 48;

/** Un grupo del índice: primero los fundamentos visuales y después cada categoría con sus fichas. */
interface GrupoIndice {
  titulo: string;
  /** Las fichas se nombran con su selector (en monoespaciada); los fundamentos, con su título. */
  codigo: boolean;
  enlaces: { id: string; nombre: string }[];
}

/** Mide cada sección recién cuando el recorrido llega a ella: `seccionEnLectura` corta en la primera que está debajo. */
function* posiciones(secciones: ArrayLike<HTMLElement>): Generator<PosicionSeccion> {
  for (let i = 0; i < secciones.length; i++) {
    yield { id: secciones[i].id, arriba: secciones[i].getBoundingClientRect().top };
  }
}

/**
 * Catálogo público de componentes en /ui-kit.
 *
 * Todo lo que describe a cada componente sale del código (`scripts/generar-ui-kit.mjs`
 * escribe `ui-kit.manifest.ts`); aquí solo se agrupa, se busca y se renderiza. Los
 * ejemplos en vivo viven en `ejemplos/`, uno por categoría, y los componentes que
 * dependen de la sesión se documentan sin ejemplo porque esta ruta no tiene login.
 *
 * Arriba de los componentes van los fundamentos visuales (color, tipografía, espaciado, radios,
 * sombras e íconos), generados desde los tokens en `ui-kit.fundamentos.ts`.
 *
 * El índice deja fijos el título y el buscador (solo la lista se desplaza) y sigue el scroll: marca la sección que
 * cruza la línea de lectura y su categoría, y mueve su propia lista para no perderla de vista. En móvil y tablet el
 * índice es un panel, y una franja fija bajo el encabezado dice en qué sección estás y lo abre.
 */
@Component({
  selector: 'siaf-ui-kit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, EmptyStateComponent, FocoDirective, IconComponent, TextFieldComponent, UiKitFichaComponent, UiKitFundamentosComponent],
  host: { '(click)': 'alHacerClic($event)' },
  template: `
    <div class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-low)] text-text">
      <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6" data-ui-kit-encabezado>
        <!-- El host de siaf-button fija su display: la visibilidad responsive va en un contenedor. -->
        <div class="lg:hidden">
          <siaf-button
            variant="ghost"
            icon="menu"
            [iconOnly]="true"
            ariaLabel="Abrir el índice de componentes"
            (click)="alternarIndice()"
          />
        </div>
        <!-- El SVG no conserva su proporción (preserveAspectRatio="none"): ancho y alto fijos, igual que el navbar de la app. -->
        <img class="h-10 w-[128px] shrink-0 object-contain" [src]="logo()" alt="SIAF-RP" />
        <span class="hidden h-6 w-px bg-border md:block" aria-hidden="true"></span>
        <p class="hidden whitespace-nowrap text-base font-semibold md:block">Catálogo de componentes</p>
        <div class="ml-auto flex items-center">
          <div class="sm:hidden">
            <siaf-button
              variant="secondary"
              size="sm"
              [icon]="tema() === 'dark' ? 'light_mode' : 'dark_mode'"
              [iconOnly]="true"
              [ariaLabel]="etiquetaTema()"
              (click)="alternarTema()"
            />
          </div>
          <div class="hidden whitespace-nowrap sm:block">
            <siaf-button variant="secondary" size="sm" [icon]="tema() === 'dark' ? 'light_mode' : 'dark_mode'" (click)="alternarTema()">
              {{ etiquetaTema() }}
            </siaf-button>
          </div>
        </div>
      </header>

      <!-- Móvil y tablet: el índice vive en un panel, así que esta franja dice en qué sección estás y lo abre. Va siempre
           en el flujo: si apareciera al llegar a la primera sección, correría el contenido y la sección marcada. -->
      <button
        class="sticky top-16 z-20 flex h-14 w-full items-center gap-3 border-b border-border bg-surface px-4 text-left transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] lg:hidden"
        type="button"
        aria-controls="ui-kit-indice"
        [attr.aria-expanded]="indiceAbierto()"
        data-ui-kit-franja
        (click)="alternarIndice()"
      >
        <siaf-icon class="shrink-0 text-text-muted" name="toc" [size]="20" />
        @if (ubicacion(); as u) {
          <span class="min-w-0 flex-1">
            <span class="sr-only">Abrir el índice. Estás en </span>
            <span class="block truncate text-[11px] font-bold uppercase leading-4 tracking-widest text-[var(--sys-color-text-brand-primary)]">{{ u.grupo }}</span>
            <span class="block truncate text-sm font-semibold leading-5 text-text" [class.font-mono]="u.codigo">{{ u.nombre }}</span>
          </span>
        } @else {
          <span class="min-w-0 flex-1">
            <span class="sr-only">Abrir el índice. </span>
            <span class="block truncate text-[11px] font-bold uppercase leading-4 tracking-widest text-text-muted">Índice</span>
            <span class="block truncate text-sm font-semibold leading-5 text-text">Elige un componente o fundamento</span>
          </span>
        }
        <siaf-icon class="shrink-0 text-text-muted" name="expand_more" [size]="20" />
      </button>

      <div class="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[304px_minmax(0,1fr)]">
        @if (indiceAbierto()) {
          <button class="fixed inset-0 top-16 z-20 bg-black/30 lg:hidden" type="button" aria-label="Cerrar el índice" (click)="indiceAbierto.set(false)"></button>
        }
        <!-- Solo la lista se desplaza: el título y el buscador quedan fijos arriba. -->
        <aside
          id="ui-kit-indice"
          class="fixed bottom-0 left-0 top-16 z-20 w-[304px] max-w-[85vw] flex-col border-r border-border bg-surface lg:sticky lg:flex lg:h-[calc(100vh-4rem)] lg:max-w-none"
          [class.hidden]="!indiceAbierto()"
          [class.flex]="indiceAbierto()"
          aria-label="Índice de componentes"
          [siafFoco]="indiceAbierto()"
          (siafFocoEscape)="indiceAbierto.set(false)"
        >
          <div class="shrink-0 border-b border-border px-6 pb-5 pt-6" data-ui-kit-indice-fijo>
            <p class="text-lg font-semibold leading-6">UI Kit</p>
            <p class="mt-1 font-mono text-xs text-text-muted">SIAF-RP · Angular 20</p>
            <siaf-input
              class="mt-5"
              label="Buscar en el catálogo"
              leadingIcon="search"
              [clearable]="true"
              [autoSuccess]="false"
              [value]="busqueda()"
              (valueChange)="buscar('' + $event)"
            />
            <p class="mt-3 text-xs text-text-muted" role="status">{{ totalFiltrado() }} de {{ total }} componentes</p>
          </div>
          <nav class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8" aria-label="Secciones del catálogo" data-ui-kit-indice-lista>
            <!-- El relleno superior va en este contenedor y no en la lista: con relleno en la lista, el título fijo se
                 pegaría debajo de él y dejaría ver lo que pasa por encima. -->
            <div class="space-y-5 pt-4">
              @for (grupo of indice(); track grupo.titulo) {
                <div>
                  <!-- Fijo arriba de la lista mientras se recorren sus fichas: la categoría marcada no se pierde de vista. -->
                  <p
                    class="sticky top-0 z-10 mb-1 bg-surface px-3 py-2 text-[11px] font-bold uppercase tracking-widest"
                    [class.text-[var(--sys-color-text-brand-primary)]]="ubicacion()?.grupo === grupo.titulo"
                    [class.text-text-muted]="ubicacion()?.grupo !== grupo.titulo"
                    [attr.data-grupo-activo]="ubicacion()?.grupo === grupo.titulo ? '' : null"
                  >
                    {{ grupo.titulo }}
                  </p>
                  <ul class="space-y-0.5">
                    @for (enlace of grupo.enlaces; track enlace.id) {
                      <li>
                        <a
                          class="relative block truncate rounded-siaf-sm py-1.5 pl-4 pr-3 text-[13px] leading-6 transition focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                          [class.font-mono]="grupo.codigo"
                          [class.bg-[var(--sys-color-bg-states-light-selected)]]="activo() === enlace.id"
                          [class.font-semibold]="activo() === enlace.id"
                          [class.text-[var(--sys-color-text-neutral-activated)]]="activo() === enlace.id"
                          [class.text-text]="activo() !== enlace.id"
                          [class.hover:bg-[var(--sys-color-bg-states-light-hover)]]="activo() !== enlace.id"
                          [href]="'#' + enlace.id"
                          [attr.data-indice]="grupo.codigo ? '' : null"
                          [attr.data-indice-fundamento]="grupo.codigo ? null : ''"
                          [attr.data-destino]="enlace.id"
                          [attr.aria-current]="activo() === enlace.id ? 'location' : null"
                          [attr.data-foco-inicial]="enlaceInicial() === enlace.id ? '' : null"
                          (click)="irA($event, enlace.id)"
                        >
                          <!-- Además del fondo y el color: la barra y la negrita no dependen solo del color (WCAG 1.4.1). -->
                          @if (activo() === enlace.id) {
                            <span class="absolute inset-y-1.5 left-1 w-[3px] rounded-full bg-[var(--sys-color-text-brand-primary)]" aria-hidden="true"></span>
                          }
                          {{ enlace.nombre }}
                        </a>
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          </nav>
        </aside>

        <main class="min-w-0 px-4 py-10 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
          <section class="mb-16 max-w-3xl">
            <p class="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--sys-color-text-brand-primary)]">SIAF-RP · Biblioteca de interfaz</p>
            <h1 class="mb-4 text-3xl font-bold lg:text-4xl">Catálogo de componentes</h1>
            <p class="text-base leading-relaxed text-text-muted">
              Los componentes reutilizables del frontend: el design system de <code class="font-mono text-sm">shared/ui</code>,
              los transversales de <code class="font-mono text-sm">shared/components</code> y las piezas del armazón.
              Cada ficha se genera desde el código, así que el selector, las entradas y los eventos son los reales.
              Los ejemplos se renderizan en vivo con los mismos componentes que usan las pantallas. Los fundamentos visuales salen de los tokens de
              <code class="font-mono text-sm">src/styles</code>.
            </p>
            <div class="mt-8 flex flex-wrap gap-4">
              @for (dato of resumen; track dato.etiqueta) {
                <div class="rounded-siaf-md border border-border bg-surface px-5 py-3">
                  <p class="text-xl font-bold">{{ dato.valor }}</p>
                  <p class="text-xs text-text-muted">{{ dato.etiqueta }}</p>
                </div>
              }
            </div>
          </section>

          @if (fundamentos().length) {
            <section class="mb-16" aria-labelledby="ui-kit-fundamentos">
              <h2 class="text-2xl font-bold" id="ui-kit-fundamentos">Fundamentos visuales</h2>
              <p class="mb-8 mt-2 text-sm leading-relaxed text-text-muted">La base de todos los componentes: colores, tipografía, espaciados, radios, sombras e íconos, leídos de los tokens reales.</p>
              <siaf-ui-kit-fundamentos [secciones]="fundamentos()" />
            </section>
          }

          @for (grupo of grupos(); track grupo.categoria.titulo) {
            <section class="mb-16">
              <h2 class="text-2xl font-bold">{{ grupo.categoria.titulo }}</h2>
              <p class="mb-8 mt-2 text-sm leading-relaxed text-text-muted">{{ grupo.categoria.descripcion }}</p>
              <div class="space-y-8">
                @for (f of grupo.fichas; track f.id) {
                  <siaf-ui-kit-ficha [datos]="f" [temaActual]="tema()" />
                }
              </div>
            </section>
          } @empty {
            @if (!fundamentos().length) {
              <siaf-empty-state illustration="no-results" title="Sin resultados" [description]="'Ningún componente ni fundamento coincide con «' + busqueda() + '».'" />
            }
          }

          <footer class="flex flex-col gap-2 border-t border-border pt-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Generado desde el código con <code class="font-mono">npm run ui-kit:manifest</code>. Un componente nuevo sin categoría hace fallar los tests.
            </p>
            <p class="shrink-0" data-ui-kit-autores>Creado por <span class="font-semibold text-text">Brian Meneses</span> y <span class="font-semibold text-text">Adib Checori</span></p>
          </footer>
        </main>
      </div>
    </div>
  `,
})
export class UiKitComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zona = inject(NgZone);
  private readonly injector = inject(Injector);

  private readonly todos = agrupar(MANIFIESTO_UI_KIT);
  readonly total = this.todos.reduce((n, g) => n + g.fichas.length, 0);
  readonly resumen = [
    { valor: this.total, etiqueta: 'componentes' },
    { valor: this.todos.reduce((n, g) => n + g.fichas.filter((f) => f.ejemplo).length, 0), etiqueta: 'con ejemplo en vivo' },
    { valor: this.todos.reduce((n, g) => n + g.fichas.reduce((m, f) => m + f.entradas.length, 0), 0), etiqueta: 'entradas documentadas' },
    { valor: this.todos.reduce((n, g) => n + g.fichas.reduce((m, f) => m + f.eventos.length, 0), 0), etiqueta: 'eventos documentados' },
    { valor: this.todos.reduce((n, g) => n + g.fichas.filter((f) => f.sinUso).length, 0), etiqueta: 'sin uso en la app' },
  ];

  readonly busqueda = signal('');
  readonly fundamentos = computed(() => filtrarSecciones(this.busqueda()));
  readonly grupos = computed(() => filtrar(this.todos, this.busqueda()));
  readonly totalFiltrado = computed(() => this.grupos().reduce((n, g) => n + g.fichas.length, 0));

  readonly indice = computed<GrupoIndice[]>(() => {
    const fundamentos = this.fundamentos();
    const grupos = this.grupos().map((g) => ({ titulo: g.categoria.titulo, codigo: true, enlaces: g.fichas.map((f) => ({ id: f.id, nombre: f.nombre })) }));
    if (!fundamentos.length) return grupos;
    return [{ titulo: 'Fundamentos visuales', codigo: false, enlaces: fundamentos.map((s) => ({ id: s.id, nombre: s.titulo })) }, ...grupos];
  });

  readonly tema = signal<TemaApp>(leerTemaGuardado());
  readonly etiquetaTema = computed(() => (this.tema() === 'dark' ? 'Modo claro' : 'Modo oscuro'));
  readonly logo = computed(() => `assets/figma/logos/siaf-rp-default-${this.tema() === 'dark' ? 'white' : 'color'}.svg`);
  readonly indiceAbierto = signal(false);
  /** Sección marcada en el índice: la que se está leyendo o la que se eligió en él. */
  readonly activo = signal<string | null>(null);

  /** Dónde está el lector: la categoría y el nombre de la sección marcada; null arriba de todo o si la búsqueda la ocultó. */
  readonly ubicacion = computed(() => {
    const id = this.activo();
    for (const grupo of this.indice()) {
      const enlace = grupo.enlaces.find((e) => e.id === id);
      if (enlace) return { grupo: grupo.titulo, nombre: enlace.nombre, codigo: grupo.codigo };
    }
    return null;
  });

  /** Enlace que recibe el foco al abrir el índice en móvil: la sección actual o, sin ella, la primera. */
  readonly enlaceInicial = computed(() => (this.ubicacion() ? this.activo() : (this.indice()[0]?.enlaces[0]?.id ?? null)));

  /** Cuadro pendiente del seguimiento del scroll (0 si no hay). */
  private cuadro = 0;
  /** Mientras dura el desplazamiento que pidió el índice, el scroll no cambia la sección elegida. */
  private desplazandoDesdeIndice = false;
  private finDesplazamiento: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(Title).setTitle('Catálogo de componentes · SIAF-RP');
    aplicarTema(this.documento, this.tema());

    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      clearTimeout(this.finDesplazamiento);
      if (this.cuadro) this.documento.defaultView?.cancelAnimationFrame(this.cuadro);
    });

    afterNextRender(() => {
      // Enlace directo a una ficha (/ui-kit#siaf-menu): se desplaza cuando la página ya está pintada.
      const fragmento = this.route.snapshot.fragment;
      if (fragmento) this.desplazar(fragmento, 'auto');
      else this.seguirSeccion();

      // Fuera de la zona: el scroll dispara muchos eventos y solo un cambio de sección necesita repintar.
      const ventana = this.documento.defaultView;
      if (!ventana) return;
      const alDesplazar = (): void => this.alDesplazar();
      this.zona.runOutsideAngular(() => {
        ventana.addEventListener('scroll', alDesplazar, { passive: true });
        ventana.addEventListener('resize', alDesplazar, { passive: true });
      });
      destroyRef.onDestroy(() => {
        ventana.removeEventListener('scroll', alDesplazar);
        ventana.removeEventListener('resize', alDesplazar);
      });
    });
  }

  alternarTema(): void {
    this.tema.set(this.tema() === 'dark' ? 'light' : 'dark');
    aplicarTema(this.documento, this.tema());
  }

  alternarIndice(): void {
    const abrir = !this.indiceAbierto();
    this.indiceAbierto.set(abrir);
    // La lista del panel se abre con la sección actual a la vista; siafFoco lleva el foco a su enlace.
    if (abrir) afterNextRender(() => this.mostrarEnIndice(this.activo(), 'auto'), { injector: this.injector });
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    // Las secciones que quedan cambian de lugar: se vuelve a medir con la página ya pintada.
    afterNextRender(() => this.seguirSeccion(), { injector: this.injector });
  }

  /**
   * Los enlaces internos de las fichas (`href="#siaf-icon"`: componentes que pinta, tokens, código que nombra otra
   * ficha) se resuelven contra `<base href="/">` y sacaban del catálogo (`/#siaf-icon` terminaba en el landing). Un clic
   * normal se desplaza a la sección, como el índice; los clics con modificadores o con otro botón no se interceptan.
   */
  alHacerClic(evento: MouseEvent): void {
    if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target instanceof Element ? evento.target.closest('a[href^="#"]') : null;
    const id = enlace?.getAttribute('href')?.slice(1);
    if (!id || !this.documento.getElementById(id)) return;
    this.irA(evento, id);
  }

  irA(evento: Event, id: string): void {
    evento.preventDefault();
    this.indiceAbierto.set(false);
    this.desplazar(id, 'smooth');
    void this.router.navigate([], { relativeTo: this.route, fragment: id, replaceUrl: true });
  }

  private desplazar(id: string, behavior: ScrollBehavior): void {
    this.activo.set(id);
    this.desplazandoDesdeIndice = true;
    this.esperarFinDelDesplazamiento();
    this.documento.getElementById(id)?.scrollIntoView({ behavior, block: 'start' });
  }

  private alDesplazar(): void {
    // Durante el desplazamiento pedido desde el índice, las secciones que pasan no se marcan.
    if (this.desplazandoDesdeIndice) {
      this.esperarFinDelDesplazamiento();
      return;
    }
    const ventana = this.documento.defaultView;
    if (this.cuadro || !ventana) return;
    this.cuadro = ventana.requestAnimationFrame(() => {
      this.cuadro = 0;
      this.seguirSeccion();
    });
  }

  /** Termina cuando el scroll deja de moverse; la sección elegida sigue marcada hasta que el usuario vuelva a desplazarse. */
  private esperarFinDelDesplazamiento(): void {
    clearTimeout(this.finDesplazamiento);
    this.zona.runOutsideAngular(() => {
      this.finDesplazamiento = setTimeout(() => (this.desplazandoDesdeIndice = false), FIN_DESPLAZAMIENTO_MS);
    });
  }

  /**
   * Marca la sección que cruzó la línea de lectura, debajo del encabezado y de la franja móvil. Al final de la página
   * la línea baja al borde inferior de la ventana: las últimas secciones no alcanzan a subir y se marca la última visible.
   */
  private seguirSeccion(): void {
    const ventana = this.documento.defaultView;
    if (!ventana) return;
    const raiz = this.host.nativeElement;
    const barras = ['[data-ui-kit-encabezado]', '[data-ui-kit-franja]'].map((s) => raiz.querySelector(s)?.getBoundingClientRect().bottom ?? 0);
    const pagina = this.documento.documentElement;
    const alFinal = pagina.scrollHeight > ventana.innerHeight && ventana.scrollY + ventana.innerHeight >= pagina.scrollHeight - 2;
    const linea = alFinal ? ventana.innerHeight : Math.max(...barras) + MARGEN_LECTURA;
    const id = seccionEnLectura(posiciones(raiz.querySelectorAll<HTMLElement>('main [data-seccion]')), linea);
    if (id === this.activo()) return;
    this.zona.run(() => this.activo.set(id));
    this.mostrarEnIndice(id, 'smooth');
  }

  /** Desplaza la lista del índice (no la página) hasta que el enlace de la sección quede a la vista. */
  private mostrarEnIndice(id: string | null, behavior: ScrollBehavior): void {
    const lista = this.host.nativeElement.querySelector<HTMLElement>('[data-ui-kit-indice-lista]');
    // Índice oculto: en móvil, con el panel cerrado.
    if (!lista || lista.getBoundingClientRect().height === 0) return;
    // De vuelta en la introducción, la lista también vuelve a empezar.
    if (!id) {
      lista.scrollTo({ top: 0, behavior });
      return;
    }
    const enlace = lista.querySelector<HTMLElement>(`[data-destino="${CSS.escape(id)}"]`);
    if (!enlace) return;
    const caja = lista.getBoundingClientRect();
    const item = enlace.getBoundingClientRect();
    if (item.top >= caja.top + HOLGURA_INDICE && item.bottom <= caja.bottom - HOLGURA_INDICE) return;
    lista.scrollTo({ top: lista.scrollTop + item.top - caja.top - caja.height / 3, behavior });
  }
}
