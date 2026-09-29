import { DestroyRef, inject, signal } from '@angular/core';

/** Duración de la animación de los side panels (Figma WEB-SIAF-RP). */
export const SIDE_PANEL_ANIM_MS = 300;

/**
 * Controla el render de un side panel animado: al abrir se monta de
 * inmediato (la entrada anima por CSS) y al cerrar retiene el DOM
 * los 300ms de la salida antes de desmontarlo.
 *
 * Uso: `readonly anim = new SidePanelAnimacion();` + llamar
 * `anim.actualizar(this.open)` desde ngOnChanges. En el template:
 * `@if (anim.visible())` y clases `siaf-sidepanel-overlay` +
 * `[class.cerrando]="anim.cerrando()"` en el overlay.
 *
 * Se crea en un inicializador de campo del componente: toma su `DestroyRef` para cancelar la salida pendiente si el
 * componente se destruye a mitad de la animación. Fuera de un contexto de inyección hay que pasarle uno.
 */
export class SidePanelAnimacion {
  private readonly _visible = signal(false);
  private readonly _cerrando = signal(false);
  /** Solo lectura desde fuera: el estado lo cambia `actualizar`. */
  readonly visible = this._visible.asReadonly();
  readonly cerrando = this._cerrando.asReadonly();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(destroyRef: DestroyRef = inject(DestroyRef)) {
    destroyRef.onDestroy(() => this.cancelarSalida());
  }

  actualizar(open: boolean): void {
    if (open) {
      this.cancelarSalida();
      this._cerrando.set(false);
      this._visible.set(true);
      return;
    }
    if (!this._visible() || this._cerrando()) return;
    this._cerrando.set(true);
    this.timer = setTimeout(() => {
      this._visible.set(false);
      this._cerrando.set(false);
      this.timer = null;
    }, SIDE_PANEL_ANIM_MS);
  }

  private cancelarSalida(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
