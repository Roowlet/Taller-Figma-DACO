import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Injector, Input, OnDestroy, Output, afterNextRender, inject } from '@angular/core';

/** Lo que se puede enfocar con Tab dentro de un contenedor. */
const ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Eventos de teclado ya atendidos por un contenedor interno (un modal dentro de un panel no cierra los dos). */
const atendidos = new WeakSet<Event>();

/**
 * Maneja el foco de un diálogo, panel lateral o panel desplegable, con el patrón que ya tenía `siaf-modal`
 * (WCAG 2.4.3 Orden del foco, 2.1.1 Teclado y 2.1.2 Sin trampas de teclado):
 *
 * - Al activarse guarda el elemento enfocado y lleva el foco adentro: al elemento marcado con `data-foco-inicial`,
 *   si no al primer control y, si no hay controles, al propio contenedor (que recibe `tabindex="-1"`). Sin atrapar Tab
 *   (panel no modal), solo si al abrirse había un control enfocado: lo que se pinta abierto al cargar la página no le
 *   quita el foco a nadie ni mueve el scroll.
 * - Con `siafFocoAtrapar` en true (por defecto), Tab y Shift + Tab dan la vuelta dentro del contenedor.
 * - Escape emite `siafFocoEscape`: el componente decide cerrar. Sin nadie escuchando, Escape no hace nada.
 * - Al desactivarse (o al destruirse) devuelve el foco al elemento que lo tenía, si el foco llegó a entrar, ese
 *   elemento sigue en la página y el foco no se fue a otro lado.
 * - `siafFocoSalida` avisa cuando el foco sale del contenedor hacia otro control (con Tab o Shift + Tab, también si
 *   antes pasó por la barra del navegador): un desplegable se cierra ahí. Si el foco ya está en otro control, al
 *   desactivarse no lo devuelve.
 *
 * Se pone en el elemento que contiene los controles (el `aside` del panel, la `section` del diálogo) y se activa con
 * el mismo `open` del componente; con la animación de `SidePanelAnimacion` el foco vuelve apenas empieza a cerrar.
 *
 * @usar
 * - En todo modal o panel lateral del kit: `siaf-modal`, `siaf-annulment-modal`, `siaf-side-nav`, `siaf-side-panel`,
 *   los paneles de selección, carga, columnas e historiales.
 * - Con `siafFocoAtrapar` en false para paneles no modales que se abren sobre la página, como el de notificaciones o
 *   el filtro personalizado de la bandeja: el foco entra y Escape cierra, pero Tab puede salir.
 * - En desplegables (menús, listas de un select, calendario, popover) con `siafFocoAtrapar` en false y
 *   `siafFocoSalida` para cerrarlos cuando el foco se va con Tab. La capa invisible que cierra al pulsar fuera va con
 *   `tabindex="-1"`, `aria-hidden` y sin robar el foco al pulsarla.
 * - En un overlay que bloquea la página mientras se procesa (`siaf-loader-overlay`), sin `siafFocoEscape`.
 * @evitar
 * - Reescribir a mano en otro componente el guardado y devolución del foco o la vuelta de Tab: usar esta directiva.
 * - En menús de opciones con flechas: `siaf-menu` ya maneja su propio teclado.
 * - En contenido que no se abre ni se cierra (una tarjeta, una sección de la página).
 * @teclado
 * - **Tab / Shift + Tab**: con `siafFocoAtrapar` en true, recorren los controles del contenedor y dan la vuelta del
 *   último al primero; en false, siguen el orden normal de la página.
 * - **Escape**: emite `siafFocoEscape` para que el componente cierre; el foco vuelve a donde estaba al abrir.
 * - **Tab** fuera de un desplegable: emite `siafFocoSalida` y el foco sigue al control siguiente.
 * @accesibilidad
 * - **2.4.3 Orden del foco (A)**: mueve el foco al abrir y lo devuelve al cerrar, así el recorrido con Tab sigue
 *   desde el control que abrió el panel.
 * - **2.1.2 Sin trampas de teclado (A)**: el foco queda atrapado solo mientras el diálogo está activo y Escape siempre
 *   ofrece la salida cuando el componente escucha `siafFocoEscape`.
 * - **2.1.1 Teclado (A)**: cerrar con Escape equivale al botón de cerrar.
 * - **4.1.2 Nombre, función y valor (A)**: no pone roles: el componente declara `role="dialog"`, `aria-modal` y el
 *   nombre (`aria-labelledby` o `aria-label`).
 */
