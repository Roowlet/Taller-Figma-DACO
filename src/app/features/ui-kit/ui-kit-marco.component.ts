import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Input, afterNextRender, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Marco de dispositivo de la ficha: un iframe con el ancho real del dispositivo (1280 px escritorio,
 * 375 px móvil) escalado para caber en su columna. Así los breakpoints responden al dispositivo y no
 * a la ventana del catálogo. El iframe carga `/ui-kit/vista/:selector` en diferido.
 */
@Component({
  selector: 'siaf-ui-kit-marco',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <figure class="m-0">
      <figcaption class="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        <span>{{ etiqueta }}</span>
        <span class="font-mono font-normal normal-case tracking-normal">{{ ancho }} px</span>
      </figcaption>
      <div class="overflow-hidden rounded-siaf-md border border-border bg-surface" [style.height.px]="alto * escala()">
        <iframe
          class="block origin-top-left border-0"
          loading="lazy"
          [title]="etiqueta + ' — ' + selector"
          [src]="url()"
          [style.width.px]="ancho"
          [style.height.px]="alto"
          [style.transform]="'scale(' + escala() + ')'"
        ></iframe>
      </div>
    </figure>
  `,
})
export class UiKitMarcoComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input({ required: true }) selector!: string;
  @Input({ required: true }) etiqueta!: string;
  @Input({ required: true }) ancho!: number;
  @Input({ required: true }) alto!: number;
  private readonly _tema = signal<'light' | 'dark'>('light');
  @Input() set tema(valor: 'light' | 'dark') {
    this._tema.set(valor);
  }

  private readonly disponible = signal(0);
  /** Nunca agranda: solo reduce si la columna es más angosta que el dispositivo. */
  readonly escala = computed(() => (this.disponible() > 0 ? Math.min(1, this.disponible() / this.ancho) : 1));

  /** La ruta es interna y fija salvo el selector, que viene del manifiesto generado: se codifica y se confía. */
  readonly url = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(`/ui-kit/vista/${encodeURIComponent(this.selector)}?tema=${this._tema()}`),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.host.nativeElement;
      this.disponible.set(el.clientWidth);
      if (typeof ResizeObserver === 'undefined') return;
      const observador = new ResizeObserver(() => this.disponible.set(el.clientWidth));
      observador.observe(el);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
