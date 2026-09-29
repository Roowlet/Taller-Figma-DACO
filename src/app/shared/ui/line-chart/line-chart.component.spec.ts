import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js';
import type { ChartDataset } from 'chart.js';

import { ChartSeries } from '../charts/grafico-base';
import { LineChartComponent } from './line-chart.component';

@Component({
  standalone: true,
  imports: [LineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-line-chart
      [categories]="categorias()"
      [series]="series()"
      [min]="minimo()"
      [max]="maximo()"
      ariaLabel="Activos y existencias por mes"
      categoryLabel="Mes"
    />
  `,
})
class AnfitrionComponent {
  readonly categorias = signal<string[]>(['Ene', 'Feb', 'Mar']);
  readonly series = signal<ChartSeries[]>([
    { name: 'Activos', values: [100, 200, 150] },
    { name: 'Existencias', values: [120, 180, 210.5] },
  ]);
  readonly minimo = signal<number | null>(null);
  readonly maximo = signal<number | null>(null);
}

describe('LineChartComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let temaPrevio: string | null;
  const q = <T extends HTMLElement>(selector: string): T | null => fixture.nativeElement.querySelector(selector);
  const lienzo = (): HTMLCanvasElement => q<HTMLCanvasElement>('canvas')!;
  const grafico = (): Chart<'line'> => Chart.getChart(lienzo()) as Chart<'line'>;
  const conjuntos = (): ChartDataset<'line'>[] => grafico().data.datasets;
  const tecla = (key: string): KeyboardEvent => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    lienzo().dispatchEvent(evento);
    fixture.detectChanges();
    return evento;
  };
  const tooltip = (): string =>
    Array.from(fixture.nativeElement.querySelectorAll('siaf-chart-tooltip p'))
      .map((parrafo) => (parrafo as HTMLElement).textContent?.replace(/\s+/g, ' ').trim())
      .join(' | ');
  const colorDe = (token: string): string => {
    const sonda = document.createElement('span');
    sonda.style.color = `var(${token})`;
    document.body.appendChild(sonda);
    const color = getComputedStyle(sonda).color;
    sonda.remove();
    return color;
  };

  beforeEach(async () => {
    temaPrevio = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
    if (temaPrevio === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', temaPrevio);
  });

  it('dibuja un gráfico de línea de Chart.js: por serie, una línea de 4 px con puntos de 12 px del color de la paleta', () => {
    const g = grafico();
    expect((g.config as { type: string }).type).toBe('line');
    expect(g.data.labels).toEqual(['Ene', 'Feb', 'Mar']);
    const [activos, existencias] = conjuntos();
    expect(activos.label).toBe('Activos');
    expect(activos.borderColor).toBe(colorDe('--sys-color-bg-brand-primary'));
    expect(activos.pointBackgroundColor).toBe(colorDe('--sys-color-bg-brand-primary'));
    expect(existencias.label).toBe('Existencias');
    expect(existencias.borderColor).toBe(colorDe('--sys-color-bg-brand-secondary'));
    expect(activos.borderWidth).toBe(4);
    expect(activos.pointRadius).toBe(6);
  });

  it('el eje de valores no arranca en cero: Chart.js elige un rango alrededor de los datos, o lo fijan min y max', () => {
    const eje = () => grafico().scales['y'];
    expect(eje().min).withContext('rango automático').toBeGreaterThan(0);
    expect(eje().min).toBeLessThanOrEqual(100);
    expect(eje().max).toBeGreaterThanOrEqual(210.5);

    fixture.componentInstance.minimo.set(0);
    fixture.componentInstance.maximo.set(500);
    fixture.detectChanges();
    expect(eje().ticks.map((marca) => marca.value)).toEqual([0, 100, 200, 300, 400, 500]);
  });

  it('muestra la leyenda y una tabla de datos oculta con los valores formateados', () => {
    const leyenda = Array.from(fixture.nativeElement.querySelectorAll('siaf-chart-legend li')).map((li) => (li as HTMLElement).textContent?.trim());
    expect(leyenda).toEqual(['Activos', 'Existencias']);

    const tabla = q<HTMLTableElement>('table')!;
    expect(tabla.parentElement?.classList).toContain('sr-only');
    expect(tabla.caption?.textContent?.trim()).toBe('Activos y existencias por mes');
    const celdas = (fila: Element): string[] => Array.from(fila.children).map((celda) => celda.textContent?.trim() ?? '');
    expect(celdas(tabla.tHead!.rows[0])).toEqual(['Mes', 'Activos', 'Existencias']);
    expect(celdas(tabla.tBodies[0].rows[2])).toEqual(['Mar', '150', '210.5']);
    expect(lienzo().getAttribute('role')).toBe('img');
    expect(lienzo().getAttribute('aria-label')).toBe('Activos y existencias por mes');
  });

  it('teclado: derecha e izquierda recorren las categorías con el tooltip arriba del punto más alto; Escape lo oculta', () => {
    lienzo().focus();
    expect(tecla('ArrowRight').defaultPrevented).toBeTrue();
    expect(tooltip()).toBe('Ene | Activos: 100 | Existencias: 120');
    expect(q('[aria-live="polite"]')?.textContent?.trim()).toBe('Ene: Activos 100, Existencias 120');

    // Existencias (120) está más arriba que Activos (100): el tooltip se apoya sobre su punto activo (radio 8 px) y
    // deja 8 px de aire.
    const puntoMasAlto = Math.min(...[0, 1].map((conjunto) => grafico().getDatasetMeta(conjunto).data[0].y));
    const globo = q<HTMLElement>('siaf-chart-tooltip')!;
    expect(parseFloat(globo.style.top)).toBeCloseTo(puntoMasAlto - 8 - 8, 0);

    tecla('ArrowLeft');
    expect(tooltip()).toContain('Mar');
    expect(tecla('ArrowDown').defaultPrevented).withContext('arriba y abajo no son su eje').toBeFalse();
    tecla('Home');
    expect(tooltip()).toContain('Ene');
    tecla('End');
    expect(tooltip()).toContain('Mar');

    expect(tecla('Escape').defaultPrevented).withContext('el panel que lo contiene también recibe Escape').toBeFalse();
    expect(q('siaf-chart-tooltip')).toBeNull();
  });

  it('al cambiar de tema vuelve a leer los colores de la paleta', async () => {
    const claro = conjuntos()[0].borderColor;
    document.documentElement.setAttribute('data-theme', 'dark');
    await new Promise((resolver) => setTimeout(resolver));
    const oscuro = colorDe('--sys-color-bg-brand-primary');
    expect(oscuro).not.toBe(claro as string);
    expect(conjuntos()[0].borderColor).toBe(oscuro);
  });

  it('destruye el gráfico de Chart.js junto con el componente', () => {
    const canvas = lienzo();
    fixture.destroy();
    expect(Chart.getChart(canvas)).toBeUndefined();
  });
});
