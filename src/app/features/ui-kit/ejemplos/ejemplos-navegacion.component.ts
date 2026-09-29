import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { RecordsTabItem, RecordsTabsComponent } from '../../../shared/components/records-tabs/records-tabs.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';

/** Ejemplos en vivo de la categoría Navegación. */
@Component({
  selector: 'ui-kit-ejemplos-navegacion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, RecordsTabsComponent, TabsComponent],
  template: `
    @switch (selector) {
      @case ('siaf-breadcrumb') {
        <siaf-breadcrumb homeHref="/ui-kit" [items]="migas" />
      }
      @case ('siaf-tabs') {
        <div class="flex flex-col gap-6">
          @for (variante of variantesTabs; track variante.titulo) {
            <div class="min-w-0">
              <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">{{ variante.titulo }}</p>
              <siaf-tabs
                [tabs]="variante.pestanas"
                [border]="variante.border"
                [activeId]="activas()[variante.titulo] ?? variante.pestanas[1].id"
                [ariaLabel]="variante.titulo"
                (activeIdChange)="activar(variante.titulo, $event)"
              />
            </div>
          }
          <div class="min-w-0">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Con contador · Border false</p>
            <siaf-tabs [tabs]="pestanas" [border]="false" [activeId]="pestana()" ariaLabel="Solicitud" (activeIdChange)="pestana.set($event)" />
          </div>
          <div class="min-w-0 max-w-[360px]">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Ancho completo · fullWidth</p>
            <siaf-tabs [tabs]="pestanasLogin" [border]="false" [fullWidth]="true" [activeId]="pestanaLogin()" ariaLabel="Tipo de usuario" (activeIdChange)="pestanaLogin.set($event)" />
          </div>
        </div>
      }
      @case ('siaf-records-tabs') {
        <siaf-records-tabs [tabs]="pestanasRegistros" [activeId]="pestanaRegistro()" (activeIdChange)="pestanaRegistro.set($event)" />
      }
    }
  `,
})
export class EjemplosNavegacionComponent {
  static readonly selectores = ['siaf-breadcrumb', 'siaf-tabs', 'siaf-records-tabs'];
  @Input({ required: true }) selector!: string;

  readonly migas: BreadcrumbItem[] = [
    { label: 'Gestión contable', href: '/ui-kit' },
    { label: 'Plan de cuentas', href: '/ui-kit' },
    { label: 'Solicitud de cuenta contable' },
  ];

  readonly pestanas: TabItem[] = [
    { id: 'datos', label: 'Datos generales' },
    { id: 'items', label: 'Ítems', count: 8 },
    { id: 'sustentos', label: 'Sustentos', count: 2 },
  ];
  readonly pestana = signal('datos');

  /** Variantes del Figma «Tabs content»: Border true / false con 3 y 6+ pestañas. */
  readonly variantesTabs: { titulo: string; border: boolean; pestanas: TabItem[] }[] = [
    { titulo: 'Border true · 3', border: true, pestanas: this.nombres(3) },
    { titulo: 'Border false · 3', border: false, pestanas: this.nombres(3) },
    { titulo: 'Border true · 6+', border: true, pestanas: this.nombres(8) },
    { titulo: 'Border false · 6+', border: false, pestanas: this.nombres(8) },
  ];
  readonly activas = signal<Partial<Record<string, string>>>({});

  readonly pestanasLogin: TabItem[] = [
    { id: 'entidades', label: 'Entidades del Estado' },
    { id: 'proveedores', label: 'Proveedores y Externos' },
  ];
  readonly pestanaLogin = signal('entidades');

  readonly pestanasRegistros: RecordsTabItem[] = [
    { id: 'documentos', label: 'Documentos', count: 24 },
    { id: 'registros', label: 'Registros', count: 187 },
  ];
  readonly pestanaRegistro = signal('documentos');

  activar(variante: string, id: string): void {
    this.activas.update((activas) => ({ ...activas, [variante]: id }));
  }

  private nombres(cantidad: number): TabItem[] {
    const etiquetas = ['Datos generales', 'Ítems', 'Sustentos', 'Asientos', 'Historial', 'Documentos', 'Observaciones', 'Anexos'];
    return etiquetas.slice(0, cantidad).map((label, i) => ({ id: `p${i}`, label }));
  }
}
