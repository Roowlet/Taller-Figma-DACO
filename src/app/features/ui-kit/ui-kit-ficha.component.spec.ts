import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UiKitFichaComponent } from './ui-kit-ficha.component';
import { MANIFIESTO_UI_KIT } from './ui-kit.manifest';
import { FichaVista, agrupar } from './ui-kit.vista';

describe('UiKitFichaComponent — pestañas', () => {
  let fixture: ComponentFixture<UiKitFichaComponent>;
  const fichas = agrupar(MANIFIESTO_UI_KIT).flatMap((g) => g.fichas);
  const de = (selector: string): FichaVista => fichas.find((f) => f.selector === selector)!;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = (): HTMLElement => el().querySelector<HTMLElement>('[role="tabpanel"]')!;
  const abrir = async (pestana: string): Promise<void> => {
    el().querySelector<HTMLButtonElement>(`[role="tab"][id$="-doc-${pestana}"]`)!.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const montar = async (selector: string, cambios: Partial<FichaVista> = {}): Promise<void> => {
    fixture = TestBed.createComponent(UiKitFichaComponent);
    fixture.componentRef.setInput('datos', { ...de(selector), ...cambios });
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiKitFichaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('muestra las cuatro pestañas con Uso activa y el panel etiquetado por su pestaña', async () => {
    await montar('siaf-tabs');
    const pestanas = Array.from(el().querySelectorAll<HTMLElement>('[role="tab"][id^="siaf-tabs-doc-"]'));
    expect(pestanas.map((p) => p.textContent?.trim())).toEqual(['Uso', 'Desarrollo', 'Especificaciones', 'Accesibilidad']);
    expect(pestanas[0].getAttribute('aria-selected')).toBe('true');
    expect(panel().getAttribute('aria-labelledby')).toBe(pestanas[0].id);
    expect(pestanas[0].id).toBe('siaf-tabs-doc-uso');
  });

  it('Uso: cuándo usarlo y cuándo no, y el ejemplo en vivo', async () => {
    await montar('siaf-tabs');
    expect(panel().querySelector('[data-ficha-usar]')?.textContent).toContain('Para alternar entre vistas');
    expect(panel().querySelector('[data-ficha-evitar]')?.textContent).toContain('Pestañas anidadas');
    expect(panel().textContent).toContain('Ejemplo');
  });

  it('Uso sin guía avisa cómo documentarla', async () => {
    await montar('siaf-records-tabs', { bloquesUsar: [], bloquesEvitar: [] });
    expect(panel().querySelector('message-box')?.textContent).toContain('@usar');
  });

  it('todas las fichas visibles tienen guía de uso, teclado y accesibilidad con criterios WCAG', () => {
    const incompletas = fichas
      .filter((f) => !f.bloquesUsar.length || !f.bloquesEvitar.length || !f.bloquesTeclado.length || !/\d\.\d+\.\d+ /.test(f.accesibilidad ?? ''))
      .map((f) => f.selector);
    expect(incompletas).toEqual([]);
  });

  it('Desarrollo: código, entradas y eventos', async () => {
    await montar('siaf-tabs');
    await abrir('desarrollo');
    expect(panel().dataset['pestana']).toBe('desarrollo');
    expect(panel().textContent).toContain("import { TabsComponent }");
    expect(panel().textContent).toContain('activeIdChange');
    expect(panel().textContent).toContain('idBase');
  });

  it('Especificaciones: enlace al nodo del Figma, componentes que pinta y tokens', async () => {
    await montar('siaf-tabs');
    await abrir('especificaciones');
    const enlace = panel().querySelector<HTMLAnchorElement>('[data-ficha-figma] a')!;
    expect(enlace.href).toBe('https://www.figma.com/design/mJrG11d0rWf7BjPuE2ApPZ/?node-id=2588-135');
    expect(enlace.target).toBe('_blank');
    expect(enlace.rel).toContain('noopener');
    expect(panel().querySelector('[data-ficha-usa] a')?.getAttribute('href')).toBe('#siaf-badge');
    expect(panel().querySelectorAll('[data-token-usado]').length).toBe(de('siaf-tabs').tokens.length);
    expect(panel().querySelector('[data-token-usado="--sys-color-divider-strong"]')).not.toBeNull();
  });

  it('Especificaciones: «Lo usan» enlaza a los componentes que lo pintan por dentro', async () => {
    await montar('siaf-tabs');
    await abrir('especificaciones');
    const seccion = panel().querySelector<HTMLElement>('[data-ficha-lo-usan]')!;
    expect(seccion.querySelector('h4')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Lo usan · 3');
    expect(Array.from(seccion.querySelectorAll('a')).map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual([
      ['siaf-detail-history-tabs', '#siaf-detail-history-tabs'],
      ['siaf-query-report-page', '#siaf-query-report-page'],
      ['siaf-records-tabs', '#siaf-records-tabs'],
    ]);
    expect(seccion.querySelector('[data-lo-usan-nota]')?.textContent).toContain('las pantallas que lo usan no aparecen');
  });

  it('«Lo usan»: un componente oculto del catálogo va sin enlace, y sin usuarios explica quién lo usa', async () => {
    // Como siaf-navbar, que solo lo pinta siaf-app-shell (ver ui-kit.vista.spec).
    await montar('siaf-tabs', { usadoPor: [{ selector: 'siaf-app-shell', nombre: 'siaf-app-shell', id: 'siaf-app-shell', enCatalogo: false }] });
    await abrir('especificaciones');
    const oculto = panel().querySelector<HTMLElement>('[data-ficha-lo-usan] li')!;
    expect(oculto.textContent?.trim()).toBe('siaf-app-shell');
    expect(oculto.querySelector('a')).toBeNull();

    fixture.destroy();
    await montar('siaf-tabs', { usadoPor: [], sinUso: false });
    await abrir('especificaciones');
    expect(panel().querySelector('[data-ficha-lo-usan]')?.textContent).toContain('lo usan directamente las pantallas');

    fixture.destroy();
    await montar('siaf-tabs', { usadoPor: [], sinUso: true });
    await abrir('especificaciones');
    expect(panel().querySelector('[data-ficha-lo-usan]')?.textContent).toContain('ninguna pantalla lo usa todavía');
  });

  it('Accesibilidad: roles y ARIA del código, teclado y notas del JSDoc', async () => {
    await montar('siaf-tabs');
    await abrir('accesibilidad');
    const aria = panel().querySelector('[data-ficha-aria]')!.textContent!;
    expect(aria).toContain('role="tablist"');
    expect(aria).toContain('aria-selected');
    expect(panel().querySelector('[data-ficha-teclado]')?.textContent).toContain('Inicio / Fin');
    expect(panel().querySelector('[data-ficha-notas]')?.textContent).toContain('idBase');
  });

  it('el texto con código no deja espacio antes de la puntuación', async () => {
    await montar('siaf-tabs');
    await abrir('accesibilidad');
    expect(panel().querySelector('[data-ficha-teclado] li')?.textContent).toMatch(/^Tab: entra/);
  });
});