@Directive({
  selector: '[siafFoco]',
  standalone: true,
  host: {
    '(keydown)': 'alPresionarTecla($event)',
    '(focusin)': 'alEntrarElFoco()',
    '(focusout)': 'alSalirElFoco($event)',
    '(document:focusin)': 'alEnfocarseAfuera($event)',
  },
})
export class FocoDirective implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documento = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private activa = false;
  private anterior: HTMLElement | null = null;
  /** Control de afuera al que se fue el foco, hasta que vuelva a entrar. */
  private salidaHacia: Node | null = null;
  /** El foco estuvo adentro desde que se activó: sin eso no hay salida que avisar. */
  private tuvoFoco = false;

  /** Activa el manejo del foco; basta con escribir el atributo (`siafFoco`) para activarlo al pintarse. */
  @Input() set siafFoco(valor: boolean | '' | null | undefined) {
    const activar = valor === '' || valor === true;
    if (activar === this.activa) return;
    this.activa = activar;
    if (activar) this.activar();
    else this.devolverFoco();
  }

  /** Tab da la vuelta dentro del contenedor (diálogos modales). En false, solo mueve el foco y atiende Escape. */
  @Input() siafFocoAtrapar = true;

  /** Escape dentro del contenedor mientras está activo. */
  @Output() readonly siafFocoEscape = new EventEmitter<KeyboardEvent>();

  /** El foco salió del contenedor hacia otro control de la página (un desplegable se cierra). */
  @Output() readonly siafFocoSalida = new EventEmitter<FocusEvent>();

  ngOnDestroy(): void {
    const activa = this.activa;
    // Antes de devolver el foco: al llegar al disparador no debe contarse como salida.
    this.activa = false;
    if (activa) this.devolverFoco();
  }

  alPresionarTecla(evento: KeyboardEvent): void {
    // Un control interno que ya atendió la tecla (un menú o una lista que se cierra con Escape) la marca con
    // preventDefault: el panel no se cierra junto con ella.
    if (!this.activa || atendidos.has(evento) || evento.defaultPrevented) return;

    if (evento.key === 'Escape' && this.siafFocoEscape.observed) {
      atendidos.add(evento);
      evento.preventDefault();
      this.siafFocoEscape.emit(evento);
      return;
    }

    if (evento.key === 'Tab' && this.siafFocoAtrapar) {
      atendidos.add(evento);
      this.darLaVuelta(evento);
    }
  }

  alEntrarElFoco(): void {
    this.salidaHacia = null;
    if (this.activa) this.tuvoFoco = true;
  }

  alSalirElFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget;
    // Sin destino (clic en una zona sin foco, cambio de ventana) no se considera salida.
    if (!this.activa || !(destino instanceof Node) || this.host.nativeElement.contains(destino)) return;
    this.salidaHacia = destino;
    this.siafFocoSalida.emit(evento);
  }

  /**
   * Tab desde el último control del documento lleva el foco a la barra del navegador, sin destino en el focusout; la
   * salida se avisa cuando el foco vuelve a la página en un control de afuera.
   */
  alEnfocarseAfuera(evento: FocusEvent): void {
    const destino = evento.target;
    if (!this.activa || !this.tuvoFoco || this.salidaHacia) return;
    if (!(destino instanceof Node) || this.host.nativeElement.contains(destino)) return;
    this.salidaHacia = destino;
    this.siafFocoSalida.emit(evento);
  }

  /** Controles del contenedor que hoy se pueden enfocar (visibles y habilitados). */
  enfocables(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(ENFOCABLES)).filter(
      (el) => !el.hasAttribute('disabled') && !el.closest('[inert]') && el.getClientRects().length > 0,
    );
  }

  private activar(): void {
    this.salidaHacia = null;
    this.tuvoFoco = false;
    const activo = this.documento.activeElement;
    this.anterior = activo instanceof HTMLElement && activo !== this.documento.body ? activo : null;
    // Después de pintar: el contenido del panel suele estar dentro de bloques if que aún no existen.
    afterNextRender(() => this.enfocarInicio(), { injector: this.injector });
  }

  private enfocarInicio(): void {
    if (!this.activa) return;
    const contenedor = this.host.nativeElement;
    if (contenedor.contains(this.documento.activeElement)) {
      this.tuvoFoco = true;
      return;
    }
    // Un panel no modal que se pinta abierto sin que un control lo abriera (al cargar la página, un ejemplo del
    // catálogo) no le quita el foco a la página ni la hace saltar hasta él. Se evalúa acá y no al activarse: los
    // inputs con binding (`[siafFocoAtrapar]`) todavía no llegaron cuando se aplica el atributo `siafFoco`.
    if (!this.siafFocoAtrapar && !this.anterior) return;
    // data-foco-inicial puede marcar un componente del kit (`siaf-input`): entonces se enfoca su primer control.
    const marcado = contenedor.querySelector<HTMLElement>('[data-foco-inicial]');
    const inicial = marcado?.matches(ENFOCABLES) ? marcado : (marcado?.querySelector<HTMLElement>(ENFOCABLES) ?? null);
    const destino = inicial ?? this.enfocables()[0];
    if (destino) {
      destino.focus();
      return;
    }
    if (!contenedor.hasAttribute('tabindex')) contenedor.setAttribute('tabindex', '-1');
    contenedor.focus();
  }

  private darLaVuelta(evento: KeyboardEvent): void {
    const contenedor = this.host.nativeElement;
    const controles = this.enfocables();
    if (controles.length === 0) {
      evento.preventDefault();
      contenedor.focus();
      return;
    }
    const primero = controles[0];
    const ultimo = controles[controles.length - 1];
    const activo = this.documento.activeElement;
    if (evento.shiftKey && (activo === primero || activo === contenedor)) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && activo === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }

  private devolverFoco(): void {
    const anterior = this.anterior;
    const salidaHacia = this.salidaHacia;
    const tuvoFoco = this.tuvoFoco;
    this.anterior = null;
    this.salidaHacia = null;
    this.tuvoFoco = false;
    // Si el foco nunca entró (un panel no modal que se pintó abierto, o su gemelo oculto por CSS en otro breakpoint),
    // no hay nada que devolver.
    if (!tuvoFoco || !anterior || !anterior.isConnected) return;
    // El foco ya se fue a otro control: un desplegable que se cierra al salir con Tab se pinta (con zone.js) dentro del
    // mismo focusout, cuando el documento todavía reporta body como activo. Devolverlo ahí cancelaría el Tab.
    if (salidaHacia?.isConnected) return;
    const activo = this.documento.activeElement;
    // Solo si el foco sigue adentro o se perdió: no se lo quita a otro control que el usuario ya eligió.
    const foco = activo === null || activo === this.documento.body || this.host.nativeElement.contains(activo);
    if (foco) anterior.focus();
  }
}
