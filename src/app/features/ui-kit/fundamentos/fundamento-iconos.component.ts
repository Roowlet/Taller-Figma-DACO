import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ButtonGroupItem, ButtonsGroupComponent } from '../../../shared/ui/buttons-group/buttons-group.component';
import { IconComponent, IconVariant } from '../../../shared/ui/icon/icon.component';
import { TextFieldComponent } from '../../../shared/ui/text-field/text-field.component';
import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';

/** Íconos por página: la lista completa son más de 2000. */
export const ICONOS_POR_PAGINA = 120;

/** Íconos: buscador de los nombres de Material Icons con variante, tamaño y paginación; al pulsar copia el `siaf-icon`. */
@Component({
  selector: 'siaf-ui-kit-fundamento-iconos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonsGroupComponent, IconComponent, PaginationComponent, TextFieldComponent],
  template: `
    <div class="mb-3 flex flex-col gap-3">
      <siaf-input label="Buscar ícono" leadingIcon="search" placeholder="Ej.: calendar, delete, file" [clearable]="true" [autoSuccess]="false" [value]="busqueda()" (valueChange)="buscar('' + $event)" />
      <div class="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div class="min-w-0 max-w-full">
          <p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-text-muted">Variante</p>
          <div class="overflow-x-auto pr-px" data-iconos-variante>
            <siaf-buttons-group [items]="variantes" [value]="variante()" (valueChange)="variante.set($any($event))" />
          </div>
        </div>
        <div class="min-w-0 max-w-full">
          <p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-text-muted">Tamaño</p>
          <div class="overflow-x-auto pr-px" data-iconos-tamano>
            <siaf-buttons-group [items]="tamanos" [value]="'' + tamano()" (valueChange)="tamano.set(+$event)" />
          </div>
        </div>
      </div>
    </div>
    <p class="mb-3 text-xs text-text-muted" data-iconos-total>
      {{ filtrados().length }} de {{ nombres.length }} íconos · al pulsar uno se copia
      <code class="rounded-siaf-sm bg-surface-muted px-1 font-mono">{{ fragmento('nombre') }}</code>
    </p>

    @if (visibles().length) {
      <ul class="grid scroll-mt-42 grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2 lg:scroll-mt-28" data-iconos-grilla>
        @for (nombre of visibles(); track nombre) {
          <li>
            <button
              class="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-siaf-md border border-border px-1 text-text transition hover:border-[var(--sys-color-border-states-hover)] hover:bg-surface-muted"
              type="button"
              [attr.data-icono]="nombre"
              [attr.aria-label]="(copiado() === nombre ? 'Copiado: ' : 'Copiar ') + nombre"
              (click)="copiar(nombre)"
            >
              <siaf-icon [name]="copiado() === nombre ? 'check' : nombre" [size]="tamano()" [variant]="variante()" />
              <span class="w-full truncate text-center font-mono text-[11px] leading-[normal] text-text-muted" [attr.title]="nombre">{{ nombre }}</span>
            </button>
          </li>
        }
      </ul>
      <siaf-pagination
        class="mt-3 block"
        navigation="Activate"
        position="Bottom"
        [page]="pagina()"
        [pageSize]="porPagina"
        [totalItems]="filtrados().length"
        [totalPages]="totalPaginas()"
        (previous)="irAPagina(pagina() - 1)"
        (next)="irAPagina(pagina() + 1)"
      />
    } @else {
      <p class="text-sm text-text-muted">Ningún ícono se llama así. Los nombres van en inglés y con guion bajo: <code class="font-mono">calendar_today</code>.</p>
    }
  `,
})
export class FundamentoIconosComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly nombres = FUNDAMENTOS_UI_KIT.iconos.nombres;
  readonly porPagina = ICONOS_POR_PAGINA;
  readonly variantes: ButtonGroupItem[] = (['outlined', 'filled', 'round', 'sharp', 'two-tone'] as IconVariant[]).map((v) => ({ label: v, value: v }));
  readonly tamanos: ButtonGroupItem[] = FUNDAMENTOS_UI_KIT.iconos.tamanos.map((t) => ({ label: t.escritorio ?? t.escala, value: `${parseInt(t.escritorio ?? '20', 10)}` }));

  readonly busqueda = signal('');
  readonly variante = signal<IconVariant>('outlined');
  readonly tamano = signal(24);
  readonly pagina = signal(1);
  readonly copiado = signal<string | null>(null);

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase().replace(/[\s-]+/g, '_');
    return q ? this.nombres.filter((n) => n.includes(q)) : this.nombres;
  });
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / ICONOS_POR_PAGINA)));
  readonly visibles = computed(() => {
    const inicio = (this.pagina() - 1) * ICONOS_POR_PAGINA;
    return this.filtrados().slice(inicio, inicio + ICONOS_POR_PAGINA);
  });

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  irAPagina(pagina: number): void {
    this.pagina.set(Math.min(Math.max(1, pagina), this.totalPaginas()));
    // Si la grilla quedó arriba de la pantalla, se vuelve a su inicio para ver la página nueva desde el primer ícono.
    const grilla = this.host.nativeElement.querySelector<HTMLElement>('[data-iconos-grilla]');
    if (grilla && grilla.getBoundingClientRect().top < 0) grilla.scrollIntoView({ block: 'start' });
  }

  /** Lo que se copia: el siaf-icon con la variante y el tamaño elegidos (sin repetir los valores por defecto). */
  fragmento(nombre: string): string {
    const variante = this.variante() === 'outlined' ? '' : ` variant="${this.variante()}"`;
    const tamano = this.tamano() === 20 ? '' : ` [size]="${this.tamano()}"`;
    return `<siaf-icon name="${nombre}"${tamano}${variante} />`;
  }

  async copiar(nombre: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.fragmento(nombre));
      this.copiado.set(nombre);
      const t = setTimeout(() => this.copiado.set(null), 1500);
      this.destroyRef.onDestroy(() => clearTimeout(t));
    } catch {
      // Sin permiso de portapapeles: el nombre sigue visible debajo del ícono.
    }
  }
}
