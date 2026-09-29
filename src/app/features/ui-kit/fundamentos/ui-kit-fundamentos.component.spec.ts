import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FUNDAMENTOS_UI_KIT } from '../ui-kit.fundamentos';
import { ICONOS_POR_PAGINA } from './fundamento-iconos.component';
import { SECCIONES_FUNDAMENTOS, filtrarSecciones } from './secciones';
import { UiKitFundamentosComponent } from './ui-kit-fundamentos.component';

describe('UiKitFundamentosComponent', () => {
  let fixture: ComponentFixture<UiKitFundamentosComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const refrescar = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiKitFundamentosComponent] }).compileComponents();
    fixture = TestBed.createComponent(UiKitFundamentosComponent);
    fixture.componentRef.setInput('secciones', SECCIONES_FUNDAMENTOS);
    await refrescar();
  });

  it('pinta una sección con su ancla por fundamento', () => {
    const ids = Array.from(el().querySelectorAll('[data-fundamento]')).map((s) => s.id);
    expect(ids).toEqual(['color', 'tipografia', 'espaciado', 'radios-y-bordes', 'sombras', 'iconos', 'revision-de-tokens']);
  });

  it('color: un renglón por token con muestra clara y oscura; el filtro «Igual en oscuro» deja solo esos', async () => {
    const total = FUNDAMENTOS_UI_KIT.colores.reduce((n, g) => n + g.tokens.length, 0);
    expect(el().querySelectorAll('[data-token]').length).toBe(total);
    const primario = el().querySelector('[data-token="--sys-color-bg-brand-primary"]')!;
    expect(primario.querySelectorAll('[data-muestra]').length).toBe(2);

    const botonFiltro = Array.from(el().querySelectorAll<HTMLButtonElement>('#color siaf-buttons-group button')).find((b) => b.textContent?.includes('Igual en oscuro'))!;
    botonFiltro.click();
    await refrescar();
    const esperados = FUNDAMENTOS_UI_KIT.colores.flatMap((g) => g.tokens).filter((t) => t.sinOscuro).length;
    expect(el().querySelectorAll('[data-token]').length).toBe(esperados);
    expect(el().querySelectorAll('[data-indicador="igual-en-oscuro"]').length).toBe(esperados);
  });

  it('copiar un token lleva su var() al portapapeles', async () => {
    const escribir = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    el().querySelector<HTMLButtonElement>('[data-token="--sys-color-bg-brand-primary"] siaf-ui-kit-copiar button')!.click();
    await refrescar();
    expect(escribir).toHaveBeenCalledWith('var(--sys-color-bg-brand-primary)');
  });

  it('íconos: el buscador ocupa todo el ancho y la variante y el tamaño van debajo', () => {
    const buscador = el().querySelector<HTMLElement>('#iconos siaf-input')!.getBoundingClientRect();
    const grilla = el().querySelector<HTMLElement>('#iconos [data-iconos-grilla]')!.getBoundingClientRect();
    const variante = el().querySelector<HTMLElement>('#iconos [data-iconos-variante]')!.getBoundingClientRect();
    const tamano = el().querySelector<HTMLElement>('#iconos [data-iconos-tamano]')!.getBoundingClientRect();
    expect(Math.round(buscador.width)).toBe(Math.round(grilla.width));
    expect(variante.top).toBeGreaterThanOrEqual(buscador.bottom);
    expect(tamano.top).toBeGreaterThanOrEqual(buscador.bottom);
  });

  it('íconos: pagina de a 120 con siaf-pagination y la búsqueda vuelve a la primera página', async () => {
    const iconos = () => Array.from(el().querySelectorAll('[data-icono]')).map((b) => b.getAttribute('data-icono'));
    const paginacion = () => el().querySelector<HTMLElement>('#iconos siaf-pagination')!;
    const todos = FUNDAMENTOS_UI_KIT.iconos.nombres;
    expect(el().querySelector('#iconos siaf-button')).toBeNull();
    expect(iconos()).toEqual(todos.slice(0, ICONOS_POR_PAGINA));
    expect(paginacion().textContent).toContain(`1-${ICONOS_POR_PAGINA} de ${todos.length}`);

    paginacion().querySelector<HTMLButtonElement>('[aria-label="Página siguiente"]')!.click();
    await refrescar();
    expect(iconos()).toEqual(todos.slice(ICONOS_POR_PAGINA, ICONOS_POR_PAGINA * 2));
    expect(paginacion().textContent).toContain(`${ICONOS_POR_PAGINA + 1}-${ICONOS_POR_PAGINA * 2} de ${todos.length}`);

    const buscador = el().querySelector<HTMLInputElement>('#iconos siaf-input input')!;
    buscador.value = 'calendar';
    buscador.dispatchEvent(new Event('input'));
    await refrescar();
    const conCalendar = todos.filter((n) => n.includes('calendar'));
    expect(iconos()).toEqual(conCalendar);
    expect(paginacion().textContent).toContain(`1-${conCalendar.length} de ${conCalendar.length}`);
    expect(paginacion().querySelector<HTMLButtonElement>('[aria-label="Página siguiente"]')!.disabled).toBeTrue();
  });

  it('al pulsar un ícono copia el siaf-icon con el tamaño elegido', async () => {
    const escribir = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    el().querySelector<HTMLButtonElement>('[data-icono]')!.click();
    await refrescar();
    const primero = FUNDAMENTOS_UI_KIT.iconos.nombres[0];
    expect(escribir).toHaveBeenCalledWith(`<siaf-icon name="${primero}" [size]="24" />`);
  });

  it('revisión: lista cada variable usada que no existe', () => {
    expect(el().querySelectorAll('[data-sin-definir]').length).toBe(FUNDAMENTOS_UI_KIT.sinDefinir.length);
  });

  it('el buscador del catálogo encuentra la sección por título o palabra clave, sin importar tildes', () => {
    expect(filtrarSecciones('').length).toBe(SECCIONES_FUNDAMENTOS.length);
    expect(filtrarSecciones('tipografía').map((s) => s.id)).toEqual(['tipografia']);
    expect(filtrarSecciones('ICONOS').map((s) => s.id)).toEqual(['iconos']);
    expect(filtrarSecciones('elevation').map((s) => s.id)).toEqual(['sombras']);
    expect(filtrarSecciones('siaf-tabs')).toEqual([]);
  });
});
