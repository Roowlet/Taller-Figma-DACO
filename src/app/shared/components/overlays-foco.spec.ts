import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderOverlayComponent } from '../ui/loader-overlay/loader-overlay.component';
import { SideNavComponent } from '../ui/side-nav/side-nav.component';
import { SIDE_PANEL_ANIM_MS } from '../ui/side-panel-animacion';
import { SidePanelComponent } from '../ui/side-panel/side-panel.component';
import { CustomFilterComponent } from './custom-filter/custom-filter.component';

/** Overlays que usan siafFoco: el foco entra al abrir, Escape cierra (si corresponde) y vuelve al disparador. */
@Component({
  standalone: true,
  imports: [CustomFilterComponent, LoaderOverlayComponent, SideNavComponent, SidePanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="disparador" type="button">Abrir</button>
    <siaf-side-nav title="Detalle del registro" [open]="panel()" [showFooter]="false" (closed)="panel.set(false)">
      <button id="accion" type="button">Acción</button>
    </siaf-side-nav>
    <siaf-side-panel title="Movimientos" [open]="sidePanel()" [showFooter]="false" (closed)="sidePanel.set(false)">
      <button id="accion-panel" type="button">Acción</button>
    </siaf-side-panel>
    <siaf-loader-overlay label="Procesando" [open]="cargando()" />
    @if (filtro()) {
      <siaf-custom-filter (cancelar)="cancelados = cancelados + 1; filtro.set(false)" />
    }
  `,
})
class OverlaysComponent {
  readonly panel = signal(false);
  readonly sidePanel = signal(false);
  readonly cargando = signal(false);
  readonly filtro = signal(false);
  cancelados = 0;
}

describe('Overlays con siafFoco', () => {
  let fixture: ComponentFixture<OverlaysComponent>;
  let app: OverlaysComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const pintar = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const tecla = (key: string, shiftKey = false): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
    (document.activeElement ?? document.body).dispatchEvent(evento);
    return evento;
  };
  /** Los paneles laterales retienen el DOM mientras anima la salida. */
  const esperarSalida = async (): Promise<void> => {
    await new Promise((resolver) => setTimeout(resolver, SIDE_PANEL_ANIM_MS + 50));
    await pintar();
  };
  const abrir = async (senal: 'panel' | 'sidePanel' | 'cargando' | 'filtro'): Promise<void> => {
    el().querySelector<HTMLButtonElement>('#disparador')!.focus();
    app[senal].set(true);
    await pintar();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OverlaysComponent] }).compileComponents();
    fixture = TestBed.createComponent(OverlaysComponent);
    app = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await pintar();
  });

  afterEach(() => fixture.nativeElement.remove());

  for (const caso of [
    { selector: 'siaf-side-nav', senal: 'panel', titulo: 'Detalle del registro', accion: '#accion' },
    { selector: 'siaf-side-panel', senal: 'sidePanel', titulo: 'Movimientos', accion: '#accion-panel' },
  ] as const) {
    it(`${caso.selector} es un diálogo con nombre, recibe el foco en «Cerrar» y Escape lo cierra devolviendo el foco`, async () => {
      await abrir(caso.senal);
      const dialogo = el().querySelector<HTMLElement>(`${caso.selector} [role="dialog"]`)!;
      expect(dialogo.getAttribute('aria-modal')).toBe('true');
      expect(document.getElementById(dialogo.getAttribute('aria-labelledby')!)?.textContent?.trim()).toBe(caso.titulo);
      expect(document.activeElement?.getAttribute('aria-label')).toBe(`Cerrar ${caso.titulo}`);

      el().querySelector<HTMLButtonElement>(caso.accion)!.focus();
      expect(tecla('Tab').defaultPrevented).withContext('Tab en el último control da la vuelta').toBeTrue();
      expect(document.activeElement?.getAttribute('aria-label')).toBe(`Cerrar ${caso.titulo}`);

      tecla('Escape');
      await pintar();
      expect(document.activeElement?.id).toBe('disparador');
      await esperarSalida();
      expect(el().querySelector(`${caso.selector} [role="dialog"]`)).toBeNull();
    });
  }

  it('siaf-loader-overlay retiene el foco en la capa mientras procesa y lo devuelve al terminar; Escape no la cierra', async () => {
    await abrir('cargando');
    const capa = el().querySelector<HTMLElement>('siaf-loader-overlay [role="status"]')!;
    expect(document.activeElement).toBe(capa);
    expect(tecla('Tab').defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(capa);

    tecla('Escape');
    await pintar();
    expect(el().querySelector('siaf-loader-overlay [role="status"]')).not.toBeNull();

    app.cargando.set(false);
    await pintar();
    expect(document.activeElement?.id).toBe('disparador');
  });

  it('siaf-custom-filter recibe el foco, no atrapa Tab y Escape emite cancelar', async () => {
    await abrir('filtro');
    expect(el().querySelector('siaf-custom-filter')!.contains(document.activeElement)).toBeTrue();
    expect(tecla('Tab').defaultPrevented).toBeFalse();

    tecla('Escape');
    await pintar();
    expect(app.cancelados).toBe(1);
    expect(el().querySelector('siaf-custom-filter')).toBeNull();
    expect(document.activeElement?.id).toBe('disparador');
  });
});
