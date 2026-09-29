import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametroAplicado, ParametrosAplicadosComponent } from './parametros-aplicados.component';

const PARAMETROS: ParametroAplicado[] = [
  { icon: 'calendar_today', label: 'Periodo', value: 'Enero a marzo de 2026' },
  { icon: 'calculate', label: 'Plan contable', value: 'PCGU 2026' },
  { icon: 'account_balance_wallet', label: 'Fuente de financiamiento', value: 'Recursos ordinarios' },
  { icon: 'account_balance', label: 'Entidad', value: '0001 · Ministerio de Economía y Finanzas' },
  { icon: 'apartment', label: 'Unidad ejecutora', value: 'Dirección General de Contabilidad Pública' },
];

describe('ParametrosAplicadosComponent', () => {
  let fixture: ComponentFixture<ParametrosAplicadosComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const carril = (): HTMLElement => el().querySelector<HTMLElement>('[data-carril]')!;
  const botonAvanzar = (): HTMLButtonElement | null => el().querySelector<HTMLButtonElement>('[data-avanzar] button');
  const botonRetroceder = (): HTMLButtonElement | null => el().querySelector<HTMLButtonElement>('[data-retroceder] button');
  const desplazarA = async (posicion: number): Promise<void> => {
    carril().scrollLeft = posicion;
    carril().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const montar = async (parametros: ParametroAplicado[], ancho: number): Promise<void> => {
    fixture = TestBed.createComponent(ParametrosAplicadosComponent);
    el().style.display = 'block';
    el().style.width = `${ancho}px`;
    document.body.appendChild(el());
    fixture.componentRef.setInput('parametros', parametros);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ParametrosAplicadosComponent] }).compileComponents();
  });

  afterEach(() => {
    fixture.destroy();
    el().remove();
  });

  it('muestra el título y una tarjeta por parámetro con su ícono, nombre y valor, sin «Quitar filtros»', async () => {
    await montar(PARAMETROS, 1600);
    expect(el().querySelector('h3')?.textContent?.trim()).toBe('Parámetros aplicados');
    const tarjetas = Array.from(el().querySelectorAll<HTMLElement>('siaf-list li'));
    expect(tarjetas.length).toBe(5);
    expect(tarjetas[0].textContent).toContain('Periodo');
    expect(tarjetas[0].textContent).toContain('Enero a marzo de 2026');
    expect(tarjetas[0].querySelector('siaf-icon')?.textContent?.trim()).toBe('calendar_today');
    expect(getComputedStyle(tarjetas[0]).width).toBe('230px');
    expect(parseFloat(getComputedStyle(tarjetas[0]).borderTopWidth)).toBeGreaterThan(0);
    expect(el().textContent).not.toContain('Quitar filtros');
  });

  it('si las tarjetas entran, no hay botón para avanzar ni carril enfocable', async () => {
    await montar(PARAMETROS.slice(0, 2), 1600);
    expect(botonAvanzar()).toBeNull();
    expect(carril().getAttribute('tabindex')).toBeNull();
  });

  it('si no entran, el carril es una región enfocable y el botón «Ver más parámetros» lo avanza', async () => {
    await montar(PARAMETROS, 520);
    expect(carril().getAttribute('role')).toBe('region');
    expect(carril().getAttribute('tabindex')).toBe('0');
    expect(carril().getAttribute('aria-labelledby')).toBe(el().querySelector('h3')!.id);

    const boton = botonAvanzar();
    expect(boton?.getAttribute('aria-label')).toBe('Ver más parámetros');
    const desplazar = spyOn(carril(), 'scrollBy');
    boton!.click();
    expect(desplazar).toHaveBeenCalledTimes(1);
    // scrollBy tiene dos firmas (opciones o x, y): el componente usa la de opciones.
    const opciones = desplazar.calls.mostRecent().args[0] as unknown as ScrollToOptions;
    expect(opciones.left).toBeGreaterThan(0);
  });

  it('al principio no hay flecha izquierda; cuando el carril avanzó, «Ver parámetros anteriores» lo retrocede', async () => {
    await montar(PARAMETROS, 520);
    expect(botonRetroceder()).toBeNull();

    await desplazarA(300);
    expect(botonAvanzar()).withContext('en el medio, las dos flechas').not.toBeNull();
    const boton = botonRetroceder();
    expect(boton?.getAttribute('aria-label')).toBe('Ver parámetros anteriores');
    const desplazar = spyOn(carril(), 'scrollBy');
    boton!.click();
    const opciones = desplazar.calls.mostRecent().args[0] as unknown as ScrollToOptions;
    expect(opciones.left).toBeLessThan(0);
  });

  it('al llegar a un extremo desaparece su flecha y, si tenía el foco, pasa a la del otro lado', async () => {
    await montar(PARAMETROS, 520);
    await desplazarA(300);
    botonAvanzar()!.focus();

    await desplazarA(carril().scrollWidth);
    expect(botonAvanzar()).toBeNull();
    expect(document.activeElement).withContext('el foco no se pierde').toBe(botonRetroceder());

    await desplazarA(0);
    expect(botonRetroceder()).toBeNull();
    expect(document.activeElement).toBe(botonAvanzar());
  });
});
