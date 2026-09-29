import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js';
import type { ChartDataset, ChartOptions, ScriptableScaleContext } from 'chart.js';

import { DivergingChartComponent } from './diverging-chart.component';

@Component({
  standalone: true,
  imports: [DivergingChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-diverging-chart
      [categories]="categorias()"
      [values]="valores()"
      [max]="maximo()"
      negativeLabel="Disminución"
      positiveLabel="Aumento"
      valueSuffix="%"
      ariaLabel="Variación de existencias por mes"
      categoryLabel="Mes"
    />
  `,
})
class AnfitrionComponent {
  readonly categorias = signal<string[]>(['Feb', 'Mar', 'Abr']);
  readonly valores = signal<number[]>([-8.5, 14.5, -15.3]);
  readonly maximo = signal<number | null>(null);
}

describe('DivergingChartComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let temaPrevio: string | null;
  const q = <T extends HTMLElement>(selector: string): T | null => fixture.nativeElement.querySelector(selector);
  const lienzo = (): HTMLCanvasElement => q<HTMLCanvasElement>('canvas')!;
  const grafico = (): Chart<'bar'> => Chart.getChart(lienzo()) as Chart<'bar'>;
  const conjuntos = (): ChartDataset<'bar'>[] => grafico().data.datasets;
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
  const anuncio = (): string => q('[aria-live="polite"]')?.textContent?.trim() ?? '';
  // `+ 0` normaliza el −0 que deja el redondeo de Chart.js con pasos decimales.
  const marcas = (): number[] => grafico().scales['x'].ticks.map((marca) => marca.value + 0);
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

  it('barras horizontales: cada categoría pone su valor en el lado de su signo, con el color de ese lado', () => {
    const g = grafico();
    expect((g.config as { type: string }).type).toBe('bar');
    expect(g.options.indexAxis).toBe('y');
    expect(g.data.labels).toEqual(['Feb', 'Mar', 'Abr']);
    const [negativo, positivo] = conjuntos();
    expect(negativo.label).toBe('Disminución');
    expect(negativo.data).toEqual([-8.5, null, -15.3]);
    expect(negativo.backgroundColor).toBe(colorDe('--sys-color-bg-brand-primary'));
    expect(positivo.label).toBe('Aumento');
    expect(positivo.data).toEqual([null, 14.5, null]);
    expect(positivo.backgroundColor).toBe(colorDe('--sys-color-bg-brand-secondary'));
    expect(negativo.grouped).withContext('los dos lados comparten la fila').toBeFalse();
  });

  it('eje simétrico de cinco marcas con un paso redondo; max fija el límite; la línea del cero es divider-strong', () => {
    expect(marcas()).toEqual([-20, -10, 0, 10, 20]);

    fixture.componentInstance.valores.set([0.3, -0.12]);
    fixture.detectChanges();
    expect(marcas()).toEqual([-0.4, -0.2, 0, 0.2, 0.4]);

    fixture.componentInstance.maximo.set(30);
    fixture.detectChanges();
    expect(marcas()).toEqual([-30, -15, 0, 15, 30]);

    const color = (grafico().config.options as ChartOptions<'bar'>).scales!['x']!.grid!.color as (contexto: ScriptableScaleContext) => string;
    const conMarca = (value: number) => ({ tick: { value } }) as ScriptableScaleContext;
    expect(color(conMarca(0))).toBe(colorDe('--sys-color-divider-strong'));
    expect(color(conMarca(15))).toBe(colorDe('--sys-color-divider-default'));
  });

  it('la leyenda nombra los dos lados y la tabla oculta pone cada valor en la columna de su lado', () => {
    const leyenda = Array.from(fixture.nativeElement.querySelectorAll('siaf-chart-legend li')).map((li) => (li as HTMLElement).textContent?.trim());
    expect(leyenda).toEqual(['Disminución', 'Aumento']);

    const tabla = q<HTMLTableElement>('table')!;
    expect(tabla.caption?.textContent?.trim()).toBe('Variación de existencias por mes');
    const celdas = (fila: Element): string[] => Array.from(fila.children).map((celda) => celda.textContent?.trim() ?? '');
    expect(celdas(tabla.tHead!.rows[0])).toEqual(['Mes', 'Disminución', 'Aumento']);
    expect(celdas(tabla.tBodies[0].rows[0])).toEqual(['Feb', '-8.5%', '—']);
    expect(celdas(tabla.tBodies[0].rows[1])).toEqual(['Mar', '—', '14.5%']);
  });

  it('teclado: abajo y arriba recorren las categorías; el tooltip muestra solo el lado con valor, sobre su barra', () => {
    lienzo().focus();
    expect(tecla('ArrowDown').defaultPrevented).toBeTrue();
    expect(tooltip()).toBe('Feb | Disminución: -8.5%');
    expect(anuncio()).toBe('Feb: Disminución -8.5%');

    // Centrado sobre la barra y apoyado en su borde de arriba.
    const barra = grafico().getDatasetMeta(0).data[0].getProps(['x', 'y', 'base', 'height'], true);
    const globo = q<HTMLElement>('siaf-chart-tooltip')!;
    expect(parseFloat(globo.style.left)).toBeCloseTo((barra['x'] + barra['base']) / 2, 0);
    expect(parseFloat(globo.style.top)).toBeCloseTo(barra['y'] - barra['height'] / 2 - 8, 0);

    tecla('ArrowDown');
    expect(tooltip()).toBe('Mar | Aumento: 14.5%');
    tecla('ArrowUp');
    tecla('ArrowUp');
    expect(tooltip()).withContext('da la vuelta a la última').toContain('Abr');
    expect(tecla('ArrowRight').defaultPrevented).withContext('izquierda y derecha no son su eje').toBeFalse();

    expect(tecla('Escape').defaultPrevented).toBeFalse();
    expect(q('siaf-chart-tooltip')).toBeNull();
  });

  it('una categoría sin valor no tiene barra ni tooltip, y se anuncia sin datos', () => {
    fixture.componentInstance.categorias.set(['Feb', 'Mar', 'Abr', 'May']);
    fixture.detectChanges();
    expect(conjuntos()[0].data).toEqual([-8.5, null, -15.3, null]);

    const tabla = q<HTMLTableElement>('table')!;
    expect(Array.from(tabla.tBodies[0].rows[3].children).map((celda) => celda.textContent?.trim())).toEqual(['May', '—', '—']);

    lienzo().focus();
    tecla('End');
    expect(anuncio()).toBe('May: sin datos');
    expect(q('siaf-chart-tooltip')).toBeNull();
  });
});
