import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';

/** Lo que recibe el foco por sí mismo. */
const ENFOCABLES = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * Controles que reciben el foco por el texto que llevan adentro: una opción de menú o de lista, un botón, un enlace.
 * No incluye un contenedor cualquiera con `tabindex` (una tabla con scroll): mostraría el globo de todas sus celdas.
 */
const CONTROLES = [
  'a[href]',
  'button',
  'summary',
  '[role="option"]',
  '[role^="menuitem"]',
  '[role="tab"]',
  '[role="treeitem"]',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
].join(',');

/** Espera al salir del elemento con el puntero: da tiempo a llevarlo hasta el globo (WCAG 1.4.13). */
export const ESPERA_AL_SALIR_MS = 150;

/** Un solo globo por control enfocado: un botón con dos textos cortados (usuario y oficina del navbar) no pinta dos. */
const globoPorControl = new WeakMap<Element, TooltipDirective>();

let siguienteId = 0;

const normalizar = (texto: string): string => texto.replace(/\s+/g, ' ').trim().toLowerCase();

function agregarDescripcion(el: Element, id: string): void {
  const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) el.setAttribute('aria-describedby', [...ids, id].join(' '));
}

function quitarDescripcion(el: Element, id: string): void {
  const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((otro) => otro && otro !== id);
  if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
  else el.removeAttribute('aria-describedby');
}

/**
 * Tooltip para textos truncados y elementos con ayuda contextual.
 *
 * Es el único tooltip del design system (el componente envoltorio `siaf-tooltip` se retiró en
 * 2026-09: pintaba el globo con CSS dentro del elemento). Se monta en `document.body` con
 * `position: fixed`, así que **nunca lo recorta**
 * un contenedor con `overflow` — el caso de las tablas con scroll horizontal.
 * Además no agrega nodos al DOM hasta que el usuario lo pide.
 *
 * En escritorio se muestra al pasar el mouse o al enfocar con el teclado el elemento o el control que lo contiene
 * (la opción de un menú, un botón); el puntero puede pasar al globo sin que desaparezca y Escape lo oculta. En
 * móvil no hay hover, así que se muestra manteniendo pulsado ~500 ms; el texto
 * que puede envolver en pantallas chicas debería usar `sm:truncate` en vez de
 * `truncate` y no depender de este gesto.
 *
 * Dos modos según se le pase texto o no:
 *
 * ```html
 * <!-- Texto truncado: usa el propio contenido y SOLO aparece si está cortado -->
 * <td class="truncate" siafTooltip>{{ fila.nombre }}</td>
 *
 * <!-- Ayuda contextual: texto explícito, siempre visible al hover -->
 * <siaf-icon name="info" siafTooltip="Explicación del campo" />
 * ```
 *
 * @usar
 * - Texto que se corta con `truncate` y cuyo valor completo importa: celdas de la grilla de la bandeja
 *   (`siaf-documents-records-table`), descripciones en la solicitud del catálogo de eventos, datos de
 *   `siaf-summary-card` y el usuario y la oficina de `siaf-navbar`. Solo aparece si el texto está cortado.
 * - Ayuda breve junto a un ícono `info`, como «Criterios de búsqueda ingresados» en las consultas de Plan de Cuentas,
 *   Asiento de ajuste, Catálogo de ajuste y Contabilización, con `tabindex="0"` y `aria-label` en el elemento.
 * - Para mostrar al pasar el mouse qué hace un botón de solo ícono, como «Carga masiva» en la carga masiva de cuentas
 *   contables, sin quitar su `ariaLabel`.
 * - Dentro de tablas o paneles con scroll: el globo se monta en el `body` y el contenedor no lo recorta.
 * @evitar
 * - Para información imprescindible, instrucciones o errores: dejarla visible (`siaf-input` con su error, `message-box`
 *   o `siaf-alert`); el globo solo aparece con el puntero o el foco y en móvil exige una pulsación larga.
 * - Para contenido con título, enlaces o botones: usar `siaf-popover`; el globo solo muestra texto.
 * - Para texto que puede envolver en pantallas chicas: usar `sm:truncate` en vez de `truncate` y no depender del globo.
 * - Un globo hecho a mano con CSS o con el atributo `title`: esta directiva es el único tooltip del kit.
 * @teclado
 * - **Tab**: al llegar el foco al elemento, o al control que contiene el texto (una opción de `siaf-menu`,
 *   `siaf-select-options` o `siaf-list`, un botón, un enlace), aparece el globo; al salir se oculta. Si el control
 *   tiene varios textos cortados, muestra el primero. En dispositivos sin hover no aparece con el foco.
 * - **Escape**: oculta el globo; el menú o el panel que lo contiene sigue recibiendo la tecla.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: con texto de ayuda, el control queda enlazado por `aria-describedby` a una
 *   descripción oculta que existe desde el inicio, así el lector la anuncia al enfocarlo aunque el globo no se haya
 *   pintado; si el nombre del control ya incluye ese texto, no lo repite. El globo es `role="tooltip"` con
 *   `aria-hidden` (solo visual). En modo truncado no se enlaza: el texto completo ya está en el DOM.
 * - **1.4.13 Contenido en hover o foco (AA)**: Escape lo oculta sin mover el puntero ni el foco; se puede llevar el
 *   puntero sobre el globo sin que desaparezca (espera 150 ms al salir del elemento) y sigue visible mientras el
 *   elemento tenga el puntero o el foco. Se oculta al desplazar la página.
 * - **1.4.3 Contraste mínimo (AA)**: `text-brand-white` sobre `bg-feedback-dark-default` 12.24:1 en claro; en oscuro,
 *   sobre `bg-snackbar` (el mismo fondo del snackbar), 15.71:1.
 * - **Pendiente · 2.1.1 Teclado (A)**: la directiva no agrega `tabindex`: un texto cortado que no está dentro de un
 *   control enfocable (un título, una celda, una etiqueta) solo se completa con el mouse o con la pulsación larga; el
 *   lector de pantalla sí lee el texto entero.
 */
