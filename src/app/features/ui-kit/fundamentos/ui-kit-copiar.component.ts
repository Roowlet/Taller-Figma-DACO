import { ChangeDetectionStrategy, Component, DestroyRef, Input, inject, signal } from '@angular/core';

import { IconComponent } from '../../../shared/ui/icon/icon.component';

/** Texto en monoespaciada que se copia al pulsarlo (nombre de token, utilidad o fragmento). */
@Component({
  selector: 'siaf-ui-kit-copiar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button
      class="group inline-flex max-w-full items-center gap-1 rounded-siaf-sm px-1 py-0.5 text-left text-text transition hover:bg-surface-muted"
      type="button"
      [attr.aria-label]="(copiado() ? 'Copiado: ' : 'Copiar ') + (copia || texto)"
      (click)="copiar()"
    >
      <!-- La fuente va en el texto: la regla global button { font: inherit } pisa las utilidades del botón. -->
      <span class="min-w-0 font-mono text-[12px] leading-[normal]" [class.[overflow-wrap:anywhere]]="envolver" [class.whitespace-nowrap]="!envolver">{{ texto }}</span>
      <siaf-icon
        class="shrink-0 text-text-muted opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
        [class.opacity-100]="copiado()"
        [name]="copiado() ? 'check' : 'content_copy'"
        [size]="12"
      />
    </button>
  `,
})
export class UiKitCopiarComponent {
  private readonly destroyRef = inject(DestroyRef);

  /** Lo que se ve. */
  @Input({ required: true }) texto = '';
  /** Lo que se copia, si es distinto de lo que se ve. */
  @Input() copia = '';
  /** Parte el texto en cualquier carácter si no cabe; en tablas va en `false` para no partir los nombres. */
  @Input() envolver = true;

  readonly copiado = signal(false);

  async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.copia || this.texto);
      this.copiado.set(true);
      const t = setTimeout(() => this.copiado.set(false), 1500);
      this.destroyRef.onDestroy(() => clearTimeout(t));
    } catch {
      // Sin permiso de portapapeles (iframe o navegador antiguo): el texto sigue visible para copiarlo a mano.
    }
  }
}
