import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { DocumentsRecordsColumn } from '../types/documents-records.types';
import { ColumnVisibilityPanelComponent } from '../ui/column-visibility-panel/column-visibility-panel.component';
import { SideNavComponent } from '../ui/side-nav/side-nav.component';
import { SidePanelComponent } from '../ui/side-panel/side-panel.component';

/**
 * Los paneles laterales abiertos, con contenido y sus botones. El side panel va sin su panel de filtros: con él, el
 * Figma pone una línea arriba y otra abajo del cuerpo.
 */
@Component({
  standalone: true,
  imports: [ColumnVisibilityPanelComponent, SideNavComponent, SidePanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-side-nav title="Detalle del registro" [open]="true">
      <p>Contenido del panel</p>
    </siaf-side-nav>
    <siaf-side-panel title="Movimientos" [open]="true">
      <p>Contenido del panel</p>
    </siaf-side-panel>
    <siaf-column-visibility-panel [open]="true" [defaultColumns]="columnas" [isColumnVisible]="visible" />
  `,
})
class PanelesComponent {
  readonly columnas: DocumentsRecordsColumn[] = [
    { key: 'numero', label: 'Número', visibility: 'visible', group: 'default' },
    { key: 'estado', label: 'Estado', visibility: 'visible', group: 'default' },
  ];
  readonly visible = (): boolean => true;
}

/** Regla de diseño de los side panels (ver `siaf-divider`): sin líneas entre el título, el contenido y los botones. */
describe('Side panels sin líneas separadoras', () => {
  let fixture: ComponentFixture<PanelesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PanelesComponent] }).compileComponents();
    fixture = TestBed.createComponent(PanelesComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  for (const selector of ['siaf-side-nav', 'siaf-side-panel', 'siaf-column-visibility-panel']) {
    it(`${selector}: ninguna línea atraviesa el panel entre el título, el contenido y los botones`, () => {
      const panel = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`${selector} aside`)!;
      const ancho = panel.getBoundingClientRect().width;
      const conBorde = (estilo: CSSStyleDeclaration, lado: 'Top' | 'Bottom'): boolean =>
        parseFloat(estilo[`border${lado}Width`]) > 0 && estilo[`border${lado}Style`] !== 'none';
      // Una línea separadora ocupa casi todo el ancho del panel; los bordes de un botón o de una casilla, no.
      const lineas = Array.from(panel.querySelectorAll<HTMLElement>('*'))
        .filter((nodo) => nodo.getBoundingClientRect().width >= ancho * 0.8)
        .filter((nodo) => conBorde(getComputedStyle(nodo), 'Top') || conBorde(getComputedStyle(nodo), 'Bottom'))
        .map((nodo) => `<${nodo.tagName.toLowerCase()} class="${nodo.className}">`);

      expect(ancho).toBeGreaterThan(0);
      expect(lineas).toEqual([]);
      expect(panel.querySelector('[role="separator"]')).toBeNull();
    });
  }
});