@Directive({
  selector: '[siafTooltip]',
  standalone: true,
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  private texto = '';

  /** Texto a mostrar. Vacío = usa el textContent del elemento (modo truncado). */
  @Input('siafTooltip') set text(valor: string | null | undefined) {
    this.texto = valor ?? '';
    this.actualizarDescripcion();
  }
  get text(): string {
    return this.texto;
  }

  /**
   * Fuerza el comportamiento respecto al truncado:
   * - `auto` (default): si NO se pasó texto, solo aparece cuando está truncado.
   * - `always`: aparece siempre.
   * - `truncated`: aparece solo cuando el contenido está truncado.
   */
  @Input() tooltipMode: 'auto' | 'always' | 'truncated' = 'auto';

  private tip: HTMLElement | null = null;
  private pulsacionLarga: ReturnType<typeof setTimeout> | null = null;
  private ocultarPendiente: ReturnType<typeof setTimeout> | null = null;
  private inicioTouch: { x: number; y: number } | null = null;
  /** Tras un long-press hay que anular el click que el navegador dispara al soltar. */
  private anularClick = false;

  /** Control que contiene el texto y recibe el foco por él (la opción de un menú), si el elemento no es enfocable. */
  private control: HTMLElement | null = null;
  private vistaLista = false;
  private readonly idDescripcion = `siaf-tooltip-descripcion-${siguienteId++}`;
  private descripcion: HTMLElement | null = null;
  private enlazadoA: Element | null = null;

  /**
   * En un dispositivo táctil no existe el hover, y encima el navegador emula
   * eventos de mouse al tocar: sin esto el tooltip aparecería con un tap y se
   * quedaría pegado, porque nunca llega un `mouseleave` fiable.
   */
  private get sinHover(): boolean {
    return typeof matchMedia === 'function' && !matchMedia('(hover: hover)').matches;
  }

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.escucharControl();
    this.actualizarDescripcion();
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  mostrarPorHover(): void {
    if (this.sinHover) return;
    this.cancelarOcultar();
    this.show();
  }

  /** Al salir con el puntero espera un momento: si llega al globo, sigue visible. */
  @HostListener('mouseleave')
  alSalirElPuntero(): void {
    this.programarOcultar();
  }

  /** Táctil: mantener pulsado ~500 ms muestra el texto completo. */
  @HostListener('pointerdown', ['$event'])
  onPointerDown(ev: PointerEvent): void {
    if (ev.pointerType !== 'touch') return;
    this.cancelarPulsacion();
    this.inicioTouch = { x: ev.clientX, y: ev.clientY };
    this.pulsacionLarga = setTimeout(() => {
      this.show();
      // Solo anulamos el click si el tooltip llegó a mostrarse: si el texto no
      // estaba cortado, el elemento debe seguir comportándose con normalidad.
      this.anularClick = this.tip !== null;
    }, 500);
  }

  /** Si el dedo se desplaza es un scroll, no una pulsación larga. */
  @HostListener('pointermove', ['$event'])
  onPointerMove(ev: PointerEvent): void {
    if (!this.inicioTouch) return;
    const lejos = Math.abs(ev.clientX - this.inicioTouch.x) > 10 || Math.abs(ev.clientY - this.inicioTouch.y) > 10;
    if (lejos) {
      this.cancelarPulsacion();
      this.hide();
    }
  }

  @HostListener('pointerup')
  @HostListener('pointercancel')
  onPointerUp(): void {
    this.cancelarPulsacion();
    this.hide();
  }

  /** Evita que el long-press navegue o active el elemento al soltar. */
  @HostListener('click', ['$event'])
  onClick(ev: Event): void {
    if (!this.anularClick) return;
    this.anularClick = false;
    ev.preventDefault();
    ev.stopPropagation();
  }

  /** Sin esto, mantener pulsado abre el menú contextual del navegador. */
  @HostListener('contextmenu', ['$event'])
  onContextMenu(ev: Event): void {
    if (this.tip) ev.preventDefault();
  }

  show(): void {
    if (this.tip) return;

    const el = this.host.nativeElement;
    const contenido = (this.texto || el.textContent || '').trim();
    if (!contenido) return;

    const soloSiTruncado =
      this.tooltipMode === 'truncated' || (this.tooltipMode === 'auto' && !this.texto);
    // +1px de tolerancia: el redondeo subpíxel puede dar diferencias de 0.5
    if (soloSiTruncado && el.scrollWidth <= el.clientWidth + 1) return;

    const tip = this.doc.createElement('div');
    tip.setAttribute('role', 'tooltip');
    // Solo visual: el lector ya tiene el texto en el DOM (truncado) o en la descripción enlazada (ayuda).
    tip.setAttribute('aria-hidden', 'true');
    // En oscuro usa el fondo del snackbar: `bg-feedback-dark-default` pasa a gris claro y el texto blanco daba 1.38:1.
    tip.className =
      'fixed z-[60] max-w-64 rounded-siaf-md bg-[var(--sys-color-bg-snackbar,var(--sys-color-bg-feedback-dark-default))] ' +
      'px-2 py-1 text-xs font-medium leading-normal text-[var(--sys-color-text-brand-white)] shadow-siaf-md';
    tip.textContent = contenido;
    tip.addEventListener('mouseenter', () => this.cancelarOcultar());
    tip.addEventListener('mouseleave', () => this.programarOcultar());
    this.doc.body.appendChild(tip);
    this.tip = tip;
    this.doc.addEventListener('keydown', this.alPresionarTecla);

    this.posicionar(el, tip);
  }

  @HostListener('focusout')
  @HostListener('document:scroll')
  @HostListener('window:resize')
  hide(): void {
    this.cancelarOcultar();
    this.doc.removeEventListener('keydown', this.alPresionarTecla);
    if (this.control && globoPorControl.get(this.control) === this) globoPorControl.delete(this.control);
    this.tip?.remove();
    this.tip = null;
  }

  /** Escape oculta el globo sin llamar a preventDefault: el menú o el panel que lo contiene también la recibe. */
  private readonly alPresionarTecla = (evento: KeyboardEvent): void => {
    if (evento.key === 'Escape') this.hide();
  };

  private readonly alEnfocarControl = (): void => {
    const control = this.control;
    if (!control || this.sinHover) return;
    const otro = globoPorControl.get(control);
    if (otro && otro !== this && otro.tip) return;
    this.cancelarOcultar();
    this.show();
    if (this.tip) globoPorControl.set(control, this);
  };

  private readonly alDesenfocarControl = (evento: FocusEvent): void => {
    if (this.control?.contains(evento.relatedTarget as Node | null)) return;
    this.hide();
  };

  private programarOcultar(): void {
    if (!this.tip) return;
    this.cancelarOcultar();
    this.ocultarPendiente = setTimeout(() => {
      this.ocultarPendiente = null;
      // Mientras el elemento (o su control) tenga el foco, el globo sigue visible.
      if (!this.tieneFoco()) this.hide();
    }, ESPERA_AL_SALIR_MS);
  }

  private cancelarOcultar(): void {
    if (this.ocultarPendiente) clearTimeout(this.ocultarPendiente);
    this.ocultarPendiente = null;
  }

  private tieneFoco(): boolean {
    const activo = this.doc.activeElement;
    if (!activo || activo === this.doc.body) return false;
    return this.host.nativeElement.contains(activo) || !!this.control?.contains(activo);
  }

  /**
   * Un texto que no recibe foco pero está dentro de un control que sí (la etiqueta de una opción) muestra el globo
   * cuando el foco llega a ese control.
   */
  private escucharControl(): void {
    const el = this.host.nativeElement;
    if (el.matches(ENFOCABLES) || el.querySelector(ENFOCABLES)) return;
    const control = el.parentElement?.closest(CONTROLES);
    if (!(control instanceof HTMLElement)) return;
    this.control = control;
    control.addEventListener('focusin', this.alEnfocarControl);
    control.addEventListener('focusout', this.alDesenfocarControl);
  }

  /**
   * Con texto de ayuda propio, el control queda enlazado a una descripción oculta que existe desde el inicio: el lector
   * la anuncia al enfocarlo, aunque el globo todavía no se haya pintado.
   */
  private actualizarDescripcion(): void {
    if (!this.vistaLista) return;
    const el = this.host.nativeElement;
    // El que recibe el foco: el propio elemento, el botón de un componente (`siaf-button`) o el control que lo contiene.
    const destino = el.matches(ENFOCABLES) ? el : (el.querySelector<HTMLElement>(ENFOCABLES) ?? this.control ?? el);
    const texto = this.texto.trim();
    const nombre = normalizar(`${destino.getAttribute('aria-label') ?? ''} ${destino.textContent ?? ''}`);
    if (!texto || nombre.includes(normalizar(texto))) {
      this.quitarDescripcion();
      return;
    }
    if (!this.descripcion) {
      this.descripcion = this.doc.createElement('div');
      this.descripcion.id = this.idDescripcion;
      // Oculto del todo: `aria-describedby` lo lee igual y no aparece al recorrer la página con el lector.
      this.descripcion.hidden = true;
      this.doc.body.appendChild(this.descripcion);
    }
    this.descripcion.textContent = texto;
    if (this.enlazadoA && this.enlazadoA !== destino) quitarDescripcion(this.enlazadoA, this.idDescripcion);
    agregarDescripcion(destino, this.idDescripcion);
    this.enlazadoA = destino;
  }

  private quitarDescripcion(): void {
    if (this.enlazadoA) quitarDescripcion(this.enlazadoA, this.idDescripcion);
    this.enlazadoA = null;
    this.descripcion?.remove();
    this.descripcion = null;
  }

  private cancelarPulsacion(): void {
    if (this.pulsacionLarga) clearTimeout(this.pulsacionLarga);
    this.pulsacionLarga = null;
    this.inicioTouch = null;
  }

  ngOnDestroy(): void {
    this.cancelarPulsacion();
    this.hide();
    this.control?.removeEventListener('focusin', this.alEnfocarControl);
    this.control?.removeEventListener('focusout', this.alDesenfocarControl);
    this.control = null;
    this.quitarDescripcion();
  }

  /** Arriba del elemento; si no entra, debajo. Siempre dentro del viewport. */
  private posicionar(el: HTMLElement, tip: HTMLElement): void {
    const r = el.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const MARGEN = 8;

    const cabeArriba = r.top - t.height - MARGEN >= 0;
    const top = cabeArriba ? r.top - t.height - MARGEN : r.bottom + MARGEN;

    let left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(MARGEN, Math.min(left, this.doc.documentElement.clientWidth - t.width - MARGEN));

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }
}
